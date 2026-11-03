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
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import {
  InAModel,
  KeepInMind,
  NumberTable,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { MeanBalancePlayground } from "@/components/widgets/MeanBalancePlayground";
import { SamplingPlayground } from "@/components/widgets/SamplingPlayground";
import { StatisticsPlayground } from "@/components/widgets/StatisticsPlayground";

export const metadata: Metadata = {
  title: "Statistics Primer · Perceptron Lab",
  description:
    "An average describes a typical value in a collection of measurements. Measures of spread show how much those measurements vary, and probability gives us ways to reason about uncertain outcomes.",
};

export default function StatisticsPrimerPage() {
  return (
    <PrimerPage
      lessonId="statistics"
      technicalStart="10. Covariance"
      title="Statistics and Probability Primer"
      tagline={"An average describes a typical value in a collection of measurements. Measures of spread show how much those measurements vary, and probability gives us ways to reason about uncertain outcomes."}
      prerequisites={
        <>
          You will need ordinary arithmetic. We will use the same five people throughout the primer, so you can check each new calculation against measurements you already know.
        </>
      }
    >
      <PrimerSection title="What Can a Handful of Measurements Tell Us?">
{lessonIntuitions["statistics"].opening.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
<GuidedIntuition lesson={presentIntuition("statistics", lessonIntuitions["statistics"])} />
<IntuitionConnection lesson={lessonIntuitions["statistics"]} />
</PrimerSection>

      <PrimerSection title="1. Observations and Variables">

        <p>
          Let&apos;s start with five people. We have measured each person&apos;s height and weight, and we want to see what we can learn about the group from those measurements.
        </p>
        <Equation>{"height (cm):  160   165   170   175   180\nweight (kg):   58    66    68    74    74"}</Equation>
        <p>
          Before we calculate anything, we need names for the things in our table. An observation is one person: a row holds the measurements from that person. A variable is something we measure across the group, such as height. It occupies a column because we record that same quantity for everyone.
        </p>
        <p>
          Almost everything in this primer is a statement about a column, or
          about how two columns relate. The rows are what we have; the columns
          are what we describe.
        </p>
        <p>Reading across a row describes one person. Reading down a column compares the same measurement across the group. A summary of height therefore uses the height column, while a summary of weight uses the weight column. Each column also keeps its own unit: centimeters for height and kilograms for weight.</p>
      </PrimerSection>

      <PrimerSection title="2. Why We Summarize Data">
        <p>A short list of heights is easy to inspect directly. As the collection grows, summaries help us compare groups without reading every measurement individually.</p>
        <p>A summary keeps a particular feature of the observations, such as their center or spread. Those features make comparisons easier, but no small set of numbers answers every question about the original values.</p>
        <p>Each summary leaves out some information. We need to understand that choice before deciding what a reported number tells us.</p>
      </PrimerSection>

      <PrimerSection title="3. The Mean">
        <p>
          The mean is the most familiar summary. Add the values and divide by how
          many there are.
        </p>
        <WorkedExample>
          <Equation>{"mean height = (160 + 165 + 170 + 175 + 180) / 5 = 850 / 5 = 170\nmean weight = (58 + 66 + 68 + 74 + 74) / 5 = 340 / 5 = 68"}</Equation>
        </WorkedExample>
        <p>
          There is a picture that explains why the mean is the number it is. Put
          the values on a line and imagine a plank with a weight at each value.
          The mean is the point where the plank balances, because the pull of the
          values above it exactly cancels the pull of the values below.
        </p>
        <PrimerPlayground>
          <MeanBalancePlayground />
        </PrimerPlayground>
        <KeepInMind>
          <p>

            The mean is a measure of center, and that is not the same as a
            typical observation. It need not be a value anyone actually has, and
            with a lopsided column it can sit somewhere no one is.
          </p>
          <p>
            Four people earning 25,000 and one earning 500,000 have a mean income
            of 120,000, which describes none of the five. The mean is still the
            balance point; it just stops being a good answer to &ldquo;what does
            someone here look like&rdquo;.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="4. Deviations from the Mean">
        <p>

          Once there is a center, every value can be described by its distance
          from it. Subtract the mean from each value, and what is left is called
          the deviation.
        </p>
        <WorkedExample>
          <Equation>{"height:          160   165   170   175   180\nheight − mean:   −10    −5     0     5    10      sum = 0"}</Equation>
          <p>
            Negative below the mean, positive above it, zero for the person
            sitting exactly on it. The same subtraction for weight, around its
            mean of 68, cancels in the same way.
          </p>
          <Equation>{"weight:           58    66    68    74    74\nweight − mean:   −10    −2     0     6     6      sum = 0"}</Equation>
        </WorkedExample>
        <p>

          A deviation carries two pieces of information. Its sign says which
          side of the center a person is on, and its size says how far out they
          sit. The shortest person is 10 below the mean height and the tallest
          is 10 above it, the same distance in opposite directions, which is
          what lets the two cancel. Every summary that follows, the variance,
          the covariance and the correlation, is built from these signed
          distances.
        </p>
        <p>In exact arithmetic, deviations from the mean sum to zero because the mean is the balance point. Adding the signed deviations therefore cannot measure how widely the observations are spread.</p>
      </PrimerSection>

      <PrimerSection title="5. Center Is Not Spread">
        <p>
          The mean alone leaves out something important. Consider two groups of
          five.
        </p>
        <NumberTable
          headings={["group", "values", "mean"]}
          rows={[
            ["tightly packed", "169, 170, 170, 170, 171", "170"],
            ["widely spread", "140, 155, 170, 185, 200", "170"],
          ]}
        />
        <p>The groups have the same mean, but the first stays close to it while the second ranges over sixty centimeters. We need a measure of spread to describe that difference.</p>
        <p>Subtract 170 from each height to compare how far the observations lie from their shared mean.</p>
        <Equation>{"tightly packed:    −1     0     0     0     1      sum = 0\nwidely spread:    −30   −15     0    15    30      sum = 0"}</Equation>
        <p>

          Both lists sum to zero, as every list of deviations does, so adding
          them up cannot tell the groups apart either. The sizes can. One group
          never strays more than a centimeter from its center and the other
          strays thirty.
        </p>
        <p>A measure of spread needs to retain the sizes of these deviations without letting positive and negative values cancel. The next section uses their squares to do that.</p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 1 to 5"
        questions={[
          trueFalse(
            "For a finite numerical column, deviations from its defined arithmetic mean sum to zero in exact arithmetic.",
            true,
            "For a finite numerical column with a defined mean, the positive and negative departures from that mean balance. Their sum is zero in exact arithmetic. Averaging those signed departures therefore cannot tell us how spread out the values are.",
          ),
          choice(
            "Four people earn 25,000 and one earns 500,000. What is the mean, and what does it tell you about them?",
            [
              "120,000, which describes none of the five",
              "25,000, since that is what four of the five earn",
              "262,500, which sits halfway between the two amounts present",
              "500,000, because one large value dominates the sum",
            ],
            0,
            "The mean is still the balance point, where the pull of the values above it cancels the pull of those below. It just stops being a good answer to what someone here looks like, because a measure of center is not the same thing as a typical observation. Four of the five earn 25,000, and the mean is nowhere near it.",
          ),
          choice(
            "One group of five reads 169, 170, 170, 170, 171 and another reads 140, 155, 170, 185, 200. What do their means do?",
            [
              "Both come to 170, and the mean cannot see what separates the groups",
              "The spread group has the higher mean, since its values reach further up",
              "The tight group has the higher mean, since its values cluster above",
              "They differ, and that difference is what separates the groups",
            ],
            0,
            "Both groups have mean 170, but their departures have very different sizes. The first group stays close to its mean, while the second spreads much farther on both sides. A measure of spread is needed to distinguish them.",
          ),
          several(
  "Which statements describe the supplied measurements and their mean summaries?",
  [
    "An observation is one person, one row, everything measured about a single case",
    "A variable is one of the two measurements taken across all five, one column",
    "The mean height is 170 and the mean weight is 68",
    "The two means alone do not retain every height and weight in the table"
  ],
  [0, 1, 2, 3],
  "Each row joins measurements from one person, while a column follows one variable across people. The supplied heights average 170 cm and the weights average 68 kg. Those means do not tell us every individual measurement or how the two measurements were paired.",
  {
    "description": "Each row describes the same person across the two measurements. Use population variance and covariance, dividing by five.",
    "data": "Person | Height (cm) | Weight (kg)\nA | 160 | 58\nB | 165 | 66\nC | 170 | 68\nD | 175 | 74\nE | 180 | 74"
  },
),
          trueFalse(
            "Summaries can make large groups easier to compare, provided their units and the groups being described are clear.",
            true,
            "Summaries make large groups easier to compare. Mean and standard deviation describe center and spread, but they leave out the distribution’s shape and which observations contributed particular values. Comparisons also need consistent units and clearly defined groups.",
          ),
        ]}
      />

      <PrimerSection title="6. Variance">
        <p>
          The obvious first attempt is to average the deviations, and it fails
          immediately, for the reason section 4 gave.
        </p>
        <Equation>{"(−10 + −5 + 0 + 5 + 10) / 5 = 0"}</Equation>
        <p>Positive and negative deviations cancel when added. To measure their size, we can first take absolute values or squares. Both remove the cancellation, but they give larger deviations different influence on the result.</p>
        <p>We will use squared deviations to measure spread. Squaring prevents opposite signs from canceling and gives a large deviation more influence than a small one. It also leads to expressions that are convenient to differentiate later. Averaging absolute deviations is another valid summary, called mean absolute deviation; it measures spread differently.</p>
        <WorkedExample>
          <NumberTable
            headings={["height", "deviation", "squared deviation"]}
            rows={[
              ["160", "−10", "100"],
              ["165", "−5", "25"],
              ["170", "0", "0"],
              ["175", "5", "25"],
              ["180", "10", "100"],
            ]}
          />
          <Equation>{"sum of squared deviations = 250\nvariance = 250 / 5 = 50"}</Equation>
        </WorkedExample>
        <p>
          That is the variance, the average squared deviation from the mean, and
          dividing by 5 says something specific about what we are doing. We are
          treating these five people as the complete group we want to describe,
          not as a sample of anybody else.
        </p>
        <KeepInMind>
          <p>
            Are these five people the entire population we want to describe, or a sample used to estimate variation in a larger population? That choice changes the denominator:
          </p>
          <Equation>{"population:  σ² = Σ(xᵢ − μ)² / N          divide by 5, giving 50\nsample:      s² = Σ(xᵢ − x̄)² / (n − 1)    divide by 4, giving 62.5"}</Equation>
          <p>When these five people are the complete group, variance divides the squared deviations by the number of people. To estimate a population variance, the usual sample formula divides by one fewer. For independent observations drawn from the same distribution with finite variance, the corrected estimates average to the population variance over repeated samples. This property is called unbiasedness. The correction accounts for having estimated the mean from the same observations.</p>
          <p>
            This primer divides by 5 throughout, since the five people are the
            group being described. Section 16 is where they become a sample.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="7. Standard Deviation">
        <p>Squaring the height deviations also squares their unit, so the variance of 50 is measured in square centimeters. That makes it harder to compare directly with a height measured in centimeters.</p>
        <p>Take the square root and the units come back.</p>
        <Equation>{"standard deviation of height = √50 ≈ 7.07 cm"}</Equation>
        <>
          <p>
            Taking the square root restores the original unit, so a standard deviation
            can be compared with the measurements themselves. Repeat the same
            calculation for weight.
          </p>
          <Equation>{"weight variance = 176 / 5 = 35.2 kg²\nweight standard deviation = √35.2 ≈ 5.93 kg"}</Equation>
        </>
        <KeepInMind>
          <p>Standard deviation is a root-mean-square distance from the mean. Squaring gives larger deviations more influence before we average them, and taking the square root returns the result to the original units. It is therefore different from the average absolute distance.</p>
          <p>For our five heights, the average absolute distance is 6, while the standard deviation is 7.07. Squaring gives larger departures more influence. The standard deviation exceeds the average absolute distance when the deviations have different magnitudes; they are equal when every magnitude is the same.</p>
        </KeepInMind>
        <p>Try moving one point in the activity below and watch both the mean and standard deviation change. Moving it far from the others can increase the spread substantially, but it also moves the mean. Then drag all five points up by the same amount. The mean shifts by that amount, while the standard deviation returns to its original value, allowing for the precision of the drag. A shared shift leaves every deviation from the mean unchanged.</p>
        <PrimerPlayground>
          <StatisticsPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="8. Relationships Between Two Variables">
        <p>
          Everything so far describes one column at a time. The interesting
          question sits between the columns.
        </p>
        <p>
          When a person is taller than average, are they also heavier than
          average? If they tend to be, then the two quantities carry information
          about each other, and knowing one tells you something about the other.
          That is exactly what a prediction is, so a summary of how two columns
          move together is the last descriptive idea this primer needs.
        </p>
        <p>
          Look down the two columns together and the pattern is already visible.
          The shortest person, at 160 cm, is also the lightest at 58 kg. The
          tallest, at 180 cm, shares the heaviest weight of 74 kg. Each step up
          in height comes with a step up in weight, apart from the last, where
          175 and 180 weigh the same. Nobody is tall and light, and nobody is
          short and heavy.
        </p>
        <p>
          What is missing is a number for &ldquo;tend to&rdquo;. Reading five
          rows is easy and reading five thousand is not, which is the problem
          section 2 raised for one column, now asked of two at once. The summary
          wanted has to say how strongly the two columns move together, and the
          next two sections build it out of the deviations each column already
          has.
        </p>
      </PrimerSection>

      <PrimerSection title="9. Paired Deviations">
        <p>
          The deviations already hold the answer, once they are paired up person
          by person rather than looked at one column at a time.
        </p>
        <p>
          Multiply each person&rsquo;s height deviation by their own weight
          deviation. Somebody below average in both gives a positive product,
          since a negative times a negative is positive. Somebody above average
          in both also gives a positive product. The product only comes out
          negative when the two disagree, tall but light, or short but heavy.
        </p>
        <WorkedExample>
          <NumberTable
            headings={["height − mean", "weight − mean", "product"]}
            rows={[
              ["−10", "−10", "100"],
              ["−5", "−2", "10"],
              ["0", "0", "0"],
              ["5", "6", "30"],
              ["10", "6", "60"],
            ]}
          />
          <Equation>{"sum of products = 200"}</Equation>
          <p>
            Every product is positive or zero here, so these five people agree
            with each other throughout. Nobody is tall and light.
          </p>
        </WorkedExample>
        <p>
          Reading down the table, the 160 cm person is ten below the mean in
          height and ten below it in weight, and that agreement in both
          directions gives the largest product, 100. The 170 cm person sits
          exactly on both means and contributes nothing, since a deviation of
          zero times anything is zero. A short, heavy person would have
          contributed a negative product, a positive weight deviation times a
          negative height one, and would have pulled the sum down.
        </p>
        <p>

          The products have units of their own, centimeters times kilograms,
          which is about to matter.
        </p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 6 to 9"
        questions={[
          choice(
            "Why does this primer square the deviations rather than take their absolute values?",
            [
              "Squares are easier to work with algebraically, and they punish a large deviation far more than several small ones",
              "Absolute values do not stop the signs from canceling",
              "Absolute values are not used in practice",
              "Squaring is the only way to get a positive number out of a deviation",
            ],
            0,
            "Absolute values and squares both prevent opposite signs from canceling. Averaging absolute departures gives mean absolute deviation. Squaring gives large departures more influence and produces expressions that are convenient to differentiate later, so we use it for variance here.",
          ),
          trueFalse(
            "Moving every one of the five people up by the same amount changes the mean and leaves the standard deviation exactly where it was.",
            true,
            "Adding the same amount to every observation moves the mean by that amount too. Each observation keeps the same departure from the new mean, so the variance and standard deviation remain unchanged.",
          ),
          trueFalse(
            "The standard deviation is the average distance of the values from the mean.",
            false,
            "It is the root-mean-square distance, which squares first, averages, then takes the root, and that is a different number. For the five heights the average absolute distance is 6 while the standard deviation is 7.07, because squaring gives the far-out values more say.",
          ),
          several(
  "Which statements describe the spread of these five heights using the stated convention?",
  [
                "The variance is 50, and it is in square centimeters",
                "The standard deviation is about 7.07 cm, the square root of the variance",
                "Averaging the deviations themselves would also have come to 50",
                "Dividing the 250 by 4 instead of 5 gives 62.5, which is the figure this primer uses throughout",
              ],
  [0, 1],
  "Signed deviations balance to zero, while their squares retain their sizes. Population variance averages those squares over all five people and has squared measurement units. Standard deviation takes the square root to restore centimeters. The sample-variance formula uses one fewer in the denominator when we estimate variation in a larger population.",
  {
    "description": "Each row describes the same person across the two measurements. Use population variance and covariance, dividing by five.",
    "data": "Person | Height (cm) | Weight (kg)\nA | 160 | 58\nB | 165 | 66\nC | 170 | 68\nD | 175 | 74\nE | 180 | 74"
  },
),
          several(
  "Which statements hold when the height and weight deviations are paired person by person?",
  [
                "A person below average in both height and weight gives a positive product",
                "A person above average in both gives a negative product",
                "If taller people tend to be heavier, knowing someone’s height says something about their weight, which is what a prediction is",
                "Every product among the five is positive or zero, so nobody here is tall and light",
              ],
  [0, 2, 3],
  "A person below both means contributes a positive product, as does a person above both. Opposite sides give a negative product. A person on either mean contributes zero. Keeping height and weight paired by person is what lets these products describe how the two measurements vary together.",
  {
    "description": "Each row describes the same person across the two measurements. Use population variance and covariance, dividing by five.",
    "data": "Person | Height (cm) | Weight (kg)\nA | 160 | 58\nB | 165 | 66\nC | 170 | 68\nD | 175 | 74\nE | 180 | 74"
  },
),
        ]}
      />

      <PrimerSection title="10. Covariance">
        <p>
          Average those products and the result is the covariance.
        </p>
        <Equation>{"covariance = 200 / 5 = 40"}</Equation>
        <p>
          Its sign is the part that reads directly. Positive means the two
          columns tend to move together, negative means one rises as the other
          falls, and near zero means the agreements and disagreements roughly
          cancel.
        </p>
        <KeepInMind>
          <p>A covariance of 40 needs its units and the variability of both columns before we can interpret its size. Its numerical value alone does not tell us how closely the points follow a line.</p>
          <p>Changing height from centimeters to meters changes the covariance from 40 to 0.4, even though the people and the relationship are unchanged. Covariances need consistent units for a direct comparison. Correlation removes those units when we want to compare the strength of a linear relationship.</p>
        </KeepInMind>
        <p>The sum of deviation products is also used in the regression slope calculation. Section 14 explains why that same quantity appears in both calculations.</p>
      </PrimerSection>

      <PrimerSection title="11. Removing Scale">
        <p>
          The repair follows from what went wrong. Covariance carries the scale
          of height and the scale of weight, both at once, so dividing by a
          measure of each column&rsquo;s own spread should leave the relationship
          and take the units away.
        </p>
        <p>
          The standard deviations are exactly those measures, so divide by both.
        </p>
        <Equation>{"r = covariance / (SD of height × SD of weight)"}</Equation>
        <WorkedExample>
          <Equation>{"r = 40 / (7.07 × 5.93) ≈ 0.953"}</Equation>
          <p>In meters, the covariance becomes 0.4 and the height standard deviation becomes 0.0707. Both change by the same factor, so that factor cancels in their ratio. The correlation remains 0.953.</p>
        </WorkedExample>
        <WhyThisWorks title="Correlation as the average product of standard scores">
          <p>
            There is a second way to write the same quantity that makes what
            happened clearer. Divide each deviation by its own column&rsquo;s
            standard deviation first, turning it into a unit-free number saying
            how many standard deviations from the mean that person is. Then
            average the products of those.
          </p>
          <Equation>{"r = average of  ((xᵢ − x̄)/σₓ) × ((yᵢ − ȳ)/σᵧ)"}</Equation>
          <p>
            Which is to say correlation is covariance computed after both columns
            have had their units removed, rather than a different idea.
          </p>
        </WhyThisWorks>
      </PrimerSection>

      <PrimerSection title="12. Correlation">
        <p>
          That pure number is the correlation, written r, and it always lands
          between −1 and 1. Sign and strength read separately.
        </p>
        <NumberTable
          headings={["r", "what it says"]}
          rows={[
            ["near +1", "a rising straight-line relationship, points close to the line"],
            ["near −1", "a falling straight-line relationship, points close to the line"],
            ["near 0", "little overall linear association in these observations"],
          ]}
        />
        <WorkedExample title="The five people, in standard deviations">
          <p>
            Section 11 said r is an average of products once each column is
            measured in its own standard deviations. Here is that calculation,
            with every height deviation divided by 7.07 and every weight
            deviation by 5.93.
          </p>
          <NumberTable
            headings={["height − mean", "÷ 7.07", "weight − mean", "÷ 5.93", "product"]}
            rows={[
              ["−10", "−1.414", "−10", "−1.685", "2.384"],
              ["−5", "−0.707", "−2", "−0.337", "0.238"],
              ["0", "0", "0", "0", "0"],
              ["5", "0.707", "6", "1.011", "0.715"],
              ["10", "1.414", "6", "1.011", "1.430"],
            ]}
          />
          <Equation>{"r = (2.384 + 0.238 + 0 + 0.715 + 1.430) / 5 = 4.767 / 5 ≈ 0.953"}</Equation>
          <p>
            The same 0.953 as the covariance over the two spreads, reached by a
            route with no units anywhere in it. Select Five height and weight
            pairs in the statistics activity to check the correlation readout
            against this calculation.
          </p>
        </WorkedExample>
        <p>
          The bounds come from that same table. Each column now has a spread of
          exactly one, so the products can only average 1 when every person
          sits in the same place in both columns, as many standard deviations
          up or down in weight as in height, which is a perfect rising line.
          Every departure from it, somebody further out in one column than the
          other, lowers the average, and a perfect falling line pins it at −1.
        </p>
        <p>
          Our 0.953 says these five people sit very close to a rising line, which
          the plot confirms at a glance. Drag one person well off the trend in
          the box above and watch r fall away from 1, then press the button for
          no pattern and watch it drop near 0.
        </p>
      </PrimerSection>

      <PrimerSection title="13. What Correlation Does Not Say">
        <p>
          Two qualifications, and both matter more than the formula.
        </p>
        <KeepInMind title="Zero correlation is not no relationship">
          <p>
            Correlation measures <em>linear</em> co-movement, and only that. A
            strong, obvious, perfectly deterministic relationship can have a
            correlation of zero if it is curved.
          </p>
          <p>
            Points along a symmetric U shape are a clean example. The left arm
            falls and the right arm rises, the two contributions cancel exactly,
            and r comes out near zero while every point sits on an exact curve.
            Reporting &ldquo;no correlation&rdquo; there would be arithmetically
            true and completely misleading.
          </p>
          <p>
            Correlation is also easily moved by one unusual observation, since a
            single far-out point contributes a large product to the average.
          </p>
        </KeepInMind>
        <KeepInMind title="Correlation is not causation">
          <p>

            Correlation says two columns vary together. It says nothing about
            why, and the possibilities it cannot distinguish include the first
            influencing the second, the second influencing the first, some third
            thing driving both, an artifact of how the data was selected or
            measured, and plain coincidence in a small sample.
          </p>
          <p>
            None of that makes correlation less useful. It makes it a description
            rather than an explanation.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 10 to 13"
        questions={[
          trueFalse(
            "Measuring the same five heights in meters rather than centimeters changes the covariance without changing anything about the people.",
            true,
            "Changing height units changes the numerical size and units of covariance. The people and their relationship stay the same. Covariance magnitudes can be compared when the variables and scales are consistent; comparing different scales requires accounting for those units or using a standardized measure such as correlation.",
          ),
          choice(
            "What does dividing the covariance by both standard deviations achieve?",
            [
              "It keeps the relationship and takes the units away",
              "It forces the result to come out positive",
              "It makes the result easier to compute by hand",
              "It removes the influence of one unusual observation",
            ],
            0,
            "Covariance includes the scale of both measurements. Dividing by their two standard deviations removes those units. When height is converted to meters, its covariance with weight and its standard deviation shrink together, leaving the correlation unchanged. Standardizing each column before averaging paired products gives the same result.",
          ),
          trueFalse(
            "A correlation near zero means there is no relationship between the two columns.",
            false,
            "Correlation describes a linear relationship. In a symmetric U-shaped pattern, the falling and rising parts can balance to give zero correlation even though one variable is determined by the other. A plot can reveal the relationship that this one summary misses.",
          ),
          several(
            "The five people have a correlation of 0.953 between height and weight. Which of these does that support?",
            [
              "They sit very close to a rising straight line",
              "Height and weight vary together in this sample",
              "Being taller causes someone to be heavier",
              "Some third thing driving both has been ruled out",
            ],
            [0, 1],
            "Correlation says two columns vary together and says nothing about why. What it cannot distinguish includes the first influencing the second, the second influencing the first, some third thing driving both, an artifact of how the data was selected, and plain coincidence in a small sample. That makes it a description rather than an explanation.",
          ),
          choice(
            "How much can one unusual observation move a correlation?",
            [
              "A long way, since a single far-out point contributes a large product to the average",
              "Not at all, since the products are averaged over everybody",
              "Not at all, since dividing by the standard deviations removes that point’s influence",
              "Only if the point is far out in both columns at once",
            ],
            0,
            "Correlation is built from an average of paired deviations, so one far-out point contributes a large product and pulls the average with it. Dragging one person well off the trend in the box makes r fall away from 1.",
          ),
        ]}
      />

      <PrimerSection title="14. Covariance, Variance, and Regression Slope">
        <p>The regression slope can now be expressed using summaries we understand: covariance and variance. This connects the fitted line to how the two measurements vary together.</p>
        <Equation>{"slope = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²"}</Equation>
        <p>
          Divide the top and the bottom by the same count of five, which changes
          nothing, and both halves turn into things this primer has named.
        </p>
        <Equation>{"slope = covariance(x, y) / variance(x)\nslope = 40 / 50 = 0.8"}</Equation>
        <p>The covariance describes how height and weight vary together, while the height variance describes the spread of the input. Their ratio gives the fitted line’s change in predicted weight per centimeter of height. It describes the line fitted to these observations; it does not establish what changing a person’s height would cause.</p>
        <WhyThisWorks title="Why the units come out right">
          <p>The units survive the division and land exactly where they should.</p>
          <Equation>{"covariance is in  cm · kg\nvariance is in    cm²\n\nslope is in      cm · kg / cm²  =  kg / cm"}</Equation>
          <p>

            Kilograms per centimeter, which is what a slope on this plot has to
            mean. The regression was computing a covariance over a variance the
            whole time without either being named.
          </p>
        </WhyThisWorks>
      </PrimerSection>

      <PrimerSection title="15. Correlation and R²">
        <p>For a least-squares line fitted to these observations, the next identity connects correlation with R². Both measured columns must have nonzero variance, and the following conditions must also hold.</p>
        <NumberTable
          headings={["condition"]}
          rows={[
            ["one predictor"],
            ["one response"],
            ["the model fits an intercept"],
            ["both numbers computed on the same observations"],
          ]}
        />
        <p>Under exactly those conditions,</p>
        <Equation>{"R² = r²\n0.909 = 0.953²"}</Equation>
        <p>
          The squaring is where the difference between them sits. Correlation
          keeps its sign, so it can tell a rising relationship from a falling
          one. R² measures the share of variation the fit accounts for, which
          cannot sensibly be negative here, and squaring is what removes the
          direction.
        </p>
        <WhyThisWorks title="Why the two numbers coincide">
          <p>
            R² is the share of the variation in weight that the fitted line
            accounts for. The line&rsquo;s predictions move only with height,
            so the variation they carry is the slope squared times the
            variation in height, and section 14 showed the slope is the
            covariance over the variance of height. Put those together and both
            quantities are the squared covariance over the product of the two
            variances, once written with sums and once with averages.
          </p>
          <Equation>{"variation the line accounts for = 0.8² × 250 = 160\ntotal variation in weight = 176\nR² = 160 / 176 ≈ 0.909\nleft over = 176 − 160 = 16\n\nr² = 40² / (50 × 35.2) = 1600 / 1760 ≈ 0.909"}</Equation>
          <p>
            What the line leaves unaccounted for is the 16 the regression page
            scored the line at. Splitting the total into an accounted-for part
            and a left-over part is what needs the intercept, and the conditions
            in the table above are the conditions for that split to hold.
          </p>
        </WhyThisWorks>
        <KeepInMind>
          <p>With more than one predictor, without an intercept, or when R² is computed on observations the model did not fit, this equality is no longer guaranteed. The two values can happen to agree, but the identity above does not establish that they must.</p>
          <p>
            It is a fact about simple linear regression rather than a general law
            relating the two.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="16. Samples and Populations">
        <p>
          Everything up to here described five people. The second half of this
          primer asks a different question, which is what those five say about
          anybody else.
        </p>
        <p>The population is the group we want to describe, or the process that produces observations. The sample is the collection we actually observed. A statistic is calculated from that sample; a population parameter describes the corresponding property of the population. The parameter is often unknown, which is why we estimate it from a sample.</p>
        <NumberTable
          headings={["in the sample", "in the population"]}
          rows={[
            ["sample mean x̄", "population mean μ"],
            ["sample variance s²", "population variance σ²"],
            ["computed from data you have", "usually unknown"],
            ["changes if you collect again", "fixed for a defined population"],
          ]}
        />
        <p>
          Our mean height of 170 was a statistic all along. Whether it is close
          to the population mean is a question the five people cannot answer by
          themselves.
        </p>
        <p>The distinction changes how we interpret variance. Earlier, the five people were the whole group. When they represent a larger population, their sample mean has already been chosen to fit those observations. The usual sample-variance correction accounts for that fitted mean. Its unbiasedness assumes independent observations from the same distribution with finite variance; it does not correct a biased sampling procedure.</p>
        <Equation>{"as the whole group:   variance = 250 / 5 = 50       SD ≈ 7.07 cm\nas a sample:          variance = 250 / 4 = 62.5     SD ≈ 7.91 cm"}</Equation>
        <p>

          The mean needs no such correction, and 170 is the estimate of the
          population mean either way. Only the spread is adjusted, and only
          because the center it is measured from was itself estimated from the
          same five people.
        </p>
      </PrimerSection>

      <PrimerSection title="17. What Probability Describes">
        <p>
          Statistics looks at observations and reasons back to the process.
          Probability goes the other way, starting from a process and describing
          what it might produce, and the second half of this primer needs a
          little of it.
        </p>
        <p>
          It is needed for one reason. To say what five people tell us about
          anybody else, there has to be a way of describing the process that
          produced the five, and that is what probability provides. The box in
          section 19 is built on exactly this. A population with a fixed mean
          height sits underneath it, and every press draws people from that
          process rather than from a list somebody wrote down.
        </p>
        <p>
          Four words carry the whole of what is needed here. An outcome is
          something that could happen. A probability is a number saying how
          likely an outcome is. A random variable attaches a number to an
          uncertain outcome. And a distribution says which values that number can
          take and how often each occurs.
        </p>
        <WorkedExample>
          <p>
            Pick a person at random from the population and measure their height.
          </p>
          <NumberTable
            headings={["the idea", "here"]}
            rows={[
              ["outcome", "which person gets picked"],
              ["random variable", "their height, unknown until measured"],
              ["distribution", "which heights are common in the population"],
            ]}
          />
        </WorkedExample>
      </PrimerSection>

      <PrimerSection title="18. Distributions">

        <p>Two collections can share a mean and standard deviation while having different shapes. One can be symmetric while the other has a long tail. Several peaks can reflect mixed groups or another feature of the process. A plot helps us investigate those differences rather than assuming that the summaries capture them.</p>
        <p>

          Section 3 already met the lopsided case. Four incomes of 25,000 and
          one of 500,000 lean entirely to one side, and the mean of 120,000
          lands where nobody is. That is skew, and neither a center nor a spread
          can report it, since a column shaped symmetrically about 120,000 could
          be built to share both numbers while looking nothing like those five
          incomes.
        </p>
        <NumberTable
          headings={["feature of a distribution", "what it describes"]}
          rows={[
            ["center", "where the values sit"],
            ["spread", "how far they range"],
            ["skew", "whether one side stretches further than the other"],
            ["peaks", "where values concentrate; several peaks can have several causes"],
            ["tails", "how often extreme values appear"],
          ]}
        />
        <p>The mean and standard deviation describe particular properties of a distribution without determining its full shape. Looking at the observations helps us decide whether those summaries answer our question and whether a proposed distribution is a reasonable model.</p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 14 to 18"
        questions={[
          choice(
            "The regression slope for these five people is 0.8. What is that number, in this primer’s vocabulary?",
            [
              "The covariance of height and weight divided by the variance of height",
              "The correlation divided by the variance of height",
              "The covariance divided by the standard deviation of height",
              "The share of the variation in weight the fit accounts for",
            ],
            0,
            "The slope compares the columns’ joint variation with the variation in height. Both covariance and height variance divide their totals by the same count, so their ratio gives the same slope as the original deviation-sum formula. Its units describe weight change per centimeter of height.",
          ),
          trueFalse(
            "R² equals the square of the correlation for any fitted model.",
            false,
            "The equality holds for ordinary least-squares regression with one predictor and a fitted intercept, with correlation and R squared calculated on those same observations. For these five people, the two calculations are:\n\n```math\nR² = 1 - (16 / 176) ≈ 0.9091\n```\n\n```math\nr² = 40² / (50 × 35.2) ≈ 0.9091\n```\n\nAdditional predictors, omitting the intercept or evaluating on new observations changes the conditions. Arbitrary fitted lines do not have this identity.",
          ),
          choice(
            "What separates a statistic from a parameter?",
            [
              "A statistic is computed from the sample you have, and a parameter is the corresponding number for the population",
              "A statistic describes one column and a parameter describes two",
              "A statistic is an estimate and a parameter is the same number measured exactly on the sample",
              "A statistic changes with the choice of units and a parameter does not",
            ],
            0,
            "A population parameter describes the whole group we want to understand. A statistic is calculated from the observed sample. When these five people are treated as a sample, their mean height estimates the larger population’s mean. The usual sample-variance correction accounts for estimating the mean from those same sampled observations.",
          ),
          choice(
            "Which way round do statistics and probability work?",
            [
              "Statistics looks at observations and reasons back to the process, and probability starts from a process and describes what it might produce",
              "Probability reasons back to the process, and statistics describes what a process might produce",
              "Both reason from observations back to the process, and differ only in which summaries they use",
              "Statistics describes a sample and probability describes a larger sample",
            ],
            0,
            "Probability starts from a specified process and describes its possible outcomes. Statistics uses observed outcomes to learn about that process. If we select a person at random, the selected person is the outcome, their height is a random variable and the population’s height distribution describes how likely different heights are.",
          ),
          trueFalse(
            "Two columns can have identical means and identical standard deviations and still look nothing alike.",
            true,
            "Mean and standard deviation do not uniquely determine a distribution. Groups with the same two summaries can differ in symmetry, number of peaks or the frequency of extreme values. Looking at the distribution remains useful even after calculating its center and spread.",
          ),
        ]}
      />

      <PrimerSection title="19. Sampling Variability">
        <p>A sample mean can differ from the population mean. Another sample can give another estimate. That variation matters whenever we use a limited collection of observations to draw a conclusion about a larger group.</p>
        <p>
          The box below draws people from a population whose true mean height is
          170 cm. Press for more and watch the solid line, the mean of everyone
          drawn so far, move around the dashed line, which marks the truth.
        </p>
        <PrimerPlayground>
          <SamplingPlayground />
        </PrimerPlayground>
        <p>With a handful of people, the sample mean can vary noticeably. As the sample grows, it usually stays closer to the dashed population mean. Individual draws can still move it farther away before later draws bring it back.</p>
        <KeepInMind>
          <p>
            More data does not pull the individual observations closer together.
            The people drawn are as varied at four hundred as they were at forty;
            it is the <em>mean</em> that steadies, not the population.
          </p>
          <p>

            And a larger sample cannot fix a sample collected badly. If the
            drawing process favors some people over others, more of it produces
            a more confident wrong answer rather than a right one.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="20. Why Sample Means Stabilize">
        <p>The tendency of a sample average to settle toward its expected value is described by the law of large numbers. Its usual independent-sampling form requires observations from the same distribution with a finite mean. It does not make a biased sampling process representative of the population we intended to study.</p>
        <p>Under the independent sampling and finite-variance assumptions used here, the standard error describes the spread of possible sample means. It decreases with the square root of the sample size. Individual observations remain variable; averaging reduces the variation in the estimate of their mean.</p>
        <Equation>{"typical gap ≈ population SD / √count\n\n  5 people:   7 / √5    ≈ 3.1 cm\n 40 people:   7 / √40   ≈ 1.1 cm\n400 people:   7 / √400  ≈ 0.35 cm"}</Equation>
        <p>The population behind the activity in section 19 has a true mean height of 170 cm and a standard deviation of 7 cm. The 7 in the formula comes from that population spread. Four times as many independent observations halves the standard error, and a hundred times as many reduces it to a tenth. The activity starts with forty people whose mean is 167.24 cm, nearly three centimeters below the population mean. That particular sample is farther off than the usual forty-person sample. Additional draws can move its mean in either direction, even though larger independent samples tend to give more stable estimates.</p>
        <p>Larger samples help when the sampling process and the assumptions behind the estimate are appropriate. Repeating a biased collection process does not remove its bias. We still need to ask which population the observations actually represent.</p>
        <KeepInMind>
          <p>
            The rule describes the typical gap across the many samples that
            could have been drawn, not the gap of the sample in front of you. A
            particular forty can land further off than a particular five. And it
            says nothing about the next person drawn, who is as likely to be far
            from the mean as anyone before them. The settling is in the average
            and nowhere else.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="21. The Normal Distribution">
        <p>
          The curve above is a normal distribution, often called a bell curve. It gives us one useful model for how values can be distributed. We will examine its properties here, then ask when that shape is a reasonable description of observations.
        </p>
        <p>

          It is symmetric about its mean, most of its probability sits near the
          center, and progressively less lies further into the tails. Two numbers
          fix it completely. The mean slides the bell left or right, and the
          standard deviation makes it narrow and tall or wide and flat.
        </p>
        <WorkedExample title="What the two numbers fix">
          <p>

            Fixing the mean and the standard deviation fixes how much of the
            population sits within any distance of the center, and the shares
            are the same for every bell. For the population behind the box, mean
            170 cm and standard deviation 7 cm, they come out as follows.
          </p>
          <NumberTable
            headings={["within", "band of heights", "share of the population"]}
            rows={[
              ["one standard deviation", "163 to 177 cm", "about 68%"],
              ["two standard deviations", "156 to 184 cm", "about 95%"],
              ["three standard deviations", "149 to 191 cm", "about 99.7%"],
            ]}
          />
          <p>

            So a person more than two standard deviations from the center is
            about one in twenty, and the bars in the box thin out at the same
            rate on both sides. The shares belong to the bell and to nothing
            else, which is the point of the warning below.
          </p>
        </WorkedExample>
        <KeepInMind>
          <p>Many measurements are approximately normal, while others have substantial skew or long tails. Incomes, waiting times, city populations and word frequencies give us reasons to check the distribution before choosing a normal model. Its tail probabilities can be misleading when the observed process has a different shape.</p>
          <p>
            A column of numbers can be skewed, have several peaks, or take only a few distinct values. Plot the observations and consider how they were collected before choosing a normal model.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="22. Individual Values Versus Sample Means">
        <p>The distribution of individual observations and the distribution of sample means are different objects. The activity above draws individual observations, so its histogram shows the former.</p>
        <NumberTable
          headings={["idea", "what it concerns"]}
          rows={[
            [
              "law of large numbers",
              "one sample mean settling toward the population mean as the sample grows",
            ],
            [
              "central limit theorem",
              "the distribution of many sample means, across repeated samples, becoming approximately normal",
            ],
          ]}
        />
        <p>
          The box above draws individual people and piles them into bins, so what
          fills in as you press is the shape of the population itself, and what
          settles is the one sample mean. That is the empirical distribution
          converging, and the law of large numbers alongside it.
        </p>
        <p>The central limit theorem concerns the distribution of averages from repeated samples. To investigate it, we would draw many separate samples and calculate a mean for each one. Under suitable independence and finite-variance conditions, that distribution becomes approximately normal as sample size grows, even when the original population is not normal. The current activity draws individual heights from an already normal population, so it does not demonstrate that approximation emerging from a different population shape.</p>
      </PrimerSection>

      <PrimerSection title="23. What a Model Learns from a Sample">
        <p>We have estimated a mean and a variance from observations. Fitting a regression line asks another estimation question: which slope best describes the relationship in the measured group?</p>
        <p>A fitted coefficient is also calculated from a sample. The slope from the five people would generally change if we measured a different group. Its reliability depends on the fitting procedure and how the observations were collected; a larger dataset does not automatically correct a mismatch with the population we want to predict.</p>
        <KeepInMind>
          <p>Different models and fitting procedures make different assumptions about how the observations were collected. Those assumptions need to be checked against the source of the data.</p>
          <p>Datasets are often assembled deliberately rather than sampled randomly. The population can change between training and use, and a collection channel can overrepresent the people who use it. Collecting more through the same process does not by itself remove those differences. We may need different observations or a fitting and evaluation procedure that accounts for them.</p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="24. How Machine Learning Uses These Ideas">
        <p>
          Every idea in this primer reappears, usually without announcement, in
          the pages that follow.
        </p>
        <NumberTable
          headings={["idea", "question it answers", "where it turns up"]}
          rows={[
            ["mean", "where is this column centered", "centering, filling gaps"],
            ["deviation", "how far is this value from center", "residuals, features"],
            ["variance", "how widely does it spread", "scaling, PCA"],
            ["standard deviation", "spread in the original units", "standardization"],
            ["covariance", "do two columns move together", "regression, PCA"],
            ["correlation", "how strong is that, without units", "exploration, diagnostics"],
            ["distribution", "which values occur, how often", "modeling noise"],
            ["sampling variability", "how might this estimate change", "generalization"],
          ]}
        />
        <p>Standardization and regression reuse the summaries developed here. Standardization expresses a value relative to a mean and standard deviation. A simple least-squares slope relates covariance to the input variance. The different names describe different uses of the same underlying measurements.</p>
        <p>

          The last row is the second half of the primer in one line. A score
          measured on the rows a model was fitted to says how well it
          summarized its sample, and the question that matters is how it would
          have come out on different rows, which is why data is held back
          before fitting.
        </p>
        <InAModel>
          <p>A fitted model also summarizes observations. Its form determines which relationships it can represent and which details it leaves out. That makes the choice of model part of interpreting its results.</p>
          <p>The same practical questions apply to a summary and a fitted model: which information was retained, which was lost, and how might another sample change the result?</p>
        </InAModel>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 19 to 24"
        questions={[
          trueFalse(
            "Drawing more people from the population makes the individual heights cluster more tightly around the true mean.",
            false,
            "The people drawn are as varied at four hundred as they were at forty. It is the mean that steadies, not the population, which is why the solid line stops making large excursions while the scatter of the people does not change.",
          ),
          several(
  "With independent representative draws from one fixed population of finite variance, which effects follow as we increase the sample size?",
  [
                "Steadies the sample mean, with the typical gap to the truth shrinking with the square root of the count",
                "Fills in the shape of the population, since the people are piled into bins",
                "Pulls each person drawn closer to the true mean",
                "Repairs a sample whose drawing process favors some people over others",
              ],
  [0, 1],
  "Under the stated sampling assumptions, larger samples make the sample mean less variable and fill in more of the population’s shape. Individual heights retain the population’s original spread. Increasing the count alone does not correct a collection process that systematically favors some people.",
  {
    "description": "The simulation adds individual observations and displays their histogram, while also calculating the sample mean.",
    "data": "Sampling is independent from an unchanged population. The collection process does not favor particular people."
  },
),
          choice(
  "Which result is illustrated by this simulation?",
  [
                "The law of large numbers, with the empirical distribution converging alongside it",
                "The central limit theorem, since the piles come out bell shaped",
                "Both at once, since a sample mean and a distribution are each on show",
                "Neither, because the population it draws from is already normal",
              ],
  0,
  "What fills in as you press is the shape of the population itself, and what settles is the one sample mean. The central limit theorem is a claim about a different quantity, the distribution of many sample means across repeated samples, and showing it would mean drawing many separate samples and plotting the distribution of those means instead of the people.",
  {
    "description": "The bars display individual sampled heights, not a histogram of means from repeated samples.",
    "data": "Repeat: draw one person independently from a fixed population, add that height to the histogram, and recalculate the mean of all heights drawn so far."
  },
),
          several(
  "Which statements hold for the normal population described here?",
  [
                "It is symmetric about its mean",
                "Two numbers fix it completely",
                "About two thirds of the population sits within one standard deviation of the mean, between 163 and 177 cm for the box’s population",
                "A column being numerical is a reason to expect it",
              ],
  [0, 1, 2],
  "A normal distribution is fixed by its mean and standard deviation. Its symmetry and the stated shares within one or two standard deviations follow from that model. Numerical measurements need not be normal: incomes and waiting times, for example, can be strongly skewed. Inspect the data and the process before relying on a normal model’s tail probabilities.",
  {
    "description": "The stated normal model is an assumption of this simulation, not a conclusion from numerical data alone.",
    "data": "Population mean: 170 cm\nPopulation standard deviation: 7 cm\nPopulation distribution: normal"
  },
),
          choice(
  "The slope 0.8 was calculated from five sampled people. What follows from treating it as a statistic?",
  [
    "Five different people could give a different number, and more relevant representative data can make such estimates steadier",
    "It is the population slope, since it was computed exactly",
    "It cannot be used for prediction until the population is known",
    "More data of any kind would bring it closer to the truth"
  ],
  0,
  "The coefficient was calculated from these sampled people and the chosen line model. Another representative sample could produce a different coefficient. More comparable observations can make estimates steadier under the stated sampling assumptions, while collecting from the wrong population does not fix that mismatch. The fitted model retains some patterns and leaves others out, just as a simpler summary does.",
),
        ]}
      />

      <PrimerPractice
        id="practice-summarising-the-five-people-with-the-library"
        title="Practice. Calculating the Five People's Statistics With NumPy"
        exercises={[
          exercise(
            "Take one column apart around its mean",
            ["The workshop averaged weekly records. Here we will use that same total-and-count idea for five people's heights and weights, then look beyond the center to describe how much each column varies. The two complete NumPy arrays are supplied below.","For each column, add the values and divide by the count to find the mean. Subtract that mean from every value, square the deviations, and add those squares. Divide by the count for the population variance, then take its square root for the standard deviation. Here the five people are the whole group we are describing.","Replace the missing calculations. The print statements are supplied so you can concentrate on where the numbers come from. Use array arithmetic, np.sum and np.sqrt here, rather than np.mean, np.var or np.std. Both deviation totals should be zero, even though the spreads are different."],
            `import numpy as np

people = {
    "height": np.array([160, 165, 170, 175, 180], dtype=float),
    "weight": np.array([58, 66, 68, 74, 74], dtype=float),
}

for name, values in people.items():
    mean = None  # TODO: total divided by count
    deviations = None  # TODO: each value's distance from the mean
    squared_total = None  # TODO: square first, then add
    variance = None  # TODO: population variance
    standard_deviation = None  # TODO: back to the original units

    print(name)
    print("  deviations " + " ".join(f"{value:.0f}" for value in deviations))
    print(f"  mean {mean:.1f}, deviation total {np.sum(deviations):.1f}")
    print(f"  sum of squared deviations {squared_total:.1f}")
    print(f"  variance {variance:.1f}")
    print(f"  standard deviation {standard_deviation:.2f}")`,
            `import numpy as np

people = {
    "height": np.array([160, 165, 170, 175, 180], dtype=float),
    "weight": np.array([58, 66, 68, 74, 74], dtype=float),
}

for name, values in people.items():
    mean = np.sum(values) / values.size
    deviations = values - mean
    squared_total = np.sum(deviations ** 2)
    variance = squared_total / values.size
    standard_deviation = np.sqrt(variance)

    print(name)
    print("  deviations " + " ".join(f"{value:.0f}" for value in deviations))
    print(f"  mean {mean:.1f}, deviation total {np.sum(deviations):.1f}")
    print(f"  sum of squared deviations {squared_total:.1f}")
    print(f"  variance {variance:.1f}")
    print(f"  standard deviation {standard_deviation:.2f}")`,
            `height
  deviations -10 -5 0 5 10
  mean 170.0, deviation total 0.0
  sum of squared deviations 250.0
  variance 50.0
  standard deviation 7.07
weight
  deviations -10 -2 0 6 6
  mean 68.0, deviation total 0.0
  sum of squared deviations 176.0
  variance 35.2
  standard deviation 5.93`,
            {
              question: "How spread out are the five people around their mean?",
              hints: [
                "np.sum adds the entries of an array, and values.size gives their count. Subtracting a single number from an array subtracts it from every entry.",
                "Square each deviation before adding. Squaring their total would give zero and discard the spread we are trying to measure.",
                "The variance is in squared units. np.sqrt returns to centimeters or kilograms, which lets the standard deviation be read alongside the original measurements.",
              ],
              check: numberCheck("What is the population variance of weight?", 35.2, 0.05, "Both columns balance around their means, so their signed deviations cancel. Their squared deviations do not cancel. That is why variance can distinguish spreads that the deviation total cannot."),
            },
          ),
          exercise(
            "Build a slope from paired deviations",
            [
              "The first challenge measured each column on its own. Now keep each person's height beside their weight. We want to know whether being above the mean in one column tends to go with being above the mean in the other.",
              "Center both columns, multiply the paired deviations, and average those products to find the population covariance. Also calculate the population variance of height from its squared deviations. Use their ratio for the slope, as section 14 does, and choose the intercept so the line passes through the two means.",
              "Complete each step below, then use your slope and intercept to predict the weight at 172 cm. No regression object is needed: the coefficients come from the quantities you have just calculated.",
            ],
            `import numpy as np

heights = np.array([160, 165, 170, 175, 180], dtype=float)
weights = np.array([58, 66, 68, 74, 74], dtype=float)
count = heights.size

mean_height = None  # TODO: mean height
mean_weight = None  # TODO: mean weight
height_deviations = None  # TODO: centre height
weight_deviations = None  # TODO: centre weight
products = None  # TODO: multiply each person's two deviations
covariance = None  # TODO: average the products
height_variance = None  # TODO: average squared height deviations
slope = None  # TODO: covariance relative to height variance
intercept = None  # TODO: make the line pass through the two means
prediction = None  # TODO: apply your line to the new height

print("paired products " + " ".join(f"{value:.0f}" for value in products))
print(f"covariance {covariance:.1f}, height variance {height_variance:.1f}")
print(f"slope {slope:.4f}, intercept {intercept:.1f}")
print(f"prediction at mean height {slope * mean_height + intercept:.1f}")
print(f"prediction at 172 cm {prediction:.1f}")`,
            `import numpy as np

heights = np.array([160, 165, 170, 175, 180], dtype=float)
weights = np.array([58, 66, 68, 74, 74], dtype=float)
count = heights.size

mean_height = np.sum(heights) / count
mean_weight = np.sum(weights) / count
height_deviations = heights - mean_height
weight_deviations = weights - mean_weight
products = height_deviations * weight_deviations
covariance = np.sum(products) / count
height_variance = np.sum(height_deviations ** 2) / count
slope = covariance / height_variance
intercept = mean_weight - slope * mean_height
prediction = slope * 172 + intercept

print("paired products " + " ".join(f"{value:.0f}" for value in products))
print(f"covariance {covariance:.1f}, height variance {height_variance:.1f}")
print(f"slope {slope:.4f}, intercept {intercept:.1f}")
print(f"prediction at mean height {slope * mean_height + intercept:.1f}")
print(f"prediction at 172 cm {prediction:.1f}")`,
            `paired products 100 10 0 30 60
covariance 40.0, height variance 50.0
slope 0.8000, intercept -68.0
prediction at mean height 68.0
prediction at 172 cm 69.6`,
            {
              question: "How can the way height and weight vary together give us a line?",
              hints: [
                "Multiply the centered arrays element by element. A positive product means the person's two measurements sit on the same side of their respective means.",
                "Covariance averages the paired products. Height variance averages the squared height deviations. Use the same count for both.",
                "The slope comes from dividing covariance by height variance. To find the intercept, start with mean weight and subtract the contribution of mean height to the prediction.",
              ],
              check: numberCheck("What slope comes from the paired deviations?", 0.8, 0.00005, "The paired deviations supply the slope, and the two means position the line. The prediction at mean height returns mean weight, which checks that the intercept does the job we chose it for."),
            },
          ),
          exercise(
            "Remove the units and compare two measures of fit",
            [
              "Covariance changes when we change the units. To compare the relationship without centimeters or kilograms, express every deviation as a number of standard deviations. This is the standardization from sections 11 and 12.",
              "Calculate the population standard deviation of each column from its squared deviations, then divide the deviations by that value. Multiply the two standardized columns person by person and average the products to get correlation. Do this with NumPy arithmetic rather than np.corrcoef or a scaler object.",
              "Then build the line using the paired deviations from the previous challenge. Calculate its predictions, squared errors and R squared yourself. Compare that with squared correlation. We are fitting an intercept and one predictor by least squares, then scoring on the same people, so the conditions from section 15 hold.",
            ],
            `import numpy as np

heights = np.array([160, 165, 170, 175, 180], dtype=float)
weights = np.array([58, 66, 68, 74, 74], dtype=float)
count = heights.size
height_mean = np.sum(heights) / count
weight_mean = np.sum(weights) / count
dh = heights - height_mean
dw = weights - weight_mean

height_sd = None  # TODO: population standard deviation
weight_sd = None  # TODO: population standard deviation
standard_height = None  # TODO: remove the height units
standard_weight = None  # TODO: remove the weight units
products = None  # TODO: pair the standardised values
correlation = None  # TODO: average their products

slope = None  # TODO: the line from paired deviations
intercept = None  # TODO: pass through the means
predictions = None  # TODO: one predicted weight per person
errors = None  # TODO: observed minus predicted weight
rss = None  # TODO: squared misses from the line
tss = None  # TODO: squared misses from the mean
r_squared = None  # TODO: the share of baseline error removed

print("height in standard deviations " + " ".join(f"{value:.3f}" for value in standard_height))
print("weight in standard deviations " + " ".join(f"{value:.3f}" for value in standard_weight))
print("products " + " ".join(f"{value:.3f}" for value in products))
print(f"correlation r {correlation:.4f}")
print(f"RSS {rss:.1f}, TSS {tss:.1f}")
print(f"r squared {correlation ** 2:.4f}")
print(f"R squared {r_squared:.4f}")`,
            `import numpy as np

heights = np.array([160, 165, 170, 175, 180], dtype=float)
weights = np.array([58, 66, 68, 74, 74], dtype=float)
count = heights.size
height_mean = np.sum(heights) / count
weight_mean = np.sum(weights) / count
dh = heights - height_mean
dw = weights - weight_mean

height_sd = np.sqrt(np.sum(dh ** 2) / count)
weight_sd = np.sqrt(np.sum(dw ** 2) / count)
standard_height = dh / height_sd
standard_weight = dw / weight_sd
products = standard_height * standard_weight
correlation = np.sum(products) / count

slope = np.sum(dh * dw) / np.sum(dh ** 2)
intercept = weight_mean - slope * height_mean
predictions = slope * heights + intercept
errors = weights - predictions
rss = np.sum(errors ** 2)
tss = np.sum(dw ** 2)
r_squared = 1 - rss / tss

print("height in standard deviations " + " ".join(f"{value:.3f}" for value in standard_height))
print("weight in standard deviations " + " ".join(f"{value:.3f}" for value in standard_weight))
print("products " + " ".join(f"{value:.3f}" for value in products))
print(f"correlation r {correlation:.4f}")
print(f"RSS {rss:.1f}, TSS {tss:.1f}")
print(f"r squared {correlation ** 2:.4f}")
print(f"R squared {r_squared:.4f}")`,
            `height in standard deviations -1.414 -0.707 0.000 0.707 1.414
weight in standard deviations -1.685 -0.337 0.000 1.011 1.011
products 2.384 0.238 0.000 0.715 1.430
correlation r 0.9535
RSS 16.0, TSS 176.0
r squared 0.9091
R squared 0.9091`,
            {
              question: "Does removing the units let us compare how strongly the columns move together?",
              hints: [
                "The first challenge already gave you the steps for standard deviation. Divide the centered values by it to express their distances without the original units.",
                "The products compare matching people, so ordinary array multiplication is what you need. Keep their full precision until printing.",
                "RSS compares the observed weights with the line's predictions. TSS compares them with mean weight. R squared is one minus the fraction of baseline squared error that remains.",
              ],
              check: numberCheck("What correlation comes from the standardized products?", 0.9535, 0.00005, "The two scores agree here because of how this line was fitted and where it was evaluated. That agreement is a property of this least-squares setup, not a rule for every model or for new data."),
            },
          ),
          exercise(
            "Leave one person out and rebuild the line",
            [
              "A fitted slope describes the people used to calculate it. Section 23 asks what might change with a different sample. We can make that question concrete by leaving out one of our five people at a time.",
              "Complete fit_line using the means, paired deviations and squared height deviations from challenge 2. Return a slope and an intercept. The loop then removes the same person's row from both arrays and calls your calculation again.",
              "Collect those five slopes and print the smallest, largest and their difference. Recalculate both means inside the function on every call: keeping the means from all five people would answer a different question.",
            ],
            `import numpy as np

heights = np.array([160, 165, 170, 175, 180], dtype=float)
weights = np.array([58, 66, 68, 74, 74], dtype=float)

def fit_line(x, y):
    # TODO: centre these rows and calculate the slope and intercept.
    raise NotImplementedError("Calculate the line from these arrays")

all_slope, _ = fit_line(heights, weights)
print(f"all five: slope {all_slope:.4f}")

slopes = []
for left_out in range(heights.size):
    four_heights = np.delete(heights, left_out)
    four_weights = np.delete(weights, left_out)
    slope, intercept = fit_line(four_heights, four_weights)
    slopes.append(slope)
    print(f"without the {heights[left_out]:.0f} cm person: slope {slope:.4f}, intercept {intercept:.1f}")

smallest = None  # TODO: smallest of the five slopes
largest = None  # TODO: largest of the five slopes
spread = None  # TODO: how far apart are the extremes?
print(f"smallest {smallest:.4f}, largest {largest:.4f}, spread {spread:.4f}")`,
            `import numpy as np

heights = np.array([160, 165, 170, 175, 180], dtype=float)
weights = np.array([58, 66, 68, 74, 74], dtype=float)

def fit_line(x, y):
    mean_x = np.sum(x) / x.size
    mean_y = np.sum(y) / y.size
    dx = x - mean_x
    dy = y - mean_y
    slope = np.sum(dx * dy) / np.sum(dx ** 2)
    intercept = mean_y - slope * mean_x
    return slope, intercept

all_slope, _ = fit_line(heights, weights)
print(f"all five: slope {all_slope:.4f}")

slopes = []
for left_out in range(heights.size):
    four_heights = np.delete(heights, left_out)
    four_weights = np.delete(weights, left_out)
    slope, intercept = fit_line(four_heights, four_weights)
    slopes.append(slope)
    print(f"without the {heights[left_out]:.0f} cm person: slope {slope:.4f}, intercept {intercept:.1f}")

smallest = np.min(slopes)
largest = np.max(slopes)
spread = largest - smallest
print(f"smallest {smallest:.4f}, largest {largest:.4f}, spread {spread:.4f}")`,
            `all five: slope 0.8000
without the 160 cm person: slope 0.6000, intercept -33.0
without the 165 cm person: slope 0.8571, intercept -78.3
without the 170 cm person: slope 0.8000, intercept -68.0
without the 175 cm person: slope 0.7429, intercept -58.9
without the 180 cm person: slope 1.0000, intercept -101.0
smallest 0.6000, largest 1.0000, spread 0.4000`,
            {
              question: "How much can one person change the slope we report?",
              hints: [
                "The function receives only the rows to use in that fit. Find the two means there, then subtract them from x and y.",
                "Divide the sum of paired deviations by the sum of squared x deviations for the slope. The intercept positions the line at the two means.",
                "np.delete removes one position from an array. Removing that same position from both arrays keeps each remaining person's measurements paired.",
              ],
              check: numberCheck("What is the largest of the five slopes?", 1, 0.00005, "Removing either end of this small sample changes the slope noticeably. These overlapping subsets illustrate sensitivity to individual observations; they are not independent new samples or a confidence interval."),
            },
          ),
        ]}
      />
    </PrimerPage>
  );
}
