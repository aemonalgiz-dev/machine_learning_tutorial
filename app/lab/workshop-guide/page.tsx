import type { Metadata } from "next";
import { WorkshopOnboarding } from "@/components/lab/WorkshopOnboarding";
import { buildById } from "@/lib/builds/catalog";
export const metadata:Metadata={title:"Getting started with Botie | Perceptron Lab",description:"Meet Botie, learn to place tools and connect their inputs, then build and test your first machine."};
export default function WorkshopGuide(){return <article className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><header className="mb-5 max-w-3xl"><p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">Welcome to Botie&apos;s workshop</p><h1 className="text-3xl font-bold tracking-tight">Let’s connect your first machine.</h1><p className="mt-3 text-base leading-7 text-muted">Botie has left one wire for you. Connect it, see what changes, then build a machine of your own.</p></header><WorkshopOnboarding originalBuild={buildById["workshop-guide"]}/></article>;}
