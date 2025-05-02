/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import useProfileStore from '../stores/useProfileStore';
import useSocket, { Command, Profile, SheetChange } from '../hooks/useSocket';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import SheetMusicUpload from '../components/SheetMusicUpload';

// 악보 인터페이스
interface Sheet {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  date?: string;
  serviceType?: string;
}

// 악보 뷰어 컴포넌트
interface SheetMusicViewerProps {
  currentSheet: Sheet | null;
  currentPage: number;
}

const SheetMusicViewer: React.FC<SheetMusicViewerProps> = ({ currentSheet }) => {
  // 참고: currentPage는 향후 여러 페이지 악보 지원을 위해 예약됨
  if (!currentSheet) {
    return (
      <div className="flex-1 bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">악보가 선택되지 않았습니다.</p>
      </div>
    );
  }

  const imageUrl = `http://localhost:3001/sheets/${currentSheet.fileName}`;

  return (
    <div className="flex-1 bg-muted flex items-center justify-center overflow-auto">
      <img src={imageUrl} alt={currentSheet.title} className="max-w-full max-h-full object-contain" />
    </div>
  );
};

// 악보 썸네일 컴포넌트
interface SheetMusicThumbnailsProps {
  sheets: Sheet[];
  currentSheetId: string | null;
  onSelectSheet: (sheet: Sheet) => void;
}

