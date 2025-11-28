import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Save, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SettingsData = Record<string, string>;

interface LogoPreview {
  width: number;
  height: number;
  size: number;
  dataUrl: string;
}

export default function AppearanceSettingsPage() {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState("");
  const [loginTitle, setLoginTitle] = useState("");
  const [loginDescription, setLoginDescription] = useState("");
  const [loginBgColor, setLoginBgColor] = useState("");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [footerContent, setFooterContent] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<LogoPreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logo_url || "");
      setLoginTitle(settings.login_title || "IT Portal");
      setLoginDescription(settings.login_description || "Manage your IT services, software, licenses, and support tickets");
      setLoginBgColor(settings.login_bg_color || "#f5f5f5");
      setEnableRegistration(settings.enable_registration !== "false");
      setFooterContent(settings.footer_content || "© 2024 IT Portal. All rights reserved.");
    }
  }, [settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, GIF, WebP, or SVG)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedLogo(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const img = new window.Image();
        
        img.onload = () => {
          setLogoPreview({
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: file.size,
            dataUrl: dataUrl,
          });
        };
        
        img.onerror = () => {
          console.error("Failed to load image");
          toast({
            title: "Error",
            description: "Failed to load image. Please check the file format.",
            variant: "destructive",
          });
        };
        
        // Use a small timeout to ensure image loads
        setTimeout(() => {
          img.src = dataUrl;
        }, 0);
      };
      
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file.",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
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

      await apiRequest("PATCH", "/api/settings/logo_url", { value: finalLogoUrl });
      await apiRequest("PATCH", "/api/settings/login_title", { value: loginTitle });
      await apiRequest("PATCH", "/api/settings/login_description", { value: loginDescription });
      await apiRequest("PATCH", "/api/settings/login_bg_color", { value: loginBgColor });
      await apiRequest("PATCH", "/api/settings/enable_registration", { value: enableRegistration ? "true" : "false" });
      await apiRequest("PATCH", "/api/settings/footer_content", { value: footerContent });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setSelectedLogo(null);
      setLogoPreview(null);
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

  if (isLoading) {
    return <div className="flex-1 p-6">Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Appearance Settings</h1>
        <p className="text-muted-foreground">Customize the look and feel of your application</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Upload your organization logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Logo
              </Label>
              <Input
                id="logo"
                type="file"
                onChange={handleLogoChange}
                data-testid="input-logo"
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

            {selectedLogo && logoPreview && (
              <div className="space-y-2">
                <Label>New Logo Preview</Label>
                <div className="p-4 border rounded-md bg-muted/50 flex flex-col items-center justify-center gap-3">
                  <img
                    src={logoPreview.dataUrl}
                    alt="New logo preview"
                    className="max-h-40 object-contain"
                    data-testid="img-logo-preview-new"
                  />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p data-testid="text-logo-dimensions">Dimensions: {logoPreview.width}px × {logoPreview.height}px</p>
                    <p data-testid="text-logo-size">File size: {(logoPreview.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              </div>
            )}

            {logoUrl && !selectedLogo && (
              <div className="space-y-2">
                <Label>Current Logo Preview</Label>
                <div className="p-4 border rounded-md bg-muted/50 flex items-center justify-center">
                  <img
                    src={logoUrl.startsWith("/api/") ? logoUrl : `/api/download/${logoUrl}`}
                    alt="Logo preview"
                    className="max-h-32 object-contain"
                    data-testid="img-logo-preview-current"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Page</CardTitle>
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
            <CardTitle>Footer</CardTitle>
            <CardDescription>Customize the footer content across the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer-content">Footer Text</Label>
              <Textarea
                id="footer-content"
                value={footerContent}
                onChange={(e) => setFooterContent(e.target.value)}
                placeholder="© 2024 IT Portal. All rights reserved."
                data-testid="input-footer-content"
                className="resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">This text will appear at the bottom of all pages</p>
            </div>
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
                  <h2 className="text-xl font-semibold">IT Portal</h2>
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

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || uploadProgress || isLoading}
          className="w-full"
          size="lg"
          data-testid="button-save-appearance"
        >
          <Save className="mr-2 h-4 w-4" />
          {uploadProgress ? "Uploading..." : saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
