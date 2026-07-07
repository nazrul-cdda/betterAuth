import { EmptyState } from "@/app/components/emptyState";
import Header from "@/app/components/header";
import AddMember from "@/app/lib/addMember";
import { auth } from "@/app/lib/auth";
import Remove from "@/app/lib/Remove";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function () {
  const session  = await auth.api.getSession({
    headers: await headers(),
  });
  if(!session) {
    redirect("/signin");
  }
  return (
    <div className="flex-row min-h-screen items-start justify-start px-4">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <Header
          title="Members"
          description="Manage all members in your organization."
        >
          <AddMember />
          <Remove />
          <AddMember />
        </Header>
      </div>
      <div className="flex items-start justify-start px-4">
        <EmptyState
          title="No members yet"
          description="Add members to get started"
          layout="inline"
          primaryAction={<AddMember />}
          border="solid"
          padding="compact"
          className="max-w-sm p-20"   
        />
      </div>
    </div>
  )
}
