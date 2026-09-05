import {Link} from "react-router-dom";
import {Check} from "lucide-react";
import {cn} from "@/lib/utils";

type CheckoutStep = "cart" | "checkout" | "confirmed";

const STEPS: {id: CheckoutStep; label: string; href?: string}[] = [
    {id: "cart", label: "Carrinho", href: "/customer/carrinho"},
    {id: "checkout", label: "Entrega e pagamento", href: "/customer/checkout"},
    {id: "confirmed", label: "Pedido feito"},
];

const ORDER: CheckoutStep[] = ["cart", "checkout", "confirmed"];

interface CheckoutStepperProps {
    current: CheckoutStep;
}

const CheckoutStepper = ({current}: CheckoutStepperProps) => {
    const currentIndex = ORDER.indexOf(current);

    return (
        <ol className="flex items-center gap-2 sm:gap-3" aria-label="Etapas da compra">
            {STEPS.map((step, index) => {
                const done = index < currentIndex;
                const active = index === currentIndex;
                const content = (
                    <span className="flex items-center gap-2 min-w-0">
                        <span
                            className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                done && "bg-primary text-primary-foreground",
                                active && "bg-primary text-primary-foreground",
                                !done && !active && "bg-muted text-muted-foreground",
                            )}
                        >
                            {done ? <Check className="h-3.5 w-3.5"/> : index + 1}
                        </span>
                        <span
                            className={cn(
                                "hidden sm:inline text-sm truncate",
                                active ? "font-semibold text-foreground" : "text-muted-foreground",
                            )}
                        >
                            {step.label}
                        </span>
                    </span>
                );

                return (
                    <li key={step.id} className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {step.href && !active && index <= currentIndex ? (
                            <Link to={step.href} className="hover:opacity-80 transition-opacity">
                                {content}
                            </Link>
                        ) : (
                            <span aria-current={active ? "step" : undefined}>{content}</span>
                        )}
                        {index < STEPS.length - 1 ? (
                            <span className="h-px w-6 sm:w-10 bg-border shrink-0" aria-hidden/>
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );
};

export default CheckoutStepper;
