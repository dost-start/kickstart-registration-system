import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type AllocationPreview = {
  accepted: Tables<"kickstart_form_entries">[];
  waitlisted: Tables<"kickstart_form_entries">[];
  results: Array<{
    university: string;
    isMinorityUniversity: boolean;
    registrantCount: number;
    allocatedSlots: number;
    acceptedCount: number;
    waitlistedCount: number;
  }>;
};

const TOTAL_SLOTS_PER_DAY = 600;

function groupByUniversity(entries: Tables<"kickstart_form_entries">[]) {
  const map: Record<string, Tables<"kickstart_form_entries">[]> = {};
  for (const e of entries) {
    const uni = e.university;
    if (!map[uni]) map[uni] = [];
    map[uni].push(e);
  }
  return map;
}

function firstCreatedAt(list: Tables<"kickstart_form_entries">[] | undefined): number {
  if (!list || list.length === 0) return Number.MAX_SAFE_INTEGER;
  return new Date(
    list.reduce((a, b) => (a.created_at < b.created_at ? a : b)).created_at
  ).getTime();
}

export function selectByPriority(
  list: Tables<"kickstart_form_entries">[] | undefined,
  limit: number
): Tables<"kickstart_form_entries">[] {
  if (!list || limit <= 0) return [];
  // No prioritization - just sort by earliest registration time
  const sorted = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
  return sorted.slice(0, Math.max(0, limit));
}

export function hamiltonAllocate(
  byUni: Record<string, Tables<"kickstart_form_entries">[]>,
  universities: string[],
  slots: number
) {
  const quota: Record<string, number> = Object.fromEntries(
    universities.map((u) => [u, byUni[u]?.length ?? 0])
  );
  const total = Object.values(quota).reduce((a, b) => a + b, 0);
  if (total === 0 || slots === 0) {
    return { allocation: Object.fromEntries(universities.map((u) => [u, 0])) };
  }
  const raw: Record<string, number> = Object.fromEntries(
    universities.map((u) => [u, (slots * quota[u]) / total])
  );
  const floorAlloc: Record<string, number> = Object.fromEntries(
    universities.map((u) => [u, Math.floor(raw[u])])
  );
  let remaining =
    slots - Object.values(floorAlloc).reduce((a, b) => a + b, 0);
  const order = [...universities].sort((a, b) => {
    const fa = raw[a] - floorAlloc[a];
    const fb = raw[b] - floorAlloc[b];
    if (fb !== fa) return fb - fa;
    if (quota[b] !== quota[a]) return quota[b] - quota[a];
    return firstCreatedAt(byUni[a]) - firstCreatedAt(byUni[b]);
  });
  const allocation: Record<string, number> = { ...floorAlloc };
  for (let i = 0; i < remaining; i++) {
    const u = order[i % order.length];
    allocation[u] = (allocation[u] ?? 0) + 1;
  }
  return { allocation };
}

