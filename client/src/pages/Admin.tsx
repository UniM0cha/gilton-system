import { useState } from 'react';

const Admin = () => {
  const [command, setCommand] = useState('');
  const sendCommand = () => {
    fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
  };
  return (
    <div>
      <h1>관리자 페이지</h1>
      <input value={command} onChange={e => setCommand(e.target.value)} />
      <button onClick={sendCommand}>전송</button>
    </div>
  );
};

export default Admin;
