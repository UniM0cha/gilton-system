import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, Role } from '../store/profile';

const Home = () => {
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<Role>('session');
  const setProfile = useProfile(s => s.setProfile);
  const navigate = useNavigate();

  const submit = () => {
    setProfile(nickname, role);
    navigate('/worship');
  };

  return (
    <div>
      <h1>프로필 선택</h1>
      <input
        placeholder="닉네임"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
      />
      <select value={role} onChange={e => setRole(e.target.value as Role)}>
        <option value="session">세션 사용자</option>
        <option value="leader">인도자</option>
        <option value="pastor">목사님</option>
      </select>
      <button onClick={submit}>시작</button>
    </div>
  );
};

export default Home;
