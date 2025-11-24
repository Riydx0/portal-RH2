import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/lib/i18n";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderTree,
  HardDrive,
  Key,
  Ticket,
  Download,
  Server,
  LogOut,
  Shield,
  User,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const { user, logoutMutation } = useAuth();
  const { lang } = useLanguage();
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";

  const menuItems = [
    {
      title: t('dashboard', lang),
      url: "/",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: t('downloads', lang),
      url: "/downloads",
      icon: Download,
      show: true,
    },
    {
      title: t('tickets', lang),
      url: "/tickets",
      icon: Ticket,
      show: true,
    },
  ];

  const adminItems = [
    {
      title: t('users', lang),
      url: "/users",
      icon: Users,
      show: isAdmin,
    },
    {
      title: t('groups', lang),
      url: "/groups",
      icon: Shield,
      show: isAdmin,
    },
    {
      title: t('categories', lang),
      url: "/categories",
      icon: FolderTree,
      show: isAdmin,
    },
    {
      title: t('software', lang),
      url: "/software",
      icon: HardDrive,
      show: isAdmin,
    },
    {
      title: t('licenses', lang),
      url: "/licenses",
      icon: Key,
      show: isAdmin,
    },
  ];

  const settingsItems = [
    {
      title: t('appearance', lang),
      url: "/settings/appearance",
      show: isAdmin,
    },
    {
      title: t('branding', lang),
      url: "/settings/branding",
      show: isAdmin,
    },
    {
      title: t('sso', lang),
      url: "/settings/sso",
      show: isAdmin,
    },
    {
      title: t('activityLogs', lang),
      url: "/settings/logs",
      show: isAdmin,
    },
    {
      title: t('language', lang),
      url: "/settings/language",
      show: true,
    },
    {
      title: t('changePassword', lang),
      url: "/settings/change-password",
      show: true,
    },
  ].filter(item => item.show);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary">
            <Server className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">IT Portal</h2>
            <p className="text-xs text-muted-foreground">Service Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('mainMenu', lang)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) =>
                item.show ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('administration', lang)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) =>
                  item.show ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>{t('account', lang)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/settings" || location.startsWith("/settings/")}>
                  <Link href="/settings" data-testid="link-settings">
                    <Settings className="h-4 w-4" />
                    <span>{t('settings', lang)}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {settingsItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton asChild isActive={location === subItem.url}>
                        <Link href={subItem.url} data-testid={`link-${subItem.title.toLowerCase()}`}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(user?.role || "client")} className="text-xs">
                  {user?.role === "admin" ? (
                    <Shield className="h-3 w-3 mr-1" />
                  ) : (
                    <User className="h-3 w-3 mr-1" />
                  )}
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout', lang)}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
