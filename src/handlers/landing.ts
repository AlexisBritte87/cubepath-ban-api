const landingHtml = Bun.file(
  new URL("../../public/index.html", import.meta.url),
);

/** GET / — landing estática para probar la API desde el navegador. */
export function handleLandingGet(): Response {
  return new Response(landingHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
