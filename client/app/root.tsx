import { Link, Outlet } from "react-router";

export default function Root() {
  return (
    <div>
      <nav>
        <Link to="/">홈</Link> | <Link to="/about">소개</Link> | <Link to="/admin">관리자</Link>
      </nav>
      <Outlet />
    </div>
  );
}
