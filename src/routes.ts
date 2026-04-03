import type { RoundRobinProviders } from "./services/round-robin.ts";
import { handlePostChat } from "./handlers/chat.ts";
import { handleHealthGet } from "./handlers/health.ts";
import { handleLandingGet } from "./handlers/landing.ts";
import { 
  handleInitDB, 
  handleGetUsers, 
  handleGetUser, 
  handleCreateUser, 
  handleUpdateUser, 
  handleDeleteUser 
} from "./handlers/users.ts";

/**
 * Mapa de rutas para `Bun.serve({ routes })`.
 * Centraliza qué handler atiende cada path/método.
 */
export function createRoutes(providers: RoundRobinProviders) {
  return {
    "/": {
      GET: () => handleLandingGet(),
    },
    "/health": {
      GET: () => handleHealthGet(),
    },
    "/chat": {
      POST: (req: Request) => handlePostChat(req, providers),
    },
    "/api/init-db": {
      POST: () => handleInitDB(),
    },
    "/api/users": {
      GET: () => handleGetUsers(),
      POST: (req: Request) => handleCreateUser(req),
    },
    "/api/users/:id": {
      GET: (req: Request) => handleGetUser(req),
      PUT: (req: Request) => handleUpdateUser(req),
      DELETE: (req: Request) => handleDeleteUser(req),
    },
  };
}
