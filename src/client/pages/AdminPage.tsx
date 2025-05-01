/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Types
interface Profile {
  nickname: string;
  role: string;
  icon: string;
  favoriteCommands: string[];
}

// 업로드 결과 인터페이스 정의
interface UploadResult {
  success: boolean;
  sheet?: {
    id: string;
    title: string;
    fileName: string;
    uploadedAt: string;
    date?: string;
    serviceType?: string;
  };
  error?: string;
  path?: string;
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

interface Sheet {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  date?: string;
  serviceType?: string;
}

const AdminPage: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadDate, setUploadDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploadServiceType, setUploadServiceType] = useState<string>('주일 1부예배');
  const [isUploading, setIsUploading] = useState(false);

  // Connect to WebSocket server
  useEffect(() => {
    // In development, connect to port 3001 for WebSocket
    const socketUrl =
      process.env.NODE_ENV === 'production' ? window.location.origin : window.location.origin.replace(/:\d+$/, ':3001');

    const newSocket = io(socketUrl);

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
    newSocket.on('sheet-change', (data: { sheetId: string; pageNumber?: number }) => {
      console.log('Sheet changed:', data);
      setCurrentSheet(data.sheetId);
    });

    // Listen for commands
    newSocket.on('command', (data: { command: Command; sender: Profile }) => {
      console.log('Command received:', data);
      // Could add to a command history if needed
    });

    // Listen for sheet updates
    newSocket.on('sheets', (updatedSheets: Sheet[]) => {
      console.log('Sheets updated:', updatedSheets);
      setSheets(updatedSheets);
    });

    newSocket.on('sheets-updated', (updatedSheets: Sheet[]) => {
      console.log('Sheets updated:', updatedSheets);
      setSheets(updatedSheets);
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
          { emoji: '👍', text: '좋음' },
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

  // 데이터 저장소 디렉토리 열기
  const handleOpenDataDirectory = async () => {
    try {
      if (typeof window.electron !== 'undefined') {
        const result = await window.electron.ipcRenderer.invoke('open-data-directory') as UploadResult;
        if (result.success) {
          console.log('데이터 디렉토리 열기 성공:', result.path);
        } else {
          console.error('데이터 디렉토리 열기 실패');
        }
      } else {
        alert('일렉트론 환경에서만 사용 가능한 기능입니다.');
      }
    } catch (error) {
      console.error('데이터 디렉토리 열기 오류:', error);
    }
  };

  // 파일 업로드 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // 모든 파일이 이미지인지 확인
      const nonImageFiles = files.filter((file) => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        alert('이미지 파일만 업로드 가능합니다 (PNG, JPG)');
        return;
      }

      setUploadFiles(files);
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadTitle.trim() || !uploadDate || !uploadServiceType) {
      alert('제목, 날짜, 예배 종류, 파일을 모두 입력해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      // 각 파일 처리
      for (const file of uploadFiles) {
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = async (event) => {
            if (!event.target || typeof event.target.result !== 'string') {
              reject(new Error('파일 읽기 실패'));
              return;
            }

            const imageData = event.target.result;

            // Electron IPC를 통해 파일 업로드
            try {
              // Electron 환경인지 확인
              if (typeof window.electron !== 'undefined') {
                const result = await window.electron.ipcRenderer.invoke('upload-sheet', {
                  title: uploadTitle,
                  date: uploadDate,
                  serviceType: uploadServiceType,
                  fileName: file.name,
                  imageData
                }) as UploadResult;

                if (result.success) {
                  console.log('악보 업로드 성공:', result.sheet);
                } else {
                  console.error('악보 업로드 실패:', result.error);
                  reject(new Error(result.error || '알 수 없는 오류'));
                  return;
                }
              } else {
                // 브라우저 환경에서는 서버 API를 통해 업로드
                console.log('브라우저 환경에서 업로드 시도:', {
                  title: uploadTitle,
                  date: uploadDate,
                  serviceType: uploadServiceType,
                  fileName: file.name
                });

                // 서버 API를 통한 업로드 로직
                const apiUrl = process.env.NODE_ENV === 'production' 
                  ? '/api/upload-sheet' 
                  : window.location.origin.replace(/:\d+$/, ':3001') + '/api/upload-sheet';

                const response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: uploadTitle,
                    date: uploadDate,
                    serviceType: uploadServiceType,
                    fileName: file.name,
                    imageData
                  }),
                });

                const result = await response.json() as UploadResult;

                if (!response.ok || !result.success) {
                  console.error('악보 업로드 실패:', result.error);
                  reject(new Error(result.error || '업로드 실패'));
                  return;
                }

                console.log('악보 업로드 성공:', result.sheet);
              }

              resolve();
            } catch (error) {
              console.error('업로드 중 오류:', error);
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('파일 읽기 실패'));
          };

          reader.readAsDataURL(file);
        });
      }

      alert('악보가 업로드되었습니다.');
      setUploadTitle('');
      setUploadFiles([]);
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">길튼 시스템 관리자</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm">서버 상태:</span>
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></span>
              <span className="text-sm">{connectionStatus === 'connected' ? '연결됨' : '연결 안됨'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connected users */}
        <Card>
          <CardHeader>
            <CardTitle>접속 중인 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">접속 중인 사용자가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
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
          </CardContent>
        </Card>

        {/* Current status */}
        <Card>
          <CardHeader>
            <CardTitle>현재 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">현재 악보</h3>
              <p className="text-muted-foreground">{currentSheet ? `악보 ID: ${currentSheet}` : '선택된 악보 없음'}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">최근 명령</h3>
              <p className="text-muted-foreground">최근 명령 없음</p>
            </div>
          </CardContent>
        </Card>

        {/* Sheet Music Upload */}
        <Card>
          <CardHeader>
            <CardTitle>악보 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">악보 제목</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="악보 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-date">날짜</Label>
              <Input id="upload-date" type="date" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-service-type">예배 종류</Label>
              <Select value={uploadServiceType} onValueChange={setUploadServiceType}>
                <SelectTrigger id="upload-service-type">
                  <SelectValue placeholder="예배 종류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="주일 1부예배">주일 1부예배</SelectItem>
                  <SelectItem value="주일 2부예배">주일 2부예배</SelectItem>
                  <SelectItem value="주일 3부예배">주일 3부예배</SelectItem>
                  <SelectItem value="청년 예배">청년 예배</SelectItem>
                  <SelectItem value="수요예배">수요예배</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-files">악보 파일 (PNG, JPG)</Label>
              <Input
                id="upload-files"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                multiple
              />
              {uploadFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">선택된 파일 ({uploadFiles.length}개):</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    {uploadFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading || uploadFiles.length === 0 || !uploadTitle.trim()}
              className="w-full"
            >
              {isUploading ? '업로드 중...' : '업로드'}
            </Button>
          </CardContent>
        </Card>

        {/* Sheet Music List */}
        <Card>
          <CardHeader>
            <CardTitle>악보 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {sheets.length === 0 ? (
              <p className="text-muted-foreground">업로드된 악보가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {sheets.map((sheet) => (
                  <div key={sheet.id} className="p-2 bg-muted rounded">
                    <p className="font-medium">{sheet.title}</p>
                    {sheet.date && sheet.serviceType && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(sheet.date).toLocaleDateString('ko-KR')} - {sheet.serviceType}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      업로드: {new Date(sheet.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commands */}
        <Card>
          <CardHeader>
            <CardTitle>명령 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {commands.map((command) => (
                <div key={command.emoji} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="text-2xl">{command.emoji}</span>
                  <span>{command.text}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={handleResetCommands}>
              명령 초기화
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full" onClick={handleResetProfiles}>
              프로필 초기화
            </Button>

            <Button variant="secondary" className="w-full" onClick={handleOpenDataDirectory}>
              데이터 저장소 열기
            </Button>

            <div>
              <h3 className="text-lg font-medium">서버 정보</h3>
              <p className="text-sm text-muted-foreground">URL: {window.location.origin}</p>
              <p className="text-sm text-muted-foreground">접속자 수: {users.length}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;
