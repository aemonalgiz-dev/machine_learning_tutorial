// The handful of facts about the site that more than one page states.

export const SITE_NAME = "Perceptron Lab";
export const SITE_ORIGIN = "https://perceptronlab.dev";
export const SITE_TITLE = `${SITE_NAME}: Machine Learning for Everyone`;
export const SITE_DESCRIPTION =
  "Machine learning explained through the problems each method was developed to solve, with interactive examples and Python challenges to work through the ideas yourself.";
export const SITE_SOCIAL = {
  type: "website" as const,
  siteName: SITE_NAME,
  images: [{
    url: "/branding/perceptron-lab-banner.png",
    width: 2048,
    height: 768,
    alt: SITE_TITLE,
  }],
};

export const REPOSITORY = "https://github.com/aemonalgiz-dev/oop_ml";

// The shared support destination, with an optional deployment override.
export const PATREON_URL =
  process.env.NEXT_PUBLIC_PATREON_URL?.trim() || "https://www.patreon.com/JeffreyGordon";

// The home page's coffee invitation leads to the same Patreon memberships.
export const COFFEE_URL = PATREON_URL;
