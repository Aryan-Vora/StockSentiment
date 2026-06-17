import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandDock } from "@/components/ui/kibo-ui/intelligence";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TickerSearchFormProps {
  className?: string;
  defaultTicker?: string;
  range?: string;
  submitLabel?: string;
  compact?: boolean;
}

export function TickerSearchForm({
  className,
  defaultTicker,
  range,
  submitLabel = "Compare",
  compact = false,
}: TickerSearchFormProps) {
  return (
    <form action="/dashboard" className={cn("w-full", className)}>
      {range ? <input type="hidden" name="range" value={range} /> : null}
      <CommandDock className={compact ? "p-1.5" : undefined}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Ticker</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className={cn(
                "h-11 bg-muted/40 pl-9 text-center font-medium uppercase placeholder:normal-case focus:bg-background sm:text-left",
                !compact && "sm:h-12"
              )}
              defaultValue={defaultTicker}
              name="ticker"
              pattern="[A-Za-z][A-Za-z0-9.-]{0,9}"
              placeholder="AAPL, GME, TSLA..."
              required
            />
          </label>
          <Button className={cn("h-11 px-4", !compact && "sm:h-12")} type="submit">
            {submitLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CommandDock>
    </form>
  );
}
