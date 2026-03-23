import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {CreditCard, Download, Plus, Trash2, CheckCircle, Loader2} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "@/hooks/use-toast";
import {
    usePaymentMethods,
    useCreatePaymentMethod,
    useSetDefaultPaymentMethod,
    useDeletePaymentMethod,
} from "@/hooks/usePayments";
import {useCustomerSubscriptions} from "@/hooks/useSubscriptions";
import {useCustomerOrders} from "@/hooks/useOrders";

const ClientePagamentos = () => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardType, setCardType] = useState<"credit_card" | "debit_card" | "pix">("credit_card");

    const {data: paymentMethods = [], isLoading: isLoadingPayments} = usePaymentMethods();
    const {data: subscriptions = []} = useCustomerSubscriptions();
    const {data: orders = []} = useCustomerOrders();
    const createPaymentMethod = useCreatePaymentMethod();
    const setDefaultPaymentMethod = useSetDefaultPaymentMethod();
    const deletePaymentMethod = useDeletePaymentMethod();

    // Calculate billing summary
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const monthlyTotal = activeSubscriptions.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);
    const yearlyTotal = monthlyTotal * 12;
    const nextBillingAmount = activeSubscriptions[0]?.plan?.price || 0;

    // Get recent invoices from orders
    const invoices = orders.slice(0, 5).map(order => ({
        id: order.order_number,
        date: new Date(order.created_at).toLocaleDateString('pt-BR'),
        amount: order.total_amount,
        status: order.status === 'delivered' ? 'pago' : 'pendente',
    }));

    const detectCardBrand = (number: string): string => {
        const cleaned = number.replace(/\s/g, "");
        if (cleaned.startsWith("4")) return "Visa";
        if (/^5[1-5]/.test(cleaned)) return "Mastercard";
        if (/^3[47]/.test(cleaned)) return "American Express";
        if (cleaned.startsWith("6011")) return "Discover";
        return "Cartão";
    };

    const handleAddCard = async () => {
        const cleaned = cardNumber.replace(/\s/g, "");
        if (cleaned.length < 13) {
            toast({title: "Número do cartão inválido", variant: "destructive"});
            return;
        }

        try {
            await createPaymentMethod.mutateAsync({
                type: cardType,
                card_last_four: cleaned.slice(-4),
                card_brand: detectCardBrand(cleaned),
                is_default: paymentMethods.length === 0,
            });
            setIsAddDialogOpen(false);
            setCardNumber("");
            setCardExpiry("");
            setCardCvv("");
            setCardName("");
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleSetDefault = async (id: string) => {
        await setDefaultPaymentMethod.mutateAsync(id);
    };

    const handleRemoveCard = async (id: string) => {
        await deletePaymentMethod.mutateAsync(id);
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 16);
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(" ") : cleaned;
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 4);
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        }
        return cleaned;
    };

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-display font-semibold">Pagamentos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus métodos de pagamento e faturas
                    </p>
                </div>

                {/* Payment Methods */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Métodos de Pagamento</CardTitle>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Adicionar Cartão
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Cartão</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardType">Tipo de Cartão</Label>
                                        <Select value={cardType}
                                                onValueChange={(v: "credit_card" | "debit_card" | "pix") => setCardType(v)}>
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                                <SelectItem value="pix">Pix</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {cardType !== "pix" && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Número do Cartão</Label>
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiry">Validade</Label>
                                                    <Input
                                                        id="expiry"
                                                        placeholder="MM/AA"
                                                        value={cardExpiry}
                                                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvv">CVV</Label>
                                                    <Input
                                                        id="cvv"
                                                        placeholder="123"
                                                        value={cardCvv}
                                                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardName">Nome no Cartão</Label>
                                                <Input
                                                    id="cardName"
                                                    placeholder="JOAO SILVA"
                                                    value={cardName}
                                                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <Button
                                        variant="hero"
                                        className="w-full"
                                        onClick={handleAddCard}
                                        disabled={createPaymentMethod.isPending}
                                    >
                                        {createPaymentMethod.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                                        ) : null}
                                        {cardType === "pix" ? "Adicionar Pix" : "Adicionar Cartão"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {isLoadingPayments ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
                            </div>
                        ) : paymentMethods.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                <p>Nenhum método de pagamento cadastrado</p>
                                <p className="text-sm">Adicione um cartão para facilitar suas compras</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-white"/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {method.type === 'pix'
                                ? 'Pix'
                                : `${method.card_brand || 'Cartão'} •••• ${method.card_last_four || '****'}`
                            }
                          </span>
                                                    {method.is_default && (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            Padrão
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {method.type === 'credit_card' ? 'Crédito' : method.type === 'debit_card' ? 'Débito' : 'Pix'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!method.is_default && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSetDefault(method.id)}
                                                    disabled={setDefaultPaymentMethod.isPending}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1"/>
                                                    Definir Padrão
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCard(method.id)}
                                                disabled={deletePaymentMethod.isPending}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Billing Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo de Cobrança</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
                                <p className="text-2xl font-bold mt-1">
                                    R$ {nextBillingAmount.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activeSubscriptions.length > 0 ? 'Próxima entrega' : 'Sem assinatura ativa'}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Este Mês</p>
                                <p className="text-2xl font-bold mt-1">
                                    R$ {monthlyTotal.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activeSubscriptions.length} assinatura{activeSubscriptions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Anual Est.</p>
                                <p className="text-2xl font-bold mt-1 text-primary">
                                    R$ {yearlyTotal.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-sm text-muted-foreground">estimado</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices */}
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Faturas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Nenhuma fatura encontrada</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-primary"/>
                                            </div>
                                            <div>
                                                <p className="font-medium">{invoice.id}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {invoice.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    R$ {invoice.amount.toFixed(2).replace('.', ',')}
                                                </p>
                                                <Badge
                                                    className={invoice.status === 'pago' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ClientePagamentos;
