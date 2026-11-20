import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DemoNfe, useIssueOrderNfe} from "@/hooks/usePresentationExtras";
import {FileText, Loader2} from "lucide-react";
import {formatBRL} from "@/utils/money";
import {maskCnpj, maskDocument} from "@/utils/brazilianDocument";

interface DemoNfeDialogProps {
    orderId: number;
    alreadyIssued?: boolean;
    canIssue?: boolean;
}

const DemoNfeDialog = ({orderId, alreadyIssued, canIssue = false}: DemoNfeDialogProps) => {
    const issueNfe = useIssueOrderNfe();
    const [open, setOpen] = useState(false);
    const [nfe, setNfe] = useState<DemoNfe | null>(null);

    const handleOpen = async () => {
        if (!alreadyIssued && !canIssue) return;
        const payload = nfe ?? await issueNfe.mutateAsync(orderId);
        setNfe(payload);
        setOpen(true);
    };
    const formattedKey = nfe?.access_key.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

    return (
        <>
            <Button type="button" variant="outline" onClick={() => void handleOpen()} disabled={issueNfe.isPending}>
                {issueNfe.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileText className="h-4 w-4"/>}
                {alreadyIssued ? "Ver NF-e demonstrativa" : canIssue ? "Emitir NF-e (demonstração)" : "Ver NF-e demonstrativa"}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nota Fiscal Eletrônica — modelo 55</DialogTitle>
                        <DialogDescription>Documento gerado só para a apresentação do projeto.</DialogDescription>
                    </DialogHeader>
                    {nfe ? (
                        <div className="space-y-4 text-sm">
                            <Alert>
                                <FileText className="h-4 w-4"/>
                                <AlertTitle>Sem valor fiscal</AlertTitle>
                                <AlertDescription>{nfe.notice}</AlertDescription>
                            </Alert>
                            <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
                                <div className="flex flex-wrap justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Emitente</p>
                                        <p className="font-medium">{nfe.issuer.name}</p>
                                        <p>CNPJ {maskCnpj(nfe.issuer.document)}</p>
                                        <p className="text-muted-foreground">{nfe.issuer.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">NF-e nº {nfe.number}</p>
                                        <p>Série {nfe.series} · modelo {nfe.model}</p>
                                        <p>{new Date(nfe.issued_at).toLocaleString("pt-BR")}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Destinatário</p>
                                    <p className="font-medium">{nfe.recipient.name}</p>
                                    {nfe.recipient.document ? (
                                        <p>
                                            Documento {nfe.recipient.document.length > 11
                                                ? maskCnpj(nfe.recipient.document)
                                                : maskDocument(nfe.recipient.document, "cpf")}
                                        </p>
                                    ) : null}
                                    <p className="text-muted-foreground">{nfe.recipient.address}</p>
                                </div>
                                <p className="font-mono text-xs tracking-wide bg-secondary/70 rounded-md p-2 break-all">
                                    Chave de acesso: {formattedKey}
                                </p>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-left text-muted-foreground border-b">
                                            <th className="py-2">Item</th>
                                            <th>NCM</th>
                                            <th className="text-right">Qtd</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nfe.items.map((item, index) => (
                                            <tr key={`${item.name}-${index}`} className="border-b border-border/60">
                                                <td className="py-2 pr-2">{item.name}</td>
                                                <td>{item.ncm}</td>
                                                <td className="text-right">{item.quantity}</td>
                                                <td className="text-right">{formatBRL(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-right font-semibold">
                                    Total da nota: {formatBRL(nfe.totals.invoice)}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DemoNfeDialog;
