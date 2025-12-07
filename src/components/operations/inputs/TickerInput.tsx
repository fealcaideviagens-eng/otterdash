import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface TickerInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    maxLength?: number;
    className?: string;
    prefix?: string;
    onFocus?: () => void;
    disabled?: boolean;
}

export const TickerInput = forwardRef<HTMLInputElement, TickerInputProps>(
    ({ id, label, value, onChange, error, placeholder, maxLength, className, prefix, onFocus, disabled }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const upperValue = e.target.value.toUpperCase();
            const cleanValue = upperValue.replace(/[^A-Z0-9W]/g, '');
            onChange(cleanValue);
        };

        return (
            <div className={className}>
                <Label htmlFor={id}>{label}</Label>
                {prefix ? (
                    <div className={cn(
                        "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1.5",
                        error ? "border-red-500 focus-within:ring-red-500" : ""
                    )}>
                        <div className="flex items-center px-3 text-muted-foreground bg-muted/50 border-r border-input rounded-l-md select-none">
                            {prefix}
                        </div>
                        <Input
                            id={id}
                            ref={ref}
                            value={value}
                            onChange={handleChange}
                            placeholder={placeholder}
                            maxLength={maxLength}
                            onFocus={onFocus}
                            disabled={disabled}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none placeholder-subtle"
                        />
                    </div>
                ) : (
                    <Input
                        id={id}
                        ref={ref}
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        onFocus={onFocus}
                        disabled={disabled}
                        className={cn(
                            "placeholder-subtle mt-1.5",
                            error ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                    />
                )}
                {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
            </div>
        );
    }
);

TickerInput.displayName = "TickerInput";
