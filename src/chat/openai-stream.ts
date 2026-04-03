import type { Message } from "@openrouter/sdk/models";
import { formatSseEvent } from "./sse.ts";

export function streamOpenAICompatible(
  apiUrl: string,
  apiKey: string,
  model: string,
  messages: Message[],
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(formatSseEvent(event, data)));
      };

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API returned ${res.status}: ${errText}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const lines = part.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  continue; // Wait for stream end
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    send("token", JSON.stringify({ content }));
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks here
                }
              }
            }
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
