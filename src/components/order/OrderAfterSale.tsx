import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Film, ImageIcon, PackageCheck, Play, ShieldAlert} from "lucide-react";
import type {DeliveryIssueEvidence, OrderDetail} from "@/hooks/useOrders";
import {useConfirmOrderDelivery, useReportDeliveryIssue, useResolveDeliveryIssue} from "@/hooks/usePresentationExtras";
import {normalizePublicAssetUrl} from "@/lib/apiBase";

const reasonLabel: Record<string, string> = {
    broken: "Ovos quebrados",
    spoiled: "Ovos estragados ou impróprios",
    missing: "Quantidade ou kit errado",
    other: "Outro problema",
};

const issueStatusLabel: Record<string, string> = {
    open: "Aguardando o produtor",
    refunded: "Estorno combinado",
    replaced: "Reenvio combinado",
    rejected: "Chamado não procedeu",
};

const requestLabel: Record<string, string> = {
    refund: "Estorno do valor",
    replacement: "Envio de outro kit",
};

const REFUND_MESSAGE = "Vamos estornar o valor. Não precisa devolver os ovos.";
const REPLACE_MESSAGE = "Vamos enviar outro kit. Não precisa devolver os ovos.";
const NO_STOCK_MESSAGE = "Não temos estoque para reenvio agora. Vamos estornar o valor. Não precisa devolver os ovos.";

const ACCEPTED_VIDEO = "video/mp4,video/webm,video/quicktime";
const ACCEPTED_PHOTO = "image/jpeg,image/png,image/webp";
const MAX_PHOTOS = 3;

function isVideoFile(file: File) {
    return file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
}

function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function FileChip({file, kind}: {file: File; kind: "video" | "photo"}) {
    const Icon = kind === "video" ? Film : ImageIcon;
    return (
        <div className="flex min-w-0 items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground"/>
            <span className="min-w-0 truncate">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        </div>
    );
}

function normalizeMediaUrl(url?: string | null) {
    return normalizePublicAssetUrl(url);
}

