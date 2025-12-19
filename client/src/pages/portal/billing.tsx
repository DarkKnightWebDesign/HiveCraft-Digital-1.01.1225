import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Receipt } from "lucide-react";

export default function PortalBilling() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-1" data-testid="text-billing-title">
            Billing
          </h1>
          <p className="text-muted-foreground">
            View invoices and payment history
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card data-testid="card-billing-outstanding">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Outstanding</div>
              <div className="font-heading font-bold text-2xl mt-1">$0.00</div>
            </CardContent>
          </Card>
          <Card data-testid="card-billing-paid">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Paid (This Year)</div>
              <div className="font-heading font-bold text-2xl mt-1">$0.00</div>
            </CardContent>
          </Card>
          <Card data-testid="card-billing-upcoming">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Upcoming</div>
              <div className="font-heading font-bold text-2xl mt-1">$0.00</div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-invoices-empty">
          <CardHeader>
            <CardTitle className="text-lg">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold mb-2">No Invoices Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your invoices will appear here once billing begins.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
