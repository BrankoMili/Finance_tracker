"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-textMain",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-border"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-textThird rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-background [&:has([aria-selected].day-outside)]:bg-hoverBg/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-textMain hover:bg-border "
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
        day_today: "bg-thirdly text-white hover:text-textMain",
        day_outside:
          "day-outside text-textThird aria-selected:bg-background/50 aria-selected:text-textMain",
        day_disabled: "text-textThird opacity-50",
        day_range_middle:
          "aria-selected:bg-hoverBg aria-selected:text-textMain",
        day_hidden: "invisible",
        ...classNames
      }}
      // --- KLJUČNA ISPRAVKA JE OVDE ---
      components={
        {
          IconLeft: () => <ChevronLeft className="h-4 w-4 text-textMain" />,
          IconRight: () => <ChevronRight className="h-4 w-4 text-textMain" />
        } as React.ComponentProps<typeof DayPicker>["components"]
      }
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
