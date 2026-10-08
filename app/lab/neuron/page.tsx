import type { Metadata } from "next";
import Link from "next/link";
import { WorkshopJourney } from "@/components/lab/WorkshopJourney";
import { journeyFor } from "@/lib/builds/journey";

export const metadata: Metadata = {
  title: "Build a Light-Pattern Detector | FitLab",
  description: "Build a neuron that recognises a light pattern. Connect brightness readings, weights, a bias and an activation, then follow each contribution.",
};

export default function NeuronLabPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/lab" className="text-muted hover:text-foreground">← All workshops</Link>
        <Link href="/concepts/neurons-and-activations#history" className="text-accent underline underline-offset-4">Read the neuron lesson</Link>
      </div>
      <header className="mb-7 max-w-3xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">Botie&apos;s workshop · neurons and activations</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build a Light-Pattern Detector</h1>
        <p className="mt-4 text-lg leading-7 text-muted">Two light sensors give us brightness readings. How can a neuron use them to recognise a pattern? Let’s build the detector from its weights, bias and activation, one connection at a time.</p>
      </header>
      <WorkshopJourney data={journeyFor("neurons-and-activations")} />
    </div>
  );
}
