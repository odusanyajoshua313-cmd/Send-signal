"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient, getUserId } from "@/lib/supabase/server";

export async function updateProfile(data: {
  companyName?: string;
  email?: string;
}) {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      });

      if (existingUser) {
        return { error: "This email is already in use by another account." };
      }

      // Update email in Supabase (will send confirmation email depending on settings)
      const { error: supabaseError } = await supabase.auth.updateUser({ email: data.email });
      if (supabaseError) {
        return { error: supabaseError.message };
      }
    }

    const updateData: Record<string, string> = {};
    if (data.companyName) updateData.companyName = data.companyName;
    if (data.email) updateData.email = data.email;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update profile" };
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Unauthorized" };
    }

    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters." };
    }

    // Verify current password by signing in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: "Current password is incorrect." };
    }

    // Update password in Supabase
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update password" };
  }
}
