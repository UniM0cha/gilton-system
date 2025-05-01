/* eslint-disable no-console */
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import isDev from 'electron-is-dev';

// Define types for JSON data
interface JsonData {
  profiles?: Array<Record<string, unknown>>;
  commands?: Array<{emoji: string; text: string}>;
  sessions?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

// Define data directory
const dataDir = path.join(app.getPath('userData'), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize Express app
const expressApp = express();
const server = http.createServer(expressApp);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files from the client build directory in production
if (!isDev) {
  expressApp.use(express.static(path.join(__dirname, '../client')));
}

// API routes
expressApp.get('/api/status', (req, res) => {
  res.json({ status: 'ok', version: app.getVersion() });
});

// JSON file paths
const profilesPath = path.join(dataDir, 'profiles.json');
const commandsPath = path.join(dataDir, 'commands.json');
const sessionsPath = path.join(dataDir, 'sessions.json');

// Initialize JSON files if they don't exist
const initJsonFile = (filePath: string, defaultData: JsonData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize default data
initJsonFile(profilesPath, { profiles: [] });
initJsonFile(commandsPath, { 
  commands: [
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
  ] 
});
initJsonFile(sessionsPath, { sessions: [] });

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle profile registration
  socket.on('register', (profile) => {
    console.log('Profile registered:', profile);

    // Add to connected users
    socket.data.profile = profile;

    // Broadcast updated user list to admin
    io.to('admin').emit('users', Array.from(io.sockets.sockets.values())
      .filter(s => s.data.profile)
      .map(s => ({ 
        id: s.id, 
        profile: s.data.profile,
        connectedAt: s.data.connectedAt || new Date()
      }))
    );
  });

  // Handle admin registration
  socket.on('register-admin', () => {
    console.log('Admin registered');
    socket.join('admin');

    // Send current user list to admin
    socket.emit('users', Array.from(io.sockets.sockets.values())
      .filter(s => s.data.profile)
      .map(s => ({ 
        id: s.id, 
        profile: s.data.profile,
        connectedAt: s.data.connectedAt || new Date()
      }))
    );
  });

  // Handle sheet music navigation
  socket.on('sheet-change', (data) => {
    console.log('Sheet changed:', data);
    socket.broadcast.emit('sheet-change', data);
  });

  // Handle drawing updates
  socket.on('drawing-update', (data) => {
    console.log('Drawing updated');
    socket.broadcast.emit('drawing-update', data);
  });

  // Handle command sending
  socket.on('command', (command) => {
    if (!socket.data.profile) return;

    const { role } = socket.data.profile;
    // Only leaders and pastors can send commands
    if (role === '인도자' || role === '목사님') {
      console.log('Command sent:', command);
      socket.broadcast.emit('command', {
        command,
        sender: socket.data.profile
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Broadcast updated user list to admin
    io.to('admin').emit('users', Array.from(io.sockets.sockets.values())
      .filter(s => s.data.profile)
      .map(s => ({ 
        id: s.id, 
        profile: s.data.profile,
        connectedAt: s.data.connectedAt || new Date()
      }))
    );
  });

  // Record connection time
  socket.data.connectedAt = new Date();
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create the browser window
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  // Load the admin page
  const adminUrl = isDev 
    ? 'http://localhost:3000/admin' 
    : `file://${path.join(__dirname, '../client/index.html')}#/admin`;

  mainWindow.loadURL(adminUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for file operations
ipcMain.handle('read-json', async (event, filePath) => {
  const fullPath = path.join(dataDir, filePath);
  try {
    const data = await fs.promises.readFile(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fullPath}:`, error);
    return null;
  }
});

ipcMain.handle('write-json', async (event, filePath, data) => {
  const fullPath = path.join(dataDir, filePath);
  try {
    await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${fullPath}:`, error);
    return false;
  }
});

// Handle app shutdown
app.on('before-quit', () => {
  server.close();
});
