import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalLayout } from "@/components/portal/portal-layout";
import { FileText, Upload } from "lucide-react";

export default function PortalFiles() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-1" data-testid="text-files-title">
              Files
            </h1>
            <p className="text-muted-foreground">
              Access and manage all your project files
            </p>
          </div>
          <Button className="gap-2" data-testid="button-upload-file">
            <Upload className="w-4 h-4" />
            Upload File
          </Button>
        </div>

        <Card data-testid="card-files-empty">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold mb-2">No Files Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload logos, documents, or other assets for your projects.
            </p>
            <Button data-testid="button-upload-first-file">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First File
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
