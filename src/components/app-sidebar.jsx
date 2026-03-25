"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { useOrganization } from "@clerk/nextjs";
import { GalleryVerticalEnd } from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    // {
    //   title: "Dashboard",
    //   url: "#",
    //   icon: IconDashboard,
    // },
    {
      title: "Inbox",
      url: "/inbox",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: IconFolder,
    },
    {
      title: "Templates",
      url: "/template",
      icon: IconFileDescription,
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Menu Guide",
      url: "/admin/catalog",
      icon: IconListDetails,
    },
    {
      title: "AI Bot Center",
      url: "/admin/bot",
      icon: IconFileAi,
    },
    {
      title: "Pipeline",
      url: "/pipeline",
      icon: IconInnerShadowTop,
    },
    {
      title: "Master Center",
      url: "/admin/master",
      icon: IconInnerShadowTop,
    },
],
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: IconCamera,
  //     isActive: true,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Proposal",
  //     icon: IconFileDescription,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Prompts",
  //     icon: IconFileAi,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "#",
  //     icon: IconHelp,
  //   },
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: IconSearch,
  //   },
  // ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: IconFileWord,
  //   },
  // ],

  navClouds: [],
  navSecondary: [],
  documents: [],
};

export function AppSidebar({ ...props }) {
  const { organization } = useOrganization();

  const [permissions, setPermissions] = React.useState(["inbox"]);
  const [role, setRole] = React.useState("MEMBER");

  React.useEffect(() => {
    fetch("/api/organization/me")
      .then(res => res.json())
      .then(d => {
        if (d.permissions) setPermissions(d.permissions);
        if (d.role) setRole(d.role);
      })
      .catch(e => console.error("Sidebar auth:", e));
  }, []);

  const team = {
    name: organization?.name,
    plan: "Pro",
    logo: organization?.imageUrl,
  };

  const filteredNavMain = data.navMain.filter(item => {
    if (role === "ADMIN") return true;
    const map = { "Inbox": "inbox", "Analytics": "analytics", "AI Bot Center": "bot", "Team": "team", "Billing": "billing", "Templates": "templates", "Menu Guide": "catalog", "Pipeline": "pipeline" };
    const slug = map[item.title];
    return !slug || permissions.includes(slug);
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full">
              <TeamSwitcher team={team} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
