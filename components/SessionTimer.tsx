import React, { useState, useEffect } from 'react';

interface SessionTimerProps {
  startTime: Date | string | null;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('--:--:--');

  useEffect(() => {
    if (!startTime) {
      setElapsed('--:--:--');
      return;
    }

    const update = () => {
      const start = new Date(startTime).getTime();
      const diff = Date.now() - start;
      
      if (diff < 0) {
        setElapsed('00:00:00');
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono text-emerald-400">{elapsed}</span>;
};

export default SessionTimer;