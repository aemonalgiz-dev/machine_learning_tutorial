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
import { HebbianPlayground } from "@/components/widgets/HebbianPlayground";
import { HebbianStepper } from "@/components/widgets/HebbianStepper";
import { SeedDirections } from "@/components/widgets/SeedDirections";
import { SweepTable } from "@/components/widgets/SweepTable";
import { WalkTrace } from "@/components/widgets/WalkTrace";

export const metadata: Metadata = {
  title: "Hebbian Principal Components · oop_ml",
  description:
    "Use Oja's learning rule to approach the leading principal component through repeated local updates.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HebbianPcaPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["hebbian-pca"]}
      technicalStart="Part 2. Oja’s Subtraction"
      openingTitle="Find a Principal Direction One Observation at a Time"
      playgroundIntro="Watch both the weight direction and its length. Compare the learned direction with the PCA reference rather than judging progress by the output alone."
      title="Hebbian Principal Components"
      tagline="Use Oja's learning rule to approach the leading principal component through repeated local updates."
      prerequisites={
        <>
          The answer being reached is the{" "}
          <Link href="/concepts/pca" className={link}>
            PCA page
          </Link>
          &rsquo;s, and its four people are worked again here, so that page&rsquo;s
          centring, its projection onto a direction and its eigenvector route are
          assumed rather than retaught. The unit fires by the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s dot product, and the rule that moves it is local in the sense the{" "}
          <Link href="/concepts/hopfield-network" className={link}>
            Hopfield page
          </Link>{" "}
          gave the word, each weight reading only the two ends it joins. Nothing here
          descends a loss.
        </>
      }

      playground={<HebbianPlayground />}
      sections={[
        {
          title: "Part 1. One Neuron Reading One Person",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A neuron with two weights">
                <p>
                  Everything on the PCA page came out of a matrix. The covariance
                  matrix was built from every person at once and an eigensolver was
                  asked for the directions it only stretches, a calculation in which
                  the whole crowd is consulted before any answer appears. This page
                  reaches the same directions by a route that never sees two people
                  together. A single unit holds one weight for height and one for
                  weight, reads a person, and fires by the dot product of the two.
                </p>
                <Equation>{"y = w · x = w_height × (height − mean height) + w_weight × (weight − mean weight)"}</Equation>
                <>
<p>
                  We measure the person relative to the average person, so the
                  unit responds to variation around the mean. The measured four
                  have a mean of (170, 68). Start with the person at (180, 78)
                  and a unit whose weight vector points along height alone.
                </p>
                <Equation>{"Centered input = (180 − 170, 78 − 68) = (10, 10)\nWeight vector = (1, 0)\nOutput = (1 × 10) + (0 × 10) = 10"}</Equation>
                <p>
                  The output is one number, and it is exactly the score the PCA page computed along a direction, except that here the direction is not chosen by anyone. It is whatever the weights happen to be.
                </p>
</>
                <KeepInMind>
                  A unit&rsquo;s weight vector is a direction through the cloud, and
                  its output on a person is that person&rsquo;s coordinate along it.
                  The question the page answers is what direction a unit ends up
                  pointing in if a rule is allowed to nudge the weights after every
                  person it reads.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Fire together, wire together">
                <p>
                  Hebb&rsquo;s rule says that when the input and the output are
                  active at the same moment, the connection between them should
                  grow, and grow by more when both are more active. Written for the
                  two weights it is one line. Each weight moves by a rate times the
                  output times its own input, which is the outer product of the two
                  ends of the connection and involves nothing else. There is no
                  target in it and no loss, and nothing is carried back to the
                  weight from anywhere else in a network.
                </p>
                <Equation>{"w ← w + rate · y · x"}</Equation>
                <WorkedExample title="One step on the measured four">
                  <>
                    <p>
                      Start with weights (1, 0) and learning rate 0.0025. Section 12
                      explains this choice of rate. The seeded walk presents person 4
                      first, with centred measurements (−5, 5). Compute the response,
                      the Hebbian update and the new weights in that order.
                    </p>
                    <Equation>{"response y = 1 × (−5) + 0 × 5 = −5\nupdate = 0.0025 × (−5) × (−5, 5) = (0.0625, −0.0625)\nnew weights = (1, 0) + (0.0625, −0.0625)\n            = (1.0625, −0.0625)"}</Equation>
                    <p>
                      The new vector has length about 1.064 and points three degrees
                      farther from the diagonal. A single update need not move toward
                      the final direction.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  Two things in that step deserve a look. The update lies along the
                  person, scaled by how hard the unit fired, so a person the unit
                  already agrees with pushes it further the way it already leans. And
                  the weights got longer. They will get longer on every person, and
                  section 4 measures how much.
                </p>
                <KeepInMind>
                  Hebb&rsquo;s rule strengthens a connection in proportion to the
                  product of its two ends. It is local and needs no teacher, and
                  nothing in it ever makes a weight smaller.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Centre first">
                <p>
                  The rule multiplies by the row, so whatever the row is measured
                  from is what the unit is pulled toward. Handed raw heights near 170
                  and raw weights near 68, every person is a long vector pointing
                  from the origin to roughly the same place, and the weights turn to
                  match that place rather than the shape of the cloud around it. The
                  PCA page centred for the same reason, and the fit here centres
                  itself, storing the two means so a new person can be read the same
                  way later.
                </p>
                <Equation>{"x = (height − 170, weight − 68)        on the measured four"}</Equation>
                <p>
                  Section 25 runs the rule on the raw positions to show what it
                  learns instead, which on the measured four is a direction a
                  twelfth of a degree from the line to the mean and twenty-three
                  degrees from the answer. For everything between here and there the
                  rows are deviations.
                </p>
                <KeepInMind>
                  Centring is part of the method rather than a preliminary. A
                  Hebbian unit on uncentred data learns where the cloud is, and the
                  spread it was meant to find is lost under that.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What the plain rule does to the weights, measured">
                <>
<p>
                  Let the plain rule run and watch the length of the weight vector rather than its direction. On the measured four, presented in the seeded order at the rate from section 12, one epoch takes the length from 1 to 1.064, then 1.326, then 1.779, then 1.825, and every step lengthened it. Hold the rate constant and the length after each of twenty epochs runs 1.83, 3.75, 8.18, 18.2, 40.8, 91.8, 206, 464, 1045, 2351 and on to 7.8 million by the twentieth.
                </p>
                <p>
                  Let the rate fall a hundredfold across the twenty epochs as the fit does and the growth slows to 42.0, though it never once reverses.
                </p>
</>
                <WalkTrace
                  people="four"
                  measure="length"
                  maxEpochs={20}
                  logScale
                  variants={[
                    { label: "plain Hebb, constant rate", rule: "hebb", decay: false, start: "along_height" },
                    { label: "plain Hebb, falling rate", rule: "hebb", decay: true, start: "along_height" },
                    { label: "Oja, constant rate", rule: "oja", decay: false, start: "along_height" },
                  ]}
                />
                <p>
                  The length is on a logarithmic axis because the plain rule&rsquo;s
                  and the corrected rule&rsquo;s have to be on one picture. The
                  direction the plain rule takes is worth knowing too, because it is
                  the right one. At the constant rate the weights after twenty epochs
                  point 0.0006 degrees from the eigen direction while being seven
                  million long. The rule finds the direction and then runs along it
                  forever, which is what my own notes on it call exploding along a
                  direction rather than converging to one.
                </p>
                <KeepInMind>
                  Every update from Hebb&rsquo;s rule has a part along the current
                  weights of rate times the output squared, which cannot be negative,
                  so the length only ever grows. The direction it grows along is the
                  right one, and that is the clue to the repair.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Oja’s Subtraction",
          content: (
            <>
              <SubSection title="5. Subtract what the unit already explains">
                <p>
                  The unit&rsquo;s output times its own weights is the unit&rsquo;s
                  reconstruction of the person, the part of them it already accounts
                  for. Oja&rsquo;s correction subtracts that from the person before
                  the update is formed, so the rule moves the weights toward only the
                  part of each person the unit does not yet explain. Nothing else
                  changes. The rate, the output and the locality are all as they were.
                </p>
                <Equation>{"w ← w + rate · y · (x − y · w)"}</Equation>
                <WorkedExample title="The same first step under the corrected rule">
                  <>
                    <p>
                      Use the same weights, person and output with Oja’s rule. First
                      remove the part of the input already represented by the current
                      weight direction.
                    </p>
                    <Equation>{"adjusted input = (−5, 5) − (−5) × (1, 0) = (0, 5)\nupdate = 0.0025 × (−5) × (0, 5) = (0, −0.0625)\nnew weights = (1, 0) + (0, −0.0625) = (1, −0.0625)"}</Equation>
                    <p>
                      The direction changes by a similar amount, but the length is now
                      about 1.002 instead of 1.064. The correction largely removes the
                      unwanted growth.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The subtraction has removed exactly the part of the update that
                  lay along the weights themselves, which is the part that was doing
                  the lengthening, and left the part across them, which is the part
                  that turns. Section 6 makes that exact.
                </p>
                <KeepInMind>
                  Oja&rsquo;s rule is Hebb&rsquo;s rule applied to the residual, the
                  person minus the unit&rsquo;s own reconstruction of them. It is
                  still local, since the reconstruction uses only the unit&rsquo;s
                  own output and its own weights.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the subtraction does to the length, exactly">
                <p>
                  Ask what one step does to the squared length of the weights and
                  the answer is an identity with two terms, and no approximation in
                  it. Write r for the bracket, the residual the update is built from.
                </p>
                <Equation>{"|w′|² = |w|² + 2 · rate · y² · (1 − |w|²) + rate² · y² · |r|²"}</Equation>
                <>
<p>
                  The first term is the subtraction at work. It is positive while the weights are shorter than one, negative while they are longer, and zero at length one exactly, so a vector that has grown is pulled back and one that has shrunk is pushed out, harder the further from one it is and harder the more strongly the unit fired.
                </p>
                <p>
                  The second term is the square of the step and is always positive, which is why a single step can still leave the length a little over one. It is smaller by a factor of the rate, so it loses as the rate falls.
                </p>
</>
                <InAModel title="The third step of the walk from (1, 0)">
                  <>
                    <p>
                      Before person 1 is presented, the squared weight length is about
                      1.0640 and the output is about 12.003. The first term in the
                      change of squared length pulls toward one; the second can push
                      outward.
                    </p>
                    <Equation>{"first term ≈ 2 × 0.0025 × 144.06 × (1 − 1.0640) ≈ −0.0461\nsecond term ≈ 0.0025² × 144.06 × 65.15 ≈ 0.0587\nnew squared length ≈ 1.0640 − 0.0461 + 0.0587 ≈ 1.0766\nnew length ≈ √1.0766 ≈ 1.0376"}</Equation>
                    <p>
                      The outward term wins on this update. The rate is not small
                      relative to this person’s squared input length, so the term
                      quadratic in the rate cannot be ignored.
                    </p>
                  </>
                </InAModel>
                <p>
                  Over epochs the pull wins. At a constant rate the length at the end
                  of each of the first five epochs on the measured four is 1.0372,
                  1.0084, 1.0009, 1.0001 and 1.0000, and by the thirteenth no weight
                  moves more than a millionth in a whole pass, which is the test the
                  fit stops on. At no point did anything divide by the norm.
                </p>
                <WalkTrace
                  people="four"
                  measure="length"
                  maxEpochs={20}
                  perStep
                  variants={[
                    { label: "Oja, constant rate, from (1, 0)", rule: "oja", decay: false, start: "along_height" },
                    { label: "Oja, falling rate, from (1, 0)", rule: "oja", decay: true, start: "along_height" },
                  ]}
                />
                <KeepInMind>
                  The unit length is a result rather than a step. Oja&rsquo;s
                  subtraction drives the squared length toward one from either side,
                  and the fit never normalises the weights, because how close the
                  length comes to one is the evidence that the rule worked.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Where the subtraction comes from">
                <p>
                  The blunt way to keep a weight vector at unit length is to take
                  the Hebbian step and then divide by the new length. For a small
                  rate the new length is close to one, and expanding the division to
                  first order in the rate, the calculus primer&rsquo;s move of keeping
                  the slope and dropping the curve, turns the division into a
                  subtraction.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "w′ = (w + rate · y · x) / |w + rate · y · x|", reason: "take the Hebbian step, then scale back to unit length" },
                    { expression: "|w + rate · y · x|² = 1 + 2 · rate · y² + O(rate²)", reason: "expand the squared length with |w| = 1 and w · x = y" },
                    { expression: "1 / |w + rate · y · x| ≈ 1 − rate · y²", reason: "the first-order expansion of one over the square root" },
                    { expression: "w′ ≈ (w + rate · y · x)(1 − rate · y²)", reason: "multiply out" },
                    { expression: "w′ ≈ w + rate · y · x − rate · y² · w", reason: "drop the term in rate squared" },
                    { expression: "w′ ≈ w + rate · y · (x − y · w)", reason: "factor out rate times y; this is Oja’s rule" },
                  ]}
                />
                <p>
                  So the subtracted term is the piece that normalising would have
                  removed, applied before the length has a chance to drift. That is
                  why the rule reads as Hebb&rsquo;s rule with a correction and why it
                  keeps every property of Hebb&rsquo;s rule that mattered, above all
                  that the weight joining input to output is changed using only the
                  values at its two ends.
                </p>
                <KeepInMind>
                  Oja&rsquo;s rule is the first-order expansion of Hebb&rsquo;s rule
                  followed by normalisation. The approximation is in the rate, so it
                  is a better approximation the smaller the rate is, which is one of
                  the reasons the rate is made to fall.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Where the unit comes to rest">
                <p>
                  Now ask where a unit obeying the corrected rule stops moving. Over
                  many people the update averages, and the averages are quantities
                  the PCA page built. The average of y times x is the average of
                  (w · x) times x, which is the covariance matrix C applied to w, and
                  the average of y squared is the variance along w, which that page
                  wrote as wᵀCw.
                </p>
                <Equation>{"average update = rate · (C w − (wᵀ C w) · w)"}</Equation>
                <p>
                  The unit rests where the average update is zero, which says that
                  C w is a multiple of w. A direction the matrix only stretches is the
                  linear algebra primer&rsquo;s eigenvector, and the multiple, wᵀCw,
                  is its eigenvalue, the variance along w. Every eigenvector is a
                  resting point. Only the one with the largest eigenvalue is a stable
                  one, and the argument is short enough to fold away.
                </p>
                <WhyThisWorks title="Why only the largest direction is stable">
                  <>
                    <p>
                      Suppose the weights lie on eigenvector u, whose eigenvalue is λ.
                      Add a small component in another eigenvector direction v, whose
                      eigenvalue is μ.
                    </p>
                    <Equation>{"perturbed weights: w = u + εv\nfirst-order change in the perturbation ≈ rate × (μ − λ) × εv"}</Equation>
                    <p>
                      If the other eigenvalue is larger, the perturbation grows. If it
                      is smaller, the perturbation shrinks. Under this local averaged
                      analysis, a stable direction therefore belongs to the
                      largest-eigenvalue eigenspace. Tied largest eigenvalues need not
                      select one unique direction.
                    </p>
                  </>
                </WhyThisWorks>
                <Equation>{"C w = λ w,        λ = wᵀ C w"}</Equation>
                <p>
                  On the measured four the covariance matrix is the PCA page&rsquo;s
                  [62.5, 37.5; 37.5, 62.5], its eigenvectors run along (1, 1) and
                  (1, −1), and the unit rests on the first. Nothing here built that
                  matrix. The average of the updates is what the matrix would have
                  said, and the unit reaches it one person at a time.
                </p>
                <KeepInMind>
                  Averaged over the people, Oja&rsquo;s update is zero exactly on an
                  eigenvector of the covariance matrix and stable only on the one with
                  the largest eigenvalue. The unit finds the first principal component
                  without ever assembling the matrix that defines it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "At a constant rate the plain Hebbian rule finds the eigen direction and then runs along it, seven million long after twenty epochs.",
              true,
              "It finds the direction and then runs along it forever. At the constant rate the weights after twenty epochs point 0.0006 degrees from the eigen direction while being 7.8 million long, because every update has a part along the current weights of the rate times the output squared, and that cannot be negative. The direction it grows along being the right one is the clue to the repair, since only the lengthening has to be removed.",
            ),
            choice(
              "What does Oja’s subtraction take out of the update?",
              [
                "The part lying along the weights themselves, which was doing the lengthening, leaving the part across them, which turns",
                "The part across the weights, which was making the direction wander",
                "The dependence of the rate on the scale the people are measured in",
                "The need to centre the rows before reading them",
              ],
              0,
              "The unit’s output times its own weights is the part of the person the unit already explains, and subtracting it removes exactly the part of the update that lay along the weights, which was the part doing the lengthening. The part across them, which turns, is left as it was. On the first step from (1, 0) the plain rule left a length of about 1.064 and the corrected rule about 1.002, with the direction changing by a similar amount under both.",
            ),
            choice(
              "Does the rule normalise the weights?",
              [
                "No, nothing ever divides by the norm, and the length arriving at one is the evidence the rule worked",
                "Yes, every step divides by the new length",
                "Yes, but only once at the end of each epoch",
                "No, and the length never comes near one",
              ],
              0,
              "The subtracted term is the first-order expansion of exactly what dividing would have removed, so the approximation is in the rate and is better the smaller the rate is. At a constant rate the length at the end of each of the first five epochs on the measured four is 1.0372, 1.0084, 1.0009, 1.0001 and 1.0000.",
            ),
            several(
              "The change in squared length after one step has two terms. Which of these hold?",
              [
                "The first term is positive while the weights are shorter than one and negative while they are longer",
                "The second term is always positive, so a single step can still leave the length a little over one",
                "On the step from a squared length of 1.0640 the pull toward one is the larger of the two, so the length falls",
                "The whole expression is an approximation, good only for a small rate",
              ],
              [0, 1],
              "It is an identity with no approximation in it, which is what lets the two terms be weighed against each other exactly. On that step the pull toward one is about −0.0461 and the outward term about 0.0587, so the outward term wins and the length rises to about 1.0376, because the rate is not small relative to that person’s squared input length. The second term is smaller by a factor of the rate, so it loses as the rate falls, and over epochs the pull toward one wins.",
            ),
            choice(
              "Averaged over the people, where is the corrected update zero?",
              [
                "Exactly on an eigenvector of the covariance matrix, and stable only on the one with the largest eigenvalue",
                "Only on the eigenvector with the largest eigenvalue",
                "Anywhere the weights have length one",
                "Only where every person’s residual is zero",
              ],
              0,
              "The average of the output times the person is the covariance matrix applied to the weights, and the average of the output squared is the variance along them, so resting says the matrix only stretches that direction. Every eigenvector is a resting point, and a perturbation toward another one grows whenever its eigenvalue is larger, which leaves the largest as the only stable one.",
            ),
        ],
        },
        {
          title: "Part 3. Turning Toward the Direction of Greatest Spread",
          content: (
            <>
              <SubSection title="9. One person at a time, four steps by hand">
                <p>
                  Step through one epoch on the measured four from the weights
                  (1, 0). The seeded walk presents person 4, then 2, then 1, then 3,
                  and the widget below is that walk, one person per press, with the
                  eigen direction dashed behind the arrow. The arrow is drawn at the
                  length the rule left it, so its length and its angle are both on
                  the picture.
                </p>
                <HebbianStepper people="four" rule="sanger" nComponents={1} maxEpochs={3} start="along_height" decay={false} />
                <NumberTable
                  headings={["presented", "deviation", "output y", "bracket x − y·w", "update", "weights after", "length", "angle to eigen"]}
                  rows={[
                    ["start", "", "", "", "", "(1, 0)", "1.0000", "45.00°"],
                    ["person 4", "(−5, 5)", "−5.000", "(0, 5)", "(0, −0.0625)", "(1.0000, −0.0625)", "1.0020", "48.58°"],
                    ["person 2", "(−10, −10)", "−9.375", "(−0.625, −10.586)", "(0.0146, 0.2481)", "(1.0146, 0.1856)", "1.0315", "34.63°"],
                    ["person 1", "(10, 10)", "12.003", "(−2.178, 7.772)", "(−0.0654, 0.2332)", "(0.9493, 0.4188)", "1.0376", "21.19°"],
                    ["person 3", "(5, −5)", "2.652", "(2.482, −6.111)", "(0.0165, −0.0405)", "(0.9657, 0.3783)", "1.0372", "23.61°"],
                  ]}
                  caption="One epoch at a constant rate of 0.0025, every number the endpoint's. The angle is to the eigen direction (1, 1), modulo a half turn."
                />
                <p>
                  Forty-five degrees off at the start, twenty-four off after one
                  epoch, and the whole of the turn came from four multiplications
                  each involving one person and the weights as they stood. Press on
                  through the second and third epochs and the angle falls to 8.3 and
                  then 2.7 degrees.
                </p>
                <KeepInMind>
                  Each presentation is one dot product, one subtraction and one
                  scaled addition. No matrix is formed and no two people are
                  compared; the weights after any step depend only on that person
                  and the weights before it.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why one person can turn the weights the wrong way">
                <>
<p>
                  The first step in that table went the wrong way. Person 4 turned the weights from 45 degrees off the answer to 48.6 degrees off, and it was the next two people who turned them back. That is not a mistake in the rule. A single person pulls the weights toward their own axis, whichever sign they lie on, and person 4 lies on the second eigen direction, so they pull toward it.
                </p>
                <p>
                  What decides the outcome is how hard each person pulls, which is the output times the part of the person that lies across the weights.
                </p>
</>
                <Equation>{"turn from one person  =  rate · y · (the part of x across w)"}</Equation>
                <p>
                  Both factors grow with the person&rsquo;s distance from the mean,
                  so the pull grows with its square. On the measured four the two
                  people on the first axis are ten root two from the mean and the
                  two on the second are five root two, so the first axis pulls four
                  times as hard per person, and over an epoch the weights turn
                  toward it. That is the covariance matrix acting in
                  instalments. Every person&rsquo;s pull is one term of the average
                  section 8 wrote down, and the average is what wins.
                </p>
                <KeepInMind>
                  A single step can move the weights away from the answer, and it
                  will whenever the person presented lies closer to another
                  direction. Convergence is a property of the average update over
                  many people, and the rate is what makes any one person unable to
                  undo the rest.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Shuffling the order, and the seed">
                <p>
                  Because one person can turn the weights the wrong way, the order
                  the people arrive in matters, and a fixed order would let the last
                  person of every epoch have the final say every time. So the fit
                  reshuffles the order at every epoch, from a seeded generator that
                  also draws the starting weights. The seed is what makes a fit
                  reproducible, and the widgets on this page all use the same one,
                  which is why the numbers in the prose are the numbers on the screen.
                </p>
                <p>
                  Whether the seed changes the answer is a measurement, and on the
                  measured four it does not. Five seeds start the unit in five
                  different directions and every one of them lands within a ten
                  thousandth of a degree of the diagonal, in between fourteen and
                  twenty-two epochs. The sign differs, since a direction and its
                  negative are the same direction and the rule lands on either.
                </p>
                <SweepTable people="four" section="seeds" />
                <KeepInMind>
                  The seed fixes where the walk starts and the order it reads the
                  people in. On a cloud with a clear first direction it changes the
                  path and the sign and not the answer, and section 26 shows the
                  cloud on which it changes the answer too.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Learning Rate and How Many Presentations",
          content: (
            <>
              <SubSection title="12. The rate carries the square of the data’s units">
                <p>
                  The update multiplies the rate by the output and by the person, and
                  the output is itself the person times the weights, so the update
                  carries the square of whatever unit the people are measured in.
                  A rate that behaves on data spread about one is a hundred times too
                  large on data spread about ten, and the default rate of 0.05,
                  which suits data spread about one, overflows on the
                  measured four in centimetres on the third epoch. So the endpoint
                  sets the rate from the cloud rather than fixing it.
                </p>
                <Equation>{"starting rate = 0.5 / (longest deviation)²        = 0.5 / 200 = 0.0025 on the measured four"}</Equation>
                <>
<p>
                  The half comes from section 6. The subtraction moves the squared length toward one by twice the rate times the output squared, and the output squared is at most the squared length of the longest person, so at a half the largest single kick lands on length one rather than carrying past it. Scaling every rate alike moves no direction and no share, which is what lets the eigensolver be run on the raw people and still be the right comparison.
                </p>
                <p>
                  Write the heights in millimetres and the starting rate becomes 0.0000495, the first direction still lands within a hundredth of a degree, and nothing else about the answer moves.
                </p>
</>
                <KeepInMind>
                  The rate is not a scale-free number. It has to be set from the
                  data&rsquo;s own spread, or the data standardised first, and a rate
                  copied from another dataset is the commonest way for this method to
                  overflow.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Too large a rate, measured">
                <p>
                  Multiply the starting rate and watch the length. At twice the
                  rate, held constant, the walk from (1, 0) settles in three epochs at
                  a length of 0.9994. At three times it never settles, and the length
                  at the end of each epoch bounces between 0.24 and 1.25 for all
                  twenty. At eight times the first four presentations leave the
                  length at 1.12, 1.68, 9.48 and 210, and on the third epoch a weight
                  stops being a finite number.
                </p>
                <WalkTrace
                  people="four"
                  measure="length"
                  maxEpochs={20}
                  perStep
                  logScale
                  ceiling={1000}
                  variants={[
                    { label: "the rate, constant", rule: "oja", decay: false, start: "along_height", rateMultiplier: 1 },
                    { label: "three times the rate", rule: "oja", decay: false, start: "along_height", rateMultiplier: 3 },
                    { label: "eight times the rate", rule: "oja", decay: false, start: "along_height", rateMultiplier: 8 },
                  ]}
                />
                <>
<p>
                  The mechanism is the second term of section 6. Past a certain rate the square of the step outgrows the pull back toward one, so a kick meant to shrink the weights grows them instead, and the next kick is larger. The fit refuses a walk like that by name rather than completing it, and where the line falls depends on the cloud.
                </p>
                <p>
                  On the measured four the fit at four times the rate is refused on the fourth epoch; on the crowd four times the rate runs the full two hundred epochs and it is eight times that is refused, on the first.
                </p>
</>
                <SweepTable people="four" section="rates" />
                <KeepInMind>
                  Below the line a larger rate settles sooner. Above it the length
                  bounces and then overflows, and the fit refuses rather than
                  answering with a non-finite direction. The line is a fact about
                  the data&rsquo;s spread, which is why the rate is set from it.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. How many presentations it takes">
                <p>
                  Vary the epoch budget instead, with the rate falling a hundredfold
                  across whatever budget is given. On the measured four the first
                  direction is 23.1 degrees off after one epoch, 16.4 after five, 6.9
                  after ten, 1.0 after twenty and three thousandths after fifty; a
                  budget of two hundred stops itself at epoch 91, because no weight
                  moved more than a millionth in a pass, with the direction a
                  millionth of a degree off. That is 364 presentations of one of
                  four people.
                </p>
                <SweepTable people="four" section="epochs" />
                <p>
                  Every row of that table is a fresh fit rather than a frame of one,
                  because the rate falls across the budget, so a walk of ten epochs
                  is a walk with a steeper decay and not the first ten epochs of a
                  walk of two hundred. On the crowd the first direction is 1.8
                  degrees off after one epoch, half a degree after five and
                  hundredths after ten, and the walk never stops itself within two
                  hundred, for a reason section 18 gets to.
                </p>
                <KeepInMind>
                  The first direction on a small cloud settles in tens of epochs,
                  which is a few hundred presentations. Later directions take longer,
                  and section 18 says how much.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Whether the rate has to fall">
                <>
<p>
                  The textbook argument, from Robbins and Monro, is that a constant rate can never settle. Each person moves the weights by a fixed amount, so the weights keep chasing whichever person arrived last, and the fit becomes a fact about presentation order. I measured it, and on the measured four the claim does not hold.
                </p>
                <p>
                  Every one of those four lies exactly on an eigen direction, so at the answer the bracket is exactly zero for each of them, and a constant rate settles at epoch 46 where the falling one takes 91, and lands on the diagonal just as exactly.
                </p>
</>
                <p>
                  On the crowd the claim holds. Nobody there lies on an axis, so at
                  the answer each person&rsquo;s update is small but not zero, and
                  the constant-rate walk never settles in two hundred epochs. Within
                  its twentieth epoch the direction wobbles between 0.12 and 0.77
                  degrees off as the eleven people go past, where the falling rate
                  holds it within a hundredth throughout.
                </p>
                <WalkTrace
                  people="crowd"
                  measure="angle"
                  maxEpochs={20}
                  perStep
                  variants={[
                    { label: "falling rate", rule: "sanger", decay: true },
                    { label: "constant rate", rule: "sanger", decay: false },
                  ]}
                />
                <KeepInMind>
                  A falling rate is what lets the average win over the last person
                  presented. It is needed exactly when the people do not lie on the
                  answer, which is every real cloud, and the measured four are the
                  exception that shows what the condition is for.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "Each presentation turns the weights toward the answer.",
              false,
              "Person 4 turned them from 45 degrees off to 48.6 degrees off, because a single person pulls the weights toward their own axis and that person lies on the second eigen direction. On the measured four the two people on the first axis are ten root two from the mean against five root two, so that axis pulls four times as hard per person and the average wins over an epoch.",
            ),
            choice(
              "Why is the rate set from the cloud rather than fixed at a default?",
              [
                "The update carries the square of whatever unit the people are measured in, so a default of 0.05 overflows on the measured four in centimetres",
                "A smaller cloud needs more epochs, and the rate stands in for the epoch count",
                "The rate has to be matched to the number of units",
                "Centring changes the scale of the rows, so the rate has to follow it",
              ],
              0,
              "The starting rate is a half over the squared longest deviation, which is 0.0025 here, and the half is there because the subtraction moves the squared length toward one by twice the rate times the output squared, so the largest single kick lands on length one rather than carrying past it. In millimetres the rate becomes 0.0000495 and the direction still lands within a hundredth of a degree.",
            ),
            several(
              "Raising the rate on the measured four, which of these were measured?",
              [
                "At twice the rate, held constant, the walk settles in three epochs at a length of 0.9994",
                "At three times it never settles, and the length bounces between 0.24 and 1.25 for all twenty epochs",
                "At four times the fit is refused, on the fourth epoch",
                "Where that line falls is a property of the rule rather than of the cloud",
              ],
              [0, 1, 2],
              "Past a certain rate the square of the step outgrows the pull back toward one, so a kick meant to shrink the weights grows them instead. The line is a fact about the data’s spread, which is why the crowd runs the full two hundred epochs at four times the rate and is refused only at eight.",
            ),
            choice(
              "The textbook argument says a constant rate can never settle. What did measuring it show?",
              [
                "It holds on the crowd and not on the measured four, where every person lies exactly on an eigen direction",
                "It holds on both, exactly as stated",
                "It fails on both, since the bracket always reaches zero",
                "It holds only when the rate is set from the longest deviation",
              ],
              0,
              "At the answer the bracket is exactly zero for each of those four people, so a constant rate settles at epoch 46 where the falling one takes 91 and lands on the diagonal just as exactly. On the crowd nobody lies on an axis, and within the twentieth epoch the direction wobbles between 0.12 and 0.77 degrees off where the falling rate holds it within a hundredth.",
            ),
            choice(
              "Why does the fit reshuffle the order of the people at every epoch?",
              [
                "Because one person can turn the weights the wrong way, and a fixed order would let the last person of every epoch have the final say",
                "Because the covariance matrix changes between epochs",
                "Because a repeated order would make the fit irreproducible",
                "Because the rate falls, and the order has to fall with it",
              ],
              0,
              "The same seeded generator draws the starting weights and the order, which is what makes a fit reproducible and why the numbers in the prose are the numbers on the screen. On the measured four five seeds all land within a ten thousandth of a degree of the diagonal, in between fourteen and twenty-two epochs, differing only in sign.",
            ),
        ],
        },
        {
          title: "Part 5. A Second Direction by Subtracting What the First Explains",
          content: (
            <>
              <SubSection title="16. Two independent units find one direction">
                <p>
                  Give the cloud a second unit with its own weights, obeying
                  Oja&rsquo;s rule on its own, and it solves the same problem the
                  first unit solved. On the measured four the two units are 76
                  degrees apart after the first epoch and 5.3 degrees apart after
                  twenty, closing every epoch; on the crowd they coincide to a
                  thousandth of a degree, so the second unit has repeated the
                  first unit&rsquo;s answer and found nothing of its own.
                </p>
                <WalkTrace
                  people="four"
                  measure="gap"
                  maxEpochs={20}
                  variants={[
                    { label: "two units under Oja’s rule alone", rule: "oja", nComponents: 2 },
                    { label: "two units under Sanger’s rule", rule: "sanger", nComponents: 2 },
                  ]}
                />
                <KeepInMind>
                  The two units are independent, and that is the difficulty.
                  Nothing in Oja&rsquo;s rule tells a unit what the other units have
                  already found, so every unit finds
                  the direction of greatest spread and no other.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Sanger’s rule">
                <p>
                  Sanger&rsquo;s extension hands the second unit the person with the
                  first unit&rsquo;s reconstruction removed, so the second unit can
                  only lean on what the first left unexplained. The bracket for unit
                  i subtracts the reconstructions of every earlier unit and of unit i
                  itself, and the last of those is Oja&rsquo;s own normalisation.
                </p>
                <Equation>{"w₂ ← w₂ + rate · y₂ · (x − y₁ · w₁ − y₂ · w₂)"}</Equation>
                <p>
                  The sum running up to and including the unit&rsquo;s own term is
                  the whole of it. Drop that term and the second unit loses its
                  normalisation; drop the earlier terms and it loses its reason to
                  differ from the first. The part of the second unit along the first
                  direction is driven toward zero, which is what perpendicular
                  means, and its own subtraction keeps its length near one. On the
                  measured four the two units are 83 degrees apart after one epoch,
                  76.5 after twenty, and 89.998 after the full walk of 91 epochs.
                </p>
                <HebbianStepper people="four" rule="sanger" nComponents={2} maxEpochs={3} />
                <KeepInMind>
                  Deflation is subtraction. Each unit reads the person minus what
                  every earlier unit explains, so the units find the components in
                  order of variance, and the rule stays local because a
                  reconstruction needs only outputs and weights.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The second direction learns at a pace set by its variance">
                <>
<p>
                  The cost of deflation is that a unit chasing a small variance is pushed by small outputs, and its updates are small in proportion. On the crowd the second direction holds one percent of the spread, and after two hundred epochs of the falling rate it is 8.2 degrees off its twin at a length of 0.43, nowhere near one.
                </p>
                <p>
                  On the ideal case, where it holds seven hundredths of a percent, it is 20.5 degrees off at a length of 0.18. The first direction on both is within a few thousandths of a degree.
                </p>
</>
                <SweepTable people="crowd" section="epochs" />
                <p>
                  What starves the second unit is the falling rate, and I measured
                  that too. Hold the rate constant on the crowd and the second
                  direction reaches 0.07 degrees at a length of 1.003, while the
                  first wobbles as section 15 showed; run the falling rate at four
                  times its size and the second reaches 0.14 degrees at 0.995. The
                  length is the diagnostic for all of this. A slow unit comes back
                  with a length well under one, and that is how the readout reports
                  it.
                </p>
                <SweepTable people="crowd" section="constant" />
                <KeepInMind>
                  An eigensolver hands over every direction at once. The local rule
                  pays for each in proportion to how little there is to find, and a
                  second direction that is left short is a fit that stopped early
                  rather than a rule that failed.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Orthogonality and the shares are measurements">
                <>
<p>
                  An eigensolver&rsquo;s directions are perpendicular to the last bit and its variances add to the total exactly. The rule&rsquo;s are neither, and the fit reports rather than pretends. The worst orthogonality is the largest dot product between two learned unit directions, 0.000043 on the measured four after the full walk and 0.14 on the crowd, where the second direction was left short.
                </p>
                <p>
                  The variances along the two directions add to 166.66666685 against a total of 166.66666667, a little over, because two directions that overlap slightly count the overlap twice. After one epoch, with the directions 0.12 from perpendicular, they add to 176.3.
                </p>
</>
                <Equation>{"kept variance = variance along w₁ + variance along w₂  ≥  total, when w₁ · w₂ ≠ 0"}</Equation>
                <KeepInMind>
                  A share above one is a report on the fit rather than an error in
                  it. The vocabulary that holds the eigensolver&rsquo;s answer refuses
                  a pair of directions a hundred-millionth from perpendicular, so the
                  rule&rsquo;s answer has to live in its own, which checks only that
                  the directions weight the same features and reports the rest.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Agreement With the Eigenvector Answer",
          content: (
            <>
              <SubSection title="20. The angle between the two directions">
                <>
<p>
                  The claim of the page is one number, the angle between the direction a unit learned and the direction an eigensolver computed, taken modulo a half turn because the rule lands on either sign. On the measured four after the full walk it is 0.0000012 degrees for the first direction and 0.0024 for the second.
                </p>
                <p>
                  On the crowd it is 0.0031 for the first and 8.2 for the second, for the reason section 18 gave, and on the ideal case 0.001 for the first. The playground at the top of the page draws both directions over any cloud you build, and its angle readouts are these numbers.
                </p>
</>
                <KeepInMind>
                  Where the walk settles, it settles on the eigensolver&rsquo;s
                  direction to within millionths of a degree. Where a walk is left
                  short, the length reads well under one while the angle can still
                  be several degrees off.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The variance recovered">
                <p>
                  The variance along each learned unit direction is measured from
                  the people, by projecting them onto it and taking the sample
                  variance, which is the same quantity an eigenvalue reports. On the
                  measured four the two come back 133.3333333 and 33.3333335 against
                  eigenvalues of 133.3333 and 33.3333, and the shares 0.8 and 0.2
                  agree with the PCA page&rsquo;s to six decimals. On the crowd the
                  first share is 0.9897 by both routes.
                </p>
                <Equation>{"variance along w = sample variance of (x · w / |w|) over the people"}</Equation>
                <KeepInMind>
                  The variance is measured along the unit direction rather than the
                  raw weights, because a variance along a vector of length 0.43
                  would be scaled by 0.43 squared, a fact about the walk leaking into
                  a fact about the data.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The scores agree">
                <p>
                  A fitted rule transforms people the way a fitted PCA does, by
                  centring with the stored means and projecting onto the unit
                  directions, and it names the output columns as the PCA page does so
                  one can be swapped for the other downstream. On the measured four
                  person 1 scores 14.1421 on the first direction by both routes and
                  person 3 scores 7.0711 on the second by both, with the cross terms
                  at six ten-thousandths and six quadrillionths where the eigensolver
                  has exact zeros.
                </p>
                <NumberTable
                  headings={["person", "first, by the rule", "first, eigen", "second, by the rule", "second, eigen"]}
                  rows={[
                    ["1, at (10, 10)", "14.1421", "14.1421", "0.0006", "0.0000"],
                    ["2, at (−10, −10)", "−14.1421", "−14.1421", "−0.0006", "0.0000"],
                    ["3, at (5, −5)", "−0.0000", "0.0000", "7.0711", "−7.0711"],
                    ["4, at (−5, 5)", "0.0000", "0.0000", "−7.0711", "7.0711"],
                  ]}
                  caption="Scores on the measured four after the full walk. The eigensolver's second direction carries the opposite sign, which section 10 of the PCA page says is conventional."
                />
                <p>
                  On the crowd the first scores agree to two thousandths for every
                  person and the second do not, because the second direction is
                  eight degrees off. Person 5 scores 2.98 on it by the rule and 1.19
                  by the eigensolver, which is what an eight-degree error looks like
                  on a person thirteen units from the mean.
                </p>
                <KeepInMind>
                  Where the directions agree the coordinates agree, and where a
                  direction was left short every coordinate along it is off by the
                  same angle. There is no inverse transform here, since rebuilding a
                  person by a transpose needs exactly orthonormal directions and
                  these are only nearly so.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. What the local route buys, and what it costs">
                <p>
                  Two things, and they are narrow. The covariance matrix of p
                  features holds p squared numbers; k units hold k times p weights,
                  so at ten thousand features and ten directions the matrix is a
                  thousand times the size of the weights, and the rule never builds
                  it. And the update reads one person and forgets them, so a fit can
                  be driven by people arriving over time from a source too large to
                  hold, tracking a cloud that drifts underneath it.
                </p>
                <p>
                  Against that, it is slow, and for anything that fits in memory the
                  eigensolver wins outright. On the crowd, two hundred epochs of two
                  units is 2,200 presentations through a Python loop, and I measured
                  the fit at 28 milliseconds against 0.38 for the eigensolver, a
                  ratio of 76. It is also less exact, by the residual a finite walk
                  leaves, which on the measured four is millionths of a degree and on
                  the crowd&rsquo;s second direction is eight degrees.
                </p>
                <KeepInMind>
                  The local rule earns its place by not needing the matrix and by not
                  needing the whole dataset at once. On a cloud small enough to draw,
                  both advantages are worth nothing and the eigensolver is faster by
                  a factor of tens.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where It Fails",
          content: (
            <>
              <SubSection title="24. A rate too large for the scale">
                <p>
                  The failure a reader is likeliest to meet is the one section 13
                  measured, a rate that behaves on one dataset and overflows on the
                  same data in different units. The fit does not complete and answer
                  with a non-finite direction. It stops on the epoch the weights
                  overflowed and refuses, naming the epoch and the cause, and the
                  endpoint passes the refusal through as it stands.
                </p>
                <Equation>{"DivergenceError: the weights overflowed on epoch 4; the learning rate is too large\nfor this data’s scale, so lower it or standardize the features first"}</Equation>
                <p>
                  That is the measured four at four times the endpoint&rsquo;s
                  rate. The repairs are the two the message names, a smaller rate or
                  features standardised first, and the second is the honest one for
                  columns measured in different things, exactly as it is for the PCA
                  page&rsquo;s standardised variant, with the difference that there
                  it changes which matrix is decomposed and here it also decides
                  whether the walk survives.
                </p>
                <KeepInMind>
                  A diverged walk is refused by name. Nothing about the answer is
                  reported from a fit whose weights stopped being finite.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Uncentred data learns where the cloud is">
                <>
<p>
                  Run the rule on the raw positions rather than the deviations and it still settles at length one, on a direction that is wrong. On the measured four the weights come to rest 0.08 degrees from the line joining the origin to the mean at (170, 68) and 23.1 degrees from the eigen direction, which is the angle between those two lines.
                </p>
                <p>
                  On the crowd it is 0.74 and 22.1 degrees. The rate for this walk is set from the longest position rather than the longest deviation, 0.000013 rather than 0.0025, or it would overflow on the first person.
                </p>
</>
                <HebbianStepper people="four" rule="sanger" nComponents={1} maxEpochs={20} centre={false} />
                <p>
                  The average update on raw rows is the second-moment matrix rather
                  than the covariance matrix, and its leading eigenvector is
                  dominated by where the mean is when the mean is far from the
                  origin, as it is for heights in centimetres. The unit did what the
                  rule says on the rows it was given, and those rows carried the
                  origin&rsquo;s position as well as the people&rsquo;s shape.
                </p>
                <KeepInMind>
                  Without centring the rule finds the direction of the mean, which is
                  a fact about the units and the origin rather than about the people.
                  The fit centres itself and stores the means for that reason.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Equal eigenvalues, where no direction is the answer">
                <>
<p>
                  Put eight people evenly round a circle about the mean and the two eigenvalues tie, at half the variance each. The eigensolver still answers, with the height axis and the weight axis, and that answer is an arbitrary choice, since every direction through a circle carries the same spread. The rule answers too. It settles at length 1.0005 on a direction 80 degrees from the eigensolver&rsquo;s, with a share of exactly a half, and five seeds send it 21, 9, 57 and 39 degrees from where the page&rsquo;s own seed sent it.
                </p>
                <p>
                  None of those is wrong, and the walk never stops itself, because a flat objective gives it no reason to.
                </p>
</>
                <SeedDirections left="four" right="circle" />
                <KeepInMind>
                  A tie between eigenvalues means the components inside the tied
                  plane are not determined, by either route. The rule reports a
                  direction and a length of one as if it had found something, and
                  only the shares and the disagreement between seeds say that it
                  could not have.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. A direction with no variance cannot be found">
                <p>
                  Hold height constant and let weight vary and the first direction
                  is pure weight, (0, 1) to the last bit, in agreement with the
                  eigensolver. The second unit is then handed a residual of zero on
                  every person, since the first explains everything, and its only
                  remaining term is its own subtraction, so it can only shrink. After
                  two hundred epochs it is 0.24 long and 22 degrees from the axis the
                  eigensolver assigns a variance of zero, and the length is again the
                  report that nothing was found there.
                </p>
                <KeepInMind>
                  A unit is pushed by its output, and a direction with no spread
                  gives no output. The fit accepts the data and the second unit decays
                  toward nothing rather than pointing anywhere in particular.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "Two independent units under the corrected rule, on the crowd, do what?",
              [
                "They coincide to a thousandth of a degree, since nothing tells a unit what another unit has already found",
                "They settle perpendicular to one another",
                "The second decays to no length at all",
                "They split the largest eigenvalue between them",
              ],
              0,
              "Every unit finds the direction of greatest spread and no other. Sanger’s extension hands the second unit the person with the first unit’s reconstruction removed, and the sum running up to and including the unit’s own term is the whole of it, since dropping the own term loses the normalisation and dropping the earlier ones loses the reason to differ.",
            ),
            trueFalse(
              "Two learned directions that overlap slightly count the overlap twice, so their variances can add to a little more than the total.",
              true,
              "On the measured four they come to 166.66666685 against a total of 166.66666667, and after one epoch, with a dot product of 0.12 between the two directions where perpendicular would be zero, they come to 176.3. A share above one is a report on the fit rather than an error in it, which is why the rule’s answer lives in its own vocabulary instead of the one that refuses a pair of directions a hundred-millionth from perpendicular.",
            ),
            several(
              "On the measured four after the full walk, which of these does the page report?",
              [
                "The first learned direction is 0.0000012 degrees from the eigensolver’s and the second 0.0024",
                "The variances along the two learned directions come back 133.3333333 and 33.3333335 against eigenvalues of 133.3333 and 33.3333",
                "Person 1 scores 14.1421 on the first direction whether the rule or the eigensolver produced it",
                "A person can be rebuilt from their two coordinates by a transpose, as on the PCA page",
              ],
              [0, 1, 2],
              "Where the walk settles it settles on the eigensolver’s direction to within millionths of a degree, and the variance is measured from the people along the unit direction, which is the same quantity an eigenvalue reports, so the shares 0.8 and 0.2 agree to six decimals. There is no inverse transform, because rebuilding a person by a transpose needs exactly orthonormal directions and these are only nearly so. On the crowd the second direction is left 8.2 degrees off at a length of 0.43, starved by the falling rate, and the length is what reports it.",
            ),
            choice(
              "Run the rule on the raw positions rather than the deviations, with the rate set from the longest position. What does it learn on the measured four?",
              [
                "A direction 0.08 degrees from the line joining the origin to the mean, and 23.1 degrees from the eigen direction",
                "Nothing, since the weights overflow before the first epoch ends",
                "The eigen direction, a little more slowly than on the deviations",
                "A direction whose length stays well under one, which reports the failure",
              ],
              0,
              "The average update on raw rows is the second-moment matrix rather than the covariance matrix, and its leading eigenvector is dominated by where the mean is when the mean is far from the origin. It still settles at length one, so nothing about the length announces that the answer is a fact about the units and the origin rather than about the people.",
            ),
            several(
              "Eight people evenly round a circle about the mean. Which of these were measured?",
              [
                "The rule settles at length 1.0005 with a share of exactly a half, on a direction 80 degrees from the eigensolver’s",
                "Five seeds send it 21, 9, 57 and 39 degrees from where the page’s own seed sent it",
                "The walk never stops itself, because a flat objective gives it no reason to",
                "The eigensolver still answers, with the height axis and the weight axis, and that answer is an arbitrary choice",
              ],
              [0, 1, 2, 3],
              "Every direction through a circle carries the same spread, so the tie leaves the components inside the plane undetermined by either route. The eigensolver answers with the two axes and the rule answers too, reporting a direction and a length of one as though it had found something, and only the shares and the disagreement between seeds say that it could not have.",
            ),
        ],
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="28. What a Hebbian fit must specify and refuse">
                <p>
                  A complete implementation states how many directions it learns,
                  that it centres and stores the means, what schedule the rate
                  follows and against what count it decays, the epoch cap, the
                  tolerance on movement that stops the walk, how the starting weights
                  are drawn and how the order is shuffled, that the weights are never
                  normalised during learning, that the variance is measured along
                  the unit direction, which of length, orthogonality and ordering it
                  checks and which it reports, and that it has no inverse transform.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no features, or a non-finite value", reason: "refused at the boundary every feature passes through; the endpoint refuses a non-finite coordinate before any fit begins." },
                    { expression: "one person", reason: "refused by name, since one row has no spread to find a direction in; the endpoint refuses fewer than two a layer earlier." },
                    { expression: "two people", reason: "accepted; the first direction is the line through them and the second eigenvalue is zero." },
                    { expression: "every person on one spot", reason: "refused by name, since every share would divide by zero; the endpoint's eigensolver refuses the same cloud first." },
                    { expression: "one feature", reason: "accepted, with one direction carrying a share of one." },
                    { expression: "a constant column beside a varying one", reason: "accepted; the first direction is the varying column exactly and the second unit shrinks to 0.24 rather than pointing anywhere." },
                    { expression: "more directions asked for than features", reason: "refused at the fit, since a direction beyond the last has nothing left to see." },
                    { expression: "a rate too large for the data's scale", reason: "refused on the epoch a weight overflows, naming the epoch; four times the endpoint's rate on the four, and the default rate of 0.05 on centimetres." },
                    { expression: "a rate that never falls", reason: "accepted as a legitimate configuration; measured to settle on the four and to wobble forever on the crowd." },
                    { expression: "reading directions or transforming before fitting", reason: "refused by name, as not fitted rather than as an attribute error." },
                    { expression: "new people with reordered columns", reason: "matched by name and accepted; a column missing or unknown is refused." },
                    { expression: "directions not perpendicular, not unit length, or not in order of variance", reason: "accepted and reported, as the worst orthogonality, the lengths and an ordering flag, since refusing them would refuse a correct fit stopped early." },
                    { expression: "a learned vector of length under a trillionth", reason: "refused, since a vector that short names no direction." },
                    { expression: "two eigenvalues tied", reason: "accepted; the directions inside the tie are arbitrary by both routes, and different seeds return different ones." },
                    { expression: "inverse transform, or saving the fit", reason: "neither is offered, and both are documented rather than defended; the first needs directions more orthonormal than these are." },
                  ]}
                />
                <p>
                  Every row of that table was probed, on this page&rsquo;s own people
                  where an endpoint reaches the case and against the model directly
                  where none does. The two that deserve the most care are the
                  refusals that are not refusals. A constant rate is accepted because
                  a walk that never settles is worth being able to demonstrate, and a
                  second direction left short is accepted because the length reports
                  it, and refusing it would turn every under-converged fit into an
                  error where the honest answer is that it under-converged.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Learning the Directions With the Library",
          practice: [
            exercise(
              "Learn the four and hold them against the eigensolver",
              ["Fit the rule on the measured four at the rate Part 4 sets, 0.0025 falling a hundredfold, with the seed the page uses, and fit the eigensolver on the same four people. Print each learned direction beside its eigen twin, with the angle between them.", "Part 6 puts the first direction 0.0000012 degrees from the eigensolver’s and the second 0.0024, with variances of 133.3333333 and 33.3333335. Look for those, for a length of one on both directions that nothing divided to get, and for the epoch on which the walk stopped itself."],
              `import math

from oop_ml import (
    ExponentialDecaySchedule,
    Feature,
    HebbianPrincipalComponents,
    PrincipalComponentAnalysis,
)

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]
rate = ExponentialDecaySchedule(start=0.0025, end=0.000025)

# Fit a HebbianPrincipalComponents with two components, this rate, a budget
# of 200 epochs and a seed of 11, and fit a PrincipalComponentAnalysis on the
# same people. Print how many epochs the walk ran and whether it converged.
# Then, for each learned direction beside its eigen twin, print the unit
# direction, the length the walk left, the variance along it beside the
# eigenvalue, and the angle between the two in degrees. Finish with the
# worst orthogonality.`,
              `import math

from oop_ml import (
    ExponentialDecaySchedule,
    Feature,
    HebbianPrincipalComponents,
    PrincipalComponentAnalysis,
)

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]
rate = ExponentialDecaySchedule(start=0.0025, end=0.000025)

learned = HebbianPrincipalComponents(
    n_components=2, learning_rate=rate, max_epochs=200, random_seed=11
).fit(people)
solved = PrincipalComponentAnalysis().fit(people)

print(f"epochs run {learned.epochs_run}, converged {learned.converged}")
for direction, component in zip(learned.directions, solved.components):
    alignment = abs(float(direction.direction @ component.direction))
    angle = math.degrees(math.acos(min(1.0, alignment)))
    height, weight = direction.direction
    print(direction.name)
    print(f"  unit direction ({height:.4f}, {weight:.4f}), length {direction.length:.4f}")
    print(f"  variance along it {direction.variance:.4f}, eigenvalue {component.variance:.4f}")
    print(f"  angle to the eigen direction {angle:.4f} degrees")
print(f"worst orthogonality {learned.directions.worst_orthogonality:.6f}")`,
              `epochs run 91, converged True
component_1
  unit direction (0.7071, 0.7071), length 1.0000
  variance along it 133.3333, eigenvalue 133.3333
  angle to the eigen direction 0.0000 degrees
component_2
  unit direction (0.7071, -0.7071), length 1.0000
  variance along it 33.3333, eigenvalue 33.3333
  angle to the eigen direction 0.0024 degrees
worst orthogonality 0.000043`,
              { hints: ["The rate is a schedule object handed to learning_rate at construction, beside n_components, max_epochs and random_seed. The people go to fit.", "The fitted model has epochs_run and converged, and its directions can be looped over. Each one carries name, direction, length and variance, where direction is the unit vector and length is what the walk left the weights at.", "The eigensolver’s answer is solved.components, whose entries carry direction and variance in the same order, so zip pairs each learned direction with its twin.", "The rule may land on either sign of a direction, so take the absolute value of the dot product before the arccosine, and cap it at one, since rounding can leave it a last bit over."], check: numberCheck("On which epoch did the walk stop itself?", 91, 0, "The budget was two hundred and the walk stopped at epoch 91, because no weight moved more than a millionth in a whole pass, which is 364 presentations of one of four people. By then both lengths are one to four decimals without anything having divided by a norm, and the directions sit 0.0000 and 0.0024 degrees from the eigensolver’s.") },
            ),
            exercise(
              "Score a fifth person by both routes",
              ["Part 6 scores the four people the rule was fitted on. Hand both fitted models somebody neither has seen, 185 cm and 60 kg, with the weight column given before the height column, and print the coordinates each model answers.", "The mean is (170, 68), so this person’s deviation is (15, −8). Work out what the score along (0.7071, 0.7071) ought to be before running anything, and then compare the two routes on the second direction, where the lesson says the signs are free to differ."],
              `from oop_ml import (
    ExponentialDecaySchedule,
    Feature,
    HebbianPrincipalComponents,
    PrincipalComponentAnalysis,
)

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]
rate = ExponentialDecaySchedule(start=0.0025, end=0.000025)
learned = HebbianPrincipalComponents(
    n_components=2, learning_rate=rate, max_epochs=200, random_seed=11
).fit(people)
solved = PrincipalComponentAnalysis().fit(people)

newcomer = [Feature("weight", [60]), Feature("height", [185])]
# Transform the newcomer with each fitted model and print the name and the
# value of every column that comes back, to four places.`,
              `from oop_ml import (
    ExponentialDecaySchedule,
    Feature,
    HebbianPrincipalComponents,
    PrincipalComponentAnalysis,
)

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]
rate = ExponentialDecaySchedule(start=0.0025, end=0.000025)
learned = HebbianPrincipalComponents(
    n_components=2, learning_rate=rate, max_epochs=200, random_seed=11
).fit(people)
solved = PrincipalComponentAnalysis().fit(people)

newcomer = [Feature("weight", [60]), Feature("height", [185])]
for route, model in (("by the rule", learned), ("by the eigensolver", solved)):
    print(route)
    for column in model.transform(newcomer):
        print(f"  {column.name} {float(column.values[0]):.4f}")`,
              `by the rule
  component_1 4.9497
  component_2 16.2637
by the eigensolver
  component_1 4.9497
  component_2 -16.2635`,
              { hints: ["transform takes features the way fit did and answers a list of features, one per direction, named component_1 and component_2 by both models.", "Each returned column holds one value per person handed in, so a single newcomer is the value at position 0.", "The columns are matched to the fitted ones by name, which is why handing weight before height changes nothing. Both models centre with the means they stored at the fit."], check: numberCheck("What does the newcomer score on the first direction?", 4.9497, 0.0005, "The deviation is (15, −8) and the first direction is (0.7071, 0.7071), so the score is 7 over root two, 4.9497, by both routes. On the second direction the eigensolver answers −16.2635 and the rule 16.2637. The sign is conventional, and the two ten-thousandths are the 0.0024 degrees the learned second direction sits from its twin, read on a person seventeen units from the mean.") },
            ),
            exercise(
              "Take the default rate to centimetres, then standardise",
              ["Part 4 says the default rate of 0.05 suits data spread about one and overflows on the measured four in centimetres. Fit the four without naming a rate and print what the library does about it. Then make the repair the refusal itself suggests, standardising the two columns first, and fit again at the same default rate.", "numpy prints overflow warnings of its own while the first walk runs away, and the library’s refusal follows them. After the repair, read the two lengths. One of them is the report Part 5 describes."],
              `from oop_ml import Feature, HebbianPrincipalComponents, MLLibError, Standardizer

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]

# Try to fit two components with a seed of 11 and no learning rate given.
# Catch the library's own error and print the name of its class and its
# message.

# Then standardise the people with a Standardizer, fit the same model on the
# standardised features, and print the epochs run, whether it converged, and
# each direction's unit vector, length and share of the variance.`,
              `from oop_ml import Feature, HebbianPrincipalComponents, MLLibError, Standardizer

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]

try:
    HebbianPrincipalComponents(n_components=2, random_seed=11).fit(people)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)

standardised = Standardizer().fit(people).transform(people)
learned = HebbianPrincipalComponents(n_components=2, random_seed=11).fit(standardised)

print(f"epochs run {learned.epochs_run}, converged {learned.converged}")
shares = learned.directions.variance_shares
for direction, share in zip(learned.directions, shares):
    height, weight = direction.direction
    print(direction.name)
    print(f"  unit direction ({height:.4f}, {weight:.4f})")
    print(f"  length {direction.length:.4f}")
    print(f"  share {share:.4f}")`,
              `DivergenceError
the weights overflowed on epoch 3; the learning rate is too large for this data's scale, so lower it or standardize the features first
epochs run 200, converged False
component_1
  unit direction (0.7071, 0.7071)
  length 1.0000
  share 0.8000
component_2
  unit direction (0.7244, -0.6894)
  length 0.9936
  share 0.2004`,
              { hints: ["Leaving learning_rate out of the constructor is what selects the default. Every refusal the library makes derives from MLLibError, so catching that one catches this.", "Standardizer is fitted and then asked to transform, like any other transformer here, and what it answers is a list of features that can go straight to fit.", "learned.directions.variance_shares holds one share per direction, in the order the directions come out, so zip pairs them."], check: numberCheck("After standardising, what length does the second direction come back with?", 0.9936, 0.0005, "Standardised, the people are spread about one, so the default rate no longer overflows, and the first direction lands on the diagonal at length one with a share of 0.8, as it did in centimetres, since both columns had the same spread to begin with. The second comes back 0.9936 long after the full two hundred epochs without converging. It is chasing a fifth of the variance while the rate falls, so it is still a little short, and its share of 0.2004 is a little over for the reason Part 5 gives.") },
            ),
            exercise(
              "Hold the rate constant on the four and on the crowd",
              ["Part 4 tests the textbook claim that a constant rate can never settle, and finds it false on the measured four and true on the crowd. Set the starting rate from each cloud the way the lesson does, half over the squared longest deviation, and fit each cloud twice, once with the rate falling a hundredfold and once with it held where it starts.", "Read the epochs first, then the lengths. On the crowd neither walk stops itself, and the two schedules fail in different places, which Part 5 measured."],
              `from oop_ml import ConstantSchedule, ExponentialDecaySchedule, Feature, HebbianPrincipalComponents

CLOUDS = {
    "the measured four": ([180, 160, 175, 165], [78, 58, 63, 73]),
    "the crowd": (
        [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178],
        [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78],
    ),
}
for name, (heights, weights) in CLOUDS.items():
    people = [Feature("height", heights), Feature("weight", weights)]
    mean_height = sum(heights) / len(heights)
    mean_weight = sum(weights) / len(weights)
    longest_squared = max(
        (height - mean_height) ** 2 + (weight - mean_weight) ** 2
        for height, weight in zip(heights, weights)
    )
    start = 0.5 / longest_squared
    # Build two schedules from start, one falling a hundredfold and one held
    # constant. Fit two components under each for 200 epochs with a seed of
    # 11, and print the epochs run, whether the walk converged, and the two
    # lengths.`,
              `from oop_ml import ConstantSchedule, ExponentialDecaySchedule, Feature, HebbianPrincipalComponents

CLOUDS = {
    "the measured four": ([180, 160, 175, 165], [78, 58, 63, 73]),
    "the crowd": (
        [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178],
        [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78],
    ),
}
for name, (heights, weights) in CLOUDS.items():
    people = [Feature("height", heights), Feature("weight", weights)]
    mean_height = sum(heights) / len(heights)
    mean_weight = sum(weights) / len(weights)
    longest_squared = max(
        (height - mean_height) ** 2 + (weight - mean_weight) ** 2
        for height, weight in zip(heights, weights)
    )
    start = 0.5 / longest_squared
    schedules = {
        "falling": ExponentialDecaySchedule(start=start, end=start / 100),
        "constant": ConstantSchedule(value=start),
    }
    print(f"{name}, starting rate {start:.6f}")
    for label, schedule in schedules.items():
        learned = HebbianPrincipalComponents(
            n_components=2, learning_rate=schedule, max_epochs=200, random_seed=11
        ).fit(people)
        lengths = ", ".join(f"{length:.4f}" for length in learned.directions.lengths)
        print(f"  {label} rate, {learned.epochs_run} epochs, converged {learned.converged}")
        print(f"    lengths {lengths}")`,
              `the measured four, starting rate 0.002500
  falling rate, 91 epochs, converged True
    lengths 1.0000, 1.0000
  constant rate, 46 epochs, converged True
    lengths 1.0000, 1.0000
the crowd, starting rate 0.000249
  falling rate, 200 epochs, converged False
    lengths 1.0000, 0.4256
  constant rate, 200 epochs, converged False
    lengths 1.0000, 1.0026`,
              { hints: ["ExponentialDecaySchedule takes the rate it starts at and the rate it ends at, and ConstantSchedule takes the one value it holds.", "The schedule goes to learning_rate, exactly where a single number would have gone.", "learned.directions.lengths holds the length the walk left each weight vector at, first direction first."], check: numberCheck("On the measured four, at which epoch does the constant rate stop the walk?", 46, 0, "Every one of the four lies exactly on an eigen direction, so at the answer each person’s update is exactly zero and a constant rate has nothing to keep chasing. It stops at epoch 46 where the falling rate takes 91. Nobody in the crowd lies on an axis, so neither walk stops in two hundred epochs there. The falling rate leaves the second direction 0.4256 long, starved, and the constant rate brings it to 1.0026 while the first direction wobbles.") },
            ),
          ],
        },
      ]}
    />
  );
}
