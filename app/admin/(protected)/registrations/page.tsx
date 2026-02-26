import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/database";
import { DatabaseRequiredNotice } from "@/components/admin/DatabaseRequiredNotice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function RegistrationsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">Registrations</h1>
        <DatabaseRequiredNotice />
      </div>
    );
  }

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { olympiad: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-brand-primary">
        Registrations
      </h1>
      <div className="rounded-3xl border border-slate-100 bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Olympiad</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="font-semibold text-slate-800">
                  {registration.full_name}
                </TableCell>
                <TableCell>{registration.phone}</TableCell>
                <TableCell>{registration.subject}</TableCell>
                <TableCell>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-500">
                    {registration.status}
                  </Badge>
                </TableCell>
                <TableCell>{registration.olympiad?.title_en ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/registrations/${registration.id}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
