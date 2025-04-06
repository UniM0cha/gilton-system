import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { createServer } from './server';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 개발 모드에서는 React 개발 서버를, 프로덕션에서는 빌드된 파일을 로드
  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(join(__dirname, '../build/client/index.html'));
  }
}

app.whenReady().then(async () => {
  // Express + Socket.IO 서버 시작
  const server = await createServer();
  console.log('서버가 시작되었습니다: http://localhost:3000');

  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});