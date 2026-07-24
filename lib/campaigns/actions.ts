"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/supabase/server";

import { executeCampaign } from "./execution";

export async function createCampaign(data: {
  name: string;
  templateId: string;
  leadIds: string[];
  throttleRate: number;
  scheduledAt?: string;
}) {
  try {
    const userId = await getUserId();
    
    if (!data.name || data.name.trim() === "") {
      return { error: "Campaign name is required." };
    }

    if (!data.templateId) {
      return { error: "A message template must be selected." };
    }

    if (!data.leadIds || data.leadIds.length === 0) {
      return { error: "Campaigns must not launch with zero recipients." };
    }

    // Validate template exists and belongs to this user
    const template = await prisma.template.findFirst({
      where: { id: data.templateId, userId, deletedAt: null }
    });

    if (!template) {
      return { error: "Selected template not found." };
    }

    if (template.status !== "APPROVED") {
      return { error: "Template must be approved before launching a campaign." };
    }

    // Validate leads exist
    const validLeads = await prisma.lead.findMany({
      where: { id: { in: data.leadIds }, userId, deletedAt: null }
    });

    if (validLeads.length === 0) {
      return { error: "No valid leads found for this campaign." };
    }

    // Get the user's connected WhatsApp account
    const waAccount = await prisma.whatsappAccount.findFirst({
      where: { userId, isConnected: true }
    });

    if (!waAccount) {
      return { error: "You must connect a WhatsApp account before launching a campaign." };
    }

    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const status = scheduledAt ? "SCHEDULED" : "RUNNING";

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        whatsappAccountId: waAccount.id,
        name: data.name,
        templateId: data.templateId,
        status,
        throttleRate: data.throttleRate || 20,
        scheduledAt,
        leads: {
          create: validLeads.map(lead => ({
            leadId: lead.id,
            status: "PENDING"
          }))
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        eventType: "CAMPAIGN_CREATED",
        details: JSON.stringify({ campaignId: campaign.id, name: data.name, recipientCount: validLeads.length })
      }
    });

    if (status === "RUNNING") {
      // Trigger execution in the background (fire and forget)
      executeCampaign(campaign.id).catch(err => console.error("Background execution failed:", err));
    }

    revalidatePath("/dashboard/campaigns");
    return { success: true, campaignId: campaign.id };

  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to create campaign." };
  }
}

export async function updateCampaignStatus(campaignId: string, newStatus: string) {
  try {
    const userId = await getUserId();

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId }
    });

    if (!campaign) {
      return { error: "Campaign not found." };
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: newStatus as "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED" }
    });

    let eventType: "CAMPAIGN_CREATED" | "CAMPAIGN_LAUNCHED" | "CAMPAIGN_PAUSED" | "CAMPAIGN_RESUMED" | "CAMPAIGN_COMPLETED" = "CAMPAIGN_CREATED";
    if (newStatus === "RUNNING") eventType = "CAMPAIGN_LAUNCHED";
    else if (newStatus === "PAUSED") eventType = "CAMPAIGN_PAUSED";
    else if (newStatus === "COMPLETED") eventType = "CAMPAIGN_COMPLETED";

    await prisma.activityLog.create({
      data: {
        userId,
        eventType: eventType,
        details: JSON.stringify({ campaignId, from: campaign.status, to: newStatus })
      }
    });

    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    revalidatePath("/dashboard/campaigns");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to update campaign status." };
  }
}
