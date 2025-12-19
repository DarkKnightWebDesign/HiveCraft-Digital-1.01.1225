import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffLayout } from "@/components/portal/staff-layout";
import { FolderKanban, Users, MessageSquare, CheckCircle2, Clock, AlertTriangle, ArrowRight, Plus } from "lucide-react";
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

export default function AdminDashboard() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
  });

  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => !["completed", "on_hold"].includes(p.status)).length || 0,
    pendingApprovals: 0,
    overdueProjects: 0,
  };

  return (
    <StaffLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-1" data-testid="text-admin-dashboard-title">
              Staff Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of all projects and team activity
            </p>
          </div>
          <Link href="/admin/projects/new">
            <Button className="gap-2" data-testid="button-new-project">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FolderKanban, label: "Total Projects", value: stats.totalProjects, color: "text-primary" },
            { icon: Clock, label: "Active Projects", value: stats.activeProjects, color: "text-blue-500" },
            { icon: CheckCircle2, label: "Pending Approvals", value: stats.pendingApprovals, color: "text-amber-500" },
            { icon: AlertTriangle, label: "Overdue", value: stats.overdueProjects, color: "text-red-500" },
          ].map((stat, index) => (
            <Card key={index} data-testid={`card-admin-stat-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="font-heading font-bold text-2xl">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card data-testid="card-recent-projects">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Recent Projects</CardTitle>
                <Link href="/admin/projects">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <Link key={project.id} href={`/admin/projects/${project.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate cursor-pointer">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{project.title}</h4>
                              <Badge variant="outline" className={statusColors[project.status]}>
                                {project.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{project.summary}</p>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{project.progressPercent}%</div>
                              <Progress value={project.progressPercent} className="h-1 w-16" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No projects yet. Create your first project to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card data-testid="card-pending-actions">
              <CardHeader>
                <CardTitle className="text-lg">Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>All caught up!</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/projects/new">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Button>
                </Link>
                <Link href="/admin/clients">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />
                    Manage Clients
                  </Button>
                </Link>
                <Link href="/admin/messages">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" />
                    View Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
