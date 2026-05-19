import {Egg} from "lucide-react";

interface BrandTitleProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

const BrandTitle = ({className = "", iconClassName = "", textClassName = ""}: BrandTitleProps) => {
    return (
        <span className={`inline-flex items-center gap-1.5 text-xl md:text-2xl font-display font-semibold text-primary ${className}`.trim()}>
            <Egg className={`w-5 h-5 md:w-6 md:h-6 ${iconClassName}`.trim()}/>
            <span className={`tracking-tight ${textClassName}`.trim()}>Egg's Club</span>
        </span>
    );
};

export default BrandTitle;
