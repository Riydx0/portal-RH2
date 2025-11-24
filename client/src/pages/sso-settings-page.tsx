import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Lock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SettingsData = Record<string, string>;

export default function SSOSettingsPage() {
  const { toast } = useToast();
  const [openidIssuerUrl, setOpenidIssuerUrl] = useState("");
  const [openidClientId, setOpenidClientId] = useState("");
  const [openidClientSecret, setOpenidClientSecret] = useState("");
  const [openidCallbackUrl, setOpenidCallbackUrl] = useState("");

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setOpenidIssuerUrl(settings.openid_issuer_url || "");
      setOpenidClientId(settings.openid_client_id || "");
      setOpenidClientSecret(settings.openid_client_secret || "");
      setOpenidCallbackUrl(settings.openid_callback_url || "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/settings/openid_issuer_url", { value: openidIssuerUrl });
      await apiRequest("PATCH", "/api/settings/openid_client_id", { value: openidClientId });
      await apiRequest("PATCH", "/api/settings/openid_client_secret", { value: openidClientSecret });
      await apiRequest("PATCH", "/api/settings/openid_callback_url", { value: openidCallbackUrl });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "SSO settings saved successfully. SSO login will be available on the login page.",
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
        <h1 className="text-3xl font-semibold mb-2">SSO Settings</h1>
        <p className="text-muted-foreground">Configure OpenID Connect Single Sign-On</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              OpenID Connect Configuration
            </CardTitle>
            <CardDescription>
              Configure your OpenID Connect provider to enable SSO login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openid-issuer">OpenID Issuer URL</Label>
              <Input
                id="openid-issuer"
                value={openidIssuerUrl}
                onChange={(e) => setOpenidIssuerUrl(e.target.value)}
                placeholder="https://sso.example.com"
                data-testid="input-openid-issuer"
              />
              <p className="text-xs text-muted-foreground">
                The base URL of your OpenID provider (e.g., your Cloudron instance)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openid-client-id">Client ID</Label>
              <Input
                id="openid-client-id"
                value={openidClientId}
                onChange={(e) => setOpenidClientId(e.target.value)}
                placeholder="your-client-id"
                data-testid="input-openid-client-id"
              />
              <p className="text-xs text-muted-foreground">
                The OAuth 2.0 Client ID from your OpenID provider
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openid-client-secret">Client Secret</Label>
              <Input
                id="openid-client-secret"
                type="password"
                value={openidClientSecret}
                onChange={(e) => setOpenidClientSecret(e.target.value)}
                placeholder="your-client-secret"
                data-testid="input-openid-client-secret"
              />
              <p className="text-xs text-muted-foreground">
                The OAuth 2.0 Client Secret from your OpenID provider
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openid-callback">Callback URL (Optional)</Label>
              <Input
                id="openid-callback"
                value={openidCallbackUrl}
                onChange={(e) => setOpenidCallbackUrl(e.target.value)}
                placeholder="https://yourapp.com/api/auth/openid/callback"
                data-testid="input-openid-callback"
              />
              <p className="text-xs text-muted-foreground">
                The callback URL for your OpenID provider. Leave empty to use the default.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">How to Set Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <ol className="list-decimal list-inside space-y-2">
              <li>Register this application with your OpenID provider</li>
              <li>Set the callback URL to: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">https://yourapp.com/api/auth/openid/callback</code></li>
              <li>Copy the Client ID and Client Secret from your provider</li>
              <li>Fill in all the fields above with your provider's information</li>
              <li>Click Save to enable SSO login</li>
            </ol>
          </CardContent>
        </Card>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
          size="lg"
          data-testid="button-save-sso"
        >
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
