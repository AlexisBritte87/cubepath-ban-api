import type { RoundRobinProviders } from "../services/round-robin.ts";
import { parseChatRequestBody } from "../chat/parse-request.ts";
import { jsonError, sseResponseHeaders } from "../http/responses.ts";

/**
 * POST /chat — streaming SSE (OpenRouter).
 */
export async function handlePostChat(
  req: Request,
  providers: RoundRobinProviders,
): Promise<Response> {
  const provider = providers.getNext();
  if (!provider) {
    return jsonError(
      503,
      "No API keys configured. Please add OPENROUTER_API_KEY, GROQ_API_KEY, or CEREBRAS_API_KEY to your .env file.",
    );
  }

  console.log(`[CHAT] Petición recibida. Usando LLM: ${provider.name} (Modelo: ${provider.model})`);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = parseChatRequestBody(body);
  if (!parsed.ok) return parsed.response;

  const stream = provider.createStream(parsed.messages);

  return new Response(stream, { headers: sseResponseHeaders });
}
