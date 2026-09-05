import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import type {ServerCartItem} from "@/hooks/useCart";
import {cartSubtotal, serverCartItemCount} from "@/hooks/useCart";
import {formatBRL} from "@/utils/money";
import {Loader2} from "lucide-react";
import type {ReactNode} from "react";

interface OrderSummaryCardProps {
    items: ServerCartItem[];
    ctaLabel: string;
    onCta: () => void;
    ctaDisabled?: boolean;
    ctaPending?: boolean;
    footnote?: string;
    extra?: ReactNode;
}

const OrderSummaryCard = ({
    items,
    ctaLabel,
    onCta,
    ctaDisabled,
    ctaPending,
    footnote,
    extra,
}: OrderSummaryCardProps) => {
    const count = serverCartItemCount(items);
    const subtotal = cartSubtotal(items);

    return (
        <aside className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="font-display text-xl font-semibold">Resumo do pedido</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                        {count} {count === 1 ? "item" : "itens"}
                    </span>
                    <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="text-right">A combinar com o produtor</span>
                </div>
            </div>
            <Separator/>
            <div className="flex justify-between gap-4 font-semibold">
                <span>Total</span>
                <span className="text-primary text-lg">{formatBRL(subtotal)}</span>
            </div>
            {extra}
            <Button variant="hero" className="w-full" onClick={onCta} disabled={ctaDisabled || ctaPending}>
                {ctaPending ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                {ctaLabel}
            </Button>
            {footnote ? <p className="text-xs text-muted-foreground text-center">{footnote}</p> : null}
        </aside>
    );
};

export default OrderSummaryCard;
