import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Load settings from database on mount
  const { data: allSettings, refetch } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    staleTime: 0, // Always fetch fresh data
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
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      toast({
        title: "Error",
        description: "Please fill in SMTP Host, User, and Password",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Save all settings
      const updates = [
        { key: "SMTP_HOST", value: settings.smtpHost.trim() },
        { key: "SMTP_PORT", value: settings.smtpPort.trim() },
        { key: "SMTP_USER", value: settings.smtpUser.trim() },
        { key: "SMTP_PASSWORD", value: settings.smtpPassword.trim() },
        { key: "SMTP_FROM", value: settings.smtpFrom.trim() },
        { key: "SMTP_SECURE", value: settings.smtpSecure ? "true" : "false" },
      ];

      await Promise.all(
        updates.map((update) =>
          apiRequest("PATCH", `/api/settings/${update.key}`, { 
            value: update.value
          })
        )
      );

      // Invalidate cache and refresh
      await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      await refetch();

      toast({
        title: "Success",
        description: "Email settings saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      toast({
        title: "Error",
        description: "Please save SMTP settings first (Host, User, Password required)",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const result = await apiRequest("POST", "/api/settings/test-email", { testEmail });
      toast({
        title: "Success",
        description: "Test email sent successfully! Check your inbox.",
      });
    } catch (error: any) {
      console.error("Test email error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send test email. Check your SMTP credentials.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const emailFeatures = [
    {
      id: "welcome",
      name: "Welcome Emails",
      description: "Sent when new users create an account",
      subject: "Welcome to Our Platform!",
      preview: "Thank you for creating an account with us. We're excited to have you on board!\n\nYou can now:\n• Access all software downloads\n• Create and manage support tickets\n• View your subscription and invoices\n• Manage your account settings",
    },
    {
      id: "subscription",
      name: "Subscription Confirmation",
      description: "Sent when user subscribes to a plan",
      subject: "Welcome to {Plan} Plan",
      preview: "Thank you for subscribing to our {Plan} plan.\n\nPlan: {Plan}\nMonthly Cost: ${Price}\n\nYour subscription is now active. You can manage your subscription anytime in your dashboard.",
    },
    {
      id: "invoice",
      name: "Invoice Emails",
      description: "Sent when an invoice is generated",
      subject: "Invoice #{InvoiceNumber}",
      preview: "Your invoice is ready. Please see the details below:\n\nInvoice Number: #{InvoiceNumber}\nAmount: ${Amount}\nDue Date: {DueDate}\n\nPlease make payment at your earliest convenience.",
    },
    {
      id: "ticket",
      name: "Support Ticket Notifications",
      description: "Sent for support ticket updates",
      subject: "Support Ticket Update",
      preview: "Your support ticket has been updated.\n\nTicket: {TicketNumber}\nStatus: {Status}\nPriority: {Priority}\n\nYou can view full details in your dashboard.",
    },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    SMTP_PORT=465
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

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-900 dark:text-green-100">
                  <p className="font-semibold">Port Guide</p>
                  <p className="mt-2 text-xs"><strong>Port 465 (Recommended)</strong><br />SSL Direct - Secure from start</p>
                  <p className="mt-2 text-xs"><strong>Port 587</strong><br />STARTTLS - Upgrade to secure</p>
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400"><strong>Port 25</strong><br />Unencrypted - Not secure ❌</p>
                </div>
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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={settings.smtpPassword}
                  onChange={(e) => handleChange("smtpPassword", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select an email type to preview its content:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emailFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedFeature === feature.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-border hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                  data-testid={`button-email-feature-${feature.id}`}
                >
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feature.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedFeature && (
              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mt-4">
                {emailFeatures.find((f) => f.id === selectedFeature) && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Subject Line:</p>
                      <p className="text-sm font-medium mt-1 text-foreground">
                        {emailFeatures.find((f) => f.id === selectedFeature)?.subject}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Email Preview:</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {emailFeatures.find((f) => f.id === selectedFeature)?.preview}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-3">All Available Email Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Welcome emails for new users</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Subscription confirmation emails</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Invoice emails with payment details</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Support ticket notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
