// The handful of facts about the site that more than one page states.

export const REPOSITORY = "https://github.com/aemonalgiz-dev/oop_ml";

// The shared support destination, with an optional deployment override.
export const PATREON_URL =
  process.env.NEXT_PUBLIC_PATREON_URL?.trim() || "https://www.patreon.com/JeffreyGordon";

// The home page's coffee invitation leads to the same Patreon memberships.
export const COFFEE_URL = PATREON_URL;
