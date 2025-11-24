import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";

export default function ShareDownloadPage() {
  const { toast } = useToast();
  const [match, params] = useRoute("/download/:secretCode");
  const [secretCode, setSecretCode] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  useEffect(() => {
    if (params?.secretCode) {
      setSecretCode(params.secretCode);
      setIsAutoSubmitting(true);
    }
  }, [params?.secretCode]);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the secret code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsAutoSubmitting(false);
    try {
      const response = await fetch("/api/share-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          secretCode: secretCode.trim(),
          password: password || undefined,
        }),
      });

      if (response.status === 401) {
        const data = await response.json();
        if (data.needsPassword) {
          setNeedsPassword(true);
          setIsLoading(false);
          return;
        }
        throw new Error("Invalid password");
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Invalid or expired secret code");
        }
        if (response.status === 403) {
          const text = await response.text();
          throw new Error(text);
        }
        throw new Error("Download failed");
      }

      const data = await response.json();
      
      if (data.note) {
        setNoteText(data.note);
      }
      
      // Trigger download
      const link = document.createElement("a");
      link.href = `/api/download/${data.filePath}`;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Download started!",
      });
      
      // Reset password after successful download
      setPassword("");
      setNeedsPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAutoSubmitting && secretCode) {
      const timer = setTimeout(() => {
        const form = document.querySelector("form") as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event("submit", { bubbles: true }));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAutoSubmitting, secretCode]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-semibold">Download Software</CardTitle>
          <CardDescription>Enter the secret code to download</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleDownload} className="space-y-4">
            {!needsPassword ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="secret-code">Secret Code</Label>
                  <Input
                    id="secret-code"
                    type="text"
                    placeholder="Enter the secret code..."
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-secret-code"
                    className="text-center font-mono text-lg tracking-widest"
                    autoComplete="off"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !secretCode.trim()}
                  data-testid="button-download-submit"
                >
                  {isLoading ? (isAutoSubmitting ? "Verifying..." : "Verifying") : "Continue"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password Required</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-password"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !password.trim()}
                  data-testid="button-download-with-password"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isLoading ? "Downloading..." : "Download"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setNeedsPassword(false);
                    setPassword("");
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </>
            )}
          </form>

          {noteText && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Message from sender:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{noteText}</p>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Secure Download</p>
                <p>This link is protected and only authorized users can access it.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
