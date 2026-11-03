import { lessonIntuitions } from "@/lib/intuition";
import { presentIntuition } from "@/lib/intuition/presentation";
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
  title: "Calculus Primer · Perceptron Lab",
  description:
    "Calculus describes how one quantity changes as another changes. A derivative measures the rate of that change, helping us understand a function's behavior and decide which adjustments increase or decrease its output.",
};

export default function CalculusPrimerPage() {
  return (
    <PrimerPage
      lessonId="calculus"
      technicalStart="7. Deriving the Slope Function"
      title="Calculus Primer"
      tagline={"Calculus describes how one quantity changes as another changes. A derivative measures the rate of that change, helping us understand a function's behavior and decide which adjustments increase or decrease its output."}
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
<GuidedIntuition lesson={presentIntuition("calculus", lessonIntuitions["calculus"])} />
<IntuitionConnection lesson={lessonIntuitions["calculus"]} />
</PrimerSection>

      <PrimerSection title="1. Change Between Two Points">

        <p>
          Suppose we change the input to a function and watch its output move. How much does the output change for each unit of input? On a straight line, that rate is the slope. We can find it from any two points: measure the vertical change, called the rise, and divide it by the horizontal change, called the run.
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
        <p>Drag either point in the activity below. The triangle updates its rise and run, and the readout recalculates their ratio. If the points have the same horizontal coordinate, the run is zero and this slope is undefined.</p>
        <PrimerPlayground>
          <SlopePlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="2. Slope as a Rate">
        <p>
          Suppose the horizontal axis records time and the vertical axis records distance. The slope tells us how much distance changes per unit of time, so it describes a speed. Other axis units give other rates. This is why measuring the tilt of a line can answer a question about something changing.
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
        <p>The 50 miles per hour is an average over the whole trip. It does not tell us the speed at a particular moment: we may have been stopped at a light, or traveling at 70 elsewhere. With continuously changing speed, the speedometer would pass through 50, but it need not stay there. To describe the rate at an instant, we need a shorter interval than the whole trip.</p>
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
        <p>An average rate describes a whole interval. To understand the rate at one point, we can compare averages over increasingly short intervals around it. The question is whether those averages approach a definite value.</p>
        <p>Keep the base point fixed and move the second point closer. Each rise-over-run calculation now measures a shorter part of the curve. If these average slopes approach one value as the gap shrinks, that value describes the local rate at the base point.</p>
        <WorkedExample title="Move the second point closer and compare the average slope">
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
        <p>The table shows the average slopes approaching a value as the gap becomes smaller. We have not divided by a zero gap. We are investigating what happens while the two points remain distinct and move closer together.</p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 1 to 4"
        questions={[
          trueFalse(
            "A trip of 100 miles in 2 hours has an average speed of 50 miles per hour, so the speedometer must have read 50 halfway through the trip.",
            false,
            "Average speed describes the whole trip. It does not determine the reading halfway through, since time spent stopped or moving faster can occur in different parts of the journey. With continuous speed, a reading equal to the average does occur somewhere; the average alone does not tell us when.",
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
            "For this smooth quadratic, which behavior does the table of shrinking gaps illustrate?",
            [
              "The averages are settling rather than wandering",
              "The smaller the gap, the closer they settle",
              "Where they are heading does not depend on how we got there",
              "The value they settle on is named in that section",
            ],
            [0, 1, 2],
            "The displayed averages approach a common slope as the gap shrinks. For this quadratic, the later algebra verifies the limit and shows that approaching from either side gives the same value. A finite table illustrates that behavior; it cannot establish every possible limiting path by itself.",
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
            "Slope compares the change in vertical position with the change in horizontal position. The correct result means two units upward per unit across. Reversing the division would instead describe horizontal movement per unit of rise. Either change alone leaves out the comparison the question asks for.",
          ),
        ]}
      />

      <PrimerSection title="5. The Derivative">
        <p>
          Those average rates approach 2 as the interval around x = 3 shrinks. We call the limiting rate the derivative at that point. We have reached it by asking what happens to a familiar rise-over-run calculation as its two locations come together.
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
        <p>The solid secant passes through two points on the curve. As the second point approaches the base point, its slope approaches the slope of the dashed tangent, when the derivative exists. The tangent describes the local direction of the curve at that point.</p>
        <WhyThisWorks title="About the limit">
          <p>The gap approaches zero without being set to zero in the quotient. A zero gap would make both the rise and run zero, leaving that quotient undefined. A limit asks what value the quotient approaches through nonzero gaps.</p>
          <p>
            What it has instead is a value it gets arbitrarily close to. Name any
            tolerance you like, a thousandth, a millionth, and there is a gap
            small enough that every average slope from there inward sits within
            that tolerance of 2. That is what lim means, and it is a claim about
            every sufficiently small gap rather than about one impossible one.
          </p>
          <p>Section 7 derives the average-slope formula exactly. Its difference from the local derivative contains a term proportional to the gap h. That term approaches zero as h approaches zero from either side, which is why the average slopes approach one derivative value here.</p>
        </WhyThisWorks>
      </PrimerSection>

      <PrimerSection title="6. A Derivative at One Point Versus Every Point">
        <p>The experiment found a derivative at one location. A calculation that repeatedly changes its input needs the derivative at each new location, so a formula for the derivative is more useful than a single measured slope.</p>
        <p>Gradient descent illustrates that need. Each step moves to a new input and uses the derivative there to choose the next adjustment. The derivative function supplies a local rate wherever the procedure currently stands.</p>
        <p>We can leave the base point and gap as symbols while simplifying the average slope. Taking the limit then gives a formula for the derivative as a function of the base point. The following algebra performs those steps for this curve.</p>
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
          What can a derivative tell us about a curve before we draw the whole thing? Its sign shows whether the curve is rising or falling as we move right, and its magnitude tells us how rapidly the height changes locally. Let&apos;s evaluate the derivative below at a few locations.
        </p>
        <Equation>{"f′(x) = x − 1"}</Equation>
        <NumberTable
          headings={["x", "f'(x)", "what the curve is doing there"]}
          rows={[
            ["0", "−1", "falling"],
            ["1", "0", "flat"],
            ["3", "2", "rising, and twice as steeply as at x = 0"],
          ]}
        />
        <p>For a differentiable function, a positive derivative indicates an increasing local response and a negative derivative a decreasing one. Its magnitude measures the rate relative to the chosen input unit. A zero derivative identifies a stationary point but does not by itself establish a change of direction or a minimum.</p>
        <p>
          The magnitude has a use beyond comparison. A rate multiplied by a run
          predicts a rise, as 50 miles per hour times 2 hours predicts the 100
          miles of section 2, and a derivative is a rate, so it predicts how
          much the height will change over a short run from the point it was
          read at.
        </p>
        <WorkedExample title="Use the local slope to predict a nearby height">
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
          <p>The displayed error of 0.125 comes from treating the starting slope as constant across the interval. The actual curve becomes steeper as we move right. A derivative gives a local approximation, so extending the same straight-line prediction farther from its starting point can increase the error.</p>
        </KeepInMind>
        <p>
          We can use these local slopes to choose a direction that lowers this curve. The following sections work through those steps and explain why their size matters.
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
          <p>If the derivative changes from negative to positive across a flat point, the curve falls toward it and rises afterward: that identifies a local minimum. The reverse sign change identifies a local maximum. A curve can also keep rising through a flat point, so a zero derivative alone does not classify it.</p>
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
        <p>When solving the derivative equations directly is impractical, we can use local rates to choose repeated adjustments. Gradient descent takes a step opposite the derivative or gradient. Whether a finite step reduces the value still depends on its size and the function&apos;s behavior nearby.</p>
        <p>
          Picture standing on a hillside in thick fog. You cannot see the valley
          floor, only the ground at your feet, but the slope underfoot still
          tells you which way is down. Stand where the slope is negative, the
          ground falling to your right, and downhill is to the right, so you want
          to increase x. Stand where the slope is positive and downhill is to the
          left, so you want to decrease x. In both cases you move against the
          sign of the slope.
        </p>
        <p>Subtracting a small positive multiple of the slope gives the required direction in either case.</p>
        <Equation>{"x  ←  x − η · f'(x)"}</Equation>
        <p>The minus sign makes the update oppose the derivative. The positive number η scales the movement and is called the learning rate. Its size matters because the derivative describes the curve locally, while the update moves a finite distance.</p>
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
            The step lowered the height from 10 to 5.92. At the new location, the slope is smaller than 4. Keeping the same learning rate therefore gives a shorter next step on this curve.
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
        <p>With this update rule, the step becomes smaller as the derivative approaches zero. That behavior follows from the formula for the step; it does not mean the procedure has separately decided that it is near a solution.</p>
        <KeepInMind>
          <p>With these settings, the steps approach the minimum without reaching it exactly in a finite number of iterations. A program therefore needs a stopping condition, such as a small update or an iteration limit. Reaching the iteration limit alone does not establish that the result is close enough.</p>
        </KeepInMind>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 9 to 11"
        questions={[
          trueFalse(
            "A point where the derivative is zero is a minimum of the curve.",
            false,
            "A zero derivative gives a horizontal tangent. That can occur at a minimum, a maximum or a point where the curve keeps moving in the same direction. Check how the function behaves on either side: decreasing then increasing supports a local minimum, while increasing then decreasing supports a local maximum.",
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
            "The stationary point is at x = 1, with height 2. This upward-opening quadratic decreases before that point and increases after it, confirming the minimum. The displayed gradient steps approach the same location without needing to solve for it directly.",
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
            "At a positive slope, moving left lowers the function locally; at a negative slope, moving right does. Subtracting a positive learning-rate multiple chooses that local downhill direction. Whether a finite step actually lowers the loss also depends on its size, which the later rate experiment investigates.",
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
        <p>The learning rate controls how strongly the procedure acts on the derivative at each step. A larger setting can speed progress on one part of a curve and overshoot on another. The activity below keeps the update rule visible while that setting changes.</p>
        <PrimerPlayground>
          <GradientDescentPlayground />
        </PrimerPlayground>
        <p>Click on the curve to choose a starting point. Each dot shows a subsequent update, and the dashed line is the tangent at the start. Change the learning-rate slider and compare whether the updates approach the minimum or move farther away.</p>
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
          <p>Subtract 1 from both sides to describe the signed offset from the minimum at x = 1. A positive offset is to its right and a negative offset to its left.</p>
          <Equation>{"(x − 1)  ←  (1 − η) · (x − 1)"}</Equation>
          <p>Every update multiplies that signed offset by 1 − η. Its sign determines the side of the minimum, and its magnitude gives the distance. In section 11, the offsets from x = 1 are 4, 2.8, 1.96 and 1.372, each 0.7 times the previous one.</p>
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
          <p>For a positive learning rate below 2, the factor’s magnitude is less than one, so the distance to the minimum shrinks. At exactly 2, a nonzero offset changes sign without shrinking. Above 2, its magnitude grows. A start exactly at the minimum stays there because its offset is zero.</p>
          <p>The threshold is 2 for this quadratic because of how quickly its slope changes. A steeper upward-opening quadratic needs a smaller learning rate, while a gentler one permits a larger rate. More general functions can change steepness from place to place, so a rate that works near one point may fail elsewhere.</p>
        </WhyThisWorks>
        <p>
          That is the trade the learning rate sets. Too small wastes steps, too
          large diverges, and the workable range in between is found by exactly
          the kind of experiment the slider lets you run.
        </p>
      </PrimerSection>

      <PrimerSection title="13. Local and Global Minima">
        <p>Switch the activity to the two-valley curve and choose a small learning rate. Try a start in the left valley, then one in the right. The same update rule can approach different minima because the slope depends on where the updates begin.</p>
        <p>
          With sufficiently small steps, this walk stays in the valley where
          it starts. Its local slope gives it no reason to cross the hill to
          inspect the other valley. The bottom it reaches is a local minimum;
          the lowest point across the whole curve is the global minimum.
        </p>
        <KeepInMind>
          <p>On a function with several minima, the starting point can affect which result gradient descent reaches. This is one reason repeated training runs can produce different fitted parameters. The outcome also depends on the update rule and its settings.</p>
          <p>Trying several starting points can reveal different candidate minima. Comparing those candidates is useful, but repeated starts do not prove that the global minimum has been found.</p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="14. From One Setting to Many">
        <p>Many calculations have several adjustable inputs. We need to know how changing each one affects the result while the others stay fixed.</p>
        <>
<p>
          With one setting there is a loss L(θ), one derivative, and two directions to move, left or right. With two settings there is a loss L(θ₁, θ₂), and the picture becomes a surface rather than a line. There is no single slope on a surface, because the ground can tilt one way as you walk east and another as you walk north.
        </p>
        <p>A partial derivative measures the response to one input with the other inputs held fixed. Calculating one for each adjustable input gives us the components of the gradient.</p>
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
          <p>The same reasoning extends to many parameters, even when the geometry cannot be drawn. Each gradient component describes a local response to one parameter. An update combines those responses, and its actual effect needs to be checked after the finite step.</p>
          <p>The same small-change questions apply when there are many settings, but the bowl is a particularly simple case. A more complicated loss can have several minima or flat points that are not minima at all. The gradient describes the local response; it does not tell us that a useful setting is nearby or that our next finite step will reach it.</p>
        </InAModel>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 12 to 14"
        questions={[
          choice(
            "For this quadratic, each update multiplies the signed offset from the minimum by which factor?",
            ["1 − η", "η", "−η", "1 / η"],
            0,
            "The minimum is at x = 1, so subtracting that reference from the update gives the signed offset after each step. Its multiplier is one minus the learning rate. The distance uses the magnitude of that multiplier: a negative factor crosses the minimum, and a magnitude below one brings the next location closer.",
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
              "For this quadratic and a positive learning rate below 2, the signed-offset multiplier has magnitude below one. A rate of 1.9 therefore alternates sides while approaching the minimum. At 2 the magnitude is one and the distance repeats; at 2.5 it exceeds one and the distance grows.",
              {
                "description": "Use f(x) = ½(x − 1)² and gradient descent x_next = x − η(x − 1), starting from x = 4. The minimum is at x = 1. The question asks about convergence over indefinitely many steps, using exact arithmetic."
              },
            ),
          trueFalse(
            "Increasing the curvature of an upward-opening quadratic lowers the positive learning-rate limit for gradient descent to converge.",
            true,
            "A sharper quadratic changes its slope more quickly with position. The same learning rate therefore makes a larger correction relative to the distance remaining, so instability begins at a smaller rate. This comparison concerns quadratics with constant curvature; a more general loss needs its own convergence analysis.",
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
            "With suitably small steps on this two-valley curve, the local slope leads toward the minimum in the starting valley. It supplies no instruction to cross the intervening hill and compare the other minimum. Losses with several valleys can therefore reach different solutions from different initial settings.",
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
        id="practice-walking-a-real-bowl-with-the-library"
        title="Practice. Calculating Slopes and Steps With NumPy"
        exercises={[
          exercise(
            "Measure a slope with two nearby values",
            ["The workshop estimated the traveler's rate of movement from two readings. Now use that same change-per-input idea on the primer's loss curve. Before taking a downhill step, check whether two nearby evaluations agree with its derivative.","For each supplied location, evaluate the curve a small step to the left and the same step to the right. Divide the change in height by the distance between those two locations. This centered difference estimates the tangent slope.","Also write the derivative from section 8 and compare it with that estimate. Complete the two functions; the array operations will evaluate all five locations together. Print both slopes, then check whether they agree to within one hundred-millionth."],
            `import numpy as np

def curve(x):
    return 0.5 * x ** 2 - x + 2.5

def derivative(x):
    # TODO: differentiate the three terms of curve.
    raise NotImplementedError("Write the derivative")

def measured_slope(x, step):
    # TODO: change in height divided by the full distance between samples.
    raise NotImplementedError("Measure the slope")

locations = np.array([-1.0, 0.0, 1.0, 2.0, 5.0])
exact = derivative(locations)
measured = measured_slope(locations, 0.001)
for x, analytic, estimate in zip(locations, exact, measured):
    print(f"x {x:.1f}: height {curve(x):.4f}, derivative {analytic:.4f}, measured {estimate:.4f}")
print(f"slopes agree {np.allclose(exact, measured, rtol=0, atol=1e-8)}")`,
            `import numpy as np

def curve(x):
    return 0.5 * x ** 2 - x + 2.5

def derivative(x):
    return x - 1

def measured_slope(x, step):
    left = curve(x - step)
    right = curve(x + step)
    return (right - left) / (2 * step)

locations = np.array([-1.0, 0.0, 1.0, 2.0, 5.0])
exact = derivative(locations)
measured = measured_slope(locations, 0.001)
for x, analytic, estimate in zip(locations, exact, measured):
    print(f"x {x:.1f}: height {curve(x):.4f}, derivative {analytic:.4f}, measured {estimate:.4f}")
print(f"slopes agree {np.allclose(exact, measured, rtol=0, atol=1e-8)}")`,
            `x -1.0: height 4.0000, derivative -2.0000, measured -2.0000
x 0.0: height 2.5000, derivative -1.0000, measured -1.0000
x 1.0: height 2.0000, derivative 0.0000, measured 0.0000
x 2.0: height 2.5000, derivative 1.0000, measured 1.0000
x 5.0: height 10.0000, derivative 4.0000, measured 4.0000
slopes agree True`,
            {
              question: "Can two nearby measurements recover the derivative?",
              hints: [
                "Differentiate each term separately. The constant contributes no slope, while the quadratic contributes a slope that changes with location.",
                "The two sample points lie on opposite sides of x. Their separation is twice step, so the denominator needs the full distance between them.",
                "Both functions can operate on an entire NumPy array. The agreement is especially close for this quadratic; a finite difference is still an approximation for a general curve, and an extremely small step can make rounding matter more.",
              ],
              check: numberCheck("What is the derivative at five?", 4, 0.00005, "The sign changes as we cross the minimum: negative on its left, zero at the bottom, positive on its right. That sign gives the direction for the next challenge's downhill step."),
            },
          ),
          exercise(
            "Write the downhill update yourself",
            [
              "Knowing which way the curve slopes is useful only if we use it to change our position. Start at the primer's location of five and take six steps with the same learning rate as section 11.",
              "On each pass, calculate the derivative at the current location. Multiply it by the learning rate and move against its sign. Evaluate the curve at the new location before beginning the next pass.",
              "Fill in the derivative, movement and new location in the loop below. The printed trace should show both the location and the curve's height changing. The learning rate stays fixed throughout, so notice what causes each movement to become smaller.",
            ],
            `import numpy as np

def curve(x):
    return 0.5 * x ** 2 - x + 2.5

x = 5.0
learning_rate = 0.3
heights = [curve(x)]
for step in range(1, 7):
    derivative = None  # TODO: slope at the current location
    movement = None  # TODO: move against the slope
    next_x = None  # TODO: apply the movement
    print(f"step {step}: x {x:.4f}, derivative {derivative:.4f}, movement {movement:.4f}, next {next_x:.4f}, height {curve(next_x):.4f}")
    heights.append(curve(next_x))
    x = next_x

print(f"height fell every step {np.all(np.diff(heights) < 0)}")
print(f"distance from the minimum {abs(x - 1):.4f}")`,
            `import numpy as np

def curve(x):
    return 0.5 * x ** 2 - x + 2.5

x = 5.0
learning_rate = 0.3
heights = [curve(x)]
for step in range(1, 7):
    derivative = x - 1
    movement = -learning_rate * derivative
    next_x = x + movement
    print(f"step {step}: x {x:.4f}, derivative {derivative:.4f}, movement {movement:.4f}, next {next_x:.4f}, height {curve(next_x):.4f}")
    heights.append(curve(next_x))
    x = next_x

print(f"height fell every step {np.all(np.diff(heights) < 0)}")
print(f"distance from the minimum {abs(x - 1):.4f}")`,
            `step 1: x 5.0000, derivative 4.0000, movement -1.2000, next 3.8000, height 5.9200
step 2: x 3.8000, derivative 2.8000, movement -0.8400, next 2.9600, height 3.9208
step 3: x 2.9600, derivative 1.9600, movement -0.5880, next 2.3720, height 2.9412
step 4: x 2.3720, derivative 1.3720, movement -0.4116, next 1.9604, height 2.4612
step 5: x 1.9604, derivative 0.9604, movement -0.2881, next 1.6723, height 2.2260
step 6: x 1.6723, derivative 0.6723, movement -0.2017, next 1.4706, height 2.1107
height fell every step True
distance from the minimum 0.4706`,
            {
              question: "How does a derivative become a step toward the bottom?",
              hints: [
                "Use the same derivative you wrote in the first challenge, but evaluate it at the latest x on every pass.",
                "A positive derivative asks for a negative movement. Multiply the derivative by the rate and change its sign.",
                "The assignment at the end of the loop makes the new location the starting point for the next pass. Keep its full precision; round only when printing.",
              ],
              check: numberCheck("What distance remains after six steps?", 0.4706, 0.00005, "The curve flattens as the location approaches its minimum, so the derivative shrinks. The rate never changes, but the smaller derivative makes the next movement shorter."),
            },
          ),
          exercise(
            "Change the rate and inspect the whole path",
            [
              "A large step can cross the bottom and still make progress. To tell progress from instability, we need to watch the distance from the minimum as well as the side we land on.",
              "Complete walk using the derivative and update from the previous challenge. Return the starting location and each of six new locations. Run it at the five rates below, starting from five every time.",
              "Calculate the final distance from the minimum at one. The supplied printing shows the entire path and that distance. Compare the alternating paths: one gets closer, one repeats, and one travels farther away. Six steps demonstrate their behavior on this known quadratic; they are not a general convergence test for arbitrary functions.",
            ],
            `import numpy as np

def walk(learning_rate):
    x = 5.0
    path = [x]
    for _ in range(6):
        derivative = None  # TODO: local slope
        x = None  # TODO: next location
        path.append(x)
    return np.array(path)

for rate in [0.05, 0.3, 1.9, 2.0, 2.5]:
    path = walk(rate)
    distance = None  # TODO: distance to the known minimum
    print(f"rate {rate}: " + " -> ".join(f"{x:.4f}" for x in path))
    print(f"distance after six steps {distance:.4f}")`,
            `import numpy as np

def walk(learning_rate):
    x = 5.0
    path = [x]
    for _ in range(6):
        derivative = x - 1
        x = x - learning_rate * derivative
        path.append(x)
    return np.array(path)

for rate in [0.05, 0.3, 1.9, 2.0, 2.5]:
    path = walk(rate)
    distance = abs(path[-1] - 1)
    print(f"rate {rate}: " + " -> ".join(f"{x:.4f}" for x in path))
    print(f"distance after six steps {distance:.4f}")`,
            `rate 0.05: 5.0000 -> 4.8000 -> 4.6100 -> 4.4295 -> 4.2580 -> 4.0951 -> 3.9404
distance after six steps 2.9404
rate 0.3: 5.0000 -> 3.8000 -> 2.9600 -> 2.3720 -> 1.9604 -> 1.6723 -> 1.4706
distance after six steps 0.4706
rate 1.9: 5.0000 -> -2.6000 -> 4.2400 -> -1.9160 -> 3.6244 -> -1.3620 -> 3.1258
distance after six steps 2.1258
rate 2.0: 5.0000 -> -3.0000 -> 5.0000 -> -3.0000 -> 5.0000 -> -3.0000 -> 5.0000
distance after six steps 4.0000
rate 2.5: 5.0000 -> -5.0000 -> 10.0000 -> -12.5000 -> 21.2500 -> -29.3750 -> 46.5625
distance after six steps 45.5625`,
            {
              question: "Does crossing the minimum mean the walk has gone wrong?",
              hints: [
                "Start x and path inside the function so every rate gets the same starting point. Otherwise later rates would inherit an earlier walk's final location.",
                "The update has not changed from the previous challenge. Only learning_rate changes, and it remains constant during each walk.",
                "The last array entry is the final location. Compare its absolute distance from one with the initial distance of four, then look back at the intermediate entries to see whether the walk crossed the bottom.",
              ],
              check: numberCheck("What distance remains after six steps at a rate of 2.5?", 45.5625, 0.00005, "Crossing the bottom does not decide stability. At the rate of 1.9 the alternating positions get closer, while the rate of 2 repeats the same distance and 2.5 makes it grow. These thresholds belong to this curve's curvature."),
            },
          ),
          exercise(
            "Move two settings using two partial derivatives",
            [
              "Section 14 replaces one slope with a slope for each setting. The small loss function below lets us see why. It has its minimum when both settings are one, but changing the second setting affects the loss more sharply than changing the first.",
              "Complete gradient by differentiating the loss with respect to one setting at a time, holding the other fixed. Return both partial derivatives in a NumPy array in the same order as the settings. The supplied finite-difference check nudges one setting at a time to verify your calculation at the start.",
              "Then complete the update to move both settings at a rate of 0.3 for four steps. Print the derivatives and the fraction of each remaining distance left after the step. Both use one rate, but they should approach their minima at different speeds.",
            ],
            `import numpy as np

def loss(settings):
    first, second = settings
    return 0.5 * (first - 1) ** 2 + (second - 1) ** 2 + 2

def gradient(settings):
    first, second = settings
    # TODO: one partial derivative per setting, in the same order.
    raise NotImplementedError("Calculate both slopes")

settings = np.array([5.0, 5.0])
small_step = 0.001
measured = []
for axis in range(2):
    nudge = np.zeros(2)
    nudge[axis] = small_step
    measured.append((loss(settings + nudge) - loss(settings - nudge)) / (2 * small_step))
print(f"partial derivatives agree with nudges {np.allclose(gradient(settings), measured, rtol=0, atol=1e-8)}")

learning_rate = 0.3
for step in range(1, 5):
    derivatives = gradient(settings)
    before = np.abs(settings - 1)
    next_settings = None  # TODO: apply both movements together
    ratios = np.abs(next_settings - 1) / before
    print(f"step {step}: derivatives {derivatives[0]:.4f} and {derivatives[1]:.4f}, distance ratios {ratios[0]:.4f} and {ratios[1]:.4f}")
    settings = next_settings

print(f"final settings {settings[0]:.4f} and {settings[1]:.4f}")
print(f"final loss {loss(settings):.4f}")`,
            `import numpy as np

def loss(settings):
    first, second = settings
    return 0.5 * (first - 1) ** 2 + (second - 1) ** 2 + 2

def gradient(settings):
    first, second = settings
    return np.array([first - 1, 2 * (second - 1)])

settings = np.array([5.0, 5.0])
small_step = 0.001
measured = []
for axis in range(2):
    nudge = np.zeros(2)
    nudge[axis] = small_step
    measured.append((loss(settings + nudge) - loss(settings - nudge)) / (2 * small_step))
print(f"partial derivatives agree with nudges {np.allclose(gradient(settings), measured, rtol=0, atol=1e-8)}")

learning_rate = 0.3
for step in range(1, 5):
    derivatives = gradient(settings)
    before = np.abs(settings - 1)
    next_settings = settings - learning_rate * derivatives
    ratios = np.abs(next_settings - 1) / before
    print(f"step {step}: derivatives {derivatives[0]:.4f} and {derivatives[1]:.4f}, distance ratios {ratios[0]:.4f} and {ratios[1]:.4f}")
    settings = next_settings

print(f"final settings {settings[0]:.4f} and {settings[1]:.4f}")
print(f"final loss {loss(settings):.4f}")`,
            `partial derivatives agree with nudges True
step 1: derivatives 4.0000 and 8.0000, distance ratios 0.7000 and 0.4000
step 2: derivatives 2.8000 and 3.2000, distance ratios 0.7000 and 0.4000
step 3: derivatives 1.9600 and 1.2800, distance ratios 0.7000 and 0.4000
step 4: derivatives 1.3720 and 0.5120, distance ratios 0.7000 and 0.4000
final settings 1.9604 and 1.1024
final loss 2.4717`,
            {
              question: "What changes when the loss has two adjustable settings?",
              hints: [
                "When differentiating with respect to first, the term involving second is constant. Reverse their roles for the other partial derivative.",
                "The first squared term has a coefficient of one half. The second does not, so the two derivative formulas have different scale factors.",
                "NumPy multiplies each derivative by the same learning rate. Subtract that array of movements from the settings array to update both at once.",
              ],
              check: numberCheck("What is the final loss after four steps?", 2.4717, 0.00005, "The second direction is steeper, so the same learning rate closes more of its remaining distance. A gradient supplies a separate local slope for each setting, even when the update uses a single shared rate."),
            },
          ),
        ]}
      />
    </PrimerPage>
  );
}
