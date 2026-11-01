export const inputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "steps",
    "hits_a",
    "hits_b",
    "rotation_a",
    "rotation_b",
    "bpm",
    "bars",
    "voice",
  ],
  properties: {
    steps: { type: "integer", minimum: 8, maximum: 32 },
    hits_a: { type: "integer", minimum: 0, maximum: 32 },
    hits_b: { type: "integer", minimum: 0, maximum: 32 },
    rotation_a: { type: "integer", minimum: 0, maximum: 31 },
    rotation_b: { type: "integer", minimum: 0, maximum: 31 },
    bpm: { type: "integer", minimum: 40, maximum: 180 },
    bars: { type: "integer", minimum: 1, maximum: 8 },
    voice: { type: "string", enum: ["wood", "metal", "soft"] },
  },
};
