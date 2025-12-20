import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PortalLayout } from "@/components/portal/portal-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Mail, Calendar, Shield } from "lucide-react";
import type { MemberRole } from "@shared/schema";

const roleLabels: Record<string, string> = {
  client: "Client",
  admin: "Administrator",
  project_manager: "Project Manager",
  designer: "Designer",
  developer: "Developer",
  editor: "Editor",
  billing: "Billing",
};

export default function PortalProfile() {
  const { user } = useAuth();

  const { data: memberRole } = useQuery<MemberRole>({
    queryKey: ["/api/member-role"],
  });

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <PortalLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-2" data-testid="text-profile-title">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            View your account information
          </p>
        </div>

        <Card data-testid="card-profile">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-heading font-semibold text-xl" data-testid="text-profile-name">
                  {user?.firstName} {user?.lastName}
                </h2>
                {memberRole && (
                  <Badge variant="secondary" className="mt-1" data-testid="badge-profile-role">
                    {roleLabels[memberRole.role] || memberRole.role}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="text-profile-email">{user?.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium" data-testid="text-profile-role-display">
                    {memberRole ? roleLabels[memberRole.role] || memberRole.role : "Client"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium" data-testid="text-profile-joined">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
