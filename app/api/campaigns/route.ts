import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;

    const campaigns = await prisma.campaign.findMany({
      where: { userId, deletedAt: null },
      include: {
        template: { select: { name: true, body: true } },
        _count: { select: { leads: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(campaigns);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
