import type { Metadata } from "next";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { LineFitPlayground } from "@/components/widgets/LineFitPlayground";

export const metadata: Metadata = {
  title: "Simple linear regression · oop_ml",
  description:
    "The oldest method in machine learning: fit a straight line to a cloud of points, and see what best fit really means.",
};

// Equations get their own line and are set like a code block, never stuffed
// into a sentence. LaTeX is not available here, so the notation is plain
// monospace text laid out to read.
function Equation({ children }: { children: string }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {children}
    </pre>
  );
}

export default function SimpleLinearRegressionPage() {
  return (
    <ConceptPage
      title="Simple linear regression"
      tagline="Draw the one straight line that comes closest to a cloud of points, and see what closest really means."
      prerequisites={
        <>
          You only need to know what a straight line is. It has a slope that
          tilts it and an intercept that slides it up and down. Everything else
          is built up from here.
        </>
      }
      history={
        <>
          <p>
            In the 1800s, astronomers had a significant problem reconciling what
            they understood against their measurements. Every night they
            measured the position of a comet or a planet, and each measurement
            disagreed slightly with the expected outcomes, due to the
            instruments being imperfect and the earth&rsquo;s relative movement
            through space. The more significant issue though was the
            understanding of physics at the time. They had data, they
            didn&rsquo;t have all of the variables to fully comprehend it. This
            is where statistical and probabilistic tools come into play.
          </p>
          <p>
            The simplest version of that problem has a clean answer, and it came
            from Gauss and Legendre at around the same time. Suppose you believe
            two features, such as height and weight, are related, and you have a
            scatter of measurements of thousands of people. How would you show
            that they&rsquo;re related? You could try to find a line that fits any
            height to any weight, though as you know there will be no line that
            will perfectly fit them, because height does not fully explain weight
            nor the other way around. So you stop asking for a line through the
            points and ask instead for the line that provides the
            &ldquo;best&rdquo; predictive power.
          </p>
          <p>
            You could try to find that line by brute force, though as we know,
            with the calculus we can use derivatives to find the minimum of
            something. In this case, we can find the line that minimizes the error
            between our observations and our predictions. So, we simply need to
            define a function to minimize against. There are many choices that we
            could make, though the simplest example would be the sum of squared
            distances, which is really a fancy way of saying, &ldquo;on average,
            how far off was my prediction from the actual value for the
            observation?&rdquo;
          </p>
        </>
      }
      playground={<LineFitPlayground />}
      layperson={
        <>
          <p>
            Think of each dot in the box above as one person, placed by their
            height along the bottom and their weight up the side. A tall, heavy
            person sits toward the upper right, a short, light person toward the
            lower left. The blue line is a guess at someone&rsquo;s weight from
            their height alone: find their height along the bottom, go up to the
            line, and that is the weight the line would predict for them.
          </p>
          <p>
            No line gets everyone right, because two people of the same height
            rarely weigh exactly the same. The short grey stalks show how wrong
            the line is for each person, the gap between the weight it predicted
            and what they actually weigh. The line is placed to make those gaps,
            taken all together, as small as they can be. Drag one dot well away
            from the rest, some person who is unusually heavy for their height,
            and the line leans toward them, because the line is now very wrong
            about that person and being that wrong counts for a lot.
          </p>
          <p>
            The <strong>R²</strong> number is a score from 0 to 1 for how well
            height explains weight here. When the dots sit close to a single line,
            height predicts weight well and the score is near 1. When they are
            spread out with no trend, height tells you almost nothing about weight
            and the score is near 0.
          </p>
        </>
      }
      technical={
        <>
          <p>
            The model is a straight line. It has a slope, written β, and an
            intercept, written α.
          </p>
          <Equation>{"ŷ = βx + α"}</Equation>
          <p>
            Fitting the line means choosing the slope and intercept so the line
            misses the points by as little as possible. The measure of the total
            miss is the residual sum of squares: for every point, take its
            vertical distance to the line, square that distance, and add the
            squares up.
          </p>
          <Equation>{"RSS = Σ(yᵢ − ŷᵢ)²"}</Equation>
          <p>
            That total is a smooth function of the slope and intercept, so its
            lowest point, the least squares fit, is where both partial
            derivatives are zero. Those two conditions solve for the slope and
            intercept directly. There is no iteration and no search, only a
            formula.
          </p>
          <Equation>{"β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²\nα = ȳ − β·x̄"}</Equation>
          <p>
            The grey sticks in the plot are the residuals, the vertical gaps
            between each point and the line. The fit makes the sum of their
            squares as small as it can be, and that is why one far-off point
            pulls the line so hard. Its residual is large, and squaring a large
            number makes it larger still, so the fit moves to bring that point
            closer even at the expense of the others.
          </p>
          <p>
            R² reports how much of the variation in the data the line explains.
            It measures the residual sum of squares against the total sum of
            squares, which is the variation left when you fit no line at all and
            predict the average every time.
          </p>
          <Equation>{"R² = 1 − RSS / TSS\nTSS = Σ(yᵢ − ȳ)²"}</Equation>
          <p>
            One arrangement of the data has no answer. If every point shares the
            same x, the spread in x is zero, so the denominator of the slope is
            zero and the slope is undefined.
          </p>
          <Equation>{"Σ(xᵢ − x̄)² = 0"}</Equation>
          <p>
            A correct fit reports that rather than returning a line. Enter points
            above that share a single x, and the fit comes back as an error, not
            a number.
          </p>
        </>
      }
    />
  );
}
