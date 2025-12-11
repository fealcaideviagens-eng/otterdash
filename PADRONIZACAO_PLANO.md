# Plano de Padronização de Componentes

Este documento detalha o plano de execução para padronizar todos os componentes usando tokens.

## Resumo Executivo

**Objetivo**: Padronizar todos os componentes do sistema usando tokens CSS, eliminando cores hardcoded e criando variações de tamanho consistentes.

**Arquivos Criados**:
- `COMPONENT_ANALYSIS.md` - Análise detalhada de todos os componentes
- `COLOR_MAPPING.md` - Mapeamento de cores (já existente)

## Fase 1: Expandir Sistema de Tokens

### 1.1 Adicionar Tokens de Cor Semânticos (src/index.css)

**Novos tokens a adicionar**:
```css
/* Cores Semânticas */
--success: 142 76% 36%;
--success-foreground: 0 0% 100%;
--success-bg: 142 76% 95%;

--warning: 38 92% 50%;
--warning-foreground: 0 0% 0%;
--warning-bg: 38 92% 95%;

--info: 216 45% 39%; /* Pode usar primary */
--info-foreground: 0 0% 100%;
--info-bg: 216 45% 95%;

--buy: 142 76% 36%; /* Verde de compra */
--buy-foreground: 0 0% 100%;
--buy-bg: 142 76% 95%;

--sell: 0 84% 60%; /* Vermelho de venda (pode usar destructive) */
--sell-foreground: 0 0% 100%;

--neutral-bg: 44 19% 96%; /* Bege/creme neutro */
--neutral-bg-light: 44 19% 98%;
--neutral-bg-lighter: 44 19% 99%;
```

**Arquivos a modificar**:
- `src/index.css` - Adicionar tokens na seção `:root` e `.dark`

### 1.2 Adicionar Tokens de Espaçamento (src/index.css)

```css
--spacing-card-sm: 1rem; /* p-4 */
--spacing-card: 1.5rem; /* p-6 */
--spacing-card-lg: 2rem; /* p-8 */

--spacing-section: 2rem;
--spacing-section-lg: 4rem;
```

### 1.3 Adicionar Tokens de Border Radius (src/index.css)

```css
--radius-sm: 0.375rem; /* rounded-md */
--radius-lg: 1rem; /* rounded-xl */
--radius-xl: 1.5rem; /* rounded-2xl */
--radius-full: 9999px; /* rounded-full */
```

### 1.4 Adicionar Tokens de Altura (src/index.css)

```css
--height-xs: 2rem; /* h-8 */
--height-sm: 2.25rem; /* h-9 */
--height-default: 2.5rem; /* h-10 */
--height-lg: 2.75rem; /* h-11 */
--height-xl: 3rem; /* h-12 */
```

### 1.5 Mapear Tokens no Tailwind (tailwind.config.ts)

Adicionar ao objeto `colors`:
```typescript
success: {
  DEFAULT: 'hsl(var(--success))',
  foreground: 'hsl(var(--success-foreground))',
  bg: 'hsl(var(--success-bg))'
},
warning: {
  DEFAULT: 'hsl(var(--warning))',
  foreground: 'hsl(var(--warning-foreground))',
  bg: 'hsl(var(--warning-bg))'
},
info: {
  DEFAULT: 'hsl(var(--info))',
  foreground: 'hsl(var(--info-foreground))',
  bg: 'hsl(var(--info-bg))'
},
buy: {
  DEFAULT: 'hsl(var(--buy))',
  foreground: 'hsl(var(--buy-foreground))',
  bg: 'hsl(var(--buy-bg))'
},
sell: {
  DEFAULT: 'hsl(var(--sell))',
  foreground: 'hsl(var(--sell-foreground))'
},
neutral: {
  bg: 'hsl(var(--neutral-bg))',
  'bg-light': 'hsl(var(--neutral-bg-light))',
  'bg-lighter': 'hsl(var(--neutral-bg-lighter))'
}
```

## Fase 2: Atualizar Componentes Base

### 2.1 Badge (src/components/ui/badge.tsx)

**Mudanças**:
- Substituir `#E9F9E6` e `#D8FFD2` por `bg-success-bg hover:bg-success-bg/80`
- Substituir `#FEF4E3` e `#FFEAC6` por `bg-warning-bg hover:bg-warning-bg/80`
- Adicionar variantes: `success`, `warning`, `info`
- Adicionar tamanhos: `sm`, `default`, `lg`

