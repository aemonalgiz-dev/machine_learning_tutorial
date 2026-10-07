import { foundations } from "./foundations";
import { models } from "./models";
import { networks } from "./networks";
import { modern } from "./modern";
import { textBasics } from "./text-basics";
import { textPieces } from "./text-pieces";
import { segmentation } from "./segmentation";
import { wordVectors } from "./word-vectors";
import { representations } from "./representations";
import { vision } from "./vision";
import type { LessonHistory } from "./types";

export const lessonHistories = {
  ...foundations,
  ...models,
  ...networks,
  ...modern,
  ...textBasics,
  ...textPieces,
  ...segmentation,
  ...wordVectors,
  ...representations,
  ...vision,
} satisfies Record<string, LessonHistory>;

export type HistoryLessonId = keyof typeof lessonHistories;
