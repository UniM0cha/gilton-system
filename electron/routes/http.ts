import * as path from 'path';
import * as fs from 'fs';
import express from 'express';
import { app } from 'electron';
import cors from 'cors';
import { sheetsDir, sheetsPath } from '@server/paths';
import { SheetDto, SheetsResponseDto, SheetUploadRequestDto, SheetUploadResponseDto } from '@shared/types/dtos';
import { httpCorsOptions } from '@server/config/cors';

// HTTP 라우팅 모듈

// Express 앱 초기화
export const createHttpRoutes = () => {
  const expressApp = express();
  // CORS 미들웨어 추가 (공유 설정 사용)
  expressApp.use(cors(httpCorsOptions));

  // OPTIONS 요청에 대한 CORS 프리플라이트 응답 처리
  expressApp.options('*', cors(httpCorsOptions));

  // Parse JSON request bodies
  expressApp.use(express.json({ limit: '50mb' }));

  // 악보 파일 제공
  expressApp.use('/sheets', express.static(sheetsDir));

  // API 라우트
  expressApp.get('/api/status', (_req, res) => {
    res.json({ status: 'ok', version: app.getVersion() });
  });

  // 모든 악보 가져오기
  expressApp.get('/api/sheets', (_req, res) => {
    try {
      const sheetsData = JSON.parse(fs.readFileSync(sheetsPath, 'utf-8')) as SheetsResponseDto;
      res.json(sheetsData);
    } catch (error) {
      console.error('악보 데이터 읽기 오류:', error);
      res.status(500).json({ error: '악보 데이터를 읽는데 실패했습니다' });
    }
  });

  // 악보 업로드 API
  expressApp.post('/api/upload-sheet', async (req, res) => {
    try {
      const uploadRequest = req.body as SheetUploadRequestDto;
      const { title, date, serviceType, fileName, imageData } = uploadRequest;

      if (!title || !date || !serviceType || !fileName || !imageData) {
        const response: SheetUploadResponseDto = {
          success: false,
          error: '필수 필드가 누락되었습니다',
        };
        return res.status(400).json(response);
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
      const sheetsData = JSON.parse(await fs.promises.readFile(sheetsPath, 'utf-8')) as SheetsResponseDto;
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const newSheet: SheetDto = {
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
      const response: SheetUploadResponseDto = {
        success: true,
        sheet: newSheet,
      };
      res.json(response);
    } catch (error) {
      console.error('악보 업로드 API 오류:', error);
      const response: SheetUploadResponseDto = {
        success: false,
        error: (error as Error).message,
      };
      res.status(500).json(response);
    }
  });

  return expressApp;
};
