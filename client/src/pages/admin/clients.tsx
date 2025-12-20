import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffLayout } from "@/components/portal/staff-layout";
import { Users } from "lucide-react";

export default function AdminClients() {
  return (
    <StaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-2" data-testid="text-admin-clients-title">
            Clients
          </h1>
          <p className="text-muted-foreground">
            Manage client accounts and relationships
          </p>
        </div>

        <Card data-testid="card-admin-clients-placeholder">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">Client Management</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Client management features will be available in the Wix Studio implementation using Wix Members.
            </p>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
