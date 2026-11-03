import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  InAModel,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { LossCurvesPlayground } from "@/components/widgets/LossCurvesPlayground";
import { LossOnALine } from "@/components/widgets/LossOnALine";
import { MislabelledRow } from "@/components/widgets/MislabelledRow";
import { SoftmaxRow } from "@/components/widgets/SoftmaxRow";
import { ThreeLossesOneBadRow } from "@/components/widgets/ThreeLossesOneBadRow";

export const metadata: Metadata = {
  title: "Loss Functions · Perceptron Lab",
  description:
    "A loss function assigns a numerical cost to a prediction's error. Its definition determines which mistakes contribute most strongly to the adjustments made during training.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LossFunctionsPage() {
  return (
    <ConceptPage
      lessonId="loss-functions"
      intuition={lessonIntuitions["loss-functions"]}
      technicalStart="Part 2. Three Ways to Price a Miss in Kilograms"
      openingTitle="How Wrong Was That Prediction?"
      playgroundTitle="Compare how losses respond to the same mistake"
      playgroundIntro="Move a prediction away from its target and compare the loss curves. Read the loss value and its slope separately, especially for large errors."
      title="Loss Functions"
      tagline={"A loss function assigns a numerical cost to a prediction's error. Its definition determines which mistakes contribute most strongly to the adjustments made during training."}
      prerequisites={<>The <Link href="/concepts/simple-linear-regression" className={link}>linear regression page</Link> uses squared error, and the <Link href="/concepts/logistic-regression" className={link}>logistic regression page</Link> introduces log loss. The <Link href="/primers/calculus" className={link}>calculus primer</Link> explains the derivatives used here. The <Link href="/concepts/dense-layers" className={link}>dense-layer page</Link> shows how a network produces the raw outputs these losses receive.</>}

      playground={<LossCurvesPlayground />}
      sections={[
        {
          title: "Part 1. What a Loss Is For",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A guess, a truth, and a price">
                <p>

                  Let&apos;s reuse the four people from the PCA example. Their heights are 180, 160, 175 and 165 centimeters, and their weights are 78, 58, 63 and 73 kilograms. A line through their mean point with slope 0.6 predicts weights of 74, 62, 71 and 65 kilograms. Each prediction misses. We need to turn those errors into a number we can compare across candidate lines. A loss function tells us how to do that.
                </p>
                <NumberTable
                  headings={["person", "guessed", "measured", "miss, guess less truth"]}
                  rows={[
                    ["180 cm", "74", "78", "−4"],
                    ["160 cm", "62", "58", "4"],
                    ["175 cm", "71", "63", "8"],
                    ["165 cm", "65", "73", "−8"],
                  ]}
                  caption="Four height and weight pairs under the slope-0.6 line. Every batch number on this page is worked from these four misses."
                />
                <>
<p>{"An overestimate and an underestimate are both mistakes. Adding their signed errors would let equally large mistakes in opposite directions cancel, even though neither prediction was correct. The five losses here avoid that cancellation by assigning a nonnegative cost, with different rules for how the cost grows."}</p>
                <p>Squared error assigns the squared size of a miss. Absolute error uses its magnitude. Huber loss uses a quadratic cost near zero and a linear cost farther away. The probability losses answer a different question: how much probability did the model give the observed outcome? We will calculate these costs separately so their effects can be compared.</p>
</>
                <KeepInMind>
                  The same four prediction errors produce different mean costs: 20 under half-squared error, 6 under absolute error and 17.75 under Huber loss. Lowering one objective need not lower the others. Choosing a loss means deciding how errors should contribute to the fit.</KeepInMind>
              </SubSection>

              <SubSection title="2. One number for the whole batch">
                <p>
                  A network is scored on many people at once, and the loss has
                  to say what the whole batch costs. Every loss on this page
                  does the same two things with the individual prices, adds
                  them up and divides by the number of rows. The division is
                  what keeps a batch of forty comparable with a batch of four,
                  since without it the loss would double whenever the batch
                  did, and so would the slope the network steps against.
                </p>
                <Equation>{"loss  =  ( price of miss 1 + price of miss 2 + … + price of miss n ) / n"}</Equation>
                <WorkedExample title="The four, and the four twice over">
                  <>
                    <p>
                      A mean loss stays the same when the entire batch is duplicated.
                      Here are the original four costs and the duplicated total.
                    </p>
                    <Equation>{"original mean = (8 + 8 + 32 + 32) / 4 = 80/4 = 20\nduplicated mean = (2 × 80) / 8 = 20"}</Equation>
                    <p>
                      Each duplicate receives half the original per-row gradient, but
                      there are twice as many contributions. Their sum, and therefore
                      the parameter gradient, is unchanged. Absolute error and Huber
                      preserve their respective means in the same way.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  These implementations sum costs over every output and divide by the number of rows. They do not also divide by output width. Duplicating the same output error in a second column therefore doubles the value, while keeping the gradient normalization per entry unchanged. Other APIs average over all entries or return a sum, so check the reduction when comparing values or choosing a learning rate.</KeepInMind>
              </SubSection>

              <SubSection title="3. The value and the slope are different things">
                <>
<p>
                  The box at the top of the page has one slider, the raw output of a network&rsquo;s last layer for one person, and it draws two charts. The upper one is what each loss charges at every raw output, and the lower one is the slope of that charge, which is the thing a network actually uses, because the slope says which way to move the output and how hard.
                </p>
                <p>The loss value lets us compare predictions and track a training run. The derivative with respect to the outputs supplies the starting point for backpropagation. Gradient-based training needs that derivative; other optimization methods can use loss values without a supplied derivative.</p>
</>
                <>
<p>One call returns both the value and gradient for the same inputs. Classification losses can reuse their calculated probabilities for both. The table checks the reported gradient with a centered finite difference: it nudges the raw output slightly in each direction and compares the resulting costs. This approximates a derivative; it is not an exact derivative calculation.</p>
                <p>
                  At the halfway guess the largest disagreement between the slope reported alongside the value and the slope found by nudging is 2.3 parts in a trillion, and across the whole slider it never passes 2.1 parts in ten billion.
                </p>
</>
                <InAModel title="Where the check is allowed to disagree">
                  <p>
                    Drag the raw output to the target, one half. Absolute error
                    has a corner there, no slope exists, and the slope reported
                    is zero; the nudge, straddling the corner symmetrically,
                    also finds zero to within 3 parts in a trillion. Drag it to
                    1.5, which is exactly the Huber knee. The two pieces of the
                    Huber loss meet at a value of 0.5 and a slope of 1, and the
                    nudge, straddling a point where the curvature changes,
                    disagrees by 2.5 parts in a million, a thousand times more
                    than anywhere else on the chart and still agreement to
                    five decimals.
                  </p>
                </InAModel>
                <KeepInMind>
                  The gradient is the slope of the value, checked here by
                  measurement rather than taken from the formula. Two losses
                  can agree on the value at a raw output and disagree on the
                  slope, and it is the slope that decides where the next step
                  goes.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Three Ways to Price a Miss in Kilograms",
          content: (
            <>
              <SubSection title="4. Squared error, the bowl">
                <p>
                  Square the miss, halve it, and that is the price. The half is
                  bookkeeping and nothing more; it is there so the slope comes
                  out as the miss itself rather than twice the miss, and a
                  library that leaves it out reports values twice as large and
                  gradients twice as steep, which the learning rate then has to
                  absorb. Writing p for the guess and y for the truth, the
                  price and its slope are these.
                </p>
                <Equation>{"price  =  (p − y)² / 2\nslope  =  p − y"}</Equation>
                <WorkedExample title="The four under squared error">
                  <>
                    <p>
                      The prediction errors are minus four, four, eight and minus eight
                      kilograms. Half-squared error magnifies the larger errors.
                    </p>
                    <Equation>{"individual costs = ½ × (16, 16, 64, 64) = (8, 8, 32, 32)\nmean loss = (8 + 8 + 32 + 32) / 4 = 20\noutput gradients = (−4, 4, 8, −8) / 4 = (−1, 1, 2, −2)\nlarge-error share of cost = 64 / 80 = 0.8"}</Equation>
                    <p>
                      The two larger misses account for eighty percent of the loss.
                      Their gradients are also twice as large in magnitude as those of
                      the smaller misses.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  That growth is the whole character of squared error. On the
                  playground the bowl steepens without limit, so a raw output
                  of 3 against a target of one half costs 3.125 and pulls by
                  2.5, and a raw output of −5 costs 15.125 and pulls by −5.5.
                  Nothing caps it, and section 17 is what that does when one of
                  the misses is not a miss at all.
                </p>
                <KeepInMind>
                  Squared error gives larger misses disproportionately more influence. Under independent Gaussian errors with constant variance, minimizing it corresponds to maximum-likelihood fitting. That is one reason for using it. But unusually large errors can then dominate the fit, so we should inspect outliers and the measurement process before deciding it suits this dataset.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Absolute error, the vee">
                <p>Absolute error uses the magnitude of the prediction error. Away from zero, its derivative is plus one for an overestimate and minus one for an underestimate, regardless of the error’s size. At zero, the derivative is undefined; this implementation selects a zero subgradient.</p>
                <Equation>{"price  =  |p − y|\nslope  =  sign(p − y)"}</Equation>
                <WorkedExample title="The four under absolute error">
                  <>
                    <p>
                      Absolute error keeps each miss’s magnitude without squaring it.
                      Its derivative depends on the sign of the miss, not its size.
                    </p>
                    <Equation>{"mean absolute loss = (4 + 4 + 8 + 8) / 4 = 6\noutput gradients = (−1, 1, 1, −1) / 4\n                 = (−0.25, 0.25, 0.25, −0.25)"}</Equation>
                    <p>
                      The larger misses still contribute more to the loss. They no
                      longer produce larger output gradients.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The corner at zero is the price of that. Where the guess
                  equals the truth no slope exists, and the slope reported there
                  is zero, which on the playground is the one point where
                  the amber dot on the gradient chart is neither at 1 nor at
                  −1. It also means the slope never shrinks as the guess gets
                  close, so a walk under absolute error keeps stepping at full
                  size right up to the answer and then past it, which section
                  19 measures.
                </p>
                <KeepInMind>

                  Absolute error limits each nonzero prediction error’s output-gradient magnitude. For a constant prediction, its minimum is attained at a median of the targets; squared error instead selects their mean. In regression, the corresponding distinction is between modeling a conditional median and a conditional mean. Parameter gradients still depend on the input features, so equal output gradients do not imply equal influence on every weight.</KeepInMind>
              </SubSection>

              <SubSection title="6. Huber, the bowl with a knee">
                <p>Huber loss uses a threshold d measured in the target’s units. Within that threshold, it uses half-squared error. Beyond it, the cost grows linearly with slope magnitude d. The two branches meet with the same value and derivative, so the gradient shrinks near zero and stops growing once an error exceeds the threshold.</p>
                <Equation>{"|p − y| ≤ d      price  =  (p − y)² / 2          slope  =  p − y\n|p − y| > d      price  =  d · (|p − y| − d/2)    slope  =  d · sign(p − y)"}</Equation>
                <WorkedExample title="The four under Huber with a knee of 5 kilograms">
                  <>
                    <p>
                      With Huber threshold five, the four-kilogram misses use the
                      quadratic branch. The eight-kilogram misses use the linear branch.
                    </p>
                    <Equation>{"cost at magnitude 4 = ½ × 4² = 8\ncost at magnitude 8 = 5 × (8 − 5/2) = 27.5\nmean loss = (8 + 8 + 27.5 + 27.5) / 4 = 17.75\noutput gradients = (−4, 4, 5, −5) / 4\n                 = (−1, 1, 1.25, −1.25)"}</Equation>
                    <p>
                      Large misses can still produce larger gradients here, but the
                      threshold caps that growth.
                    </p>
                  </>
                </WorkedExample>
                <p>The subtraction of d/2 makes the two branches meet at the threshold. Their derivatives also agree there. Omitting that constant would make the cost discontinuous even though the piecewise gradient formula still looks usable. On the playground, d is one, and section 3 checks the junction.</p>
                <InAModel title="The knee is in kilograms">
                  <>
<p>The threshold uses the target’s units. A threshold of 1 kilogram is a different modeling choice from 1 on the playground’s targets near one half. With threshold 1 kilogram, all four errors are in the linear branch. The mean Huber cost is 5.5 and each output-gradient magnitude is one quarter. Those gradients match absolute error for this batch, although the reported costs differ by a constant.</p>
                  <p>
                    A knee has to be chosen against the size of the misses it will meet, and the Huber regression on its own page estimates a scale from the residuals and measures its knee in multiples of that; the network loss here takes a fixed number and leaves the choice to you.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Huber uses half-squared error for residuals within the threshold and a scaled linear cost for larger residuals. Its output gradient is capped at the threshold before averaging over rows. Choosing the threshold determines where that change occurs.</KeepInMind>
              </SubSection>

              <SubSection title="7. Where one person's miss goes">
                <p>
                  The three rules are easiest to compare on one batch at once.
                  The widget below draws a line of your choosing through the
                  people, scores every miss under all three losses, and shows
                  each person&rsquo;s own cost as a bar and their share of the
                  batch&rsquo;s pull in the table. Start with the four height and weight measurements
                  and the slope-0.6 line, then tilt the line and watch which
                  bars grow fastest.
                </p>
                <LossOnALine />
                <p>The two eight-kilogram errors account for 80 percent of the squared-error cost, 67 percent of the absolute-error cost and 77 percent of the Huber cost. Their shares of the summed output-gradient magnitudes are 67, 50 and 56 percent. Huber’s gradient grows with error size only up to its threshold; squared error’s gradient keeps growing.</p>
                <WorkedExample title="Where the six percentages come from">
                  <>
                    <p>
                      A share of the cost is one person&rsquo;s price over the
                      sum of the four prices. The prices are the ones sections 4
                      to 6 worked, (8, 8, 32, 32) under squared error, (4, 4, 8, 8)
                      under absolute error and (8, 8, 27.5, 27.5) under Huber with
                      a knee of 5 kilograms. Add the two eight-kilogram
                      people&rsquo;s prices and divide by the total.
                    </p>
                    <Equation>{"squared error    (32 + 32) / 80        = 0.80\nabsolute error   (8 + 8) / 24          ≈ 0.67\nHuber, knee 5    (27.5 + 27.5) / 71    ≈ 0.77"}</Equation>
                    <p>
                      A share of the pull is built the same way from the
                      gradients, with their signs dropped first. Two people
                      pulling the line in opposite directions are both still
                      pulling, so it is the sizes that are added. The gradients
                      are (−1, 1, 2, −2), (−0.25, 0.25, 0.25, −0.25) and
                      (−1, 1, 1.25, −1.25).
                    </p>
                    <Equation>{"squared error    (2 + 2) / (1 + 1 + 2 + 2)              ≈ 0.67\nabsolute error   (0.25 + 0.25) / (4 × 0.25)             = 0.50\nHuber, knee 5    (1.25 + 1.25) / (1 + 1 + 1.25 + 1.25)  ≈ 0.56"}</Equation>
                    <p>
                      Half the people hold half the pull under absolute error
                      because every gradient is the same size. Under squared
                      error the same two hold two thirds of it, and Huber&rsquo;s
                      knee sits between the two.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The cost measures each example’s contribution to the objective. The displayed gradient shares measure contributions with respect to predictions, before multiplying by input features in the parameter gradients. For these four errors, squared error concentrates both measures on the larger errors, while absolute error gives every nonzero error the same output-gradient magnitude.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Two Ways to Price a Wrong Probability",
          content: (
            <>
              <SubSection title="8. Turning Binary Scores Into Probabilities" id="8-a-score-is-not-a-probability-until-it-is-squashed">
                <p>For a binary target, the final layer can produce an unrestricted score: positive values favor one class and negative values favor the other. The sigmoid maps that score into a value between zero and one. Under a Bernoulli model, we interpret it as the probability of the positive class. Training and calibration determine how well those probabilities describe future outcomes.</p>
<p>The binary cross-entropy implementation here accepts raw scores and applies sigmoid internally. The multiclass implementation similarly accepts class scores and applies softmax. The output layer therefore uses identity with these losses.</p>
                <Equation>{"p  =  σ(z)  =  1 / (1 + e^(−z))"}</Equation>
                <p>A raw score of zero gives a sigmoid output of one half, assigning equal probability to the two classes under this model. This is the classification curve’s halfway prediction. A raw score of 3 gives 0.9526, while −3 gives 0.0474. These values describe the model’s assigned probabilities, rather than proving what it knows.</p>
                <KeepInMind>
                  The two classification losses read the raw output as a score
                  to squash, and the three regression losses read it as the
                  prediction itself. The playground&rsquo;s table says which is
                  which beside every row.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Binary cross-entropy, the price of a probability">
                <p>
                  Once the score is a probability of yes, the price is the
                  negative logarithm of the probability the model gave to
                  whichever answer was actually true. A model that gave the
                  truth a probability of one pays nothing, one that gave it a
                  half pays the logarithm of two, and one that gave it almost
                  nothing pays without limit. Writing y for the label, one for
                  yes and zero for no, the two cases fold into one line.
                </p>
                <Equation>{"price  =  −y · log(p) − (1 − y) · log(1 − p)\nslope at the raw output  =  p − y"}</Equation>
                <WorkedExample title="The halfway guess, then a confident one">
                  <>
                    <p>
                      For a positive label, a raw score of zero gives a probability of
                      one half. Binary cross-entropy and its derivative with respect to
                      that score are:
                    </p>
                    <Equation>{"probability = sigmoid(0) = 0.5\nloss = −ln(0.5) ≈ 0.6931\nscore gradient = 0.5 − 1 = −0.5"}</Equation>
                    <p>

                      A score of three raises the correct-label probability to about
                      0.9526 and reduces the loss to about 0.0486. Negative scores
                      favor the wrong class: at minus three the loss is about 3.0486,
                      and at minus five it is about 5.0067.
                    </p>
                  </>
                </WorkedExample>
                <p>For a positive label, increasing an already positive score reduces cross-entropy toward zero. Moving the score far in the wrong direction makes the exact loss grow approximately linearly with the score’s magnitude. The score-gradient magnitude approaches one instead of growing without bound. The signs reverse for a negative label.</p>
                <KeepInMind>
                  Cross-entropy prices a probability, and its slope at the raw
                  output is the probability minus the label. A confidently
                  wrong answer costs the raw output, roughly, and pulls by
                  nearly one; a confidently right one costs almost nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Clipped Loss Values and Score Gradients" id="10-the-value-has-a-ceiling-and-the-gradient-does-not">
                <p>At sufficiently large scores, floating-point sigmoid can round to exactly zero or one. Taking a logarithm of zero would then produce an infinite loss. This SDK clips the probability away from both endpoints before calculating the reported value. That caps the displayed per-row loss at 36.0437. A stable loss calculated directly from logits can avoid this particular clipping ceiling.</p>
                <p>
                  Machine epsilon is the gap between one and the next number
                  double precision can represent. A probability clipped to
                  sit at least that far from zero and from one always has a
                  finite logarithm, and the largest price the clip allows is
                  the logarithm of that gap with its sign changed.
                </p>
                <Equation>{"machine epsilon   ε ≈ 2.22 × 10⁻¹⁶\nceiling           −ln(ε) ≈ 36.0437"}</Equation>
                <InAModel title="Measured on one row">
                  <p>For a negative label, a score of 30 reports loss 30.0010 and a gradient that rounds to 1.0 at thirteen decimals. At score 40, the loss is capped at 36.0437 and the returned gradient is 1.0. The SDK calculates that gradient from the unclipped probability.</p>
<p>After clipping takes effect, this returned gradient follows the original cross-entropy objective, rather than the derivative of the capped value displayed by the SDK. A finite-difference check of the clipped value will therefore disagree in that region.</p>
                </InAModel>
                <KeepInMind>
                  The clipping ceiling is a numerical reporting limit of this implementation. A flat reported loss at that limit does not imply a zero gradient or convergence. Inspect the raw scores and returned gradients, and use a stable logits-based loss when a wider numerical range matters.</KeepInMind>
              </SubSection>

              <SubSection title="11. Softmax cross-entropy, one of many">
                <>
<p>
                  With three classes, child, teenager and adult, the last layer hands over three scores per person, and the squash has to read across the row rather than down a column. The softmax raises e to each score and divides by the sum, so the three come out positive and summing to one, and the price is again the negative logarithm of the probability on the true class.
                </p>
                <p>{"The gradient for a class compares its predicted probability with its target indicator. That indicator is one for the observed class and zero for the others. A class given too much probability gets a positive derivative, while the target class gets a negative one when its probability is below one. A descent update moves the scores against those derivatives."}</p>
</>
                <Equation>{"pₖ  =  e^(zₖ) / Σⱼ e^(zⱼ)\nprice  =  −log(p on the true class)\nslope at zₖ  =  pₖ − yₖ"}</Equation>
                <SoftmaxRow />
                <WorkedExample title="Scores of 1, 2 and 3 with adult true">
                  <p>With scores 1, 2 and 3 and adult as the true class, softmax returns probabilities 0.0900, 0.2447 and 0.6652. The loss is 0.4076. The three score gradients are 0.0900, 0.2447 and −0.3348: descent lowers the two incorrect scores and raises the adult score.</p>
<p>Those gradients sum to zero mathematically; the readout shows a tiny rounding residual of −1.1 parts in ten quadrillion. Changing the true class to child raises the loss to 2.4076 and gives its score an upward update with magnitude about 0.9100.</p>
                </WorkedExample>
                <p>
                  Tick the box that adds a hundred to every score and nothing
                  changes, the same probabilities, the same price, the same
                  pulls to the last digit. The softmax only ever reads the
                  differences between the scores, which is why the row maximum
                  is subtracted before e is raised to anything;
                  written literally, e to the hundred-and-three overflows
                  nothing but e to a thousand does.
                </p>
                <KeepInMind>
                  Softmax cross-entropy pushes the true class&rsquo;s score up
                  and every other class&rsquo;s score down by its own
                  probability, and the pulls on a row always sum to zero. Only
                  the gaps between scores matter, never their level.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The two-class softmax is the sigmoid">
                <>
<p>
                  On the playground the rose and sky curves lie on top of one another, which is why the sky one is dashed. That is an identity rather than a drawing choice. With two classes, and the second class&rsquo;s score held at zero, the softmax probability of the first class is e to the score over e to the score plus one, which is the sigmoid of the score.
                </p>
                <p>
                  The page&rsquo;s softmax reading is built exactly that way, the raw output in the first column and a zero in the second, and the two losses agree on the value, the gradient and the probability at every raw output on the slider.
                </p>
</>
                <Equation>{"e^z / (e^z + e^0)  =  1 / (1 + e^(−z))  =  σ(z)"}</Equation>
                <InAModel title="Different Clipping Floors in the Two Implementations">
                  <p>The two implementations use different clipping floors for their reported values. Binary cross-entropy caps at 36.0437. Softmax cross-entropy floors probabilities at the smallest positive normal float64 value; smaller subnormal values also exist.</p>
<p>For scores 40 and 0 with the second class true, softmax cross-entropy reports 40.0 while the binary version reports 36.0437. Their corresponding score gradients still agree here. Training uses those gradients for updates, but reported loss values can also affect monitoring, early stopping or model selection, so the discrepancy should be understood.</p>
                </InAModel>
                <KeepInMind>
                  A yes-or-no question can be asked with one sigmoid output or
                  with two softmax outputs, and the answers, prices and pulls
                  are the same until the value is clipped.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Every loss on the page adds the individual prices and divides by the number of rows. What does the division buy?",
              [
                "It makes duplicating a batch leave the mean loss and mean gradient unchanged",
                "It keeps the loss between zero and one, so runs on different data can be compared",
                "It removes the sign from each miss, which is what makes the prices add up",
                "It makes the loss independent of how many quantities the network answers per person"
              ],
              0,
              "Duplicating every row doubles the total loss and its total parameter gradient, while also doubling the row count. Their means therefore stay the same. Changing which observations are in a batch can still change both means. Dividing by rows also does not divide out the number of outputs per row.",
              {
                "description": "Keep each row’s loss definition fixed. Sum its loss contributions and divide by the number of rows. When testing batch-size effects here, duplicate the same rows rather than replace them with different observations."
              },
            ),
            trueFalse(
              "A library that leaves the half out of squared error reports values twice as large and gradients twice as steep.",
              true,
              "The half is bookkeeping, there so the slope comes out as the miss itself rather than twice the miss. Leaving it out changes both the number reported and the step taken from it, and the learning rate then has to absorb the factor of two. That is one of the conventions a loss curve does not show.",
            ),
            several(
              "The slope-0.6 line misses the four height and weight measurements by four, four, eight and eight kilograms. Which of these hold of the pulls?",
              [
                              "Under squared error the eight-kilogram misses pull twice as hard as the four-kilogram ones",
                              "Under absolute error all four pull by a quarter, whatever their miss",
                              "Under Huber with a knee of 5 kilograms the eight-kilogram misses pull by 1.25, which is the knee over the row count",
                              "With the knee set to 1 kilogram none of the four is inside it, and every pull is a quarter",
                            ],
              [0, 1, 2, 3],
              "Squared-error gradients grow with residual size. Absolute-error gradients have the same magnitude for every nonzero residual, with direction determined by its sign. Huber at threshold 5 keeps the smaller residual gradients and caps the larger ones. At threshold 1, all these residuals lie in its linear region. Its gradient then matches absolute error here, but its reported value differs by the constant offset in the Huber formula.",
              {
                "description": "There are four rows. Residual r means prediction minus observation. Use the following per-row losses and average over rows:\nsquared: r² / 2\nabsolute: |r|\nHuber with knee δ: r²/2 when |r| ≤ δ, otherwise δ(|r| − δ/2)\nHere “pull” means the magnitude of the derivative with respect to that row’s prediction."
              },
            ),
            trueFalse(
              "Once binary cross-entropy’s value has hit its ceiling of 36.0437, a confidently wrong row has stopped being pushed.",
              false,
              "In this SDK, the probability used to report the loss is clipped, while the gradient is calculated separately from the sigmoid probability and target. A very wrong prediction can therefore report the capped loss and still have a nonzero gradient. The gradient is not the derivative of a flat clipped-loss segment. At score 40 with target zero, its computed value rounds to one.",
            ),
            several(
              "Which of these hold of softmax cross-entropy as the page measures it?",
              [
                "Adding a common constant to all scores leaves the mathematical probabilities, loss and gradients unchanged",
                "The pulls on one row sum to zero",
                "With two classes and the second score held at zero, its formula agrees with sigmoid cross-entropy away from clipping",
                "It caps its price at the same 36.0437 as binary cross-entropy"
              ],
              [0, 1, 2],
              "Softmax depends on score differences, so a shared additive constant has no effect in exact arithmetic. Floating-point calculations can introduce small rounding differences. Its gradient row sums to zero. With one of two scores fixed at zero, the ordinary unclipped formula agrees with sigmoid cross-entropy; at extreme scores the SDK’s different clipping rules can make the reported losses differ.",
              {
                "description": "Use finite scores and an exclusive-class target. The lesson’s softmax loss subtracts the row maximum before exponentiation and floors logged probabilities at the smallest positive float. Its separate binary loss clips probabilities at ε and 1 − ε, giving a maximum loss about 36.0437."
              },
            ),
        ],
        },
        {
          title: "Part 4. The Slope Every Network Starts From",
          content: (
            <>
              <SubSection title="13. Three losses, one subtraction">
                <p>
                  Now look at the gradient chart with the slider at the halfway
                  guess. Four of the five dots are at exactly the same value,
                  −0.5. One of the four is Huber, which sits there only because
                  a miss of one half is inside its knee of 1, where it is
                  squared error under another name. The other three are the
                  fact the page exists to teach. Squared
                  error with a plain output, binary cross-entropy with a
                  sigmoid, and softmax cross-entropy with a softmax all have the
                  same slope at the raw output, the prediction minus the truth
                  over the row count, and it is the simplest expression on the
                  page.
                </p>
                <Equation>{"d loss / d raw output  =  (prediction − truth) / n"}</Equation>
                <>
<p>
                  For squared error the prediction is the raw output itself, zero against a target of one half. For the other two it is the probability the squash produced, one half against a label of one. Both misses are minus one half, and the halfway guess was built so that they would be. Drag the slider to 3 and the dots part, 2.5 against −0.0474, because the prediction now means different things, a number that is two and a half too high and a probability that is nearly right.
                </p>
                <p>
                  What the three share is the form, and the numbers agree only at a raw output where a miss in weight and a miss in probability happen to be the same size.
                </p>
</>
                <KeepInMind>
                  For the three pairings compared here, the score gradient has the form prediction minus target, divided by the row count. The meaning of prediction differs: a numerical output for half-squared error, or an assigned class probability for cross-entropy. Other losses need different gradients.</KeepInMind>
              </SubSection>

              <SubSection title="14. Why the squash belongs to the loss">
                <p>

                  Tick the playground&rsquo;s last box and a gray dashed curve
                  appears, a sigmoid output scored by squared error, which is
                  the pairing a reader might reach for first, since it is a
                  probability compared to a label by the loss that has been on
                  every page. It is computed here through a one-neuron
                  layer that applies the sigmoid, so the number is measured
                  rather than argued. At the halfway guess it costs 0.125 and
                  pulls by −0.125, a quarter of what cross-entropy pulls.
                </p>
                <InAModel title="A Small Gradient for a Confidently Wrong Prediction">
                  <p>With score −5 and a positive label, sigmoid outputs 0.0067. Cross-entropy’s score gradient is −0.9933. Half-squared error on that sigmoid output instead gives −0.0066, about a hundred and fifty times smaller.</p>
<p>The squared-error derivative includes sigmoid’s own derivative as a factor. Near this saturated output, that factor is small even though the probability is far from the target. Gradient descent can therefore make slow progress on this kind of confidently wrong prediction.</p>
                </InAModel>
                <>
                  <p>
                    The binary and multiclass cross-entropy implementations used on this
                    site expect raw scores, also called logits. They apply sigmoid or
                    softmax internally, so the preceding output layer uses identity.
                  </p>
                  <p>
                    Other APIs accept probabilities instead. A probability-based loss
                    must receive the appropriate normalized probabilities. Check the
                    loss interface: adding sigmoid before a loss that already expects
                    logits applies it twice and changes the model being optimized.
                  </p>
                </>
                <KeepInMind>
                  <p>
                    Match the output layer to the loss interface. The cross-entropy
                    losses in this SDK take logits, so pass raw scores. A loss
                    documented to take probabilities has a different contract. Squared
                    error with a sigmoid output is another valid objective, but its
                    gradient can become very small for confidently wrong predictions.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The canonical link">
                <p>A link function in a generalized linear model maps the predicted mean back to its linear score. For a binary target, the log-odds transformation is the canonical link, and sigmoid is its inverse. This choice makes the negative log-likelihood gradient simplify to probability minus label. Nelder and Wedderburn’s generalized linear model framework puts this relationship alongside related regression models.</p>
<p>We can see the simplification directly: differentiate binary cross-entropy with respect to p, then multiply by the derivative of p with respect to the score z.</p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="what happened"
                  rows={[
                    { expression: "d price / dp  =  −y/p + (1 − y)/(1 − p)", reason: "differentiate the two logarithms with respect to the probability" },
                    { expression: "              =  (p − y) / (p (1 − p))", reason: "put the two fractions over one denominator" },
                    { expression: "dp / dz  =  p (1 − p)", reason: "the sigmoid's own slope, the logistic page's result" },
                    { expression: "d price / dz  =  (p − y) / (p (1 − p)) · p (1 − p)  =  p − y", reason: "the chain rule; the denominator the price produced is the factor the squash produced, and they cancel" },
                  ]}
                />
                <WhyThisWorks title="The softmax case, and the regression case">
                  <>
<p>
                    The softmax&rsquo;s own slope is a whole matrix, every output depending on every score, and it is exactly the term that cancels, leaving the probability minus the one-hot truth on every class at once, which is the row of pulls in section 11. Squared error needs no cancellation at all, since it has no squash and its price is already a quadratic in the raw output.
                  </p>
                  <p>Half-squared error corresponds, up to constants and a fixed scale, to negative log-likelihood under Gaussian errors. Binary cross-entropy is the negative log-likelihood of a Bernoulli outcome, and multiclass cross-entropy uses a categorical outcome. These assumptions help explain the objectives and their derivative forms. They do not make any one pairing appropriate for every dataset.</p>
</>
                </WhyThisWorks>
                <p>
                  Absolute error and Huber are on the page to break the
                  pattern on purpose. Their slopes are a sign and a capped miss,
                  neither of them prediction minus truth, and that difference
                  is the whole reason to use them, which Part 5 measures.
                </p>
                <KeepInMind>
                  The likelihood-based pairings discussed here simplify to a prediction-minus-target score gradient under the stated scaling. Absolute error and Huber change the response to large residuals. Their output gradients are bounded, although large input features can still produce large parameter gradients.</KeepInMind>
              </SubSection>

              <SubSection title="16. Which loss goes with which last layer">
                <p>
                  The pairing follows from the question, so it can be written
                  as a table, with the last layer straight in every row and the
                  activation function, where there is one, inside the loss.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="the loss, and what the loss applies first"
                  rows={[
                    { expression: "how much does this person weigh", reason: "half-squared error on the numerical output, or absolute error or Huber when limiting large-residual influence suits the objective." },
                    { expression: "is this person an adult", reason: "binary cross-entropy, which applies the sigmoid; one output, a label of zero or one." },
                    { expression: "child, teenager or adult", reason: "softmax cross-entropy, which applies the softmax across the row; one output per class, a one-hot truth." },
                    { expression: "a sigmoid probability scored with squared error", reason: "a valid probability objective whose score gradient can become very small for saturated, confidently wrong predictions." },
                  ]}
                />
                <KeepInMind>
                  The last layer answers with raw scores and the loss decides
                  what they mean, so the loss is chosen by the question being
                  asked and the squash comes with it rather than being added to
                  the layer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What a Loss Does to an Outlier",
          content: (
            <>
              <SubSection title="17. One mistyped weight">
                <p>Start with the fifteen height and weight pairs from the line page, which lie close to a line with fitted slope 0.7968 and intercept −67.44. The ninth profile is 176 centimeters and 72.5 kilograms. Reversing its first two weight digits gives an incorrect record of 27.5 kilograms.</p>
<p>For this fixed-line comparison, keep the fifteen clean rows and add that corrupted copy as a sixteenth row. The added record has an error of 45.29 kilograms, while each clean row is within about a kilogram. Section 18 uses a different experiment: it replaces the original record before fitting each loss.</p>
                <NumberTable
                  headings={["loss", "value over 16 rows", "the mistyped row's share of the cost", "its share of the pull"]}
                  rows={[
                    ["squared error", "64.18", "0.9987", "0.892"],
                    ["absolute error", "3.17", "0.892", "0.0625, which is one sixteenth"],
                    ["Huber, knee 5 kg", "13.46", "0.994", "0.478"],
                  ]}
                  caption="The ideal fifteen and the mistyped person, scored under the clean least squares line, with a knee of five kilograms."
                />
                <>
                  <p>
                    Under squared error, the corrupted row accounts for 99.87 percent of
                    the loss and 89 percent of the summed gradient magnitudes. Under
                    absolute error, it receives the same output-gradient magnitude as
                    every other row. Huber caps it at the threshold divided by the batch
                    size.
                  </p>
                  <Equation>{"absolute-error gradient magnitude = 1/16 = 0.0625\nHuber maximum gradient magnitude = 5/16 = 0.3125"}</Equation>
                  <p>
                    These are gradients with respect to individual predictions.
                    Parameter gradients also include the inputs through which those
                    predictions were made.
                  </p>
                </>
                <KeepInMind>
                  None of the three rules can tell a mistyped weight from a
                  real one, since all any of them sees is a miss of 45. What
                  the rule fixes is how much say that miss gets, and on the
                  same row the three give it 89, 6 and 48 percent of the pull.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Three losses, three lines">
                <p>
                  Now let each loss fit its own line. The widget walks one
                  linear neuron down each loss for four hundred steps from a
                  flat line at the mean weight, on the same people, and draws
                  the three lines it arrives at. Tick the switch to swap in the
                  mistyped weight and watch which lines move.
                </p>
                <ThreeLossesOneBadRow />
                <p>On the clean fifteen examples, all three fitted lines nearly coincide. Half-squared error agrees with the closed-form least-squares line to within 1.1 parts in ten trillion. Huber reaches the same line because every residual is inside its threshold. Absolute error reaches a nearby slope, 0.7993 rather than 0.7968, under this fixed-step procedure. Each predicts about 72.79 kilograms at 176 centimeters.</p>
                <>
<p>

                  With the weight mistyped, the squared-error line drops to a slope of 0.7464 and an intercept of −61.55 and now guesses 69.82 kilograms at 176 centimeters, three kilograms lower than before, for a person who has not changed. The Huber line moves to 0.7908 and −66.75, guessing 72.44, a third of a kilogram lower. The absolute error line moves to 0.7983 and −67.72, guessing 72.78, one hundredth of a kilogram lower.
                </p>
                <p>
                  The mistyped row is missed by 42.3, 44.9 and 45.3 kilograms by the three lines in turn, so the two robust rules leave it almost exactly as wrong as it was and squared error closes three kilograms of the gap at everyone else&rsquo;s expense.
                </p>
</>
                <KeepInMind>

                  The mistyped record shifts the squared-error prediction near 176 centimeters by about three kilograms, compared with about one hundredth under absolute error. A loss cannot identify whether the unusual value is a data-entry error or a valid measurement. That requires checking the record and deciding what quantity the model is meant to estimate.</KeepInMind>
              </SubSection>

              <SubSection title="19. Robust is a statement about the pull">
                <p>Here robust means less sensitive to unusually large residuals. Absolute error limits each nonzero output-gradient magnitude to one divided by the row count. Huber limits it to the threshold divided by that count. Half-squared error has no corresponding residual-gradient cap.</p>
<p>The costs themselves can still grow without bound. Also, an input with a very large feature value can magnify a parameter gradient, so these losses do not provide protection from every influential observation.</p>
                <>
<p>
                  The same cap has a price at the other end of the walk. The readouts show the largest slope left in the neuron after the last step, and for squared error and Huber it is 8 parts in a quadrillion, which is a walk that has stopped. For absolute error it is 0.0926 on the clean fifteen and 0.125 with the outlier, because a sign never shrinks as the guess gets close, so the walk keeps stepping by the full learning rate and settles into a twitch about the answer rather than onto it.
                </p>
                <p>
                  The clean absolute-error loss is 0.3609 after four hundred steps and still moving in the third decimal.
                </p>
</>
                <KeepInMind>
                  With a fixed learning rate, absolute error can keep stepping across an optimum because its nonzero derivative does not shrink with the residual. Huber retains a shrinking derivative inside its quadratic region. The shown runs illustrate that difference; decreasing step sizes or other optimization methods can also improve absolute-error convergence.</KeepInMind>
              </SubSection>

              <SubSection title="20. A mislabeled adult" id="20-a-mislabelled-adult">
                <>
                  <p>

                    Cross-entropy can also be sensitive to incorrect labels. Take
                    sixteen people: eight children below 152 centimeters and eight
                    adults above it. A fixed rule assigns a score from height, then a
                    sigmoid probability.
                  </p>
                  <Equation>{"score = (height − 152) / 5\nP(adult) = sigmoid(score)"}</Equation>
                  <p>

                    The rule classifies all sixteen correctly and has mean loss about
                    0.0854. The two people nearest the boundary, at 148 and 156
                    centimeters, each cost about 0.3711. Now change the 178-centimeter
                    adult’s label to child.
                  </p>
                </>
                <MislabelledRow />
                <>
                  <p>
                    The model still assigns that person about 0.9945 probability of
                    adulthood, but the changed label now penalizes that confidence.
                    Calculate the loss using the full score rather than rounded
                    probabilities.
                  </p>
                  <Equation>{"score = (178 − 152) / 5 = 5.2\nincorrect-label loss = −ln(1 − sigmoid(5.2)) ≈ 5.2055\nscore gradient contribution = sigmoid(5.2) / 16 ≈ 0.0622\naccuracy = 15 / 16 = 0.9375"}</Equation>
                  <p>
                    The mean loss rises to about 0.4104, with this row contributing
                    seventy-nine percent of the total. Accuracy records one wrong label;
                    cross-entropy additionally measures how confidently the model
                    disagrees with it.
                  </p>
                </>
                <KeepInMind>

                  Exact cross-entropy grows without bound as the assigned probability of the observed label approaches zero. Its score gradient is bounded; in a batch, each contribution is also divided by the number of rows. This SDK additionally caps the reported binary loss through clipping. Incorrect labels can therefore create a strong training signal without the loss identifying them as incorrect.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Each Loss Fails",
          content: (
            <>
              <SubSection title="21. The loss is not the score">
                <>
<p>
                  A classifier is judged by how many people it called correctly, and it is trained by the loss, and the two can disagree. Change the scale of the rule in the widget above from 5 to 2.5 and then to 10. The accuracy is 1.0 at all three, since the probabilities cross one half at the same height whatever the scale, and the loss is 0.0290, 0.0854 and 0.1910, a factor of six apart.
                </p>
                <p>
                  The loss rewards confidence on people already called correctly, which accuracy cannot see, and the training page&rsquo;s run has stretches where the loss falls for fifty epochs while the accuracy does not move at all.
                </p>
</>
                <KeepInMind>
                  Thresholded accuracy is constant over regions of parameter space and changes abruptly when a prediction crosses the decision boundary. Its derivative is therefore not useful for ordinary gradient descent. A differentiable surrogate loss supplies a training signal. Report accuracy alongside that loss, since they measure different properties of the predictions.</KeepInMind>
              </SubSection>

              <SubSection title="22. Where each of the five fails">
                <p>
                  Every loss on this page fails somewhere, and the failures are
                  measured above rather than listed from memory.
                </p>
                <DerivationTable
                  expressionHeading="the loss"
                  reasonHeading="where it fails"
                  rows={[
                    { expression: "squared error", reason: "the mistyped row took 89 percent of the summed output-gradient magnitude and shifted the prediction by three kilograms. Half-squared error strongly weights large residuals and corresponds to Gaussian-error likelihood under a fixed variance." },
                    { expression: "absolute error", reason: "the derivative is undefined at zero, and fixed-size gradient steps can oscillate around an optimum. A constant absolute-error fit targets a median, which can differ from the mean." },
                    { expression: "Huber", reason: "the threshold uses target units. At 1 kilogram these four errors all use the linear branch, matching absolute-error gradients but not values; at 50 they all use half-squared error." },
                    { expression: "binary cross-entropy", reason: "a mislabeled row can receive a high loss and a near-maximal score gradient. This SDK caps the reported binary value at 36.04 but returns the unclipped-objective gradient. It expects logits; adding sigmoid first changes the objective." },
                    { expression: "softmax cross-entropy", reason: "needs the class width stated to build the one-hot truth, and a class index beyond that width or below zero has no meaning; with one class the price is always zero and nothing is learned." },
                  ]}
                />
                <KeepInMind>
                  Our examples produced different consequences: a mistyped weight moved the squared-error fit by three kilograms, constant-sized absolute-error steps kept crossing a clean optimum, and cross-entropy assigned 5.2 to one confidently wrong label. These follow from the objectives and update choices. Before selecting a loss, we should consider what errors the data contains and how much influence each error should have.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Matching the Loss Inputs, Reduction and Gradient" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="23. What a loss must specify">
                <p>Before comparing two loss values, check their reduction. Dividing by the number of rows, dividing by every output entry and leaving a total unchanged produce different scales. Squared error may also include a factor of one half.</p>
                <p>The derivative needs equally clear conventions. Specify the units and boundary treatment at the Huber knee, and the branch chosen by absolute error at a tie. For classification, check whether the loss applies its own sigmoid or softmax, which clipping floor protects the logarithm, and whether the target is a binary column or a one-hot block.</p>
                <p>One call returns the reported value and the gradient used for updates. Both use the same input batch. Their numerical conventions still need to be documented: beyond its clipping limit, this SDK’s cross-entropy gradient follows the original objective rather than differentiating the capped reported value.</p>
                <KeepInMind>
                  A different reduction or constant loss factor changes gradient scale and may require adjusting the learning rate. Other changes, such as a different clipping rule or Huber threshold, can change the objective itself. They cannot always be compensated for by one scalar factor.</KeepInMind>
              </SubSection>

              <SubSection title="24. Ties, zero probabilities and invalid targets" id="24-the-edges-probed">
                <p>The table reports the current SDK behavior and distinguishes it from the playground’s request validation. Some invalid cases are rejected before the loss is called. Direct SDK calls still need the checks identified below.</p>
                <DerivationTable
                  expressionHeading="Predictions, targets or batch"
                  reasonHeading="Whether the loss and derivative are defined"
                  rows={[
                    { expression: "an empty batch", reason: "the documented contract promises a refusal, and the arithmetic divides by zero rows and answers not-a-number with a warning; recorded rather than repaired, and the request refuses it at the door before the batch is ever measured." },
                    { expression: "one row", reason: "accepted; the division is by one and the batch value is the row's own price, 32 for a miss of eight under squared error." },
                    { expression: "outputs and truths of different shapes", reason: "refused by name, since the two blocks describe the same rows." },
                    { expression: "a not-a-number in the outputs", reason: "passes through; the value and the gradient are not-a-number and nothing is raised. The layers check finiteness on the way in; the losses do not." },
                    { expression: "an infinite output", reason: "squared error answers infinity; cross-entropy saturates to its 36.04 ceiling with a gradient of exactly one, since the stable sigmoid handles the overflow." },
                    { expression: "a Huber knee of zero, negative, or not finite", reason: "refused at construction; this implementation requires a positive finite threshold. Substituting zero into its formula would give zero costs and gradients, rather than absolute error." },
                    { expression: "absolute error at an exact tie", reason: "accepted, gradient zero; no slope exists and the branch taken is the one that pulls nowhere." },
                    { expression: "Huber exactly at the knee", reason: "both pieces answer a price of 0.5 at a knee of one and a slope of one, to the last bit on one side and to one part in a trillion on the other." },
                    { expression: "a label of one half", reason: "accepted, and read as a soft label; at the halfway guess it costs the logarithm of two and pulls nowhere. The request refuses anything but zero and one." },
                    { expression: "a label of two", reason: "accepted by the raw arithmetic despite being outside the binary-label range, producing a gradient of minus 1.5 at the halfway guess; the playground request rejects it." },
                    { expression: "a class index beyond the row", reason: "the one-hot builder raises an IndexError; the playground request rejects the index first and identifies the class width." },
                    { expression: "a negative class index", reason: "wraps silently to the last column, since that is what a negative index does to a numpy block; the request refuses it." },
                    { expression: "a softmax row of one class", reason: "accepted; the probability is always one, the price always zero, and nothing is learned." },
                    { expression: "every height the same, in the descent", reason: "refused by the line fit before the standardizing could divide by a spread of zero, because a column carrying no variation has nothing to divide by." },
                    { expression: "unfitted use, or mismatched feature names", reason: "not applicable; a loss holds no fitted state and reads no names, only two blocks of the same shape." },
                  ]}
                />
                <p>The empty-batch case separates the documented interface from the present implementation. The loss documentation promises a rejection, but the current arithmetic divides by zero rows and can return NaN with a warning. The playground rejects an empty batch before calling it. A caller using the SDK directly must validate that at least one row is present.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 7",
          quiz: [
            choice(
              "With the slider at the halfway guess, squared error, binary cross-entropy and softmax cross-entropy all report a slope of −0.5. What do the three share?",
              [
                "Each hands back the prediction minus the truth over the row count, where the prediction is the raw output for squared error and the squashed probability for the other two",
                "They report the same slope at every raw output, since they are one loss written three ways",
                "Each applies the sigmoid to the raw output before comparing it with the truth",
                "Each caps its pull at one half, however large the miss",
              ],
              0,
              "These three examples all happen to have prediction-minus-target equal to −0.5 at the selected point. For half-squared error, that difference is already the output gradient. With sigmoid or softmax cross-entropy, differentiating the activation and loss together also gives a probability-minus-target gradient. The matching number here does not mean the losses remain identical at other scores.",
            ),
            choice(
              "A sigmoid output scored by squared error is the pairing a reader reaches for first. At a raw output of minus five with the label yes, cross-entropy pulls by 0.9933 and this pairing by 0.0066. Why?",
              [
                "Its slope carries the sigmoid’s own slope as a factor, which is nearly zero exactly where the model is most wrong",
                "Squared error divides by the row count twice in this arrangement",
                "The sigmoid saturates, so the squared-error value is clipped and the gradient with it",
                "Squared error reads the raw output as the prediction, so it never sees the probability at all",
              ],
              0,
              "With squared error on a sigmoid output, the backward calculation also multiplies by the sigmoid derivative. At a score of minus five that derivative is small, so the score receives only a small gradient despite a large prediction error. Sigmoid cross-entropy combines differently and retains a much larger score gradient for this confidently wrong prediction.",
            ),
            several(
              "Which conclusions agree with these outlier and label-noise measurements?",
              [
                              "With one weight mistyped as 27.5, the squared-error guess at 176 centimeters fell by about three kilograms",
                              "After four hundred steps absolute error was still stepping, where squared error and Huber had stopped",
                              "Relabeling the 178-centimeter adult as a child made that one row 79 percent of the batch’s loss",
                              "Under the two robust losses the mistyped row stopped being most of the cost",
                            ],
              [0, 1, 2],
              "On this supplied sample, the mistyped weight moves the squared-error line more than the robust-loss lines. Huber limits a large residual’s gradient; absolute error uses its sign. Those choices limit influence rather than remove the corrupted record. The relabeled classification example shows a different issue: confidence can raise cross-entropy substantially while accuracy still counts only one wrong label. Check remaining gradients separately before concluding that each training run has settled.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Prediction at height 176 cm:\nclean squared-error fit: 72.79 kg\nfit after one weight is mistyped as 27.5 kg: 69.82 kg\n\nAfter 400 optimisation steps:\nabsolute-error slope magnitude: 0.125\nsquared/Huber slope magnitude: about 8e-15\n\nRelabelled 178-cm adult as child:\nthat row’s loss: 5.2055; 79% of the batch loss\n\nloss | value over 16 rows | the mistyped row's share of the cost | its share of the pull\nsquared error | 64.18 | 0.9987 | 0.892\nabsolute error | 3.17 | 0.892 | 0.0625, which is one sixteenth\nHuber, knee 5 kg | 13.46 | 0.994 | 0.478"
              },
            ),
            trueFalse(
              "On the sixteen people the height rule called everyone correctly at scales of 2.5, 5 and 10, while its loss ran from 0.0290 to 0.1910.",
              true,
              "All three score scales put the probability threshold at the same height, so their predicted labels and accuracy agree. Their confidence differs, which changes cross-entropy even when every predicted label is correct. A differentiable loss gives training a gradient; accuracy changes only when a prediction crosses a decision threshold. Report both because they answer different questions.",
            ),
            trueFalse(
              "On the empty batch, the documented contract and the arithmetic behind it agree.",
              false,
              "The documented contract requires an empty batch to be rejected. Evaluating a mean over zero rows instead can produce a NumPy warning and a not-a-number value. That arithmetic outcome is not the specified validation error. The example checks whether the implementation enforces its contract before calculation.",
            ),
        ],
        },
        {
          title: "Practice. Pricing Misses With the Library",
          practice: [
            exercise(
              "Price the four height and weight measurements three ways",
              ["The predictions and measured weights are supplied as aligned blocks. Measure them with SquaredError, AbsoluteError and HuberError at threshold 5, printing each loss value and its gradient with respect to the predictions.","Then repeat HuberError with thresholds 1, 6 and 50. The threshold is in kilograms, like each residual. Compare how widening it changes which of these particular errors lie in the quadratic region. Keep the output order and precision shown by the required results."],
              `import numpy as np
from oop_ml import AbsoluteError, HuberError, SquaredError

heights = np.array([180.0, 160.0, 175.0, 165.0])
measured = np.array([[78.0], [58.0], [63.0], [73.0]])
guessed = (0.6 * heights - 34.0).reshape(-1, 1)

# Measure the guesses against the measured weights under SquaredError,
# AbsoluteError and HuberError(threshold=5.0). Print each value to four
# places and each loss's four gradients.

# Measure under HuberError at thresholds of 1, 6 and 50 and print each value
# to four places.`,
              `import numpy as np
from oop_ml import AbsoluteError, HuberError, SquaredError

heights = np.array([180.0, 160.0, 175.0, 165.0])
measured = np.array([[78.0], [58.0], [63.0], [73.0]])
guessed = (0.6 * heights - 34.0).reshape(-1, 1)

for name, loss in [("squared error", SquaredError()), ("absolute error", AbsoluteError()), ("Huber, knee 5", HuberError(threshold=5.0))]:
    scored = loss.measure(guessed, measured)
    print(f"{name:14} value {scored.value:.4f}, gradients {scored.gradient.ravel().tolist()}")

for knee in (1.0, 6.0, 50.0):
    scored = HuberError(threshold=knee).measure(guessed, measured)
    print(f"Huber, knee {knee:g} value {scored.value:.4f}")`,
              `squared error  value 20.0000, gradients [-1.0, 1.0, 2.0, -2.0]
absolute error value 6.0000, gradients [-0.25, 0.25, 0.25, -0.25]
Huber, knee 5  value 17.7500, gradients [-1.0, 1.0, 1.25, -1.25]
Huber, knee 1 value 5.5000
Huber, knee 6 value 19.0000
Huber, knee 50 value 20.0000`,
              { hints: ["A loss is built with no arguments, apart from HuberError, which takes its threshold. Its measure takes the outputs and the truths as two blocks of the same shape, one row per person and one column here.", "measure answers one object carrying both the value and the gradient, which is section 3’s rule that a caller cannot get one without the other. The gradient has the outputs’ shape, and ravel flattens it to four numbers.", "The threshold uses kilograms because the residuals use kilograms. At threshold 6, the two four-kilogram errors are in the quadratic region and the two eight-kilogram errors are in the linear region."], check: numberCheck("What mean Huber loss do these four predictions have at a threshold of 6 kilograms?", 19.0, 0.0005, "At threshold six, the smaller residuals use Huber’s quadratic region and the larger residuals use its linear region. The reported value is the mean over the four examples. A threshold large enough to include all these residuals reproduces this SDK’s half-squared-error values on this batch."), question: "How do the three losses respond to the same weight-prediction errors?" },
            ),
            exercise(
              "Score one row of three class scores",
              ["The row contains raw scores for child, teenager and adult, in that order. Treat each class as the true class in turn, build its one-hot target and measure SoftmaxCrossEntropy. A one-hot target has one at the true class and zero at the others.","Print the loss, the gradient for each score and the sum of those gradients. Finally add the same constant to every score with adult as the target and measure again. The loss accepts raw scores and performs softmax internally."],
              `import numpy as np
from oop_ml import SoftmaxCrossEntropy

scores = np.array([[1.0, 2.0, 3.0]])
classes = ["child", "teenager", "adult"]

# For each class position, build the one-hot truth for one row of three
# classes, measure the scores against it, and print the class name, the price
# to four places, the pulls rounded to four places, and the pulls' sum.

# Add 100 to every score, measure with adult true, and print the price.`,
              `import numpy as np
from oop_ml import SoftmaxCrossEntropy

scores = np.array([[1.0, 2.0, 3.0]])
classes = ["child", "teenager", "adult"]

loss = SoftmaxCrossEntropy()
for position, name in enumerate(classes):
    truth = SoftmaxCrossEntropy.one_hot([position], 3)
    scored = loss.measure(scores, truth)
    pulls = scored.gradient[0]
    print(f"{name:8} true, price {scored.value:.4f}, pulls {pulls.round(4).tolist()}, sum {pulls.sum():.1e}")

shifted = loss.measure(scores + 100.0, SoftmaxCrossEntropy.one_hot([2], 3))
print(f"adult true with 100 added to every score, price {shifted.value:.4f}")`,
              `child    true, price 2.4076, pulls [-0.91, 0.2447, 0.6652], sum -1.1e-16
teenager true, price 1.4076, pulls [0.09, -0.7553, 0.6652], sum -1.1e-16
adult    true, price 0.4076, pulls [0.09, 0.2447, -0.3348], sum -1.1e-16
adult true with 100 added to every score, price 0.4076`,
              { hints: ["SoftmaxCrossEntropy.one_hot takes a list with one class position per row and the number of classes, and answers a block with a one in the true column and zeros elsewhere. Child is position 0 and adult is position 2.", "The loss applies the softmax itself, so hand it the raw scores and not probabilities. measure answers the value and a gradient with one pull per class score.", "The pull on each score is that class’s probability minus its truth, so you can read the three probabilities back off the pulls by adding one to the pull on the true class."], check: numberCheck("What is the price of the row when teenager is the true class, to four places?", 1.4076, 0.0005, "The probability distribution is fixed by the score row. Choosing another true class changes which probability the negative logarithm scores. Adding a common constant to every score preserves their softmax probabilities and therefore preserves the loss for an unchanged target."), question: "How does the same score row change loss when the true class changes?" },
            ),
            exercise(
              "Walk one line down each loss with a mistyped weight",
              ["The starter contains fifteen clean observations plus a duplicated person's height with a mistyped weight. Fit the supplied one-neuron network independently under each loss, using the same initialization and training schedule.","Print the slope and intercept converted back to centimeters and kilograms, the predicted weight at 176 cm, and the largest remaining parameter gradient. Keep that gradient distinct from a parameter update: the learning rate scales it when an update is applied."],
              `import numpy as np
from oop_ml import AbsoluteError, DenseLayer, HuberError, Identity, LayerStack, Neuron, SquaredError

heights = np.array([152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194, 176], dtype=float)
weights = np.array([54.2, 55.4, 58.7, 60.5, 63.2, 66.2, 67.4, 70.7, 72.5, 75.2, 78.2, 79.4, 82.7, 84.5, 87.2, 27.5])
inputs = ((heights - heights.mean()) / heights.std()).reshape(-1, 1)
targets = (weights - weights.mean()).reshape(-1, 1)
losses = [("squared error", SquaredError()), ("absolute error", AbsoluteError()), ("Huber, knee 5", HuberError(threshold=5.0))]

for name, loss in losses:
    line = LayerStack([DenseLayer([Neuron([0.0], bias=0.0, activation=Identity())])])
    # Four hundred times, run a backward pass on the inputs and targets under
    # this loss and replace the line with the one stepped by it at 0.1.

    # Undo the standardising: the slope is the neuron's weight over the
    # heights' spread, and the intercept is the mean weight plus the bias less
    # the slope times the mean height. Print them, the guess at 176, and the
    # largest_movement of one more backward pass.`,
              `import numpy as np
from oop_ml import AbsoluteError, DenseLayer, HuberError, Identity, LayerStack, Neuron, SquaredError

heights = np.array([152, 155, 158, 161, 164, 167, 170, 173, 176, 179, 182, 185, 188, 191, 194, 176], dtype=float)
weights = np.array([54.2, 55.4, 58.7, 60.5, 63.2, 66.2, 67.4, 70.7, 72.5, 75.2, 78.2, 79.4, 82.7, 84.5, 87.2, 27.5])
inputs = ((heights - heights.mean()) / heights.std()).reshape(-1, 1)
targets = (weights - weights.mean()).reshape(-1, 1)
losses = [("squared error", SquaredError()), ("absolute error", AbsoluteError()), ("Huber, knee 5", HuberError(threshold=5.0))]

for name, loss in losses:
    line = LayerStack([DenseLayer([Neuron([0.0], bias=0.0, activation=Identity())])])
    for _ in range(400):
        line = line.stepped_by(line.backward_pass(inputs, targets, loss), 0.1)

    slope = line[0].weight_matrix[0, 0] / heights.std()
    intercept = weights.mean() + line[0].bias_vector[0] - slope * heights.mean()
    left = line.backward_pass(inputs, targets, loss).largest_movement
    print(f"{name:14} slope {slope:.4f}, intercept {intercept:.2f}, guess at 176 cm {slope * 176 + intercept:.2f}, slope left {left:.4f}")`,
              `squared error  slope 0.7464, intercept -61.55, guess at 176 cm 69.82, slope left 0.0000
absolute error slope 0.7983, intercept -67.72, guess at 176 cm 72.78, slope left 0.1250
Huber, knee 5  slope 0.7908, intercept -66.75, guess at 176 cm 72.44, slope left 0.0000`,
              { hints: ["Calculate a backward pass, then reassign the new stack returned by stepped_by. Neither object updates itself just because a gradient was measured.","The learned scalar weight uses standardized height. Convert it using the saved height spread, and account for both saved means when recovering the raw intercept.","largest_movement reports a gradient magnitude in this API. Multiplying by the learning rate would give the corresponding largest update magnitude."], check: numberCheck("What does the Huber line guess for the person at 176 centimeters, to two places?", 72.44, 0.005, "Huber limits the influence of a sufficiently large residual, while half-squared error continues increasing that influence with residual size. The reported prediction shows the consequence on this particular corrupted sample. Compare both the fitted line and the remaining gradients before calling an optimization run settled."), question: "How much does one mistyped weight move the line fitted under each loss?" },
            ),
            exercise(
              "Relabel one adult and watch the loss, not the accuracy",
              ["Use the supplied height-based raw scores with BinaryCrossEntropy at each of the three scales. Measure the same scores against the original labels and again after one adult is relabeled as a child. The score rule and changed label are already in the starter.","For each scale, print mean loss and classification accuracy for both label sets. Predict which confidence scale will be most affected before checking the results. Feed raw scores to this loss because it applies sigmoid internally."],
              `import numpy as np
from oop_ml import BinaryCrossEntropy

heights = np.array([112, 118, 124, 130, 135, 140, 144, 148, 156, 160, 165, 170, 174, 178, 183, 188], dtype=float)
labels = np.array([0] * 8 + [1] * 8, dtype=float).reshape(-1, 1)
relabelled = labels.copy()
relabelled[13] = 0.0

loss = BinaryCrossEntropy()
for scale in (2.5, 5.0, 10.0):
    scores = ((heights - 152.0) / scale).reshape(-1, 1)
    called_adult = scores >= 0.0
    # Measure the scores against the true labels and against the relabelled
    # ones. Print the scale, each mean loss to four places, and each accuracy,
    # the share of rows where called_adult agrees with the label being one.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy

heights = np.array([112, 118, 124, 130, 135, 140, 144, 148, 156, 160, 165, 170, 174, 178, 183, 188], dtype=float)
labels = np.array([0] * 8 + [1] * 8, dtype=float).reshape(-1, 1)
relabelled = labels.copy()
relabelled[13] = 0.0

loss = BinaryCrossEntropy()
for scale in (2.5, 5.0, 10.0):
    scores = ((heights - 152.0) / scale).reshape(-1, 1)
    called_adult = scores >= 0.0
    clean = loss.measure(scores, labels).value
    flipped = loss.measure(scores, relabelled).value
    clean_accuracy = np.mean(called_adult == (labels == 1.0))
    flipped_accuracy = np.mean(called_adult == (relabelled == 1.0))
    print(f"scale {scale:4}: loss {clean:.4f} at accuracy {clean_accuracy:.4f}, relabelled loss {flipped:.4f} at accuracy {flipped_accuracy:.4f}")`,
              `scale  2.5: loss 0.0290 at accuracy 1.0000, relabelled loss 0.6790 at accuracy 0.9375
scale  5.0: loss 0.0854 at accuracy 1.0000, relabelled loss 0.4104 at accuracy 0.9375
scale 10.0: loss 0.1910 at accuracy 1.0000, relabelled loss 0.3535 at accuracy 0.9375`,
              { hints: ["BinaryCrossEntropy takes raw scores, so hand it the scores as they are, a block of sixteen rows and one column, beside labels of the same shape. Passing probabilities would apply the sigmoid twice.", "measure answers an object with a value, the mean loss over the sixteen rows. The same scores are measured twice, once against each block of labels.", "A sigmoid is above one half exactly where its score is above zero, so the rule calls someone an adult when their score is at least zero, and accuracy is the mean of where that agrees with the label."], check: numberCheck("What is the mean loss at a scale of 2.5 with the 178-centimeter adult relabeled as a child, to four places?", 0.679, 0.0005, "The sharpest score rule assigns the relabeled example a very small probability of its recorded outcome. That produces a larger loss even though accuracy counts it as just one wrong decision at every scale. The loss reflects confidence as well as agreement with the supplied labels."), question: "Which confidence scale is most affected by changing one recorded label?" },
            ),
          ],
        },
      ]}
    />
  );
}
