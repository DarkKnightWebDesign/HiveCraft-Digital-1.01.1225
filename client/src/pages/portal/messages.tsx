import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLayout } from "@/components/portal/portal-layout";
import { MessageSquare } from "lucide-react";

export default function PortalMessages() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-1" data-testid="text-messages-title">
            Messages
          </h1>
          <p className="text-muted-foreground">
            All your project communications in one place
          </p>
        </div>

        <Card data-testid="card-messages-empty">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold mb-2">No Messages Yet</h3>
            <p className="text-sm text-muted-foreground">
              Messages from your projects will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
