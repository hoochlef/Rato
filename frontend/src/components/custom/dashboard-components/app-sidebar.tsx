"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  MessageSquare,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/custom/dashboard-components/nav-main";
import { NavProjects } from "@/components/custom/dashboard-components/nav-projects";
import { NavUser } from "@/components/custom/dashboard-components/nav-user";
import { TeamSwitcher } from "@/components/custom/dashboard-components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  // Admin navigation items
  adminNavMain: [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard/admin",
        },
        {
          title: "Analytics",
          url: "/dashboard/admin/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/admin/reports",
        },
      ],
    },
    {
      title: "Users",
      url: "/dashboard/admin/users",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/dashboard/admin/users",
        },
        {
          title: "Supervisors",
          url: "/dashboard/admin/users/supervisors",
        },
        {
          title: "Permissions",
          url: "/dashboard/admin/users/permissions",
        },
      ],
    },
    {
      title: "Categories",
      url: "/dashboard/admin/categories",
      icon: GalleryVerticalEnd,
      items: [],
    },
    {
      title: "Businesses",
      url: "/dashboard/admin/businesses",
      icon: Frame,
      items: [],
    },
    {
      title: "Reviews",
      url: "/dashboard/admin/reviews",
      icon: MessageSquare,
      items: [],
    },
    {
      title: "Settings",
      url: "/dashboard/admin/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/admin/settings",
        },
        {
          title: "Team",
          url: "/dashboard/admin/settings/team",
        },
        {
          title: "Billing",
          url: "/dashboard/admin/settings/billing",
        },
      ],
    },
  ],
  // Supervisor navigation items
  supervisorNavMain: [
    {
      title: "Dashboard",
      url: "/dashboard/supervisor",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard/supervisor",
        },
        {
          title: "Activity",
          url: "/dashboard/supervisor/activity",
        },
      ],
    },
    {
      title: "Reviews",
      url: "/dashboard/supervisor/reviews",
      icon: MessageSquare,
      items: [
        {
          title: "Pending",
          url: "/dashboard/supervisor/reviews/pending",
        },
        {
          title: "Completed",
          url: "/dashboard/supervisor/reviews/completed",
        },
        {
          title: "Flagged",
          url: "/dashboard/supervisor/reviews/flagged",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/supervisor/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/dashboard/supervisor/settings",
        },
        {
          title: "Notifications",
          url: "/dashboard/supervisor/settings/notifications",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Determine role based on URL path
  const isAdmin = pathname.includes("/dashboard/admin");
  const isSupervisor = pathname.includes("/dashboard/supervisor");

  // Select navigation items based on path
  const navItems = isAdmin
    ? data.adminNavMain
    : isSupervisor
    ? data.supervisorNavMain
    : data.adminNavMain;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
