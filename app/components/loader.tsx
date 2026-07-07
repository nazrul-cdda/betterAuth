"use client"

/**
 * Loader
 * ------
 * One reusable, type-safe loading component covering every loading scenario
 * in the app. Built entirely on top of existing shadcn/ui primitives
 * (Skeleton, Progress, Spinner) — no new loading animation is introduced.
 *
 * Usage:
 *   <Loader variant="page" />
 *   <Loader variant="table" rows={10} columns={5} />
 *   <Loader variant="cards" count={8} />
 *   <Loader variant="progress" value={60} />
 *
 * Adding a new variant later only requires 3 steps (search "EXTENDING"
 * below):
 *   1. Add the variant + its props to the `LoaderVariantProps` union.
 *   2. Implement a small private component for it.
 *   3. Register it in `variantRegistry`.
 * No switch statement needs to be touched.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoaderSize = "sm" | "md" | "lg"

interface LoaderBaseProps {
  /** Extra classes merged onto the loader's root element. */
  className?: string
}

/**
 * Discriminated union of every supported variant and the props it uniquely
 * accepts. Passing props that don't belong to the selected `variant` is a
 * TypeScript error.
 *
 * EXTENDING (step 1): add a new `{ variant: "..."; ...ownProps }` member here.
 */
type LoaderVariantProps =
  | { variant: "page" }
  | { variant: "block" }
  | { variant: "table"; rows?: number; columns?: number; columnWidths?: string[] }
  | { variant: "cards"; count?: number }
  | { variant: "list"; count?: number; lineWidths?: string[] }
  | { variant: "avatar" }
  | { variant: "form"; fields?: number }
  | { variant: "text"; lines?: number; lineWidths?: string[] }
  | { variant: "button"; label?: string }
  | { variant: "spinner"; size?: LoaderSize }
  | { variant: "progress"; value: number; label?: string }
  | { variant: "bars"; bars: string[] }

export type LoaderVariant = LoaderVariantProps["variant"]

export type LoaderProps = LoaderBaseProps & LoaderVariantProps

/** Helper: props for one specific variant's private component. */
type VariantProps<V extends LoaderVariant> = LoaderBaseProps &
  Omit<Extract<LoaderVariantProps, { variant: V }>, "variant">

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const spinnerSizeClasses: Record<LoaderSize, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-8",
}

/** Visually-hidden text for screen readers, paired with a spinner/skeleton. */
function SrStatus({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Private variant components
// ---------------------------------------------------------------------------

function PageLoader({ className }: VariantProps<"page">) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3",
        className
      )}
      aria-busy="true"
    >
      <Spinner className="size-8 text-muted-foreground" />
      <SrStatus label="Loading page" />
    </div>
  )
}

function BlockLoader({ className }: VariantProps<"block">) {
  return (
    <div
      className={cn(
        "flex min-h-[12rem] w-full items-center justify-center rounded-lg border border-dashed",
        className
      )}
      aria-busy="true"
    >
      <Spinner className="size-6 text-muted-foreground" />
      <SrStatus label="Loading content" />
    </div>
  )
}

