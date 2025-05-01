/* eslint-disable no-console */
import * as path from 'path';
import * as fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { app } from 'electron';

// 웹소켓 라우팅 모듈

// 데이터 디렉토리 정의
const dataDir = path.join(app.getPath('userData'), 'data');
const sheetsPath = path.join(dataDir, 'sheets.json');

// 웹소켓 서버 생성 및 이벤트 핸들러 설정
export const setupWebSocketServer = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // 소켓 연결 처리
  io.on('connection', (socket) => {
    console.log('클라이언트 연결됨:', socket.id);

    // 프로필 등록 처리
    socket.on('register', (profile) => {
      console.log('프로필 등록됨:', profile);

      // 연결된 사용자에 추가
      socket.data.profile = profile;

      // 관리자에게 업데이트된 사용자 목록 전송
      io.to('admin').emit(
        'users',
        Array.from(io.sockets.sockets.values())
          .filter((s) => s.data.profile)
          .map((s) => ({
            id: s.id,
            profile: s.data.profile,
            connectedAt: s.data.connectedAt || new Date(),
          })),
      );

      // 클라이언트에게 현재 악보 목록 전송
      try {
        const sheetsData = JSON.parse(fs.readFileSync(sheetsPath, 'utf-8'));
        socket.emit('sheets', sheetsData.sheets);
      } catch (error) {
        console.error('클라이언트용 악보 읽기 오류:', error);
      }
    });

    // 관리자 등록 처리
    socket.on('register-admin', () => {
      console.log('관리자 등록됨');
      socket.join('admin');

      // 관리자에게 현재 사용자 목록 전송
      socket.emit(
        'users',
        Array.from(io.sockets.sockets.values())
          .filter((s) => s.data.profile)
          .map((s) => ({
            id: s.id,
            profile: s.data.profile,
            connectedAt: s.data.connectedAt || new Date(),
          })),
      );

      // 관리자에게 현재 악보 목록 전송
      try {
        const sheetsData = JSON.parse(fs.readFileSync(sheetsPath, 'utf-8'));
        socket.emit('sheets', sheetsData.sheets);
      } catch (error) {
        console.error('관리자용 악보 읽기 오류:', error);
      }
    });

    // 악보 변경 처리
    socket.on('sheet-change', (data) => {
      console.log('악보 변경됨:', data);
      socket.broadcast.emit('sheet-change', data);
    });

    // 그림 업데이트 처리
    socket.on('drawing-update', (data) => {
      console.log('그림 업데이트됨');
      socket.broadcast.emit('drawing-update', data);
    });

    // 명령 전송 처리
    socket.on('command', (command) => {
      if (!socket.data.profile) return;

      const { role } = socket.data.profile;
      // 인도자와 목사님만 명령을 보낼 수 있음
      if (role === '인도자' || role === '목사님') {
        console.log('명령 전송됨:', command);
        socket.broadcast.emit('command', {
          command,
          sender: socket.data.profile,
        });
      }
    });

    // 연결 해제 처리
    socket.on('disconnect', () => {
      console.log('클라이언트 연결 해제됨:', socket.id);

      // 관리자에게 업데이트된 사용자 목록 전송
      io.to('admin').emit(
        'users',
        Array.from(io.sockets.sockets.values())
          .filter((s) => s.data.profile)
          .map((s) => ({
            id: s.id,
            profile: s.data.profile,
            connectedAt: s.data.connectedAt || new Date(),
          })),
      );
    });

    // 악보 목록 요청 처리
    socket.on('get-sheets', () => {
      try {
        const sheetsData = JSON.parse(fs.readFileSync(sheetsPath, 'utf-8'));
        socket.emit('sheets', sheetsData.sheets);
      } catch (error) {
        console.error('악보 목록 요청 처리 오류:', error);
        socket.emit('sheets', []);
      }
    });

    // 연결 시간 기록
    socket.data.connectedAt = new Date();
  });

  return io;
};
