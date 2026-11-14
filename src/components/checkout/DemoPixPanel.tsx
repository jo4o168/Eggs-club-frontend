import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {useOrderPix} from "@/hooks/usePresentationExtras";
import {toast} from "@/hooks/use-toast";
import {Copy, Loader2, QrCode} from "lucide-react";
import {formatBRL} from "@/utils/money";

interface DemoPixPanelProps {
    orderId: number;
}

const DemoPixPanel = ({orderId}: DemoPixPanelProps) => {
    const {data: pix, isLoading, error} = useOrderPix(orderId);

    const copyPayload = async () => {
        if (!pix?.copia_e_cola) return;
        try {
            await navigator.clipboard.writeText(pix.copia_e_cola);
            toast({title: "Código Pix copiado"});
        } catch {
            toast({title: "Não foi possível copiar", variant: "destructive"});
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                Gerando QR Code Pix...
            </div>
        );
    }

    if (error || !pix) {
        return <p className="text-sm text-destructive">Não foi possível gerar o Pix de demonstração.</p>;
    }

    return (
        <div className="space-y-4">
            <Alert>
                <QrCode className="h-4 w-4"/>
                <AlertTitle>Pix de demonstração</AlertTitle>
                <AlertDescription>{pix.notice}</AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                    src={pix.qr_image_url}
                    alt="QR Code Pix de demonstração"
                    className="h-44 w-44 rounded-xl border border-border bg-white p-2"
                />
                <div className="space-y-2 text-sm min-w-0">
                    <p className="font-medium">{pix.beneficiary}</p>
                    <p className="text-muted-foreground">Valor: {formatBRL(pix.amount)}</p>
                    <p className="text-muted-foreground">TxId: {pix.txid}</p>
                    <p className="font-mono text-xs break-all text-muted-foreground bg-secondary/70 rounded-md p-2">
                        {pix.copia_e_cola}
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => void copyPayload()}>
                        <Copy className="h-4 w-4"/>
                        Copiar código
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DemoPixPanel;
