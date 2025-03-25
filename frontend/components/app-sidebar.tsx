"use client";
import { Mic, Brain, Book } from "lucide-react";

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
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "AI Speech Analysis",
    url: "/dashboard/speech",
    icon: Mic,
  },
  {
    title: "AI Interview Preparation",
    url: "/dashboard/interview",
    icon: Brain,
  },
  {
    title: "Training Center",
    url: "/dashboard/train",
    icon: Book,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold mb-5">
            <Link href="/">PersonaCraft</Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={`text-white rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 ${
                    pathname === item.url
                      ? "bg-gray-700 text-white"
                      : "bg-transparent text-gray-400"
                  }`}
                >
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
