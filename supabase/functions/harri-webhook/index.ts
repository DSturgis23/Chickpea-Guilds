// Harri -> Guilds webhook receiver.
//
// Harri POSTs a thin event here the moment something changes in their system
// (hire, leave, role/site change, name change). We re-fetch the full record
// from Harri's API and reflect it into Supabase. Nothing here emails or
// messages the person it's about — accounts are created pre-confirmed, same
// as the manual sync script, and profile updates are silent.
//
// Deploy:
//   supabase functions deploy harri-webhook --project-ref ydeyxpbsfkozzwgxlzhp
//   supabase secrets set HARRI_CLIENT_ID=... HARRI_CLIENT_SECRET=...
//   (optionally) supabase secrets set HARRI_WEBHOOK_API_KEY=...
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// Give Harri support this URL to register (ask them to also confirm the
// exact header name if you turn on their optional API-key auth under
// Brand Utilities -> Manage Open API — "x-api-key" below is a placeholder
// until they confirm it):
//   https://ydeyxpbsfkozzwgxlzhp.supabase.co/functions/v1/harri-webhook

import { claimEvent, createAuthUser, currentGuildCounts, findProfileByEmail, findProfileByHarriId, leastLoadedGuild, patchProfile } from "./db.ts";
import { findEmployeeById, getEmployeePositions, getEmployeeProfile, listLocations } from "./harri.ts";

const WEBHOOK_API_KEY = Deno.env.get("HARRI_WEBHOOK_API_KEY"); // unset = no check (Harri's default)

const EXCLUDED_LOCATION_NAMES = new Set(["Chickpea", "Boozers 100%", "Boozers 75%", "Chickpea test"]);

let siteCache: Map<number, string | null> | null = null;
async function siteFor(locationId: number): Promise<string | null> {
  if (!siteCache) {
    siteCache = new Map();
    for (const loc of await listLocations()) {
      siteCache.set(loc.id, EXCLUDED_LOCATION_NAMES.has(loc.name) ? null : loc.name);
    }
  }
  return siteCache.get(locationId) ?? null;
}

async function primaryPosition(employeeId: number) {
  const positions = await getEmployeePositions(employeeId);
  return positions.find((p) => p.is_primary) ?? positions[0] ?? null;
}

async function handleHireOrRehire(employeeId: number) {
  const [profile, position, employee] = await Promise.all([
    getEmployeeProfile(employeeId),
    primaryPosition(employeeId),
    findEmployeeById(employeeId),
  ]);
  if (profile.status !== "ACTIVE") return `skipped: employee ${employeeId} not ACTIVE in Harri`;
  if (!employee?.email) return `skipped: employee ${employeeId} has no email on file`;
  if (!position) return `skipped: employee ${employeeId} has no position on file`;

  const site = await siteFor(position.location_id);
  if (site === null) return `skipped: employee ${employeeId} is at an excluded/non-physical location`;

  const existingByHarriId = await findProfileByHarriId(String(employeeId));
  const existingByEmail = existingByHarriId ?? (await findProfileByEmail(employee.email));

  const fields = {
    first_name: employee.first_name,
    last_name: employee.last_name,
    job_role: position.name,
    site,
    active: true,
    harri_employee_id: String(employeeId),
  };

  if (existingByEmail) {
    // Rehire, or a HIRED event we somehow already have (re-delivery) — reactivate, don't duplicate.
    await patchProfile(existingByEmail.id, fields);
    return `reactivated/updated existing profile ${existingByEmail.id} for employee ${employeeId}`;
  }

  const counts = await currentGuildCounts();
  const guildId = leastLoadedGuild(counts);
  const userId = await createAuthUser(employee.email, { first_name: employee.first_name, last_name: employee.last_name, guild_id: guildId });
  await patchProfile(userId, { ...fields, guild_id: guildId, start_date: profile.employment_period.hire_date });
  return `created profile ${userId} for employee ${employeeId} -> ${guildId}`;
}

