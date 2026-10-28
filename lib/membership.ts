/** Paid access comes from the account service, never from browser storage. */
export interface PracticeMembership {
  practiceAccess: boolean;
  plan: "free" | "practice";
  status: "active" | "inactive";
  validUntil: number | null;
}

export const FREE_MEMBERSHIP: Readonly<PracticeMembership> = Object.freeze({
  practiceAccess: false,
  plan: "free",
  status: "inactive",
  validUntil: null,
});

/** Missing, malformed and expired entitlements keep free account features. */
export function readMembership(value: unknown, now = Date.now() / 1000): PracticeMembership {
  if (!value || typeof value !== "object") return { ...FREE_MEMBERSHIP };
  const membership = value as Partial<PracticeMembership>;
  const until = membership.validUntil;
  if (membership.practiceAccess !== true || membership.plan !== "practice" || membership.status !== "active" ||
    typeof until !== "number" || !Number.isSafeInteger(until) || until <= now || until > 253402300799) {
    return { ...FREE_MEMBERSHIP };
  }
  return { practiceAccess: true, plan: "practice", status: "active", validUntil: until };
}
