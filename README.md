# Capplay

Base inicial do SaaS Capplay para criação de conteúdo de marketing e e-commerce.

## Estado atual

Esta primeira versão contém a interface web responsiva, navegação, formulários de briefing e estados explícitos para integrações pendentes. **Não é ainda um produto full-stack**: não há autenticação, persistência de projetos, geração de IA, checkout ou saldo de créditos ativo.

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
- `src/main.tsx`: entrada React.
- `index.html`: documento principal.

## Próximas etapas

1. Importar/conectar este repositório ao Lovable e refinar a interface.
2. Auditar OpenCreator e identificar módulos, licenças, dependências e requisitos operacionais reutilizáveis.
3. Definir arquitetura de backend hospedado; não conectar o frontend público diretamente ao daemon local do OpenCreator.
4. Implementar autenticação e autorização por usuário, banco de dados, storage privado e políticas de acesso.
5. Criar camada server-side para provedores de texto/imagem/vídeo, com segredos somente no servidor, limites, tratamento de falhas e registro de tarefas.
6. Adicionar fila/estado de tarefas, versões de resultado e histórico persistente.
7. Implementar cobrança e créditos somente após as gerações reais estarem testadas; usar webhooks verificados e operações idempotentes.
8. Testar responsividade, acessibilidade, segurança, erros e build antes de publicar.

## OpenCreator

OpenCreator é um workspace criativo open source com frontend React/Vite, daemon Fastify local, Codex CLI, SQLite/arquivos e ferramentas de mídia. Suas funções dependem de configuração local e de provedores/credenciais. Não presumir que todo recurso esteja disponível como API hospedada nem copiar o runtime local diretamente para produção.

## Transparência de produto

Nenhuma geração, integração, cobrança, autenticação ou persistência deve ser apresentada como ativa até que esteja implementada e testada de ponta a ponta.

## Geração real de texto e imagem (fase experimental)

Há endpoints server-side em `api/generate-text.ts` e `api/generate-image.ts`. Eles mantêm a chave do provedor no servidor e devolvem erros explícitos quando não estão habilitados.

Variáveis:
- `OPENAI_API_KEY`: segredo do provedor, somente nas Environment Variables da Vercel.
- `OPENAI_TEXT_MODEL`: opcional; padrão `gpt-4.1-mini`.
- `OPENAI_IMAGE_MODEL`: opcional; padrão `gpt-image-1`.
- `CAPPLAY_GENERATION_ENABLED`: permanece `false` por padrão.

**Segurança:** os endpoints ainda não têm autenticação de usuário nem limitação de uso persistente distribuída. Não ative `CAPPLAY_GENERATION_ENABLED=true` em produção pública até implementar autenticação, controle de gastos e rate limit persistente. O limite em memória incluído é apenas uma proteção auxiliar e não substitui controles de produção.
