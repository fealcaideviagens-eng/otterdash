# Mapeamento de Cores - Plano de Padronização

Este documento mapeia todos os tokens de cor definidos no sistema e todas as cores hardcoded que fogem dos tokens, para facilitar a padronização futura.

## 1. Tokens de Cor Definidos (CSS Variables)

### 1.1 Tokens Base (src/index.css)

#### Cores Semânticas
- `--background`: `44 19% 97%` (#F9F8F5)
- `--foreground`: `220 23% 10%` (quase preto para textos gerais)
- `--card`: `0 0% 100%` (#FFFFFF)
- `--card-foreground`: `0 0% 0%`
- `--popover`: `0 0% 100%`
- `--popover-foreground`: `0 0% 0%`
- `--primary`: `216 45% 39%` (azul #263C64 usado nos botões)
- `--primary-foreground`: `0 0% 100%`
- `--secondary`: `44 19% 95%`
- `--secondary-foreground`: `0 0% 0%`
- `--muted`: `44 19% 95%`
- `--muted-foreground`: `216, 43%, 27%` (purple-dark/azul)
- `--accent`: `0 0% 95%`
- `--accent-foreground`: `0 0% 0%`
- `--destructive`: `0 84% 60%`
- `--destructive-foreground`: `0 0% 100%`
- `--border`: `44 19% 90%`
- `--input`: `0 0% 89%`
- `--ring`: `0 0% 0%`

#### Cores de Marca (Brand)
- `--brand-purple`: `216, 45%, 39%` (equivalente ao primary)
- `--brand-purple-light`: `216, 50%, 60%`
- `--brand-purple-dark`: `216, 43%, 27%`
- `--brand-gradient`: `linear-gradient(135deg, hsl(216, 50%, 60%), hsl(216, 43%, 27%))`

#### Cores Financeiras
- `--profit`: `142 76% 36%`
- `--loss`: `0 84% 60%`
- `--profit-bg`: `142 76% 95%`
- `--loss-bg`: `0 84% 95%`

#### Sidebar
- `--sidebar-background`: `0 0% 0%` (preto)
- `--sidebar-foreground`: `0 0% 100%` (branco)
- `--sidebar-primary`: `0 0% 100%`
- `--sidebar-primary-foreground`: `0 0% 0%`
- `--sidebar-accent`: `0 0% 100% / 0.15` (branco com 15% opacidade)
- `--sidebar-accent-foreground`: `0 0% 100%`
- `--sidebar-border`: `0 0% 20%` (cinza escuro)
- `--sidebar-ring`: `0 0% 100%`

#### Outros
- `--placeholder`: `0 0% 70%` (70% do preto para placeholders)
- `--radius`: `0.75rem`

### 1.2 Tokens no Tailwind Config (tailwind.config.ts)

Os tokens acima são mapeados para classes Tailwind através do arquivo `tailwind.config.ts`:
- `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`
- `sidebar.*` (background, foreground, primary, accent, border, ring)
- `brand-purple` (DEFAULT, light, dark)

### 1.3 Classes Utilitárias Customizadas (src/index.css)

- `.text-profit` → usa `--profit`
- `.text-loss` → usa `--loss`
- `.bg-profit` → usa `--profit-bg`
- `.bg-loss` → usa `--loss-bg`
- `.bg-brand-purple` → usa `--brand-purple`
- `.text-brand-purple` → usa `--brand-purple`
- `.hover-brand-purple:hover` → usa `--brand-purple-dark`
- `.gradient-brand` → usa `--brand-gradient`

## 2. Cores Hardcoded Encontradas (Fora dos Tokens)

### 2.1 Cores HEX Hardcoded

#### Azul Primário (#263C64) - Deveria usar `primary` ou `brand-purple`
**Ocorrências: 20+**
- `src/pages/CadastroOpcao.tsx:2772` - `bg-[#263C64] hover:bg-[#1e3050]`
- `src/pages/CadastroRapido.tsx:338` - `bg-[#263C64] hover:bg-[#1e3050]`
- `src/pages/ListaOpcoes.tsx:554,555` - `hover:bg-[#1e3050]` e `style={{ backgroundColor: '#263C64' }}`
- `src/pages/ListaOpcoes.tsx:848` - `border-[#263C64] ring-2 ring-[#263C64]/20`
- `src/pages/Garantias.tsx:193,278` - `bg-[#263C64]`
- `src/components/operations/SuccessModal.tsx:54` - `bg-[#263C64] hover:bg-[#1e3050]`
- `src/components/opcoes/StrategyCard.tsx:52,179` - `border-[#263C64]` e `style={{ backgroundColor: '#263C64' }}`
- `src/components/operations/smart-flow/DraftsList.tsx:229` - `bg-[#263C64] hover:bg-[#1e3050]`
- `src/components/navigation/Sidebar.tsx:35,95` - `style={{ backgroundColor: '#263C64' }}`
- `src/pages/Dashboard.tsx:111` - `style={{ backgroundColor: '#263C64' }}`
- `src/pages/Metas.tsx:233,285` - `style={{ backgroundColor: '#263C64' }}`
- `src/components/ui/button.tsx:12` - `bg-[#263C64]`
- `src/components/ui/tabs.tsx:31` - `data-[state=active]:bg-[#263C64]`

**Variante hover (#1e3050) - Deveria usar `primary/90` ou criar token `--primary-hover`**
- Aparece junto com #263C64 em vários lugares

#### Verde de Sucesso/Compra (#307B58) - Deveria usar `--profit` ou criar token `--success`
**Ocorrências: 8+**
- `src/pages/ListaOpcoes.tsx:630,862` - `bg-[#307B58] text-white hover:bg-[#225B44]`
- `src/components/opcoes/StrategyCard.tsx:64` - `bg-[#307B58] hover:bg-[#225B44]`
- `src/components/dashboard/AlertasCard.tsx:296` - `bg-[#307B58] text-white hover:bg-[#225B44]`

**Variante hover (#225B44)**
- Aparece junto com #307B58

#### Vermelho de Venda/Erro (#D41010) - Deveria usar `--destructive` ou `--loss`
**Ocorrências: 2**
- `src/pages/ListaOpcoes.tsx:863` - `bg-[#D41010] text-white`

#### Bege/Creme (#F6F6E6) - Deveria usar token de background secundário
**Ocorrências: 10+**
- `src/pages/ListaOpcoes.tsx:638,639,871,872` - `bg-[#F6F6E6] text-gray-800`
- `src/components/opcoes/StrategyCard.tsx:67` - `bg-[#F6F6E6] text-gray-800`
- `src/components/dashboard/AlertasCard.tsx:235,289,302` - `bg-[#FBFBF2]` e `hover:bg-[#F6F6E6]`

#### Bege Claro (#FBFBF2) - Similar ao anterior
**Ocorrências: 2**
- `src/components/dashboard/AlertasCard.tsx:235,289` - `bg-[#FBFBF2]`

#### Bege Amarelado (#F1F0EA) - Deveria usar token
**Ocorrências: 1**
- `src/components/operations/StrategySelector.tsx:54` - `bg-[#F1F0EA] text-[#6D6845]`

#### Marrom/Amarelo Escuro (#6D6845) - Deveria usar token
**Ocorrências: 1**
- `src/components/operations/StrategySelector.tsx:54` - `text-[#6D6845]`

#### Azul Escuro Gradiente (#1C2E51) - Deveria usar `brand-purple-dark` ou criar token
**Ocorrências: 6**
- `src/pages/Index.tsx:27,30` - `to-[#1C2E51]` e `to-[#4a0047]`
- `src/components/sections/ProductSection.tsx:25,43,61,79,97,115` - `to-[#1C2E51]`
- `src/pages/ResetPassword.tsx:209` - `to-[#1C2E51]`
- `src/pages/EsqueciSenha.tsx:35` - `to-[#1C2E51]`
- `src/pages/Auth.tsx:62` - `to-[#1C2E51]`
- `src/components/sections/DonationSection.tsx:7` - `to-[#1C2E51]`

#### Roxo Escuro (#4a0047) - Deveria usar token
**Ocorrências: 1**
- `src/pages/Index.tsx:30` - `to-[#4a0047]`

#### Bege Claro Texto (#EBDECE) - Deveria usar token
**Ocorrências: 4**
- `src/pages/ResetPassword.tsx:216,219` - `text-[#EBDECE]`
- `src/pages/EsqueciSenha.tsx:42,45` - `text-[#EBDECE]`
- `src/pages/Auth.tsx:70,73` - `text-[#EBDECE]`

#### Verde Água (#4BB8A9) - Deveria usar token
**Ocorrências: 3**
- `src/components/sections/DonationSection.tsx:53,57,61` - `text-[#4BB8A9]`

#### Amarelo Limão (#CFF402) - Deveria usar token
**Ocorrências: 1**
- `src/components/sections/DonationSection.tsx:65` - `text-[#CFF402]`

#### Roxo Escuro (#61005D) - Deveria usar token
**Ocorrências: 1**
- `src/components/dashboard/EditarGarantiaModal.tsx:66` - `style={{ backgroundColor: '#61005D' }}`

#### Verde Claro Badge (#E9F9E6, #D8FFD2) - Deveria usar `--profit-bg`
**Ocorrências: 2**
- `src/components/ui/badge.tsx:12` - `bg-[#E9F9E6] hover:bg-[#D8FFD2]`

#### Amarelo Claro Badge (#FEF4E3, #FFEAC6) - Deveria usar token de warning
**Ocorrências: 2**
- `src/components/ui/badge.tsx:14` - `bg-[#FEF4E3] hover:bg-[#FFEAC6]`

### 2.2 Cores Tailwind Hardcoded (Não usando tokens)

#### Cores de Status/Risco
**Slate (usado extensivamente)**
- `text-slate-400`, `text-slate-500`, `text-slate-600`, `text-slate-900`
- `bg-slate-50`, `bg-slate-100`
- `border-slate-100`, `border-slate-200`, `border-slate-300`
- **Deveria usar**: `muted-foreground`, `foreground`, `border`, `muted`

**Red (usado para erros/destrutivo)**
- `text-red-500`, `text-red-600`, `text-red-700`, `text-red-800`, `text-red-900`
- `bg-red-50`, `bg-red-100`, `bg-red-600`, `bg-red-700`
- `border-red-200`, `border-red-500`
- **Deveria usar**: `destructive`, `destructive-foreground`, criar variantes se necessário

**Green (usado para sucesso/lucro)**
- `text-green-600`, `text-green-700`
- `bg-green-50`, `bg-green-100`, `bg-green-600`
- `border-green-200`
- **Deveria usar**: `--profit`, `--profit-bg`, criar variantes se necessário

**Yellow (usado para avisos)**
- `text-yellow-600`
- **Deveria usar**: criar token `--warning` ou usar `--muted`

**Orange (usado para avisos/risco moderado)**
- `text-orange-500`, `text-orange-600`
- `bg-orange-50`
- `border-orange-200`
- **Deveria usar**: criar token `--warning`

**Blue (usado para informações/seleção)**
- `text-blue-600`, `text-blue-700`
- `bg-blue-50`, `bg-blue-100`
- `border-blue-200`, `border-blue-300`, `border-blue-600`
- **Deveria usar**: `primary` ou criar token `--info`

**Emerald (usado para sucesso)**
- `text-emerald-500`, `text-emerald-600`, `text-emerald-700`
- **Deveria usar**: `--profit`

**Gray (usado extensivamente)**
- `text-gray-800`, `text-gray-900`
- `bg-gray-100`, `bg-gray-200`, `bg-gray-950`
- `hover:bg-gray-200`, `hover:bg-gray-100`
- `border-gray-200`, `border-gray-400`
- **Deveria usar**: `muted`, `foreground`, `border`

**Amber (usado para alertas)**
- `border-amber-100`
- **Deveria usar**: criar token `--warning` ou usar `--muted`

### 2.3 Cores em Funções JavaScript

#### src/components/operations/smart-flow/utils.ts
Função `getRiskColorHex` retorna cores HEX hardcoded:
- `'#16a34a'` (green-600) → deveria usar `--profit`
- `'#ca8a04'` (yellow-600) → deveria criar token `--warning`
- `'#ea580c'` (orange-600) → deveria criar token `--warning`
- `'#dc2626'` (red-600) → deveria usar `--destructive`
- `'#cbd5e1'` (slate-300) → deveria usar `--muted`

### 2.4 Cores em Inline Styles

#### style={{ backgroundColor: '...' }}
- `#263C64` (múltiplos arquivos) → usar `primary` ou `brand-purple`
- `#61005D` (EditarGarantiaModal) → criar token ou usar variante de primary

#### style={{ color: '...' }}
- Não encontrado (bom!)

### 2.5 Cores em Gradientes Hardcoded

#### Gradientes com cores hardcoded
- `from-brand-purple via-brand-purple-dark to-[#1C2E51]` → deveria usar apenas tokens
- `to-[#4a0047]` → criar token ou usar variante

## 3. Resumo de Problemas

### 3.1 Cores que Precisam de Tokens Novos

1. **Warning/Orange** - Usado para avisos e risco moderado
   - Cores: `orange-50`, `orange-200`, `orange-500`, `orange-600`
   - Sugestão: `--warning`, `--warning-foreground`, `--warning-bg`

2. **Info/Blue** - Usado para informações e seleção
   - Cores: `blue-50`, `blue-100`, `blue-200`, `blue-300`, `blue-600`, `blue-700`
   - Sugestão: `--info`, `--info-foreground`, `--info-bg` ou usar `primary` com variantes

3. **Success/Green** - Usado para sucesso (diferente de profit)
   - Cores: `green-50`, `green-100`, `green-200`, `green-600`, `green-700`
   - Sugestão: Pode usar `--profit` ou criar `--success` se houver diferença semântica

4. **Backgrounds Neutros** - Bege/creme usado extensivamente
   - Cores: `#F6F6E6`, `#FBFBF2`, `#F1F0EA`
   - Sugestão: `--neutral-bg`, `--neutral-bg-light`, `--neutral-bg-lighter`

5. **Textos Neutros Escuros**
   - Cores: `#6D6845`, `gray-800`, `gray-900`
   - Sugestão: Usar `--foreground` ou criar `--foreground-muted`

6. **Primary Hover** - Hover do primary
   - Cor: `#1e3050`
   - Sugestão: `--primary-hover` ou usar `primary/90`

7. **Success/Compra Verde** - Verde específico para compra
   - Cor: `#307B58` e hover `#225B44`
   - Sugestão: `--success` ou `--buy` com variantes

8. **Venda Vermelho** - Vermelho específico para venda
   - Cor: `#D41010`
   - Sugestão: Usar `--destructive` ou criar `--sell`

### 3.2 Cores que Devem Usar Tokens Existentes

1. **#263C64** → `primary` ou `brand-purple` (20+ ocorrências)
2. **#1e3050** → `primary/90` ou criar `--primary-hover`
3. **Verde de lucro** → `--profit` e `--profit-bg`
4. **Vermelho de perda** → `--destructive` e `--loss`
5. **Slate** → `muted`, `muted-foreground`, `border`
6. **Gray** → `muted`, `foreground`

### 3.3 Arquivos com Mais Problemas

1. **src/pages/CadastroOpcao.tsx** - Muitas cores hardcoded (slate, red, green, orange, yellow, emerald, blue)
2. **src/pages/ListaOpcoes.tsx** - Cores HEX e Tailwind hardcoded
3. **src/components/opcoes/StrategyCard.tsx** - Cores HEX
4. **src/components/dashboard/AlertasCard.tsx** - Cores HEX
5. **src/components/navigation/Sidebar.tsx** - Inline style com HEX
6. **src/components/ui/button.tsx** - HEX hardcoded
7. **src/components/ui/badge.tsx** - HEX hardcoded
8. **src/components/ui/tabs.tsx** - HEX hardcoded

## 4. Plano de Ação Sugerido

### Fase 1: Criar Novos Tokens
1. Adicionar tokens para `warning`, `info`, `success` (se diferente de profit)
2. Adicionar tokens para backgrounds neutros (bege/creme)
3. Adicionar `--primary-hover`
4. Adicionar tokens para `buy` e `sell` (se necessário)

### Fase 2: Substituir Cores HEX por Tokens
1. Substituir `#263C64` por `primary` ou `brand-purple`
2. Substituir `#1e3050` por `primary-hover` ou `primary/90`
3. Substituir cores de sucesso/erro por tokens apropriados
4. Substituir backgrounds bege por tokens neutros

### Fase 3: Substituir Classes Tailwind por Tokens
1. Substituir `slate-*` por `muted`, `muted-foreground`, `border`
2. Substituir `red-*` por `destructive` e variantes
3. Substituir `green-*` por `profit` e variantes
4. Substituir `blue-*` por `primary` ou `info`
5. Substituir `orange-*` e `yellow-*` por `warning`
6. Substituir `gray-*` por `muted` e `foreground`

### Fase 4: Limpar Inline Styles
1. Substituir `style={{ backgroundColor: '#263C64' }}` por classes Tailwind
2. Verificar e substituir outros inline styles

### Fase 5: Atualizar Funções JavaScript
1. Atualizar `getRiskColorHex` para usar tokens CSS ou retornar nomes de tokens

## 5. Notas Importantes

- Todas as cores devem ser definidas em HSL no `src/index.css`
- Os tokens devem seguir o padrão `--nome-cor` e serem usados via `hsl(var(--nome-cor))`
- Classes Tailwind customizadas devem ser criadas em `@layer components` no `index.css`
- Manter compatibilidade com dark mode ao criar novos tokens
- Documentar a semântica de cada cor (quando usar cada uma)

