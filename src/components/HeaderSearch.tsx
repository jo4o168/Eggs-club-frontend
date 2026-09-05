"use client";

import {FormEvent, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Egg, Repeat, Search} from "lucide-react";
import {Input} from "./ui/input";
import {usePublicPlans, usePublicProducts} from "@/hooks/usePublicCatalog";

type SearchHit = {
    kind: "kit" | "plan";
    id: string;
    title: string;
    subtitle: string;
    price: string;
    imageUrl: string | null;
    href: string;
};

const frequencyLabels: Record<number, string> = {
    0: "Semanal",
    1: "Quinzenal",
    2: "Mensal",
};

function formatMoney(value: number) {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function matchesQuery(haystack: Array<string | null | undefined>, query: string) {
    return haystack.some((part) => (part ?? "").toLowerCase().includes(query));
}

export function HeaderSearch() {
    const location = useLocation();
    const navigate = useNavigate();
    const {data: products = []} = usePublicProducts();
    const {data: plans = []} = usePublicPlans();

    const urlQuery = useMemo(
        () => new URLSearchParams(location.search).get("q") ?? "",
        [location.search],
    );

    const [draftSearch, setDraftSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const searchValue = isOpen ? draftSearch : urlQuery;
    const normalized = searchValue.trim().toLowerCase();

    const kitHits = useMemo<SearchHit[]>(() => {
        const source = !normalized
            ? products.slice(0, 4)
            : products.filter((product) =>
                  matchesQuery(
                      [product.name, product.egg_size, product.egg_color, String(product.kit_quantity ?? "")],
                      normalized,
                  ),
              );
        return source.slice(0, 5).map((product) => ({
            kind: "kit",
            id: `kit-${product.id}`,
            title: product.name,
            subtitle: [product.egg_size, product.egg_color, product.kit_quantity ? `${product.kit_quantity} ovos` : null]
                .filter(Boolean)
                .join(" • ") || "Kit de ovos",
            price: formatMoney(Number(product.one_time_price ?? 0)),
            imageUrl: product.image_url ?? null,
            href: `/produtos/${product.id}`,
        }));
    }, [normalized, products]);

    const planHits = useMemo<SearchHit[]>(() => {
        const active = plans.filter((plan) => plan.is_active !== false);
        const featured = active.filter((plan) => plan.is_featured);
        const source = !normalized
            ? (featured.length > 0 ? featured : active).slice(0, 4)
            : active.filter((plan) =>
                  matchesQuery(
                      [plan.name, plan.description, plan.product?.name, frequencyLabels[plan.frequency]],
                      normalized,
                  ),
              );
        return source.slice(0, 5).map((plan) => ({
            kind: "plan",
            id: `plan-${plan.id}`,
            title: plan.name,
            subtitle: [frequencyLabels[plan.frequency], plan.product?.name].filter(Boolean).join(" • ") || "Assinatura",
            price: formatMoney(Number(plan.price ?? 0)),
            imageUrl: plan.image_url ?? plan.product?.image_url ?? null,
            href: `/planos?plan=${plan.id}`,
        }));
    }, [normalized, plans]);

    const hits = useMemo(() => [...kitHits, ...planHits], [kitHits, planHits]);
    const isBrowsing = normalized.length === 0;
    const showPanel = isOpen && (isBrowsing || normalized.length >= 1);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [normalized]);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    const goTo = (href: string) => {
        navigate(href);
        setIsOpen(false);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (hits[highlightedIndex]) {
            goTo(hits[highlightedIndex].href);
            return;
        }
        if (normalized) {
            goTo(kitHits.length >= planHits.length ? `/produtos?q=${encodeURIComponent(searchValue.trim())}` : `/planos?q=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showPanel) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((current) => (hits.length === 0 ? 0 : (current + 1) % hits.length));
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((current) => (hits.length === 0 ? 0 : (current - 1 + hits.length) % hits.length));
        }
        if (event.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-full max-w-[11rem] sm:max-w-xs lg:max-w-sm">
            <div ref={rootRef} className="relative w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                <Input
                    value={searchValue}
                    onChange={(e) => {
                        setDraftSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        setDraftSearch(urlQuery);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar..."
                    aria-label="Buscar kits e planos"
                    className="pl-9 h-9 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background focus-visible:border-input transition-colors"
                    autoComplete="off"
                />

                {showPanel && (
                    <div className="absolute top-12 right-0 w-[min(26rem,calc(100vw-1.5rem))] rounded-2xl border bg-popover/95 backdrop-blur shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                        <div className="px-4 py-3 border-b bg-muted/40">
                            <p className="text-xs font-medium text-muted-foreground">
                                {isBrowsing
                                    ? "Kits e planos em destaque"
                                    : `Resultados para “${searchValue.trim()}”`}
                            </p>
                        </div>

                        <div className="max-h-[26rem] overflow-y-auto p-2 space-y-3">
                            {hits.length === 0 ? (
                                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                    Nada encontrado. Tente outro nome, tamanho ou frequência.
                                </div>
                            ) : (
                                <>
                                    {kitHits.length > 0 && (
                                        <SearchGroup
                                            title="Kits de ovos"
                                            hits={kitHits}
                                            offset={0}
                                            highlightedIndex={highlightedIndex}
                                            onHover={setHighlightedIndex}
                                            onSelect={goTo}
                                        />
                                    )}
                                    {planHits.length > 0 && (
                                        <SearchGroup
                                            title="Planos de assinatura"
                                            hits={planHits}
                                            offset={kitHits.length}
                                            highlightedIndex={highlightedIndex}
                                            onHover={setHighlightedIndex}
                                            onSelect={goTo}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t bg-muted/30 text-xs text-muted-foreground">
                            <button type="button" className="hover:text-foreground transition-colors" onClick={() => goTo(normalized ? `/produtos?q=${encodeURIComponent(searchValue.trim())}` : "/produtos")}>
                                Ver kits
                            </button>
                            <button type="button" className="hover:text-foreground transition-colors" onClick={() => goTo(normalized ? `/planos?q=${encodeURIComponent(searchValue.trim())}` : "/planos")}>
                                Ver planos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}

function SearchGroup({
    title,
    hits,
    offset,
    highlightedIndex,
    onHover,
    onSelect,
}: {
    title: string;
    hits: SearchHit[];
    offset: number;
    highlightedIndex: number;
    onHover: (index: number) => void;
    onSelect: (href: string) => void;
}) {
    return (
        <div className="space-y-1">
            <p className="px-2 pt-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {title}
            </p>
            {hits.map((hit, index) => {
                const absoluteIndex = offset + index;
                const active = absoluteIndex === highlightedIndex;
                return (
                    <button
                        key={hit.id}
                        type="button"
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all ${
                            active ? "bg-primary/10 shadow-sm" : "hover:bg-accent/70"
                        }`}
                        onMouseEnter={() => onHover(absoluteIndex)}
                        onClick={() => onSelect(hit.href)}
                    >
                        <span className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0 ring-1 ring-border">
                            {hit.imageUrl ? (
                                <img src={hit.imageUrl} alt="" className="w-full h-full object-cover"/>
                            ) : (
                                <span className="w-full h-full flex items-center justify-center text-primary">
                                    {hit.kind === "plan" ? <Repeat className="w-5 h-5"/> : <Egg className="w-5 h-5"/>}
                                </span>
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{hit.title}</span>
                                <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0 ${
                                    hit.kind === "plan"
                                        ? "bg-primary/15 text-primary"
                                        : "bg-secondary text-muted-foreground"
                                }`}>
                                    {hit.kind === "plan" ? "Plano" : "Kit"}
                                </span>
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">{hit.subtitle}</span>
                        </span>
                        <span className="text-sm font-semibold text-primary shrink-0">{hit.price}</span>
                    </button>
                );
            })}
        </div>
    );
}
