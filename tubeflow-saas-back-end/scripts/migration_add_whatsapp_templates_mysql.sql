-- Script de migracao para adicionar templates de WhatsApp no MySQL
-- Data: 2026-01-08
-- Descricao: Adiciona campos para templates customizaveis de mensagens WhatsApp

ALTER TABLE settings
  ADD COLUMN status_change_template TEXT DEFAULT 'Olá, {name}! O vídeo "{titulo}" teve seu status alterado de "{status_antigo}" para "{status_novo}" por {quem_alterou}.';

ALTER TABLE settings
  ADD COLUMN welcome_template TEXT DEFAULT 'Olá, {name}! Seja bem-vindo(a) ao TubeFlow! Suas credenciais de acesso são:\n\nEmail: {email}\nSenha: {password}\n\nFaça login em https://tubeflow10x.com para começar!';

ALTER TABLE settings
  ADD COLUMN whatsapp_api_url VARCHAR(255) NULL;

-- Verificar se os campos foram adicionados com sucesso:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'settings'
--   AND column_name IN ('status_change_template', 'welcome_template');
