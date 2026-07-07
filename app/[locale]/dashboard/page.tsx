import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import Header from "@/app/components/header";
import AddMember from "@/app/lib/addMember";
import { signOutAction } from "../../actions/auth";
import { auth } from "../../lib/auth";
import { Button } from "@/components/ui/button";
import Remove from "@/app/lib/Remove";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {session.user.name}
        </p>
      </div>

      <Link
        href="/update-password"
        className="text-sm text-blue-500 underline"
      >
        Change Password
      </Link>

      <form action={signOutAction}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
}
