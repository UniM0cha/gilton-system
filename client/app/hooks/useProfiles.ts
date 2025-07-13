import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "~/lib/api";
import { QueryKeys } from "~/queryKeys";

export interface Profile {
  id: string;
  name: string;
  role: string;
  icon?: string;
  commands?: string[];
}

export function useProfiles() {
  return useQuery({
    queryKey: QueryKeys.PROFILES,
    queryFn: async () => {
      const res = await apiClient.get<Profile[]>("/profiles");
      return res.data;
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      const res = await apiClient.post<Profile>("/profiles", profile);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QueryKeys.PROFILES });
    },
  });
}
