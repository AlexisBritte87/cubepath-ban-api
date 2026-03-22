const server = Bun.serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    "/health": {
      GET: () =>
        Response.json({ status: "ok", timestamp: new Date().toISOString() }),
    },
  },
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
