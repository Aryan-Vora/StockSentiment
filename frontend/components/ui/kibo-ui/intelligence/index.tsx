import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "negative" | "warning" | "info";

export function IntelligenceShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        "bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.44)_100%)]",
        className
      )}
      {...props}
    />
  );
}

export function IntelligenceTopbar({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b bg-background/88 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function IntelligenceTopbarInner({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6",
        className
      )}
      {...props}
    />
  );
}

export function IntelligenceMain({
  className,
  ...props
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      className={cn("mx-auto w-full max-w-7xl px-4 py-5 sm:px-6", className)}
      {...props}
    />
  );
}

export function SignalModule({
  className,
  compact = false,
  ...props
}: ComponentPropsWithoutRef<"section"> & { compact?: boolean }) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border bg-card/92 text-card-foreground shadow-sm",
        compact ? "p-4" : "p-4 sm:p-5",
        className
      )}
      {...props}
    />
  );
}

export function SignalModuleHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}
      {...props}
    />
  );
}

export function SignalModuleTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-tight tracking-normal", className)}
      {...props}
    />
  );
}

export function SignalModuleDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("mt-1 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function SignalModuleBody({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-4", className)} {...props} />;
}

export function SignalDivider({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("h-px w-full bg-border", className)} {...props} />;
}

export function SignalStatStrip({
  className,
  ...props
}: ComponentPropsWithoutRef<"dl">) {
  return (
    <dl
      className={cn(
        "grid overflow-hidden rounded-md border bg-muted/24 text-sm sm:grid-cols-3",
        className
      )}
      {...props}
    />
  );
}

export function SignalStat({
  label,
  value,
  detail,
  tone = "neutral",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("border-t px-3 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0", className)}>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 font-semibold", toneClassName(tone))}>{value}</dd>
      {detail ? <dd className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</dd> : null}
    </div>
  );
}

export function EmptySignal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-36 items-center justify-center rounded-md border border-dashed bg-muted/35 p-5 text-center text-sm leading-6 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CommandDock({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/95 p-2 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function toneClassName(tone: Tone) {
  return {
    neutral: "text-foreground",
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-cyan-700 dark:text-cyan-300",
  }[tone];
}
