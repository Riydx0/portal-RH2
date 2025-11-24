import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage, t } from "@/lib/i18n";
import { Key, Download } from "lucide-react";

export default function RequestLicensePage() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [selectedSoftware, setSelectedSoftware] = useState<number | null>(null);

  const { data: software = [] } = useQuery({
    queryKey: ["/api/software"],
  });

  const { data: myLicenses = [], refetch: refetchLicenses } = useQuery({
    queryKey: ["/api/my-licenses"],
  });

  const requestMutation = useMutation({
    mutationFn: async (softwareId: number) => {
      return apiRequest("POST", "/api/license-requests", {
        softwareId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "License request submitted",
      });
      setSelectedSoftware(null);
      refetchLicenses();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to request license",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold">Request License</h1>
        <p className="text-muted-foreground">
          Request a license for software you need
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Available Software
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {software.length === 0 ? (
              <p className="text-muted-foreground">No software available</p>
            ) : (
              software.map((sw: any) => (
                <div
                  key={sw.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{sw.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sw.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Version: {sw.version}
                    </p>
                  </div>
                  <Button
                    onClick={() => requestMutation.mutate(sw.id)}
                    disabled={
                      requestMutation.isPending ||
                      myLicenses.some((lic: any) => lic.softwareId === sw.id)
                    }
                    className="ml-4"
                  >
                    {myLicenses.some((lic: any) => lic.softwareId === sw.id)
                      ? "Requested"
                      : "Request License"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {myLicenses && myLicenses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Licenses</h2>
          <div className="space-y-4">
            {myLicenses.map((license: any) => (
              <Card key={license.id} className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{license.softwareName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      License Key: {license.licenseKey}
                    </p>
                  </div>
                  <Badge
                    variant={
                      license.status === "available" ? "default" : "secondary"
                    }
                  >
                    {license.status}
                  </Badge>
                </CardHeader>
                {license.downloadUrl && (
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open(license.downloadUrl, "_blank")
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
