import { OpenRouter } from "@openrouter/sdk";
import type { Message } from "@openrouter/sdk/models";
import type { ChatProvider } from "../chat/provider.ts";
import { getOpenRouterApiKey, DEFAULT_CHAT_MODEL } from "../config/env.ts";
import { createOpenRouterSseStream } from "../chat/openrouter-stream.ts";

export function createOpenRouterProvider(): ChatProvider | null {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) return null;
  const client = new OpenRouter({ apiKey });
  return {
    name: "OpenRouter",
    model: DEFAULT_CHAT_MODEL,
    createStream(messages: Message[]): ReadableStream<Uint8Array> {
      return createOpenRouterSseStream(client, {
        model: DEFAULT_CHAT_MODEL,
        messages,
      });
    },
  };
}
