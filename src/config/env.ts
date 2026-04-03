/** Modelo por defecto: tier gratuito de OpenRouter (ver documentación actual). */
export const DEFAULT_CHAT_MODEL = "openrouter/free";

export function getOpenRouterApiKey(): string | undefined {
  const key = process.env.OPENROUTER_API_KEY;
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}

export function getGroqApiKey(): string | undefined {
  const key = process.env.GROQ_API_KEY;
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}

export function getCerebrasApiKey(): string | undefined {
  const key = process.env.CEREBRAS_API_KEY;
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}
