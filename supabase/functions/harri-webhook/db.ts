// Thin REST helpers against this project's own Supabase instance, using the
// service role key Supabase injects into every Edge Function automatically.
// Mirrors harri_api/sync_harri.py's approach so the two stay easy to compare.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SR_HEADERS = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

export const GUILD_IDS = ["stokers", "pyros", "stormchasers", "strikers", "gunners", "hammers"];

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  guild_id: string | null;
  site: string | null;
  job_role: string | null;
  active: boolean;
  harri_employee_id: string | null;
}

async function rest(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: { ...SR_HEADERS, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Supabase REST ${path} failed: ${res.status} ${await res.text()}`);
  return res;
}

export async function findProfileByHarriId(harriId: string): Promise<Profile | null> {
  const res = await rest(`/profiles?harri_employee_id=eq.${encodeURIComponent(harriId)}&select=*`);
  const rows = await res.json();
  return rows[0] ?? null;
}

export async function findProfileByEmail(email: string): Promise<Profile | null> {
  const res = await rest(`/profiles?email=eq.${encodeURIComponent(email)}&select=*`);
  const rows = await res.json();
  return rows[0] ?? null;
}

export async function patchProfile(id: string, fields: Record<string, unknown>): Promise<void> {
  await rest(`/profiles?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(fields) });
}

export async function currentGuildCounts(): Promise<Record<string, number>> {
  const res = await rest(`/profiles?select=guild_id&guild_id=not.is.null`);
  const rows: { guild_id: string }[] = await res.json();
  const counts = Object.fromEntries(GUILD_IDS.map((g) => [g, 0]));
  for (const row of rows) if (row.guild_id in counts) counts[row.guild_id] += 1;
  return counts;
}

export function leastLoadedGuild(counts: Record<string, number>): string {
  const lowest = Math.min(...Object.values(counts));
  const candidates = GUILD_IDS.filter((g) => counts[g] === lowest);
  const choice = candidates[Math.floor(Math.random() * candidates.length)];
  counts[choice] += 1;
  return choice;
}

function randomPassword(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Pre-confirmed, no email sent — matches sync_harri.py's create_auth_user.
export async function createAuthUser(email: string, meta: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: SR_HEADERS,
    body: JSON.stringify({
      email,
      password: randomPassword(),
      email_confirm: true,
      user_metadata: meta,
    }),
  });
  if (!res.ok) throw new Error(`createAuthUser failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.id;
}

// Idempotency guard: Harri may redeliver a webhook. Returns false if this
// event_id has already been recorded (caller should skip processing).
export async function claimEvent(eventId: string, type: string, employeeId: string | null): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/webhook_events`, {
    method: "POST",
    headers: { ...SR_HEADERS, Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({ event_id: eventId, type, employee_id: employeeId }),
  });
  if (!res.ok) throw new Error(`claimEvent failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows.length > 0; // empty = conflict = already claimed
}
