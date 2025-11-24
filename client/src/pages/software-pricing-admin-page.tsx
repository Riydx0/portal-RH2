import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit2, Trash2, Plus } from "lucide-react";

type Software = {
  id: number;
  name: string;
};

type SoftwarePricing = {
  id: number;
  softwareId: number;
  price: number;
  currency: string;
  licenseType: string | null;
  description: string | null;
  isActive: boolean;
};

export default function SoftwarePricingAdminPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    softwareId: "",
    price: 0,
    currency: "USD",
    licenseType: "annual",
    description: "",
  });

  const { data: software = [] } = useQuery({
    queryKey: ["/api/software"],
  });

  const { data: pricing = [], refetch } = useQuery({
    queryKey: ["/api/software-pricing"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/software-pricing", {
        softwareId: parseInt(data.softwareId),
        price: parseInt(data.price) * 100,
        currency: data.currency,
        licenseType: data.licenseType,
        description: data.description,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pricing added successfully",
      });
      refetch();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add pricing",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/software-pricing/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pricing deleted successfully",
      });
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      softwareId: "",
      price: 0,
      currency: "USD",
      licenseType: "annual",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Software Pricing</h1>
          <p className="text-muted-foreground">Set prices for individual software</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Software Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Software
                </label>
                <select
                  value={formData.softwareId}
                  onChange={(e) =>
                    setFormData({ ...formData, softwareId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Software</option>
                  {software.map((s: Software) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (USD)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  License Type
                </label>
                <select
                  value={formData.licenseType}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="annual">Annual</option>
                  <option value="perpetual">Perpetual</option>
                  <option value="subscription">Subscription</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency
                </label>
                <Input
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  placeholder="USD"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>

            <Button type="submit" disabled={createMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Current Pricing</h2>
        {pricing.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pricing configured yet
            </CardContent>
          </Card>
        ) : (
          pricing.map((item: SoftwarePricing) => {
            const softwareName = software.find(
              (s: Software) => s.id === item.softwareId
            )?.name;
            return (
              <Card key={item.id} className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{softwareName}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <Badge
                        variant={item.isActive ? "default" : "secondary"}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {item.licenseType && (
                        <p className="text-muted-foreground mt-1">
                          {item.licenseType}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {item.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
