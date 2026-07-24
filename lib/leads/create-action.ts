"use server";

import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/supabase/server";

export async function createSingleLead(formData: FormData) {
  try {
    const userId = await getUserId();
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const rawPhoneNumber = formData.get("phoneNumber") as string;
    const email = formData.get("email") as string;
    const optIn = formData.get("optIn") === "true";

    if (!rawPhoneNumber) {
      return { error: "Phone number is required." };
    }
    
    if (!optIn) {
      return { error: "You must confirm that this contact has opted in." };
    }

    // Validate phone
    const phoneStr = rawPhoneNumber.startsWith('+') ? rawPhoneNumber : `+${rawPhoneNumber.replace(/\D/g, '')}`;
    if (!isValidPhoneNumber(phoneStr)) {
       return { error: "Invalid phone number format. Please include country code." };
    }
    const normalizedPhone = parsePhoneNumber(phoneStr).format('E.164');

    // Check duplicate
    const existing = await prisma.lead.findFirst({
       where: { userId, phoneNumber: normalizedPhone }
    });

    if (existing) {
       return { error: "A lead with this phone number already exists." };
    }

    const lead = await prisma.lead.create({
      data: {
        userId,
        phoneNumber: normalizedPhone,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        source: "Manual Entry",
        optIn: true,
        status: "NEW"
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        eventType: "LEAD_IMPORTED",
        details: JSON.stringify({ method: "Manual", leadId: lead.id })
      }
    });

    revalidatePath("/dashboard/leads");
    return { success: true, leadId: lead.id };

  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to create lead." };
  }
}
