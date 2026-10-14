// What the site records about readers. It describes instrumentation-client.ts
// and app/site-activity/route.ts, and has to change whenever they do.

import type { Metadata } from "next";
import { ActivityOptOut } from "@/components/site/ActivityOptOut";
import { ACTIVITY_RETENTION_DAYS } from "@/lib/activity";
import { REPOSITORY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy · FitLab",
  description: "What FitLab records about reading, why, how long it is kept, and how to switch it off.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[45rem] space-y-6 px-6 py-12 leading-relaxed">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy</h1>
        <p className="mt-4 text-lg text-muted">
          FitLab has no advertising and no tracking cookies, and I don&rsquo;t sell or share anything about the people
          who read it. This page says what the site does record and why.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">What the Site Counts</h2>
        <p>
          I want to know which lessons people read, how long they spend on them, and where they get stuck, so that I
          can make the lessons better. To learn that, each page reports a few facts back to this site, and to nobody
          else, while you read it. It sends the page&rsquo;s address, how long the page was in front of you while you
          were using it, whether you finished one of its quizzes or coding challenges, the name of the site that
          linked you here, and whether you are on a phone, a tablet or a computer. The server adds the country your
          connection appears to come from.
        </p>
        <p>
          Nothing is stored on your device for this, no cookie and no identifier. To count how many people visit in a
          day without one, the server combines your connection&rsquo;s address and your browser&rsquo;s description
          with the date and a random value that changes whenever the site is updated, and keeps only a short scrambled
          code made from them. The address and the browser description are never written down, and the code is
          different every day, so it can&rsquo;t be used to follow you from one day to the next.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Where It Goes and How Long It Stays</h2>
        <p>
          These records are kept in Amazon Web Services&rsquo; CloudWatch logs in my own AWS account, and I use them
          only for totals on my own dashboard, such as visitors per day and the most-read lessons. They are deleted
          after {ACTIVITY_RETENTION_DAYS} days. Like any web host, Amazon also keeps its own logs of requests to the
          site, and those do include addresses.
        </p>
        <p>
          Your progress through the lessons is kept in your own browser&rsquo;s storage, so the site can show you what
          you have finished. It isn&rsquo;t sent to me.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Switching It Off</h2>
        <p>
          If your browser sends Global Privacy Control or Do Not Track, nothing is counted. You can also switch
          counting off for this browser here. That choice is the only thing this page stores on your device, and only
          once you make it.
        </p>
        <ActivityOptOut />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Questions</h2>
        <p>
          If you have a question about any of this, you can reach me through the{" "}
          <a href={REPOSITORY} className="text-accent underline-offset-4 hover:underline">
            project&rsquo;s repository
          </a>
          .
        </p>
      </section>
    </article>
  );
}
