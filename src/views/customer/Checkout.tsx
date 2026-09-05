import {useEffect, useMemo, useState} from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import CheckoutPaymentSection from "@/components/checkout/CheckoutPaymentSection";
import BrazilLocationFields from "@/components/BrazilLocationFields";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useCheckoutCart, useCustomerCart} from "@/hooks/useCart";
import {usePaymentMethods} from "@/hooks/usePayments";
import {useProfile, useUpdateProfile} from "@/hooks/useProfiles";
import {useAuth} from "@/contexts/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "@/hooks/use-toast";
import {formatDeliveryAddress, isDeliveryAddressComplete, splitStreetAndNumber} from "@/utils/deliveryAddress";
import {maskCep, maskPhone, onlyDigits} from "@/utils/inputMasks";
import {normalizeUfToSigla} from "@/utils/brazilStates";
import {Loader2, MapPin, MessageSquare} from "lucide-react";

const CheckoutCliente = () => {
    const navigate = useNavigate();
    const {user, loading: authLoading, isClient} = useAuth();
    const {data: items = [], isLoading: cartLoading} = useCustomerCart();
    const {data: paymentMethods = [], isLoading: paymentsLoading} = usePaymentMethods();
    const {data: profile, isLoading: profileLoading} = useProfile();
    const updateProfile = useUpdateProfile();
    const checkout = useCheckoutCart();

    const [address, setAddress] = useState("");
    const [addressNumber, setAddressNumber] = useState("");
    const [complement, setComplement] = useState("");
    const [city, setCity] = useState("");
    const [stateUf, setStateUf] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [orderNotes, setOrderNotes] = useState("");
    const [saveAddress, setSaveAddress] = useState(true);
    const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (!profile || hydrated) return;
        const savedStreet = profile.address ?? "";
        const savedNumber = profile.address_number ?? "";
        if (savedNumber) {
            setAddress(savedStreet);
            setAddressNumber(savedNumber);
        } else {
            const split = splitStreetAndNumber(savedStreet);
            setAddress(split.street);
            setAddressNumber(split.number);
        }
        setComplement(profile.complement ?? "");
        setCity(profile.city ?? "");
        setStateUf(normalizeUfToSigla(profile.state ?? ""));
        setZipCode(maskCep(profile.zip_code ?? ""));
        setHydrated(true);
    }, [profile, hydrated]);

    useEffect(() => {
        if (paymentMethods.length === 0) {
            setPaymentMethodId(null);
            return;
        }
        setPaymentMethodId((current) => {
            if (current && paymentMethods.some((method) => method.id === current)) return current;
            return paymentMethods.find((method) => method.is_default)?.id ?? paymentMethods[0].id;
        });
    }, [paymentMethods]);

    const addressParts = useMemo(
        () => ({
            recipientName: profile?.name ?? "",
            phone: profile?.phone ? maskPhone(profile.phone) : "",
            address,
            number: addressNumber,
            complement,
            city,
            state: stateUf,
            zipCode,
        }),
        [profile?.name, profile?.phone, address, addressNumber, complement, city, stateUf, zipCode],
    );

    const addressReady = isDeliveryAddressComplete(addressParts);
    const missingPlan = items.some((item) => item.purchase_mode === "subscription" && !item.subscription_plan_id);
    const canSubmit =
        items.length > 0 && addressReady && !!paymentMethodId && !missingPlan && !checkout.isPending;

    const handleSubmit = async () => {
        if (missingPlan) {
            toast({title: "Selecione o plano de cada assinatura no carrinho.", variant: "destructive"});
            return;
        }
        if (!addressReady) {
            toast({
                title: "Confirme o endereço de entrega",
                description: "Informe rua, número, cidade, estado e CEP para o produtor despachar o pedido.",
                variant: "destructive",
            });
            return;
        }
        if (!paymentMethodId) {
            toast({title: "Selecione um método de pagamento.", variant: "destructive"});
            return;
        }

        const deliveryAddress = formatDeliveryAddress(addressParts);
        const addressChanged =
            (profile?.address ?? "") !== address ||
            (profile?.address_number ?? "") !== addressNumber ||
            (profile?.complement ?? "") !== complement ||
            (profile?.city ?? "") !== city ||
            normalizeUfToSigla(profile?.state ?? "") !== stateUf ||
            onlyDigits(profile?.zip_code ?? "") !== onlyDigits(zipCode);
        if (saveAddress && addressChanged) {
            await updateProfile.mutateAsync({
                address: address || null,
                address_number: addressNumber.trim() || null,
                complement: complement || null,
                city: city || null,
                state: stateUf ? stateUf.toUpperCase() : null,
                zip_code: onlyDigits(zipCode) || null,
            });
        }

        const result = await checkout.mutateAsync({
            delivery_address: deliveryAddress,
            notes: orderNotes.trim() || null,
            payment_method_id: paymentMethodId,
        });

        const orders = result.order_ids.join(",");
        const subs = result.subscription_ids.join(",");
        navigate(`/customer/pedido-confirmado?orders=${orders}${subs ? `&subs=${subs}` : ""}`);
    };

    if (!authLoading && (!user || !isClient())) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 container py-16 text-center space-y-4">
                    <h1 className="text-3xl font-display font-semibold">Entre para finalizar a compra</h1>
                    <Button onClick={() => navigate("/login")}>Entrar</Button>
                </main>
                <Footer/>
            </div>
        );
    }

    const loading = cartLoading || paymentsLoading || profileLoading;

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-8">
                <div className="container max-w-6xl space-y-8">
                    <div className="space-y-4">
                        <CheckoutStepper current="checkout"/>
                        <div>
                            <h1 className="text-3xl font-display font-semibold">Finalizar pedido</h1>
                            <p className="text-muted-foreground mt-1">
                                Confirme para onde os ovos vão e como o pagamento será feito. O produtor só inicia o pedido depois disso.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
                            <p className="text-muted-foreground">Não há itens para finalizar. Volte ao carrinho.</p>
                            <Button asChild><Link to="/customer/carrinho">Ir ao carrinho</Link></Button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
                            <div className="space-y-6">
                                <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-primary mt-0.5"/>
                                        <div>
                                            <h2 className="font-display text-xl font-semibold">Entrega</h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Este endereço vai no pedido para o produtor. A forma e o prazo de entrega são combinados depois da confirmação.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-secondary/70 px-4 py-3 text-sm">
                                        <p className="font-medium">{profile?.name ?? "Cliente"}</p>
                                        {profile?.phone ? (
                                            <p className="text-muted-foreground">{maskPhone(profile.phone)}</p>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Sem telefone no perfil.{" "}
                                                <Link to="/customer/perfil" className="text-primary underline underline-offset-2">Atualizar</Link>
                                            </p>
                                        )}
                                    </div>

                                    <BrazilLocationFields
                                        zipCode={zipCode}
                                        onZipCodeChange={setZipCode}
                                        address={address}
                                        onAddressChange={setAddress}
                                        addressNumber={addressNumber}
                                        onAddressNumberChange={setAddressNumber}
                                        complement={complement}
                                        onComplementChange={setComplement}
                                        stateUf={stateUf}
                                        onStateUfChange={setStateUf}
                                        city={city}
                                        onCityChange={setCity}
                                    />

                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={saveAddress}
                                            onCheckedChange={(value) => setSaveAddress(value === true)}
                                        />
                                        Salvar este endereço no meu perfil
                                    </label>
                                </section>

                                <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary"/>
                                        <h2 className="font-display text-xl font-semibold">Observações para o produtor</h2>
                                    </div>
                                    <Label htmlFor="order-notes" className="sr-only">Observações</Label>
                                    <Textarea
                                        id="order-notes"
                                        value={orderNotes}
                                        onChange={(event) => setOrderNotes(event.target.value)}
                                        placeholder="Ponto de referência, horário preferido, deixar na portaria…"
                                        rows={3}
                                    />
                                </section>

                                <CheckoutPaymentSection
                                    methods={paymentMethods}
                                    selectedId={paymentMethodId}
                                    onSelect={setPaymentMethodId}
                                />
                            </div>

                            <div className="lg:sticky lg:top-24 space-y-3">
                                <OrderSummaryCard
                                    items={items}
                                    ctaLabel="Confirmar pedido"
                                    onCta={() => void handleSubmit()}
                                    ctaDisabled={!canSubmit}
                                    ctaPending={checkout.isPending || updateProfile.isPending}
                                    footnote="Ao confirmar, o pedido é enviado ao produtor com este endereço e pagamento."
                                />
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/customer/carrinho">Voltar ao carrinho</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default CheckoutCliente;
