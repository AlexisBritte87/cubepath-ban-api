import type { OpenRouter } from "@openrouter/sdk";
import { handlePostChat } from "./handlers/chat.ts";
import { handleHealthGet } from "./handlers/health.ts";
import { handleLandingGet } from "./handlers/landing.ts";

/**
 * Mapa de rutas para `Bun.serve({ routes })`.
 * Centraliza qué handler atiende cada path/método.
 */
export function createRoutes(openrouter: OpenRouter | null) {
  return {
    "/": {
      GET: () => handleLandingGet(),
    },
    "/health": {
      GET: () => handleHealthGet(),
    },
    "/chat": {
      POST: (req: Request) => handlePostChat(req, openrouter),
    },
  };
}
