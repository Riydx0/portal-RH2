import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Upload, Save, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SettingsData = Record<string, string>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loginTitle, setLoginTitle] = useState("");
  const [loginDescription, setLoginDescription] = useState("");
  const [loginBgColor, setLoginBgColor] = useState("");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [openidIssuerUrl, setOpenidIssuerUrl] = useState("");
  const [openidClientId, setOpenidClientId] = useState("");
  const [openidClientSecret, setOpenidClientSecret] = useState("");
  const [openidCallbackUrl, setOpenidCallbackUrl] = useState("");
  const [footerText, setFooterText] = useState("");
  const [cloudronName, setCloudronName] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name || "");
      setLogoUrl(settings.logo_url || "");
      setLoginTitle(settings.login_title || "IT Portal");
      setLoginDescription(settings.login_description || "Manage your IT services, software, licenses, and support tickets");
      setLoginBgColor(settings.login_bg_color || "#f5f5f5");
      setEnableRegistration(settings.enable_registration !== "false");
      setOpenidIssuerUrl(settings.openid_issuer_url || "");
      setOpenidClientId(settings.openid_client_id || "");
      setOpenidClientSecret(settings.openid_client_secret || "");
      setOpenidCallbackUrl(settings.openid_callback_url || "");
      setFooterText(settings.footer_text || "");
      setCloudronName(settings.cloudron_name || "");
    }
  }, [settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLogo(e.target.files[0]);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!selectedLogo) return null;

    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedLogo);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Logo upload failed");
      }

      const data = await response.json();
      setUploadProgress(false);
      return data.path;
    } catch (error: any) {
      setUploadProgress(false);
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let finalLogoUrl = logoUrl;

      if (selectedLogo) {
        const uploadedPath = await uploadLogo();
        if (uploadedPath) {
          finalLogoUrl = uploadedPath;
        }
      }

      await apiRequest("PATCH", "/api/settings/site_name", { value: siteName });
      await apiRequest("PATCH", "/api/settings/logo_url", { value: finalLogoUrl });
      await apiRequest("PATCH", "/api/settings/login_title", { value: loginTitle });
      await apiRequest("PATCH", "/api/settings/login_description", { value: loginDescription });
      await apiRequest("PATCH", "/api/settings/login_bg_color", { value: loginBgColor });
      await apiRequest("PATCH", "/api/settings/enable_registration", { value: enableRegistration ? "true" : "false" });
      await apiRequest("PATCH", "/api/settings/openid_issuer_url", { value: openidIssuerUrl });
      await apiRequest("PATCH", "/api/settings/openid_client_id", { value: openidClientId });
      await apiRequest("PATCH", "/api/settings/openid_client_secret", { value: openidClientSecret });
      await apiRequest("PATCH", "/api/settings/openid_callback_url", { value: openidCallbackUrl });
      await apiRequest("PATCH", "/api/settings/footer_text", { value: footerText });
      await apiRequest("PATCH", "/api/settings/cloudron_name", { value: cloudronName });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setSelectedLogo(null);
      toast({
        title: "Success",
        description: "Settings saved successfully",
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

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage application settings</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Configure site name and branding</CardDescription>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Logo
              </Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                data-testid="input-logo-upload"
              />
              {selectedLogo && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedLogo.name}
                </p>
              )}
              {logoUrl && !selectedLogo && (
                <p className="text-sm text-muted-foreground">
                  Current logo: {logoUrl}
                </p>
              )}
            </div>

            {logoUrl && (
              <div className="space-y-2">
                <Label>Current Logo Preview</Label>
                <div className="p-4 border rounded-md bg-muted/50 flex items-center justify-center">
                  <img
                    src={logoUrl.startsWith("/api/") ? logoUrl : `/api/download/${logoUrl}`}
                    alt="Logo preview"
                    className="max-h-32 object-contain"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || uploadProgress || isLoading}
              className="w-full"
              data-testid="button-save-settings"
            >
              <Save className="mr-2 h-4 w-4" />
              {uploadProgress ? "Uploading..." : saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Login Page Settings
            </CardTitle>
            <CardDescription>Customize the login page appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-title">Login Page Title</Label>
              <Input
                id="login-title"
                value={loginTitle}
                onChange={(e) => setLoginTitle(e.target.value)}
                placeholder="IT Portal"
                data-testid="input-login-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-description">Login Page Description</Label>
              <Textarea
                id="login-description"
                value={loginDescription}
                onChange={(e) => setLoginDescription(e.target.value)}
                placeholder="Manage your IT services, software, licenses, and support tickets"
                data-testid="input-login-description"
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-bg-color">Background Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="login-bg-color"
                  type="color"
                  value={loginBgColor}
                  onChange={(e) => setLoginBgColor(e.target.value)}
                  data-testid="input-login-bg-color"
                  className="h-12 w-20"
                />
                <Input
                  type="text"
                  value={loginBgColor}
                  onChange={(e) => setLoginBgColor(e.target.value)}
                  placeholder="#f5f5f5"
                  data-testid="input-login-bg-color-text"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
              <Label htmlFor="enable-registration" className="cursor-pointer">
                Enable User Registration
              </Label>
              <Switch
                id="enable-registration"
                checked={enableRegistration}
                onCheckedChange={setEnableRegistration}
                data-testid="toggle-enable-registration"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize your platform branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cloudron-name">Organization Name</Label>
              <Input
                id="cloudron-name"
                value={cloudronName}
                onChange={(e) => setCloudronName(e.target.value)}
                placeholder="Riyadh Alafraa Systems"
                data-testid="input-cloudron-name"
              />
              <p className="text-xs text-muted-foreground">Your organization name (e.g., company or department)</p>
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
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              SSO Settings
            </CardTitle>
            <CardDescription>Configure OpenID Connect Single Sign-On</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openid-issuer">OpenID Issuer URL</Label>
              <Input
                id="openid-issuer"
                value={openidIssuerUrl}
                onChange={(e) => setOpenidIssuerUrl(e.target.value)}
                placeholder="https://my.example.com"
                data-testid="input-openid-issuer"
              />
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
            </div>

            <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
              Fill in your OpenID Connect provider details to enable SSO login. Leave empty to disable SSO.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your changes will look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 border rounded-md bg-background">
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={logoUrl.startsWith("/api/") ? logoUrl : `/api/download/${logoUrl}`}
                    alt="Logo"
                    className="h-10 w-10 object-contain"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{siteName || "IT Portal"}</h2>
                  <p className="text-sm text-muted-foreground">Service Management</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This is how your branding will appear in the application header.
            </p>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Login Page Preview:</p>
              <div
                className="p-6 rounded-md border"
                style={{ backgroundColor: loginBgColor }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{loginTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{loginDescription}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
