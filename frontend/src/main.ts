import { createElement as h } from "@b9g/crank";
import { renderer } from "@b9g/crank/dom";
import { model } from "./model";
import { canvasStage } from "./canvas";
import { motionToggle } from "./client";
let result: any,
  input: any,
  playing = false,
  start = 0,
  clock = 0,
  voice = "wood",
  audio: AudioContext | undefined,
  gain: GainNode | undefined,
  timer: number | undefined,
  next = 0;
const active = new Set<OscillatorNode>(),
  play = document.querySelector<HTMLButtonElement>("#play")!,
  status = document.querySelector<HTMLElement>("#play-state")!,
  volume = document.querySelector<HTMLInputElement>("#volume")!;
function stop() {
  playing = false;
  if (timer) clearInterval(timer);
  timer = undefined;
  for (const osc of active) {
    try {
      osc.stop();
    } catch {}
  }
  active.clear();
  if (audio?.state === "running") void audio.suspend();
  play.textContent = "Ouvir o ritmo ▶";
  play.setAttribute("aria-pressed", "false");
  status.textContent = "Reprodução parada. O som depende do seu gesto.";
}
function note(at: number, track: string) {
  if (!audio || !gain) return;
  const osc = audio.createOscillator(),
    amp = audio.createGain(),
    base = voice === "metal" ? 700 : voice === "soft" ? 110 : 200;
  osc.type = voice === "metal" ? "triangle" : "sine";
  osc.frequency.setValueAtTime(base * (track === "a" ? 1 : 1.65), at);
  osc.frequency.exponentialRampToValueAtTime(base * 0.45, at + 0.09);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(0.42, at + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
  osc.connect(amp).connect(gain);
  active.add(osc);
  osc.onended = () => {
    active.delete(osc);
    osc.disconnect();
    amp.disconnect();
  };
  osc.start(at);
  osc.stop(at + 0.16);
}
async function begin() {
  if (playing) {
    stop();
    return;
  }
  if (!result) return;
  try {
    audio ??= new AudioContext();
    gain ??= audio.createGain();
    gain.gain.value = (+volume.value / 100) * 0.3;
    gain.connect(audio.destination);
    await audio.resume();
    start = audio.currentTime + 0.08;
    next = 0;
    playing = true;
    stage.redraw();
    play.textContent = "Parar reprodução ■";
    play.setAttribute("aria-pressed", "true");
    status.textContent =
      "Dois anéis, uma partitura. Som sintetizado localmente.";
    timer = window.setInterval(() => {
      if (!audio || !result) return;
      while (
        next < result.events.length &&
        start + result.events[next].at_seconds < audio.currentTime + 0.15
      ) {
        const e = result.events[next++];
        note(start + e.at_seconds, e.track);
      }
      if (audio.currentTime >= start + result.duration_seconds + 0.2) stop();
    }, 35);
  } catch {
    stop();
    status.textContent =
      "Este navegador não disponibilizou áudio. A partitura e o MIDI continuam disponíveis.";
  }
}
play.addEventListener("click", () => void begin());
volume.addEventListener("input", () => {
  if (gain) gain.gain.value = (+volume.value / 100) * 0.3;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
window.addEventListener(
  "pagehide",
  () => {
    stop();
    void audio?.close();
  },
  { once: true },
);
const stage = canvasStage(
  document.querySelector<HTMLCanvasElement>("#rhythm")!,
  (ctx, w, ht, t, r) => {
    ctx.clearRect(0, 0, w, ht);
    const x = w * 0.5,
      y = ht * 0.51,
      max = Math.min(w * 0.39, ht * 0.43);
    ctx.save();
    ctx.translate(x, y);
    const disc = ctx.createRadialGradient(
      -max * 0.3,
      -max * 0.4,
      0,
      0,
      0,
      max * 1.04,
    );
    disc.addColorStop(0, "#3e292c");
    disc.addColorStop(0.5, "#191719");
    disc.addColorStop(1, "#08090a");
    ctx.fillStyle = disc;
    ctx.shadowColor = "#0006";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 20;
    ctx.beginPath();
    ctx.arc(0, 0, max * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    for (let i = 0; i < 14; i++) {
      ctx.strokeStyle = "#fff1";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(0, 0, max * (0.34 + i * 0.05), 0, Math.PI * 2);
      ctx.stroke();
    }
    if (r) {
      const elapsed =
          playing && audio ? Math.max(0, audio.currentTime - start) : 0,
        current = Math.floor(elapsed / r.step_seconds) % r.steps;
      [r.a, r.b].forEach((sequence: number[], track: number) => {
        const radius = max * (track ? 0.63 : 0.88);
        sequence.forEach((v, i) => {
          const angle = (i / r.steps) * Math.PI * 2 - Math.PI / 2,
            xx = Math.cos(angle) * radius,
            yy = Math.sin(angle) * radius;
          ctx.fillStyle = v ? (track ? "#e7cfad" : "#e95b63") : "#4c4244";
          if (playing && i === current) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = track ? "#f2e0bf" : "#ef6370";
          }
          ctx.beginPath();
          ctx.arc(
            xx,
            yy,
            (v ? 7 : 3) * Math.max(0.6, w / 1250),
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });
      if (playing) {
        const angle =
          (elapsed / r.step_seconds / r.steps) * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = "#f2d7bc88";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * max * 0.25, Math.sin(angle) * max * 0.25);
        ctx.lineTo(Math.cos(angle) * max * 0.98, Math.sin(angle) * max * 0.98);
        ctx.stroke();
      }
      ctx.fillStyle = "#ead8c6";
      ctx.textAlign = "center";
      ctx.font = `${Math.max(38, max * 0.3)}px Georgia`;
      ctx.fillText(String(r.bpm), 0, 8);
      ctx.font = "10px monospace";
      ctx.fillText("BPM", 0, 32);
    }
    ctx.restore();
    return playing;
  },
);
function* Console(this: any) {
  const a = model(
    "rubato",
    () => this.refresh(),
    (r) => {
      stop();
      result = r;
      voice = a.d.input?.voice ?? "wood";
      stage.set(r);
      play.disabled = !r;
    },
  );
  a.api.compute = async (p) => {
    const r = await fetch("/api/rhythm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    const b = await r.json();
    if (!r.ok) throw new Error(b.message ?? "Confira os parâmetros do ritmo.");
    return b;
  };
  queueMicrotask(() => void a.init());
  const d = a.d,
    button = (text: string, fn: any, disabled = false, cls = "") =>
      h(
        "button",
        { onclick: fn, disabled: d.busy || disabled, class: cls },
        text,
      );
  try {
    for ({} of this)
      yield h(
        "div",
        { class: "rhythm-console" },
        h(
          "div",
          { class: "score-head" },
          h("span", null, "O DESENHO DO TEMPO"),
          h(
            "span",
            null,
            d.result
              ? d.result.coincidences + " ENCONTROS POR CICLO"
              : "A PARTITURA",
          ),
        ),
        d.catalog
          ? h(
              "div",
              { class: "knobs" },
              ...[
                ["steps", "Passos", 8, 32],
                ["hits_a", "Pulsos A", 0, d.input.steps],
                ["hits_b", "Pulsos B", 0, d.input.steps],
                ["rotation_a", "Rotação A", 0, d.input.steps - 1],
                ["rotation_b", "Rotação B", 0, d.input.steps - 1],
                ["bpm", "Tempo", 40, 180],
                ["bars", "Compassos", 1, 8],
              ].map(([key, label, min, max]) =>
                h(
                  "label",
                  null,
                  h(
                    "span",
                    null,
                    label,
                    h("output", null, d.input[key as string]),
                  ),
                  h("input", {
                    type: "range",
                    "aria-label": label,
                    min,
                    max,
                    step: 1,
                    value: d.input[key as string],
                    disabled: d.busy,
                    oninput: (e: Event) => {
                      const v = +(e.target as HTMLInputElement).value;
                      if (key === "steps") {
                        a.change("hits_a", Math.min(d.input.hits_a, v));
                        a.change("hits_b", Math.min(d.input.hits_b, v));
                        a.change(
                          "rotation_a",
                          Math.min(d.input.rotation_a, v - 1),
                        );
                        a.change(
                          "rotation_b",
                          Math.min(d.input.rotation_b, v - 1),
                        );
                      }
                      a.change(key as string, v);
                    },
                  }),
                ),
              ),
              h(
                "label",
                null,
                "Timbre",
                h(
                  "select",
                  {
                    "aria-label": "Timbre",
                    value: d.input.voice,
                    onchange: (e: Event) =>
                      a.change("voice", (e.target as HTMLSelectElement).value),
                  },
                  ...["wood", "metal", "soft"].map((id, i) =>
                    h(
                      "option",
                      { value: id },
                      ["Madeira", "Metal", "Suave"][i],
                    ),
                  ),
                ),
              ),
              button("Desenhar o ritmo ↗", () => a.run(), false, "calculate"),
            )
          : button("Tentar carregar o instrumento", () => a.init()),
        h("p", { role: "status", class: "status" }, d.error || d.status),
        d.catalog
          ? h(
              "div",
              { class: "presets" },
              ...d.catalog.presets.map((p: any) =>
                button(p.name + " ↗", () => a.preset(p)),
              ),
            )
          : null,
        d.result
          ? h(
              "div",
              { class: "notation" },
              h(
                "div",
                null,
                h("span", null, "A"),
                ...d.result.a.map((v: number, i: number) =>
                  h(
                    "b",
                    {
                      class: v ? "hit" : "rest",
                      "aria-label":
                        "Passo " + (i + 1) + (v ? " acento" : " pausa"),
                    },
                    v ? "●" : "·",
                  ),
                ),
              ),
              h(
                "div",
                null,
                h("span", null, "B"),
                ...d.result.b.map((v: number, i: number) =>
                  h(
                    "b",
                    {
                      class: v ? "hit" : "rest",
                      "aria-label":
                        "Passo " + (i + 1) + (v ? " acento" : " pausa"),
                    },
                    v ? "●" : "·",
                  ),
                ),
              ),
              h(
                "small",
                null,
                d.result.duration_seconds.toFixed(1) +
                  " s · " +
                  d.result.bars +
                  " compassos · partitura calculada no servidor",
              ),
            )
          : null,
        h(
          "section",
          { class: "pressing" },
          h(
            "div",
            null,
            h("span", null, "GUARDE ESTA PRENSAGEM"),
            h(
              "label",
              null,
              "Nome do ritmo",
              h("input", {
                "aria-label": "Nome do ritmo",
                maxlength: 48,
                value: d.title,
                oninput: (e: Event) =>
                  a.title((e.target as HTMLInputElement).value),
              }),
            ),
            button(
              d.current && d.owns ? "Salvar alterações ↗" : "Guardar ritmo ↗",
              () => a.save(),
              !d.result,
            ),
            h(
              "small",
              null,
              "Estudos por 7 dias. Acesso de edição nesta aba; MIDI da revisão salva.",
            ),
          ),
          h(
            "div",
            { class: "pressing-tools" },
            d.current
              ? h(
                  "div",
                  null,
                  button("Reler do banco", () => a.open(d.current.id)),
                  button("Exportar MIDI ↓", () => a.download()),
                  d.owns
                    ? button(
                        d.current.published ? "Encerrar link" : "Criar link",
                        () => a.share(),
                      )
                    : null,
                  button("Novo ritmo", () => a.fresh()),
                )
              : null,
            d.link
              ? h(
                  "a",
                  { href: d.link, target: "_blank", rel: "noreferrer" },
                  "Abrir ritmo compartilhado ↗",
                )
              : null,
            h(
              "details",
              null,
              h("summary", null, "Discos desta aba (" + d.archive.length + ")"),
              ...d.archive.map((x: any) =>
                button(x.title + " ↗", () => a.open(x.id)),
              ),
            ),
          ),
        ),
      );
  } finally {
    stop();
  }
}
const host = document.querySelector("#app-root")!;
host.replaceChildren();
renderer.render(h(Console, {}), host);
motionToggle((v) => {
  stage.pause(v);
  if (v) stop();
});
if (new URL(location.href).searchParams.has("record"))
  document.querySelector("#score")?.scrollIntoView();
