# Próximas funcionalidades do Capplay

## Etapa 2 — Conta e dados reais
- Autenticação por e-mail com confirmação e recuperação de senha.
- Projetos persistentes vinculados ao usuário.
- Histórico de gerações com filtros por texto, imagem e vídeo.
- Biblioteca de arquivos com armazenamento privado.
- Isolamento de dados por usuário via Row Level Security (RLS).

## Etapa 3 — Geração segura
- Validar sessão no servidor antes de aceitar uma geração.
- Limites de uso persistentes por usuário e por IP.
- Controle de custo e créditos no servidor, nunca no navegador.
- Idempotência para evitar cobranças duplicadas.
- Registrar falhas sem armazenar chaves ou dados sensíveis nos logs.

## Etapa 4 — Monetização e mídia
- Planos e créditos com checkout real e webhook verificado.
- Integração de vídeo somente após escolher e configurar um provedor real.
- Upload de referências e download de arquivos gerados.

## Estado atual
A interface e as rotas iniciais de texto/imagem existem, mas a geração continua desativada por segurança até autenticação, limites persistentes e controles de custo estarem prontos. Este documento é um plano, não uma afirmação de que as integrações já estejam ativas.
