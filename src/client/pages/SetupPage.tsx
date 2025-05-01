import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProfileStore from '../stores/useProfileStore';
import useSocket, { Profile } from '../hooks/useSocket';

// User role type
type UserRole = '세션' | '인도자' | '목사님';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile: savedProfile, setProfile: saveProfile } = useProfileStore();
  const { isConnected, register } = useSocket();

  // Local state for profile
  const [profile, setProfile] = useState<Profile>({
    nickname: '',
    role: '세션',
    icon: '🎸',
    favoriteCommands: [],
  });

  // Load saved profile if exists
  useEffect(() => {
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, [savedProfile]);

  // Icons
  const icons = ['🎸', '🎹', '🥁', '🎤', '🎷', '🎺', '🎻', '📖'];

  // Available commands
  const availableCommands = ['1️⃣', '2️⃣', '3️⃣', '🔂', '🔁', '▶️', '⏹️', '⏭️', '🔊', '🔉', '👍'];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    // Save profile to store
    saveProfile(profile);

    // Register profile with server if connected
    if (isConnected) {
      register(profile);
    }

    alert('프로필이 저장되었습니다.');
    navigate('/');
  };

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setProfile((prev) => ({ ...prev, role }));
  };

  // Handle icon selection
  const handleIconSelect = (icon: string) => {
    setProfile((prev) => ({ ...prev, icon }));
  };

  // Handle command toggle
  const handleCommandToggle = (command: string) => {
    setProfile((prev) => {
      const commands = prev.favoriteCommands.includes(command)
        ? prev.favoriteCommands.filter((c) => c !== command)
        : [...prev.favoriteCommands, command];
      return { ...prev, favoriteCommands: commands };
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <Link to="/" className="text-sm font-medium">
          ← 홈으로
        </Link>
        <h1 className="text-lg font-semibold">프로필 설정</h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname */}
          <div className="space-y-2">
            <label className="text-sm font-medium">닉네임</label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile((prev) => ({ ...prev, nickname: e.target.value }))}
              className="w-full p-2 border border-input rounded-md"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">역할</label>
            <div className="flex gap-2">
              {(['세션', '인도자', '목사님'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`flex-1 py-2 rounded-md ${
                    profile.role === role
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                  onClick={() => handleRoleChange(role)}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.role === '세션' && '세션은 명령을 받기만 할 수 있습니다.'}
              {profile.role === '인도자' && '인도자는 명령을 보내고 받을 수 있습니다.'}
              {profile.role === '목사님' && '목사님은 모든 권한을 가집니다.'}
            </p>
          </div>

          {/* Icon selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">아이콘</label>
            <div className="grid grid-cols-4 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`aspect-square flex items-center justify-center text-2xl rounded-md ${
                    profile.icon === icon
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                  onClick={() => handleIconSelect(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite commands */}
          <div className="space-y-2">
            <label className="text-sm font-medium">자주 쓰는 명령</label>
            <div className="grid grid-cols-5 gap-2">
              {availableCommands.map((command) => (
                <button
                  key={command}
                  type="button"
                  className={`aspect-square flex items-center justify-center text-xl rounded-md ${
                    profile.favoriteCommands.includes(command)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                  onClick={() => handleCommandToggle(command)}
                >
                  {command}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium">
            저장하기
          </button>

          {/* Reset button */}
          <button
            type="button"
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-md font-medium"
            onClick={() =>
              setProfile({
                nickname: '',
                role: '세션',
                icon: '🎸',
                favoriteCommands: [],
              })
            }
          >
            초기화
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
