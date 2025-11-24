import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage, t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

type SoftwarePricingData = {
  id: number;
  softwareId: number;
  price: number;
  currency: string;
  licenseType: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function SoftwarePricingPage() {
  const { lang } = useLanguage();

  const { data: pricing = [], isLoading } = useQuery<SoftwarePricingData[]>({
    queryKey: ["/api/software-pricing"],
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('softwarePricing', lang)}</h1>
        <p className="text-muted-foreground">View software pricing and licensing information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="text-center py-8 col-span-full">Loading...</div>
        ) : pricing.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pricing information found</p>
            </CardContent>
          </Card>
        ) : (
          pricing.map((item) => (
            <Card key={item.id} className="hover-elevate transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Software #{item.softwareId}</CardTitle>
                  {item.isActive ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-500/10">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(item.price, item.currency)}
                    </p>
                  </div>
                  {item.licenseType && (
                    <div>
                      <p className="text-sm text-muted-foreground">License Type</p>
                      <p className="text-sm capitalize">{item.licenseType}</p>
                    </div>
                  )}
                  {item.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{item.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
