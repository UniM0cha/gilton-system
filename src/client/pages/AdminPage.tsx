/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Types
interface Profile {
  nickname: string;
  role: string;
  icon: string;
  favoriteCommands: string[];
}

interface User {
  id: string;
  profile: Profile;
  connectedAt: string;
}

interface Command {
  emoji: string;
  text: string;
}

const AdminPage: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Connect to WebSocket server
  useEffect(() => {
    // Connect to the same host (in development, this will be localhost:3000)
    const newSocket = io(window.location.origin);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');

      // Register as admin
      newSocket.emit('register-admin');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    // Listen for user updates
    newSocket.on('users', (updatedUsers: User[]) => {
      console.log('Users updated:', updatedUsers);
      setUsers(updatedUsers);
    });

    // Listen for sheet changes
    newSocket.on('sheet-change', (data: { sheetId: string }) => {
      console.log('Sheet changed:', data);
      setCurrentSheet(data.sheetId);
    });

    // Listen for commands
    newSocket.on('command', (data: { command: Command, sender: Profile }) => {
      console.log('Command received:', data);
      // Could add to a command history if needed
    });

    // Socket is set up and ready

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Load data from Electron (via IPC)
  useEffect(() => {
    // In a real implementation, this would use IPC to load data from JSON files
    // For now, we'll just simulate it
    const loadData = async () => {
      try {
        // This would be replaced with actual IPC calls in the Electron app
        // const commands = await window.electron.readJson('commands.json');
        // const sessions = await window.electron.readJson('sessions.json');

        // Simulated data for now
        setCommands([
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
          { emoji: '👍', text: '좋음' }
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Reset data
  const handleResetProfiles = () => {
    // In a real implementation, this would use IPC to reset the profiles.json file
    if (window.confirm('정말로 모든 프로필을 초기화하시겠습니까?')) {
      console.log('Profiles reset');
      alert('프로필이 초기화되었습니다.');
    }
  };

  const handleResetCommands = () => {
    // In a real implementation, this would use IPC to reset the commands.json file
    if (window.confirm('정말로 모든 명령을 초기화하시겠습니까?')) {
      console.log('Commands reset');
      alert('명령이 초기화되었습니다.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">길튼 시스템 관리자</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm">서버 상태:</span>
            <span className={`inline-block w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-sm">{connectionStatus === 'connected' ? '연결됨' : '연결 안됨'}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connected users */}
        <section className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">접속 중인 사용자</h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground">접속 중인 사용자가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="text-2xl">{user.profile.icon}</span>
                  <div>
                    <p className="font-medium">{user.profile.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.profile.role} · {new Date(user.connectedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Current status */}
        <section className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">현재 상태</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">현재 악보</h3>
              <p className="text-muted-foreground">
                {currentSheet ? `악보 ID: ${currentSheet}` : '선택된 악보 없음'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">최근 명령</h3>
              <p className="text-muted-foreground">최근 명령 없음</p>
            </div>
          </div>
        </section>

        {/* Commands */}
        <section className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">명령 목록</h2>
          <div className="grid grid-cols-2 gap-2">
            {commands.map(command => (
              <div key={command.emoji} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="text-2xl">{command.emoji}</span>
                <span>{command.text}</span>
              </div>
            ))}
          </div>
          <button 
            className="mt-4 w-full py-2 bg-secondary text-secondary-foreground rounded"
            onClick={handleResetCommands}
          >
            명령 초기화
          </button>
        </section>

        {/* Settings */}
        <section className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">설정</h2>
          <div className="space-y-4">
            <button 
              className="w-full py-2 bg-destructive text-destructive-foreground rounded"
              onClick={handleResetProfiles}
            >
              프로필 초기화
            </button>

            <div>
              <h3 className="text-lg font-medium">서버 정보</h3>
              <p className="text-sm text-muted-foreground">URL: {window.location.origin}</p>
              <p className="text-sm text-muted-foreground">접속자 수: {users.length}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
