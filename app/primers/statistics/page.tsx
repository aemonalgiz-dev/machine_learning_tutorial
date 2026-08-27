import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
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
    "Mean, spread, covariance and correlation on five people, then what changes once those five are a sample of something larger.",
};

export default function StatisticsPrimerPage() {
  return (
    <PrimerPage
      title="Statistics and Probability Primer"
      tagline="Summarising one column, then two, then asking what any of it says about the people you did not measure."
      prerequisites={
        <>
          Arithmetic, and a willingness to add five numbers by hand. The same
          five people carry the whole primer, so every figure here can be
          checked against the one before it.
        </>
      }
    >
      <PrimerSection title="Where This Came From">
        <p>
          Statistics grew out of a practical problem, several careful people
          measuring the same thing and getting different answers. Astronomers in
          the 1700s could not simply pick the observation they liked, so they
          needed a principled way to combine disagreeing measurements into one
          number, and then a way to say how much that number could be trusted.
          Those two questions, what does this data say and how sure can we be,
          are the two halves of this primer.
        </p>
        <p>
          The first half describes data you have. The second asks what data you
          have says about data you do not, which is the question every model is
          really answering when it makes a prediction about someone it never
          saw.
        </p>
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
            sitting exactly on it.
          </p>
        </WorkedExample>
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
          So a second summary is needed, one that answers how far from the centre
          the values tend to sit. The deviations from section 4 are exactly the
          raw material for it.
        </p>
      </PrimerSection>

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
        <p>
          Now it is comparable to the heights themselves. The same arithmetic on
          the weights gives a variance of 176 divided by 5, which is 35.2, and a
          standard deviation of about 5.93 kg.
        </p>
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
          and the spread jumps while the centre barely stirs. Then move every
          point together by the same amount, and the centre travels while the
          spread does not change at all.
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
      </PrimerSection>

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
      </PrimerSection>

      <PrimerSection title="17. What Probability Describes">
        <p>
          Statistics looks at observations and reasons back to the process.
          Probability goes the other way, starting from a process and describing
          what it might produce, and the second half of this primer needs a
          little of it.
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
          not describe it.
        </p>
      </PrimerSection>

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
          It is the reason averages are worth computing at all, and the reason
          more data usually helps. It is also narrower than it first sounds, and
          the two qualifications are the ones from the last section. The
          observations have to represent the population you mean to describe, and
          collecting more of a biased sample does not undo the bias.
        </p>
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
    </PrimerPage>
  );
}
