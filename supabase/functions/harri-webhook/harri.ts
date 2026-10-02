// Harri Open API client — Deno port of harri_api/harri_client.py.
// Confirmed endpoints only (see that file's docstring for the full survey).

const TOKEN_URL = "https://oauth.harri.com/oauth2/token";
const BASE_URL = "https://gateway.harri.com/open-api-hub";

const CLIENT_ID = Deno.env.get("HARRI_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("HARRI_CLIENT_SECRET")!;

let cachedToken: string | null = null;

async function getAccessToken(): Promise<string> {
  const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Harri token request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  cachedToken = data.access_token;
  return cachedToken!;
}

async function harriGet(path: string, params?: Record<string, string | number>): Promise<any> {
  const token = cachedToken ?? (await getAccessToken());
  const url = new URL(`${BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, String(v));

  let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    const fresh = await getAccessToken();
    res = await fetch(url, { headers: { Authorization: `Bearer ${fresh}` } });
  }
  if (!res.ok) throw new Error(`Harri GET ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export interface HarriLocation {
  id: number;
  name: string;
}

export interface HarriPosition {
  name: string;
  category?: string;
  location_id: number;
  is_primary: boolean;
}

export interface HarriProfile {
  status: string; // 'ACTIVE' | ...
  employment_period: { hire_date: string | null; leave_date: string | null };
  employer?: { first_name?: string; last_name?: string; email?: string };
}

export interface HarriEmployee {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
}

export async function listLocations(): Promise<HarriLocation[]> {
  return harriGet("/api/v1/locations");
}

export async function getEmployee(employeeId: number | string): Promise<HarriEmployee> {
  // /api/v1/employees doesn't support a single-id fetch in the confirmed survey;
  // the webhook payload carries employee_id but not name/email, so pull it from
  // the profile + a positions-free identity lookup via the employees list is
  // wasteful — instead, name/email come back on the profile/personal-info calls
  // where needed. This helper exists for callers that only need the bare id.
  return { id: Number(employeeId), first_name: "", last_name: "", email: null };
}

export async function getEmployeeProfile(employeeId: number | string): Promise<HarriProfile> {
  return harriGet(`/api/v5/employees/${employeeId}/profile`);
}

export async function getEmployeePositions(employeeId: number | string): Promise<HarriPosition[]> {
  const data = await harriGet(`/api/v3/employees/${employeeId}/positions`);
  return data.positions;
}

// The /api/v1/employees list is the only confirmed source of first/last name
// and email together. There's no per-id lookup, so when the webhook payload
// gives us only employee_id we page through until we find it. Fine at ~500
// employees and low webhook volume; revisit if Harri ever adds a direct
// GET /api/v1/employees/{id}.
export async function findEmployeeById(employeeId: number | string): Promise<HarriEmployee | null> {
  const target = Number(employeeId);
  let page = 1;
  while (true) {
    const data = await harriGet("/api/v1/employees", { page, per_page: 50 });
    const match = (data.employees as any[]).find((e) => e.id === target);
    if (match) {
      return { id: match.id, first_name: match.first_name, last_name: match.last_name, email: match.email ?? null };
    }
    if (page >= data.pagination.total_pages) return null;
    page += 1;
  }
}
