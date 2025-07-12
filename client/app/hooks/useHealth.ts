import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/queryKeys";

export function useHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/health");
      return (await res.json()) as { status: string };
    },
  });
}
