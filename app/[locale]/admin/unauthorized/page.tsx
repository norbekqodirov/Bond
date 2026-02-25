import Link from "next/link";
import { getLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UnauthorizedPage() {
  const locale = await getLocale();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this page.
          </p>
          <Button asChild>
            <Link href={`/${locale}/admin`}>Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