function EvidenceGallery({items}: {items: DeliveryIssueEvidence[]}) {
    const [openVideo, setOpenVideo] = useState<string | null>(null);
    if (items.length === 0) return null;

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => {
                    const src = normalizeMediaUrl(item.url);
                    if (!src) return null;
                    if (item.kind === "video") {
                        return (
                            <button
                                key={src}
                                type="button"
                                onClick={() => setOpenVideo(src)}
                                className="relative h-16 w-24 overflow-hidden rounded-md border bg-muted text-left"
                            >
                                <video src={src} muted preload="metadata" className="h-full w-full object-cover" />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                                    <Play className="h-5 w-5 fill-white text-white"/>
                                </span>
                                <span className="sr-only">Abrir vídeo do comprovante</span>
                            </button>
                        );
                    }
                    return (
                        <a key={src} href={src} target="_blank" rel="noreferrer">
                            <img
                                src={src}
                                alt={`Foto ${index + 1} do comprovante`}
                                className="h-16 w-16 rounded-md border object-cover"
                            />
                        </a>
                    );
                })}
            </div>
            <Dialog open={openVideo !== null} onOpenChange={(open) => { if (!open) setOpenVideo(null); }}>
                <DialogContent className="max-w-sm p-4">
                    <DialogHeader>
                        <DialogTitle>Vídeo do comprovante</DialogTitle>
                        <DialogDescription>Assista só se precisar conferir o chamado.</DialogDescription>
                    </DialogHeader>
                    {openVideo ? (
                        <video
                            src={openVideo}
                            controls
                            playsInline
                            className="mx-auto max-h-[22rem] w-auto max-w-full rounded-md bg-black"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}

function ProducerResolveActions({
    order,
    rejecting,
    resolutionMessage,
    pending,
    onRejectingChange,
    onMessageChange,
    onResolve,
}: {
    order: OrderDetail;
    rejecting: boolean;
    resolutionMessage: string;
    pending: boolean;
    onRejectingChange: (value: boolean) => void;
    onMessageChange: (value: string) => void;
    onResolve: (status: "refunded" | "replaced" | "rejected", message: string) => void;
}) {
    const askedReplacement = order.delivery_issue?.requested_resolution === "replacement";
    const canReplace = Boolean(order.can_replace);
    const stockLines = order.replacement_stock ?? [];

    return (
        <div className="space-y-3 pt-2">
            <Alert>
                <AlertTitle>Ovos não voltam</AlertTitle>
                <AlertDescription>
                    {askedReplacement && !canReplace
                        ? "O cliente pediu outro kit, mas não há estoque. O caminho simples é estornar."
                        : "Aceite o pedido do cliente em um clique. Só recuse se o comprovante não bater."}
                </AlertDescription>
            </Alert>
            {askedReplacement && !canReplace ? (
                <ul className="text-xs text-muted-foreground space-y-1">
                    {stockLines.map((line) => (
                        <li key={`${line.product_id ?? line.product_name}`}>
                            {line.product_name}: precisa {line.needed}, estoque {line.available}
                        </li>
                    ))}
                </ul>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {askedReplacement && canReplace ? (
                    <Button
                        type="button"
                        disabled={pending}
                        onClick={() => onResolve("replaced", REPLACE_MESSAGE)}
                    >
                        Enviar outro kit
                    </Button>
                ) : null}
                {askedReplacement && canReplace ? (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={() => onResolve("refunded", REFUND_MESSAGE)}
                    >
                        Estornar em vez de reenviar
                    </Button>
                ) : (
                    <Button
                        type="button"
                        disabled={pending}
                        onClick={() => onResolve("refunded", askedReplacement && !canReplace ? NO_STOCK_MESSAGE : REFUND_MESSAGE)}
                    >
                        Aceitar estorno
                    </Button>
                )}
                {!askedReplacement && canReplace ? (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={() => onResolve("replaced", REPLACE_MESSAGE)}
                    >
                        Tenho estoque e reenvio
                    </Button>
                ) : null}
                <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => onRejectingChange(!rejecting)}
                >
                    Não procede
                </Button>
            </div>
            {rejecting ? (
                <div className="space-y-2">
                    <Label htmlFor="resolution-message">Por que não procede</Label>
                    <Textarea
                        id="resolution-message"
                        rows={3}
                        value={resolutionMessage}
                        onChange={(event) => onMessageChange(event.target.value)}
                        placeholder="Explique em uma frase, com base no vídeo."
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={resolutionMessage.trim().length < 5 || pending}
                        onClick={() => onResolve("rejected", resolutionMessage.trim())}
                    >
                        Recusar chamado
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

interface Props {
    order: OrderDetail;
    viewerProducer: boolean;
}

const OrderAfterSale = ({order, viewerProducer}: Props) => {
    const confirmDelivery = useConfirmOrderDelivery(order.id);
    const reportIssue = useReportDeliveryIssue(order.id);
    const resolveIssue = useResolveDeliveryIssue(order.id);
    const [reason, setReason] = useState("broken");
    const [requestedResolution, setRequestedResolution] = useState<"refund" | "replacement">("refund");
    const [description, setDescription] = useState("");
    const [video, setVideo] = useState<File | null>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [rejecting, setRejecting] = useState(false);
    const [resolutionMessage, setResolutionMessage] = useState("");
    const photoPreviews = useMemo(
        () => photos.map((file) => ({file, url: URL.createObjectURL(file)})),
        [photos],
    );

    return (
        <>
            {order.can_confirm_delivery ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackageCheck className="h-5 w-5"/>
                            Confirmar recebimento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            A avaliação e o chamado de problema só abrem depois que o kit chega. Confirme se você já recebeu.
                        </p>
                        <Button
                            type="button"
                            onClick={() => void confirmDelivery.mutateAsync()}
                            disabled={confirmDelivery.isPending}
                        >
                            Recebi o pedido
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            {order.delivery_issue ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5"/>
                            Pós-compra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p>
                            <span className="font-medium">{reasonLabel[order.delivery_issue.reason] ?? order.delivery_issue.reason}</span>
                            {" · "}
                            {issueStatusLabel[order.delivery_issue.status] ?? order.delivery_issue.status}
                        </p>
                        {order.delivery_issue.requested_resolution ? (
                            <p>
                                Cliente pediu:{" "}
                                <span className="font-medium">
                                    {requestLabel[order.delivery_issue.requested_resolution] ?? order.delivery_issue.requested_resolution}
                                </span>
                            </p>
                        ) : null}
                        <p className="text-muted-foreground whitespace-pre-wrap">{order.delivery_issue.description}</p>
                        <EvidenceGallery items={order.delivery_issue.evidence ?? []} />
                        {order.delivery_issue.resolution_message ? (
                            <p className="whitespace-pre-wrap">{order.delivery_issue.resolution_message}</p>
                        ) : null}

                        {viewerProducer && order.can_resolve_issue ? (
                            <ProducerResolveActions
                                order={order}
                                rejecting={rejecting}
                                resolutionMessage={resolutionMessage}
                                pending={resolveIssue.isPending}
                                onRejectingChange={setRejecting}
                                onMessageChange={setResolutionMessage}
                                onResolve={(status, message) =>
                                    void resolveIssue.mutateAsync({status, resolution_message: message})
                                }
                            />
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            {order.can_report_issue ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5"/>
                            Chegou com problema?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Alert>
                            <AlertTitle>Vídeo obrigatório</AlertTitle>
                            <AlertDescription>
                                Foto sozinha não abre o chamado. Envie um vídeo e diga se prefere estorno ou outro kit. Se não houver estoque, o produtor estorna — ovos não voltam.
                            </AlertDescription>
                        </Alert>
                        <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
                            {Object.entries(reasonLabel).map(([value, label]) => (
                                <label key={value} className="flex items-center gap-2 text-sm">
                                    <RadioGroupItem value={value} id={`issue-${value}`}/>
                                    {label}
                                </label>
                            ))}
                        </RadioGroup>
                        <div className="space-y-2">
                            <Label>Como prefere resolver</Label>
                            <RadioGroup
                                value={requestedResolution}
                                onValueChange={(value) => setRequestedResolution(value as "refund" | "replacement")}
                                className="gap-2"
                            >
                                <label className="flex items-center gap-2 text-sm">
                                    <RadioGroupItem value="refund" id="want-refund"/>
                                    Quero o estorno
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <RadioGroupItem value="replacement" id="want-replace"/>
                                    Quero outro kit
                                </label>
                            </RadioGroup>
                            <p className="text-xs text-muted-foreground">
                                Se pedir outro kit e o produtor não tiver estoque, o caminho automático é o estorno.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="issue-description">O que aconteceu</Label>
                            <Textarea
                                id="issue-description"
                                rows={3}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Ex.: metade da cartela chegou quebrada."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="issue-video">Vídeo do kit</Label>
                            <Input
                                id="issue-video"
                                type="file"
                                accept={ACCEPTED_VIDEO}
                                onChange={(event) => {
                                    const next = event.target.files?.[0] ?? null;
                                    setVideo(next && isVideoFile(next) ? next : null);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">MP4, WEBM ou MOV. Até 20 MB.</p>
                            {video ? <FileChip file={video} kind="video"/> : null}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="issue-photos">Fotos (opcional)</Label>
                            <Input
                                id="issue-photos"
                                type="file"
                                accept={ACCEPTED_PHOTO}
                                multiple
                                onChange={(event) => {
                                    const next = Array.from(event.target.files ?? [])
                                        .filter((file) => file.type.startsWith("image/"))
                                        .slice(0, MAX_PHOTOS);
                                    setPhotos(next);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">JPEG, PNG ou WEBP. Até 3 fotos, só junto com o vídeo.</p>
                            {photoPreviews.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {photoPreviews.map(({file, url}) => (
                                        <img key={url} src={url} alt={file.name} className="h-14 w-14 rounded-md border object-cover"/>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={description.trim().length < 5 || !video || reportIssue.isPending}
                            onClick={() => {
                                if (!video) return;
                                void reportIssue.mutateAsync({
                                    reason,
                                    description: description.trim(),
                                    requested_resolution: requestedResolution,
                                    video,
                                    photos,
                                });
                            }}
                        >
                            Abrir chamado
                        </Button>
                    </CardContent>
                </Card>
            ) : null}
        </>
    );
};

export default OrderAfterSale;
