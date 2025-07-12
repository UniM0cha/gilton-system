import { app, BrowserWindow } from 'electron';
import { startServer } from './index';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:5173/admin');
}

app.whenReady().then(() => {
  const dataPath = app.getPath('userData');
  startServer(dataPath);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
