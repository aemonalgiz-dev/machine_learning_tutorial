import type { Metadata } from "next";
import { PracticeLibrary } from "@/components/practice/AccountPractice";
export const metadata: Metadata = { title: "More practice with Botie | Perceptron Lab", description: "Additional quizzes, programming problems and Botie workshops for your Perceptron Lab account." };
export default function Page() { return <article className="mx-auto max-w-5xl space-y-6 px-5 py-10"><header className="space-y-3"><h1 className="text-3xl font-semibold">More time at Botie’s workbench</h1><p className="max-w-3xl text-lg leading-8 text-muted">A method can make sense when you read it and still surprise you when the inputs change. Pick a problem, make a prediction, then write the calculation or build it with Botie.</p></header><PracticeLibrary /></article>; }
