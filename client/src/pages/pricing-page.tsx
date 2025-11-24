import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLanguage, t } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "wouter";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    description: "للشركات الصغيرة",
    descEn: "For small teams",
    users: 10,
    software: 50,
    features: [
      "10 Employees",
      "50 Software Items",
      "Basic Support",
      "Email Support",
    ],
    featuresAr: [
      "10 موظفين",
      "50 برنامج",
      "دعم أساسي",
      "دعم عبر البريد",
    ],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 79,
    description: "للشركات المتوسطة",
    descEn: "For growing teams",
    users: 50,
    software: 200,
    features: [
      "50 Employees",
      "200 Software Items",
      "Priority Support",
      "Phone & Email Support",
      "Advanced Reports",
    ],
    featuresAr: [
      "50 موظف",
      "200 برنامج",
      "دعم أولوي",
      "دعم عبر الهاتف والبريد",
      "تقارير متقدمة",
    ],
    popular: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 199,
    description: "للمؤسسات الكبيرة",
    descEn: "For enterprises",
    users: 999,
    software: 999,
    features: [
      "Unlimited Employees",
      "Unlimited Software",
      "24/7 Support",
      "API Access",
      "Custom Integrations",
      "Dedicated Account Manager",
    ],
    featuresAr: [
      "موظفين غير محدود",
      "برامج غير محدودة",
      "دعم 24/7",
      "API Access",
      "تكاملات مخصصة",
      "مدير حساب خاص",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useNavigate();

  const isArabic = lang === "ar";

  return (
    <div className="flex-1 space-y-12 p-6 lg:p-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{isArabic ? "خطط التسعير" : "Pricing Plans"}</h1>
        <p className="text-xl text-muted-foreground">
          {isArabic
            ? "اختر الخطة المناسبة لاحتياجات شركتك"
            : "Choose the perfect plan for your organization"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isArabic
            ? "كل الخطط تتضمن دعم فني مجاني وتحديثات دورية"
            : "All plans include free support and regular updates"}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col hover-elevate transition-all ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  {isArabic ? "الأكثر شهرة" : "Most Popular"}
                </Badge>
              </div>
            )}

            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                {isArabic ? plan.description : plan.descEn}
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "الموظفين" : "Employees"}
                  </span>
                  <span className="font-semibold">{plan.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "البرامج" : "Software Items"}
                  </span>
                  <span className="font-semibold">{plan.software}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {(isArabic ? plan.featuresAr : plan.features).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <Button
                className="w-full mt-6"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate("/auth")}
              >
                {user ? (isArabic ? "ترقية الآن" : "Upgrade Now") : isArabic ? "ابدأ الآن" : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-8 py-12">
        <h2 className="text-3xl font-bold text-center">
          {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "هل يمكنني تغيير الخطة لاحقاً؟" : "Can I change plans later?"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isArabic
                ? "نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. سيتم حساب الفرق في الفاتورة القادمة."
                : "Yes, you can upgrade or downgrade at any time. Billing is prorated accordingly."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "هل توجد فترة تجربة مجانية؟" : "Is there a free trial?"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isArabic
                ? "نعم، احصل على 14 يوم مجاني بدون بطاقة ائتمان."
                : "Yes, get 14 days free without a credit card."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "ماذا يحدث إذا تجاوزت الحد الأقصى؟" : "What if I exceed my limit?"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isArabic
                ? "نحن سنخطرك أولاً. يمكنك الترقية أو حذف العناصر القديمة."
                : "We'll notify you first. You can upgrade or delete old items."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "هل توجد خصومات سنوية؟" : "Are there annual discounts?"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isArabic
                ? "نعم، احصل على 20% خصم عند الدفع سنوياً."
                : "Yes, get 20% off when paying annually."}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
