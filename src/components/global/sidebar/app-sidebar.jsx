"use client";

import { useState } from "react";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Template",
    url: "/template",
    icon: Calendar,
    children: [
      {
        title: "All Template",
        url: "/template",
        icon: Inbox,
      },
      {
        title: "Template Library",
        url: "/template/template-library",
        icon: Search,
      },
      {
        title: "Template Builder",
        url: "/template/template-builder",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const hasChildren = item.children?.length > 0;
                const isOpen = openDropdowns[item.title];

                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        onClick={() =>
                          hasChildren ? toggleDropdown(item.title) : null
                        }
                      >
                        <a
                          href={hasChildren ? "#" : item.url}
                          className="flex justify-between items-center w-full"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </div>
                          {hasChildren && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {hasChildren && isOpen && (
                      <SidebarMenu className="pl-6 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <SidebarMenuItem key={child.title}>
                            <SidebarMenuButton asChild>
                              <a
                                href={child.url}
                                className="flex items-center gap-2"
                              >
                                {/* <child.icon className="w-4 h-4" /> */}
                                <span>{child.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
