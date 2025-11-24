import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Upload, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SettingsData = Record<string, string>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name || "");
      setLogoUrl(settings.logo_url || "");
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
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your changes will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
