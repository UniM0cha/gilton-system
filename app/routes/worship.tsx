import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSheetCanvas } from '~/hooks/useSheetCanvas';
import { useSocket } from '~/hooks/useSocket';
import { useProfileStore } from '~/stores/useProfileStore';
import type { Command, Sheet } from '~/types/worship';

export default function WorshipPage() {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const [currentSheet, setCurrentSheet] = useState<Sheet | null>(null);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);

  const socket = useSocket('http://localhost:3000'); // 실제 서버 URL로 변경 필요
  const { containerRef } = useSheetCanvas({
    socket,
    sheetId: currentSheet?.id || '',
    isDrawMode,
  });

  useEffect(() => {
    if (!profile) {
      navigate('/profile');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on('sheet:current', (sheet: Sheet) => {
      setCurrentSheet(sheet);
    });

    socket.on('command:receive', (command: Command) => {
      setCommands((prev) => [...prev, command]);
      // 3초 후 명령 제거
      setTimeout(() => {
        setCommands((prev) => prev.filter((cmd) => cmd.id !== command.id));
      }, 3000);
    });

    return () => {
      socket.off('sheet:current');
      socket.off('command:receive');
    };
  }, [socket]);

  const sendCommand = (type: Command['type'], payload: Command['payload']) => {
    if (!socket || !profile) return;

    const command: Command = {
      id: crypto.randomUUID(),
      type,
      payload,
      sentBy: profile.id,
      sentAt: new Date().toISOString(),
    };

    socket.emit('command:send', command);
  };

  const canSendCommands = profile?.role === 'leader' || profile?.role === 'pastor';

  return (
    <div className="h-screen w-screen bg-gray-100 flex">
      {/* 좌측 악보 목록 패널 */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">악보 목록</h2>
        {/* 악보 목록 구현 예정 */}
      </div>

      {/* 메인 악보 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 툴바 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <button
              className={`px-4 py-2 rounded ${isDrawMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setIsDrawMode(!isDrawMode)}
            >
              {isDrawMode ? '보기 모드' : '그리기 모드'}
            </button>
          </div>

          {canSendCommands && (
            <div className="flex items-center space-x-2">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() =>
                  sendCommand('CUSTOM', {
                    text: '다음 절',
                    icon: '⏭️',
                  })
                }
              >
                다음 절
              </button>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() =>
                  sendCommand('CUSTOM', {
                    text: '반복',
                    icon: '🔄',
                  })
                }
              >
                반복
              </button>
            </div>
          )}
        </div>

        {/* 악보 캔버스 */}
        <div className="flex-1 relative">
          <canvas ref={containerRef} className="w-full h-full">
            {currentSheet && (
              <img src={currentSheet.imageUrl} alt={currentSheet.title} className="w-full h-full object-contain" />
            )}
          </canvas>

          {/* 명령 오버레이 */}
          <div className="absolute top-4 right-4 space-y-2">
            {commands.map((command) => (
              <div
                key={command.id}
                className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {command.payload.icon && <span className="text-2xl">{command.payload.icon}</span>}
                <span>{command.payload.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
