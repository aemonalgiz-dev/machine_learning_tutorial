import type { Metadata } from "next";
import Link from "next/link";
import { AccountActivity } from "@/components/practice/AccountPractice";
export const metadata: Metadata = { title: "Account practice | FitLab", robots: { index: false, follow: false } };
export default async function Page({ params }: {
    params: Promise<{
        activity: string;
    }>;
}) {
    const { activity } = await params;
    return <article className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6"><Link className="inline-block min-h-9 text-sm text-accent underline" href="/practice">← Practice library</Link><AccountActivity id={activity}/></article>;
}
