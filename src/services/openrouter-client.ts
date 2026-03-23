import { OpenRouter } from "@openrouter/sdk";
import { getOpenRouterApiKey } from "../config/env.ts";

export function createOpenRouterClient(): OpenRouter | null {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) return null;
  return new OpenRouter({ apiKey });
}
