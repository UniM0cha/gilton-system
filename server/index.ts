import express from "express";
import type { Server } from "http";
import cors from "cors";
import path from "path";
import { createProfileRoutes } from "./routes/profileRoutes";
import { createHealthRoutes } from "./routes/healthRoutes";

const app = express();
const port = Number(process.env.PORT) || 3000;

let server: Server | null = null;

app.use(cors());
app.use(express.json());

function setupRoutes(userDataPath: string) {
  app.use("/health", createHealthRoutes());
  app.use("/profiles", createProfileRoutes(userDataPath));
}

export function startServer(userDataPath: string): Promise<Server> {
  if (!server) {
    setupRoutes(userDataPath);
  }

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
