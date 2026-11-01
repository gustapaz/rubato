import { validateInput } from "./validator.mjs";
import { fail } from "./errors.mjs";
export const meta = {
  slug: "rubato",
  title: "RUBATO",
  engine: "chanfana-zod-euclidean-midi",
  default_input: {
    steps: 16,
    hits_a: 5,
    hits_b: 7,
    rotation_a: 0,
    rotation_b: 2,
    bpm: 100,
    bars: 2,
    voice: "wood",
  },
  presets: [
    {
      name: "Cinco sobre sete",
      input: {
        steps: 16,
        hits_a: 5,
        hits_b: 7,
        rotation_a: 0,
        rotation_b: 2,
        bpm: 100,
        bars: 2,
        voice: "wood",
      },
    },
    {
      name: "Pulso quebrado",
      input: {
        steps: 12,
        hits_a: 4,
        hits_b: 5,
        rotation_a: 1,
        rotation_b: 0,
        bpm: 86,
        bars: 4,
        voice: "metal",
      },
    },
    {
      name: "O intervalo",
      input: {
        steps: 24,
        hits_a: 3,
        hits_b: 8,
        rotation_a: 0,
        rotation_b: 5,
        bpm: 72,
        bars: 2,
        voice: "soft",
      },
    },
  ],
  note: "Padrões originais e síntese local, sem músicas, samples ou serviços externos. O navegador só produz som após seu gesto explícito.",
};
export function validate(raw) {
  const p = validateInput(raw);
  if (
    p.hits_a > p.steps ||
    p.hits_b > p.steps ||
    p.rotation_a >= p.steps ||
    p.rotation_b >= p.steps
  )
    fail(
      "invalid_input",
      "Pulsos e rotações precisam caber na quantidade de passos.",
    );
  return p;
}
export function rhythm(steps, hits, rotation) {
  return Array.from({ length: steps }, (_, i) =>
    hits > 0 ? +((((i - rotation + steps) % steps) * hits) % steps < hits) : 0,
  );
}
export function compute(raw) {
  const p = validate(raw),
    a = rhythm(p.steps, p.hits_a, p.rotation_a),
    b = rhythm(p.steps, p.hits_b, p.rotation_b),
    step_seconds = 240 / p.bpm / p.steps,
    events = [];
  for (let bar = 0; bar < p.bars; bar++)
    for (let i = 0; i < p.steps; i++) {
      if (a[i])
        events.push({
          step: bar * p.steps + i,
          at_seconds: (bar * p.steps + i) * step_seconds,
          track: "a",
        });
      if (b[i])
        events.push({
          step: bar * p.steps + i,
          at_seconds: (bar * p.steps + i) * step_seconds,
          track: "b",
        });
    }
  return {
    a,
    b,
    events,
    steps: p.steps,
    bars: p.bars,
    step_seconds,
    duration_seconds: (240 / p.bpm) * p.bars,
    coincidences: a.reduce((s, v, i) => s + v * b[i], 0),
    bpm: p.bpm,
  };
}
export function variable(value) {
  const result = [value & 127];
  while ((value >>= 7)) result.unshift((value & 127) | 128);
  return result;
}
export function midi(raw) {
  const p = validate(raw),
    r = compute(p),
    events = [],
    notes =
      p.voice === "metal" ? [42, 46] : p.voice === "soft" ? [64, 65] : [37, 76],
    tempo = Math.round(60000000 / p.bpm);
  for (const e of r.events) {
    const tick = Math.round((e.step * 1920) / p.steps),
      note = notes[e.track === "a" ? 0 : 1];
    events.push(
      { tick, priority: 1, bytes: [0x99, note, e.track === "a" ? 100 : 76] },
      {
        tick: tick + Math.max(1, Math.min(96, Math.floor(1920 / p.steps / 3))),
        priority: 0,
        bytes: [0x89, note, 0],
      },
    );
  }
  events.sort(
    (a, b) =>
      a.tick - b.tick || a.priority - b.priority || a.bytes[1] - b.bytes[1],
  );
  const track = [
    0,
    0xff,
    0x51,
    3,
    (tempo >> 16) & 255,
    (tempo >> 8) & 255,
    tempo & 255,
    0,
    0xff,
    0x58,
    4,
    4,
    2,
    24,
    8,
  ];
  let previous = 0;
  for (const e of events) {
    track.push(...variable(e.tick - previous), ...e.bytes);
    previous = e.tick;
  }
  track.push(...variable(p.bars * 1920 - previous), 0xff, 0x2f, 0);
  const n = track.length;
  return new Uint8Array([
    77,
    84,
    104,
    100,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    1,
    224,
    77,
    84,
    114,
    107,
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
    ...track,
  ]);
}
export function exportResult(input) {
  return { type: "audio/midi", extension: "mid", bytes: midi(input) };
}
export const service = { meta, validate, compute, export: exportResult };
