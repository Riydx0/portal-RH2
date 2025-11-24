import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { License, InsertLicense, Software } from "@shared/schema";
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
import { Key, Plus, Pencil, Trash2, Search, Copy, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

type LicenseWithSoftware = License & {
  software: Software;
};

export default function LicensesPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseWithSoftware | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<InsertLicense>({
    softwareId: 0,
    licenseKey: "",
    assignedTo: "",
    notes: "",
    status: "available",
  });

  const { data: licenses, isLoading } = useQuery<LicenseWithSoftware[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: software } = useQuery<Software[]>({
    queryKey: ["/api/software"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLicense) => {
      const res = await apiRequest("POST", "/api/licenses", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "License created successfully",
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLicense> }) => {
      const res = await apiRequest("PATCH", `/api/licenses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      setIsEditOpen(false);
      setSelectedLicense(null);
      resetForm();
      toast({
        title: "Success",
        description: "License updated successfully",
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
      await apiRequest("DELETE", `/api/licenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      setIsDeleteOpen(false);
      setSelectedLicense(null);
      toast({
        title: "Success",
        description: "License deleted successfully",
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
      softwareId: 0,
      licenseKey: "",
      assignedTo: "",
      notes: "",
      status: "available",
    });
  };

  const handleCreate = () => {
    setIsCreateOpen(true);
    resetForm();
  };

  const handleEdit = (license: LicenseWithSoftware) => {
    setSelectedLicense(license);
    setFormData({
      softwareId: license.softwareId,
      licenseKey: license.licenseKey,
      assignedTo: license.assignedTo || "",
      notes: license.notes || "",
      status: license.status,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (license: LicenseWithSoftware) => {
    setSelectedLicense(license);
    setIsDeleteOpen(true);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied",
      description: "License key copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      available: { className: "bg-green-500 hover:bg-green-600" },
      "in-use": { className: "bg-blue-500 hover:bg-blue-600" },
      expired: { className: "bg-red-500 hover:bg-red-600" },
    };
    return variants[status] || variants.available;
  };

  const filteredLicenses = licenses?.filter((lic) =>
    lic.software.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lic.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lic.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Licenses</h1>
          <p className="text-muted-foreground">Manage software licenses and keys</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-license">
          <Plus className="mr-2 h-4 w-4" />
          Add License
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {licenses?.filter((l) => l.status === "available").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {licenses?.filter((l) => l.status === "in-use").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {licenses?.filter((l) => l.status === "expired").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Licenses</CardTitle>
          <CardDescription>
            {licenses?.length || 0} {licenses?.length === 1 ? "license" : "licenses"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search licenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-licenses"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredLicenses && filteredLicenses.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>License Key</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((lic) => (
                    <TableRow key={lic.id} data-testid={`license-row-${lic.id}`}>
                      <TableCell className="font-medium">{lic.software.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {lic.licenseKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(lic.licenseKey, lic.id)}
                            data-testid={`button-copy-${lic.id}`}
                          >
                            {copiedId === lic.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lic.assignedTo || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge {...getStatusBadge(lic.status)} className="text-white">
                          {lic.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(lic)}
                            data-testid={`button-edit-${lic.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(lic)}
                            data-testid={`button-delete-${lic.id}`}
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
              <Key className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No licenses found</p>
              <p className="text-sm mt-2">
                {searchTerm ? "Try adjusting your search" : "Create your first license to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add License</DialogTitle>
            <DialogDescription>Create a new software license</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-software">Software *</Label>
              <Select
                value={formData.softwareId.toString()}
                onValueChange={(val) => setFormData({ ...formData, softwareId: parseInt(val) })}
              >
                <SelectTrigger id="create-software" data-testid="select-software">
                  <SelectValue placeholder="Select software" />
                </SelectTrigger>
                <SelectContent>
                  {software?.map((sw) => (
                    <SelectItem key={sw.id} value={sw.id.toString()}>
                      {sw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-key">License Key *</Label>
              <Input
                id="create-key"
                value={formData.licenseKey}
                onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                className="font-mono"
                data-testid="input-license-key"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-assigned">Assigned To</Label>
                <Input
                  id="create-assigned"
                  value={formData.assignedTo || ""}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Client or device name"
                  data-testid="input-assigned-to"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: "available" | "in-use" | "expired") =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="create-status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-notes">Notes</Label>
              <Textarea
                id="create-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                data-testid="input-notes"
              />
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
              disabled={!formData.softwareId || !formData.licenseKey || createMutation.isPending}
              data-testid="button-submit-create"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit License</DialogTitle>
            <DialogDescription>Update license details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-software">Software *</Label>
              <Select
                value={formData.softwareId.toString()}
                onValueChange={(val) => setFormData({ ...formData, softwareId: parseInt(val) })}
              >
                <SelectTrigger id="edit-software" data-testid="select-edit-software">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {software?.map((sw) => (
                    <SelectItem key={sw.id} value={sw.id.toString()}>
                      {sw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-key">License Key *</Label>
              <Input
                id="edit-key"
                value={formData.licenseKey}
                onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                className="font-mono"
                data-testid="input-edit-key"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assigned">Assigned To</Label>
                <Input
                  id="edit-assigned"
                  value={formData.assignedTo || ""}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  data-testid="input-edit-assigned"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: "available" | "in-use" | "expired") =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="edit-status" data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                data-testid="input-edit-notes"
              />
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
                selectedLicense &&
                updateMutation.mutate({ id: selectedLicense.id, data: formData })
              }
              disabled={!formData.softwareId || !formData.licenseKey || updateMutation.isPending}
              data-testid="button-submit-edit"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete License?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this license for "{selectedLicense?.software.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedLicense && deleteMutation.mutate(selectedLicense.id)}
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
