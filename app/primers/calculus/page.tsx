import type { Metadata } from "next";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { GradientDescentPlayground } from "@/components/widgets/GradientDescentPlayground";

export const metadata: Metadata = {
  title: "Calculus Primer · oop_ml",
  description:
    "The one idea from calculus the rest of the site runs on: the slope of a curve, and how following it downhill finds the lowest point.",
};

// Equations get their own line, set like a code block, never inside a sentence.
function Equation({ children }: { children: string }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {children}
    </pre>
  );
}

export default function CalculusPrimerPage() {
  return (
    <ConceptPage
      title="Calculus Primer"
      tagline="The one idea from calculus the rest of the site runs on: the slope of a curve, and how following it downhill finds the lowest point."
      prerequisites={
        <>
          You only need to know what a function and its graph are: a rule that
          turns an input into an output, drawn as a curve. Everything about
          slopes and steps is built up from here.
        </>
      }
      history={
        <>
          <p>
            By the late 1600s, two questions kept coming up in different fields
            and turning out to be the same question underneath. One was the speed
            of something whose position never stopped changing, a planet or a
            falling stone, at a single instant rather than averaged over an
            interval. The other was the highest or lowest point of a curve, the
            moment a thrown ball stops rising or a cost stops falling. Newton and
            Leibniz, working separately, saw that both reduced to one thing: how
            fast is this quantity changing right here, at this exact point. The
            tool they built to answer it is the derivative.
          </p>
          <p>
            The lowest-point question is the one we care about most here. Fitting
            a model means choosing its settings so its error is as small as
            possible, and as small as possible is just the bottom of a curve. If
            we can measure how the error changes as we nudge a setting, we know
            which way is downhill and can follow it. That measurement is the
            derivative, and following it downhill is gradient descent, which is
            how most of the models on this site are actually fit.
          </p>
        </>
      }
      playground={<GradientDescentPlayground />}
      layperson={
        <>
          <p>
            Picture standing on a hillside in thick fog. You want the lowest point
            of the valley, but you can only see the ground right at your feet.
            What you can still tell is which way it slopes and how steeply, so you
            take a step downhill, look again, and step again. As the ground
            flattens out your steps get smaller, until you are standing where it
            is level and there is nowhere lower to go.
          </p>
          <p>
            That slope under your feet is the derivative, and those steps are
            gradient descent. Drag the start point in the box above and watch the
            walk slide toward the bottom. The steeper the ground, the bigger the
            step it takes, which is why the steps are long up on the wall and tiny
            near the floor.
          </p>
          <p>
            There is one way to get it wrong, and the widget will show it. If each
            step is too big, you stride straight past the bottom and land higher
            up the far side, then overshoot again on the way back, until you are
            bouncing further out each time instead of settling. Turning the
            learning rate up finds that point.
          </p>
        </>
      }
      technical={
        <>
          <p>
            The derivative of a function at a point is the slope of the tangent,
            the straight line that just grazes the curve there. We write it as
            f&rsquo;(x). Where the curve falls the slope is negative, where it
            rises it is positive, and at the bottom, where it turns around, it is
            exactly zero. That last fact is the one we use: the lowest point is
            where the derivative is zero.
          </p>
          <Equation>{"f'(x) = 0   at the lowest point"}</Equation>
          <p>
            Gradient descent reaches that point without solving for it. From
            wherever we stand we step against the slope, scaled by a number η
            called the learning rate.
          </p>
          <Equation>{"x  ←  x − η · f'(x)"}</Equation>
          <p>
            When the slope is steep the step is large, and as the curve flattens
            toward the bottom the slope shrinks and the steps shrink with it,
            until they move the point less than we care about and we stop. The
            dashed line in the widget is the tangent at the start, so you can see
            that the slope really is what sets the first step.
          </p>
          <p>
            The learning rate is the one delicate choice. Too small and the walk
            crawls, taking far more steps than it needs. Too large and each step
            jumps past the bottom to a point higher up the far side, and the next
            jumps back further still, so the walk climbs out instead of settling.
            For the single bowl above the threshold is exact: the walk converges
            for any rate below 2 and runs away above it. Push the slider past 2
            and watch it happen.
          </p>
          <p>
            The models on this site do the same thing in more dimensions. Fitting
            is minimising an error, the error is a function of the settings, and
            gradient descent walks its slope down to the bottom. The curve here
            has one input so we can draw it; a real model&rsquo;s error has one
            input per setting, but the step is the same.
          </p>
        </>
      }
    />
  );
}
