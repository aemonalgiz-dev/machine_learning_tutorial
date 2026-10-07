import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { CollapseChart } from "@/components/widgets/CollapseChart";
import { MarginSweep } from "@/components/widgets/MarginSweep";
import { MetricComparisonLedger } from "@/components/widgets/MetricComparisonLedger";
import { PairCostLedger } from "@/components/widgets/PairCostLedger";
import { PairLossCalculator } from "@/components/widgets/PairLossCalculator";
import { PairSpacePlayground } from "@/components/widgets/PairSpacePlayground";
import { SharedWeightsCheck } from "@/components/widgets/SharedWeightsCheck";
import { WorkedPairBoard } from "@/components/widgets/WorkedPairBoard";

export const metadata: Metadata = {
  title: "Learning the Metric Itself · oop_ml",
  description:
    "Train on picture pairs so useful matches receive nearby representations.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const caption = "text-sm text-slate-500 dark:text-slate-400";

export default function LearningTheMetricPage() {
  return (
    <ConceptPage
      lessonId="learning-the-metric-itself"
      intuition={lessonIntuitions["learning-the-metric-itself"]}
      technicalStart="Part 2. The Contrastive Loss"
      openingTitle="Teach the Model What Should Count as Similar"
      playgroundIntro="Compare the distances of matching and nonmatching pairs. Change the margin and inspect both groups, since pulling everything together would make matching distances small too."
      title="Learning the Metric Itself"
      tagline="Train on picture pairs so useful matches receive nearby representations."
      prerequisites={
        <>
          The borrowed vector this page is measured against is the one read off a
          classifier on{" "}
          <Link href="/concepts/a-vector-for-a-picture" className={link}>
            a vector for a picture
          </Link>
          , and the network is the one assembled on{" "}
          <Link href="/concepts/convolutional-networks" className={link}>
            convolutional networks
          </Link>{" "}
          and trained the way{" "}
          <Link href="/concepts/training-a-network" className={link}>
            training a network
          </Link>{" "}
          describes. Distance is the straight-line distance of{" "}
          <Link href="/concepts/distance-and-similarity" className={link}>
            distance and similarity
          </Link>
          , and the question asked of every space is the one-neighbour vote of{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>
            k-nearest neighbours
          </Link>
          .
        </>
      }

      playground={<PairSpacePlayground />}
      sections={[
        {
          title: "Part 1. The Problem With A Borrowed Ruler",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Four kinds of picture, and a question about sameness">
                <>
<p>
                  Every picture on this page is sixteen pixels on a side with one brightness per pixel, and holds one of four shapes, a cross, the outline of a square, a filled disc or a diagonal bar, drawn at a random position and size against a random background with a little noise on every pixel. A fifth kind, a ring, is drawn only when asked for, as a kind no network here is ever shown.
                </p>
                <p>
                  We want a distance between two pictures that is small when they are the same kind and large when they are not, and the method on this page trains that distance directly from pairs, where the usual route borrows it from a network trained to name the kinds.
                </p>
</>
                <>
<p>
                  The page asks six questions, in order. What goes wrong with the distance a classifier leaves behind, and why train a distance from pairs at all? What does the contrastive loss ask of one pair, worked by hand? How does one network serve both pictures of a pair, and is the slope of a weight used twice really the sum of its two uses?
                </p>
                <p>
                  Trained on pairs of three kinds, does the distance carry to the fourth kind and to rings, against the vector borrowed from a classifier? What does the margin do, and what happens with no pairs of different kinds at all? And what does the method cost in pairs, before the last Part asks where it stops being defined.
                </p>
</>
                <NumberTable
                  headings={["the collection", "on this page"]}
                  rows={[
                    ["side of one picture", "16 pixels, one brightness each"],
                    ["kinds", "cross, square, disc, bar"],
                    ["training pictures per kind", "60"],
                    ["held-out pictures per kind", "60"],
                    ["a fifth kind, never trained on", "ring, 60 drawn"],
                    ["pictures every distance is measured among", "300, the 240 held out and the 60 rings"],
                  ]}
                  caption="The same drawn collection the other picture pages use. Every nearest neighbour below is searched among the 300 evaluation pictures unless a step says otherwise."
                />
                <KeepInMind>
                  The question throughout is whether a picture&rsquo;s nearest
                  other picture, among 300 that no network trained on, is the same
                  kind as it.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The ruler a classifier leaves behind">
                <p>
                  The page on{" "}
                  <Link href="/concepts/a-vector-for-a-picture" className={link}>
                    a vector for a picture
                  </Link>{" "}
                  trained a network to name the four kinds and kept the sixteen
                  numbers of the layer before its answer as a picture&rsquo;s
                  position. It found that a held-out picture&rsquo;s nearest
                  neighbour there is its own kind for 230 to 235 of 240 across
                  three weight seeds, which is a very good ruler for the kinds the
                  network was taught. It also found that the ruler is worse at the
                  one thing it was never asked about, since 43 to 45 of 60 rings
                  find another ring by it where the raw pixels manage 46.
                </p>
                <p>
                  Searched among all 300 pictures by straight-line distance, the
                  same network&rsquo;s layer gives a nearest neighbour of the right
                  kind to 56 crosses, 58 discs and 59 bars of 60, and to only 40
                  squares, because the rings it was never shown land among the
                  squares and take their places as nearest neighbours. The pixels
                  give 45, 38, 50 and 54, and 44 rings of 60.
                </p>
                <KeepInMind>
                  A classifier&rsquo;s layer is a good ruler for the kinds it was
                  trained to name and nobody asked it about anything else, which
                  shows as soon as a kind it never saw joins the search.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a pair asks for that a label does not">
                <p>
                  A classifier needs every example named, and it can only ever
                  answer with one of the names it was given. A great many real
                  problems do not come like that. A bank verifying signatures has
                  pairs known to be by one person and pairs known not to be, and
                  a photograph collection has pictures known to show one face, and
                  in both the people who matter tomorrow are not among the names
                  today. What they have is sameness, and sameness is exactly what
                  a distance is supposed to encode.
                </p>
                <p>
                  So the method asks for it directly. Show the network two
                  pictures and a single bit, one kind or two, and adjust the
                  weights so that the distance between the two answers agrees
                  with the bit.
                </p>
                <Equation>
                  {"d(a, b) as small as it can be, when a and b are one kind\nd(a, b) ≥ m, when they are two kinds"}
                </Equation>
                <p>
                  The hope, and the claim the method is usually sold on, is that a
                  distance trained this way describes what makes pictures alike
                  rather than which name to give them, and so should serve kinds
                  the training never contained. Part 4 tests exactly that.
                </p>
                <KeepInMind>
                  Training on pairs needs only a judgement of one kind or two for
                  each pair, never a name, and aims straight at the distance
                  rather than hoping it falls out of naming.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Contrastive Loss",
          content: (
            <>
              <SubSection title="4. A network whose answer is a position">
                <p>
                  The network is the shared picture network with its last layer
                  replaced. Where the classifier ended in four scores, one per
                  kind, this one ends in eight numbers with no nonlinear activation applied, and
                  those eight numbers are the picture&rsquo;s position. Every
                  starting weight below that last layer is the reference
                  network&rsquo;s own, so the two networks this page compares
                  begin from the same place.
                </p>
                <Equation>
                  {"p(x) = W₂ tanh(W₁ f(x) + b₁) + b₂      f(x) the 128 numbers the convolutions hand on\n                                         W₁ is 16 × 128, W₂ is 8 × 16\nd(a, b) = ‖p(a) − p(b)‖ = √( Σᵢ (p(a)ᵢ − p(b)ᵢ)² )"}
                </Equation>
                <p>
                  Before any training the mean distance between two of the 300
                  evaluation pictures&rsquo; positions is 0.7325. The margin used
                  throughout is 1, chosen before any margin was compared because
                  it is a distance the untrained network nearly reaches already,
                  so training does not have to drag the positions to a new scale
                  before it can start arranging them.
                </p>
                <KeepInMind>
                  The tower answers with eight numbers, a position, and starts
                  from the reference network&rsquo;s weights, with its positions
                  0.7325 apart on average.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. A pair of one kind is pulled together">
                <p>
                  For two pictures of one kind the loss is half their squared
                  distance. It is zero only when the two positions coincide, and
                  its slope at either position points along the line to the other,
                  growing with the distance, so a far-apart pair is pulled hard
                  and a close pair gently, the way a spring behaves.
                </p>
                <Equation>
                  {"L_same(a, b) = ½ d(a, b)²\n∂L_same / ∂p(a) = p(a) − p(b)"}
                </Equation>
                <p>
                  A step of descent moves p(a) against that slope, which is
                  towards p(b), and moves p(b) by the opposite amount, towards
                  p(a). The half is there only so the slope comes out as the gap
                  itself.
                </p>
                <KeepInMind>
                  A pair of one kind is pulled together by a force proportional
                  to its distance, and is satisfied only when the two positions
                  are the same point.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A pair of two kinds is pushed to the margin and no further">
                <p>
                  For two pictures of different kinds the loss is half the squared
                  amount by which they fall short of the margin. Closer than the
                  margin they are pushed apart, hardest when they are closest;
                  once they are a margin apart the loss is zero and so is its
                  slope, and they are left alone.
                </p>
                <Equation>
                  {"L_different(a, b) = ½ max(0, m − d)²\n∂L_different / ∂p(a) = −((m − d) / d) (p(a) − p(b))   when d < m,   and 0 when d ≥ m"}
                </Equation>
                <p>
                  Together, with y equal to 1 for a pair of one kind and 0 for a
                  pair of two, the contrastive loss of Hadsell, Chopra and LeCun
                  is the following, averaged over the pairs.
                </p>
                <Equation>
                  {"L = y · ½ d² + (1 − y) · ½ max(0, m − d)²"}
                </Equation>
                <WhyThisWorks title="Why the push stops at a margin">
                  <p>
                    The obvious alternative is to reward distance without limit,
                    a loss of minus the squared distance for a pair of two kinds.
                    That loss has no minimum. The network can always lower it by
                    making every position larger, so the weights grow without end
                    and the pulls, which are bounded by how close a pair can get,
                    are swamped. The margin turns the push into a demand that can
                    be met, after which a pair contributes nothing, and it is what
                    makes the loss bounded below by zero.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A pair of two kinds is pushed apart only while it is closer than
                  the margin, and past the margin it has no loss and no slope.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. One pair checked by hand">
                <p>
                  Two positions in a plane are enough to check every piece of
                  the loss. Put the first at the origin and the second at 0.36 and
                  0.48, which is 0.6 away, and take the margin as 1.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="what it is"
                  rows={[
                    {
                      expression: "d = √(0.36² + 0.48²) = √0.36 = 0.6",
                      reason: "the distance between the two positions.",
                    },
                    {
                      expression: "one kind:  ½ × 0.6² = 0.18",
                      reason: "the pull. Its slope at the first position is the gap, (0 − 0.36, 0 − 0.48) = (−0.36, −0.48), so a step moves the first point towards the second.",
                    },
                    {
                      expression: "two kinds:  ½ × (1 − 0.6)² = 0.08",
                      reason: "the push, since 0.6 is short of the margin by 0.4.",
                    },
                    {
                      expression: "−(0.4 / 0.6) × (−0.36, −0.48) = (0.24, 0.32)",
                      reason: "its slope at the first position, pointing towards the second point, so a step moves the first point away.",
                    },
                    {
                      expression: "second at (1.2, 1.6):  d = 2,  ½ × max(0, 1 − 2)² = 0",
                      reason: "past the margin a pair of two kinds costs nothing, where as one kind it would cost ½ × 2² = 2.",
                    },
                  ]}
                />
                <PairLossCalculator />
                <p className={caption}>
                  Drag either point and switch the label. The curve on the right
                  is the loss over distance for each label, with the margin
                  dashed; the dot is the answer for the pair on the left.
                </p>
                <KeepInMind>
                  At a distance of 0.6 and a margin of 1, the pair costs 0.18 as
                  one kind and 0.08 as two, and the slopes point the first
                  position towards the second and away from it respectively.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Two real pairs through the trained network">
                <p>
                  The same arithmetic on real pictures, placed by the network
                  once it has been trained on pairs. Two held-out crosses land
                  close together and a cross and a square land far apart, and the
                  loss treats each pair the way its label says.
                </p>
                <WorkedPairBoard />
                <p className={caption}>
                  Both pairs share the same first cross. Each pair&rsquo;s eight
                  numbers are drawn side by side, and the table gives the gap the
                  loss reads.
                </p>
                <WorkedExample title="The two pairs, by hand">
                  <>
                    <p>
                      The two cross embeddings are about 0.1536 apart. With margin one,
                      compare the losses for a same-kind label and a different-kind
                      label.
                    </p>
                    <Equation>{"same-kind loss ≈ ½ × 0.1536² ≈ 0.0118\ndifferent-kind shortfall ≈ 1 − 0.1536 = 0.8464\ndifferent-kind loss ≈ ½ × 0.8464² ≈ 0.3582"}</Equation>
                    <p>
                      The cross and square are about 1.5737 apart, beyond the margin.
                      Their different-kind loss is zero; calling them the same kind
                      would cost about 1.2382. The learned positions separate these two
                      comparisons much more than raw pixel distance does.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  Trained on pairs, two crosses end up 0.1536 apart and a cross
                  and a square 1.5737 apart, past the margin. By pixels the two
                  distances differ by a factor of 1.18.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. One Network, Two Pictures",
          content: (
            <>
              <SubSection title="9. Both pictures go through the same weights">
                <p>
                  The loss needs a position for each picture of a pair, so each
                  picture is run through the network, and it is the same network
                  both times. Drawn out, that looks like two identical towers
                  joined at the top by the distance, which is why the arrangement
                  is called a Siamese network, though there is only one set of
                  weights and nothing about it is doubled except the drawing.
                </p>
                <p>
                  Using one set of weights is forced by what a distance has to
                  be. If the two pictures
                  went through different networks, the distance from a to b would
                  differ from the distance from b to a, and a picture&rsquo;s
                  position would depend on which side of a pair it happened to be
                  shown on, so there would be no single place to put it when it is
                  later searched for.
                </p>
                <KeepInMind>
                  A Siamese network is one network used twice, which keeps the
                  distance symmetric and gives every picture one position.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Walking the pair loss down each picture’s copy">
                <p>
                  The loss of one pair is a function of two positions, and each
                  position is a function of the same weights. Training needs the
                  slope of the loss with respect to each weight, which the chain
                  rule gives as one term through each picture.
                </p>
                <Equation>
                  {"∂L/∂W = (∂L/∂p(a)) · (∂p(a)/∂W) + (∂L/∂p(b)) · (∂p(b)/∂W)"}
                </Equation>
                <p>
                  Each term is an ordinary backward pass. The slope of the loss at
                  one picture&rsquo;s position arrives at the top layer, each layer
                  turns the slope at its answer into slopes for its own weights
                  and a slope at its input, and hands the second down to the layer
                  below, exactly as{" "}
                  <Link href="/concepts/backpropagation" className={link}>
                    backpropagation
                  </Link>{" "}
                  does for one picture. The layers themselves only know losses
                  that score one answer against a target, so the pair loss and its
                  slope at the two positions are computed outside the layers, and
                  the walk down each picture&rsquo;s copy is done by hand from
                  there.
                </p>
                <KeepInMind>
                  The slope of a pair&rsquo;s loss for any weight is the slope
                  through the first picture plus the slope through the second,
                  each found by an ordinary backward pass started from that
                  picture&rsquo;s share of the pair loss.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. A weight used twice has two slopes, and they add">
                <p>
                  That the two slopes should be added is the whole point of the
                  arrangement, and it is easy to get wrong, by stepping each copy
                  on its own slope and ending up with two copies that no longer
                  agree. The check is to nudge a weight up and down by a tiny
                  amount, run both pictures through the nudged network again, and
                  measure how much the pair loss changed. That measurement knows
                  nothing about copies.
                </p>
                <SharedWeightsCheck />
                <p className={caption}>
                  Four pairs through the untrained network. For each of five
                  weights, the slope through each picture&rsquo;s copy, their sum,
                  and the slope measured by nudging.
                </p>
                <p>
                  On four pairs through the untrained network, with a mean loss of
                  0.2056, the summed slope and the measured one agree on every
                  weight checked, in both convolutions, the hidden layer and the
                  last layer, to within 1.1 &times; 10&#8315;&sup1;&sup1;, with the
                  weight nudged by 10&#8315;&#8309; each way. Either copy&rsquo;s
                  slope alone is wrong by between 0.0136 and 0.1462. Here one
                  network is run twice and stepped once, with the sum, so there is
                  only ever one copy of every weight to step.
                </p>
                <KeepInMind>
                  The slope of a weight used by both pictures is the sum of its
                  two slopes, and a finite difference of the pair loss agrees with
                  that sum to about 10&#8315;&sup1;&sup1; while either copy alone
                  is off by as much as 0.1462.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The last layer’s biases learn nothing">
                <p>
                  The last row of the table above is a bias of the layer that
                  produces the position, and its summed slope is exactly zero,
                  not merely small. Through the first pictures&rsquo; copy its
                  slope is 0.1462 and through the second it is &minus;0.1462. The
                  reason is that a bias adds the same amount to every position, and
                  the loss only ever reads the difference between two positions.
                </p>
                <Equation>
                  {"(p(a) + c) − (p(b) + c) = p(a) − p(b)"}
                </Equation>
                <p>
                  So a shift applied to every position changes no distance and no
                  loss, and nothing in training can decide where the collection
                  as a whole sits. The same is true of turning or reflecting every
                  position together. This is why the drawing at the top of the
                  page moves the middle of the collection to the origin before it
                  measures any direction, and it comes back in the last Part.
                </p>
                <KeepInMind>
                  The pair loss reads only differences, so a shift of every
                  position is invisible to it, and the last layer&rsquo;s biases
                  get a slope of exactly zero from every pair.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Every pair in a batch at once">
                <p>
                  Walking two copies for every pair would cost two forward and
                  two backward passes per pair. Training here takes eight
                  pictures of each of three kinds, 24 pictures in a batch, which
                  hold 276 pairs, 84 of them of one kind and 192 of two, and runs
                  the 24 pictures through once.
                </p>
                <Equation>
                  {"∂(Σ over pairs Lᵢⱼ) / ∂p(k) = Σ over the pairs that contain k of ∂Lᵢⱼ / ∂p(k)"}
                </Equation>
                <p>
                  Because the slope of a sum is the sum of the slopes, a
                  picture&rsquo;s slope from every pair it belongs to can be added
                  at its position first, and then one backward pass over the 24
                  pictures gives the same gradient that 276 pairs of separate
                  walks would have summed to. Each picture appears in 23 pairs and
                  is walked down once. That is the two copies&rsquo; sum from step
                  11 again, computed once per picture instead of once per pair.
                </p>
                <KeepInMind>
                  A batch of 24 pictures holds 276 pairs, and adding each
                  picture&rsquo;s slopes from all 23 of its pairs before one
                  backward pass gives the same gradient as 276 separate pairs.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "Searched among all 300 pictures, the reference classifier’s layer finds the right kind for far fewer squares than for crosses, discs or bars.",
              true,
              "It gives a nearest neighbour of the right kind to 56 crosses, 58 discs and 59 bars of 60, and to only 40 squares. The rings it was never shown land among the squares and take their places as nearest neighbours, which is the whole point about a ruler borrowed from a classifier.",
            ),
            choice(
              "Both pictures of a pair go through one set of weights. What forces that?",
              [
                "Two separate networks would make the distance from a to b differ from the distance from b to a, and a picture’s position would depend on which side of a pair it was shown on",
                "Two separate networks would be twice as expensive to train",
                "The contrastive loss cannot be differentiated through two different networks",
                "Only one of the two pictures of a pair carries a label",
              ],
              0,
              "A distance has to be symmetric and a picture has to have one position, or there is no single place to put it when it is later searched for. The cost argument is real but secondary, and the loss would differentiate perfectly well through two towers. Nothing about the arrangement is doubled except the drawing.",
            ),
            trueFalse(
              "The slope of a weight for one pair can be taken from either picture’s backward pass, since both pass through the same weights.",
              false,
              "The slope is the sum of the two, one term through each picture. Checked by nudging a weight up and down, the summed slope agrees with the measured one to within 1.1 times ten to the minus eleven, while either copy alone is wrong by between 0.0136 and 0.1462. Stepping each copy on its own slope is the mistake the arrangement invites. The one place the two copies cancel exactly is the biases of the layer that produces the position, 0.1462 through one picture and minus 0.1462 through the other, because a bias shifts every position alike and the loss reads only differences.",
            ),
            choice(
              "Two positions sit 0.6 apart and the margin is 1. What does the pair cost as one kind, and what as two?",
              [
                "0.18 as one kind and 0.08 as two",
                "0.08 as one kind and 0.18 as two",
                "0.6 as one kind and 0.4 as two",
                "0.18 as one kind and nothing as two, since the pair is past the margin",
              ],
              0,
              "As one kind the loss is half the squared distance, half of 0.36, and as two it is half the squared shortfall from the margin, half of 0.4 squared. The slopes at the first position are the gap itself, (−0.36, −0.48), pulling it towards the second, and (0.24, 0.32), pushing it away. Only past the margin does a pair of two kinds cost nothing, which at this margin takes a distance of 1 or more, and moving the second position out to a distance of 2 does it.",
            ),
            trueFalse(
              "The margin of 1 was chosen before any margin was compared, because the untrained positions already sit 0.7325 apart on average.",
              true,
              "A margin of 1 is a distance the network nearly reaches before training starts, so the positions do not have to be dragged to a new scale before they can be arranged. Part 5 then compares margins, and finds the comparison only works once the step size is divided by the square of the margin, which is a reason not to have picked the margin by training several and keeping the best.",
            ),
        ],
        },
        {
          title: "Part 4. Does The Distance Reach A Kind It Never Saw?",
          content: (
            <>
              <SubSection title="14. Training on three kinds and holding the bar back">
                <p>
                  To ask whether a distance learned from sameness reaches new
                  kinds, the network is trained on pairs of crosses, squares and
                  discs only, 180 training pictures, and the bar is held back
                  along with the ring. For a fair comparison a classifier of the
                  reference design is trained on the same 180 pictures to name the
                  same three kinds, from the same starting weights, and its layer
                  of sixteen is read the way the neighbouring page reads it.
                </p>
                <p>
                  Both train properly. The pair loss falls from 0.1351 in the first
                  epoch to 0.0122 in the fortieth, and the three-kind classifier
                  names 0.9778 of the held-out pictures of its three kinds
                  correctly. So four spaces are compared, the pixels, the
                  reference classifier&rsquo;s layer (which was shown bars), the
                  three-kind classifier&rsquo;s layer and the positions trained on
                  pairs, and every number depending on training is given for
                  weight seeds 0, 1 and 2. The widgets draw seed 0 unless a button
                  says otherwise.
                </p>
                <KeepInMind>
                  Two networks learn from the same 180 pictures of three kinds,
                  one trained on pairs and one trained to name the kinds, and both
                  are then asked about bars and rings they never saw.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Among the kinds it was trained on, it keeps up">
                <p>
                  First the easy question. Searching only among the 180 held-out
                  pictures of crosses, squares and discs, so that no picture of an
                  unseen kind can be anyone&rsquo;s nearest, the positions trained
                  on pairs do about as well as the classifier&rsquo;s layer.
                </p>
                <MetricComparisonLedger view="seen" />
                <p className={caption}>
                  Nearest neighbours of the right kind among the held-out pictures
                  of the three trained kinds only, for each seed.
                </p>
                <p>
                  On seed 0 the positions give 171 of 180 pictures a nearest
                  neighbour of their own kind against the three-kind
                  classifier&rsquo;s 179, and on seed 2 they are ahead, 178 against
                  176. Seed 1 is the weak one, 157 against 174. The pixels manage
                  144 and the reference classifier 174.
                </p>
                <KeepInMind>
                  On the kinds it was trained on, the distance learned from pairs
                  finds the right kind for 157 to 178 of 180 pictures across three
                  seeds, against 174 to 179 for the classifier&rsquo;s layer.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. The held-back bar lands among the crosses">
                <p>
                  Now the bars and rings join the search, 300 pictures in all.
                  This is where the claim for the method is made, and on these
                  pictures it did not hold. A held-back bar finds another bar as
                  its nearest picture far less often in the positions trained on
                  pairs than in the three-kind classifier&rsquo;s layer, and the
                  bars also spoil the crosses.
                </p>
                <MetricComparisonLedger />
                <p className={caption}>
                  Every kind in every space, searched among all 300. Amber cells
                  are kinds that space&rsquo;s network never saw. The reading
                  buttons change what each cell measures.
                </p>
                <>
<p>
                  In the positions trained on pairs 33, 27 and 34 bars of 60 find a bar across the three seeds, where the three-kind classifier&rsquo;s layer gives 52, 51 and 53 and the raw pixels 54. The crosses suffer too. Searched among their own three kinds 56 crosses found a cross, and with the bars and rings added only 39 do, because the network, having never been asked where a bar should go, puts many of them where the crosses are.
                </p>
                <p>
                  The playground at the top shows it; take a bar and look at its five nearest.
                </p>
</>
                <KeepInMind>
                  A held-back bar finds a bar for 27 to 34 of 60 in the positions
                  trained on pairs, against 51 to 53 in a classifier&rsquo;s layer
                  trained on the same three kinds and 54 by pixels.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The rings do worse than by pixels">
                <p>
                  The ring is the stricter test, since no network on this page
                  saw one, the classifiers included. It is also the place where
                  the method is plainly worse than doing nothing, which is worth
                  stating as found rather than explaining away.
                </p>
                <p>
                  In the positions trained on pairs 33, 33 and 39 rings of 60 find
                  another ring across the three seeds. The three-kind
                  classifier&rsquo;s layer gives 46, 51 and 43, the reference
                  classifier 43, and the raw pixels 44. So on every seed the
                  distance trained directly for sameness gathers the unseen kind
                  less well than comparing the pictures pixel by pixel.
                </p>
                <KeepInMind>
                  Rings find a ring for 33 to 39 of 60 in the positions trained on
                  pairs, below the 44 of raw pixels on every seed and below the 43
                  to 51 of a classifier&rsquo;s layer.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Whichever kind is held back">
                <p>
                  The bar might simply be a hard kind to hold back. It is not the
                  reason. Holding back the cross, the disc or the square instead,
                  each on seed 0, gives the same picture, and a wider answer does
                  not rescue it either.
                </p>
                <NumberTable
                  headings={["held back", "finds its own kind, pairs", "finds its own kind, classifier", "rings, pairs", "rings, classifier"]}
                  rows={[
                    ["bar", "33 of 60", "52 of 60", "33 of 60", "46 of 60"],
                    ["cross", "21 of 60", "44 of 60", "38 of 60", "43 of 60"],
                    ["disc", "29 of 60", "47 of 60", "31 of 60", "47 of 60"],
                    ["square", "30 of 60", "46 of 60", "35 of 60", "44 of 60"],
                  ]}
                  caption="Seed 0, searched among all 300. The classifier is the one trained to name the same three kinds. The study buttons on the table in step 16 show each row in full."
                />
                <p>
                  The positions have eight numbers where the classifier&rsquo;s
                  layer has sixteen, so I retrained the pair network on seed 0
                  answering with sixteen. Its bars find a bar 31 times of 60 where
                  the eight-number version managed 33, and its crosses 37 times
                  where it managed 39. Its rings do better, 43 of 60 against 33,
                  which matches the reference classifier and is still below the
                  pixels. So the narrower answer costs the rings something and is
                  not what goes wrong with the held-back kind.
                </p>
                <KeepInMind>
                  Whichever of the four kinds is held back, it finds its own kind
                  21 to 33 times of 60 in the positions trained on pairs against 44
                  to 52 in the classifier&rsquo;s layer, and sixteen numbers
                  instead of eight does not change that.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A reading on which the pairs win, and why it misleads">
                <p>
                  There is a way of reading the same positions that makes the
                  method look as advertised. Take a kind&rsquo;s mean distance
                  between its own pictures and divide it by its mean distance to
                  every other picture. Lower is tighter, and on that reading the
                  rings are tighter in the positions trained on pairs than in the
                  three-kind classifier&rsquo;s layer in all six studies.
                </p>
                <Equation>
                  {"ratio(kind) = mean d inside the kind / mean d from the kind to everything else"}
                </Equation>
                <>
<p>
                  On seed 0 the ratio for rings is 0.5230 against 0.5984, on seed 1 0.4431 against 0.6945, and on seed 2 0.3532 against 0.7923, the opposite verdict to the nearest-neighbour count. The ratio has a confound. The pair loss pushes the three trained kinds a margin apart from each other, which makes the whole collection larger, and that enlarges every kind&rsquo;s distance to everything else, so the ratio falls for a kind that did not gather at all.
                </p>
                <p>
                  The nearest-neighbour count cannot be moved that way, and it is the question a search actually asks, which is why this page reads it first. The reading buttons on the table in step 16 show all three.
                </p>
</>
                <KeepInMind>
                  Divided by its distance to everything else, the ring&rsquo;s own
                  spread looks tighter in the positions trained on pairs on every
                  study, while its nearest neighbour is a ring less often, because
                  pushing the trained kinds apart lowers the ratio for every other
                  kind as well.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What The Margin Does",
          content: (
            <>
              <SubSection title="20. The margin is a unit of length">
                <p>
                  The margin looks like a setting that says how far apart kinds
                  should be, and it is less than that. Nothing about a position
                  has a natural size, so a network trained at a margin of 2 can
                  reach exactly the arrangement it would reach at a margin of 1,
                  with every position doubled.
                </p>
                <DerivationTable
                  expressionHeading="expression"
                  reasonHeading="what changed"
                  rows={[
                    {
                      expression: "d(c·p(a), c·p(b)) = c · d(p(a), p(b))",
                      reason: "multiply every position by c and every distance is multiplied by c.",
                    },
                    {
                      expression: "½ (c d)² = c² · ½ d²",
                      reason: "the pull at the scaled positions is c² times the pull at the old ones.",
                    },
                    {
                      expression: "½ max(0, c m − c d)² = c² · ½ max(0, m − d)²",
                      reason: "and the push at margin c m is c² times the push at margin m.",
                    },
                    {
                      expression: "L(c·p; c·m) = c² · L(p; m)",
                      reason: "so every arrangement costs the same at margin c m as it did at m, up to the one factor c².",
                    },
                  ]}
                />
                <p>
                  The loss surface at a margin of 2 is the one at a margin of 1,
                  stretched. What does not stretch is everything else. The
                  starting positions are the same size whatever the margin, and
                  the slopes reaching the lower layers grow with the margin, so at
                  one step size a larger margin takes larger steps. Dividing the
                  step size by the square of the margin undoes the c² and is the
                  fair way to compare margins.
                </p>
                <KeepInMind>
                  Scaling the margin by c scales the whole loss by c², so the
                  margin only sets a unit of length, and the step size has to be
                  divided by c² to compare margins fairly.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. At one step size, a larger margin freezes everything onto one point">
                <p>
                  Ignoring that has a striking consequence. Trained at the step
                  size that suits a margin of 1, a margin of 2 or 4 does not give
                  a wider arrangement. It gives none at all, because every
                  picture&rsquo;s position lands on the same point.
                </p>
                <MarginSweep />
                <p className={caption}>
                  The widget opens on a margin of 2 at the unchanged step size.
                  The loss stops falling and the mean distance between positions
                  drops to almost nothing; try a margin of 4, then switch the step
                  size to scaled.
                </p>
                <>
                  <p>
                    With margin two, all embedded positions collapse to nearly one point
                    by epoch fifteen. With margin four, they do so after the first
                    epoch. Once every distance is zero, same-kind pairs cost nothing and
                    different-kind pairs cost half the squared margin. There are 192
                    different-kind pairs among 276 pairs.
                  </p>
                  <Equation>{"mean loss at margin 2 = (192 / 276) × ½ × 2² ≈ 1.3913\nmean loss at margin 4 = (192 / 276) × ½ × 4² ≈ 5.5652"}</Equation>
                  <p>
                    Those are the losses where the runs stall. At exactly zero distance,
                    this implementation returns a zero positional gradient because the
                    distance has no unique direction there. The same failure occurs with
                    margin one half on seed one when the step size is raised to four.
                  </p>
                  <Equation>{"collapsed loss at margin 0.5 = (192 / 276) × ½ × 0.5² ≈ 0.0870"}</Equation>
                </>
                <KeepInMind>
                  Too large a step, whether from a larger margin or a larger step
                  size, can put every position on one point, where the loss is
                  stuck at the share of two-kind pairs times half the margin
                  squared, 1.3913 at a margin of 2.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. With the step size scaled, the margin changes little that holds up">
                <p>
                  With the step size divided by the margin squared, every margin
                  trains. The arrangement then really does scale with the margin,
                  and whatever else changes is small and changes its direction
                  from one seed to the next.
                </p>
                <NumberTable
                  headings={["margin, seed 0", "step size", "mean distance, one kind", "mean distance, two kinds", "rings finding a ring"]}
                  rows={[
                    ["0.5", "4", "0.2267", "0.6474", "32 of 60"],
                    ["2", "0.25", "0.5982", "2.8644", "44 of 60"],
                    ["4", "0.0625", "1.1180", "5.7965", "49 of 60"],
                  ]}
                  caption="Distances among held-out pictures of the three trained kinds; rings counted among all 300. The margin of 1 is the main study, where 33 rings find a ring."
                />
                <p>
                  On seed 0 the rings improve steadily with the margin, from 32 of
                  60 to 49, and at a margin of 4 they beat the pixels&rsquo; 44. It
                  is tempting to conclude that a wide margin keeps room for the
                  unseen. The seed buttons on the widget above say otherwise,
                  since on seeds 1 and 2 the rings at a margin of 4 do no better
                  than at 2, and on seed 1 a margin of 0.5 freezes. I would not
                  trust any trend in the margin from three seeds of this size.
                </p>
                <KeepInMind>
                  With the step size scaled, a larger margin gives a larger
                  arrangement of much the same shape, and the one improvement seen
                  on seed 0, 49 rings of 60 at a margin of 4, did not hold on the
                  other seeds.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Why The Push Is Needed",
          content: (
            <>
              <SubSection title="23. With pairs of one kind only, everything falls onto one point">
                <p>
                  Pairs of one kind are the ones that say what sameness is, so it
                  is natural to wonder whether the pairs of two kinds are needed at
                  all. They are, and the measurement is immediate. Trained on the
                  same batches with every two-kind pair left out, from the same
                  starting weights, the network does the one thing that satisfies
                  every pull at once, which is to give every picture the same
                  position.
                </p>
                <CollapseChart />
                <p className={caption}>
                  The two runs share their starting weights and their batches.
                  Only the pairs of two kinds differ.
                </p>
                <p>
                  The mean distance between positions starts at 0.7325 in both
                  runs. With pulls only it is 0.0393 after one epoch and 0.0018
                  after forty, while the ordinary run ends at 0.8284. The collapsed
                  positions still differ in their last digits, so a nearest
                  neighbour can still be found, and it means almost nothing. The
                  share of each picture&rsquo;s ten nearest that are its own kind
                  falls to 0.2917 for crosses, 0.3000 for squares and 0.2633 for
                  discs, close to the one in five that a picture chosen at random
                  from the other 299 would give.
                </p>
                <KeepInMind>
                  Without pairs of two kinds the positions shrink from 0.7325
                  apart to 0.0018 in forty epochs, and what order is left among
                  them is barely better than chance.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The loss calls the collapse a success">
                <p>
                  The alarming part is what the loss says while this happens. The
                  run with pulls only reaches a mean loss of 0.0000078 by the
                  fortieth epoch, where the ordinary run ends at 0.0122, so by its
                  own measure the collapsed network is more than a thousand times
                  better trained.
                </p>
                <WhyThisWorks title="Why every constant answer is a perfect answer">
                  <>
<p>
                    With pulls only, the loss is a sum of squared distances, so it is never negative, and it is exactly zero for any network that gives every picture one and the same position, whatever that position is. Such a network exists in this design without any help, since setting the last layer&rsquo;s weights to zero does it, and descent finds its way towards one.
                  </p>
                  <p>
                    The push is the only term that a constant answer fails, since it charges half the margin squared for every pair of two kinds sitting on top of each other. Hadsell, Chopra and LeCun gave exactly this argument for including it.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  With pulls only, a network that answers every picture with one
                  point has a loss of zero, so a falling loss is no evidence that
                  a distance has been learned.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "Trained on pairs of crosses, squares and discs, how did the learned distance do on the held-back bars once all 300 pictures were searched?",
              [
                "Better than the three-kind classifier’s layer and better than raw pixels",
                "Better than raw pixels but behind the classifier’s layer",
                "Behind both, with 27 to 34 bars of 60 finding a bar against 51 to 53 and 54",
                "About level with both, within a few pictures of 60",
              ],
              2,
              "This is where the claim for the method is made and on these pictures it did not hold. The crosses suffer as well, falling from 56 to 39 once the bars join the search, because a network never asked where a bar should go puts many of them where the crosses are. The rings are worse still, 33 to 39 of 60 against the 44 of raw pixels on every seed, and answering with sixteen numbers instead of eight does not change the verdict, 31 bars of 60 against the eight-number version’s 33.",
            ),
            several(
              "Searched only among the 180 held-out pictures of crosses, squares and discs, so that no unseen kind can be anyone’s nearest, which of these hold?",
              [
                "On seed 0 the positions trained on pairs give 171 of 180 pictures a nearest neighbour of their own kind, against 179 for the three-kind classifier’s layer",
                "On seed 2 the positions are ahead of the three-kind classifier, 178 against 176",
                "The raw pixels do better than either network on this search",
                "Seed 1 is the pair tower’s strongest seed",
              ],
              [0, 1],
              "On the kinds it was trained on, the distance learned from pairs finds the right kind for 157 to 178 of 180 across the three seeds against 174 to 179 for the classifier’s layer, so it is not a weak tower. Seed 1 is its weak seed, 157 against 174, and the pixels manage only 144. What goes wrong is where it puts what it was never shown, which is the next question.",
            ),
            choice(
              "Measured as a kind’s mean distance inside itself divided by its mean distance to everything else, the rings look tighter in the pair-trained positions in all six studies. Why is that not the verdict the page takes?",
              [
                "The ratio is a confound, since pushing the three trained kinds a margin apart enlarges every kind’s distance to everything else and so lowers the ratio for a kind that did not gather at all",
                "The ratio was only measured on seed 0, so it says nothing about the other seeds",
                "A ratio of distances is not a distance and cannot be compared across spaces",
                "The ratio excludes the rings’ nearest neighbours, which is the quantity a search reads",
              ],
              0,
              "A nearest-neighbour count cannot be moved by enlarging the whole collection, and it is the question a search actually asks, which is why the page reads it first. The ratio for rings is 0.5230 against 0.5984 on seed 0 and 0.3532 against 0.7923 on seed 2, the opposite verdict to the count on every seed.",
            ),
            choice(
              "Trained at the step size that suits a margin of 1, a margin of 2 puts every position on one point by the fifteenth epoch. What has gone wrong?",
              [
                "Scaling the margin by c scales the whole loss by c squared, so the slopes reaching the lower layers grow and the unchanged step size is now too large",
                "A margin of 2 is further apart than the network is able to push two positions",
                "Same-kind pairs outnumber different-kind pairs once the margin is widened",
                "The margin of 2 leaves the different-kind pairs satisfied from the first epoch, so nothing pushes",
              ],
              0,
              "The margin only sets a unit of length, so the arrangement reachable at a margin of 2 is the one at a margin of 1 with every position doubled. What does not stretch is the starting positions and the step size, which is why the step size has to be divided by the square of the margin to compare margins fairly. The stalled run sits at a mean loss of 1.3913, the share of two-kind pairs times half the squared margin.",
            ),
            trueFalse(
              "With every different-kind pair left out, the loss fell to 0.0000078 by the fortieth epoch because every picture had been given nearly the same position, not because a better distance had been learned.",
              true,
              "With pulls only the loss is a sum of squared distances, so zero is reached by any network that answers one point for every picture, and setting the last layer’s weights to zero does it. The mean distance between positions dropped from 0.7325 to 0.0018 while the ordinary run ended at 0.8284, and the share of a picture’s ten nearest that are its own kind fell to around 0.26 to 0.30, close to what a picture chosen at random would give. A falling loss is no evidence that a distance has been learned.",
            ),
        ],
        },
        {
          title: "Part 7. What The Pairs Cost",
          content: (
            <>
              <SubSection title="25. Pairs grow with the square of the pictures">
                <p>
                  A classifier learns from each picture once per epoch. A loss over
                  pairs has one term for every two pictures, and the number of
                  pairs grows with the square of the number of pictures, which is
                  harmless at the scale of this page and decisive at the scale of
                  a real collection.
                </p>
                <Equation>
                  {"pairs among n pictures = n (n − 1) / 2"}
                </Equation>
                <PairCostLedger />
                <p className={caption}>
                  Left, the pairs among this page&rsquo;s training pictures and
                  what one training actually computed. Right, how the count grows.
                </p>
                <p>
                  The 180 training pictures make 16,110 pairs, of which 5,310 are
                  of one kind and 10,800 of two. A thousand pictures make 499,500
                  and a million make 499,999,500,000, so at any real size most
                  pairs are never looked at, and which pairs are shown becomes a
                  decision rather than a detail.
                </p>
                <KeepInMind>
                  180 pictures make 16,110 pairs and a million make nearly half a
                  trillion, so a loss over pairs can only ever be trained on a
                  chosen fraction of its terms.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. What one training computed">
                <p>
                  At this size the training can afford to visit almost every
                  pair. Forty epochs of seven batches of 276 pairs compute 77,280
                  pair losses, and those cover 16,015 of the 16,110 different pairs,
                  0.9941 of them. In the run I measured the forty epochs took
                  about 1.4 seconds against about 2.3 for the three-kind
                  classifier, since batching every pair makes each step one pass
                  over 24 pictures; the widget above reports the times on whatever
                  machine answers, and they will differ.
                </p>
                <KeepInMind>
                  One training computed 77,280 pair losses covering 0.9941 of all
                  16,110 pairs, which is possible only because the collection is
                  small.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Most pairs of two kinds stop teaching">
                <p>
                  Of the pairs that are computed, most soon contribute nothing. A
                  pair of two kinds past the margin has a loss of zero and a slope
                  of zero, and once training has done its work that describes
                  most of them. At the end, 0.7909 of all two-kind pairs among the
                  training pictures are past the margin, and 0.6620 among the
                  held-out ones, so roughly four in five of the pushes each batch
                  computes are multiplications by zero.
                </p>
                <p>
                  That is the problem FaceNet met at scale and answered with a
                  change of loss and a search. Its loss takes a triplet, a picture,
                  another of the same kind and one of a different kind, and asks
                  that the first two be nearer than the first and third by a
                  margin α.
                </p>
                <Equation>
                  {"L = max(0, ‖p(a) − p(same)‖² − ‖p(a) − p(different)‖² + α)"}
                </Equation>
                <p>
                  Its authors then chose, within each batch, the different-kind
                  pictures that were close enough to still violate the margin but
                  not closer than the same-kind one, because random triplets were
                  almost all satisfied already. None of that is built on this
                  page; with 180 pictures every pair can simply be visited.
                </p>
                <KeepInMind>
                  By the end of training 0.7909 of the two-kind training pairs are
                  past the margin and teach nothing, which is why methods at scale
                  search for the pairs or triplets that still do.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Where The Method Stops Being Defined",
          content: (
            <>
              <SubSection title="28. What the loss leaves undecided">
                <p>
                  A loss that reads only distances cannot tell apart two
                  arrangements that have the same distances. Shifting every
                  position by one amount, turning the whole arrangement, or
                  reflecting it leaves every distance unchanged and so every loss,
                  and step 12 measured the first of these as a slope of exactly
                  zero on the last layer&rsquo;s biases. A trained position is
                  therefore defined only up to a rigid motion, and a single
                  coordinate of it means nothing.
                </p>
                <p>
                  Two consequences follow. Positions from two separate trainings
                  cannot be compared with each other at all, since each training
                  settles on its own orientation, and a direction measured from
                  the origin is an accident of the starting weights, which is why
                  the drawing at the top measures directions from the middle of
                  the collection instead.
                </p>
                <KeepInMind>
                  The pair loss fixes distances and nothing else, so a position is
                  defined only up to a shift, a turn and a reflection of the whole
                  arrangement.
                </KeepInMind>
              </SubSection>

              <SubSection title="29. The degenerate cases, one by one">
                <p>
                  The method asks for two things of its data, pairs of both
                  labels, and labels that some arrangement of points could satisfy.
                  Where either fails, the loss does not become an approximation.
                  It becomes a quantity with no single minimiser, or a slope that
                  is not defined, and the table says which and what has to be
                  decided.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "two kinds at distance zero",
                      reason: "the loss is ½ m², and its slope, −((m − d)/d) times a gap of zero, is a zero over a zero. The push has a size and no direction, and by symmetry any function of distance alone has none there. The choices are to return no slope, which leaves a frozen arrangement frozen, as Part 5 measured, or to pick a direction at random, which breaks the tie and makes the step depend on the draw.",
                    },
                    {
                      expression: "a margin of zero",
                      reason: "max(0, 0 − d) is zero for every pair, so the push term vanishes and only the pulls are left, which is the next row.",
                    },
                    {
                      expression: "no pairs of two kinds",
                      reason: "every constant answer has a loss of exactly zero, so the minimiser is not unique and none of the minimisers is a distance. Measured here, the positions fell from 0.7325 apart to 0.0018 in forty epochs.",
                    },
                    {
                      expression: "no pairs of one kind",
                      reason: "the loss is zero as soon as every pair of two kinds is a margin apart, and nothing asks pictures of one kind to be near each other, so a kind can be spread anywhere that keeps its distance from the others. Many arrangements are perfect, and most of them are useless for search.",
                    },
                    {
                      expression: "a kind with one picture",
                      reason: "that picture has no pair of one kind, so only pushes act on it. It is kept a margin from everything else and never gathered with anything, which is the previous row for a single kind.",
                    },
                    {
                      expression: "sameness that is not transitive",
                      reason: "if a and b are judged one kind, b and c one kind, and a and c two kinds, the triangle inequality gives d(a, c) ≤ d(a, b) + d(b, c). Pulling both pairs to zero puts a and c on one point, which the margin forbids, so no arrangement has a loss of zero, and how the conflict is split depends on how many such pairs there are.",
                    },
                    {
                      expression: "a margin without a scale",
                      reason: "the loss at margin c m is c² times the loss at m for positions scaled by c, so a margin has no meaning apart from the scale of the starting weights and the step size. Quoting a margin alone says nothing about how far apart kinds end up.",
                    },
                    {
                      expression: "a kind that appears in no pair",
                      reason: "its positions are defined, since the network answers any picture, and the loss never said anything about them. Measured here, held-back bars found a bar 27 to 34 times of 60, where the pixels manage 54.",
                    },
                    {
                      expression: "positions from two trainings",
                      reason: "undefined as a comparison, since each training fixes its arrangement only up to a rigid motion of its own.",
                    },
                    {
                      expression: "two pictures exactly as near",
                      reason: "a nearest neighbour is not unique, so a rule must choose, and any rule is arbitrary. In a collapsed arrangement nearly every nearest neighbour is such a tie.",
                    },
                  ]}
                />
                <KeepInMind>
                  Every row comes from the same fact, that the contrastive loss is a
                  statement about distances between pairs it was shown. It is
                  undefined where a distance is zero and has no direction, has no
                  single answer where one label is missing or the labels cannot
                  all be met, and says nothing about pictures of kinds no pair
                  contained.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 and 8",
          quiz: [
            choice(
              "By the end of training, 0.7909 of the two-kind pairs among the training pictures are past the margin. What follows?",
              [
                "Roughly four in five of the pushes each batch computes are multiplications by zero",
                "The loss can no longer fall, since most pairs are satisfied",
                "Those pairs are dropped from the batch, which is why a step is cheap",
                "The margin should be widened until every pair contributes again",
              ],
              0,
              "A two-kind pair past the margin has a loss of zero and a slope of zero, so computing it teaches nothing. That is the problem FaceNet met at scale and answered with a triplet loss and a search for the different-kind pictures still violating the margin. None of that is built here, because with 180 pictures every pair can simply be visited.",
            ),
            choice(
              "How many pairs do the 180 training pictures make?",
              ["16,110", "5,310", "10,800", "499,500"],
              0,
              "Pairs among n pictures number n times n minus 1 over 2, which for 180 is 16,110, of which 5,310 are of one kind and 10,800 of two. A thousand pictures make 499,500 and a million nearly half a trillion, so at any real size most pairs are never looked at and which pairs are shown becomes a decision. At this size the forty epochs computed 77,280 pair losses and met 16,015 of the 16,110 different pairs.",
            ),
            several(
              "Which of these changes to a trained arrangement leave every distance, and therefore the loss, unchanged?",
              [
                "Shifting every position by one amount",
                "Turning the whole arrangement",
                "Reflecting the whole arrangement",
                "Doubling every position",
              ],
              [0, 1, 2],
              "A shift, a turn and a reflection are rigid motions, and a loss that reads only distances cannot tell them apart, which is why a single coordinate of a position means nothing. Doubling every position doubles every distance, which is exactly the change the margin makes, so it is visible to the loss rather than invisible to it.",
            ),
            trueFalse(
              "Positions from two separate trainings of this network can be compared with each other directly.",
              false,
              "They cannot be compared at all, because each training settles on its own orientation and a position is pinned down only up to a shift, a turn and a reflection. A direction measured from the origin is an accident of the starting weights, which is why the drawing at the top of the page moves the middle of the collection to the origin before measuring any direction.",
            ),
        ],
        },
        {
          title: "Practice. Training A Distance From Pairs Of Your Own",
          practice: [
            exercise(
              "Build the tower and cost two pairs before any training",
              ["Build the tower of Part 2, the shared picture network with its last layer replaced by eight numbers and no activation, and put a dozen pictures of your own through it, six crosses and six square outlines drawn at random positions. The script draws the pictures, builds the tower from the same starting weights the page uses, and lists every pair among the twelve. Write the distances.", "Part 2 found the untrained positions 0.7325 apart on average over the 300 evaluation pictures, and worked one pair by hand at a distance of 0.6, costing 0.18 as one kind and 0.08 as two at a margin of 1. Measure the mean distance over your 66 pairs, then cost the first two crosses, pictures 0 and 2, under both labels."],
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

# Read every picture's position off the stack and print the mean distance
# over the 66 pairs. Then take pictures 0 and 2, print their distance, and
# print what the pair would cost as one kind and as two at a margin of 1.`,
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

placed = np.asarray(start.respond_to(pictures).outputs)
gap = placed[firsts] - placed[seconds]
distance = np.sqrt((gap ** 2).sum(axis=1))
print(f"mean distance between two positions before training {distance.mean():.4f}")
apart = np.sqrt(((placed[0] - placed[2]) ** 2).sum())
print(f"the two crosses are {apart:.4f} apart")
print(f"as one kind the pair costs {0.5 * apart ** 2:.4f}")
print(f"as two kinds it costs {0.5 * max(0.0, 1.0 - apart) ** 2:.4f}")`,
              `mean distance between two positions before training 0.7209
the two crosses are 0.8736 apart
as one kind the pair costs 0.3816
as two kinds it costs 0.0080`,
              { hints: ["The stack's response has an outputs property holding the last layer's answer for every picture, so one respond_to on all twelve gives a 12 by 8 block of positions.", "firsts and seconds index the two pictures of every pair, so placed[firsts] minus placed[seconds] is every gap at once, and a distance is the square root of a gap's squared sum.", "The one-kind loss is half the squared distance, and the two-kind loss is half the squared shortfall from the margin, which is zero once the pair is a margin apart."], check: numberCheck("What is the mean distance between two positions before any training?", 0.7209, 0.001, "The untrained tower already spreads these twelve pictures 0.7209 apart on average, close to the 0.7325 the page measured on 300, which is why a margin of 1 is a distance the tower nearly reaches before training starts. The two crosses sit 0.8736 apart, so as one kind they cost 0.3816 and would be pulled together, while as two kinds they are only 0.1264 short of the margin and cost 0.0080.") },
            ),
            exercise(
              "Walk one pair down both towers and add the slopes",
              ["Part 3 says the slope of a weight used by both pictures of a pair is the sum of its two slopes, and that the last layer's biases get a summed slope of exactly zero. Check both on the two crosses. The one-kind loss has slope equal to the gap at the first position and minus the gap at the second, and each layer's correction_for turns the slope at its answer into its own gradient and the slope to pass down.", "Print the bias slopes of the position layer through each picture and their sum. Then pass each slope one layer further down, to the hidden layer of sixteen, and print its largest summed weight slope beside what either tower alone would have reported for that weight."],
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

# Respond to picture 0 and picture 2 separately and take the gap between
# their positions. Ask the last layer for its correction under the gap and
# under minus the gap, print the two bias slopes and their sum, then pass
# each correction down to the hidden layer and print its largest summed
# weight slope with the two towers' own entries for that weight.`,
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

first, second = start.respond_to(pictures[0:1]), start.respond_to(pictures[2:3])
gap = np.asarray(first.outputs) - np.asarray(second.outputs)
top_first = start[6].correction_for(first[6], gap)
top_second = start[6].correction_for(second[6], -gap)
biases_first = np.asarray(top_first.gradient.biases)
biases_second = np.asarray(top_second.gradient.biases)
print(f"position biases through the first cross {np.round(biases_first, 4)}")
print(f"position biases through the second cross {np.round(biases_second, 4)}")
print(f"summed {biases_first + biases_second}")
print(f"largest bias slope through one tower {np.abs(biases_first).max():.4f}")
hidden_first = start[5].correction_for(first[5], np.asarray(top_first.passed_down))
hidden_second = start[5].correction_for(second[5], np.asarray(top_second.passed_down))
one, other = np.asarray(hidden_first.gradient.weights), np.asarray(hidden_second.gradient.weights)
both = one + other
at = np.unravel_index(np.abs(both).argmax(), both.shape)
print(f"hidden weight {at}: summed {both[at]:.4f}, first tower {one[at]:.4f}, second tower {other[at]:.4f}")`,
              `position biases through the first cross [-0.0917  0.1554 -0.0964 -0.3105 -0.6528  0.1559 -0.2921 -0.2988]
position biases through the second cross [ 0.0917 -0.1554  0.0964  0.3105  0.6528 -0.1559  0.2921  0.2988]
summed [0. 0. 0. 0. 0. 0. 0. 0.]
largest bias slope through one tower 0.6528
hidden weight (np.int64(2), np.int64(115)): summed -0.3928, first tower 0.0814, second tower -0.4743`,
              { hints: ["A stack's response can be indexed by layer, so first[6] is the last layer's response to the first cross and start[6] the layer itself. correction_for takes that response and the slope arriving at its answer, which for the first picture is the gap and for the second minus the gap.", "A correction carries a gradient, with weights and biases, and the slope it passes down. The passed-down slope is what the hidden layer's correction_for reads next.", "The bias of a layer with no activation receives the arriving slope as it is, which is why the two towers' bias slopes are each other's negatives and cancel to exactly zero while the hidden layer's weight slopes do not."], check: numberCheck("What is the largest bias slope of the position layer through one tower alone?", 0.6528, 0.001, "Through the first cross the position layer's biases receive the gap itself, through the second cross minus the gap, so each slope is as large as 0.6528 on its own and the sum is zero in every coordinate, which is Part 3's 0.1462 and minus 0.1462 met on a pair of your own. One layer down the two towers no longer cancel and no longer agree, a summed slope of −0.3928 made of 0.0814 and −0.4743, so stepping either copy on its own slope would be wrong.") },
            ),
            exercise(
              "Train on every pair of the dozen",
              ["Train the tower on all 66 pairs among the twelve pictures for 40 passes, the way Part 3 describes, with each picture's slope from every pair it belongs to added at its position, one walk down the layers, and one step. The starter holds that loop, with the pair loss and its slope written out from Part 2. Write the measurement.", "Print the mean distance within a kind and across kinds, the share of two-kind pairs that are at or past the margin, and how many of the twelve have a nearest neighbour of their own kind. Part 7 found 0.7909 of the two-kind training pairs past the margin at the end of the page's training."],
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

stack = start
for epoch in range(40):
    response = stack.respond_to(pictures, PassPurpose.TRAINING)
    placed = np.asarray(response.outputs)
    gap = placed[firsts] - placed[seconds]
    distance = np.sqrt((gap ** 2).sum(axis=1))
    short = np.maximum(1.0 - distance, 0.0)
    loss = np.where(same, 0.5 * distance ** 2, 0.5 * short ** 2).mean()
    pull = np.where(same, 1.0, -short / np.where(distance == 0.0, 1.0, distance))
    slope = pull[:, None] * gap / len(gap)
    arriving = np.zeros_like(placed)
    np.add.at(arriving, firsts, slope)
    np.add.at(arriving, seconds, -slope)
    gradients = []
    for layer, layer_response in zip(reversed(stack), reversed(response)):
        correction = layer.correction_for(layer_response, arriving)
        gradients.append(correction.gradient)
        arriving = np.asarray(correction.passed_down)
    stack = stack.stepped_by(BackwardPass(loss=float(loss), gradients=gradients[::-1]), 1.0)

# Read every position off the trained stack and the distance of every pair.
# Print the mean distance over one-kind pairs and over two-kind pairs, the
# share of two-kind pairs at or past the margin of 1, and how many of the
# 12 pictures have a nearest other picture of their own kind.`,
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

stack = start
for epoch in range(40):
    response = stack.respond_to(pictures, PassPurpose.TRAINING)
    placed = np.asarray(response.outputs)
    gap = placed[firsts] - placed[seconds]
    distance = np.sqrt((gap ** 2).sum(axis=1))
    short = np.maximum(1.0 - distance, 0.0)
    loss = np.where(same, 0.5 * distance ** 2, 0.5 * short ** 2).mean()
    pull = np.where(same, 1.0, -short / np.where(distance == 0.0, 1.0, distance))
    slope = pull[:, None] * gap / len(gap)
    arriving = np.zeros_like(placed)
    np.add.at(arriving, firsts, slope)
    np.add.at(arriving, seconds, -slope)
    gradients = []
    for layer, layer_response in zip(reversed(stack), reversed(response)):
        correction = layer.correction_for(layer_response, arriving)
        gradients.append(correction.gradient)
        arriving = np.asarray(correction.passed_down)
    stack = stack.stepped_by(BackwardPass(loss=float(loss), gradients=gradients[::-1]), 1.0)

placed = np.asarray(stack.respond_to(pictures).outputs)
distance = np.sqrt(((placed[firsts] - placed[seconds]) ** 2).sum(axis=1))
print(f"mean distance within a kind {distance[same].mean():.4f}")
print(f"mean distance across kinds {distance[~same].mean():.4f}")
print(f"share of two-kind pairs past the margin {(distance[~same] >= 1.0).mean():.4f}")
table = np.sqrt(((placed[:, None, :] - placed[None, :, :]) ** 2).sum(axis=2))
np.fill_diagonal(table, np.inf)
print(f"nearest neighbour is its own kind for {(labels[table.argmin(axis=1)] == labels).sum()} of 12")`,
              `mean distance within a kind 0.0552
mean distance across kinds 0.9991
share of two-kind pairs past the margin 0.4444
nearest neighbour is its own kind for 12 of 12`,
              { hints: ["After the loop, stack is the trained tower and start is untouched, so the same respond_to that read the untrained positions reads the trained ones.", "same marks which of the 66 pairs are one kind, so distance[same] and distance[~same] split the pairs, and a two-kind pair past the margin is one whose distance is at least 1.", "For the nearest neighbour build the full 12 by 12 table of distances, set the diagonal to infinity so a picture cannot be its own nearest, and take each row's smallest."], check: numberCheck("What is the mean distance within a kind after training?", 0.0552, 0.001, "Forty passes pull the one-kind pairs from 0.7209 apart on average to 0.0552, and push the two-kind pairs out to 0.9991, which is the margin to within a hundredth, so every one of the twelve finds its own kind. 0.4444 of the two-kind pairs are at or past the margin and already teach nothing, the page's 0.7909 on a tower that trained longer on more pictures.") },
            ),
            exercise(
              "Leave out the pairs of two kinds",
              ["Part 6 trains the same tower on the same batches with every two-kind pair left out and watches every position fall onto one point. Do the same on the dozen. The starter is the training loop again; keep only the one-kind pairs before the loop runs, then measure what is left.", "On the page the mean distance between positions fell from 0.7325 to 0.0018 in forty epochs and the loss to 0.0000078, which by its own measure is a better-trained network than the ordinary run. Print the mean distance between positions before and after, the final loss, and how many of the twelve still find their own kind."],
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

# Keep only the pairs of one kind: cut firsts and seconds down to the pairs
# where same is true, and set same to all true for the pairs that remain.

stack = start
for epoch in range(40):
    response = stack.respond_to(pictures, PassPurpose.TRAINING)
    placed = np.asarray(response.outputs)
    gap = placed[firsts] - placed[seconds]
    distance = np.sqrt((gap ** 2).sum(axis=1))
    short = np.maximum(1.0 - distance, 0.0)
    loss = np.where(same, 0.5 * distance ** 2, 0.5 * short ** 2).mean()
    pull = np.where(same, 1.0, -short / np.where(distance == 0.0, 1.0, distance))
    slope = pull[:, None] * gap / len(gap)
    arriving = np.zeros_like(placed)
    np.add.at(arriving, firsts, slope)
    np.add.at(arriving, seconds, -slope)
    gradients = []
    for layer, layer_response in zip(reversed(stack), reversed(response)):
        correction = layer.correction_for(layer_response, arriving)
        gradients.append(correction.gradient)
        arriving = np.asarray(correction.passed_down)
    stack = stack.stepped_by(BackwardPass(loss=float(loss), gradients=gradients[::-1]), 1.0)

# Print the mean distance between positions before training (from start)
# and after (from stack), the final loss, and how many of the 12 have a
# nearest other picture of their own kind.`,
              `import numpy as np
from oop_ml import BackwardPass, Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, PassPurpose, RectifiedLinear

cross = np.zeros((16, 16))
cross[7:9, 4:12], cross[4:12, 7:9] = 1, 1
square = np.zeros((16, 16))
square[4:12, 4:12], square[5:11, 5:11] = 1, 0
draw = np.random.default_rng(0)
pictures, labels = [], []
for _ in range(6):
    for label, shape in enumerate((cross, square)):
        moved = np.roll(shape, draw.integers(-3, 4, size=2), axis=(0, 1))
        pictures.append(draw.uniform(0, 0.3) + draw.uniform(0.4, 0.7) * moved + draw.normal(0, 0.05, (16, 16)))
        labels.append(label)
pictures, labels = np.asarray(pictures)[:, None], np.asarray(labels)

weights = np.random.default_rng(0)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(8)]),
])
firsts, seconds = np.triu_indices(12, k=1)
same = labels[firsts] == labels[seconds]

firsts, seconds = firsts[same], seconds[same]
same = np.ones(len(firsts), dtype=bool)

stack = start
for epoch in range(40):
    response = stack.respond_to(pictures, PassPurpose.TRAINING)
    placed = np.asarray(response.outputs)
    gap = placed[firsts] - placed[seconds]
    distance = np.sqrt((gap ** 2).sum(axis=1))
    short = np.maximum(1.0 - distance, 0.0)
    loss = np.where(same, 0.5 * distance ** 2, 0.5 * short ** 2).mean()
    pull = np.where(same, 1.0, -short / np.where(distance == 0.0, 1.0, distance))
    slope = pull[:, None] * gap / len(gap)
    arriving = np.zeros_like(placed)
    np.add.at(arriving, firsts, slope)
    np.add.at(arriving, seconds, -slope)
    gradients = []
    for layer, layer_response in zip(reversed(stack), reversed(response)):
        correction = layer.correction_for(layer_response, arriving)
        gradients.append(correction.gradient)
        arriving = np.asarray(correction.passed_down)
    stack = stack.stepped_by(BackwardPass(loss=float(loss), gradients=gradients[::-1]), 1.0)

for name, tower in (("before", start), ("after", stack)):
    placed = np.asarray(tower.respond_to(pictures).outputs)
    table = np.sqrt(((placed[:, None, :] - placed[None, :, :]) ** 2).sum(axis=2))
    print(f"mean distance between positions {name} {table[~np.eye(12, dtype=bool)].mean():.4f}")
np.fill_diagonal(table, np.inf)
print(f"final loss {loss:.6f}")
print(f"nearest neighbour is its own kind for {(labels[table.argmin(axis=1)] == labels).sum()} of 12")`,
              `mean distance between positions before 0.7209
mean distance between positions after 0.0279
final loss 0.000434
nearest neighbour is its own kind for 5 of 12`,
              { hints: ["Indexing firsts and seconds by same keeps the 30 one-kind pairs and drops the 36 of two kinds, and after that every remaining pair is one kind, which is what the loop's same has to say.", "The loop leaves loss holding the last pass's mean pair loss, so it can be printed after the loop without being recorded along the way.", "The mean distance between positions is the mean of the full 12 by 12 table with its diagonal left out, which is the same number as the mean over the 66 pairs."], check: numberCheck("What is the mean distance between positions after training on one-kind pairs alone?", 0.0279, 0.001, "With nothing pushing, the pulls are all satisfied at once by giving every picture the same position, and forty passes take the twelve from 0.7209 apart to 0.0279, the page's 0.7325 to 0.0018 on a dozen pictures. The loss ends at 0.000434, lower than the 0.0008 the ordinary run reached, and only five of twelve still find their own kind, about what a coin would give. A falling loss is no evidence that a distance has been learned.") },
            ),
          ],
        },
      ]}
    />
  );
}
