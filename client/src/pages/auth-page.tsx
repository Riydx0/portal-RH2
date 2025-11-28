import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Loader2 } from "lucide-react";
import { useLanguage, t } from "@/lib/i18n";

type SettingsData = Record<string, string>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { lang } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", username: "", password: "" });

  useEffect(() => {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [lang]);
  
  const { data: settings } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  const loginTitle = settings?.login_title || "IT Portal";
  const loginDescription = settings?.login_description || "Manage your IT services, software, licenses, and support tickets";
  const loginBgColor = settings?.login_bg_color || "#f5f5f5";
  const logoUrl = settings?.logo_url || "";
  const enableRegistration = settings?.enable_registration !== "false";
  const footerContent = settings?.footer_content || "© 2024 IT Portal. All rights reserved.";

  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: loginBgColor }}>
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          {logoUrl ? (
            <img
              src={logoUrl.startsWith("/api/") ? logoUrl : `/api/download/${logoUrl}`}
              alt="Logo"
              className="h-16 w-16 object-contain"
            />
          ) : (
            <Server className="h-16 w-16 text-primary" />
          )}
          <div className="text-center">
            <h1 className="text-4xl font-bold">{loginTitle}</h1>
            <p className="text-muted-foreground text-base mt-2">{loginDescription}</p>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="space-y-4 pt-6">
            {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t('email', lang)}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={lang === 'ar' ? 'admin@example.com' : 'admin@example.com'}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  data-testid="input-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t('password', lang)}</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  data-testid="input-login-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login-submit"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('signingIn', lang)}
                  </>
                ) : (
                  t('signIn', lang)
                )}
              </Button>
              <div className="text-center">
                <a
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  {t('forgotPassword', lang)}
                </a>
              </div>
              {import.meta.env.VITE_OPENID_ISSUER_URL && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t('or', lang)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = "/api/auth/openid")}
                    data-testid="button-login-openid"
                  >
                    {t('signInWithSSO', lang)}
                  </Button>
                </>
              )}
              {enableRegistration && (
                <p className="text-center text-sm text-muted-foreground">
                  {t('dontHaveAccount', lang)}{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="text-primary hover:underline font-medium"
                    data-testid="button-switch-register"
                  >
                    {t('registerHere', lang)}
                  </button>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">{t('fullName', lang)}</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder={lang === 'ar' ? 'أحمد محمد' : 'John Doe'}
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  data-testid="input-register-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">{t('email', lang)}</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="john@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="johnsmith"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  data-testid="input-register-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">{t('password', lang)}</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  data-testid="input-register-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register-submit"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('registering', lang)}
                  </>
                ) : (
                  t('register', lang)
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('alreadyHaveAccount', lang)}{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-switch-login"
                >
                  {t('loginHere', lang)}
                </button>
              </p>
            </form>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="w-full mt-8 py-4 text-center text-sm text-muted-foreground border-t">
        <p data-testid="text-footer-content">{footerContent}</p>
      </footer>
    </div>
  );
}
