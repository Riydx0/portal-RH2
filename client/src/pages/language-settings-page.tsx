import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Language, getLanguage, setLanguage } from "@/lib/i18n";

const languages: Array<{ code: Language; name: string; nativeName: string; flag: string }> = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSettingsPage() {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getLanguage());

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    toast({
      title: lang === 'ar' ? 'تم تغيير اللغة' : 'Language Changed',
      description: lang === 'ar' ? 'تم تغيير اللغة إلى العربية بنجاح' : 'Language changed to English successfully',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          {currentLanguage === 'ar' ? 'إعدادات اللغة' : 'Language Settings'}
        </h1>
        <p className="text-muted-foreground">
          {currentLanguage === 'ar' 
            ? 'اختر لغتك المفضلة للواجهة' 
            : 'Choose your preferred interface language'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {currentLanguage === 'ar' ? 'اللغات المتاحة' : 'Available Languages'}
          </CardTitle>
          <CardDescription>
            {currentLanguage === 'ar' 
              ? 'اختر اللغة التي تفضلها ستتغير جميع نصوص التطبيق فوراً' 
              : 'Select your preferred language and all interface text will update immediately'}
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
                      {currentLanguage === 'ar' ? 'نشط' : 'Active'}
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
            {currentLanguage === 'ar' ? 'معلومات' : 'Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            {currentLanguage === 'ar'
              ? '• اللغة المختارة سيتم حفظها محلياً في متصفحك'
              : '• Your language preference is saved locally in your browser'}
          </p>
          <p>
            {currentLanguage === 'ar'
              ? '• ستستمر في استخدام اللغة المختارة عند تسجيل الدخول التالي'
              : '• Your language preference will persist when you log back in'}
          </p>
          <p>
            {currentLanguage === 'ar'
              ? '• جميع أجزاء التطبيق تدعم اللغة العربية'
              : '• The entire application supports your chosen language'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
