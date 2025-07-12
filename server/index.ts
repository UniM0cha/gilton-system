import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { getProfiles, createProfile } from './profileStore';

export function startServer(userDataPath: string) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/profiles', async (_req, res) => {
    const profiles = await getProfiles(userDataPath);
    res.json(profiles);
  });

  app.post('/profiles', async (req, res) => {
    const { name, role, icon, commands } = req.body ?? {};
    if (!name || !role) {
      res.status(400).json({ error: 'name and role required' });
      return;
    }
    const profile = await createProfile(userDataPath, {
      name,
      role,
      icon,
      commands,
    });
    res.status(201).json(profile);
  });

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  const dataPath = process.env.USER_DATA_PATH || join(process.cwd(), 'data');
  startServer(dataPath);
}
