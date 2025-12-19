import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PortalLayout } from "@/components/portal/portal-layout";
import { FolderKanban, Search, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
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

const tierLabels: Record<string, string> = {
  launch: "Launch",
  growth: "Growth",
  scale: "Scale",
};

export default function PortalProjects() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects?.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-1" data-testid="text-projects-title">
              My Projects
            </h1>
            <p className="text-muted-foreground">
              View and manage all your active projects
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-projects"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/portal/projects/${project.id}`}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-project-${project.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-semibold truncate mb-1">{project.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabels[project.type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {tierLabels[project.tier]}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[project.status]}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {project.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.summary}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progressPercent}%</span>
                      </div>
                      <Progress value={project.progressPercent} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      {project.targetLaunchDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(project.targetLaunchDate).toLocaleDateString()}
                        </div>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
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
              <h3 className="font-heading font-semibold mb-2">
                {searchQuery ? "No Projects Found" : "No Projects Yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "You don't have any projects yet. Contact us to get started!"}
              </p>
              {!searchQuery && (
                <Link href="/contact">
                  <Button data-testid="button-start-project">Start a Project</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
