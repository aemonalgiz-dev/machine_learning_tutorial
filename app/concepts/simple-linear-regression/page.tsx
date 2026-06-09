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
import { LineFitPlayground } from "@/components/widgets/LineFitPlayground";
import { LossBowlPlayground } from "@/components/widgets/LossBowlPlayground";
import { SquaresChart } from "@/components/widgets/SquaresChart";

export const metadata: Metadata = {
  title: "Simple Linear Regression · oop_ml",
  description:
    "Fit a straight line to two columns, judge candidate lines by hand before the formula arrives, and see exactly what best fit does and does not claim.",
};

export default function SimpleLinearRegressionPage() {
  return (
    <ConceptPage
      title="Simple linear regression"
      tagline="Fit a straight line to model the relationship between two sets of data, and see what best fit really means."
      prerequisites={
        <>
          You only need to know what a straight line is. It has a slope that
          tilts it and an intercept that slides it up and down. The derivation at
          the end also leans on the{" "}
          <Link
            href="/primers/calculus"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            calculus primer
          </Link>
          , though everything before it stands on its own.
        </>
      }
      history={
        <>
          <p>
            Most interesting questions do not have exact answers. You cannot
            measure something once and be done with it, because measurements
            disagree with each other and with whatever produced them, and that is
            where statistical and probabilistic tools come into play.
          </p>
          <p>
            The people who first met that as a calculation were astronomers.
            Adrien-Marie Legendre published the method in 1805, in an appendix
            to a Paris memoir on finding the orbits of comets, and the
            difficulty he stated was that he had more observations than
            unknowns, every observation carried its own error, and no orbit
            satisfied all of them at once. His proposal was to take the orbit
            that made the sum of the squared errors smallest, and part of his
            reason was that the answer then came out of a set of linear
            equations he could actually solve. Carl Friedrich Gauss published
            the same rule in 1809 in his Theoria Motus and said he had been
            using it since 1795, which began a priority dispute that was never
            really settled, though what Gauss added was an argument about why
            squares rather than anything else. If the errors follow the bell
            curve, the least squares line is the most probable line, and that
            is the reasoning the derivation at the end of this page leans on.
          </p>
          <p>
            The word regression, and the height example this page uses, come
            from somewhere else entirely. Francis Galton collected the heights
            of over nine hundred adult children and their parents from
            families who answered his appeal for family records in 1884, and
            in 1886 he published &ldquo;Regression towards mediocrity in
            hereditary stature&rdquo;. Tall parents had tall children who were
            nonetheless less tall than they were, short parents the reverse,
            so the children&rsquo;s heights went partway back towards the mean,
            and that going back is what he meant by regression. His line was
            drawn from a table by eye, and it was George Udny Yule, in 1897,
            who showed that Galton&rsquo;s regression line was Legendre&rsquo;s
            least squares line, which is how the name attached itself to the
            method. Suppose you believe two features, such as height and
            weight, are related, and you have a scatter of measurements of
            thousands of people. How would you show that they&rsquo;re related?
            There will be no line through all of them, because height does not
            fully explain weight nor the other way around, so you stop asking
            for a line through the points and ask instead for the line whose
            misses are smallest in total. You could search for it by brute
            force, though with the calculus we can use derivatives to find the
            minimum of something, so we need a function to minimize against.
            There are many choices, and the one that follows Legendre is the
            sum of the squared misses, which turns a whole line into a single
            score that can be compared against another line&rsquo;s.
          </p>
        </>
      }
      playground={<LineFitPlayground />}
      sections={[
        {
          title: "Part 1. What Problem Regression Solves",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Paired observations">
                <p>
                  Five people, each measured twice. Everything on this page is
                  built from them.
                </p>
                <Equation>{"height (cm):  160   165   170   175   180\nweight (kg):   58    66    68    74    74"}</Equation>
                <p>
                  Each person contributes one input and one observed outcome, and
                  together they make one point on the plot above. The input is
                  written x and the outcome y, so person one is the pair
                  (160, 58).
                </p>
                <p>
                  Which measurement plays which role is a decision rather than a
                  property of the data. Here height predicts weight. Swapping
                  them, predicting height from weight, is a different problem with
                  a different answer, even though the scatter of dots looks
                  exactly the same either way. The picture is symmetric and the
                  question is not.
                </p>
              </SubSection>

              <SubSection title="2. A line as a prediction rule">
                <p>
                  A line on this plot is a rule for guessing. Pick a height along
                  the bottom, go straight up until you meet the line, and read
                  across to the weight it predicts. Do that for 165 and the line
                  answers; do it for 172 and it answers just as readily, even
                  though nobody in the data is 172 tall.
                </p>
                <p>
                  Written down, that rule is
                </p>
                <Equation>{"ŷ = βx + α"}</Equation>
                <NumberTable
                  headings={["symbol", "what it is"]}
                  rows={[
                    ["x", "the input, a height"],
                    ["ŷ", "the predicted outcome, said y-hat"],
                    ["β", "the slope"],
                    ["α", "the intercept"],
                  ]}
                />
                <p>
                  The hat on ŷ is doing real work. It separates what the line
                  predicts from what was actually measured, which is written
                  plain as y, and the gap between those two is the whole subject
                  of Part 2.
                </p>
              </SubSection>

              <SubSection title="3. Slope and intercept">
                <p>
                  Two numbers position a line, and they do different jobs.
                </p>
                <p>
                  The slope says how much the prediction changes for each unit of
                  input. A slope of 0.8 means one more centimetre of height
                  raises the predicted weight by 0.8 kg. Its units are the
                  outcome&rsquo;s over the input&rsquo;s, kilograms per
                  centimetre, which is worth remembering because it makes the
                  number readable.
                </p>
                <p>
                  The intercept says where the line sits when the input is zero,
                  and its job is mostly to slide the line up and down until it
                  runs through the data. Change the slope in the box above and the
                  line pivots. Change the intercept and it shifts without tilting.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Measuring the Errors of a Candidate Line",
          content: (
            <>
              <SubSection title="4. One prediction and its residual">
                <p>
                  Take the shortest person, 160 cm and 58 kg, and a line that
                  predicts 60 kg for them. It is 2 kg too high, and that miss has
                  a name.
                </p>
                <Equation>{"residual = measured − predicted\ne = y − ŷ = 58 − 60 = −2"}</Equation>
                <p>
                  The sign says which way the line missed. A positive residual
                  means the point sits above the line and the prediction was too
                  low. A negative residual means the point sits below and the
                  prediction was too high. Zero means the line went through the
                  point.
                </p>
                <KeepInMind>
                  <p>
                    A residual is measured <em>vertically</em>, not
                    perpendicular to the line. The grey stalks in the box above
                    run straight up and down for that reason.
                  </p>
                  <p>
                    It matters because the two are different quantities and would
                    pick different lines. Ordinary least squares is asking how
                    wrong the prediction of y was, and a prediction of y is only
                    ever wrong in the y direction. The horizontal distance to the
                    line is not an error the model made.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Residuals across the dataset">
                <p>
                  One residual per person, so a line produces five of them here.
                  For the line that predicts 60, 64, 68, 72 and 76,
                </p>
                <NumberTable
                  headings={["height", "measured weight", "predicted", "residual"]}
                  rows={[
                    ["160", "58", "60", "−2"],
                    ["165", "66", "64", "+2"],
                    ["170", "68", "68", "0"],
                    ["175", "74", "72", "+2"],
                    ["180", "74", "76", "−2"],
                  ]}
                />
                <p>
                  Each row is one grey stalk on the plot. The middle person sits
                  exactly on the line and has no stalk at all.
                </p>
              </SubSection>

              <SubSection title="6. Why errors cannot simply be added">
                <p>
                  The obvious way to score a whole line is to add up its
                  residuals, and it does not work.
                </p>
                <Equation>{"(−2) + (+2) + 0 + (+2) + (−2) = 0"}</Equation>
                <p>
                  A total of zero, from a line that is wrong about four of the
                  five people. A line that predicted every weight exactly would
                  also total zero, and no summary that cannot tell those two
                  apart is worth having.
                </p>
                <p>
                  The problem is the signs. Missing by 2 above and 2 below is
                  reported as not missing at all, so what is needed is a way of
                  counting a miss as a miss regardless of direction.
                </p>
              </SubSection>

              <SubSection title="7. Squared error and RSS">
                <p>
                  Squaring each residual does that. A negative squared is
                  positive, so nothing cancels, and it has a second effect worth
                  seeing clearly.
                </p>
                <NumberTable
                  headings={["residual", "squared"]}
                  rows={[
                    ["1", "1"],
                    ["2", "4"],
                    ["4", "16"],
                  ]}
                />
                <p>
                  Doubling a miss quadruples its contribution. One residual of 4
                  costs 16, the same as four separate residuals of 2, so squaring
                  says a line would rather be a little wrong about many people
                  than very wrong about one.
                </p>
                <p>
                  Add the squares and a whole line collapses to one number, the
                  residual sum of squares.
                </p>
                <Equation>{"RSS = Σ (yᵢ − ŷᵢ)²"}</Equation>
                <p>
                  The box below draws it. Each square has a residual for its
                  side, so its area is that residual squared, and RSS is the
                  total shaded area.
                </p>
                <SquaresChart />
                <KeepInMind>
                  <p>
                    RSS is a total, not an average, and its units are the square
                    of the outcome&rsquo;s. An RSS of 16 on these five people is
                    16 squared kilograms, and it is not an answer to &ldquo;how
                    far off was the line, typically&rdquo;.
                  </p>
                  <p>
                    It is only meaningful in comparison. Lower is better between
                    two lines judged on the same observations, and it says
                    nothing on its own, since adding more people raises it
                    whether or not the line got worse.
                  </p>
                  <p>
                    Squaring is also a choice rather than a definition of error.
                    Other loss functions treat a large miss differently, and the
                    loss functions page takes that up.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What Best-Fitting Means",
          content: (
            <>
              <SubSection title="8. Comparing candidate lines">
                <p>
                  With RSS in hand, any two lines can be ranked without an
                  opinion entering into it. Drag the slope and intercept in the
                  box at the top and watch the number move.
                </p>
                <p>
                  It is worth doing deliberately for a moment. Tilt the line too
                  steeply and RSS climbs. Slide it too high and it climbs. Nudge
                  it back and it falls again, and somewhere in between there is a
                  setting you cannot improve on by moving either control.
                </p>
                <p>
                  Best-fitting means exactly that and nothing more. The line
                  whose RSS is the lowest of all lines.
                </p>
              </SubSection>

              <SubSection title="9. The error surface">
                <p>
                  There are two controls, so the score depends on two numbers at
                  once. Plot RSS against both and the result is a surface, a
                  landscape whose height at any point is how badly that slope and
                  intercept fit.
                </p>
                <LossBowlPlayground />
                <p>
                  The surface is a bowl. Every direction away from its floor
                  costs more error, the floor is a single place rather than a
                  ridge, and the best-fitting line is whatever slope and intercept
                  sit at the bottom of it.
                </p>
                <p>
                  Which turns the search into a question calculus already knows
                  how to answer, and Part 6 answers it.
                </p>
              </SubSection>

              <SubSection title="10. The least-squares solution">
                <p>
                  Here is the answer ahead of its derivation, because it is worth
                  being able to read before it is worth being able to prove.
                </p>
                <Equation>{"β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²\n\nα = ȳ − β·x̄"}</Equation>
                <p>
                  The bars mean averages, so x̄ is the mean height. Read the slope
                  in three pieces. The top asks whether people above average in
                  height tend also to be above average in weight, since it
                  multiplies the two deviations together for each person and adds.
                  The bottom asks how much height varies on its own. Their ratio
                  is how much of the joint movement to credit to each centimetre.
                </p>
                <p>
                  The intercept is then whatever value puts the line through the
                  point (x̄, ȳ), the centre of the data, which every
                  least-squares line passes through.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Fitting the Five People by Hand",
          content: (
            <>
              <SubSection title="11. One table, one calculation">
                <p>
                  The whole fit is one table and two divisions. Means first, then
                  deviations, then the two columns that get summed.
                </p>
                <WorkedExample>
                  <Equation>{"x̄ = 850 / 5 = 170        ȳ = 340 / 5 = 68"}</Equation>
                  <NumberTable
                    headings={["x", "y", "x − x̄", "y − ȳ", "product", "(x − x̄)²"]}
                    rows={[
                      ["160", "58", "−10", "−10", "100", "100"],
                      ["165", "66", "−5", "−2", "10", "25"],
                      ["170", "68", "0", "0", "0", "0"],
                      ["175", "74", "5", "6", "30", "25"],
                      ["180", "74", "10", "6", "60", "100"],
                    ]}
                    caption="Sum the last two columns: 200 and 250."
                  />
                  <Equation>{"β = 200 / 250 = 0.8\nα = 68 − 0.8 × 170 = 68 − 136 = −68"}</Equation>
                  <p>So the best-fitting line for these five people is</p>
                  <Equation>{"ŷ = 0.8x − 68"}</Equation>
                </WorkedExample>
              </SubSection>

              <SubSection title="12. Reading the fitted slope and intercept">
                <p>
                  The slope is 0.8 kilograms per centimetre. Within the range
                  these people cover, from 160 to 180 cm, one extra centimetre of
                  height goes with 0.8 kg more predicted weight.
                </p>
                <p>
                  &ldquo;Goes with&rdquo; is deliberate. The line says these two
                  measurements move together in this data, and it says nothing
                  about what would happen to somebody&rsquo;s weight if their
                  height changed.
                </p>
                <p>
                  The intercept is −68 kg, which is the predicted weight of a
                  person zero centimetres tall. That is not a claim about
                  anything. Zero is far outside the range of anybody measured, and
                  the intercept&rsquo;s job here is to position the line rather
                  than to mean something on its own.
                </p>
              </SubSection>

              <SubSection title="13. Predictions, residuals, and RSS">
                <p>
                  Run every height through the fitted line and the rest follows.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["height", "prediction", "measured", "residual", "squared"]}
                    rows={[
                      ["160", "0.8×160 − 68 = 60", "58", "−2", "4"],
                      ["165", "0.8×165 − 68 = 64", "66", "+2", "4"],
                      ["170", "0.8×170 − 68 = 68", "68", "0", "0"],
                      ["175", "0.8×175 − 68 = 72", "74", "+2", "4"],
                      ["180", "0.8×180 − 68 = 76", "74", "−2", "4"],
                    ]}
                    caption="RSS = 4 + 4 + 0 + 4 + 4 = 16."
                  />
                  <p>
                    The residuals also sum to zero, which is the observation
                    section 6 warned not to trust as a score, and is nonetheless
                    true of every fit here.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    That the residuals sum to zero is a consequence of how this
                    line was fitted, not a general property of good models. It
                    follows from fitting an intercept by least squares, and the
                    derivation in Part 6 shows exactly where it comes from, since
                    the intercept equation <em>is</em> the statement that they
                    sum to zero.
                  </p>
                  <p>
                    Fit without an intercept, or by a different loss, and the
                    residuals generally will not.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Measuring Whether the Best Line Is Useful",
          content: (
            <>
              <SubSection title="14. Best line versus useful line">
                <p>
                  Every dataset has a least-squares line. A cloud of points with
                  no pattern in it has one, and the arithmetic produces it just as
                  confidently as it produced ours.
                </p>
                <p>
                  So &ldquo;this is the best line&rdquo; and &ldquo;this line is
                  worth using&rdquo; are separate claims, and RSS answers only the
                  first. Press the no-pattern button in the box at the top and the
                  fit still arrives. What is missing there is not optimisation, it
                  is a relationship to find.
                </p>
                <p>
                  Answering the second claim needs something to compare against.
                </p>
              </SubSection>

              <SubSection title="15. The mean-only baseline">
                <p>
                  The simplest possible model ignores height entirely and guesses
                  the same weight for everybody. If it has to be one number, the
                  mean weight of 68 kg is the best single number available, since
                  the mean is precisely the constant with the smallest squared
                  error.
                </p>
                <p>
                  Drawn on the plot that is a flat horizontal line at 68. It uses
                  none of the information in the input, so any line worth fitting
                  ought to beat it.
                </p>
              </SubSection>

              <SubSection title="16. Measuring variation with TSS">
                <p>
                  Score that baseline the same way any line is scored, by the sum
                  of its squared misses.
                </p>
                <WorkedExample>
                  <Equation>{"weight − mean:   −10    −2     0     6     6\nsquared:         100     4     0    36    36\n\nTSS = 176"}</Equation>
                </WorkedExample>
                <p>
                  That total has its own name, the total sum of squares, and two
                  readings. It is the squared error of the mean-only baseline, and
                  it is a measure of how much the weights vary at all. Both
                  readings are the same number, which is what makes it the right
                  thing to compare against, since it is how much variation was
                  there for a line to account for.
                </p>
              </SubSection>

              <SubSection title="17. Comparing the line with R²">
                <p>
                  Now the two numbers sit side by side. The baseline scored 176
                  and the fitted line scored 16, so the line removed 160 of the
                  176.
                </p>
                <Equation>{"R² = 1 − RSS / TSS\n   = 1 − 16 / 176\n   = 1 − 0.0909\n   = 0.909"}</Equation>
                <p>
                  Read the ratio in two steps. RSS over TSS is the fraction of the
                  baseline&rsquo;s error still left after fitting, about 9%. One
                  minus that is the fraction the line accounted for, about 91%.
                </p>
              </SubSection>

              <SubSection title="18. What R² does and does not say">
                <p>
                  Stated carefully, the number says this. The fitted linear
                  relationship with height accounts for about 91% of the variation
                  in weight among these five measurements.
                </p>
                <p>
                  Three things it does not say, and each is a mistake worth not
                  making. It does not say height causes weight, since the same
                  0.909 would appear if a third thing drove both. It does not
                  promise accuracy outside the range of 160 to 180 cm, where no
                  measurement has tested whether the relationship continues. And
                  it does not say a line was the right shape to fit, only that
                  this line beat the flat one.
                </p>
                <KeepInMind>
                  <p>
                    R² computed this way, on the same rows the line was fitted to
                    and with an intercept, cannot fall below zero. The
                    least-squares line can always match the flat baseline by
                    setting its slope to zero, so it never does worse.
                  </p>
                  <p>
                    The same formula applied to rows the model has never seen can
                    go negative, and that is a real result rather than an error.
                    It means the model predicted those rows worse than simply
                    guessing the average would have.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Deriving the Least-Squares Line",
          content: (
            <>
              <SubSection title="19. Deriving the intercept">
                <p>
                  Part 3 turned the search into finding the bottom of a bowl, and
                  the bottom of a bowl is where the surface is flat in every
                  direction. There are two directions here, one per control, so
                  there are two derivatives to set to zero.
                </p>
                <p>Written with both controls visible, the score is</p>
                <Equation>{"RSS(α, β) = Σ (yᵢ − βxᵢ − α)²"}</Equation>
                <p>Differentiate with respect to the intercept first.</p>
                <DerivationTable
                  rows={[
                    {
                      expression: "∂RSS/∂α = Σ 2(yᵢ − βxᵢ − α)·(−1)",
                      reason: "Chain rule, one term at a time",
                    },
                    {
                      expression: "        = −2 Σ (yᵢ − βxᵢ − α)",
                      reason: "Pull the constants out of the sum",
                    },
                    {
                      expression: "Σ (yᵢ − βxᵢ − α) = 0",
                      reason: "Set it to zero, and divide by −2",
                    },
                    {
                      expression: "Σyᵢ − β Σxᵢ − n·α = 0",
                      reason: "Split the sum, α added n times",
                    },
                    {
                      expression: "α = ȳ − β·x̄",
                      reason: "Divide through by n, giving the means",
                    },
                  ]}
                />
                <p>
                  The third line is worth a second look, because it says the
                  residuals add to zero. That was not imposed on the model; it
                  fell out of asking for the flattest point in the intercept
                  direction, which is why section 13 could rely on it.
                </p>
              </SubSection>

              <SubSection title="20. Deriving the slope">
                <p>Now the other direction.</p>
                <DerivationTable
                  rows={[
                    {
                      expression: "∂RSS/∂β = Σ 2(yᵢ − βxᵢ − α)·(−xᵢ)",
                      reason: "Chain rule again, and β multiplies xᵢ",
                    },
                    {
                      expression: "Σ xᵢ(yᵢ − βxᵢ − α) = 0",
                      reason: "Set to zero and divide by −2",
                    },
                    {
                      expression: "Σ xᵢ(yᵢ − βxᵢ − ȳ + β·x̄) = 0",
                      reason: "Substitute the α just derived",
                    },
                    {
                      expression: "Σ xᵢ(yᵢ − ȳ) = β Σ xᵢ(xᵢ − x̄)",
                      reason: "Gather the β terms on one side",
                    },
                    {
                      expression: "β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²",
                      reason: "Centre both sums, which subtracts zero from each",
                    },
                  ]}
                />
                <WhyThisWorks title="Why the last step subtracts nothing">
                  <p>
                    Going from xᵢ to (xᵢ − x̄) in both sums looks like it changed
                    them, and it did not. What was subtracted from the top is
                  </p>
                  <Equation>{"Σ x̄(yᵢ − ȳ) = x̄ · Σ(yᵢ − ȳ) = x̄ · 0 = 0"}</Equation>
                  <p>
                    since the deviations of any column sum to zero, and the same
                    argument empties the term taken from the bottom. Both sums are
                    unchanged, and the centred form is the one that reads as a
                    comparison of joint movement against the input&rsquo;s own.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="21. Why the solution is a minimum">
                <p>
                  Setting derivatives to zero finds a flat place, and flat places
                  include the tops of hills. One more argument is needed to know
                  which this is.
                </p>
                <p>
                  RSS is a sum of squares of expressions that are straight lines
                  in α and β. Squaring a straight line gives an upward-curving
                  parabola, and adding upward-curving things gives something
                  upward-curving, so the surface is a bowl everywhere rather than
                  only near the answer. A bowl has no hilltops, so the one flat
                  place is the lowest one.
                </p>
                <p>
                  The bowl is genuinely bowl-shaped rather than a trough only when
                  the heights actually vary, which is the condition Part 7 is
                  about. The surface in the box above is the picture of this
                  argument.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. When a Unique Line Cannot Be Identified",
          content: (
            <SubSection title="22. Every input the same">
              <p>
                Suppose all five people are exactly 170 cm tall, with the weights
                unchanged. Every height deviation is then zero.
              </p>
              <Equation>{"xᵢ − x̄ = 0  for every person\nΣ(xᵢ − x̄)² = 0"}</Equation>
              <p>
                The slope formula divides by that, so it has no answer. It is
                worth being precise about what has actually failed, because
                &ldquo;there is no line&rdquo; is not quite right.
              </p>
              <p>
                A prediction at 170 cm is still perfectly available, and it is the
                mean weight of 68 kg, which is the best constant guess as always.
                What cannot be determined is how the prediction should
                <em> change</em> as height changes, because height never changed.
                Infinitely many slope and intercept pairs pass through (170, 68),
                every one of them fits the data equally well, and nothing in the
                data prefers any of them.
              </p>
              <InAModel>
                <p>
                  This generalises past the extreme case. A model cannot estimate
                  the effect of something that does not vary in its data, and a
                  column that barely varies gives a slope that is technically
                  computable and almost entirely noise.
                </p>
                <p>
                  It is also why the library refuses a constant column outright
                  rather than returning a number nobody should use.
                </p>
              </InAModel>
            </SubSection>
          ),
        },
        {
          title: "Part 8. Boundaries of the Model",
          content: (
            <>
              <SubSection title="23. Outliers and squared error">
                <p>
                  Drag one dot in the box at the top well away from the others and
                  watch the line lean toward it. That pull is the squaring from
                  section 7 doing exactly what it was chosen to do, since a
                  residual of 10 contributes a hundred where a residual of 2
                  contributes four.
                </p>
                <p>
                  Whether that is the right behaviour depends on what the unusual
                  point is, and the data cannot say. It might be a genuine rare
                  observation the model should accommodate, a measurement or entry
                  error, someone from a different population than the rest, or a
                  sign that a variable nobody recorded is doing the work.
                </p>
                <p>
                  Those call for different responses, and only the second is a
                  case for removing the point. Deleting whatever sits far from the
                  line is a way of guaranteeing a model that fits, which is not
                  the same as one that is right.
                </p>
              </SubSection>

              <SubSection title="24. Extrapolation">
                <p>
                  The people measured here run from 160 to 180 cm. A prediction
                  inside that range interpolates, and the data has something to
                  say about it. A prediction well outside it extrapolates, and the
                  data has not been asked.
                </p>
                <p>
                  The line does not know the difference. It continues in both
                  directions forever, which is how it produced an intercept of
                  −68 kg at a height of zero, and that number is what the
                  arithmetic says rather than what anyone should believe.
                </p>
                <p>
                  So the strange intercept is not an oddity to explain away. It is
                  the clearest available demonstration of what a fitted line does
                  outside the range that produced it.
                </p>
              </SubSection>

              <SubSection title="25. Association, causation, and generalization">
                <p>
                  Two last boundaries, both about what the fit is evidence for.
                </p>
                <p>
                  A regression quantifies an association. Height and weight move
                  together in this data and the slope says by how much, and none
                  of that establishes that one produces the other. Other things
                  affect both, and the model has no way to distinguish a direct
                  influence from a shared cause. The slope is not a prediction
                  about what would happen if somebody grew taller.
                </p>
                <p>
                  And the R² of 0.909 describes how well the line fits the five
                  people used to build it. That is not the same question as how
                  well it predicts a sixth person, and a model can score well on
                  the first while doing poorly on the second.
                </p>
                <InAModel>
                  <p>
                    Separating those two questions properly means holding data
                    back, fitting on part of it and scoring on the part the model
                    never saw. That is what the held-out evaluation page does, and
                    every score after it is the second kind rather than the first.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
