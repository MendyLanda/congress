"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  /**
   * Selected date value (ISO date string or Date object)
   */
  value?: string | Date;
  /**
   * Callback when date changes (returns ISO date string)
   */
  onChange?: (date: string | undefined) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;
  /**
   * HTML id attribute
   */
  id?: string;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Calendar caption layout
   */
  captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  id,
  className,
  minDate,
  maxDate,
  captionLayout = "dropdown",
}: DatePickerProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);

  function parseIsoDateToLocal(value: string): Date | undefined {
    // Expecting "YYYY-MM-DD" or full ISO. We only care about the date portion.
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) return undefined;
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, monthIndex, day);
  }

  function formatLocalDateToIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Treat the external value as the canonical ISO "YYYY-MM-DD" when present
  const currentIso = typeof value === "string" ? value : undefined;
  const date = currentIso ? parseIsoDateToLocal(currentIso) : undefined;

  const handleSelect = React.useCallback(
    (selectedDate: Date | undefined) => {
      if (selectedDate) {
        const isoDate = formatLocalDateToIso(selectedDate);
        if (isoDate !== currentIso) onChange?.(isoDate);
      } else {
        if (currentIso !== undefined) onChange?.(undefined);
      }
      setOpen(false);
    },
    [onChange, currentIso],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span>
            {date ? date.toLocaleDateString(i18n.language) : placeholder}
          </span>
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout={captionLayout}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
