import { useState } from 'react';

const Admin = () => {
  const [command, setCommand] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const sendCommand = () => {
    fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
  };

  const upload = async () => {
    if (!files?.length) return;
    const data = new FormData();
    Array.from(files).forEach(f => data.append('files', f));
    await fetch('/api/scores', { method: 'POST', body: data });
    alert('업로드 완료');
  };

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">관리자 페이지</h1>
      <div className="flex gap-2">
        <input
          className="border px-2"
          value={command}
          onChange={e => setCommand(e.target.value)}
        />
        <button className="border px-2" onClick={sendCommand}>
          전송
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <input type="file" multiple onChange={e => setFiles(e.target.files)} />
        <button className="border px-2" onClick={upload}>
          악보 업로드
        </button>
      </div>
    </div>
  );
};

export default Admin;
