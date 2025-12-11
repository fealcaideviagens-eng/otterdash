import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface DateInputProps {
    id: string;
    label: string;
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    error?: string;
    className?: string;
    disabled?: boolean;
}

export function DateInput({
    id,
    label,
    value,
    onChange,
    error,
    className,
    disabled
}: DateInputProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (
        <div className={className}>
            <Label htmlFor={id}>{label}</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background",
                            !value && "text-muted-foreground",
                            error ? "border-destructive focus-visible:ring-destructive" : ""
                        )}
                    >
                        {value ? (
                            format(parseLocalDate(value), "dd/MM/yyyy")
                        ) : (
                            <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value ? parseLocalDate(value) : undefined}
                        defaultMonth={value ? parseLocalDate(value) : undefined}
                        onSelect={(date) => {
                            if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const dateString = `${year}-${month}-${day}`;
                                onChange(dateString);
                                setIsCalendarOpen(false);
                            }
                        }}
                        disabled={(date) => {
                            const dayOfWeek = date.getDay();
                            return dayOfWeek === 0 || dayOfWeek === 6;
                        }}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                    />
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
            )}
        </div>
    );
}
