import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, RefreshCw, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

type UpdateSchedule = {
  enabled: boolean;
  days: number[];
  hours: number[];
};

type UpdateStatus = {
  lastUpdate: string;
  version: string;
  status: "success" | "pending" | "error";
};

export default function UpdatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [openDialog, setOpenDialog] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [tempDays, setTempDays] = useState<number[]>([]);
  const [tempHours, setTempHours] = useState<number[]>([]);

  const days = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, "0")}:00`,
  }));

  const { data: schedule, isLoading: scheduleLoading } = useQuery<UpdateSchedule>({
    queryKey: ["/api/admin/update-schedule"],
  });

  const { data: status, isLoading: statusLoading } = useQuery<UpdateStatus>({
    queryKey: ["/api/admin/update-status"],
  });

  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.enabled);
      setSelectedDays(schedule.days);
      setSelectedHours(schedule.hours);
    }
  }, [schedule]);

  const checkUpdatesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/check-updates", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/update-status"] });
      toast({
        title: "Success",
        description: "Checking for updates...",
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

  const updateScheduleMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/admin/update-schedule", {
        enabled: tempEnabled,
        days: tempDays,
        hours: tempHours,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/update-schedule"] });
      toast({
        title: "Success",
        description: "Update schedule saved",
      });
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [tempEnabled, setTempEnabled] = useState(enabled);

  const handleOpenDialog = () => {
    setTempDays(selectedDays);
    setTempHours(selectedHours);
    setTempEnabled(enabled);
    setOpenDialog(true);
  };

  const handleToggleDay = (day: number) => {
    setTempDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleHour = (hour: number) => {
    setTempHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    );
  };

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  const formatDays = () => {
    if (selectedDays.length === 0) return "No days selected";
    if (selectedDays.length === 7) return "Every day";
    return selectedDays
      .map((d) => days.find((day) => day.value === d)?.label)
      .join(", ");
  };

  const formatHours = () => {
    if (selectedHours.length === 0) return "No times selected";
    return selectedHours.map((h) => `${String(h).padStart(2, "0")}:00`).join(", ");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Updates</h1>
        <p className="text-muted-foreground">
          Manage platform and application updates
        </p>
      </div>

      {/* Update Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Last Update</CardTitle>
              <CardDescription>Status of the most recent update</CardDescription>
            </div>
            {status && (
              <Badge variant="outline" className="flex gap-2 items-center">
                {status.status === "success" && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {status.status === "pending" && (
                  <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
                )}
                {status.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="capitalize">{status.status}</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(status.lastUpdate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Version</p>
                  <p className="font-semibold">{status.version}</p>
                </div>
              </div>
            </>
          )}
          <Button
            onClick={() => checkUpdatesMutation.mutate()}
            disabled={checkUpdatesMutation.isPending}
            className="w-full"
            data-testid="button-check-updates"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {checkUpdatesMutation.isPending ? "Checking..." : "Check for updates"}
          </Button>
        </CardContent>
      </Card>

      {/* Update Schedule Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Update Schedule</CardTitle>
              <CardDescription>
                Platform and app updates are applied on the configured schedule
              </CardDescription>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenDialog}
                  data-testid="button-edit-schedule"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configure Automatic Update Schedule</DialogTitle>
                  <DialogDescription>
                    Set the days and times for automatic platform and app updates. Ensure this
                    schedule doesn't overlap with backup schedules.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Enable/Disable Radio */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Automatic Updates</Label>
                    <RadioGroup
                      value={tempEnabled ? "enabled" : "disabled"}
                      onValueChange={(val) => setTempEnabled(val === "enabled")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disabled" id="disabled" />
                        <Label htmlFor="disabled" className="font-normal cursor-pointer">
                          Disable automatic updates
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enabled" id="enabled" />
                        <Label htmlFor="enabled" className="font-normal cursor-pointer">
                          Enable automatic updates
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {tempEnabled && (
                    <>
                      {/* Days Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Days</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {days.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => handleToggleDay(day.value)}
                              className={`p-2 rounded-md border transition-colors ${
                                tempDays.includes(day.value)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-input hover:bg-accent"
                              }`}
                              data-testid={`button-day-${day.value}`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hours Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Hours</Label>
                        <Select
                          value={tempHours.length.toString()}
                          onValueChange={(val) => {
                            const count = parseInt(val);
                            // Set first 'count' hours
                            setTempHours(Array.from({ length: count }, (_, i) => i));
                          }}
                        >
                          <SelectTrigger data-testid="select-hours">
                            <SelectValue placeholder="Select hours" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 25 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i} selected
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {tempHours.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {formatHours()}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateScheduleMutation.mutate()}
                    disabled={updateScheduleMutation.isPending}
                    data-testid="button-save-schedule"
                  >
                    {updateScheduleMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Days</p>
            <p className="font-semibold">{formatDays()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Times</p>
            <p className="font-semibold">{formatHours()}</p>
          </div>
          <div className="pt-2">
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Automatic updates enabled" : "Automatic updates disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
