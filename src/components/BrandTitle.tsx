import {Egg} from "lucide-react";

interface BrandTitleProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

const BrandTitle = ({className = "", iconClassName = "", textClassName = ""}: BrandTitleProps) => {
    return (
        <span className={`inline-flex items-center gap-1 sm:gap-1.5 text-base sm:text-xl md:text-2xl font-display font-extrabold text-primary whitespace-nowrap ${className}`.trim()}>
            <Egg className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0 ${iconClassName}`.trim()}/>
            <span className={`tracking-tight ${textClassName}`.trim()}>Egg's Club</span>
        </span>
    );
};

export default BrandTitle;
