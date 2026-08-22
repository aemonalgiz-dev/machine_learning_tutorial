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
import { ColumnGrowthGrid } from "@/components/widgets/ColumnGrowthGrid";
import { CurveThroughACrowd } from "@/components/widgets/CurveThroughACrowd";
import { DegreeGapCurves } from "@/components/widgets/DegreeGapCurves";
import { MissesInAPattern } from "@/components/widgets/MissesInAPattern";
import { PowersAndUnits } from "@/components/widgets/PowersAndUnits";
import { ProductGap } from "@/components/widgets/ProductGap";
import { StepsAgainstACurve } from "@/components/widgets/StepsAgainstACurve";
import { TermAssembler } from "@/components/widgets/TermAssembler";

export const metadata: Metadata = {
  title: "Polynomial Features · oop_ml",
  description:
    "Square a column, multiply two together, and a straight-line model can bend. What that buys, what it costs in columns, and where it stops being defined.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PolynomialFeaturesPage() {
  return (
    <ConceptPage
      title="Polynomial Features"
      tagline="Square a column, multiply two of them together, and a straight-line model has something to bend along."
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
      history={
        <>
          <p>
            Joseph Diez Gergonne, teaching at Nîmes and then at Montpellier,
            published a paper in 1815 in the Annales de Mathématiques on
            applying least squares to fitting a curve through measurements, and
            the question he set himself was not how to fit the curve but where
            to take the measurements and how high a power to allow. He wrote
            that the degree is not given by the physics in advance and has to be
            settled against the data, and that observations should therefore be
            taken at more settings than the chosen degree strictly needs, so
            that the residual misses can be looked at and the degree revised.
            Stephen Stigler brought the paper back to notice in 1974 in
            Biometrika, and what is striking in it is that the two halves of
            this page, the freedom a power buys and the difficulty of choosing
            how much of it to take, arrived together at the very beginning.
          </p>
          <p>
            The other half of the warning is Carl Runge&rsquo;s, at Hannover in
            1901, in a paper on interpolating between equally spaced ordinates.
            He took a smooth, perfectly well-behaved bell-shaped function, laid
            equally spaced points along it, and passed a polynomial through
            every one of them, which is the obvious thing to do and gets better
            and better in the middle as the degree rises. Near the two ends it
            gets worse without limit, and the swings grow rather than shrink as
            more points are added. The failure this page measures on twenty-two
            people, where a fit that reproduces every person it was given scores
            below nothing on the people it was not, is the same swing between the
            points that Runge described, and it is why the degree cannot simply
            be turned up.
          </p>
          <p>
            The products came from a chemical plant. George Box and Kenneth
            Wilson, working for Imperial Chemical Industries, published
            &ldquo;On the Experimental Attainment of Optimum Conditions&rdquo; in
            1951, and their problem was that the yield of a reaction depends on
            temperature and pressure and concentration together, so the
            temperature that works best is different at each pressure. A fit
            with one coefficient per input cannot say that, since one
            coefficient is one number and one number cannot change with the
            other inputs, and their answer was to fit a second-degree surface in
            a small region, including the terms that multiply two inputs
            together. Those cross terms are exactly what Part 3 measures on
            people of different builds. The page asks six questions in order.
            What does a straight line do to a relationship that genuinely bends?
            Why can the same fit produce a curve without becoming a different
            method? What columns does the expansion actually build, and why do
            the products matter as much as the powers? What does it cost? Where
            does a rising degree stop helping, and what makes a high one
            survivable? And where does the choice stop being one the data can
            make?
          </p>
        </>
      }
      playground={<CurveThroughACrowd />}
      sections={[
        {
          title: "Part 1. A Line Through People Who Bend",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Twenty-two people, and the shape weight really follows">
                <p>
                  We have twenty-two people measured three ways, height in
                  centimetres, waist girth in centimetres, and weight in
                  kilograms. The smallest is a child of 104 centimetres weighing
                  16.1 kilograms and the largest an adult of 191 centimetres
                  weighing 81.3, and everyone in between is arranged along that
                  span. Predicting weight from height is the obvious thing to
                  want, and a straight line is the obvious way to want it.
                </p>
                <p>
                  There is a reason to expect trouble before any fitting
                  happens. A person is roughly a solid of some height and some
                  thickness, and the weight of a solid goes as a length times a
                  girth squared, so weight against height alone should follow
                  something nearer a cube than a line over a range this wide.
                  Set the playground above to degree 1 and the straight line
                  through these people scores 0.9620, which looks like an
                  excellent fit, and it is the number I want to argue with
                  first.
                </p>
                <InAModel title="The line, on these twenty-two people">
                  <p>
                    It reaches 0.9620 and leaves 548.33 as the total of its
                    squared misses. Its guess for the 104 centimetre child is
                    7.80 kilograms, against a measured 16.1, so it is out by
                    more than half the child&rsquo;s weight at the very first
                    person. At the other end it puts the 191 centimetre adult at
                    85.43 against a measured 81.3.
                  </p>
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
                <p>
                  The thing worth looking at is what the fit leaves over. Each
                  person&rsquo;s miss is their measured weight less the weight the
                  fit gives them, and if the fit has the shape right those misses
                  should be scattered without order, some people above and some
                  below with no relation to how tall they are.
                </p>
                <MissesInAPattern />
                <p>
                  Under the straight line they are not scattered. The two
                  youngest people are above the line by 8.30 and 4.05
                  kilograms, then the six people from 118 to 149 centimetres are
                  all below it, and the tall end climbs back above. That is a
                  bow, and a bow in the misses is the fit telling us that the
                  line is too straight for these people rather than that these
                  people are noisy. Add the squared column and the longest
                  stretch on one side falls from six people to five, and the
                  child the line put at 7.80 lands at 14.02. Add the cube as
                  well and the longest stretch is three and the child lands at
                  16.67 against a measured 16.1.
                </p>
                <KeepInMind>
                  Read the misses as well as the score. Six people in a row all
                  below the line, at heights 118 through 149, is the fit telling
                  us about its own shape, and it says so while the score reads
                  0.9620.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Linear in the Coefficients, Not in the Columns",
          content: (
            <>
              <SubSection title="3. What the word linear was ever about">
                <p>
                  Here is the sentence the whole page turns on. A linear model
                  is a weighted sum of its columns, and the thing it is linear in
                  is the weights rather than the measurements. Nothing anywhere in the
                  method says that a column has to be something a tape measure
                  produced.
                </p>
                <Equation>{"prediction = b₀ + b₁ c₁ + b₂ c₂ + … + b_k c_k"}</Equation>
                <p>
                  Read that with c₁ standing for height and c₂ standing for
                  height multiplied by itself, and the prediction is a quadratic
                  in height while remaining an ordinary weighted sum of two
                  columns. So we may compute the squared column ourselves,
                  before anything is fitted, hand it over as though it were a
                  measurement, and get a curve out of a method that only ever
                  draws flat things.
                </p>
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
                  <p>
                    The total of the squared misses falls from 548.33 to 307.18,
                    a drop of 44 percent for one column. Adding the cube as well
                    takes it to 225.56, and the score goes 0.9620, 0.9834,
                    0.9864. The fit is still a straight-line method throughout;
                    what changed is what it was handed.
                  </p>
                </InAModel>
                <p>
                  It is worth seeing the two fits side by side in the playground
                  at the top. At degree 1 the line cuts through the young people
                  and comes out under the tall ones; at degree 3 it follows the
                  same sweep the people do. The 191 centimetre adult is still
                  missed by 8.44 kilograms at degree three, and that is because
                  he really is light for his height, which is a fact about him
                  and not a shortcoming of the curve.
                </p>
                <KeepInMind>
                  Expanding the columns changes the design of the fit and not
                  the fitting. That is why this belongs with the preparation of
                  the data rather than with the models.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Where the new columns are fixed">
                <p>
                  One detail decides whether the expansion is reproducible.
                  Which columns exist, and in what order, has to be settled once,
                  on the people the fit learns from, and then applied unchanged
                  to anybody who arrives later. Otherwise a new person with a
                  slightly different set of measurements would produce a
                  slightly different set of columns, and the weights learned
                  earlier would be multiplying the wrong things.
                </p>
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
                        "which is a decision made by the modeller and never by the data, as Part 6 argues.",
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
                  <p>
                    The person 150 centimetres tall with a girth of 66
                    contributes 150 and 66 for the two measured columns, 22,500
                    for the square of the height, 9,900 for the product of the
                    two, and 4,356 for the square of the girth. The person 180
                    tall with the same girth contributes 180, 66, 32,400, 11,880
                    and 4,356, so the two agree on the girth-squared column and
                    on nothing else. That is what makes them separate columns.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A term is a product of the original columns, each raised to
                  some power, with the powers adding up to no more than the
                  degree. The column it produces is one number per person, and
                  the fit treats it exactly like any measurement.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What a product says that no power can">
                <p>
                  The powers and the products are usually taught together as
                  though they were the same idea, and they answer quite different
                  questions. A power lets a column&rsquo;s own effect bend. A
                  product lets one column&rsquo;s effect depend on another
                  column, and no amount of squaring or cubing will give a fit
                  that ability, since each power still contributes its own fixed
                  amount to the answer.
                </p>
                <p>
                  To see it we need people whose two measurements do not move
                  together, so here are twelve arranged deliberately, four girths
                  at each of three heights. Since every girth appears at every
                  height, knowing one measurement tells us nothing at all about
                  the other.
                </p>
                <ProductGap />
                <InAModel title="What thirty centimetres of girth is worth">
                  <p>
                    Read it straight off the twelve people. Going from a girth of
                    66 to a girth of 96 adds 44.50 kilograms at 150 centimetres,
                    49.30 at 165, and 54.80 at 180, because the same extra girth
                    wraps a longer body. A fit with one coefficient for girth has
                    to answer one number, and it answers 49.45 at all three
                    heights, splitting the difference and being wrong at both
                    ends. Add the product column and the fit answers 44.59, 49.45
                    and 54.31.
                  </p>
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
                  <p>
                    That bracket is the whole of the difference. The fit is still
                    a weighted sum of columns and still linear in what it learns,
                    and yet the effect of girth now moves with height, which is
                    what the twelve people were measured to show.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A product term is how a fit says that the effect of one column
                  depends on the level of another. Without one, the fit insists
                  every column&rsquo;s effect is the same for everybody, which is
                  a real claim about the world and is sometimes plainly false.
                </KeepInMind>
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
                <p>
                  The reason is worth stating plainly, because it is easy to read
                  the first measurement as a general claim about products. When
                  girth is nearly a fixed multiple of height, the product of the
                  two is nearly a multiple of height squared, and the squared
                  column is already in the expansion. The product has nothing of
                  its own left to say. So whether the cross terms are worth their
                  columns depends on the data rather than on the method, and the
                  quantity that decides it is how much the two columns already
                  agree.
                </p>
                <KeepInMind>
                  The products earn their place when the columns vary
                  independently and earn very little when they move together.
                  Measured here, the same column was worth a fifteenfold
                  reduction in the misses on one group of people and an eight
                  percent reduction on another.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                <p>
                  In that, p is how many measurements were taken and d is the
                  degree, and the one that is subtracted is the term where every
                  exponent is zero, which is the constant and belongs to the
                  fit&rsquo;s intercept rather than to any column. Each cell
                  below is a count read off an expansion that was actually built.
                </p>
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
                <p>
                  A count of columns turns into a hard limit as soon as it is put
                  beside a count of people. A fit sets one number per column plus
                  the intercept, and it cannot set more numbers than it has
                  people to set them from, so the growth table is also a table of
                  how many people each expansion demands.
                </p>
                <InAModel title="Three measurements on twenty-two people">
                  <p>
                    Suppose we had taken a third measurement from these people,
                    their age. At degree three the three measurements make 19
                    columns, which is 20 numbers and comfortably inside
                    twenty-two people. At degree four they make 34 columns, which
                    is 35 numbers, and twenty-two people cannot pin down 35
                    numbers. The fit is refused rather than answered, and one
                    step of the degree did it.
                  </p>
                </InAModel>
                <p>
                  This is the practical reason to keep the degree low that has
                  nothing to do with overfitting. Long before the fit becomes
                  untrustworthy it becomes impossible, and on a wide table it
                  becomes impossible at degree two, since ten measurements at
                  degree two already ask for 66 numbers and most tables of ten
                  measurements do not hold 66 rows to spare.
                </p>
                <KeepInMind>
                  Every column the expansion adds is one more number the fit has
                  to set, and there has to be at least one person per number.
                  With several measurements that ceiling is reached at a
                  surprisingly low degree.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Degree Stops Helping",
          content: (
            <>
              <SubSection title="11. The score on the fitted people can only improve">
                <p>
                  Suppose there are people enough. Then the degree is a dial that
                  turns freely, and turning it up always improves the fit we can
                  measure on the people we fitted, for a reason that has nothing
                  to do with the data. Every column the higher degree adds is a
                  new one, so the lower degree&rsquo;s answer is still available
                  to the higher one by setting the new weight to zero. Whatever
                  the fit finds is therefore at least that good.
                </p>
                <Equation>{"squared misses at degree d + 1  ≤  squared misses at degree d"}</Equation>
                <p>
                  So the score on the fitted people cannot fall as the degree
                  rises, whatever the shape of the data, and a number that only
                  ever improves cannot tell us when to stop.
                </p>
                <KeepInMind>
                  The training score is not evidence about the degree, since
                  the argument above shows it can only improve when the degree
                  rises, on any data at all.
                </KeepInMind>
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
                  <p>
                    At degree fourteen the fit has fifteen numbers to set and
                    fifteen people to set them from, so it passes through every
                    person it was shown, which is why its own score reads 0.9998.
                    Between them it swings far enough that the 131 centimetre
                    person, who weighs 27.6 kilograms, is answered −9,002.94, and
                    the 137 centimetre person, who weighs 29.1, is answered
                    −4,030.13. Both readings describe the same curve.
                  </p>
                </InAModel>
                <KeepInMind>
                  A rising degree does not gradually stop helping; past a point
                  it actively destroys the fit, and the only instrument that
                  shows it is a score on people the fit never saw.
                </KeepInMind>
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
                <p>
                  Nothing about that is a failure of arithmetic. A curve with
                  fifteen numbers to set and fifteen points to pass through has
                  exactly one way to do it, and the shape it takes between the
                  points is not constrained by anything at all. Runge&rsquo;s
                  1901 paper is about precisely that freedom, and it grows worse
                  towards the ends of the range rather than better.
                </p>
                <KeepInMind>
                  Passing through every measured point is not a virtue. Between
                  the points the fit is unconstrained, and the higher the degree
                  the further it can wander there while still reproducing
                  everything it was shown.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A penalty makes a high degree survivable">
                <p>
                  The wild swings come from very large weights, some strongly
                  positive and some strongly negative, cancelling almost exactly
                  at the people and not at all between them. So the repair is to
                  make large weights expensive, which is what a penalised fit
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
                <p>
                  A penalty of one thousandth takes degree fourteen from
                  −24,967.20 to 0.9631, which is a working model built out of a
                  fit that was ruinous a moment earlier. It does not quite reach
                  the 0.9762 that degree four managed without any penalty at all,
                  and the same penalty applied at degree four makes things
                  slightly worse rather than better, 0.9675 against 0.9762. So the
                  shrinkage is insurance. Where the degree was already sensible
                  it costs 0.0087 of the second score, and where it was not it
                  is worth about twenty-five thousand.
                </p>
                <KeepInMind>
                  A penalty and a high degree belong together. The degree
                  supplies the freedom to bend and the penalty stops that freedom
                  being spent on the gaps between the people, and neither of them
                  removes the need to measure on people the fit never saw.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Straight cuts need none of this">
                <p>
                  It would be dishonest to leave the impression that a curved
                  relationship demands an expansion. A fit made of straight cuts
                  on the raw height column can follow a bend too, by answering
                  one weight for everybody below some height, another for the
                  band above that, and so on, with no squared column anywhere. It approximates the
                  curve with steps rather than bending, and the question is which
                  of the two does better on these people.
                </p>
                <StepsAgainstACurve />
                <p>
                  On these twenty-two the expansion wins, and by a real margin.
                  Its best setting is degree four at 0.9762 on the held-back
                  seven, and the stepped fit&rsquo;s best is a depth of three at
                  0.9502. That is what a smooth relationship should look like,
                  since the steps pay for their flat tops on a curve that never
                  stops rising, and each step spends people on deciding where to
                  cut rather than on the shape.
                </p>
                <p>
                  The other column of the comparison goes the other way. The
                  worst the stepped fit does across its depths is 0.6438, at a
                  single cut, and the worst the expansion does across its degrees
                  is −24,967. Both methods have one dial and both can have it set
                  badly, and only one of them can be set badly enough to produce
                  an answer that is thousands of times worse than saying nothing.
                  The steps also need no decision about scale, which the last
                  Part measures, and they read a column that has not been touched
                  at all.
                </p>
                <KeepInMind>
                  On a smooth relationship the expanded fit is the better
                  instrument here, 0.9762 against 0.9502. What the stepped fit
                  has instead is a floor, since the worst of its five depths
                  still reads 0.6438 where the worst of the expansion&rsquo;s
                  fourteen degrees reads −24,967.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Expansion Stops Being Defined",
          content: (
            <>
              <SubSection title="16. The degree is a free choice, and nothing in the data makes it">
                <p>
                  Everything the method needs is supplied by the data except one
                  number, and that one number is the whole of it. The degree is
                  not estimated, not implied by the measurements, and not settled
                  by any quantity computed from them. It is chosen before the fit
                  and the fit then answers the question it was asked.
                </p>
                <p>
                  We could hope that the score on held-back people picks it out,
                  which is the best available procedure and is still not a
                  principle. That score is itself a measurement made on a handful
                  of people and carries their noise, so it can prefer one degree
                  to a neighbour for reasons that have nothing to do with either.
                  On this page&rsquo;s seven held-back people it reads 0.9785 at
                  degree ten, the highest reading anywhere in the sweep, and
                  0.3641 at degree eleven, and no property of the relationship
                  between height and weight changes between those two settings.
                </p>
                <InAModel title="What that reading is worth">
                  <p>
                    Degree ten scoring above degree four is a fact about these
                    seven people rather than about the relationship. The reading
                    to take from a
                    curve that jumps from 0.9785 to 0.3641 between neighbouring
                    settings is that the instrument is too coarse to separate the
                    settings, so the honest move is to take the lowest degree
                    whose reading is near the best and treat the rest as noise.
                  </p>
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
                  There is no principled degree, only a measured one, and the
                  measurement carries a spread of its own that is often larger
                  than the difference between the settings it is being asked to
                  choose between.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The expansion is blind to what a column means">
                <p>
                  The expansion builds every product up to the degree, and it has
                  no way of knowing what any of the columns are. Multiply a
                  height in centimetres by a girth in centimetres and the result
                  is an area, which is a quantity a person could reason about.
                  Multiply a height by a code that happens to say which of four
                  clinics a person attends, written as 1, 2, 3 and 4, and the
                  result is arithmetic that means nothing whatever. Both columns
                  are built, both are handed to the fit, and both get a weight.
                </p>
                <p>
                  The table gathers four such cases. Two of them are failures
                  of the mathematics rather than of taste, and they fail in
                  opposite ways, one loudly and one without a sound.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a column recorded as 0 or 1",
                      reason:
                        "its square is itself, since 0 × 0 is 0 and 1 × 1 is 1, so the expansion produces the identical column twice. The fit then has two columns saying the same thing and no unique set of weights, since anything added to one can be taken from the other. Probed on eight people with a column recording whether each swims, the squared column comes back equal to the original value by value and the fit has no answer.",
                    },
                    {
                      expression: "a column with a code standing for a category",
                      reason:
                        "the square and the products are perfectly well defined and mean nothing. Clinic 4 squared is 16 and clinic 2 squared is 4, so the expansion has decided that the gap between clinics 2 and 4 is four times the gap between clinics 1 and 2. Nothing refuses this, because nothing in the arithmetic can tell a code from a measurement.",
                    },
                    {
                      expression: "a column that runs both negative and positive",
                      reason:
                        "its square folds the two sides together, so −3 and 3 both become 9 and the squared column cannot tell them apart. That is exactly right for a quantity whose effect is symmetric about zero and exactly wrong for one whose sign matters, and the expansion has no way to know which it has.",
                    },
                    {
                      expression: "a column that never varies",
                      reason:
                        "every power of a constant is another constant, so each new column is a multiple of the fit’s own intercept and adds no direction at all. There is nothing for a weight to be, since the intercept can already produce whatever the constant column would have produced.",
                    },
                  ]}
                />
                <KeepInMind>
                  The expansion is a rule about arithmetic rather than about
                  meaning, and it will build a product of anything with anything.
                  A column that only takes two values announces itself, since the
                  duplicate it produces leaves the fit with no answer at all; a
                  column holding a category code does not, and fits perfectly
                  well while claiming that clinic 4 is twice as much of something
                  as clinic 2.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. A column carries its unit into every power">
                <p>
                  The last difficulty is the one that connects back to the
                  scaling pages, and it is much sharper here than it is there. A
                  height of 191 centimetres cubed is 6,967,871, while the height
                  itself is 191, so the two columns handed to the same fit differ
                  in size by a factor of 36,481. Write the same heights in metres
                  and the cube is 6.97 against 1.91, a factor of 3.6481. The
                  people did not change.
                </p>
                <PowersAndUnits />
                <p>
                  Plain least squares does not feel it, and the widget shows why
                  it is tempting to conclude there is no problem. A change of
                  unit multiplies a column by a constant, a coefficient can
                  divide by that same constant, and the fit lands in exactly the
                  same place, 0.984072 in both readings. The moment a penalty is
                  switched on it feels it severely, because the penalty is a
                  statement about the size of the coefficients and the
                  coefficients have just changed size by four orders of
                  magnitude. At a penalty of 100 the centimetre fit scores
                  0.977374 and the metre fit 0.703648, from the same people and
                  the same instruction.
                </p>
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
                <p>
                  The stepped fit from section 15 reads 0.990159 in centimetres
                  and 0.990159 in metres, identical to the last digit, because it
                  only ever asks which side of a threshold a value falls on and a
                  change of unit moves the value and the threshold together. That
                  is a second advantage of the stepped fit, alongside the floor
                  section 15 measured.
                </p>
                <KeepInMind>
                  Raising a column multiplies its unit as well as its value, so a
                  degree-three expansion of a column measured in the hundreds
                  hands the fit columns that differ in size by tens of thousands.
                  Put the columns on a common scale before expanding them, and
                  certainly before penalising the result.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Where the method runs out">
                <p>
                  The limits are worth gathering in one place. Each is a fact
                  about what the expansion and the fit behind it can mean rather
                  than a matter of taste, and they have the same shape as one
                  another, a quantity one of the two steps needs and the data
                  cannot supply.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "the degree itself",
                      reason:
                        "undetermined by anything measurable. It is chosen, and the best available procedure is to measure candidates on people held back, whose reading carries its own noise. Here that reading moves from 0.9785 to 0.3641 between neighbouring degrees.",
                    },
                    {
                      expression: "more columns than people",
                      reason:
                        "there are more numbers to set than equations to set them by, so infinitely many answers fit the people exactly and nothing picks between them. Three measurements at degree four make 34 columns, which is 35 numbers, against 22 people.",
                    },
                    {
                      expression: "exactly as many numbers as people",
                      reason:
                        "one answer, reached by passing through every person, so in exact arithmetic the misses are zero and say nothing about the fit. It is interpolation rather than estimation. On this page’s fifteen fitted people the score reads 0.9998 while the same curve answers −9,002.94 kilograms for a person who weighs 27.6.",
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
                        "defined and worthless. A polynomial has no limiting behaviour to appeal to, so beyond the last measurement it follows its highest power off to infinity in one direction or the other, and the degree decides which. The fit reports nothing to say it has left the range it was taught on.",
                    },
                    {
                      expression: "columns on wildly different scales",
                      reason:
                        "least squares is untouched, and any statement about the size of the coefficients is not, because the coefficients change size with the units. The same shrinkage instruction produced 0.977374 and 0.703648 on the same people written two ways.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying away. A column with only a
                  few distinct values quietly stops responding to the degree at
                  all, which looks like a flat curve rather than like an error,
                  and a fit at the interpolating degree reports 0.9998 for
                  reasons of counting, on the same run where it answers a small
                  child several thousand kilograms.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
