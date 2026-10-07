import { lessonIntuitions } from "@/lib/intuition";
import { GuidedIntuition, IntuitionConnection } from "@/components/concept/GuidedIntuition";
import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerPractice,
  PrimerQuiz,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { exercise, numberCheck } from "@/lib/exercises";
import { choice, several, trueFalse } from "@/lib/quizzes";
import {
  DerivationTable,
  InAModel,
  KeepInMind,
  NumberTable,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { DerivativeExplorer } from "@/components/widgets/DerivativeExplorer";
import { SlopePlayground } from "@/components/widgets/SlopePlayground";
import { GradientDescentPlayground } from "@/components/widgets/GradientDescentPlayground";

export const metadata: Metadata = {
  title: "Calculus Primer · oop_ml",
  description:
    "Build derivatives from changes you can measure, then use them to guide small improvements.",
};

export default function CalculusPrimerPage() {
  return (
    <PrimerPage
      technicalStart="7. Deriving the Slope Function"
      title="Calculus Primer"
      tagline="Build derivatives from changes you can measure, then use them to guide small improvements."
      prerequisites={
        <>
          You only need to know what a function and its graph are, a rule that
          turns an input into an output, drawn as a curve. Everything about
          rates, slopes and steps is built up from here.
        </>
      }
    >
      <PrimerSection title="Which Way Makes the Error Smaller?">
{lessonIntuitions["calculus"].opening.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
<GuidedIntuition lesson={lessonIntuitions["calculus"]} />
<IntuitionConnection lesson={lessonIntuitions["calculus"]} />
</PrimerSection>

      <PrimerSection title="1. Change Between Two Points">

        <p>
          Everything here rests on comparing two changes. An output changes as an
          input changes, and the question is always how much of the one you get
          for the other. On a straight line that comparison has a name, the
          slope, and you compute it from any two points by dividing the rise, how
          far up the line went between them, by the run, how far across.
        </p>
        <Equation>{"slope = rise / run"}</Equation>
        <WorkedExample>
          <p>
            Take a line through the points (2, 3) and (6, 11). Between them it
            ran 4 across, from 2 to 6, and rose 8, from 3 to 11.
          </p>
          <Equation>{"run   = 6 − 2 = 4\nrise  = 11 − 3 = 8\nslope = 8 / 4 = 2"}</Equation>
          <p>Two units upward for every one unit across.</p>
        </WorkedExample>
        <p>
          Written with the points as (x₁, y₁) and (x₂, y₂), that is the whole
          formula.
        </p>
        <Equation>{"slope = (y₂ − y₁) / (x₂ − x₁)"}</Equation>
        <p>
          The sign carries meaning of its own. Had the line dropped between the
          two points the rise would come out negative, and so would the slope, so
          a downhill line has a negative slope. A flat line has a slope of zero,
          because it rises by nothing however far it runs. Those three cases,
          positive, negative and zero, are the whole vocabulary, and every later
          section reuses them.
        </p>
        <p>
          Rise over run can be dragged. The two points below start at the worked
          pair, and the triangle between them remeasures as either moves.
        </p>
        <PrimerPlayground>
          <SlopePlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="2. Slope as a Rate">
        <p>
          Now the reframing that turns a fact about a drawing into something
          worth having. A slope is not only a tilt. When the two axes carry
          units, rise over run carries units too, and the slope becomes a rate.
        </p>
        <WorkedExample>
          <p>
            Let the horizontal axis be time in hours and the vertical axis be
            distance in miles. Drive 100 miles in 2 hours, and the line from
            start to finish has a slope of
          </p>
          <Equation>{"100 miles / 2 hours = 50 miles per hour"}</Equation>
          <p>
            Rise over run is miles over hours, so the slope <em>is</em> the
            speed.
          </p>
        </WorkedExample>
        <p>
          Notice what kind of number that is. It is an average across the whole
          trip. At no single moment did the speedometer have to read 50, since
          you may have been stopped at a light for part of it and doing 70 for
          the rest. An average across a stretch and a reading at an instant are
          different quantities, and closing the gap between them is the entire
          subject of the next three sections.
        </p>
      </PrimerSection>

      <PrimerSection title="3. Measuring a Curve Across an Interval">
        <p>
          A straight line has one slope everywhere, which is what made it easy. A
          curve does not. It might fall steeply in one place, flatten out, and
          climb somewhere else, so no single number describes its steepness. What
          we can still do is exactly what we did with the drive, pick two points
          and measure the average between them.
        </p>
        <p>
          The straight line drawn through two points of a curve is called a
          secant, and its slope is the average rate of change of the curve across
          that stretch. Let us make that concrete on the curve in the box below.
        </p>
        <Equation>{"f(x) = 0.5·x² − x + 2.5"}</Equation>
        <p>
          where f(x) is just the name for the curve&rsquo;s height at input x.
        </p>
        <WorkedExample>
          <p>Take the two points where x is 3 and x is 5. The heights there are</p>
          <Equation>{"f(3) = 0.5·9  − 3 + 2.5 = 4\nf(5) = 0.5·25 − 5 + 2.5 = 10"}</Equation>
          <p>
            so between them the curve rose from 4 to 10, a rise of 6, over a run
            of 2.
          </p>
          <Equation>{"average slope = (10 − 4) / (5 − 3) = 3"}</Equation>
        </WorkedExample>
        <p>
          That is what the box below shows on load. The base point starts at
          x = 3, the gap is 2, and the solid line through the two points has
          slope 3.00, exactly the number we just computed by hand. The dashed
          line and the second readout will be explained shortly. For now, drag
          the base point around and watch the average slope change as the stretch
          of curve under it changes.
        </p>
        <PrimerPlayground>
          <DerivativeExplorer />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="4. Shrinking the Interval">
        <p>
          An average across a stretch is still not what we set out to find. We
          wanted the steepness of the curve at a single point, the speedometer
          reading rather than the trip average. And a single point, on its own,
          gives us nothing to divide, since one point has no rise and no run. It
          looks like a dead end.
        </p>
        <p>
          Here is the move everything else is built on. If the average across a
          stretch is the wrong answer because the stretch is too wide, then
          shrink the stretch. Keep the base point at x = 3 and pull the second
          point closer, computing the same rise over run every time. Each average
          is taken across a shorter piece of curve, so each is a better stand-in
          for the steepness right at the base.
        </p>
        <WorkedExample title="Worked example, one smaller gap">
          <p>Move the second point from x = 5 in to x = 4, a gap of 1.</p>
          <Equation>{"f(4) = 0.5·16 − 4 + 2.5 = 6.5\naverage slope = (6.5 − 4) / (4 − 3) = 2.5 / 1 = 2.5"}</Equation>
          <p>
            The average fell from 3 to 2.5. The stretch from 3 to 5 climbed
            steeply at its far end, and pulling the second point in to 4 left
            the steepest part of it out of the measurement. Continue inward and
            the averages keep falling, which is the whole of the idea.
          </p>
        </WorkedExample>
        <p>
          Working every row the same way gives this, and every one of them is a
          position of the gap slider in the box above.
        </p>
        <NumberTable
          headings={["gap", "second point", "average slope"]}
          rows={[
            ["2.00", "x = 5.00", "3.00"],
            ["1.00", "x = 4.00", "2.50"],
            ["0.50", "x = 3.50", "2.25"],
            ["0.10", "x = 3.10", "2.05"],
            ["0.02", "x = 3.02", "2.01"],
          ]}
          caption="Slide the gap down from 2.00 and the average-slope readout walks through these exact numbers."
        />
        <p>
          The averages are not wandering. They are settling, and the smaller the
          gap the closer they settle. 3, then 2.5, then 2.25, then 2.05, then
          2.01. Nothing here yet says what they settle <em>on</em>, or gives that
          value a name. What the table shows is only that they are heading
          somewhere, and that where they are heading does not depend on how we
          got there.
        </p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 1 to 4"
        questions={[
          trueFalse(
            "A trip of 100 miles in 2 hours has a slope of 50 miles per hour, so the speedometer must have read 50 at some point along the way.",
            false,
            "That slope is an average across the whole trip, and an average across a stretch is a different quantity from a reading at an instant. At no single moment did the speedometer have to read 50, since you may have been stopped at a light for part of it and doing 70 for the rest.",
          ),
          choice(
            "On the curve f(x) = 0.5·x² − x + 2.5 the heights at x = 3 and x = 5 are 4 and 10. What does the straight line through those two points measure?",
            [
              "The average rate of change of the curve between x = 3 and x = 5",
              "The steepness of the curve exactly at x = 3",
              "The steepness of the curve exactly at x = 5",
              "The height of the curve halfway between the two points",
            ],
            0,
            "A line drawn through two points of a curve is called a secant, and its slope is the average rate of change across that stretch, which comes to 3 here. Steepness at a single point is what the following sections have to build, because one point on its own has no rise and no run.",
          ),
          choice(
            "Pulling the second point from x = 5 in to x = 4 drops the average slope from 3 to 2.5. Why does it fall?",
            [
              "The stretch from 3 to 5 climbed steeply at its far end, and pulling the second point in leaves the steepest part out of the measurement",
              "The curve is falling between x = 4 and x = 5",
              "The run shrank while the rise stayed where it was",
              "A shorter stretch always gives a smaller average slope, whatever the curve",
            ],
            0,
            "Where the steep part of this curve sits is what decides the direction. Section 4 says the far end of the stretch from 3 to 5 is the steep part, so leaving it out lowers the average, and continuing inward keeps the averages falling.",
          ),
          several(
            "What does the table of shrinking gaps actually establish?",
            [
              "The averages are settling rather than wandering",
              "The smaller the gap, the closer they settle",
              "Where they are heading does not depend on how we got there",
              "The value they settle on is named in that section",
            ],
            [0, 1, 2],
            "The table shows three things and deliberately withholds a fourth. It says the averages are settling, that a smaller gap settles them closer, and that the destination does not depend on the route. What it does not say is what they settle on or what that value is called, which is the next section’s job.",
          ),
          choice(
            "A line passes through (2, 3) and (6, 11). What is its slope?",
            [
              "2, because it rose 8 while running 4",
              "0.5, because it ran 4 while rising 8",
              "8, the rise between the two points",
              "4, the run between the two points",
            ],
            0,
            "Slope is rise over run. Between the two points the line ran 4 across, from 2 to 6, and rose 8, from 3 to 11, so the slope is 8 over 4, two units upward for every one unit across. Dividing the other way round answers how far across the line goes per unit of rise, which is a different question, and the rise and the run on their own are lengths rather than a comparison of the two.",
          ),
        ]}
      />

      <PrimerSection title="5. The Derivative">
        <p>
          The value those averages close in on, 2 here, is the instantaneous rate
          of change of the curve at x = 3. That is what a derivative is, and it
          is worth saying plainly that you have already computed one. The name
          arrives after the idea rather than before it.
        </p>
        <p>
          Writing the gap as h, the definition says to take the average slope
          across a gap of h and ask what value it approaches as h shrinks toward
          zero.
        </p>
        <Equation>{"(f(x + h) − f(x)) / h,   as h approaches 0"}</Equation>
        <p>
          Written the conventional way, with a prime mark for the derivative and
          lim for the approaching, that is
        </p>
        <Equation>{"f'(x) = lim(h → 0)  (f(x + h) − f(x)) / h"}</Equation>
        <p>
          The picture of the same process is the two lines in the box above.
          While the second point slides in, the solid secant rotates, and it
          settles onto the dashed line, the tangent, the one straight line that
          grazes the curve at the base point and runs alongside it there. The
          secant measures an average and the tangent is what the averages become,
          so the slope of the tangent is the derivative. That is why the two
          readouts meet as the gap closes.
        </p>
        <WhyThisWorks title="About the limit">
          <p>
            The definition says h approaches zero, not that h equals zero, and
            the distinction is the whole reason the notation exists. Setting h to
            zero outright gives 0 divided by 0, which is not a number, so the
            expression genuinely has no value there.
          </p>
          <p>
            What it has instead is a value it gets arbitrarily close to. Name any
            tolerance you like, a thousandth, a millionth, and there is a gap
            small enough that every average slope from there inward sits within
            that tolerance of 2. That is what lim means, and it is a claim about
            every sufficiently small gap rather than about one impossible one.
          </p>
          <p>
            Section 7 makes this concrete for our curve. The average slope across
            a gap of h works out to x + 0.5·h − 1 exactly, so the distance from
            x − 1 is 0.5·h, and choosing a small enough h makes that distance as
            small as anyone asks.
          </p>
        </WhyThisWorks>
      </PrimerSection>

      <PrimerSection title="6. A Derivative at One Point Versus Every Point">
        <p>
          What the shrinking-gap experiment found was one number, the slope at
          x = 3. Doing that again at x = 4, and again at x = 4.1, would be a
          miserable way to work, and it would never finish, because a curve has
          infinitely many points.
        </p>
        <p>
          It matters because of what the slope is for. The walk in section 11
          reads the slope where it stands, moves, and reads it again somewhere
          new, at x = 5, then at 3.8, then at 2.96, and none of those places was
          known before the walk set out. A slope found once at x = 3 answers
          none of those requests. What the walk needs is an instrument it can
          point at any x and read on the spot, not a reading taken in advance.
        </p>
        <p>
          The remarkable thing is that the shrinking-gap calculation can be
          carried out with the gap left as the letter h and the base left as the
          letter x, which does every point at once. What comes out is not a
          number but a formula, a rule that returns the slope at whichever point
          you hand it. That is the next section, and it is ordinary algebra
          throughout.
        </p>
        <p>
          The notation keeps the two apart. f&rsquo;(3) is a number, the 2 that
          the shrinking gaps settled on. f&rsquo;(x), with the x left in, is the
          rule itself, and f&rsquo;(3) is what the rule says when handed 3. One
          derivation produces the rule, and every reading after that is a
          substitution into it.
        </p>
      </PrimerSection>

      <PrimerSection title="7. Deriving the Slope Function">
        <p>
          The recipe says to take the height at x + h, subtract the height at x,
          and divide by h. Here is that carried out on our curve, one operation
          per line, with nothing hidden.
        </p>
        <DerivationTable
          rows={[
            {
              expression: "f(x) = 0.5·x² − x + 2.5",
              reason: "The curve we are working on",
            },
            {
              expression: "f(x + h) = 0.5·(x + h)² − (x + h) + 2.5",
              reason: "Substitute x + h wherever x appeared",
            },
            {
              expression: "         = 0.5·x² + x·h + 0.5·h² − x − h + 2.5",
              reason: "Expand the square and clear the brackets",
            },
            {
              expression: "f(x + h) − f(x) = x·h + 0.5·h² − h",
              reason:
                "Subtract the original height. The 0.5·x², the −x and the 2.5 appear in both and cancel",
            },
            {
              expression: "(f(x + h) − f(x)) / h = x + 0.5·h − 1",
              reason: "Divide by the change in input. Every term loses one h",
            },
            {
              expression: "f'(x) = x − 1",
              reason: "Let h approach zero, and the 0.5·h term dies away",
            },
          ]}
        />
        <>
          <p>
            The second-to-last line says that the average slope differs from the
            derivative by half the gap. At a base point of three, the derivative is two.
          </p>
          <Equation>{"average slope = x − 1 + h/2\nat x = 3 and h = 1:   3 − 1 + 1/2 = 2.5\nat x = 3 and h = 0.1: 3 − 1 + 0.1/2 = 2.05"}</Equation>
          <p>
            These are the values in section 4’s table. Letting the gap approach zero
            removes the extra term and leaves the derivative.
          </p>
        </>
        <p>
          What is left is one clean formula for the slope at <em>every</em> point
          of the curve at once. Drag the base point anywhere in the box above and
          the derivative readout will be x − 1 to the last digit, because that is
          exactly what the server computes.
        </p>
      </PrimerSection>

      <PrimerSection title="8. Reading What the Derivative Says">
        <p>
          A derivative is not merely another formula to carry around. It
          describes the curve, and three readings cover most of what anyone needs
          from it. Take f&rsquo;(x) = x − 1 and evaluate it in a few places.
        </p>
        <NumberTable
          headings={["x", "f'(x)", "what the curve is doing there"]}
          rows={[
            ["0", "−1", "falling"],
            ["1", "0", "flat"],
            ["3", "2", "rising, and twice as steeply as at x = 0"],
          ]}
        />
        <p>
          So the sign gives the direction, negative for falling and positive for
          rising. The magnitude gives the steepness, so a derivative of 2 is
          twice as steep as one of 1 regardless of which way either points. And
          zero marks a flat place, where the curve has stopped doing one and not
          yet begun the other.
        </p>
        <p>
          The magnitude has a use beyond comparison. A rate multiplied by a run
          predicts a rise, as 50 miles per hour times 2 hours predicts the 100
          miles of section 2, and a derivative is a rate, so it predicts how
          much the height will change over a short run from the point it was
          read at.
        </p>
        <WorkedExample title="Worked example, predicting a small change">
          <p>
            At x = 3 the derivative is 2. Step 0.02 to the right and the height
            should rise by about 2 times 0.02.
          </p>
          <Equation>{"predicted rise = 2 × 0.02 = 0.04\nactual rise    = f(3.02) − f(3) = 4.0402 − 4 = 0.0402"}</Equation>
          <p>
            At x = 0 the derivative is −1, so the same step should lower the
            height by about 0.02.
          </p>
          <Equation>{"predicted change = −1 × 0.02 = −0.02\nactual change    = f(0.02) − f(0) = 2.4802 − 2.5 = −0.0198"}</Equation>
          <p>
            Each prediction misses by two ten-thousandths, and the sign of each
            was right before any arithmetic was done. This is the reading the
            walk in section 11 relies on. It moves against the sign so that the
            height falls, and it moves further where the magnitude is larger.
          </p>
        </WorkedExample>
        <KeepInMind>
          <p>
            The reading is local. Over a longer run the slope changes along the
            way and the prediction drifts.
          </p>
          <Equation>{"from x = 3 over a run of 0.5\npredicted rise = 2 × 0.5 = 1.0\nactual rise    = f(3.5) − f(3) = 5.125 − 4 = 1.125"}</Equation>
          <p>
            The miss of 0.125 is the h/2 that section 7 finds in the average
            slope, which is 0.25 for this run, applied across the whole run of
            0.5. A derivative describes the curve at the point it was taken and
            nearby, and says nothing about the far side of the drawing.
          </p>
        </KeepInMind>
        <p>
          Those three readings are enough to find the bottom of a curve, which is
          what the rest of this primer does with them.
        </p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 5 to 8"
        questions={[
          trueFalse(
            "Setting h to zero in (f(x + h) − f(x)) / h gives the derivative directly.",
            false,
            "Setting h to zero outright gives 0 divided by 0, which is not a number, so the expression genuinely has no value there. The definition says h approaches zero rather than equals it, and what the expression has instead is a value it gets arbitrarily close to.",
          ),
          choice(
            "What is the slope of the tangent at the base point?",
            [
              "The derivative there",
              "The average rate of change across the nearest interval",
              "The rise over the run between the two points on screen",
              "Zero, wherever the curve is smooth",
            ],
            0,
            "The secant measures an average and the tangent is what those averages become as the gap closes, so the slope of the tangent is the derivative. That is why the two readouts in the box meet as the gap shrinks.",
          ),
          choice(
            "The derivation gives the average slope across a gap of h as x − 1 + h/2. What does the h/2 term say?",
            [
              "The average slope differs from the derivative by half the gap",
              "The derivative is only ever an approximation",
              "The derivative is accurate to within 2 units",
              "The average slope and the derivative agree at every gap",
            ],
            0,
            "At a base of 3 the formula gives 2.5 for a gap of 1 and 2.05 for a gap of 0.1, which are the values in section 4’s table. Letting the gap approach zero removes the extra term and leaves the derivative, so the term is the exact size of the error the averages were carrying.",
          ),
          several(
            "f′(x) = x − 1. Which of these can be read straight off it?",
            [
              "The curve is falling at x = 0",
              "The curve is flat at x = 1",
              "The curve is at its lowest at x = 3",
              "The curve is twice as steep at x = 0 as at x = 3",
            ],
            [0, 1],
            "The sign gives the direction and the magnitude gives the steepness. At x = 0 the derivative is −1, so the curve is falling, and at x = 1 it is 0, so the curve is flat. At x = 3 the derivative is 2 against a magnitude of 1 at x = 0, so it is x = 3 that is twice as steep rather than the other way round, and a derivative of 2 is not zero, so x = 3 is not a flat place and cannot be the bottom.",
          ),
          trueFalse(
            "The shrinking-gap calculation can be carried out with the gap left as the letter h and the base left as the letter x, and what comes out is a formula rather than a number.",
            true,
            "Repeating the experiment at x = 4, and again at x = 4.1, would never finish, because a curve has infinitely many points. Leaving both as letters does every point at once and produces a rule that returns the slope at whichever point you hand it.",
          ),
        ]}
      />

      <PrimerSection title="9. Flat Points and Minima">
        <p>
          At an interior minimum of a differentiable curve, the derivative is
          zero. That gives us candidate locations to check. We still need to
          establish whether a flat point is a minimum, maximum, or neither.
        </p>
        <WorkedExample>
          <p>Set the derivative to zero and solve.</p>
          <Equation>{"f'(x) = x − 1 = 0   →   x = 1"}</Equation>
          <p>Then find the height there.</p>
          <Equation>{"f(1) = 0.5·1 − 1 + 2.5 = 2"}</Equation>
          <p>
            The lowest point of this curve sits at (1, 2), found without looking
            at the drawing at all.
          </p>
        </WorkedExample>
        <KeepInMind>
          <p>
            A zero derivative marks any flat spot, and the bottom of a valley is
            not the only place a curve lies flat. The top of a hill is flat too.
          </p>
          <p>
            What separates the two is the sign on either side. At a floor the
            curve falls in and rises out, so the derivative runs negative to
            positive. At a crest it rises in and falls out, so the derivative
            runs positive to negative. A zero derivative tells you the curve is
            flat there and nothing more, and you read the signs around it to know
            which kind of flat you have found.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="10. Finding the Bottom by Walking">
        <>
          <p>
            For this example, finding the point with zero slope takes one short
            equation.
          </p>
          <Equation>{"f′(x) = 0\nx − 1 = 0\nx = 1"}</Equation>
          <p>
            Other functions need not be so cooperative. A model’s loss can depend on
            many parameters at once, and setting all its derivatives to zero may produce
            equations we cannot solve directly. That motivates taking repeated steps
            guided by the gradient.
          </p>
        </>
        <p>
          So we keep the insight, that the bottom is where the slope is zero, and
          give up on jumping there in one algebraic step. Instead we walk, and we
          use the derivative the other way, not as an equation to solve but as a
          direction to follow.
        </p>
        <p>
          Picture standing on a hillside in thick fog. You cannot see the valley
          floor, only the ground at your feet, but the slope underfoot still
          tells you which way is down. Stand where the slope is negative, the
          ground falling to your right, and downhill is to the right, so you want
          to increase x. Stand where the slope is positive and downhill is to the
          left, so you want to decrease x. In both cases you move against the
          sign of the slope.
        </p>
        <p>
          That is what the rule says, and now it should read as inevitable rather
          than arbitrary.
        </p>
        <Equation>{"x  ←  x − η · f'(x)"}</Equation>
        <p>
          The minus sign is the &ldquo;against&rdquo;. The η, a number you
          choose, is how boldly to act on what the slope told you, and it has a
          section of its own shortly.
        </p>
      </PrimerSection>

      <PrimerSection title="11. One Complete Gradient-Descent Step">
        <p>
          One update, worked all the way through, on the curve we have been using
          throughout. Start at x = 5 with η = 0.3.
        </p>
        <WorkedExample>
          <NumberTable
            headings={["quantity", "value", "where it came from"]}
            rows={[
              ["current location", "x = 5", "chosen as a starting point"],
              ["current height", "f(5) = 10", "0.5·25 − 5 + 2.5"],
              ["current slope", "f'(5) = 4", "x − 1, at x = 5"],
              ["learning rate", "η = 0.3", "chosen"],
              ["movement", "−0.3 × 4 = −1.2", "against the slope, scaled by η"],
              ["new location", "x = 5 − 1.2 = 3.8", "current location plus movement"],
              ["new height", "f(3.8) = 5.92", "0.5·14.44 − 3.8 + 2.5"],
            ]}
          />
          <p>
            The height fell from 10 to 5.92, which is the whole point of the
            exercise, and the slope at the new location will be smaller than 4,
            so the next stride will be shorter.
          </p>
        </WorkedExample>
        <p>Carrying on from there, the next few steps go like this.</p>
        <NumberTable
          headings={["step", "x", "height", "slope", "movement"]}
          rows={[
            ["0", "5.0000", "10.0000", "4.0000", "−1.2000"],
            ["1", "3.8000", "5.9200", "2.8000", "−0.8400"],
            ["2", "2.9600", "3.9208", "1.9600", "−0.5880"],
            ["3", "2.3720", "2.9412", "1.3720", "−0.4116"],
            ["4", "1.9604", "2.4612", "0.9604", "−0.2881"],
            ["5", "1.6723", "2.2260", "0.6723", "−0.2017"],
          ]}
          caption="The location approaches x = 1 and the height approaches 2. The slope and movement approach zero, so the strides shrink as the curve becomes flatter."
        />
        <p>
          Each row is made from the one above it by the same three operations,
          reading the slope at the new location, scaling it by the rate, and
          moving against it. From the end of step 1,
        </p>
        <Equation>{"slope at 3.8  = 3.8 − 1 = 2.8\nmovement      = −0.3 × 2.8 = −0.84\nnew location  = 3.8 − 0.84 = 2.96"}</Equation>
        <p>
          which is row 2, and every later row checks the same way.
        </p>
        <p>
          Nothing tells the walk to slow down. It slows because the ground
          flattens, and the step is sized by the slope it reads.
        </p>
        <KeepInMind>
          <p>
            The walk never lands on the floor. The distance left after step 5
            is 0.6723, and each further step removes only a part of what
            remains, so the location approaches x = 1 without reaching it. A
            walk like this is stopped rather than finished, either when a
            movement falls below a size you have decided is too small to
            matter, or when it has taken as many steps as you were willing to
            pay for. The second kind of stop is not an arrival, and a walk
            stopped that way can still be far from the bottom.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 9 to 11"
        questions={[
          trueFalse(
            "A point where the derivative is zero is a minimum of the curve.",
            false,
            "A zero derivative marks any flat spot, and the top of a hill is flat too. What separates the two is the sign on either side, since at a floor the derivative runs negative to positive and at a crest it runs positive to negative.",
          ),
          choice(
            "What is the lowest point of f(x) = 0.5·x² − x + 2.5, and how is it found?",
            [
              "(1, 2), by setting the derivative to zero and solving",
              "(1, 2), by reading it off the drawing",
              "(3, 4), by setting the derivative to zero and solving",
              "(5, 10), by walking downhill until the slope reaches zero",
            ],
            0,
            "Setting x − 1 to zero gives x = 1, and the height there is 2, so the lowest point sits at (1, 2) and the drawing was never consulted. The walk in section 11 starts from (5, 10) and approaches the same place without ever landing on it.",
          ),
          choice(
            "Why does the update rule subtract the slope rather than add it?",
            [
              "Downhill is always against the sign of the slope",
              "Subtracting keeps the location positive",
              "The slope is always negative near a minimum",
              "Adding would overshoot the bottom",
            ],
            0,
            "Stand where the slope is negative and the ground falls to your right, so you want x to increase. Stand where the slope is positive and downhill is to the left, so you want x to decrease. The minus sign in the rule is that against.",
          ),
          choice(
            "Starting at x = 5 with a rate of 0.3, the slope is 4 and the step lands at x = 3.8. What happens to the height?",
            [
              "It falls from 10 to 5.92",
              "It falls from 10 to 4",
              "It falls from 5 to 3.8",
              "It stays at 10, because only the location moved",
            ],
            0,
            "The movement is the slope scaled by the rate and taken against the slope, which is −1.2 and lands at 3.8. The height there is 5.92 where it had been 10, and the slope at the new location is smaller than 4, so the next stride will be shorter.",
          ),
          trueFalse(
            "The strides shrink as the walk goes on even though the learning rate stays at 0.3 for every step.",
            true,
            "Nothing tells the walk to slow down. The movement is the slope scaled by the rate, and the rate is the same 0.3 on every row of the table, so the movement column falls from −1.2 to −0.2017 only because the slope it reads falls from 4 to 0.6723 as the ground flattens.",
          ),
        ]}
      />

      <PrimerSection title="12. The Learning Rate">
        <p>
          The one choice left in the walk is η, how far to move on each step. The
          slope gives a direction and a magnitude, and η decides how boldly to
          act on them. It is easier to see what it does than to be told, so start
          with the box below.
        </p>
        <PrimerPlayground>
          <GradientDescentPlayground />
        </PrimerPlayground>
        <p>
          Click anywhere on the curve to choose a start and watch the walk come
          down. Each dot is one step, and the dashed line is the tangent at the
          start, the very line the earlier sections built. Now move the rate
          slider and four distinct behaviours appear.
        </p>
        <NumberTable
          headings={["rate", "what you see"]}
          rows={[
            ["0.05", "creeps down, correct but wasting steps"],
            ["0.30", "glides down one wall and settles"],
            ["1.90", "crosses the bowl every step, zigzagging, still settling"],
            ["2.50", "each hop longer than the last, and the walk runs away"],
          ]}
        />
        <p>
          The third case is the surprising one. It looks alarming and it is still
          converging, and the fourth looks similar for a step or two before it
          leaves. Something changes between 1.9 and 2.5, and for this particular
          bowl we can say exactly what.
        </p>
        <WhyThisWorks title="Why this happens">
          <p>
            We know the derivative of this curve exactly, f&rsquo;(x) = x − 1, so
            substitute it into the update rule.
          </p>
          <Equation>{"x  ←  x − η·(x − 1)"}</Equation>
          <p>
            Subtract 1 from both sides, and the rule becomes a statement about
            the distance between where we stand and the floor at x = 1.
          </p>
          <Equation>{"(x − 1)  ←  (1 − η) · (x − 1)"}</Equation>
          <p>
            Every step multiplies the distance from the bottom by the same
            factor, 1 − η, and the entire behaviour of the walk is in that one
            number. You can check it against the step table in section 11, where
            the distances from x = 1 run 4, 2.8, 1.96, 1.372, each exactly 0.7 of
            the one before it.
          </p>
          <NumberTable
            headings={["η", "factor 1 − η", "what that does"]}
            rows={[
              ["0.3", "0.7", "each step closes 30% of the distance"],
              ["1.0", "0.0", "one step lands exactly on the floor"],
              ["1.9", "−0.9", "crosses to the far side, yet closer than before"],
              ["2.0", "−1.0", "hops between two mirror points forever"],
              ["2.5", "−1.5", "grows every step, and the walk runs away"],
            ]}
          />
          <p>
            So the sign of 1 − η says whether a step crosses the floor, and its
            magnitude says whether the distance shrinks. Below 2 the magnitude is
            under one and the walk converges however it looks on the way. At
            exactly 2 it is one, and the walk neither closes nor escapes. Above 2
            it exceeds one and every hop is longer than the last.
          </p>
          <p>
            The threshold sits at 2 for this bowl because of its particular
            steepness. A sharper curve turns unstable at a smaller η and a
            gentler one tolerates a larger, though the pattern, converge below
            some threshold and run away above it, is general.
          </p>
        </WhyThisWorks>
        <p>
          That is the trade the learning rate sets. Too small wastes steps, too
          large diverges, and the workable range in between is found by exactly
          the kind of experiment the slider lets you run.
        </p>
      </PrimerSection>

      <PrimerSection title="13. Local and Global Minima">
        <p>
          Switch the box above to the two-valley curve, and the caution from
          section 9 becomes something you can watch. Start on the left of the
          central hill and the walk settles in the left valley. Start on the
          right and it settles in the right one. Same curve, same rule, different
          answer.
        </p>
        <p>
          With sufficiently small steps, this walk stays in the valley where
          it starts. Its local slope gives it no reason to cross the hill to
          inspect the other valley. The bottom it reaches is a local minimum;
          the lowest point across the whole curve is the global minimum.
        </p>
        <KeepInMind>
          <p>
            Every model that fits itself by walking downhill inherits this. Where
            it starts can decide where it ends, which is why the same model
            trained twice can settle in two different places and report two
            different scores.
          </p>
          <p>
            It is a real limitation rather than a fixable oversight, and the
            usual response is to run the walk more than once from different
            starts and keep the best result.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="14. From One Setting to Many">
        <p>
          Everything so far has had one adjustable value. A model has more, and
          the step from one to many is the last idea this primer owes you.
        </p>
        <>
<p>
          With one setting there is a loss L(θ), one derivative, and two directions to move, left or right. With two settings there is a loss L(θ₁, θ₂), and the picture becomes a surface rather than a line. There is no single slope on a surface, because the ground can tilt one way as you walk east and another as you walk north.
        </p>
        <p>
          What there is instead is one slope per direction, found by asking how the loss changes as you vary one setting while holding the other still. Each of those is called a partial derivative.
        </p>
</>
        <p>
          Collect them and you have the gradient, written with a nabla.
        </p>
        <Equation>{"∇L = ( ∂L/∂θ₁,  ∂L/∂θ₂,  …,  ∂L/∂θₙ )"}</Equation>
        <p>
          The update rule then reads exactly as it did before, with the single
          slope replaced by the whole collection and the single value replaced by
          all of them at once.
        </p>
        <Equation>{"θ  ←  θ − η·∇L"}</Equation>
        <InAModel>
          <p>
            A model may have thousands or millions of adjustable parameters, one
            partial derivative each. The picture becomes impossible to draw well
            before that, and the principle does not change. Read how the loss
            responds to each setting, and move every setting in the direction
            that is expected to reduce it.
          </p>
          <p>
            Everything you watched on the one-dimensional bowl happens there too.
            The strides shrink as the ground flattens, the rate can be too small
            or too hot, and the valley it settles in is a nearby one rather than
            necessarily the lowest.
          </p>
        </InAModel>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 12 to 14"
        questions={[
          choice(
            "Every step of the walk multiplies the distance from the bottom by the same factor. What is it?",
            ["1 − η", "η", "−η", "1 / η"],
            0,
            "Substituting f′(x) = x − 1 into the update rule and subtracting 1 from both sides turns the rule into a statement about the distance from the floor at x = 1, and the factor left standing is 1 − η. The step table in section 11 checks it, where the distances run 4, 2.8, 1.96 and 1.372, each exactly 0.7 of the one before.",
          ),
          several(
            "At which of these rates does the walk fail to close on the floor of this bowl?",
            [
              "0.3, which closes 30% of the distance each step",
              "1.9, which crosses to the far side every step",
              "2.0, which hops between two mirror points forever",
              "2.5, which grows every step",
            ],
            [2, 3],
            "Below 2 the magnitude of 1 − η is under one and the walk converges however alarming it looks on the way, which is why 1.9 zigzags across the bowl and still settles. At exactly 2 the factor is −1, so the walk neither closes nor escapes, and above 2 every hop is longer than the last.",
          ),
          trueFalse(
            "A curve sharper than this bowl starts to run away at a learning rate below 2.",
            true,
            "The threshold sits at 2 for this bowl because of its particular steepness, since every step multiplies the distance from the floor by 1 − η and the size of that factor passes one at a rate of 2. A sharper curve turns unstable at a smaller rate and a gentler one tolerates a larger one. What is general is only the pattern, which is to converge below some threshold and run away above it.",
          ),
          choice(
            "On the two-valley curve, starting left of the central hill settles in the left valley and starting right settles in the right one. What does that show?",
            [
              "Where the walk starts can decide which minimum it reaches",
              "The two-valley curve has no global minimum",
              "The update rule needs modifying for curves with more than one valley",
              "The walk settles in the deeper valley whichever side it starts",
            ],
            0,
            "With sufficiently small steps the walk stays in the valley where it starts, because the local slope gives it no reason to cross the hill and inspect the other one. Every model that fits itself by walking downhill inherits this, which is why the same model trained twice can settle in two places and report two different scores.",
          ),
          choice(
            "With two settings there is no single slope, because the ground can tilt one way as you walk east and another as you walk north. What takes its place?",
            [
              "One partial derivative per setting, collected into the gradient",
              "The steeper of the two slopes",
              "The average of the slopes in every direction",
              "A single derivative of the loss with respect to both settings at once",
            ],
            0,
            "A partial derivative asks how the loss changes as one setting varies while the others are held still, and collecting them gives the gradient. The update rule then reads exactly as it did before, with the single slope replaced by the whole collection and the single value replaced by all of them at once.",
          ),
        ]}
      />

      <PrimerPractice
        title="Practice. Walking a Real Bowl With the Library"
        exercises={[
          exercise(
            "Watch the derivative drive the walk",
            [
              "The primer walked down f(x) = 0.5·x² − x + 2.5 by hand. Give the library a bowl of its own and let it walk. The five people below are the ones the regression lessons share. Measure their heights in decimetres from the mean of 170 and their weights from the mean of 68, and fit a line through the origin, so that the walk has one setting, the slope, exactly as the primer had one x. GradientDescentRegression.solver_path records every pass of the walk rather than only where it ended. Record a walk at a rate of 0.3 and print, for each of the first six passes, the slope it started from, the derivative it read, the movement it made, the distance left to the floor and the ratio of that distance to the one before, then how many passes the whole walk took. SimpleLinearRegression is the closed form of section 10, the one short equation, so take the floor from it.",
              "The derivative the library reads at a slope of s should come out as s − 8, the primer’s x − 1 with the floor moved from 1 to 8, so each pass should leave 0.7 of the remaining distance, section 12’s factor at a rate of 0.3. How many passes the walk takes to settle is a number the primer never prints.",
            ],
            `import numpy as np
from oop_ml import DesignMatrix, Feature, GradientDescentRegression, SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height_from_mean = [(height - 170) / 10 for height in heights]
weight_from_mean = [weight - 68 for weight in weights]

floor = SimpleLinearRegression().fit(height_from_mean, weight_from_mean).slope
print(f"the closed form puts the floor at a slope of {floor:.4f}")

design = DesignMatrix(np.column_stack([height_from_mean]), ["height"], False)
target = Feature("weight", weight_from_mean).column
# Build a GradientDescentRegression with a learning rate of 0.3 and 100 epochs,
# record its solver_path on the design and target, and for each of the first six
# passes print the slope before, the derivative read, the movement, the distance
# left to the floor and its ratio to the previous distance. Then print how many
# passes the walk took, whether it converged, and the final slope.`,
            `import numpy as np
from oop_ml import DesignMatrix, Feature, GradientDescentRegression, SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height_from_mean = [(height - 170) / 10 for height in heights]
weight_from_mean = [weight - 68 for weight in weights]

floor = SimpleLinearRegression().fit(height_from_mean, weight_from_mean).slope
print(f"the closed form puts the floor at a slope of {floor:.4f}")

design = DesignMatrix(np.column_stack([height_from_mean]), ["height"], False)
target = Feature("weight", weight_from_mean).column
model = GradientDescentRegression(learning_rate=0.3, max_epochs=100)
path = model.solver_path(design, target)

distance_before = floor
for step in list(path)[:6]:
    slope = float(step.weights_before[0])
    movement = float(step.step[0])
    derivative = -movement / model.learning_rate
    distance = abs(floor - float(step.weights_after[0]))
    print(
        f"pass {step.pass_number}: slope {slope:.4f}, derivative {derivative:.4f}, "
        f"movement {movement:.4f}, distance left {distance:.4f}, ratio {distance / distance_before:.4f}"
    )
    distance_before = distance

print(f"passes {path.passes_run}, converged {path.converged}, final slope {float(path.final_weights[0]):.4f}")`,
            `the closed form puts the floor at a slope of 8.0000
pass 1: slope 0.0000, derivative -8.0000, movement 2.4000, distance left 5.6000, ratio 0.7000
pass 2: slope 2.4000, derivative -5.6000, movement 1.6800, distance left 3.9200, ratio 0.7000
pass 3: slope 4.0800, derivative -3.9200, movement 1.1760, distance left 2.7440, ratio 0.7000
pass 4: slope 5.2560, derivative -2.7440, movement 0.8232, distance left 1.9208, ratio 0.7000
pass 5: slope 6.0792, derivative -1.9208, movement 0.5762, distance left 1.3446, ratio 0.7000
pass 6: slope 6.6554, derivative -1.3446, movement 0.4034, distance left 0.9412, ratio 0.7000
passes 56, converged True, final slope 8.0000`,
            {
              hints: [
                "A model is configured at construction and the data goes to the call. solver_path takes the design matrix and the target column and answers a path you can loop over, and each step of it carries weights_before, step and weights_after. The path itself carries passes_run, converged and final_weights.",
                "The step is the movement, which is the derivative scaled by the rate and taken against its sign, so the derivative the library read is minus the step divided by the rate.",
                "Keep the previous distance in a variable to print the ratio. The walk starts from a slope of zero, so the distance before the first pass is the floor itself.",
              ],
              check: numberCheck(
                "How many passes did the walk at a rate of 0.3 take to settle?",
                56,
                0.5,
                "Each pass leaves 0.7 of the distance to the floor, so the movements shrink by the same factor from the first one of 2.4, and the library stops on the first pass that moves the slope by less than its tolerance of one part in a hundred million. Fifty-five multiplications by 0.7 are what it takes to bring 2.4 under that, so the 56th pass is the one that stops the walk.",
              ),
            },
          ),
          exercise(
            "Reproduce the four behaviours of the rate",
            [
              "Section 12 listed four rates and what each does to the walk. Run the same one-setting bowl at 0.05, 0.3, 1.9, 2.0 and 2.5 through the ordinary fit call, allowing 5000 passes, and print for each rate whether the walk converged, how many passes it took and the slope it reports. The library refuses a walk whose numbers have overflowed by raising DivergenceError, so catch that and print its message.",
              "The bowl has the primer’s steepness, so the threshold should sit at 2. Expect 1.9 to settle despite crossing the floor on every pass, 2.0 to hop between two mirror points until the passes run out, and 2.5 to be refused. On the way to the refusal numpy prints warnings about the overflow on the error stream; the refusal is the line to read.",
            ],
            `from oop_ml import DivergenceError, Feature, GradientDescentRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height = Feature("height", [(value - 170) / 10 for value in heights])
weight = Feature("weight", [value - 68 for value in weights])

# For each rate in 0.05, 0.3, 1.9, 2.0 and 2.5, fit a GradientDescentRegression
# without an intercept, allowing 5000 epochs, and print whether it converged,
# how many epochs it ran and the slope it reports. Catch DivergenceError and
# print its message instead.`,
            `from oop_ml import DivergenceError, Feature, GradientDescentRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height = Feature("height", [(value - 170) / 10 for value in heights])
weight = Feature("weight", [value - 68 for value in weights])

for learning_rate in [0.05, 0.3, 1.9, 2.0, 2.5]:
    model = GradientDescentRegression(
        learning_rate=learning_rate, max_epochs=5000, fit_intercept=False
    )
    try:
        model.fit([height], weight)
    except DivergenceError as refusal:
        print(f"rate {learning_rate}: refused, {refusal}")
    else:
        print(
            f"rate {learning_rate}: converged {model.converged}, "
            f"passes {model.epochs_run}, slope {model.coefficients['height']:.4f}"
        )`,
            `rate 0.05: converged True, passes 343, slope 8.0000
rate 0.3: converged True, passes 56, slope 8.0000
rate 1.9: converged True, passes 202, slope 8.0000
rate 2.0: converged False, passes 5000, slope 0.0000
rate 2.5: refused, the fit diverged: the weights overflowed to non-finite values. Lower the learning rate`,
            {
              hints: [
                "fit_intercept=False keeps the line through the origin, which is what makes this a one-setting walk. Leave it on and the library adds a level, which is the bowl of the next two problems.",
                "A refusal is an exception, so the fit goes inside a try and the message is printed in the except branch. DivergenceError is the library’s own name for this failure, and it arrives only once the numbers have overflowed, so the pass budget has to be large enough to let them.",
                "converged and epochs_run are properties of the fitted model, and the slope is read from coefficients by the feature name. A walk that hit the pass limit still reports a slope, and converged is the attribute that says not to trust it.",
              ],
              check: numberCheck(
                "How many passes did the walk at a rate of 1.9 take to settle?",
                202,
                0.5,
                "At 1.9 the factor is 1 − 1.9, which is −0.9, so every pass crosses the floor and lands 0.9 of the previous distance away on the far side. The first movement is 1.9 times 8, and shrinking it by 0.9 a pass until a movement falls under the tolerance of one part in a hundred million takes 202 passes, nearly four times the 56 that 0.3 needed, for a walk that still settles.",
              ),
            },
          ),
          exercise(
            "Bring the level back and read two derivatives",
            [
              "Section 14 says a model with two settings has one partial derivative per setting. Put the level back by fitting the weights as they are rather than from their mean, so the walk has two settings, the level of the line at the mean height and its slope. Record the walk at 0.3 with solver_path again and print, for the first four passes, the two derivatives the library read and the fraction of each setting’s remaining distance that was left after the pass. Take the two floors from the closed form, whose intercept on centred heights is the level.",
              "The two directions are two different bowls walked at the same time. The slope’s derivative starts at −8 as before and its distance shrinks by 0.7 a pass. The level’s derivative starts at −136 and its distance shrinks by a smaller factor, because that direction is sharper, and that factor is the number to find.",
            ],
            `import numpy as np
from oop_ml import DesignMatrix, Feature, GradientDescentRegression, SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height_from_mean = [(height - 170) / 10 for height in heights]

jump = SimpleLinearRegression().fit(height_from_mean, weights)
level_floor, slope_floor = jump.intercept, jump.slope
print(f"the closed form puts the floor at level {level_floor:.4f}, slope {slope_floor:.4f}")

design = DesignMatrix(np.column_stack([np.ones(5), height_from_mean]), ["height"], True)
target = Feature("weight", weights).column
# Record the solver_path of a GradientDescentRegression at a rate of 0.3 with
# 100 epochs, and for each of the first four passes print both derivatives and
# the fraction of each setting's distance to its floor left after the pass.
# Then print the passes taken, whether it converged, and where it settled.`,
            `import numpy as np
from oop_ml import DesignMatrix, Feature, GradientDescentRegression, SimpleLinearRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height_from_mean = [(height - 170) / 10 for height in heights]

jump = SimpleLinearRegression().fit(height_from_mean, weights)
level_floor, slope_floor = jump.intercept, jump.slope
print(f"the closed form puts the floor at level {level_floor:.4f}, slope {slope_floor:.4f}")

design = DesignMatrix(np.column_stack([np.ones(5), height_from_mean]), ["height"], True)
target = Feature("weight", weights).column
model = GradientDescentRegression(learning_rate=0.3, max_epochs=100)
path = model.solver_path(design, target)

level_before, slope_before = level_floor, slope_floor
for step in list(path)[:4]:
    level_derivative, slope_derivative = -step.step / model.learning_rate
    level_left = abs(level_floor - float(step.weights_after[0]))
    slope_left = abs(slope_floor - float(step.weights_after[1]))
    print(
        f"pass {step.pass_number}: derivatives {level_derivative:.4f} and {slope_derivative:.4f}, "
        f"level ratio {level_left / level_before:.4f}, slope ratio {slope_left / slope_before:.4f}"
    )
    level_before, slope_before = level_left, slope_left

print(f"passes {path.passes_run}, converged {path.converged}, "
      f"level {float(path.final_weights[0]):.4f}, slope {float(path.final_weights[1]):.4f}")`,
            `the closed form puts the floor at level 68.0000, slope 8.0000
pass 1: derivatives -136.0000 and -8.0000, level ratio 0.4000, slope ratio 0.7000
pass 2: derivatives -54.4000 and -5.6000, level ratio 0.4000, slope ratio 0.7000
pass 3: derivatives -21.7600 and -3.9200, level ratio 0.4000, slope ratio 0.7000
pass 4: derivatives -8.7040 and -2.7440, level ratio 0.4000, slope ratio 0.7000
passes 56, converged True, level 68.0000, slope 8.0000`,
            {
              hints: [
                "The design matrix now has two columns, a column of ones for the level and the centred heights, so np.column_stack takes both and the third argument says the intercept is present. The library’s own fit builds exactly this matrix when fit_intercept is left on.",
                "step.step holds two numbers, one per setting, and dividing the whole array by minus the rate gives both derivatives at once. weights_after[0] is the level and weights_after[1] the slope, in the order of the columns.",
                "Keep the two previous distances in two variables, starting from the floors themselves, since the walk starts both settings at zero.",
              ],
              check: numberCheck(
                "What fraction of the level’s remaining distance is left after each pass at a rate of 0.3?",
                0.4,
                0.0005,
                "The level direction is twice as sharp as the slope direction. Its derivative starts at −136, twice its distance of 68 from the floor, where the slope’s derivative of −8 is once its distance of 8, so a pass closes twice the share, 60% rather than 30%, and 0.4 is left where the slope keeps 0.7. One rate serves both settings and acts on each according to that setting’s own steepness.",
              ),
            },
          ),
          exercise(
            "Find where this bowl’s walk runs away",
            [
              "With both settings in play, run the ordinary fit at 0.3, 0.9, 1.0, 1.1 and 1.9, allowing 5000 passes, and print the verdict for each, catching the refusal as before. This time leave the intercept on, which is the default.",
              "The one-setting bowl tolerated 1.9. Here the sharper level direction decides, and section 12 says a sharper curve turns unstable at a smaller rate. Watch what happens at exactly 1.0, where one setting lands on its floor in a single pass while the other hops forever.",
            ],
            `from oop_ml import DivergenceError, Feature, GradientDescentRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height = Feature("height", [(value - 170) / 10 for value in heights])
weight = Feature("weight", weights)

# For each rate in 0.3, 0.9, 1.0, 1.1 and 1.9, fit a GradientDescentRegression
# with the intercept left on, allowing 5000 epochs, and print whether it
# converged, the epochs run, the level and the slope. Catch DivergenceError
# and print its message instead.`,
            `from oop_ml import DivergenceError, Feature, GradientDescentRegression

heights = [160, 165, 170, 175, 180]
weights = [58, 66, 68, 74, 74]
height = Feature("height", [(value - 170) / 10 for value in heights])
weight = Feature("weight", weights)

for learning_rate in [0.3, 0.9, 1.0, 1.1, 1.9]:
    model = GradientDescentRegression(learning_rate=learning_rate, max_epochs=5000)
    try:
        model.fit([height], weight)
    except DivergenceError as refusal:
        print(f"rate {learning_rate}: refused, {refusal}")
    else:
        print(
            f"rate {learning_rate}: converged {model.converged}, passes {model.epochs_run}, "
            f"level {model.intercept:.4f}, slope {model.coefficients['height']:.4f}"
        )`,
            `rate 0.3: converged True, passes 56, level 68.0000, slope 8.0000
rate 0.9: converged True, passes 106, level 68.0000, slope 8.0000
rate 1.0: converged False, passes 5000, level 0.0000, slope 8.0000
rate 1.1: refused, the fit diverged: the weights overflowed to non-finite values. Lower the learning rate
rate 1.9: refused, the fit diverged: the weights overflowed to non-finite values. Lower the learning rate`,
            {
              hints: [
                "This is problem 2’s loop with the weights handed over as measured and fit_intercept left at its default. The level is the model’s intercept, because the heights are centred.",
                "At 1.0 the level’s factor is 1 − 2, which is −1, so it hops between 0 and 136 for every one of the 5000 passes and the reported level is whichever of the two the last pass landed on. The slope’s factor at that rate is 0, so it reaches 8 on the first pass and stays.",
                "The refusal arrives only once the numbers have overflowed. At 1.1 the level’s distance grows by 1.2 a pass, which takes a few thousand passes to overflow, so with a budget of 3000 the library reports a huge finite level and converged False rather than refusing. The budget of 5000 is what lets the refusal happen.",
              ],
              check: numberCheck(
                "How many passes did the two-setting walk at a rate of 0.9 take to settle?",
                106,
                0.5,
                "At 0.9 the slope’s factor is 0.1 and the level’s is 1 − 1.8, which is −0.8, so the slope lands almost at once and the level crosses its floor on every pass, keeping 0.8 of its distance each time. From a first movement of 0.9 times 136 down to the tolerance of one part in a hundred million takes 106 passes, and the walk settles because 0.8 is still under one in size.",
              ),
            },
          ),
        ]}
      />
    </PrimerPage>
  );
}
