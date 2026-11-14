import CatalogItemCard from "@/components/CatalogItemCard";

interface PlanCardProps {
    id?: string;
    name: string;
    price: string;
    frequency: string;
    description: string;
    imageUrl?: string | null;
    features?: string[];
    isPopular?: boolean;
    highlighted?: boolean;
    ratingAverage?: number | null;
    ratingCount?: number | null;
    ctaLabel?: string;
    ctaVariant?: "default" | "outline";
    onSelect: () => void;
}

const PlanCard = ({
    id,
    name,
    price,
    frequency,
    description,
    imageUrl,
    features = [],
    isPopular = false,
    highlighted = false,
    ratingAverage,
    ratingCount,
    ctaLabel = "Assinar",
    ctaVariant = "default",
    onSelect,
}: PlanCardProps) => {
    const meta = [frequency, features[0] ?? description].filter(Boolean).join(" · ");

    return (
        <CatalogItemCard
            id={id}
            name={name}
            imageUrl={imageUrl}
            meta={meta}
            price={price}
            priceSuffix={`/ ${frequency.toLowerCase()}`}
            ratingAverage={ratingAverage}
            ratingCount={ratingCount}
            highlighted={highlighted || isPopular}
            badge={isPopular ? "Mais popular" : undefined}
            ctaLabel={ctaLabel}
            ctaVariant={ctaVariant}
            onCta={onSelect}
        />
    );
};

export default PlanCard;
