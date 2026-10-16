# Capplay

Base inicial do SaaS Capplay para criação de conteúdo de marketing e e-commerce.

## Estado atual

A interface web está conectada a endpoints server-side experimentais para geração real de texto e imagem via OpenAI. O histórico de status dessas tentativas é gravado no Lovable Cloud/Supabase quando o banco está configurado. Autenticação, créditos, cobrança, projetos persistentes e geração de vídeo ainda não estão implementados.

## Executar localmente

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

Para validar o build:

```bash
npm run build
```

## Estrutura

- `src/App.tsx`: navegação, dashboard, formulários e estados de interface.
- `src/index.css`: design system e layouts responsivos.
- `api/generate-image.ts`: geração real de imagens via OpenAI.
- `api/generate-text.ts`: geração real de textos via OpenAI.
- `api/_lib/generation-log.ts`: registro server-side dos estados no Supabase/Lovable Cloud.
- `supabase/migrations/202610160001_generation_logs.sql`: tabela de auditoria de gerações.

## Configuração da geração real

1. No Lovable, abra o projeto Capplay e confirme que o Lovable Cloud/Supabase está conectado ao projeto.
2. Execute o SQL de `supabase/migrations/202610160001_generation_logs.sql` no SQL Editor do projeto Supabase/Lovable Cloud.
3. Nas variáveis de ambiente do projeto Vercel, configure:
   - `OPENAI_API_KEY`: chave privada da OpenAI; nunca usar variável `VITE_*` para segredos.
   - `SUPABASE_URL` (ou `NEXT_PUBLIC_SUPABASE_URL`): URL do projeto Supabase/Lovable Cloud.
   - `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço privada do servidor; nunca expor no frontend.
   - `OPENAI_IMAGE_MODEL`: opcional, padrão `gpt-image-1`.
   - `OPENAI_TEXT_MODEL`: opcional, padrão `gpt-4.1-mini`.
4. Faça novo deploy na Vercel.
5. Mantenha `CAPPLAY_GENERATION_ENABLED=false` até implementar e testar autenticação/autorização, limites de gasto e rate limit persistente. O limite atual em memória é apenas auxiliar e não é proteção suficiente para uma API pública.

A tabela `generation_logs` registra tipo, provedor, modelo, status (`pending`, `succeeded`, `failed`), duração, código de erro e horários. Ela não guarda o prompt nem o conteúdo gerado. RLS fica ativado sem políticas para o cliente; somente o backend com a chave de serviço pode escrever nela.

A interface só exibe sucesso quando o provedor devolve o conteúdo e o backend confirma o registro de sucesso no banco. Falhas de provedor ou de persistência são retornadas como erro explícito; nenhum resultado é simulado.

## OpenCreator

OpenCreator é um workspace criativo open source com frontend React/Vite, daemon Fastify local, Codex CLI, SQLite/arquivos e ferramentas de mídia. Suas funções dependem de configuração local e de provedores/credenciais. Não presumir que todo recurso esteja disponível como API hospedada nem copiar o runtime local diretamente para produção.

## Próximas etapas

1. Implementar autenticação e autorização por usuário.
2. Adicionar rate limit persistente e limites de custo antes de habilitar geração pública.
3. Persistir projetos e resultados em storage privado, com autorização por usuário.
4. Adicionar fila/estado de tarefas e histórico visível na interface.
5. Implementar cobrança e créditos somente após as gerações reais estarem testadas; usar webhooks verificados e operações idempotentes.
6. Implementar um provedor de vídeo real e testar responsividade, acessibilidade, segurança e build.

Nenhuma geração, integração, cobrança, autenticação ou persistência deve ser apresentada como ativa até que esteja implementada e testada de ponta a ponta.
