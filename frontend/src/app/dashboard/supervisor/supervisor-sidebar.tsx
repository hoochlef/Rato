"use client";

import * as React from "react";
import {
  BuildingIcon,
  MessageCircle,
} from "lucide-react";

import { NavUser } from "@/components/custom/dashboard-components/nav-user";
import { TeamSwitcher } from "@/components/custom/dashboard-components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const teams = [
  {
    name: "Rato Inc",
    logo: BuildingIcon,
    plan: "Enterprise",
  },
];

export function SupervisorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Supervisor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Feedback">
                <SidebarMenuButton asChild>
                  <a href="/dashboard/supervisor/feedback">
                    <MessageCircle />
                    <span>Customers Feedback</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
