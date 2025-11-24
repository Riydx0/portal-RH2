import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SettingsData = Record<string, string>;

export default function BrandingSettingsPage() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("");
  const [cloudronName, setCloudronName] = useState("");
  const [footerText, setFooterText] = useState("");

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name || "");
      setCloudronName(settings.cloudron_name || "");
      setFooterText(settings.footer_text || "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/settings/site_name", { value: siteName });
      await apiRequest("PATCH", "/api/settings/cloudron_name", { value: cloudronName });
      await apiRequest("PATCH", "/api/settings/footer_text", { value: footerText });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Branding settings saved successfully",
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
        <h1 className="text-3xl font-semibold mb-2">Branding Settings</h1>
        <p className="text-muted-foreground">Customize your organization branding and names</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>Set your organization's name and branding information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="IT Portal"
                data-testid="input-site-name"
              />
              <p className="text-xs text-muted-foreground">The main name of your portal</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloudron-name">Organization Name</Label>
              <Input
                id="cloudron-name"
                value={cloudronName}
                onChange={(e) => setCloudronName(e.target.value)}
                placeholder="Riyadh Alafraa Systems"
                data-testid="input-cloudron-name"
              />
              <p className="text-xs text-muted-foreground">Your organization or company name (e.g., Riyadh Alafraa Systems)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-text">Footer Text</Label>
              <Input
                id="footer-text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="Riyadh Alafraa"
                data-testid="input-footer-text"
              />
              <p className="text-xs text-muted-foreground">Text displayed in the footer of every page</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your branding information will appear</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Site Name:</p>
                  <p className="font-semibold">{siteName || "IT Portal"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Organization:</p>
                  <p className="font-semibold">{cloudronName || "Organization Name"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Footer:</p>
                  <p className="text-sm text-muted-foreground">{footerText || "Footer Text"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
          size="lg"
          data-testid="button-save-branding"
        >
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
