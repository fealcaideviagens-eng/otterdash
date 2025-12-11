# Análise de Componentes - Padronização

Este documento analisa todos os componentes do sistema para identificar padrões e oportunidades de padronização usando tokens.

## 1. Componentes Base (src/components/ui/)

### 1.1 Button (src/components/ui/button.tsx)
**Status**: ✅ Bem padronizado
- Usa tokens: `brand-blue-dark`, `primary-foreground`, `destructive`, etc.
- Variantes: default, destructive, outline, secondary, ghost, link
- Tamanhos: sm (h-9), default (h-10), lg (h-11), icon (h-10)
- **Problemas encontrados**:
  - Nenhum - já usa tokens corretamente

**Recomendações**:
- Adicionar tamanho `xs` (h-8) para botões menores
- Adicionar tamanho `xl` (h-12) para botões destacados
- Considerar variante `success` e `warning`

### 1.2 Badge (src/components/ui/badge.tsx)
**Status**: ⚠️ Precisa padronização
- **Problemas encontrados**:
  - Usa cores HEX hardcoded: `#E9F9E6`, `#D8FFD2`, `#FEF4E3`, `#FFEAC6`
  - Não usa tokens de cor
- **Variantes**: default, secondary, destructive, outline

**Recomendações**:
- Criar tokens: `--success-bg`, `--warning-bg` para substituir HEX
- Adicionar variantes: `success`, `warning`, `info`
- Padronizar tamanhos: sm, default, lg

### 1.3 Card (src/components/ui/card.tsx)
**Status**: ✅ Bem padronizado
- Usa tokens: `bg-card`, `text-card-foreground`, `border`
- Padding padrão: `p-6`
- **Problemas encontrados**:
  - Nenhum - já usa tokens

**Recomendações**:
- Adicionar variantes de tamanho: sm (p-4), default (p-6), lg (p-8)
- Adicionar variante `elevated` com shadow maior

### 1.4 Input (src/components/ui/input.tsx)
**Status**: ✅ Bem padronizado
- Usa tokens: `border-input`, `--placeholder`
- Altura padrão: `h-10`
- **Problemas encontrados**:
  - Nenhum - já usa tokens

**Recomendações**:
- Adicionar tamanhos: sm (h-9), default (h-10), lg (h-11)
- Criar componente wrapper para label + input + error (padrão repetido)

### 1.5 Dialog/Modal (src/components/ui/dialog.tsx)
**Status**: ✅ Bem padronizado
- Usa tokens padrão
- **Problemas encontrados**:
  - Nenhum

**Recomendações**:
- Padronizar tamanhos de modal: sm, default, lg, xl
- Criar variantes: `centered`, `fullscreen`

## 2. Componentes Customizados

### 2.1 StrategyCard (src/components/opcoes/StrategyCard.tsx)
**Status**: ⚠️ Precisa padronização
- **Problemas encontrados**:
  - Cores HEX hardcoded: `#307B58`, `#225B44`, `#F6F6E6`
  - Cores Tailwind hardcoded: `gray-200`, `gray-400`, `gray-500`, `gray-600`, `gray-800`, `red-600`
  - Border radius inconsistente: `rounded-2xl` (deveria usar token)
  - Padding inconsistente: `px-5`, `py-7`
  - Espaçamentos hardcoded: `gap-2`, `gap-3`, `mb-6`, `mb-2`, `mt-4`

**Recomendações**:
- Usar `bg-success` ou criar token `--buy-bg` para verde de compra
- Usar `bg-muted` ou criar token `--neutral-bg` para bege
- Usar `border-border` em vez de `border-gray-200`
- Usar `text-muted-foreground` em vez de `text-gray-600`
- Padronizar padding usando tokens: `p-card` ou variantes
- Criar componente base `Card` com variantes de tamanho

### 2.2 MetricsCard (src/components/dashboard/MetricsCard.tsx)
**Status**: ✅ Bem padronizado
- Usa tokens: `bg-card`, `bg-profit`, `bg-loss`, `text-profit`, `text-loss`
- **Problemas encontrados**:
  - Nenhum

**Recomendações**:
- Adicionar variantes de tamanho
- Considerar adicionar variante `compact` (menos padding)

### 2.3 EditableMetricsCard (src/components/dashboard/EditableMetricsCard.tsx)
**Status**: ✅ Bem padronizado
- Usa tokens: `bg-card`, `text-destructive`, `text-primary`, `bg-accent/5`
- **Problemas encontrados**:
  - Nenhum

**Recomendações**:
- Mesmas do MetricsCard

### 2.4 CurrencyInput (src/components/operations/inputs/CurrencyInput.tsx)
**Status**: ⚠️ Precisa padronização
- **Problemas encontrados**:
  - Cores hardcoded: `border-red-500`, `text-red-500`
  - Deveria usar: `border-destructive`, `text-destructive`

