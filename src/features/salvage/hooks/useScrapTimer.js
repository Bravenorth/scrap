import { useState, useRef, useEffect, useCallback } from "react";

export function useScrapTimer() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const intervalRef = useRef();

  const start = useCallback(() => {
    if (running) return;
    intervalRef.current = setInterval(() => setTime(t => t + 1), 1000);
    setRunning(true);
  }, [running]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setStopped(true);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setStopped(false);
    setTime(0);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { time, running, stopped, start, pause, stop, reset };
}
