"use client"

import { useActionState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { signUpAction } from "../actions/auth";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, null);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form action={formAction} className="flex flex-col gap-3 w-64">
        <Input type="text" name="name" placeholder="Name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required />
        {state?.error && (
          <p className="text-red-500 text-sm">{state.error}</p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}