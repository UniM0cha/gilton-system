/* eslint-disable no-console */
import * as path from 'path';
import * as fs from 'fs';
import express from 'express';
import { app } from 'electron';
import isDev from 'electron-is-dev';
import cors from 'cors';

// HTTP 라우팅 모듈

// 데이터 디렉토리 정의
// 애플리케이션 루트 디렉토리 (Gilton-system 폴더)
const appRootDir = path.join(app.getAppPath(), '..');
const dataDir = path.join(appRootDir, 'data');
const sheetsDir = path.join(dataDir, 'sheets');
const sheetsPath = path.join(dataDir, 'sheets.json');

// Express 앱 초기화
export const createHttpRoutes = () => {
  const expressApp = express();

  // CORS 미들웨어 추가
  expressApp.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  // 프로덕션 환경에서 클라이언트 빌드 디렉토리의 정적 파일 제공
  if (!isDev) {
    expressApp.use(express.static(path.join(__dirname, '../client')));

    // 모든 경로에서 index.html 제공 (React Router를 위함)
    expressApp.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../client/index.html'));
    });
  }

  // 악보 파일 제공
  expressApp.use('/sheets', express.static(sheetsDir));

  // API 라우트
  expressApp.get('/api/status', (_req, res) => {
    res.json({ status: 'ok', version: app.getVersion() });
  });

  // 모든 악보 가져오기
  expressApp.get('/api/sheets', (_req, res) => {
    try {
      const sheetsData = JSON.parse(fs.readFileSync(sheetsPath, 'utf-8'));
      res.json(sheetsData);
    } catch (error) {
      console.error('악보 데이터 읽기 오류:', error);
      res.status(500).json({ error: '악보 데이터를 읽는데 실패했습니다' });
    }
  });

  // 악보 업로드 API
  expressApp.post('/api/upload-sheet', express.json({limit: '50mb'}), async (req, res) => {
    try {
      const { title, date, serviceType, fileName, imageData } = req.body;

      if (!title || !date || !serviceType || !fileName || !imageData) {
        return res.status(400).json({ success: false, error: '필수 필드가 누락되었습니다' });
      }

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
      const formattedDate = new Date(date).toISOString().split('T')[0];
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

      // 성공 응답
      res.json({ success: true, sheet: newSheet });
    } catch (error) {
      console.error('악보 업로드 API 오류:', error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  return expressApp;
};
