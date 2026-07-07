
"use client";

import { EmptyState } from "@/app/components/emptyState";
import AddMember from "@/app/lib/addMember";
import Remove from "@/app/lib/Remove";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  WifiOff,
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  ShieldCheck,
  Package,
  Plug,
  Settings,
} from "lucide-react";

export default function EmptyStateTestPage() {
  return (
    <div className="flex min-h-screen items-start justify-left px-4">
      <div className = "w-full max-w-sm rounded-lg">
        <EmptyState
          // ---- required ----
          title="No members yet"

          // ---- icon ----
          // icon={FolderOpen}
          // icon={WifiOff}
          // icon={LayoutDashboard} // Overview
          // icon={Building2}       // Organization
          // icon={Users}           // Members
          // icon={UserCog}         // Roles
          // icon={ShieldCheck}     // Permissions
          icon={Package}         // Plans
          // icon={Plug}            // Addons
          // icon={Settings}        // Organization Settings
          // icon={undefined} // no icon at all

          // ---- description ----
          // description="Create your first project to get started."
          description="Add members to get started"
          // description={undefined} // no description

          // ---- layout ----
          layout="inline"
          // layout="fullpage" // centers card in full viewport height — comment out the
                              // wrapping div above if testing this, since it already
                              // handles its own centering

          // ---- border ----
          // border="dashed"
          // border="solid"
          border="none"

          // ---- padding ----
          // padding="normal"
          // padding="compact"
          // padding="spacious"
    

          // ---- iconSize ----
          iconSize="md"
          // iconSize="sm"
          // iconSize="lg"

          // ---- iconColor / iconBg (any tailwind color classes) ----
          // iconColor="text-muted-foreground"
          // iconBg="bg-muted"
          // iconColor="text-indigo-500"
          // iconBg="bg-indigo-50 dark:bg-indigo-950/30"
          // iconColor="text-rose-500"
          // iconBg="bg-rose-50 dark:bg-rose-950/30"

          // ---- animation ----
          animation="none"
          // animation="pulse"
          // animation="bounce"
          // animation="float"

          // ---- primaryAction: pass any component directly, it's just ReactNode now ----
          primaryAction={
            <Remove />
          }
          // primaryAction={
          //   <Button asChild variant="outline">
          //     <a href="https://example.com">Go to docs</a>
          //   </Button>
          // }
          // primaryAction={<Button type="submit">Submit</Button>}
          // primaryAction={undefined} // no primary action

          // ---- secondaryAction: same idea, renders next to primaryAction ----
          // secondaryAction={
          //   <Button variant="outline" onClick={() => alert("secondary action clicked")}>
          //     Learn more
          //   </Button>
          // }
          // secondaryAction={
          //   <Button asChild variant="outline">
          //     <a href="https://example.com">Docs</a>
          //   </Button>
          // }
          // secondaryAction={undefined} // no secondary action

          // ---- className (extra classes merged onto the card / fullpage wrapper) ----
          className=""

          // className="max-w-md"

          // ---- children (overrides primaryAction/secondaryAction entirely if set) ----
          // >
          //   <button onClick={() => alert("custom child button")}>
          //     Fully custom action
          //   </button>
          // </EmptyState>
        />
      </div>
    </div>
  );
}