### 2.2 Button (src/components/ui/button.tsx)

**Mudanças**:
- Adicionar tamanhos: `xs` (h-8), `xl` (h-12)
- Adicionar variantes: `success`, `warning`, `info`
- Manter tokens existentes (já está bom)

### 2.3 Card (src/components/ui/card.tsx)

**Mudanças**:
- Adicionar variantes de tamanho via className ou prop
- Criar classes utilitárias: `card-sm`, `card-lg`
- Adicionar variante `elevated` com shadow maior

### 2.4 Input (src/components/ui/input.tsx)

**Mudanças**:
- Adicionar tamanhos: `sm` (h-9), `lg` (h-11)
- Usar tokens de altura

## Fase 3: Criar Componentes Compostos

### 3.1 FormField (src/components/ui/form-field.tsx) - NOVO

**Criar componente base**:
```tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
```

**Arquivos que usarão**:
- `src/components/operations/inputs/CurrencyInput.tsx`
- `src/components/operations/inputs/DateInput.tsx`
- `src/components/operations/inputs/TickerInput.tsx`
- Todos os formulários em `CadastroOpcao.tsx`, `TravaForm.tsx`, etc.

## Fase 4: Atualizar Componentes Customizados

### 4.1 StrategyCard (src/components/opcoes/StrategyCard.tsx)

**Substituições**:
- `#307B58` → `bg-buy`
- `#225B44` → `bg-buy/90` (hover)
- `#F6F6E6` → `bg-neutral-bg`
- `gray-200` → `border-border`
- `gray-400` → `border-border/60`
- `gray-500` → `text-muted-foreground`
- `gray-600` → `text-muted-foreground`
- `gray-800` → `text-foreground`
- `red-600` → `text-destructive`
- `rounded-2xl` → `rounded-xl` (usar token)

### 4.2 CurrencyInput (src/components/operations/inputs/CurrencyInput.tsx)

**Mudanças**:
- Usar componente `FormField`
- Substituir `border-red-500` → `border-destructive`
- Substituir `text-red-500` → `text-destructive`

### 4.3 DateInput (src/components/operations/inputs/DateInput.tsx)

**Mudanças**:
- Usar componente `FormField`
- Substituir `border-red-500` → `border-destructive`
- Substituir `text-red-500` → `text-destructive`

### 4.4 Todos os Formulários

**Arquivos a atualizar**:
- `src/pages/CadastroOpcao.tsx` - Substituir cores hardcoded
- `src/components/operations/smart-flow/TravaForm.tsx`
- `src/components/operations/smart-flow/SimpleOptionForm.tsx`
- `src/components/opcoes/EditarOpcaoModal.tsx`
- `src/components/opcoes/EditarTravaModal.tsx`
- E outros modais de edição

**Substituições padrão**:
- `border-red-500` → `border-destructive`
- `text-red-500` → `text-destructive`
- `text-gray-*` → `text-muted-foreground` ou `text-foreground`
- `bg-gray-*` → `bg-muted` ou `bg-neutral-bg`
- `border-gray-*` → `border-border`

## Fase 5: Substituir Cores Tailwind por Tokens

### 5.1 Cores de Erro (15 arquivos)

**Padrão de substituição**:
- `border-red-500` → `border-destructive`
- `text-red-500` → `text-destructive`
- `bg-red-50` → `bg-destructive/10`
- `bg-red-600` → `bg-destructive`
- `hover:bg-red-600` → `hover:bg-destructive`

**Arquivos**:
- `src/components/operations/inputs/*.tsx`
- `src/components/operations/smart-flow/*.tsx`
- `src/pages/CadastroOpcao.tsx`
- Modais de edição

### 5.2 Cores de Sucesso/Compra (8 arquivos)

**Padrão de substituição**:
- `bg-[#307B58]` → `bg-buy`
- `bg-[#225B44]` → `bg-buy/90`
- `bg-green-50` → `bg-success-bg`
- `text-green-600` → `text-success`
- `bg-green-600` → `bg-success`
- `border-green-200` → `border-success/30`

**Arquivos**:
- `src/components/opcoes/StrategyCard.tsx`
- `src/pages/ListaOpcoes.tsx`
- `src/components/dashboard/AlertasCard.tsx`

### 5.3 Cores Neutras/Bege (10+ arquivos)

