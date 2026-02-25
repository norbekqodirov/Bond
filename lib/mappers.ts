import { EventStatus, EventType, Locale } from "@prisma/client";

export const eventTypeMap: Record<string, EventType> = {
  olympiad: EventType.OLYMPIAD,
  contest: EventType.CONTEST,
  camp: EventType.CAMP,
  travel: EventType.TRAVEL
};

export const eventStatusMap: Record<string, EventStatus> = {
  draft: EventStatus.DRAFT,
  pending: EventStatus.PENDING,
  published: EventStatus.PUBLISHED,
  archived: EventStatus.ARCHIVED
};

export const localeMap: Record<string, Locale> = {
  uz: Locale.UZ,
  ru: Locale.RU,
  en: Locale.EN
};

export const subjectMap: Record<string, string> = {
  english: "ENGLISH",
  math: "MATH",
  it: "IT",
  mental: "MENTAL"
};

export const gradeGroupMap: Record<string, string> = {
  g1_4: "G1_4",
  g5_7: "G5_7",
  g8_9: "G8_9",
  g10_11: "G10_11"
};

export const olympiadFormatMap: Record<string, string> = {
  online: "ONLINE",
  offline: "OFFLINE",
  staged: "STAGED"
};

export const olympiadLevelMap: Record<string, string> = {
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1"
};
