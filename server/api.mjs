import { routeTable, simpleDispatch } from "./routes.mjs";
import { service } from "./service.mjs";
import { guarded, errorResponse, readJson } from "./transport.mjs";
import { fail } from "./errors.mjs";
import { Hono } from "hono";
import { fromHono, OpenAPIRoute } from "chanfana";
import { schema } from "./validator.mjs";
class Rhythm extends OpenAPIRoute {
  schema = {
    request: { body: { content: { "application/json": { schema } } } },
  };
  async handle() {
    const data = await this.getValidatedData();
    return Response.json(service.compute(data.body));
  }
}
export function createApi(db, clock) {
  const app = new Hono();
  app.onError((e) => errorResponse(e, crypto.randomUUID()));
  const native = fromHono(app, {
    docs_url: null,
    redoc_url: null,
    openapi_url: "/api/native-openapi.json",
  });
  native.post("/api/rhythm", Rhythm);
  for (const [method, path, handler] of routeTable(db, service, clock))
    app.on(method, path, (c) => handler(c.req.raw, c.req.param()));
  app.notFound(() =>
    Response.json(
      { code: "not_found", message: "Endpoint não encontrado." },
      { status: 404 },
    ),
  );
  return guarded(async (req) => {
    if (new URL(req.url).search)
      fail("invalid_query", "Parâmetros de URL não são aceitos.", 400);
    if (new URL(req.url).pathname === "/api/rhythm")
      await readJson(req.clone());
    return app.fetch(req);
  });
}
