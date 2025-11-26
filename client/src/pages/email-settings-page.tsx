import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Check, AlertCircle, Eye, EyeOff, Send, Upload } from "lucide-react";

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
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    subject: "",
    preview: "",
    fontFamily: "Arial",
    fontSize: "16",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    attachments: [] as any[],
  });
  const [testingFeature, setTestingFeature] = useState<string | null>(null);

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

  const handleAddFeature = () => {
    if (!newFeature.name || !newFeature.subject || !newFeature.preview) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const id = newFeature.name.toLowerCase().replace(/\s+/g, "_");
    emailFeatures.push({
      id,
      name: newFeature.name,
      description: newFeature.description,
      subject: newFeature.subject,
      preview: newFeature.preview,
      fontFamily: newFeature.fontFamily,
      fontSize: newFeature.fontSize,
      textColor: newFeature.textColor,
      backgroundColor: newFeature.backgroundColor,
      attachments: newFeature.attachments,
    });
    
    setNewFeature({ 
      name: "", 
      description: "", 
      subject: "", 
      preview: "",
      fontFamily: "Arial",
      fontSize: "16",
      textColor: "#000000",
      backgroundColor: "#ffffff",
      attachments: [],
    });
    setShowAddForm(false);
    setSelectedFeature(id);
    
    toast({
      title: "Success",
      description: "Email feature added successfully!",
    });
  };

  const handleUpdateFeature = () => {
    if (!editingFeature.name || !editingFeature.subject || !editingFeature.preview) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const index = emailFeatures.findIndex((f) => f.id === editingFeature.id);
    if (index !== -1) {
      emailFeatures[index] = editingFeature;
    }
    
    setEditingFeature(null);
    toast({
      title: "Success",
      description: "Email feature updated successfully!",
    });
  };

  const handleTestFeature = async (feature: any) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address first",
        variant: "destructive",
      });
      return;
    }

    setTestingFeature(feature.id);
    try {
      // Create a styled version of the email
      const styledEmail = `
        <div style="font-family: ${feature.fontFamily || "Arial"}; font-size: ${feature.fontSize || "16"}px; color: ${feature.textColor || "#000"}; background-color: ${feature.backgroundColor || "#fff"}; padding: 20px;">
          <h3>${feature.subject}</h3>
          <p>${feature.preview.replace(/\n/g, "<br />")}</p>
        </div>
      `;
      
      await apiRequest("POST", "/api/settings/test-email", { 
        testEmail,
        customHtml: styledEmail,
        featureName: feature.name
      });
      
      toast({
        title: "Success",
        description: `Test email for "${feature.name}" sent successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTestingFeature(null);
    }
  };

  const handleFileUpload = (files: FileList | null, isNew: boolean = true) => {
    if (!files) return;
    
    const newAttachments = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));

    if (isNew) {
      const currentAttachments = Array.isArray(newFeature.attachments) ? newFeature.attachments : [];
      setNewFeature({
        ...newFeature,
        attachments: [...(currentAttachments || []), ...newAttachments],
      });
    } else if (editingFeature) {
      const currentAttachments = editingFeature.attachments && Array.isArray(editingFeature.attachments) ? editingFeature.attachments : [];
      setEditingFeature({
        ...editingFeature,
        attachments: [...(currentAttachments || []), ...newAttachments],
      });
    }

    toast({
      title: "Success",
      description: `${newAttachments.length} file(s) added`,
    });
  };

  const handleDeleteFeature = (id: string) => {
    const index = emailFeatures.findIndex((f) => f.id === id);
    if (index !== -1) {
      emailFeatures.splice(index, 1);
      if (selectedFeature === id) {
        setSelectedFeature(null);
      }
      toast({
        title: "Success",
        description: "Email feature deleted successfully!",
      });
    }
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

  const defaultFeatures = [
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
  
  const emailFeatures = defaultFeatures;

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
                <div
                  key={feature.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedFeature === feature.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-border hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <button
                    onClick={() => setSelectedFeature(feature.id)}
                    className="w-full text-left"
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
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingFeature(feature)}
                      className="text-xs flex-1"
                      data-testid={`button-edit-feature-${feature.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="text-xs text-red-600 dark:text-red-400 flex-1"
                      data-testid={`button-delete-feature-${feature.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              className="w-full"
              data-testid="button-add-email-feature"
            >
              + Add New Email Feature
            </Button>

            {showAddForm && (
              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Add New Email Feature</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Feature Name</label>
                  <Input
                    placeholder="e.g., Password Reset Emails"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                    data-testid="input-feature-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    placeholder="When this email is sent"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                    data-testid="input-feature-description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject Line</label>
                  <Input
                    placeholder="e.g., Reset Your Password"
                    value={newFeature.subject}
                    onChange={(e) => setNewFeature({ ...newFeature, subject: e.target.value })}
                    data-testid="input-feature-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Preview</label>
                  <textarea
                    placeholder="Email content..."
                    value={newFeature.preview}
                    onChange={(e) => setNewFeature({ ...newFeature, preview: e.target.value })}
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-sm"
                    rows={4}
                    data-testid="textarea-feature-preview"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Font</label>
                    <select
                      value={newFeature.fontFamily}
                      onChange={(e) => setNewFeature({ ...newFeature, fontFamily: e.target.value })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-sm"
                      data-testid="select-font-family"
                    >
                      <option>Arial</option>
                      <option>Georgia</option>
                      <option>Times New Roman</option>
                      <option>Courier New</option>
                      <option>Verdana</option>
                      <option>Comic Sans MS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Size</label>
                    <input
                      type="number"
                      value={newFeature.fontSize}
                      onChange={(e) => setNewFeature({ ...newFeature, fontSize: e.target.value })}
                      min="10"
                      max="32"
                      className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-sm"
                      data-testid="input-font-size"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <input
                      type="color"
                      value={newFeature.textColor}
                      onChange={(e) => setNewFeature({ ...newFeature, textColor: e.target.value })}
                      className="w-full p-1 border rounded-md"
                      data-testid="input-text-color"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Background</label>
                    <input
                      type="color"
                      value={newFeature.backgroundColor}
                      onChange={(e) => setNewFeature({ ...newFeature, backgroundColor: e.target.value })}
                      className="w-full p-1 border rounded-md"
                      data-testid="input-bg-color"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Attachments (PDF/Images)</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => handleFileUpload(e.target.files, true)}
                      className="flex-1 text-sm"
                      data-testid="input-attachments"
                    />
                    <Upload className="h-4 w-4 mt-2" />
                  </div>
                  {newFeature.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newFeature.attachments.map((att: any, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                          <span>{att.name}</span>
                          <button
                            onClick={() => setNewFeature({
                              ...newFeature,
                              attachments: newFeature.attachments.filter((_: any, i: number) => i !== idx)
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddFeature} className="flex-1" data-testid="button-save-new-feature">
                    Save Feature
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {editingFeature && (
              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Edit: {editingFeature.name}</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Feature Name</label>
                  <Input
                    value={editingFeature.name}
                    onChange={(e) => setEditingFeature({ ...editingFeature, name: e.target.value })}
                    data-testid="input-edit-feature-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={editingFeature.description}
                    onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                    data-testid="input-edit-feature-description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject Line</label>
                  <Input
                    value={editingFeature.subject}
                    onChange={(e) => setEditingFeature({ ...editingFeature, subject: e.target.value })}
                    data-testid="input-edit-feature-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Preview</label>
                  <textarea
                    value={editingFeature.preview}
                    onChange={(e) => setEditingFeature({ ...editingFeature, preview: e.target.value })}
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-sm"
                    rows={4}
                    data-testid="textarea-edit-feature-preview"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Font</label>
                    <select
                      value={editingFeature.fontFamily || "Arial"}
                      onChange={(e) => setEditingFeature({ ...editingFeature, fontFamily: e.target.value })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-sm"
                    >
                      <option>Arial</option>
                      <option>Georgia</option>
                      <option>Times New Roman</option>
                      <option>Courier New</option>
                      <option>Verdana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Size</label>
                    <input
                      type="number"
                      value={editingFeature.fontSize || "16"}
                      onChange={(e) => setEditingFeature({ ...editingFeature, fontSize: e.target.value })}
                      min="10"
                      max="32"
                      className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <input
                      type="color"
                      value={editingFeature.textColor || "#000000"}
                      onChange={(e) => setEditingFeature({ ...editingFeature, textColor: e.target.value })}
                      className="w-full p-1 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Background</label>
                    <input
                      type="color"
                      value={editingFeature.backgroundColor || "#ffffff"}
                      onChange={(e) => setEditingFeature({ ...editingFeature, backgroundColor: e.target.value })}
                      className="w-full p-1 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Attachments</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => handleFileUpload(e.target.files, false)}
                      className="flex-1 text-sm"
                    />
                  </div>
                  {editingFeature.attachments && editingFeature.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {editingFeature.attachments.map((att: any, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                          <span>{att.name || att}</span>
                          <button
                            onClick={() => setEditingFeature({
                              ...editingFeature,
                              attachments: editingFeature.attachments.filter((_: any, i: number) => i !== idx)
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateFeature} className="flex-1" data-testid="button-save-edited-feature">
                    Update Feature
                  </Button>
                  <Button 
                    onClick={() => handleTestFeature(editingFeature)} 
                    variant="outline" 
                    className="flex-1 gap-2"
                    disabled={testingFeature === editingFeature.id}
                    data-testid="button-test-edited-feature"
                  >
                    <Send className="h-4 w-4" />
                    {testingFeature === editingFeature.id ? "Sending..." : "Test"}
                  </Button>
                  <Button onClick={() => setEditingFeature(null)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

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
                      <div 
                        style={{
                          fontFamily: emailFeatures.find((f) => f.id === selectedFeature)?.fontFamily || "Arial",
                          fontSize: `${emailFeatures.find((f) => f.id === selectedFeature)?.fontSize || "16"}px`,
                          color: emailFeatures.find((f) => f.id === selectedFeature)?.textColor || "#000",
                          backgroundColor: emailFeatures.find((f) => f.id === selectedFeature)?.backgroundColor || "#fff",
                          padding: "10px",
                          borderRadius: "4px",
                        }}
                        className="text-sm whitespace-pre-wrap leading-relaxed"
                      >
                        {emailFeatures.find((f) => f.id === selectedFeature)?.preview}
                      </div>
                    </div>

                    {emailFeatures.find((f) => f.id === selectedFeature)?.attachments?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Attachments:</p>
                        <div className="space-y-1">
                          {emailFeatures.find((f) => f.id === selectedFeature)?.attachments.map((att: any, idx: number) => (
                            <p key={idx} className="text-sm text-muted-foreground">📎 {att.name || att}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleTestFeature(emailFeatures.find((f) => f.id === selectedFeature)!)}
                      className="w-full mt-4 gap-2"
                      disabled={testingFeature === selectedFeature}
                      data-testid="button-test-feature"
                    >
                      <Send className="h-4 w-4" />
                      {testingFeature === selectedFeature ? "Sending Test..." : "Send Test Email"}
                    </Button>
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
