import { Link, Route, Routes } from 'react-router-dom'
import { useCounterStore } from './store'

function Home() {
  const { count, inc } = useCounterStore()
  return (
    <div>
      <h1>홈 페이지</h1>
      <p>카운트: {count}</p>
      <button onClick={inc}>증가</button>
    </div>
  )
}

function About() {
  return <h1>소개 페이지</h1>
}

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">홈</Link> | <Link to="/about">소개</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}
