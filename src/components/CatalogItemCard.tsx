import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import CatalogRating from "@/components/CatalogRating";
import {Package} from "lucide-react";

export const catalogGridClassName =
    "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 items-stretch";

interface CatalogItemCardProps {
    id?: string;
    href?: string;
    name: string;
    imageUrl?: string | null;
    meta?: string;
    price: string;
    priceSuffix?: string;
    ratingAverage?: number | null;
    ratingCount?: number | null;
    highlighted?: boolean;
    badge?: string;
    ctaLabel: string;
    ctaVariant?: "default" | "outline";
    ctaDisabled?: boolean;
    onCta: () => void;
}

const CatalogItemCard = ({
    id,
    href,
    name,
    imageUrl,
    meta,
    price,
    priceSuffix,
    ratingAverage,
    ratingCount,
    highlighted,
    badge,
    ctaLabel,
    ctaVariant = "default",
    ctaDisabled,
    onCta,
}: CatalogItemCardProps) => {
    const image = imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-contain p-2"/>
    ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Package className="h-6 w-6"/>
            Sem imagem
        </div>
    );

    const titleClassName = "text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem]";

    return (
        <article
            id={id}
            className={`relative h-full flex flex-col overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-md ${
                highlighted ? "ring-2 ring-primary border-primary" : "border-border"
            }`}
        >
            {badge ? (
                <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded">
                    {badge}
                </div>
            ) : null}

            {href ? (
                <Link to={href} className="aspect-square bg-secondary shrink-0 block">
                    {image}
                </Link>
            ) : (
                <div className="aspect-square bg-secondary shrink-0">{image}</div>
            )}

            <div className="p-2.5 flex-1 flex flex-col gap-1">
                {href ? (
                    <Link to={href} className={`${titleClassName} hover:text-primary`}>
                        {name}
                    </Link>
                ) : (
                    <h3 className={titleClassName}>{name}</h3>
                )}
                <p className="text-xs text-muted-foreground line-clamp-1 min-h-[1rem]">{meta || "\u00a0"}</p>
                <CatalogRating average={ratingAverage} count={ratingCount}/>
                <p className="text-lg font-semibold leading-none mt-auto pt-1">
                    {price}
                    {priceSuffix ? (
                        <span className="text-xs font-normal text-muted-foreground"> {priceSuffix}</span>
                    ) : null}
                </p>
                <div className="pt-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={ctaVariant}
                        className="w-full h-8 text-xs"
                        onClick={onCta}
                        disabled={ctaDisabled}
                    >
                        {ctaLabel}
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default CatalogItemCard;
