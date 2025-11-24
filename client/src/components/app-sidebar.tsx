import { useState } from "react";
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
  ExternalLink,
  LayoutGrid,
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

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
    {
      title: t('networks', lang),
      url: "/networks",
      icon: ExternalLink,
      show: isAdmin,
    },
    {
      title: t('vpn', lang),
      url: "/vpn",
      icon: LayoutGrid,
      show: isAdmin,
    },
    {
      title: t('firewall', lang),
      url: "/firewall",
      icon: Shield,
      show: isAdmin,
    },
  ];

  const settingsItems = [
    {
      title: t('language', lang),
      url: "/settings/language",
      show: true,
      category: 'account',
    },
    {
      title: t('changePassword', lang),
      url: "/settings/change-password",
      show: true,
      category: 'account',
    },
  ].filter(item => item.show);

  const adminSettingsItems = [
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
      title: t('dashboardSettings', lang),
      url: "/dashboard-settings",
      show: isAdmin,
    },
    {
      title: t('externalLinks', lang),
      url: "/external-links",
      show: isAdmin,
    },
    {
      title: t('activityLogs', lang),
      url: "/settings/logs",
      show: isAdmin,
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

      <SidebarContent className="space-y-0">
        {/* Main Menu Section */}
        <SidebarGroup className="pb-3">
          <SidebarGroupLabel className="text-xs uppercase tracking-widest font-semibold">{t('mainMenu', lang)}</SidebarGroupLabel>
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

        <Separator className="my-2" />

        {/* Administration Section */}
        {isAdmin && adminItems.length > 0 && (
          <SidebarGroup className="py-3">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setAdminOpen(!adminOpen)}
                    data-testid="button-administration"
                    className="font-semibold text-sm"
                  >
                    <span>{t('administration', lang)}</span>
                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${adminOpen ? 'rotate-90' : ''}`} />
                  </SidebarMenuButton>
                  {adminOpen && (
                    <SidebarMenuSub>
                      {adminItems.map((item) =>
                        item.show ? (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url}>
                              <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ) : null
                      )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <Separator className="my-2" />

        {/* Account Section */}
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel className="text-xs uppercase tracking-widest font-semibold">{t('account', lang)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  isActive={location === "/settings" || location.startsWith("/settings/")}
                  data-testid="button-settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>{t('settings', lang)}</span>
                  {(settingsItems.length > 0 || adminSettingsItems.length > 0) && (
                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${settingsOpen ? 'rotate-90' : ''}`} />
                  )}
                </SidebarMenuButton>
                {settingsOpen && (settingsItems.length > 0 || adminSettingsItems.length > 0) && (
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
                    {adminSettingsItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.url}>
                        <SidebarMenuSubButton asChild isActive={location === subItem.url}>
                          <Link href={subItem.url} data-testid={`link-${subItem.title.toLowerCase()}`}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
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
