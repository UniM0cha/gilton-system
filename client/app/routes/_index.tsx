import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useCounterStore } from "../store";

function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/health");
      return (await res.json()) as { status: string };
    },
  });
}

export default function Home() {
  const { count, inc } = useCounterStore();
  const { data } = useHealth();
  return (
    <div>
      <h1>홈 페이지</h1>
      <p>카운트: {count}</p>
      <Button onClick={inc}>증가</Button>
      <pre>{data ? JSON.stringify(data) : "로딩 중..."}</pre>
    </div>
  );
}
