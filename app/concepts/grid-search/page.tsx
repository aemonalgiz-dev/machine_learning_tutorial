import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { OptimismChart } from "@/components/widgets/OptimismChart";
import { SearchCurveChart } from "@/components/widgets/SearchCurveChart";

export const metadata: Metadata = {
  title: "Searching for a Setting · oop_ml",
  description:
    "A model has dials no fit can set, and trying every setting and keeping the best is the obvious move. The number the winner reports is flattering, by an amount this page measures.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GridSearchPage() {
  return (
    <ConceptPage
      title="Searching for a Setting"
      tagline="Try every setting, keep the best, and then distrust the number it reports."
      prerequisites={
        <>
          The folding this page searches inside comes from the{" "}
          <Link href="/concepts/held-out-evaluation" className={linkClass}>
            held-out evaluation
          </Link>{" "}
          page, and the dial being searched over is the k of{" "}
          <Link href="/concepts/k-nearest-neighbours" className={linkClass}>
            k-nearest neighbours
          </Link>
          .
        </>
      }
      history={
        <>
          <p>
            Every model on this site has numbers a fit cannot choose. The
            penalty on the ridge page, the depth of a tree, the k of nearest
            neighbours: the fitting procedure takes them as given and optimises
            everything else. They are called hyperparameters for that reason,
            and the obvious way to set them is to try a list and keep whichever
            scored best, which is called a grid search because a list per dial
            makes a lattice of combinations.
          </p>
          <p>
            The catch was understood early and named late. Selecting on a score
            makes that score optimistic, because the maximum of several noisy
            estimates is systematically higher than the thing it estimates. The
            statistical literature has worried about it since at least the
            1970s, and the machine learning correction is nested
            cross-validation, described by Sudhir Varma and Richard Simon in a
            2006 paper whose title says it plainly, &ldquo;Bias in error
            estimation when using cross-validation for model selection&rdquo;.
            Their measurements on gene expression data found the selected score
            optimistic by enough to change which method looked better. The
            effect is not exotic and it is not small, and this page measures it
            rather than asserting it.
          </p>
        </>
      }
      playground={<SearchCurveChart />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The chart above searches one dial. Twelve people sit roughly
                along a line, three of them are put aside untouched, and the
                remaining nine are folded three ways. Every neighbour count from
                one to five is scored by fitting on two folds and judging on the
                third, three times over, and the mean of those three is the
                candidate&rsquo;s score. The winner is ringed.
              </p>
              <p>
                Two more things are drawn, and they are the reason the chart is
                worth looking at rather than just reading the winner off. The
                small grey dots behind each candidate are its individual fold
                scores, and they are scattered: at four neighbours the three
                folds score 0.6498, 0.8394 and 0.5283, which average to 0.6725.
                A candidate&rsquo;s score is a mean of three noisy numbers, not
                a measurement of anything precise.
              </p>
              <p>
                The dashed amber line is what the winner scores on the three
                people held back from the search entirely. It sits below the
                ringed dot. That gap is not a mistake in the search and it does
                not go away if you search more carefully. It is what the rest of
                the page is about.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A search takes a model with a dial, a list of values for it, and
                a way of scoring. For each value it rebuilds the model from
                scratch, folds the data, fits and judges once per fold, and
                averages. It keeps the value whose average was highest.
              </p>
              <Equation>{"for each candidate value v\n    for each fold f\n        fit on the other folds with the dial at v\n        score on fold f\n    candidate score = mean of the fold scores\n\nwinner = the v with the highest candidate score"}</Equation>
              <p>
                Two details in that loop are easy to get wrong and both are
                worth stating. The first is that the folds must be the same for
                every candidate. If each candidate is scored on a fresh deal of
                the folds, then the differences between candidates include the
                differences between deals, and a search can prefer one setting
                over another for reasons that have nothing to do with the
                setting. The library draws one seed per search and pins it,
                after a version that did not: an unseeded shuffling fold dealt
                new folds on every call, so every candidate was judged on
                different data. The detector for it is neat, two copies of the
                same configuration in one search must tie exactly.
              </p>
              <p>
                The second is that a candidate has to be built through the
                ordinary constructor rather than patched. A model built by
                copying another and overwriting a field can accept a misspelled
                field name silently, leaving the original value in place, so a
                search over a misspelling would fit the same configuration at
                every point and report a perfectly flat curve. The library
                checks the field name against the model when the range is
                built, so the misspelling fails immediately rather than
                producing a plausible flat answer.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                The search above can be done by hand, and one fold at one
                setting is enough to see the whole shape of it. Nine people are
                searched over, dealt into three folds of three. The second fold
                holds the people at x = 1.4, 5.2 and 7.3, whose targets are 3,
                11 and 16.
              </p>
              <p>
                Judging a fold means comparing those three targets against what
                a model fitted on the other six predicts, and expressing the
                comparison as a score. The score is one minus the ratio of what
                the model got wrong to what there was to get wrong, so first the
                denominator: the three targets average 10, and their squared
                distances from that average are 49, 1 and 36.
              </p>
              <Equation>{"targets   3,  11,  16        mean 10\nspread    49 + 1 + 36  =  86"}</Equation>
              <p>
                Now the numerator, at two neighbours. Each held-out person is
                predicted by averaging the targets of the two nearest people in
                the fitting folds, which gives 4, 9 and 16.5, so the misses are
                1, 2 and 0.5.
              </p>
              <Equation>{"predicted  4,   9,   16.5\nmissed by  1,   2,   0.5\nsquared    1  + 4  + 0.25  =  5.25\n\nfold score  =  1 − 5.25 / 86  =  0.9390"}</Equation>
              <p>
                The other two folds score 0.9426 and 0.9258 by the same
                arithmetic, and their mean, 0.9358, is what the chart plots at
                two neighbours. Doing it for all five settings gives 0.9115,
                0.9358, 0.7869, 0.6725 and 0.3092, so two neighbours wins. The
                spread from best to worst is 0.6266, which is large, and that
                matters: a spread of a few thousandths would mean the search had
                no real preference and the winner was a coin toss.
              </p>
              <p>
                And the winner, taken to the three people who were never part of
                the search, scores 0.7454 rather than the 0.9358 it claimed.
              </p>
            </>
          ),
        },
        {
          title: "The Winner Is Flattering",
          content: (
            <>
              <p>
                One gap on one small search proves nothing; it could be those
                three particular people. To measure the effect properly you need
                a case where the right answer is known in advance, and the
                cleanest such case is data where nothing can be learned at all.
                The chart below searches twenty-five neighbour counts against a
                target that is pure noise, unrelated to any of its four
                features.
              </p>
              <OptimismChart />
              <p>
                Because there is no signal, no setting can honestly beat a score
                of zero, and the horizontal line marks that ceiling. Every
                candidate is below it, as it must be. But look at the winner
                against the mean candidate: on the opening draw the winner
                reports −0.1061 where the average candidate manages −0.2836. The
                search has found a setting that looks three times less bad than
                typical, on data with nothing in it to find.
              </p>
              <p>
                The dashed line settles what that means. It is the same winning
                setting, scored again with the folds dealt differently, and it
                comes out at −0.1482. The setting did not get better; the score
                did, because the score was the maximum of twenty-five noisy
                numbers and a maximum is biased upward. Press draw again a few
                times and the individual figures move around while the direction
                does not. Averaged over twelve draws the winner&rsquo;s score is
                flattering by 0.0381.
              </p>
              <p>
                The first attempt to measure this in the library got a negative
                answer, which is worth knowing about. Ten ridge penalties on
                data with real signal gave an optimism of −0.0175, apparently
                showing the effect running backwards. The reason is that with
                few candidates and a smooth curve, the noise between fold deals
                is larger than the selection bias, so it drowns it. The effect
                needs many candidates over something that cannot be learned,
                which is exactly what this chart is, and that is why the
                measurement is built the way it is rather than on the friendlier
                fixture.
              </p>
              <p>
                The practical rule follows. The winner&rsquo;s own score is a
                selection score and should not be quoted as performance. Quote
                the score on data the search never touched, which is the dashed
                line on the first chart, and quote the spread alongside it so a
                reader can tell a real preference from a coin toss. Doing this
                properly and systematically is nested cross-validation, and the
                library documents the bias and offers the honest score without
                yet stopping a caller from quoting the flattering one.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The bias is not subtle once written down. Suppose each candidate
                has a true quality, and the score you measure is that quality
                plus some noise from the particular fold deal. Selecting the
                largest measured score selects partly for quality and partly for
                a lucky deal, and the two cannot be told apart from the
                measurement.
              </p>
              <Equation>{"measured   sᵢ = qᵢ + eᵢ        eᵢ noise, averaging zero\n\nE[ max sᵢ ]  ≥  max qᵢ"}</Equation>
              <p>
                The inequality holds for any noise at all with mean zero, and it
                is strict whenever the noise is genuinely random and more than
                one candidate is near the top. The argument is one line: the
                maximum of the sums is at least the sum at whichever index
                maximises the qualities, so the expected maximum is at least
                that quality plus the expected noise there, which is zero. Every
                other index can only push it higher.
              </p>
              <p>
                Two consequences the chart shows. The bias grows with the number
                of candidates, because more draws from the noise means a larger
                expected maximum, which is why twenty-five settings show it
                clearly and five barely do. And it grows with the size of the
                noise, which shrinks as the folds get larger, which is why the
                effect is worst exactly where data is scarcest and a search
                feels most necessary.
              </p>
              <p>
                The fix follows from the same line. The bias comes from
                measuring and selecting on the same numbers, so the repair is to
                score the winner on numbers that took no part in choosing it.
                That is all a held-out quarter is, and all nested
                cross-validation is, done repeatedly so the estimate is not
                itself at the mercy of one deal.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
