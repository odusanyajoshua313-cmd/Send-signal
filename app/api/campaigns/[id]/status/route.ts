import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["DRAFT", "SCHEDULED", "RUNNING", "PAUSED", "COMPLETED", "CANCELLED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.campaign.update({
      where: { id },
      data: { status: status as "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED" },
    });

    let eventType: "CAMPAIGN_CREATED" | "CAMPAIGN_LAUNCHED" | "CAMPAIGN_PAUSED" | "CAMPAIGN_RESUMED" | "CAMPAIGN_COMPLETED" = "CAMPAIGN_CREATED";
    switch (status) {
      case "RUNNING":
        eventType = "CAMPAIGN_LAUNCHED";
        break;
      case "PAUSED":
        eventType = "CAMPAIGN_PAUSED";
        break;
      case "COMPLETED":
        eventType = "CAMPAIGN_COMPLETED";
        break;
    }

    await prisma.activityLog.create({
      data: {
        userId,
        eventType,
        details: JSON.stringify({ campaignId: id, from: campaign.status, to: status }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Campaign status update error:", error);
    return NextResponse.json({ error: "Failed to update campaign status" }, { status: 500 });
  }
}
