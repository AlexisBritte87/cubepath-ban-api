import { createRoutes } from "./routes.ts";
import { RoundRobinProviders } from "./services/round-robin.ts";
import { createOpenRouterProvider } from "./services/openrouter-client.ts";
import { createGroqProvider } from "./services/groq.ts";
import { createCerebrasProvider } from "./services/cerebra.ts";

const providers = new RoundRobinProviders([
  createOpenRouterProvider(),
  createGroqProvider(),
  createCerebrasProvider(),
]);

export function startServer() {
  const server = Bun.serve({
    port: Number(process.env.PORT) || 3000,
    idleTimeout: 120,
    routes: createRoutes(providers),
    fetch() {
      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`[INFO] Servidor escuchando en http://localhost:${server.port}`);
  console.log(`[INFO] Proveedores LLM inicializados (${providers.length}/3): ${providers.activeNames.join(", ") || "Ninguno"}`);
  
  if (providers.length === 0) {
    console.warn(
      "[WARN] No API Keys were found; POST /chat will return 503 until at least one is set.",
    );
  }
}
