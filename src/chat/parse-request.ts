import type { Message } from "@openrouter/sdk/models";
import { DEFAULT_CHAT_MODEL } from "../config/env.ts";
import { jsonError } from "../http/responses.ts";

export type ChatRole = "user" | "system" | "assistant" | "developer";

export type ParsedChatRequest =
  | { ok: true; messages: Message[]; model: string; provider?: string }
  | { ok: false; response: Response };

/**
 * Valida el JSON del body de POST /chat y lo convierte en mensajes + modelo.
 */
export function parseChatRequestBody(body: unknown): ParsedChatRequest {
  if (body === null || typeof body !== "object") {
    return { ok: false, response: jsonError(400, "Body must be a JSON object") };
  }

  const o = body as Record<string, unknown>;
  const model =
    typeof o.model === "string" && o.model.trim() !== ""
      ? o.model.trim()
      : DEFAULT_CHAT_MODEL;

  const provider =
    typeof o.provider === "string" && o.provider.trim() !== ""
      ? o.provider.trim()
      : undefined;

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
    return { ok: true, messages, model, provider };
  }

  if (typeof o.message === "string" && o.message.trim() !== "") {
    return {
      ok: true,
      messages: [{ role: "user", content: o.message.trim() } as Message],
      model,
      provider,
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
