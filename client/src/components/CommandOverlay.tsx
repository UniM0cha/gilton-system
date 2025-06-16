import { useEffect, useState } from 'react';

const CommandOverlay = () => {
  const [command, setCommand] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    ws.onmessage = ev => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'command') {
          setCommand(data.payload);
          setTimeout(() => setCommand(null), 2000);
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  if (!command) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-black/50 text-white px-4 py-2 rounded text-2xl">
        {command}
      </div>
    </div>
  );
};

export default CommandOverlay;
