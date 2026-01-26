import { hamiltonAllocate, selectByPriority } from "@/lib/allocation";

type Entry = {
  id: number;
  university: string;
  created_at: string;
  has_dost_sa: boolean;
};

function mk(university: string, n: number, startId = 1, withOrgEvery = 2): Entry[] {
  const res: Entry[] = [];
  for (let i = 0; i < n; i++) {
    res.push({
      id: startId + i,
      university,
      created_at: new Date(2024, 0, 1, 0, i).toISOString(),
      has_dost_sa: (i % withOrgEvery) === 0,
    });
  }
  return res;
}

// Simple smoke tests (run manually):
(() => {
  const byUni: Record<string, Entry[]> = {
    A: mk("A", 100),
    B: mk("B", 50, 1000),
    C: mk("C", 50, 2000),
  };
  const { allocation } = hamiltonAllocate(byUni as any, ["A", "B", "C"], 60);
  if (allocation.A + allocation.B + allocation.C !== 60) throw new Error("Allocation sum mismatch");

  const selected = selectByPriority(byUni.A as any, 10);
  if (selected.length !== 10) throw new Error("Priority selection length mismatch");
})();


