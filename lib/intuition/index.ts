import { foundations } from "./foundations";
import { models } from "./models";
import { modern } from "./modern";
import { networks } from "./networks";
import { vision } from "./vision";
import { textBasics } from "./text-basics";
import { textPieces } from "./text-pieces";
import { segmentation } from "./segmentation";
import { wordVectors } from "./word-vectors";
import { representations } from "./representations";
import type { LessonIntuition } from "./types";

export const lessonIntuitions: Record<string, LessonIntuition> = {
  ...foundations,
  ...models,
  ...modern,
  ...networks,
  ...vision,
  ...textBasics,
  ...textPieces,
  ...segmentation,
  ...wordVectors,
  ...representations,
};
