import { create } from "zustand";

interface CounterState {
  count: number;
  inc: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

export interface Profile {
  id: string;
  name: string;
  role: string;
  icon?: string;
  commands?: string[];
}

interface ProfileState {
  profile?: Profile;
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: undefined,
  setProfile: (profile) => set({ profile }),
}));
