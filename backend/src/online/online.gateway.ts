import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import WebSocket, { WebSocketServer as WsServer } from 'ws';

@WebSocketGateway()
export class OnlineGateway {
  @WebSocketServer()
  private server: WsServer;
  private connectedClients = new Set<WebSocket>();

  private PING_INTERVAL = 15_000;

  handleConnection(client: WebSocket) {
    this.connectedClients.add(client);

    let alive: boolean = true;

    client.on('pong', () => {
      alive = true;
    });

    const interval = setInterval(() => {
      if (!alive) {
        client.terminate(); //force close
        return;
      }
      alive = false;
      client.ping();
    }, this.PING_INTERVAL);

    client.on('close', () => {
      clearInterval(interval);
      this.connectedClients.delete(client);
      this.broadcastCount();
    });

    this.broadcastCount();
  }

  private broadcastCount() {
    const message = JSON.stringify({
      event: 'onlineCount',
      count: this.connectedClients.size,
    });

    // Осознанно мутирую connectedClients в угоду времени
    this.connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch {
          this.connectedClients.delete(client);
        }
      }
    });
  }
}
