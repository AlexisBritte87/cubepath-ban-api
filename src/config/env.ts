/** Modelo por defecto: tier gratuito de OpenRouter (ver documentación actual). */
export const DEFAULT_CHAT_MODEL = "openrouter/free";

export function getOpenRouterApiKey(): string | undefined {
  const key = process.env.OPENROUTER_API_KEY;
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}
