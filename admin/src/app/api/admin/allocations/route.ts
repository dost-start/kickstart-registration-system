import { NextRequest } from "next/server";
import { allocateDay, getLastAllocation } from "@/lib/allocation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const day = String(body.day);
    const dryRun = Boolean(body.dryRun);
    const adminId = String(body.adminId ?? "admin");
    const result = await allocateDay(day, dryRun, adminId);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const day = String(searchParams.get("day") ?? "");
    if (!day) return new Response(JSON.stringify({ error: "Missing day" }), { status: 400 });
    const data = await getLastAllocation(day);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500 });
  }
}


