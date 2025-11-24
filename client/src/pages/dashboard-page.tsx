import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HardDrive, Key, Ticket, CheckCircle, AlertCircle, FolderTree, Bell, ExternalLink as ExternalLinkIcon, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket as TicketType, ExternalLink, Notification } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DashboardStats = {
  totalSoftware: number;
  totalCategories: number;
  totalLicenses: number;
  availableLicenses: number;
  inUseLicenses: number;
  expiredLicenses: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
};

type RecentTicket = TicketType & {
  creator: { name: string };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentTickets, isLoading: ticketsLoading } = useQuery<RecentTicket[]>({
    queryKey: ["/api/tickets/recent"],
  });

  const { data: externalLinks = [], isLoading: linksLoading } = useQuery<ExternalLink[]>({
    queryKey: ["/api/external-links"],
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAdmin,
  });

  const unreadNotifications = notifications.filter(n => !n.read);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      open: { variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
      "in-progress": { variant: "secondary", className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
      closed: { variant: "outline", className: "bg-green-500 hover:bg-green-600 text-white" },
    };
    return variants[status] || variants.open;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: "bg-gray-500",
      normal: "bg-blue-500",
      high: "bg-red-500",
    };
    return variants[priority] || variants.normal;
  };

  const licenseData = stats ? [
    { name: "Available", value: stats.availableLicenses, fill: "#10b981" },
    { name: "In Use", value: stats.inUseLicenses, fill: "#3b82f6" },
    { name: "Expired", value: stats.expiredLicenses, fill: "#ef4444" },
  ].filter(d => d.value > 0) : [];

  const ticketData = stats ? [
    { name: "Open", count: stats.openTickets, fill: "#3b82f6" },
    { name: "In Progress", count: stats.inProgressTickets, fill: "#f59e0b" },
    { name: "Closed", count: stats.closedTickets, fill: "#10b981" },
  ] : [];

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your IT service portal</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard-settings">
            <Button variant="outline" size="sm" data-testid="button-dashboard-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(isAdmin ? 4 : 2)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {isAdmin && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                    <CardTitle className="text-sm font-medium">Total Software</CardTitle>
                    <HardDrive className="h-8 w-8 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold" data-testid="stat-total-software">
                      {stats?.totalSoftware || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Across {stats?.totalCategories || 0} categories
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                    <CardTitle className="text-sm font-medium">Licenses</CardTitle>
                    <Key className="h-8 w-8 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold" data-testid="stat-total-licenses">
                      {stats?.totalLicenses || 0}
                    </div>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="text-green-500">
                        {stats?.availableLicenses || 0} available
                      </span>
                      <span className="text-blue-500">
                        {stats?.inUseLicenses || 0} in use
                      </span>
                      <span className="text-red-500">
                        {stats?.expiredLicenses || 0} expired
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold" data-testid="stat-open-tickets">
                  {stats?.openTickets || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.inProgressTickets || 0} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Closed Tickets</CardTitle>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold" data-testid="stat-closed-tickets">
                  {stats?.closedTickets || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.totalTickets || 0} total tickets
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {externalLinks && externalLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLinkIcon className="h-5 w-5" />
              External Links
            </CardTitle>
            <CardDescription>Quick access to external services and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {externalLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-md border hover-elevate transition-colors bg-muted/50 hover:bg-muted"
                  data-testid={`external-link-${link.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{link.title}</p>
                    {link.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
                    )}
                  </div>
                  <ExternalLinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && unreadNotifications.length > 0 && (
        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <Bell className="h-5 w-5" />
              Notifications ({unreadNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unreadNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
                  data-testid={`notification-${notif.id}`}
                >
                  <p className="font-medium text-sm text-yellow-900 dark:text-yellow-100">
                    {notif.title}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">License Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : licenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={licenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {licenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
                  No license data
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ticket Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ticketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6">
                      {ticketData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Recent Tickets</span>
              <Link href="/tickets">
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  View All
                </Badge>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : recentTickets && recentTickets.length > 0 ? (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div
                      className="p-4 rounded-md border hover-elevate cursor-pointer"
                      data-testid={`ticket-${ticket.id}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-medium line-clamp-1">{ticket.title}</h4>
                        <Badge {...getStatusBadge(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>by {ticket.creator.name}</span>
                        <span>•</span>
                        <div
                          className={`h-2 w-2 rounded-full ${getPriorityBadge(ticket.priority)}`}
                        />
                        <span className="capitalize">{ticket.priority}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent tickets</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/tickets/new">
                <Card className="cursor-pointer hover-elevate border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
                        <Ticket className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Create New Ticket</h4>
                        <p className="text-xs text-muted-foreground">
                          Submit a support request
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/downloads">
                <Card className="cursor-pointer hover-elevate border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
                        <HardDrive className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Browse Software</h4>
                        <p className="text-xs text-muted-foreground">
                          Download available programs
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
