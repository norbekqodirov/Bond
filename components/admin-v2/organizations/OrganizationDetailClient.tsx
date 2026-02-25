"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin-v2/StatusBadge";

export function OrganizationDetailClient({ id }: { id: string }) {
  const [organization, setOrganization] = useState<any>(null);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("owner");
  const t = useTranslations("admin");

  const refresh = async () => {
    const res = await fetch(`/api/organizations/${id}`);
    const data = await res.json();
    setOrganization(data.data);
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    refresh();
  };

  const addMember = async () => {
    if (!memberUserId) return;
    await fetch(`/api/organizations/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: memberUserId, orgRole: memberRole })
    });
    setMemberUserId("");
    refresh();
  };

  const removeMember = async (userId: string) => {
    await fetch(`/api/organizations/${id}/members?userId=${userId}`, { method: "DELETE" });
    refresh();
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{organization.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusBadge status={organization.status.toLowerCase()} />
          <div className="flex gap-2">
            <Button onClick={() => updateStatus("approved")}>{t("actions.approve")}</Button>
            <Button variant="outline" onClick={() => updateStatus("rejected")}>
              {t("actions.reject")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="User ID" value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} />
            <Select value={memberRole} onValueChange={setMemberRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="jury">Jury</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addMember}>{t("actions.save")}</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.members.map((member: any) => (
                <TableRow key={member.userId}>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell className="capitalize">{member.orgRole.toLowerCase()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => removeMember(member.userId)}>
                      {t("actions.remove")}
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
