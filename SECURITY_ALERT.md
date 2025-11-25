# ⚠️ ALERTA DE SEGURANÇA CRÍTICO

## 🚨 Problema Detectado

O arquivo `.env` foi commitado no histórico do Git, expondo suas credenciais do Supabase publicamente.

**Commits encontrados:**
- `3641158569f6d2021dd5a15c405fa6c706e832da` - feat: Implement user authentication
- `c54e7dc4ec91151b98e9fe85732c9592ca75d742` - Remove login functionality
- `054aa0e21ce0d1b5b2c47f96d60ee8d33a9a239c` - Fix Google login connection error

---

## 🛡️ AÇÕES IMEDIATAS NECESSÁRIAS

### 1. Remover .env do Histórico do Git (URGENTE)

Execute os seguintes comandos **NA ORDEM**:

```bash
# 1. Remover .env do tracking do Git (mas manter o arquivo local)
git rm --cached .env

# 2. Commitar a remoção
git commit -m "security: Remove .env from Git tracking"

# 3. Remover .env de TODO o histórico do Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 4. Forçar push (CUIDADO: isso reescreve o histórico)
git push origin --force --all
git push origin --force --tags
```

**⚠️ ATENÇÃO:**
- `git filter-branch` reescreve o histórico do Git
- Se outras pessoas têm clones do repositório, elas precisarão fazer `git pull --rebase`
- Se o repositório é público, as credenciais JÁ FORAM EXPOSTAS

---

### 2. Rotacionar Credenciais do Supabase (CRÍTICO)

Como as credenciais foram expostas, você DEVE gerar novas:

1. **Acesse o Supabase Dashboard:**
   - https://supabase.com/dashboard/project/nbohxcprperhkbdutpfe/settings/api

2. **Gere uma Nova API Key:**
   - Vá em "Settings" → "API"
   - Role até "Project API keys"
   - Clique em "Reset" na `anon` key
   - **IMPORTANTE:** Isso invalidará a chave antiga

3. **Atualize o arquivo .env:**
   ```bash
   VITE_SUPABASE_PROJECT_ID="nbohxcprperhkbdutpfe"
   VITE_SUPABASE_URL="https://nbohxcprperhkbdutpfe.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="NOVA_CHAVE_AQUI"
   ```

4. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

### 3. Verificar Uso Não Autorizado

1. **Acesse o Supabase Dashboard:**
   - https://supabase.com/dashboard/project/nbohxcprperhkbdutpfe

2. **Verifique Logs de Acesso:**
   - Vá em "Logs" → "API Logs"
   - Procure por acessos suspeitos ou não reconhecidos
   - Verifique IPs e timestamps

3. **Verifique Dados:**
   - Vá em "Table Editor"
   - Verifique se há dados não autorizados
   - Verifique usuários cadastrados

---

### 4. Configurar Row Level Security (RLS)

**IMPORTANTE:** Mesmo com a nova chave, configure RLS para proteger seus dados:

1. **Acesse o SQL Editor:**
   - https://supabase.com/dashboard/project/nbohxcprperhkbdutpfe/sql

2. **Execute para cada tabela:**
   ```sql
   -- Habilitar RLS
   ALTER TABLE ops_registry ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ops_completed ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ativos_parametros ENABLE ROW LEVEL SECURITY;
   
   -- Política: Usuários só veem seus próprios dados
   CREATE POLICY "Users can only see their own data" 
   ON ops_registry FOR SELECT 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can only insert their own data" 
   ON ops_registry FOR INSERT 
   WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can only update their own data" 
   ON ops_registry FOR UPDATE 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can only delete their own data" 
   ON ops_registry FOR DELETE 
   USING (auth.uid() = user_id);
   
   -- Repetir para ops_completed
   CREATE POLICY "Users can only see their own completed" 
   ON ops_completed FOR SELECT 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can only insert their own completed" 
   ON ops_completed FOR INSERT 
   WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can only update their own completed" 
   ON ops_completed FOR UPDATE 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can only delete their own completed" 
   ON ops_completed FOR DELETE 
   USING (auth.uid() = user_id);
   ```

---

## 📋 Checklist de Recuperação

- [ ] Remover .env do Git tracking (`git rm --cached .env`)
- [ ] Limpar histórico do Git (`git filter-branch`)
- [ ] Force push para remoto (`git push --force`)
- [ ] Gerar nova API Key no Supabase
- [ ] Atualizar .env com nova chave
- [ ] Verificar logs de acesso no Supabase
- [ ] Verificar dados não autorizados
- [ ] Configurar RLS em todas as tabelas
- [ ] Testar aplicação com novas credenciais
- [ ] Notificar colaboradores sobre reescrita do histórico

---

## 🔒 Prevenção Futura

1. ✅ `.env` já foi adicionado ao `.gitignore`
2. ✅ Criado `.env.example` como template
3. ✅ Validação de variáveis de ambiente implementada
4. ⚠️ Configure pre-commit hooks para prevenir commits de .env:

```bash
# Instalar husky
npm install --save-dev husky

# Inicializar husky
npx husky init

# Criar hook pre-commit
echo '#!/bin/sh
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo "❌ ERRO: Tentativa de commit do arquivo .env bloqueada!"
  echo "O arquivo .env contém credenciais sensíveis e não deve ser commitado."
  exit 1
fi' > .husky/pre-commit

chmod +x .husky/pre-commit
```

---

## 📞 Suporte

Se você não se sentir confortável executando esses comandos:

1. **Backup:** Faça backup do projeto antes de qualquer ação
2. **Teste Local:** Teste em um clone separado primeiro
3. **Ajuda:** Peça ajuda se necessário

**Lembre-se:** A segurança dos dados dos seus usuários está em jogo!

---

**Status:** 🔴 AÇÃO IMEDIATA NECESSÁRIA  
**Prioridade:** 🚨 CRÍTICA  
**Tempo Estimado:** 15-30 minutos
