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
import { ActivationSlopeChart } from "@/components/widgets/ActivationSlopeChart";
import { BendGallery } from "@/components/widgets/BendGallery";
import { ChainCollapse } from "@/components/widgets/ChainCollapse";
import { DeadUnitCensus } from "@/components/widgets/DeadUnitCensus";
import { LogisticTwinChart } from "@/components/widgets/LogisticTwinChart";
import { NeuronPlayground } from "@/components/widgets/NeuronPlayground";

export const metadata: Metadata = {
  title: "A Neuron · oop_ml",
  description:
    "One neuron is a weighted sum and a bend. The weights are the whole of what it learns, and the bend is chosen from a short list whose members differ in what they do to a slope.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NeuronsAndActivationsPage() {
  return (
    <ConceptPage
      title="A Neuron"
      tagline="One weighted sum, one bend, and three numbers that are all it will ever learn."
      prerequisites={
        <>
          This page assumes{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic regression
          </Link>
          , because a neuron with a sigmoid bend is that model exactly, and
          it measures people in the standard units the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling
          </Link>{" "}
          page introduced. It leans on the{" "}
          <Link href="/primers/calculus" className={link}>
            calculus primer
          </Link>
          &rsquo;s slope, since what a bend does to a slope is the whole
          reason there is more than one bend to choose from.
        </>
      }
      history={
        <>
          <p>
            Warren McCulloch and Walter Pitts, working at the University of
            Chicago in 1943, wrote down a nerve cell as a unit that adds up
            its inputs, each counted with a weight, and fires when the total
            passes a threshold. Their paper, A Logical Calculus of the Ideas
            Immanent in Nervous Activity, showed that enough of these units
            wired together could compute any statement of propositional
            logic, and it left the weights to be set by hand, since nothing
            in it said how a unit might find them. Frank Rosenblatt&rsquo;s
            perceptron, described in 1958 in Psychological Review and built
            as the Mark I at the Cornell Aeronautical Laboratory in Buffalo,
            was the first such unit that learned its weights from examples,
            nudging each one after every mistake, and the question it faced
            was whether a machine could learn to sort things it had been
            shown rather than things it had been told. Marvin Minsky and
            Seymour Papert&rsquo;s book Perceptrons, in 1969, proved the
            ceiling of one such unit, which is that it can only ever draw one
            straight line, and this page measures that ceiling on a crowd of
            twenty-five people in section 21.
          </p>
          <p>
            The threshold was the trouble for everything after. A unit that
            jumps from off to on has no slope anywhere, so the calculus
            primer&rsquo;s move, follow the slope downhill, has nothing to
            follow, and a chain of such units cannot be trained. David
            Rumelhart, Geoffrey Hinton and Ronald Williams replaced the jump
            with the sigmoid in their 1986 paper in Nature, Learning
            Representations by Back-propagating Errors, because the sigmoid
            has a slope everywhere and the chain rule can carry a gradient
            back through it. Sepp Hochreiter&rsquo;s 1991 diploma thesis at
            the Technical University of Munich worked out the cost, which is
            that the sigmoid&rsquo;s slope never exceeds a quarter and a
            product of such factors shrinks to nothing across a deep chain.
            Vinod Nair and Geoffrey Hinton in 2010, and Xavier Glorot,
            Antoine Bordes and Yoshua Bengio in 2011, showed that the
            rectifier, which clips negative scores to zero and passes
            positive ones through untouched, trained deep chains where the
            sigmoid stalled, and after Alex Krizhevsky&rsquo;s 2012 image
            network used it throughout it became the default bend. The four
            buttons in the box below are that history side by side.
          </p>
          <p>
            The page asks six questions in order. What does one neuron
            compute from a person&rsquo;s height and weight? Why is there a
            bend in it at all? What does each of the four bends do to a
            score, and to a slope? Where does a bend stop passing anything
            back? How is a sigmoid neuron the logistic regression already on
            this site, and what can one neuron not do? And what must an
            implementation state, and refuse? The crowd throughout is the
            one the bagging and random-forest pages grow trees on,
            twenty-five people measured by height and weight, children in
            amber and adults in indigo, with a tangled middle that no
            straight line can sort.
          </p>
        </>
      }
      playground={<NeuronPlayground />}
      sections={[
        {
          title: "Part 1. One Person Through One Neuron",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Two measurements in standard units">
                <p>
                  A neuron here reads two numbers about a person, their
                  height and their weight, and it reads them after the
                  feature scaling page&rsquo;s standardisation, so that each
                  is the number of standard deviations above the
                  crowd&rsquo;s mean. Done that way the two inputs share a
                  scale, the two weights the neuron puts on them can be
                  compared, and the whole crowd fits in a window three
                  deviations each way, which is the square the box above
                  draws. The crowd&rsquo;s mean height is 151.48 centimetres
                  with a deviation of 15.61, and its mean weight 51.48
                  kilograms with a deviation of 14.45.
                </p>
                <Equation>
                  {
                    "x₁ = (height − 151.48) / 15.61\nx₂ = (weight − 51.48) / 14.45"
                  }
                </Equation>
                <WorkedExample title="Two people the page keeps coming back to">
                  <p>
                    The first person in the crowd is a child of 147
                    centimetres and 41 kilograms, who standardises to
                    (−0.287, −0.725), a little short and rather light. The
                    page&rsquo;s worked person is one deviation above the
                    mean in both measurements, at (1, 1), which is 167.1
                    centimetres and 65.9 kilograms, and the page calls them
                    the tall heavy person. A second worked person at (−1, 1)
                    is a deviation short and a deviation heavy, and the page
                    calls them the short heavy person. Both are cells of the
                    lattice the box draws, so every number they produce can
                    be read off it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The neuron never sees centimetres or kilograms. It sees
                  two standardised numbers, and everything it learns is
                  written in those units, so a weight of 2 on height means
                  two units of score per standard deviation of height rather
                  than per centimetre.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The weighted sum and the bias">
                <p>
                  The neuron multiplies each input by its own weight, adds
                  the two products, and adds a third number, the bias, which
                  shifts the total without reference to either input. The
                  result is called the score, and the three numbers the
                  neuron holds, two weights and a bias, are everything it
                  will ever learn. One wording trap is worth naming once.
                  The neuron&rsquo;s weights are the multipliers it holds,
                  and a person&rsquo;s weight is the second input, and the
                  page keeps the two apart by calling the inputs x₁ and x₂.
                </p>
                <Equation>{"z = w₁·x₁ + w₂·x₂ + b"}</Equation>
                <WorkedExample title="The worked neuron on the tall heavy person">
                  <p>
                    The worked neuron has weights 2 and −1 and a bias of
                    0.5. The tall heavy person is (1, 1), so the score is
                    two, less one, plus a half.
                  </p>
                  <Equation>{"z = 2·1 + (−1)·1 + 0.5 = 1.5"}</Equation>
                  <p>
                    The short heavy person at (−1, 1) scores minus two, less
                    one, plus a half, which is −2.5. Both numbers are the
                    same whichever bend is chosen, because the bend has not
                    happened yet.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The score is a weighted sum plus a constant, which is the
                  regression pages&rsquo; linear model with the coefficients
                  renamed. Nothing about it is new, and its three numbers
                  are the entire learnable content of a neuron.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The score across the whole plane">
                <p>
                  The score is a weighted sum, so over the plane of the two
                  inputs it is a tilted plane, rising in one direction and
                  falling in the opposite one. In the box above the shaded
                  square is that plane seen from above, indigo where the
                  score is positive and amber where it is negative, darker
                  the further from zero. Drag a weight slider and the tilt
                  changes. Drag the bias and the whole plane rises or falls
                  without tilting.
                </p>
                <InAModel title="The worked neuron at the four corners">
                  <p>
                    With weights 2 and −1 and a bias of 0.5, the corner
                    three deviations short and three light scores −2.5, the
                    corner three tall and three heavy scores 3.5, the corner
                    three tall and three light scores 9.5, and the corner
                    three short and three heavy scores −8.5. Height counts
                    twice as much as weight and in the opposite direction,
                    so the extreme scores belong to the tall-light and
                    short-heavy corners rather than the diagonal ones.
                  </p>
                </InAModel>
                <KeepInMind>
                  Along any line of constant score the shading does not
                  change at all. The score varies only as you move across
                  those lines, so one neuron knows exactly one direction in
                  the plane, and how far a person lies along it.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Where the score is zero">
                <p>
                  Among all those lines of constant score one matters most,
                  the one along which the score is exactly zero, drawn
                  dashed in the box. Every bend on the page&rsquo;s list
                  crosses its own middle there, the sigmoid at one half, the
                  tangent at zero, the rectifier at the point where it
                  starts to rise. Set the score to zero and solve for the
                  second input.
                </p>
                <Equation>
                  {"2·x₁ − x₂ + 0.5 = 0\nx₂ = 2·x₁ + 0.5"}
                </Equation>
                <p>
                  On the window the box draws, that line enters at (−1.75,
                  −3) and leaves at (1.25, 3). Double the bias to 1 and it
                  enters at (−2, −3) and leaves at (1, 3), the same slope
                  shifted half a unit left. Set both weights to 1 and the
                  bias to 0 and it runs corner to corner. Set both weights
                  to 0 and there is no line at all, because the score is
                  then the bias everywhere, 0.5 at every cell of the
                  lattice, and the box draws nothing dashed.
                </p>
                <KeepInMind>
                  A weight turns the zero line and a bias slides it. Where
                  it lies, and which side a person falls on, is the whole of
                  what one neuron can say about the plane, and section 21
                  measures what that costs on the crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The bend, and the two numbers a neuron answers with">
                <p>
                  After the score comes one bend, a function of a single
                  number written f, and the neuron&rsquo;s output is the bend
                  applied to the score. The bend is chosen from a short list
                  and is not learned. Press the four buttons in the box with
                  the tall heavy person selected and the score stays at 1.5
                  every time while the output changes.
                </p>
                <Equation>
                  {
                    "output = f(z)\n\nidentity   f(1.5) = 1.5\nReLU       f(1.5) = max(0, 1.5) = 1.5\nsigmoid    f(1.5) = 1 / (1 + e^(−1.5)) = 0.8176\ntanh       f(1.5) = tanh(1.5) = 0.9051"
                  }
                </Equation>
                <p>
                  The neuron answers with two numbers rather than one, the
                  score and the output together. A forward pass through a
                  network reads only the output, since that is what the next
                  neuron receives, and a backward pass needs the score as
                  well, because the slope of the bend has to be taken at the
                  very score the forward pass used and recomputing it later
                  means running the sum twice. The weights, for their part,
                  are a plain ordered list with no names attached, which is
                  a deliberate departure from the regression pages, where
                  every coefficient was bound to a feature. A neuron past
                  the first layer reads the outputs of other neurons, which
                  are coordinates in a space the network invented, and there
                  is nothing to name them after.
                </p>
                <KeepInMind>
                  The score comes first and the bend second, and the neuron
                  keeps both numbers because the backward pass will ask for
                  the score. The bend is a choice made when the neuron is
                  built, and the rest of this page is about what that choice
                  does.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Why There Is A Bend At All",
          content: (
            <>
              <SubSection title="6. Two bendless neurons are one neuron">
                <p>
                  The reason for the bend is what happens without one. Hand
                  the worked neuron&rsquo;s output to a second neuron that
                  has one weight and one bias and no bend, and the second
                  neuron computes a weighted sum of a weighted sum. Multiply
                  it out and it is a single weighted sum with different
                  numbers in it. The widget below builds exactly that chain
                  and then asks the multiple-regression page&rsquo;s plane
                  fit whether the surface that comes out is a plane.
                </p>
                <Equation>
                  {
                    "second reads   1.5 · (2·x₁ − x₂ + 0.5) − 0.25\n            =  3·x₁ − 1.5·x₂ + 0.5"
                  }
                </Equation>
                <ChainCollapse />
                <InAModel title="With the identity between them">
                  <p>
                    The plane fit through the chain&rsquo;s surface comes
                    back with weights 3.00 and −1.50 and an intercept of
                    0.50, an R² of exactly 1.0 and a largest residual of
                    exactly 0.0, which are the collapsed neuron&rsquo;s
                    numbers to the last bit. The tall heavy person scores
                    1.5 in the first neuron, and 2.0 comes out of the chain
                    and out of the collapsed neuron alike.
                  </p>
                </InAModel>
                <KeepInMind>
                  A chain of bendless neurons, however long, is one bendless
                  neuron. A hundred of them in a row compute the same plane
                  as the one with the collapsed weights, 3 and −1.5 and 0.5
                  here, so depth buys nothing until something bends between
                  the links.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A bend between them makes the second neuron worth having">
                <p>
                  Now press the sigmoid button in the widget. The first
                  neuron&rsquo;s score is still 1.5, its output is now
                  0.8176, and the second neuron reads that instead, so the
                  chain answers 0.9764 for the tall heavy person where the
                  collapsed neuron still says 2.0. Over the whole window the
                  surface is no longer flat, and the plane fit says so.
                </p>
                <NumberTable
                  headings={["bend between", "plane fit R²", "largest residual", "chain output at the tall heavy person"]}
                  rows={[
                    ["identity", "1.0000", "0.0000", "2.0000"],
                    ["ReLU", "0.8067", "4.4978", "2.0000"],
                    ["sigmoid", "0.8852", "0.5650", "0.9764"],
                    ["tanh", "0.8117", "1.2629", "1.1077"],
                  ]}
                  caption="The least-squares plane through the chain’s surface under each bend, with the second neuron at a weight of 1.5 and a bias of −0.25. The rectifier’s chain still answers 2.0 at the tall heavy person because 1.5 is on its live side; the residual comes from the half of the window it flattened."
                />
                <WhyThisWorks title="Why a chain without a bend collapses">
                  <p>
                    Write the first neuron as a matrix W₁ and a bias b₁
                    acting on the row, and the second as W₂ and b₂ acting on
                    the result. The composition is W₂(W₁x + b₁) + b₂, which
                    is (W₂W₁)x + (W₂b₁ + b₂), one matrix and one bias, and
                    the argument repeats for a third neuron and a hundredth.
                    A bend f between them gives W₂f(W₁x + b₁) + b₂, and the
                    f cannot be pulled through the multiplication, which is
                    the only thing standing between depth and a single
                    plane. I measured the algebra on a 4 by 3 followed by a
                    2 by 4 as well, and the two orders of multiplication
                    agreed to floating point on 200 of 200 random trials and
                    bit for bit on none, which is the reassociation the
                    memory-layout note on the regression pages already
                    records.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The bend is what makes the second neuron compute something
                  the first could not, and any of the three bent buttons
                  does it. Which one to choose is decided by a different
                  question, the slope, which is Part 4.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The bend belongs to the neuron">
                <p>
                  Each of the four bends reads one number and answers one
                  number, so applied to a whole row of neurons it treats
                  every neuron&rsquo;s score on its own, and the
                  answer of one neuron depends on nothing another neuron
                  did. That is why the diagram at the top of the box is
                  complete with the bend drawn inside the neuron rather than
                  beside the layer, and why a neuron can carry its own
                  bend. It is also why the score has to travel with the
                  output, since a backward pass needs the bend&rsquo;s slope
                  at that neuron&rsquo;s own score and nowhere else.
                </p>
                <KeepInMind>
                  A bend is a pair of functions that travel together, the
                  bend itself and its slope, and a neuron owns the pair. A
                  function that reads a whole row at once is a different
                  kind of thing, and section 22 is about the one everybody
                  asks after.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Four Bends",
          content: (
            <>
              <SubSection title="9. The identity">
                <p>
                  The identity does nothing to the score, so its output is
                  the score and its slope is 1 everywhere. The tall heavy
                  person comes out at 1.5 and the short heavy person at
                  −2.5, and nothing is squashed or clipped. It is on the
                  list so that a network whose last layer predicts a
                  quantity, a weight in kilograms say, can end in an
                  ordinary neuron rather than a special case, since a
                  sigmoid there would trap every answer between zero and
                  one.
                </p>
                <Equation>{"f(z) = z            f′(z) = 1"}</Equation>
                <BendGallery />
                <KeepInMind>
                  The identity is correct only at the end of a chain.
                  Anywhere else it is the collapse of section 6, and two
                  identity neurons in a row are one neuron.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The rectifier">
                <p>
                  The rectifier keeps a positive score and replaces a
                  negative one with zero, so it is the score on one side of
                  zero and flat on the other. The tall heavy person, scoring
                  1.5, comes through untouched at 1.5. The short heavy
                  person, scoring −2.5, comes out at exactly 0, and so does
                  everyone else on that side of the dashed line, however far
                  from it they are. Its output has no ceiling and a floor of
                  zero.
                </p>
                <Equation>
                  {"f(z) = max(0, z)     f′(z) = 1 for z > 0,  0 for z < 0"}
                </Equation>
                <p>
                  At a score of exactly zero the slope is undefined, since
                  the two sides disagree, and an implementation has to pick
                  one. The library picks 0, the negative side&rsquo;s
                  answer, and the curve the box draws reports 0 at its
                  middle sample. An exact zero score is rare enough in
                  floating point that the choice never shows in a fit, and
                  it is written down because a reader who computes the
                  slope by hand will otherwise meet a number that appears to
                  come from nowhere.
                </p>
                <KeepInMind>
                  The rectifier is two straight lines meeting at zero, which
                  is why its slope is either exactly 1 or exactly 0 and never
                  anything between, and section 18 counts what the zero half
                  costs on the crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The sigmoid">
                <p>
                  The sigmoid is the logistic regression page&rsquo;s
                  squash, and it maps any score into the open interval
                  between zero and one, crossing one half at a score of
                  zero. The tall heavy person&rsquo;s 1.5 becomes 0.8176 and
                  the short heavy person&rsquo;s −2.5 becomes 0.0759. Neither
                  end is ever reached exactly in principle, though in
                  floating point it is, and section 18 says what happens
                  then.
                </p>
                <Equation>{"f(z) = 1 / (1 + e^(−z))"}</Equation>
                <p>
                  The formula as written overflows for a large negative
                  score, since e to the 800 is beyond what a double can
                  hold, and the library computes the sigmoid in a form that
                  does not. I checked it at the edge of what the box can
                  reach. A neuron with both weights at 10 and a bias of −10,
                  shown the corner ten deviations short and ten light, scores
                  −210 and answers 6.28 × 10⁻⁹², a tiny number rather than a
                  warning, and the same neuron at the opposite corner scores
                  190 and answers exactly 1.
                </p>
                <KeepInMind>
                  A sigmoid output can be read as a probability, which is
                  what section 20 does with it. That reading is the only
                  reason to choose the sigmoid over the tangent, and it
                  applies at an output neuron rather than in the middle of a
                  chain.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The hyperbolic tangent">
                <p>
                  The tangent is the sigmoid recentred, stretched to run
                  from minus one to one and crossing zero at a score of
                  zero, so a neuron carrying it answers a number centred on
                  zero rather than on one half, which the next layer tends
                  to find easier to read. The tall heavy person comes out at
                  0.9051 and the short heavy person at −0.9866, already close
                  to the floor at a score of only −2.5.
                </p>
                <Equation>{"tanh(z) = 2·σ(2z) − 1"}</Equation>
                <WorkedExample title="The recentring checked at the tall heavy person">
                  <p>
                    The sigmoid at twice the score, σ(3), is 0.9526 on the
                    curve the box samples, and twice that less one is
                    0.9051, which is the tangent&rsquo;s output at 1.5. The
                    two are one curve drawn at two scales.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The tangent is the sigmoid with its middle moved to zero
                  and its range doubled. It squashes at both ends just as
                  the sigmoid does, and Part 4 is where the two part
                  company.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What A Bend Does To A Slope",
          content: (
            <>
              <SubSection title="13. Why the slope decides">
                <p>
                  When a network learns, a gradient arrives at each neuron
                  from whatever sits above it, saying how the loss would
                  change if that neuron&rsquo;s output moved. To turn that
                  into how the loss would change if the score moved, which
                  is what the weights need, the calculus primer&rsquo;s chain
                  rule multiplies it by the bend&rsquo;s slope at the very
                  score the forward pass produced. Every neuron a gradient
                  passes through on its way down multiplies it by one such
                  factor, and the{" "}
                  <Link href="/concepts/backpropagation" className={link}>
                    backpropagation page
                  </Link>{" "}
                  follows one all the way.
                </p>
                <Equation>{"∂loss/∂z = ∂loss/∂output · f′(z)"}</Equation>
                <KeepInMind>
                  A bend is chosen for its slope, since the slope is what
                  the gradient is multiplied by. A bend whose slope is small
                  everywhere starves everything beneath it, whatever its
                  output looks like.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Deriving the four slopes">
                <p>
                  The identity&rsquo;s slope is 1 and the rectifier&rsquo;s
                  is 1 on the live side and 0 on the dead side, both read
                  straight off the definition. The sigmoid takes three lines
                  of the chain rule, and its slope comes out as a function
                  of its own output, which is why a backward pass never has
                  to recompute the exponential.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "σ(z) = (1 + e^(−z))^(−1)", reason: "the sigmoid written as a power, ready for the chain rule" },
                    { expression: "σ′(z) = e^(−z) · (1 + e^(−z))^(−2)", reason: "the power rule on the outside, times the derivative of the inside, which is −e^(−z), and the two minus signs cancel" },
                    { expression: "σ′(z) = σ(z) · (1 − σ(z))", reason: "e^(−z) / (1 + e^(−z)) is 1 − σ(z), and the remaining factor is σ(z)" },
                    { expression: "tanh′(z) = 4·σ′(2z) = 1 − tanh²(z)", reason: "differentiate 2·σ(2z) − 1 and substitute the sigmoid’s slope back in" },
                  ]}
                />
                <WorkedExample title="The slopes at the two worked people">
                  <p>
                    At the tall heavy person&rsquo;s score of 1.5 the
                    sigmoid&rsquo;s output is 0.8176, and 0.8176 times
                    0.1824 is 0.1491, which is the slope the box reports.
                    The tangent&rsquo;s output there is 0.9051, and one less
                    its square is 0.1807. At the short heavy person&rsquo;s
                    −2.5 the sigmoid&rsquo;s output is 0.0759 and its slope
                    0.0701, and the tangent&rsquo;s output is −0.9866 and
                    its slope 0.0266, already under three hundredths.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Both squashing bends have slopes that are a function of
                  their own output, and both slopes fall toward zero as the
                  output nears either end of its range. The rectifier&rsquo;s
                  slope is a step, and the identity&rsquo;s is a constant.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The four slopes side by side">
                <p>
                  Laid over one another the four slopes tell the whole story
                  of which bend to use where. The identity and the rectifier
                  reach 1 and stay there, the tangent reaches 1 at a score
                  of zero and falls away on both sides, and the sigmoid
                  reaches a quarter at its best and falls away just as fast.
                </p>
                <ActivationSlopeChart />
                <KeepInMind>
                  The peak slopes are 1, 1, 0.25 and 1. The sigmoid&rsquo;s
                  peak is a quarter because one half times one half is a
                  quarter, and no choice of weights changes it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Saturation And Dead Units",
          content: (
            <>
              <SubSection title="16. The flat ends of the sigmoid and the tangent">
                <p>
                  A bend that squashes has to go flat somewhere, and once it
                  has, its slope is close to zero and it passes almost
                  nothing back. That is saturation, and the table below reads
                  the two squashing bends at whole-number scores off the
                  curve the box samples.
                </p>
                <NumberTable
                  headings={["score z", "sigmoid output", "sigmoid slope", "tanh output", "tanh slope"]}
                  rows={[
                    ["0", "0.5000", "0.2500", "0.0000", "1.0000"],
                    ["1", "0.7311", "0.1966", "0.7616", "0.4200"],
                    ["2", "0.8808", "0.1050", "0.9640", "0.0707"],
                    ["3", "0.9526", "0.0452", "0.9951", "0.0099"],
                    ["4", "0.9820", "0.0177", "0.9993", "0.0013"],
                    ["6", "0.9975", "0.0025", "1.0000", "0.000025"],
                  ]}
                  caption="Outputs and slopes at whole-number scores, read from the sampled curves. The negative scores mirror these, with the outputs reflected and the slopes the same."
                />
                <p>
                  By a score of 6 the sigmoid&rsquo;s slope is 0.0025, a
                  hundredth of its peak, and the tangent&rsquo;s is
                  0.000025, which is why the tangent looks so much steeper
                  at zero and is no better off two units out. The page uses
                  a hundredth of the peak as its working definition of
                  saturated, and on the neuron the logistic model fitted to
                  the crowd, whose weights are 2.55 and 1.29, the child of
                  120 centimetres and 25 kilograms scores −7.38 and has a
                  sigmoid slope of 0.000298, with six of the twenty-five
                  people under the hundredth.
                </p>
                <KeepInMind>
                  Saturation is about the size of the score, and the score
                  is a weighted sum, so a neuron saturates when its weights
                  are large or its inputs are, which is one more reason the
                  inputs arrive standardised.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Ten neurons in a chain">
                <p>
                  The trouble compounds. A gradient passing back through
                  ten sigmoid neurons in a chain is multiplied by ten slopes,
                  each at most a quarter, so in the best case, with every one
                  of the ten scores exactly zero, it keeps a quarter to the
                  tenth power.
                </p>
                <Equation>
                  {"0.25¹⁰ = 9.537 × 10⁻⁷\n0.1491¹⁰ = 5.4 × 10⁻⁹"}
                </Equation>
                <p>
                  Under a millionth at the single best point, and the second
                  line, at the tall heavy person&rsquo;s slope of 0.1491, is
                  two hundred times smaller than that. The tangent peaks at
                  1 rather than a quarter, so a chain of tangent neurons
                  starves four times more slowly per layer and starves all
                  the same once the scores drift from zero. The rectifier
                  passes the gradient through at exactly 1 wherever the
                  score is positive, however long the chain, and that is
                  the whole reason it took over. Nothing is broken in a
                  starved chain and nothing raises; the walk just stalls,
                  which the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  shows happening.
                </p>
                <KeepInMind>
                  Ten sigmoid slopes multiply to under a millionth at their
                  very best, and no learning rate recovers what the chain has
                  multiplied away, since the rate scales the product it is
                  given rather than restoring what the squashes removed.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The rectifier&rsquo;s dead side">
                <p>
                  The rectifier escapes saturation on one side and pays for
                  it on the other. Wherever the score is negative its slope
                  is exactly 0, so a person on that side of the line
                  contributes nothing to the gradient at all, and a neuron
                  whose score is negative for every person it is shown
                  receives no gradient from anyone and cannot move its
                  weights to change that. The unit is dead, and since the
                  only thing that could move its weights is the gradient it
                  no longer receives, it stays that way.
                </p>
                <InAModel title="The fitted neuron under the rectifier">
                  <p>
                    Give the neuron the logistic model fitted to the crowd
                    a rectifier instead of its sigmoid, and 12 of the 25
                    people land on the dead side with an output of exactly 0
                    and a slope of exactly 0. The other 13 pass through at
                    a slope of exactly 1. Nothing is in between, because the
                    rectifier has no in between.
                  </p>
                </InAModel>
                <p>
                  A sigmoid can die too, in floating point. Scale the fitted
                  neuron&rsquo;s three numbers by ten and the child of 120
                  centimetres scores −73.8, whose sigmoid output rounds to a
                  number so close to zero that one minus it is exactly 1, and
                  the mirror case on the other side rounds the output to
                  exactly 1, where the output times one minus the output is
                  exactly 0. Three people in the crowd have a slope of
                  exactly 0.0 at that scale, which is saturation having
                  become death, and I mention it because a reader who
                  believes the sigmoid&rsquo;s slope is always positive will
                  meet a zero and go looking for a bug that is not there.
                </p>
                <KeepInMind>
                  A dead rectifier unit is a neuron no gradient reaches. The
                  usual guards are a small positive bias at the start and a
                  learning rate that cannot fling the weights across zero in
                  one step, and the leaky rectifier, which gives the dead
                  side a small slope, is the repair that changes the bend
                  itself.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A census of the crowd">
                <p>
                  The widget below starts from the fitted neuron and scales
                  its two weights and its bias together, which leaves the
                  dashed line where it is and steepens the score everywhere
                  else. Each person is filled in proportion to the slope at
                  their score, so as the scale rises the people far from the
                  line fade to rings, and the counts say how many have gone.
                </p>
                <DeadUnitCensus />
                <NumberTable
                  headings={["scale", "sigmoid saturated", "sigmoid dead", "tanh saturated", "tanh dead"]}
                  rows={[
                    ["0.25", "0 of 25", "0", "0 of 25", "0"],
                    ["1", "6 of 25", "0", "6 of 25", "0"],
                    ["4", "10 of 25", "0", "16 of 25", "6"],
                    ["10", "17 of 25", "3", "23 of 25", "7"],
                    ["20", "23 of 25", "5", "23 of 25", "16"],
                  ]}
                  caption="The census at five scales of the fitted neuron. Saturated is a slope under a hundredth of the bend’s peak, dead is a slope of exactly zero, and the dead are counted among the saturated."
                />
                <KeepInMind>
                  At a quarter of the fitted scale nobody in the crowd is
                  flat, and at twenty times it almost everyone is. The
                  weights decide it, which is why a network&rsquo;s starting
                  weights are chosen small and its inputs are standardised
                  before anything else is tried.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. One Neuron Against Logistic Regression",
          content: (
            <>
              <SubSection title="20. A sigmoid neuron is the logistic model">
                <p>
                  Fit the logistic regression page&rsquo;s model to the
                  crowd, with standardised height and weight as its two
                  features, and it settles on a coefficient of 2.5537 for
                  height, 1.2944 for weight and an intercept of 0.1396,
                  after 7527 passes of the gradient climb. Hand those three
                  numbers to one neuron as its two weights and its bias,
                  choose the sigmoid, and show it the same people.
                </p>
                <LogisticTwinChart />
                <InAModel title="Both routes on the whole crowd">
                  <p>
                    The child of 147 centimetres and 41 kilograms scores
                    −1.5321, and the model&rsquo;s probability of adulthood
                    is 0.177694 while the neuron&rsquo;s output is 0.177694.
                    The adult of 156 centimetres and 53 kilograms scores
                    1.0151 and both routes answer 0.734019. Over all
                    twenty-five people the largest gap between the two is
                    1.1 × 10⁻¹⁶, which is one rounding of a double, and
                    the button in the box at the top of the page loads the
                    same three numbers so you can drag the probe over the
                    crowd yourself.
                  </p>
                </InAModel>
                <KeepInMind>
                  A neuron with a sigmoid bend and logistic regression are
                  the same calculation, weights, a bias and a squash, and
                  the logistic page&rsquo;s single-input model is the same
                  neuron with one weight. Nothing about the unit is new, and
                  the dense layers page is where the difficulty starts, by
                  feeding one such neuron&rsquo;s output into another.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What one neuron cannot do">
                <p>
                  The dashed line in the twin&rsquo;s map is straight,
                  because a weighted sum is zero along a straight line for
                  every choice of weights and bias, and the crowd&rsquo;s
                  tangled middle does not sort along any straight line. The
                  fitted neuron calls 17 of the 25 people correctly, an
                  accuracy of 0.68, and the eight it misses are the ones
                  ringed dark in the map, all of them inside the tangle,
                  where a child and an adult of nearly the same height and
                  weight sit on opposite sides of whatever line is drawn.
                  Section 4 said one neuron knows one direction in the
                  plane, and this is the price.
                </p>
                <WhyThisWorks title="Why no bend rescues it">
                  <p>
                    Write the score at the four corners of exclusive-or,
                    where the answer is yes when exactly one of two inputs is
                    on.
                  </p>
                  <Equation>
                    {
                      "z(0,0) = b              z(1,0) = w₁ + b\nz(0,1) = w₂ + b         z(1,1) = w₁ + w₂ + b\n\nz(0,1) + z(1,0) = w₁ + w₂ + 2b = z(0,0) + z(1,1)"
                    }
                  </Equation>
                  <p>
                    The two yes corners and the two no corners carry the same
                    total score, for every weight and bias there is.
                    Exclusive-or asks for both yes corners above a threshold
                    and both no corners below it, which would make the
                    left-hand total exceed twice the threshold while the
                    right-hand total falls short of it, and those two totals
                    are the same number. The argument never touches the
                    bend, only the assumption that a higher score never
                    means a lower output, which every bend on the list
                    satisfies, so no cleverer squash escapes it.
                  </p>
                </WhyThisWorks>
                <p>
                  Composition does escape it, which is what the{" "}
                  <Link href="/concepts/dense-layers" className={link}>
                    dense layers page
                  </Link>{" "}
                  builds and the{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  trains on exclusive-or itself. Two neurons each draw a
                  line, and a third reading both can say yes between the
                  lines and no outside them.
                </p>
                <KeepInMind>
                  One neuron draws one straight line, and its ceiling is a
                  fact about the unit rather than a weakness of any bend.
                  The crowd&rsquo;s 17 of 25 is what that ceiling costs on
                  data with a tangled middle.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Why softmax is not on the list">
                <p>
                  Anyone who has met the{" "}
                  <Link href="/concepts/multiclass-classification" className={link}>
                    multi-class page
                  </Link>{" "}
                  will look for softmax among the four buttons and not find
                  it, and its absence is a matter of what it reads rather
                  than of taste. Each bend on the list reads one score and
                  answers one output. Softmax reads a whole row of scores at
                  once and answers a row that sums to one.
                </p>
                <Equation>{"softmax(z)ᵢ = e^(zᵢ) / Σⱼ e^(zⱼ)"}</Equation>
                <InAModel title="Three scores, one of them moved">
                  <p>
                    Three neurons scoring 2, 1 and 0.1 come out of softmax
                    at 0.6590, 0.2424 and 0.0986. Move only the third score,
                    from 0.1 to 5, and the outputs become 0.0466, 0.0171 and
                    0.9362. Nothing about the first neuron changed and its
                    answer fell by a factor of 14.1, because every output
                    shares one denominator and the three compete for a fixed
                    total of one.
                  </p>
                </InAModel>
                <p>
                  No function of one number can do that, and no single
                  neuron can hold it, since a neuron has no neighbours to
                  normalise against. Softmax belongs to an output layer,
                  where the whole row exists, and the library keeps it there
                  beside the multi-class loss rather than on the list of
                  bends a neuron may own.
                </p>
                <KeepInMind>
                  Softmax reads the row, so it cannot be a bend, and asking
                  the playground for it is refused because the request has
                  nowhere to put a function that needs the rest of the row.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation And Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a complete implementation states">
                <p>
                  A complete neuron states how many inputs it reads, which
                  is its number of weights and cannot be zero; the order its
                  weights match its inputs in, since they carry no names;
                  that it holds a bias; which bend it applies and what that
                  bend&rsquo;s slope is, so that the two travel together;
                  what the slope is at the rectifier&rsquo;s kink; that the
                  sigmoid is computed in a form that cannot overflow; the
                  range each bend&rsquo;s output lies in; and that it answers
                  with the score and the output both, since the backward
                  pass needs the score. It also states what a chain of them
                  does when nothing bends between them, which is collapse,
                  and that softmax is not a bend.
                </p>
              </SubSection>

              <SubSection title="24. Failure contracts">
                <p>
                  Every row below was probed. The playground&rsquo;s request
                  refuses some of these at the door, with its own bounds,
                  before the library is reached, and where that happens the
                  row says what the library itself does when asked directly.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "a neuron with no weights", reason: "refused; a neuron with no inputs is a constant wearing a neuron’s name, and the request asks for exactly two weights before the library sees any." },
                    { expression: "a neuron with one weight", reason: "accepted by the library, and it is the logistic page’s single-input model; the playground’s request asks for two because its plane has two axes." },
                    { expression: "a non-finite weight or bias", reason: "refused by the library in words, and it cannot be written in a request at all, since JSON has no way to spell infinity or a non-number." },
                    { expression: "a row of the wrong length", reason: "refused; the weight count is the input width, and three values against two weights is named as a length mismatch." },
                    { expression: "an empty row, or a non-finite or non-numeric value in it", reason: "refused, each by the same guard every column in the library passes through." },
                    { expression: "integers, or booleans, as inputs", reason: "accepted and coerced to floating point, so true reads as 1 and false as 0; documented rather than defended." },
                    { expression: "one person", reason: "answered; a neuron responds to a row and has no notion of a dataset, so one row is the ordinary case." },
                    { expression: "both weights zero, a constant column", reason: "accepted; the score is the bias everywhere, 0.5 at every cell, and there is no zero line to draw." },
                    { expression: "a weight or probe beyond 10, or a lattice finer than 41 cells", reason: "refused at the door as a request larger than the page allows, with the limit named." },
                    { expression: "unfitted use", reason: "nothing to refuse; a neuron is built complete from its three numbers and has no fit of its own. Fitting is the training page’s job." },
                    { expression: "mismatched feature names", reason: "not detectable; the weights carry no names and match inputs by position, so the order is the contract. Documented rather than defended." },
                    { expression: "softmax requested as a bend", reason: "refused; it is not on the list and cannot be, since it reads a row." },
                    { expression: "the rectifier at a score of exactly zero", reason: "slope 0 by convention, the negative side’s answer; the curve’s middle sample reports it." },
                    { expression: "a score of −210 under the sigmoid", reason: "6.28 × 10⁻⁹², with no overflow and no warning, because the sigmoid is computed in its stable form." },
                    { expression: "a score of 190 under the sigmoid", reason: "exactly 1, with a slope of exactly 0, which is where saturation has become a dead unit in floating point." },
                    { expression: "a lattice window that does not open upward", reason: "refused in words, naming which input’s low edge is not below its high edge." },
                  ]}
                />
                <p>
                  The two rows that deserve a second look are the ones the
                  library accepts. Booleans coerce quietly, so a column of
                  yes-and-no flags becomes ones and zeros without anyone
                  saying so, and the positional weights mean a row handed
                  over with its height and weight swapped is scored wrongly
                  with nothing raised. Both are the price of a unit that
                  reads unnamed coordinates from the layer beneath it, and
                  the dense layers page is where the shape checks that catch
                  a wrong width live.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