const SheetMusicThumbnails: React.FC<SheetMusicThumbnailsProps> = ({ sheets, currentSheetId, onSelectSheet }) => (
  <div className="w-24 bg-card border-r border-border overflow-y-auto">
    <div className="p-2 text-center text-xs text-muted-foreground">악보 목록</div>
    <div className="flex flex-col gap-2 p-2">
      {sheets.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center">악보가 없습니다</p>
      ) : (
        sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`aspect-[3/4] rounded cursor-pointer hover:bg-accent flex items-center justify-center p-1 text-xs text-center ${
              sheet.id === currentSheetId ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
            onClick={() => onSelectSheet(sheet)}
          >
            {sheet.title}
          </div>
        ))
      )}
    </div>
  </div>
);

// 명령 패널 컴포넌트
interface CommandPanelProps {
  role: string;
  favoriteCommands: string[];
  onSendCommand: (command: string) => void;
}

const CommandPanel: React.FC<CommandPanelProps> = ({ role, favoriteCommands, onSendCommand }) => {
  // 기본 명령
  const defaultCommands = ['1️⃣', '2️⃣', '3️⃣', '🔂', '🔁', '▶️', '⏹️', '⏭️', '🔊', '🔉', '👍'];

  // 즐겨찾는 명령이 있으면 사용하고, 없으면 기본 명령 사용
  const commands = favoriteCommands.length > 0 ? favoriteCommands : defaultCommands;

  // 사용자가 명령을 보낼 수 있는지 확인 (인도자와 목사님만 가능)
  const canSendCommands = role === '인도자' || role === '목사님';

  return (
    <div className="h-16 bg-card border-t border-border p-2 flex items-center gap-2 overflow-x-auto">
      {commands.map((emoji) => (
        <Button
          key={emoji}
          variant={canSendCommands ? 'secondary' : 'outline'}
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={() => canSendCommands && onSendCommand(emoji)}
          disabled={!canSendCommands}
        >
          {emoji}
        </Button>
      ))}
      {!canSendCommands && <span className="text-xs text-muted-foreground ml-2">세션은 명령을 보낼 수 없습니다</span>}
    </div>
  );
};

// Placeholder component for drawing toolbar
const DrawingToolbar: React.FC = () => (
  <div className="absolute top-4 right-4 bg-card rounded-lg shadow-lg p-2 flex flex-col gap-2">
    <button className="w-10 h-10 bg-secondary rounded-full hover:bg-secondary/80 flex items-center justify-center">
      🖊️
    </button>
    <button className="w-10 h-10 bg-secondary rounded-full hover:bg-secondary/80 flex items-center justify-center">
      🖌️
    </button>
    <button className="w-10 h-10 bg-secondary rounded-full hover:bg-secondary/80 flex items-center justify-center">
      🧽
    </button>
  </div>
);

const WorshipPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const { socket, isConnected, register, sendCommand, sendSheetChange, subscribe } = useSocket();

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [receivedCommand, setReceivedCommand] = useState<Command | null>(null);

  // Sheet music state
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [filteredSheets, setFilteredSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<Sheet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableServiceTypes, setAvailableServiceTypes] = useState<string[]>([]);

  // Redirect to setup if no profile
  useEffect(() => {
    if (!profile) {
      navigate('/setup');
    }
  }, [profile, navigate]);

  // Register profile with server if connected
  useEffect(() => {
    if (isConnected && profile) {
      register(profile);
    }
  }, [isConnected, profile, register]);

  // Subscribe to commands
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe<{ command: Command; sender: Profile }>('command', (data) => {
      console.log('Command received:', data);
      setReceivedCommand(data.command);

      // Auto-hide command after 5 seconds
      setTimeout(() => {
        setReceivedCommand(null);
      }, 5000);
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  // Subscribe to sheet updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe<Sheet[]>('sheets', (data) => {
      console.log('Sheets received:', data);
      setSheets(data);
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  // Update available dates and service types when sheets change
  useEffect(() => {
    // Extract unique dates and service types
    const dates = [...new Set(sheets.filter((sheet) => sheet.date).map((sheet) => sheet.date!))];
    const serviceTypes = [...new Set(sheets.filter((sheet) => sheet.serviceType).map((sheet) => sheet.serviceType!))];

    // Sort dates in descending order (newest first)
    dates.sort((a, b) => b.localeCompare(a));

    setAvailableDates(dates);
    setAvailableServiceTypes(serviceTypes);

    // If no date is selected and we have dates, select the most recent one
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0]);
    }

    // If no service type is selected and we have service types, select the first one
    if (!selectedServiceType && serviceTypes.length > 0) {
      setSelectedServiceType(serviceTypes[0]);
    }
  }, [sheets, selectedDate, selectedServiceType]);

  // Filter sheets based on selected date and service type
  useEffect(() => {
    if (!selectedDate && !selectedServiceType) {
      // If nothing is selected, show all sheets
      setFilteredSheets(sheets);
    } else if (selectedDate && !selectedServiceType) {
      // Filter by date only
      setFilteredSheets(sheets.filter((sheet) => sheet.date === selectedDate));
    } else if (!selectedDate && selectedServiceType) {
      // Filter by service type only
      setFilteredSheets(sheets.filter((sheet) => sheet.serviceType === selectedServiceType));
    } else {
      // Filter by both date and service type
      setFilteredSheets(
        sheets.filter((sheet) => sheet.date === selectedDate && sheet.serviceType === selectedServiceType),
      );
    }
  }, [sheets, selectedDate, selectedServiceType]);

  // Subscribe to sheet-change events
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe<SheetChange>('sheet-change', (data) => {
      console.log('Sheet change received:', data);

      // Find the sheet with the matching ID
      const sheet = sheets.find((s) => s.id === data.sheetId);
      if (sheet) {
        setCurrentSheet(sheet);
        if (data.pageNumber) {
          setCurrentPage(data.pageNumber);
        }
      }
    });

    return unsubscribe;
  }, [isConnected, subscribe, sheets]);

  // Handle sending commands
  const handleSendCommand = (emoji: string) => {
    if (!profile) return;

    const command: Command = {
      emoji,
      text: '', // In a real implementation, we would look up the text for this emoji
    };

    sendCommand(command);
  };

  // Handle sheet selection
  const handleSelectSheet = (sheet: Sheet) => {
    setCurrentSheet(sheet);
    setCurrentPage(1);

    // Notify other clients about the sheet change
    sendSheetChange({
      sheetId: sheet.id,
      pageNumber: 1,
    });
  };

  if (!profile) {
    return null; // Will redirect to setup
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="h-14 flex items-center justify-between px-4">
          <Link to="/" className="text-sm font-medium">
            ← 홈으로
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">예배 진행</h1>
            {currentSheet && <span className="text-sm text-muted-foreground">{currentSheet.title}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isDrawingMode ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setIsDrawingMode(!isDrawingMode)}
            >
              {isDrawingMode ? '그리기 모드' : '보기 모드'}
            </Button>
            {/* 악보 업로드 버튼 추가 */}
            <SheetMusicUpload onUploadComplete={() => {
              // 업로드 완료 후 악보 목록 새로고침
              if (isConnected && socket) {
                // 기존 소켓 연결을 사용하여 악보 목록 요청
                socket.emit('get-sheets');
              }
            }} />
          </div>
        </div>

        {/* Filter controls */}
        {(availableDates.length > 0 || availableServiceTypes.length > 0) && (
          <div className="px-4 py-2 flex flex-wrap items-center gap-4 border-t border-border">
            {availableDates.length > 0 && (
              <div className="flex items-center gap-2">
                <Label htmlFor="date-select" className="whitespace-nowrap">
                  날짜:
                </Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger id="date-select" className="w-[180px]">
                    <SelectValue placeholder="날짜 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), 'yyyy년 M월 d일', { locale: ko })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {availableServiceTypes.length > 0 && (
              <div className="flex items-center gap-2">
                <Label htmlFor="service-type-select" className="whitespace-nowrap">
                  예배 종류:
                </Label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger id="service-type-select" className="w-[180px]">
                    <SelectValue placeholder="예배 종류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServiceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <SheetMusicThumbnails
          sheets={filteredSheets}
          currentSheetId={currentSheet?.id || null}
          onSelectSheet={handleSelectSheet}
        />
        <div className="flex-1 relative">
          <SheetMusicViewer currentSheet={currentSheet} currentPage={currentPage} />
          {isDrawingMode && <DrawingToolbar />}

          {/* Command overlay */}
          {receivedCommand && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-8 py-6 rounded-lg text-center">
              <div className="text-6xl mb-2">{receivedCommand.emoji}</div>
              <div className="text-xl">{receivedCommand.text || '명령'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Command panel */}
      <CommandPanel role={profile.role} favoriteCommands={profile.favoriteCommands} onSendCommand={handleSendCommand} />

      {/* Connection status */}
      {!isConnected && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded text-sm">
          서버에 연결되지 않았습니다. 연결 상태를 확인해주세요.
        </div>
      )}
    </div>
  );
};

export default WorshipPage;
