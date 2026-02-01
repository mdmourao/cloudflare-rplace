import { DurableObject } from "cloudflare:workers";

export class CanvasRoom extends DurableObject {
  async fetch(request: Request) {
    let value = (await this.ctx.storage.get<number>("count")) || 0;
    value += 1;
    await this.ctx.storage.put("count", value);
    return new Response(`Counter: ${value}`);
  }
}
