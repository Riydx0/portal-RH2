import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, RefreshCw, QrCode as QRIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { VpnConfig } from "@shared/schema";

export default function WireGuardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [selectedVpn, setSelectedVpn] = useState<number | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [serverKeys, setServerKeys] = useState({ privateKey: "", publicKey: "" });
  const [clientKeys, setClientKeys] = useState({ privateKey: "", publicKey: "" });
  const [serverConfig, setServerConfig] = useState("");
  const [clientConfig, setClientConfig] = useState("");
  const [qrCode, setQrCode] = useState("");

  const { data: vpnConfigs = [] } = useQuery<VpnConfig[]>({
    queryKey: ["/api/vpn"],
  });

  const generateServerKeysMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/vpn/${selectedVpn}/generate-keys`, {});
      return response;
    },
    onSuccess: (data) => {
      setServerKeys(data);
      toast({ title: "Success", description: "Server keys generated" });
    },
  });

  const generateClientKeysMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/vpn/${selectedVpn}/generate-keys`, {});
      return response;
    },
    onSuccess: (data) => {
      setClientKeys(data);
      toast({ title: "Success", description: "Client keys generated" });
    },
  });

  const generateServerConfigMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/vpn/${selectedVpn}/generate-config`, {
        serverName: vpnConfigs.find((v) => v.id === selectedVpn)?.name,
        privateKey: serverKeys.privateKey,
        clientPublicKey: clientKeys.publicKey,
      });
      return response.config;
    },
    onSuccess: (config) => {
      setServerConfig(config);
      toast({ title: "Success", description: "Server config generated" });
    },
  });

  const generateClientConfigMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/vpn/${selectedVpn}/generate-client-config`, {
        clientPrivateKey: clientKeys.privateKey,
        clientPublicKey: clientKeys.publicKey,
        serverPublicKey: serverKeys.publicKey,
      });
      return response.config;
    },
    onSuccess: (config) => {
      setClientConfig(config);
      toast({ title: "Success", description: "Client config generated" });
    },
  });

  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/vpn/${selectedVpn}/generate-qr`, {
        config: clientConfig,
      });
      return response.qr;
    },
    onSuccess: (qr) => {
      setQrCode(qr);
      toast({ title: "Success", description: "QR code generated" });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const downloadConfig = (config: string, name: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(config));
    element.setAttribute("download", `${name}.conf`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">WireGuard Management</h1>
        <p className="text-muted-foreground">Generate and manage WireGuard VPN configurations</p>
      </div>

      {/* Select VPN */}
      <Card>
        <CardHeader>
          <CardTitle>Select VPN Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedVpn || ""}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedVpn(id || null);
              setServerKeys({ privateKey: "", publicKey: "" });
              setClientKeys({ privateKey: "", publicKey: "" });
              setServerConfig("");
              setClientConfig("");
              setQrCode("");
            }}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a VPN...</option>
            {vpnConfigs
              .filter((v) => v.protocol?.toLowerCase().includes("wireguard"))
              .map((vpn) => (
                <option key={vpn.id} value={vpn.id}>
                  {vpn.name}
                </option>
              ))}
          </select>
        </CardContent>
      </Card>

      {selectedVpn && (
        <>
          {/* Server Keys */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Server Keys</CardTitle>
              <Button
                onClick={() => generateServerKeysMutation.mutate()}
                disabled={generateServerKeysMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate
              </Button>
            </CardHeader>
            {serverKeys.privateKey && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Private Key</label>
                  <div className="flex gap-2">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      value={serverKeys.privateKey}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-muted"
                    />
                    <Button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      variant="ghost"
                      size="sm"
                    >
                      {showPrivateKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(serverKeys.privateKey, "Private Key")}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Public Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serverKeys.publicKey}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-muted"
                    />
                    <Button
                      onClick={() => copyToClipboard(serverKeys.publicKey, "Public Key")}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Client Keys */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Client Keys</CardTitle>
              <Button
                onClick={() => generateClientKeysMutation.mutate()}
                disabled={generateClientKeysMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate
              </Button>
            </CardHeader>
            {clientKeys.privateKey && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Private Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={clientKeys.privateKey}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-muted"
                    />
                    <Button
                      onClick={() => copyToClipboard(clientKeys.privateKey, "Client Private Key")}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Public Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clientKeys.publicKey}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-muted"
                    />
                    <Button
                      onClick={() => copyToClipboard(clientKeys.publicKey, "Client Public Key")}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Generate Configs */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => generateServerConfigMutation.mutate()}
              disabled={
                generateServerConfigMutation.isPending ||
                !serverKeys.privateKey ||
                !clientKeys.publicKey
              }
              className="w-full"
            >
              Generate Server Config
            </Button>
            <Button
              onClick={() => generateClientConfigMutation.mutate()}
              disabled={
                generateClientConfigMutation.isPending ||
                !clientKeys.privateKey ||
                !serverKeys.publicKey
              }
              className="w-full"
            >
              Generate Client Config
            </Button>
          </div>

          {/* Server Config */}
          {serverConfig && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Server Configuration</CardTitle>
                <Button
                  onClick={() => downloadConfig(serverConfig, "server")}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                <textarea
                  value={serverConfig}
                  readOnly
                  className="w-full h-48 p-3 border rounded-md bg-muted font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}

          {/* Client Config */}
          {clientConfig && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Client Configuration</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadConfig(clientConfig, "client")}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => generateQRMutation.mutate()}
                    disabled={generateQRMutation.isPending}
                    variant="outline"
                    className="gap-2"
                  >
                    <QRIcon className="h-4 w-4" />
                    Generate QR
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={clientConfig}
                  readOnly
                  className="w-full h-48 p-3 border rounded-md bg-muted font-mono text-sm"
                />
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="WireGuard Config QR Code" className="max-w-xs" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
