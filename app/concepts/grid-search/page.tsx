import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  InAModel,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { DegreePenaltyGrid } from "@/components/widgets/DegreePenaltyGrid";
import { FoldPinningTable } from "@/components/widgets/FoldPinningTable";
import { NestedSearchTable } from "@/components/widgets/NestedSearchTable";
import { OptimismChart } from "@/components/widgets/OptimismChart";
import { OptimismGrowthTable } from "@/components/widgets/OptimismGrowthTable";
import { SearchCurveChart } from "@/components/widgets/SearchCurveChart";
import { SpaceBuilder } from "@/components/widgets/SpaceBuilder";

export const metadata: Metadata = {
  title: "Searching for a Setting · oop_ml",
  description:
    "A model has dials no fit can set, and trying every setting and keeping the best is the obvious move. The number the winner reports is flattering, by an amount this page measures.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GridSearchPage() {
  return (
    <ConceptPage
      title="Searching for a Setting"
      tagline="Try every setting, keep the best, and then distrust the number it reports."
      prerequisites={
        <>
          The folding this page searches inside comes from the{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation
          </Link>{" "}
          page, and the dial being searched over is the neighbour count of{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>
            k-nearest neighbours
          </Link>
          , used here to predict a person&rsquo;s weight from their height.
          The two-dial grid in Part 2 borrows the{" "}
          <Link href="/concepts/pipelines" className={link}>
            pipelines page
          </Link>
          &rsquo;s habit of making the preprocessing and the model one
          object, so that a polynomial degree and a ridge penalty can be
          searched together.
        </>
      }
      history={
        <>
          <p>
            The problem arrived with ridge regression. Arthur Hoerl and Robert
            Kennard published the method in Technometrics in 1970, and their
            paper left one number, the amount of shrinkage, to be set by
            eye from a plot they called the ridge trace, the coefficients
            drawn against the shrinkage and the reader asked to pick the
            point where they stopped swinging. Nothing in the fit could set
            it, because the fit was what the number changed, and a chemist
            at Du Pont, where Hoerl worked, had no way to check the choice
            except with a second batch of data. Gene Golub, Michael Heath and
            Grace Wahba gave the choice a rule in 1979, in &ldquo;Generalized
            cross-validation as a method for choosing a good ridge
            parameter&rdquo;, which scores each candidate value on rows the
            fit did not see and keeps the best, and that is the loop this
            page runs, with a neighbour count in place of a shrinkage.
          </p>
          <p>
            The catch was named before the rule was. Mervyn Stone&rsquo;s 1974
            paper, &ldquo;Cross-validatory choice and assessment of
            statistical predictions&rdquo;, has both words in its title on
            purpose, and its point is that once held-out scores have been
            used to choose a predictor, they are no longer an assessment of
            it, so an honest assessment of the chosen one needs a further
            layer of holding out around the whole choosing procedure. Sudhir
            Varma and Richard Simon measured how much that matters in 2006,
            in &ldquo;Bias in error estimation when using cross-validation
            for model selection&rdquo;, on gene expression data with a few
            dozen patients and thousands of candidate features, where the
            selected score was optimistic by enough to make a classifier
            with no real signal look useful, and the nested version was not.
            James Bergstra and Yoshua Bengio&rsquo;s 2012 paper on random
            search added the other half of the cost, that a grid over several
            dials spends most of its budget re-measuring the same few values
            of whichever dial actually matters.
          </p>
          <p>
            The page asks six questions in order. What is a dial a fit
            cannot turn, and why can it not? What is a candidate, and what
            does a grid of them cost? How is every candidate scored, and why
            must they all be scored on the same folds? What does the
            winner&rsquo;s score mean, and what does the spread beside it
            say? By how much does that score flatter, measured on a target
            where nothing can be learned? And what number can be quoted
            instead, and what does a second layer of folds buy?
          </p>
        </>
      }
      playground={<SearchCurveChart />}
      sections={[
        {
          title: "Part 1. A Dial No Fit Can Turn",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Twelve people and a neighbour count">
                <p>
                  Twelve people were measured, height in centimetres and
                  weight in kilograms, from 150 centimetres and 50 kilograms
                  up to 183 centimetres and 82 kilograms. To guess a new
                  person&rsquo;s weight from their height, the neighbour
                  method finds the k people closest in height and averages
                  their weights, and everything about that guess is fixed by
                  the twelve people except k itself. Ask for one neighbour
                  and the guess is one person&rsquo;s weight; ask for nine
                  and it is nearly the average of everyone.
                </p>
                <NumberTable
                  headings={["person", "height, cm", "weight, kg", "person", "height, cm", "weight, kg"]}
                  rows={[
                    ["1", "150", "50", "7", "168", "66"],
                    ["2", "153", "52", "8", "171", "71"],
                    ["3", "157", "55", "9", "174", "72"],
                    ["4", "159", "57", "10", "177", "76"],
                    ["5", "162", "61", "11", "180", "78"],
                    ["6", "165", "63", "12", "183", "82"],
                  ]}
                  caption="The twelve people every widget on this page searches over. Persons 5, 9 and 12 are the ones the page holds back."
                />
                <p>
                  A number like k is called a hyperparameter, and the word
                  marks a difference in kind from the numbers a fit finds.
                  The line page&rsquo;s slope and intercept are chosen by the
                  fit to make the misses small; k is chosen before the fit
                  and changes what fitting means. The same is true of the
                  ridge page&rsquo;s penalty, the polynomial page&rsquo;s
                  degree, a tree&rsquo;s depth and the number of rounds of
                  boosting, and every one of them has to be set by the
                  procedure on this page or by something like it.
                </p>
                <KeepInMind>
                  A hyperparameter is a number the fit takes as given. The
                  fit optimises everything else with it held fixed, so the
                  fit cannot tell you what it should have been.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why the fit cannot choose it">
                <p>
                  We could try letting the fit choose k the way it chooses a
                  slope, by asking which k makes the misses on the twelve
                  people smallest. The grey line in the playground is that
                  experiment, each k fitted on the nine searched people and
                  scored on those same nine, and it reads exactly one at one
                  neighbour and falls from there, 0.9758 at two, 0.9560 at
                  three, 0.9258 at four and 0.8564 at five. It reads one at
                  k = 1 because every person&rsquo;s nearest neighbour among
                  the people the model remembers is that person, so the guess
                  is their own weight and the miss is zero.
                </p>
                <Equation>{"score on the fitted rows at k = 1  =  1 − 0 / TSS  =  1"}</Equation>
                <p>
                  So a fit allowed to set its own k would always answer one,
                  and one neighbour is the setting that memorises. The
                  training score cannot turn as k rises, for the same reason
                  the held-out page gave about a polynomial&rsquo;s degree,
                  since a smaller k always has at least as much freedom to
                  match the rows it was shown. A number that is guaranteed to
                  prefer the most flexible setting cannot be the number that
                  chooses between settings.
                </p>
                <KeepInMind>
                  A score on the rows the model was fitted to always prefers
                  the setting that memorises them. Here it is exactly 1.0 at
                  one neighbour, and that is not a coincidence of these
                  twelve people.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The held-out score is the ruler">
                <p>
                  The ruler has to be data the fit did not see, which is the
                  held-out page&rsquo;s whole argument, and the version used
                  here is its folded form. The searched people are dealt into
                  folds, each k is fitted on all but one fold and scored on
                  the fold it was denied, and the mean of those fold scores is
                  what that k earns. The indigo line in the playground is
                  that number at each k, and it does turn, rising from 0.8944
                  at one neighbour to 0.9252 at two and then falling to
                  0.2448 at five.
                </p>
                <Equation>{"score(k)  =  (1 / n_folds) Σ over folds f of R² of the k-neighbour fit\n             fitted without fold f, scored on fold f"}</Equation>
                <p>
                  Read the two lines together. The grey line says memorising
                  is best; the indigo line says two neighbours is best,
                  because a guess averaged over two nearby people is steadier
                  than one person&rsquo;s weight and still local enough to
                  follow the trend. Every score on this page from here on is a
                  held-out one.
                </p>
                <KeepInMind>
                  Choosing a hyperparameter means scoring each candidate on
                  rows the fit was denied and comparing those scores. That is
                  the only ruler the fit cannot bend.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The Grid",
          content: (
            <>
              <SubSection title="4. A candidate is a whole model, rebuilt">
                <p>
                  A search needs one model per setting, and the way it builds
                  them matters more than it looks. The safe way is to build
                  each candidate from scratch through the same constructor a
                  person would use, handing it the searched value along with
                  every other setting copied from the prototype, so that a
                  value the model would refuse is refused here too, and a
                  name the model does not have is refused before a single fold
                  is fitted. The dial&rsquo;s name is checked against the
                  model&rsquo;s declared fields at the moment the range is
                  written down, and the widget below lets you misspell it.
                </p>
                <SpaceBuilder />
                <p>
                  Misspell the dial as n_neighbors and the space is refused at
                  once, with the two dials the model does have, metric and
                  n_neighbours, named in the message. Try a zero and the
                  model&rsquo;s own constructor refuses the candidate, since a
                  neighbour count has to be above zero. I made the other
                  choice first, building candidates by copying the prototype
                  and overwriting one field, and a copy accepts a field name
                  it has never heard of without complaint and leaves the real
                  field at its default, so a grid over the misspelling would
                  have fitted the same model at every point, reported a
                  perfectly flat curve, and picked the first value by
                  tie-break. Nothing about that output would look wrong.
                </p>
                <KeepInMind>
                  Every candidate is a fresh model built through the ordinary
                  constructor, never a patched copy. A typo is then a refusal
                  at construction rather than a flat curve several hundred
                  fits later.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Combinations, not sweeps">
                <p>
                  One dial gives a list of candidates. Two dials give a grid,
                  every value of the first paired with every value of the
                  second, which is where the method gets its name. The
                  lattice below searches two dials on the same nine people,
                  the degree of a polynomial in height and the penalty of a
                  ridge fit on the expanded columns, standardised in between,
                  with the whole chain treated as one model so that a
                  candidate is one degree and one penalty together.
                </p>
                <DegreePenaltyGrid />
                <p>
                  Three degrees and four penalties make twelve candidates,
                  each a cell, and the winner is degree 1 at a penalty of 0.1
                  with a score of 0.9883, which is what twelve people close
                  to a line ought to prefer. The reason to try the
                  combinations rather than each dial on its own is that the
                  dials interact. A penalty of 10 scores 0.5304 at degree 1
                  and 0.8468 at degree 3, since the degree-3 chain has more
                  standardised columns to shrink and shrinking them costs
                  less, so the best penalty depends on the degree it is paired
                  with, and only a search that pairs them can find that out.
                </p>
                <Equation>{"candidates  =  every (d, λ) with d in degrees and λ in penalties\ncount       =  |degrees| × |penalties|  =  3 × 4  =  12"}</Equation>
                <KeepInMind>
                  A grid is the Cartesian product of the ranges, so every
                  candidate assigns every dial. Two separate sweeps would miss
                  the pairings where the dials interact, and here they do.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the grid costs">
                <p>
                  The product that makes the grid thorough is also its bill.
                  Twelve candidates on three folds is thirty-six fitted
                  models, and the readout in the lattice counts them the
                  same way, before any of them is run. Widen the
                  ranges to four degrees and six penalties and the count is
                  twenty-four candidates and seventy-two fits, with the winner
                  unchanged at degree 1 and penalty 0.1, so the extra
                  thirty-six fits bought the knowledge that a penalty of 100
                  scores −0.0792, which is worse than guessing the mean
                  weight.
                </p>
                <Equation>{"fits  =  n_folds × Π over dials of |range|\n      =  3 × (4 × 6)  =  72"}</Equation>
                <InAModel title="Three dials at five values each">
                  <p>
                    The same arithmetic at three dials with five values each
                    is 125 candidates, and on five folds 625 fits, of a model
                    that might take minutes rather than milliseconds. A
                    fourth dial at five values makes it 3125 fits. The count
                    is worth reading before the search starts, which is why
                    the space reports it before anything is fitted.
                  </p>
                </InAModel>
                <KeepInMind>
                  The cost of a grid multiplies with every dial added. Read
                  the candidate count times the fold count before running a
                  search, and expect to trim the ranges rather than the folds.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the grid spends its budget on">
                <p>
                  There is a subtler cost than the count. In the four-by-six
                  lattice the twenty-four candidates test only four distinct
                  degrees, since every row repeats the same degree six times,
                  and the winner&rsquo;s neighbours along its own row differ
                  from it by a few thousandths. When one dial matters and the
                  other does not, which is common, a grid spends most of its
                  budget re-measuring the same few values of the one that
                  counts. Sampling the two dials at random instead tests
                  twenty-four distinct values of each, which is the argument
                  behind random search, which is not built here yet, so this
                  page can state the argument and not measure it.
                </p>
                <KeepInMind>
                  A grid of twenty-four points over two dials tests only a
                  handful of distinct values of each. Random search is the
                  usual repair, and it is not built here yet.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. One Deal for Every Candidate",
          content: (
            <>
              <SubSection title="8. Hold a quarter out, then fold the rest">
                <p>
                  Before any candidate is scored, a quarter of the people is
                  put aside and not looked at again until the search is over.
                  Under the page&rsquo;s seed the three held back are persons
                  5, 9 and 12, at 162, 174 and 183 centimetres, and the other
                  nine are dealt into three folds of three. Both deals are
                  seeded shuffles, which is what lets the page name the people
                  in each and quote the scores they produce.
                </p>
                <NumberTable
                  headings={["fold", "people it judges", "heights", "weights"]}
                  rows={[
                    ["1", "10, 1, 3", "177, 150, 157", "76, 50, 55"],
                    ["2", "2, 6, 8", "153, 165, 171", "52, 63, 71"],
                    ["3", "7, 4, 11", "168, 159, 180", "66, 57, 78"],
                  ]}
                  caption="The three folds of the nine searched people under the page&rsquo;s seed, each listed in the order the fold&rsquo;s predictions come back."
                />
                <p>
                  Two things are settled by this one deal. Every candidate is
                  fitted and judged on exactly these folds, and the three
                  held-back people are the only rows on the page that no
                  candidate ever sees, so they are the only rows that can
                  judge the winner without having helped choose it. Part 6 is
                  about the second of those.
                </p>
                <KeepInMind>
                  The holdout is cut before the search begins, not carved off
                  afterwards. A row that took any part in scoring the
                  candidates cannot later judge the one that won.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. One fold at one setting, by hand">
                <p>
                  The whole search is this arithmetic repeated, so let us do
                  it once. Take the second fold at two neighbours. The fold
                  judges persons 2, 6 and 8, at 153, 165 and 171 centimetres
                  and 52, 63 and 71 kilograms, and the fit is allowed the
                  other six searched people, at 150, 157, 159, 168, 177 and
                  180 centimetres.
                </p>
                <WorkedExample title="The second fold at k = 2">
                  <p>
                    The person at 153 has neighbours at 150 and 157, whose
                    weights 50 and 55 average 52.5, a miss of 0.5. The person
                    at 165 has neighbours at 168 and 159, weights 66 and 57,
                    average 61.5, a miss of 1.5. The person at 171 has
                    neighbours at 168 and 177, weights 66 and 76, average 71,
                    a miss of exactly zero.
                  </p>
                  <Equation>{"predicted   52.5,  61.5,  71\nmissed by    0.5,   1.5,   0\nsquared     0.25 + 2.25 + 0  =  2.5"}</Equation>
                  <p>
                    The yardstick is the spread of the three true weights
                    about their own mean. They average 62, and their squared
                    distances from 62 are 100, 1 and 81.
                  </p>
                  <Equation>{"TSS  =  100 + 1 + 81  =  182\n\nfold score  =  1 − 2.5 / 182  =  0.9863"}</Equation>
                </WorkedExample>
                <p>
                  At one neighbour on the same fold the three guesses are 50,
                  66 and 66, the misses 2, 3 and 5, the squares 4, 9 and 25,
                  and the score is 1 − 38 / 182 = 0.7912. That is the whole
                  difference between the two settings on this fold, one
                  person&rsquo;s weight against the average of two.
                </p>
                <KeepInMind>
                  A fold score is the held-out page&rsquo;s R squared computed
                  on three people, against the spread of those three. Small
                  juries have small yardsticks, which is why single fold
                  scores swing as far as they do.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The mean across folds is the candidate's score">
                <p>
                  The other two folds at two neighbours score 0.9402 and
                  0.8491 by the same arithmetic, and their mean with 0.9863 is
                  0.9252, which is what the playground plots at k = 2. Doing
                  it for every setting gives the five candidate scores, and
                  the faint dots behind each one are its three folds, which
                  are scattered, at four neighbours reading 0.5987, 0.8444 and
                  0.3598 around a mean of 0.6010.
                </p>
                <NumberTable
                  headings={["k", "fold 1", "fold 2", "fold 3", "candidate score", "on its own rows"]}
                  rows={[
                    ["1", "0.9685", "0.7912", "0.9234", "0.8944", "1.0000"],
                    ["2", "0.9402", "0.9863", "0.8491", "0.9252", "0.9758"],
                    ["3", "0.7951", "0.8742", "0.6391", "0.7695", "0.9560"],
                    ["4", "0.5987", "0.8444", "0.3598", "0.6010", "0.9258"],
                    ["5", "0.3000", "0.4316", "0.0029", "0.2448", "0.8564"],
                  ]}
                  caption="Every candidate on the page&rsquo;s deal. The last column is section 2&rsquo;s training score, which cannot turn."
                />
                <p>
                  A candidate&rsquo;s score is a mean of three noisy numbers,
                  and the noise is not small. On this deal the third fold
                  reads 0.0029 at five neighbours where the second reads
                  0.4316, and the two settings that matter, one neighbour and
                  two, are separated by 0.0308 in the mean while their folds
                  are separated by up to 0.1951.
                </p>
                <KeepInMind>
                  The candidate score is an average of fold scores, each
                  computed on a few people. Read the folds behind it before
                  believing a difference between two candidates.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The folds must be the same for every candidate">
                <p>
                  Here is a rule that is easy to state and was once broken
                  here. Every candidate has to be scored on the same deal of
                  the folds. If each candidate were scored on a fresh
                  deal, the difference between two candidates would include
                  the difference between two deals, and a search could prefer
                  one setting for reasons that have nothing to do with the
                  setting. The widget scores two neighbours on six fresh
                  deals to show how much a deal alone can move the number.
                </p>
                <FoldPinningTable />
                <p>
                  On the nine searched people the same k = 2 reads 0.7909,
                  0.5832, 0.6013, 0.9252, −9.0911 and 0.4413 under six seeds,
                  a spread of 10.0163, and the −9.0911 is the deal that
                  happens to put the three shortest people into one fold and
                  the three tallest into another, so each of those folds is
                  judged by a fit that has never met anyone at their end of
                  the range and guesses the same two-person average for all
                  three, 60 kilograms for the people weighing 50, 52 and 55.
                  A search comparing candidates
                  across deals like these would be comparing deals. That
                  is exactly what happened here once, because an unseeded
                  shuffling deals fresh folds on every call and the
                  search handed the same shuffling to every candidate without
                  noticing. It now draws one seed per search and pins it, and
                  the detector for the bug is the left-hand panel, two copies
                  of one configuration in a single search must tie to the
                  last bit, and press the button as often as you like, they
                  do.
                </p>
                <KeepInMind>
                  Every candidate is scored on one arrangement of the folds.
                  Two copies of the same setting in one search tie exactly,
                  and a search where they did not would be measuring its
                  folds as much as its candidates.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Reading the Result",
          content: (
            <>
              <SubSection title="12. The winner, and how a tie is settled">
                <p>
                  With every candidate scored the winner is the largest
                  score, two neighbours at 0.9252 on the twelve people. The
                  comparison is strict, so a candidate has to beat the
                  incumbent to replace it and a tie goes to the earlier one,
                  which sounds like a detail and is not. Two candidates that
                  are genuinely equivalent come back differing in the last
                  bits or not at all, and letting a tie swap the winner would
                  make the answer depend on the order the grid was written in.
                  Ask the lattice in section 5 for the same degree twice and
                  the two cells tie exactly, the spread reads zero, and the
                  first of the two is named.
                </p>
                <Equation>{"winner  =  the candidate with the largest score,\n           the earlier of two equal scores"}</Equation>
                <KeepInMind>
                  The winner is the largest cross-validated score, with ties
                  resolved in favour of the earlier candidate so that grid
                  order cannot decide anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The spread says whether the winner meant anything">
                <p>
                  A winner is always named, even when the candidates barely
                  differ, so the number to read beside it is the best score
                  less the worst. On the twelve people that spread is 0.6804,
                  from 0.9252 at two neighbours down to 0.2448 at five, and a
                  spread that size says the dial matters here and the search
                  found a real preference. On the lattice it is 0.4579 at
                  three by four and 1.0675 at four by six, almost all of it
                  between the light penalties and the heavy ones, since the
                  three cells at penalty 0.1 are within 0.0016 of each other.
                </p>
                <Equation>{"spread  =  max over candidates of score  −  min over candidates of score"}</Equation>
                <p>
                  A spread of a few thousandths would mean the opposite, that
                  the search had nothing to choose between and the winner was
                  a coin toss decided by which fold happened to hold whom. On
                  the pure-noise target of Part 5 the spread reads 1.3448,
                  which looks like a strong preference and is entirely the
                  difference between one neighbour memorising noise and many
                  neighbours averaging it away, with nothing in it about
                  which setting predicts better.
                </p>
                <KeepInMind>
                  The spread prices the winner. A wide spread means the dial
                  matters; a narrow one means the winner is a coin toss; and
                  neither says the winner&rsquo;s score is what it will earn
                  on new people.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The losing scores are kept">
                <p>
                  Every candidate is scored and the winner is looked for only
                  afterwards, rather than a best-so-far being tracked and the
                  rest discarded, because the losing scores are what the
                  spread is made of and what the ranking is made of. On the
                  twelve people the ranking is two, one, three, four, five,
                  and the runner-up at 0.8944 is close enough to the winner
                  that a reader who wanted the simpler model could take one
                  neighbour and lose 0.0308 of cross-validated score for it.
                  A search that had kept only the winner could not have
                  offered that choice.
                </p>
                <KeepInMind>
                  Keep every candidate&rsquo;s score. The winner alone cannot
                  say how far ahead it was, and the second-best is often the
                  one worth having.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Winner's Score Flatters",
          content: (
            <>
              <SubSection title="15. Selecting on a score inflates it">
                <p>
                  Every cross-validated score is an estimate with noise on it,
                  and the winner was chosen because its estimate came out
                  largest. Part of what made it largest is the setting, and
                  part is that its folds happened to be kind to it, and the
                  two cannot be told apart from the number itself. So the
                  winner&rsquo;s score is biased upward by the act of its
                  having won, and the more candidates there were, the more
                  chances the noise had to hand one of them a lucky draw.
                </p>
                <Equation>{"measured   sᵢ  =  qᵢ + eᵢ        qᵢ the true quality, eᵢ noise averaging zero\n\nE[ max over i of sᵢ ]  ≥  max over i of qᵢ"}</Equation>
                <WhyThisWorks title="Why the maximum of noisy estimates is inflated">
                  <p>
                    Let j be the index of the best true quality. The maximum
                    of the measured scores is at least the measured score at
                    j, so its expectation is at least the expectation of
                    that one score, which is the quality at j plus the
                    expected noise at j, which is zero. Every other index can
                    only push the maximum higher, and does so whenever the
                    noise is genuinely random and more than one candidate is
                    near the top. The inequality holds for any noise with
                    mean zero, and it is strict in every case this page
                    measures.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The score that won is a selection score. It is honest about
                  which candidate was best on these folds and flattering about
                  how good that candidate is.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Measured where nothing can be learned">
                <p>
                  One gap on twelve people proves nothing, since it could be
                  those three particular people. To measure the effect we need
                  a case where the right answer is known in advance, and the
                  cleanest such case is a target with nothing in it to learn.
                  The chart searches twenty-five neighbour counts against
                  eighty rows whose target is pure noise, unrelated to any of
                  its four columns, so no setting can honestly beat a score of
                  zero and the horizontal line marks that ceiling.
                </p>
                <OptimismChart />
                <p>
                  On draw 12 the winner is seventeen neighbours at 0.0146,
                  above the ceiling, where the mean candidate reads −0.1738.
                  The search has found a setting that appears to explain
                  something in data that contains nothing. The dashed line is
                  the same seventeen neighbours scored again with the folds
                  dealt twelve fresh ways and averaged, and it reads −0.0915,
                  so the setting is worth less than guessing the mean and the
                  score it won with was 0.1061 too high. That gap is one draw,
                  and one draw can land on either side of zero; averaged over
                  twelve consecutive draws the winner&rsquo;s score is
                  flattering by 0.0728.
                </p>
                <p>
                  The re-score uses the same ruler as the selection, folds
                  over the same eighty rows, rather than a fresh holdout, and
                  the reason is a measurement I made while building the
                  chart. Five folds of sixteen rows read every setting a
                  little low, and over twenty draws the winner read 0.05 above
                  a fresh-fold re-score and 0.02 below a
                  four-hundred-row holdout, so scoring against a holdout would
                  have hidden the flattering inside the difference between two
                  rulers.
                </p>
                <KeepInMind>
                  On a target where nothing can score above zero, the winner
                  of twenty-five candidates reported 0.0146 and was worth
                  −0.0915. Nothing in the search was broken.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. It grows with the number of candidates">
                <p>
                  The argument in section 15 says the bias should grow with
                  the number of candidates, since more draws from the noise
                  make a larger expected maximum, and the table checks that on
                  the same draw of noise with the search cut short at two,
                  five, ten and twenty-five neighbour counts.
                </p>
                <OptimismGrowthTable />
                <p>
                  Averaged over twelve draws the flattering is 0.0153 with two
                  candidates, 0.0479 with five, 0.0500 with ten and 0.0728
                  with twenty-five, rising every time, though not by the same
                  step, since the added candidates from ten to twenty-five are
                  the large neighbour counts whose scores crowd together near
                  the mean and add little to the maximum. And on draw 12 alone
                  the two-candidate search comes out at −0.0878, its winner
                  scoring below its own re-score, which is the single draw
                  landing on the wrong side that the mean over draws is there
                  to survive.
                </p>
                <KeepInMind>
                  More candidates means a more flattering winner. The effect
                  is worst exactly where a search feels most necessary, many
                  settings tried on a small dataset.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. On a target with signal">
                <p>
                  The textbook says the bias is a property of selection and
                  should be present whenever a winner is chosen, and the
                  worry is that a target with real signal in it, where the
                  candidates genuinely differ, might hide it. The last row of
                  the table and the second button on the chart search the same
                  twenty-five counts against a target driven by two of the
                  four columns with noise over the top. There the winner is
                  three neighbours at 0.7386 against a mean candidate of
                  0.5834, its re-score is 0.7050, and the flattering averaged
                  over twelve draws is 0.0185, a quarter of the noise
                  figure. It did not vanish and it did not reverse.
                </p>
                <p>
                  I had expected it might reverse, because an earlier
                  measurement on the ridge penalty, ten candidates on a smooth
                  curve, came out slightly negative, with the noise between
                  fold deals swamping a small selection bias. On this target
                  with twenty-five candidates it came out positive on every
                  count tried, so the honest statement is the measured one. A
                  real signal shrinks the flattering by giving the candidates
                  genuine differences to be separated by, and it does not
                  remove it.
                </p>
                <KeepInMind>
                  Signal shrinks the bias without removing it. On the same
                  draw the winner was flattering by 0.0728 on noise and by
                  0.0185 with signal, and both are the wrong number to quote.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Number to Quote",
          content: (
            <>
              <SubSection title="19. Rows that took no part in choosing">
                <p>
                  The bias came from measuring and selecting on the same
                  numbers, so the repair is to score the winner on numbers
                  that took no part in the selection. That is what the
                  quarter from section 8 is for. The winner is refitted on all
                  nine searched people, which is the usual move since the
                  fits inside the search each saw only six, and scored once
                  on the three held back. On the twelve people that reads
                  0.8720 where the winner&rsquo;s own score was 0.9252.
                </p>
                <Equation>{"honest score  =  R² of the winner, refitted on the searched rows,\n                 on the rows held out before the search began"}</Equation>
                <p>
                  The direction of that gap is what the argument predicts on
                  average and not what every deal shows. Press the ideal-case
                  button in the playground and the winner is one neighbour at
                  0.7635 while its held-out score is 0.9788, because the three
                  people that deal held back happen to be easy ones with
                  close neighbours on both sides. Three people are a small
                  jury, as the held-out page measured, and a held-out score
                  from three people says less about the winner than it says
                  about which three they were.
                </p>
                <KeepInMind>
                  The honest score is read on rows held out before the search
                  and never used inside it. It is honest because nothing chose
                  it, and it is still an estimate from a few rows.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The score that wears the wrong name">
                <p>
                  There is a way to get this wrong that produces a number
                  called honest and is the most flattering figure on the page,
                  and it was live here for a day. Refit the winner on
                  the held-out rows and score it on those same rows, and the
                  result is a training score. The playground&rsquo;s fourth
                  readout is the winner fitted on the nine searched people and
                  scored on those nine, 0.9758 at two neighbours, and the
                  probe that separates the two procedures structurally is a
                  search whose only candidate is one neighbour.
                </p>
                <NumberTable
                  headings={["the winner, k = 1", "fitted on", "scored on", "reads"]}
                  rows={[
                    ["same rows", "the nine searched", "the nine searched", "1.0000"],
                    ["honest", "the nine searched", "the three held out", "0.7825"],
                  ]}
                  caption="Drag the playground&rsquo;s largest k down to 1 to see both. At one neighbour a same-rows score is exactly one, whatever the data."
                />
                <p>
                  At one neighbour a same-rows score is exactly 1.0 on any
                  data without duplicated heights, since every row&rsquo;s
                  nearest neighbour is itself, while the honest procedure
                  reads 0.7825 on the three held-out people. At larger k the
                  same-rows flattering shrinks to roughly one part in k and
                  drowns in the noise of a small holdout, which is why the
                  first test written for the bug was at the winner&rsquo;s own
                  k and could not tell the two apart, and why the sharp
                  version is the one-neighbour probe.
                </p>
                <KeepInMind>
                  Fit on the searched rows, score on the held-out rows, and
                  never the other way round. The one-neighbour probe reads
                  exactly one under the wrong procedure and cannot under the
                  right one.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A second layer of folds">
                <p>
                  One holdout is one deal, and section 19 showed a deal of
                  three people saying whatever those three people say. The
                  structural fix is to fold the holdout too. Deal the people
                  into outer folds, run the whole search inside each outer
                  training share with its own inner folds, refit that
                  share&rsquo;s winner and score it on the outer fold it never
                  saw, and average those scores. Every person then judges a
                  winner exactly once, and no person judges a winner they
                  helped choose. Nothing here wraps that up as one object yet,
                  so the outer loop on this page is written by hand, one outer
                  fold at a time over the same folds and the same search
                  everything else on the page uses.
                </p>
                <Equation>{"for each outer fold o\n    search the candidates on the other outer folds, with inner folds\n    refit the winner there, score it on fold o\nnested score  =  mean over o"}</Equation>
                <NestedSearchTable />
                <p>
                  On the twelve people the four inner searches each choose one
                  neighbour and their selection scores read 0.9170, 0.8768,
                  0.8443 and 0.8787, while the honest scores on the outer
                  folds read −0.0274, 0.2718, 0.3105 and 0.9094, a mean of
                  0.3661 with a spread of 0.9368. A flat search over all
                  twelve chooses two neighbours at 0.7932. The nested figure
                  is far below it and far more honest about how little twelve
                  people can say, since an outer fold of three people has
                  almost no spread of its own for a ratio to explain, and the
                  fold judging persons 6, 8 and 9, whose weights are 63, 71
                  and 72, reads below zero for that reason. On the noise draw
                  of section 16 the same loop reads −0.1222 where the flat
                  winner claimed 0.0146, which is the correction the
                  procedure exists to make.
                </p>
                <KeepInMind>
                  Nested cross-validation scores the selection procedure
                  rather than the selected setting, on rows the procedure
                  never saw. It costs a whole search per outer fold, 64 fits
                  here against 15, and on twelve people it is still a
                  verdict from juries of three.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What to write down">
                <p>
                  The practical rule follows from everything above. The
                  winner&rsquo;s own score is a selection score and is the
                  right number for comparing candidates and the wrong number
                  for saying how good the chosen model is. Write down the
                  winner, the spread beside it so a reader can tell a real
                  preference from a coin toss, and a score from rows that took
                  no part in the choosing, whether that is the quarter held
                  out before the search or the mean over a second layer of
                  folds. Section 16 measures that bias and the honest score
                  sits beside it, and nothing about the procedure stops a
                  reader from quoting the flattering number instead.
                </p>
                <NumberTable
                  headings={["number", "on the twelve people", "what it is"]}
                  rows={[
                    ["winner", "k = 2", "the setting to use"],
                    ["its search score", "0.9252", "a selection score; compares candidates"],
                    ["spread", "0.6804", "whether the dial mattered"],
                    ["held-out quarter", "0.8720", "one honest estimate, from three people"],
                    ["nested folds", "0.3661", "the honest estimate of the whole procedure"],
                    ["same rows", "0.9758", "a training score; never quote it"],
                  ]}
                />
                <KeepInMind>
                  Quote the setting, the spread, and a score from rows that
                  never chose anything. The number the search reports for its
                  winner is the one number on the page that must not be
                  quoted as performance.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a complete implementation specifies">
                <p>
                  A search states its deal and its rules in full. Which model
                  and which of its dials are varied, and that the names are
                  checked against the model before anything is fitted; the
                  values in each range and that the candidates are their
                  Cartesian product; that each candidate is built through the
                  model&rsquo;s own constructor; the share held out before the
                  search and the seed that cut it; the fold count, the seed
                  that dealt the folds, and that one arrangement serves every
                  candidate; the score read on a fold and how folds are
                  combined, averaged for a regressor and pooled for a
                  classifier; the comparison and the tie rule; that every
                  candidate&rsquo;s score is kept; and which of the winner,
                  the spread, the honest score and the nested score it
                  reports, with the winner&rsquo;s own score labelled as a
                  selection score.
                </p>
                <KeepInMind>
                  On this page the deal is a quarter held out under one seed,
                  three folds under another, the neighbour count from one to
                  five rebuilt through the constructor, R squared averaged
                  across folds, strict comparison with ties to the earlier
                  candidate, every score kept, and the honest score read on
                  the quarter.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where a search stops being defined">
                <p>
                  A grid search is three things stacked, a deal of the folds, a
                  fit on each fold, and a score, and each of the three needs
                  something from the data before it means anything. When one of
                  those needs goes unmet the search does not become
                  approximate, it becomes undefined, and the honest thing is to
                  say which of the three ran out. The table gathers the cases,
                  with what the mathematics says in each.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "fewer than two people", reason: "there is nothing to deal. Cross-validation asks for a part to fit on and a part to judge on, and one person can be only one of the two." },
                    { expression: "a fold holding one person", reason: "the coefficient of determination compares the misses against the spread of the target, and one number has no spread, so the score is a zero over a zero. Four people over three folds reaches this on every fold at once." },
                    { expression: "a target that never varies", reason: "the same zero in the same denominator, now for the whole set rather than one fold. Every model predicts the constant perfectly and the yardstick that would say so does not exist." },
                    { expression: "a predictor that never varies, when the rows are standardised first", reason: "standardising divides by the spread of the column, so a constant column has no standardised form. Nothing is lost by dropping it, since a column that never varies cannot separate two people." },
                    { expression: "a predictor that never varies, in a neighbour vote", reason: "defined, and uninformative. Every distance is equal, so every person is a nearest neighbour of every other, and the scores come out negative because the vote is no better than the mean." },
                    { expression: "more neighbours than a training fold holds", reason: "a vote among seven of six people names a set that does not exist. The bound is the smallest training fold rather than the whole set, which is the part that catches people out, since a range of neighbour counts that fits the data can still fail inside the folds." },
                    { expression: "more folds than rows", reason: "ten folds over nine people leaves one fold empty, and an empty fold has nothing to judge on. The number of folds is bounded above by the number of rows, and at that bound each fold is one person, which is the case two rows above." },
                    { expression: "a range with nothing in it", reason: "the grid is the product of the ranges, so one empty range makes the whole grid empty, and a search over no candidates has no winner. The failure is silent by nature, since an empty product is not obviously wrong to look at." },
                    { expression: "a setting the model does not have", reason: "there is no such dial to vary, so every candidate is the same model and the reported curve is flat for a reason that has nothing to do with the data. This is why the names are worth checking against the model before any fitting." },
                    { expression: "the same value twice in one range", reason: "the two candidates are the same model on the same folds, so they tie exactly and one of them is wasted work. A tie needs a rule, and any rule is arbitrary; naming the first keeps the answer repeatable." },
                    { expression: "the winner's own score, quoted as performance", reason: "the maximum of many noisy estimates is higher than any one of them deserves, so the winning score is biased upward by an amount that grows with the number of candidates. Part 6 measures it against candidates that cannot beat zero, where the winner flatters itself by 0.0728 averaged over twelve draws." },
                  ]}
                />
                <KeepInMind>
                  Every line above is a limit of the method rather than a
                  matter of taste, and each has the same shape, a quantity the
                  search needs and the data cannot supply. The two worth
                  carrying away are the fold that is too small to score, since
                  it appears only once the folds are cut and not when the data
                  is first looked at, and the winning score, since nothing
                  about it looks wrong.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
