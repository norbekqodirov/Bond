export function normalizePhone(input: string) {
  const trimmed = input.trim();
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  if (!cleaned) {
    return "";
  }
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  if (cleaned.startsWith("00")) {
    return `+${cleaned.slice(2)}`;
  }
  return `+${cleaned.replace(/[^\d]/g, "")}`;
}

export function getPhoneCandidates(input: string) {
  const normalized = normalizePhone(input);
  const digits = normalized.replace(/[^\d]/g, "");
  const withPlus = digits ? `+${digits}` : normalized;
  const candidates = [normalized, withPlus, digits].filter(Boolean);
  return Array.from(new Set(candidates));
}
