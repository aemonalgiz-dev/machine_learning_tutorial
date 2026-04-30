import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { CommitteePlayground } from "@/components/widgets/CommitteePlayground";

export const metadata: Metadata = {
  title: "Bagging · oop_ml",
  description:
    "Grow many deep trees, each on its own resample of the data, and let them vote, so no single tree's memorising decides the answer.",
};

export default function BaggingPage() {
  return (
    <ConceptPage
      title="Bagging"
      tagline="Grow many deep trees, each on its own resample of the data, and let them vote."
      prerequisites={
        <>
          This page picks up where{" "}
          <Link
            href="/concepts/decision-trees"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            decision trees
          </Link>{" "}
          ended, a deep tree memorising its crowd, and the sampling picture from
          the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>{" "}
          does real work here.
        </>
      }
      history={
        <>
          <p>
            The trees page ended on a deep tree memorising its crowd, and in
            the early 1990s Leo Breiman put his finger on why the failure is so
            stubborn. A deep tree is unstable. Change a handful of the people
            it trains on and its first question can change, and with it every
            question below, so two trees grown on nearly the same data can
            disagree about whole regions of the plane. Instability looks like
            a pure defect, and Breiman&rsquo;s move, published as bagging in
            1996, was to spend it instead of suffering it. If small changes in
            the data produce meaningfully different trees, then many resamples
            of the data produce a whole committee of different trees, and a
            committee can vote. The individual trees remain overgrown
            memorisers. The vote is what changes character.
          </p>
        </>
      }
      playground={<CommitteePlayground kind="bagging" />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The crowd above is the trees page&rsquo;s tangled one, and the
                slider now controls how many trees are grown rather than how
                deep one may go. Every tree here grows to full depth, the very
                setting the trees page warned about, so start the slider at 1
                and you are looking at one memoriser&rsquo;s confetti, slivers
                of territory fenced around single people.
              </p>
              <p>
                Now drag the slider up and watch the regions change character.
                Each tree grows on its own resample of the crowd, so each
                memorises slightly different accidents, and the shading shows
                their majority verdict at every spot. The confetti dissolves,
                because a sliver of territory that only one tree believes in
                loses the vote, while the broad shapes every tree agrees on,
                children low and left, adults high and right, survive
                untouched. The committee keeps what its members share and
                discards what they privately invented.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The committee needs its members to differ, and the tool for
                that is the bootstrap resample, which is the statistics
                primer&rsquo;s sampling picture pointed at our own data. To
                build one member&rsquo;s training set, draw from the crowd of
                25 people 25 times with replacement, meaning a person can be
                drawn twice, or three times, or not at all. Each member then
                grows an ordinary deep tree on its own draw, and a prediction
                is made by putting the question to every member and taking the
                majority.
              </p>
              <p>
                The with-replacement detail carries arithmetic worth doing
                once. Any given person dodges any given draw with probability
                24 over 25, and dodges all 25 draws with that probability
                multiplied out.
              </p>
              <Equation>{"(24/25)²⁵ ≈ 0.36"}</Equation>
              <p>
                So each resample silently leaves out about a third of the
                crowd, nine people or so of our 25, and a different nine each
                time. That absence looks like waste, and the next section
                spends it.
              </p>
            </>
          ),
        },
        {
          title: "The Free Honest Score",
          content: (
            <>
              <p>
                Several pages now have ended on the same confession, that
                judging a model honestly needs data the fit never saw, and
                none of them had any. Bagging is the first model on this site
                that manufactures its own. Every person was left out of about
                a third of the resamples, so for every person there stands a
                third of the committee that never trained on them. Ask only
                those trees, and the person is held-out data with respect to
                exactly the members judging them. Score everyone that way and
                you have the out-of-bag score, an honest estimate that cost
                nothing extra.
              </p>
              <p>
                The two readouts above put the honest number next to the
                flattering one. On the tangled crowd at 25 trees the training
                accuracy reads 0.960, and the out-of-bag score reads 0.640.
                That gap is not a defect in bagging, it is the truth about
                this crowd. The tangled teenagers were built to be nearly
                noise, and a committee cannot learn what is not there to
                learn. What the committee refuses to do is what the lone deep
                tree did, score itself 1.000 on people it memorised and call
                that skill.
              </p>
            </>
          ),
        },
        {
          title: "Why the Vote Works, and Where It Stops",
          content: (
            <>
              <p>
                The vote works for the statistics primer&rsquo;s oldest
                reason. Each member&rsquo;s answer is signal plus its own
                private error, the accidents of its particular resample, and
                averaging many draws shrinks the scatter of private errors
                the way the sample mean settled toward the true one. The
                signal is shared, so it survives. The errors are private, so
                they cancel. Variance is bought down without touching the
                members themselves.
              </p>
              <p>
                The cancelling only reaches the errors that really are
                private, though, and the last two readouts show the limit.
                Of the 25 trees above, 20 open with a question about height.
                Grown on different resamples, the members still see the same
                crowd shape, so they still largely think alike, and mistakes
                the whole committee shares survive every vote you could hold.
                Making the members genuinely unlike each other takes one more
                idea, and it is the next page,{" "}
                <Link
                  href="/concepts/random-forests"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  random forests
                </Link>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
