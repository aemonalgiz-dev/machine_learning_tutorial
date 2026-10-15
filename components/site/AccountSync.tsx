"use client";

import { useEffect } from "react";
import Link from "next/link";
import { startAccountSync, useAccount } from "@/lib/accounts";
import { useLearnerStorageStatus } from "@/lib/learner-state";

export function AccountSync() {
  useEffect(startAccountSync, []);
  const account = useAccount();
  const { conflicts, storageFailed } = useLearnerStorageStatus();
  return <Link href="/account" className="text-sm font-semibold text-accent hover:underline">
    {account.user ? conflicts.length ? "Review saved work" : account.sync === "error" || storageFailed ? "Work needs syncing" : "My progress" : "Account"}
  </Link>;
}
