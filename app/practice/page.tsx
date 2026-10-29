import type { Metadata } from "next";
import { PracticeLibrary } from "@/components/practice/AccountPractice";
export const metadata: Metadata = { title: "Additional practice | Perceptron Lab", description: "More problems to work through after a lesson. A paid membership includes access; the main course and account saving are free." };
export default function Page() { return <article className="mx-auto max-w-5xl space-y-6 px-5 py-10"><header><h1 className="text-3xl font-semibold">Additional practice</h1></header><PracticeLibrary /></article>; }
