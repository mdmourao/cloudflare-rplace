import { DurableObject } from "cloudflare:workers";

export class CanvasRoom extends DurableObject {
  sessions: WebSocket[] = [];

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.handleSession(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    let value = (await this.ctx.storage.get<number>("count")) || 0;
    value += 1;
    await this.ctx.storage.put("count", value);
    return new Response(`Counter: ${value}`);
  }

  handleSession(ws: WebSocket) {
    ws.accept();
    this.sessions.push(ws);
    this.ctx.storage.get<number>("count").then((val) => {
      ws.send(JSON.stringify({ type: "INIT", count: val || 0 }));
    });
    ws.addEventListener("close", () => {
      this.sessions = this.sessions.filter((s) => s !== ws);
    });
  }

  broadcast(value: number) {
    const message = JSON.stringify({ type: "UPDATE", count: value });

    this.sessions.forEach((ws) => {
      try {
        ws.send(message);
      } catch (err) {
        console.error("Failed to send message to a session:", err);
      }
    });
  }
}
