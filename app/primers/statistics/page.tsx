import { lessonIntuitions } from "@/lib/intuition";
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
  title: "Statistics Primer · oop_ml",
  description:
    "Describe a sample, compare variables, and separate the observed pattern from uncertainty about new data.",
};

export default function StatisticsPrimerPage() {
  return (
    <PrimerPage
      technicalStart="10. Covariance"
      title="Statistics and Probability Primer"
      tagline="Describe a sample, compare variables, and separate the observed pattern from uncertainty about new data."
      prerequisites={
        <>
          Arithmetic, and a willingness to add five numbers by hand. The same
          five people carry the whole primer, so every figure here can be
          checked against the one before it.
        </>
      }
    >
      <PrimerSection title="What Can a Handful of Measurements Tell Us?">
{lessonIntuitions["statistics"].opening.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
<GuidedIntuition lesson={lessonIntuitions["statistics"]} />
<IntuitionConnection lesson={lessonIntuitions["statistics"]} />
</PrimerSection>

      <PrimerSection title="1. Observations and Variables">

        <p>
          Five people, each measured twice. That is the whole dataset, and it
          carries every idea on this page.
        </p>
        <Equation>{"height (cm):  160   165   170   175   180\nweight (kg):   58    66    68    74    74"}</Equation>
        <p>
          Two words are worth fixing before anything is computed. An observation
          is one of the five people, one row, everything measured about a single
          case. A variable is one of the two measurements taken across all of
          them, one column, the same quantity recorded for everybody.
        </p>
        <p>
          Almost everything in this primer is a statement about a column, or
          about how two columns relate. The rows are what we have; the columns
          are what we describe.
        </p>
        <p>
          The distinction earns its keep because the two directions answer
          different questions. Reading across a row describes one person and
          nobody else, which is what a model does each time it makes a
          prediction. Reading down a column compares the same quantity across
          everybody, and every summary on this page is computed that way, down
          a column. The units belong to the column too, centimetres for one
          and kilograms for the other, which is a small point now and returns
          in section 10.
        </p>
      </PrimerSection>

      <PrimerSection title="2. Why We Summarize Data">
        <p>
          Five heights can simply be read. Five thousand cannot, and neither can
          the columns a model is usually handed.
        </p>
        <p>
          A summary trades detail for something a person can hold in mind. Two
          numbers about a column, one saying roughly where its values sit and one
          saying how spread out they are, answer most of the questions anyone
          asks of it, and they can be compared across columns and across datasets
          in a way that a list of raw values cannot.
        </p>
        <p>
          The cost is real and worth stating up front. Every summary discards
          something, and the rest of this primer is partly about noticing what
          each one throws away.
        </p>
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
            The mean is a measure of centre, and that is not the same as a
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
          Once there is a centre, every value can be described by its distance
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
          side of the centre a person is on, and its size says how far out they
          sit. The shortest person is 10 below the mean height and the tallest
          is 10 above it, the same distance in opposite directions, which is
          what lets the two cancel. Every summary that follows, the variance,
          the covariance and the correlation, is built from these signed
          distances.
        </p>
        <p>
          That the deviations sum to zero is not a coincidence of these numbers.
          It is the balance point from the last section, stated arithmetically,
          and it holds for every column there has ever been. It is also about to
          be inconvenient.
        </p>
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
        <p>
          Identical means, and nobody would describe them as the same. One group
          is nearly uniform and the other ranges over sixty centimetres. Whatever
          separates them is not centre, and the mean cannot see it at all.
        </p>
        <p>
          The deviations already see what the mean cannot. Subtract 170 from
          each value and the two groups stop looking alike.
        </p>
        <Equation>{"tightly packed:    −1     0     0     0     1      sum = 0\nwidely spread:    −30   −15     0    15    30      sum = 0"}</Equation>
        <p>
          Both lists sum to zero, as every list of deviations does, so adding
          them up cannot tell the groups apart either. The sizes can. One group
          never strays more than a centimetre from its centre and the other
          strays thirty.
        </p>
        <p>
          So a second summary is needed, one that answers how far from the centre
          the values tend to sit. The deviations from section 4 are exactly the
          raw material for it, and the whole difficulty, which section 6 opens
          with, is using their sizes without letting their signs cancel.
        </p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 1 to 5"
        questions={[
          trueFalse(
            "The five height deviations sum to zero, and so do the deviations of every column there has ever been.",
            true,
            "It is the balance point from section 3 stated arithmetically. The pull of the values above the mean exactly cancels the pull of those below it, so the signed distances always add to zero, for these five heights, for the five weights, and for any column at all. That is also what makes it inconvenient, since averaging the deviations can never measure spread.",
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
            "The mean is still the balance point, where the pull of the values above it cancels the pull of those below. It just stops being a good answer to what someone here looks like, because a measure of centre is not the same thing as a typical observation. Four of the five earn 25,000, and the mean is nowhere near it.",
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
            "Identical means, and nobody would describe the two groups as the same. Their deviations tell them apart at once, running from −1 to 1 in one group and from −30 to 30 in the other, so whatever separates them is not centre, and a second summary is needed to say how far from the centre the values tend to sit.",
          ),
          several(
            "Which of these hold for the five people as sections 1 to 3 set them up?",
            [
              "An observation is one person, one row, everything measured about a single case",
              "A variable is one of the two measurements taken across all five, one column",
              "The mean height is 170 and the mean weight is 68",
              "Every summary of a column discards something",
            ],
            [0, 1, 2, 3],
            "Almost everything in this primer is a statement about a column, or about how two columns relate. The rows are what we have and the columns are what we describe, and the two means are the first summaries computed down them. The cost is stated up front, which is that every summary trades detail for something a person can hold in mind.",
          ),
          trueFalse(
            "One reason a summary is worth having is that it can be compared across columns and across datasets in a way a list of raw values cannot.",
            true,
            "Five heights can simply be read, and five thousand cannot, nor can the columns a model is usually handed. Two numbers about a column, one saying roughly where its values sit and one saying how spread out they are, answer most of what anyone asks of it.",
          ),
        ]}
      />

      <PrimerSection title="6. Variance">
        <p>
          The obvious first attempt is to average the deviations, and it fails
          immediately, for the reason section 4 gave.
        </p>
        <Equation>{"(−10 + −5 + 0 + 5 + 10) / 5 = 0"}</Equation>
        <p>
          It gives zero for every column that has ever existed, because the
          positive and negative deviations cancel by construction. The
          cancellation is the problem, so the fix is to stop the signs from
          cancelling. Two ways suggest themselves, taking the absolute value of
          each deviation or squaring it, and both are used in practice.
        </p>
        <p>
          Squaring is the one that leads here. Squares are easier to work with
          algebraically, which matters once calculus starts differentiating them,
          and they punish a large deviation far more than several small ones,
          which is often the behaviour wanted. Averaging the absolute values
          instead gives the mean absolute deviation, a perfectly respectable
          statistic that this primer simply does not follow.
        </p>
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
            The denominator depends on that choice, and it is worth meeting now
            rather than being surprised by it later.
          </p>
          <Equation>{"population:  σ² = Σ(xᵢ − μ)² / N          divide by 5, giving 50\nsample:      s² = Σ(xᵢ − x̄)² / (n − 1)    divide by 4, giving 62.5"}</Equation>
          <p>
            When the five are the whole group, divide by how many there are. When
            the five are a sample being used to estimate the spread of something
            larger, divide by one fewer, because the mean was itself estimated
            from the same five and that makes the deviations slightly too small.
          </p>
          <p>
            This primer divides by 5 throughout, since the five people are the
            group being described. Section 16 is where they become a sample.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="7. Standard Deviation">
        <p>
          Variance has one awkward feature. Squaring the deviations squared the
          units too, so a variance of 50 is 50 square centimetres, which is not a
          quantity anyone has intuition about.
        </p>
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
          <p>
            It is tempting to call this the typical distance from the mean, and
            it is close enough to be useful intuition, though it is not literally
            that. It is the root-mean-square distance, which squares first,
            averages, then takes the root, and that is a different number from
            the average distance.
          </p>
          <p>
            For our five heights the average absolute distance is 6, while the
            standard deviation is 7.07. Squaring gives the far-out values more
            say, so the standard deviation sits above the plain average whenever
            the deviations are uneven.
          </p>
        </KeepInMind>
        <p>
          Three experiments in the box below separate centre from spread. Move
          one point a little and both shift slightly. Move one point a long way
          and the spread jumps while the centre barely stirs. Then drag each of
          the five points up by the same amount, one after another. The centre
          travels with them and the spread ends up where it started, give or
          take the precision of a drag, because a shift shared by everybody
          changes nobody&rsquo;s distance from the centre.
        </p>
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
          The products have units of their own, centimetres times kilograms,
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
              "Absolute values do not stop the signs from cancelling",
              "Absolute values are not used in practice",
              "Squaring is the only way to get a positive number out of a deviation",
            ],
            0,
            "Both fixes stop the cancellation and both are used in practice. Averaging the absolute values gives the mean absolute deviation, a perfectly respectable statistic this primer simply does not follow, and squaring is the one that matters once calculus starts differentiating it.",
          ),
          trueFalse(
            "Moving every one of the five people up by the same amount changes the mean and leaves the standard deviation exactly where it was.",
            true,
            "Each deviation is a distance from the centre, and the centre moves with everybody, so no deviation changes. The squares, their average and the root are all unchanged with them. That is the third experiment in the box in section 7, dragging each point up by the same amount one after another, and it is why centre and spread are two summaries rather than one.",
          ),
          trueFalse(
            "The standard deviation is the average distance of the values from the mean.",
            false,
            "It is the root-mean-square distance, which squares first, averages, then takes the root, and that is a different number. For the five heights the average absolute distance is 6 while the standard deviation is 7.07, because squaring gives the far-out values more say.",
          ),
          several(
            "Which of these hold for the spread of the five heights as sections 6 and 7 compute it?",
            [
              "The variance is 50, and it is in square centimetres",
              "The standard deviation is about 7.07 cm, the square root of the variance",
              "Averaging the deviations themselves would also have come to 50",
              "Dividing the 250 by 4 instead of 5 gives 62.5, which is the figure this primer uses throughout",
            ],
            [0, 1],
            "Averaging the deviations gives zero for every column that has ever existed, which is the whole reason for squaring them first. Squaring squares the units too, which is why the root is taken. The 62.5 is the sample variance, for when the five stand for a larger group, and section 16 is where they do; this primer divides by 5 because the five are the group being described.",
          ),
          several(
            "Which of these hold once the deviations are paired up person by person, as sections 8 and 9 do?",
            [
              "A person below average in both height and weight gives a positive product",
              "A person above average in both gives a negative product",
              "If taller people tend to be heavier, knowing someone’s height says something about their weight, which is what a prediction is",
              "Every product among the five is positive or zero, so nobody here is tall and light",
            ],
            [0, 2, 3],
            "A negative times a negative is positive, and so is a positive times a positive, so agreement in either direction gives a positive product. Only disagreement goes negative, tall but light or short but heavy. The 160 cm person is 10 below in both and gives the largest product, 100, the 170 cm person sits on both means and gives 0, and the five sum to 200.",
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
          <p>
            The size, on the other hand, cannot be read at all yet. It is
            tempting to call 40 large, and there is nothing here to say whether
            it is.
          </p>
          <p>
            Measure the same five heights in metres instead of centimetres and
            every height deviation shrinks by a hundred, so the covariance falls
            from 40 to 0.4 without one thing about these people changing. A
            number that moves with the choice of ruler cannot be compared against
            anything, including itself.
          </p>
        </KeepInMind>
        <p>
          The sum of 200 is also worth remembering. The regression page built
          that exact number on its way to a slope without giving it a name, and
          section 14 collects the debt.
        </p>
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
          <p>
            In metres the covariance becomes 0.4 and the height standard
            deviation becomes 0.0707, and the two hundredfolds cancel. r is
            0.953 either way.
          </p>
        </WorkedExample>
        <WhyThisWorks>
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
            ["near 0", "no straight-line relationship worth speaking of"],
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
            route with no units anywhere in it. Pressing the button for the
            measured five in the box above shows the same figure in its
            correlation readout.
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
            thing driving both, an artefact of how the data was selected or
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
            "Measuring the same five heights in metres rather than centimetres changes the covariance without changing anything about the people.",
            true,
            "Every height deviation shrinks by a hundred, so the covariance falls from 40 to 0.4. A number that moves with the choice of ruler cannot be compared against anything, including itself, which is why only the sign of a covariance can be read and not its size.",
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
            "Covariance carries the scale of height and the scale of weight at once, and the standard deviations are exactly the measures of each column’s own spread. In metres the covariance becomes 0.4 and the height standard deviation becomes 0.0707, the two hundredfolds cancel, and r is 0.953 either way. Section 12 shows the same thing from the other side, each person turned into a count of standard deviations, the shortest at −1.414 in height and −1.685 in weight, and r the average of the products.",
          ),
          trueFalse(
            "A correlation near zero means there is no relationship between the two columns.",
            false,
            "Correlation measures linear co-movement and only that. Along a symmetric U shape the left arm falls and the right arm rises, the two contributions cancel exactly, and r comes out near zero while every point sits on an exact curve. Reporting no correlation there would be arithmetically true and completely misleading.",
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
            "Correlation says two columns vary together and says nothing about why. What it cannot distinguish includes the first influencing the second, the second influencing the first, some third thing driving both, an artefact of how the data was selected, and plain coincidence in a small sample. That makes it a description rather than an explanation.",
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
        <p>
          Now the payoff. The regression page handed you a formula for the slope,
          derived from calculus, and it looked like a ratio of two sums.
        </p>
        <Equation>{"slope = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²"}</Equation>
        <p>
          Divide the top and the bottom by the same count of five, which changes
          nothing, and both halves turn into things this primer has named.
        </p>
        <Equation>{"slope = covariance(x, y) / variance(x)\nslope = 40 / 50 = 0.8"}</Equation>
        <p>
          Read in two steps, that says everything. The covariance measures how
          height and weight move together. The variance measures how much height
          moves on its own. Their ratio is how much of the joint movement should
          be credited to each centimetre of height.
        </p>
        <WhyThisWorks title="Why the units come out right">
          <p>The units survive the division and land exactly where they should.</p>
          <Equation>{"covariance is in  cm · kg\nvariance is in    cm²\n\nslope is in      cm · kg / cm²  =  kg / cm"}</Equation>
          <p>
            Kilograms per centimetre, which is what a slope on this plot has to
            mean. The regression was computing a covariance over a variance the
            whole time without either being named.
          </p>
        </WhyThisWorks>
      </PrimerSection>

      <PrimerSection title="15. Correlation and R²">
        <p>
          One more connection, and this one needs its conditions stated before
          the identity rather than after it. All of the following have to hold.
        </p>
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
          <p>
            This identity does not carry over unchanged. With more than one
            predictor, without an intercept, or when R² is computed on data the
            model did not fit, the two quantities come apart and the equality
            stops holding.
          </p>
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
        <p>
          Three words keep it straight. The population is the whole group we
          care about, or more generally the process that produces observations.
          The sample is what we actually got, our five people. A statistic is a
          number computed from the sample, and a parameter is the corresponding
          number for the population, which is usually unknown and is what the
          statistic is trying to estimate.
        </p>
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
        <p>
          One debt from section 6 comes due here. While the five were the whole
          group, their spread divided by five. The moment they stand for a
          larger population, the spread being estimated is the
          population&rsquo;s, and the sample mean sits a little closer to these
          five values than the population mean would, so the deviations measured
          from it run slightly small. Dividing by one fewer corrects for that.
        </p>
        <Equation>{"as the whole group:   variance = 250 / 5 = 50       SD ≈ 7.07 cm\nas a sample:          variance = 250 / 4 = 62.5     SD ≈ 7.91 cm"}</Equation>
        <p>
          The mean needs no such correction, and 170 is the estimate of the
          population mean either way. Only the spread is adjusted, and only
          because the centre it is measured from was itself estimated from the
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
        <p>
          A distribution has more to it than a centre and a spread, and it is
          worth saying so before any particular shape arrives.
        </p>
        <p>
          Two columns can have identical means and identical standard deviations
          and still look nothing alike. One might be symmetric and another lean
          heavily to one side. One might have a single peak and another two,
          which usually means two different groups have been mixed together. One
          might have long tails that occasionally produce extreme values where
          another never does.
        </p>
        <p>
          Section 3 already met the lopsided case. Four incomes of 25,000 and
          one of 500,000 lean entirely to one side, and the mean of 120,000
          lands where nobody is. That is skew, and neither a centre nor a spread
          can report it, since a column shaped symmetrically about 120,000 could
          be built to share both numbers while looking nothing like those five
          incomes.
        </p>
        <NumberTable
          headings={["feature of a distribution", "what it describes"]}
          rows={[
            ["centre", "where the values sit"],
            ["spread", "how far they range"],
            ["skew", "whether one side stretches further than the other"],
            ["peaks", "one group, or several mixed together"],
            ["tails", "how often extreme values appear"],
          ]}
        />
        <p>
          The mean and the standard deviation summarise a distribution. They do
          not describe it. That is why the shape of a column is worth looking at
          before either number is trusted, and why section 21 introduces one
          particular shape as one distribution among many rather than as what
          data looks like.
        </p>
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
            "Dividing the top and the bottom of the regression formula by the same count of five changes nothing and turns both halves into things this primer has named. The covariance measures how height and weight move together, the variance measures how much height moves on its own, and their ratio credits the joint movement to each centimetre of height.",
          ),
          trueFalse(
            "R² equals the square of the correlation for any fitted model.",
            false,
            "It holds under four stated conditions, one predictor, one response, an intercept fitted, and both numbers computed on the same observations. On the five people both routes give 0.909, the line accounting for 160 of the 176 in weight and 40² over 50 × 35.2 coming to the same ratio. With more than one predictor, without an intercept, or when R² is computed on data the model did not fit, the two come apart, so it is a fact about simple linear regression rather than a general law.",
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
            "The population is the whole group we care about, the sample is what we actually got, and the parameter is usually unknown and is what the statistic is trying to estimate. The mean height of 170 was a statistic all along, and whether it is close to the population mean is a question the five people cannot answer by themselves. It is also where the spread starts dividing by 4 rather than 5, giving 62.5 instead of 50, because the centre it is measured from was estimated from the same five.",
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
            "That is the whole division, and the second half of this primer needs a little of each. Picking a person at random makes which person gets picked the outcome, their height the random variable, and which heights are common in the population the distribution.",
          ),
          trueFalse(
            "Two columns can have identical means and identical standard deviations and still look nothing alike.",
            true,
            "One might be symmetric and another lean heavily to one side, one might have a single peak and another two, which usually means two groups have been mixed together, and one might have long tails that occasionally produce extreme values where another never does. The mean and the standard deviation summarise a distribution, they do not describe it.",
          ),
        ]}
      />

      <PrimerSection title="19. Sampling Variability">
        <p>
          Here is the fact that makes the second half of this primer necessary.
          Collect five people, compute the mean, and it will not be the
          population mean. Collect five different people and it will be different
          again.
        </p>
        <p>
          The box below draws people from a population whose true mean height is
          170 cm. Press for more and watch the solid line, the mean of everyone
          drawn so far, move around the dashed line, which marks the truth.
        </p>
        <PrimerPlayground>
          <SamplingPlayground />
        </PrimerPlayground>
        <p>
          With a handful of people the solid line wanders noticeably. With a few
          hundred it settles close to the dashed line and stops making large
          excursions.
        </p>
        <KeepInMind>
          <p>
            More data does not pull the individual observations closer together.
            The people drawn are as varied at four hundred as they were at forty;
            it is the <em>mean</em> that steadies, not the population.
          </p>
          <p>
            And a larger sample cannot fix a sample collected badly. If the
            drawing process favours some people over others, more of it produces
            a more confident wrong answer rather than a right one.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="20. Why Sample Means Stabilize">
        <p>
          That settling has a name. The law of large numbers says that as the
          number of independent, representative observations grows, the sample
          mean tends toward the population mean.
        </p>
        <p>
          The mechanism is cancellation. Each person drawn is as far from the
          true mean as people ever are, since the population&rsquo;s own spread
          does not shrink. But the people above the truth and the people below
          it pull the average in opposite directions, and the more of them there
          are, the more completely those pulls cancel. The typical gap between a
          sample mean and the population mean shrinks with the square root of
          the count, which is slower than it sounds.
        </p>
        <Equation>{"typical gap ≈ population SD / √count\n\n  5 people:   7 / √5    ≈ 3.1 cm\n 40 people:   7 / √40   ≈ 1.1 cm\n400 people:   7 / √400  ≈ 0.35 cm"}</Equation>
        <p>
          The 7 is the spread of the population behind the box in section 19,
          which draws heights with a true mean of 170 cm and a standard
          deviation of 7 cm. Four times the people halves the typical gap, and a
          hundred times the people cuts it to a tenth. The box opens on forty
          people already drawn, and their mean reads 167.24 cm, nearly three
          centimetres under the truth, a larger gap than is usual for forty and
          exactly the kind of excursion a few more presses settle.
        </p>
        <p>
          The law is the reason averages are worth computing at all, and the
          reason more data usually helps. It is also narrower than it first
          sounds, and the two qualifications are the ones from the last section.
          The observations have to represent the population you mean to
          describe, and collecting more of a biased sample does not undo the
          bias.
        </p>
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
          The curve in the box above is the normal distribution, the bell shape,
          and it is worth introducing as one distribution among many rather than
          as what data looks like.
        </p>
        <p>
          It is symmetric about its mean, most of its probability sits near the
          centre, and progressively less lies further into the tails. Two numbers
          fix it completely. The mean slides the bell left or right, and the
          standard deviation makes it narrow and tall or wide and flat.
        </p>
        <WorkedExample title="What the two numbers fix">
          <p>
            Fixing the mean and the standard deviation fixes how much of the
            population sits within any distance of the centre, and the shares
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
            So a person more than two standard deviations from the centre is
            about one in twenty, and the bars in the box thin out at the same
            rate on both sides. The shares belong to the bell and to nothing
            else, which is the point of the warning below.
          </p>
        </WorkedExample>
        <KeepInMind>
          <p>
            Many measurements are approximately normal, and many important ones
            are not. Incomes, waiting times, city populations and word
            frequencies are all strongly skewed, and treating any of them as
            normal produces confident nonsense about their tails.
          </p>
          <p>
            Being numerical is not a reason to assume the bell. It is worth
            looking at the shape of a column before assuming anything about it.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="22. Individual Values Versus Sample Means">
        <p>
          Two different convergence ideas are easy to run together, and keeping
          them apart is worth a section, because the box above demonstrates one
          of them and not the other.
        </p>
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
        <p>
          It is not the central limit theorem, which is a claim about a different
          quantity entirely. Demonstrating that one would mean drawing many
          separate samples, computing the mean of each, and plotting the
          distribution of <em>those means</em> rather than of the people. The
          striking part of the result is that this distribution of means comes
          out approximately normal even when the population it drew from is not,
          and the population here already is normal, so the box could not show it
          even in principle.
        </p>
      </PrimerSection>

      <PrimerSection title="23. What a Model Learns from a Sample">
        <p>
          Everything in the last few sections applies directly to a fitted model,
          because a fitted coefficient is a statistic like any other.
        </p>
        <p>
          The training data is the sample. The slope of 0.8 from section 14 was
          computed from five people, and five different people would have given a
          different number. More relevant data makes such estimates steadier, for
          exactly the reason sample means steady. And more data from the wrong
          source makes the model more confident about the wrong thing.
        </p>
        <KeepInMind>
          <p>
            It would be tidy to say every model assumes its data was drawn at
            random from one fixed population, and it would not be true of much
            real work.
          </p>
          <p>
            Datasets are often assembled deliberately rather than sampled.
            Populations change over time, so a model fitted last year meets a
            different world this year. Data collected through a particular
            channel over-represents whoever uses that channel. These are not
            exotic edge cases, and none of them is repaired by collecting more.
          </p>
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
            ["mean", "where is this column centred", "centring, filling gaps"],
            ["deviation", "how far is this value from centre", "residuals, features"],
            ["variance", "how widely does it spread", "scaling, PCA"],
            ["standard deviation", "spread in the original units", "standardisation"],
            ["covariance", "do two columns move together", "regression, PCA"],
            ["correlation", "how strong is that, without units", "exploration, diagnostics"],
            ["distribution", "which values occur, how often", "modelling noise"],
            ["sampling variability", "how might this estimate change", "generalisation"],
          ]}
        />
        <p>
          Two rows of the table are this primer&rsquo;s own numbers wearing
          other names. Standardising a column subtracts its mean and divides by
          its standard deviation, which for the five heights means 170 and
          7.07, and the result is exactly the unit-free column section 12
          multiplied by its partner. The slope of 0.8 is the covariance of 40
          over the variance of 50 from section 14, so a regression coefficient
          is a statement about how two columns move together, scaled by how
          much one of them moves alone.
        </p>
        <p>
          The last row is the second half of the primer in one line. A score
          measured on the rows a model was fitted to says how well it
          summarised its sample, and the question that matters is how it would
          have come out on different rows, which is why data is held back
          before fitting.
        </p>
        <InAModel>
          <p>
            The through line is that a model is a summary too. It compresses many
            observations into a few numbers, it is computed from a sample, and it
            discards whatever its form cannot represent.
          </p>
          <p>
            Which means the questions worth asking about a mean are the questions
            worth asking about a model. What did it leave out, and would it have
            come out differently with different data.
          </p>
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
            "Which of these does drawing more people from the population do?",
            [
              "Steadies the sample mean, with the typical gap to the truth shrinking with the square root of the count",
              "Fills in the shape of the population, since the people are piled into bins",
              "Pulls each person drawn closer to the true mean",
              "Repairs a sample whose drawing process favours some people over others",
            ],
            [0, 1],
            "The pulls above and below the truth cancel more completely as the count grows, so the typical gap goes from about 3.1 cm for five people to 1.1 cm for forty and 0.35 cm for four hundred, while each person drawn is as far from the mean as people ever are. More of a biased sample produces a more confident wrong answer rather than a right one, since the law needs observations that represent the population you mean to describe.",
          ),
          choice(
            "The box draws individual people and piles them into bins. Which result does that demonstrate?",
            [
              "The law of large numbers, with the empirical distribution converging alongside it",
              "The central limit theorem, since the piles come out bell shaped",
              "Both at once, since a sample mean and a distribution are each on show",
              "Neither, because the population it draws from is already normal",
            ],
            0,
            "What fills in as you press is the shape of the population itself, and what settles is the one sample mean. The central limit theorem is a claim about a different quantity, the distribution of many sample means across repeated samples, and showing it would mean drawing many separate samples and plotting the distribution of those means instead of the people.",
          ),
          several(
            "Which of these hold for the normal distribution as section 21 introduces it?",
            [
              "It is symmetric about its mean",
              "Two numbers fix it completely",
              "About two thirds of the population sits within one standard deviation of the mean, between 163 and 177 cm for the box’s population",
              "A column being numerical is a reason to expect it",
            ],
            [0, 1, 2],
            "The mean slides the bell left or right and the standard deviation makes it narrow and tall or wide and flat, and fixing both fixes the shares, about 68% within one standard deviation and about 95% within two. Being numerical is not a reason to assume the bell. Incomes, waiting times, city populations and word frequencies are all strongly skewed, and treating any of them as normal produces confident nonsense about their tails.",
          ),
          choice(
            "The slope of 0.8 was computed from five people. What follows from treating it as a statistic?",
            [
              "Five different people would have given a different number, and more relevant data would make such estimates steadier",
              "It is the population slope, since it was computed exactly",
              "It cannot be used for prediction until the population is known",
              "More data of any kind would bring it closer to the truth",
            ],
            0,
            "A fitted coefficient is a statistic like any other and the training data is the sample, so these estimates steady with more relevant data for the same reason sample means steady. More data from the wrong source instead makes the model more confident about the wrong thing. That is the closing section’s point that a model is a summary too, computed from a sample and discarding whatever its form cannot represent, so the questions worth asking of a mean are the questions worth asking of it.",
          ),
        ]}
      />

      <PrimerPractice
        id="practice-summarising-the-five-people-with-the-library"
        title="Practice. Calculating the Five People's Statistics With NumPy"
        exercises={[
          exercise(
            "Take one column apart around its mean",
            [
              "We have five heights and five weights. A mean gives us a centre, but it does not tell us how far each person sits from it. Work through the same steps as sections 3 to 7 using the two NumPy arrays below.",
              "For each column, add the values and divide by the count to find the mean. Subtract that mean from every value, square the deviations, and add those squares. Divide by the count for the population variance, then take its square root for the standard deviation. Here the five people are the whole group we are describing.",
              "Replace the missing calculations. The print statements are supplied so you can concentrate on where the numbers come from. Use array arithmetic, np.sum and np.sqrt here, rather than np.mean, np.var or np.std. Both deviation totals should be zero, even though the spreads are different.",
            ],
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
                "The variance is in squared units. np.sqrt returns to centimetres or kilograms, which lets the standard deviation be read alongside the original measurements.",
              ],
              check: numberCheck("What is the population variance of weight?", 35.2, 0.05, "Both columns balance around their means, so their signed deviations cancel. Their squared deviations do not cancel. That is why variance can distinguish spreads that the deviation total cannot."),
            },
          ),
          exercise(
            "Build a slope from paired deviations",
            [
              "The first challenge measured each column on its own. Now keep each person's height beside their weight. We want to know whether being above the mean in one column tends to go with being above the mean in the other.",
              "Centre both columns, multiply the paired deviations, and average those products to find the population covariance. Also calculate the population variance of height from its squared deviations. Use their ratio for the slope, as section 14 does, and choose the intercept so the line passes through the two means.",
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
                "Multiply the centred arrays element by element. A positive product means the person's two measurements sit on the same side of their respective means.",
                "Covariance averages the paired products. Height variance averages the squared height deviations. Use the same count for both.",
                "The slope comes from dividing covariance by height variance. To find the intercept, start with mean weight and subtract the contribution of mean height to the prediction.",
              ],
              check: numberCheck("What slope comes from the paired deviations?", 0.8, 0.00005, "The paired deviations supply the slope, and the two means position the line. The prediction at mean height returns mean weight, which checks that the intercept does the job we chose it for."),
            },
          ),
          exercise(
            "Remove the units and compare two measures of fit",
            [
              "Covariance changes when we change the units. To compare the relationship without centimetres or kilograms, express every deviation as a number of standard deviations. This is the standardisation from sections 11 and 12.",
              "Calculate the population standard deviation of each column from its squared deviations, then divide the deviations by that value. Multiply the two standardised columns person by person and average the products to get correlation. Do this with NumPy arithmetic rather than np.corrcoef or a scaler object.",
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
                "The first challenge already gave you the steps for standard deviation. Divide the centred values by it to express their distances without the original units.",
                "The products compare matching people, so ordinary array multiplication is what you need. Keep their full precision until printing.",
                "RSS compares the observed weights with the line's predictions. TSS compares them with mean weight. R squared is one minus the fraction of baseline squared error that remains.",
              ],
              check: numberCheck("What correlation comes from the standardised products?", 0.9535, 0.00005, "The two scores agree here because of how this line was fitted and where it was evaluated. That agreement is a property of this least-squares setup, not a rule for every model or for new data."),
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
