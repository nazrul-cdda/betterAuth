"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- password-strength configurations ---

interface StrengthConfig {
  minLength?: number;
  numeric?: boolean;
  uppercase?: boolean;
  special?: boolean;
}

function getPasswordStrength(
  password: string,
  config: StrengthConfig = {}
): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  const {
    minLength = 8,
    numeric,
    uppercase,
    special,
  } = config;

  // If any rule prop is explicitly provided, we run in custom mode.
  // Otherwise, default to evaluating all rules for backwards compatibility.
  const isCustomMode =
    config.minLength !== undefined ||
    numeric !== undefined ||
    uppercase !== undefined ||
    special !== undefined;

  const rules = {
    length: true, // Always check length
    uppercase: isCustomMode ? !!uppercase : true,
    numeric: isCustomMode ? !!numeric : true,
    special: isCustomMode ? !!special : true,
  };

  let totalRules = 0;
  let passedRules = 0;

  // 1. Min Length Rule
  totalRules++;
  if (password.length >= minLength) {
    passedRules++;
  }

  // 2. Uppercase Letter Rule
  if (rules.uppercase) {
    totalRules++;
    if (/[A-Z]/.test(password)) {
      passedRules++;
    }
  }

  // 3. Numeric Character Rule
  if (rules.numeric) {
    totalRules++;
    if (/[0-9]/.test(password)) {
      passedRules++;
    }
  }

  // 4. Special Character Rule
  if (rules.special) {
    totalRules++;
    if (/[^A-Za-z0-9]/.test(password)) {
      passedRules++;
    }
  }

  // Map ratio [0, 1] dynamically to standard 5-step score [0, 4]
  const ratio = totalRules > 0 ? passedRules / totalRules : 0;
  const score = Math.round(ratio * 4) as 0 | 1 | 2 | 3 | 4;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

// --- StrengthMeter ---

const bgColors = [
  "bg-red-500",      // Very weak
  "bg-orange-500",   // Weak
  "bg-yellow-500",   // Fair
  "bg-emerald-500",  // Good
  "bg-green-600",    // Strong
];

const textColors = [
  "text-red-500",
  "text-orange-500",
  "text-yellow-600 dark:text-yellow-500",
  "text-emerald-500",
  "text-green-600 dark:text-green-500",
];

interface StrengthMeterProps extends StrengthConfig {
  password: string;
}

function StrengthMeter({ password, ...config }: StrengthMeterProps) {
  const { score, label } = getPasswordStrength(password, config);

  return (
    <div className="mt-2 space-y-1.5 transition-all duration-300">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? bgColors[score] : "bg-gray-200 dark:bg-gray-800"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 dark:text-gray-400">Password strength</span>
        <span className={`font-semibold ${textColors[score]}`}>{label}</span>
      </div>
    </div>
  );
}

// --- PasswordField ---

type PasswordFieldProps = {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  showStrength?: boolean;
  minLength?: number;
  maxLength?: number;
  numeric?: boolean;
  uppercase?: boolean;
  special?: boolean;
};

export function PasswordField({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  showStrength,
  minLength,
  maxLength,
  numeric,
  uppercase,
  special,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1 w-full">
      <div className="relative">
        <Input
          name={name}
          type={visible ? "text" : "password"}
          placeholder="Password"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          className="pr-10"
        />

        <div className="absolute inset-y-0 right-1 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setVisible((v) => !v)}
            className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>

      {touched && error && (
        <p className="text-red-500 text-xs mt-1 animate-fadeIn">{error}</p>
      )}

      {showStrength && value && (
        <StrengthMeter
          password={value}
          minLength={minLength}
          numeric={numeric}
          uppercase={uppercase}
          special={special}
        />
      )}
    </div>
  );
}