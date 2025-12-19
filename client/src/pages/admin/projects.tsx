import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StaffLayout } from "@/components/portal/staff-layout";
import { FolderKanban, Search, Plus, ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

export default function AdminProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
  });

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-1" data-testid="text-admin-projects-title">
              All Projects
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all client projects
            </p>
          </div>
          <Link href="/admin/projects/new">
            <Button className="gap-2" data-testid="button-create-project">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-admin-projects"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="build">Build</SelectItem>
              <SelectItem value="launch">Launch</SelectItem>
              <SelectItem value="care">Care</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <Card data-testid="card-projects-table">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id} className="hover-elevate cursor-pointer" data-testid={`row-project-${project.id}`}>
                        <TableCell>
                          <Link href={`/admin/projects/${project.id}`}>
                            <div className="font-medium hover:text-primary">{project.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {project.summary}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            {typeLabels[project.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {tierLabels[project.tier]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[project.status]}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progressPercent} className="h-2 w-16" />
                            <span className="text-sm text-muted-foreground">{project.progressPercent}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {project.targetLaunchDate
                            ? new Date(project.targetLaunchDate).toLocaleDateString()
                            : "TBD"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${project.id}`}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/projects/${project.id}`} className="cursor-pointer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/projects/${project.id}/edit`} className="cursor-pointer">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="card-no-admin-projects">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "No Projects Found" : "No Projects Yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Create your first project to get started."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/admin/projects/new">
                  <Button data-testid="button-create-first-project">Create Project</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </StaffLayout>
  );
}
