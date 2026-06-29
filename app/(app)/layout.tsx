import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileTopBar from "@/components/layout/MobileTopBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar — sticky full height */}
      <div className="sticky top-0 hidden h-dvh shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
