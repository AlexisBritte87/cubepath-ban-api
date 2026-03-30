/** GET /health — comprobación simple de que el proceso HTTP responde. */
export function handleHealthGet(): Response {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
