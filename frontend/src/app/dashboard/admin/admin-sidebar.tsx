"use client";

import * as React from "react";
import {
  BuildingIcon,
  Users,
  Building,
  ChartBarStacked,
  Star,
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

const adminNavItems = [
  {
    title: "Users",
    url: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Categories",
    url: "/dashboard/admin/categories",
    icon: ChartBarStacked,
  },
  {
    title: "Businesses",
    url: "/dashboard/admin/businesses",
    icon: Building,
  },
  {
    title: "Reviews",
    url: "/dashboard/admin/reviews",
    icon: Star,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
