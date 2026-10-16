# Auditoria inicial — OpenCreator

Data: 2026-10-16  
Repositório de referência: https://github.com/krillinai/OpenCreator  
Licença indicada no repositório: Apache-2.0 (revisar avisos e licenças de cada dependência/asset antes de redistribuir).

## O que o projeto de referência oferece

A documentação pública descreve um workspace criativo com ferramentas para textos/roteiros, imagens, vídeos, voz, tradução e edição. A arquitetura publicada é composta por:

- `apps/web`: frontend React 18, Vite e TypeScript.
- `apps/daemon`: Runtime local baseado em Fastify e API do workspace.
- `apps/desktop`: host Electron e recursos específicos do sistema operacional.
- `apps/harness`: ferramenta de verificação do Runtime.
- `packages/protocol`: contratos compartilhados.
- `packages/skill-market`: modelos/lógica de Skills.
- Persistência local por SQLite e arquivos; execução de agentes via Codex CLI; ferramentas de mídia como FFmpeg e yt-dlp.

## Decisão para Capplay

**Reaproveitar ideias e módulos após inspeção, não copiar o Runtime inteiro para hospedagem web.**

O frontend público do Capplay não deve chamar diretamente o daemon local do OpenCreator. O daemon foi desenhado para execução local/loopback, com dados e credenciais no ambiente do usuário. Isso não equivale a uma API SaaS multiusuário pronta para produção.

## Auditoria de código necessária antes de importar módulos

- [ ] Inspecionar a árvore atual e os manifests de `apps/web`, `apps/daemon` e `packages`.
- [ ] Identificar componentes de UI e fluxos de criação reutilizáveis.
- [ ] Identificar chamadas API, contratos, dependências nativas e acessos ao filesystem.
- [ ] Confirmar quais provedores possuem integração real e quais exigem chaves/contas externas.
- [ ] Mapear dependências de Codex CLI, FFmpeg, yt-dlp, Whisper e serviços externos.
- [ ] Verificar licenças de bibliotecas, modelos, templates, imagens e demais assets.
- [ ] Separar o que é reutilizável no browser do que precisa de worker/servidor próprio.
- [ ] Registrar testes e critérios de aceitação antes de portar código.

## Arquitetura alvo do Capplay

1. **Frontend:** React/TypeScript; formulários e status honestos de cada tarefa.
2. **Autenticação:** identidade de usuário e autorização por recurso.
3. **Banco de dados:** usuários, projetos, tarefas, versões, metadados e uso.
4. **Storage privado:** arquivos por usuário/projeto, URLs assinadas e regras de acesso.
5. **API server-side:** chamadas aos provedores com segredos mantidos somente no servidor.
6. **Fila de tarefas:** processamento assíncrono para mídia e tarefas longas, estados pendente/em execução/concluída/falha e logs sanitizados.
7. **Créditos/cobrança:** implementar somente após medir custos e validar gerações reais; webhooks verificados, idempotência e reconciliação.
8. **Observabilidade e segurança:** limites de uso, timeout, retries controlados, auditoria sem registrar chaves, testes de isolamento e proteção contra abuso.

## Critérios para declarar um recurso pronto

- O provedor está realmente conectado e a credencial é validada no servidor.
- Uma requisição de teste produz resultado real ou erro real, com status correto.
- O resultado é salvo e acessível apenas ao usuário autorizado.
- Falhas e timeouts não consomem créditos indevidamente.
- Nenhuma API key aparece no bundle do frontend ou em logs.
- A experiência explica claramente limitações, duração e custo quando conhecidos.

## Referências

- OpenCreator: https://github.com/krillinai/OpenCreator
- README: https://github.com/krillinai/OpenCreator/blob/master/README.md
- Licença: https://github.com/krillinai/OpenCreator/blob/master/LICENSE
