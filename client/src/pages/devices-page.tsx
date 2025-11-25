import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Device, Client } from "@shared/schema";

interface DeviceFormData {
  deviceName: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  clientId: number;
}

export default function DevicesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DeviceFormData>({
    deviceName: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    clientId: 0,
  });

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/devices"],
    queryFn: async () => {
      const res = await fetch("/api/devices");
      if (!res.ok) throw new Error("Failed to fetch devices");
      return res.json() as Promise<Device[]>;
    },
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json() as Promise<Client[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DeviceFormData) => {
      return apiRequest("POST", "/api/devices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device created successfully" });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating device",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DeviceFormData) => {
      if (!editingId) throw new Error("No device selected");
      return apiRequest("PATCH", `/api/devices/${editingId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device updated successfully" });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating device",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/devices/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting device",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      deviceName: "",
      serialNumber: "",
      model: "",
      manufacturer: "",
      clientId: 0,
    });
    setEditingId(null);
  };

  const handleEdit = (device: Device) => {
    setFormData({
      deviceName: device.deviceName,
      serialNumber: device.serialNumber || "",
      model: device.model || "",
      manufacturer: device.manufacturer || "",
      clientId: device.clientId,
    });
    setEditingId(device.id);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.deviceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Device name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (devicesLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  const getClientName = (clientId: number) => {
    return clients.find((c) => c.id === clientId)?.name || "Unknown";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Devices Management</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Device" : "Add New Device"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.clientId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clientId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="client" data-testid="select-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deviceName">Device Name *</Label>
                <Input
                  id="deviceName"
                  data-testid="input-device-name"
                  value={formData.deviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceName: e.target.value })
                  }
                  placeholder="Enter device name"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  data-testid="input-serial-number"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  placeholder="Enter serial number"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  data-testid="input-model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="Enter model"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  data-testid="input-manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  placeholder="Enter manufacturer"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  data-testid="button-submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No devices found
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device.id} data-testid={`row-device-${device.id}`}>
                  <TableCell className="font-medium">
                    {device.deviceName}
                  </TableCell>
                  <TableCell>{getClientName(device.clientId)}</TableCell>
                  <TableCell>{device.manufacturer || "-"}</TableCell>
                  <TableCell>{device.model || "-"}</TableCell>
                  <TableCell>{device.serialNumber || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(device)}
                        data-testid={`button-edit-device-${device.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this device?"
                            )
                          ) {
                            deleteMutation.mutate(device.id);
                          }
                        }}
                        data-testid={`button-delete-device-${device.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
