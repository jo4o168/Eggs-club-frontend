import StarRating from "@/components/StarRating";

interface CatalogRatingProps {
    average?: number | null;
    count?: number | null;
    className?: string;
}

const CatalogRating = ({average, count, className}: CatalogRatingProps) => {
    const total = Number(count ?? 0);
    const value = Number(average ?? 0);

    return (
        <div className={`flex items-center gap-1 min-w-0 text-[11px] text-muted-foreground min-h-[1.125rem] ${className ?? ""}`.trim()}>
            <StarRating value={total > 0 ? value : 0} size="sm" className="shrink-0"/>
            {total > 0 ? (
                <span className="truncate">
                    {value.toFixed(1)} ({total})
                </span>
            ) : (
                <span className="truncate">Sem avaliações</span>
            )}
        </div>
    );
};

export default CatalogRating;
