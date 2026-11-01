import { test } from "node:test";
import assert from "node:assert/strict";
import { service } from "../server/service.mjs";

test("every Euclidean sequence has exactly the requested number of pulses", () => {
  for (let steps = 8; steps <= 32; steps++)
    for (let hits = 0; hits <= steps; hits++) {
      const r = service.compute({
        ...service.meta.default_input,
        steps,
        hits_a: hits,
        hits_b: 0,
        rotation_a: 0,
        rotation_b: 0,
      });
      assert.equal(
        r.a.reduce((s, v) => s + v, 0),
        hits,
      );
    }
});
test("pulse gaps differ by at most one", () => {
  for (const hits of [3, 5, 7, 11]) {
    const r = service.compute({
      ...service.meta.default_input,
      steps: 24,
      hits_a: hits,
    });
    const indexes = r.a.flatMap((v, i) => (v ? [i] : [])),
      gaps = indexes.map(
        (v, i) => (indexes[(i + 1) % indexes.length] - v + 24) % 24,
      );
    assert.ok(Math.max(...gaps) - Math.min(...gaps) <= 1);
  }
});
test("events and duration correspond to tempo bars and pulses", () => {
  const p = service.meta.default_input,
    r = service.compute(p);
  assert.equal(r.events.length, (p.hits_a + p.hits_b) * p.bars);
  assert.equal(r.duration_seconds, (240 / p.bpm) * p.bars);
  assert.ok(
    r.events.every(
      (e) => e.at_seconds >= 0 && e.at_seconds < r.duration_seconds,
    ),
  );
});
test("MIDI is a real SMF type zero with exact track length and terminator", () => {
  const b = service.export(service.meta.default_input).bytes;
  assert.equal(new TextDecoder().decode(b.slice(0, 4)), "MThd");
  assert.equal(new TextDecoder().decode(b.slice(14, 18)), "MTrk");
  assert.equal(b[9], 0);
  assert.equal(b[11], 1);
  assert.equal(
    new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(18),
    b.length - 22,
  );
  assert.deepEqual([...b.slice(-3)], [255, 47, 0]);
});
test("silence exports a valid tempo and empty track ending", () => {
  const p = { ...service.meta.default_input, hits_a: 0, hits_b: 0 },
    r = service.compute(p),
    e = service.export(p);
  assert.equal(r.events.length, 0);
  assert.ok(e.bytes.length > 30);
});
test("out-of-cycle pulses rotation unknown fields rejected", () => {
  for (const x of [
    { steps: 8, hits_a: 9 },
    { steps: 8, rotation_a: 8 },
    { bpm: 181 },
    { bars: 0 },
    { extra: 1 },
  ])
    assert.throws(() =>
      service.compute({ ...service.meta.default_input, ...x }),
    );
});
