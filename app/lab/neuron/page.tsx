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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/lab" className="text-muted hover:text-foreground">← All workshops</Link>
        <Link href="/concepts/neurons-and-activations#history" className="text-accent underline underline-offset-4">Read the neuron lesson</Link>
      </div>
      <header className="mb-3">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">Botie&apos;s workshop · neurons and activations</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Build a Light-Pattern Detector</h1>
      </header>
      <WorkshopJourney data={journeyFor("neurons-and-activations")} />
    </div>
  );
}
