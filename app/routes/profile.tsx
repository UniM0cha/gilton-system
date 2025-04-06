import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useProfileStore } from '~/stores/useProfileStore';
import type { UserProfile, UserRole } from '~/types/user';

const ROLE_LABELS: Record<UserRole, string> = {
  session: '세션',
  leader: '인도자',
  pastor: '목사님',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useProfileStore();
  const [name, setName] = useState(profile?.name || '');
  const [role, setRole] = useState<UserRole>(profile?.role || 'session');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProfile: UserProfile = {
      id: profile?.id || crypto.randomUUID(),
      name,
      role,
      icon: '🎵', // 기본 아이콘
      favoriteCommands: [],
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProfile(newProfile);
    navigate('/worship');
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">프로필 설정</h2>
          <p className="mt-2 text-center text-sm text-gray-600">예배에 참여하기 위한 프로필을 설정해주세요</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                역할
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {profile ? '프로필 업데이트' : '프로필 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
