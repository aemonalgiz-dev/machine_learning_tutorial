import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
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
    "Reach the principal components without a matrix or a solver, by a single unit that reads one person at a time and obeys fire together, wire together, with one correction to keep its weights from growing without bound.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HebbianPcaPage() {
  return (
    <ConceptPage
      title="Hebbian Principal Components"
      tagline="A unit obeying a local rule, one person at a time, turns toward the very direction an eigensolver finds."
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
      history={
        <>
          <p>
            Donald Hebb, at McGill in 1949, was trying to explain in{" "}
            <em>The Organization of Behavior</em> how a brain with no teacher could
            come to hold anything it had learned, and his proposal was physiological
            rather than arithmetical. When one cell repeatedly takes part in firing
            another, he suggested, some growth process makes it more effective at
            doing so, and that was the whole of it. The slogan that cells which fire
            together wire together came decades later and is not his wording. The
            difficulty appears the moment the proposal is written as a number. A
            connection that strengthens whenever both ends are active only ever
            strengthens, a stronger connection makes the second cell fire harder,
            and nothing in the sentence pushes the other way, so a Hebbian weight on
            any data at all grows without bound. A physiologist can suppose that
            real synapses saturate. Anyone who wanted the rule to compute something
            needed a version that stayed bounded, and needed to know what the
            bounded version computed.
          </p>
          <p>
            Erkki Oja answered both questions in Helsinki in 1982, in a paper
            called &ldquo;A simplified neuron model as a principal component
            analyzer&rdquo;. He asked what the smallest change to Hebb&rsquo;s rule
            would be that held the weight vector at unit length, found that it was a
            single subtracted term, and then proved what a neuron obeying the
            corrected rule converges to, which is the first principal component of
            its inputs, the direction Karl Pearson and Harold Hotelling had reached
            through the covariance matrix and that the PCA page turns a bar through
            the crowd to find. The convergence proof uses the stochastic approximation theory
            Herbert Robbins and Sutton Monro had begun in 1951, and that is where
            the condition that the rate must fall comes from, a condition this page
            measures holding on one cloud and failing on another. Terence Sanger
            at MIT extended the rule in 1989 to a row of such neurons, each handed
            only what the ones before it had left unexplained, so that they learn
            every component in order of variance, and he coded images with the
            arrangement to show it worked. His name for it, the generalised Hebbian
            algorithm, is the one the method still carries.
          </p>
          <p>
            The page asks six questions in order. What does one neuron obeying
            Hebb&rsquo;s rule learn from one person? Why does the plain rule run
            away, and what does Oja&rsquo;s one subtraction do to the length of the
            weights? How does the weight vector turn toward the direction of
            greatest spread when it only ever sees one person at a time? How large
            a rate and how many presentations does that take? How is a second
            direction found, and how closely does the whole thing agree with the
            eigensolver&rsquo;s answer? And where does it fail?
          </p>
        </>
      }
      playground={<HebbianPlayground />}
      sections={[
        {
          title: "Part 1. One Neuron Reading One Person",
          defaultOpen: true,
          content: (
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
                <p>
                  The person is read as a deviation from the mean, for the reason
                  the PCA page gave when it centred its cloud and for a second reason
                  this page measures in section 25. On the measured four the mean is
                  (170, 68), so the first person, at (180, 78), is read as (10, 10),
                  and a unit whose weights are (1, 0), pointing along height alone,
                  fires y = 10 on them. The output is one number, and it is exactly
                  the score the PCA page computed along a direction, except that here
                  the direction is not chosen by anyone. It is whatever the weights
                  happen to be.
                </p>
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
                  <p>
                    Start the weights at (1, 0) and take the rate the endpoint sets
                    from the cloud, 0.0025, which section 12 explains. The seeded walk
                    happens to present person 4 first, whose deviation is (−5, 5).
                    The unit fires y = 1 × (−5) + 0 × 5 = −5, and the update is
                    0.0025 × (−5) × (−5, 5) = (0.0625, −0.0625), so the weights land
                    at (1.0625, −0.0625), of length 1.064, three degrees further from
                    the diagonal than they started.
                  </p>
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
                <p>
                  Let the plain rule run and watch the length of the weight vector
                  rather than its direction. On the measured four, presented in the
                  seeded order at the rate from section 12, one epoch takes the
                  length from 1 to 1.064, then 1.326, then 1.779, then 1.825, and
                  every step lengthened it. Hold the rate constant and the length
                  after each of twenty epochs runs 1.83, 3.75, 8.18, 18.2, 40.8,
                  91.8, 206, 464, 1045, 2351 and on to 7.8 million by the twentieth.
                  Let the rate fall a hundredfold across the twenty epochs as the fit
                  does and the growth slows to 42.0, though it never once reverses.
                </p>
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
                  forever, which is what the record in the library&rsquo;s own notes
                  calls exploding along a direction rather than converging to one.
                </p>
                <KeepInMind>
                  Every update from Hebb&rsquo;s rule has a part along the current
                  weights of rate times the output squared, which cannot be negative,
                  so the length only ever grows. The direction it grows along is the
                  right one, and that is the clue to the repair.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  <p>
                    Weights (1, 0), person 4 at (−5, 5), output y = −5 as before. The
                    bracket is (−5, 5) − (−5) × (1, 0) = (0, 5), which is the person
                    with the part along height removed, since the unit already
                    explained that part exactly. The update is 0.0025 × (−5) × (0, 5)
                    = (0, −0.0625), and the weights land at (1, −0.0625), of length
                    1.002 rather than 1.064. The turn is the same size as before and
                    the lengthening is almost gone.
                  </p>
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
                <p>
                  The first term is the subtraction at work. It is positive while
                  the weights are shorter than one, negative while they are longer,
                  and zero at length one exactly, so a vector that has grown is pulled
                  back and one that has shrunk is pushed out, harder the further from
                  one it is and harder the more strongly the unit fired. The second
                  term is the square of the step and is always positive, which is why
                  a single step can still leave the length a little over one. It is
                  smaller by a factor of the rate, so it loses as the rate falls.
                </p>
                <InAModel title="The third step of the walk from (1, 0)">
                  <p>
                    Before person 1 is presented the squared length is 1.0640 and the
                    output on them is 12.003. The first term is 2 × 0.0025 × 144.06 ×
                    (1 − 1.0640) = −0.0461, a pull back toward one. The second term is
                    0.0025² × 144.06 × 65.15 = 0.0587, a push out, and it wins this
                    step because the rate times the person&rsquo;s squared length is
                    a half rather than something small. The squared length lands at
                    1.0766, a length of 1.0376, and the endpoint reports exactly that.
                  </p>
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
                  <p>
                    Suppose the unit rests on an eigenvector u with eigenvalue λ and
                    lean it a little toward another eigenvector v with eigenvalue μ,
                    so w = u + εv. The averaged update on the lean is rate times
                    (μ − λ) times εv to first order, since Cv = μv and the
                    subtraction removes λ times the whole vector. If μ is larger than
                    λ the lean grows and the unit leaves u; if μ is smaller the lean
                    shrinks and the unit returns. So a resting point is stable only
                    when no other eigenvalue exceeds its own, which is the first
                    principal component.
                  </p>
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
                <p>
                  The first step in that table went the wrong way. Person 4 turned
                  the weights from 45 degrees off the answer to 48.6 degrees off, and
                  it was the next two people who turned them back. That is not a
                  mistake in the rule. A single person pulls the weights toward their
                  own axis, whichever sign they lie on, and person 4 lies on the
                  second eigen direction, so they pull toward it. What decides the
                  outcome is how hard each person pulls, which is the output times
                  the part of the person that lies across the weights.
                </p>
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
                  large on data spread about ten, and the library&rsquo;s own default
                  of 0.05, which is right for its test fixtures, overflows on the
                  measured four in centimetres on the third epoch. So the endpoint
                  sets the rate from the cloud rather than fixing it.
                </p>
                <Equation>{"starting rate = 0.5 / (longest deviation)²        = 0.5 / 200 = 0.0025 on the measured four"}</Equation>
                <p>
                  The half comes from section 6. The subtraction moves the squared
                  length toward one by twice the rate times the output squared, and
                  the output squared is at most the squared length of the longest
                  person, so at a half the largest single kick lands on length one
                  rather than carrying past it. Scaling every rate alike moves no
                  direction and no share, which is what lets the eigensolver be run
                  on the raw people and still be the right comparison. Write the
                  heights in millimetres and the starting rate becomes 0.0000495, the
                  first direction still lands within a hundredth of a degree, and
                  nothing else about the answer moves.
                </p>
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
                <p>
                  The mechanism is the second term of section 6. Past a certain rate
                  the square of the step outgrows the pull back toward one, so a kick
                  meant to shrink the weights grows them instead, and the next kick
                  is larger. The fit refuses a walk like that by name rather than
                  completing it, and where the line falls depends on the cloud. On the
                  measured four the fit at four times the rate is refused on the
                  fourth epoch; on the crowd four times the rate runs the full two
                  hundred epochs and it is eight times that is refused, on the first.
                </p>
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
                <p>
                  The textbook argument, from Robbins and Monro, is that a constant
                  rate can never settle. Each person moves the weights by a fixed
                  amount, so the weights keep chasing whichever person arrived last,
                  and the fit becomes a fact about presentation order. I measured
                  it, and on the measured four the claim does not hold. Every one of
                  those four lies exactly on an eigen direction, so at the answer the
                  bracket is exactly zero for each of them, and a constant rate
                  settles at epoch 46 where the falling one takes 91, and lands on
                  the diagonal just as exactly.
                </p>
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
                <p>
                  The cost of deflation is that a unit chasing a small variance is
                  pushed by small outputs, and its updates are small in proportion.
                  On the crowd the second direction holds one percent of the spread,
                  and after two hundred epochs of the falling rate it is 8.2 degrees
                  off its twin at a length of 0.43, nowhere near one. On the ideal
                  case, where it holds seven hundredths of a percent, it is 20.5
                  degrees off at a length of 0.18. The first direction on both is
                  within a few thousandths of a degree.
                </p>
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
                <p>
                  An eigensolver&rsquo;s directions are perpendicular to the last bit
                  and its variances add to the total exactly. The rule&rsquo;s are
                  neither, and the fit reports rather than pretends. The worst
                  orthogonality is the largest dot product between two learned unit
                  directions, 0.000043 on the measured four after the full walk and
                  0.14 on the crowd, where the second direction was left short. The
                  variances along the two directions add to 166.66666685 against a
                  total of 166.66666667, a little over, because two directions that
                  overlap slightly count the overlap twice. After one epoch, with the
                  directions 0.12 from perpendicular, they add to 176.3.
                </p>
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
                <p>
                  The claim of the page is one number, the angle between the
                  direction a unit learned and the direction an eigensolver computed,
                  taken modulo a half turn because the rule lands on either sign. On
                  the measured four after the full walk it is 0.0000012 degrees for
                  the first direction and 0.0024 for the second. On the crowd it is
                  0.0031 for the first and 8.2 for the second, for the reason section
                  18 gave, and on the ideal case 0.001 for the first. The playground
                  at the top of the page draws both directions over any cloud you
                  build, and its angle readouts are these numbers.
                </p>
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
                <p>
                  Run the rule on the raw positions rather than the deviations and
                  it still settles at length one, on a direction that is wrong. On
                  the measured four the weights come to rest 0.08 degrees from the
                  line joining the origin to the mean at (170, 68) and 23.1 degrees
                  from the eigen direction, which is the angle between those two
                  lines. On the crowd it is 0.74 and 22.1 degrees. The rate for this
                  walk is set from the longest position rather than the longest
                  deviation, 0.000013 rather than 0.0025, or it would overflow on the
                  first person.
                </p>
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
                <p>
                  Put eight people evenly round a circle about the mean and the two
                  eigenvalues tie, at half the variance each. The eigensolver still
                  answers, with the height axis and the weight axis, and that answer
                  is an arbitrary choice, since every direction through a circle
                  carries the same spread. The rule answers too. It settles at length
                  1.0005 on a direction 80 degrees from the eigensolver&rsquo;s, with
                  a share of exactly a half, and five seeds send it 21, 9, 57 and 39
                  degrees from where the page&rsquo;s own seed sent it. None of those
                  is wrong, and the walk never stops itself, because a flat objective
                  gives it no reason to.
                </p>
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
                    { expression: "no features, or a non-finite value", reason: "refused at the boundary every feature passes through; the endpoint refuses a non-finite coordinate before the library sees it." },
                    { expression: "one person", reason: "refused by name, since one row has no spread to find a direction in; the endpoint refuses fewer than two a layer earlier." },
                    { expression: "two people", reason: "accepted; the first direction is the line through them and the second eigenvalue is zero." },
                    { expression: "every person on one spot", reason: "refused by name, since every share would divide by zero; the endpoint's eigensolver refuses the same cloud first." },
                    { expression: "one feature", reason: "accepted, with one direction carrying a share of one." },
                    { expression: "a constant column beside a varying one", reason: "accepted; the first direction is the varying column exactly and the second unit shrinks to 0.24 rather than pointing anywhere." },
                    { expression: "more directions asked for than features", reason: "refused at the fit, since a direction beyond the last has nothing left to see." },
                    { expression: "a rate too large for the data's scale", reason: "refused on the epoch a weight overflows, naming the epoch; four times the endpoint's rate on the four, the library's own default on centimetres." },
                    { expression: "a rate that never falls", reason: "accepted as a legitimate configuration; measured to settle on the four and to wobble forever on the crowd." },
                    { expression: "reading directions or transforming before fitting", reason: "refused by name, in the library's words." },
                    { expression: "new people with reordered columns", reason: "matched by name and accepted; a column missing or unknown is refused." },
                    { expression: "directions not perpendicular, not unit length, or not in order of variance", reason: "accepted and reported, as the worst orthogonality, the lengths and an ordering flag, since refusing them would refuse a correct fit stopped early." },
                    { expression: "a learned vector of length under a trillionth", reason: "refused, since a vector that short names no direction." },
                    { expression: "two eigenvalues tied", reason: "accepted; the directions inside the tie are arbitrary by both routes, and different seeds return different ones." },
                    { expression: "inverse transform, or saving the fit", reason: "neither is offered, and both are documented rather than defended; the first needs directions more orthonormal than these are." },
                  ]}
                />
                <p>
                  Every row of that table was probed, on this page&rsquo;s own people
                  where an endpoint reaches the case and against the library directly
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
      ]}
    />
  );
}
