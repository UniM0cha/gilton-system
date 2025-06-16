import { create } from 'zustand';

export type Role = 'session' | 'leader' | 'pastor';

interface ProfileState {
  nickname: string;
  role: Role;
  setProfile: (nickname: string, role: Role) => void;
}

export const useProfile = create<ProfileState>(set => ({
  nickname: '',
  role: 'session',
  setProfile: (nickname, role) => set({ nickname, role })
}));
