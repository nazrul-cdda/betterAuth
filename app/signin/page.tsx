"use client"

import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { authClient } from "../lib/auth-client";

export default function SignInPage() {
  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authClient.signIn.email({
      email,
      password,
    }, {
      onError: (ctx) => {
        if (ctx.error.status === 403) {
          alert("Please verify your email address");
        }
        alert(ctx.error.message);
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required />
        <Button type="submit">Sign In</Button>
      </form>
    </div>
  );
}