function TableLoader({
  rows = 5,
  columns = 4,
  columnWidths,
  className,
}: VariantProps<"table">) {
  // Falls back to an equal flex-1 split when no explicit widths are given.
  // If fewer widths than columns are provided, they cycle.
  const widthFor = (col: number) =>
    columnWidths && columnWidths.length > 0
      ? columnWidths[col % columnWidths.length]
      : "flex-1"

  return (
    <div
      className={cn("w-full overflow-hidden rounded-lg border", className)}
      aria-busy="true"
    >
      <SrStatus label="Loading table" />
      <div className="flex border-b bg-muted/40 p-3" aria-hidden="true">
        {Array.from({ length: columns }).map((_, col) => (
          <Skeleton key={col} className={cn("mr-4 h-4 last:mr-0", widthFor(col))} />
        ))}
      </div>
      <div className="divide-y" aria-hidden="true">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex items-center p-3">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} className={cn("mr-4 h-4 last:mr-0", widthFor(col))} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CardsLoader({ count = 6, className }: VariantProps<"cards">) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      aria-busy="true"
    >
      <SrStatus label="Loading cards" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4" aria-hidden="true">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function ListLoader({ count = 5, lineWidths, className }: VariantProps<"list">) {
  const widthFor = (i: number) =>
    lineWidths && lineWidths.length > 0 ? lineWidths[i % lineWidths.length] : "w-2/3"

  return (
    <div className={cn("w-full space-y-4", className)} aria-busy="true">
      <SrStatus label="Loading list" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3" aria-hidden="true">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className={cn("h-4", widthFor(i))} />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AvatarLoader({ className }: VariantProps<"avatar">) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-busy="true">
      <SrStatus label="Loading profile" />
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" aria-hidden="true" />
      <div className="space-y-2" aria-hidden="true">
        <Skeleton className="h-4 w-[160px]" />
        <Skeleton className="h-3 w-[110px]" />
      </div>
    </div>
  )
}

function FormLoader({ fields = 4, className }: VariantProps<"form">) {
  return (
    <div className={cn("w-full space-y-6", className)} aria-busy="true">
      <SrStatus label="Loading form" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2" aria-hidden="true">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" aria-hidden="true" />
    </div>
  )
}

function TextLoader({ lines = 3, lineWidths, className }: VariantProps<"text">) {
  // If explicit widths are given, use them (cycling if fewer than `lines`).
  // Otherwise fall back to: full width, except the last line at 2/3.
  const widthFor = (i: number) => {
    if (lineWidths && lineWidths.length > 0) return lineWidths[i % lineWidths.length]
    return i === lines - 1 ? "w-2/3" : "w-full"
  }

  return (
    <div className={cn("w-full space-y-2", className)} aria-busy="true">
      <SrStatus label="Loading text" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", widthFor(i))} aria-hidden="true" />
      ))}
    </div>
  )
}

function ButtonLoader({ label = "Loading...", className }: VariantProps<"button">) {
  return (
    <button
      type="button"
      disabled
      aria-busy="true"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-70",
        className
      )}
    >
      <Spinner className="size-4" />
      {label}
    </button>
  )
}

function SpinnerLoader({ size = "md", className }: VariantProps<"spinner">) {
  return <Spinner className={cn(spinnerSizeClasses[size], className)} />
}

function ProgressLoader({
  value,
  label,
  className,
}: VariantProps<"progress">) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <Progress value={value} aria-label={label ?? "Loading progress"} />
    </div>
  )
}

function BarsLoader({ bars, className }: VariantProps<"bars">) {
  return (
    <div className={cn("w-full space-y-2", className)} aria-busy="true">
      <SrStatus label="Loading" />
      {bars.map((barClassName, i) => (
        <Skeleton key={i} className={barClassName} aria-hidden="true" />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dispatch registry (replaces a giant switch statement)
// ---------------------------------------------------------------------------

/**
 * EXTENDING (step 3): register the new component here, keyed by its variant
 * name. `satisfies` keeps every entry checked against the props declared in
 * `LoaderVariantProps`, so a mismatched implementation fails to compile.
 */
const variantRegistry = {
  page: PageLoader,
  block: BlockLoader,
  table: TableLoader,
  cards: CardsLoader,
  list: ListLoader,
  avatar: AvatarLoader,
  form: FormLoader,
  text: TextLoader,
  button: ButtonLoader,
  spinner: SpinnerLoader,
  progress: ProgressLoader,
  bars: BarsLoader,
} satisfies { [K in LoaderVariant]: React.ComponentType<VariantProps<K>> }

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

function Loader(props: LoaderProps) {
  const { variant, className, ...rest } = props
  const Component = variantRegistry[variant] as React.ComponentType<LoaderBaseProps & Record<string, unknown>>
  return <Component className={className} {...rest} />
}

export { Loader }
