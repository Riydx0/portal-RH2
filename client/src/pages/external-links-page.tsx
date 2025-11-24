import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink as ExternalLinkIcon, Plus, Trash2, Edit2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { ExternalLink } from "@shared/schema";

export default function ExternalLinksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", url: "", icon: "", description: "" });

  const { data: links = [], isLoading } = useQuery<ExternalLink[]>({
    queryKey: ["/api/external-links"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/external-links", {
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        icon: formData.icon || "ExternalLink",
        order: links.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setFormData({ title: "", url: "", icon: "", description: "" });
      setIsAdding(false);
      toast({
        title: "Success",
        description: "Link added successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/external-links/${editingId}`, {
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        icon: formData.icon || "ExternalLink",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setFormData({ title: "", url: "", icon: "", description: "" });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/external-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    },
  });

  const handleEdit = (link: ExternalLink) => {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || "",
      icon: link.icon || "ExternalLink",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">External Links</h1>
          <p className="text-muted-foreground">Manage external links displayed on dashboard</p>
        </div>
        <Button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            setFormData({ title: "", url: "", icon: "", description: "" });
          }}
          data-testid="button-add-external-link"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </div>

      {isAdding || editingId ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Link" : "Add New Link"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Link title"
                data-testid="input-link-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                data-testid="input-link-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this link"
                data-testid="input-link-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name (optional)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="ExternalLink"
                data-testid="input-link-icon"
              />
              <p className="text-xs text-muted-foreground">Icon name from lucide-react</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={addMutation.isPending || updateMutation.isPending}
                data-testid="button-save-link"
              >
                {addMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ title: "", url: "", icon: "" });
                }}
                data-testid="button-cancel-link"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-muted-foreground">Loading links...</p>
        ) : links.length === 0 ? (
          <p className="text-muted-foreground">No external links configured yet</p>
        ) : (
          links.map((link) => (
            <Card key={link.id} data-testid={`card-link-${link.id}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <ExternalLinkIcon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground truncate" data-testid={`text-link-url-${link.id}`}>
                  {link.url}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(link)}
                    data-testid={`button-edit-link-${link.id}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(link.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-link-${link.id}`}
                  >
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
