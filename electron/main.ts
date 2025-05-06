import { app } from 'electron';
import * as http from 'http';
import { createHttpRoutes } from './routes/http';
import { setupWebSocketServer } from './routes/websocket';
import { initDataFiles, setupIpcHandlers } from './routes/ipc';
import { setupAppHandlers } from './window';

// 메인 애플리케이션 파일

// 데이터 파일 초기화
initDataFiles();

// Express 앱 생성
const expressApp = createHttpRoutes();

// HTTP API 서버 생성 (포트 3001)
const httpServer = http.createServer(expressApp);
const PORT = process.env.ELECTRON_SERVER_PORT || 3001;

// WebSocket 서버를 동일한 HTTP 서버에 설정
const io = setupWebSocketServer(httpServer);

// IPC 핸들러 설정
setupIpcHandlers(io);

// Electron 앱 이벤트 핸들러 설정
setupAppHandlers();

// 서버 시작 (HTTP API와 WebSocket 모두 동일한 포트에서 실행)
httpServer.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다 (HTTP API 및 WebSocket)`);
});

// 앱 종료 시 서버 종료
app.on('before-quit', () => {
  httpServer.close();
});