**Recomendações**:
- Criar componente base `FormField` que inclui Label + Input + Error
- Usar tokens de erro: `border-destructive`, `text-destructive`

### 2.5 DateInput (src/components/operations/inputs/DateInput.tsx)
**Status**: ⚠️ Precisa padronização
- **Problemas encontrados**:
  - Cores hardcoded: `border-red-500`, `text-red-500`
  - Estilos duplicados do Input base

**Recomendações**:
- Usar componente `FormField` base
- Usar tokens de erro

## 3. Padrões Identificados

### 3.1 Cores Repetidas

#### Vermelho (Erro/Destrutivo)
- **Uso**: Erros de formulário, ações destrutivas
- **Ocorrências**: 50+ lugares
- **Atual**: `border-red-500`, `text-red-500`, `bg-red-50`, `bg-red-600`
- **Deveria usar**: `border-destructive`, `text-destructive`, `bg-destructive/10`, `bg-destructive`

#### Verde (Sucesso/Compra)
- **Uso**: Operações de compra, sucesso
- **Ocorrências**: 30+ lugares
- **Atual**: `#307B58`, `#225B44`, `bg-green-50`, `text-green-600`, `bg-green-600`
- **Deveria usar**: Criar tokens `--success` ou `--buy` ou usar `--profit`

#### Bege/Creme (Neutro)
- **Uso**: Backgrounds neutros, badges secundários
- **Ocorrências**: 15+ lugares
- **Atual**: `#F6F6E6`, `#FBFBF2`, `#F1F0EA`, `bg-gray-100`
- **Deveria usar**: Criar token `--neutral-bg` ou usar `--muted`

#### Cinza (Texto/Background)
- **Uso**: Textos secundários, backgrounds, borders
- **Ocorrências**: 100+ lugares
- **Atual**: `text-gray-500`, `text-gray-600`, `text-gray-800`, `bg-gray-100`, `bg-gray-200`, `border-gray-200`
- **Deveria usar**: `text-muted-foreground`, `bg-muted`, `border-border`

#### Azul (Info/Seleção)
- **Uso**: Seleções, informações
- **Ocorrências**: 20+ lugares
- **Atual**: `border-blue-600`, `bg-blue-50`, `text-blue-600`, `bg-blue-100`
- **Deveria usar**: `border-primary`, `bg-primary/10`, `text-primary` ou criar `--info`

### 3.2 Espaçamentos Repetidos

#### Padding de Cards
- **Padrões encontrados**: `p-4`, `p-5`, `p-6`, `p-8`
- **Mais comum**: `p-6` (Card base)
- **Recomendação**: Criar tokens `--spacing-card-sm`, `--spacing-card`, `--spacing-card-lg`

#### Gaps
- **Padrões encontrados**: `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-6`
- **Mais comum**: `gap-2`, `gap-3`
- **Recomendação**: Padronizar em 3 níveis: sm (gap-2), default (gap-3), lg (gap-4)

#### Margins
- **Padrões encontrados**: `mb-2`, `mb-4`, `mb-6`, `mt-2`, `mt-4`
- **Recomendação**: Usar `space-y-*` quando possível, padronizar valores

### 3.3 Tamanhos de Texto

#### Padrões encontrados
- `text-xs` (10px) - Labels pequenos, badges
- `text-sm` (14px) - Texto secundário, descrições
- `text-base` (16px) - Texto padrão
- `text-lg` (18px) - Títulos menores
- `text-xl` (20px) - Títulos
- `text-2xl` (24px) - Títulos grandes
- `text-3xl` (30px) - Títulos muito grandes

**Status**: ✅ Bem padronizado, mas pode criar tokens semânticos:
- `--text-label` → `text-xs`
- `--text-body` → `text-sm` ou `text-base`
- `--text-heading-sm` → `text-lg`
- `--text-heading` → `text-xl`
- `--text-heading-lg` → `text-2xl`

### 3.4 Border Radius

#### Padrões encontrados
- `rounded-full` - Botões, badges (mais comum)
- `rounded-md` - Inputs, alguns cards
- `rounded-lg` - Cards base
- `rounded-xl` - Cards maiores
- `rounded-2xl` - Cards destacados
- `rounded-3xl` - Cards muito grandes

**Status**: ⚠️ Inconsistente
**Recomendação**: 
- Usar token `--radius` existente
- Criar variantes: `--radius-sm`, `--radius`, `--radius-lg`, `--radius-xl`
- Padronizar: inputs/badges → `rounded-md`, cards → `rounded-lg`, botões → `rounded-full`

### 3.5 Alturas de Componentes

