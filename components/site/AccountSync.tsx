"use client";

import { useEffect } from "react";
import Link from "next/link";
import { startAccountSync, useAccount } from "@/lib/accounts";
import { RewardsChip } from "./RewardsChip";

export function AccountSync() {
  useEffect(startAccountSync, []);
  const account = useAccount();
  return <Link href="/account#achievements" data-testid="account-sync" data-sync-status={account.sync} data-state-ready={account.learnerStateReady} className="text-sm font-semibold text-accent hover:underline">
    <RewardsChip fallback={account.user ? account.sync === "error" ? "Work needs syncing" : "My progress" : "Account"} />
  </Link>;
}
