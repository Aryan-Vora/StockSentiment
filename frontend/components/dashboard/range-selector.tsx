"use client";

import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
  ChoiceboxItemHeader,
  ChoiceboxItemTitle,
} from "@/components/ui/kibo-ui/choicebox";
import { dateRangeOptions, type RangeKey } from "./date-ranges";

interface RangeSelectorProps {
  value: RangeKey;
  onValueChange: (value: string) => void;
}

export function RangeSelector({ value, onValueChange }: RangeSelectorProps) {
  return (
    <Choicebox
      className="grid grid-cols-5 gap-1.5 sm:max-w-md sm:gap-2"
      onValueChange={onValueChange}
      value={value}
    >
      {dateRangeOptions.map((option) => (
        <ChoiceboxItem
          className="min-h-11 cursor-pointer p-2 text-center transition-colors hover:border-primary/45 hover:bg-accent/55"
          id={`range-${option.key}`}
          key={option.key}
          value={option.key}
        >
          <ChoiceboxIndicator className="sr-only" id={`range-${option.key}`} />
          <ChoiceboxItemHeader>
            <ChoiceboxItemTitle className="w-full justify-center text-[0.72rem] sm:text-xs">
              {option.label}
            </ChoiceboxItemTitle>
          </ChoiceboxItemHeader>
        </ChoiceboxItem>
      ))}
    </Choicebox>
  );
}
