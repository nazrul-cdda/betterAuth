"use client"

import { useState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { authClient } from "../lib/auth-client";

export default function SignUpPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    await authClient.signUp.email({
      email,
      password,
      name,
    }, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (ctx) => {
        setError(ctx.error.message);
      },
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="text-center w-64">Your verification email has been sent. Please check your inbox.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="text" name="name" placeholder="Name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
}