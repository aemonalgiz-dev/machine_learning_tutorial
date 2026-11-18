import { pageMetadata } from "@/lib/seo";
import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
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

export const metadata: Metadata = pageMetadata("/concepts/grid-search", {
  title: "Searching for a Setting · Perceptron Lab",
  description:
    "Model settings chosen before fitting affect the result. Grid search compares specified combinations using validation data, while a separate final test checks the choice after the search is complete.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function GridSearchPage() {
  return (
    <ConceptPage
      lessonId="grid-search"
      intuition={lessonIntuitions["grid-search"]}
      technicalStart="Part 2. The Grid"
      openingTitle="The Fit Cannot Choose Every Setting"
      playgroundTitle="Compare settings on the same validation folds"
      playgroundIntro="Compare the candidates on the same folds. Read the winning validation score alongside the separate test result, since they answer different questions."
      title="Searching for a Setting"
      tagline={"Model settings chosen before fitting affect the result. Grid search compares specified combinations using validation data, while a separate final test checks the choice after the search is complete."}
      prerequisites={
        <>
          The folding this page searches inside comes from the{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation
          </Link>{" "}

          page, and the dial being searched over is the neighbor count of{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>

            k-nearest neighbors
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

      playground={<SearchCurveChart />}
      sections={[
        {
          title: "Part 1. A Dial No Fit Can Turn",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twelve people and a neighbor count" id="1-twelve-people-and-a-neighbour-count">
                <p>We have twelve height and weight pairs, ranging from 150 centimeters and 50 kilograms to 183 centimeters and 82 kilograms. To predict weight, a nearest-neighbor rule finds people with similar heights and averages their weights.</p>
                <p>The number of neighbors changes that rule. With one neighbor, the prediction uses one person’s weight. With nine, it averages most of the sample. How should we choose between those settings without using the final test answers to make the choice?</p>
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
                <p>We choose the neighbor count k before fitting. It changes how the prediction rule uses the stored examples, rather than being a coefficient fitted from their errors. A setting like this is called a hyperparameter.</p>
              <p>A line&apos;s slope and intercept are fitted parameters. A tree&apos;s depth limit, a polynomial degree or a ridge penalty are examples of hyperparameters. We need a selection procedure for them too, while keeping separate observations for assessing the final choice. Grid search is one such procedure; it does not have exclusive claim to choosing these settings.</p>
                <KeepInMind>

                  A hyperparameter is a setting treated as fixed by the fitting procedure we are using. We can compare alternative values in an outer selection procedure. It need not be numeric, and a different algorithm may learn a setting that this procedure takes as given.</KeepInMind>
              </SubSection>

              <SubSection title="2. Why the fit cannot choose it">
                <>
<p>Suppose we choose k by the score on the observations used for fitting. The playground&rsquo;s gray curve fits each candidate on the nine searched people and scores those same nine. It is exactly 1.0 at one neighbor, then 0.9758, 0.9560, 0.9258 and 0.8564 for two through five neighbors. This comparison favors retrieving the stored observations, which is different from predicting a new person.</p>
                <p>

                  It reads one at k = 1 because every person&rsquo;s nearest neighbor among the people the model remembers is that person, so the guess is their own weight and the miss is zero.
                </p>
</>
                <Equation>{"score on the fitted rows at k = 1  =  1 − 0 / TSS  =  1"}</Equation>
                <p>A one-neighbor model can reproduce each unique training input by retrieving that same observation. Its perfect training score therefore gives us little reason to expect a useful prediction for someone new. Training scores at larger k need not be monotonic on every dataset, but selecting by them still rewards fitting the observations already available.</p>
                <KeepInMind>

                  When each training input is unique, a one-neighbor rule can reproduce its stored target exactly. Its perfect training score then ties the best possible score, even if it predicts new observations poorly. Duplicate inputs with conflicting targets would change that result.</KeepInMind>
              </SubSection>

              <SubSection title="3. The held-out score is the ruler">
                <>
<p>We need observations excluded from the candidate’s fit. Split the searched data into folds. For each candidate k, fit on all but one fold and score on the omitted fold, repeating until each fold has been evaluated. The candidate receives the mean of those scores.</p>
                <p>

                  The indigo line in the playground is that number at each k, and it does turn, rising from 0.8944 at one neighbor to 0.9252 at two and then falling to 0.2448 at five.
                </p>
</>
                <Equation>{"score(k)  =  (1 / n_folds) Σ over folds f of R² of the k-neighbor fit\n             fitted without fold f, scored on fold f"}</Equation>
                <p>The gray line favors reproducing the stored observations. The indigo line favors two neighbors on these validation folds. Averaging nearby weights helped on observations excluded from fitting, while retaining enough local detail to follow the trend. This is evidence for that setting under this split, rather than a rule that two neighbors always work best.</p>
                <KeepInMind>
                  We compare candidate hyperparameters using observations excluded from each candidate&apos;s fit. Those observations are validation data: their scores now help us select the setting. They are therefore part of model selection, and we still need a separate final assessment if we want an independent estimate of the selected procedure&apos;s performance.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Grid",
          content: (
            <>
              <SubSection title="4. A candidate is a whole model, rebuilt">
                <>
<p>Each candidate needs a fresh model with its own settings. Constructing it through the usual model constructor runs the same validation as an ordinary fit. Checking parameter names before the search also prevents a misspelled setting from being silently ignored.</p>
                <p>
                  The dial&rsquo;s name is checked against the model&rsquo;s declared fields at the moment the range is written down, and the widget below lets you misspell it.
                </p>
</>
                <SpaceBuilder />
                <>
<p>This SDK names the setting <code>n_neighbours</code>. Supplying <code>n_neighbors</code> raises an error and reports the supported fields, <code>metric</code> and <code>n_neighbours</code>. The constructor also rejects a zero neighbor count.</p>
                <p>Constructing each candidate through that constructor checks its settings. Simply copying a model and assigning an arbitrary attribute can miss a typo: the real setting may remain unchanged while the search reports that it tried several values. Validating candidates prevents that misleading result.</p>
                <p>The dangerous part is that an ignored setting can still produce a plausible score. Checking the parameter name tells us whether the search tested the intended alternatives at all.</p>
</>
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
                  ridge fit on the expanded columns, standardized in between,
                  with the whole chain treated as one model so that a
                  candidate is one degree and one penalty together.
                </p>
                <DegreePenaltyGrid />
                <>
<p>The three-by-four grid contains twelve candidates. On the nine searched people, degree 1 with penalty 0.1 has the highest mean score, 0.9883. The nearly linear observations make that result plausible, but do not guarantee it. Comparing combinations matters because a useful penalty can depend on the feature representation.</p>
                <p>At penalty 10, degree 1 scores 0.5304 while degree 3 scores 0.8468. Additional correlated standardized columns can distribute a similar trend across coefficients, changing its effective ridge penalty. More columns do not always help, but these results show that degree and penalty cannot be interpreted independently.</p>
</>
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
                  Count candidates and folds before starting a grid. Each combination adds a complete validation run. Choose ranges and a fold scheme that fit the data and computing budget; reducing folds changes the evaluation as well as the cost.</KeepInMind>
              </SubSection>

              <SubSection title="7. What the grid spends its budget on">
                <>
<p>

                  There is a subtler cost than the count. In the four-by-six lattice the twenty-four candidates test only four distinct degrees, since every row repeats the same degree six times, and the winner&rsquo;s neighbors along its own row differ from it by a few thousandths. When one dial matters and the other does not, which is common, a grid spends most of its budget re-measuring the same few values of the one that counts.
                </p>
                <p>Random search samples combinations rather than completing every pairing in a grid. It can spend more of a fixed budget testing different values of an influential setting instead of repeating those values against every unimportant setting. Random search is not implemented here, so the page explains the reason for trying it without claiming a measured comparison.</p>
</>
                <KeepInMind>
                  A grid repeats each range value against every value of the other settings. Random search is one alternative when the budget would be better spent exploring more distinct values. It is not implemented here.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "With distinct training heights and nonconstant target weights, a one-neighbor regressor scored on those same rows has R²=1 in this implementation.",
              true,
              "Each training row is its own unique zero-distance neighbor, so its prediction reproduces its target and leaves no squared error. That perfect training score does not assess new observations. The scores decrease with k in this example, but nearest-neighbor training error is not guaranteed to be monotone for every dataset because the neighborhood averages are not nested least-squares optima.",
            ),
            choice(
              "The folded score rises from 0.8944 at one neighbor to 0.9252 at two and falls to 0.2448 at five. Why does two win?",
              [
                "A guess averaged over two nearby people is steadier than one person’s weight and still local enough to follow the trend",
                "Two is the smallest setting that does not memorize, so it always wins",
                "Two neighbors happens to match the number of folds",
                "Two is where the training score turns as well",
              ],
              0,
              "Two neighbors has the highest mean held-out score among the supplied candidates on these folds. Averaging nearby weights can reduce sensitivity to one observation while retaining useful locality, which is consistent with this result. The comparison does not establish that two neighbors is generally best, or that training error must decrease or increase monotonically with k.",
            ),
            choice(
              "Why is each candidate built through the model’s ordinary constructor rather than by copying the prototype and overwriting one field?",
              [
                "A copy accepts a field name it has never heard of and quietly leaves the real field at its default",
                "A copy would share learned state between the candidates",
                "A constructor is faster than a copy",
                "A copy cannot vary two dials at once",
              ],
              0,
              "A grid over a misspelled dial would then have fitted the same model at every point, reported a perfectly flat curve and picked the first value by tie-break, with nothing about the output looking wrong. Built the safe way the name is checked against the model’s declared fields as the range is written down, and a neighbor count of zero is refused by the model’s own constructor.",
            ),
            trueFalse(
              "On the lattice a penalty of 10 scores the same whichever degree it is paired with, so the two dials could have been swept one at a time.",
              false,
              "A polynomial expansion changes the feature representation and its coefficient penalty. Adding correlated standardized columns can distribute a similar prediction across several coefficients, changing the penalty cost. The measured degree-and-penalty combinations therefore differ. Comparing complete combinations captures that interaction; separate one-parameter sweeps can miss it.",
            ),
            several(
              "Which of these does the page establish about what a grid costs?",
              [
                "Twelve candidates on three folds is thirty-six fitted models, counted before any of them runs",
                "Widening to four degrees and six penalties is seventy-two fits and leaves the winner unchanged",
                "Twenty-four points over two dials still test only four distinct degrees",
                "Three dials at five values each is 125 candidates, and 625 fits on five folds",
              ],
              [0, 1, 2, 3],
              "A Cartesian grid multiplies the value counts across parameters, then multiplies by the fold count. Those counts are known before fitting. Random search with continuous parameter distributions can spend the same budget on more distinct values of each coordinate; discrete parameters or repeated samples need not give distinct values. Which strategy is useful depends on the search space and evaluation cost.",
            ),
        ],
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
                  5, 9 and 12, at 162, 174 and 183 centimeters, and the other
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
                  Set aside the final test observations before comparing candidates. Validation rows help choose the setting, so their scores are not an independent final evaluation of that choice. They remain useful for selection and diagnosis when labeled accordingly.</KeepInMind>
              </SubSection>

              <SubSection title="9. One fold at one setting, by hand">
                <p>

                  The whole search is this arithmetic repeated, so let us do
                  it once. Take the second fold at two neighbors. The fold
                  judges persons 2, 6 and 8, at 153, 165 and 171 centimeters
                  and 52, 63 and 71 kilograms, and the fit is allowed the
                  other six searched people, at 150, 157, 159, 168, 177 and
                  180 centimeters.
                </p>
                <WorkedExample title="The second fold at k = 2">
                  <p>For the held-out person at 153 cm, the two nearest training heights are 150 and 157 cm. For 165 cm, they are 168 and 159 cm; for 171 cm, they are 168 and 177 cm. Average each pair&rsquo;s stored weights to obtain the predictions below.</p>
                  <Equation>{"predicted   52.5,  61.5,  71\nmissed by    0.5,   1.5,   0\nsquared     0.25 + 2.25 + 0  =  2.5"}</Equation>
                  <p>
                    The yardstick is the spread of the three true weights
                    about their own mean. They average 62, and their squared
                    distances from 62 are 100, 1 and 81.
                  </p>
                  <Equation>{"TSS  =  100 + 1 + 81  =  182\n\nfold score  =  1 − 2.5 / 182  =  0.9863"}</Equation>
                </WorkedExample>
                <>
                  <p>

                    With one neighbor on this fold, the predictions are 50, 66 and 66
                    kilograms. Their errors are 2, 3 and 5 kilograms. Square those
                    errors and compare their total with the fold’s baseline variation.
                  </p>
                  <Equation>{"squared error total = 2² + 3² + 5² = 38\nR² = 1 − 38 / 182 ≈ 0.7912"}</Equation>
                  <p>

                    That is the difference between using one neighbor’s weight and
                    averaging the two nearest weights on this fold.
                  </p>
                </>
                <KeepInMind>
                  Each fold&rsquo;s R² compares its squared errors with variation around that fold&rsquo;s target mean. Only three people supply this fold&rsquo;s denominator. A different group can have a very different spread, making fold scores unstable and difficult to compare without their data.</KeepInMind>
              </SubSection>

              <SubSection title="10. The mean across folds is the candidate's score">
                <>
                  <p>

                    The other two folds give scores about 0.9402 and 0.8491. Average the
                    three fold scores to obtain the candidate score plotted for two
                    neighbors.
                  </p>
                  <Equation>{"mean fold R² ≈ (0.9863 + 0.9402 + 0.8491) / 3 ≈ 0.9252"}</Equation>
                  <p>
                    Repeat this procedure for each candidate. The faint dots show the
                    individual fold scores, which can vary substantially even when their
                    mean is summarized by one point.
                  </p>
                </>
                <NumberTable
                  headings={["k", "fold 1", "fold 2", "fold 3", "candidate score", "on its own rows"]}
                  rows={[
                    ["1", "0.9685", "0.7912", "0.9234", "0.8944", "1.0000"],
                    ["2", "0.9402", "0.9863", "0.8491", "0.9252", "0.9758"],
                    ["3", "0.7951", "0.8742", "0.6391", "0.7695", "0.9560"],
                    ["4", "0.5987", "0.8444", "0.3598", "0.6010", "0.9258"],
                    ["5", "0.3000", "0.4316", "0.0029", "0.2448", "0.8564"],
                  ]}
                  caption="Every candidate on these folds. The last column reports scores on the rows used to fit the model."
                />
                <p>

                  A candidate&rsquo;s score is a mean of three noisy numbers,
                  and the noise is not small. On this deal the third fold
                  reads 0.0029 at five neighbors where the second reads
                  0.4316, and the two settings that matter, one neighbor and
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
                <p>Every candidate should use the same validation folds. Otherwise a difference in scores includes both the effect of the setting and the effect of receiving a different split. The widget scores the same two-neighbor setting on six fresh deals to show how much a split alone can change its result.</p>
                <FoldPinningTable />
                <p>A candidate can receive quite different validation scores under different folds. On the nine-person example, the same two-neighbor model produces the following scores across the six displayed seeds:</p>
<Equation>{`R² by split seed:
0.7909, 0.5832, 0.6013, 0.9252, −9.0911, 0.4413`}</Equation>
<p>The very negative result comes from a split that groups the shortest people in one fold and the tallest in another. The corresponding training folds then lack examples from the end of the range they must predict. The nearest-neighbor model repeats an available training average rather than extrapolating that trend.</p>
<p>This explains why candidates must use the same folds within a search. Otherwise, we could select a candidate because it received an easier split. The API fixes the split seed within each search, and the repeated-configuration comparison checks that identical candidates receive identical scores.</p>
                <KeepInMind>
                  These deterministic candidates use the same folds, so duplicate configurations tie exactly in this example. With randomized models, their random settings also need controlling or repeating; equal folds alone do not guarantee identical scores.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Reading the Result",
          content: (
            <>
              <SubSection title="12. The winner, and how a tie is settled">
                <>
<p>The largest mean score wins: two neighbors at 0.9252 on the twelve-person example. This implementation replaces the incumbent only when a candidate has a strictly higher score, so the earlier candidate wins an exact tie. The order of the candidates therefore matters for ties and needs to be recorded. Tiny numerical differences can also decide a winner without indicating a useful practical difference.</p>
                <p>
                  Ask the lattice in section 5 for the same degree twice and the two cells tie exactly, the spread reads zero, and the first of the two is named.
                </p>
</>
                <Equation>{"winner  =  the candidate with the largest score,\n           the earlier of two equal scores"}</Equation>
                <KeepInMind>

                  The highest mean validation score wins. This implementation breaks an exact tie by retaining the earlier candidate, so the grid order does decide ties. Record that order when reproducing a result.</KeepInMind>
              </SubSection>

              <SubSection title="13. Comparing the Range of Candidate Scores" id="13-the-spread-says-whether-the-winner-meant-anything">
                <>
<p>The search names a winner even when candidates are almost tied. Compare the full range of scores as well. On the twelve-person example, that range is 0.6804, from 0.9252 at two neighbors to 0.2448 at five. This shows that the setting affects these validation results. It does not by itself establish how much better the selected model will be on another sample.</p>
                <p>
                  On the lattice it is 0.4579 at three by four and 1.0675 at four by six, almost all of it between the light penalties and the heavy ones, since the three cells at penalty 0.1 are within 0.0016 of each other.
                </p>
</>
                <Equation>{"spread  =  max over candidates of score  −  min over candidates of score"}</Equation>
                <p>A narrow score range means the tested candidates performed similarly on these folds; it does not by itself prove that selecting among them is random. A wide range is not proof of useful signal either. Part 5&rsquo;s noise example has a range of 1.3448: averaging more neighbors can reduce prediction variance even when none of the input columns predicts the target. The range must be interpreted alongside the problem and evaluation.</p>
                <KeepInMind>
                  The score range summarizes differences within the tested grid. It is not an uncertainty interval for the winner, and it does not show how the chosen setting will perform on new observations. Inspect the fold results and the independent evaluation too.</KeepInMind>
              </SubSection>

              <SubSection title="14. The losing scores are kept">
                <>
<p>The search retains every candidate&rsquo;s score. On these data the ranking is two, one, three, four, then five neighbors. The runner-up scores 0.8944, compared with 0.9252 for the winner. Keeping those results lets us consider whether the measured gain justifies a setting&rsquo;s other costs or constraints, rather than assuming the top row is always the only useful choice.</p>
                <p>Keeping the other scores lets us consider alternatives and see whether the winning margin is substantial. A winner’s name alone cannot tell us that.</p>
</>
                <KeepInMind>
                  Keep the other candidate scores so a reader can inspect the winning margin and near-ties. Practical requirements may favor another candidate even when it has a slightly lower validation score.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "On the second fold at two neighbors the squared misses total 2.5 and the three true weights are spread 182 about their own mean. What does the fold score?",
              ["0.9863", "0.9252", "0.7912", "0.0137"],
              0,
              "Use that fold's target mean as the R² reference:\n\n```math\nR² = 1 − 2.5 / 182 ≈ 0.9863\n```\n\nThe one-neighbor residual total is 38 on the same observations, giving a lower score. The candidate score then averages this fold with the other folds; it is not this one-fold result.",
            ),
            trueFalse(
              "One neighbor and two neighbors are further apart on a single fold than they are in their candidate scores.",
              true,
              "Their candidate scores are 0.8944 and 0.9252, a gap of 0.0308, while on the second fold alone they read 0.7912 and 0.9863, a gap of 0.1951. A candidate’s score is a mean of three noisy numbers, and on this deal the third fold reads 0.0029 at five neighbors where the second reads 0.4316, so the folds behind a mean are worth reading before any difference between two candidates is believed.",
            ),
            choice(
              "Why does one deal of the folds have to serve every candidate?",
              [
                "Otherwise the difference between two candidates includes the difference between two deals",
                "Otherwise the fits cost more than the search can afford",
                "Because the folds have to be cut with the same seed as the holdout",
                "Because a candidate can only be fitted once",
              ],
              0,
              "A search dealing fresh folds per candidate could prefer a setting for reasons that have nothing to do with the setting, which is why two copies of one configuration are made to tie exactly. Two neighbors on six fresh deals read anywhere from 0.9252 down to −9.0911, and that very negative deal is a split that groups the shortest people in one fold and the tallest in another, leaving the training folds with no examples from the end of the range they have to predict.",
            ),
            choice(
              "The comparison is strict and a tie goes to the earlier candidate. Why is that not a detail?",
              [
                "An exact tie selects the earlier candidate, so grid order can determine which equivalent setting is named",
                "A tie means the dial does not matter, so the simpler candidate should win",
                "Strictness is what stops a candidate being scored twice",
                "The earlier candidate is always the cheaper one to fit",
              ],
              0,
              "The implementation uses a strict score comparison, so an exactly equal later score does not replace the current winner. Repeating an identical candidate therefore names the first occurrence. This is a deterministic tie policy, not independence from ordering. Near-ties can still be decided by small numerical differences unless a separate tolerance is specified.",
            ),
            several(
              "The spread is the best score less the worst. Which of these does the page say it buys?",
              [
                "A spread of 0.6804 shows a substantial range of measured candidate scores on these folds",
                "A spread of a few thousandths may be small relative to fold variability and needs that uncertainty checked",
                "Keeping the losing scores also gives a ranking, so a reader wanting one neighbor can see it costs 0.0308",
                "A wide spread also says what the winner will earn on new people",
              ],
              [0, 1, 2],
              "The range describes the tested scores, while the full ranking shows the measured cost of choosing another setting. It does not quantify uncertainty or estimate performance on new observations. Small differences may be unstable across folds, and even a large range can appear with a pure-noise target. Inspect repeatability and separate evaluation before interpreting the winner as a reliable improvement.",
            ),
        ],
        },
        {
          title: "Part 5. The Winner's Score Flatters",
          content: (
            <>
              <SubSection title="15. Selecting on a score inflates it">
                <p>A validation score combines the candidate’s performance with variation from the particular observations used. Selecting the largest score can also select a favorable fluctuation. More candidates give that fluctuation more opportunities to influence the choice. The winning score can therefore be optimistic, even when each candidate was fitted without its validation rows.</p>
                <Equation>{"measured   sᵢ  =  qᵢ + eᵢ        qᵢ the true quality, eᵢ noise averaging zero\n\nE[ max over i of sᵢ ]  ≥  max over i of qᵢ"}</Equation>
                <WhyThisWorks title="Why the maximum of noisy estimates is inflated">
                  <>
<p>Let j identify the candidate with the highest true quality in this simplified model. The largest measured score is at least candidate j&rsquo;s measured score on every draw. Taking expectations preserves that inequality; zero-mean estimation noise makes the expected score at j equal to its true quality. The inequality can be strict when other candidates sometimes exceed it, but shared random noise alone does not guarantee strictness.</p>
                  <p>This argument assumes unbiased, zero-mean score errors. Actual cross-validation estimates have additional complications, including shared observations and training-set sizes. The model explains a selection effect; the experiments below estimate it for their specified procedures rather than proving that every selected score is too high.</p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  The winning validation score tells us which candidate performed best on those folds. Because that score helped select the candidate, it can overstate performance in a new evaluation. Report its role as a selection score.</KeepInMind>
              </SubSection>

              <SubSection title="16. Measured where nothing can be learned">
                <p>To study selection without an underlying predictive relationship, the chart uses eighty rows with four independent noise inputs and an independent noise target. It compares twenty-five neighbor counts. A fixed predictor cannot exploit a population relationship that is absent, but a finite validation score can still be above zero by chance. The zero line is a population reference, not a hard ceiling on every measured R².</p>
                <OptimismChart />
                <>
<p>On draw 12, seventeen neighbors wins with validation R² 0.0146, while the mean candidate score is −0.1738. Re-scoring that setting over twelve fresh fold arrangements gives −0.0915, a gap of 0.1061. This is evidence of sensitivity to selection and split choice on these observations, not a measurement of an exact population quality.</p>
                <p>A single difference can have either sign. Across twelve consecutive draws, the winning validation score exceeds its fresh-fold re-score by 0.0728 on average.</p>
</>
                <p>The re-score uses fresh folds over the same eighty observations, rather than a new holdout. That keeps the training-set sizes comparable when measuring the selection effect. In twenty recorded draws, the winner scores 0.05 above its fresh-fold re-score but 0.02 below its score on a four-hundred-row holdout. Comparing only with that larger holdout would mix selection effects with differences in the evaluation setup.</p>
                <KeepInMind>
                  An above-zero validation score can occur on independent noise. Here the selected score is 0.0146, while re-scoring the chosen setting on fresh folds gives −0.0915. Selection can favor a favorable sample fluctuation without any implementation bug.</KeepInMind>
              </SubSection>

              <SubSection title="17. It grows with the number of candidates">
                <p>Adding candidates cannot lower the maximum score on a fixed set of folds, because the previous candidates remain available. That does not guarantee that the gap to a fresh evaluation grows on every draw. The table repeats the experiment with two, five, ten and twenty-five neighbor counts to measure how the average gap changes.</p>
                <OptimismGrowthTable />
                <p>Across twelve draws, the mean gaps are 0.0153, 0.0479, 0.0500 and 0.0728 for the four search sizes. They increase in this experiment. Many added large-neighborhood candidates have similar scores, so additional candidates need not contribute independent chances for a higher maximum. On draw 12 alone, the two-candidate gap is −0.0878: its winner scores below its fresh-fold re-score.</p>
                <KeepInMind>
                  Searching more settings can increase selection optimism, especially when score differences contain substantial sampling noise. Its size depends on the candidates, their shared errors and the data; it is not a fixed penalty per candidate.</KeepInMind>
              </SubSection>

              <SubSection title="18. On a target with signal">
                <>
<p>Repeat the comparison with a target generated from two of the four input columns plus noise. The candidates can now differ in genuine predictive ability as well as in sample fluctuations. The second chart button and final table row show the same twenty-five-count search under that generator.</p>
                <p>For the displayed signal draw, three neighbors wins with score 0.7386, while the mean candidate is 0.5834. Its fresh-fold re-score is 0.7050. Across twelve draws, the mean gap is 0.0185, smaller than the noise experiment&rsquo;s 0.0728.</p>
</>
                <p>An earlier experiment with ten ridge-penalty candidates gave a slightly negative measured difference: fold variation was larger than the observed selection effect. This experiment uses twenty-five candidates and gives a positive difference at every tested count. These are results for the stated experiments. A real predictive signal can reduce the observed selection effect by making some candidates consistently better, but does not make reuse of selection results an independent evaluation.</p>
                <KeepInMind>
                  The average gap is smaller in this signal experiment than in the noise experiment. Genuine signal can make some settings consistently better, but it does not turn their selection scores into an independent final evaluation.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Number to Quote",
          content: (
            <>
              <SubSection title="19. Rows that took no part in choosing">
                <p>Assess the chosen model on observations excluded from the selection as well as the fitting. That is why section 8 set aside a quarter of the data. Refit the winner on all nine searched people, then evaluate it once on the three held back. The result here is 0.8720, compared with the selection score of 0.9252.</p>
                <Equation>{"final test score  =  R² of the winner, refitted on the searched rows,\n                 on the rows held out before the search began"}</Equation>
                <WorkedExample title="The three held-back people at k = 2">
                  <p>

                    The winner is refitted on the nine searched people and
                    asked about persons 5, 9 and 12, at 162, 174 and 183
                    centimeters, who weigh 61, 72 and 82 kilograms. The person
                    at 162 has neighbors at 159 and 165, and the person at 174
                    has neighbors at 171 and 177. The person at 183 is the
                    tallest of the twelve and has no one above them, so both
                    neighbors are shorter, at 180 and 177.
                  </p>
                  <Equation>{"predicted   (57 + 63) / 2 = 60,   (71 + 76) / 2 = 73.5,   (78 + 76) / 2 = 77\nmissed by   1,   1.5,   5\nsquared     1 + 2.25 + 25  =  28.25"}</Equation>
                  <p>
                    The three true weights average 71.67, and their squared
                    distances from that mean total 220.67.
                  </p>
                  <Equation>{"final test score  =  1 − 28.25 / 220.67  ≈  0.8720"}</Equation>
                  <p>The largest held-out person contributes 25 of the total squared error 28.25. Their two neighbors are both shorter and have lower recorded weights. A neighbor average stays within the range of the stored target weights; it cannot extend a rising trend beyond that range. This is a limitation of the prediction rule, not merely of the preprocessing.</p>
                </WorkedExample>
                <p>A separate holdout can score above the selection score too. In the ideal-case playground, one neighbor wins at 0.7635 and scores 0.9788 on the three held-out people. They have nearby training examples on both sides. With only three test observations, split composition can have a large effect; the direction of one score gap is not a reliable test for selection bias.</p>
                <KeepInMind>
                  The final test rows were excluded from fitting and selection. Their score therefore provides an independent evaluation under this split, but it remains an uncertain estimate from a small sample. Changing the model after inspecting it would reuse that test information.</KeepInMind>
              </SubSection>

              <SubSection title="20. Training Scores and Independent Evaluation" id="20-the-score-that-wears-the-wrong-name">
                <p>Scoring the winner on observations used to fit it gives a training score, even if the readout is labeled as evaluation. The fourth readout above fits the selected model on the nine search observations and scores those same observations: 0.9758 at two neighbors.</p>
                <p>To make the distinction easy to test, use a search whose only candidate has one neighbor. A unique training height retrieves itself, so scoring the training observations reveals the reuse directly.</p>
                <NumberTable
                  headings={["the winner, k = 1", "fitted on", "scored on", "reads"]}
                  rows={[
                    ["same rows", "the nine searched", "the nine searched", "1.0000"],
                    ["honest", "the nine searched", "the three held out", "0.7825"],
                  ]}
                  caption="Set the playground’s largest k to 1 to compare both. With these unique training heights, one-neighbor prediction reproduces each stored target."
                />
                <p>With one neighbor and no duplicated heights, R² on the training observations is exactly 1.0 because each observation retrieves itself. The model fitted on the nine training people scores 0.7825 on the three held-out people. The one-neighbor case makes the difference between these procedures clear; at larger neighborhood sizes, the difference can be obscured by variation in such a small holdout.</p>
                <KeepInMind>

                  Fit the chosen model on the searched rows and evaluate it on rows excluded from the search. A perfect training score at one neighbor makes reuse easy to detect on this dataset. A genuinely held-out score can also be exactly one in other datasets, so the number alone is not proof of how the evaluation was performed.</KeepInMind>
              </SubSection>

              <SubSection title="21. A second layer of folds">
                <>
<p>A single holdout can be highly dependent on which observations it contains. Nested cross-validation repeats the entire selection procedure inside outer folds. For each outer split, search using only its training portion, refit the selected candidate there, and score it on the outer fold. The outer observations must not influence that inner search.</p>
                <p>Each observation then evaluates a selected model without helping select that model. The outer scores assess the model-selection procedure, which can choose different settings in different folds. Here the outer loop is written explicitly using the existing fold and search tools.</p>
</>
                <Equation>{"for each outer fold o\n    search the candidates on the other outer folds, with inner folds\n    refit the winner there, score it on fold o\nnested score  =  mean over o"}</Equation>
                <NestedSearchTable />
                <>
<p>Each of the four inner searches selects one neighbor. Their selection scores are 0.9170, 0.8768, 0.8443 and 0.8787. Evaluation on the corresponding outer folds gives −0.0274, 0.2718, 0.3105 and 0.9094, with mean 0.3661 and spread 0.9368. A single search over all twelve instead selects two neighbors with selection score 0.7932. Those scores describe different uses of the data.</p>
                <p>The nested estimate is much lower than the selection score and varies considerably across outer folds. Each outer fold contains only three people, so its R² depends strongly on their weight variation. The fold containing persons 6, 8 and 9 has weights 63, 71 and 72 and a negative score. This is limited evidence about future performance, even though the evaluation procedure respects the selection boundary.</p>
                <p>On section 16&rsquo;s noise draw, nested cross-validation gives −0.1222, compared with the non-nested winning selection score 0.0146. The procedures use the observations differently, so the nested result is an estimate of the full selection procedure, not an exact correction to the earlier score.</p>
</>
                <KeepInMind>
                  Nested cross-validation evaluates the selection procedure on outer rows excluded from each inner search. Settings may differ between outer folds. It requires a full search for each outer split: this example uses 64 fits instead of 15. Its three-person outer folds still give a variable estimate.</KeepInMind>
              </SubSection>

              <SubSection title="22. What to write down">
                <>
<p>Report the chosen setting and enough candidate results to show the alternatives. Label the winning validation value as a selection score. For a claim about future observations, provide an evaluation excluded from selection, such as the initial holdout or outer cross-validation. Include its sample size and split procedure so readers can judge the limits of that estimate.</p>
                <p>Section 16 places the selection score beside a separate evaluation. Keeping both readouts visible lets us check which one supports a claim about new observations. Reporting only the larger selection score would leave out that distinction.</p>
</>
                <NumberTable
                  headings={["number", "on the twelve people", "what it is"]}
                  rows={[
                    ["winner", "k = 2", "the setting to use"],
                    ["its search score", "0.9252", "a selection score; compares candidates"],
                    ["spread", "0.6804", "range across this candidate grid"],
                    ["held-out quarter", "0.8720", "a final test estimate from three people"],
                    ["nested folds", "0.3661", "an outer-fold estimate of the selection procedure"],
                    ["same rows", "0.9758", "a training score; useful for diagnosis, not independent evaluation"],
                  ]}
                />
                <KeepInMind>
                  Keep selection and final evaluation labeled separately. A training score can help diagnose fit, and candidate scores help compare settings, but neither substitutes for an evaluation excluded from that choice.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "On draw 12, a search over twenty-five neighbor counts and eighty noise-target rows selects a score of 0.0146. What mean score does the selected setting receive when re-evaluated with the twelve fresh fold partitions described in the experiment?",
              [
                "−0.0915, found by scoring the same setting again with the folds dealt twelve fresh ways",
                "Exactly zero, since the target holds nothing to learn",
                "0.0146, because the folds it was scored on were held out",
                "−0.1738, which is the mean candidate score",
              ],
              0,
              "The selected setting averages −0.0915 under those fresh fold partitions, below its selection score. Maximizing noisy estimates tends to select favorable evaluation noise along with model effects. Repartitioning the same data illustrates that sensitivity, but does not provide a fully independent test set or the exact population performance.",
            ),
            trueFalse(
              "The flattering belongs to targets with no signal in them and disappears once there is something to learn.",
              false,
              "The signal-driven example still shows a gap: the selected score is 0.7386 and the repeated-fold rescore is 0.7050. The mean optimism is smaller than in the supplied noise experiment, but signal does not guarantee a particular selection-bias size or remove it. Independent evaluation should include the selection procedure.",
            ),
            choice(
              "Why should the bias grow with the number of candidates?",
              [
                "More draws from the noise make a larger expected maximum",
                "Each extra candidate is fitted on fewer rows than the last",
                "Each extra candidate widens the spread, and the spread is the bias",
                "The candidates added late are the ones with the most freedom",
              ],
              0,
              "Measured over twelve draws the flattering is 0.0153 with two candidates, 0.0479 with five, 0.0500 with ten and 0.0728 with twenty-five, rising every time. It does not rise by equal steps, because the counts added from ten to twenty-five are large neighbor counts whose scores crowd together near the mean and add little to the maximum.",
            ),
            choice(
              "One procedure produced the most flattering figure on the page under the name honest. Which?",
              [
                "Refitting the winner on the held-out rows and scoring it on those same rows",
                "The winner’s own cross-validated score",
                "The mean of the fold scores at one neighbor",
                "The nested score averaged over four outer folds",
              ],
              0,
              "Refitting on the holdout and then scoring those same rows turns the claimed holdout evaluation into a training score. A one-neighbor check exposes this clearly: with distinct inputs it reproduces its own training targets. The intended procedure instead refits on development data and predicts the untouched holdout. Larger neighbor counts can make the bug less obvious, but do not make it valid.",
            ),
            several(
              "Which of these hold for the nested loop on the twelve people?",
              [
                "The four inner searches each choose one neighbor",
                "The outer scores average 0.3661, far below the flat search’s 0.7932",
                "It is the cheaper procedure, since each inner search is fitted on fewer people",
                "It scores the selected setting rather than the selection procedure",
              ],
              [0, 1],
              "Each outer fold evaluates a model selected without using that fold, so the resulting scores assess the search-and-fit procedure under those training sizes. The inner searches add substantial computation. With only three outer test observations per fold, R² is also sensitive to their target variation; a small denominator can produce a very negative score. Nested validation reduces selection reuse, but does not eliminate sampling uncertainty.",
            ),
        ],
        },
        {
          title: "Part 7. Making Every Candidate Face the Same Test" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="23. Candidate ranges, validation folds and the final refit" id="23-what-a-complete-implementation-specifies">
                <p>
                  To reproduce a search, another person needs to know which
                  candidates were compared and what information each was allowed
                  to use. Record those choices before looking at the winning score.
                </p>
                <ul className="list-disc space-y-3 pl-5"><li>Record the model and parameter ranges. Check parameter names, then construct a fresh model for each combination.</li><li>Record the held-out split and validation folds, including their seeds. Every candidate uses the same folds so the comparison is matched.</li><li>State the score and how fold results are combined. This implementation averages regression scores and pools classification predictions.</li><li>State how ties are resolved and retain every candidate&apos;s score. Label the winning validation result as a selection score, then report the separate held-out result.</li></ul>
                <KeepInMind>

                  On this page the deal is a quarter held out under one seed,
                  three folds under another, the neighbor count from one to
                  five rebuilt through the constructor, R squared averaged
                  across folds, strict comparison with ties to the earlier
                  candidate, every score kept, and the honest score read on
                  the quarter.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Candidates we cannot compare on the supplied folds" id="24-where-a-search-stops-being-defined">
                <p>A search needs valid splits, candidates that can fit those splits, and a score defined for the resulting predictions. A failure in any of these steps needs an explicit explanation. The table records those cases so an undefined score is not mistaken for an approximate result.</p>
                <DerivationTable
                  expressionHeading="Candidate or evaluation data"
                  reasonHeading="Whether the comparison is meaningful"
                  rows={[
                    { expression: "fewer than two people", reason: "Cross-validation needs nonempty training and validation portions. A single observation cannot provide both." },
                    { expression: "a fold holding one person", reason: "One held-out target has zero total squared variation, so ordinary R² is undefined there. Four observations divided into three folds produces at least two singleton folds, though not every fold must be a singleton." },
                    { expression: "a target that never varies", reason: "A constant target gives a zero R² denominator. A perfect prediction makes the ratio zero over zero; imperfect predictions still leave division by zero. The SDK rejects this case rather than claiming every model predicts it perfectly." },
                    { expression: "a predictor that never varies, when the rows are standardized first", reason: "This standardizer rejects a constant column because its spread is zero. Dropping a constant feature may be appropriate, but the treatment depends on the downstream model and whether an intercept is available." },
                    { expression: "a predictor that never varies, in a neighbor vote", reason: "If this is the only feature, all input distances tie and the implementation’s tie rule chooses the neighbors. Predictions have no information from that feature. A negative R² is possible, but not guaranteed for every sample." },
                    { expression: "more neighbors than a training fold holds", reason: "The neighbor count cannot exceed the observations in a training fold. A count valid for the full dataset can fail after cross-validation removes a fold." },
                    { expression: "more folds than rows", reason: "More folds than rows requires an empty fold. Even when the counts are equal, singleton regression folds have undefined ordinary R²." },
                    { expression: "a range with nothing in it", reason: "An empty range leaves no candidate combinations and therefore no winner. This differs from supplying no varying ranges at all, whose Cartesian product can contain one default combination." },
                    { expression: "a setting the model does not have", reason: "This SDK validates setting names before fitting and rejects an unknown field. An API that silently ignored it could instead test unintended duplicate configurations." },
                    { expression: "the same value twice in one range", reason: "With these deterministic models and fixed folds, duplicate values produce identical scores and unnecessary repeated work. This implementation retains the earlier candidate in an exact tie." },
                    { expression: "the winner's own score, quoted as performance", reason: "The winning validation score also participated in selection. It can therefore be optimistic as an estimate of a later evaluation. In the noise experiment, the mean gap to fresh-fold re-scoring is 0.0728 across twelve draws; zero is not a hard ceiling on individual measured R² values." },
                  ]}
                />
                <KeepInMind>
                  The table combines mathematical limits, implementation checks and reporting choices. Check fold sizes after splitting, because an otherwise large-enough dataset can still produce an undefined fold R². Also record which observations influenced selection before interpreting a final score as independent.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Running the Search on the Twelve People",
          practice: [
            exercise("Search the neighbour count on the nine people",["Keep rows 5, 9 and 12 as the separate holdout, using the one-based person numbers from the lesson. On the remaining nine people, search n_neighbours values 1 through 5 with three-fold KFold under seed 3. Print each cross-validation score beside the score from fitting and evaluating that setting on all nine development rows.", "Print the winning count, best_score and score_spread. Then cross-validate n_neighbours=6 with the same folds. Before running, predict what an unweighted six-neighbor regressor returns when a training fold contains exactly six people."],`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    GridSearch,
    KFold,
    KNearestNeighboursRegressor,
    SearchSpace,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

space = SearchSpace.over(KNearestNeighboursRegressor, n_neighbours=[1, 2, 3, 4, 5])
# Run a GridSearch on the folds, from a default KNearestNeighboursRegressor,
# over the space and the searched people. For each scored candidate print its
# neighbour count, its score, and the score of the same setting fitted on the
# nine and scored on the nine. Then print the winner, its score and the spread.

# Cross-validate a six-neighbour model on the same folds and print its mean
# R squared on a line of its own, to four places.`,`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    GridSearch,
    KFold,
    KNearestNeighboursRegressor,
    SearchSpace,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

space = SearchSpace.over(KNearestNeighboursRegressor, n_neighbours=[1, 2, 3, 4, 5])
result = GridSearch(folds=folds).search(KNearestNeighboursRegressor(), space, searched)

for scored in result:
    count = scored.candidate.value_for("n_neighbours")
    model = KNearestNeighboursRegressor(n_neighbours=count)
    model.fit(searched.input_features, searched.target_feature)
    own_rows = model.score(searched.input_features, searched.target_feature)
    print(f"k = {count}: held-out folds {scored.score:.4f}, its own rows {own_rows:.4f}")

winner = result.best.candidate.value_for("n_neighbours")
print(f"winner k = {winner} at {result.best_score:.4f}, spread {result.score_spread:.4f}")

six = CrossValidation(folds=folds).evaluate(KNearestNeighboursRegressor(n_neighbours=6), searched)
print(f"six neighbours: {six.mean_r2_score:.4f}")`,`k = 1: held-out folds 0.8944, its own rows 1.0000
k = 2: held-out folds 0.9252, its own rows 0.9758
k = 3: held-out folds 0.7695, its own rows 0.9560
k = 4: held-out folds 0.6010, its own rows 0.9258
k = 5: held-out folds 0.2448, its own rows 0.8564
winner k = 2 at 0.9252, spread 0.6804
six neighbours: -0.2141`,{...{ hints: ["SearchSpace.over names the model’s class and one list per dial. GridSearch is built with the folds, and its search takes a prototype model, the space and the dataset.", "Looping over the result gives every scored candidate, losers included. A candidate hands back the value it assigned through value_for(\"n_neighbours\").", "A Dataset carries its columns as input_features and its target as target_feature, which is what fit and score take.", "CrossValidation is built with the same folds, and evaluate takes a model and the dataset. The mean over folds is mean_r2_score."], check: numberCheck("What mean held-out R squared do six neighbors score on the page’s folds, to four places?", -0.2141, 0.0005, "With six training people and six neighbors, every query in a fold receives that fold's training mean. Its negative held-out R squared means it loses to the held-out targets' own mean on that fold. Asking for seven neighbors instead exceeds the available training rows.") },question:"Which neighbor count wins validation, and what happens when every training person votes?"}),
            exercise("The honest score, and the score that wears its name",["Run the same search and call honest_score_on with its development and untouched holdout datasets. Refit the winning count on the nine development people and print its three holdout predictions and training score. Repeat with a search containing only n_neighbours=1.", "For each search, print the winning setting, search score, holdout score and training score. Compare what each number measures. The separate holdout should not be refitted or used to choose a different candidate after inspecting these results."],`from oop_ml import (
    Dataset,
    Feature,
    GridSearch,
    KFold,
    KNearestNeighboursRegressor,
    SearchSpace,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

for counts in ([1, 2, 3, 4, 5], [1]):
    space = SearchSpace.over(KNearestNeighboursRegressor, n_neighbours=counts)
    result = GridSearch(folds=folds).search(KNearestNeighboursRegressor(), space, searched)
    winner = result.best.candidate.value_for("n_neighbours")
    # Ask the result for its honest score on the holdout. Then fit a model at
    # the winning count on the searched people yourself, and print its three
    # predictions for the holdout and its score on the searched people.

# Print the honest score of the five-candidate search on a line of its own.`,`from oop_ml import (
    Dataset,
    Feature,
    GridSearch,
    KFold,
    KNearestNeighboursRegressor,
    SearchSpace,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

honest_scores = []
for counts in ([1, 2, 3, 4, 5], [1]):
    space = SearchSpace.over(KNearestNeighboursRegressor, n_neighbours=counts)
    result = GridSearch(folds=folds).search(KNearestNeighboursRegressor(), space, searched)
    winner = result.best.candidate.value_for("n_neighbours")
    honest = result.honest_score_on(KNearestNeighboursRegressor(), searched, holdout)
    honest_scores.append(honest)

    model = KNearestNeighboursRegressor(n_neighbours=winner)
    model.fit(searched.input_features, searched.target_feature)
    predictions = [float(value) for value in model.predict(holdout.input_features)]
    same_rows = model.score(searched.input_features, searched.target_feature)

    print(f"candidates {counts}, winner k = {winner}, search score {result.best_score:.4f}")
    print(f"  held-back predictions {predictions}")
    print(f"  honest {honest:.4f}, same rows {same_rows:.4f}")

print(f"honest score at two neighbours: {honest_scores[0]:.4f}")`,`candidates [1, 2, 3, 4, 5], winner k = 2, search score 0.9252
  held-back predictions [60.0, 73.5, 77.0]
  honest 0.8720, same rows 0.9758
candidates [1], winner k = 1, search score 0.8944
  held-back predictions [57.0, 76.0, 78.0]
  honest 0.7825, same rows 1.0000
honest score at two neighbours: 0.8720`,{...{ hints: ["honest_score_on takes a prototype model, the dataset that was searched and the dataset that was held out, in that order, and answers one number.", "The same-rows score needs no help from the search. Fit a model at the winning count on the searched people and call score with those same people.", "The held-back people are 162, 174 and 183 cm. The last has nobody taller among the nine, so both of their neighbors sit below them."], check: numberCheck("What honest score does the two-neighbor winner earn on the three held-back people, to four places?", 0.872, 0.0005, "The searched setting is refitted on development rows before the untouched rows are scored. A higher same-row score measures fit to known data, not the winner's ability to predict unseen people; a perfect same-row score can occur without resolving that question.") },question:"Does the chosen setting perform similarly on untouched people?"}),
            exercise("Three searches that cannot run",["Test three invalid searches: the unsupported field name n_neighbors, an empty n_neighbours range, and counts [5, 6, 7] on the supplied three folds. Catch MLLibError and print each error class and message.", "Distinguish validation while constructing SearchSpace from failure inside a training fold. Seven neighbors fit within the nine development rows, but each training fold contains only six."],`from oop_ml import (
    Dataset,
    Feature,
    GridSearch,
    KFold,
    KNearestNeighboursRegressor,
    MLLibError,
    SearchSpace,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

# Three attempts, each inside its own try block that catches MLLibError and
# prints the name of the refusal and its message.
# 1. A space whose dial is spelled n_neighbors.
# 2. A space whose range for n_neighbours is an empty list.
# 3. A search over neighbour counts of 5, 6 and 7 on the searched people.`,`from oop_ml import (
    Dataset,
    Feature,
    GridSearch,
    KFold,
    KNearestNeighboursRegressor,
    MLLibError,
    SearchSpace,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

try:
    SearchSpace.over(KNearestNeighboursRegressor, n_neighbors=[1, 2, 3])
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")

try:
    SearchSpace.over(KNearestNeighboursRegressor, n_neighbours=[])
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")

try:
    space = SearchSpace.over(KNearestNeighboursRegressor, n_neighbours=[5, 6, 7])
    GridSearch(folds=folds).search(KNearestNeighboursRegressor(), space, searched)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,`InvalidValuesError: KNearestNeighboursRegressor has no hyperparameter 'n_neighbors'; it has ['metric', 'n_neighbours']
EmptyValuesError: the range for 'n_neighbours' holds no values, so the grid would be empty
TooFewValuesError: 7 neighbours were asked for and only 6 rows were supplied`,{...{ hints: ["The first two never reach a search. The space checks the dial’s name against the model’s declared fields, and its range for emptiness, as it is built.", "The third space builds without complaint, since seven is a legal neighbor count. It is the fit inside a fold that refuses, so the search call belongs inside the try as well."] },question:"Which invalid search configurations fail before fitting, and which fail inside a fold?"}),
            exercise("Search two dials at once, and score that winner honestly",["Search the complete polynomial-standardization-ridge pipeline on the nine development people. Compare degrees 1, 2 and 3 with penalties 0.01, 0.1, 1 and 10. Print the candidate count and three-fold fit count before starting, then each candidate score, best_score and score_spread.", "Evaluate the selected pipeline once on the same three holdout people and print that score. Compare it with the earlier neighbor-model result, while keeping in mind that three test observations provide limited evidence and repeated comparisons use up their independence for selection."],`from oop_ml import (
    Dataset,
    Feature,
    GridSearch,
    KFold,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    SearchSpace,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

chains = [
    PipelineSteps.of(terms=PolynomialFeatures(degree=degree), scaler=Standardizer())
    for degree in (1, 2, 3)
]
ridges = [RidgeRegression(penalty=penalty) for penalty in (0.01, 0.1, 1.0, 10.0)]
prototype = RegressionPipeline(steps=chains[0], model=ridges[0])
# Build a SearchSpace over RegressionPipeline whose steps are the three
# chains and whose model is the four ridges. Print its candidate count and
# that count times the three folds. Search it, print every cell, then the
# winner's score, the spread and the honest score on the holdout.`,`from oop_ml import (
    Dataset,
    Feature,
    GridSearch,
    KFold,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    SearchSpace,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [4, 8, 11]
kept = [index for index in range(12) if index not in held]

searched = Dataset(
    [Feature("height", [heights[index] for index in kept])],
    Feature("weight", [weights[index] for index in kept]),
)
holdout = Dataset(
    [Feature("height", [heights[index] for index in held])],
    Feature("weight", [weights[index] for index in held]),
)
folds = KFold(n_folds=3, random_seed=3)

chains = [
    PipelineSteps.of(terms=PolynomialFeatures(degree=degree), scaler=Standardizer())
    for degree in (1, 2, 3)
]
ridges = [RidgeRegression(penalty=penalty) for penalty in (0.01, 0.1, 1.0, 10.0)]
prototype = RegressionPipeline(steps=chains[0], model=ridges[0])

space = SearchSpace.over(RegressionPipeline, steps=chains, model=ridges)
print(f"{space.n_candidates} candidates, {space.n_candidates * 3} fits")

result = GridSearch(folds=folds).search(prototype, space, searched)
for scored in result:
    degree = scored.candidate.value_for("steps")["terms"].transformer.degree
    penalty = scored.candidate.value_for("model").penalty
    print(f"degree {degree}, penalty {penalty}: {scored.score:.4f}")

print(f"winner {result.best_score:.4f}, spread {result.score_spread:.4f}")
print(f"honest score {result.honest_score_on(prototype, searched, holdout):.4f}")`,`12 candidates, 36 fits
degree 1, penalty 0.01: 0.9879
degree 1, penalty 0.1: 0.9883
degree 1, penalty 1.0: 0.9696
degree 1, penalty 10.0: 0.5304
degree 2, penalty 0.01: 0.9871
degree 2, penalty 0.1: 0.9880
degree 2, penalty 1.0: 0.9844
degree 2, penalty 10.0: 0.7528
degree 3, penalty 0.01: 0.9848
degree 3, penalty 0.1: 0.9868
degree 3, penalty 1.0: 0.9863
degree 3, penalty 10.0: 0.8468
winner 0.9883, spread 0.4579
honest score 0.9957`,{...{ hints: ["The chain has two fields, steps and model, so the space takes two lists of whole objects. Nothing inside a step is ever named by a string.", "A space knows its n_candidates as soon as it is built, which is the count worth reading before a search starts.", "A candidate hands back the whole object it carried, so the degree is value_for(\"steps\")[\"terms\"].transformer.degree and the penalty is value_for(\"model\").penalty.", "honest_score_on takes the prototype, the searched dataset and the held-out dataset, exactly as it did for the neighbor search."], check: numberCheck("What honest score does the lattice’s winner earn on the three held-back people, to four places?", 0.9957, 0.0005, "The lightly penalized linear rule extrapolates beyond the searched height range differently from a neighbor average. It scores better on these three held-out people, but such a small test set does not establish general superiority.") },question:"Which degree and penalty win the search, and how do they score on untouched people?"}),
          ],
        },
      ]}
    />
  );
}
