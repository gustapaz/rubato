import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../server/api.mjs";
import { service } from "../server/service.mjs";
const api = createApi({});
const request = (path, body) =>
  api(
    new Request("https://demo.local" + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
test("Chanfana native route calculates the same rhythm", async () => {
  const r = await request("/api/rhythm", service.meta.default_input);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), service.compute(service.meta.default_input));
});
test("native rhythm rejects cross-field invalid hits", async () => {
  assert.equal(
    (
      await request("/api/rhythm", {
        ...service.meta.default_input,
        steps: 8,
        hits_a: 9,
      })
    ).status,
    422,
  );
});
test(
  "oversized native requests terminate with 413, including cloned bodies",
  { timeout: 2000 },
  async () => {
    const r = await api(
      new Request("https://demo.local/api/rhythm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "x".repeat(17000),
      }),
    );
    assert.equal(r.status, 413);
  },
);
