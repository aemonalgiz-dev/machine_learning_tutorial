import type { Metadata } from "next";
import { WorkshopJourney } from "@/components/lab/WorkshopJourney";
import { journeyFor } from "@/lib/builds/journey";
export const metadata:Metadata={title:"Getting started with Botie | FitLab",description:"Meet Botie, learn to place tools and connect their inputs, then build and test your first machine."};
export default function WorkshopGuide(){return <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><header className="mb-7 max-w-3xl"><p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">Welcome to Botie&apos;s workshop</p><h1 className="text-4xl font-bold tracking-tight">Let’s build something with Botie.</h1><p className="mt-4 text-lg leading-8 text-muted">A machine needs more than an answer. It needs a way to arrive at that answer when the input changes. We will start with a small problem and learn how to give it those instructions.</p></header><WorkshopJourney data={journeyFor("workshop-guide")}/></article>;}