async function handleTerminate(employeeId: number) {
  const existing = await findProfileByHarriId(String(employeeId));
  if (!existing) return `skipped: no Guilds profile linked to employee ${employeeId} (never synced, or linked by email only)`;
  await patchProfile(existing.id, { active: false });
  return `deactivated profile ${existing.id} for employee ${employeeId}`;
}

async function handlePositionOrTitleChange(employeeId: number) {
  const existing = await findProfileByHarriId(String(employeeId));
  if (!existing) return `skipped: no Guilds profile linked to employee ${employeeId}`;
  const position = await primaryPosition(employeeId);
  if (!position) return `skipped: employee ${employeeId} has no position on file`;
  const site = await siteFor(position.location_id);
  await patchProfile(existing.id, { job_role: position.name, ...(site ? { site } : {}) });
  return `updated role/site on profile ${existing.id} for employee ${employeeId}`;
}

async function handlePersonalInfoChange(employeeId: number) {
  const existing = await findProfileByHarriId(String(employeeId));
  if (!existing) return `skipped: no Guilds profile linked to employee ${employeeId}`;
  const employee = await findEmployeeById(employeeId);
  if (!employee) return `skipped: employee ${employeeId} not found in Harri`;
  const fields: Record<string, unknown> = { first_name: employee.first_name, last_name: employee.last_name };
  if (employee.email) fields.email = employee.email;
  await patchProfile(existing.id, fields);
  return `updated personal info on profile ${existing.id} for employee ${employeeId}`;
}

async function route(type: string, employeeId: number): Promise<string> {
  switch (type) {
    case "EMPLOYEE.HIRED":
    case "EMPLOYEE.REHIRED":
      return handleHireOrRehire(employeeId);
    case "EMPLOYEE.TERMINATE":
      return handleTerminate(employeeId);
    case "EMPLOYEE.TRANSFERRED":
    case "EMPLOYEE_POSITION.CREATED":
    case "EMPLOYEE_POSITION.UPDATED":
      return handlePositionOrTitleChange(employeeId);
    case "EMPLOYEE_JOB_TITLES.UPDATED":
      return handlePositionOrTitleChange(employeeId);
    case "EMPLOYEE_PERSONAL_INFO.UPDATED":
      return handlePersonalInfoChange(employeeId);
    case "EMPLOYEE_POSITION.DELETED":
      return `ignored: ${type} (primary position, if any, is picked up by the next UPDATED event)`;
    default:
      return `ignored: unrecognised event type "${type}"`;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  if (WEBHOOK_API_KEY) {
    const got = req.headers.get("x-api-key");
    if (got !== WEBHOOK_API_KEY) return new Response("Unauthorized", { status: 401 });
  }

  let body: { event_id?: string; type?: string; employee_id?: number | string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { event_id, type, employee_id } = body;
  if (!event_id || !type || employee_id === undefined) {
    return new Response("Missing event_id, type or employee_id", { status: 400 });
  }

  // Acknowledge redeliveries without reprocessing.
  const isNew = await claimEvent(event_id, type, String(employee_id)).catch((err) => {
    console.error("claimEvent failed", err);
    return true; // if the idempotency check itself breaks, still try to process once
  });
  if (!isNew) return new Response(JSON.stringify({ ok: true, note: "duplicate, already processed" }), { status: 200 });

  try {
    const result = await route(type, Number(employee_id));
    console.log(`[harri-webhook] ${type} employee=${employee_id} event=${event_id}: ${result}`);
    return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    // Log loudly but still return 200 — Harri has no ongoing retry story we
    // want to rely on, and a 4xx/5xx here is harder to debug after the fact
    // than a clear log line. Check `supabase functions logs harri-webhook`.
    console.error(`[harri-webhook] ${type} employee=${employee_id} event=${event_id} FAILED:`, err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
});
