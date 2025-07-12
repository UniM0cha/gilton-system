import axios from "axios";
import type { Profile } from "../store";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://localhost:3000",
});

export async function fetchProfiles(): Promise<Profile[]> {
  const res = await apiClient.get<Profile[]>("/profiles");
  return res.data;
}

export async function postProfile(
  profile: Omit<Profile, "id">,
): Promise<Profile> {
  const res = await apiClient.post<Profile>("/profiles", profile);
  return res.data;
}
