import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {paymentMethodLabel} from "@/utils/paymentLabels";
import {CreditCard} from "lucide-react";

interface DemoCardPaidPanelProps {
    type: string;
    last_four?: string | null;
    card_brand?: string | null;
}

const DemoCardPaidPanel = ({type, last_four, card_brand}: DemoCardPaidPanelProps) => {
    return (
        <div className="space-y-4 text-left">
            <Alert>
                <CreditCard className="h-4 w-4"/>
                <AlertTitle>Pagamento no cartão</AlertTitle>
                <AlertDescription>
                    Nesta apresentação o valor não é cobrado de verdade. Nenhum código Pix é gerado para compra no cartão.
                </AlertDescription>
            </Alert>
            <p className="text-sm font-medium">
                {paymentMethodLabel({type, last_four, card_brand})}
            </p>
            <p className="text-sm text-muted-foreground">
                O produtor já pode preparar o kit com o pagamento confirmado nesta demonstração.
            </p>
        </div>
    );
};

export default DemoCardPaidPanel;
