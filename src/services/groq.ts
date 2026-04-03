import type { Message } from "@openrouter/sdk/models";
import type { ChatProvider } from "../chat/provider.ts";
import { streamOpenAICompatible } from "../chat/openai-stream.ts";
import { getGroqApiKey } from "../config/env.ts";

export function createGroqProvider(): ChatProvider | null {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  return {
    name: "Groq",
    model: "openai/gpt-oss-20b",
    createStream(messages: Message[]): ReadableStream<Uint8Array> {
      return streamOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        apiKey,
        "openai/gpt-oss-20b",
        messages
      );
    },
  };
}
