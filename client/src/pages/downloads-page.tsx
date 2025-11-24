import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Download, Search, Monitor, Apple, HardDrive, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SoftwareWithCategory = Software & {
  category: Category;
};

export default function DownloadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: software, isLoading } = useQuery<SoftwareWithCategory[]>({
    queryKey: ["/api/software"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

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
                        <CardContent className="space-y-4">
                          {sw.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {sw.description}
                            </p>
                          )}
                          {sw.downloadUrl ? (
                            <Button
                              className="w-full"
                              onClick={() => window.open(sw.downloadUrl!, "_blank")}
                              data-testid={`button-download-${sw.id}`}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                          ) : (
                            <Button className="w-full" disabled>
                              <Download className="mr-2 h-4 w-4" />
                              No Download Link
                            </Button>
                          )}
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
    </div>
  );
}
