import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteOlympiad } from "@/app/admin/(protected)/olympiads/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function OlympiadsPage() {
  const olympiads = await prisma.olympiad.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-brand-primary">
          Olympiads
        </h1>
        <Link
          href="/admin/olympiads/new"
          className="rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-soft"
        >
          New Olympiad
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {olympiads.map((olympiad) => (
              <TableRow key={olympiad.id}>
                <TableCell className="font-semibold text-slate-800">
                  {olympiad.title_en}
                </TableCell>
                <TableCell>{olympiad.subject}</TableCell>
                <TableCell>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-500">
                    {olympiad.status}
                  </Badge>
                </TableCell>
                <TableCell>{olympiad.cover_image_url ? "Yes" : "No"}</TableCell>
                <TableCell>{olympiad.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/olympiads/${olympiad.id}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                    >
                      Edit
                    </Link>
                    <form action={deleteOlympiad.bind(null, olympiad.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
