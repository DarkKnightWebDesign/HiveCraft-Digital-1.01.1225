import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FolderKanban, Users, MessageSquare, FileText, Settings, LogOut, User, ChevronUp, Activity, Receipt } from "lucide-react";
import logoTransparent from "@assets/HiveCraft_Digital_Logo_Transparent.png";
import type { MemberRole } from "@shared/schema";

const staffNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "All Projects", icon: FolderKanban },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/files", label: "Files", icon: FileText },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
  { href: "/admin/billing", label: "Billing", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: memberRole } = useQuery<MemberRole>({
    queryKey: ["/api/member-role"],
    enabled: !!user,
  });

  const isStaff = memberRole && memberRole.role !== "client";

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/login";
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && user && memberRole && !isStaff) {
      setLocation("/portal");
    }
  }, [user, isLoading, memberRole, isStaff, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 animate-pulse" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.email?.[0]?.toUpperCase() || "U";

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    project_manager: "Project Manager",
    designer: "Designer",
    developer: "Developer",
    editor: "Editor",
    billing: "Billing",
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <Link href="/" data-testid="link-admin-logo">
                <img src={logoTransparent} alt="HiveCraft Digital" className="h-10 w-auto" />
              </Link>
              <Badge variant="secondary" className="text-xs">Staff</Badge>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Back Office</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {staffNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href || (item.href !== "/admin" && location.startsWith(item.href))}
                        data-testid={`link-admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-md hover-elevate" data-testid="button-staff-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {memberRole ? roleLabels[memberRole.role] || memberRole.role : "Staff"}
                    </div>
                  </div>
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive" data-testid="button-staff-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-4 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <Link href="/portal">
                <Button variant="outline" size="sm" data-testid="button-switch-to-portal">
                  Client View
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
