import { contextBridge, ipcRenderer } from 'electron';

// 일렉트론 앱에서 실행 중임을 표시하는 클래스를 body에 추가
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron-app');
});

// 렌더러 프로세스에 노출할 API 정의
contextBridge.exposeInMainWorld('electron', {
  // IPC 통신 API
  ipcRenderer: {
    // 비동기 메시지 전송 및 응답 수신
    invoke: (channel: string, ...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },

    // 이벤트 리스너 등록
    on: (channel: string, listener: (...args: unknown[]) => void) => {
      ipcRenderer.on(channel, (_event, ...args) => listener(...args));
      return () => {
        ipcRenderer.removeListener(channel, listener);
      };
    },

    // 단방향 메시지 전송
    send: (channel: string, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args);
    }
  }
});
