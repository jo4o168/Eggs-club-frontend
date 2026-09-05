import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import type {ServerCartItem} from "@/hooks/useCart";
import {formatBRL} from "@/utils/money";
import {Minus, Package, Plus, Trash2} from "lucide-react";

interface PlanOption {
    id: number;
    name: string;
    price: number;
}

interface CartLineItemProps {
    item: ServerCartItem;
    plans: PlanOption[];
    quantityDraft: string;
    pending?: boolean;
    onChangeMode: (mode: "one_time" | "subscription") => void;
    onChangePlan: (planId: number) => void;
    onQuantityInput: (value: string) => void;
    onCommitQuantity: () => void;
    onDecrease: () => void;
    onIncrease: () => void;
    onRemove: () => void;
}

const CartLineItem = ({
    item,
    plans,
    quantityDraft,
    pending,
    onChangeMode,
    onChangePlan,
    onQuantityInput,
    onCommitQuantity,
    onDecrease,
    onIncrease,
    onRemove,
}: CartLineItemProps) => {
    const isSubscription = item.purchase_mode === "subscription";
    const missingPlan = isSubscription && !item.subscription_plan_id;

    return (
        <article className="flex gap-4 p-4 sm:p-5">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
                {item.product?.image_url ? (
                    <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-7 w-7"/>
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <h2 className="font-display font-semibold leading-tight truncate">
                            {item.product?.name ?? "Produto"}
                        </h2>
                        <Badge variant="secondary">
                            {isSubscription ? "Assinatura" : "Compra única"}
                        </Badge>
                        {missingPlan ? (
                            <p className="text-xs text-destructive">Selecione um plano para continuar.</p>
                        ) : null}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="font-semibold text-primary">{formatBRL(item.line_total)}</p>
                        <p className="text-xs text-muted-foreground">{formatBRL(item.unit_price)} / un.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={item.purchase_mode}
                        onValueChange={(value: "one_time" | "subscription") => onChangeMode(value)}
                        disabled={pending}
                    >
                        <SelectTrigger className="w-[160px] h-9">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {item.product?.allow_one_time_purchase && (
                                <SelectItem value="one_time">Compra única</SelectItem>
                            )}
                            {item.product?.allow_subscription && (
                                <SelectItem value="subscription">Assinatura</SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    {isSubscription ? (
                        <Select
                            value={item.subscription_plan_id ? String(item.subscription_plan_id) : ""}
                            onValueChange={(value) => onChangePlan(Number(value))}
                            disabled={pending}
                        >
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Escolher plano"/>
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={String(plan.id)}>
                                        {plan.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="inline-flex items-center rounded-full border border-border overflow-hidden">
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onDecrease} disabled={pending}>
                                <Minus className="h-4 w-4"/>
                            </Button>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={quantityDraft}
                                onChange={(event) => onQuantityInput(event.target.value)}
                                onBlur={onCommitQuantity}
                                className="h-9 w-12 border-0 text-center shadow-none focus-visible:ring-0"
                                disabled={pending}
                                aria-label="Quantidade"
                            />
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onIncrease} disabled={pending}>
                                <Plus className="h-4 w-4"/>
                            </Button>
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-auto"
                        onClick={onRemove}
                        disabled={pending}
                    >
                        <Trash2 className="h-4 w-4"/>
                        Remover
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default CartLineItem;
