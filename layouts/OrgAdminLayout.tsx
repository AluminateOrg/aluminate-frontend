"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  Heart,
  CreditCard,
  Menu,
  Moon,
  Sun,
  LogOut,
  Bell,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrgAdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/org/admin", icon: LayoutDashboard },
  { name: "Members", href: "/org/admin/members", icon: UserPlus },
  { name: "Subscriptions", href: "/org/admin/subscriptions", icon: CreditCard },
  { name: "Groups", href: "/org/admin/groups", icon: Users },
  { name: "Events", href: "/org/admin/events", icon: Calendar },
  { name: "Mentorship", href: "/org/admin/mentorship", icon: Heart },
  { name: "Fundraising", href: "/org/admin/fundraising", icon: Heart },
  { name: "Settings", href: "/org/admin/settings", icon: Settings },
];

export default function OrgAdminLayout({ children }: OrgAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();


  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const checkRouter = async () => {
      (navigation.map(item => {
        console.log("prefetching route", item.href);
        return router.prefetch(item.href);
      }));
    }

  checkRouter();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-50 md:hidden">
          {/* Backdrop overlay with smooth transition */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          {/* Sidebar panel with slide animation */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Enhanced close button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-border transition-all duration-200 shadow-sm"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>

            <SidebarContent onNavigate={closeSidebar} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Enhanced top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          {/* Professional menu button with visible hamburger icon */}
          <div className="flex items-center px-4 border-r border-border md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={openSidebar}
              className={cn(
                "relative h-10 w-10 rounded-lg transition-all duration-200 ease-in-out",
                "hover:bg-accent hover:shadow-sm active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                "group border border-transparent hover:border-border/50"
              )}
            >
              {/* Use Menu icon instead of custom hamburger for better visibility */}
              <Menu className="h-5 w-5 text-foreground transition-all duration-200 group-hover:text-primary" />

              {/* Subtle background effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <span className="sr-only">Open navigation menu</span>
            </Button>
          </div>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">
                Admin Dashboard
              </h1>
            </div>

            <div className="ml-4 flex items-center space-x-2">
              {/* Enhanced notification button */}
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 rounded-lg hover:bg-accent transition-all duration-200"
              >
                <Bell className="h-4 w-4" />
                {/* Notification indicator */}
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Enhanced theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg hover:bg-accent transition-all duration-200 hover:rotate-12"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <Sun className="h-4 w-4 transition-transform duration-200" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Enhanced user profile section */}
              <div className="flex items-center space-x-3 pl-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : ""}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.designation}
                  </p>
                </div>
              </div>

              {/* Enhanced logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background">
          {children}
        </main>
      </div>
    </div>
  );

  function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Enhanced header section with proper spacing */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Alumni Portal
              </h2>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Enhanced navigation with professional spacing */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out",
                    "hover:bg-accent/80 hover:shadow-sm active:scale-[0.98] relative",
                    "border border-transparent hover:border-border/30",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  prefetch
                >
                  {/* Icon with enhanced styling */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-accent/50 text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>

                  {/* Text with proper typography */}
                  <span className="flex-1 font-medium tracking-wide">
                    {item.name}
                  </span>

                  {/* Active indicator with animation */}
                  {isActive && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full opacity-80 animate-pulse" />
                  )}

                  {/* Subtle hover effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity duration-200",
                      "group-hover:opacity-100"
                    )}
                  
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Enhanced user section with professional styling */}
        <div className="flex-shrink-0 p-4 border-t border-border/50 bg-accent/20">
          {/* User profile card */}
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 mb-3 border border-border/30 shadow-sm">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-sm">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold text-sm">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.designation}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced logout button */}
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-destructive",
              "hover:bg-destructive/10 transition-all duration-200 rounded-xl py-3 px-4",
              "border border-transparent hover:border-destructive/20",
              "group relative overflow-hidden"
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 bg-destructive/10 group-hover:bg-destructive/20 transition-all duration-200">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-medium">Sign Out</span>

            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Button>
        </div>
      </div>
    );
  }
}
