"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/supabase/server";

export async function saveWhatsappConnection(data: { phoneNumberId: string; accessToken: string; phoneNumber?: string }) {
  try {
    const userId = await getUserId();
    
    // For manual connection, we'll use the phoneNumberId as a temporary identifier if phoneNumber isn't provided
    // In a real flow, we'd fetch the actual phone number from Meta API using the token
    const phoneNumber = data.phoneNumber || `ID-${data.phoneNumberId}`;

    const account = await prisma.whatsappAccount.upsert({
      where: { phoneNumber: phoneNumber },
      update: {
        wabaId: data.phoneNumberId,
        accessToken: data.accessToken, // In production, this should be encrypted
        isConnected: true,
        status: "connected",
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        phoneNumber: phoneNumber,
        wabaId: data.phoneNumberId,
        accessToken: data.accessToken,
        isConnected: true,
        status: "connected",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        eventType: "WHATSAPP_CONNECTED",
        details: JSON.stringify({ phoneNumberId: data.phoneNumberId })
      }
    });

    revalidatePath("/onboarding/whatsapp");
    return { success: true, accountId: account.id };
  } catch (error: any) {
    console.error("Failed to save WhatsApp connection:", error);
    return { error: error.message || "Failed to save connection" };
  }
}

export async function saveInitialTemplate(data: { name: string; body: string }) {
  try {
    const userId = await getUserId();

    const template = await prisma.template.create({
      data: {
        userId,
        name: data.name,
        body: data.body,
        status: "APPROVED", // Auto-approved for the demo/onboarding
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        eventType: "TEMPLATE_CREATED",
        details: JSON.stringify({ templateId: template.id, name: template.name })
      }
    });

    revalidatePath("/onboarding/template");
    return { success: true, templateId: template.id };
  } catch (error: any) {
    console.error("Failed to save initial template:", error);
    return { error: error.message || "Failed to save template" };
  }
}
