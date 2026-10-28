import type { Metadata } from "next";
import { PracticeMembership } from "@/components/membership/PracticeMembership";

export const metadata: Metadata = { title: "Practice membership · Perceptron Lab", description: "Monthly and annual membership for additional practice problems. The course and free account saving remain available to everyone." };

export default function MembershipPage() {
  return <div className="mx-auto max-w-3xl space-y-7 px-6 py-12">
    <header className="space-y-3"><p className="game-eyebrow">Keep working through the ideas</p><h1 className="text-3xl font-semibold">Practice membership</h1></header>
    <PracticeMembership />
  </div>;
}
