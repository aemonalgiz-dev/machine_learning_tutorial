import { NeuronLab } from "@/components/lab/NeuronLab";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/lab/neuron/bench", { title: "Neuron calculation bench | Perceptron Lab", robots: { index: false, follow: true } });
export default function NeuronBenchPage(){return <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Link href="/lab/neuron" className="text-sm text-accent underline">← Return to Botie&apos;s neuron journey</Link><h1 className="mb-6 mt-5 text-3xl font-semibold">Neuron calculation bench</h1><NeuronLab/></article>;}
