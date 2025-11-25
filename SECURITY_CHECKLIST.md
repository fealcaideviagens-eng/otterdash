# 🔐 CHECKLIST DE SEGURANÇA - AÇÃO IMEDIATA

## 🚨 URGENTE - FAÇA AGORA (15-30 minutos)

### Passo 1: Remover .env do Git
```bash
cd /Users/ericamatsuura/Desktop/Projeto/otterdash

# Remover do tracking
git rm --cached .env

# Commitar
git commit -m "security: Remove .env from Git tracking"
```
- [ ] Executado

---

### Passo 2: Limpar Histórico do Git
```bash
# ATENÇÃO: Isso reescreve o histórico!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```
- [ ] Executado

---

### Passo 3: Force Push
```bash
# Enviar mudanças
git push origin --force --all
git push origin --force --tags
```
- [ ] Executado

---

### Passo 4: Gerar Novas Credenciais

1. Acesse: https://supabase.com/dashboard/project/nbohxcprperhkbdutpfe/settings/api
2. Clique em "Reset" na `anon` key
3. Copie a nova chave

- [ ] Nova chave gerada
- [ ] Nova chave copiada

---

### Passo 5: Atualizar .env

Edite o arquivo `.env` e cole a nova chave:

```bash
VITE_SUPABASE_PROJECT_ID="nbohxcprperhkbdutpfe"
VITE_SUPABASE_URL="https://nbohxcprperhkbdutpfe.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="COLE_A_NOVA_CHAVE_AQUI"
```

- [ ] Arquivo .env atualizado

---

### Passo 6: Testar Aplicação

```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

Teste:
1. Fazer login
2. Fazer cadastro
3. Verificar se não há erros no console

- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Sem erros no console

---

## ⚠️ IMPORTANTE - FAÇA HOJE

### Passo 7: Configurar RLS no Supabase

1. Acesse: https://supabase.com/dashboard/project/nbohxcprperhkbdutpfe/sql
2. Cole e execute este SQL:

```sql
-- Habilitar RLS
ALTER TABLE ops_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_completed ENABLE ROW LEVEL SECURITY;

-- Políticas para ops_registry
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

-- Políticas para ops_completed
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

- [ ] SQL executado com sucesso
- [ ] RLS ativado em todas as tabelas

---

### Passo 8: Verificar Logs de Acesso

1. Acesse: https://supabase.com/dashboard/project/nbohxcprperhkbdutpfe/logs
2. Vá em "API Logs"
3. Procure por acessos suspeitos

- [ ] Logs verificados
- [ ] Nenhum acesso suspeito encontrado

---

## 📋 VERIFICAÇÃO FINAL

### Testes de Segurança

#### Teste 1: Validação de Email
1. Tente cadastrar com email: `invalido`
2. Deve mostrar: "Email inválido"

- [ ] ✅ Validação funcionando

#### Teste 2: Validação de Senha
1. Tente cadastrar com senha: `123`
2. Deve mostrar: "A senha deve ter no mínimo 8 caracteres"

- [ ] ✅ Validação funcionando

#### Teste 3: Rate Limiting
1. Tente fazer login 6 vezes com senha errada
2. Na 6ª tentativa deve mostrar: "Muitas tentativas..."

- [ ] ✅ Rate limiting funcionando

#### Teste 4: Feedback Visual
1. No cadastro, digite uma senha
2. Deve aparecer indicadores verdes/cinza

- [ ] ✅ Feedback visual funcionando

---

## ✅ CONCLUSÃO

Quando TODOS os itens acima estiverem marcados:

- [ ] Todas as ações urgentes foram executadas
- [ ] Novas credenciais foram geradas
- [ ] RLS está configurado
- [ ] Testes de segurança passaram
- [ ] Aplicação está funcionando normalmente

---

## 📞 PRECISA DE AJUDA?

Se algo deu errado:

1. **NÃO entre em pânico**
2. **Leia a mensagem de erro** com atenção
3. **Verifique os logs** do terminal
4. **Consulte a documentação:**
   - `SECURITY_ALERT.md` - Detalhes técnicos
   - `SECURITY_IMPROVEMENTS.md` - Documentação completa
   - `EXECUTIVE_SUMMARY.md` - Visão geral

---

**Status Atual:** 🔴 AÇÃO NECESSÁRIA  
**Tempo Estimado:** 15-30 minutos  
**Prioridade:** 🚨 CRÍTICA

**Depois de completar:** Status mudará para 🟢 SEGURO
