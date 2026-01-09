"use client"

import * as React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import SignOutButton from "@/components/sign-out-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavSection = {
  label: string
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role: "creator" | "brand" | "admin"
  user: { name: string; email: string }
  sections: NavSection[]
}

export function AppSidebar({
  role,
  user,
  sections,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/app" className="flex flex-col items-start">
                <span className="text-base font-semibold">Creator First</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {role}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <NavMain key={section.label} label={section.label} items={section.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {user.name}
            </span>
            <span>{user.email}</span>
          </div>
          <SignOutButton className="w-fit rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