#### Padrões encontrados
- `h-8` - Botões muito pequenos (não existe ainda)
- `h-9` - Botões sm, inputs sm
- `h-10` - Botões default, inputs default (mais comum)
- `h-11` - Botões lg, inputs lg
- `h-12` - Botões xl (não existe ainda)

**Status**: ✅ Relativamente padronizado
**Recomendação**: Adicionar tamanhos `xs` e `xl` para mais flexibilidade

## 4. Componentes que Precisam de Padronização

### 4.1 FormField (Novo Componente)
**Problema**: Label + Input + Error repetido em vários lugares
**Ocorrências**: CurrencyInput, DateInput, TickerInput, e muitos formulários

**Solução**: Criar componente base
```tsx
<FormField>
  <Label>...</Label>
  <Input />
  <ErrorMessage>...</ErrorMessage>
</FormField>
```

### 4.2 Card Variants
**Problema**: Cards com estilos similares mas implementações diferentes
**Ocorrências**: StrategyCard, MetricsCard, AlertasCard

**Solução**: Estender Card base com variantes:
- `size`: sm, default, lg
- `variant`: default, elevated, outlined
- `interactive`: true/false (hover effects)

### 4.3 Badge Variants
**Problema**: Cores HEX hardcoded, falta variantes semânticas
**Solução**: 
- Adicionar variantes: success, warning, info
- Usar tokens em vez de HEX

### 4.4 Button Sizes
**Problema**: Falta tamanhos xs e xl
**Solução**: Adicionar aos variants

## 5. Tokens que Precisam ser Criados

### 5.1 Cores Semânticas
```css
--success: 142 76% 36%; /* Verde de sucesso */
--success-foreground: 0 0% 100%;
--success-bg: 142 76% 95%;

--warning: 38 92% 50%; /* Laranja/Amarelo de aviso */
--warning-foreground: 0 0% 0%;
--warning-bg: 38 92% 95%;

--info: 216 45% 39%; /* Azul de informação (pode usar primary) */
--info-foreground: 0 0% 100%;
--info-bg: 216 45% 95%;

--buy: 142 76% 36%; /* Verde de compra (pode usar success) */
--sell: 0 84% 60%; /* Vermelho de venda (pode usar destructive) */

--neutral-bg: 44 19% 96%; /* Bege/creme neutro */
--neutral-bg-light: 44 19% 98%;
```

### 5.2 Espaçamentos
```css
--spacing-card-sm: 1rem; /* p-4 */
--spacing-card: 1.5rem; /* p-6 */
--spacing-card-lg: 2rem; /* p-8 */

--spacing-section: 2rem; /* Espaçamento entre seções */
--spacing-section-lg: 4rem;
```

### 5.3 Border Radius
```css
--radius-sm: 0.375rem; /* rounded-md */
--radius: 0.75rem; /* rounded-lg (já existe) */
--radius-lg: 1rem; /* rounded-xl */
--radius-xl: 1.5rem; /* rounded-2xl */
--radius-full: 9999px; /* rounded-full */
```

### 5.4 Alturas
```css
--height-xs: 2rem; /* h-8 */
--height-sm: 2.25rem; /* h-9 */
--height-default: 2.5rem; /* h-10 */
--height-lg: 2.75rem; /* h-11 */
--height-xl: 3rem; /* h-12 */
```

## 6. Plano de Ação

### Fase 1: Criar Novos Tokens
1. Adicionar tokens de cor semânticos (success, warning, info, buy, sell, neutral)
2. Adicionar tokens de espaçamento
3. Adicionar tokens de border radius
4. Adicionar tokens de altura

### Fase 2: Atualizar Componentes Base
1. Badge: substituir HEX por tokens, adicionar variantes
2. Button: adicionar tamanhos xs e xl, variantes success/warning
3. Card: adicionar variantes de tamanho e estilo
4. Input: adicionar tamanhos sm/lg

### Fase 3: Criar Componentes Compostos
1. FormField: componente base para Label + Input + Error
2. Card Variants: estender Card com variantes

### Fase 4: Atualizar Componentes Customizados
1. StrategyCard: usar tokens em vez de cores hardcoded
2. CurrencyInput/DateInput: usar FormField base
3. Todos os componentes: substituir cores Tailwind por tokens

### Fase 5: Documentação
1. Criar guia de uso de componentes
2. Documentar tokens disponíveis
3. Criar exemplos de uso

## 7. Priorização

**Alta Prioridade**:
- Criar tokens de cor semânticos (success, warning, neutral)
- Substituir cores HEX no Badge
- Substituir cores hardcoded no StrategyCard
- Criar componente FormField

**Média Prioridade**:
- Adicionar variantes de tamanho aos componentes base
- Padronizar espaçamentos
- Substituir cores Tailwind por tokens

**Baixa Prioridade**:
- Refinar border radius
- Adicionar mais variantes de componentes
- Otimizar tokens de altura

