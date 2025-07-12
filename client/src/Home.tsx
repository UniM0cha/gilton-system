import { useCounterStore } from './store'

export default function Home() {
  const { count, inc } = useCounterStore()
  return (
    <div>
      <h1>홈 페이지</h1>
      <p>카운트: {count}</p>
      <button onClick={inc}>증가</button>
    </div>
  )
}
