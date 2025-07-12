import { app, BrowserWindow } from "electron";
import { startServer, stopServer } from "./index";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
    },
  });
  const url = app.isPackaged
    ? "http://localhost:3000/admin"
    : "http://localhost:5173/admin";
  win.loadURL(url);
}

app.whenReady().then(async () => {
  const dataPath = app.getPath("userData");
  await startServer(dataPath);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  void stopServer();
});
