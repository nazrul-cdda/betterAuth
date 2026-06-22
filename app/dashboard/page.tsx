import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/features/shared/components/ui/button";
import { signOutAction } from "../actions/auth";
import { auth } from "../lib/auth";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-lg">Welcome, {session.user.name}</p>
      <Link href="/update-password" className="text-sm text-blue-500 underline">
        Change Password
      </Link>
      <form action={signOutAction}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
}
