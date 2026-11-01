# RUBATO

Sequenciador euclidiano polirrítmico, partitura e exportação MIDI real.

[Experimentar a demo gratuita](https://rubato-gustapaz.starrylinen.chatgpt.site) · [API e modelo](https://rubato-gustapaz.starrylinen.chatgpt.site/api-docs.html) · [Contrato integrado](docs/solution-contract.md)

## Experiência e stack

Partitura circular em preto e carmim, anéis transportam pulsos; som sintetizado somente após gesto. Layout e movimento próprios, controles nativos por teclado, pausa explícita e prefers-reduced-motion.

- Frontend: **Crank.js**. Bundle independente em /experience/.
- Backend: **Chanfana + Hono + Zod**. Distribuição modular euclidiana de pulsos; tempo e compassos reais. MIDI SMF tipo zero, canal de percussão e delta-times variáveis, gerado no servidor. Áudio local original, sem samples.
- D1 persistente, SQL parametrizado, migrações Drizzle. Vinext/Worker para documento SSR e transporte, sem substituir a stack da interface. ClientBoot monta a experiência após a hidratação.

POST /api/rhythm: entrada de ritmo JSON, classe OpenAPIRoute/Chanfana; /api/native-openapi.json descreve a rota.

## O que funciona de verdade

Alterar condições → calcular no backend → guardar no D1 → reler/editar por revisão → criar/encerrar link de leitura → exportar a revisão salva. Algoritmos, validação, autorização e persistência são reais. Catálogos, nomes, cenários e medidas são sintéticos. Não há fallback silencioso para mocks quando a API falha.

Padrões originais e síntese local, sem músicas, samples ou serviços externos. O navegador só produz som após seu gesto explícito.

## Executar

Node.js 24+.

```sh
npm ci
npm test
npm run typecheck
npm run check
npm run build
npm run db:migrate
npm start -- --port 59200
# Em outro terminal:
npm run smoke -- http://127.0.0.1:59200
```

Banco local em .wrangler/state, ignorado pelo Git. Testes usam Miniflare e migrações reais em diretórios isolados. Gere novas migrações com npm run db:generate; não altere as já aplicadas. Testes não fazem reset de visitantes. Smoke cria e remove apenas seu próprio registro.

## Gratuidade e dados

Sem cartão, faturamento ou trial. Sites oferece runtime Worker e D1 nesta conta, sujeitos a disponibilidade e cotas, sem promessa de SLA ou gratuidade ilimitada permanente. Retenção de sete dias, 12 criações/hora UTC por demo, até trinta revisões e JSON UTF-8 de 16 KiB.

Token aleatório de recurso de 256 bits, somente digest no banco. Acesso de edição guardado na sessão desta aba; até doze acessos. Links contêm UUID sem token e permitem leitura, nunca edição. Não há recuperação de acesso, conta, senhas, pagamentos ou envio externo. Use somente dados sintéticos e exporte antes de fechar.

## Qualidade e operação

[Arquitetura](docs/architecture.md) · [Segurança](docs/security.md) · [Design](docs/design.md) · [Validação](docs/validation.md)

CI instala pelo lockfile e executa testes, tipos, formatação e build. Capturas e verificações públicas são adicionadas após os testes da demo. Nenhum resultado Lighthouse é declarado sem medição.

## Licenças

Código original [MIT](LICENSE), Gustavo Paz. [Fotografia real licenciada](docs/assets-license.md), [inventário e hashes](docs/assets.json), [dependências e fontes](docs/dependency-licenses.md), textos preservados em docs/third-party/. Não há músicas, marcas, personagens ou imagens de terceiros sem licença.

## Demonstração verificada

![Interface publicada](docs/screenshots/desktop.jpg)

[RUBATO — demo gratuita](https://rubato-gustapaz.starrylinen.chatgpt.site) · [Testes e evidências](docs/validation.md).
