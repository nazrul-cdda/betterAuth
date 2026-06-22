"use server"

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../lib/auth";

export async function signUpAction(_prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    });
  } catch (e: any) {
    return { error: e?.body?.message ?? "Something went wrong" };
  }

  redirect("/");
}

export async function signInAction(_prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (e: any) {
    const status = e?.status ?? e?.body?.status;
    if (status === 403) {
      return { error: "Please verify your email before signing in. Check your inbox." };
    }
    return { error: e?.body?.message ?? "Something went wrong" };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch {
    // sign out failure is non-critical, redirect anyway
  }
  redirect("/");
}
