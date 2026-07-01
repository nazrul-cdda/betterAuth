"use client";

import React, { useState, useMemo, forwardRef, useId } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import zxcvbn from "zxcvbn";
import { twMerge } from "tailwind-merge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Constants & Reusable Regexes ---

const BG_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-green-600",
];

const TEXT_COLORS = [
  "text-red-500",
  "text-orange-500",
  "text-yellow-600",
  "text-emerald-500",
  "text-green-600",
];

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];

const REGEX_NUMERIC = /[0-9]/;
const REGEX_UPPERCASE = /[A-Z]/;
const REGEX_LOWERCASE = /[a-z]/;
const REGEX_SPECIAL = /[^A-Za-z0-9]/;

// --- Types ---

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
  showStrength?: boolean;
  showRequirements?: boolean;
}

interface StrengthMeterProps {
  zxcvbnResult: zxcvbn.ZXCVBNResult;
}

interface RequirementsChecklistProps {
  value: string;
  rules: PasswordRules;
  id: string;
}

// --- StrengthMeter ---

const StrengthMeter = React.memo(
  ({ zxcvbnResult }: StrengthMeterProps) => {
    const { score, feedback } = zxcvbnResult;
    const warningText = feedback.warning || "Password strength";
    const labelText = LABELS[score];

    return (
      <div className="mt-2 space-y-1.5" aria-live="polite">
        <div className="flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= score
                  ? BG_COLORS[score]
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {warningText}
          </span>

          <span className={`font-semibold ${TEXT_COLORS[score]}`}>
            {labelText}
          </span>
        </div>
      </div>
    );
  }
);

StrengthMeter.displayName = "StrengthMeter";

// --- RequirementsChecklist ---

const RequirementsChecklist = React.memo(
  ({ value, rules, id }: RequirementsChecklistProps) => {
    const items = useMemo(() => {
      const list: { label: string; met: boolean }[] = [];

      if (rules.minLength !== undefined) {
        list.push({
          label: `At least ${rules.minLength} characters`,
          met: value.length >= rules.minLength,
        });
      }

      if (rules.maxLength !== undefined) {
        list.push({
          label: `At most ${rules.maxLength} characters`,
          met: value.length <= rules.maxLength,
        });
      }

      if (rules.numeric) {
        list.push({
          label: "Contains a number",
          met: REGEX_NUMERIC.test(value),
        });
      }

      if (rules.uppercase) {
        list.push({
          label: "Contains an uppercase letter",
          met: REGEX_UPPERCASE.test(value),
        });
      }

      if (rules.lowercase) {
        list.push({
          label: "Contains a lowercase letter",
          met: REGEX_LOWERCASE.test(value),
        });
      }

      if (rules.special) {
        list.push({
          label: "Contains a special character",
          met: REGEX_SPECIAL.test(value),
        });
      }

      return list;
    }, [value, rules]);

    if (items.length === 0) return null;

    return (
      <ul
        id={id}
        className="mt-2 space-y-1 text-xs"
        aria-label="Password requirements"
      >
        {items.map((item) => (
          <li
            key={item.label}
            className={`flex items-center gap-1.5 ${
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
              {item.met
                ? "Requirement met: "
                : "Requirement missing: "}
            </span>

            {item.label}
          </li>
        ))}
      </ul>
    );
  }
);

RequirementsChecklist.displayName = "RequirementsChecklist";

// --- PasswordField ---

export const PasswordField = forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>((props, ref) => {
  const {
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    showStrength = false,
    showRequirements = false,
    minLength,
    maxLength,
    numeric,
    uppercase,
    lowercase,
    special,
    placeholder = "Password",
    className,
    ...restProps
  } = props;

  const [visible, setVisible] = useState(false);

  const baseId = useId();
  const errorId = `${baseId}-error`;
  const requirementsId = `${baseId}-requirements`;

  const rules: PasswordRules = useMemo(
    () => ({
      minLength,
      maxLength,
      numeric,
      uppercase,
      lowercase,
      special,
    }),
    [minLength, maxLength, numeric, uppercase, lowercase, special]
  );

  // FIX #1: Only compute when needed
  const zxcvbnResult = useMemo(() => {
    if (!showStrength || !value) return null;
    return zxcvbn(value);
  }, [value, showStrength]);

  const isInvalid = Boolean(touched && error);

  const describedBy =
    [
      isInvalid ? errorId : null,
      showRequirements && value ? requirementsId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const toggleVisibility = () => setVisible((prev) => !prev);

  return (
    <div className="space-y-1 w-full">
      <div className="relative">
        <Input
          {...restProps}
          ref={ref}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          className={twMerge("pr-10", className)} // FIX #3
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
            aria-label={visible ? "Hide password" : "Show password"}
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

      {showStrength && value && zxcvbnResult && (
        <StrengthMeter zxcvbnResult={zxcvbnResult} />
      )}

      {showRequirements && value && (
        <RequirementsChecklist
          value={value}
          rules={rules}
          id={requirementsId}
        />
      )}
    </div>
  );
});

PasswordField.displayName = "PasswordField";
