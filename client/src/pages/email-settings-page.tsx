import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Check, AlertCircle } from "lucide-react";

export default function EmailSettingsPage() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "noreply@example.com",
    smtpSecure: false,
  });
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Load settings from database on mount
  const { data: allSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (allSettings) {
      setSettings({
        smtpHost: allSettings?.SMTP_HOST || "",
        smtpPort: allSettings?.SMTP_PORT || "587",
        smtpUser: allSettings?.SMTP_USER || "",
        smtpPassword: allSettings?.SMTP_PASSWORD || "",
        smtpFrom: allSettings?.SMTP_FROM || "noreply@example.com",
        smtpSecure: (allSettings?.SMTP_SECURE || "false") === "true",
      });
    }
  }, [allSettings]);

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save all settings
      const updates = [
        { key: "SMTP_HOST", value: settings.smtpHost },
        { key: "SMTP_PORT", value: settings.smtpPort },
        { key: "SMTP_USER", value: settings.smtpUser },
        { key: "SMTP_PASSWORD", value: settings.smtpPassword },
        { key: "SMTP_FROM", value: settings.smtpFrom },
        { key: "SMTP_SECURE", value: settings.smtpSecure ? "true" : "false" },
      ];

      await Promise.all(
        updates.map((update) =>
          apiRequest("PATCH", `/api/settings/${update.key}`, { 
            value: typeof update.value === 'string' ? update.value.trim() : update.value 
          })
        )
      );

      // Invalidate cache to reload settings
      await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });

      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.smtpHost) {
      toast({
        title: "Error",
        description: "Please configure SMTP settings first",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      await apiRequest("POST", "/api/settings/test-email", { testEmail });
      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold">Email Settings</h1>
        <p className="text-muted-foreground">Configure SMTP for sending notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-blue-900 dark:text-blue-100">
                <p className="font-semibold">Environment Variables Setup</p>
                <p className="mt-1 text-xs opacity-90">
                  Set these in your Replit secrets for production:
                </p>
                <code className="block mt-2 text-xs bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  SMTP_HOST=smtp.gmail.com
                  <br />
                  SMTP_PORT=587
                  <br />
                  SMTP_USER=your-email@gmail.com
                  <br />
                  SMTP_PASSWORD=your-app-password
                  <br />
                  SMTP_FROM=noreply@yourcompany.com
                </code>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Host</label>
              <Input
                placeholder="smtp.gmail.com"
                value={settings.smtpHost}
                onChange={(e) => handleChange("smtpHost", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Port</label>
              <Input
                type="number"
                placeholder="587"
                value={settings.smtpPort}
                onChange={(e) => handleChange("smtpPort", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP User</label>
              <Input
                placeholder="your-email@gmail.com"
                value={settings.smtpUser}
                onChange={(e) => handleChange("smtpUser", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={settings.smtpPassword}
                onChange={(e) => handleChange("smtpPassword", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Email</label>
            <Input
              placeholder="noreply@yourcompany.com"
              value={settings.smtpFrom}
              onChange={(e) => handleChange("smtpFrom", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="secure"
              checked={settings.smtpSecure}
              onChange={(e) => handleChange("smtpSecure", e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="secure" className="text-sm">
              Use Secure Connection (TLS)
            </label>
          </div>

          <div className="pt-4 border-t space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex-1"
                data-testid="button-save-email-settings"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>

            <h3 className="font-semibold">Test Email</h3>
            <div className="flex gap-2">
              <Input
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                data-testid="input-test-email"
              />
              <Button
                onClick={handleTestEmail}
                disabled={testing || saving}
                variant="outline"
                data-testid="button-send-test-email"
              >
                {testing ? "Sending..." : "Send Test"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Welcome emails for new users</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Subscription confirmation emails</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Invoice emails with payment details</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Support ticket notifications</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Password reset links</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
