import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/onboarding/welcome";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // If it is a password recovery flow, redirect directly to reset-password
      if (type === "recovery" || searchParams.get("next")?.includes("reset-password")) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Ensure the user exists in our local SQLite database
      const user = data.user;
      const companyName = user.user_metadata?.companyName || "My Company";

      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
          },
          create: {
            id: user.id,
            email: user.email!,
            companyName: companyName,
            passwordHash: null,
          },
        });
      } catch (prismaError) {
        console.error("Error upserting user in database:", prismaError);
        // Continue anyway so they are logged in on Supabase
      }

      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Supabase code exchange error:", error);
    }
  }

  // Return the user to an error page or login if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