**Padrão de substituição**:
- `bg-[#F6F6E6]` → `bg-neutral-bg`
- `bg-[#FBFBF2]` → `bg-neutral-bg-light`
- `bg-[#F1F0EA]` → `bg-neutral-bg-lighter`
- `hover:bg-gray-200` → `hover:bg-muted`

**Arquivos**:
- `src/components/opcoes/StrategyCard.tsx`
- `src/components/dashboard/AlertasCard.tsx`
- `src/components/operations/StrategySelector.tsx`

### 5.4 Cores de Texto Cinza (100+ ocorrências)

**Padrão de substituição**:
- `text-gray-500` → `text-muted-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-800` → `text-foreground`
- `text-gray-900` → `text-foreground`

**Arquivos principais**:
- `src/pages/CadastroOpcao.tsx` (50+ ocorrências)
- `src/components/opcoes/StrategyCard.tsx`
- `src/components/operations/smart-flow/*.tsx`
- Todos os componentes de formulário

### 5.5 Cores de Background Cinza (50+ ocorrências)

**Padrão de substituição**:
- `bg-gray-100` → `bg-muted`
- `bg-gray-200` → `bg-muted/80`
- `hover:bg-gray-100` → `hover:bg-muted`
- `hover:bg-gray-200` → `hover:bg-muted/80`

### 5.6 Cores de Border Cinza (30+ ocorrências)

**Padrão de substituição**:
- `border-gray-200` → `border-border`
- `border-gray-300` → `border-border/80`
- `border-gray-400` → `border-border/60`

### 5.7 Cores Azul/Info (20+ ocorrências)

**Padrão de substituição**:
- `border-blue-600` → `border-primary` ou `border-info`
- `bg-blue-50` → `bg-info-bg` ou `bg-primary/10`
- `text-blue-600` → `text-primary` ou `text-info`
- `bg-blue-100` → `bg-info-bg`

## Ordem de Execução Recomendada

### Sprint 1: Fundação (Tokens)
1. ✅ Adicionar tokens de cor semânticos no `index.css`
2. ✅ Mapear tokens no `tailwind.config.ts`
3. ✅ Adicionar tokens de espaçamento, border radius e altura
4. ✅ Testar tokens em um componente de exemplo

### Sprint 2: Componentes Base
1. Atualizar Badge (substituir HEX, adicionar variantes)
2. Atualizar Button (adicionar tamanhos xs/xl, variantes)
3. Atualizar Card (adicionar variantes de tamanho)
4. Atualizar Input (adicionar tamanhos)

### Sprint 3: Componentes Compostos
1. Criar FormField
2. Refatorar CurrencyInput para usar FormField
3. Refatorar DateInput para usar FormField
4. Refatorar TickerInput para usar FormField

### Sprint 4: Componentes Customizados
1. Atualizar StrategyCard (substituir todas as cores)
2. Atualizar AlertasCard
3. Atualizar outros cards customizados

### Sprint 5: Formulários
1. Atualizar CadastroOpcao.tsx
2. Atualizar TravaForm.tsx
3. Atualizar SimpleOptionForm.tsx
4. Atualizar todos os modais de edição

### Sprint 6: Limpeza Final
1. Substituir cores Tailwind restantes
2. Verificar consistência visual
3. Documentar padrões
4. Criar guia de uso

## Checklist de Validação

Para cada componente atualizado:
- [ ] Usa tokens em vez de cores hardcoded
- [ ] Tem variantes de tamanho quando necessário
- [ ] Funciona em dark mode
- [ ] Mantém a mesma aparência visual
- [ ] Não quebra funcionalidades existentes
- [ ] Segue padrões estabelecidos

## Notas Importantes

1. **Manter compatibilidade**: Não alterar APIs públicas dos componentes
2. **Testar visualmente**: Cada mudança deve ser verificada
3. **Dark mode**: Todos os tokens devem ter variantes para dark mode
4. **Documentação**: Atualizar documentação conforme avança
5. **Incremental**: Fazer mudanças em pequenos lotes, testando cada uma

## Métricas de Sucesso

- **0 cores HEX hardcoded** (exceto em casos muito específicos)
- **0 cores Tailwind diretas** (usar tokens)
- **100% dos componentes** usando sistema de tokens
- **Consistência visual** mantida ou melhorada
- **Dark mode** funcionando em todos os componentes

