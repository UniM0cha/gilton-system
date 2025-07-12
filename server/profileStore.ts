import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface Profile {
  id: string;
  name: string;
  role: string;
  icon?: string;
  commands?: string[];
}

function filePath(dir: string) {
  return join(dir, 'profiles.json');
}

async function readProfiles(dir: string): Promise<Profile[]> {
  try {
    const data = await fs.readFile(filePath(dir), 'utf-8');
    return JSON.parse(data) as Profile[];
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function writeProfiles(dir: string, profiles: Profile[]) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath(dir), JSON.stringify(profiles, null, 2));
}

export async function getProfiles(dir: string): Promise<Profile[]> {
  return readProfiles(dir);
}

export async function createProfile(
  dir: string,
  profile: Omit<Profile, 'id'>,
): Promise<Profile> {
  const profiles = await readProfiles(dir);
  const newProfile: Profile = { id: randomUUID(), ...profile };
  profiles.push(newProfile);
  await writeProfiles(dir, profiles);
  return newProfile;
}
