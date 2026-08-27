import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
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
    "What a derivative is, built up from slopes and average rates of change, with every step worked in numbers you can check against the live curve.",
};

export default function CalculusPrimerPage() {
  return (
    <PrimerPage
      title="Calculus Primer"
      tagline="What a derivative is, built up from slopes and average rates of change, and how following it downhill finds the lowest point of a curve."
      prerequisites={
        <>
          You only need to know what a function and its graph are, a rule that
          turns an input into an output, drawn as a curve. Everything about
          rates, slopes and steps is built up from here.
        </>
      }
    >
      <PrimerSection title="Where This Came From">
        <p>
          By the late 1600s, two questions kept coming up in different fields and
          turning out to be the same question underneath. One was the speed of
          something whose position never stopped changing, a planet or a falling
          stone, at a single instant rather than averaged over an interval. The
          other was the highest or lowest point of a curve, the moment a thrown
          ball stops rising or a cost stops falling. Newton and Leibniz, working
          separately, saw that both reduced to one question, how fast is this
          quantity changing right here, at this exact point. The tool they built
          to answer it is the derivative, and it is the whole of what this primer
          needs from calculus.
        </p>
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
          The remarkable thing is that the shrinking-gap calculation can be
          carried out with the gap left as the letter h and the base left as the
          letter x, which does every point at once. What comes out is not a
          number but a formula, a rule that returns the slope at whichever point
          you hand it. That is the next section, and it is ordinary algebra
          throughout.
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
        <p>
          The second-to-last line is the one worth pausing on. It says the
          average slope across a gap of h is x − 1 plus half the gap. At the base
          x = 3 that is 2 plus half the gap, so a gap of 1 gives 2.5 and a gap of
          0.1 gives 2.05, which are two of the rows in the table from section 4.
          That table was never mysterious. It was this formula in disguise, and
          the limit costs nothing once you can see the h sitting there on its
          own.
        </p>
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
          Those three readings are enough to find the bottom of a curve, which is
          what the rest of this primer does with them.
        </p>
      </PrimerSection>

      <PrimerSection title="9. Flat Points and Minima">
        <p>
          A minimum is flat at its bottom. That is the observation, and it turns
          finding the lowest point into solving an equation, since flat means the
          derivative is zero.
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
        <p>
          Solving f&rsquo;(x) = 0 worked because x − 1 = 0 is about as easy as an
          equation gets. Pluck a function at random and it is unlikely to be that
          obliging. The error of a real model is also a curve with a bottom we
          want, though it is a curve in many settings at once, and setting its
          derivative to zero produces a tangle of simultaneous equations that
          usually cannot be solved outright.
        </p>
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
          caption="Every column falls toward zero as the walk nears x = 1, and the strides shrink on their own because the slope that sizes them is shrinking."
        />
        <p>
          Nothing tells the walk to slow down. It slows because the ground
          flattens, and the step is sized by the slope it reads.
        </p>
      </PrimerSection>

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
          The walk only ever follows the slope downhill, so it cannot climb the
          hill between the valleys to check whether the far side is deeper. It
          finds a nearby bottom, which is called a local minimum, and the lowest
          bottom anywhere, the global minimum, may be somewhere it never looks.
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
        <p>
          With one setting there is a loss L(θ), one derivative, and two
          directions to move, left or right. With two settings there is a loss
          L(θ₁, θ₂), and the picture becomes a surface rather than a line. There
          is no single slope on a surface, because the ground can tilt one way as
          you walk east and another as you walk north. What there is instead is
          one slope per direction, found by asking how the loss changes as you
          vary one setting while holding the other still. Each of those is called
          a partial derivative.
        </p>
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
    </PrimerPage>
  );
}
