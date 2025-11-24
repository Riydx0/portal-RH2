import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Ticket, User, TicketComment, InsertTicketComment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

type TicketWithRelations = Ticket & {
  creator: User;
  assignee: User | null;
  comments: (TicketComment & { user: User })[];
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [comment, setComment] = useState("");

  const { data: ticket, isLoading } = useQuery<TicketWithRelations>({
    queryKey: ["/api/tickets", id],
    enabled: !!id,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: "open" | "in-progress" | "closed") => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Success",
        description: "Ticket status updated",
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

  const assignMutation = useMutation({
    mutationFn: async (assignedTo: number | null) => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}`, { assignedTo });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", id] });
      toast({
        title: "Success",
        description: "Ticket assignment updated",
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

  const commentMutation = useMutation({
    mutationFn: async (data: InsertTicketComment) => {
      const res = await apiRequest("POST", "/api/ticket-comments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", id] });
      setComment("");
      toast({
        title: "Success",
        description: "Comment added",
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

  const handleAddComment = () => {
    if (!comment.trim() || !user) return;
    commentMutation.mutate({
      ticketId: parseInt(id!),
      userId: user.id,
      comment: comment.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      open: { className: "bg-blue-500 hover:bg-blue-600" },
      "in-progress": { className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
      closed: { className: "bg-green-500 hover:bg-green-600 text-white" },
    };
    return variants[status] || variants.open;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: "bg-gray-500",
      normal: "bg-blue-500",
      high: "bg-red-500",
    };
    return variants[priority] || variants.normal;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 lg:p-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Ticket not found</p>
          <Link href="/tickets">
            <Button className="mt-4">Back to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="outline" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Ticket #{ticket.id}</h1>
          <p className="text-muted-foreground">{ticket.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle>Details</CardTitle>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${getPriorityBadge(ticket.priority)}`}
                  />
                  <span className="text-sm font-medium capitalize">{ticket.priority}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments ({ticket.comments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((c, index) => (
                    <div key={c.id}>
                      <div className="flex gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {getInitials(c.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{c.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(c.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {c.comment}
                          </p>
                        </div>
                      </div>
                      {index < ticket.comments.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-6">
                  No comments yet. Be the first to comment!
                </p>
              )}

              <Separator />

              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  data-testid="input-comment"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || commentMutation.isPending}
                  data-testid="button-add-comment"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select
                  value={ticket.status}
                  onValueChange={(val: "open" | "in-progress" | "closed") =>
                    updateStatusMutation.mutate(val)
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <Badge {...getStatusBadge("open")} className="text-white">Open</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <div className="flex items-center gap-2">
                        <Badge {...getStatusBadge("in-progress")} className="text-white">In Progress</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="closed">
                      <div className="flex items-center gap-2">
                        <Badge {...getStatusBadge("closed")} className="text-white">Closed</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {(user?.role === "admin") && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={ticket.assignedTo?.toString() || "unassigned"}
                  onValueChange={(val) =>
                    assignMutation.mutate(val === "unassigned" ? null : parseInt(val))
                  }
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger data-testid="select-assignee">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users
                      ?.filter((u) => u.role === "admin")
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created By</p>
                <p className="font-medium">{ticket.creator.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1">Created At</p>
                <p className="font-medium">
                  {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(ticket.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              {ticket.assignee && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Assigned To</p>
                    <p className="font-medium">{ticket.assignee.name}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
