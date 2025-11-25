import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage, t } from "@/lib/i18n";
import { CreditCard, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import type { SubscriptionPlan } from "@shared/schema";

type SubscriptionWithPlan = {
  id: number;
  userId: number;
  planId: number;
  status: "active" | "canceled" | "expired" | "paused";
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlan;
};

export default function MySubscriptionsPage() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const isArabic = lang === "ar";

  const { data: subscription, isLoading } = useQuery<SubscriptionWithPlan | null>({
    queryKey: ["/api/subscriptions/me"],
  });

  const { data: availablePlans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      return apiRequest("POST", `/api/subscriptions/${subscriptionId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: isArabic ? "تم الإلغاء" : "Success",
        description: isArabic ? "تم إلغاء الاشتراك بنجاح" : "Subscription cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/me"] });
    },
    onError: () => {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل إلغاء الاشتراك" : "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest("POST", "/api/subscriptions", {
        planId,
      });
    },
    onSuccess: () => {
      toast({
        title: isArabic ? "تم التحديث" : "Success",
        description: isArabic ? "تم تحديث الاشتراك بنجاح" : "Subscription updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/me"] });
    },
    onError: () => {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل تحديث الاشتراك" : "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  return (
    <div className={`flex-1 space-y-6 p-6 lg:p-8 ${isArabic ? 'text-right' : 'text-left'}`}>
      <div>
        <h1 className="text-3xl font-semibold">
          {isArabic ? "اشتراكي" : "My Subscription"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? "عرض وإدارة اشتراكك الحالي" : "View and manage your current subscription"}
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              {isArabic ? "جاري التحميل..." : "Loading..."}
            </p>
          </CardContent>
        </Card>
      ) : !subscription ? (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              {isArabic ? "لا توجد اشتراكات نشطة" : "No Active Subscription"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {isArabic 
                ? "أنت غير مشترك حالياً. اختر خطة من الخطط المتاحة أدناه للبدء."
                : "You don't have an active subscription. Choose a plan below to get started."}
            </p>
            <Button onClick={() => window.location.href = "/pricing"}>
              {isArabic ? "عرض الخطط" : "View Plans"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {isArabic ? "اشتراكك الحالي" : "Your Current Plan"}
            </CardTitle>
            <CardDescription>
              {subscription.plan?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Plan Info */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "حالة الاشتراك" : "Status"}
                </p>
                <Badge 
                  variant={subscription.status === "active" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {subscription.status}
                </Badge>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "السعر الشهري" : "Monthly Price"}
                </p>
                <p className="text-lg font-semibold">
                  ${(subscription.plan?.price || 0) / 100}/month
                </p>
              </div>

              {/* Current Period */}
              {subscription.currentPeriodStart && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "بداية الفترة" : "Period Start"}
                  </p>
                  <p className="font-medium">
                    {format(new Date(subscription.currentPeriodStart), "MMM dd, yyyy")}
                  </p>
                </div>
              )}

              {/* End Period */}
              {subscription.currentPeriodEnd && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "نهاية الفترة" : "Period End"}
                  </p>
                  <p className="font-medium">
                    {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Plan Features */}
            {subscription.plan?.features && subscription.plan.features.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <p className="font-semibold text-sm">
                  {isArabic ? "المميزات المتضمنة" : "Included Features"}
                </p>
                <ul className="space-y-2">
                  {subscription.plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/pricing"}
              >
                {isArabic ? "ترقية الخطة" : "Upgrade Plan"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => subscription.id && cancelMutation.mutate(subscription.id)}
                disabled={cancelMutation.isPending || subscription.status === "canceled"}
              >
                {isArabic ? "إلغاء الاشتراك" : "Cancel Subscription"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans for Upgrade */}
      {subscription && availablePlans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isArabic ? "خطط أخرى متاحة" : "Other Available Plans"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {availablePlans.map((plan: any) => (
              <Card
                key={plan.id}
                className={`flex flex-col hover-elevate ${
                  plan.id === subscription.plan?.id ? "border-primary" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">${(plan.price || 0) / 100}</span>
                    <span className="text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {plan.features && (
                    <ul className="space-y-2">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className="w-full mt-4"
                    onClick={() => upgradeMutation.mutate(plan.id)}
                    disabled={
                      upgradeMutation.isPending ||
                      plan.id === subscription.plan?.id
                    }
                    variant={plan.id === subscription.plan?.id ? "outline" : "default"}
                  >
                    {plan.id === subscription.plan?.id
                      ? isArabic ? "الخطة الحالية" : "Current Plan"
                      : isArabic ? "التبديل إلى هذه الخطة" : "Switch to this plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
