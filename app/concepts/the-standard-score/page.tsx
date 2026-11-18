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
import { DeviationsAxis } from "@/components/widgets/DeviationsAxis";
import { HeldOutTrees } from "@/components/widgets/HeldOutTrees";
import { OrchardNeighbours } from "@/components/widgets/OrchardNeighbours";
import { ShapeSurvives } from "@/components/widgets/ShapeSurvives";
import { StandardScorePlayground } from "@/components/widgets/StandardScorePlayground";
import { WhoNoticed } from "@/components/widgets/WhoNoticed";

export const metadata: Metadata = pageMetadata("/concepts/the-standard-score", {
  title: "The Standard Score · Perceptron Lab",
  description:
    "A difference from the average depends on how much the measurements normally vary. A standard score expresses that difference in units of standard deviation, allowing values on different scales to be compared.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TheStandardScorePage() {
  return (
    <ConceptPage
      lessonId="the-standard-score"
      intuition={lessonIntuitions["the-standard-score"]}
      technicalStart="Part 2. Subtract the Average, Divide by the Spread"
      openingTitle="How Unusual Is That Number?"
      playgroundTitle="Compare each measurement with its usual variation"
      playgroundIntro="Compare each original value with its standard score. Identify the mean at zero and check what one unit on the new scale represents."
      title="The Standard Score"
      tagline={"A difference from the average depends on how much the measurements normally vary. A standard score expresses that difference in units of standard deviation, allowing values on different scales to be compared."}
      prerequisites={<>You will use the mean and standard deviation introduced in the <Link href="/primers/statistics" className={link}>statistics primer</Link>. The <Link href="/concepts/feature-scaling" className={link}>feature scaling</Link> page compares other choices of center and scale. Here we examine standard scores and their effects on <Link href="/concepts/k-nearest-neighbours" className={link}>nearest neighbors</Link>, the <Link href="/concepts/ridge-lasso" className={link}>penalized line</Link> and the <Link href="/concepts/decision-trees" className={link}>decision tree</Link>, explaining each comparison as it appears.</>}

      playground={<StandardScorePlayground />}
      sections={[
        {
          title: "Part 1. When the Unit Decides the Answer",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four trees, two units">
                <p>The orchard records trunk girth in millimeters and seasonal water in meters. These columns have different units and numerical ranges. A standard score gives us a way to describe each value relative to its column&apos;s average and spread before comparing their contributions.</p>
                <NumberTable
                  headings={["column", "smallest", "largest", "average", "spread"]}
                  rows={[
                    ["trunk girth, millimeters", "202", "620", "387.625", "113.652"],
                    ["water, meters", "0.41", "0.95", "0.679", "0.172"],
                  ]}
                  caption="The numerical standard deviations differ by a factor of 659.21 in these recorded units. Expressing water in millimeters changes that numerical comparison without changing the trees."
                />
                <p>In these illustrative observations, water is much more strongly associated with fruit yield than trunk girth is. Trunk girth nevertheless has the larger numerical range. That distinction lets us separate an input&apos;s apparent numerical influence from the information it provides about the outcome.</p>
                <KeepInMind>
                  The measurements themselves are valid. The problem appears when a model combines numerical differences across these columns without accounting for their scales. Changing the unit of water would change its influence on that calculation, even though the trees received the same amount.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The nearest trees the recorded columns choose">
                <p>A nearest-neighbor prediction compares a tree with other trees using their recorded measurements. If we add squared differences directly, the units determine the relative numerical contribution of trunk girth and water. Standardizing changes that comparison by expressing each difference relative to its column&apos;s spread.</p>
                <Equation>{"distance² = (trunk gap in mm)² + (water gap in m)²"}</Equation>
                <OrchardNeighbours />
                <InAModel title="The wettest tree in the orchard">
                  <>
<p>
                    That tree has a trunk of 369 mm, was given 0.95 m of water, the most of any tree, and bore 55.14 kg, the most of any tree. Asked in the recorded units, its three nearest are the trees of 362, 359 and 354 mm, whose water was 0.59, 0.48 and 0.52 m, and the trunk column owned between 0.9974 and 0.9992 of every one of those squared distances.
                  </p>
                  <p>
                    Their average fruit is 33.84 kg, which is 21.30 kg short. Asked in standard scores the three nearest were given 0.91, 0.90 and 0.93 m, their average fruit is 52.73 kg, and the answer is 2.41 kg short.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Click a different tree and the two rings move together for
                  most of the orchard and apart for the trees at the edges of
                  the water column. Nothing has gone wrong with the recorded
                  reading, which answered exactly the question its arithmetic
                  put, namely which trees have similar trunks.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Why one column owns the distance">
                <p>Changing to a unit a thousand times smaller multiplies the numerical gaps by a thousand. Their squared contributions become a million times as large. The ratio of column variances helps describe average contributions across pairs, while the particular gaps determine the contribution for any one pair.</p>
                <Equation>{"girth spread / water spread = 113.652 / 0.172 = 659.21\nthe same ratio squared = 434,551"}</Equation>
                <WhyThisWorks title="Why a column with a larger spread can dominate distance">
                  <p>

                    A typical gap in a column is about the size of that
                    column&rsquo;s spread, so a typical squared gap is about the
                    square of the spread. The two columns contribute to a
                    squared distance in roughly the proportion of those two
                    squares, which here is four hundred thousand to one. The
                    whole width of the water column, 0.54 meters from the driest
                    tree to the wettest, counts for exactly what 0.54 of a
                    millimeter of trunk counts for, since the sum is handed two
                    numbers and no units at all.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Dividing by each column’s standard deviation gives the columns equal variance in the reference data. It also cancels a positive change of unit because the values and their standard deviation scale together. Other scale measures, such as ranges or interquartile ranges, can also compensate for unit changes; standard deviation is one choice.</KeepInMind>
              </SubSection>

              <SubSection title="4. Comparing Predictions Across the Orchard" id="4-the-wrong-answer-measured">
                <p>
                  One tree is an anecdote, so the same question is put to all
                  twenty-four. Each tree in turn is held out, the fit is rebuilt
                  on the other twenty-three, and the twenty-four predictions are
                  then scored together against the twenty-four true weights. The
                  score is the usual one, where 1 means every prediction was
                  exact and 0 means the fit did no better than answering the
                  orchard&rsquo;s average weight to every tree, so a negative
                  score means it did worse than that.
                </p>
                <NumberTable
                  headings={["three nearest trees, chosen", "score over all twenty-four"]}
                  rows={[
                    ["in millimeters and meters, as recorded", "−0.7175"],
                    ["in standard scores", "0.9126"],
                    ["by the water column alone, unstandardized", "0.9544"],
                    ["by the trunk column alone, unstandardized", "−0.7238"],
                  ]}
                  caption="The recorded reading scores almost exactly what the trunk column alone scores, which is what it means to say that the unit chose the column."
                />
                <KeepInMind>

                  The failure is not a blurred answer. Reading the columns as
                  recorded produced a fit worse than a constant, and it did so
                  quietly, since every distance was computed correctly and every
                  neighbor really was the nearest under the sum it was given.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Subtract the Average, Divide by the Spread",
          content: (
            <>
              <SubSection title="5. The two numbers a column teaches">
                <p>Calculate a reference mean and standard deviation for each column. Subtract that mean from a value, then divide the departure by that standard deviation. The result is its standard score. Those two learned reference numbers are the fitted state this transformer needs.</p>
                <Equation>{"z = (value − average) / spread"}</Equation>
                <p>

                  The spread here is the standard deviation, which is the square
                  root of the average squared distance from the average. The
                  playground at the top of the page is that line drawn twice.
                  The upper line holds trunk girths in millimeters and the lower
                  line holds the same trunks in standard scores, both on rulers
                  that stay put, so a dot that falls off either end is drawn
                  faint at the end it fell off. Drag a trunk about and watch how
                  differently the two lines answer.
                </p>
                <KeepInMind>

                  The reference values are calculated from the selected training column. We still choose which observations define that reference and which variance convention to use. Unlike a fixed conversion from millimeters to meters, standardization therefore depends on the data used to fit it.</KeepInMind>
              </SubSection>

              <SubSection title="6. Five saplings by hand">
                <p>

                  Press the nursery row button on the playground. Five saplings
                  were measured at 210, 210, 260, 160 and 310 millimeters, and
                  the whole arithmetic comes out in whole numbers as far as the
                  square root. The average first.
                </p>
                <Equation>{"210 + 210 + 260 + 160 + 310 = 1150,   1150 / 5 = 230"}</Equation>
                <WorkedExample title="The nursery row, all the way through">
                  <p>
                    The five distances from 230 are &minus;20, &minus;20, 30,
                    &minus;70 and 80, whose squares are 400, 400, 900, 4900 and
                    6400. Those add to 13,000 and their average is 2600, which
                    is the variance, and the spread is its square root.
                  </p>
                  <Equation>{"400 + 400 + 900 + 4900 + 6400 = 13,000\n13,000 / 5 = 2600,   √2600 = 50.990195"}</Equation>
                  <p>
                    Now divide each of the five distances by 50.990195, which is
                    the whole of the transformation.
                  </p>
                  <Equation>{"−20 / 50.990195 = −0.392232\n−20 / 50.990195 = −0.392232\n 30 / 50.990195 =  0.588348\n−70 / 50.990195 = −1.372813\n 80 / 50.990195 =  1.568929"}</Equation>
                  <p>The two saplings of 210 mm receive the same standard score. The 160 mm sapling is 1.37 standard deviations below the mean, while the 310 mm sapling is 1.57 above it. The 310 mm value is therefore farther from the mean in absolute standard-score distance.</p>
                </WorkedExample>
                <KeepInMind>

                  Nothing in that sum needed to know what a millimeter is. The
                  same five steps run on a column of test marks, of prices or of
                  rainfall, and the answers are five numbers that no longer
                  carry a unit at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the transformation promises">
                <p>For a finite, nonconstant reference column, using its population mean and population standard deviation produces a column with mean zero and population variance one in exact arithmetic. The following algebra shows both properties.</p>
                <Equation>{"zᵢ = (xᵢ − m) / s\naverage(z) = (1/n) Σ (xᵢ − m) / s = (1/s)(m − m) = 0\nvariance(z) = (1/n) Σ (xᵢ − m)² / s² = s² / s² = 1"}</Equation>
                <WhyThisWorks title="Checking that the transformed mean is zero and variance is one">
                  <p>

                    The first line is the transformation, with m for the average
                    and s for the spread. The second says that the distances
                    from an average always cancel, which is what makes an
                    average an average, so dividing them all by one number
                    leaves them canceling still. The third is the whole
                    argument. The average of the squared distances is s² by the
                    definition of s, and dividing every distance by s divides
                    that average by s², which leaves exactly one.
                  </p>
                </WhyThisWorks>
                <p>
                  The nursery row shows both. Its five standard scores average
                  to 0 and their variance is 1, printed by the playground as an
                  average of 0.000 and a spread of 1.000.
                </p>
                <KeepInMind>
                  The variance used to fit the scale and the variance used to check the output must use compatible conventions. Here both divide by the count, giving transformed population variance one. If we keep this transformation but check its output using the sample denominator, one fewer than the count, the result is 1.25 on the nursery row. If we instead fit using the sample standard deviation, the output’s sample variance is one and its population variance is smaller.</KeepInMind>
              </SubSection>

              <SubSection title="8. The unit has gone">
                <p>

                  The claim that the standard score removes the unit can be
                  checked rather than believed. Write every trunk in centimeters
                  instead of millimeters, which divides each value by ten, and
                  the average and the spread are divided by ten as well, so the
                  quotient is untouched. Add a thousand millimeters to every
                  trunk and the average moves by exactly a thousand while the
                  spread does not move at all, so again the quotient is
                  untouched.
                </p>
                <Equation>{"(a·x + b − average(a·x + b)) / spread(a·x + b) = a(x − average(x)) / (a · spread(x))"}</Equation>
                <WorkedExample title="The nursery row moved twice">
                  <p>

                    The five saplings are the whole-number column 1, 1, 2, 0, 3
                    stretched by 50 and shifted by 160, and standardizing that
                    whole-number column gives &minus;0.392232, &minus;0.392232,
                    0.588348, &minus;1.372813 and 1.568929, which are the five
                    scores worked out above. The largest disagreement between
                    the two sets is 2.2 × 10⁻¹⁶, which is the last bit of a
                    number near one and is what dividing by two different
                    numbers costs. On the orchard&rsquo;s twenty-four trunks,
                    adding a thousand millimeters to every one of them changes
                    the largest score by exactly zero.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Shifts and positive rescalings cancel exactly in the mathematical expression. Finite-precision calculations can leave small differences, as in the example above. A tolerance should reflect the numerical scale and calculation rather than requiring every stored decimal to match.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Rewriting a column in a unit a thousand times smaller multiplies every gap in it by a thousand. What does that do to its say in a squared distance?",
              [
                "Multiplies it by a million",
                "Multiplies it by a thousand",
                "Leaves it untouched",
                "Multiplies it by the square root of a thousand",
              ],
              0,
              "Each column contributes a squared difference to squared Euclidean distance. Multiplying that column's differences by a thousand therefore changes its contribution by:\n\n```math\n1,000² = 1,000,000\n```\n\nFor this orchard, the ratio of the recorded spreads is 659.21 and its square is 434,551. Without scaling, the numerical girth differences dominate this distance.",
            ),
            choice(
              "Scored over all twenty-four trees, the nearest-neighbor fit on the recorded columns comes to −0.7175. Which other reading does that almost exactly match?",
              [
                "The trunk column alone, unstandardized, at −0.7238",
                "The water column alone, unstandardized, at 0.9544",
                "Both columns in standard scores, at 0.9126",
                "None of the others, since a negative score cannot be compared",
              ],
              0,
              "The two scores are close because girth dominates distances in the recorded units, so adding water barely changes which neighbors are chosen. Negative R² means these held-out predictions have more squared error than the evaluation targets' own mean baseline. The distances can be computed correctly while giving little influence to a useful input.",
            ),
            trueFalse(
              "Adding a thousand millimeters to every trunk in the orchard changes the largest standard score by exactly zero.",
              true,
              "In exact arithmetic, adding a constant shifts the mean by the same constant and leaves the standard deviation unchanged, so the scores are unchanged. This particular whole-number shift also agrees numerically. Floating-point calculations do not guarantee exact shift invariance for arbitrary magnitudes. The separate rescaling comparison differs by 2.2 × 10⁻¹⁶, which is rounding at the scale of these scores.",
            ),
            several(
              "For a finite column with positive spread, standardize by subtracting its mean and dividing by its population standard deviation. Which properties hold in exact arithmetic?",
              [
                              "Its average is exactly zero",
                              "Its spread is exactly one, where the spread was worked out by dividing the sum of squares by the count of values",
                              "Two values that were equal before come out equal",
                              "Its values all lie between minus one and one",
                            ],
              [0, 1, 2],
              "The distances from an average always cancel, which is what makes an average an average, and dividing them all by one number leaves them canceling still. The two saplings of 210 mm come out at the same score because the transformation asks nothing about a value except what it is. The nursery row’s widest sapling comes out at 1.57, which settles the claim that every score lies between minus one and one, and the lopsided column of Part 5 reaches 3.34.",
              {
                "description": "Population standard deviation uses the row count N in the variance denominator. Use the same rows and convention when checking the resulting scores. A constant column is excluded."
              },
            ),
            trueFalse(
              "With the spread worked out by dividing the sum of squares by the count of values, reading the variance of the scores back by dividing by one fewer still reports exactly one.",
              false,
              "The standardizer uses population variance, dividing the original sum of squared deviations by five. Its five squared standard scores therefore sum to five. Reporting their variance with a divisor of four gives:\n\n```math\n5 / 4 = 1.25\n```\n\nUnit variance requires the same population convention used to fit the standardizer.",
            ),
        ],
        },
        {
          title: "Part 3. A Value Measured in Its Own Deviations",
          content: (
            <>
              <SubSection title="9. What a standard score says">
                <p>A standard score of 2 means two standard deviations above the reference mean. For the trunk of 620 millimeters, the score is 2.04 relative to this orchard. That describes its distance from the mean on a shared scale. It does not by itself give a tail probability or establish whether the measurement is physically plausible.</p>
                <Equation>{"(620 − 387.625) / 113.652 = 2.0446"}</Equation>
                <KeepInMind>
                  The sign carries the direction and the size carries the
                  distance. A score of zero means a value sitting exactly at the
                  column&rsquo;s average, which is not the same as a value being
                  ordinary, since a column can have two clumps and an average
                  that no tree is anywhere near.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Two unrelated columns become comparable">
                <p>The raw values 620 and 0.95 describe different quantities and cannot be ranked meaningfully by their numerical size alone. Standard scores compare how far each lies from its own reference mean, measured in standard deviations. That is a comparison of relative departures, while comparing actual rarity also requires the shapes of the two distributions.</p>
                <DeviationsAxis />
                <p>
                  The same change reaches the summary of how two columns move
                  together. Once both are in standard scores their covariance is
                  their correlation, since a correlation is exactly a covariance
                  with each column&rsquo;s spread divided out; measured on the
                  orchard the two numbers agree to sixteen decimal places, both
                  coming to &minus;0.0826.
                </p>
                <InAModel title="The widest trunk against the wettest tree">
                  <>
<p>The widest trunk is 620 mm, or 2.04 standard deviations above its column mean. The greatest water value is 0.95 m, or 1.57 standard deviations above its mean. The trunk is therefore about half a standard deviation farther from its own mean. Both are maxima in their respective observed columns; this comparison does not establish that one has a smaller tail probability.</p>
                  <p>
                    The tree with the widest trunk is also the one that most needed telling apart from the rest, since it was given only 0.47 m of water, a reading 1.21 spreads below average, and it bore 30.82 kg.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Comparable does not mean equally important. Putting the two
                  columns on one axis makes their positions readable side by
                  side and says nothing at all about which column matters to the
                  fruit, which the orchard has already answered in the other
                  direction.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Weights that can be ranked">
                <p>Raw regression coefficients use different input units: kilograms per millimeter for trunk girth and kilograms per meter for water. With standardized inputs, each coefficient describes the predicted kilogram change for a one-standard-deviation increase in that input while holding the other input fixed. Their magnitudes can then be compared on that specified scale. This is a comparison within the fitted model, rather than a complete measure of causal importance.</p>
                <WhoNoticed panel="coefficients" />
                <InAModel title="The orchard’s line in two coordinate systems">
                  <p>The raw coefficients are 0.0038802 for trunk girth and 49.560 for water, a numerical ratio of nearly thirteen thousand. Their different units prevent reading that ratio as relative importance. Standardized coefficients are 0.4410 and 8.5446, a ratio of 19.375 for one-standard-deviation input changes with the other input held fixed. Dividing by the corresponding input spreads recovers 0.0038802 and 49.560, so both coordinate systems describe the same fitted predictions.</p>
                </InAModel>
                <KeepInMind>
                  A ranking of standardized weights is a statement about this
                  orchard&rsquo;s spreads and not a law about trunks and water.
                  Measure a second orchard where every tree got nearly the same
                  drink, and the water column&rsquo;s spread collapses, its
                  standardized weight falls with it, and the same underlying
                  relationship reports a different ranking.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. How far out is far out">
                <p>
                  Since a standard score is a count of spreads, it is tempting
                  to reach for the familiar figures, that about two thirds of a
                  column falls within one spread and about nineteen twentieths
                  within two. Those figures belong to the bell curve and not to
                  the standard score, and the orchard shows the difference
                  without being unusual in any way.
                </p>
                <NumberTable
                  headings={["column", "within one", "within two", "within three"]}
                  rows={[
                    ["trunk girth", "0.6667", "0.9583", "1.0000"],
                    ["water", "0.5833", "1.0000", "1.0000"],
                    ["a bell curve", "0.6827", "0.9545", "0.9973"],
                  ]}
                  caption="The trunks come close to the bell figures by accident and the water column does not, being flatter than a bell and therefore holding less of itself near the middle."
                />
                <p>For a finite nonconstant column, the variance gives a distribution-free bound for any positive k. At most one part in k squared can lie farther than k standard deviations from the mean. At least three quarters therefore lie within two standard deviations, and at least eight ninths within three. Both orchard columns satisfy those bounds.</p>
                <Equation>{"share beyond k spreads ≤ 1 / k²"}</Equation>
                <KeepInMind>
                  The distribution-free bound is loose on purpose, since it has
                  to hold for the worst-behaved column anyone could construct.
                  Use it to know that a score of 10 is rare in any column at
                  all, and do not use it to decide what is unusual in a
                  particular one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Which Fits Need It and Which Do Not",
          content: (
            <>
              <SubSection title="13. Distances and Directions of Variation" id="13-anything-that-adds-columns-together">
                <p>Distance-based calculations combine squared gaps from different columns, so their relative scales act as weights. <Link href="/concepts/k-means" className={link}>K-means</Link> uses those distances to assign points and fit centers. <Link href="/concepts/pca" className={link}>Principal component analysis</Link> chooses directions of greatest variance, which can combine several columns. Rescaling the coordinates changes that variance comparison; the first component does not simply select whichever single column has the largest variance.</p>
                <WhoNoticed panel="scores" />
                <KeepInMind>

                  For a fit that adds columns together, the decision about
                  scaling is made whether or not anybody makes it. Leaving the
                  orchard as recorded is the decision that one millimeter of
                  trunk matters as much as one meter of water.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Anything that penalizes a weight" id="14-anything-that-penalises-a-weight">
                <p>The <Link href="/concepts/ridge-lasso" className={link}>penalized regression</Link> examples charge for coefficient size: ridge uses squares and lasso uses absolute magnitudes. A feature with larger numerical values can use a smaller coefficient for the same prediction effect, reducing that charge. Equal penalties on raw coefficients therefore imply a scale-dependent preference.</p>
                <InAModel title="One penalty over the orchard">
                  <p>
                    At a penalty of one on the recorded columns, the weight on
                    water is squeezed from the 49.56 that least squares wanted
                    down to 20.55, because 49.56 is an expensive number to hold,
                    and the fit&rsquo;s score falls from 0.9845 to 0.6475. On
                    standard scores the same penalty takes the water weight from
                    8.5446 to 8.1992 and the score to 0.9828. Held out tree by
                    tree, the recorded fit scores 0.5452 and the standardized
                    one 0.9768.
                  </p>
                </InAModel>
                <KeepInMind>
                  At penalty ten, the standardized fit’s score is 0.8712. Standardization has not removed the need to choose penalty strength. It expresses each coefficient per standard deviation of its input, giving the shared penalty a consistent scale for those coefficients.</KeepInMind>
              </SubSection>

              <SubSection title="15. Trees Under Rescaling" id="15-a-tree-never-notices">
                <p>
                  A{" "}
                  <Link href="/concepts/decision-trees" className={link}>
                    decision tree
                  </Link>{" "}

                  compares values only within a column. Every question it asks
                  is whether a value falls below a threshold, and the apple
                  trees that go left when asked about 0.665 meters go left when
                  asked about &minus;0.082 spreads, because the threshold was
                  chosen from the same column that was rescaled and moves along
                  with it.
                </p>
                <WhoNoticed panel="tree" />
                <InAModel title="The same tree twice">
                  <p>
                    Grown on the recorded columns to a depth of three, the tree
                    roots on whether water is below 0.665 and has eight leaves.
                    Grown on standard scores it roots on whether water is below
                    &minus;0.08217, which multiplied by the water spread and put
                    back about the average water is 0.665. The largest gap
                    between the two sets of twenty-four predictions is exactly
                    zero, and both score 0.8940 held out tree by tree.
                  </p>
                </InAModel>
                <KeepInMind>
                  For an exact axis-aligned tree search, a strictly increasing transformation preserves the available training-row partitions. Positive affine rescaling also carries the usual midpoint thresholds into equivalent thresholds in exact arithmetic. Numerical precision, approximate split searches and other implementation details can still affect a fitted tree. Nonlinear transformations can also change how a midpoint threshold behaves between training observations.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Least Squares Under Rescaling" id="16-least-squares-never-notices-either">
                <p>An unregularized least-squares model with an intercept can absorb a nonzero feature rescaling into its coefficients. For example, multiplying one column by a hundred allows its coefficient to be divided by a hundred. In an identified fit like this orchard example, the prediction rule is unchanged in exact arithmetic. Numerical conditioning can still affect the computed result.</p>
                <InAModel title="The orchard’s line, recorded and standardized">
                  <p>

                    Both fits score 0.98445555, and the gap between the two
                    scores is exactly zero rather than merely small. Held out
                    tree by tree, both score 0.97911. That is the same objective
                    the penalized fit above was minimizing, with one term added,
                    and the added term is what broke the property.
                  </p>
                </InAModel>
                <KeepInMind>
                  A fit is untouched by the units when a change of unit can be
                  absorbed entirely into what the fit is free to choose. A tree
                  absorbs it into its thresholds and a least-squares line into
                  its weights; a penalty takes away that freedom by charging for
                  the weights, and a distance never had it, since the weights
                  are all fixed at one.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Limits of Standardization" id="17-where-standardizing-is-the-wrong-move">
                <p>Standardization gives both reference columns unit variance. It does not give each column exactly half of every pairwise distance, and it does not decide which column is useful for predicting yield. The orchard lets us compare standardized use of both columns with use of water alone.</p>
                <NumberTable
                  headings={["three nearest trees, chosen", "score over all twenty-four"]}
                  rows={[
                    ["by both columns, as recorded", "−0.7175"],
                    ["by both columns, in standard scores", "0.9126"],
                    ["by the water column alone", "0.9544"],
                  ]}
                  caption="The water-only score exceeds the standardized two-feature score by 0.042 in this comparison. That result needs separate evaluation if it is used to choose features."
                />
                <p>On this orchard, standardization improves a fit that performed worse than a constant, but removing the unhelpful feature performs better still. Standardization did not need advance knowledge of which column mattered. It changed the relative scale while retaining both columns; feature selection answered a different question.</p>
                <KeepInMind>

                  The other case where an equal say is wrong is a column that is
                  mostly zeros, where subtracting an average fills every zero
                  with a small number and destroys whatever made the column
                  cheap to store and meaningful to read. That is the worry the
                  scalers that do not subtract a center exist for, and it is on
                  the{" "}
                  <Link href="/concepts/feature-scaling" className={link}>
                    feature scaling
                  </Link>{" "}
                  page.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "The widest trunk is 2.04 standard deviations above its column mean, and the wettest tree is 1.57 standard deviations above its column mean. Which is farther above its mean on this scale?",
              [
                "The trunk, by about half a spread",
                "The water, by about half a spread",
                "Neither, since millimeters and meters answer no common question",
                "The water, since water very nearly decides the fruit",
              ],
              0,
              "The trunk is farther above its mean in standard-deviation units. Standard scores let us compare those distances despite different physical units. They do not tell us which feature matters more to fruit yield, or how rare either observation is unless we also know the shapes of the two distributions.",
            ),
            choice(
              "On the recorded columns the fitted weights are 0.0038802 on trunk and 49.560 on water. On standard scores they are 0.4410 and 8.5446. What does the second pair say?",
              [
                "Moving a tree one spread along the water column is worth about nineteen times as much fruit as moving it one spread along the trunk column",
                "Water matters nearly thirteen thousand times as much as trunk girth",
                "The two fits are different lines, and the standardized one is the better of them",
                "Trunk girth is worth 0.4410 kilograms per millimeter",
              ],
              0,
              "Holding the other input fixed, the fitted line associates one standard deviation more water with 8.5446 kg more fruit and one standard deviation more girth with 0.4410 kg more fruit. Both coefficients now use comparable input scales. Dividing each by its original column standard deviation recovers its raw-unit coefficient. These are fitted associations in this orchard, not causal effects or a universal ranking of feature importance.",
            ),
            several(
              "Which of these fits are left unchanged by standardizing their inputs?",
              [
                              "A decision tree, which compares values only within a column",
                              "A plain least-squares line, which has a free weight per column",
                              "A penalized line, which adds the squared size of every weight to what it makes small",
                              "k-means, whose centers are chosen to minimize a squared distance",
                            ],
              [0, 1],
              "A fit is untouched when a change of unit can be absorbed entirely into what the fit is free to choose. A tree absorbs it into its thresholds and a least-squares line into its weights. A penalty takes that freedom away by charging for the weights, and a distance never had it, since its weights are all fixed at one.",
              {
                "description": "Compare the same finite training rows before and after scaling each nonconstant input by its positive standard deviation and shifting by its mean. The least-squares model includes a free intercept. For a tree, compare corresponding thresholds and use the same tie rules. “Unchanged” means the attainable predictions or partitions, not identical stored coefficients."
              },
            ),
            trueFalse(
              "The tree grown on standard scores roots on water below −0.08217, and its twenty-four predictions are identical to those of the tree grown on the recorded columns.",
              true,
              "Converting this standardized threshold back to the original water units gives 0.665, the recorded tree's threshold. The twenty-four predictions agree exactly, both trees have eight leaves, and both score 0.8940 on the held-out comparison. That is the expected result for this affine rescaling and exact split procedure; it should not be read as a guarantee for every transformation and implementation.",
            ),
            trueFalse(
              "On this orchard the standard score was the best of the readings measured.",
              false,
              "Water alone scores 0.9544 when each tree is held out in turn; both standardized inputs score 0.9126. Adding girth reduces performance for this nearest-neighbor comparison, even after scaling. Standardization changes the distance calculation, but it cannot decide whether an input is useful. Choosing inputs from these scores is itself a model-selection decision and needs an independent evaluation.",
            ),
        ],
        },
        {
          title: "Part 5. The Two Numbers Belong to the Training Rows",
          content: (
            <>
              <SubSection title="18. Learn on the rows the fit saw">
                <p>
                  A standard score is not a property of a value. It is a
                  property of a value and a column together, and which column is
                  a real choice when some rows are held back to test on. The
                  rule is that the average and the spread are worked out from
                  the training rows alone and then applied unchanged to
                  everything afterwards, whether that is a held-out tree, a tree
                  planted next season, or a training tree put through again.
                </p>
                <Equation>{"held-out score = (held-out value − training average) / training spread"}</Equation>
                <KeepInMind>
                  The held-out rows need not have mean zero or standard deviation one after this transformation. Those properties hold for the training rows used to learn the reference, subject to the numerical convention. New rows are measured against that same saved reference, rather than fitted to a new one of their own.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Measuring held-out rows against themselves">
                <p>
                  The tempting alternative is to standardize the held-out rows
                  with their own average and their own spread, which looks like
                  the same operation and is a different one. Take the four
                  wettest trees out of the orchard, fit on the twenty that
                  remain, and then read the four both ways.
                </p>
                <HeldOutTrees />
                <InAModel title="Four trees that were all wet">
                  <>
<p>
                    The twenty kept trees have an average drink of 0.6305 m and a spread of 0.1462, so the four held-out trees come out at 2.05, 2.18, 1.84 and 1.91 spreads above average, which is the right description of four trees that were the wettest in the orchard. Standardized against themselves they come out at 0.39, 1.43, &minus;1.17 and &minus;0.65, announcing that two of the four wettest trees in the orchard were drier than average, because the only average they were compared with was their own.
                  </p>
                  <p>
                    Put through the line fitted on the twenty, the first reading predicts 54.81, 56.10, 53.73 and 53.94 kg against true weights of 53.00, 55.14, 52.10 and 53.08, worst error 1.81 kg. The second predicts 42.15, 50.64, 31.63 and 34.73, worst error 20.47 kg.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Separately fitting the held-out reference changes the coordinates supplied to the saved model. The discrepancy can be large when that reference differs strongly from training, as it does for these four wet trees. A random held-out group can produce a smaller discrepancy, but that does not make refitting its reference the intended prediction procedure.</KeepInMind>
              </SubSection>

              <SubSection title="20. Learning the numbers over everything, measured">
                <p>Another leakage error is fitting the reference on the whole orchard before cross-validation. The held-out rows then contribute to the mean and standard deviation used by each training fold. That differs from fitting a separate reference inside every training fold, even if the observed score difference happens to be small.</p>
                <WhoNoticed panel="leak" />
                <InAModel title="What the trace was worth here">
                  <p>In this orchard’s leave-one-tree-out comparison, the largest score difference across the six fits is 0.0037, for the strongly penalized line. The leaked version performs slightly worse. The nearest-neighbor models, tree and least-squares line show no score difference in this experiment.</p>
                <p>The leakage remains a procedural error because held-out data influenced preparation. Its effect on a particular score need not be positive or visible. We should correct that information boundary without claiming an improvement the measurements do not show.</p>
                </InAModel>
                <p>The tree and unregularized least-squares results reflect the positive affine invariances described earlier, subject to the same exact-arithmetic and implementation qualifications. Their zero score gaps are therefore expected in this example. The nearest-neighbor zeros have no such guarantee: leaving out one tree happened not to change the selected distance rankings.</p>
                <KeepInMind>
                  The observed small effect does not justify using held-out rows to fit preparation. Other references or target-dependent transformations can change results more substantially. A{" "}{" "}
                  <Link href="/concepts/pipelines" className={link}>
                    pipeline
                  </Link>{" "}
                  {" "}keeps learned transformations inside each fitting boundary.</KeepInMind>
              </SubSection>

              <SubSection title="21. What the transformation does not fix">
                <p>In exact arithmetic, standardization is a positive affine transformation of a nonconstant column. It preserves the ordering, relative gap sizes and distribution shape while changing the reference and scale.</p>
                <ShapeSurvives panel="shape" />
                <InAModel title="A column with a long tail">
                  <p>
                    Fifteen readings running 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4,
                    6, 9, 20 are strongly lopsided to the right, and the usual
                    measure of that lopsidedness is 2.4896725430. After
                    standardizing it is 2.4896725430, agreeing to the last bit
                    the arithmetic keeps, and the order of the fifteen is
                    unchanged. The 20 was the value furthest from typical before
                    and it is the value furthest from typical after, now called
                    3.34.
                  </p>
                </InAModel>
                <KeepInMind>
                  Standardization does not remove skew, shorten a tail relative to the rest of the column, or validate extreme observations. A logarithm, rank transformation or clipping rule changes the representation in other ways. Choose one only when its assumptions and consequences suit the task; scaling alone does not substitute for that decision.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. When There Is No Spread to Measure Against", id: "part-6-where-the-standard-score-stops-being-defined",
          content: (
            <>
              <SubSection title="22. A column with no spread">
                <p>
                  Every value in the column is 300. Its average is 300, every
                  distance from that average is exactly zero, and so the spread
                  is exactly zero. The standard score of any of those values is
                  therefore zero divided by zero, which has no value at all. The
                  same holds for a column of one value, since one value is
                  always its own average and so its one distance from it is
                  zero.
                </p>
                <DerivationTable
                  expressionHeading="the column"
                  reasonHeading="what the arithmetic says"
                  rows={[
                    {
                      expression: "300, 300, 300, 300",
                      reason:
                        "every distance from the average is 0, so the spread is 0 and each score is 0 / 0, which has no value. Nothing about the column is wrong; the quotient simply does not exist.",
                    },
                    {
                      expression: "300",
                      reason:
                        "the same, reached differently. One value is its own average, so its one distance is 0. With the other convention for the spread, dividing the sum of squares by one fewer than the count, the variance itself is 0 / 0 before any square root is taken.",
                    },
                    {
                      expression: "300, 300.0000000000001",
                      reason:
                        "defined, and the boundary is that sharp. The spread is 5.7 × 10⁻¹⁴, which is positive, so these two values come out at exactly −1 and 1. In exact arithmetic, any two distinct observations have those population-standardized scores.",
                    },
                  ]}
                />
                <>
<p>A zero standard deviation makes the displayed quotient undefined. Software therefore needs a documented policy for that case. The next paragraph describes conventions that retain or remove the constant column and how those choices affect the output schema.</p>
                <p>Assigning a scale of one to a constant column is a possible software convention, not evidence of measured variation. After centering, that column contains zeros. Dropping it is another policy, but it changes the output columns. An application needs an explicit choice that remains compatible with the calculations that follow.</p>
</>
                <KeepInMind>
                  A column that varies in the complete dataset can become constant within one training fold. A constant column everywhere and a locally constant training column supply different evidence. Keep that distinction when deciding whether to reject, retain or remove it.</KeepInMind>
              </SubSection>

              <SubSection title="23. Very Small Standard Deviations" id="23-a-spread-of-almost-nothing-is-still-a-spread">
                <p>
                  The boundary between defined and undefined is a single point
                  and the arithmetic sits right up against it. Nine readings each
                  one machine epsilon further along than the last have a spread
                  of about 2.6 × 10⁻¹⁶, which is positive, so every one of the
                  nine has a standard score and they run evenly from &minus;1.55
                  to 1.55.
                </p>
                <ShapeSurvives panel="tiny" />
                <p>The stored values alone may not tell us whether their tiny differences reflect real variation or numerical rounding. Standardizing real differences makes them visible on a relative scale; standardizing rounding noise amplifies that noise as well. A near-constant policy needs the measurement resolution, numerical scale and intended use, rather than one universal absolute cutoff.</p>
                <KeepInMind>
                  Either answer is defensible and neither can be right in
                  general, since the two cases are identical in the data and
                  differ only in where the data came from. What is not
                  defensible is doing one of them without saying so, because the
                  two produce different columns and both produce a fit.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Outliers Change the Reference" id="24-the-values-most-in-need-of-taming-set-the-scale">
                <p>
                  Both numbers the transformation uses are sums over every value
                  in the column, so both can be moved a long way by a single
                  value. That is awkward in a particular way here, since the
                  reason for reaching for a standard score is often that one
                  column contains something extreme, and the extreme value is
                  the one deciding what typical means and what a spread is.
                </p>
                <ShapeSurvives panel="outlier" />
                <InAModel title="One trunk typed with a stray digit">
                  <p>
                    The orchard&rsquo;s trunk of 438 mm typed as 4380 moves the
                    average trunk from 387.6 to 551.9 and the spread from 113.7
                    to 806.2. The widest real trunk in the orchard, 620 mm, read
                    2.04 spreads above average and now reads 0.08. The other
                    twenty-three trees, which spanned 3.68 spreads between them,
                    are pressed into 0.52 of a spread, all sitting between
                    &minus;0.43 and 0.08, while the mistyped trunk sits alone at
                    4.75.
                  </p>
                </InAModel>
                <p>The transformed column still has mean zero and standard deviation one, subject to rounding, and the mistyped value remains extreme. The other twenty-three values are compressed into a smaller fraction of the fitted scale, but their distinctions are not erased. The changed reference can alter distance comparisons or penalized fits that combine this feature with others.</p>
                <KeepInMind>

                  Medians and quartiles depend on ordered positions rather than directly averaging every magnitude. They are often less sensitive to a small number of extreme values, but they are not immune, especially in small samples or with several contaminated observations. Their behavior and limitations are discussed on the{" "}{" "}
                  <Link href="/concepts/feature-scaling" className={link}>
                    feature scaling
                  </Link>{" "}
                  page.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Standard Scores and Distribution Shape" id="25-standard-does-not-mean-normal">
                <p>
                  The last thing the transformation does not say is the one its
                  name most invites. A standard score is defined for any column
                  whose spread is positive, and the definition never mentions a
                  bell curve, a symmetry or a shape. Standardizing a column that
                  is nothing like a bell gives a column that is nothing like a
                  bell, with an average of zero and a spread of one.
                </p>
                <NumberTable
                  headings={[
                    "fifteen readings with a long tail",
                    "as recorded",
                    "in standard scores",
                  ]}
                  rows={[
                    ["lopsidedness", "2.4896725430", "2.4896725430"],
                    ["share within one spread of the average", "0.8667", "0.8667"],
                    ["furthest value, in spreads", "3.3423", "3.3423"],
                  ]}
                  caption="A bell curve would put 0.6827 of itself within one spread, and these readings put 0.8667 there before and after, since the transformation had nothing to say about the shape."
                />
                <p>A standard score of 3 does not itself mean one observation in a thousand. On the fifteen readings above, one value exceeds 3. Tail probabilities require a distributional model and a clear choice of tail. Standardization also does not verify a method’s normality assumption: first identify whether that assumption concerns inputs, errors or another quantity, then examine the relevant evidence.</p>
                <KeepInMind>
                  The name refers to a value measured in standard-deviation units. The transformation fixes a reference location and scale; it leaves the relative distribution shape unchanged. It does not establish data quality, normality or predictive usefulness.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "The four wettest trees are held out and the fit is built on the twenty that remain. Standardized against their own average and their own spread, what do those four report?",
              [
                "That two of the four wettest trees in the orchard were drier than average",
                "That all four stood between 1.8 and 2.2 spreads above average",
                "That all four sat exactly at the average",
                "Nothing, since four rows are too few to have a spread",
              ],
              0,
              "They come out at 0.39, 1.43, −1.17 and −0.65, because the only average they were compared with was their own. Against the twenty training rows they come out between 1.84 and 2.18 spreads above average, which is the right description of four trees that were the wettest in the orchard, and the worst prediction error goes from 1.81 kg to 20.47 kg.",
            ),
            trueFalse(
              "Standardizing the whole orchard before splitting it into folds changed the cross-validated scores of the tree and of the least-squares line by exactly zero.",
              true,
              "For these procedures, shifting and positively rescaling nonconstant inputs can be absorbed into tree thresholds or the free coefficients and intercept of least squares. Their measured scores therefore agree. The penalized line is sensitive to scale; fitting its scaler before splitting changed its score by 0.0037 in the worse direction here. Leakage need not improve a score to make a procedure inappropriate: fit learned preprocessing within each training fold so validation follows the intended prediction process.",
            ),
            trueFalse(
              "Standardizing a strongly lopsided column reduces its lopsidedness.",
              false,
              "Standardization changes location and scale while preserving the distribution's shape. The measured skewness of these fifteen readings remains 2.4896725430. A logarithm, rank transformation or cap changes values differently and needs its own justification; none is performed by standardization.",
            ),
            choice(
              "One trunk of 438 mm is typed as 4380. What happens to the other twenty-three trees?",
              [
                "They are pressed into 0.52 of a spread, where they had spanned 3.68 between them",
                "Their scores are untouched, since only the mistyped value moved",
                "They spread further apart, because the spread of the column grew",
                "They all come out at exactly zero",
              ],
              0,
              "The mistyped value moves the fitted girth mean from 387.6 to 551.9 and the standard deviation from 113.7 to 806.2. The other trees' scores are compressed into a narrower range. Their distinctions still exist mathematically, but receive less weight in a distance calculation. A zero mean and unit standard deviation do not establish that the source measurements are correct.",
            ),
            several(
              "The standard score is defined for any column whose spread is positive, and the definition promises exactly two numbers. Which of these follow?",
              [
                "A column in which every value is 300 has no standard scores, since every distance from its average is zero and so is its spread",
                "A finite column with genuinely representable nonzero spread still has defined standard scores, even if that spread is very small",
                "Substituting a spread of one for a constant column lets the fit learn what that column carried",
                "A standardized column is ready for a method that assumes normality"
              ],
              [0, 1],
              "The mathematical quotient exists for positive spread and is undefined at zero spread. Numerical code must still check representability, rounding and underflow. Replacing zero spread with one returns zeros for a constant column; it does not create variation the data lacked. Standardizing changes location and scale, not the distribution’s shape.",
              {
                "description": "Use the mathematical definition (x − mean) / standard_deviation. The spread is positive when the represented values genuinely differ. The question does not promise that arbitrary floating-point code can measure every tiny spread accurately."
              },
            ),
        ],
        },
        {
          title: "Practice. Standardizing the Orchard With the Library",
          practice: [
            exercise(
              "Take the nursery row through the standardizer",
              [
  "Fit Standardizer to the supplied five sapling heights in millimeters. Print learned mean/spread and all transformed scores.",
  "Print the scores’ mean and variance using divisors five and four. The transformer uses its stated population-variance convention, so changing only the reporting divisor changes the measured variance."
],
              `from oop_ml import Feature, Standardizer

saplings = Feature("trunk", [210, 210, 260, 160, 310])

scaler = Standardizer().fit([saplings])
# Print the average and the spread the scaler learned for "trunk", then the
# five standard scores it produces, then the average of those scores, their
# variance dividing by five, and their variance dividing by four.`,
              `from oop_ml import Feature, Standardizer

saplings = Feature("trunk", [210, 210, 260, 160, 310])

scaler = Standardizer().fit([saplings])
learned = scaler.scalings["trunk"]
print(f"average {learned.mean:.1f} mm, spread {learned.standard_deviation:.6f} mm")

scores = [float(value) for value in scaler.transform([saplings])[0].values]
print("scores", [round(score, 6) for score in scores])

average = sum(scores) / len(scores)
squares = sum((score - average) ** 2 for score in scores)
print(f"average of the scores {average:.6f}")
print(f"variance dividing by five {squares / 5:.6f}")
print(f"variance dividing by four {squares / 4:.6f}")`,
              `average 230.0 mm, spread 50.990195 mm
scores [-0.392232, -0.392232, 0.588348, -1.372813, 1.568929]
average of the scores 0.000000
variance dividing by five 1.000000
variance dividing by four 1.250000`,
              { hints: [
  "The score measures distance from the fitted mean in units of the fitted spread.",
  "Use the same transformed scores for both NumPy variance conventions."
], check: numberCheck("What standard score does the 310 mm sapling get?", 1.568929, 1e-06, "The score is about 1.568929. It places the sapling above the fitted mean in units of the fitted population standard deviation."), question: "What unit does a standard score use, and which variance convention does it preserve?" },
            ),
            exercise(
              "Read the orchard's two numbers and fit the line twice",
              [
  "Fit the supplied orchard’s girth and water standardizer. Print both means/spreads and the spread ratio and its square.",
  "Fit the fruit-weight line on raw and standardized predictors. Print both coefficient sets, raw coefficients recovered from the standardized ones, both intercepts and mean target fruit weight. Keep the target in kg."
],
              `from oop_ml import Feature, MultipleLinearRegression, Standardizer

girth = [620, 385, 226, 297, 515, 240, 289, 202, 430, 202, 362, 302,
         438, 439, 494, 354, 369, 465, 426, 534, 359, 598, 418, 339]
water = [0.47, 0.55, 0.49, 0.93, 0.58, 0.45, 0.70, 0.79, 0.66, 0.84, 0.59, 0.76,
         0.41, 0.59, 0.51, 0.52, 0.95, 0.88, 0.90, 0.83, 0.48, 0.84, 0.67, 0.91]
fruit = [30.82, 36.40, 30.94, 53.00, 37.46, 30.61, 43.42, 47.20, 41.40, 49.00, 36.57, 46.92,
         27.78, 38.58, 37.01, 32.90, 55.14, 53.50, 52.10, 48.77, 32.04, 51.50, 42.89, 53.08]

columns = [Feature("girth", girth), Feature("water", water)]
target = Feature("fruit", fruit)
# Fit a Standardizer on the two columns and print each column's average and
# spread, then the ratio of the two spreads and its square. Fit a
# MultipleLinearRegression on the recorded columns and another on the
# standardized ones, and for each column print the recorded weight, the
# standardized weight, and the standardized weight divided by the spread.
# Finally print both intercepts and the average of the fruit column.`,
              `from oop_ml import Feature, MultipleLinearRegression, Standardizer

girth = [620, 385, 226, 297, 515, 240, 289, 202, 430, 202, 362, 302,
         438, 439, 494, 354, 369, 465, 426, 534, 359, 598, 418, 339]
water = [0.47, 0.55, 0.49, 0.93, 0.58, 0.45, 0.70, 0.79, 0.66, 0.84, 0.59, 0.76,
         0.41, 0.59, 0.51, 0.52, 0.95, 0.88, 0.90, 0.83, 0.48, 0.84, 0.67, 0.91]
fruit = [30.82, 36.40, 30.94, 53.00, 37.46, 30.61, 43.42, 47.20, 41.40, 49.00, 36.57, 46.92,
         27.78, 38.58, 37.01, 32.90, 55.14, 53.50, 52.10, 48.77, 32.04, 51.50, 42.89, 53.08]

columns = [Feature("girth", girth), Feature("water", water)]
target = Feature("fruit", fruit)
scaler = Standardizer().fit(columns)
for scaling in scaler.scalings:
    print(f"{scaling.name}: average {scaling.mean:.4f}, spread {scaling.standard_deviation:.4f}")
ratio = scaler.scalings["girth"].standard_deviation / scaler.scalings["water"].standard_deviation
print(f"ratio of spreads {ratio:.2f}, squared {ratio ** 2:,.0f}")

recorded = MultipleLinearRegression().fit(columns, target)
standardized = MultipleLinearRegression().fit(scaler.transform(columns), target)
for name in ("girth", "water"):
    spread = scaler.scalings[name].standard_deviation
    print(
        f"{name}: recorded {recorded.coefficients[name]:.7f}, "
        f"standardized {standardized.coefficients[name]:.4f}, "
        f"translated back {standardized.coefficients[name] / spread:.7f}"
    )
print(f"recorded intercept {recorded.intercept:.4f} kg")
print(f"standardized intercept {standardized.intercept:.4f} kg")
print(f"average fruit {sum(fruit) / len(fruit):.4f} kg")`,
              `girth: average 387.6250, spread 113.6518
water: average 0.6792, spread 0.1724
ratio of spreads 659.21, squared 434,551
girth: recorded 0.0038802, standardized 0.4410, translated back 0.0038802
water: recorded 49.5603594, standardized 8.5446, translated back 49.5603594
recorded intercept 6.8791 kg
standardized intercept 42.0429 kg
average fruit 42.0429 kg`,
              { hints: [
  "Dividing a standardized coefficient by its feature spread converts it back to the raw predictor unit.",
  "Standardizing predictors changes the zero used by the intercept; it does not standardize the target automatically."
], check: numberCheck("What intercept does the line fitted on standard scores report, in kilograms?", 42.0429, 0.0005, "The standardized-predictor intercept is 42.0429 kg. With predictor means moved to zero, it represents the fitted target level at those mean predictor values."), question: "Can the same prediction use very different coefficient magnitudes after rescaling?" },
            ),
            exercise(
              "Hold out the four wettest trees and read them both ways",
              [
  "Use the supplied four-row holdout and remaining twenty training trees. Fit one standardizer on training and a second on held-out rows for comparison.",
  "Fit regression only on standardized training data. Predict the held-out rows under each transform, printing training water mean/spread, both water-score lists and each worst absolute prediction error in kg."
],
              `from oop_ml import Feature, MultipleLinearRegression, Standardizer

girth = [620, 385, 226, 297, 515, 240, 289, 202, 430, 202, 362, 302,
         438, 439, 494, 354, 369, 465, 426, 534, 359, 598, 418, 339]
water = [0.47, 0.55, 0.49, 0.93, 0.58, 0.45, 0.70, 0.79, 0.66, 0.84, 0.59, 0.76,
         0.41, 0.59, 0.51, 0.52, 0.95, 0.88, 0.90, 0.83, 0.48, 0.84, 0.67, 0.91]
fruit = [30.82, 36.40, 30.94, 53.00, 37.46, 30.61, 43.42, 47.20, 41.40, 49.00, 36.57, 46.92,
         27.78, 38.58, 37.01, 32.90, 55.14, 53.50, 52.10, 48.77, 32.04, 51.50, 42.89, 53.08]

held = [3, 16, 18, 23]
kept = [row for row in range(24) if row not in held]
training = [Feature("girth", [girth[row] for row in kept]), Feature("water", [water[row] for row in kept])]
held_out = [Feature("girth", [girth[row] for row in held]), Feature("water", [water[row] for row in held])]
truth = [fruit[row] for row in held]

# Fit one Standardizer on the training columns and another on the held-out
# columns, and fit the line on what the first hands back for the training
# rows. Then for each standardizer, transform the held-out columns, predict
# the four trees, and print the water scores and the worst absolute error.`,
              `from oop_ml import Feature, MultipleLinearRegression, Standardizer

girth = [620, 385, 226, 297, 515, 240, 289, 202, 430, 202, 362, 302,
         438, 439, 494, 354, 369, 465, 426, 534, 359, 598, 418, 339]
water = [0.47, 0.55, 0.49, 0.93, 0.58, 0.45, 0.70, 0.79, 0.66, 0.84, 0.59, 0.76,
         0.41, 0.59, 0.51, 0.52, 0.95, 0.88, 0.90, 0.83, 0.48, 0.84, 0.67, 0.91]
fruit = [30.82, 36.40, 30.94, 53.00, 37.46, 30.61, 43.42, 47.20, 41.40, 49.00, 36.57, 46.92,
         27.78, 38.58, 37.01, 32.90, 55.14, 53.50, 52.10, 48.77, 32.04, 51.50, 42.89, 53.08]

held = [3, 16, 18, 23]
kept = [row for row in range(24) if row not in held]
training = [Feature("girth", [girth[row] for row in kept]), Feature("water", [water[row] for row in kept])]
held_out = [Feature("girth", [girth[row] for row in held]), Feature("water", [water[row] for row in held])]
truth = [fruit[row] for row in held]

by_training = Standardizer().fit(training)
by_their_own = Standardizer().fit(held_out)
line = MultipleLinearRegression().fit(
    by_training.transform(training), Feature("fruit", [fruit[row] for row in kept])
)
print(f"training water: average {by_training.scalings['water'].mean:.4f}, "
      f"spread {by_training.scalings['water'].standard_deviation:.4f}")

for label, scaler in (("training numbers", by_training), ("their own numbers", by_their_own)):
    scored = scaler.transform(held_out)
    predicted = line.predict(scored)
    worst = max(abs(float(guess) - actual) for guess, actual in zip(predicted, truth))
    print(f"{label}: water scores {[round(float(v), 2) for v in scored[1].values]}, worst error {worst:.2f} kg")`,
              `training water: average 0.6305, spread 0.1462
training numbers: water scores [2.05, 2.18, 1.84, 1.91], worst error 1.81 kg
their own numbers: water scores [0.39, 1.43, -1.17, -0.65], worst error 20.47 kg`,
              { hints: [
  "Use the mean and standard deviation fitted on the training trees when transforming a new tree. Those stored values define the coordinates the regression coefficients expect.",
  "The held-out-only standardizer is a deliberate mismatch experiment, not a second valid evaluation pipeline."
], check: numberCheck("What is the worst error, in kilograms, when the four trees are standardized against their own average and spread?", 20.47, 0.01, "The deliberately mismatched held-out-only scaling gives worst error 20.47 kg. Its coordinates no longer have the training transform’s meaning."), question: "Which fitted scale should a held-out orchard measurement use?" },
            ),
            exercise(
              "Ask for a score where there is no spread, and where there is almost none",
              [
  "Try fitting Standardizer to the constant column, then to the nine readings spaced 1e-16 apart in the starter.",
  "For the constant column print the caught library error class/message. For the near-constant column print fitted spread and all nine scores. Do not round inputs before fitting."
],
              `from oop_ml import Feature, MLLibError, Standardizer

constant = Feature("trunk", [300.0] * 9)
almost_constant = Feature("trunk", [index * 1e-16 for index in range(9)])

# Try to fit a Standardizer on the constant column, catching the library's own
# error and printing the name of its class and its message. Then fit one on the
# almost-constant column and print the spread it learned and its nine scores.`,
              `from oop_ml import Feature, MLLibError, Standardizer

constant = Feature("trunk", [300.0] * 9)
almost_constant = Feature("trunk", [index * 1e-16 for index in range(9)])

try:
    Standardizer().fit([constant])
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)

scaler = Standardizer().fit([almost_constant])
print(f"spread {scaler.scalings['trunk'].standard_deviation:.3e}")
print("scores", [round(float(value), 4) for value in scaler.transform([almost_constant])[0].values])`,
              `AllSameValuesError
feature_values must not be constant (zero variance)
spread 2.582e-16
scores [-1.5492, -1.1619, -0.7746, -0.3873, 0.0, 0.3873, 0.7746, 1.1619, 1.5492]`,
              { hints: [
  "Exact zero variance makes the specified division unavailable.",
  "Tiny positive variance permits a numerical score but can greatly amplify small measurement changes."
], question: "How does exact zero spread differ from a tiny positive spread?" },
            ),
          ],
        },
      ]}
    />
  );
}
