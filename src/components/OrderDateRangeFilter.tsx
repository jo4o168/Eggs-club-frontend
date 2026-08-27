"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {OrderDateRange} from "@/lib/orderDateRange";
import {X} from "lucide-react";

type OrderDateRangeFilterProps = {
    value: OrderDateRange;
    onChange: (next: OrderDateRange) => void;
    className?: string;
};

export function OrderDateRangeFilter({
    value,
    onChange,
    className,
}: OrderDateRangeFilterProps) {
    const hasRange = Boolean(value.from || value.to);

    return (
        <div className={`flex flex-wrap items-end gap-3 ${className ?? ""}`}>
            <div className="space-y-1.5">
                <Label htmlFor="order-date-from" className="text-xs text-muted-foreground">
                    De
                </Label>
                <Input
                    id="order-date-from"
                    type="date"
                    value={value.from}
                    max={value.to || undefined}
                    onChange={(e) => onChange({...value, from: e.target.value})}
                    className="w-[160px] h-9"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="order-date-to" className="text-xs text-muted-foreground">
                    Até
                </Label>
                <Input
                    id="order-date-to"
                    type="date"
                    value={value.to}
                    min={value.from || undefined}
                    onChange={(e) => onChange({...value, to: e.target.value})}
                    className="w-[160px] h-9"
                />
            </div>
            {hasRange && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={() => onChange({from: "", to: ""})}
                >
                    <X className="w-4 h-4 mr-1"/>
                    Limpar
                </Button>
            )}
        </div>
    );
}
