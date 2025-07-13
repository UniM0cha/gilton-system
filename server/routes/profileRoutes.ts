import { Router } from "express";
import { createProfile, getProfiles } from "../profileStore";

export function createProfileRoutes(userDataPath: string) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const profiles = await getProfiles(userDataPath);
    res.json(profiles);
  });

  router.post("/", async (req, res) => {
    const { name, role, icon, commands } = req.body ?? {};
    if (!name || !role) {
      res.status(400).json({ error: "name and role required" });
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

  return router;
}
