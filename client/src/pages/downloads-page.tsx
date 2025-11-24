import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Software, Category } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Download, Search, Monitor, Apple, HardDrive, ExternalLink, Share2, Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type SoftwareWithCategory = Software & {
  category: Category;
};

export default function DownloadsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedSoftwareForShare, setSelectedSoftwareForShare] = useState<SoftwareWithCategory | null>(null);

  const { data: software, isLoading } = useQuery<SoftwareWithCategory[]>({
    queryKey: ["/api/software"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const shareMutation = useMutation({
    mutationFn: async (softwareId: number) => {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ softwareId }),
      });
      if (!response.ok) throw new Error("Failed to create share link");
      return response.json();
    },
    onSuccess: (data) => {
      setShareData(data);
      toast({
        title: "Share link created!",
        description: "Copy the secret code to share with others",
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
    setShareData(null);
    setCopiedCode(false);
    setIsShareOpen(true);
    shareMutation.mutate(sw.id);
  };

  const copyToClipboard = () => {
    if (shareData?.secretCode) {
      navigator.clipboard.writeText(shareData.secretCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "Copied!",
        description: "Secret code copied to clipboard",
      });
    }
  };

  const activeSoftware = software?.filter((sw) => sw.isActive);

  const filteredSoftware = activeSoftware?.filter((sw) => {
    const matchesSearch =
      sw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sw.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || sw.categoryId.toString() === selectedCategory;
    const matchesPlatform =
      selectedPlatform === "all" ||
      sw.platform === selectedPlatform ||
      sw.platform === "Both";
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const groupedByCategory = filteredSoftware?.reduce((acc, sw) => {
    const categoryName = sw.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(sw);
    return acc;
  }, {} as Record<string, SoftwareWithCategory[]>);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Windows":
        return <Monitor className="h-4 w-4" />;
      case "Mac":
        return <Apple className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Downloads</h1>
        <p className="text-muted-foreground">Browse and download available software</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Software Library</CardTitle>
          <CardDescription>
            {activeSoftware?.length || 0} software items available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search software..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-downloads"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger data-testid="select-platform-filter">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="Windows">Windows</SelectItem>
                <SelectItem value="Mac">Mac</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredSoftware && filteredSoftware.length > 0 ? (
            <Tabs defaultValue={Object.keys(groupedByCategory || {})[0]} className="w-full">
              <TabsList className="flex-wrap h-auto gap-2">
                {Object.keys(groupedByCategory || {}).map((categoryName) => (
                  <TabsTrigger key={categoryName} value={categoryName}>
                    {categoryName} ({groupedByCategory![categoryName].length})
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(groupedByCategory || {}).map(([categoryName, items]) => (
                <TabsContent key={categoryName} value={categoryName} className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((sw) => (
                      <Card
                        key={sw.id}
                        className="hover-elevate"
                        data-testid={`software-card-${sw.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="text-lg line-clamp-2">{sw.name}</CardTitle>
                            <Badge variant="outline" className="shrink-0">
                              {getPlatformIcon(sw.platform)}
                              <span className="ml-1">{sw.platform}</span>
                            </Badge>
                          </div>
                          {sw.version && (
                            <CardDescription className="font-mono text-xs">
                              Version: {sw.version}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {sw.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {sw.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {sw.downloadUrl ? (
                              <Button
                                className="flex-1"
                                onClick={() => window.open(sw.downloadUrl!, "_blank")}
                                data-testid={`button-download-${sw.id}`}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            ) : (
                              <Button className="flex-1" disabled>
                                <Download className="mr-2 h-4 w-4" />
                                No Link
                              </Button>
                            )}
                            {sw.filePath && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleShare(sw)}
                                data-testid={`button-share-${sw.id}`}
                                title="Create shareable link with secret code"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Download className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No software found</p>
              <p className="text-sm mt-2">
                {searchTerm || selectedCategory !== "all" || selectedPlatform !== "all"
                  ? "Try adjusting your filters"
                  : "No software available for download"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Software</DialogTitle>
            <DialogDescription>
              {selectedSoftwareForShare?.name} - Create a secret code to share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shareMutation.isPending && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Creating share link...</p>
              </div>
            )}
            {shareData && (
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Secret Code</p>
                  <div className="flex gap-2">
                    <code className="flex-1 p-3 bg-white dark:bg-black rounded border font-mono text-lg tracking-widest text-center">
                      {shareData.secretCode}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyToClipboard}
                      data-testid="button-copy-code"
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Share Link</p>
                  <div className="flex gap-2">
                    <code className="flex-1 p-3 bg-white dark:bg-black rounded border text-xs break-all">
                      {`${window.location.origin}/download/${shareData.secretCode}`}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/download/${shareData.secretCode}`);
                        toast({ title: "Link copied!" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Share the code or link with others to let them download this software
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
