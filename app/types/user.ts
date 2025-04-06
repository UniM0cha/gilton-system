export type UserRole = 'session' | 'leader' | 'pastor';

export interface Command {
  id: string;
  icon: string;
  text: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  icon: string;
  favoriteCommands: Command[];
  createdAt: string;
  updatedAt: string;
}
