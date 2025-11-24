import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Language, getLanguage, setLanguage, useLanguage, t } from "@/lib/i18n";

const languages: Array<{ code: Language; name: string; nativeName: string; flag: string }> = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSettingsPage() {
  const { toast } = useToast();
  const { lang, changeLang } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(lang);

  useEffect(() => {
    setCurrentLanguage(lang);
  }, [lang]);

  const handleLanguageChange = (newLang: Language) => {
    changeLang(newLang);
    setCurrentLanguage(newLang);
    toast({
      title: t('languageChanged', newLang),
      description: newLang === 'ar' ? t('changedToArabic', newLang) : t('changedToEnglish', newLang),
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          {t('languageSettings', lang)}
        </h1>
        <p className="text-muted-foreground">
          {t('chooseYourPreferredLanguage', lang)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('availableLanguages', lang)}
          </CardTitle>
          <CardDescription>
            {t('selectPreferredLanguageAllTextUpdates', lang)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  currentLanguage === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                data-testid={`button-lang-${lang.code}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <p className="font-semibold">{lang.name}</p>
                      <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                    </div>
                  </div>
                  {currentLanguage === lang.code && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      {t('active', lang)}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('information', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • {t('languageSavedLocally', lang)}
          </p>
          <p>
            • {t('languagePersistNextLogin', lang)}
          </p>
          <p>
            • {t('entireAppSupportsLanguage', lang)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
