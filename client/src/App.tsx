import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">홈</Link> | <Link to="/about">소개</Link>
      </nav>
      <Outlet />
    </div>
  )
}
