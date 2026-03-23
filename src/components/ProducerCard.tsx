import { Link } from "react-router-dom";

type CardColor = "green" | "yellow" | "blue";

interface ProducerCardProps {
  id: string;
  name: string;
  displayName: string;
  owner: string;
  location: string;
  description: string;
  color: CardColor;
}

const colorClasses: Record<CardColor, string> = {
  green: "producer-card-green",
  yellow: "producer-card-yellow",
  blue: "producer-card-blue",
};

const textColors: Record<CardColor, string> = {
  green: "text-green-900",
  yellow: "text-yellow-900",
  blue: "text-blue-900",
};

const ProducerCard = ({
  id,
  name,
  displayName,
  owner,
  location,
  description,
  color,
}: ProducerCardProps) => {
  return (
    <Link to={`/produtor/${id}`} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div
          className={`${colorClasses[color]} h-40 flex items-center justify-center border-l-4 border-l-foreground/20`}
        >
          <span className={`text-3xl font-display font-semibold ${textColors[color]}`}>
            {displayName}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-display font-semibold mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {owner} | {location}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProducerCard;
