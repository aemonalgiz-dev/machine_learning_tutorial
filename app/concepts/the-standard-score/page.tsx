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

export const metadata: Metadata = {
  title: "The Standard Score · oop_ml",
  description:
    "How unusual is a measurement that is ten units above average? That depends on how much the measurements usually vary. A standard score expresses the difference in units of standard deviation.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TheStandardScorePage() {
  return (
    <ConceptPage
      lessonId="the-standard-score"
      intuition={lessonIntuitions["the-standard-score"]}
      technicalStart="Part 2. Subtract the Average, Divide by the Spread"
      openingTitle="How Unusual Is That Number?"
      playgroundIntro="Compare each original value with its standard score. Identify the mean at zero and check what one unit on the new scale represents."
      title="The Standard Score"
      tagline={"How unusual is a measurement that is ten units above average? That depends on how much the measurements usually vary. A standard score expresses the difference in units of standard deviation."}
      prerequisites={
        <>
          The average and the standard deviation come from the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          , and this page uses nothing else from it. The wider family of ways to
          pick a centre and a spread is on the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling
          </Link>{" "}
          page, which is the sibling to this one; the standard score is the
          member of that family that is not merely a rescaling, and this page is
          about why it is the one reached for by default. The fits it is
          measured on are the{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>
            nearest neighbours
          </Link>
          , the{" "}
          <Link href="/concepts/ridge-lasso" className={link}>
            penalised line
          </Link>{" "}
          and the{" "}
          <Link href="/concepts/decision-trees" className={link}>
            decision tree
          </Link>
          , and what each of them does is restated here as far as the argument
          needs it.
        </>
      }

      playground={<StandardScorePlayground />}
      sections={[
        {
          title: "Part 1. When the Unit Decides the Answer",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four trees, two units">
                <p>
                  The orchard this page works through is twenty-four apple
                  trees. Each one was measured twice before the harvest, its
                  trunk girth written down in millimetres and the water it was
                  given over the season written down in metres, and then the
                  fruit it bore was weighed in kilograms. Both units are ones
                  somebody could reasonably have chosen, and neither is wrong;
                  what matters is that they are a thousand apart, so the trunk
                  numbers run in the hundreds while the water numbers run below
                  one.
                </p>
                <NumberTable
                  headings={["column", "smallest", "largest", "average", "spread"]}
                  rows={[
                    ["trunk girth, millimetres", "202", "620", "387.625", "113.652"],
                    ["water, metres", "0.41", "0.95", "0.679", "0.172"],
                  ]}
                  caption="One spread is 659.21 times the other, and nothing about the trees produced that number. Writing the water in millimetres instead would reverse it."
                />
                <p>
                  The two columns are very nearly unrelated to each other, their
                  correlation being &minus;0.083, and they are not at all equally
                  useful. Water very nearly decides the fruit; the trunk barely
                  moves it. That combination is what makes the orchard worth
                  measuring on, since the column recorded in the larger numbers
                  is also the column that carries almost nothing.
                </p>
                <KeepInMind>
                  Nothing so far is a criticism of the data. The trees were
                  measured correctly and both units are honest. The trouble
                  begins only when a fit adds a gap in millimetres to a gap in
                  metres as though the two were the same size.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The nearest trees the recorded columns choose">
                <p>
                  Take one tree and ask which three trees in the orchard are
                  most like it, then predict its fruit as the average of what
                  those three bore. The likeness has to be a number, and the
                  usual one adds up the gap in each column after squaring it, so
                  a difference of seven millimetres of trunk and a difference of
                  a third of a metre of water are added together with nothing
                  standing between them.
                </p>
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
                <p>
                  The reason is arithmetic rather than bad luck, and it can be
                  written in one line. Rewriting a column in a unit a thousand
                  times smaller multiplies every gap in that column by a
                  thousand, and a squared distance sees the square of that, so
                  the column&rsquo;s say in the total is multiplied by a
                  million. What decides the balance between two columns is
                  therefore the ratio of their spreads, squared.
                </p>
                <Equation>{"girth spread / water spread = 113.652 / 0.172 = 659.21\nthe same ratio squared = 434,551"}</Equation>
                <WhyThisWorks>
                  <p>
                    A typical gap in a column is about the size of that
                    column&rsquo;s spread, so a typical squared gap is about the
                    square of the spread. The two columns contribute to a
                    squared distance in roughly the proportion of those two
                    squares, which here is four hundred thousand to one. The
                    whole width of the water column, 0.54 metres from the driest
                    tree to the wettest, counts for exactly what 0.54 of a
                    millimetre of trunk counts for, since the sum is handed two
                    numbers and no units at all.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  This is why the standard score divides by the spread rather
                  than by anything else. Dividing each column by its own spread
                  makes every ratio of spreads exactly one, which is the only
                  setting that no change of unit can disturb.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The wrong answer, measured">
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
                    ["in millimetres and metres, as recorded", "−0.7175"],
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
                  neighbour really was the nearest under the sum it was given.
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
                <p>
                  The repair is one line, applied to each column on its own.
                  Work out the column&rsquo;s average and its spread, take the
                  average away from every value, and divide what is left by the
                  spread. Those two numbers are the whole of what a column
                  teaches, and the value that comes out is called the
                  standard score of the value that went in.
                </p>
                <Equation>{"z = (value − average) / spread"}</Equation>
                <p>
                  The spread here is the standard deviation, which is the square
                  root of the average squared distance from the average. The
                  playground at the top of the page is that line drawn twice.
                  The upper line holds trunk girths in millimetres and the lower
                  line holds the same trunks in standard scores, both on rulers
                  that stay put, so a dot that falls off either end is drawn
                  faint at the end it fell off. Drag a trunk about and watch how
                  differently the two lines answer.
                </p>
                <KeepInMind>
                  Both numbers come from the column and neither is chosen by the
                  person doing the work. That is what separates this from a
                  conversion of units, where somebody decides that a metre is
                  what they want; here the column decides, and it decides
                  differently for every column.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Five saplings by hand">
                <p>
                  Press the nursery row button on the playground. Five saplings
                  were measured at 210, 210, 260, 160 and 310 millimetres, and
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
                  <p>
                    The two saplings of 210 mm come out at the same number,
                    which they must, since the transformation asks nothing about
                    a value except what it is. The 160 mm sapling is the
                    furthest from typical of the five, at 1.37 spreads below the
                    average, and the 310 mm one is 1.57 above.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Nothing in that sum needed to know what a millimetre is. The
                  same five steps run on a column of test marks, of prices or of
                  rainfall, and the answers are five numbers that no longer
                  carry a unit at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What the transformation promises">
                <p>
                  Two things are true of the transformed column whatever went
                  into it. Its average is exactly zero and its spread is exactly
                  one. Both fall out of the definition in a line each, which is
                  worth doing because the second one is where a convention hides.
                </p>
                <Equation>{"zᵢ = (xᵢ − m) / s\naverage(z) = (1/n) Σ (xᵢ − m) / s = (1/s)(m − m) = 0\nvariance(z) = (1/n) Σ (xᵢ − m)² / s² = s² / s² = 1"}</Equation>
                <WhyThisWorks>
                  <p>
                    The first line is the transformation, with m for the average
                    and s for the spread. The second says that the distances
                    from an average always cancel, which is what makes an
                    average an average, so dividing them all by one number
                    leaves them cancelling still. The third is the whole
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
                  The variance lands on exactly one only because the spread was
                  worked out by dividing the sum of squares by the count of
                  values. Divide by one fewer, which is the other common
                  convention, and the transformed variance comes out at n / (n
                  &minus; 1) instead. On the nursery row that is 1.25 rather
                  than 1, which is a large enough difference to notice and a
                  quiet enough one to argue about for an afternoon.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The unit has gone">
                <p>
                  The claim that the standard score removes the unit can be
                  checked rather than believed. Write every trunk in centimetres
                  instead of millimetres, which divides each value by ten, and
                  the average and the spread are divided by ten as well, so the
                  quotient is untouched. Add a thousand millimetres to every
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
                    adding a thousand millimetres to every one of them changes
                    the largest score by exactly zero.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A shift is exact and a stretch is exact in the mathematics and
                  approximate in the arithmetic. Two implementations that
                  disagree in the sixteenth decimal about a standard score are
                  disagreeing about rounding rather than about the column.
                </KeepInMind>
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
              "A squared distance sees the square of the multiplier, so what decides the balance between two columns is the ratio of their spreads, squared. On the orchard that ratio is 659.21 and its square is 434,551, which is why the whole width of the water column counts for what 0.54 of a millimetre of trunk counts for.",
            ),
            choice(
              "Scored over all twenty-four trees, the nearest-neighbour fit on the recorded columns comes to −0.7175. Which other reading does that almost exactly match?",
              [
                "The trunk column alone, unstandardized, at −0.7238",
                "The water column alone, unstandardized, at 0.9544",
                "Both columns in standard scores, at 0.9126",
                "None of the others, since a negative score cannot be compared",
              ],
              0,
              "That agreement is what it means to say the unit chose the column. A negative score means the fit did worse than answering the orchard’s average weight to every tree, and it did so quietly, since every distance was computed correctly and every neighbour really was the nearest under the sum it was given.",
            ),
            trueFalse(
              "Adding a thousand millimetres to every trunk in the orchard changes the largest standard score by exactly zero.",
              true,
              "The average moves by exactly a thousand and the spread does not move at all, so the quotient is untouched, and a shift is exact in the arithmetic as well as in the mathematics. A stretch is exact only in the mathematics. The nursery row and the whole-number column it was built from disagree by 2.2 × 10⁻¹⁶, the last bit of a number near one, so two implementations that disagree in the sixteenth decimal are disagreeing about rounding and not about the column.",
            ),
            several(
              "Which of these hold for a standardized column, whatever went into it?",
              [
                "Its average is exactly zero",
                "Its spread is exactly one, where the spread was worked out by dividing the sum of squares by the count of values",
                "Two values that were equal before come out equal",
                "Its values all lie between minus one and one",
              ],
              [0, 1, 2],
              "The distances from an average always cancel, which is what makes an average an average, and dividing them all by one number leaves them cancelling still. The two saplings of 210 mm come out at the same score because the transformation asks nothing about a value except what it is. The nursery row’s widest sapling comes out at 1.57, which settles the claim that every score lies between minus one and one, and the lopsided column of Part 5 reaches 3.34.",
            ),
            trueFalse(
              "With the spread worked out by dividing the sum of squares by the count of values, reading the variance of the scores back by dividing by one fewer still reports exactly one.",
              false,
              "The spread was built by dividing the nursery row’s 13,000 by five, so its five squared scores add to exactly five, and dividing that by four reports 1.25 rather than 1. The promise of exactly one holds when the count that built the spread is the count that reads the variance back, which is why the convention has to be stated rather than assumed.",
            ),
        ],
        },
        {
          title: "Part 3. A Value Measured in Its Own Deviations",
          content: (
            <>
              <SubSection title="9. What a standard score says">
                <p>
                  A standard score of 2 says that the value is two spreads above
                  what is typical for its column. That is a sentence about the
                  column as much as about the value, and it is the reason the
                  number is worth having. A trunk of 620 millimetres tells you
                  nothing on its own unless you keep orchards; a trunk 2.04
                  spreads above the average trunk in this orchard tells you at
                  once that it is among the widest here and not absurdly so.
                </p>
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
                <p>
                  Millimetres of trunk and metres of water cannot be compared.
                  There is no question that 620 and 0.95 both answer, so asking
                  which of the two readings is the more unusual has no meaning
                  at all while they are in their own units. In standard scores
                  the same question has an answer, because both numbers are now
                  counts of the same kind of thing, namely how far a value is
                  from typical measured in that column&rsquo;s own spreads.
                </p>
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
<p>
                    The widest trunk in the orchard is 620 mm, which is 2.04 spreads above the average trunk. The most water any tree was given is 0.95 m, which is 1.57 spreads above the average drink. So the widest trunk is the more unusual of the two readings, by about half a spread, and no arrangement of the raw numbers could have told you that.
                  </p>
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
                <p>
                  The same comparability reaches the fitted weights of a line.
                  A line fitted on the recorded columns puts a weight on trunk
                  girth measured in kilograms per millimetre and a weight on
                  water measured in kilograms per metre, and those two weights
                  cannot be ranked against each other any more than the raw
                  readings could. Fitted on standard scores, both weights are in
                  kilograms per spread of their own column, and the ranking is
                  then a real one.
                </p>
                <WhoNoticed panel="coefficients" />
                <InAModel title="The orchard’s line in two coordinate systems">
                  <p>
                    On the recorded columns the weights are 0.0038802 on the
                    trunk and 49.560 on the water, a ratio of nearly thirteen
                    thousand, which describes the units and not the trees. On
                    standard scores they are 0.4410 and 8.5446, a ratio of
                    19.375, which says that moving a tree one spread along the
                    water column is worth about nineteen times as much fruit as
                    moving it one spread along the trunk column. Dividing each
                    standardized weight by its column&rsquo;s spread returns
                    0.0038802 and 49.560, so the two fits are one line described
                    twice.
                  </p>
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
                <p>
                  There is one statement about standard scores that holds for
                  every column whatever its shape. At most one part in k squared
                  of a column can lie further than k spreads from the average,
                  so at least three quarters of any column at all is within two
                  spreads and at least eight ninths is within three. Both
                  columns clear that comfortably, which they must.
                </p>
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
              <SubSection title="13. Anything that adds columns together">
                <p>
                  The split runs along one line, and the line is whether the fit
                  ever adds a quantity from one column to a quantity from
                  another. A squared distance does exactly that, so every fit
                  built on distances is at the mercy of the units, and Part 1
                  measured how badly. The same sum is inside{" "}
                  <Link href="/concepts/k-means" className={link}>
                    k-means
                  </Link>
                  , whose centres are chosen to minimise it, and inside{" "}
                  <Link href="/concepts/pca" className={link}>
                    principal component analysis
                  </Link>
                  , whose first direction follows whichever column happens to
                  have the largest variance in whatever unit it was recorded in.
                </p>
                <WhoNoticed panel="scores" />
                <KeepInMind>
                  For a fit that adds columns together, the decision about
                  scaling is made whether or not anybody makes it. Leaving the
                  orchard as recorded is the decision that one millimetre of
                  trunk matters as much as one metre of water.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Anything that penalises a weight">
                <p>
                  A{" "}
                  <Link href="/concepts/ridge-lasso" className={link}>
                    penalised line
                  </Link>{" "}
                  adds the squared size of every weight to what it is trying to
                  make small, so the weights compete against one number. A
                  column recorded in a large unit needs a small weight to do its
                  work, and a small weight is cheap under the penalty, so the
                  penalty falls unevenly for a reason that has nothing to do
                  with the trees.
                </p>
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
                  Standardizing did not make the penalty gentle, and at a
                  penalty of ten it is not gentle at all, taking the standardized
                  fit down to 0.8712. What it did is make one penalty mean the
                  same thing for every column, which is what lets a single
                  number be tuned for all of them.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A tree never notices">
                <p>
                  A{" "}
                  <Link href="/concepts/decision-trees" className={link}>
                    decision tree
                  </Link>{" "}
                  compares values only within a column. Every question it asks
                  is whether a value falls below a threshold, and the apple
                  trees that go left when asked about 0.665 metres go left when
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
                  Any rescaling that keeps the order of a column leaves a tree
                  unchanged, so this holds for every member of the scaling
                  family and not only for the standard score. Trees, forests and
                  boosted trees are all of that kind, and standardizing their
                  inputs changes the printed thresholds and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Least squares never notices either">
                <p>
                  The more surprising member of the untouched group is the plain
                  least-squares line, which does add the columns together and
                  still does not care. The reason is that it has a free weight
                  per column and nothing stopping it from choosing whatever
                  weight the unit calls for. Multiply a column by a hundred and
                  the fitted weight is divided by a hundred, the fitted values
                  are identical, and the score does not move.
                </p>
                <InAModel title="The orchard’s line, recorded and standardized">
                  <p>
                    Both fits score 0.98445555, and the gap between the two
                    scores is exactly zero rather than merely small. Held out
                    tree by tree, both score 0.97911. That is the same objective
                    the penalised fit above was minimising, with one term added,
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

              <SubSection title="17. Where standardizing is the wrong move">
                <p>
                  Standardizing gives every column an equal say, and an equal
                  say is not always the say a column deserves. The orchard makes
                  that concrete, since its trunk column carries almost nothing
                  about the fruit and standardizing hands it half of every
                  distance.
                </p>
                <NumberTable
                  headings={["three nearest trees, chosen", "score over all twenty-four"]}
                  rows={[
                    ["by both columns, as recorded", "−0.7175"],
                    ["by both columns, in standard scores", "0.9126"],
                    ["by the water column alone", "0.9544"],
                  ]}
                  caption="Dropping the useless column beats standardizing both of them by 0.042, and it takes no fitting at all."
                />
                <p>
                  So the honest ordering on this orchard puts the standard score
                  second. It repaired a fit that was worse than a constant and
                  it did not reach what simply knowing which column mattered
                  would have reached. What it bought is that it needed no such
                  knowledge, which is the trade being made whenever a column
                  whose worth is unknown is standardized rather than dropped.
                </p>
                <KeepInMind>
                  The other case where an equal say is wrong is a column that is
                  mostly zeros, where subtracting an average fills every zero
                  with a small number and destroys whatever made the column
                  cheap to store and meaningful to read. That is the worry the
                  scalers that do not subtract a centre exist for, and it is on
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
              "The widest trunk is 2.04 spreads above the average trunk, and the wettest tree was given water 1.57 spreads above the average drink. Which reading is the more unusual?",
              [
                "The trunk, by about half a spread",
                "The water, by about half a spread",
                "Neither, since millimetres and metres answer no common question",
                "The water, since water very nearly decides the fruit",
              ],
              0,
              "In standard scores both numbers are counts of the same kind of thing, namely how far a value is from typical measured in that column’s own spreads, so the question has an answer that no arrangement of the raw numbers could have given. Comparable does not mean equally important, which is what crediting the water because it decides the fruit confuses; the ranking says where each reading sits in its own column and nothing about which column matters.",
            ),
            choice(
              "On the recorded columns the fitted weights are 0.0038802 on trunk and 49.560 on water. On standard scores they are 0.4410 and 8.5446. What does the second pair say?",
              [
                "Moving a tree one spread along the water column is worth about nineteen times as much fruit as moving it one spread along the trunk column",
                "Water matters nearly thirteen thousand times as much as trunk girth",
                "The two fits are different lines, and the standardized one is the better of them",
                "Trunk girth is worth 0.4410 kilograms per millimetre",
              ],
              0,
              "Both standardized weights are in kilograms per spread of their own column, so the ranking is a real one, where the recorded pair are in kilograms per millimetre and kilograms per metre and cannot be ranked at all. Dividing each standardized weight by its column’s spread returns the recorded pair, so the two fits are one line described twice. The ratio is a statement about this orchard’s spreads rather than a law about trunks and water.",
            ),
            several(
              "Which of these fits are left unchanged by standardizing their inputs?",
              [
                "A decision tree, which compares values only within a column",
                "A plain least-squares line, which has a free weight per column",
                "A penalised line, which adds the squared size of every weight to what it makes small",
                "k-means, whose centres are chosen to minimise a squared distance",
              ],
              [0, 1],
              "A fit is untouched when a change of unit can be absorbed entirely into what the fit is free to choose. A tree absorbs it into its thresholds and a least-squares line into its weights. A penalty takes that freedom away by charging for the weights, and a distance never had it, since its weights are all fixed at one.",
            ),
            trueFalse(
              "The tree grown on standard scores roots on water below −0.08217, and its twenty-four predictions are identical to those of the tree grown on the recorded columns.",
              true,
              "That threshold multiplied by the water spread and put back about the average water is 0.665, which is the recorded tree’s own threshold, because the threshold was chosen from the same column that was rescaled and moves along with it. The largest gap between the two sets of twenty-four predictions is exactly zero, both trees have eight leaves, and both score 0.8940 held out tree by tree. Any rescaling that keeps a column’s order leaves a tree unchanged, so this holds for the whole scaling family and not only for the standard score.",
            ),
            trueFalse(
              "On this orchard the standard score was the best of the readings measured.",
              false,
              "The water column alone, unstandardized, scores 0.9544 held out tree by tree where both columns in standard scores score 0.9126, so dropping the useless column beats standardizing both of them by 0.042 and takes no fitting at all. The honest ordering puts the standard score second. It repaired a fit worse than a constant and did not reach what simply knowing which column mattered would have reached, and what it bought is that it needed no such knowledge, which is the trade made whenever a column of unknown worth is standardized rather than dropped.",
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
                  Held-out rows standardized this way need not average zero and
                  need not have a spread of one, and usually will not. The two
                  promises of step 7 were about the rows the two numbers came
                  from; the held-out rows are being measured against those rows,
                  which is the whole point of holding them out.
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
                  The damage is largest exactly when the held-out rows are
                  unlike the training rows, which is the case a held-out test is
                  most often set up to catch. A held-out set drawn at random from
                  the same orchard has nearly the same average and spread, so the
                  two readings nearly agree and the mistake hides.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Learning the numbers over everything, measured">
                <p>
                  There is a milder version of the same mistake, and it is the
                  common one. Standardize the whole orchard first, then split it
                  into folds and cross-validate. Nothing is refitted on the
                  held-out rows, so the disaster of the last step does not
                  happen, and yet the two numbers were computed with the
                  held-out rows in the sum, so each fold&rsquo;s columns carry a
                  trace of the tree that fold was about to be tested on.
                </p>
                <WhoNoticed panel="leak" />
                <InAModel title="What the trace was worth here">
                  <p>
                    Held out tree by tree, the largest difference any of the six
                    fits showed was 0.0037, on the heavily penalised line, and
                    it went the wrong way, the leaked version scoring slightly
                    worse rather than better. The nearest-neighbour fits and the
                    tree and the least-squares line all showed a difference of
                    exactly zero. So on this orchard the leak flattered nothing
                    at all, and saying otherwise would be dramatising a number I
                    measured and found to be nothing.
                  </p>
                </InAModel>
                <p>
                  Two of those zeros are exact for a reason worth keeping. A
                  tree and a least-squares line are untouched by any affine
                  rescaling of a column, as Part 4 measured, so which rows the
                  average and the spread were read from cannot possibly reach
                  them. The zeros for the nearest-neighbour fits are not
                  guaranteed by anything; they say that dropping one tree of
                  twenty-four did not move the two numbers enough to change any
                  ranking of distances.
                </p>
                <KeepInMind>
                  The rule is still worth keeping, for a reason the measurement
                  supports rather than contradicts. A transformer that consults
                  the target, or one whose two numbers a single row can move a
                  long way, leaks a great deal more than this one does, and a{" "}
                  <Link href="/concepts/pipelines" className={link}>
                    pipeline
                  </Link>{" "}
                  keeps the discipline for every transformer at once rather than
                  asking anyone to judge which ones are safe.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What the transformation does not fix">
                <p>
                  Subtracting an average and dividing by a spread moves a column
                  and rescales it and does nothing else whatever. Every value
                  keeps its place in the order, every gap keeps its size
                  relative to every other gap, and the picture of the column is
                  the same picture with different numbers written under it.
                </p>
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
                  So a fit that was going to be hurt by a lopsided column is
                  still going to be hurt by it. If a column needs a logarithm or
                  a rank or a cap, standardizing it is not that repair and does
                  not stand in for it, and the two are often wanted one after
                  the other.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Standard Score Stops Being Defined",
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
                        "defined, and the boundary is that sharp. The spread is 5.7 × 10⁻¹⁴, which is positive, so the two values come out at exactly −1 and 1, as any two distinct values must.",
                    },
                  ]}
                />
                <>
<p>
                  Because the quotient does not exist, an implementation has a genuine choice to make rather than a bug to avoid, and the three answers in use cost different things. Refusing tells the caller at once that a column they thought was informative is not, and stops a fit that was about to be built on nothing.
                </p>
                <p>
                  Substituting a spread of one and passing the column through turns it into a constant column of zeros, which most fits ignore and a penalised fit charges nothing for, so the run completes and nobody learns anything about the data. Dropping the column silently changes how many columns come out of the transformation, which breaks anything downstream that matched columns by position.
                </p>
</>
                <KeepInMind>
                  The case is not rare in practice, since a column that was
                  constant in the whole dataset can also become constant inside
                  one fold of a cross-validation, and the two want different
                  answers. A column constant everywhere carries nothing; a
                  column constant in one fold carries something the fold could
                  not see.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A spread of almost nothing is still a spread">
                <p>
                  The boundary between defined and undefined is a single point
                  and the arithmetic sits right up against it. Nine readings each
                  one machine epsilon further along than the last have a spread
                  of about 2.6 × 10⁻¹⁶, which is positive, so every one of the
                  nine has a standard score and they run evenly from &minus;1.55
                  to 1.55.
                </p>
                <ShapeSurvives panel="tiny" />
                <p>
                  There is nothing in the numbers that says whether those nine
                  readings differ because the quantity really varies at that
                  scale or because a sum somewhere lost its last bits. Answering
                  the first way spreads nine indistinguishable values across the
                  full width of the ruler and hands a fit nine confident
                  positions built out of rounding. Answering the second way,
                  which some implementations do by treating any spread below a
                  few machine epsilons as zero, leaves a column whose values
                  genuinely differ at that scale looking constant.
                </p>
                <KeepInMind>
                  Either answer is defensible and neither can be right in
                  general, since the two cases are identical in the data and
                  differ only in where the data came from. What is not
                  defensible is doing one of them without saying so, because the
                  two produce different columns and both produce a fit.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The values most in need of taming set the scale">
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
                <p>
                  Notice what did and did not happen. The transformation is
                  still exactly correct, the scores still average zero and still
                  have a spread of one, and the mistyped value is still marked as
                  the odd one, which is genuinely useful. What is lost is every
                  distinction among the twenty-three real trees, which a fit
                  reading these scores can no longer see.
                </p>
                <KeepInMind>
                  A centre and a spread read from positions in the sorted column
                  rather than from sums, the median and the quartiles, cannot be
                  moved by how far out one value goes, and they are the
                  alternative when the extreme values are suspected rather than
                  believed. The cost of that choice, and where it fails in its
                  turn, is on the{" "}
                  <Link href="/concepts/feature-scaling" className={link}>
                    feature scaling
                  </Link>{" "}
                  page.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Standard does not mean normal">
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
                <p>
                  Two habits follow from the confusion and both are worth
                  breaking. Reading a score of 3 as one in a thousand assumes a
                  bell; on the fifteen readings above, a score of 3 is exceeded
                  by one value in fifteen. And treating a fit as ready for a
                  method that assumes normality because its columns have been
                  standardized skips the step that method actually needed, which
                  is a transformation of the shape rather than of the location
                  and the scale.
                </p>
                <KeepInMind>
                  The name is historical and describes the units of the answer,
                  a value measured in standard deviations, rather than the shape
                  of the column it came from. What the transformation guarantees
                  is exactly two numbers, and everything else the column brought
                  with it comes out the other side unchanged.
                </KeepInMind>
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
              "Neither fit is touched by any affine rescaling of a column, as Part 4 measured, so which rows the average and the spread were read from cannot reach them. The largest difference any of the six fits showed was 0.0037, on the heavily penalised line, and it went the wrong way, with the leaked version scoring slightly worse, so the leak flattered nothing on this orchard. The rule is still worth keeping, because a transformer that consults the target leaks a great deal more than this one does.",
            ),
            trueFalse(
              "Standardizing a strongly lopsided column reduces its lopsidedness.",
              false,
              "Subtracting an average and dividing by a spread moves a column and rescales it and does nothing else whatever. On the fifteen lopsided readings the usual measure of lopsidedness is 2.4896725430 before and 2.4896725430 after, agreeing to the last bit the arithmetic keeps. If a column needs a logarithm or a rank or a cap, standardizing is not that repair and does not stand in for it.",
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
              "The average trunk moves from 387.6 to 551.9 and the spread from 113.7 to 806.2, so the widest real trunk falls from 2.04 spreads above average to 0.08 while the mistyped one sits alone at 4.75. The transformation is still exactly correct, the scores still average zero and still have a spread of one, and what is lost is every distinction among the real trees.",
            ),
            several(
              "The standard score is defined for any column whose spread is positive, and the definition promises exactly two numbers. Which of these follow?",
              [
                "A column in which every value is 300 has no standard scores, since every distance from its average is zero and so is its spread",
                "Nine readings each one machine epsilon apart do have standard scores, running evenly from −1.55 to 1.55",
                "Substituting a spread of one for a constant column lets the fit learn what that column carried",
                "A standardized column is ready for a method that assumes normality",
              ],
              [0, 1],
              "The quotient does not exist when the spread is zero, and it does exist at a spread of 2.6 × 10⁻¹⁶, however suspicious that spread is, since nothing in the numbers says whether the nine readings really vary at that scale or a sum lost its last bits. Substituting a spread of one passes through a constant column of zeros, which most fits ignore and a penalised fit charges nothing for, so the run completes and nobody learns anything about the data. And standardizing a column that is nothing like a bell gives a column that is nothing like a bell; on the fifteen lopsided readings a score of 3 is exceeded by one value in fifteen, so a method that assumes normality still needs a transformation of the shape.",
            ),
        ],
        },
        {
          title: "Practice. Standardizing the Orchard With the Library",
          practice: [
            exercise(
              "Take the nursery row through the standardizer",
              ["Part 2 works the five saplings through by hand, 210, 210, 260, 160 and 310 millimetres, and arrives at an average of 230, a spread of 50.990195 and five standard scores. Fit a Standardizer on that one column and read the same numbers off it.", "Then check the two promises on the scores it hands back, that they average zero and that their variance is one, and read the variance a second time dividing by four rather than five, which is where Part 2 says a convention hides."],
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
              { hints: ["fit takes a list of Features, even when there is only one, and transform answers a list of the same length, so the scored column is the first item of what comes back.", "The learned numbers live on scalings, addressed by the feature's name, as properties called mean and standard_deviation.", "The scores come back as a Feature whose values are an array. Converting each to a float keeps the rest plain Python."], check: numberCheck("What standard score does the 310 mm sapling get?", 1.568929, 1e-06, "The 310 mm sapling is 80 mm above the average of 230, and 80 divided by the spread of 50.990195 is 1.568929, the same number Part 2 reaches by hand. The variance comes out at exactly one when the sum of squared scores is divided by five, the count that built the spread, and at 1.25 when it is divided by four.") },
            ),
            exercise(
              "Read the orchard's two numbers and fit the line twice",
              ["Part 1 says the trunk spread is 659.21 times the water spread. Fit a Standardizer on both orchard columns, print the average and the spread of each, and confirm the ratio and its square.", "Part 3 then fits the least-squares line on the recorded columns and on the standard scores and says the two are one line described twice. Fit both, print the two weights for each column, divide each standardized weight by its column's spread to get the recorded weight back, and print the two intercepts beside the orchard's average fruit weight, which the lesson does not quote."],
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
              { hints: ["A fitted Standardizer's scalings can be iterated, and each item carries name, mean and standard_deviation, so one loop prints both columns.", "transform answers a new list of Features in the same order, which is exactly what the second fit takes in place of columns.", "coefficients is addressed by the column's name and answers the weight as a plain number, and intercept is a property beside it."], check: numberCheck("What intercept does the line fitted on standard scores report, in kilograms?", 42.0429, 0.0005, "An intercept is the line's answer at a tree whose every column reads zero. On standard scores that is the tree sitting at the average of both columns, and the line's answer there is the orchard's average fruit weight, 42.0429 kg, which the two last lines of the output agree on. On the recorded columns the same intercept is 6.8791 kg, the line's answer at a tree with no trunk and no water, which no tree in the orchard resembles. The weights translate back exactly, which is what Part 3 means by one line described twice.") },
            ),
            exercise(
              "Hold out the four wettest trees and read them both ways",
              ["Part 5 holds out the four wettest trees, rows 3, 16, 18 and 23 of the orchard, fits on the twenty that remain, and reads the four two ways, once against the twenty trees' own average and spread and once against the four's own. Build one Standardizer on the twenty and another on the four.", "Fit the least-squares line on the standardized training rows, predict the four held-out trees under each reading, and print each reading's water scores and worst error. Part 5 arrives at 1.81 kg and 20.47 kg."],
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
              { hints: ["The line is fitted once, on the training rows as the training standardizer scored them. Only the held-out trees are read twice, and only the standardizer changes between the two readings.", "predict takes the list of Features that transform hands back, and answers one prediction per row that can be iterated beside the true weights.", "transform answers the columns in the order they were fitted, so the water scores are the values of the second Feature in the list."], check: numberCheck("What is the worst error, in kilograms, when the four trees are standardized against their own average and spread?", 20.47, 0.01, "Against their own average the four wettest trees in the orchard come out at 0.39, 1.43, −1.17 and −0.65, two of them apparently drier than average, because the only trees they were compared with were each other. The line was fitted on scores measured against the twenty training trees, so it reads those four numbers as four ordinary trees and misses by up to 20.47 kg. Read against the training numbers the same four trees sit between 1.84 and 2.18 spreads above average and the worst miss is 1.81 kg.") },
            ),
            exercise(
              "Ask for a score where there is no spread, and where there is almost none",
              ["Part 6 says a column in which every value is 300 has no standard score, since its spread is exactly zero, and that nine readings each one machine epsilon apart do have one, since their spread is positive. Hand both columns to a Standardizer.", "Catch what the library raises for the constant column and print the name of its class and its message. For the second column print the spread it learned and the nine scores, which Part 6 gives as about 2.6 × 10⁻¹⁶ and a run from −1.55 to 1.55."],
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
              { hints: ["Every refusal the library makes derives from MLLibError, so catching that one catches whichever specific refusal a constant column turns out to be.", "The refusal happens inside fit, not transform, because the spread is learned there and it is the spread that is zero.", "The second fit goes through without complaint. Nothing in the library judges whether a spread of 2.6 × 10⁻¹⁶ is real variation or lost bits, which is the choice Part 6 says an implementation has to make and state."] },
            ),
          ],
        },
      ]}
    />
  );
}
