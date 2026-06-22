import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function Button({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
