import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { VpnConfig } from "@shared/schema";

export default function VpnPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    protocol: "OpenVPN",
    serverAddress: "",
    port: "1194",
    username: "",
    password: "",
  });

  const { data: vpnConfigs = [], isLoading } = useQuery<VpnConfig[]>({
    queryKey: ["/api/vpn"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/vpn", { ...formData, port: parseInt(formData.port) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vpn"] });
      setFormData({ name: "", description: "", protocol: "OpenVPN", serverAddress: "", port: "1194", username: "", password: "" });
      setIsAdding(false);
      toast({ title: "Success", description: "VPN configuration added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/vpn/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vpn"] });
      toast({ title: "Success", description: "VPN configuration deleted" });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.serverAddress || !formData.port) {
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
          <h1 className="text-3xl font-semibold mb-2">VPN Configurations</h1>
          <p className="text-muted-foreground">Manage VPN access settings</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} data-testid="button-add-vpn">
          <Plus className="mr-2 h-4 w-4" />
          Add VPN
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add VPN Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>VPN Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Office VPN" />
            </div>
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Input value={formData.protocol} onChange={(e) => setFormData({ ...formData, protocol: e.target.value })} placeholder="e.g., OpenVPN, WireGuard, IPSec" />
            </div>
            <div className="space-y-2">
              <Label>Server Address *</Label>
              <Input value={formData.serverAddress} onChange={(e) => setFormData({ ...formData, serverAddress: e.target.value })} placeholder="vpn.example.com" />
            </div>
            <div className="space-y-2">
              <Label>Port *</Label>
              <Input type="number" value={formData.port} onChange={(e) => setFormData({ ...formData, port: e.target.value })} placeholder="1194" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="VPN username" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="VPN password" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Configuration description" />
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

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <p className="text-muted-foreground">Loading VPN configs...</p>
        ) : vpnConfigs.length === 0 ? (
          <p className="text-muted-foreground">No VPN configurations</p>
        ) : (
          vpnConfigs.map((vpn) => (
            <Card key={vpn.id} data-testid={`card-vpn-${vpn.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{vpn.name}</CardTitle>
                  <Badge variant={vpn.isActive ? "default" : "secondary"}>{vpn.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Protocol: {vpn.protocol}</p>
                <p className="text-muted-foreground">Server: {vpn.serverAddress}:{vpn.port}</p>
                {vpn.username && <p className="text-muted-foreground">User: {vpn.username}</p>}
                {vpn.description && <p className="text-xs text-muted-foreground mt-2">{vpn.description}</p>}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(vpn.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-vpn-${vpn.id}`}>
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
