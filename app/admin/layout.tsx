import { AppSidebar } from "@/components/globals/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grow-1">{children}</main>
    </SidebarProvider>
  );
};

export default layout;
