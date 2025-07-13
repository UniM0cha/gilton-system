import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>프로필 선택</CardTitle>
        <CardDescription>프로필을 선택하거나 새로 만드세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {profiles?.map((p: Profile) => (
            <li key={p.id}>
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => setProfile(p)}
              >
                {p.name} ({p.role})
              </Button>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">역할</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="세션 사용자">세션 사용자</option>
              <option value="인도자">인도자</option>
              <option value="목사님">목사님</option>
            </select>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              mutation.mutate({ name, role });
              setName("");
            }}
          >
            생성
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
