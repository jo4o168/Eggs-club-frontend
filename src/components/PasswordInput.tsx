import {useState, type ComponentProps} from "react";
import {Eye, EyeOff} from "lucide-react";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

const PasswordInput = ({className, disabled, ...props}: PasswordInputProps) => {
    const [visible, setVisible] = useState(false);
    const label = visible ? "Ocultar senha" : "Mostrar senha";

    return (
        <div className="relative">
            <Input
                type={visible ? "text" : "password"}
                className={cn("pr-10", className)}
                disabled={disabled}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((open) => !open)}
                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                aria-label={label}
                title={label}
                disabled={disabled}
            >
                {visible ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
            </button>
        </div>
    );
};

export default PasswordInput;
