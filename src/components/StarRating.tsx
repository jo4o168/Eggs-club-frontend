import {Star} from "lucide-react";
import {cn} from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: "sm" | "md";
    className?: string;
}

const StarRating = ({value, onChange, size = "md", className}: StarRatingProps) => {
    const iconClass = size === "sm" ? "h-3 w-3" : "h-5 w-5";

    return (
        <div className={cn("inline-flex items-center gap-0.5", className)} role={onChange ? "radiogroup" : "img"} aria-label={`${value} de 5`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(value);
                const icon = (
                    <Star className={cn(iconClass, filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}/>
                );
                if (!onChange) {
                    return <span key={star}>{icon}</span>;
                }
                return (
                    <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={star === value}
                        aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
                        className="p-0.5 rounded-sm hover:scale-110 transition-transform"
                        onClick={() => onChange(star)}
                    >
                        {icon}
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
