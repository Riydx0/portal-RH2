import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Software, InsertSoftware, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Plus, Pencil, Trash2, Search, Upload, Download, ExternalLink, Share2, Copy, Check, Lock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SoftwareWithCategory = Software & {
  category: Category;
};

export default function SoftwarePage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareWithCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedSoftwareForShare, setSelectedSoftwareForShare] = useState<SoftwareWithCategory | null>(null);
  const [shareFormData, setShareFormData] = useState({
    password: "",
    note: "",
    expiresAt: "",
    withPassword: false,
    withExpiration: false,
  });
  const [formData, setFormData] = useState<InsertSoftware & { filePath?: string; fileSize?: number; isShared?: boolean }>({
    name: "",
    categoryId: 0,
    description: "",
    downloadUrl: "",
    version: "",
    platform: "Both",
    isActive: true,
    isShared: false,
  });

  const { data: software, isLoading } = useQuery<SoftwareWithCategory[]>({
    queryKey: ["/api/software"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const shareMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create share link");
      return response.json();
    },
    onSuccess: (data) => {
      setShareData(data);
      toast({
        title: "Public link created!",
        description: "Share the code or link with others",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShare = (sw: SoftwareWithCategory) => {
    if (!sw.filePath) {
      toast({
        title: "Error",
        description: "Software must have an uploaded file to share",
        variant: "destructive",
      });
      return;
    }
    setSelectedSoftwareForShare(sw);
    setShareFormData({
      password: "",
      note: "",
      expiresAt: "",
      withPassword: false,
      withExpiration: false,
    });
    setShareData(null);
    setCopiedCode(false);
    setIsShareOpen(true);
  };

  const handleCreatePublicLink = () => {
    if (!selectedSoftwareForShare) return;
    shareMutation.mutate({
      softwareId: selectedSoftwareForShare.id,
      password: shareFormData.withPassword ? shareFormData.password : null,
      note: shareFormData.note || null,
      expiresAt: shareFormData.withExpiration ? shareFormData.expiresAt : null,
      permissions: "download",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({ title: "Copied!" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (): Promise<{ filename: string; size: number } | null> => {
    if (!selectedFile) return null;

    setUploadProgress(true);
    try {
      const fileFormData = new FormData();
      fileFormData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: fileFormData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      setUploadProgress(false);
      return { filename: data.filename, size: data.size };
    } catch (error: any) {
      setUploadProgress(false);
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertSoftware & { filePath?: string; fileSize?: number }) => {
      let uploadData = data;

      if (selectedFile) {
        const uploadResult = await uploadFile();
        if (uploadResult) {
          uploadData = {
            ...data,
            filePath: uploadResult.filename,
            fileSize: uploadResult.size,
          };
        }
      }

      const res = await apiRequest("POST", "/api/software", uploadData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/software"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Software created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSoftware> & { filePath?: string; fileSize?: number } }) => {
      let uploadData = data;

      if (selectedFile) {
        const uploadResult = await uploadFile();
        if (uploadResult) {
          uploadData = {
            ...data,
            filePath: uploadResult.filename,
            fileSize: uploadResult.size,
          };
        }
      }

      const res = await apiRequest("PATCH", `/api/software/${id}`, uploadData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/software"] });
      setIsEditOpen(false);
      setSelectedSoftware(null);
      resetForm();
      toast({
        title: "Success",
        description: "Software updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/software/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/software"] });
      setIsDeleteOpen(false);
      setSelectedSoftware(null);
      toast({
        title: "Success",
        description: "Software deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: 0,
      description: "",
      downloadUrl: "",
      version: "",
      platform: "Both",
      isActive: true,
      isShared: false,
    });
    setSelectedFile(null);
  };

  const handleCreate = () => {
    setIsCreateOpen(true);
    resetForm();
  };

  const handleEdit = (sw: SoftwareWithCategory) => {
    setSelectedSoftware(sw);
    setFormData({
      name: sw.name,
      categoryId: sw.categoryId,
      description: sw.description || "",
      downloadUrl: sw.downloadUrl || "",
      filePath: sw.filePath || "",
      fileSize: sw.fileSize || 0,
      version: sw.version || "",
      platform: sw.platform,
      isActive: sw.isActive,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (sw: SoftwareWithCategory) => {
    setSelectedSoftware(sw);
    setIsDeleteOpen(true);
  };

  const handleDownload = (software: SoftwareWithCategory) => {
    if (software.filePath) {
      const link = document.createElement("a");
      link.href = `/api/download/${software.filePath}`;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (software.downloadUrl) {
      window.open(software.downloadUrl, "_blank");
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  const filteredSoftware = software?.filter((sw) =>
    sw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sw.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Software</h1>
          <p className="text-muted-foreground">Manage software applications</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-software">
          <Plus className="mr-2 h-4 w-4" />
          Add Software
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Software</CardTitle>
          <CardDescription>
            {software?.length || 0} {software?.length === 1 ? 'item' : 'items'} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search software..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-software"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredSoftware && filteredSoftware.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSoftware.map((sw) => (
                    <TableRow key={sw.id} data-testid={`software-row-${sw.id}`}>
                      <TableCell className="font-medium">{sw.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sw.category.name}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {sw.version || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sw.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatFileSize(sw.fileSize)}
                      </TableCell>
                      <TableCell>
                        {sw.isActive ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(sw.filePath || sw.downloadUrl) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(sw)}
                              data-testid={`button-download-${sw.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {sw.filePath && sw.isShared ? (
                            sw.shareCode ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = `${window.location.origin}/download/${sw.shareCode}`;
                                  navigator.clipboard.writeText(link);
                                  toast({ title: "Share link copied!" });
                                }}
                                data-testid={`button-quick-share-${sw.id}`}
                                title="Copy share link"
                              >
                                <Share2 className="h-4 w-4 text-blue-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare(sw)}
                                data-testid={`button-share-${sw.id}`}
                                title="Create a shareable link with secret code"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            )
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(sw)}
                            data-testid={`button-edit-${sw.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(sw)}
                            data-testid={`button-delete-${sw.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <HardDrive className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No software found</p>
              <p className="text-sm mt-2">
                {searchTerm ? "Try adjusting your search" : "Create your first software item to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Create Public Link
            </DialogTitle>
            <DialogDescription>{selectedSoftwareForShare?.name}</DialogDescription>
          </DialogHeader>

          {!shareData ? (
            <div className="space-y-4">
              {/* Password Protection */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="with-password"
                    checked={shareFormData.withPassword}
                    onCheckedChange={(checked) =>
                      setShareFormData({ ...shareFormData, withPassword: checked as boolean })
                    }
                    data-testid="checkbox-password"
                  />
                  <Label htmlFor="with-password" className="cursor-pointer">Set password</Label>
                </div>
                {shareFormData.withPassword && (
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={shareFormData.password}
                    onChange={(e) =>
                      setShareFormData({ ...shareFormData, password: e.target.value })
                    }
                    data-testid="input-share-password"
                  />
                )}
              </div>

              {/* Note to Recipient */}
              <div className="space-y-2">
                <Label htmlFor="note">Note to recipient (optional)</Label>
                <Input
                  id="note"
                  placeholder="Add a message..."
                  value={shareFormData.note}
                  onChange={(e) =>
                    setShareFormData({ ...shareFormData, note: e.target.value })
                  }
                  data-testid="input-share-note"
                />
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="with-expiration"
                    checked={shareFormData.withExpiration}
                    onCheckedChange={(checked) =>
                      setShareFormData({ ...shareFormData, withExpiration: checked as boolean })
                    }
                    data-testid="checkbox-expiration"
                  />
                  <Label htmlFor="with-expiration" className="cursor-pointer">Set expiration date</Label>
                </div>
                {shareFormData.withExpiration && (
                  <Input
                    type="datetime-local"
                    value={shareFormData.expiresAt}
                    onChange={(e) =>
                      setShareFormData({ ...shareFormData, expiresAt: e.target.value })
                    }
                    data-testid="input-share-expires"
                  />
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsShareOpen(false)}
                  data-testid="button-cancel-share"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePublicLink}
                  disabled={shareMutation.isPending || (shareFormData.withPassword && !shareFormData.password)}
                  data-testid="button-create-link"
                >
                  {shareMutation.isPending ? "Creating..." : "Create Link"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Secret Code */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Secret Code</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-muted rounded border font-mono text-center tracking-widest">
                    {shareData.secretCode}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(shareData.secretCode)}
                    data-testid="button-copy-secret"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Share Link</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-muted rounded border text-xs break-all">
                    {`${window.location.origin}/download/${shareData.secretCode}`}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(`${window.location.origin}/download/${shareData.secretCode}`)
                    }
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              {shareFormData.withPassword && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🔐 Password protected - recipient must enter the password to download
                  </p>
                </div>
              )}
              {shareFormData.withExpiration && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    ⏰ Expires on {new Date(shareFormData.expiresAt).toLocaleString()}
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setIsShareOpen(false)} data-testid="button-done-share">
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Software</DialogTitle>
            <DialogDescription>Create a new software item</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Microsoft Office 365"
                  data-testid="input-software-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-category">Category *</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: parseInt(val) })}
                >
                  <SelectTrigger id="create-category" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-version">Version</Label>
                <Input
                  id="create-version"
                  value={formData.version || ""}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 2024"
                  data-testid="input-software-version"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(val: "Windows" | "Mac" | "Both") =>
                    setFormData({ ...formData, platform: val })
                  }
                >
                  <SelectTrigger id="create-platform" data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Windows">Windows</SelectItem>
                    <SelectItem value="Mac">Mac</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Label>
              <Input
                id="create-file"
                type="file"
                onChange={handleFileChange}
                data-testid="input-software-file"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-url" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                External Download URL (optional)
              </Label>
              <Input
                id="create-url"
                value={formData.downloadUrl || ""}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                placeholder="https://..."
                data-testid="input-software-url"
              />
              <p className="text-xs text-muted-foreground">
                Use this if you want to link to an external download location instead of uploading a file
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                data-testid="input-software-description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="create-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-software-active"
              />
              <Label htmlFor="create-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="create-shared"
                checked={formData.isShared || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isShared: checked })}
                data-testid="switch-software-shared"
              />
              <Label htmlFor="create-shared">Enable Public Sharing</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || !formData.categoryId || createMutation.isPending || uploadProgress}
              data-testid="button-submit-create"
            >
              {uploadProgress ? "Uploading..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Software</DialogTitle>
            <DialogDescription>Update software details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: parseInt(val) })}
                >
                  <SelectTrigger id="edit-category" data-testid="select-edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-version">Version</Label>
                <Input
                  id="edit-version"
                  value={formData.version || ""}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  data-testid="input-edit-version"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(val: "Windows" | "Mac" | "Both") =>
                    setFormData({ ...formData, platform: val })
                  }
                >
                  <SelectTrigger id="edit-platform" data-testid="select-edit-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Windows">Windows</SelectItem>
                    <SelectItem value="Mac">Mac</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.filePath && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Current File</p>
                <p className="text-sm text-muted-foreground">
                  {formData.filePath} ({formatFileSize(formData.fileSize)})
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload New File (optional)
              </Label>
              <Input
                id="edit-file"
                type="file"
                onChange={handleFileChange}
                data-testid="input-edit-file"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                External Download URL (optional)
              </Label>
              <Input
                id="edit-url"
                value={formData.downloadUrl || ""}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                data-testid="input-edit-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-edit-active"
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-shared"
                checked={formData.isShared || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isShared: checked })}
                data-testid="switch-edit-shared"
              />
              <Label htmlFor="edit-shared">Enable Public Sharing</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedSoftware &&
                updateMutation.mutate({ id: selectedSoftware.id, data: formData })
              }
              disabled={!formData.name || !formData.categoryId || updateMutation.isPending || uploadProgress}
              data-testid="button-submit-edit"
            >
              {uploadProgress ? "Uploading..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Software?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSoftware?.name}"? This will also delete all
              associated licenses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSoftware && deleteMutation.mutate(selectedSoftware.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
