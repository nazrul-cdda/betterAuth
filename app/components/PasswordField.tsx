"use client";

import React, {
  forwardRef,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle, Check, Eye, EyeOff, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ============================================================================
 * Strength engine
 *
 * The scoring algorithm is fully decoupled from the component behind
 * `PasswordStrengthEstimator`. The default implementation lazily loads
 * `zxcvbn` (a few hundred kb) via a dynamic import, so pages that never
 * render the strength meter never pay for it, and it never blocks your
 * initial JS bundle.
 *
 * Note: the original `zxcvbn` package is no longer actively maintained
 * (no releases in the last year). It still works fine and is kept here as
 * the zero-config default, but if you want an actively maintained engine,
 * swap in `@zxcvbn-ts/core` by passing your own `strengthEstimator` — the
 * component itself doesn't need to change at all. That's the whole point
 * of this abstraction.
 * ========================================================================= */

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordScore;
  /** A short, user-facing reason the password is weak, if any. */
  warning?: string;
  /** Actionable tips for improving the password, strongest first. */
  suggestions?: string[];
}

export type PasswordStrengthEstimator = (
  password: string
) => PasswordStrengthResult | Promise<PasswordStrengthResult>;

type RawZxcvbnFn = (
  password: string,
  userInputs?: readonly string[]
) => {
  score: PasswordScore;
  feedback: { warning: string; suggestions: string[] };
};

let zxcvbnLoadPromise: Promise<RawZxcvbnFn> | null = null;

/** Loads + caches the zxcvbn bundle. Only ever fetched once, on first use. */
function loadZxcvbn(): Promise<RawZxcvbnFn> {
  if (!zxcvbnLoadPromise) {
    zxcvbnLoadPromise = import("zxcvbn").then((mod) => {
      // Defensive: CJS/ESM interop shape varies by bundler config.
      const fn = (mod as unknown as { default?: unknown }).default ?? mod;
      return fn as unknown as RawZxcvbnFn;
    });
  }
  return zxcvbnLoadPromise;
}

/**
 * Creates a zxcvbn-backed estimator. Pass `userInputs` — the user's name,
 * email, username, company, etc. — so passwords built from a user's own
 * identity (e.g. "JohnSmith92!") score appropriately low instead of
 * getting undeserved credit for character-class variety.
 *
 * @example
 * const estimator = useMemo(
 *   () => createZxcvbnEstimator([user.email, user.firstName]),
 *   [user.email, user.firstName]
 * );
 */
export function createZxcvbnEstimator(
  userInputs?: readonly string[]
): PasswordStrengthEstimator {
  return async (password: string): Promise<PasswordStrengthResult> => {
    const fn = await loadZxcvbn();
    const result = fn(password, userInputs);
    return {
      score: result.score,
      warning: result.feedback?.warning || undefined,
      suggestions: result.feedback?.suggestions,
    };
  };
}

const defaultStrengthEstimator = createZxcvbnEstimator();

/* ============================================================================
 * Copy / i18n — override any visible string without forking the component.
 * ========================================================================= */

export interface PasswordFieldMessages {
  showPassword: string;
  hidePassword: string;
  strengthHint: string;
  strengthLabels: readonly [string, string, string, string, string];
  capsLockWarning: string;
  requirementsListLabel: string;
  requirements: {
    minLength: (n: number) => string;
    maxLength: (n: number) => string;
    numeric: string;
    uppercase: string;
    lowercase: string;
    special: string;
  };
}

const DEFAULT_MESSAGES: PasswordFieldMessages = {
  showPassword: "Show password",
  hidePassword: "Hide password",
  strengthHint: "Password strength",
  strengthLabels: ["Very weak", "Weak", "Fair", "Good", "Strong"],
  capsLockWarning: "Caps Lock is on",
  requirementsListLabel: "Password requirements",
  requirements: {
    minLength: (n) => `At least ${n} characters`,
    maxLength: (n) => `At most ${n} characters`,
    numeric: "Contains a number",
    uppercase: "Contains an uppercase letter",
    lowercase: "Contains a lowercase letter",
    special: "Contains a special character",
  },
};

function resolveMessages(
  overrides?: Partial<PasswordFieldMessages>
): PasswordFieldMessages {
  if (!overrides) return DEFAULT_MESSAGES;
  return {
    ...DEFAULT_MESSAGES,
    ...overrides,
    requirements: {
      ...DEFAULT_MESSAGES.requirements,
      ...overrides.requirements,
    },
  };
}

/* ============================================================================
 * Style constants
 * ========================================================================= */

const STRENGTH_BAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-green-600",
] as const;

const STRENGTH_TEXT_COLORS = [
  "text-red-500",
  "text-orange-500",
  "text-yellow-600",
  "text-emerald-500",
  "text-green-600",
] as const;

