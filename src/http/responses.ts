/** Respuestas JSON de error estándar `{ error: string }`. */
export function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

/** Cabeceras para respuestas SSE (streaming). */
export const sseResponseHeaders: Record<string, string> = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache",
  "X-Accel-Buffering": "no",
};
