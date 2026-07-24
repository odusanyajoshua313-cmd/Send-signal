"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EventType } from "@prisma/client";
import { getUserId } from "@/lib/supabase/server";

export async function createTemplate(formData: FormData) {
  try {
    const userId = await getUserId();
    
    const name = formData.get("name") as string;
    const body = formData.get("body") as string;

    if (!name || name.trim() === "") {
      return { error: "Template name is required." };
    }
    
    if (!body || body.trim() === "") {
      return { error: "Template body cannot be empty." };
    }

    if (body.length > 1024) {
      return { error: "Template body must be under 1024 characters per WhatsApp constraints." };
    }

    // Extract placeholders (e.g., {first_name})
    const placeholderRegex = /\{([^}]+)\}/g;
    const matches = Array.from(body.matchAll(placeholderRegex));
    const variables: Record<string, string> = {};
    
    matches.forEach((match) => {
       const vName = match[1];
       variables[vName] = "text"; // defaults to text input type for now
    });

    const template = await prisma.template.create({
      data: {
        userId,
        name,
        body,
        variables: JSON.stringify(variables),
        status: "APPROVED" // Stubbing Facebook approval process for the MVP
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        eventType: "TEMPLATE_CREATED" as EventType,
        details: JSON.stringify({ templateId: template.id, name })
      }
    });

    revalidatePath("/dashboard/templates");
    return { success: true, templateId: template.id };

  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to create template." };
  }
}

export async function updateTemplate(templateId: string, formData: FormData) {
  try {
    const userId = await getUserId();
    
    // Check ownership
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: { userId: true }
    });
    
    if (!template || template.userId !== userId) {
      return { error: "Template not found or unauthorized." };
    }

    const name = formData.get("name") as string;
    const body = formData.get("body") as string;

    if (!name || name.trim() === "") {
      return { error: "Template name is required." };
    }
    
    if (!body || body.trim() === "") {
      return { error: "Template body cannot be empty." };
    }

    if (body.length > 1024) {
      return { error: "Template body must be under 1024 characters per WhatsApp constraints." };
    }

    // Extract placeholders
    const placeholderRegex = /\{([^}]+)\}/g;
    const matches = Array.from(body.matchAll(placeholderRegex));
    const variables: Record<string, string> = {};
    matches.forEach((match) => {
       const vName = match[1];
       variables[vName] = "text";
    });

    await prisma.template.update({
      where: { id: templateId },
      data: {
        name,
        body,
        variables: JSON.stringify(variables)
      }
    });

    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    const userId = await getUserId();
    
    // Check ownership
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: { userId: true }
    });
    
    if (!template || template.userId !== userId) {
      return { error: "Template not found or unauthorized." };
    }

    await prisma.template.delete({
      where: { id: templateId }
    });

    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Delete failed." };
  }
}
