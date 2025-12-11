import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/inputFormatters";

interface CurrencyInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CurrencyInput({
    id,
    label,
    value,
    onChange,
    error,
    placeholder = "0,00",
    className,
    disabled
}: CurrencyInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCurrency(e.target.value);
        onChange(formatted);
    };

    return (
        <div className={className}>
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "placeholder-subtle mt-1.5",
                    error ? "border-destructive focus-visible:ring-destructive" : ""
                )}
            />
            {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
            )}
        </div>
    );
}
