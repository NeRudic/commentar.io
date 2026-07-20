import { useEffect, useState } from "react";
import type { WsOnline } from "../../../types";

export default function useOnlineCount(): number {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    const HOST = import.meta.env.VITE_WS_HOST || "localhost:3000";
    const BASE_DELAY = 1000;
    const MAX_DELAY = 30000;

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
        const data = JSON.parse(event.data) as WsOnline;
        setOnlineCount(data.count);
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
