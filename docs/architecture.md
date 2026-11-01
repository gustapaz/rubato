# Arquitetura

Modo integrado, conforme solution-contract.md. Crank.js consome Chanfana + Hono + Zod na mesma origem. SSR contém conteúdo, metadados e navegação; o bundle próprio monta depois da hidratação.

Distribuição modular euclidiana de pulsos; tempo e compassos reais. MIDI SMF tipo zero, canal de percussão e delta-times variáveis, gerado no servidor. Áudio local original, sem samples.

POST /api/rhythm: entrada de ritmo JSON, classe OpenAPIRoute/Chanfana; /api/native-openapi.json descreve a rota.

service.mjs: domínio e exportação. input-schema.mjs: restrições canônicas. validator.mjs: validação da stack. api.mjs: protocolo/router. store.mjs: D1, tokens, CAS, TTL e cotas. transport.mjs: bytes/UTF-8, origem, erros mascarados e cabeçalhos.

