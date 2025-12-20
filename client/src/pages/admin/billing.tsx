import { Card, CardContent } from "@/components/ui/card";
import { StaffLayout } from "@/components/portal/staff-layout";
import { Receipt } from "lucide-react";

export default function AdminBilling() {
  return (
    <StaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-2" data-testid="text-admin-billing-title">
            Billing
          </h1>
          <p className="text-muted-foreground">
            Manage invoices and payments across all projects
          </p>
        </div>

        <Card data-testid="card-admin-billing-placeholder">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">Invoice Management</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              View billing details from individual project pages. A consolidated billing dashboard will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
