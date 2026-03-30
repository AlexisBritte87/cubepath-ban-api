import { handlePostChat } from "./handlers/chat.ts";
import { createOpenRouterClient } from "./services/openrouter-client.ts";

const openrouter = createOpenRouterClient();

export function startServer() {
  const server = Bun.serve({
    port: Number(process.env.PORT) || 3000,
    idleTimeout: 120,
    routes: {
      "/": {
        GET: () => {
          const file = Bun.file(
            new URL("../public/index.html", import.meta.url),
          );
          return new Response(file, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        },
      },
      "/health": {
        GET: () =>
          Response.json({ status: "ok", timestamp: new Date().toISOString() }),
      },
      "/chat": {
        POST: (req) => handlePostChat(req, openrouter),
      },
    },
    fetch() {
      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`Listening on http://localhost:${server.port}`);
  if (!openrouter) {
    console.warn(
      "OPENROUTER_API_KEY is missing; POST /chat will return 503 until it is set.",
    );
  }
}
