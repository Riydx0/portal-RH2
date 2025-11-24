import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocsPage() {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Code copied to clipboard" });
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Integrate with our IT Service Portal using our REST API
        </p>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            All API requests must include your API key in the Authorization header:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <code className="font-mono text-sm">Authorization: Bearer YOUR_API_KEY</code>
              <Button size="sm" variant="ghost" onClick={() => copyCode("Authorization: Bearer YOUR_API_KEY")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GET Software */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge>GET</Badge>
              <code className="font-mono">/api/public/software</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">List all available software</p>
            <div className="bg-muted p-3 rounded text-xs font-mono mb-3">
              <div className="flex justify-between items-start mb-2">
                <span>curl -H "Authorization: Bearer YOUR_KEY" https://api.yoursite.com/api/public/software</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode('curl -H "Authorization: Bearer YOUR_KEY" https://api.yoursite.com/api/public/software')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Returns array of software objects with details</p>
          </div>

          {/* GET Categories */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge>GET</Badge>
              <code className="font-mono">/api/public/categories</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">List all categories</p>
            <div className="bg-muted p-3 rounded text-xs font-mono mb-3">
              <div className="flex justify-between items-start mb-2">
                <span>curl -H "Authorization: Bearer YOUR_KEY" https://api.yoursite.com/api/public/categories</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode('curl -H "Authorization: Bearer YOUR_KEY" https://api.yoursite.com/api/public/categories')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* GET Licenses */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge>GET</Badge>
              <code className="font-mono">/api/public/licenses</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">List all available licenses</p>
            <div className="bg-muted p-3 rounded text-xs font-mono mb-3">
              <div className="flex justify-between items-start mb-2">
                <span>curl -H "Authorization: Bearer YOUR_KEY" https://api.yoursite.com/api/public/licenses</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode('curl -H "Authorization: Bearer YOUR_KEY" https://api.yoursite.com/api/public/licenses')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* POST Share Download */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">POST</Badge>
              <code className="font-mono">/api/public/share-download</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Get shareable download link</p>
            <div className="bg-muted p-3 rounded text-xs font-mono mb-3">
              <div className="flex justify-between items-start mb-2">
                <span>curl -X POST -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" -d '{"{"}secretCode": "ABC123XY"{"}"}' https://api.yoursite.com/api/public/share-download</span>
                <Button size="sm" variant="ghost" onClick={() => copyCode('curl -X POST -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" -d \'{"secretCode": "ABC123XY"}\' https://api.yoursite.com/api/public/share-download')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Each API key has a configurable rate limit (requests per hour). Rate limit information is included in response headers:
          </p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li><code className="bg-muted px-2 py-1 rounded">X-RateLimit-Limit</code> - Total requests allowed per hour</li>
            <li><code className="bg-muted px-2 py-1 rounded">X-RateLimit-Remaining</code> - Remaining requests in current hour</li>
            <li><code className="bg-muted px-2 py-1 rounded">X-RateLimit-Reset</code> - Unix timestamp of rate limit reset</li>
          </ul>
        </CardContent>
      </Card>

      {/* Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-mono text-sm mb-2">401 Unauthorized</p>
            <p className="text-sm text-muted-foreground">Invalid or missing API key</p>
          </div>
          <div>
            <p className="font-mono text-sm mb-2">429 Too Many Requests</p>
            <p className="text-sm text-muted-foreground">Rate limit exceeded. Check X-RateLimit-Reset header</p>
          </div>
          <div>
            <p className="font-mono text-sm mb-2">500 Internal Server Error</p>
            <p className="text-sm text-muted-foreground">Server error. Please try again later</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
