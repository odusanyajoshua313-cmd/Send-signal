import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MessageStatus, LeadStatus, ConversationSource } from "@prisma/client";

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "send_signal_webhook_verify";
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !APP_SECRET) return true;
  
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", APP_SECRET)
    .update(body)
    .digest("hex");
  
  return signature === expectedSignature;
}

function extractLeadStatusFromMessage(text: string): LeadStatus | null {
  const lower = text.toLowerCase().trim();
  
  const unsubscribeKeywords = ["stop", "unsubscribe", "cancel", "end", "quit", "remove", "opt out", "opt-out"];
  if (unsubscribeKeywords.some(k => lower === k)) {
    return "UNSUBSCRIBED";
  }
  
  const interestedKeywords = ["yes", "interested", "yep", "yeah", "sure", "ok", "okay", "interested!"];
  if (interestedKeywords.some(k => lower === k)) {
    return "INTERESTED";
  }
  
  const notInterestedKeywords = ["no", "not interested", "nope", "nah", "not now", "leave me alone"];
  if (notInterestedKeywords.some(k => lower === k)) {
    return "NOT_INTERESTED";
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(body);
    
    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Not a WhatsApp event" }, { status: 400 });
    }

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        
        if (!value?.messages || !Array.isArray(value.messages)) continue;

        for (const msg of value.messages) {
          const phoneNumber = msg.from;
          const whatsappMessageId = msg.id;
          const messageText = msg.text?.body || "";
          const timestamp = new Date(parseInt(msg.timestamp) * 1000);

          const waAccount = await prisma.whatsappAccount.findFirst({
            where: { phoneNumber: value.metadata?.phone_number_id || msg.to },
            include: { user: true }
          });

          if (!waAccount || !waAccount.user) {
            console.error("WhatsApp account not found for message");
            continue;
          }

          const userId = waAccount.userId;

          let lead = await prisma.lead.findFirst({
            where: { userId, phoneNumber: `+${phoneNumber}` }
          });

          if (!lead) {
            lead = await prisma.lead.create({
              data: {
                userId,
                phoneNumber: `+${phoneNumber}`,
                status: "NEW",
                optIn: true,
                source: "Inbound Reply"
              }
            });
          }

          const existingMessage = await prisma.message.findUnique({
            where: { whatsappMessageId }
          });

          if (existingMessage) {
            continue;
          }

          const message = await prisma.message.create({
            data: {
              userId,
              leadId: lead.id,
              whatsappMessageId,
              direction: "INBOUND",
              status: MessageStatus.QUEUED,
              body: messageText,
              sentAt: timestamp,
              content: messageText
            }
          });

          const leadStatusUpdate = extractLeadStatusFromMessage(messageText);
          
          if (leadStatusUpdate === "UNSUBSCRIBED") {
            await prisma.lead.update({
              where: { id: lead.id },
              data: {
                status: LeadStatus.UNSUBSCRIBED,
                unsubscribed: true,
                unsubscribedAt: new Date()
              }
            });

            await prisma.message.update({
              where: { id: message.id },
              data: { status: MessageStatus.UNSUBSCRIBED }
            });
          } else if (leadStatusUpdate) {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { status: leadStatusUpdate }
            });
          } else if (messageText.length > 0) {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { status: "REPLIED" }
            });

            await prisma.message.update({
              where: { id: message.id },
              data: { status: MessageStatus.REPLIED }
            });
          }

          await prisma.conversation.upsert({
            where: {
              userId_leadId: { userId, leadId: lead.id }
            },
            create: {
              userId,
              leadId: lead.id,
              source: ConversationSource.INBOUND,
              lastMessageAt: new Date()
            },
            update: {
              lastMessageAt: new Date()
            }
          });

          await prisma.activityLog.create({
            data: {
              userId,
              eventType: "MESSAGE_REPLIED",
              details: JSON.stringify({
                leadId: lead.id,
                messageId: message.id,
                status: leadStatusUpdate || "REPLIED"
              })
            }
          });
        }

        for (const status of value.statuses || []) {
          const whatsappMessageId = status.id;
          const message = await prisma.message.findUnique({
            where: { whatsappMessageId }
          });

          if (!message) continue;

          let newStatus: MessageStatus | null = null;
          switch (status.status) {
            case "sent":
              newStatus = MessageStatus.SENT;
              break;
            case "delivered":
              newStatus = MessageStatus.DELIVERED;
              break;
            case "read":
              newStatus = MessageStatus.READ;
              break;
            case "failed":
              newStatus = MessageStatus.FAILED;
              break;
          }

          if (newStatus) {
            await prisma.message.update({
              where: { id: message.id },
              data: {
                status: newStatus,
                ...(status.timestamp ? { sentAt: new Date(parseInt(status.timestamp) * 1000) } : {})
              }
            });

            await prisma.messageEvent.create({
              data: {
                messageId: message.id,
                status: newStatus,
                externalEventId: `${status.id}-${status.timestamp}`,
                payload: JSON.stringify(status)
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
