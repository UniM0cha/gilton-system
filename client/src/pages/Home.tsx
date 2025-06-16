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
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">프로필 선택</h1>
      <input
        className="border px-2"
        placeholder="닉네임"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
      />
      <select
        className="border px-2"
        value={role}
        onChange={e => setRole(e.target.value as Role)}
      >
        <option value="session">세션 사용자</option>
        <option value="leader">인도자</option>
        <option value="pastor">목사님</option>
      </select>
      <button className="border px-2" onClick={submit}>
        시작
      </button>
    </div>
  );
};

export default Home;
