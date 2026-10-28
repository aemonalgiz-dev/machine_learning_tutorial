"use client";
import { useEffect } from "react";
import { useAccount } from "@/lib/accounts";
const key = "fitlab.practice.return";
const safe = (path: unknown): path is string => typeof path === "string" && (path === "/membership" || /^\/practice(?:\/[a-z][a-z0-9-]*--\d{2}--(?:quiz|code|workshop))?$/.test(path));
export function PracticeReturn() {
    const account = useAccount();
    useEffect(() => {
        try {
            const requested = new URLSearchParams(location.search).get("returnTo");
            if (safe(requested))
                sessionStorage.setItem(key, JSON.stringify({ path: requested, time: Date.now() }));
            if (account.status !== "ready" || !account.user)
                return;
            const pending = JSON.parse(sessionStorage.getItem(key) ?? "null");
            if (pending && safe(pending.path) && typeof pending.time === "number" && Date.now() - pending.time < 15 * 60 * 1000) {
                sessionStorage.removeItem(key);
                location.replace(pending.path);
            }
        }
        catch { /* Account access remains available if session storage is blocked. */ }
    }, [account.status, account.user]);
    return null;
}
