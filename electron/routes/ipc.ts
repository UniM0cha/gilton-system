/* eslint-disable no-console */
import * as path from 'path';
import * as fs from 'fs';
import { ipcMain, app, shell } from 'electron';
import { format } from 'date-fns';
import { Server as SocketIOServer } from 'socket.io';

// IPC 라우팅 모듈

// JSON 데이터 타입 정의
interface JsonData {
  profiles?: Array<Record<string, unknown>>;
  commands?: Array<{ emoji: string; text: string }>;
  sessions?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

// 데이터 디렉토리 정의
// 애플리케이션 루트 디렉토리 (Gilton-system 폴더)
const appRootDir = path.join(app.getAppPath(), '..');
const dataDir = path.join(appRootDir, 'data');
const sheetsDir = path.join(dataDir, 'sheets');
const profilesPath = path.join(dataDir, 'profiles.json');
const commandsPath = path.join(dataDir, 'commands.json');
const sessionsPath = path.join(dataDir, 'sessions.json');
const sheetsPath = path.join(dataDir, 'sheets.json');

// JSON 파일 초기화 함수
const initJsonFile = (filePath: string, defaultData: JsonData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// 데이터 디렉토리 및 기본 JSON 파일 초기화
export const initDataFiles = () => {
  // 데이터 디렉토리 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(sheetsDir)) {
    fs.mkdirSync(sheetsDir, { recursive: true });
  }

  // 기본 JSON 파일 초기화
  initJsonFile(profilesPath, { profiles: [] });
  initJsonFile(commandsPath, {
    commands: [
      { emoji: '1️⃣', text: '1절' },
      { emoji: '2️⃣', text: '2절' },
      { emoji: '3️⃣', text: '3절' },
      { emoji: '🔂', text: '한 번 더 반복' },
      { emoji: '🔁', text: '계속 반복' },
      { emoji: '▶️', text: '시작' },
      { emoji: '⏹️', text: '정지' },
      { emoji: '⏭️', text: '다음 곡' },
      { emoji: '🔊', text: '볼륨 업' },
      { emoji: '🔉', text: '볼륨 다운' },
      { emoji: '👍', text: '좋음' },
    ],
  });
  initJsonFile(sessionsPath, { sessions: [] });
  initJsonFile(sheetsPath, { sheets: [] });
};

// IPC 핸들러 설정
export const setupIpcHandlers = (io: SocketIOServer) => {
  // 데이터 디렉토리 열기 핸들러
  ipcMain.handle('open-data-directory', () => {
    shell.openPath(dataDir);
    return { success: true, path: dataDir };
  });
  // JSON 파일 읽기 핸들러
  ipcMain.handle('read-json', async (_event, filePath) => {
    const fullPath = path.join(dataDir, filePath);
    try {
      const data = await fs.promises.readFile(fullPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`${fullPath} 읽기 오류:`, error);
      return null;
    }
  });

  // JSON 파일 쓰기 핸들러
  ipcMain.handle('write-json', async (_event, filePath, data) => {
    const fullPath = path.join(dataDir, filePath);
    try {
      await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`${fullPath} 쓰기 오류:`, error);
      return false;
    }
  });

  // 악보 업로드 핸들러
  ipcMain.handle('upload-sheet', async (_event, { title, date, serviceType, imageData, fileName }) => {
    try {
      // 악보 고유 ID 생성
      const sheetId = `sheet_${Date.now()}`;

      // 날짜와 예배 종류에 따른 디렉토리 구조 생성
      const servicePath = path.join(sheetsDir, date, serviceType);

      // 디렉토리가 존재하지 않으면 생성
      if (!fs.existsSync(servicePath)) {
        fs.mkdirSync(servicePath, { recursive: true });
      }

      // 파일 확장자 추출
      const fileExt = path.extname(fileName);

      // 악보 ID를 포함한 새 파일명 생성
      const newFileName = `${sheetId}${fileExt}`;
      const filePath = path.join(servicePath, newFileName);

      // 이미지 파일 저장
      const buffer = Buffer.from(imageData.split(',')[1], 'base64');
      await fs.promises.writeFile(filePath, buffer);

      // sheets.json 업데이트
      const sheetsData = JSON.parse(await fs.promises.readFile(sheetsPath, 'utf-8'));
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      const newSheet = {
        id: sheetId,
        title,
        date: formattedDate,
        serviceType,
        fileName: `${formattedDate}/${serviceType}/${newFileName}`, // 상대 경로 저장
        uploadedAt: new Date().toISOString(),
      };

      sheetsData.sheets.push(newSheet);
      await fs.promises.writeFile(sheetsPath, JSON.stringify(sheetsData, null, 2));

      // 모든 클라이언트에게 새 악보 알림
      io.emit('sheets-updated', sheetsData.sheets);

      return { success: true, sheet: newSheet };
    } catch (error) {
      console.error('악보 업로드 오류:', error);
      return { success: false, error: (error as Error).message };
    }
  });
};
