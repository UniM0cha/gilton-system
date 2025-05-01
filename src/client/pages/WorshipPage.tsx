/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProfileStore from '../stores/useProfileStore';
import useSocket, { Command, Profile } from '../hooks/useSocket';

// Placeholder component for sheet music viewer
const SheetMusicViewer: React.FC = () => (
  <div className="flex-1 bg-muted flex items-center justify-center">
    <p className="text-muted-foreground">악보가 선택되지 않았습니다.</p>
  </div>
);

// Placeholder component for sheet music thumbnails
const SheetMusicThumbnails: React.FC = () => (
  <div className="w-24 bg-card border-r border-border overflow-y-auto">
    <div className="p-2 text-center text-xs text-muted-foreground">
      악보 목록
    </div>
    <div className="flex flex-col gap-2 p-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <div 
          key={num} 
          className="aspect-[3/4] bg-muted rounded cursor-pointer hover:bg-accent flex items-center justify-center"
        >
          {num}
        </div>
      ))}
    </div>
  </div>
);

// Command panel component
interface CommandPanelProps {
  role: string;
  favoriteCommands: string[];
  onSendCommand: (command: string) => void;
}

const CommandPanel: React.FC<CommandPanelProps> = ({ role, favoriteCommands, onSendCommand }) => {
  // Default commands
  const defaultCommands = ['1️⃣', '2️⃣', '3️⃣', '🔂', '🔁', '▶️', '⏹️', '⏭️', '🔊', '🔉', '👍'];

  // Use favorite commands if available, otherwise use defaults
  const commands = favoriteCommands.length > 0 ? favoriteCommands : defaultCommands;

  // Check if user can send commands (only leaders and pastors)
  const canSendCommands = role === '인도자' || role === '목사님';

  return (
    <div className="h-16 bg-card border-t border-border p-2 flex items-center gap-2 overflow-x-auto">
      {commands.map((emoji) => (
        <button 
          key={emoji} 
          className={`w-12 h-12 flex items-center justify-center rounded-full ${
            canSendCommands 
              ? 'bg-secondary hover:bg-secondary/80 cursor-pointer' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          onClick={() => canSendCommands && onSendCommand(emoji)}
          disabled={!canSendCommands}
        >
          {emoji}
        </button>
      ))}
      {!canSendCommands && (
        <span className="text-xs text-muted-foreground ml-2">
          세션은 명령을 보낼 수 없습니다
        </span>
      )}
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
  const { 
    isConnected, 
    register, 
    sendCommand, 
    subscribe 
  } = useSocket();

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [receivedCommand, setReceivedCommand] = useState<Command | null>(null);

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

    const unsubscribe = subscribe<{ command: Command, sender: Profile }>('command', (data) => {
      console.log('Command received:', data);
      setReceivedCommand(data.command);

      // Auto-hide command after 5 seconds
      setTimeout(() => {
        setReceivedCommand(null);
      }, 5000);
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  // Handle sending commands
  const handleSendCommand = (emoji: string) => {
    if (!profile) return;

    const command: Command = {
      emoji,
      text: '' // In a real implementation, we would look up the text for this emoji
    };

    sendCommand(command);
  };

  if (!profile) {
    return null; // Will redirect to setup
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <Link to="/" className="text-sm font-medium">
          ← 홈으로
        </Link>
        <h1 className="text-lg font-semibold">예배 진행</h1>
        <button 
          className={`px-3 py-1 rounded text-sm ${
            isDrawingMode 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}
          onClick={() => setIsDrawingMode(!isDrawingMode)}
        >
          {isDrawingMode ? '그리기 모드' : '보기 모드'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <SheetMusicThumbnails />
        <div className="flex-1 relative">
          <SheetMusicViewer />
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
      <CommandPanel 
        role={profile.role} 
        favoriteCommands={profile.favoriteCommands} 
        onSendCommand={handleSendCommand} 
      />

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
