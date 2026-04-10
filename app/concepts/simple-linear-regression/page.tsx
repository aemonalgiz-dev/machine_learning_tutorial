import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { LineFitPlayground } from "@/components/widgets/LineFitPlayground";

export const metadata: Metadata = {
  title: "Simple linear regression · oop_ml",
  description:
    "Fit a straight line to model the relationship between two sets of data, with the whole fit worked by hand on five people you can load into the live example.",
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
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Think of each dot in the box above as one person, placed by their
                height along the bottom and their weight up the side. A tall,
                heavy person sits toward the upper right, a short, light person
                toward the lower left. The blue line is a guess at
                someone&rsquo;s weight from their height alone: find their height
                along the bottom, go up to the line, and that is the weight the
                line would predict for them.
              </p>
              <p>
                No line gets everyone right, because two people of the same
                height rarely weigh exactly the same. The short grey stalks show
                how wrong the line is for each person, the gap between the weight
                it predicted and what they actually weigh. The line is placed to
                make those gaps, taken all together, as small as they can be.
                Drag one dot well away from the rest, some person who is
                unusually heavy for their height, and the line leans toward them,
                because the line is now very wrong about that person and being
                that wrong counts for a lot.
              </p>
              <p>
                The <strong>R²</strong> number is a score from 0 to 1 for how
                well height explains weight here. When the dots sit close to a
                single line, height predicts weight well and the score is near 1.
                When they are spread out with no trend, height tells you almost
                nothing about weight and the score is near 0.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The model is a straight line. It has a slope, written β, and an
                intercept, written α, and for any height x it predicts a weight
                ŷ.
              </p>
              <Equation>{"ŷ = βx + α"}</Equation>
              <p>
                Fitting the line means choosing β and α so the line misses the
                points by as little as possible, and before anything can be
                fitted we have to say what &ldquo;as little as possible&rdquo;
                means. For each person, the line&rsquo;s miss is the vertical gap
                between the weight it predicted and the weight we measured. That
                gap is called a residual, and it is what the grey stalks in the
                box draw.
              </p>
              <Equation>{"residual = yᵢ − ŷᵢ"}</Equation>
              <p>
                We cannot judge the line by simply adding the residuals up,
                because a line that is 5 kg high for one person and 5 kg low for
                another would sum to zero miss and read as perfect. The misses
                have to be made positive before they are added, and the choice
                this method makes is to square them. Squaring does the obvious
                job, a miss above and a miss below both count, though it does two
                more things worth noticing. It charges a large miss far more than
                several small ones, one residual of 4 costs as much as four
                residuals of 2, which is why a far-off point pulls the line so
                hard. And it keeps the calculus clean, because the derivative of
                a square is simple, and that is what will let us solve for the
                best line outright rather than search for it.
              </p>
              <p>
                So the total we minimise is the residual sum of squares: square
                every residual and add them up.
              </p>
              <Equation>{"RSS = Σ(yᵢ − ŷᵢ)²"}</Equation>
              <p>
                The best line is the one whose β and α make RSS as small as it
                can be. For this model that best pair does not have to be hunted
                for step by step; it can be solved for directly, and the answer
                comes out as two formulas.
              </p>
              <Equation>{"β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²\nα = ȳ − β·x̄"}</Equation>
              <p>
                Here x̄ and ȳ are the average height and the average weight. The
                slope compares how height and weight vary together, the top,
                against how height varies on its own, the bottom, and the
                intercept then slides the line so it passes through the point of
                averages. Where these two formulas come from is the How to Derive
                section below; the next section first shows them doing their job
                on real numbers.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Formulas are easier to trust after they have been worked once by
                hand, so let us fit five people, start to finish, with nothing
                hidden. Their heights and weights:
              </p>
              <Equation>{"height (cm):  160   165   170   175   180\nweight (kg):   58    66    68    74    74"}</Equation>
              <p>
                First the averages. The heights sum to 850 and the weights to
                340, so
              </p>
              <Equation>{"x̄ = 850 / 5 = 170        ȳ = 340 / 5 = 68"}</Equation>
              <p>
                Every quantity in the slope formula is a deviation from these
                averages, so write down how far each person sits from them.
              </p>
              <Equation>{"height − x̄:   −10    −5     0     5    10\nweight − ȳ:   −10    −2     0     6     6"}</Equation>
              <p>
                The top of the slope formula multiplies the two deviations person
                by person and adds them up. Notice what that measures: a person
                below average in both height and weight contributes a positive
                product, negative times negative, and so does a person above
                average in both. The products only come out negative when height
                and weight disagree. So the sum is large and positive exactly
                when the two move together.
              </p>
              <Equation>{"products:      100    10     0    30    60      sum = 200\nsquares of\nheight − x̄:   100    25     0    25   100      sum = 250"}</Equation>
              <p>The slope and intercept follow in one line each.</p>
              <Equation>{"β = 200 / 250 = 0.8\nα = 68 − 0.8·170 = −68"}</Equation>
              <p>
                A slope of 0.8 says the line predicts 0.8 kg of weight for every
                extra centimetre of height. The intercept of −68 looks strange
                read literally, it is the weight the line would claim for a
                person of height zero, though no such person is in the data and
                the line is only ever read across the heights we actually have.
                The intercept anchors the line; it is not a prediction we intend
                to use.
              </p>
              <p>
                Now check the fit the same way the widget draws it. Run each
                height through ŷ = 0.8x − 68 and compare against the measured
                weight.
              </p>
              <Equation>{"predicted:      60    64    68    72    76\nmeasured:       58    66    68    74    74\nresidual:       −2     2     0     2    −2"}</Equation>
              <p>
                Two people sit below the line, two above, one exactly on it, and
                the residuals sum to zero, which the derivation below will show
                is no accident: the best line always balances its misses this
                way. Press the &ldquo;Worked example&rdquo; button in the box
                above and these five people load into the plot; the readouts will
                show slope 0.800 and intercept −68.000, the numbers we just
                computed with pencil arithmetic.
              </p>
            </>
          ),
        },
        {
          title: "Measuring the Fit",
          content: (
            <>
              <p>
                The line is placed as well as it can be. That is not the same as
                being placed well, a best fit through shapeless data is still a
                poor fit, so we need a score for how much the line actually
                explains. To score anything you need a baseline to compare
                against, and the honest baseline here is the simplest predictor
                that exists: ignore height entirely and predict the average
                weight, 68 kg, for every single person.
              </p>
              <p>
                How badly does that baseline miss? Its residuals are just the
                weight deviations we already wrote down, −10, −2, 0, 6, 6, and
                squaring and summing them gives its total squared miss. That
                total is called TSS, the total sum of squares.
              </p>
              <Equation>{"TSS = 100 + 4 + 0 + 36 + 36 = 176"}</Equation>
              <p>
                The line&rsquo;s own total we can compute from its residuals, −2,
                2, 0, 2, −2.
              </p>
              <Equation>{"RSS = 4 + 4 + 0 + 4 + 4 = 16"}</Equation>
              <p>
                So knowing nothing but the average, the total squared miss was
                176. Using height through the line, it fell to 16. The line
                removed 160 of the 176, and that share is the score.
              </p>
              <Equation>{"R² = 1 − RSS / TSS = 1 − 16 / 176 ≈ 0.909"}</Equation>
              <p>
                Read it as: height explains about 91% of the variation in weight
                among these five people, and the remaining 9% is whatever height
                cannot account for. The two ends of the scale follow directly.
                If every point sits exactly on the line, RSS is 0 and R² is 1.
                If the line does no better than predicting the average, RSS
                equals TSS and R² is 0, which you can see in the widget by
                scattering points with no trend and watching the score fall. The
                widget&rsquo;s R² readout on the worked example shows 0.909,
                matching the arithmetic above.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The slope and intercept formulas were stated in The Mechanism and
                used in the worked example. Here is where they come from, using
                exactly the idea from the{" "}
                <Link
                  href="/primers/calculus"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  calculus primer
                </Link>
                : the lowest point of a smooth curve is where its derivative is
                zero.
              </p>
              <p>
                The quantity we are minimising is the residual sum of squares,
                written out now with the line&rsquo;s two settings in plain view.
              </p>
              <Equation>{"RSS(β, α) = Σ(yᵢ − (βxᵢ + α))²"}</Equation>
              <p>
                This is a function of two settings, not one, so its lowest point
                is not where a single derivative is zero but where the ground is
                flat in both directions at once. That means taking the partial
                derivative with respect to each setting, holding the other fixed,
                and setting both to zero.
              </p>
              <p>
                Start with the intercept. Differentiate with respect to α and set
                the result to zero.
              </p>
              <Equation>{"∂RSS/∂α = −2 Σ(yᵢ − βxᵢ − α) = 0"}</Equation>
              <p>
                The −2 divides out, and what remains says the residuals sum to
                zero, which is the balance the worked example found when its
                residuals came out −2, 2, 0, 2, −2. Solving for α gives the
                intercept.
              </p>
              <Equation>{"α = ȳ − β·x̄"}</Equation>
              <p>
                which is just the statement that the fitted line passes through
                the point of averages, (x̄, ȳ). Now the slope. Differentiate with
                respect to β and set that to zero as well.
              </p>
              <Equation>{"∂RSS/∂β = −2 Σ xᵢ(yᵢ − βxᵢ − α) = 0"}</Equation>
              <p>
                Substitute the α we just found and rearrange, and the sums
                collapse into a ratio of two familiar quantities.
              </p>
              <Equation>{"β = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²"}</Equation>
              <p>
                The top is how x and y vary together, their covariance; the
                bottom is how x varies on its own, its variance. The slope is the
                one divided by the other.
              </p>
              <p>
                Notice what did not happen: we never had to walk downhill.
                Because the residual sum of squares is a simple bowl in β and α,
                setting its two derivatives to zero gave equations we could solve
                outright, so the fit is a formula rather than a search. That is
                the lucky case the calculus primer set against gradient descent,
                and simple linear regression sits squarely in it.
              </p>
            </>
          ),
        },
        {
          title: "When There Is No Line",
          content: (
            <>
              <p>
                One arrangement of the data has no answer, and it is worth
                understanding why rather than treating it as a numerical
                accident. Suppose all five people share the same height. Then
                every height deviation is zero, and the bottom of the slope
                formula is a sum of zeros.
              </p>
              <Equation>{"Σ(xᵢ − x̄)² = 0"}</Equation>
              <p>
                The slope would be a division by zero, though the deeper problem
                is not the arithmetic. With only one height in the data there is
                simply no way to say how weight changes per centimetre of
                height; the question the slope answers cannot be asked. Any tilt
                of line through that single column of points misses by the same
                total, so no tilt is better than any other.
              </p>
              <p>
                A correct fit reports that rather than inventing a line. Stack a
                few points on a single height in the widget above and the fit
                comes back as an error, not a number.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
