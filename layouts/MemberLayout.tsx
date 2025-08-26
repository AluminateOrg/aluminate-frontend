"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MessageSquare,
  Heart,
  DollarSign,
  User,
  Menu,
  Moon,
  Sun,
  LogOut,
  Bell,
  Home,
  X,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface MemberLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/org/member", icon: Home },
  { name: "Groups", href: "/org/member/groups", icon: Users },
  { name: "Chat", href: "/org/member/chat", icon: MessageSquare },
  { name: "Events", href: "/org/member/events", icon: Calendar },
  { name: "Mentors", href: "/org/member/mentors", icon: Heart },
  { name: "Donations", href: "/org/member/donations", icon: DollarSign },
  { name: "Notifications", href: "/org/member/notifications", icon: Bell },
  { name: "Profile", href: "/org/member/profile", icon: User },
];

export default function MemberLayout({ children }: MemberLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { recentNotifications, unreadCount, markAsRead } = useNotifications();


  if (!user || user.role !== "member") {
    return null;
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const openMobileMenu = () => setMobileMenuOpen(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleNotificationClick = async (
    notificationId: string,
    read: boolean
  ) => {
    if (!read) {
      await markAsRead(notificationId);
    }
    setShowNotificationDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "group":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "mentorship":
        return <Heart className="h-4 w-4 text-pink-600" />;
      case "donation":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };
  const checkRouter = async () => {
      navigation.forEach(item => {
        router.prefetch(item.href);
      });
    }

  checkRouter();
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-50 md:hidden">
          {/* Backdrop overlay with smooth transition */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Sidebar panel with slide animation */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Enhanced close button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileMenu}
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-border transition-all duration-200 shadow-sm"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>

            <MobileSidebarContent onNavigate={closeMobileMenu} />
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="flex items-center mr-4 md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openMobileMenu}
                  className={cn(
                    "relative h-10 w-10 rounded-lg transition-all duration-200 ease-in-out",
                    "hover:bg-accent hover:shadow-sm active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                    "group border border-transparent hover:border-border/50"
                  )}
                >
                  {/* Use Menu icon for better visibility */}
                  <Menu className="h-5 w-5 text-foreground transition-all duration-200 group-hover:text-primary" />

                  {/* Subtle background effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </div>

              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Home className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold text-foreground">
                    Alumni Portal
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                        isActive
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                      )}
                      prefetch
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      {item.name === "Notifications" && unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Enhanced notification button with dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                  className="relative h-9 w-9 rounded-lg hover:bg-accent transition-all duration-200"
                >
                  <Bell className="h-4 w-4" />
                  {/* Notification indicator */}
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          Notifications
                        </h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {unreadCount} new
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNotificationDropdown(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {recentNotifications.length > 0 ? (
                        <div className="space-y-1">
                          {recentNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-3 hover:bg-accent transition-colors cursor-pointer border-b border-border/50 last:border-b-0",
                                !notification.read && "bg-primary/5"
                              )}
                              onClick={() =>
                                handleNotificationClick(
                                  notification.id,
                                  notification.read
                                )
                              }
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p
                                      className={cn(
                                        "text-sm font-medium text-foreground truncate",
                                        !notification.read && "font-semibold"
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(
                                      new Date(notification.timestamp),
                                      { addSuffix: true }
                                    )}
                                  </p>
                                </div>
                                {notification.actionUrl && (
                                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No notifications
                          </p>
                        </div>
                      )}
                    </div>

                    {recentNotifications.length > 0 && (
                      <div className="p-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          asChild
                          onClick={() => setShowNotificationDropdown(false)}
                        >
                          <Link href="/org/member/notifications">
                            View All Notifications
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
              <div className="hidden md:flex items-center space-x-3 pl-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium">
                    {(user?.name || "Unknown User")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
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
                className="hidden md:flex h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close notification dropdown */}
      {showNotificationDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowNotificationDropdown(false)}
        />
      )}

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );

  function MobileSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Enhanced header section with proper spacing */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Alumni Portal
              </h2>
              <p className="text-xs text-muted-foreground">Member Dashboard</p>
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

                  {/* Notification badge for mobile */}
                  {item.name === "Notifications" && unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}

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
                  {(user?.name || "Unknown User")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
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
