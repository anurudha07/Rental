"use client";

import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/AppSidebar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery(undefined, {
    // ensure query runs immediately
    refetchOnMountOrArgChange: true,
  });
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // only set ready after auth query finishes
  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push("/signin", { scroll: false });
      } else {
        setReady(true);
      }
    }
  }, [authLoading, authUser, router]);

  if (!ready) return <>Loading...</>;

return (
  <SidebarProvider>
    <div className="min-h-screen w-full bg-primary-100">
      <Navbar />
      <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
        <main className="flex">
          <Sidebar
            userType={authUser!.userRole.toLowerCase() as "manager" | "tenant"}
          />
          <div className="flex-grow transition-all duration-300">{children}</div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);

};

export default DashboardLayout;
