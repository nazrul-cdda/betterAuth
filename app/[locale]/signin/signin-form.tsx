"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  t: {
    title: string;
    email: string;
    password: string;
    forgotPassword: string;
    submit: string;
    errors: { verifyEmail: string };
  };
};

export default function SignInForm({ t }: Props) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authClient.signIn.email({ email, password }, {
      onSuccess: () => router.push("/dashboard"),
      onError: (ctx) => {
        if (ctx.error.status === 403) alert(t.errors.verifyEmail);
        else alert(ctx.error.message);
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="email" name="email" placeholder={t.email} required />
        <Input type="password" name="password" placeholder={t.password} required />
        <a href="/forgot-password" className="text-sm text-blue-500 underline">
          {t.forgotPassword}
        </a>
        <Button type="submit">{t.submit}</Button>
      </form>
    </div>
  );
}
