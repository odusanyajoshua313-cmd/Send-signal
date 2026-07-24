import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  console.log('DELETE /api/leads called');
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;
    const leadId = params.id;
    console.log('Attempting to delete lead', { leadId, userId });
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { userId: true },
    });
    console.log('Lead fetched:', lead);
    if (!lead || lead.userId !== userId) {
      return NextResponse.json({ error: "Lead not found or unauthorized" }, { status: 404 });
    }
    await prisma.lead.delete({
      where: { id: leadId }
    });
    console.log('Lead deleted');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/leads error', err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
