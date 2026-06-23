"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { authClient } from "@/app/lib/auth-client";

export default function ResetPasswordPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const newPassword = formData.get("newPassword") as string;
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }

    await authClient.resetPassword({
      newPassword,
      token,
    }, {
      onSuccess: () => router.push("/signin"),
      onError: (ctx) => setError(ctx.error.message),
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="password" name="newPassword" placeholder="New Password" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Reset Password</Button>
      </form>
    </div>
  );
}