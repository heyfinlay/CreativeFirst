"use client"

import type { ReactNode } from "react"
import {
  BarChart3Icon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  SettingsIcon,
  UserCircleIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type Role = "creator" | "brand" | "admin"

type AppShellProps = {
  email: string | null
  displayName?: string | null
  role: Role
  showOnboardingLink?: boolean
  children: ReactNode
}

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

const commonNav: NavItem[] = [
  { title: "Home", url: "/app", icon: LayoutDashboardIcon },
  { title: "Account", url: "/app/settings", icon: SettingsIcon },
]

const onboardingNav: NavItem = {
  title: "Onboarding",
  url: "/app/onboarding",
  icon: ClipboardListIcon,
}

const creatorNav: NavItem[] = [
  { title: "Overview", url: "/app/creator", icon: BarChart3Icon },
  { title: "Contracts", url: "/app/creator/contracts", icon: FileTextIcon },
  { title: "Applications", url: "/app/creator/applications", icon: ClipboardListIcon },
  { title: "Public Profile", url: "/app/creator/profile", icon: UserCircleIcon },
]

const brandNav: NavItem[] = [
  { title: "Overview", url: "/app/brand", icon: BarChart3Icon },
  { title: "Contracts", url: "/app/brand/contracts", icon: FileTextIcon },
  { title: "New Contract", url: "/app/brand/contracts/new", icon: PlusCircleIcon },
]

function buildNavSections(role: Role, showOnboardingLink?: boolean) {
  const sections: Array<{ label: string; items: NavItem[] }> = []

  const commonItems = [...commonNav]
  if (showOnboardingLink) {
    commonItems.push(onboardingNav)
  }

  sections.push({ label: "Common", items: commonItems })

  if (role === "creator") {
    sections.push({ label: "Creator", items: creatorNav })
  } else if (role === "brand") {
    sections.push({ label: "Brand", items: brandNav })
  } else {
    sections.push({ label: "Creator", items: creatorNav })
    sections.push({ label: "Brand", items: brandNav })
  }

  return sections
}

export default function AppShell({
  email,
  displayName,
  role,
  showOnboardingLink,
  children,
}: AppShellProps) {
  const navSections = buildNavSections(role, showOnboardingLink)
  const userLabel = displayName || email || "Account"

  return (
    <SidebarProvider>
      <AppSidebar
        role={role}
        user={{ name: userLabel, email: email ?? "" }}
        sections={navSections}
      />
      <SidebarInset>
        <SiteHeader title={`${role} dashboard`} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
