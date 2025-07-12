import type { Profile } from "../store";

const API_BASE = "http://localhost:3000";

export async function fetchProfiles(): Promise<Profile[]> {
  const res = await fetch(`${API_BASE}/profiles`);
  if (!res.ok) throw new Error("failed to fetch");
  return (await res.json()) as Profile[];
}

export async function postProfile(
  profile: Omit<Profile, "id">,
): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("failed to create");
  return (await res.json()) as Profile;
}
