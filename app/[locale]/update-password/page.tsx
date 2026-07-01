"use client"

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChangePasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    }, {
      onSuccess: () => setSuccess(true),
      onError: (ctx) => setError(ctx.error.message),
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Password Updated</h1>
        <p className="text-center w-64">Your password has been changed successfully.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="password" name="currentPassword" placeholder="Current Password" required />
        <Input type="password" name="newPassword" placeholder="New Password" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Update Password</Button>
      </form>
    </div>
  );
}