import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { KMeansPlayground } from "@/components/widgets/KMeansPlayground";

export const metadata: Metadata = {
  title: "k-Means Clustering · oop_ml",
  description:
    "Sort unlabelled people into k groups by repeating two steps, assign everyone to the nearest centre, then move each centre to the mean of its group.",
};

export default function KMeansPage() {
  return (
    <ConceptPage
      title="k-Means Clustering"
      tagline="Sort unlabelled data into k groups, with nothing but distance and the mean."
      prerequisites={
        <>
          Distance between points comes from the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>{" "}
          and the mean from the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          , and those two ideas are the entire method.
        </>
      }
      history={
        <>
          <p>
            Every page so far was handed its answers. The regression pages knew
            each person&rsquo;s weight and the classification pages knew who
            was a child, so a fit always had something to be right or wrong
            about. A great deal of data arrives with no answers at all,
            measurements of customers, cells, documents, stars, and the
            question changes character. It stops being how do we predict the
            label and becomes whether the data has natural groups in it at
            all, and if so, where.
          </p>
          <p>
            The method on this page was found several times over, which says
            something about how natural it is. Hugo Steinhaus posed it in 1956,
            Stuart Lloyd worked it out at Bell Labs in 1957 as a way of
            choosing signal levels for transmitting speech, though his report
            stayed internal until 1982, and James MacQueen published and named
            k-means in 1967. It remains the first thing anyone runs when they
            suspect their unlabelled data has clumps.
          </p>
        </>
      }
      playground={<KMeansPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Look at what is missing from the box above. Every scatter on
                this site so far coloured its dots before any model arrived,
                fails and passes, children and adults. Here every person
                starts uncoloured, and the colours you see were put there by
                the method, which was told only how many groups to look for.
                The X marks are the groups&rsquo; centres, where each group
                balances.
              </p>
              <p>
                The two clumps of the opening example make the job look easy,
                and for tight clumps it is. Press the crowd button for the
                honest version, the classification pages&rsquo; people with
                their labels stripped away, and notice the method still
                carves confident groups. It always will. Ask for k groups and
                k groups come back, whether or not the data has any, which is
                a property to respect rather than trust.
              </p>
              <p>
                Drag a dot from one clump toward the other and watch the
                colours and centres renegotiate. The groups are not stored
                anywhere. They are re-derived from the geometry every time
                anything moves.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The method is a loop of two steps, and both were built pages
                ago. Start by placing k centres, initially just guesses.
                Then, first step, assign every person to whichever centre is
                nearest, using the linear algebra primer&rsquo;s distance.
                Second step, move each centre to the mean of the people
                assigned to it, the statistics primer&rsquo;s balance point.
                The moved centres change who is nearest to what, so assign
                again, move again, and repeat until nothing changes.
              </p>
              <p>
                Why the mean, and why must the loop settle. Both answers live
                in one number, the inertia, the total squared distance from
                every person to their own centre.
              </p>
              <Equation>{"inertia = Σ (distance from person to their centre)²"}</Equation>
              <p>
                The assignment step can only lower it, since moving a person
                to a nearer centre shrinks their term. The update step can
                only lower it too, because the mean is precisely the point
                that minimises squared distance to a group, which is the
                statistics primer&rsquo;s balance point doing its deepest
                work. A total that only ever falls, over finitely many
                possible groupings, has to come to rest, so the loop always
                settles, and usually within a handful of iterations, as the
                readout above shows.
              </p>
              <p>
                Where it settles depends on where the guessed centres began,
                though, the two-valley lesson of the calculus primer wearing
                new clothes. A bad start can rest in a poor grouping, so the
                library runs the loop from ten different starts and keeps
                whichever rest has the lowest inertia.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the ideal case button, eight people in two tight
                clumps, and set k to 2. The method settles in two iterations,
                and everything it reports can be checked by hand. Each
                resting centre should be the plain mean of its clump, so sum
                the small clump first.
              </p>
              <Equation>{"heights  118 + 120 + 122 + 124 = 484,   484 / 4 = 121\nweights   24 +  25 +  28 +  27 = 104,   104 / 4 =  26"}</Equation>
              <p>
                One centre should rest at (121, 26), and the same arithmetic
                on the tall clump puts the other at (181, 80), which is where
                the two X marks stand. Now the inertia. Within the small
                clump the height deviations from 121 are −3, −1, 1 and 3,
                whose squares sum to 20, and the weight deviations from 26
                are −2, −1, 2 and 1, squares summing to 10. The tall clump
                gives 20 again for heights and 14 for weights.
              </p>
              <Equation>{"inertia = 20 + 10 + 20 + 14 = 64"}</Equation>
              <p>
                The readout above shows 64.0 exactly. A resting k-means is
                nothing more mysterious than groups sitting on their own
                means, close enough to check with pencil arithmetic.
              </p>
            </>
          ),
        },
        {
          title: "What k Cannot Tell You",
          content: (
            <>
              <p>
                One number in this method is never learned, and that is k
                itself. Slide it upward on the worked example and watch the
                inertia readout. At k of 1 it is enormous, since one centre
                must serve both clumps. At 2 it drops to 64, the natural
                grouping found. Keep going and it keeps falling, because
                more centres can only sit closer to people, all the way to an
                inertia of zero when every person gets a private centre. The
                falling number cannot choose k for us, since it always votes
                for more. What practitioners do is watch for the elbow, the
                k where the fall suddenly flattens, here unmistakably at 2,
                and treat the further gains as bookkeeping rather than
                structure.
              </p>
              <p>
                The colours deserve one honest caution too. Group 1 and group
                2 are accidents of seeding, not discoveries, and refitting
                after a change can hand the same clump a different colour.
                The grouping is real, meaning which people ended up together.
                The numbering is not, and nothing downstream should ever
                lean on it.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The mechanism leaned on one claim, that the mean is the point
                minimising the total squared distance to a group, and the
                calculus primer&rsquo;s move settles it in three lines. Work
                one coordinate at a time and ask which centre c makes the
                total smallest.
              </p>
              <Equation>{"T(c) = Σ (xᵢ − c)²\ndT/dc = −2·Σ (xᵢ − c) = 0"}</Equation>
              <p>
                The condition says the deviations from c must cancel exactly,
                the statistics primer&rsquo;s balance point, and solving it
                shows the mean is the only number they cancel around.
              </p>
              <Equation>{"Σ xᵢ − n·c = 0     so     c = (Σ xᵢ) / n"}</Equation>
              <p>
                So the update step is not a heuristic. It is the exact
                minimiser of the very total the method tracks, and with that
                in hand the convergence argument closes properly. The
                assignment step lowers the inertia by moving people to nearer
                centres, the update step lowers it because the mean minimises
                it exactly, and a total that only falls over finitely many
                possible groupings has nowhere to go but to rest. What the
                derivation does not promise is which rest, the two-valley
                caution again, and the restarts exist for precisely that gap.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
