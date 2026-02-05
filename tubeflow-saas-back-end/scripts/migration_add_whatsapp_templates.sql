-- Script de migração para adicionar novos campos de templates de WhatsApp
-- Data: 2026-01-08
-- Descrição: Adiciona campos para templates customizáveis de mensagens WhatsApp

-- Para PostgreSQL:
-- Adicionar campo para template de mudança de status
ALTER TABLE settings ADD COLUMN IF NOT EXISTS status_change_template TEXT DEFAULT 'Olá, {name}! O vídeo "{titulo}" teve seu status alterado de "{status_antigo}" para "{status_novo}" por {quem_alterou}.';

-- Adicionar campo para template de boas-vindas
ALTER TABLE settings ADD COLUMN IF NOT EXISTS welcome_template TEXT DEFAULT 'Olá, {name}! Seja bem-vindo(a) ao TubeFlow! Suas credenciais de acesso são:

Email: {email}
Senha: {password}

Faça login em https://tubeflow10x.com para começar!';

-- Adicionar campo para URL da API WhatsApp (customizavel por empresa)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp_api_url TEXT;

-- Comentários descrevendo os campos
COMMENT ON COLUMN settings.status_change_template IS 'Template customizável para notificações de mudança de status. Variáveis: {name}, {titulo}, {status_antigo}, {status_novo}, {quem_alterou}';
COMMENT ON COLUMN settings.welcome_template IS 'Template customizável para mensagens de boas-vindas. Variáveis: {name}, {email}, {password}';
COMMENT ON COLUMN settings.whatsapp_api_url IS 'URL da API WhatsApp para envio de mensagens';

-- Para MySQL:
-- Se estiver usando MySQL ao invés de PostgreSQL, use os comandos abaixo:

-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS status_change_template TEXT DEFAULT 'Olá, {name}! O vídeo "{titulo}" teve seu status alterado de "{status_antigo}" para "{status_novo}" por {quem_alterou}.';
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS welcome_template TEXT DEFAULT 'Olá, {name}! Seja bem-vindo(a) ao TubeFlow! Suas credenciais de acesso são:\n\nEmail: {email}\nSenha: {password}\n\nFaça login em https://tubeflow10x.com para começar!';
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp_api_url TEXT;

-- Verificar se os campos foram adicionados com sucesso:
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'settings' AND column_name IN ('status_change_template', 'welcome_template');
