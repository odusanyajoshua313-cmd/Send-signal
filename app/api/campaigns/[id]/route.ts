import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        template: { select: { name: true, body: true } },
        leads: {
          include: {
            lead: { select: { firstName: true, lastName: true, phoneNumber: true } }
          }
        },
        _count: { select: { leads: true } }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Fetch campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
