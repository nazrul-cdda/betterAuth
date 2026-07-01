// components/PasswordField.tsx
"use client"

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import zxcvbn from "zxcvbn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- StrengthMeter (driven by zxcvbn) ---

const bgColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-green-600"];
const textColors = ["text-red-500", "text-orange-500", "text-yellow-600", "text-emerald-500", "text-green-600"];
const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

function StrengthMeter({ password }: { password: string }) {
  const { score, feedback } = zxcvbn(password);

  return (
    <div className="mt-2 space-y-1.5">
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
        <span className="text-gray-500 dark:text-gray-400">
          {feedback.warning || "Password strength"}
        </span>
        <span className={`font-semibold ${textColors[score]}`}>{labels[score]}</span>
      </div>
    </div>
  );
}

// --- RequirementsChecklist ---

type Rules = {
  minLength?: number;
  numeric?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  special?: boolean;
};

function RequirementsChecklist({ password, rules }: { password: string; rules: Rules }) {
  const items: { label: string; met: boolean }[] = [];

  if (rules.minLength !== undefined) {
    items.push({ label: `At least ${rules.minLength} characters`, met: password.length >= rules.minLength });
  }
  if (rules.numeric) {
    items.push({ label: "Contains a number", met: /[0-9]/.test(password) });
  }
  if (rules.uppercase) {
    items.push({ label: "Contains an uppercase letter", met: /[A-Z]/.test(password) });
  }
  if (rules.lowercase) {
    items.push({ label: "Contains a lowercase letter", met: /[a-z]/.test(password) });
  }
  if (rules.special) {
    items.push({ label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) });
  }

  if (items.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1 text-xs">
      {items.map((item) => (
        <li key={item.label} className={`flex items-center gap-1.5 ${item.met ? "text-green-600" : "text-gray-500"}`}>
          {item.met ? <Check size={12} /> : <X size={12} />}
          {item.label}
        </li>
      ))}
    </ul>
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
  lowercase?: boolean;
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
  lowercase,
  special,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const rules: Rules = { minLength, numeric, uppercase, lowercase, special };

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

      {touched && error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {showStrength && value && <StrengthMeter password={value} />}
      {value && <RequirementsChecklist password={value} rules={rules} />}
    </div>
  );
}