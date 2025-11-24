import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { useLanguage, t } from "@/lib/i18n";

type Plan = {
  id: number;
  name: string;
  plan: string;
  price: number;
  maxUsers: number | null;
  maxSoftware: number | null;
  maxStorage: number | null;
  features: string[];
  isActive: boolean;
};

export default function SubscriptionPlansPage() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    plan: "basic",
    price: 0,
    maxUsers: null as number | null,
    maxSoftware: null as number | null,
    maxStorage: null as number | null,
    features: "",
  });

  const { data: plans = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const features = data.features
        .split("\n")
        .filter((f: string) => f.trim());
      return apiRequest("POST", "/api/subscription-plans", {
        ...data,
        price: parseInt(data.price) * 100,
        maxUsers: data.maxUsers ? parseInt(data.maxUsers) : null,
        maxSoftware: data.maxSoftware ? parseInt(data.maxSoftware) : null,
        maxStorage: data.maxStorage ? parseInt(data.maxStorage) : null,
        features,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const features = data.features
        .split("\n")
        .filter((f: string) => f.trim());
      return apiRequest("PATCH", `/api/subscription-plans/${editingId}`, {
        ...data,
        price: parseInt(data.price) * 100,
        maxUsers: data.maxUsers ? parseInt(data.maxUsers) : null,
        maxSoftware: data.maxSoftware ? parseInt(data.maxSoftware) : null,
        maxStorage: data.maxStorage ? parseInt(data.maxStorage) : null,
        features,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
      refetch();
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/subscription-plans/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      plan: "basic",
      price: 0,
      maxUsers: null,
      maxSoftware: null,
      maxStorage: null,
      features: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan: Plan) => {
    setFormData({
      name: plan.name,
      plan: plan.plan,
      price: plan.price / 100,
      maxUsers: plan.maxUsers,
      maxSoftware: plan.maxSoftware,
      maxStorage: plan.maxStorage,
      features: Array.isArray(plan.features)
        ? plan.features.join("\n")
        : String(plan.features),
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage your SaaS pricing tiers</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Plan
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Plan" : "Create New Plan"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plan Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Basic"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plan Type
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) =>
                      setFormData({ ...formData, plan: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (USD/month)
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
                    placeholder="29"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Users
                  </label>
                  <Input
                    type="number"
                    value={formData.maxUsers || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsers: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Software
                  </label>
                  <Input
                    type="number"
                    value={formData.maxSoftware || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSoftware: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Storage (MB)
                  </label>
                  <Input
                    type="number"
                    value={formData.maxStorage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxStorage: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Features (one per line)
                </label>
                <Textarea
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  placeholder="10 Employees&#10;50 Software Items&#10;Basic Support"
                  rows={5}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan: Plan) => (
            <Card key={plan.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ${plan.price / 100}/month
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {plan.maxUsers && (
                    <div>
                      <p className="text-muted-foreground">Max Users</p>
                      <p className="font-semibold">{plan.maxUsers}</p>
                    </div>
                  )}
                  {plan.maxSoftware && (
                    <div>
                      <p className="text-muted-foreground">Max Software</p>
                      <p className="font-semibold">{plan.maxSoftware}</p>
                    </div>
                  )}
                  {plan.maxStorage && (
                    <div>
                      <p className="text-muted-foreground">Max Storage</p>
                      <p className="font-semibold">
                        {plan.maxStorage} MB
                      </p>
                    </div>
                  )}
                </div>
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Features:
                    </p>
                    <ul className="space-y-1">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