export async function allocateDay(
  day: string,
  dryRun: boolean,
  adminId: string
): Promise<AllocationPreview | { runId: number }>
{
  const supabase = await createClient();
  
  // Step 0: Calculate available slots (600 - already accepted for this day)
  const { count: alreadyAcceptedCount, error: countErr } = await supabase
    .from("kickstart_form_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "accepted")
    .eq("preferred_date", day);
  if (countErr) throw new Error(`Failed to count accepted: ${countErr.message}`);
  
  const availableSlots = Math.max(0, TOTAL_SLOTS_PER_DAY - (alreadyAcceptedCount ?? 0));
  
  if (availableSlots === 0) {
    throw new Error(`No slots available for ${day}. All 600 slots are already allocated.`);
  }
  
  // Fetch ALL pending registrants (remove default 1000 limit)
  let regs: any[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: regsData, error } = await supabase
      .from("kickstart_form_entries")
      .select("*")
      .eq("status", "pending")
      .eq("preferred_date", day)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) throw new Error(`Failed to fetch registrations: ${error.message}`);
    if (!regsData || regsData.length === 0) break;
    
    regs = regs.concat(regsData);
    
    // If we got less than pageSize, we've reached the end
    if (regsData.length < pageSize) break;
    page++;
  }
  const byUni = groupByUniversity(regs);
  const counts: Record<string, number> = Object.fromEntries(
    Object.entries(byUni).map(([u, list]) => [u, list.length])
  );
  const allUnis = Object.keys(counts);
  
  // Identify minority universities (< 25 registrants)
  const minorityUniversities = allUnis.filter((u) => counts[u] < 25);
  const nonMinorityUniversities = allUnis.filter((u) => counts[u] >= 25);

  // Step 1: Auto-accept ALL registrants from minority universities
  const acceptedFromMinorityUnis = minorityUniversities.flatMap((u) => byUni[u] ?? []);
  const slotsUsedByMinority = acceptedFromMinorityUnis.length;
  const remainingSlots = Math.max(0, availableSlots - slotsUsedByMinority);

  // Step 2: Allocate remaining slots proportionally to non-minority universities using Hamilton
  let nonMinorityAllocation: Record<string, number> = {};
  const totalNonMinority = nonMinorityUniversities.reduce(
    (a, u) => a + (counts[u] ?? 0),
    0
  );
  
  if (remainingSlots <= 0 || totalNonMinority === 0) {
    nonMinorityAllocation = Object.fromEntries(nonMinorityUniversities.map((u) => [u, 0]));
  } else if (totalNonMinority <= remainingSlots) {
    nonMinorityAllocation = Object.fromEntries(
      nonMinorityUniversities.map((u) => [u, counts[u] ?? 0])
    );
  } else {
    nonMinorityAllocation = hamiltonAllocate(
      byUni,
      nonMinorityUniversities,
      remainingSlots
    ).allocation;
  }

  const acceptedFromNonMinorityUnis = nonMinorityUniversities.flatMap((u) =>
    selectByPriority(byUni[u], nonMinorityAllocation[u] ?? 0)
  );

  const accepted = [...acceptedFromMinorityUnis, ...acceptedFromNonMinorityUnis];
  const acceptedIdSet = new Set(accepted.map((r) => r.id));
  const waitlisted = regs.filter((r) => !acceptedIdSet.has(r.id));

  // Step 3: Label each registrant as minority
  // A registrant is minority if: (1) from minority university OR (2) has_dost_sa = false
  const minorityRegistrantIds = new Set<number>();
  for (const reg of regs) {
    const isFromMinorityUni = minorityUniversities.includes(reg.university);
    const isNoDostOrg = !reg.has_dost_sa;
    if (isFromMinorityUni || isNoDostOrg) {
      minorityRegistrantIds.add(reg.id);
    }
  }

  const results: AllocationPreview["results"] = [
    ...minorityUniversities.map((u) => ({
      university: u,
      isMinorityUniversity: true,
      registrantCount: counts[u] ?? 0,
      allocatedSlots: counts[u] ?? 0, // all auto-accepted
      acceptedCount: accepted.filter((r) => r.university === u).length,
      waitlistedCount: waitlisted.filter((r) => r.university === u).length,
    })),
    ...nonMinorityUniversities.map((u) => ({
      university: u,
      isMinorityUniversity: false,
      registrantCount: counts[u] ?? 0,
      allocatedSlots: nonMinorityAllocation[u] ?? 0,
      acceptedCount: accepted.filter((r) => r.university === u).length,
      waitlistedCount: waitlisted.filter((r) => r.university === u).length,
    })),
  ];

  if (dryRun) {
    return { accepted, waitlisted, results };
  }

  // Persist run and results
  const { data: runRow, error: runErr } = await supabase
    .from("allocation_runs")
    .insert({
      day,
      total_slots: availableSlots,
      ruleset_version: "v2.1",
      created_by: adminId,
    })
    .select("*")
    .single();
  if (runErr || !runRow) {
    throw new Error(`Failed to create allocation run: ${runErr?.message}`);
  }

  const runId = runRow.id as number;

  const resultRows = results.map((r) => ({
    run_id: runId,
    university: r.university,
    is_minority: r.isMinorityUniversity,
    registrant_count: r.registrantCount,
    allocated_slots: r.allocatedSlots,
    accepted_count: r.acceptedCount,
    waitlisted_count: r.waitlistedCount,
  }));
  const { error: resErr } = await supabase
    .from("allocation_results")
    .insert(resultRows);
  if (resErr) {
    throw new Error(`Failed to persist allocation results: ${resErr.message}`);
  }

  // Update statuses and minority labels - BATCH OPERATIONS for performance
  // Group accepted by minority status for efficient bulk updates
  const acceptedMinority = accepted.filter((r) => minorityRegistrantIds.has(r.id));
  const acceptedNonMinority = accepted.filter((r) => !minorityRegistrantIds.has(r.id));
  const waitlistedMinority = waitlisted.filter((r) => minorityRegistrantIds.has(r.id));
  const waitlistedNonMinority = waitlisted.filter((r) => !minorityRegistrantIds.has(r.id));
  
  // Batch update: accepted + minority
  if (acceptedMinority.length > 0) {
    const { error: accErr } = await supabase
      .from("kickstart_form_entries")
      .update({ status: "accepted", is_minority: true })
      .in("id", acceptedMinority.map((r) => r.id));
    if (accErr) {
      throw new Error(`Failed to accept minority registrants: ${accErr.message}`);
    }
  }
  
  // Batch update: accepted + non-minority
  if (acceptedNonMinority.length > 0) {
    const { error: accErr } = await supabase
      .from("kickstart_form_entries")
      .update({ status: "accepted", is_minority: false })
      .in("id", acceptedNonMinority.map((r) => r.id));
    if (accErr) {
      throw new Error(`Failed to accept non-minority registrants: ${accErr.message}`);
    }
  }
  
  // Batch update: waitlisted + minority
  if (waitlistedMinority.length > 0) {
    const { error: wlErr } = await supabase
      .from("kickstart_form_entries")
      .update({ status: "waitlisted", is_minority: true })
      .in("id", waitlistedMinority.map((r) => r.id));
    if (wlErr) {
      throw new Error(`Failed to waitlist minority registrants: ${wlErr.message}`);
    }
  }
  
  // Batch update: waitlisted + non-minority
  if (waitlistedNonMinority.length > 0) {
    const { error: wlErr } = await supabase
      .from("kickstart_form_entries")
      .update({ status: "waitlisted", is_minority: false })
      .in("id", waitlistedNonMinority.map((r) => r.id));
    if (wlErr) {
      throw new Error(`Failed to waitlist non-minority registrants: ${wlErr.message}`);
    }
  }

  return { runId };
}

export async function getLastAllocation(day: string) {
  const supabase = await createClient();
  const { data: runs, error } = await supabase
    .from("allocation_runs")
    .select("*")
    .eq("day", day)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`Failed to get allocation runs: ${error.message}`);
  const run = runs?.[0];
  if (!run) return null;
  const { data: results, error: rerr } = await supabase
    .from("allocation_results")
    .select("*")
    .eq("run_id", run.id);
  if (rerr) throw new Error(`Failed to get allocation results: ${rerr.message}`);
  return { run, results: results ?? [] };
}


