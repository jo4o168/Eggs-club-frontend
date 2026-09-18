import { Button } from "./ui/button";

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
  const meta = [frequency, features[0]].filter(Boolean).join(" · ");

  return (
    <article
      className={`relative h-full flex flex-col bg-card rounded-md overflow-hidden border transition-shadow hover:shadow-md ${
        isPopular ? "border-primary" : "border-border"
      }`}
    >
      {isPopular && (
        <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded">
          Mais popular
        </div>
      )}

      <div className="aspect-square bg-secondary overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      <div className="p-2.5 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{meta || description}</p>
        <p className="mt-auto pt-1">
          <span className="text-lg font-semibold text-foreground leading-none">{price}</span>
          <span className="text-xs text-muted-foreground"> / {frequency.toLowerCase()}</span>
        </p>
        <Button
          variant={isPopular ? "default" : "outline"}
          size="sm"
          onClick={onSelect}
          className="w-full h-8 mt-1 text-xs"
        >
          Adicionar
        </Button>
      </div>
    </article>
  );
};

export default PlanCard;
