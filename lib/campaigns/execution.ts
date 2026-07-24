"use server";

import prisma from "@/lib/prisma";
import { sendWhatsAppMessage, renderTemplate } from "@/lib/whatsapp/client";
import { MessageStatus } from "@prisma/client";

export interface ExecutionResult {
  campaignId: string;
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}

export async function executeCampaign(campaignId: string): Promise<ExecutionResult> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, status: { in: ["DRAFT", "SCHEDULED", "RUNNING"] } },
    include: {
      whatsappAccount: true,
      template: true,
      leads: {
        where: { status: { in: ["PENDING", "PROCESSING"] } },
        include: { lead: true },
        take: 50
      }
    }
  });

  if (!campaign) {
    return { campaignId, processed: 0, sent: 0, failed: 0, errors: ["Campaign not found or already completed"] };
  }

  if (!campaign.whatsappAccount?.isConnected || !campaign.whatsappAccount?.accessToken) {
    return { campaignId, processed: 0, sent: 0, failed: 0, errors: ["WhatsApp account not connected"] };
  }

  if (!campaign.template) {
    return { campaignId, processed: 0, sent: 0, failed: 0, errors: ["Template not found"] };
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "RUNNING" }
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const delayMs = Math.floor(60000 / campaign.throttleRate);

  for (const campaignLead of campaign.leads) {
    const lead = campaignLead.lead;

    if (lead.unsubscribed) {
      await prisma.campaignLead.update({
        where: { id: campaignLead.id },
        data: { status: "COMPLETED" }
      });
      continue;
    }

    await prisma.campaignLead.update({
      where: { id: campaignLead.id },
      data: { status: "PROCESSING" }
    });

    const renderedBody = renderTemplate(campaign.template.body, {
      firstName: lead.firstName,
      lastName: lead.lastName,
      phoneNumber: lead.phoneNumber,
      email: lead.email,
      source: lead.source
    });

    const existingMessage = await prisma.message.findFirst({
      where: {
        campaignId,
        leadId: lead.id,
        direction: "OUTBOUND"
      }
    });

    if (existingMessage) {
      await prisma.campaignLead.update({
        where: { id: campaignLead.id },
        data: { status: "COMPLETED" }
      });
      continue;
    }

    const message = await prisma.message.create({
      data: {
        userId: campaign.userId,
        campaignId,
        leadId: lead.id,
        direction: "OUTBOUND",
        status: MessageStatus.SENDING,
        body: renderedBody,
        content: renderedBody
      }
    });

    const result = await sendWhatsAppMessage(
      campaign.whatsappAccount.accessToken,
      campaign.whatsappAccount.phoneNumber,
      lead.phoneNumber,
      renderedBody
    );

    if (result.success && result.messageId) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          whatsappMessageId: result.messageId,
          sentAt: new Date()
        }
      });

      await prisma.campaignLead.update({
        where: { id: campaignLead.id },
        data: { status: "COMPLETED" }
      });

      sent++;
    } else {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.FAILED,
          errorMessage: result.error || "Unknown error"
        }
      });

      await prisma.campaignLead.update({
        where: { id: campaignLead.id },
        data: { status: "PENDING" }
      });

      failed++;
      if (result.error) {
        errors.push(`Lead ${lead.phoneNumber}: ${result.error}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  const pendingLeads = await prisma.campaignLead.count({
    where: { campaignId, status: { in: ["PENDING", "PROCESSING"] } }
  });

  if (pendingLeads === 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED" }
    });

    // Mock Email Notification to the User
    const user = await prisma.user.findUnique({ where: { id: campaign.userId } });
    if (user && user.email) {
      console.log(`[MOCK EMAIL NOTIFICATION] 
  To: ${user.email}
  Subject: Your Campaign "${campaign.name}" has Completed!
  Body: Great news! Your campaign has successfully finished sending messages to your leads.
  - Sent: ${sent}
  - Failed: ${failed}
      `);
    }
  }

  await prisma.activityLog.create({
    data: {
      userId: campaign.userId,
      eventType: "CAMPAIGN_LAUNCHED",
      details: JSON.stringify({
        campaignId,
        sent,
        failed,
        total: campaign.leads.length
      })
    }
  });

  return {
    campaignId,
    processed: campaign.leads.length,
    sent,
    failed,
    errors: errors.slice(0, 10)
  };
}
