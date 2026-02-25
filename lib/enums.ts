export const subjects = ["ENGLISH", "MATH", "IT", "MENTAL"] as const;
export const gradeGroups = ["G1_4", "G5_7", "G8_9", "G10_11"] as const;
export const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"] as const;
export const formats = ["ONLINE", "OFFLINE", "STAGED"] as const;
export const olympiadLevels = ["A2", "B1", "B2", "C1"] as const;
export const olympiadStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const registrationStatuses = [
  "NEW",
  "REGISTERED",
  "CONTACTED",
  "PAID",
  "CONFIRMED",
  "RESULTS_READY",
  "ATTENDED",
  "REJECTED",
  "CANCELLED"
] as const;
export const articleStatuses = ["DRAFT", "PUBLISHED"] as const;

export type Subject = (typeof subjects)[number];
export type GradeGroup = (typeof gradeGroups)[number];
export type Grade = (typeof grades)[number];
export type Format = (typeof formats)[number];
export type OlympiadLevel = (typeof olympiadLevels)[number];
export type OlympiadStatus = (typeof olympiadStatuses)[number];
export type RegistrationStatus = (typeof registrationStatuses)[number];
export type ArticleStatus = (typeof articleStatuses)[number];
