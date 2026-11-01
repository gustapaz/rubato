import ClientBoot from "./client-boot";
export default function Home() {
  return (
    <>
      <a className="skip" href="#instrument">
        Ir para o instrumento
      </a>
      <header>
        <a href="/" className="brand">
          rubato<span>RITMO É ESPAÇO</span>
        </a>
        <a href="#score">Partitura e arquivo ↘</a>
        <a href="/api-docs.html">Por dentro ↗</a>
      </header>
      <main id="instrument">
        <section className="turntable">
          <div className="turntable-top">
            <h1>
              Entre os pulsos,
              <br />
              <em>acontece.</em>
            </h1>
            <p>
              Dois ciclos.
              <br />
              Um encontro que
              <br />
              nunca soa igual.
            </p>
          </div>
          <span className="side-label">ESTUDO EUCLIDIANO / 01</span>
          <canvas
            id="rhythm"
            role="img"
            aria-label="Dois anéis com os pulsos euclidianos; a sequência textual aparece na partitura"
          />
          <div className="playback">
            <button id="play" disabled>
              Ouvir o ritmo ▶
            </button>
            <span id="play-state">
              O som começa somente quando você escolher ouvir.
            </span>
            <label>
              Volume
              <input
                id="volume"
                aria-label="Volume"
                type="range"
                min="0"
                max="100"
                value="45"
              />
            </label>
          </div>
          <div className="disc-labels">
            <span>ANEL A / MADEIRA</span>
            <span>ANEL B / RESPOSTA</span>
          </div>
        </section>
        <section id="score">
          <div id="app-root">
            <p>Preparando os intervalos…</p>
          </div>
        </section>
        <section className="listening">
          <figure>
            <img
              src="/media/subject.webp"
              alt="Instrumento de percussão real, sem marcas identificáveis"
              width="1200"
              height="800"
              loading="lazy"
            />
            <figcaption>
              Fotografia licenciada Pexels · créditos completos no repositório.
            </figcaption>
          </figure>
          <div>
            <span>UM PULSO TAMBÉM É UMA PAUSA</span>
            <h2>
              O silêncio
              <br />
              segura
              <br />
              <em>a música.</em>
            </h2>
            <p>
              Distribuir alguns acentos por um ciclo cria uma ideia. Sobrepor
              outra distribuição cria a conversa.
            </p>
            <p>
              Estes padrões são originais. O áudio é sintetizado no navegador; o
              arquivo MIDI é construído no servidor a partir da revisão que você
              guardou.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <strong>rubato</strong>
        <span>Uma experiência de Gustavo Paz.</span>
        <a href="/credits.html">Créditos e limites ↗</a>
        <a href="https://github.com/gustapaz/rubato">Código ↗</a>
        <button id="motion-toggle" aria-pressed="false">
          Pausar movimento
        </button>
      </footer>
      <ClientBoot />
    </>
  );
}
