import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { GradientDescentPlayground } from "@/components/widgets/GradientDescentPlayground";

export const metadata: Metadata = {
  title: "Calculus Primer · oop_ml",
  description:
    "What a derivative is, and how following it downhill finds the lowest point of a curve, which is how the models on this site are fit.",
};

export default function CalculusPrimerPage() {
  return (
    <PrimerPage
      title="Calculus Primer"
      tagline="What a derivative is, and how following it downhill finds the lowest point of a curve."
      prerequisites={
        <>
          You only need to know what a function and its graph are: a rule that
          turns an input into an output, drawn as a curve. Everything about
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
          to answer it is the derivative.
        </p>
      </PrimerSection>

      <PrimerSection title="What a Derivative Is">
        <p>
          A derivative measures how fast one quantity changes as another changes.
          For a curve on a graph that rate has a picture: it is the slope of the
          curve, how steeply it climbs or falls at a given point.
        </p>
        <p>
          The catch is that a curve&rsquo;s steepness is different at every point,
          so there is no single slope for the whole thing. The derivative pins it
          down one point at a time. At any point, picture the straight line that
          just grazes the curve there without crossing it, the tangent. The slope
          of that tangent is the derivative at that point, and we write it
          f&rsquo;(x).
        </p>
        <p>
          Its sign alone tells you which way the curve is heading. Where the curve
          is falling the tangent tilts down and the derivative is negative, where
          it is rising the derivative is positive, and at the exact top or bottom,
          where the curve stops going one way and turns to go the other, the
          tangent is flat and the derivative is zero.
        </p>
        <Equation>{"f'(x) = 0   where the curve turns around"}</Equation>
        <p>
          That last case is the one the rest of this primer is built on: the
          lowest point of a curve is a place where its derivative is zero.
        </p>
      </PrimerSection>

      <PrimerSection title="Finding the Lowest Point">
        <p>
          Knowing the bottom sits where the derivative is zero, one option is to
          solve f&rsquo;(x) = 0 for x directly. For a simple curve that works, but
          most curves worth minimising are far too tangled to solve by hand. So
          instead of solving for the bottom, we walk to it.
        </p>
        <p>
          Picture standing on a hillside in thick fog. You want the lowest point
          of the valley, but you can only see the ground at your feet. What you
          can still tell is which way it slopes and how steeply, so you step
          downhill, look again, and step again. As the ground flattens your steps
          shrink, until you are standing where it is level and there is nowhere
          lower to go. That is gradient descent, and the box below does exactly
          it.
        </p>
        <PrimerPlayground>
          <GradientDescentPlayground />
        </PrimerPlayground>
        <p>
          Drag the start point and watch the walk slide toward the bottom. The
          steeper the ground the bigger the step, which is why the steps are long
          up on the wall and short near the floor, and the dashed line is the
          tangent at the start, so you can see the slope is what sets the first
          step.
        </p>
        <p>
          Switch to the two-valley curve and a limit shows up. The walk only ever
          finds the valley on the side it started, never climbing the hill between
          them to reach the other. Gradient descent finds a nearby bottom, not
          always the lowest one, and the models inherit that.
        </p>
      </PrimerSection>

      <PrimerSection title="The Learning Rate">
        <p>
          Each step moves against the slope, scaled by a number called the
          learning rate.
        </p>
        <Equation>{"x  ←  x − η · f'(x)"}</Equation>
        <p>
          It is the one delicate choice. Too small and the walk crawls, taking
          many more steps than it needs. Too large and each step jumps clean past
          the bottom to a point higher up the far side, and the next jumps back
          further still, so the walk climbs out instead of settling. For the
          single bowl the threshold is exact: it converges for any rate below 2
          and runs away above it. Push the slider past 2 and watch it happen.
        </p>
      </PrimerSection>

      <PrimerSection title="Why Every Model Uses This">
        <p>
          Fitting a model means choosing its settings so its error is as small as
          possible, and as small as possible is just the bottom of a curve. The
          error is a function of the settings, and gradient descent walks its
          slope down to that bottom, which is how most of the models on this site
          are actually fit. The curve here has one input so we can draw it; a real
          model&rsquo;s error has one input for every setting it tunes, but the
          step is exactly the same.
        </p>
      </PrimerSection>
    </PrimerPage>
  );
}
