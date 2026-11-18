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
import { ColumnGrowthGrid } from "@/components/widgets/ColumnGrowthGrid";
import { CurveThroughACrowd } from "@/components/widgets/CurveThroughACrowd";
import { DegreeGapCurves } from "@/components/widgets/DegreeGapCurves";
import { MissesInAPattern } from "@/components/widgets/MissesInAPattern";
import { PowersAndUnits } from "@/components/widgets/PowersAndUnits";
import { ProductGap } from "@/components/widgets/ProductGap";
import { StepsAgainstACurve } from "@/components/widgets/StepsAgainstACurve";
import { TermAssembler } from "@/components/widgets/TermAssembler";

export const metadata: Metadata = pageMetadata("/concepts/polynomial-features", {
  title: "Polynomial Features · Perceptron Lab",
  description:
    "Powers and products of existing measurements can describe relationships a straight line in the original inputs cannot. They add flexibility while keeping the fitted prediction linear in its coefficients.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PolynomialFeaturesPage() {
  return (
    <ConceptPage
      lessonId="polynomial-features"
      intuition={lessonIntuitions["polynomial-features"]}
      technicalStart="Part 3. Powers and Products"
      openingTitle="Give a Straight-Line Model Something Curved to Read"
      playgroundTitle="Give a straight model powers and products to combine"
      playgroundIntro="Compare the generated columns at different degrees. Relate each new power or product to the extra flexibility in the fitted curve."
      title="Polynomial Features"
      tagline={"Powers and products of existing measurements can describe relationships a straight line in the original inputs cannot. They add flexibility while keeping the fitted prediction linear in its coefficients."}
      prerequisites={
        <>
          The fit this page hands its new columns to is the one from{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={link}>
            multiple regression
          </Link>
          , which weights several columns and adds them up, and the second score
          every measurement here quotes comes from{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            holding people back
          </Link>{" "}
          from the fit. The repair in Part 5 is the shrinkage of{" "}
          <Link href="/concepts/ridge-lasso" className={link}>
            ridge and lasso
          </Link>
          , and the trouble in Part 6 is the one the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling
          </Link>{" "}
          page measures on plain columns, arriving here several times larger.
        </>
      }

      playground={<CurveThroughACrowd />}
      sections={[
        {
          title: "Part 1. A Straight Line Through a Curved Relationship",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-two people, and the shape weight really follows">
                <p>

                  We have measured twenty-two people: height and waist girth in centimeters, and weight in kilograms. They range from a child who is 104 centimeters tall and weighs 16.1 kilograms to an adult who is 191 centimeters tall and weighs 81.3 kilograms. Suppose we want to predict weight from height. We know how to fit a straight line, so let&apos;s start there and inspect where it misses.
                </p>
                <p>A straight line may struggle across this wide range of body sizes. As a rough geometric motivation, the volume of a similarly shaped object grows with several length dimensions, rather than just one. Human proportions and density vary, so that is a reason to inspect the relationship, not a physical law saying weight must be a cubic function of height.</p>
              <p>The interactive example holds seven people aside and fits on the remaining fifteen. Degree 1 gives training R² of 0.9620. Before trusting that summary, inspect its predictions across all twenty-two people and look for patterns in the residuals.</p>
                <InAModel title="The line, on these twenty-two people">
                  <p>The training R² is 0.9620, while the sum of squared residuals across all twenty-two people is 548.33. The prediction for the 104-centimeter child is 7.80 kilograms, compared with a measured 16.1. For the 191-centimeter adult it predicts 85.43, compared with 81.3.</p>
                </InAModel>
                <KeepInMind>
                  A score in the high nineties is not evidence that the shape is
                  right. It says that most of the variation in weight is
                  accounted for, and over a range where taller mostly means
                  heavier a straight line accounts for most of it whether or not
                  the relationship is straight.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The misses are not scattered, they have a shape">
                <p>A residual records an observation&apos;s difference from its prediction. Plotting residuals against height lets us inspect whether the misses follow a systematic pattern. A curve in those residuals can suggest that a straight-line rule is missing structure, though random variation still needs to be considered.</p>
                <MissesInAPattern />
                <>
<p>The residuals show a pattern. The two youngest people are above the line by 8.30 and 4.05 kilograms, while the six people from 118 to 149 centimeters are all below it. Several taller people lie above it again. This curved pattern suggests that a straight line is missing part of the relationship. It does not establish that random variation is absent.</p>
                <p>
                  Add the squared column and the longest stretch on one side falls from six people to five, and the child the line put at 7.80 lands at 14.02. Add the cube as well and the longest stretch is three and the child lands at 16.67 against a measured 16.1.
                </p>
</>
                <KeepInMind>
                  Read the misses as well as the score. Six people in a row all
                  below the line, at heights 118 through 149, is the fit telling
                  us about its own shape, and it says so while the score reads
                  0.9620.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Linear in the Coefficients, Not in the Columns",
          content: (
            <>
              <SubSection title="3. What the word linear was ever about">
                <p>A linear regression prediction is a weighted sum of its supplied columns, plus an intercept. Those columns can contain derived quantities as well as direct measurements. The coefficients still enter the prediction linearly when one column contains height squared.</p>
                <Equation>{"prediction = b₀ + b₁ c₁ + b₂ c₂ + … + b_k c_k"}</Equation>
                <p>Let c₁ contain height and c₂ contain height multiplied by itself. The prediction is then a quadratic function of height. We can compute that squared column before fitting and use the same regression procedure to estimate its coefficient.</p>
                <Equation>{"weight = b₀ + b₁ × height + b₂ × height²"}</Equation>
                <KeepInMind>
                  A linear model is linear in what it learns rather than in
                  what it reads, so squaring a column and handing it over stays
                  inside what the method always allowed.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. One extra column, and the same fit">
                <p>
                  So we compute one column, height times itself, put it beside
                  height, and fit exactly as before. Nothing in the fitting
                  changes. The same weighted sum is formed, the same squared
                  misses are added up, the same system of equations is solved for
                  the weights, and the only difference is that there are now
                  three numbers to find rather than two.
                </p>
                <InAModel title="What the extra column bought">
                  <p>Across all twenty-two people, the squared residual total falls from 548.33 to 307.18 with the squared column, a reduction of 44 percent. Including the cube reduces it to 225.56. The corresponding training R² values are 0.9620, 0.9834 and 0.9864; these scores are computed on the fifteen training people rather than the complete group.</p>
                </InAModel>
                <p>

                  Compare degree one with degree three in the playground. The cubic follows the broad curve of the observations more closely, but still misses the 191-centimeter adult&apos;s weight by 8.44 kilograms. Height alone cannot describe every difference between people. A remaining residual can reflect information absent from the input as well as a limitation of the chosen curve.
                </p>
                <KeepInMind>
                  Expanding the columns changes the design of the fit and not
                  the fitting. That is why this belongs with the preparation of
                  the data rather than with the models.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Where the new columns are fixed">
                <p>The selected feature columns and their order form an agreement with the fitted coefficients. A later input must use that same arrangement. Changing the columns at prediction time would make the saved weights refer to different quantities.</p>
                <DerivationTable
                  expressionHeading="the step"
                  reasonHeading="what it settles"
                  rows={[
                    {
                      expression: "look at the columns supplied",
                      reason:
                        "their names and their order, which is the order the terms will be written in.",
                    },
                    {
                      expression: "choose the highest total degree",
                      reason:
                        "a setting chosen by the modeler, often by comparing validation results as Part 6 explains.",
                    },
                    {
                      expression: "list every term up to that degree",
                      reason:
                        "one per column to be built, named for the product that produced it, in ascending degree.",
                    },
                    {
                      expression: "compute those terms for any later people",
                      reason:
                        "the same names in the same order, so a weight learned earlier keeps multiplying the same thing.",
                    },
                  ]}
                />
                <p>
                  Nothing is learned from the values here, only from the names,
                  which makes this the lightest of the preparation steps here. Even so it is a step that has to be carried with the
                  model, and the{" "}
                  <Link href="/concepts/pipelines" className={link}>
                    pipelines
                  </Link>{" "}
                  page is where the consequences of forgetting to carry it are
                  measured.
                </p>
                <KeepInMind>
                  The expansion is a fixed list of columns rather than a rule
                  reapplied from scratch, and the list belongs to the fit that
                  used it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Powers and Products",
          content: (
            <>
              <SubSection title="6. Every power and every product up to a chosen degree">
                <p>
                  With one measurement the expansion is just its powers. With two
                  it is more than that, because two columns can be multiplied by
                  each other as well as by themselves, and a term is any product
                  of the two whose exponents add up to no more than the degree.
                  At degree two over height and girth there are five such
                  products.
                </p>
                <Equation>{"height,  girth,  height²,  height × girth,  girth²"}</Equation>
                <p>
                  The table below is exactly what the fit is handed, four people
                  and every column built from them, so each entry can be checked
                  against the two numbers that produced it.
                </p>
                <TermAssembler />
                <WorkedExample title="One person, all five columns">
                  <p>For the person with height 150 centimeters and girth 66, the five entries are 150, 66, 22,500, 9,900 and 4,356. For height 180 with the same girth, they are 180, 66, 32,400, 11,880 and 4,356. The girth and squared-girth entries agree; the height-dependent entries change.</p>
                </WorkedExample>
                <KeepInMind>
                  A term is a product of the original columns, each raised to
                  some power, with the powers adding up to no more than the
                  degree. The column it produces is one number per person, and
                  the fit treats it exactly like any measurement.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What a product says that no power can">
                <p>A power such as height squared lets the prediction change nonlinearly with height. A product such as height multiplied by girth lets the predicted change associated with girth depend on height as well. Separate powers of height and girth give an additive relationship; they cannot by themselves represent that interaction.</p>
                <p>
                  To see it we need people whose two measurements do not move
                  together, so here are twelve arranged deliberately, four girths
                  at each of three heights. Since every girth appears at every
                  height, knowing one measurement tells us nothing at all about
                  the other.
                </p>
                <ProductGap />
                <InAModel title="What thirty centimeters of girth is worth">
                  <p>In this constructed group, increasing girth from 66 to 96 corresponds to 44.50 more kilograms at height 150, 49.30 at height 165 and 54.80 at height 180. A model with only a linear girth term must predict the same change at every height; here it gives 49.45 kilograms. Adding the height-girth product changes those predictions to 44.59, 49.45 and 54.31.</p>
                </InAModel>
                <p>
                  The totals say the same thing more bluntly. On those twelve
                  people the pure powers leave 28.07 as the total of the squared
                  misses and the powers with the products leave 1.83, so one
                  extra column removes 93 percent of what was left, which is the
                  largest reduction in the misses anywhere on this page. The
                  column responsible holds nothing but each person&rsquo;s height
                  multiplied by their girth.
                </p>
                <WhyThisWorks title="Why one coefficient cannot vary">
                  <p>
                    Write out what the fit says about girth in the two cases. In
                    the first, the amount of weight attributed to a unit of girth
                    is b₂, a single number decided once for everybody.
                  </p>
                  <Equation>{"weight = b₀ + b₁ height + b₂ girth"}</Equation>
                  <p>
                    In the second, collect the terms that carry girth and the
                    coefficient of girth turns out to have height inside it.
                  </p>
                  <Equation>{"weight = b₀ + b₁ height + (b₂ + b₃ height) girth"}</Equation>
                  <p>The bracket contains height, so the prediction change associated with girth can now depend on height. The coefficients still enter linearly. The constructed example lets us compare this interaction with the additive model directly.</p>
                </WhyThisWorks>
                <KeepInMind>
                  An interaction term allows the prediction change associated with one input to depend on another input. Without interactions, an additive model can still have a nonlinear response to each input, but that response cannot change with the other inputs.</KeepInMind>
              </SubSection>

              <SubSection title="8. And what it says on people whose columns move together">
                <p>
                  That was a group built so the product would have something to
                  say. Press the other button on the same widget and the
                  twenty-two people come back, and there the two measurements
                  agree with each other at 0.9886, since taller people in this
                  crowd are also thicker. The product column earns almost nothing
                  there. The pure powers leave 98.89 and the powers with the
                  products leave 91.03, a gain of eight percent for a column that
                  was worth a factor of fifteen a moment ago.
                </p>
                <p>When girth is nearly a fixed multiple of height, their product is nearly a multiple of height squared. The expansion already contains that squared column, so the product may add little independent variation. This helps explain the smaller improvement here. Input correlation alone does not determine whether an interaction will improve predictions.</p>
                <KeepInMind>
                  The interaction reduces squared residuals much more in the deliberately varied group than in the highly correlated group. Independent input variation can help us identify an interaction, but it does not guarantee that the target requires one.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A score of 0.9620 for the straight line is evidence that the shape of the fit is right.",
              false,
              "It says that most of the variation in weight is accounted for, and over a range where taller mostly means heavier a straight line accounts for most of it whether or not the relationship is straight. The misses are what tell us otherwise. The two youngest people sit above the line by 8.30 and 4.05 kilograms, the six people from 118 to 149 centimeters are all below it, and the line answers 7.80 kilograms for a child who weighs 16.1.",
            ),
            choice(
              "A fit with a squared height column draws a curve. In what sense is it still a linear model?",
              [
                "It is linear in the weights it learns rather than in the measurements it reads",
                "It is linear because the curve it draws is close to a straight line over this range",
                "It is linear only until the cube is added as well",
                "It is not; the expansion replaces least squares with a different method",
              ],
              0,
              "A linear model is a weighted sum of its columns, and nothing in the method says a column has to be something a tape measure produced. The same weighted sum is formed, the same squared misses are added up and the same system is solved, and the only difference is that there are three numbers to find rather than two. The squared misses fall from 548.33 to 307.18, which is the design changing rather than the fitting.",
            ),
            choice(
              "How many columns does a degree-two expansion of height and girth produce?",
              ["Four", "Five", "Six", "Three"],
              1,
              "A term is any product of the two whose exponents add up to no more than the degree, which gives height, girth, height squared, height times girth, and girth squared. The term where every exponent is zero is the constant, and it belongs to the fit’s intercept rather than to any column.",
            ),
            choice(
              "On the twelve people arranged with four girths at each of three heights, what did adding the product column do?",
              [
                "It took the total of the squared misses from 28.07 to 1.83, removing 93 percent of what was left",
                "It left the misses unchanged, since the powers already covered the curve",
                "It halved the misses, which is the usual gain from a cross term",
                "It made the fit worse, because the product duplicates the square",
              ],
              0,
              "Going from a girth of 66 to a girth of 96 adds 44.50 kilograms at 150 centimeters, 49.30 at 165 and 54.80 at 180, and a fit with one coefficient for girth has to answer one number, which it does at 49.45 everywhere. With the product column the coefficient of girth has height inside it, and the fit answers 44.59, 49.45 and 54.31.",
            ),
            trueFalse(
              "On the twenty-two people the product column earns almost nothing, an eight percent reduction in the misses against a factor of fifteen on the twelve arranged ones.",
              true,
              "The pure powers leave 98.89 on the crowd and the powers with the products leave 91.03, where on the twelve builds the same column took the misses from 28.07 to 1.83. The two measurements agree at 0.9886 in the crowd, since taller people there are also thicker, so the product of the two is nearly a multiple of height squared and the squared column is already in the expansion. Whether a cross term is worth its column is decided by the data, by how much the two columns already agree, and not by the method.",
            ),
        ],
        },
        {
          title: "Part 4. What the Expansion Costs",
          content: (
            <>
              <SubSection title="9. The count, by degree and by how much was measured">
                <p>
                  Everything so far has been what the expansion buys. What it
                  costs is columns, and the count rises faster than most people
                  expect, because it counts the ways of choosing a degree&rsquo;s
                  worth of factors from the available measurements with repeats
                  allowed.
                </p>
                <Equation>{"columns = C(p + d, d) − 1"}</Equation>
                <p>Here p is the number of original measurements and d is the maximum total degree. The subtracted term is the constant, represented separately by the regression intercept. The table lists how many nonconstant columns the expansion produces.</p>
                <ColumnGrowthGrid />
                <NumberTable
                  headings={[
                    "measurements",
                    "degree 2",
                    "degree 3",
                    "degree 4",
                    "degree 5",
                  ]}
                  rows={[
                    ["2", "5", "9", "14", "20"],
                    ["3", "9", "19", "34", "55"],
                    ["5", "20", "55", "125", "251"],
                    ["10", "65", "285", "1000", "3002"],
                  ]}
                  caption="Columns produced, by how many measurements were taken and how high the degree goes."
                />
                <KeepInMind>
                  The count grows in both directions at once and fastest in the
                  number of measurements. Ten measurements at degree three
                  produce 285 columns, and at degree five, 3,002.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. More columns than there are people">
                <p>The column count tells us how many coefficients must be estimated, in addition to the intercept. If there are more coefficients than observations, ordinary least squares cannot identify a unique coefficient vector from those observations alone. Regularization or another selection rule can still define a solution.</p>
                <InAModel title="Three measurements on twenty-two people">
                  <p>Suppose we also recorded age. At degree three, the three inputs produce 19 columns plus an intercept, giving 20 coefficients for twenty-two people. Enough rows is necessary for a unique ordinary least-squares fit, but independent columns are also required. At degree four there are 34 columns and 35 coefficients. This implementation refuses that underdetermined unregularized fit.</p>
                </InAModel>
                <p>A large expansion can therefore become difficult to estimate even before we compare its predictive accuracy. Ten measurements at degree two already require 66 coefficients including the intercept. Check the available observations and the independence of the resulting columns; use fewer terms or an appropriate regularized method when needed.</p>
                <KeepInMind>
                  For a unique unregularized coefficient vector, the design matrix must have full column rank. At least as many observations as coefficients is necessary, and duplicated or dependent columns can prevent uniqueness even when there are enough rows.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Degree Stops Helping",
          content: (
            <>
              <SubSection title="11. The score on the fitted people can only improve">
                <p>For nested polynomial expansions fitted by unregularized least squares on the same observations, the best achievable training error cannot increase with degree. Set every new coefficient to zero and the lower-degree prediction is still available. The higher-degree minimum must be at least as good, although numerical error or an unfinished optimizer can affect a computed fit.</p>
                <Equation>{"squared misses at degree d + 1  ≤  squared misses at degree d"}</Equation>
                <p>
                  So the score on the fitted people cannot fall as the degree
                  rises, whatever the shape of the data, and a number that only
                  ever improves cannot tell us when to stop.
                </p>
                <KeepInMind>
                  Training error alone cannot select the degree: the larger nested model can reproduce every prediction available to the smaller one. Evaluation on observations excluded from fitting is needed to assess whether the extra terms help beyond the training data.</KeepInMind>
              </SubSection>

              <SubSection title="12. Where the two scores part company">
                <p>
                  The way to see what the degree is really doing is to keep
                  people back. Seven of the twenty-two are held out of every fit
                  on this page, leaving fifteen to fit on, and both scores are
                  drawn against the degree below. The height column is put on a
                  common scale before it is raised, for reasons Part 6 measures.
                </p>
                <DegreeGapCurves />
                <p>
                  The two lines run together and then separate. The score on the
                  fitted people climbs from 0.9620 to 0.9998, quietly and
                  without interruption. The score on the seven held back rises to
                  0.9762 at degree four, drifts down to 0.9105 by degree nine,
                  jumps back to 0.9785 at ten, and then leaves the picture,
                  reading 0.3641 at degree eleven, −36.35 at twelve and −24,967
                  at fourteen. A score below zero means the fit is worse than
                  answering everybody with the average weight.
                </p>
                <InAModel title="The two ends of the sweep">
                  <p>At degree fourteen there are fifteen coefficients for fifteen distinct training heights. In exact arithmetic, the corresponding polynomial can interpolate those observations. The computed training R² is 0.9998 because finite precision leaves some numerical error. Between training observations, the prediction for the 131-centimeter person is −9,002.94 kilograms, compared with a measured 27.6; for the 137-centimeter person it is −4,030.13, compared with 29.1.</p>
                </InAModel>
                <KeepInMind>
                  In this sweep, several high-degree fits have very poor held-out predictions despite small training residuals. Inspect those predictions and the curve as well as the aggregate score. A higher degree need not fail this way on every dataset.</KeepInMind>
              </SubSection>

              <SubSection title="13. The curve between the people">
                <p>
                  It helps to look at what the high-degree fit is actually doing,
                  which the playground at the top of the page will draw. Take the
                  degree slider past ten and the curve still passes close to
                  every solid dot, since those are the people it was fitted to,
                  and between them it climbs and dives off the top and bottom of
                  the frame. The hollow rings are the people it was not shown,
                  and they sit where the curve is not.
                </p>
                <p>Fifteen distinct input positions determine a unique polynomial of degree at most fourteen that passes through all fifteen targets. Its values between those positions are therefore mathematically determined. What the observations do not guarantee is that those values match the underlying relationship. Polynomial interpolation can oscillate strongly, particularly near the ends of an interval, as in the phenomenon studied by Runge.</p>
                <KeepInMind>
                  Agreement with the measured points does not establish accuracy between them. The interpolation rule determines those intermediate values, but observations at the fitted positions alone cannot verify them.</KeepInMind>
              </SubSection>

              <SubSection title="14. A penalty makes a high degree survivable">
                <p>

                  The wild swings come from very large weights, some strongly
                  positive and some strongly negative, canceling almost exactly
                  at the people and not at all between them. So the repair is to
                  make large weights expensive, which is what a penalized fit
                  does, and it is the reason the two ideas are usually taught in
                  the same breath.
                </p>
                <Equation>{"minimise  Σ (miss)²  +  penalty × Σ b²"}</Equation>
                <p>
                  Turn the penalty slider on the sweep above, or on the
                  playground, and the third line is the same degrees with the
                  weights shrunk. The effect at the top end is not subtle.
                </p>
                <NumberTable
                  headings={[
                    "degree",
                    "penalty",
                    "score, people it saw",
                    "score, people it did not",
                  ]}
                  rows={[
                    ["4", "none", "0.9864", "0.9762"],
                    ["4", "0.1", "0.9856", "0.9675"],
                    ["14", "none", "0.9998", "−24967.20"],
                    ["14", "0.001", "0.9881", "0.9631"],
                    ["14", "0.1", "0.9862", "0.8901"],
                  ]}
                  caption="The same expansions, with and without shrinkage, on the same seven held-back people."
                />
                <p>At degree fourteen, penalty 0.001 changes held-out R² from −24,967.20 to 0.9631. The same penalty at degree four gives 0.9761, close to its unpenalized 0.9762. The table’s lower degree-four result of 0.9675 uses penalty 0.1 instead. These are different penalty comparisons: regularization stabilizes the high-degree fit here, while its strength still needs validation.</p>
                <KeepInMind>
                  A coefficient penalty can reduce the extreme predictions of a flexible polynomial, as it does here. It also changes the fitted objective and needs validation alongside the degree. Neither choice removes the need for an independent evaluation.</KeepInMind>
              </SubSection>

              <SubSection title="15. Straight cuts need none of this">
                <p>
                  It would be dishonest to leave the impression that a curved
                  relationship demands an expansion. A fit made of straight cuts
                  on the raw height column can approximate a curved relationship too, by answering
                  one weight for everybody below some height, another for the
                  band above that, and so on, with no squared column anywhere. It approximates the
                  curve with piecewise constant predictions, and the question is which
                  of the two does better on these people.
                </p>
                <StepsAgainstACurve />
                <p>Among the displayed settings, the degree-four polynomial gives held-out R² of 0.9762 and the best tree depth, three, gives 0.9502. A polynomial can represent a smooth trend directly, whereas this tree approximates it with constant predictions over intervals. These results support the polynomial for this comparison, not a guarantee that it will win for every smooth relationship.</p>
                <>
<p>The worst displayed tree score is 0.6438 at depth one; the worst displayed polynomial score is −24,967. The polynomial sweep is much less stable here. These are the observed minima among the tested settings, rather than lower bounds for either method on other data.</p>
                <p>
                  The steps also need no decision about scale, which the last Part measures, and they read a column that has not been touched at all.
                </p>
</>
                <KeepInMind>
                  Compare sensitivity to the setting as well as the best score. Here the polynomial has the better displayed result but also the more severe failures at high degrees. A tree can still perform poorly on another split or dataset; the sweep gives no guaranteed floor.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. When More Columns Add No New Information", id: "part-6-where-the-expansion-stops-being-defined",
          content: (
            <>
              <SubSection title="16. The degree is a free choice, and nothing in the data makes it">
                <p>The degree is a setting chosen outside the coefficient fit. We can compare candidate degrees using validation data or cross-validation, taking account of the available observations and the relationship we expect. There is no single degree that is best for every problem.</p>
                <>
<p>A validation score is an estimate based on a finite group. With only seven held-out people, small score differences may change when we choose another group. Selecting the degree and evaluating that selection are separate tasks.</p>
                <p>
                  On this page&rsquo;s seven held-back people it reads 0.9785 at degree ten, the highest reading anywhere in the sweep, and 0.3641 at degree eleven, and no property of the relationship between height and weight changes between those two settings.
                </p>
</>
                <InAModel title="What that reading is worth">
                  <p>With only seven held-out observations, nearby degree choices can receive very different scores. Those results provide limited evidence for selecting the degree. Simpler candidates and repeated comparisons are useful checks, with another evaluation reserved for the final choice.</p>
                </InAModel>
                <p>
                  The{" "}
                  <Link href="/concepts/grid-search" className={link}>
                    searching for a setting
                  </Link>{" "}
                  page is about that whole difficulty and measures how much the
                  winner&rsquo;s own score flatters it. What belongs here is only
                  that the degree is exactly the kind of dial that page exists
                  for, and that it has no setting a derivation could supply.
                </p>
                <KeepInMind>
                  Use validation to compare degrees, then evaluate the selected procedure on data excluded from that selection. The uncertainty in those comparisons matters when neighboring degrees have similar scores.</KeepInMind>
              </SubSection>

              <SubSection title="17. The expansion is blind to what a column means">
                <>
<p>The expansion operates on numerical values without knowing what they represent. Height multiplied by girth has units of area, though it is not automatically a measured physical area. A clinic identifier written as 1, 2, 3 or 4 has no corresponding quantity: squaring it or multiplying it by height introduces numerical relationships that the labels do not justify.</p>
                <p>
                  Both columns are built, both are handed to the fit, and both get a weight.
                </p>
</>
                <p>Some inputs create dependent columns and prevent a unique coefficient fit. Others produce valid arithmetic while imposing an unsuitable interpretation. The table separates those cases.</p>
                <DerivationTable
                  expressionHeading="Original column"
                  reasonHeading="What its powers and interactions add"
                  rows={[
                    {
                      expression: "a column recorded as 0 or 1",
                      reason:
                        "squaring a binary value returns the same value. The resulting duplicate column prevents a unique unregularized coefficient vector: one coefficient can increase while the other decreases by the same amount. The SDK refuses that dependent fit.",
                    },
                    {
                      expression: "a column with a code standing for a category",
                      reason:
                        "powers and products of arbitrary category IDs impose numerical distances that the categories do not justify. The arithmetic can succeed, so the representation needs to be checked before fitting.",
                    },
                    {
                      expression: "a column that runs both negative and positive",
                      reason:
                        "the squared column alone loses the original sign. This expansion also retains the original column, so the complete representation can still distinguish negative and positive inputs. Whether a symmetric response is suitable depends on the problem.",
                    },
                    {
                      expression: "a column that never varies",
                      reason:
                        "every power of a constant is another constant, so each new column is a multiple of the fit’s own intercept and adds no direction at all. There is nothing for a weight to be, since the intercept can already produce whatever the constant column would have produced.",
                    },
                  ]}
                />
                <KeepInMind>
                  Inspect what the original columns mean before expanding them. Binary and constant columns can create duplicate or dependent terms. Numeric category labels can create unjustified spacing and interactions even when the coefficient calculation succeeds.</KeepInMind>
              </SubSection>

              <SubSection title="18. A column carries its unit into every power">
                <p>

                  The last difficulty is the one that connects back to the
                  scaling pages, and it is much sharper here than it is there. A
                  height of 191 centimeters cubed is 6,967,871, while the height
                  itself is 191, so the two columns handed to the same fit differ
                  in size by a factor of 36,481. Write the same heights in meters
                  and the cube is 6.97 against 1.91, a factor of 3.6481. The
                  people did not change.
                </p>
                <PowersAndUnits />
                <>
<p>In exact arithmetic, changing the unit of an input leaves the predictions of an identified unregularized least-squares polynomial unchanged: the coefficients can compensate for the rescaled powers. Here both unit choices give R² of 0.984072. A penalty on coefficient size changes that equivalence unless the penalty is adjusted as well. Finite precision can also affect the unregularized calculation, as the next example shows.</p>
                <p>

                  At a penalty of 100 the centimeter fit scores 0.977374 and the meter fit 0.703648, from the same people and the same instruction.
                </p>
</>
                <InAModel title="And where least squares does feel it">
                  <p>
                    At degree fourteen on fifteen people the fit has one number
                    for every person, so the exactly correct answer is a score of
                    1. Taken on the heights as measured, the largest number in
                    the columns is 7.42 × 10³¹ and the fit reaches 0.987231,
                    which is not close. Put on a common scale first, the largest
                    number is 5,834 and it reaches 0.999808. Neither is exactly
                    1, and the gap between them is not a fact about people at
                    all.
                  </p>
                </InAModel>
                <p>The comparison tree gives R² of 0.990159 in both centimeters and meters. This positive unit conversion transforms its thresholds along with the input values. It avoids the large polynomial powers in this example, but its observed sweep minimum is still not a general performance guarantee.</p>
                <KeepInMind>

                  Large powers can create large differences in column magnitude and make the numerical solve unstable. Centering and scaling the original inputs can help. If coefficients will be penalized, also consider the scales of the expanded columns and what a shared penalty should mean.</KeepInMind>
              </SubSection>

              <SubSection title="19. Powers That Grow Too Large and Tables That Grow Too Wide" id="19-where-the-method-runs-out">
                <p>Before fitting, check how many distinct input patterns the data contains, whether the generated columns are independent, and whether the powers remain numerically manageable. These conditions affect different parts of the calculation.</p>
                <DerivationTable
                  expressionHeading="Degree or data condition"
                  reasonHeading="What must be checked before fitting"
                  rows={[
                    {
                      expression: "the degree itself",
                      reason:
                        "chosen outside the coefficient fit, using assumptions and validation comparisons. Here held-out R² changes from 0.9785 to 0.3641 between neighboring degrees, illustrating sensitivity on a small validation group.",
                    },
                    {
                      expression: "more columns than people",
                      reason:
                        "a unique unregularized coefficient vector cannot be identified. Exact interpolation additionally requires compatible target values and sufficient row rank. Three measurements at degree four make 34 columns plus an intercept, giving 35 coefficients for 22 people.",
                    },
                    {
                      expression: "exactly as many numbers as people",
                      reason:
                        "with a full-rank square design matrix, exact arithmetic gives a unique interpolating solution. The near-perfect training score does not establish accuracy elsewhere. Here fifteen distinct training heights give R² of 0.9998, while the curve predicts −9,002.94 kilograms for a held-out person weighing 27.6.",
                    },
                    {
                      expression: "fewer distinct values than the degree asks for",
                      reason:
                        "a column taking only three distinct heights spans three directions however many powers are built from it, so the fourth and fifth powers are new arithmetic and old information. Probed on ten people at three heights, degrees two, three, four and five all score 0.992417, identically.",
                    },
                    {
                      expression: "a column coded 0 and 1",
                      reason:
                        "its square is itself, so two identical columns arrive and the weights are not determined. The pair can be swapped in any proportion without changing a single prediction.",
                    },
                    {
                      expression: "a column that never varies",
                      reason:
                        "all its powers are constant, so they add no direction the intercept did not already have, and nothing distinguishes one set of weights from another.",
                    },
                    {
                      expression: "a person outside the measured range",
                      reason:
                        "a prediction is still defined, but the fitted observations do not establish its accuracy there. The leading nonzero term determines the long-range behavior, which can become physically implausible. Check the input range and obtain evidence for any required extrapolation.",
                    },
                    {
                      expression: "columns on wildly different scales",
                      reason:
                        "unregularized predictions are invariant to nonzero unit rescaling in exact arithmetic when the equivalent fit is identified, but numerical conditioning can change. A fixed coefficient penalty also changes: the two unit choices here give penalized R² of 0.977374 and 0.703648.",
                    },
                  ]}
                />
                <KeepInMind>
                  When the input has only a few distinct values, higher powers may add no independent direction. When there are enough distinct inputs to interpolate, a nearly perfect training score can coexist with implausible predictions between them. These are different limitations and need different checks.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "A degree-four expansion of three measurements produces 34 input columns. Why does this library reject an unpenalized unique-coefficient fit to only twenty-two people?",
              [
                "The 34 coefficients plus an intercept are 35 unknowns, so twenty-two observations cannot determine a unique unpenalized coefficient vector",
                "Because the degree must not exceed the number of measurements",
                "Because the fourth powers of a height overflow",
                "Because the fit would be untrustworthy, so it is declined as a matter of policy",
              ],
              0,
              "There are fewer observations than coefficients, so the design cannot have independent information for every coefficient. This solver rejects that unpenalized system. At degree three there are 19 input columns plus the intercept; twenty-two rows meet the count requirement, though dependent columns can still prevent uniqueness. Regularization or a specified minimum-norm convention can define a solution in underdetermined problems.",
            ),
            several(
              "Consider exact unpenalized least-squares optima for nested polynomial expansions, and this library's unique-coefficient solver. Which statements hold?",
              [
                "The score on the fitted people cannot fall as the degree rises, whatever the shape of the data",
                "A column that takes only the values zero and one expands into a square identical to itself, and the fit is refused for having no unique answer",
                "A column holding a clinic code written as 1, 2, 3 and 4 is refused, since its products mean nothing",
                "A column with only a few distinct values keeps responding to the degree, since every power is a new column",
              ],
              [0, 1],
              "The higher-degree expansion retains the lower-degree columns, so setting every added coefficient to zero reproduces the lower-degree predictions. Its minimum training squared error therefore cannot increase in exact arithmetic. A binary column and its square are identical, so coefficients are not unique; this solver rejects such dependence. Numeric clinic codes are not automatically rejected, but their powers can impose an unjustified numerical relationship. Powers of a column with few distinct values eventually become dependent and cannot keep adding independent information. Numerical fitting may also deviate from the exact optimum at high degrees.",
            ),
            choice(
              "The held-back seven read 0.9762 at degree four, 0.9105 at nine, 0.9785 at ten and 0.3641 at eleven. What is the honest reading?",
              [
                "The instrument is too coarse to separate the settings, so take the lowest degree whose reading is near the best",
                "Degree ten is the right degree, since it is the highest reading in the sweep",
                "The relationship between height and weight changes between degrees ten and eleven",
                "The sweep should be rerun until the curve is smooth",
              ],
              0,
              "The held-out set contains only seven people, so a small difference between degrees may depend strongly on those particular observations. The large swings at neighboring high degrees also warn that the fit is unstable. A simpler candidate with comparable validation performance is reasonable, but use more splits or more data to assess that choice. Selecting the degree from this sweep uses the seven people for validation; their best score is not an independent final estimate.",
            ),
            choice(
              "A penalty of one thousandth is applied across the sweep. What did it measure?",
              [
                "Degree fourteen moves from −24,967.20 to 0.9631, while degree four moves from 0.9762 to 0.9761",
                "Every degree improves, with the largest gain at the degree that was already best",
                "Degree fourteen is unaffected, since the penalty is far too small to matter there",
                "The penalty removes the need to measure on people the fit never saw",
              ],
              0,
              "Large opposing coefficients can nearly cancel at training observations while producing extreme predictions between them. Penalizing their sizes reduces those swings in this experiment. The chosen penalty changes the degree-four score only slightly and greatly improves the degree-fourteen score. That supports evaluating regularization for each candidate; it does not guarantee an improvement at every degree.",
            ),
            several(
              "Which of these did the page measure about writing the heights in meters rather than centimeters?",
              [
                "Plain least squares lands in the same place, 0.984072 under either unit",
                "At a penalty of 100 the centimeter fit scores 0.977374 and the meter fit 0.703648",
                "The stepped fit reads 0.990159 under both units, identical to the last digit",
                "The expansion refuses the meter columns, because the cubes are too small to separate",
              ],
              [0, 1, 2],
              "A change of unit multiplies a column by a constant and a coefficient can divide by that same constant, so an unpenalized fit cannot feel it. A penalty is a statement about the size of the coefficients, and those have just changed size by four orders of magnitude. The stepped fit only ever asks which side of a threshold a value falls on, and a change of unit moves the value and the threshold together.",
            ),
        ],
        },
        {
          title: "Practice. Expanding the Crowd With the Library",
          practice: [
            exercise("Build the columns, and meet one that duplicates another",["Use PolynomialFeatures to expand the four height-girth pairs below to degree two. Print the number of columns and each column's name and values. Repeat with include_interactions=False and print the resulting names.","A column containing only zero and one is unchanged by squaring. Expand the height of eight people beside the column recording whether each person swims. Print swims and swims^2, then use NumPy to check whether those columns are identical. A duplicated column gives a fit no new information, even if a numerical solver happens to return coefficients for it."],`import numpy as np
from oop_ml import Feature, PolynomialFeatures

corners = [Feature("height", [150, 150, 180, 180]), Feature("girth", [66, 96, 66, 96])]
expansion = PolynomialFeatures(degree=2).fit(corners)
# Print how many columns the expansion built, then each column's name and
# its four values, then the names of a degree-two expansion with
# include_interactions=False.

people = [Feature("height", [150, 160, 170, 180, 155, 165, 175, 185]), Feature("swims", [0, 1, 0, 1, 1, 0, 1, 0])]
# Expand people to degree two, print the swims column and the swims^2 column,
# then print whether those two arrays are identical.`,`import numpy as np
from oop_ml import Feature, PolynomialFeatures

corners = [Feature("height", [150, 150, 180, 180]), Feature("girth", [66, 96, 66, 96])]
expansion = PolynomialFeatures(degree=2).fit(corners)
print(f"{expansion.terms.n_terms} columns")
for column in expansion.transform(corners):
    print(f"  {column.name}: {[int(value) for value in column.values]}")
powers_only = PolynomialFeatures(degree=2, include_interactions=False).fit(corners)
print(f"powers alone: {powers_only.terms.names}")

people = [Feature("height", [150, 160, 170, 180, 155, 165, 175, 185]), Feature("swims", [0, 1, 0, 1, 1, 0, 1, 0])]
columns = PolynomialFeatures(degree=2).fit(people).transform(people)
for column in columns:
    if column.name in ("swims", "swims^2"):
        print(f"  {column.name}: {[int(value) for value in column.values]}")
values = {column.name: column.values for column in columns}
print("identical columns", bool(np.array_equal(values["swims"], values["swims^2"])))`,`5 columns
  height: [150, 150, 180, 180]
  girth: [66, 96, 66, 96]
  height^2: [22500, 22500, 32400, 32400]
  height*girth: [9900, 14400, 11880, 17280]
  girth^2: [4356, 9216, 4356, 9216]
powers alone: ('height', 'girth', 'height^2', 'girth^2')
  swims: [0, 1, 0, 1, 1, 0, 1, 0]
  swims^2: [0, 1, 0, 1, 1, 0, 1, 0]
identical columns True`,{...{"hints":["fit fixes the list of terms from the column names and transform builds the columns, so the four values of every term come from transform, one Feature per term, each carrying its name.","The learned list of terms is on terms, which has n_terms and names, and the names are written with ^ for a power and * for a product.","np.array_equal checks every entry of the two arrays. Equal arrays cannot supply two independent pieces of information to the fit."],"check":{"prompt":"What does the product column hold for the person 180 tall with a girth of 96?","answer":17280,"tolerance":0.5,"because":"The product column gives 17,280 for that person. The swims column and its square are identical, so the second adds no new information. A fit using both cannot uniquely separate their coefficients."}},question:"Which expanded columns add information, and which repeat an existing column?"}),
            exercise("Hold seven back and bend the line through the fifteen",["Use TrainTestSplitter with test_fraction=0.3 and random_seed=3 to split the twenty-two people into fifteen training rows and seven test rows. Fit Standardizer on the training heights. For each degree from one to four, expand those standardized heights and fit MultipleLinearRegression to the training weights.", "For each degree, print training R², held-out R², squared residuals summed across all twenty-two people, and the prediction for the 104 cm child. Use the training-fitted scaler and expansion for every prediction. Compare the residual pattern and held-out score as the degree changes."],`from oop_ml import Dataset, Feature, MultipleLinearRegression, PolynomialFeatures, Standardizer, TrainTestSplitter

heights = [104, 111, 118, 124, 131, 137, 143, 149, 154, 158, 162, 166, 169, 172, 175, 178, 180, 183, 185, 187, 189, 191]
weights = [16.1, 18.1, 18.1, 21.7, 27.6, 29.1, 35.5, 43.6, 53.1, 45.8, 59.0, 61.1, 68.2, 65.7, 70.9, 79.3, 79.6, 77.5, 83.9, 89.9, 88.5, 81.3]

split = TrainTestSplitter(test_fraction=0.3, random_seed=3).split(
    Dataset([Feature("height", heights)], Feature("weight", weights))
)
scaler = Standardizer().fit(list(split.training.input_features))
fitted_rows = scaler.transform(list(split.training.input_features))
held_rows = scaler.transform(list(split.testing.input_features))
everyone = scaler.transform([Feature("height", heights)])

for degree in (1, 2, 3, 4):
    # Fit a PolynomialFeatures of this degree on fitted_rows, fit a
    # MultipleLinearRegression on the expanded fitted rows and the training
    # target, and print the fitted score, the held-back score, the residual sum
    # of squares over everyone, and the prediction for the first person.
    pass`,`from oop_ml import Dataset, Feature, MultipleLinearRegression, PolynomialFeatures, Standardizer, TrainTestSplitter

heights = [104, 111, 118, 124, 131, 137, 143, 149, 154, 158, 162, 166, 169, 172, 175, 178, 180, 183, 185, 187, 189, 191]
weights = [16.1, 18.1, 18.1, 21.7, 27.6, 29.1, 35.5, 43.6, 53.1, 45.8, 59.0, 61.1, 68.2, 65.7, 70.9, 79.3, 79.6, 77.5, 83.9, 89.9, 88.5, 81.3]

split = TrainTestSplitter(test_fraction=0.3, random_seed=3).split(
    Dataset([Feature("height", heights)], Feature("weight", weights))
)
scaler = Standardizer().fit(list(split.training.input_features))
fitted_rows = scaler.transform(list(split.training.input_features))
held_rows = scaler.transform(list(split.testing.input_features))
everyone = scaler.transform([Feature("height", heights)])

for degree in (1, 2, 3, 4):
    expansion = PolynomialFeatures(degree=degree).fit(fitted_rows)
    line = MultipleLinearRegression().fit(expansion.transform(fitted_rows), split.training.target_feature)
    fitted = line.score(expansion.transform(fitted_rows), split.training.target_feature)
    held = line.score(expansion.transform(held_rows), split.testing.target_feature)
    misses = line.evaluate(expansion.transform(everyone), Feature("weight", weights)).residual_sum_of_squares
    child = float(line.predict(expansion.transform(everyone))[0])
    print(f"degree {degree}: fitted {fitted:.4f}, held back {held:.4f}, squared misses {misses:.2f}, child {child:.2f} kg")`,`degree 1: fitted 0.9620, held back 0.9512, squared misses 548.33, child 7.80 kg
degree 2: fitted 0.9834, held back 0.9623, squared misses 307.18, child 14.02 kg
degree 3: fitted 0.9864, held back 0.9755, squared misses 225.56, child 16.67 kg
degree 4: fitted 0.9864, held back 0.9762, squared misses 222.79, child 16.57 kg`,{...{ hints: ["A split holds two Datasets, training and testing, and each carries input_features and target_feature. The scaler and the expansion are both fitted on the training rows alone and then applied to everything.", "score takes the expanded columns and the target and answers R squared. evaluate takes the same two and answers an object whose residual_sum_of_squares is the total of the squared misses.", "The expansion of everyone is in the original order, so the 104 cm child is the first prediction."], check: numberCheck("What score do the seven held-back people give the straight line?", 0.9512, 0.0005, "These early degree increases improve this held-out split while changing how the curve follows height. The measured scores describe this fixed split, rather than guaranteeing that more polynomial terms improve generalization.") },question:"Do higher polynomial degrees improve predictions on the held-out people?"}),
            exercise("Run the degree up to fourteen, with and without a penalty",["Continue with the same split and training-fitted standardizer. Fit unpenalized polynomial regressions of degrees 9, 10, 11, 12 and 14. Print each training and held-out R², plus the predicted weight of the 131 cm person, whose recorded weight is 27.6 kg.", "Fit RidgeRegression(penalty=0.001) at degrees 4 and 14 using the same expanded training rows. Print their held-out scores and compare them with the unpenalized fits."],`from oop_ml import Dataset, Feature, MultipleLinearRegression, PolynomialFeatures, RidgeRegression, Standardizer, TrainTestSplitter

heights = [104, 111, 118, 124, 131, 137, 143, 149, 154, 158, 162, 166, 169, 172, 175, 178, 180, 183, 185, 187, 189, 191]
weights = [16.1, 18.1, 18.1, 21.7, 27.6, 29.1, 35.5, 43.6, 53.1, 45.8, 59.0, 61.1, 68.2, 65.7, 70.9, 79.3, 79.6, 77.5, 83.9, 89.9, 88.5, 81.3]

split = TrainTestSplitter(test_fraction=0.3, random_seed=3).split(
    Dataset([Feature("height", heights)], Feature("weight", weights))
)
scaler = Standardizer().fit(list(split.training.input_features))
fitted_rows = scaler.transform(list(split.training.input_features))
held_rows = scaler.transform(list(split.testing.input_features))
everyone = scaler.transform([Feature("height", heights)])

for degree in (9, 10, 11, 12, 14):
    expansion = PolynomialFeatures(degree=degree).fit(fitted_rows)
    line = MultipleLinearRegression().fit(expansion.transform(fitted_rows), split.training.target_feature)
    # Print the fitted score, the held-back score, and the prediction for the
    # fifth person, who is 131 cm tall.

for degree in (4, 14):
    # Fit a RidgeRegression with penalty=0.001 on the same expanded rows and
    # print its held-back score.
    pass`,`from oop_ml import Dataset, Feature, MultipleLinearRegression, PolynomialFeatures, RidgeRegression, Standardizer, TrainTestSplitter

heights = [104, 111, 118, 124, 131, 137, 143, 149, 154, 158, 162, 166, 169, 172, 175, 178, 180, 183, 185, 187, 189, 191]
weights = [16.1, 18.1, 18.1, 21.7, 27.6, 29.1, 35.5, 43.6, 53.1, 45.8, 59.0, 61.1, 68.2, 65.7, 70.9, 79.3, 79.6, 77.5, 83.9, 89.9, 88.5, 81.3]

split = TrainTestSplitter(test_fraction=0.3, random_seed=3).split(
    Dataset([Feature("height", heights)], Feature("weight", weights))
)
scaler = Standardizer().fit(list(split.training.input_features))
fitted_rows = scaler.transform(list(split.training.input_features))
held_rows = scaler.transform(list(split.testing.input_features))
everyone = scaler.transform([Feature("height", heights)])

for degree in (9, 10, 11, 12, 14):
    expansion = PolynomialFeatures(degree=degree).fit(fitted_rows)
    line = MultipleLinearRegression().fit(expansion.transform(fitted_rows), split.training.target_feature)
    fitted = line.score(expansion.transform(fitted_rows), split.training.target_feature)
    held = line.score(expansion.transform(held_rows), split.testing.target_feature)
    at_131 = float(line.predict(expansion.transform(everyone))[4])
    print(f"degree {degree}: fitted {fitted:.4f}, held back {held:.2f}, the 131 cm person {at_131:.2f} kg")

for degree in (4, 14):
    expansion = PolynomialFeatures(degree=degree).fit(fitted_rows)
    shrunk = RidgeRegression(penalty=0.001).fit(expansion.transform(fitted_rows), split.training.target_feature)
    print(f"degree {degree} with the penalty: held back {shrunk.score(expansion.transform(held_rows), split.testing.target_feature):.4f}")`,`degree 9: fitted 0.9874, held back 0.91, the 131 cm person 25.45 kg
degree 10: fitted 0.9881, held back 0.98, the 131 cm person 21.56 kg
degree 11: fitted 0.9888, held back 0.36, the 131 cm person 2.83 kg
degree 12: fitted 0.9970, held back -36.35, the 131 cm person -261.97 kg
degree 14: fitted 0.9998, held back -24967.20, the 131 cm person -9002.94 kg
degree 4 with the penalty: held back 0.9761
degree 14 with the penalty: held back 0.9631`,{...{ hints: ["The setup is the previous problem's, and the only change inside the loop is which person is read off the predictions. The 131 cm person is the fifth in the list, which is index 4.", "RidgeRegression takes the same expanded columns that MultipleLinearRegression took, and its one hyperparameter is penalty, set at construction.", "The held-back score at degree fourteen is a large negative number, so it is printed to two places rather than four to keep the line readable."], check: numberCheck("What does the degree-fourteen curve answer for the 131 cm person, in kilograms?", -9002.94, 0.05, "The high-degree model fits the training rows closely but behaves extremely poorly between them. Penalizing its large coefficients stabilizes this fit, with a different tradeoff for the lower-degree model.") },question:"Can a small penalty stabilize the high-degree fit?"}),
            exercise("Give the fit a product column on the twelve builds",["Use the twelve height-girth pairs below to compare three models: degree one, degree two without interactions, and degree two with interactions. Fit MultipleLinearRegression to each expansion. Print the number of columns and the residual sum of squares.", "For each fitted model, predict at girths 66 and 96 cm for heights 150 and 180 cm. Print the predicted weight difference between the two girths at each height. Compare whether that difference depends on height when the height-by-girth column is available."],`from oop_ml import Feature, MultipleLinearRegression, PolynomialFeatures

heights = [150, 150, 150, 150, 165, 165, 165, 165, 180, 180, 180, 180]
girths = [66, 76, 86, 96, 66, 76, 86, 96, 66, 76, 86, 96]
weights = [38.5, 51.6, 67.5, 83.0, 41.6, 56.9, 72.3, 90.9, 45.5, 62.2, 79.6, 100.3]
columns = [Feature("height", heights), Feature("girth", girths)]
target = Feature("weight", weights)
ends = [Feature("height", [150, 150, 180, 180]), Feature("girth", [66, 96, 66, 96])]

for label, degree, products in (("a plane", 1, True), ("the powers alone", 2, False), ("the powers and the products", 2, True)):
    # Build the expansion, fit the line on the expanded columns, read the
    # residual sum of squares off evaluate, predict the four ends through the
    # same expansion, and print the column count, the misses, and the two gains.
    pass`,`from oop_ml import Feature, MultipleLinearRegression, PolynomialFeatures

heights = [150, 150, 150, 150, 165, 165, 165, 165, 180, 180, 180, 180]
girths = [66, 76, 86, 96, 66, 76, 86, 96, 66, 76, 86, 96]
weights = [38.5, 51.6, 67.5, 83.0, 41.6, 56.9, 72.3, 90.9, 45.5, 62.2, 79.6, 100.3]
columns = [Feature("height", heights), Feature("girth", girths)]
target = Feature("weight", weights)
ends = [Feature("height", [150, 150, 180, 180]), Feature("girth", [66, 96, 66, 96])]

for label, degree, products in (("a plane", 1, True), ("the powers alone", 2, False), ("the powers and the products", 2, True)):
    expansion = PolynomialFeatures(degree=degree, include_interactions=products).fit(columns)
    fit = MultipleLinearRegression().fit(expansion.transform(columns), target)
    misses = fit.evaluate(expansion.transform(columns), target).residual_sum_of_squares
    predicted = [float(value) for value in fit.predict(expansion.transform(ends))]
    print(f"{label}: {expansion.terms.n_terms} columns, squared misses {misses:.2f}, "
          f"girth 66 to 96 adds {predicted[1] - predicted[0]:.2f} kg at 150 cm and {predicted[3] - predicted[2]:.2f} kg at 180 cm")`,`a plane: 2 columns, squared misses 36.87, girth 66 to 96 adds 49.45 kg at 150 cm and 49.45 kg at 180 cm
the powers alone: 4 columns, squared misses 28.07, girth 66 to 96 adds 49.45 kg at 150 cm and 49.45 kg at 180 cm
the powers and the products: 5 columns, squared misses 1.83, girth 66 to 96 adds 44.59 kg at 150 cm and 54.31 kg at 180 cm`,{...{ hints: ["A degree-one expansion with products is just the two columns, so the same loop builds the plane. include_interactions=False at degree two is the powers alone.", "The expansion fitted on the twelve people is the one to transform the four ends through, so the ends get the same columns in the same order.", "The gain at a height is the prediction at girth 96 less the prediction at girth 66 for that height, which is two differences of the four predictions."], check: numberCheck("What total of squared misses does the fit with the products leave?", 1.83, 0.01, "A model with only a single girth coefficient assigns the same marginal girth effect at every height. The interaction lets that effect depend on height, reducing this dataset's remaining squared error.") },question:"Can a height-by-girth interaction explain a changing effect of girth?"}),
          ],
        },
      ]}
    />
  );
}
