import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={`border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}

export default Input;
