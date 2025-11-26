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
  Wifi,
  Lock,
  Palette,
  LogIn,
  Link as LinkIcon,
  BarChart3,
  FileText,
  Globe,
  DollarSign,
  Mail,
  Code,
  Smartphone,
  CreditCard,
  RefreshCw,
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
  const [resourceOpen, setResourceOpen] = useState(false);
  const [infrastructureOpen, setInfrastructureOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isArabic = lang === "ar";

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
      title: "Submit Ticket",
      url: "/submit-ticket",
      icon: Ticket,
      show: true,
    },
    {
      title: "Request License",
      url: "/request-license",
      icon: Key,
      show: isAdmin,
    },
    {
      title: isArabic ? "اشتراكي" : "My Subscription",
      url: "/my-subscriptions",
      icon: CreditCard,
      show: isAdmin,
    },
  ];

  const resourceItems = [
    {
      title: t('software', lang),
      url: "/software",
      icon: HardDrive,
      show: isAdmin,
    },
    {
      title: t('categories', lang),
      url: "/categories",
      icon: FolderTree,
      show: isAdmin,
    },
    {
      title: t('licenses', lang),
      url: "/licenses",
      icon: Key,
      show: isAdmin,
    },
  ];

  const infrastructureItems = [
    {
      title: t('networks', lang),
      url: "/networks",
      icon: Wifi,
      show: isAdmin,
    },
    {
      title: t('vpn', lang),
      url: "/vpn",
      icon: Lock,
      show: isAdmin,
    },
    {
      title: "WireGuard",
      url: "/wireguard",
      icon: Lock,
      show: isAdmin,
    },

    // Developer Section
    {
      title: "API Keys",
      url: "/api-keys",
      icon: Code,
      show: true, // Available for all authenticated users
    },
    {
      title: t('firewall', lang),
      url: "/firewall",
      icon: Shield,
      show: isAdmin,
    },
  ];

  const teamItems = [
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
      title: "Clients",
      url: "/clients",
      icon: Users,
      show: isAdmin,
    },
    {
      title: "Devices",
      url: "/devices",
      icon: Smartphone,
      show: isAdmin,
    },
  ];

  const financeItems = [
    {
      title: t('invoices', lang),
      url: "/invoices",
      icon: FileText,
      show: isAdmin,
    },
    {
      title: t('softwarePricing', lang),
      url: "/software-pricing-admin",
      icon: DollarSign,
      show: isAdmin,
    },
    {
      title: "Subscription Plans",
      url: "/pricing-admin",
      icon: BarChart3,
      show: isAdmin,
    },
  ];

  const userSettingsItems = [
    {
      title: t('language', lang),
      url: "/settings/language",
      icon: Globe,
      show: true,
    },
    {
      title: t('changePassword', lang),
      url: "/settings/change-password",
      icon: Lock,
      show: true,
    },
  ].filter(item => item.show);

  const systemSettingsItems = [
    {
      title: t('appearance', lang),
      url: "/settings/appearance",
      icon: Palette,
      show: isAdmin,
    },
    {
      title: t('branding', lang),
      url: "/settings/branding",
      icon: Globe,
      show: isAdmin,
    },
    {
      title: t('sso', lang),
      url: "/settings/sso",
      icon: LogIn,
      show: isAdmin,
    },
    {
      title: "Email Settings",
      url: "/email-settings",
      icon: Mail,
      show: isAdmin,
    },
    {
      title: t('externalLinks', lang),
      url: "/external-links",
      icon: LinkIcon,
      show: isAdmin,
    },
    {
      title: t('activityLogs', lang),
      url: "/settings/logs",
      icon: FileText,
      show: isAdmin,
    },
    {
      title: "Updates",
      url: "/updates",
      icon: RefreshCw,
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
        {isAdmin && (resourceItems.some(i => i.show) || infrastructureItems.some(i => i.show) || teamItems.some(i => i.show) || financeItems.some(i => i.show)) && (
          <>
            {/* Resource Management */}
            {resourceItems.some(i => i.show) && (
              <SidebarGroup className="py-2">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setResourceOpen(!resourceOpen)}
                        data-testid="button-resource-management"
                        className="font-semibold text-sm"
                      >
                        <HardDrive className="h-4 w-4" />
                        <span>{t('resourceManagement', lang)}</span>
                        <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${resourceOpen ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {resourceOpen && (
                        <SidebarMenuSub>
                          {resourceItems.map((item) =>
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

            {/* Infrastructure */}
            {infrastructureItems.some(i => i.show) && (
              <SidebarGroup className="py-2">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setInfrastructureOpen(!infrastructureOpen)}
                        data-testid="button-infrastructure"
                        className="font-semibold text-sm"
                      >
                        <Wifi className="h-4 w-4" />
                        <span>{t('infrastructure', lang)}</span>
                        <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${infrastructureOpen ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {infrastructureOpen && (
                        <SidebarMenuSub>
                          {infrastructureItems.map((item) =>
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

            {/* Team Management */}
            {teamItems.some(i => i.show) && (
              <SidebarGroup className="py-2">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setTeamOpen(!teamOpen)}
                        data-testid="button-team-management"
                        className="font-semibold text-sm"
                      >
                        <Users className="h-4 w-4" />
                        <span>{t('teamManagement', lang)}</span>
                        <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${teamOpen ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {teamOpen && (
                        <SidebarMenuSub>
                          {teamItems.map((item) =>
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

            {/* Finance */}
            {financeItems.some(i => i.show) && (
              <SidebarGroup className="py-2">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setFinanceOpen(!financeOpen)}
                        data-testid="button-finance"
                        className="font-semibold text-sm"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>{t('finance', lang)}</span>
                        <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${financeOpen ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {financeOpen && (
                        <SidebarMenuSub>
                          {financeItems.map((item) =>
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
          </>
        )}

        <Separator className="my-2" />

        {/* User Settings */}
        {userSettingsItems.length > 0 && (
          <SidebarGroup className="py-3">
            <SidebarGroupLabel className="text-xs uppercase tracking-widest font-semibold">{t('account', lang)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    isActive={location === "/settings" || (location.startsWith("/settings/") && !location.startsWith("/settings/appearance") && !location.startsWith("/settings/branding") && !location.startsWith("/settings/sso") && !location.startsWith("/settings/logs"))}
                    data-testid="button-account-settings"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('settings', lang)}</span>
                    {userSettingsItems.length > 0 && (
                      <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${settingsOpen ? 'rotate-90' : ''}`} />
                    )}
                  </SidebarMenuButton>
                  {settingsOpen && userSettingsItems.length > 0 && (
                    <SidebarMenuSub>
                      {userSettingsItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton asChild isActive={location === subItem.url}>
                            <Link href={subItem.url} data-testid={`link-${subItem.title.toLowerCase()}`}>
                              <subItem.icon className="h-4 w-4" />
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
        )}

        {/* System Settings (Admin Only) */}
        {systemSettingsItems.length > 0 && (
          <SidebarGroup className="py-3">
            <SidebarGroupLabel className="text-xs uppercase tracking-widest font-semibold">{t('systemSettings', lang)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setAdminOpen(!adminOpen)}
                    isActive={location.startsWith("/settings/appearance") || location.startsWith("/settings/branding") || location.startsWith("/settings/sso") || location.startsWith("/settings/logs") || location === "/dashboard-settings" || location === "/external-links"}
                    data-testid="button-system-settings"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('settings', lang)}</span>
                    {systemSettingsItems.length > 0 && (
                      <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${adminOpen ? 'rotate-90' : ''}`} />
                    )}
                  </SidebarMenuButton>
                  {adminOpen && systemSettingsItems.length > 0 && (
                    <SidebarMenuSub>
                      {systemSettingsItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton asChild isActive={location === subItem.url}>
                            <Link href={subItem.url} data-testid={`link-${subItem.title.toLowerCase()}`}>
                              <subItem.icon className="h-4 w-4" />
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
        )}
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
