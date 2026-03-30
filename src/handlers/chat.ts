import type { OpenRouter } from "@openrouter/sdk";
import { createOpenRouterSseStream } from "../chat/openrouter-stream.ts";
import { parseChatRequestBody } from "../chat/parse-request.ts";
import { jsonError, sseResponseHeaders } from "../http/responses.ts";

/**
 * POST /chat — streaming SSE (OpenRouter).
 */
export async function handlePostChat(
  req: Request,
  client: OpenRouter | null,
): Promise<Response> {
  if (!client) {
    return jsonError(
      503,
      "OPENROUTER_API_KEY is not set. Add it to the environment or a .env file.",
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = parseChatRequestBody(body);
  if (!parsed.ok) return parsed.response;

  const stream = createOpenRouterSseStream(client, {
    model: parsed.model,
    messages: parsed.messages,
  });

  return new Response(stream, { headers: sseResponseHeaders });
}
