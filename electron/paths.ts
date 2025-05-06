import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

// 중앙 집중식 경로 정의 파일
// Centralized path definitions

// 애플리케이션 루트 디렉토리 (Gilton-system 폴더)
export const appRootDir = path.join(app.getAppPath(), '..');

// 데이터 디렉토리 및 관련 경로
export const dataDir = path.join(appRootDir, 'data');
export const sheetsDir = path.join(dataDir, 'sheets');

// JSON 파일 경로
export const profilesPath = path.join(dataDir, 'profiles.json');
export const commandsPath = path.join(dataDir, 'commands.json');
export const sessionsPath = path.join(dataDir, 'sessions.json');
export const sheetsPath = path.join(dataDir, 'sheets.json');

// 경로 초기화 함수 - 필요한 디렉토리가 존재하지 않으면 생성
export const ensureDirectoriesExist = () => {
  // 데이터 디렉토리 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 악보 디렉토리 생성
  if (!fs.existsSync(sheetsDir)) {
    fs.mkdirSync(sheetsDir, { recursive: true });
  }
};
