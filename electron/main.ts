/* eslint-disable no-console */
import { app } from 'electron';
import * as http from 'http';

// 모듈 가져오기
import { createHttpRoutes } from './routes/http';
import { setupWebSocketServer } from './routes/websocket';
import { initDataFiles, setupIpcHandlers } from './routes/ipc';
import { setupAppHandlers } from './window';

// 메인 애플리케이션 파일

// 데이터 파일 초기화
initDataFiles();

// Express 앱 생성
const expressApp = createHttpRoutes();

// HTTP 서버 생성
const server = http.createServer(expressApp);

// 웹소켓 서버 설정
const io = setupWebSocketServer(server);

// IPC 핸들러 설정
setupIpcHandlers(io);

// Electron 앱 이벤트 핸들러 설정
setupAppHandlers();

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});

// 앱 종료 시 서버 종료
app.on('before-quit', () => {
  server.close();
});