const REGEX_NUMERIC = /[0-9]/;
const REGEX_UPPERCASE = /[A-Z]/;
const REGEX_LOWERCASE = /[a-z]/;
const REGEX_SPECIAL = /[^A-Za-z0-9]/;

/* ============================================================================
 * Public types
 * ========================================================================= */

export type PasswordRules = {
  minLength?: number;
  maxLength?: number;
  numeric?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  special?: boolean;
};

export interface PasswordFieldProps
  extends React.ComponentPropsWithoutRef<typeof Input>,
    PasswordRules {
  name: string;
  value: string;
  error?: string;
  touched?: boolean;
  /** Renders an associated <label>. Omit if you're labeling it yourself. */
  label?: string;
  showStrength?: boolean;
  showRequirements?: boolean;
  /** Warns when Caps Lock is on while the field is focused. Default: true. */
  showCapsLockWarning?: boolean;
  /** Defaults to a lazily-loaded zxcvbn. Override for a custom/lighter/async engine. */
  strengthEstimator?: PasswordStrengthEstimator;
  /** Fires whenever the computed strength score changes. */
  onStrengthChange?: (score: PasswordScore) => void;
  /** Override any visible copy, e.g. for localization. */
  messages?: Partial<PasswordFieldMessages>;
}

/* ============================================================================
 * StrengthMeter
 * ========================================================================= */

interface StrengthMeterProps {
  result: PasswordStrengthResult;
  messages: PasswordFieldMessages;
  stale: boolean;
}

const StrengthMeter = React.memo(function StrengthMeter({
  result,
  messages,
  stale,
}: StrengthMeterProps) {
  const safeScore = Math.min(Math.max(result.score, 0), 4) as PasswordScore;
  const hintText =
    result.warning || result.suggestions?.[0] || messages.strengthHint;

  return (
    <div
      className={twMerge(
        "mt-2 space-y-1.5 transition-opacity duration-150 motion-reduce:transition-none",
        stale && "opacity-60"
      )}
      aria-live="polite"
    >
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
              i <= safeScore
                ? STRENGTH_BAR_COLORS[safeScore]
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 dark:text-gray-400">{hintText}</span>
        <span className={`font-semibold ${STRENGTH_TEXT_COLORS[safeScore]}`}>
          {messages.strengthLabels[safeScore]}
        </span>
      </div>
    </div>
  );
});

StrengthMeter.displayName = "StrengthMeter";

/* ============================================================================
 * RequirementsChecklist
 * ========================================================================= */

interface RequirementsChecklistProps {
  value: string;
  rules: PasswordRules;
  messages: PasswordFieldMessages;
  id: string;
}

