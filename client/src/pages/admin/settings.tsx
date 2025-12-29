import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffLayout } from "@/components/portal/staff-layout";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <StaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-2" data-testid="text-admin-settings-title">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure platform settings
          </p>
        </div>

        <Card data-testid="card-admin-settings-placeholder">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">Platform Settings</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure platform settings, integrations, OAuth providers, and system preferences. Full settings UI coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
