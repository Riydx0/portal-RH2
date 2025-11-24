import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Save } from "lucide-react";

type DashboardSettings = {
  showSoftwareStats: boolean;
  showLicenseStats: boolean;
  showTicketStats: boolean;
  showRecentTickets: boolean;
  showExternalLinks: boolean;
  showCharts: boolean;
};

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [settings, setSettings] = useState<DashboardSettings>({
    showSoftwareStats: true,
    showLicenseStats: true,
    showTicketStats: true,
    showRecentTickets: true,
    showExternalLinks: true,
    showCharts: true,
  });

  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (dbSettings) {
      setSettings({
        showSoftwareStats: dbSettings.show_software_stats !== "false",
        showLicenseStats: dbSettings.show_license_stats !== "false",
        showTicketStats: dbSettings.show_ticket_stats !== "false",
        showRecentTickets: dbSettings.show_recent_tickets !== "false",
        showExternalLinks: dbSettings.show_external_links !== "false",
        showCharts: dbSettings.show_charts !== "false",
      });
    }
  }, [dbSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        apiRequest("PATCH", "/api/settings/show_software_stats", { value: settings.showSoftwareStats ? "true" : "false" }),
        apiRequest("PATCH", "/api/settings/show_license_stats", { value: settings.showLicenseStats ? "true" : "false" }),
        apiRequest("PATCH", "/api/settings/show_ticket_stats", { value: settings.showTicketStats ? "true" : "false" }),
        apiRequest("PATCH", "/api/settings/show_recent_tickets", { value: settings.showRecentTickets ? "true" : "false" }),
        apiRequest("PATCH", "/api/settings/show_external_links", { value: settings.showExternalLinks ? "true" : "false" }),
        apiRequest("PATCH", "/api/settings/show_charts", { value: settings.showCharts ? "true" : "false" }),
      ];
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Dashboard settings saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard Settings</h1>
        <p className="text-muted-foreground">Customize what appears on the dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Components</CardTitle>
          <CardDescription>Toggle which sections display on your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="software-stats" className="cursor-pointer">
              Show Software Statistics
            </Label>
            <Switch
              id="software-stats"
              checked={settings.showSoftwareStats}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showSoftwareStats: checked })
              }
              data-testid="toggle-software-stats"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="license-stats" className="cursor-pointer">
              Show License Statistics
            </Label>
            <Switch
              id="license-stats"
              checked={settings.showLicenseStats}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showLicenseStats: checked })
              }
              data-testid="toggle-license-stats"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="ticket-stats" className="cursor-pointer">
              Show Ticket Statistics
            </Label>
            <Switch
              id="ticket-stats"
              checked={settings.showTicketStats}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showTicketStats: checked })
              }
              data-testid="toggle-ticket-stats"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="recent-tickets" className="cursor-pointer">
              Show Recent Tickets
            </Label>
            <Switch
              id="recent-tickets"
              checked={settings.showRecentTickets}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showRecentTickets: checked })
              }
              data-testid="toggle-recent-tickets"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="external-links" className="cursor-pointer">
              Show External Links
            </Label>
            <Switch
              id="external-links"
              checked={settings.showExternalLinks}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showExternalLinks: checked })
              }
              data-testid="toggle-external-links"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="charts" className="cursor-pointer">
              Show Charts & Analytics
            </Label>
            <Switch
              id="charts"
              checked={settings.showCharts}
              onCheckedChange={(checked) => setSettings({ ...settings, showCharts: checked })}
              data-testid="toggle-charts"
            />
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isLoading}
            className="w-full"
            data-testid="button-save-dashboard-settings"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
