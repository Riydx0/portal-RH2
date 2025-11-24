import { randomBytes } from "crypto";
import qrcode from "qrcode";

// Generate a WireGuard private key
function generatePrivateKey(): string {
  // WireGuard keys are base64 encoded 32-byte values
  const bytes = randomBytes(32);
  return Buffer.from(bytes).toString("base64");
}

// Calculate public key from private key (simplified - in production use wg-dynamic library)
function calculatePublicKey(privateKey: string): string {
  // Simplified placeholder - real implementation would use proper crypto
  return Buffer.from("wireguard_" + privateKey).toString("base64").slice(0, 44);
}

export async function generateWireGuardPair() {
  const privateKey = generatePrivateKey();
  const publicKey = calculatePublicKey(privateKey);
  return { privateKey, publicKey };
}

export async function generateWireGuardConfig(
  serverName: string,
  serverAddress: string,
  port: number,
  privateKey: string,
  publicKey: string,
  clientPrivateKey?: string,
  clientPublicKey?: string
): Promise<string> {
  const serverPublicKey = calculatePublicKey(privateKey);

  const config = `# WireGuard Configuration
[Interface]
# Server Name: ${serverName}
PrivateKey = ${privateKey}
Address = ${serverAddress}/24
ListenPort = ${port}

${
  clientPublicKey
    ? `
[Peer]
# Client
PublicKey = ${clientPublicKey}
AllowedIPs = 10.0.0.2/32
`
    : ""
}`;

  return config;
}

export async function generateClientConfig(
  clientPrivateKey: string,
  clientPublicKey: string,
  serverPublicKey: string,
  serverAddress: string,
  port: number,
  vpnNetworkAddress: string = "10.0.0.2/24"
): Promise<string> {
  const config = `# WireGuard Client Configuration
[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${vpnNetworkAddress}
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${serverAddress}:${port}
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25
`;

  return config;
}

export async function generateQRCode(configText: string): Promise<string> {
  try {
    const qrDataUrl = await qrcode.toDataURL(configText);
    return qrDataUrl;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw error;
  }
}

export async function generateConfigFile(
  config: string,
  filename: string
): Promise<Buffer> {
  return Buffer.from(config, "utf-8");
}
