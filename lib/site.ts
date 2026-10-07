// The handful of facts about the site that more than one page states.

export const REPOSITORY = "https://github.com/aemonalgiz-dev/oop_ml";

// The optional coffee link on the home page. Empty until there is somewhere
// to send people, so the line stays as plain words rather than a broken link.
export const COFFEE_URL = "";

// Set this when the Patreon page is ready. Until then the header displays
// the support message as text, without sending readers to an unfinished page.
export const PATREON_URL = process.env.NEXT_PUBLIC_PATREON_URL?.trim() ?? "";
