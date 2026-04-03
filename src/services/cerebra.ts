import type { Message } from "@openrouter/sdk/models";
import type { ChatProvider } from "../chat/provider.ts";
import { streamOpenAICompatible } from "../chat/openai-stream.ts";
import { getCerebrasApiKey } from "../config/env.ts";

export function createCerebrasProvider(): ChatProvider | null {
  const apiKey = getCerebrasApiKey();
  if (!apiKey) return null;

  return {
    name: "Cerebras",
    model: "llama3.1-8b",
    createStream(messages: Message[]): ReadableStream<Uint8Array> {
      return streamOpenAICompatible(
        "https://api.cerebras.ai/v1/chat/completions",
        apiKey,
        "llama3.1-8b",
        messages
      );
    },
  };
}
