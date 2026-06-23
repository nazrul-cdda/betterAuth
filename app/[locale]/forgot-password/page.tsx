"use client"

import { useState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { authClient } from "@/app/lib/auth-client";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;

    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    }, {
      onSuccess: () => setSubmitted(true),
      onError: (ctx) => setError(ctx.error.message),
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="text-center w-64">We sent a password reset link to your email.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="email" name="email" placeholder="Email" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Send Reset Link</Button>
      </form>
    </div>
  );
}