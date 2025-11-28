import { useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationsButton } from "@/components/notifications-button";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useLanguage, initLanguage, type Language } from "@/lib/i18n";
import { Server } from "lucide-react";

type SettingsData = Record<string, string>;
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ShareDownloadPage from "@/pages/share-download-page";
import DashboardPage from "@/pages/dashboard-page";
import CategoriesPage from "@/pages/categories-page";
import SoftwarePage from "@/pages/software-page";
import DownloadsPage from "@/pages/downloads-page";
import LicensesPage from "@/pages/licenses-page";
import TicketsPage from "@/pages/tickets-page";
import NewTicketPage from "@/pages/new-ticket-page";
import TicketDetailPage from "@/pages/ticket-detail-page";
import UsersPage from "@/pages/users-page";
import SettingsPage from "@/pages/settings-page";
import AppearanceSettingsPage from "@/pages/appearance-settings-page";
import BrandingSettingsPage from "@/pages/branding-settings-page";
import SSOSettingsPage from "@/pages/sso-settings-page";
import ChangePasswordPage from "@/pages/change-password-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import GroupsPage from "@/pages/groups-page";
import LanguageSettingsPage from "@/pages/language-settings-page";
import LogsSettingsPage from "@/pages/logs-settings-page";
import ExternalLinksPage from "@/pages/external-links-page";
import DashboardSettingsPage from "@/pages/dashboard-settings-page";
import NetworksPage from "@/pages/networks-page";
import VpnPage from "@/pages/vpn-page";
import FirewallPage from "@/pages/firewall-page";
import InvoicesPage from "@/pages/invoices-page";
import SoftwarePricingPage from "@/pages/software-pricing-page";
import SoftwarePricingAdminPage from "@/pages/software-pricing-admin-page";
import SubscriptionPlansPage from "@/pages/subscription-plans-page";
import PricingPage from "@/pages/pricing-page";
import EmailSettingsPage from "@/pages/email-settings-page";
import SubmitTicketPage from "@/pages/submit-ticket-page";
import RequestLicensePage from "@/pages/request-license-page";
import WireGuardPage from "@/pages/wireguard-page";
import ApiKeysPage from "@/pages/api-keys-page";
import ApiDocsPage from "@/pages/api-docs-page";
import ClientsPage from "@/pages/clients-page";
import DevicesPage from "@/pages/devices-page";
import MySubscriptionsPage from "@/pages/my-subscriptions-page";
import UpdatesPage from "@/pages/updates-page";
import DomainSettingsPage from "@/pages/domain-settings-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/download/:secretCode" component={ShareDownloadPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/categories" component={CategoriesPage} />
      <ProtectedRoute path="/software" component={SoftwarePage} />
      <ProtectedRoute path="/downloads" component={DownloadsPage} />
      <ProtectedRoute path="/licenses" component={LicensesPage} />
      <ProtectedRoute path="/tickets" component={TicketsPage} />
      <ProtectedRoute path="/tickets/new" component={NewTicketPage} />
      <ProtectedRoute path="/tickets/:id" component={TicketDetailPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/settings/appearance" component={AppearanceSettingsPage} />
      <ProtectedRoute path="/settings/branding" component={BrandingSettingsPage} />
      <ProtectedRoute path="/settings/sso" component={SSOSettingsPage} />
      <ProtectedRoute path="/settings/language" component={LanguageSettingsPage} />
      <ProtectedRoute path="/settings/logs" component={LogsSettingsPage} />
      <ProtectedRoute path="/settings/change-password" component={ChangePasswordPage} />
      <ProtectedRoute path="/external-links" component={ExternalLinksPage} />
      <ProtectedRoute path="/dashboard-settings" component={DashboardSettingsPage} />
      <ProtectedRoute path="/networks" component={NetworksPage} />
      <ProtectedRoute path="/vpn" component={VpnPage} />
      <ProtectedRoute path="/firewall" component={FirewallPage} />
      <ProtectedRoute path="/invoices" component={InvoicesPage} />
      <ProtectedRoute path="/software-pricing" component={SoftwarePricingPage} />
      <ProtectedRoute path="/pricing-admin" component={SubscriptionPlansPage} />
      <ProtectedRoute path="/software-pricing-admin" component={SoftwarePricingAdminPage} />
      <ProtectedRoute path="/email-settings" component={EmailSettingsPage} />
      <ProtectedRoute path="/submit-ticket" component={SubmitTicketPage} />
      <ProtectedRoute path="/request-license" component={RequestLicensePage} />
      <ProtectedRoute path="/wireguard" component={WireGuardPage} />
      <ProtectedRoute path="/api-keys" component={ApiKeysPage} />
      <Route path="/api-docs" component={ApiDocsPage} />
      <ProtectedRoute path="/clients" component={ClientsPage} />
      <ProtectedRoute path="/devices" component={DevicesPage} />
      <ProtectedRoute path="/my-subscriptions" component={MySubscriptionsPage} />
      <ProtectedRoute path="/updates" component={UpdatesPage} />
      <ProtectedRoute path="/domain-settings" component={DomainSettingsPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { lang } = useLanguage();
  const [location] = useLocation();
  const previousLangRef = useRef<Language | null>(null);
  const { data: settings } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [lang]);

  useEffect(() => {
    // Speak language change automatically
    if (previousLangRef.current !== null && previousLangRef.current !== lang && 'speechSynthesis' in window) {
      const text = lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    previousLangRef.current = lang;
  }, [lang]);

  const isAuthPage = location === "/auth";
  const isShareDownload = location.startsWith("/download/");
  const isForgotPassword = location === "/forgot-password";

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isAuthPage || isShareDownload || isForgotPassword) {
    return <Router />;
  }

  const footerContent = settings?.footer_content || "© 2024 IT Portal. All rights reserved.";

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className={`flex h-screen w-full ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-2 border-b bg-background gap-2 px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2 flex-1">
              {settings?.logo_url && (
                <img
                  src={settings.logo_url.startsWith("/api/") ? settings.logo_url : `/api/download/${settings.logo_url}`}
                  alt="Logo"
                  className="h-6 w-6 object-contain"
                />
              )}
              {settings?.login_title && (
                <span className="text-sm font-medium text-muted-foreground">{settings.login_title}</span>
              )}
            </div>
            <NotificationsButton />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
          <footer className="border-t bg-background py-3 px-4 text-center text-sm text-muted-foreground">
            <p data-testid="text-footer-content">{footerContent}</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  initLanguage();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
