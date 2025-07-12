import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useProfileStore, type Profile } from "../store";
import { fetchProfiles, postProfile } from "../lib/api";

export default function Home() {
  const { setProfile } = useProfileStore();
  const queryClient = useQueryClient();
  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
  });

  const mutation = useMutation({
    mutationFn: postProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const [name, setName] = useState("");
  const [role, setRole] = useState("세션 사용자");

  return (
    <div className="space-y-4">
      <h1>프로필 선택</h1>
      <ul className="space-y-2">
        {profiles?.map((p: Profile) => (
          <li key={p.id}>
            <Button onClick={() => setProfile(p)}>{p.name} ({p.role})</Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-4">새 프로필 생성</h2>
      <div className="flex gap-2">
        <input
          className="border p-2"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="border p-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="세션 사용자">세션 사용자</option>
          <option value="인도자">인도자</option>
          <option value="목사님">목사님</option>
        </select>
        <Button
          onClick={() => {
            mutation.mutate({ name, role });
            setName("");
          }}
        >
          생성
        </Button>
      </div>
    </div>
  );
}
