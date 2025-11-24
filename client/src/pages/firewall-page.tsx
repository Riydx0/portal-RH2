import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { FirewallRule } from "@shared/schema";

export default function FirewallPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    action: "allow",
    sourceIp: "",
    destinationIp: "",
    port: "",
    protocol: "TCP",
    priority: "100",
  });

  const { data: rules = [], isLoading } = useQuery<FirewallRule[]>({
    queryKey: ["/api/firewall"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/firewall", { ...formData, priority: parseInt(formData.priority) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firewall"] });
      setFormData({ name: "", description: "", action: "allow", sourceIp: "", destinationIp: "", port: "", protocol: "TCP", priority: "100" });
      setIsAdding(false);
      toast({ title: "Success", description: "Firewall rule added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/firewall/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firewall"] });
      toast({ title: "Success", description: "Firewall rule deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const rule = rules.find(r => r.id === id);
      return apiRequest("PATCH", `/api/firewall/${id}`, { isEnabled: !rule?.isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firewall"] });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.action) {
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
          <h1 className="text-3xl font-semibold mb-2">Firewall Rules</h1>
          <p className="text-muted-foreground">Configure firewall settings and rules</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} data-testid="button-add-firewall-rule">
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Firewall Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Allow SSH from office" />
            </div>
            <div className="space-y-2">
              <Label>Action *</Label>
              <select value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                <option value="allow">Allow</option>
                <option value="deny">Deny</option>
                <option value="log">Log</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Source IP</Label>
              <Input value={formData.sourceIp} onChange={(e) => setFormData({ ...formData, sourceIp: e.target.value })} placeholder="e.g., 192.168.1.0/24" />
            </div>
            <div className="space-y-2">
              <Label>Destination IP</Label>
              <Input value={formData.destinationIp} onChange={(e) => setFormData({ ...formData, destinationIp: e.target.value })} placeholder="e.g., 10.0.0.0/8" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input value={formData.port} onChange={(e) => setFormData({ ...formData, port: e.target.value })} placeholder="e.g., 22, 80, 443" />
            </div>
            <div className="space-y-2">
              <Label>Protocol</Label>
              <select value={formData.protocol} onChange={(e) => setFormData({ ...formData, protocol: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                <option>TCP</option>
                <option>UDP</option>
                <option>ICMP</option>
                <option>All</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Rule description" />
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

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">Loading firewall rules...</p>
        ) : rules.length === 0 ? (
          <p className="text-muted-foreground">No firewall rules configured</p>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} data-testid={`card-firewall-${rule.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge variant={rule.action === "allow" ? "default" : rule.action === "deny" ? "destructive" : "secondary"}>{rule.action}</Badge>
                      <Badge variant={rule.isEnabled ? "default" : "secondary"}>{rule.isEnabled ? "Enabled" : "Disabled"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rule.sourceIp && `From: ${rule.sourceIp}`} {rule.destinationIp && `To: ${rule.destinationIp}`} {rule.port && `Port: ${rule.port}`} {rule.protocol && `Protocol: ${rule.protocol}`}
                    </p>
                    {rule.description && <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate(rule.id)} disabled={toggleMutation.isPending} data-testid={`button-toggle-firewall-${rule.id}`}>
                      {rule.isEnabled ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(rule.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-firewall-${rule.id}`}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
