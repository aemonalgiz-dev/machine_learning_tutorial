"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LegacyCourseLinks({ destinations }: { destinations: Record<string, string> }) {
  const router = useRouter();
  useEffect(() => {
    const follow = () => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      // Only fixed destinations from the curriculum are eligible for navigation.
      const destination = Object.hasOwn(destinations, id) ? destinations[id] : undefined;
      if (destination) router.replace(destination);
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [destinations, router]);
  return null;
}
