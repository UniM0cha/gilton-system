import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProfileStore from '../stores/useProfileStore';
import useSocket from '../hooks/useSocket';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const { isConnected, register } = useSocket();

  // Register profile with server if connected and profile exists
  useEffect(() => {
    if (isConnected && profile) {
      register(profile);
    }
  }, [isConnected, profile, register]);

  // Redirect to setup if no profile
  useEffect(() => {
    if (!profile) {
      navigate('/setup');
    }
  }, [profile, navigate]);

  if (!profile) {
    return null; // Will redirect to setup
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">길튼 시스템</h1>
      <p className="text-xl mb-8">교회 찬양팀 예배 진행 지원 시스템</p>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">{profile.icon}</span>
        <div className="text-left">
          <p className="font-medium">{profile.nickname}</p>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link 
          to="/worship" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-4 rounded-lg text-lg font-medium"
        >
          예배 시작하기
        </Link>

        <Link 
          to="/setup" 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-4 rounded-lg text-lg font-medium"
        >
          프로필 설정
        </Link>
      </div>

      <div className="mt-12 text-sm text-muted-foreground">
        <p>동일한 Wi-Fi 네트워크에 연결되어 있어야 합니다.</p>
        <p>서버 상태: 
          <span className={isConnected ? "text-green-500" : "text-destructive"}>
            {isConnected ? ' 연결됨' : ' 연결 안됨'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default HomePage;
