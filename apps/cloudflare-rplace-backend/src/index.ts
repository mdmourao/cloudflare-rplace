import { fromHono } from "chanfana";
import { Hono } from "hono";

export { CanvasRoom } from "./objects/CanvasRoom";

const app = new Hono<{ Bindings: Env }>();

export interface Env {
  CANVAS_ROOM: DurableObjectNamespace;
}

const openapi = fromHono(app, {
	docs_url: "/",
});

openapi.get("/counter", (c) => {
  const id = c.env.CANVAS_ROOM.idFromName("counter-1");
  const stub = c.env.CANVAS_ROOM.get(id);
  return stub.fetch(c.req.raw);
});

app.get("/ws", async (c) => {
  const id = c.env.CANVAS_ROOM.idFromName("counter-v1");
  const stub = c.env.CANVAS_ROOM.get(id);
  return stub.fetch(c.req.raw);
});

app.get('/private', (c) => c.text('Private route'));

export default app;
