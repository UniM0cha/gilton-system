import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '../hooks/useSocket';

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'gilton-profile',
    },
  ),
);

export default useProfileStore;
