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
    "What a derivative is, built from the average rate of change, and how following it downhill finds the lowest point of a curve.",
};

export default function CalculusPrimerPage() {
  return (
    <PrimerPage
      title="Calculus Primer"
      tagline="What a derivative is, built up from the average rate of change, and how following it downhill finds the lowest point of a curve."
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

      <PrimerSection title="The Average Rate of Change">
        <p>
          Before we can talk about the steepness of a curve, we should be clear
          about what steepness even means, and the cleanest example is speed.
          Speed is a rate of change: distance changing over time. If you drive 100
          miles in 2 hours, your average speed for the trip is 100 divided by 2,
          fifty miles an hour. That is a real number, but it is an average over
          the whole two hours, and at no single moment does the speedometer have
          to read it. You might have been stopped at a light, or well over fifty
          on the motorway.
        </p>
        <p>
          The same split shows up on any graph. Take a curve and mark two points
          on it. The straight line through those two points is called a secant,
          and its slope is the rise, how far the curve climbed between them,
          divided by the run, how far along we went. That slope is the average
          rate of change of the curve between the two points, in just the way
          fifty miles an hour was the average over the trip.
        </p>
        <p>
          Drag the base point in the box below to move where you are looking, and
          use the gap slider to set how far apart the two points are. The solid
          line is the secant, and the number beside it is its slope, the average
          rate of change across that gap.
        </p>
        <PrimerPlayground>
          <DerivativeExplorer />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="From a Stretch to a Point">
        <p>
          An average across a stretch is not quite what we are after. We wanted
          the steepness of the curve at a single point, the instantaneous rate,
          the speedometer reading rather than the trip average. The secant cannot
          give us that on its own, because one point is not two points and has no
          line through it by itself.
        </p>
        <p>
          Here is the move the whole of calculus is built on. Keep the base point
          fixed and slide the second point toward it, shrinking the gap on the
          slider above. The secant still measures an average, but over a shorter
          and shorter stretch, so it becomes a better and better stand-in for the
          steepness right at the base. As the gap closes, watch the two numbers in
          the readout, the average slope and the derivative, come together: the
          average rate of change is homing in on a single value.
        </p>
        <p>
          That value, the one the secant approaches as the gap shrinks to nothing,
          is the instantaneous rate of change at the base point. In the limit the
          two points merge, and the secant stops cutting across the curve and
          instead just grazes it: it has become the tangent, the dashed line. The
          slope of that tangent is the derivative, and we write it f&rsquo;(x).
        </p>
        <Equation>{"f'(x) = the slope the secant approaches as the gap shrinks to zero"}</Equation>
        <p>
          Now that we can read the steepness at any single point, drag the base
          point along the curve and watch the derivative change with it. On the
          way down the tangent tilts downhill and the derivative is negative, on
          the way up it tilts uphill and the derivative is positive, and at the
          very bottom, where the curve stops falling and turns to rise, the tangent
          is flat and the derivative is exactly zero.
        </p>
        <Equation>{"f'(x) = 0   at the bottom of the curve"}</Equation>
        <p>
          So the derivative does two jobs at once. It measures how steep the curve
          is at a point, and by its sign it says which way is downhill. Both of
          those are about to matter.
        </p>
      </PrimerSection>

      <PrimerSection title="Finding the Lowest Point">
        <p>
          We want the lowest point of a curve, and we now know something exact
          about it: it sits where the derivative is zero. That hands us one way to
          find it. Write down the derivative, set it equal to zero, and solve for
          x. For the neat curves in a textbook that is the whole job.
        </p>
        <p>
          It stops working the moment the curve gets complicated. The error of a
          real model is a curve too, but one we often cannot even write down
          cleanly, let alone set to zero and solve. So we give up on solving for
          the bottom and find it by walking instead, using the derivative not as
          an equation to solve but as a direction to follow.
        </p>
        <p>
          That is the second job the derivative does: it points downhill. Picture
          standing on a hillside in thick fog. You cannot see the valley floor,
          only the ground at your feet, but the slope underfoot still tells you
          which way is down. So you take a step that way, read the slope again
          where you land, and step again. Every step follows the slope downward,
          and because the ground flattens as you near the bottom, the steps shrink
          on their own, until you are standing somewhere level with nowhere lower
          to go. That process is gradient descent, and the box below runs it.
        </p>
        <PrimerPlayground>
          <GradientDescentPlayground />
        </PrimerPlayground>
        <p>
          Drag the start point and watch the walk come down. The steps are long
          where the wall is steep and short where the curve levels off, because
          each step is sized by the slope it stands on, the very slope the tangent
          measured a moment ago. The dashed line marks the tangent at the start,
          so you can see the first step is set by the slope there.
        </p>
        <p>
          Switch to the two-valley curve and a limitation shows itself. The walk
          only follows the slope down into whichever valley it started above, and
          once it reaches the bottom the ground rises on both sides, so it stops,
          even if the other valley is deeper. Gradient descent finds a nearby
          bottom, not necessarily the lowest one, and the models that use it
          inherit that.
        </p>
      </PrimerSection>

      <PrimerSection title="The Learning Rate">
        <p>
          There is one thing the walk needs that we have skated over: how far to
          move on each step. The slope gives the direction and a sense of the
          steepness, but it does not say how boldly to commit to it, and that
          choice is a number of its own, the learning rate. Written η, it simply
          scales each step.
        </p>
        <Equation>{"x  ←  x − η · f'(x)"}</Equation>
        <p>
          Read that as: to get the next point, take the current one and move
          against the slope by η times the slope. The size of η matters more than
          it looks. Set it small and the walk is timid, inching down and taking
          far more steps than it needs. Set it large and each step can carry clean
          past the bottom and land higher up the opposite wall, and the next step
          carries back further still, so instead of settling the walk climbs
          outward and runs away.
        </p>
        <p>
          Somewhere between timid and reckless is a rate that reaches the bottom in
          a handful of steps. For the single bowl above the dividing line is
          exact: any rate below 2 settles, any rate above 2 runs away. Turn the
          slider past 2 and watch the walk stop converging and start escaping.
        </p>
      </PrimerSection>

      <PrimerSection title="Why Every Model Uses This">
        <p>
          None of this is a detour from machine learning; it is the engine
          underneath it. Fitting a model means choosing the settings that make its
          mistakes as small as possible, and as small as possible is the bottom of
          a curve, the model&rsquo;s error plotted against its settings. The model
          reads the slope of that error and steps downhill, which is the walk you
          just drove. The only real difference is how many directions there are to
          step in at once: this curve has a single input, so we can draw it flat on
          the page, while a real model&rsquo;s error has one input for every
          setting it tunes, far too many to picture. But the step is the same one,
          taken in all of them together.
        </p>
      </PrimerSection>
    </PrimerPage>
  );
}
