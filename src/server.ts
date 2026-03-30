import { createRoutes } from "./routes.ts";
import { createOpenRouterClient } from "./services/openrouter-client.ts";

const openrouter = createOpenRouterClient();

export function startServer() {
  const server = Bun.serve({
    port: Number(process.env.PORT) || 3000,
    idleTimeout: 120,
    routes: createRoutes(openrouter),
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
