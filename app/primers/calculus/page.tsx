import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { DerivativeExplorer } from "@/components/widgets/DerivativeExplorer";
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
          You only need to know what a function and its graph are: a rule that
          turns an input into an output, drawn as a curve. Everything about rates,
          slopes and steps is built up from here.
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
          separately, saw that both reduced to one thing: how fast is this
          quantity changing right here, at this exact point. The tool they built
          to answer it is the derivative, and it is the whole of what this primer
          needs from calculus.
        </p>
      </PrimerSection>

      <PrimerSection title="Slopes and Rates of Change">
        <p>
          Everything in this primer rests on the idea of a slope, so we should
          build that first, on the easiest possible ground: a straight line. The
          slope of a line measures how much it climbs for every step you take
          across, and you compute it from any two points on the line by dividing
          the rise, how far up it went between them, by the run, how far across.
        </p>
        <Equation>{"slope = rise / run"}</Equation>
        <p>
          Suppose a line passes through the points (2, 3) and (6, 11). Between
          them it ran 4 across, from 2 to 6, and rose 8, from 3 to 11. Its slope
          is 8 divided by 4, which is 2: two up for every one across. Had it
          dropped between the two points the rise would come out negative, and so
          would the slope. A downhill line has a negative slope, and a flat line
          has a slope of zero, because it rises by nothing no matter how far it
          runs.
        </p>
        <p>
          Now the important reframing. A slope is not only a fact about a drawing;
          it is a rate of change. If the line&rsquo;s x-axis is time in hours and
          its y-axis is distance in miles, then rise over run is miles over
          hours, and the slope <em>is</em> your speed. Drive 100 miles in 2 hours
          and the line from start to finish has slope 50: fifty miles an hour.
          Though notice what kind of number that is. It is an average over the
          whole trip. At no single moment did the speedometer have to read 50;
          you may have been stopped at a light for some of it and doing 70 for
          the rest. An average over a stretch and a reading at an instant are
          different things, and the entire subject of this primer is closing the
          gap between them.
        </p>
      </PrimerSection>

      <PrimerSection title="The Average Rate of Change on a Curve">
        <p>
          A straight line has one slope everywhere, which is what made it easy. A
          curve does not. It might fall steeply in one place, flatten out, and
          climb somewhere else, so no single number describes its steepness. What
          we can still do is exactly what the odometer did: pick two points on
          the curve and measure the average between them.
        </p>
        <p>
          The straight line drawn through two points of a curve is called a
          secant, and its slope, rise over run again, is the average rate of
          change of the curve across that stretch. Let us make that concrete on
          the curve in the box below, which is the function
        </p>
        <Equation>{"f(x) = 0.5·x² − x + 2.5"}</Equation>
        <p>
          where f(x) is just the name for the curve&rsquo;s height at input x.
          Take the two points where x is 3 and x is 5. The heights there are
        </p>
        <Equation>{"f(3) = 0.5·9 − 3 + 2.5 = 4\nf(5) = 0.5·25 − 5 + 2.5 = 10"}</Equation>
        <p>
          so between them the curve rose from 4 to 10, a rise of 6, over a run of
          2. The secant through those two points has slope 3.
        </p>
        <Equation>{"average slope = (10 − 4) / (5 − 3) = 3"}</Equation>
        <p>
          That is what the box below shows on load: the base point sits at x = 3,
          the gap is 2, and the solid line through the two points has slope 3.00,
          exactly the number we just computed by hand. The dashed line and the
          second readout will be explained in a moment; for now, drag the base
          point around and watch the average slope change as the stretch of curve
          under it changes.
        </p>
        <PrimerPlayground>
          <DerivativeExplorer />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="Shrinking the Gap">
        <p>
          An average across a stretch is still not what we set out to find. We
          wanted the steepness of the curve at a single point, the speedometer
          reading rather than the trip average. And a single point, on its own,
          gives us nothing to divide: one point has no rise and no run. It looks
          like a dead end.
        </p>
        <p>
          Here is the move the whole of calculus is built on. If the average over
          a stretch is the wrong answer because the stretch is too wide, then
          shrink the stretch. Keep the base point at x = 3 and pull the second
          point in closer, computing the same rise over run every time. Each
          average is taken over a shorter piece of curve, so each is a better
          stand-in for the steepness right at the base. Working the arithmetic
          the same way we worked f(3) and f(5), this is what happens:
        </p>
        <Equation>{"gap    second point    average slope\n2.00   x = 5.00        3.00\n1.00   x = 4.00        2.50\n0.50   x = 3.50        2.25\n0.10   x = 3.10        2.05\n0.02   x = 3.02        2.01"}</Equation>
        <p>
          The averages are not wandering. They are marching straight toward 2,
          and the smaller the gap, the closer they sit to it: 3, then 2.5, then
          2.25, then 2.05, then 2.01. Every row of that table is a position of
          the gap slider in the box above, so you do not have to take our word
          for it. Slide the gap down from 2.00 and watch the average-slope
          readout walk through these exact numbers.
        </p>
        <p>
          The number the averages close in on, 2 here, is called the
          instantaneous rate of change of the curve at x = 3, and it is what the
          derivative <em>is</em>. Writing the gap as h, the definition says: take
          the average slope across a gap of h, and ask what value it approaches
          as h shrinks toward zero.
        </p>
        <Equation>{"f'(x) = (f(x + h) − f(x)) / h,   as the gap h shrinks toward 0"}</Equation>
        <p>
          The picture of the same process is the two lines in the widget. While
          the second point slides in, the solid secant rotates, and it settles
          onto the dashed line: the tangent, the one straight line that grazes
          the curve at the base point and runs alongside it there. The secant
          measures an average and the tangent is what the averages become, so the
          slope of the tangent is the derivative. That is why the two readouts
          meet as the gap closes.
        </p>
      </PrimerSection>

      <PrimerSection title="Computing a Derivative">
        <p>
          So far we have found the derivative at one point, x = 3, by watching
          numbers converge. That would be a miserable way to work if we had to do
          it point by point. The remarkable thing is that the definition above
          can be worked through with ordinary algebra, once, for every point at
          the same time. Let us actually do it for our curve, and you can watch
          every step; nothing is hidden.
        </p>
        <p>
          The recipe says: take the height at x + h, subtract the height at x,
          and divide by h. The height at x + h comes from substituting x + h into
          the function, and expanding the square:
        </p>
        <Equation>{"f(x + h) = 0.5·(x + h)² − (x + h) + 2.5\n        = 0.5·x² + x·h + 0.5·h² − x − h + 2.5"}</Equation>
        <p>
          Now subtract f(x), which is 0.5·x² − x + 2.5. The 0.5·x², the −x and
          the 2.5 all cancel, because they appear in both, and only the terms
          that involve h survive:
        </p>
        <Equation>{"f(x + h) − f(x) = x·h + 0.5·h² − h"}</Equation>
        <p>
          Divide by h, and every term loses one h:
        </p>
        <Equation>{"(f(x + h) − f(x)) / h = x + 0.5·h − 1"}</Equation>
        <p>
          And there is the whole story in one line. The average slope across a
          gap of h is x + 0.5·h − 1: the number x − 1, plus half the gap. At the
          base x = 3 that is 2 plus half the gap, and you can check it against
          the table in the last section, where a gap of 1 gave 2.5 and a gap of
          0.1 gave 2.05. The table was never mysterious; it was this formula in
          disguise. And now the limit costs nothing: as h shrinks toward zero,
          the 0.5·h term dies away, and what remains is the derivative,
        </p>
        <Equation>{"f'(x) = x − 1"}</Equation>
        <p>
          one clean formula for the slope at <em>every</em> point of the curve at
          once. At x = 3 it says the slope is 2, which is what the table found.
          Drag the base point anywhere in the widget above and the derivative
          readout will be x − 1 to the last digit, because this formula is
          exactly what the server computes.
        </p>
      </PrimerSection>

      <PrimerSection title="Where the Derivative Is Zero">
        <p>
          With f&rsquo;(x) = x − 1 in hand, read what it says about the shape of
          the curve. Left of x = 1 it is negative, so the tangent tilts downhill
          and the curve is falling. Right of x = 1 it is positive, so the curve
          is rising. And at exactly x = 1 it is zero: the curve has stopped
          falling and not yet begun to rise, the tangent lies flat, and that is
          the floor of the bowl.
        </p>
        <Equation>{"f'(x) = x − 1 = 0   →   x = 1\nf(1) = 0.5 − 1 + 2.5 = 2"}</Equation>
        <p>
          So the lowest point of this curve sits at (1, 2), and we found it
          without looking at the drawing at all: we set the derivative to zero
          and solved. That is the classic calculus route to a minimum, and for a
          curve this simple it is the whole job.
        </p>
        <p>
          One honest caution before we lean on this. A zero derivative marks any
          flat spot, and the bottom of a valley is not the only place a curve
          lies flat: the top of a hill is flat too. The two-valley curve in the
          next section has three flat spots, the floor of each valley and the
          crest of the hill between them, and the derivative is zero at all
          three. What separates a floor from a crest is the sign pattern around
          it: at a floor the curve falls in and rises out, negative to positive,
          while at a crest it rises in and falls out. Zero alone says
          &ldquo;flat&rdquo;; the neighbourhood says which kind of flat.
        </p>
      </PrimerSection>

      <PrimerSection title="Finding the Bottom by Walking">
        <p>
          Solving f&rsquo;(x) = 0 worked because x − 1 = 0 is an equation a child
          can solve. The error of a real model is also a curve with a bottom we
          want, though it is a curve in many settings at once, and setting its
          derivative to zero produces a tangle of simultaneous equations that
          usually cannot be solved outright. So we keep the insight, the bottom
          is where the slope is zero, and give up on jumping there in one
          algebraic step. Instead we walk, and we use the derivative the other
          way: not as an equation to solve but as a direction to follow.
        </p>
        <p>
          Picture standing on a hillside in thick fog. You cannot see the valley
          floor, only the ground at your feet, but the slope underfoot still
          tells you which way is down: if the slope is negative, downhill is to
          the right, and if it is positive, downhill is to the left. So you step
          downhill, read the slope again where you land, and step again. Because
          the ground flattens as you approach the bottom, the slopes you read
          get smaller, and if you size each step by the slope itself the steps
          shrink on their own, until you stand somewhere level with nowhere lower
          to go. That procedure is called gradient descent, and the box below
          runs it before your eyes.
        </p>
        <PrimerPlayground>
          <GradientDescentPlayground />
        </PrimerPlayground>
        <p>
          Click anywhere on the curve to choose a start and watch the walk come
          down. Each dot is one step. The dashed line is the tangent at the
          start, the very line the derivative sections built, and you can see the
          first stride is long exactly because the slope there is steep. Near the
          floor the dots crowd together as the slopes, and with them the steps,
          die away toward zero. The walk stops where the derivative told us it
          would: at x = 1, height 2.
        </p>
        <p>
          Now switch to the two-valley curve, and the caution from the last
          section becomes something you can watch. Start on the left of the
          central hill and the walk settles in the left valley; start on the
          right and it settles in the right one. The walk only ever follows the
          slope downhill, so it cannot climb the hill between the valleys to
          check whether the far side is deeper. Gradient descent finds a nearby
          bottom, not necessarily the lowest one, and every model that fits
          itself this way inherits that limitation.
        </p>
      </PrimerSection>

      <PrimerSection title="The Learning Rate">
        <p>
          There is one choice in the walk that we have not pinned down: how far
          to move on each step. The slope gives a direction and a magnitude, but
          we still choose how boldly to act on it, and that choice is a number of
          its own, the learning rate, written η. Each step moves against the
          slope, scaled by η:
        </p>
        <Equation>{"x  ←  x − η · f'(x)"}</Equation>
        <p>
          For our bowl we know the derivative exactly, f&rsquo;(x) = x − 1, so
          for once we can see precisely what this rule does rather than guessing.
          Substitute it in:
        </p>
        <Equation>{"x  ←  x − η·(x − 1)"}</Equation>
        <p>
          Subtract 1 from both sides, and the rule becomes a statement about the
          distance between where we stand and the floor at x = 1:
        </p>
        <Equation>{"(x − 1)  ←  (1 − η) · (x − 1)"}</Equation>
        <p>
          Every step multiplies our distance from the bottom by the same factor,
          1 − η. The entire behaviour of the walk is in that one factor:
        </p>
        <Equation>{"η = 0.3   factor  0.7    each step closes 30% of the distance\nη = 1.0   factor  0.0    one step lands exactly on the floor\nη = 1.9   factor −0.9    overshoots to the far side, yet shrinks\nη = 2.0   factor −1.0    hops between two mirror points forever\nη = 2.5   factor −1.5    grows every step: the walk runs away"}</Equation>
        <p>
          Every line of that table is something you can do to the slider above.
          At the default 0.30 the walk glides down one side, each step closing
          30% of what remains. At 1.00 it lands on the floor in a single stride.
          Just below 2 the factor is negative but still smaller than one, so the
          walk crosses the bowl on every step, zigzagging from wall to wall while
          the hops shrink; it looks alarming and is still converging. And past 2
          each hop is longer than the last, the walk climbs out of the bowl, and
          the widget reports it diverged. The threshold sits at 2 for this bowl
          because of its particular steepness; a sharper curve turns unstable at
          a smaller η and a gentler one tolerates a larger, though the pattern,
          converge below some threshold and run away above it, is universal.
        </p>
        <p>
          That is the trade the learning rate sets. Too small wastes steps, too
          large diverges, and the workable range in between is found by exactly
          the kind of experiment the slider lets you run.
        </p>
      </PrimerSection>

      <PrimerSection title="Why Every Model Uses This">
        <p>
          None of this is a detour from machine learning; it is the engine
          underneath it. Fitting a model means choosing the settings that make
          its mistakes as small as possible, and as small as possible is the
          bottom of a curve, the model&rsquo;s error plotted against its
          settings. The model reads the slope of that error and steps downhill,
          sized by a learning rate, exactly the walk you just drove. The only
          real difference is how many directions there are to step in at once:
          our curve has a single input, so we can draw it flat on the page, while
          a real model&rsquo;s error has one input for every setting it tunes,
          far too many to picture. But the step is the same one, taken in all of
          them together, and everything you just watched, the shrinking steps,
          the nearby valley, the rate that is too hot, happens there too.
        </p>
      </PrimerSection>
    </PrimerPage>
  );
}
