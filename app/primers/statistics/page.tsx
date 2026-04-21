import type { Metadata } from "next";
import Link from "next/link";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { SamplingPlayground } from "@/components/widgets/SamplingPlayground";
import { StatisticsPlayground } from "@/components/widgets/StatisticsPlayground";

export const metadata: Metadata = {
  title: "Statistics & Probability Primer · oop_ml",
  description:
    "Mean, spread, covariance and correlation, worked by hand on five people, and the reveal that the regression's slope and R-squared were these quantities all along.",
};

export default function StatisticsPrimerPage() {
  return (
    <PrimerPage
      title="Statistics & Probability Primer"
      tagline="A typical value, how far the data strays from it, whether two quantities move together, and what it means to measure noise."
      prerequisites={
        <>
          You only need to be able to read a scatter of points on a graph. The
          closing sections connect back to{" "}
          <Link
            href="/concepts/simple-linear-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            simple linear regression
          </Link>
          , and land better if you have seen that page, though nothing here
          depends on it.
        </>
      }
    >
      <PrimerSection title="Where This Came From">
        <p>
          Statistics grew out of two problems that looked unrelated for
          centuries. One was chance. Gamblers wanted to reason about dice and
          cards, and in the 1650s Pascal and Fermat worked out how to count the
          ways an uncertain thing can turn out, which became probability. The
          other was measurement. Astronomers taking repeated readings of the
          same star found that no two readings agreed, and they needed a
          defensible way to combine many imperfect numbers into one trustworthy
          one, which became the average and the study of error. In the 1800s the
          two problems met, when people noticed that measurement errors, and
          then human measurements themselves, heights among them, pile up in the
          same shapes that games of chance produce. The tools below are what
          that meeting left us, and they are the ones the rest of this site
          spends daily.
        </p>
      </PrimerSection>

      <PrimerSection title="The Mean">
        <p>
          We will work every idea in this primer on the same five people the
          regression page fitted, so keep their numbers in view.
        </p>
        <Equation>{"height (cm):  160   165   170   175   180\nweight (kg):   58    66    68    74    74"}</Equation>
        <p>
          The mean is the typical value, and its recipe is the one everyone
          knows. Add everything up and divide by how many there are.
        </p>
        <Equation>{"mean height = 850 / 5 = 170\nmean weight = 340 / 5 = 68"}</Equation>
        <p>
          The reading worth adding to the recipe is that the mean is a balance
          point. Write down how far each person sits from it, and the people
          below cancel the people above exactly.
        </p>
        <Equation>{"height − mean:   −10    −5     0     5    10      sum = 0"}</Equation>
        <p>
          That sum is zero every time, for any data at all, since the mean is
          precisely the value that makes it so. The regression page met this
          fact from the other side, when its best line&rsquo;s residuals summed
          to zero. These distances from the mean are called deviations, and the
          rest of the primer is built out of them.
        </p>
      </PrimerSection>

      <PrimerSection title="Variance and Standard Deviation">
        <p>
          Two groups of people can share a mean and still look nothing alike,
          one huddled close to it, the other scattered far. The mean says
          nothing about that, so we need a second number for how spread out the
          data is.
        </p>
        <p>
          The natural first attempt is to average the deviations, and we just
          saw why it fails. They sum to zero, always, the below cancelling the
          above. This is the same cancellation problem the regression page hit
          with its residuals, and we escape it the same way, by squaring before
          we average. The average squared deviation is called the variance.
        </p>
        <Equation>{"squares of height deviations:  100   25    0   25   100\nvariance of height = 250 / 5 = 50"}</Equation>
        <p>
          The variance does its job, more scatter means a bigger number, though
          it comes out in awkward units. Squaring centimetres gives square
          centimetres, which is not a thing a height can be. So we take the
          square root to climb back into the units we started with, and that is
          the standard deviation.
        </p>
        <Equation>{"standard deviation of height = √50 ≈ 7.07 cm"}</Equation>
        <p>
          Read it as the typical distance from the mean. Our five people stand
          about 7 cm from the average height, one way or the other. The same
          arithmetic on the weights gives a variance of 176 divided by 5, which
          is 35.2, and a standard deviation near 5.93 kg.
        </p>
        <p>
          The box below holds the five people, draggable like the regression
          page&rsquo;s, with every number of this primer read off them live. On
          load the readouts show the means of 170 and 68 and the standard
          deviations of 7.07 and 5.93 we just worked, and the small cross marks
          the point of averages, the balance point of the cloud. Drag one person
          far away and watch the mean chase them and both spreads grow. The last
          two readouts are the subject of the next two sections.
        </p>
        <PrimerPlayground>
          <StatisticsPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="Covariance">
        <p>
          So far every number describes one column at a time. The interesting
          question sits between the columns. When a person is taller than
          average, are they also heavier than average? If yes, the two
          quantities move together, and that is exactly what a prediction needs,
          since knowing one then tells us something about the other.
        </p>
        <p>
          The deviations already hold the answer. Multiply each person&rsquo;s
          height deviation by their weight deviation. A person below average in
          both gives a positive product, negative times negative, and a person
          above average in both gives a positive product too. The products only
          come out negative when the two disagree, tall but light, short but
          heavy. So if the products average out large and positive, the two
          quantities mostly agree.
        </p>
        <Equation>{"height − mean:   −10    −5     0     5    10\nweight − mean:   −10    −2     0     6     6\nproducts:        100    10     0    30    60      sum = 200"}</Equation>
        <p>
          The average of the products is the covariance, and for our five people
          it is 40, large and positive, tall with heavy and short with light.
          The regression page built this exact sum of 200 on its way to the
          slope, without giving it a name. It has one, and the name is about to
          matter.
        </p>
        <Equation>{"covariance = 200 / 5 = 40"}</Equation>
      </PrimerSection>

      <PrimerSection title="Correlation">
        <p>
          The covariance has an honest flaw. Its size depends on the units the
          data happened to arrive in. Measure the same five heights in metres
          instead of centimetres and every height deviation shrinks a
          hundredfold, so the covariance falls from 40 to 0.4 with nothing real
          about the people changing. A number that swings with the choice of
          ruler cannot be compared across datasets, and on its own it cannot
          even say whether 40 is a lot.
        </p>
        <p>
          The repair is to divide the units back out. The covariance carries the
          units of both columns, so we divide by both standard deviations, and
          what is left is a pure number, the correlation, written r.
        </p>
        <Equation>{"r = covariance / (SD of height · SD of weight)\nr = 40 / (7.07 · 5.93) ≈ 0.953"}</Equation>
        <p>
          Change centimetres to metres and the covariance and the standard
          deviation shrink by the same factor, which cancels, so r comes out
          0.953 either way. The correlation always lands between −1 and 1. At
          exactly 1 the points sit on a perfectly straight rising line, at
          exactly −1 on a perfectly straight falling one, and at 0 there is no
          linear pattern for one column to lend the other. Our 0.953 says these
          five people sit very close to a straight line, which the plot above
          confirms at a glance.
        </p>
        <p>
          Try the ends of the scale in the widget. Drag one person well off the
          trend and watch r fall away from 1. Press the button for no pattern
          and it drops near 0, since knowing a height in that cloud tells you
          almost nothing about the weight attached to it.
        </p>
      </PrimerSection>

      <PrimerSection title="What the Regression Was Doing All Along">
        <p>
          Now the payoff. The regression page handed you a formula for the
          slope, a ratio of two sums, and derived it from the calculus. Look at
          it again with this primer&rsquo;s vocabulary. Its top was the sum of
          the deviation products, 200, and its bottom was the sum of the squared
          height deviations, 250. Divide both by 5 and nothing changes, and the
          formula says something you can now read aloud.
        </p>
        <Equation>{"slope = covariance / variance of height = 40 / 50 = 0.8"}</Equation>
        <p>
          The 0.8 that fit those five people was never a mystery ratio. The
          slope asks how much the two quantities move together, then rescales
          that by how much the input moves on its own, so a prediction leans on
          height exactly as hard as height and weight co-vary.
        </p>
        <p>
          The other number on that page falls out too. Square our correlation
          and you get the regression&rsquo;s R².
        </p>
        <Equation>{"r² = 0.953² ≈ 0.909"}</Equation>
        <p>
          which is the 0.909 the regression page computed as 1 − 16/176, by an
          entirely different route. The score that read as the share of
          variation explained is the squared correlation between the two
          columns, so the two pages were measuring one relationship from two
          directions and agreeing on it.
        </p>
        <p>
          One bookkeeping honesty before moving on. We divided by 5 throughout,
          the population recipe, though you will often see 4 used instead, which
          corrects for estimating from a sample. The choice moves the variance
          and the covariance together, so it cancels in the slope and in the
          correlation, which is why the regression page never had to mention it.
        </p>
      </PrimerSection>

      <PrimerSection title="The Shape Underneath the Noise">
        <p>
          Everything above describes data we already hold. Probability enters
          when we ask where the data came from. The working assumption of
          machine learning is that there is something steadier underneath, a
          whole population of people we did not measure, and that our dataset is
          a handful of draws from it. The astronomers of the regression
          page&rsquo;s history were making exactly this move, treating each
          night&rsquo;s reading as one draw scattered around a true position.
        </p>
        <p>
          The box below makes the assumption visible. There is an imagined
          population of people whose heights have a true mean of 170 cm and a
          true standard deviation of 7 cm, and each press measures more of them.
          Draw one person and you get whoever you get, possibly nowhere near
          170. Draw ten and the pile is lumpy and the sample mean still swings.
          Keep drawing and two things happen at once. The sample mean stops
          swinging and settles against the dashed line of the true mean, and the
          pile of bars takes on a shape, tall in the middle, falling away
          evenly, the bell.
        </p>
        <PrimerPlayground>
          <SamplingPlayground />
        </PrimerPlayground>
        <p>
          Both of those are the point. The settling is why more data is worth
          having, since averages of many draws crowd in on the true value that
          single draws only scatter around. And the bell is why the normal
          distribution turns up everywhere, since a quantity that is the sum of
          many small independent pushes, as a height is, tends toward that shape
          whatever the pushes look like individually. Not everything is
          bell-shaped, incomes and city sizes famously are not, though the bell
          earns its place as the default picture of noise.
        </p>
        <p>
          This also sharpens what the statistics above really are. The mean of
          170 and standard deviation of 7.07 we computed from five people are
          estimates of a population&rsquo;s true values, made from a sample of
          five, and the widget shows how rough an estimate that small can be.
          When a later page fits a model to data, the same caution applies to
          everything it learns.
        </p>
      </PrimerSection>

      <PrimerSection title="Why Every Model Leans on This">
        <p>
          Here is the primer pointed forward. The mean and standard deviation
          are how features get standardized before models that care about scale,
          which several ahead do. Variance is what principal component analysis
          hunts direction by direction, using the eigen machinery of the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          . Covariance and correlation are what a regression turns into a slope
          and a score, as the reveal above showed. And the sampling picture is
          the quiet foundation under all of it, since every fitted model is an
          estimate from a sample, trusted only as far as the draws that made it.
        </p>
      </PrimerSection>
    </PrimerPage>
  );
}
