"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

/**
 * Works with lucide-react, hugeicons-react, or any icon component shaped
 * like (props: SVGProps<SVGSVGElement> & { size?: number | string }) => JSX.Element.
 */
type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number | string }
>;

type BorderStyle = "dashed" | "solid" | "none";
type CardPadding = "compact" | "normal" | "spacious";
type IconSize = "sm" | "md" | "lg";
type Animation = "none" | "pulse" | "bounce" | "float";

// ---------------------------------------------------------------------------
// Style lookups — these only ever add/override classes on top of the base
// `Empty`/`EmptyMedia` primitives; they never replace or duplicate the
// underlying structure from empty.tsx.
// ---------------------------------------------------------------------------

const BORDER_CLASSES: Record<BorderStyle, string> = {
  dashed: "border border-dashed border-border bg-card",
  solid: "border border-solid border-border bg-card shadow-sm",
  none: "border-none bg-transparent",
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  compact: "p-6",
  normal: "p-10 md:p-14",
  spacious: "p-16 md:p-24",
};

const ICON_WRAPPER_SIZE: Record<IconSize, string> = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
};

const ICON_SIZE: Record<IconSize, string> = {
  sm: "size-5",
  md: "size-7",
  lg: "size-9",
};

const ANIMATION_CLASSES: Record<Animation, string> = {
  none: "",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  // "float" is driven by the Web Animations API below, not a class.
  float: "",
};

export interface EmptyStateProps
  extends Omit<React.ComponentProps<"div">, "title"> {
  icon?: IconComponent;
  title: string;
  description?: string;

  /** "inline" renders just the card (drop into a section/dashboard).
   *  "fullpage" centers the card in a min-h-[100dvh] wrapper (drop in as a page). */
  layout?: "inline" | "fullpage";

  /** Border treatment for the outer `Empty` card */
  border?: BorderStyle;
  /** Padding density for the outer `Empty` card */
  padding?: CardPadding;
  /** Size of the icon + its circular `EmptyMedia` wrapper */
  iconSize?: IconSize;
  /** Tailwind text color class for the icon, e.g. "text-indigo-500" */
  iconColor?: string;
  /** Tailwind background color class for the icon wrapper, e.g. "bg-indigo-50 dark:bg-indigo-950/30" */
  iconBg?: string;
  /** Optional entrance/idle animation on the icon wrapper */
  animation?: Animation;

  /** Pass any component here — a <Button>, a <Dialog> trigger, your
   *  router's <Link>, whatever. Rendered inside `EmptyContent` exactly as given. */
  primaryAction?: React.ReactNode;
  /** Same idea, rendered next to primaryAction. */
  secondaryAction?: React.ReactNode;

  /** Full manual control over the whole action row. Overrides
   *  primaryAction/secondaryAction if provided. */
  children?: React.ReactNode;
}

/**
 * EmptyState — a prop-driven convenience wrapper around the `Empty` /
 * `EmptyHeader` / `EmptyMedia` / `EmptyTitle` / `EmptyDescription` /
 * `EmptyContent` primitives (see components/ui/empty.tsx).
 *
 * Use this when you just want to pass props and get a full empty state.
 * Use the primitives directly when you want to hand-compose a fully custom
 * layout — this component doesn't replace them, it just saves you from
 * writing the same composition every time.
 *
 * @example
 * <EmptyState
 *   icon={FolderOpen}
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   primaryAction={<Button onClick={openModal}>New Project</Button>}
 * />
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon: Icon,
      title,
      description,
      className,
      children,
      layout = "inline",
      border = "dashed",
      padding = "normal",
      iconSize = "md",
      iconColor = "text-muted-foreground",
      iconBg = "bg-muted",
      animation = "none",
      primaryAction,
      secondaryAction,
      ...props
    },
    ref
  ) => {
    // Float animation runs via the Web Animations API on the icon wrapper
    // itself, scoped to that node — no global <style>/@keyframes injected,
    // so it can't collide with anything else on the host page.
    const mediaRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (animation !== "float" || !mediaRef.current) return;
      const el = mediaRef.current;
      const anim = el.animate(
        [
          { transform: "translateY(0px)" },
          { transform: "translateY(-8px)" },
          { transform: "translateY(0px)" },
        ],
        { duration: 3000, iterations: Infinity, easing: "ease-in-out" }
      );
      return () => anim.cancel();
    }, [animation]);

    const content = (
      <Empty
        role="status"
        aria-live="polite"
        className={cn(
          "isolate",
          BORDER_CLASSES[border],
          PADDING_CLASSES[padding],
          layout === "inline" && className
        )}
        {...(layout === "inline" ? { ref, ...props } : {})}
      >
        <EmptyHeader>
          {Icon && (
            <EmptyMedia
              ref={mediaRef}
              variant="icon"
              className={cn(
                "rounded-full",
                ICON_WRAPPER_SIZE[iconSize],
                iconBg,
                ANIMATION_CLASSES[animation]
              )}
            >
              <Icon className={cn(ICON_SIZE[iconSize], iconColor)} aria-hidden="true" />
            </EmptyMedia>
          )}
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>

        {(children || primaryAction || secondaryAction) && (
          <EmptyContent>
            <div className="flex w-full flex-wrap items-center justify-center gap-3">
              {children ?? (
                <>
                  {primaryAction}
                  {secondaryAction}
                </>
              )}
            </div>
          </EmptyContent>
        )}
      </Empty>
    );

    if (layout === "fullpage") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex min-h-[100dvh] w-full items-center justify-center bg-background px-4",
            className
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    return content;
  }
);

EmptyState.displayName = "EmptyState";
