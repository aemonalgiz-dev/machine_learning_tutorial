import { CURRICULUM } from "../curriculum";
import { foundations } from "./foundations";
import { models } from "./models";
import { vision } from "./vision";
import { networks } from "./networks";
import { language } from "./language";
import { representations } from "./representations";
import { modern } from "./modern";
export { passed, format } from "./types";
export type { Mission, Values, Control, Result, Scene } from "./types";

export const missions = [...foundations, ...models, ...vision, ...networks, ...language, ...representations, ...modern];
export const missionById = Object.fromEntries(missions.map(m => [m.id, m]));
export const labHref = (id: string) => id === "neurons-and-activations" ? "/lab/neuron" : `/lab/${id}`;
export const labLessons = CURRICULUM.flatMap(part => part.topics.flatMap(topic => topic.concepts.flatMap(lesson => lesson.href ? [{ id: lesson.href.split("/").pop()!, href: lesson.href, title: lesson.title, section: part.title }] : [])));
export const labLessonById = Object.fromEntries(labLessons.map(lesson => [lesson.id, lesson]));
