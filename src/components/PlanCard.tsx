import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: string;
  frequency: string;
  description: string;
  imageUrl?: string | null;
  features?: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

const PlanCard = ({
  name,
  price,
  frequency,
  description,
  imageUrl,
  features = [],
  isPopular = false,
  onSelect,
}: PlanCardProps) => {
  return (
    <div
      className={`relative h-full flex flex-col bg-card rounded-2xl p-6 border-2 transition-all duration-300 ${
        isPopular
          ? "card-highlight border-primary"
          : "border-border hover:border-primary/50 hover:shadow-lg"
      }`}
    >
      {isPopular && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
          MAIS POPULAR
        </div>
      )}

      <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-secondary shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      <h3 className="text-xl font-display font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">{name}</h3>

      <div className="flex items-baseline gap-1 mb-4 shrink-0">
        <span className="text-3xl font-bold text-primary">{price}</span>
        <span className="text-muted-foreground">/ {frequency}</span>
      </div>

      <p className="text-muted-foreground text-sm mb-6 line-clamp-2 min-h-[2.5rem]">{description}</p>

      {features.length > 0 && (
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span className="line-clamp-1">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant={isPopular ? "planPrimary" : "plan"}
        onClick={onSelect}
        className="w-full mt-auto"
      >
        Adicionar ao carrinho
      </Button>
    </div>
  );
};

export default PlanCard;
