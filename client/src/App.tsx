import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
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
import { initLanguage } from "@/lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
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
      <ProtectedRoute path="/settings/change-password" component={ChangePasswordPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
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

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-2 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
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
