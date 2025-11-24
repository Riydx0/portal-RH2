import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Wifi } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Network } from "@shared/schema";

export default function NetworksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", ipRange: "", gateway: "", dns: "" });

  const { data: networks = [], isLoading } = useQuery<Network[]>({
    queryKey: ["/api/networks"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/networks", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      setFormData({ name: "", description: "", ipRange: "", gateway: "", dns: "" });
      setIsAdding(false);
      toast({ title: "Success", description: "Network added successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/networks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      toast({ title: "Success", description: "Network deleted successfully" });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.ipRange) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    addMutation.mutate();
  };

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Networks</h1>
          <p className="text-muted-foreground">Manage network configurations</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} data-testid="button-add-network">
          <Plus className="mr-2 h-4 w-4" />
          Add Network
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Network Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Network Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Main Office Network" />
            </div>
            <div className="space-y-2">
              <Label>IP Range *</Label>
              <Input value={formData.ipRange} onChange={(e) => setFormData({ ...formData, ipRange: e.target.value })} placeholder="e.g., 192.168.1.0/24" />
            </div>
            <div className="space-y-2">
              <Label>Gateway</Label>
              <Input value={formData.gateway} onChange={(e) => setFormData({ ...formData, gateway: e.target.value })} placeholder="e.g., 192.168.1.1" />
            </div>
            <div className="space-y-2">
              <Label>DNS</Label>
              <Input value={formData.dns} onChange={(e) => setFormData({ ...formData, dns: e.target.value })} placeholder="e.g., 8.8.8.8, 8.8.4.4" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Network description" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-muted-foreground">Loading networks...</p>
        ) : networks.length === 0 ? (
          <p className="text-muted-foreground">No networks configured</p>
        ) : (
          networks.map((network) => (
            <Card key={network.id} data-testid={`card-network-${network.id}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{network.name}</CardTitle>
                </div>
                <Badge variant={network.status === "active" ? "default" : "secondary"}>{network.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">IP: {network.ipRange}</p>
                {network.gateway && <p className="text-muted-foreground">Gateway: {network.gateway}</p>}
                {network.dns && <p className="text-muted-foreground">DNS: {network.dns}</p>}
                {network.description && <p className="text-xs text-muted-foreground mt-2">{network.description}</p>}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(network.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-network-${network.id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
