import express from "express";
import type { Server } from "http";
import cors from "cors";
import path from "path";
import { createProfile, getProfiles } from "./profileStore";

const app = express();
const port = Number(process.env.PORT) || 3000;

let server: Server | null = null;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export function startServer(userDataPath: string): Promise<Server> {
  app.get("/profiles", async (_req, res) => {
    const profiles = await getProfiles(userDataPath);
    res.json(profiles);
  });

  app.post("/profiles", async (req, res) => {
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

  if (process.env.NODE_ENV === "production") {
    const clientPath = path.join(__dirname, "../../client/build/client");
    app.use(express.static(clientPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientPath, "index.html"));
    });
  }

  return new Promise((resolve, reject) => {
    if (server) {
      resolve(server);
      return;
    }

    server = app
      .listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
        resolve(server!);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

export function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log("Server stopped");
      server = null;
      resolve();
    });
  });
}

export { app };
