import { useState, useEffect } from 'react';

interface SobrietyTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function useSobrietyTimer(startDate: string | null): SobrietyTime {
  const [time, setTime] = useState<SobrietyTime>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    if (!startDate) return;

    const calculate = () => {
      const start = new Date(startDate).getTime();
      // Guard: malformed startDate produces NaN — skip to keep the display at 0
      if (isNaN(start)) { console.warn('[useSobrietyTimer] Invalid startDate:', startDate); return; }
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));

      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      setTime({ days, hours, minutes, seconds, totalSeconds: diffSec });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return time;
}
