import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { GradientDescentPlayground } from "@/components/widgets/GradientDescentPlayground";
import { TangentExplorer } from "@/components/widgets/TangentExplorer";

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
          to answer it is the derivative, and it is the whole of what this primer
          needs from calculus.
        </p>
      </PrimerSection>

      <PrimerSection title="What a Derivative Is">
        <p>
          Start with a straight line, because its steepness is easy. A line has
          one slope everywhere, and you measure it by taking any two points on it
          and dividing the rise, how far it climbed, by the run, how far it went
          across. A slope of 2 means two steps up for every step across; a slope
          of −0.5 means half a step down for every step across.
        </p>
        <p>
          A curve is harder, because its steepness keeps changing. It might be
          plunging in one place, drifting almost flat in another, and climbing
          somewhere else, so there is no single slope to report for the whole of
          it. What we can still ask is a narrower question: how steep is the curve
          right here, at this one point?
        </p>
        <p>
          To answer it, picture zooming in on that point until the curve looks
          straight, or, what comes to the same thing, draw the one straight line
          that just touches the curve there and runs alongside it without cutting
          across. That line is the tangent, and its slope is the steepness of the
          curve at that point. That slope is the derivative, and we write it
          f&rsquo;(x): the derivative at the input x.
        </p>
        <PrimerPlayground>
          <TangentExplorer />
        </PrimerPlayground>
        <p>
          Drag the point along the curve and watch the tangent tilt to match. Two
          things are worth noticing. First, the sign of the slope tells you which
          way the curve is heading: on the way down the tangent tilts downhill and
          the slope is negative, and on the way up it tilts uphill and the slope
          is positive. Second, and this is the part everything later leans on, as
          you drag toward the bottom the tangent flattens, and at the very bottom,
          where the curve stops falling and turns to rise, it is perfectly level
          and the slope is exactly zero.
        </p>
        <Equation>{"f'(x) = 0   at the bottom of the curve"}</Equation>
        <p>
          So the derivative does two jobs at once. It measures how steep the curve
          is, and by its sign it says which way is downhill. Both of those are
          about to matter.
        </p>
      </PrimerSection>

      <PrimerSection title="Finding the Lowest Point">
        <p>
          We want the lowest point of a curve, and we now know something exact
          about it: it sits where the slope is zero. That hands us one way to find
          it. Write down the derivative, set it equal to zero, and solve for x.
          For the neat curves in a textbook that is the whole job.
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
          showed you in the last section. The dashed line marks the tangent at the
          start, so you can see the first step is set by the slope there.
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
          step in at once: this curve has a single input, so we can draw it flat
          on the page, while a real model&rsquo;s error has one input for every
          setting it tunes, far too many to picture. But the step is the same one,
          taken in all of them together.
        </p>
      </PrimerSection>
    </PrimerPage>
  );
}
