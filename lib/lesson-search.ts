export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  areaId: string;
  areaTitle: string;
  sectionTitle: string;
  kind: "Section" | "Lesson";
  terms: string;
}

const normalise = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function searchLessons(entries: SearchEntry[], query: string, areaId = ""): SearchEntry[] {
  const phrase = normalise(query);
  const words = phrase.split(" ").filter(Boolean);
  return entries.filter(entry => {
    if (areaId && entry.areaId !== areaId) return false;
    const text = normalise(`${entry.title} ${entry.description} ${entry.sectionTitle} ${entry.terms}`);
    return words.every(word => text.includes(word));
  }).sort((a, b) => {
    if (!phrase) return 0;
    const score = (entry: SearchEntry) => {
      const title = normalise(entry.title);
      return title === phrase ? 100 : title.includes(phrase) ? 50 : words.filter(word => title.includes(word)).length;
    };
    return score(b) - score(a);
  });
}
