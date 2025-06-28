import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from "@/components/ui/sidebar";
  import { Separator } from "@radix-ui/react-dropdown-menu";
  import React from "react";
  import { SupervisorSidebar } from "./supervisor-sidebar";
  
  export default function SupervisorLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <SidebarProvider>
        <SupervisorSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 data-[orientation=vertical]:h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }