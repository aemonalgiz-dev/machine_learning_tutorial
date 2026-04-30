import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { CommitteePlayground } from "@/components/widgets/CommitteePlayground";

export const metadata: Metadata = {
  title: "Random Forests · oop_ml",
  description:
    "The bagged committee with disagreement built in, each split offered only a random subset of the features.",
};

export default function RandomForestsPage() {
  return (
    <ConceptPage
      title="Random Forests"
      tagline="The bagged committee with disagreement built in, one random subset of features per question."
      prerequisites={
        <>
          This page changes one rule of{" "}
          <Link
            href="/concepts/bagging"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            bagging
          </Link>
          , so read that page first, including its closing count of how alike
          the bagged trees turned out to be.
        </>
      }
      history={
        <>
          <p>
            Bagging ended on its own limit. The committee cancels the errors
            its members make privately, though members grown on resamples of
            the same crowd still think largely alike, and errors the whole
            committee shares survive every vote. Tin Kam Ho had shown in 1995
            that trees could be decorrelated by training them in randomly
            chosen subspaces of the features, and Leo Breiman folded that idea
            into the bagged committee in 2001, hiding features from each
            split rather than each tree. He called the result a random forest,
            and it became for years the first serious model anyone threw at a
            new dataset, strong out of the box with hardly any tuning.
          </p>
          <p>
            The change to bagging is one sentence. At every split of every
            tree, instead of letting the search consider every feature, offer
            it a random subset and make it choose from that. Everything else,
            the resamples, the deep trees, the vote, the out-of-bag score,
            carries over unchanged.
          </p>
        </>
      }
      playground={<CommitteePlayground kind="random-forest" />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The widget is the bagging page&rsquo;s with the new rule
                switched on. Here every split is offered exactly one of the
                two features, chosen at random, so a tree that would always
                have asked about height first is regularly forced to open
                with weight instead, and the trees below it diverge from
                there.
              </p>
              <p>
                Think of it as a committee rule against groupthink. Bagging
                varied what each member had seen, and the forest also varies
                what each member is allowed to consider, the way a panel
                forces out a second opinion by telling some members they may
                not use the obvious argument. The members get individually
                worse, since they are sometimes denied the best question,
                and the committee is betting that their added disagreement
                is worth more than their lost skill.
              </p>
            </>
          ),
        },
        {
          title: "Reading the Census",
          content: (
            <>
              <p>
                The last two readouts make the manufactured disagreement
                countable. On the tangled crowd at 25 trees, the bagging
                page&rsquo;s committee opened 20 of its 25 trees with a
                question about height, one first opinion held almost
                unanimously. The forest&rsquo;s census above reads 8 on
                height and 17 on weight. The committee no longer shares a
                first question, which was the entire point, and every
                disagreement about the first question compounds into deeper
                disagreement below it.
              </p>
              <p>
                Worth noticing honestly, with only two features the rule is
                blunt, a coin flip per split, and the census leans weight
                mostly because the coin denied height often. The rule earns
                its reputation on data with hundreds of features, where each
                split sees a different small handful and strong features
                cannot dominate every tree the same way.
              </p>
            </>
          ),
        },
        {
          title: "What the Bet Buys, and What It Costs",
          content: (
            <>
              <p>
                The bet is variance spent buying decorrelation. Each member,
                denied the best question half the time, fits its own resample
                a little worse, and in exchange the members&rsquo; errors
                overlap less, so the vote cancels more of them. Whether the
                trade profits depends on the data, and this page will not
                pretend otherwise. On our tangled crowd the out-of-bag
                readout above sits near 0.52 where bagging&rsquo;s sat near
                0.64, so here the purchase costs more than it returns. Two
                features give the rule almost no room to work, and the
                tangled teenagers leave little shared error worth cancelling
                in the first place.
              </p>
              <p>
                That result is worth more than a staged success. It says the
                forest is not bagging plus free accuracy, it is a specific
                bet about where your errors come from, and the honest way to
                settle the bet on real data is the out-of-bag score you
                already have. When the features number in the hundreds and
                carry redundant signal, the bet usually pays, which is why
                the forest earned its reputation, and why on a two-feature
                teaching crowd it politely declines to look magical.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
