import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: string;
  frequency: string;
  description: string;
  features?: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

const PlanCard = ({
  name,
  price,
  frequency,
  description,
  features = [],
  isPopular = false,
  onSelect,
}: PlanCardProps) => {
  return (
    <div
      className={`bg-card rounded-2xl p-6 border transition-all duration-300 ${
        isPopular
          ? "card-highlight border-primary"
          : "border-border hover:border-primary/50 hover:shadow-lg"
      }`}
    >
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full w-fit mx-auto mb-4 -mt-9">
          MAIS POPULAR
        </div>
      )}

      <h3 className="text-xl font-display font-semibold mb-2">{name}</h3>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-primary">{price}</span>
        <span className="text-muted-foreground">/ {frequency}</span>
      </div>

      <p className="text-muted-foreground text-sm mb-6">{description}</p>

      {features.length > 0 && (
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant={isPopular ? "planPrimary" : "plan"}
        onClick={onSelect}
        className="w-full"
      >
        {isPopular ? "Assinar Agora" : "Selecionar"}
      </Button>
    </div>
  );
};

export default PlanCard;
