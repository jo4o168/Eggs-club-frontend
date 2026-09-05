# UI_SPEC.md — Carrinho e checkout do cliente

## 1. Identificação

- **Nome:** CustomerCartCheckout
- **Tipo:** Páginas
- **Stack:** Next.js
- **Design system base:** shadcn/ui + tokens de `src/index.css`
- **UI Constitution:** tokens do produto (Playfair Display, laranja `primary`, cream `background`)
- **Status:** Aprovado

## 2. Propósito e contexto de uso

- **O que resolve:** fluxo de compra no padrão de e-commerce (revisar itens → confirmar entrega e pagamento → pedido enviado ao produtor).
- **Quem usa:** cliente (role 0).
- **Onde aparece:** `/customer/carrinho`, `/customer/checkout`, `/customer/pedido-confirmado`.
- **O que NÃO é:** gateway de pagamento real, múltiplos endereços, cálculo de frete.

## 3. Estados obrigatórios

| Estado | Comportamento esperado |
|---|---|
| `loading` | Spinner central nas três páginas |
| `empty` | Carrinho vazio com CTA para `/produtos`; checkout vazio redireciona visualmente ao carrinho |
| `error` | Mensagem + tentar novamente no carrinho |
| `success` | Página de confirmação com próximo passo (ver pedido) |
| `disabled` | CTA bloqueado sem plano de assinatura, endereço incompleto ou sem pagamento |
| `partial/stale` | N/A — invalidação do carrinho após checkout |
| `permission denied` | Visitante vê CTA de login |

## 3b. Quality bar

**Superfície:** b2c/product

**Referência:** Mercado Livre / Magazine Luiza (stepper + resumo sticky + endereço obrigatório) + DS do repo

**Hierarquia tipográfica:**

| Papel | Token | Exemplo |
|-------|-------|---------|
| Título de página | `font-display` 3xl | Seu carrinho |
| Título de seção | `font-display` xl | Entrega |
| Corpo | `font-body` sm/base | Confirme para onde os ovos vão… |
| Meta | `text-muted-foreground` xs/sm | A combinar com o produtor |

**CTA:** primário = `hero` (Ir para entrega / Confirmar pedido) · secundário = outline (continuar comprando) · destrutivo = remover item

## 4. Variantes

- Carrinho: itens editáveis
- Checkout: itens somente no resumo
- Confirmação: sem edição

## 5. Tokens

Espaçamento 8/16/24/32; cores semânticas (`primary`, `muted`, `card`, `border`); radius 0.75rem / `rounded-2xl`.

## 6. Responsividade

| Breakpoint | Comportamento |
|---|---|
| Mobile | Coluna única; resumo abaixo dos itens; stepper só com números |
| Tablet | Igual mobile com mais respiro |
| Desktop | Itens + resumo sticky à direita |

## 7. Interação

- Carrinho não finaliza compra.
- Checkout exige endereço completo (CEP, rua, cidade, UF) e método de pagamento.
- Pedido envia `delivery_address` formatado + `payment_method_id` + `notes`.
- Sucesso navega para confirmação com `order_ids`.

## 8. Acessibilidade

Stepper com `aria-current`; labels nos campos; alvos de toque 36–44px nos steppers de quantidade.

## 12. Histórico

| Data | Decisão | Motivo |
|---|---|---|
| 2026-09-05 | Separar carrinho e checkout | Evitar “só escolher cartão” sem confirmar entrega |
