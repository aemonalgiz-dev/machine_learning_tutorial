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
  title: "Hebbian Principal Components · Perceptron Lab",
  description:
    "Oja's rule adjusts a neuron's weights from successive inputs and outputs. A normalization-related correction limits unbounded growth, allowing the updates to seek a principal direction under suitable learning conditions.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HebbianPcaPage() {
  return (
    <ConceptPage
      lessonId="hebbian-pca"
      intuition={lessonIntuitions["hebbian-pca"]}
      technicalStart="Part 2. Oja’s Subtraction"
      openingTitle="Find a Principal Direction One Observation at a Time"
      playgroundTitle="Learn a direction from one observation at a time"
      playgroundIntro="Watch both the weight direction and its length. Compare the learned direction with the PCA reference rather than judging progress by the output alone."
      title="Hebbian Principal Components"
      tagline={"Oja's rule adjusts a neuron's weights from successive inputs and outputs. A normalization-related correction limits unbounded growth, allowing the updates to seek a principal direction under suitable learning conditions."}
      prerequisites={<>The <Link href="/concepts/pca" className={link}>PCA page</Link> explains centering, projections and principal directions. We reuse its four observations to compare an iterative learning rule with an eigensolver. The <Link href="/primers/linear-algebra" className={link}>linear algebra primer</Link> explains the dot product used by the unit. The update uses activity available at a connection, similar to the local learning idea introduced with <Link href="/concepts/hopfield-network" className={link}>Hopfield memory</Link>; it does not backpropagate an error from a supplied target.</>}

      playground={<HebbianPlayground />}
      sections={[
        {
          title: "Part 1. One Neuron Reading One Person",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A neuron with two weights">
                <p>
                  In the PCA lesson, we built a covariance matrix from the observations and used an eigensolver to find its principal directions. Could a unit approach a principal direction by seeing one observation at a time? Here it holds one weight for height and one for weight. Its response is their dot product with the incoming measurements. We will start with that response and examine how an update changes the weights.
                </p>
                <Equation>{"y = w · x = w_height × (height − mean height) + w_weight × (weight − mean weight)"}</Equation>
                <>
<p>
                  We measure the person relative to the average person, so the
                  unit responds to variation around the mean. Four height and weight pairs
                  have a mean of (170, 68). Start with the person at (180, 78)
                  and a unit whose weight vector points along height alone.
                </p>
                <Equation>{"Centered input = (180 − 170, 78 − 68) = (10, 10)\nWeight vector = (1, 0)\nOutput = (1 × 10) + (0 × 10) = 10"}</Equation>
                <p>
                  The output is one number, and it is exactly the score the PCA page computed along a direction, except that here the direction is not chosen by anyone. It is whatever the weights happen to be.
                </p>
</>
                <KeepInMind>
                  The weight vector supplies an orientation and a scale. At unit length, its dot product with a centered observation is the coordinate along that direction. At another length, the output is scaled too. We will watch both quantities as the update changes the vector.</KeepInMind>
              </SubSection>

              <SubSection title="2. Fire together, wire together">
                <p>Hebbian learning strengthens a connection according to activity at its input and output. In this linear unit, each weight change is the learning rate multiplied by the input value and the unit’s output. There is no supplied target answer. The update uses the activity available at that connection, which is why it is described as a local learning rule.</p>
                <Equation>{"w ← w + rate · y · x"}</Equation>
                <WorkedExample title="One step on the four height and weight measurements">
                  <>
                    <p>

                      Start with weights (1, 0) and learning rate 0.0025. Section 12
                      explains this choice of rate. The seeded walk presents person 4
                      first, with centered measurements (−5, 5). Compute the response,
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
                <p>The update is proportional to the input vector and the unit’s current output. Its component along the current weights cannot reduce their squared norm when the learning rate is positive. A zero output produces no update, while individual weight coordinates can increase or decrease. Section 4 measures the resulting growth in this example.</p>
                <KeepInMind>
                  Each coordinate changes by the learning rate times its input activity and the unit’s output. That change can be positive or negative. The problem is that the plain rule has no term controlling the overall vector norm, which can keep growing.</KeepInMind>
              </SubSection>

              <SubSection title="3. Center first" id="3-centre-first">
                <p>

                  The rule multiplies by the row, so whatever the row is measured
                  from is what the unit is pulled toward. Handed raw heights near 170
                  and raw weights near 68, every person is a long vector pointing
                  from the origin to roughly the same place, and the weights turn to
                  match that place rather than the shape of the cloud around it. The
                  PCA page centered for the same reason, and the fit here centers
                  itself, storing the two means so a new person can be read the same
                  way later.
                </p>
                <Equation>{"x = (height − 170, weight − 68)        on the four height and weight measurements"}</Equation>
                <p>
                  Section 25 runs the rule on the raw positions to show what it
                  learns instead, which on the four height and weight measurements is a direction a
                  twelfth of a degree from the line to the mean and twenty-three
                  degrees from the answer. For everything between here and there the
                  rows are deviations.
                </p>
                <KeepInMind>

                  Centering makes the averaged input products describe covariance around the mean. Without centering, they describe second moments around the origin, which also include the mean’s contribution. A large mean can then dominate the learned direction. The SDK stores the training means so later observations use the same reference.</KeepInMind>
              </SubSection>

              <SubSection title="4. What the plain rule does to the weights, measured">
                <>
<p>
                  Let the plain rule run and watch the length of the weight vector rather than its direction. On the four height and weight measurements, presented in the seeded order at the rate from section 12, one epoch takes the length from 1 to 1.064, then 1.326, then 1.779, then 1.825, and every step lengthened it. Hold the rate constant and the length after each of twenty epochs runs 1.83, 3.75, 8.18, 18.2, 40.8, 91.8, 206, 464, 1045, 2351 and on to 7.8 million by the twentieth.
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
                <p>At the constant rate, the plain weights point within 0.0006 degrees of the leading eigenvector after twenty epochs, but their norm has grown to about seven million. The orientation is useful in this run while the scale is not controlled. That is the problem Oja’s correction addresses.</p>
                <KeepInMind>
                  For a positive rate, the squared-norm change from plain Hebbian learning is nonnegative. It is zero when the output is zero and otherwise permits growth. Under suitable data and initialization conditions, the orientation can approach a leading principal direction even as the norm grows. The correction needs to retain that useful directional behavior while controlling scale.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Oja’s Subtraction",
          content: (
            <>
              <SubSection title="5. Subtract what the unit already explains">
                <p>Oja’s correction subtracts the output multiplied by the current weight vector from the input used in the update. When the weights have unit length, that subtraction removes the input component already represented along their direction. The remaining component can turn the weights. The same correction also limits the growth seen under the plain Hebbian rule.</p>
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
                <p>At unit weight length, the correction removes the component of the Hebbian update parallel to the weights. Away from unit length, it also acts to restore that length. A finite update can still change the length, so section 6 examines the exact squared-length calculation rather than treating this as perfect normalization.</p>
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
                <p>The quadratic term is nonnegative, and is positive when both the output and residual are nonzero. For a fixed input and weight state it scales with the square of the rate. Reducing the rate makes that finite-step effect smaller, but the linear term can also vanish, including at unit length. The displayed identity is more informative than assuming exact normalization on every update.</p>
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
                  of each of the first five epochs on the four height and weight measurements is 1.0372,
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

                  Oja’s update does not divide by the norm. Its average dynamics can stabilize a nonzero solution near unit length under suitable learning conditions, while finite updates can still overshoot or fluctuate. Watch the measured length alongside direction and update size.</KeepInMind>
              </SubSection>

              <SubSection title="7. Where the subtraction comes from">
                <p>We could instead take a Hebbian step and explicitly divide by its new length. Starting with unit weights and keeping only the first-order terms for a small learning rate gives the correction below. This connects Oja’s update with approximate normalization while explaining why a finite step can still leave a small length error.</p>
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
                <p>The correction approximates what explicit normalization would remove while retaining a local update. Each connection uses its input activity, the unit’s output and its own weight. We do not need to calculate a target projection using a previously known principal direction.</p>
                <KeepInMind>

                  Oja&rsquo;s rule is the first-order expansion of Hebb&rsquo;s rule
                  followed by normalization. The approximation is in the rate, so it
                  is a better approximation the smaller the rate is, which is one of
                  the reasons the rate is made to fall.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Where the unit comes to rest">
                <p>For fixed current weights and centered inputs, the expected input-output product is Cw, where C is the population-form covariance. The expected squared output is wᵀCw. That is the variance of the unit’s output; it equals variance along the direction only when the weights have unit length. These averages connect the local rule with PCA.</p>
                <Equation>{"average update = rate · (C w − (wᵀ C w) · w)"}</Equation>
                <p>For a nonzero stationary solution with positive output variance, the average update requires a unit-length eigenvector of C. An eigenvector is a direction that multiplication by C only stretches. There are also unhelpful stationary cases, such as zero weights or a direction with zero variance. Stability of the positive-variance solutions favors the largest-eigenvalue eigenspace, as the local argument below shows.</p>
                <WhyThisWorks title="Why only the largest direction is stable">
                  <>
                    <p>Start at a unit eigenvector u with eigenvalue λ, and add a small component in a perpendicular eigenvector v with eigenvalue μ. The first-order change in that component is:</p>
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
                <p>For the four observations, the population-form covariance is [62.5, 37.5; 37.5, 62.5]. Its principal axes follow (1, 1) and (1, −1), and this run approaches the first. The sample-covariance convention used to report variances later multiplies this matrix by a common factor, changing its eigenvalues but not its directions. The iterative update itself does not construct either matrix.</p>
                <KeepInMind>
                  The expected update has unit eigenvectors as positive-variance stationary solutions, with stability favoring the leading eigenspace under the stated analysis. Reaching one in a finite stochastic run also depends on initialization and step sizes. The method can seek that direction without constructing the covariance matrix.</KeepInMind>
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
              "In this constant-rate experiment, plain Hebbian updates bring the direction close to the leading eigenvector while the weight length grows enormously. Its update has a nonnegative component along the current weights. That explains the observed growth, but it does not guarantee convergence to the leading direction for every initialization, dataset or rate. Oja’s correction addresses the length growth.",
            ),
            choice(
              "What does Oja’s subtraction take out of the update?",
              [
                "The part lying along the weights themselves, which was doing the lengthening, leaving the part across them, which turns",
                "The part across the weights, which was making the direction wander",
                "The dependence of the rate on the scale the people are measured in",
                "The need to center the rows before reading them",
              ],
              0,
              "At unit weight length, Oja’s subtraction removes the radial component of the plain Hebbian update to first order in the learning rate. The remaining first-order change turns the direction. A finite step can still change the length, and away from unit length the correction also acts to restore that length. The displayed one-step comparison separates these effects.",
            ),
            choice(
              "Does the rule normalize the weights?",
              [
                "No, nothing ever divides by the norm, and the length arriving at one is the evidence the rule worked",
                "Yes, every step divides by the new length",
                "Yes, but only once at the end of each epoch",
                "No, and the length never comes near one",
              ],
              0,
              "The subtracted term is the first-order expansion of exactly what dividing would have removed, so the approximation is in the rate and is better the smaller the rate is. At a constant rate the length at the end of each of the first five epochs on the four height and weight measurements is 1.0372, 1.0084, 1.0009, 1.0001 and 1.0000.",
            ),
            several(
              "The change in squared length after one step has two terms. Which of these hold?",
              [
                "For nonzero output y, the first term is positive below unit length and negative above it",
                "The second term is nonnegative, so a step can still leave the length a little over one",
                "On the step from a squared length of 1.0640 the pull toward one is the larger of the two, so the length falls",
                "The whole expression is an approximation, good only for a small rate"
              ],
              [0, 1],
              "Expanding the squared length gives an exact identity. On this step the positive squared-update term is larger than the negative first term, so the squared length rises. The second term is nonnegative, including zero when the update is zero. At sufficiently small rates it is of second order in η, while the first term is of first order.",
              {
                "description": "Oja update: Δw = η y (x − y w), with y = w · x and η > 0.\n\nExact identity:\n||w + Δw||² − ||w||² = 2ηy²(1 − ||w||²) + η²y²||x − y w||²\n\nOn the reported step:\nold squared length ≈ 1.0640\nfirst term ≈ −0.0461\nsecond term ≈ +0.0587\nnew length ≈ 1.0376"
              },
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
              "For centered data, the average rule uses the covariance matrix. A unit eigenvector makes that average update zero because the matrix stretches it without turning it. When the leading eigenvalue is distinct, its direction is the stable leading-component target under the usual small-step analysis. Tied leading eigenvalues instead permit a whole subspace of equivalent directions.",
            ),
        ],
        },
        {
          title: "Part 3. Turning Toward the Direction of Greatest Spread",
          content: (
            <>
              <SubSection title="9. One person at a time, four steps by hand">
                <p>
                  Step through one epoch on the four height and weight measurements from the weights
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
                <p>An observation’s influence depends on the current output and on the part of the observation that lies across the weight direction. Different observations can therefore turn the weights different ways. The principal direction emerges from their accumulated effects, rather than from every individual step pointing toward it.</p>
</>
                <Equation>{"turn from one person  =  rate · y · (the part of x across w)"}</Equation>
                <p>At a fixed weight state, scaling an observation by a factor scales this update by the factor’s square. In the four-observation example, the first-axis observations have lengths ten root two and the second-axis observations five root two. Their covariance contributions therefore differ by a factor of four. The actual turn from any presentation also depends on the current orientation and output; it is not always four times the turn from another observation.</p>
                <KeepInMind>
                  Individual observations can turn the weights away from the leading direction, or produce no turn at all. The expected update explains the longer-run preference under suitable sampling. Step sizes control how strongly individual updates affect that trajectory; they do not guarantee that each observation respects the final direction.</KeepInMind>
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
                  Whether the seed changes the answer is a measurement, and on the four height and weight measurements it does not. Five seeds start the unit in five
                  different directions and every one of them lands within a ten
                  thousandth of a degree of the diagonal, in between fourteen and
                  twenty-two epochs. The sign differs, since a direction and its
                  negative are the same direction and the rule lands on either.
                </p>
                <SweepTable people="four" section="seeds" />
                <KeepInMind>
                  The seed determines initialization and shuffled presentation order under a fixed setup. All tested seeds approach the same leading axis in the four-observation case, up to sign. A finite budget can produce more variation, and tied eigenvalues can make the preferred axis nonunique, as section 26 shows.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Learning Rate and How Many Presentations",
          content: (
            <>
              <SubSection title="12. The rate carries the square of the data’s units">
                <p>If every input coordinate is multiplied by ten, the Oja update at fixed weights grows by a factor of one hundred. Dividing the rate by that factor restores the same update. For this dataset, the default 0.05 overflows in the third epoch, so the endpoint chooses a starting rate from the maximum centered input norm instead. Rescaling only one feature also changes the covariance geometry, rather than only the rate scale.</p>
                <Equation>{"starting rate = 0.5 / (longest deviation)²        = 0.5 / 200 = 0.0025 on the four height and weight measurements"}</Equation>
                <>
<p>The factor 0.5 is the endpoint’s chosen damping constant. Dividing by the largest squared centered-input norm controls the initial update scale, but is not a global bound guaranteeing that every new norm stays at or below one. Section 6 already shows a finite step that overshoots. Changing a common positive rate does not change the averaged stationary equations, although it changes the finite trajectory and stability.</p>
                <p>Converting height alone to millimeters gives a starting rate of 0.0000495. The learned first direction remains within a hundredth of a degree of the eigensolver’s direction for those rescaled data. That reference is recomputed in the new units; the principal direction in the original coordinate geometry need not remain unchanged.</p>
</>
                <KeepInMind>

                  Choose the rate with the input scale in mind and test whether the weights stay finite. Standardizing features is one option when comparable scaled features suit the analysis. A rate copied from another dataset may be unstable, but standardizing also changes which variation PCA emphasizes.</KeepInMind>
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
                  On the four height and weight measurements the fit at four times the rate is refused on the fourth epoch; on the crowd four times the rate runs the full two hundred epochs and it is eight times that is refused, on the first.
                </p>
</>
                <SweepTable people="four" section="rates" />
                <KeepInMind>
                  The tested larger rates reach different outcomes: faster settling for one setting, sustained oscillation for another, and overflow at still larger values. A stable range depends on the input scale, initialization and schedule. Increasing the rate within a valid numerical range is not guaranteed to improve convergence.</KeepInMind>
              </SubSection>

              <SubSection title="14. How many presentations it takes">
                <p>
                  Vary the epoch budget instead, with the rate falling a hundredfold
                  across whatever budget is given. On the four height and weight measurements the first
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
<p>A constant learning rate generally leaves continuing fluctuations when individual observations still produce nonzero updates at the average solution. That is why decreasing rates matter in stochastic approximation. The four height-and-weight observations form a special case: a constant rate can settle here because of their exact arrangement. The next calculation explains that exception.</p>
                <p>Each of these four observations lies on a principal axis. At the unit leading direction, observations parallel to it have a zero residual bracket; orthogonal observations have zero output. The complete update is therefore zero for every observation, even though the bracket is not always zero. This special structure lets the constant-rate run settle at epoch 46, compared with 91 for the falling schedule.</p>
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
                  When individual observations keep producing nonzero updates at the averaged solution, a constant rate can sustain fluctuations. A decreasing schedule can reduce them, provided it still allows enough learning. The four-observation example has individually vanishing updates at its solution, so it behaves differently from the shown crowd.</KeepInMind>
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
              "Person 4 turned them from 45 degrees off to 48.6 degrees off, because a single person pulls the weights toward their own axis and that person lies on the second eigen direction. On the four height and weight measurements the two people on the first axis are ten root two from the mean against five root two, so that axis pulls four times as hard per person and the average wins over an epoch.",
            ),
            choice(
              "Why is the rate set from the cloud rather than fixed at a default?",
              [
                "The update carries the square of whatever unit the people are measured in, so a default of 0.05 overflows on the four height and weight measurements in centimeters",
                "A smaller cloud needs more epochs, and the rate stands in for the epoch count",
                "The rate has to be matched to the number of units",
                "Centering changes the scale of the rows, so the rate has to follow it",
              ],
              0,
              "The update size depends on the scale of the centered observations. Using the largest squared deviation to set the starting rate makes that choice respond to the dataset’s scale. The factor one half controls a first-order length correction; it is not a guarantee that a finite update cannot overshoot. Check weight lengths, directional agreement and convergence after fitting.",
            ),
            several(
              "Raising the rate on the four height and weight measurements, which of these were measured?",
              [
                              "At twice the rate, held constant, the walk settles in three epochs at a length of 0.9994",
                              "At three times it never settles, and the length bounces between 0.24 and 1.25 for all twenty epochs",
                              "At four times the fit is refused, on the fourth epoch",
                              "Where that line falls is a property of the rule rather than of the cloud",
                            ],
              [0, 1, 2],
              "Past a certain rate the square of the step outgrows the pull back toward one, so a kick meant to shrink the weights grows them instead. The line is a fact about the data’s spread, which is why the crowd runs the full two hundred epochs at four times the rate and is refused only at eight.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Four centred height/weight measurements; base rate 0.0025:\n2 × base, constant: settles in 3 epochs, length 0.9994\n3 × base, constant: no settling in 20 epochs; length 0.24 to 1.25\n4 × base, fit’s falling-rate schedule: refused at epoch 4\n\nOn the crowd dataset, 4 × its base rate completes 200 epochs.\nThe rate schedule and dataset must be compared along with the multiplier."
              },
            ),
            choice(
              "The textbook argument says a constant rate can never settle. What did measuring it show?",
              [
                "It holds on the crowd and not on the four height and weight measurements, where every person lies exactly on an eigen direction",
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
              "A fixed observation order can create a repeating sequence of directional pulls. Reshuffling reduces dependence on that particular ordering while still visiting every observation in an epoch. A seeded generator makes the starting weights and subsequent permutations reproducible. Reproducibility describes one run; comparing seeds checks how sensitive its outcome is to those choices.",
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
                  first unit solved. On the four height and weight measurements the two units are 76
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
                  Independent Oja units optimize the same leading-variance problem without accounting for what other units represent. They can therefore approach the same axis instead of providing distinct components. Tied leading eigenvalues or incomplete learning can produce other outcomes; an explicit multi-component rule is needed to encourage separation.</KeepInMind>
              </SubSection>

              <SubSection title="17. Sanger’s rule">
                <p>To learn another direction, Sanger’s rule subtracts the reconstructions from the earlier units before updating the next one. It also subtracts the current unit’s own reconstruction, retaining Oja’s growth control. Later units are therefore directed toward variation that the earlier units have not already represented.</p>
                <Equation>{"w₂ ← w₂ + rate · y₂ · (x − y₁ · w₁ − y₂ · w₂)"}</Equation>
                <p>

                  The sum running up to and including the unit&rsquo;s own term is
                  the whole of it. Drop that term and the second unit loses its
                  normalization; drop the earlier terms and it loses its reason to
                  differ from the first. The part of the second unit along the first
                  direction is driven toward zero, which is what perpendicular
                  means, and its own subtraction keeps its length near one. On the four height and weight measurements the two units are 83 degrees apart after one epoch,
                  76.5 after twenty, and 89.998 after the full walk of 91 epochs.
                </p>
                <HebbianStepper people="four" rule="sanger" nComponents={2} maxEpochs={3} />
                <KeepInMind>
                  Deflation subtracts contributions already represented by earlier units. Under suitable convergence conditions, Sanger’s rule can recover principal directions in variance order. Later-unit updates need earlier units’ outputs and weights as well as their own activity, so this is a broader dependency than an isolated connection’s own two endpoints.</KeepInMind>
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
                <p>The falling learning rate leaves the second unit with updates too small to approach its direction closely. Holding the rate constant brings that unit to 0.07 degrees of the reference direction with length 1.003, while the first direction fluctuates as section 15 shows. Multiplying the falling schedule by four instead reaches 0.14 degrees with length 0.995.</p>
                <p>The reported vector length helps diagnose incomplete convergence. A second unit whose length remains well below one has not reached the same state as a nearly unit-length solution, even when both have a readable direction.</p>
                <SweepTable people="crowd" section="constant" />
                <KeepInMind>
                  Small-variance directions can require more effective updates than a leading direction. In these examples, a short learned vector and a directional error show that the finite schedule has not reached the desired component. Extra epochs or a different rate can help, but a component with no positive variance is a separate case discussed later.</KeepInMind>
              </SubSection>

              <SubSection title="19. Orthogonality and the shares are measurements">
                <>
<p>An eigensolver produces orthonormal directions to numerical tolerance. For a complete basis, their projected variances sum to the total variance up to numerical error. Finite iterative directions need not yet be orthogonal. The worst absolute dot product between normalized learned directions is 0.000043 in the four-observation run and 0.14 in the crowd run, where the second component remains incomplete.</p>
                <p>
                  The variances along the two learned directions add to 166.66666685 against a total of 166.66666667, a little over. After one epoch, with the directions 0.12 from perpendicular, they add to 176.3. These are measurements of this fit. Non-orthogonal directions can overcount some parts of the spread and miss others, so their sum can fall above or below the total. In two dimensions, two perpendicular unit directions form a complete basis and their variances add to the total.
                </p>
</>
                <Equation>{"in 2D, for perpendicular unit directions:\nvariance along w₁ + variance along w₂ = total variance\n\nfor non-orthogonal directions, the sum can be above or below the total"}</Equation>
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
                  The claim of the page is one number, the angle between the direction a unit learned and the direction an eigensolver computed, taken modulo a half turn because the rule lands on either sign. On the four height and weight measurements after the full walk it is 0.0000012 degrees for the first direction and 0.0024 for the second.
                </p>
                <p>
                  On the crowd it is 0.0031 for the first and 8.2 for the second, for the reason section 18 gave, and on the ideal case 0.001 for the first. The playground at the top of the page draws both directions over any cloud you build, and its angle readouts are these numbers.
                </p>
</>
                <KeepInMind>
                  The well-converged four-observation run agrees extremely closely with its eigenvector reference. The crowd’s incomplete second component has length below one and an angle several degrees away. A stopping flag alone is not a general guarantee of millionth-degree agreement; inspect both diagnostics and any eigenvalue ties.</KeepInMind>
              </SubSection>

              <SubSection title="21. The variance recovered">
                <p>
                  The variance along each learned unit direction is measured from
                  the people, by projecting them onto it and taking the sample
                  variance, which is the same quantity an eigenvalue reports. On the four height and weight measurements the two come back 133.3333333 and 33.3333335 against
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
                <p>The fitted transform centers inputs with the stored means and projects onto normalized learned directions. Its output format resembles PCA, but the columns may differ in sign or alignment. For the four observations, person 1 has first-component score 14.1421 by both routes. Person 3 has second-component magnitude 7.0711, with opposite signs in the table. Cross-component terms are small rather than exact zeros. Align signs and components before comparing coordinates or replacing a representation used by another fitted model.</p>
                <NumberTable
                  headings={["person", "first, by the rule", "first, eigen", "second, by the rule", "second, eigen"]}
                  rows={[
                    ["1, at (10, 10)", "14.1421", "14.1421", "0.0006", "0.0000"],
                    ["2, at (−10, −10)", "−14.1421", "−14.1421", "−0.0006", "0.0000"],
                    ["3, at (5, −5)", "−0.0000", "0.0000", "7.0711", "−7.0711"],
                    ["4, at (−5, 5)", "0.0000", "0.0000", "−7.0711", "7.0711"],
                  ]}
                  caption="Scores on the four height and weight measurements after the full walk. The eigensolver's second direction carries the opposite sign, which section 10 of the PCA page says is conventional."
                />
                <p>
                  On the crowd the first scores agree to two thousandths for every
                  person and the second do not, because the second direction is
                  eight degrees off. Person 5 scores 2.98 on it by the rule and 1.19
                  by the eigensolver, which is what an eight-degree error looks like
                  on a person thirteen units from the mean.
                </p>
                <KeepInMind>
                  Aligned matching directions give matching projection coordinates. An angular error changes each observation’s score according to its position; the error is not one common angle added to every coordinate. This SDK does not offer an inverse transform. A transpose gives the usual orthogonal reconstruction only for orthonormal directions; other reconstruction rules could be defined but are not implemented here.</KeepInMind>
              </SubSection>

              <SubSection title="23. What the local route buys, and what it costs">
                <p>For p features and k learned directions, the iterative weights use k times p entries rather than a p-by-p covariance matrix. At ten thousand features and ten directions, that matrix has a thousand times as many entries as the weights. The local rule itself can process successive centered observations.</p>
<p>The current SDK fit is still an in-memory procedure: it builds the feature set, computes training means and replays centered rows. A streaming application would also need a centering convention and persistent update state. Avoid assuming this fit already exposes incremental training on an unbounded source.</p>
                <p>For this in-memory example, the eigensolver is much faster. The recorded iterative fit takes 28 milliseconds, compared with 0.38 for the eigensolver, a reported ratio of about 76. Its two hundred epochs over the eleven observations expose each unit to 2,200 observation updates through the Python loop.</p>
                <p>Finite iteration also leaves a directional error. That error is millionths of a degree for the four-person example but about eight degrees for the second direction of the larger group. The update method’s ability to process observations incrementally is useful, but these measurements give no speed or accuracy advantage when the full matrix fits in memory.</p>
                <KeepInMind>
                  The update rule avoids building a feature covariance matrix and provides an incremental calculation. Those are useful properties at larger feature counts or with an appropriate streaming implementation. In this small in-memory benchmark, the eigensolver is much faster and gives the reference directions directly.</KeepInMind>
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
                <p>For the four observations, that failure occurs at four times the endpoint’s selected rate. Reducing the rate can preserve the current coordinate geometry. Standardizing the features is another option when equalized scales suit the analysis, but it changes the PCA problem as well as the numerical step scale. Choose based on what variation should count.</p>
                <KeepInMind>
                  A diverged walk is refused by name. Nothing about the answer is
                  reported from a fit whose weights stopped being finite.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Uncentered data learns where the cloud is" id="25-uncentred-data-learns-where-the-cloud-is">
                <>
<p>
                  Run the rule on the raw positions rather than the deviations and it still settles at length one, on a direction that is wrong. On the four height and weight measurements the weights come to rest 0.08 degrees from the line joining the origin to the mean at (170, 68) and 23.1 degrees from the eigen direction, which is the angle between those two lines.
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
                  origin, as it is for heights in centimeters. The unit did what the
                  rule says on the rows it was given, and those rows carried the
                  origin&rsquo;s position as well as the people&rsquo;s shape.
                </p>
                <KeepInMind>

                  Without centering, the expected rule uses the second-moment matrix. In these height-and-weight examples its leading direction lies close to the line toward the mean. That is not a universal identity with the mean direction. The fitted centered method stores means so later inputs use the same reference.</KeepInMind>
              </SubSection>

              <SubSection title="26. Equal eigenvalues, where no direction is the answer">
                <>
<p>
                  Put eight people evenly round a circle about the mean and the two eigenvalues tie, at half the variance each. The eigensolver still answers, with the height axis and the weight axis, and that answer is an arbitrary choice, since every direction through a circle carries the same spread. The rule answers too. It settles at length 1.0005 on a direction 80 degrees from the eigensolver&rsquo;s, with a share of exactly a half, and five seeds send it 21, 9, 57 and 39 degrees from where the page&rsquo;s own seed sent it.
                </p>
                <p>Equal leading eigenvalues leave a whole set of equally good principal directions. A different learned angle within that set is not automatically an error. The implementation uses its pass budget rather than an angle comparison to a uniquely defined direction that does not exist in this case.</p>
</>
                <SeedDirections left="four" right="circle" />
                <KeepInMind>
                  Tied eigenvalues leave individual axes within the tied eigenspace unidentified. A learned axis can still be a valid principal direction and capture the correct variance share. Compare the represented subspace and shares instead of treating disagreement with an eigensolver’s arbitrary basis as a failure.</KeepInMind>
              </SubSection>

              <SubSection title="27. A direction with no variance cannot be found">
                <p>With constant height and varying body weight, the first principal direction is along body weight, (0, 1), matching the reference. No remaining positive variance identifies a second informative component. In the shown run, the second vector ends with length 0.24 and lies 22 degrees from the height axis used by the eigensolver for its zero eigenvalue. That residual direction describes the finite update state, rather than recovered variation in the data.</p>
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
              "Two independent Oja units see the same centered data, which has a unique largest-variance direction. There is no term making them avoid one another. What should we expect if both converge to the leading direction?",
              [
                "They find the same direction, possibly with opposite signs, because neither accounts for what the other has found",
                "They settle perpendicular to one another",
                "The second decays to no length at all",
                "They split the largest eigenvalue between them"
              ],
              0,
              "Each unit independently maximizes variance along one direction. With a unique leading direction they have the same target. Sanger’s extension subtracts what earlier units already represent, giving a later unit a reason to learn a different component.",
            ),
            trueFalse(
              "Two learned directions that overlap slightly count the overlap twice, so their variances can add to a little more than the total.",
              true,
              "Adding projected variances represents a nonoverlapping decomposition only when the directions are orthonormal. If learned directions overlap, the sum can exceed the total variance because some variation is included more than once. The reported excess therefore warns that the iterative directions are not yet an exact PCA basis. Check their inner products before interpreting normalized shares as an additive variance breakdown.",
            ),
            several(
              "On the four height and weight measurements after the full walk, which of these does the page report?",
              [
                "The first learned direction is 0.0000012 degrees from the eigensolver’s and the second 0.0024",
                "The variances along the two learned directions come back 133.3333333 and 33.3333335 against eigenvalues of 133.3333 and 33.3333",
                "Person 1 scores 14.1421 on the first direction whether the rule or the eigensolver produced it",
                "Transposing the learned directions is guaranteed to give an exact inverse transform, as for a complete orthonormal PCA basis"
              ],
              [0, 1, 2],
              "The measured directions and variances agree closely with the eigensolver, but close agreement is not exact orthonormality. A transpose can produce an approximate reconstruction; it is an exact inverse for a complete orthonormal basis. This local-rule API does not offer that guarantee or an inverse-transform method.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Four centred measurements after the full local-rule walk:\nangle to eigensolver, components 1/2: 0.0000012° / 0.0024°\nvariances along learned unit directions: 133.3333333 / 33.3333335\neigensolver variances: 133.3333 / 33.3333\nperson 1, first coordinate by either route: 14.1421\nlargest dot product between learned unit directions: 0.000043\n\nThe SDK exposes no inverse_transform for this local-rule fit."
              },
            ),
            choice(
              "Run the rule on the raw positions rather than the deviations, with the rate set from the longest position. What does it learn on the four height and weight measurements?",
              [
                "A direction 0.08 degrees from the line joining the origin to the mean, and 23.1 degrees from the eigen direction",
                "Nothing, since the weights overflow before the first epoch ends",
                "The eigen direction, a little more slowly than on the deviations",
                "A direction whose length stays well under one, which reports the failure",
              ],
              0,
              "Without centering, the average rule follows the second-moment matrix, which includes the mean’s contribution as well as variation around it. When the mean is far from the origin, that contribution can dominate the leading direction. A weight length near one does not verify that centering was done. Use the stored training mean when the goal is principal variation around that mean.",
            ),
            several(
              "Eight observations are evenly spaced around a circle centered at the origin. Both covariance eigenvalues are equal. Which statements follow?",
              [
                "Every unit direction in the plane captures half the total variance",
                "Separate fits can return different directions without disagreeing about the captured variance",
                "Equal eigenvalues alone guarantee that a particular iterative learning rule never meets its stopping tolerance",
                "An eigensolver may return the coordinate axes, but those axes are one valid choice among many"
              ],
              [0,1,3],
              "The circle has the same spread along every direction through its center. A complete perpendicular pair can therefore be rotated without changing the explained variances. An iterative rule’s stopping behavior also depends on its update order, rate and stopping test; equal eigenvalues alone do not determine whether it stops.",
            ),
        ],
        },
        {
          title: "Part 8. Controlling the Online Direction Updates" , id: "part-8-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="28. What a Hebbian fit must specify and refuse">
                <p>To replay the learning process, save the training means, requested direction count, initial-weight draw and shuffle order. Record the learning-rate schedule and the count against which it decays, along with the epoch cap and movement tolerance used to stop.</p>
                <p>The learned weights are not normalized during training. Variance is instead measured along each unit direction, so distinguish the direction from the length of its learned weight vector. Check which properties the fit enforces and which it merely reports: length, orthogonality and ordering are separate questions. This learner provides no inverse transform.</p>
                <DerivationTable
                  expressionHeading="Observations or learning setting"
                  reasonHeading="Effect on the learned directions"
                  rows={[
                    { expression: "no features, or a non-finite value", reason: "refused at the boundary every feature passes through; the endpoint refuses a non-finite coordinate before any fit begins." },
                    { expression: "one person", reason: "refused by name, since one row has no spread to find a direction in; the endpoint refuses fewer than two a layer earlier." },
                    { expression: "two people", reason: "accepted for two distinct observations; their centered variation lies along one line and the second eigenvalue is zero." },
                    { expression: "every person on one spot", reason: "refused by name, since every share would divide by zero; the endpoint's eigensolver refuses the same cloud first." },
                    { expression: "one feature", reason: "accepted, with one direction carrying a share of one." },
                    { expression: "a constant column beside a varying one", reason: "accepted; the first direction is the varying column exactly and the second unit shrinks to 0.24 rather than pointing anywhere." },
                    { expression: "more directions asked for than features", reason: "refused at the fit, since a direction beyond the last has nothing left to see." },
                    { expression: "a rate too large for the data's scale", reason: "refused on the epoch a weight overflows, naming the epoch; four times the endpoint's rate on the four, and the default rate of 0.05 on centimeters." },
                    { expression: "a rate that never falls", reason: "accepted; the four-observation run settles, while the displayed crowd run continues fluctuating throughout its two-hundred-epoch budget." },
                    { expression: "reading directions or transforming before fitting", reason: "refused by name, as not fitted rather than as an attribute error." },
                    { expression: "new people with reordered columns", reason: "matched by name and accepted; a column missing or unknown is refused." },
                    { expression: "directions not perpendicular, not unit length, or not in order of variance", reason: "accepted and reported, as the worst orthogonality, the lengths and an ordering flag, since refusing them would refuse a correct fit stopped early." },
                    { expression: "a learned vector of length under a trillionth", reason: "refused by the implementation’s numerical cutoff. A nonzero vector has a mathematical direction, but normalizing a tiny learned vector can be an unreliable representation of this fit." },
                    { expression: "two eigenvalues tied", reason: "accepted; the directions inside the tie are arbitrary by both routes, and different seeds return different ones." },
                    { expression: "inverse transform, or saving the fit", reason: "neither is offered by this API. The usual transpose-based PCA reconstruction assumes orthonormal directions; a more general reconstruction or serialization interface would need its own implementation." },
                  ]}
                />
                <p>The table distinguishes supported configurations from convergence guarantees. A constant rate is allowed, even when it leaves fluctuations at the end of the budget. A learned component can also be returned before it reaches unit length or the reference direction. Read the length, angle and stopping information to decide whether that result is sufficient, rather than treating acceptance as proof of a completed PCA fit.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Learning the Directions With the Library",
          practice: [
            exercise(
              "Learn the four and hold them against the eigensolver",
              [
  "Fit the supplied four height/weight observations using the stated decaying rate, seed and stopping settings. Fit the PCA eigensolver on the same features.",
  "Print passes/convergence and, per direction, its unit coordinates, stored weight length, directional variance, eigenvalue and sign-insensitive angle. Finish with the largest orthogonality residual."
],
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
              { hints: [
  "Match components by order, but allow the two methods to choose opposite signs.",
  "Use absolute dot product of unit directions for the angle and clip it into the valid arccos range."
], check: numberCheck("On which epoch did the walk stop itself?", 91, 0, "This scheduled run meets its stopping rule at epoch ninety-one. Its direction angles, lengths and orthogonality residual are separate checks of what was learned."), question: "Do the learned directions agree with a covariance eigensolver?" },
            ),
            exercise(
              "Score a fifth person by both routes",
              [
  "Transform the supplied new person, height 185 cm and weight 60 kg, with both fitted models. Supply the named weight feature before height as in the starter.",
  "Print the two component scores from each model. Use stored training means and named feature matching; do not refit on this one person."
],
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
              { hints: [
  "Transform returns named component features with one value for the newcomer.",
  "Opposite component signs describe the same direction with reversed orientation, so compare that possibility before diagnosing an error."
], check: numberCheck("What does the newcomer score on the first direction?", 4.9497, 0.0005, "The first score is 4.9497 using the stored training center. Named feature matching preserves the input meaning even when the supplied column order changes."), question: "Can both fitted models score a new person despite a changed input-column order?" },
            ),
            exercise(
              "Take the default rate to centimetres, then standardise",
              [
  "Fit the supplied raw height/weight columns using the learner’s default rate and catch its divergence error. Then fit a Standardizer on those columns and retry on its transformed features at the same default rate.",
  "Print the refusal class/message, then retry pass count, convergence flag and each learned direction’s unit coordinates, length and variance share. A finite retry is not automatically a converged one."
],
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
              { hints: [
  "Use MLLibError to catch the learner’s reported divergence, while allowing NumPy’s own warning to remain distinguishable.",
  "Read the weight length separately from the normalized direction. Inspect convergence and orthogonality before interpreting variance shares."
], check: numberCheck("After standardizing, what length does the second direction come back with?", 0.9936, 0.0005, "The second stored weight length is 0.9936. Standardization prevents the earlier overflow, but the run still reaches its epoch ceiling without reporting convergence."), question: "What happens when a learning rate is too large for the measurement scale?" },
            ),
            exercise(
              "Hold the rate constant on the four and on the crowd",
              [
  "For both supplied datasets derive the initial rate from the stated longest centered deviation. Fit each with a rate falling a hundredfold and with a constant rate at that initial value.",
  "Print starting rate, epochs, convergence flag and learned direction lengths for every run. Keep each dataset’s centering and maximum-epoch setting fixed across its two schedules."
],
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
              { hints: [
  "Pass the appropriate ExponentialDecaySchedule or ConstantSchedule to learning_rate.",
  "Inspect both stopping status and direction lengths. Results on four observations do not establish convergence for the larger crowd."
], check: numberCheck("On the four height and weight measurements, at which epoch does the constant rate stop the walk?", 46, 0, "The four-observation constant-rate run stops at epoch forty-six. That example does not establish the same behavior on the larger crowd or every learning rate."), question: "Does one successful constant-rate run establish that a schedule always converges?" },
            ),
          ],
        },
      ]}
    />
  );
}
