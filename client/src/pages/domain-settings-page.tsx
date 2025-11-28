import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Globe } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SettingsData = Record<string, string>;

export default function DomainSettingsPage() {
  const { toast } = useToast();
  const [domainName, setDomainName] = useState("");
  const [appUrl, setAppUrl] = useState("");

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setDomainName(settings.domain_name || "");
      setAppUrl(settings.app_url || window.location.origin);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/settings/domain_name", { value: domainName });
      await apiRequest("PATCH", "/api/settings/app_url", { value: appUrl });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Domain settings saved successfully",
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

  if (isLoading) {
    return <div className="flex-1 p-6">Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Domain & URL Settings
        </h1>
        <p className="text-muted-foreground">Configure your domain and application URL</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Domain Configuration</CardTitle>
            <CardDescription>Set your domain name and application URL for the portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-name">Domain Name</Label>
              <Input
                id="domain-name"
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="portal.company.com"
                data-testid="input-domain-name"
              />
              <p className="text-xs text-muted-foreground">
                Your domain name (e.g., portal.company.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-url">Application URL</Label>
              <Input
                id="app-url"
                type="text"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://portal.company.com"
                data-testid="input-app-url"
              />
              <p className="text-xs text-muted-foreground">
                Full URL including https:// or http://
              </p>
            </div>

            <div className="p-4 border rounded-md bg-muted/50 space-y-3">
              <p className="text-xs text-muted-foreground font-semibold">Current Connection Info:</p>
              <div className="text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Current Origin:</span>
                  <span className="text-foreground font-medium">{window.location.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hostname:</span>
                  <span className="text-foreground font-medium">{window.location.hostname}</span>
                </div>
                {domainName && (
                  <div className="flex justify-between">
                    <span>Configured Domain:</span>
                    <span className="text-foreground font-medium">{domainName}</span>
                  </div>
                )}
                {appUrl && (
                  <div className="flex justify-between">
                    <span>App URL:</span>
                    <span className="text-foreground font-medium">{appUrl}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DNS Setup Instructions</CardTitle>
            <CardDescription>How to configure your domain DNS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Add DNS Record at Your Domain Provider:</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1">
                  <p>Record Type: A</p>
                  <p>Name: @ or portal</p>
                  <p>Value: Your VPS IP Address</p>
                  <p>TTL: 3600</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Wait for DNS Propagation:</h4>
                <p className="text-muted-foreground">DNS updates can take 15-30 minutes to propagate globally</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Verify DNS:</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-xs">
                  nslookup {domainName || "your-domain.com"}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Save Configuration:</h4>
                <p className="text-muted-foreground">Fill in the domain name and URL above, then click Save</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save-domain-settings"
            size="default"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
