import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
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
    "Train a network on pairs of pictures with the contrastive loss, one set of weights for both pictures, and measure whether the distance it learns carries to kinds it never saw.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const caption = "text-sm text-slate-500 dark:text-slate-400";

export default function LearningTheMetricPage() {
  return (
    <ConceptPage
      title="Learning the Metric Itself"
      tagline="Train a network on pairs of pictures with the contrastive loss, pulling two of one kind together and pushing two of different kinds a margin apart through one shared set of weights, and measure whether the distance it learns reaches kinds it was never shown."
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
      history={
        <>
          <p>
            The arrangement began with signatures. Jane Bromley, Isabelle Guyon,
            Yann LeCun, Eduard S&auml;ckinger and Roopak Shah, at AT&amp;T Bell
            Laboratories, described in &ldquo;Signature Verification using a
            &lsquo;Siamese&rsquo; Time Delay Neural Network&rdquo;, presented at
            the 1993 Neural Information Processing Systems conference, a system
            for checking a signature written on a pen tablet against the one a
            customer had given before. A classifier with one answer per customer
            was no use, since the customers were not known when the network was
            trained and new ones arrived all the time, and what the bank actually
            had was examples of sameness, genuine signatures beside each other
            and beside forgeries. So they ran both signatures through two copies
            of one network with the same weights, compared the two outputs, and
            trained the comparison, and the name for two identical towers joined
            at the top stuck.
          </p>
          <p>
            A second line of work learned the distance without a network. Eric
            Xing, Andrew Ng, Michael Jordan and Stuart Russell, at Berkeley,
            learned a reweighting of the coordinates from pairs a person had
            judged similar, in &ldquo;Distance Metric Learning, with Application
            to Clustering with Side-Information&rdquo; in 2002. Kilian
            Weinberger, John Blitzer and Lawrence Saul, at the University of
            Pennsylvania, presented large margin nearest neighbour classification
            in 2005, which learns a linear map under which each point&rsquo;s
            nearest neighbours of its own class sit closer than any point of
            another class by a fixed margin, and Weinberger and Saul gave the full
            account in 2009. That margin, a distance two kinds must be kept
            apart by and no more, is the idea this page&rsquo;s loss is built on.
          </p>
          <p>
            The loss in the form used here is from New York University. Sumit
            Chopra, Raia Hadsell and Yann LeCun trained a Siamese convolutional
            network on pairs of face photographs in 2005, and Hadsell, Chopra and
            LeCun wrote the contrastive loss down in &ldquo;Dimensionality
            Reduction by Learning an Invariant Mapping&rdquo; in 2006, half the
            squared distance for a pair of one kind and half the squared shortfall
            below a margin for a pair of two, and argued that the second half is
            what stops every input being mapped to one point. Florian Schroff,
            Dmitry Kalenichenko and James Philbin, at Google, replaced pairs with
            triplets in &ldquo;FaceNet&rdquo; in 2015, and found that most
            triplets already satisfied the margin and taught nothing, so the ones
            worth training on had to be searched for. On this page the kinds of
            picture stand where the customers and the faces stood, and the
            question those papers could not settle at their scale, whether a
            distance learned on some kinds is any good for kinds it never met,
            can be measured.
          </p>
        </>
      }
      playground={<PairSpacePlayground />}
      sections={[
        {
          title: "Part 1. The Problem With A Borrowed Ruler",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Four kinds of picture, and a question about sameness">
                <p>
                  Every picture on this page is sixteen pixels on a side with one
                  brightness per pixel, and holds one of four shapes, a cross, the
                  outline of a square, a filled disc or a diagonal bar, drawn at a
                  random position and size against a random background with a
                  little noise on every pixel. A fifth kind, a ring, is drawn only
                  when asked for, as a kind no network here is ever shown. We want
                  a distance between two pictures that is small when they are the
                  same kind and large when they are not, and the method on this
                  page trains that distance directly from pairs, where the usual
                  route borrows it from a network trained to name the kinds.
                </p>
                <p>
                  The page asks six questions, in order. What goes wrong with the
                  distance a classifier leaves behind, and why train a distance
                  from pairs at all? What does the contrastive loss ask of one
                  pair, worked by hand? How does one network serve both pictures
                  of a pair, and is the slope of a weight used twice really the
                  sum of its two uses? Trained on pairs of three kinds, does the
                  distance carry to the fourth kind and to rings, against the
                  vector borrowed from a classifier? What does the margin do, and
                  what happens with no pairs of different kinds at all? And what
                  does the method cost in pairs, before the last Part asks where
                  it stops being defined.
                </p>
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
          ),
        },
        {
          title: "Part 2. The Contrastive Loss",
          content: (
            <>
              <SubSection title="4. A network whose answer is a position">
                <p>
                  The network is the shared picture network with its last layer
                  replaced. Where the classifier ended in four scores, one per
                  kind, this one ends in eight numbers with no bend applied, and
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
                  <p>
                    The two crosses are 0.1536 apart, so as a pair of one kind
                    they cost half of 0.1536 squared, 0.0118, and if they had been
                    labelled two kinds they would cost 0.3582, half the square of
                    their 0.8464 shortfall. The cross and the square are 1.5737
                    apart, past the margin, so they cost nothing, and labelled one
                    kind they would cost 1.2382. By pixels the same pairs are
                    3.7191 and 4.3732 apart, so the pixels put the square only
                    1.18 times as far from the cross as the second cross, where
                    the positions put it 10.2 times as far.
                  </p>
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
                <p>
                  In the positions trained on pairs 33, 27 and 34 bars of 60 find a
                  bar across the three seeds, where the three-kind
                  classifier&rsquo;s layer gives 52, 51 and 53 and the raw pixels
                  54. The crosses suffer too. Searched among their own three kinds
                  56 crosses found a cross, and with the bars and rings added only
                  39 do, because the network, having never been asked where a bar
                  should go, puts many of them where the crosses are. The
                  playground at the top shows it; take a bar and look at its five
                  nearest.
                </p>
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
                <p>
                  On seed 0 the ratio for rings is 0.5230 against 0.5984, on seed 1
                  0.4431 against 0.6945, and on seed 2 0.3532 against 0.7923, the
                  opposite verdict to the nearest-neighbour count. The ratio has a
                  confound. The pair loss pushes the three trained kinds a margin
                  apart from each other, which makes the whole collection larger,
                  and that enlarges every kind&rsquo;s distance to everything else,
                  so the ratio falls for a kind that did not gather at all. The
                  nearest-neighbour count cannot be moved that way, and it is the
                  question a search actually asks, which is why this page reads it
                  first. The reading buttons on the table in step 16 show all
                  three.
                </p>
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
                <p>
                  At a margin of 2 the mean distance between positions is below a
                  thousandth by the fifteenth epoch, and at 4 it is there after
                  the first. The loss then stays at 1.3913 and 5.5652, and both are
                  a number that can be predicted. With every position on one point
                  every distance is zero, so a pair of one kind costs nothing and a
                  pair of two kinds costs half the margin squared, and 192 of each
                  batch&rsquo;s 276 pairs are of two kinds, which gives 192/276
                  &times; 2 = 1.3913 and 192/276 &times; 8 = 5.5652. Nothing
                  restores the arrangement, because at distance zero the push has a
                  size and no direction to point in. The same freezing happened at
                  a margin of 0.5 on seed 1, where scaling the step size up to 4
                  was too large a step, and there the loss stays at 192/276 &times;
                  0.125.
                </p>
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
                  <p>
                    With pulls only, the loss is a sum of squared distances, so it
                    is never negative, and it is exactly zero for any network that
                    gives every picture one and the same position, whatever that
                    position is. Such a network exists in this design without any
                    help, since setting the last layer&rsquo;s weights to zero does
                    it, and descent finds its way towards one. The push is the only
                    term that a constant answer fails, since it charges half the
                    margin squared for every pair of two kinds sitting on top of
                    each other. Hadsell, Chopra and LeCun gave exactly this
                    argument for including it.
                  </p>
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
      ]}
    />
  );
}
