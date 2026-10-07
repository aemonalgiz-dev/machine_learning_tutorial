export interface HistorySource {
  title: string;
  url: string;
}

export type HistoryBlock = string | {
  items: { name: string; explanation: string }[];
};

export interface LessonHistory {
  title: string;
  sources: HistorySource[];
  blocks: HistoryBlock[];
}

export function source(title: string, url: string): HistorySource {
  return { title, url };
}

export function history(
  title: string,
  sources: HistorySource[],
  ...blocks: HistoryBlock[]
): LessonHistory {
  return { title, sources, blocks };
}
