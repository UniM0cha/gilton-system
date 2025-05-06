import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';

// Electron 윈도우 관리 모듈

// 메인 윈도우 참조 유지
let mainWindow: BrowserWindow | null = null;

// 윈도우 생성 함수
export const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 관리자 페이지 로드
  // 개발 환경과 프로덕션 환경 모두 React Router를 사용하도록 설정
  const adminUrl = isDev ? 'http://localhost:3000/admin' : 'http://localhost:3001/admin'; // 프로덕션에서도 웹 서버 사용

  mainWindow.loadURL(adminUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
};

// Electron 앱 이벤트 핸들러 설정
export const setupAppHandlers = () => {
  // Electron이 준비되면 윈도우 생성
  app.whenReady().then(createWindow);

  // 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
};
