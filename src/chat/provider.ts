import type { Message } from "@openrouter/sdk/models";

export interface ChatProvider {
  name: string;
  model: string;
  createStream(messages: Message[]): ReadableStream<Uint8Array>;
}
