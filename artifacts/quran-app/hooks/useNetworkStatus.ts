import { useEffect, useRef, useState } from "react";

const PING_URL = "https://api.alquran.cloud/v1/meta";
const PING_INTERVAL = 30_000;
const PING_TIMEOUT = 4_000;

let listeners: Array<(online: boolean) => void> = [];
let globalOnline = true;

function broadcast(status: boolean) {
  if (status !== globalOnline) {
    globalOnline = status;
    listeners.forEach((fn) => fn(status));
  }
}

async function ping(): Promise<boolean> {
  try {
    await fetch(PING_URL, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(PING_TIMEOUT),
    });
    broadcast(true);
    return true;
  } catch {
    broadcast(false);
    return false;
  }
}

let pingInterval: ReturnType<typeof setInterval> | null = null;
let activeSubs = 0;

function startPing() {
  if (pingInterval) return;
  void ping();
  pingInterval = setInterval(() => void ping(), PING_INTERVAL);
}

function stopPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(globalOnline);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    activeSubs++;

    const listener = (status: boolean) => {
      if (mounted.current) setIsOnline(status);
    };
    listeners.push(listener);
    startPing();

    return () => {
      mounted.current = false;
      listeners = listeners.filter((l) => l !== listener);
      activeSubs--;
      if (activeSubs === 0) stopPing();
    };
  }, []);

  return { isOnline };
}

export function markNetworkError() {
  broadcast(false);
}

export function markNetworkSuccess() {
  broadcast(true);
}
