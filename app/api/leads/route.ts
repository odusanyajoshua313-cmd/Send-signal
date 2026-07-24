import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const leads = await prisma.lead.findMany({
      where: { userId: user.id, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, phoneNumber: true, status: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500
    });

    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
