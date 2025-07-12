import { Link, Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./globals.css";

if (typeof window !== "undefined") {
  import("./pwa");
}

const queryClient = new QueryClient();

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <nav>
          <Link to="/">홈</Link> | <Link to="/about">소개</Link> | <Link to="/admin">관리자</Link>
        </nav>
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}
