// Electron API 타입 정의
interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    on: (channel: string, listener: (...args: unknown[]) => void) => () => void;
    send: (channel: string, ...args: unknown[]) => void;
  };
}

// Window 객체에 electron 속성 추가
interface Window {
  electron: ElectronAPI;
}