const RequirementsChecklist = React.memo(function RequirementsChecklist({
  value,
  rules,
  messages,
  id,
}: RequirementsChecklistProps) {
  const items = useMemo(() => {
    const list: { label: string; met: boolean }[] = [];
    const r = messages.requirements;

    if (rules.minLength !== undefined) {
      list.push({
        label: r.minLength(rules.minLength),
        met: value.length >= rules.minLength,
      });
    }
    if (rules.maxLength !== undefined) {
      list.push({
        label: r.maxLength(rules.maxLength),
        met: value.length <= rules.maxLength,
      });
    }
    if (rules.numeric) {
      list.push({ label: r.numeric, met: REGEX_NUMERIC.test(value) });
    }
    if (rules.uppercase) {
      list.push({ label: r.uppercase, met: REGEX_UPPERCASE.test(value) });
    }
    if (rules.lowercase) {
      list.push({ label: r.lowercase, met: REGEX_LOWERCASE.test(value) });
    }
    if (rules.special) {
      list.push({ label: r.special, met: REGEX_SPECIAL.test(value) });
    }

    return list;
  }, [value, rules, messages.requirements]);

  if (items.length === 0) return null;

  return (
    <ul
      id={id}
      className="mt-2 space-y-1 text-xs"
      aria-label={messages.requirementsListLabel}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className={`flex items-center gap-1.5 transition-colors duration-200 motion-reduce:transition-none ${
            item.met
              ? "text-green-600 dark:text-green-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {item.met ? (
            <Check size={12} aria-hidden="true" />
          ) : (
            <X size={12} aria-hidden="true" />
          )}
          <span className="sr-only">
            {item.met ? "Requirement met: " : "Requirement missing: "}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
});

RequirementsChecklist.displayName = "RequirementsChecklist";

/* ============================================================================
 * PasswordField
 * ========================================================================= */

/**
 * A drop-in password input with a visibility toggle, live strength meter,
 * requirements checklist, and Caps Lock warning — fully controlled and
 * accessible, with the scoring engine swappable via `strengthEstimator`.
 *
 * 100% backwards compatible with the previous version's props; every new
 * prop is optional with a sane default.
 *
 * @example
 * <PasswordField
 *   name="password"
 *   label="Password"
 *   value={values.password}
 *   onChange={handleChange}
 *   onBlur={handleBlur}
 *   error={errors.password}
 *   touched={touched.password}
 *   minLength={8}
 *   numeric
 *   uppercase
 *   special
 *   showStrength
 *   showRequirements
 *   autoComplete="new-password"
 * />
 */
export const PasswordField = React.memo(
  forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
    props,
    ref
  ) {
    const {
      name,
      value,
      onChange,
      onBlur,
      onKeyDown,
      onKeyUp,
      error,
      touched,
      label,
      showStrength = false,
      showRequirements = false,
      showCapsLockWarning = true,
      strengthEstimator,
      onStrengthChange,
      messages: messagesProp,
      minLength,
      maxLength,
      numeric,
      uppercase,
      lowercase,
      special,
      placeholder = "Password",
      className,
      id,
      ...restProps
    } = props;

    const [visible, setVisible] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [strengthResult, setStrengthResult] =
      useState<PasswordStrengthResult | null>(null);

    const baseId = useId();
    const inputId = id ?? baseId;
    const errorId = `${baseId}-error`;
    const requirementsId = `${baseId}-requirements`;

    const messages = useMemo(
      () => resolveMessages(messagesProp),
      [messagesProp]
    );

    const rules: PasswordRules = useMemo(
      () => ({ minLength, maxLength, numeric, uppercase, lowercase, special }),
      [minLength, maxLength, numeric, uppercase, lowercase, special]
    );

    // "Latest ref" pattern: the effect below only re-runs when the
    // password value actually changes, never merely because a consumer
    // passed a fresh inline function reference this render. No need to
    // remind every caller to useCallback/useMemo their estimator or
    // onStrengthChange — it's handled here once.
    const estimatorRef = useRef(strengthEstimator ?? defaultStrengthEstimator);
    estimatorRef.current = strengthEstimator ?? defaultStrengthEstimator;

    const onStrengthChangeRef = useRef(onStrengthChange);
    onStrengthChangeRef.current = onStrengthChange;

    // Defer the expensive strength calculation so fast typing never feels
    // laggy: the input's own value is never deferred (it stays instant),
    // only the derived meter lags a beat behind under load and catches up
    // once the browser is idle. The requirements checklist below does NOT
    // use this — plain regex tests are cheap enough to run on every
    // keystroke with no perceptible cost.
    const deferredValue = useDeferredValue(value);
    const isStale = value !== deferredValue;

    useEffect(() => {
      if (!showStrength || !deferredValue) {
        setStrengthResult(null);
        return;
      }
      let cancelled = false;
      Promise.resolve(estimatorRef.current(deferredValue)).then((result) => {
        if (!cancelled) setStrengthResult(result);
      });
      return () => {
        cancelled = true;
      };
    }, [deferredValue, showStrength]);

    useEffect(() => {
      if (strengthResult) {
        onStrengthChangeRef.current?.(strengthResult.score);
      }
    }, [strengthResult]);

    const isInvalid = Boolean(touched && error);

    const describedBy =
      [
        isInvalid ? errorId : null,
        showRequirements && value ? requirementsId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const toggleVisibility = useCallback(() => setVisible((v) => !v), []);

    const updateCapsLockState = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (
          showCapsLockWarning &&
          typeof event.getModifierState === "function"
        ) {
          setCapsLockOn(event.getModifierState("CapsLock"));
        }
      },
      [showCapsLockWarning]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event);
        updateCapsLockState(event);
      },
      [onKeyDown, updateCapsLockState]
    );

    const handleKeyUp = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyUp?.(event);
        updateCapsLockState(event);
      },
      [onKeyUp, updateCapsLockState]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setCapsLockOn(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <Input
            {...restProps}
            ref={ref}
            id={inputId}
            name={name}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            maxLength={maxLength}
            className={twMerge("pr-10", className)}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
          />

          <div className="absolute inset-y-0 right-1 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleVisibility}
              className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              aria-label={
                visible ? messages.hidePassword : messages.showPassword
              }
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </div>

        {isInvalid && (
          <p id={errorId} className="text-red-500 text-xs mt-1" role="alert">
            {error}
          </p>
        )}

        {showCapsLockWarning && capsLockOn && (
          <p
            role="status"
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500 mt-1"
          >
            <AlertTriangle size={12} aria-hidden="true" />
            {messages.capsLockWarning}
          </p>
        )}

        {showStrength && value && strengthResult && (
          <StrengthMeter
            result={strengthResult}
            messages={messages}
            stale={isStale}
          />
        )}

        {showRequirements && value && (
          <RequirementsChecklist
            value={value}
            rules={rules}
            messages={messages}
            id={requirementsId}
          />
        )}
      </div>
    );
  })
);

PasswordField.displayName = "PasswordField";
