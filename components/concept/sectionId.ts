// Shared by headings and their links so a lesson can be bookmarked at any depth.
export function sectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
