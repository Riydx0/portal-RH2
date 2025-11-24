import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Eye, EyeOff, Code } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  isActive: boolean;
  rateLimit: number;
  lastUsed: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showSecret, setShowSecret] = useState<number | null>(null);
  const [keyName, setKeyName] = useState("");
  const [rateLimit, setRateLimit] = useState("1000");
  const [newKeyData, setNewKeyData] = useState<any>(null);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/dev/keys"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/dev/keys", {
        name: keyName,
        rateLimit: parseInt(rateLimit),
      });
    },
    onSuccess: (data) => {
      setNewKeyData(data);
      setKeyName("");
      setRateLimit("1000");
      queryClient.invalidateQueries({ queryKey: ["/api/dev/keys"] });
      toast({ title: "Success", description: "API key created successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/dev/keys/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev/keys"] });
      toast({ title: "Success", description: "API key deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/dev/keys/${id}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev/keys"] });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">API Keys</h1>
          <p className="text-muted-foreground">Manage your API keys for integrating with external systems</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-api-key">
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {newKeyData ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">Your API Key has been created</p>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-green-700 dark:text-green-300">Key</Label>
                      <div className="flex gap-2 mt-1">
                        <code className="flex-1 p-2 bg-white dark:bg-black rounded border text-xs font-mono break-all">
                          {newKeyData.key}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(newKeyData.key, "API Key")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-green-700 dark:text-green-300">Secret</Label>
                      <div className="flex gap-2 mt-1">
                        <code className="flex-1 p-2 bg-white dark:bg-black rounded border text-xs font-mono break-all">
                          {newKeyData.secret}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(newKeyData.secret, "Secret")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-3">
                    Save this secret securely. You won't be able to see it again.
                  </p>
                </div>
                <Button onClick={() => { setIsCreateOpen(false); setNewKeyData(null); }} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Key Name</Label>
                  <Input
                    placeholder="e.g., Production API"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    data-testid="input-api-key-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (requests/hour)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    data-testid="input-rate-limit"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !keyName}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>Created keys are listed below. Keep them secure!</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading keys...</p>
          ) : keys.length === 0 ? (
            <p className="text-muted-foreground">No API keys yet. Create one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-1 rounded">
                          {key.key.substring(0, 10)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key, "Key")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{key.rateLimit}</TableCell>
                    <TableCell>
                      <Badge variant={key.isActive ? "default" : "secondary"}>
                        {key.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleMutation.mutate(key.id)}
                          data-testid={`button-toggle-key-${key.id}`}
                        >
                          {key.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(key.id)}
                          data-testid={`button-delete-key-${key.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <code className="block bg-muted p-3 rounded text-sm font-mono">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Endpoints</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><code className="bg-muted px-2 py-1 rounded">GET /api/public/software</code> - List all software</li>
              <li><code className="bg-muted px-2 py-1 rounded">GET /api/public/categories</code> - List categories</li>
              <li><code className="bg-muted px-2 py-1 rounded">GET /api/public/licenses</code> - List licenses</li>
              <li><code className="bg-muted px-2 py-1 rounded">POST /api/public/download</code> - Share download</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">
              Your API key has a rate limit of {keys[0]?.rateLimit || 1000} requests per hour.
              Rate limit information is included in response headers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
