"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plug,
  Mail,
  CreditCard,
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logoutUser } from "@/lib/actions/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Verbindungen", href: "/connections", icon: Plug },
  { label: "Newsletter", href: "/newsletters", icon: Mail },
  { label: "Abos", href: "/subscriptions", icon: CreditCard },
  { label: "Spam & Risiken", href: "/spam", icon: ShieldAlert },
  { label: "Sender", href: "/senders", icon: Users },
  { label: "Insights", href: "/insights", icon: BarChart3 },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col h-screen border-r border-sidebar-border transition-all duration-300 ease-in-out",
          "bg-sidebar-background",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 px-4 gap-3 shrink-0", collapsed && "justify-center px-0")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shrink-0 shadow-lg shadow-violet-900/40">
            <Zap className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm text-foreground">Mail Control</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Center</span>
            </div>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-9 w-full items-center justify-center rounded-xl transition-all duration-150",
                        isActive
                          ? "bg-violet-600/20 text-violet-400 shadow-sm shadow-violet-900/30"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-violet-600/20 text-violet-400 shadow-sm shadow-violet-900/30"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-violet-400")} />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom section */}
        <div className="p-2 space-y-0.5">
          {/* Settings */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-xl transition-all duration-150",
                    pathname === "/settings"
                      ? "bg-violet-600/20 text-violet-400"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Einstellungen</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              className={cn(
                "flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150",
                pathname === "/settings"
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Einstellungen</span>
            </Link>
          )}

          {/* User profile + logout */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logoutUser()}
                  className="flex h-9 w-full items-center justify-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-violet-900/50 text-violet-300">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{user.name ?? user.email}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors group cursor-default">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="text-xs bg-violet-900/50 text-violet-300">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user.name ?? "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  title="Abmelden"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-[72px] h-6 w-6 rounded-full border border-border bg-sidebar-background shadow-sm hover:bg-sidebar-accent z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  );
}
