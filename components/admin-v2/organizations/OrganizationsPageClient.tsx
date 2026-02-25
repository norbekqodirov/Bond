"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";
import { PageHeader } from "@/components/admin-v2/PageHeader";

type Organization = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  members: { user: { email: string } }[];
};

export function OrganizationsPageClient() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [status, setStatus] = useState("all");
  const locale = useLocale();

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    fetch(`/api/organizations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setOrganizations(data.data ?? []))
      .catch(() => setOrganizations([]));
  }, [status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations" subtitle="Review organizer applications" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={org.status.toLowerCase()} />
                  </TableCell>
                  <TableCell>{org.members?.length ?? 0}</TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/admin/organizations/${org.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
