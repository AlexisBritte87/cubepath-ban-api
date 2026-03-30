/** Un bloque SSE listo para escribir en el stream (UTF-8). */
export function formatSseEvent(event: string, data: string): string {
  return `event: ${event}\ndata: ${data}\n\n`;
}
