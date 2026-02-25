export type RegistrationWindow = "open" | "closed" | "tbd";

export type OlympiadLike = {
  status: string;
  registration_deadline?: Date | null;
};

export function getRegistrationWindow(olympiad: OlympiadLike): RegistrationWindow {
  if (olympiad.status !== "PUBLISHED") {
    return olympiad.status === "ARCHIVED" ? "closed" : "tbd";
  }

  if (!olympiad.registration_deadline) {
    return "tbd";
  }

  const now = new Date();
  return olympiad.registration_deadline > now ? "open" : "closed";
}

export function formatDateRange(locale: string, start: Date | null, end: Date | null) {
  if (!start && !end) {
    return "TBD";
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  if (start && end && start.toDateString() !== end.toDateString()) {
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }

  return formatter.format(start ?? end ?? new Date());
}
