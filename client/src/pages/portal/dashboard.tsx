import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalLayout } from "@/components/portal/portal-layout";
import { useAuth } from "@/hooks/use-auth";
import { FolderKanban, MessageSquare, FileText, Eye, ArrowRight, Clock, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

const statusColors: Record<string, string> = {
  discovery: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  design: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  build: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  launch: "bg-green-500/10 text-green-500 border-green-500/20",
  care: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  completed: "bg-muted text-muted-foreground border-muted",
  on_hold: "bg-red-500/10 text-red-500 border-red-500/20",
};

const typeLabels: Record<string, string> = {
  managed_website: "Managed Website",
  custom_website: "Custom Website",
  online_store: "Online Store",
  web_app: "Web Application",
};

export default function PortalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const claimDemoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/claim-demo-projects");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Demo projects loaded",
        description: `${data.count} sample projects are now available to explore.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load demo projects. Please try again.",
        variant: "destructive",
      });
    },
  });

  const stats = {
    activeProjects: projects?.filter(p => !["completed", "on_hold"].includes(p.status)).length || 0,
    pendingPreviews: 0,
    unreadMessages: 0,
    totalFiles: 0,
  };

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-2" data-testid="text-dashboard-title">
            Welcome back, {user?.firstName || "Client"}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your projects and recent activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FolderKanban, label: "Active Projects", value: stats.activeProjects, href: "/portal/projects" },
            { icon: Eye, label: "Pending Previews", value: stats.pendingPreviews, href: "/portal/projects" },
            { icon: MessageSquare, label: "Messages", value: stats.unreadMessages, href: "/portal/messages" },
            { icon: FileText, label: "Files", value: stats.totalFiles, href: "/portal/files" },
          ].map((stat, index) => (
            <Card key={index} className="hover-elevate cursor-pointer" data-testid={`card-stat-${index}`}>
              <Link href={stat.href}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-heading font-bold text-2xl">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{stat.label}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg" data-testid="text-projects-heading">
              Your Projects
            </h2>
            <Link href="/portal/projects">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-projects">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project) => (
                <Link key={project.id} href={`/portal/projects/${project.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-project-${project.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold truncate">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{typeLabels[project.type]}</p>
                        </div>
                        <Badge variant="outline" className={statusColors[project.status]}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progressPercent}%</span>
                        </div>
                        <Progress value={project.progressPercent} className="h-2" />
                      </div>
                      {project.targetLaunchDate && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Target: {new Date(project.targetLaunchDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card data-testid="card-no-projects">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <FolderKanban className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold mb-2">No Projects Yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You don't have any active projects. Contact us to get started, or load demo projects to explore the portal.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/contact">
                    <Button data-testid="button-start-project">Start a Project</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => claimDemoMutation.mutate()}
                    disabled={claimDemoMutation.isPending}
                    data-testid="button-load-demo"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {claimDemoMutation.isPending ? "Loading..." : "Load Demo Projects"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="font-heading font-semibold text-lg mb-4" data-testid="text-activity-heading">
            Recent Activity
          </h2>
          <Card data-testid="card-activity">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-8">
                <p>No recent activity to display.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
