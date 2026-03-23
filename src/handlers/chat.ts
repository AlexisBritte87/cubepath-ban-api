import type { OpenRouter } from "@openrouter/sdk";
import type { Message } from "@openrouter/sdk/models";
import { DEFAULT_CHAT_MODEL } from "../config/env.ts";

type ChatRole = "user" | "system" | "assistant" | "developer";

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

function parseMessages(body: unknown):
  | { ok: true; messages: Message[]; model: string }
  | { ok: false; response: Response } {
  if (body === null || typeof body !== "object") {
    return { ok: false, response: jsonError(400, "Body must be a JSON object") };
  }

  const o = body as Record<string, unknown>;
  const model =
    typeof o.model === "string" && o.model.trim() !== ""
      ? o.model.trim()
      : DEFAULT_CHAT_MODEL;

  if (Array.isArray(o.messages)) {
    const messages: Message[] = [];
    for (const item of o.messages) {
      if (item === null || typeof item !== "object") {
        return {
          ok: false,
          response: jsonError(400, "Each message must be an object"),
        };
      }
      const m = item as Record<string, unknown>;
      const role = m.role;
      const content = m.content;
      if (
        role !== "user" &&
        role !== "system" &&
        role !== "assistant" &&
        role !== "developer"
      ) {
        return {
          ok: false,
          response: jsonError(
            400,
            "Invalid role; expected one of: user, system, assistant, developer",
          ),
        };
      }
      if (typeof content !== "string") {
        return {
          ok: false,
          response: jsonError(400, "Each message.content must be a string"),
        };
      }
      messages.push({ role: role as ChatRole, content } as Message);
    }
    if (messages.length === 0) {
      return { ok: false, response: jsonError(400, "messages must not be empty") };
    }
    return { ok: true, messages, model };
  }

  if (typeof o.message === "string" && o.message.trim() !== "") {
    return {
      ok: true,
      messages: [{ role: "user", content: o.message.trim() } as Message],
      model,
    };
  }

  return {
    ok: false,
    response: jsonError(
      400,
      'Send { "message": "..." } or { "messages": [{ "role": "user", "content": "..." }] }',
    ),
  };
}

/**
 * POST /chat — streaming en texto plano (chunks UTF-8).
 * Cuerpo: `{ "message": "..." }` o `{ "messages": [...], "model"?: "..." }`.
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

  const parsed = parseMessages(body);
  if (!parsed.ok) return parsed.response;

  const { messages, model } = parsed;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const sdkStream = await client.chat.send({
          chatGenerationParams: {
            model,
            messages,
            stream: true,
          },
        });

        for await (const chunk of sdkStream) {
          if (chunk.error) {
            controller.enqueue(
              encoder.encode(`\n[error] ${chunk.error.message}\n`),
            );
            break;
          }

          const content = chunk.choices[0]?.delta?.content;
          if (content) controller.enqueue(encoder.encode(content));

          const reasoning = chunk.usage?.completionTokensDetails?.reasoningTokens;
          if (reasoning != null) {
            console.log("Reasoning tokens:", reasoning);
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n[error] ${msg}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
