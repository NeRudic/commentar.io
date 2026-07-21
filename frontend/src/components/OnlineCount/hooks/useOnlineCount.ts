import { useEffect, useState } from "react";
import { BASE_DELAY, MAX_DELAY } from "./config";

export default function useOnlineCount(): number {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    const HOST = import.meta.env.VITE_WS_HOST || window.location.host;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let retries = 0;
    let shouldReconnect = true;

    function connect() {
      ws = new WebSocket(`ws://${HOST}`);

      ws.onopen = () => {
        retries = 0;
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (
            typeof raw === "object" &&
            raw !== null &&
            typeof (raw as Record<string, unknown>).count === "number"
          ) {
            setOnlineCount((raw as { count: number }).count);
          }
        } catch {
          // ignore malformed WS messages
        }
      };

      ws.onclose = () => {
        if (!shouldReconnect) return;

        const delay = Math.min(BASE_DELAY * 2 ** retries, MAX_DELAY);
        retries++;
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      shouldReconnect = false;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return onlineCount;
}
