import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types/user';

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'gilton-profile-storage',
    }
  )
);
