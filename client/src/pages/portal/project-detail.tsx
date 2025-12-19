import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PortalLayout } from "@/components/portal/portal-layout";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Circle,
  Eye,
  ExternalLink,
  Upload,
  Send,
  FileText,
  Download,
  MessageSquare,
  Receipt,
  Layers,
  Calendar,
} from "lucide-react";
import type { Project, Milestone, Preview, Message, FileRecord, Invoice } from "@shared/schema";

const statusColors: Record<string, string> = {
  discovery: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  design: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  build: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  launch: "bg-green-500/10 text-green-500 border-green-500/20",
  care: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  completed: "bg-muted text-muted-foreground border-muted",
  on_hold: "bg-red-500/10 text-red-500 border-red-500/20",
};

const previewStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-500/10 text-blue-500",
  approved: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  revision_requested: "bg-amber-500/10 text-amber-500",
};

export default function ProjectDetail() {
  const [, params] = useRoute("/portal/projects/:id");
  const projectId = params?.id;
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: milestones } = useQuery<Milestone[]>({
    queryKey: ["/api/projects", projectId, "milestones"],
    enabled: !!projectId,
  });

  const { data: previews } = useQuery<Preview[]>({
    queryKey: ["/api/projects", projectId, "previews"],
    enabled: !!projectId,
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/projects", projectId, "messages"],
    enabled: !!projectId,
  });

  const { data: files } = useQuery<FileRecord[]>({
    queryKey: ["/api/projects", projectId, "files"],
    enabled: !!projectId,
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/projects", projectId, "invoices"],
    enabled: !!projectId,
  });

  if (projectLoading) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PortalLayout>
    );
  }

  if (!project) {
    return (
      <PortalLayout>
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="font-heading font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-6">
              This project doesn't exist or you don't have access to it.
            </p>
            <Link href="/portal/projects">
              <Button>Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/portal/projects">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading font-bold text-2xl lg:text-3xl truncate" data-testid="text-project-title">
                {project.title}
              </h1>
              <Badge variant="outline" className={statusColors[project.status]}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card data-testid="card-progress">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="font-semibold">{project.progressPercent}%</div>
                </div>
              </div>
              <Progress value={project.progressPercent} className="h-2 mt-3" />
            </CardContent>
          </Card>
          <Card data-testid="card-start-date">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Started</div>
                  <div className="font-semibold">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "Not started"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-target-date">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Target Launch</div>
                  <div className="font-semibold">
                    {project.targetLaunchDate
                      ? new Date(project.targetLaunchDate).toLocaleDateString()
                      : "TBD"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList data-testid="tabs-project">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="previews">Previews</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-milestones">
                <CardHeader>
                  <CardTitle className="text-lg">Key Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  {milestones && milestones.length > 0 ? (
                    <div className="space-y-4">
                      {milestones.slice(0, 5).map((milestone) => (
                        <div key={milestone.id} className="flex items-start gap-3">
                          {milestone.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{milestone.name}</div>
                            {milestone.dueDate && (
                              <div className="text-sm text-muted-foreground">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {milestone.approvalRequired && (
                            <Badge variant="outline" className="text-xs">
                              Approval
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No milestones defined yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-quick-actions">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-upload-files">
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-send-message">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-view-previews">
                    <Eye className="w-4 h-4" />
                    View Latest Preview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <Card data-testid="card-timeline">
              <CardHeader>
                <CardTitle className="text-lg">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {milestones && milestones.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-8">
                      {milestones.map((milestone, index) => (
                        <div key={milestone.id} className="relative flex gap-6 pl-10">
                          <div
                            className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                              milestone.status === "completed"
                                ? "bg-green-500 border-green-500"
                                : milestone.status === "in_progress"
                                ? "bg-primary border-primary"
                                : "bg-background border-muted-foreground"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{milestone.name}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  milestone.status === "completed"
                                    ? "bg-green-500/10 text-green-500"
                                    : milestone.status === "in_progress"
                                    ? "bg-primary/10 text-primary"
                                    : ""
                                }
                              >
                                {milestone.status.replace("_", " ")}
                              </Badge>
                              {milestone.approvalRequired && (
                                <Badge variant="secondary" className="text-xs">
                                  Requires Approval
                                </Badge>
                              )}
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            )}
                            {milestone.dueDate && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(milestone.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Timeline will be updated as the project progresses.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="previews">
            <Card data-testid="card-previews">
              <CardHeader>
                <CardTitle className="text-lg">Preview Links</CardTitle>
              </CardHeader>
              <CardContent>
                {previews && previews.length > 0 ? (
                  <div className="space-y-4">
                    {previews.map((preview) => (
                      <div
                        key={preview.id}
                        className="p-4 rounded-lg border border-border hover-elevate"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{preview.label}</h4>
                              <Badge variant="outline" className="font-mono text-xs">
                                {preview.version}
                              </Badge>
                              <Badge className={previewStatusColors[preview.status]}>
                                {preview.status.replace("_", " ")}
                              </Badge>
                            </div>
                            {preview.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {preview.notes}
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">
                              Added {new Date(preview.createdAt!).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={preview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="gap-1">
                                <ExternalLink className="w-3 h-3" />
                                View
                              </Button>
                            </a>
                            {preview.status === "ready" && (
                              <>
                                <Button variant="default" size="sm">
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm">
                                  Request Changes
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {preview.feedback && (
                          <div className="mt-4 p-3 bg-muted rounded-md">
                            <div className="text-xs font-medium mb-1">Your Feedback:</div>
                            <p className="text-sm">{preview.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    No preview links available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card data-testid="card-files">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Project Files</CardTitle>
                <Button size="sm" className="gap-1" data-testid="button-upload">
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </CardHeader>
              <CardContent>
                {files && files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{file.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {file.fileType} • {new Date(file.createdAt!).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No files uploaded yet.</p>
                    <Button data-testid="button-upload-first">Upload Your First File</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card data-testid="card-messages">
              <CardHeader>
                <CardTitle className="text-lg">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages && messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.senderRole === "client" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {msg.senderRole === "client" ? "ME" : "HC"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`flex-1 max-w-[70%] p-3 rounded-lg ${
                            msg.senderRole === "client"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div
                            className={`text-xs mt-1 ${
                              msg.senderRole === "client"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.createdAt!).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No messages yet. Start a conversation!
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="resize-none"
                    rows={2}
                    data-testid="textarea-message"
                  />
                  <Button size="icon" className="h-auto" data-testid="button-send">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card data-testid="card-billing">
              <CardHeader>
                <CardTitle className="text-lg">Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices && invoices.length > 0 ? (
                  <div className="space-y-2">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">#{invoice.invoiceNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">${(invoice.amount / 100).toFixed(2)}</div>
                            <Badge
                              variant="outline"
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-500/10 text-green-500"
                                  : invoice.status === "overdue"
                                  ? "bg-red-500/10 text-red-500"
                                  : ""
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          {invoice.url && (
                            <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    No invoices yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
