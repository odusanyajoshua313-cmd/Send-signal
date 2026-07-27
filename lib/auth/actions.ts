"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function signUp(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!companyName || !email || !password || password.length < 8) {
    return { error: "Invalid form data. Password must be at least 8 characters." };
  }

  try {
    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          companyName,
        },
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Supabase sign-up error:", error);
      return { error: error.message };
    }

    if (data.user) {
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: { email: data.user.email! },
          create: {
            id: data.user.id,
            email: data.user.email!,
            companyName,
            passwordHash: null,
          },
        });
      } catch (prismaError) {
        console.error("Error creating user in database:", prismaError);
      }
    }

    const requiresVerification = !data.session;
    return { success: true, requiresVerification };
  } catch (error: unknown) {
    console.error("Sign up error Details:", error);
    return { error: "Account creation failed. Please try again or contact support." };
  }
}

export async function logIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      return { error: error.message || "Invalid email or password." };
    }

    console.log(`User logged in successfully: ${email}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Login error Details:", error);
    return { error: "Login failed. Please check your credentials and try again." };
  }
}

export async function logOut() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase signOut error:", error);
    }
  } catch (err) {
    console.error("Signout error:", err);
  }
  return { success: true };
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required." };
  }

  try {
    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?type=recovery`,
    });

    if (error) {
      console.error("Supabase resetPasswordForEmail error:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Password reset request error:", error);
    return { error: "Failed to request password reset. Please try again." };
  }
}
