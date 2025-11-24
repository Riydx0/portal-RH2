import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";
import { DollarSign } from "lucide-react";

type InvoiceData = {
  id: number;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isAdmin = user?.role === "admin";

  const { data: invoices = [], isLoading } = useQuery<InvoiceData[]>({
    queryKey: ["/api/invoices"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "sent":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "draft":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "overdue":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "cancelled":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('invoices', lang)}</h1>
        <p className="text-muted-foreground">View and manage system invoices</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover-elevate transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {formatDate(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {invoice.dueDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="text-sm">
                        {formatDate(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {invoice.paidDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-sm">
                        {formatDate(new Date(invoice.paidDate), 'MMM dd, yyyy')}
                      </p>
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
