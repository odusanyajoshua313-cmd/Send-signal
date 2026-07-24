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

    const [total, completed, messages, campaigns] = await Promise.all([
      prisma.campaign.count({ where: { userId, deletedAt: null } }),
      prisma.campaign.count({ where: { userId, status: "COMPLETED", deletedAt: null } }),
      prisma.message.count({ where: { userId, direction: "OUTBOUND" } }),
      prisma.campaign.findMany({
        where: { userId, deletedAt: null },
        include: { _count: { select: { leads: true } } },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    return NextResponse.json({ total, completed, messages, campaigns });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
