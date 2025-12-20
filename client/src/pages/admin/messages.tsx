import { Card, CardContent } from "@/components/ui/card";
import { StaffLayout } from "@/components/portal/staff-layout";
import { MessageSquare } from "lucide-react";

export default function AdminMessages() {
  return (
    <StaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-2" data-testid="text-admin-messages-title">
            Messages
          </h1>
          <p className="text-muted-foreground">
            View and respond to client messages across all projects
          </p>
        </div>

        <Card data-testid="card-admin-messages-placeholder">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">All Project Messages</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              View messages from individual project pages. A consolidated inbox will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
