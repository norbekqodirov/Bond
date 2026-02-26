import { redirect } from "next/navigation";

function mapLegacyAdminPath(slug: string[]) {
  const [first, second, third] = slug;

  if (first === "articles") {
    if (!second) return "/uz/admin/content/articles";
    if (second === "new") return "/uz/admin/content/articles/new";
    return `/uz/admin/content/articles/${second}`;
  }

  if (first === "settings") {
    return "/uz/admin/content/settings";
  }

  if (first === "olympiads") {
    if (!second) return "/uz/admin/olympiads";
    if (second === "new") return "/uz/admin/olympiads/new";
    return `/uz/admin/olympiads/${second}`;
  }

  if (first === "registrations") {
    if (!second) return "/uz/admin/registrations";
    return `/uz/admin/registrations/${second}`;
  }

  if (first === "users") return "/uz/admin/users";
  if (first === "organizations") {
    if (!second) return "/uz/admin/organizations";
    return `/uz/admin/organizations/${second}`;
  }
  if (first === "finance") {
    if (second === "settlement") return "/uz/admin/finance/settlement";
    if (second === "transactions" && third) return `/uz/admin/finance/transactions/${third}`;
    return "/uz/admin/finance/transactions";
  }
  if (first === "notifications") return "/uz/admin/notifications";
  if (first === "audit") return "/uz/admin/audit";
  if (first === "access") {
    if (second === "users") {
      if (!third) return "/uz/admin/access/users";
      return `/uz/admin/access/users/${third}`;
    }
    if (second === "roles") {
      if (!third) return "/uz/admin/access/roles";
      if (third === "new") return "/uz/admin/access/roles/new";
      return `/uz/admin/access/roles/${third}`;
    }
    return "/uz/admin/access/roles";
  }

  return "/uz/admin";
}

export default function LegacyAdminCatchAllPage({
  params
}: {
  params: { slug: string[] };
}) {
  redirect(mapLegacyAdminPath(params.slug));
}
