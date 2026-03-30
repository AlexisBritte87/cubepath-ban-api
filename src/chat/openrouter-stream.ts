import type { OpenRouter } from "@openrouter/sdk";
import type { Message } from "@openrouter/sdk/models";
import { formatSseEvent } from "./sse.ts";

export type ChatStreamParams = {
  model: string;
  messages: Message[];
};

/**
 * Stream de OpenRouter convertido a SSE (`event: token` / `error` / `done`).
 */
export function createOpenRouterSseStream(
  client: OpenRouter,
  params: ChatStreamParams,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(formatSseEvent(event, data)));
      };

      try {
        const sdkStream = await client.chat.send({
          chatGenerationParams: {
            model: params.model,
            messages: params.messages,
            stream: true,
          },
        });

        for await (const chunk of sdkStream) {
          if (chunk.error) {
            send("error", JSON.stringify({ message: chunk.error.message }));
            break;
          }

          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            send("token", JSON.stringify({ content }));
          }

          const reasoning =
            chunk.usage?.completionTokensDetails?.reasoningTokens;
          if (reasoning != null) {
            console.log("Reasoning tokens:", reasoning);
          }
        }
        send("done", "[DONE]");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        send("error", JSON.stringify({ message: msg }));
      } finally {
        controller.close();
      }
    },
  });
}
