import { pageMetadata } from "@/lib/seo";
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

export const metadata: Metadata = pageMetadata("/concepts/learning-the-metric-itself", {
  title: "Learning the Metric Itself · Perceptron Lab",
  description:
    "Similarity depends on which differences matter for a task. Metric learning uses examples of matches and nonmatches to shape a representation in which distances reflect those distinctions.",
});

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
      playgroundTitle="Move matching examples closer together"
      playgroundIntro="Compare the distances of matching and nonmatching pairs. Change the margin and inspect both groups, since pulling everything together would make matching distances small too."
      title="Learning the Metric Itself"
      tagline={"Similarity depends on which differences matter for a task. Metric learning uses examples of matches and nonmatches to shape a representation in which distances reflect those distinctions."}
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

          , and the question asked of every space is the one-neighbor vote of{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>

            k-nearest neighbors
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
<p>Our sixteen-by-sixteen images contain a cross, square outline, filled disc or diagonal bar. Position, size, background and pixel noise vary. A fifth shape, a ring, is available for testing but is excluded from training. We will use these controlled differences to inspect what a learned distance considers similar.</p>
                <p>
                  {"We want two pictures of the same kind to have nearby representations, while pictures of different kinds should be farther apart. One option is to reuse features from a classifier. Here we give the network that comparison problem directly: show it pairs and tell it whether they match."}
                </p>
</>
                <>
<p>We will start with one pair of images. The loss should bring their vectors closer when they share a label and separate them when their labels differ. Then we can follow the gradient through the network used for both images. Because that network shares its weights, the update must account for both uses.</p>
                <p>After training on three shape classes, we will test whether the distance remains useful for the fourth class and for rings. We will also change the margin and remove different-class pairs. These comparisons show what supervision the distance depends on, before we examine the number of pairs and the method’s limits.</p>
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
                  caption="The same drawn collection the other picture pages use. Every nearest neighbor below is searched among the 300 evaluation pictures unless a step says otherwise."
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
                  neighbor there is its own kind for 230 to 235 of 240 across
                  three weight seeds, which is a very good ruler for the kinds the
                  network was taught. It also found that the ruler is worse at the
                  one thing it was never asked about, since 43 to 45 of 60 rings
                  find another ring by it where the raw pixels manage 46.
                </p>
                <p>

                  Searched among all 300 pictures by straight-line distance, the
                  same network&rsquo;s layer gives a nearest neighbor of the right
                  kind to 56 crosses, 58 discs and 59 bars of 60, and to only 40
                  squares, because the rings it was never shown land among the
                  squares and take their places as nearest neighbors. The pixels
                  give 45, 38, 50 and 54, and 44 rings of 60.
                </p>
                <KeepInMind>
                  {"A classifier is trained to separate its supplied categories. Its features may also help compare an unseen category, but that is an additional use to test. Adding rings changes which pictures become nearest neighbors here."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a pair asks for that a label does not">
                <p>The supervised classifier here chooses among the labels supplied during training. Some applications instead provide evidence that two examples belong together or differ, without expecting every future identity to have its own fixed class. Signature or face comparisons can use those pair relationships. We can therefore ask the network to learn a comparison directly, while still testing whether it generalizes beyond the training pairs.</p>
                <p>
                  {"For each training pair, supply two pictures and a bit indicating whether they belong to the same kind. The network maps each picture to a position. The loss then checks the distance between those positions against the pair label."}
                </p>
                <Equation>
                  {"d(a, b) as small as it can be, when a and b are one kind\nd(a, b) ≥ m, when they are two kinds"}
                </Equation>
                <p>Pair training gives the representation an explicit reason to bring labeled matches closer and separate labeled nonmatches. Whether that learned relationship also helps with new kinds is an empirical question. The held-back bars and rings test that question here rather than assuming that a distance objective guarantees it.</p>
                <KeepInMind>
                  {"Pair training needs a match or nonmatch judgment for each pair. We can derive that judgment from category labels, as we do here, or obtain it directly. A separate output category for every future identity is not required."}
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
                  {"Before training, the mean distance between the 300 evaluation positions is 0.7325. The reference margin is 1. It is on a similar scale to those initial distances, so different-kind pairs can begin near the separation the loss asks for. We will test other margins later."}
                </p>
                <KeepInMind>
                  {"Each picture becomes an eight-number position. Before training, the mean distance between evaluation positions is 0.7325; the reference margin is 1."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. A pair of one kind is pulled together">
                <p>
                  {"For two pictures of the same kind, the loss is half their squared distance. It reaches zero when the positions coincide. The gradient at either position points away from the other position, so a descent step moves against it and brings them together. A larger gap produces a larger gradient."}
                </p>
                <Equation>
                  {"L_same(a, b) = ½ d(a, b)²\n∂L_same / ∂p(a) = p(a) − p(b)"}
                </Equation>
                <p>
                  {"If we could update the positions directly, descent would move each toward the other by opposite amounts. In the network, these position gradients are instead passed backward to update shared weights. The factor of one half makes the derivative equal to the position difference shown above."}
                </p>
                <KeepInMind>
                  {"For a same-kind pair, the loss reaches zero when the positions coincide. Its position gradient grows in proportion to their separation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A pair of two kinds is pushed to the margin and no further">
                <p>
                  {"For different-kind pictures, the loss measures how far their distance falls short of the margin. Inside the margin, descent asks their positions to move apart. At or beyond the margin, this pair contributes zero loss and zero gradient. At exact coincidence, the direction needs a convention; we will return to that case."}
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
                  {"Suppose we used a negative squared distance for different-kind pairs. That term could keep decreasing as the pair moves farther apart, with no point at which the separation is enough. The margin gives the demand a stopping point. Each different-kind term becomes zero once its distance reaches the margin, and both terms in the contrastive loss remain nonnegative."}
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
                  {"At distance 0.6 with margin 1, the same-kind loss is 0.18 and the different-kind loss is 0.08. Descent on the positions would bring the same-kind pair together and move the different-kind pair apart; the gradients point in the opposite directions."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Two real pairs through the trained network">
                <p>
                  {"Now apply the same calculation to two selected pairs of held-out pictures after training. Two crosses have nearby positions, while a cross and a square are farther apart. Compare each distance with the margin to see which term still contributes a gradient."}
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
                <p>Each picture passes through the same network to obtain its position. Drawing the two evaluations side by side gives the arrangement its Siamese name: there are two sets of activations for a pair, but one shared parameter set. Training must combine the contribution from both evaluations before updating those shared weights.</p>
                <p>Sharing weights makes one picture have the same representation whichever side of a pair it occupies. That supports this design&apos;s single embedding space, where Euclidean distance is symmetric. Other retrieval systems can deliberately use different query and document encoders, but their two spaces need a compatible comparison; they do not automatically provide the single-map arrangement assumed here.</p>
                <KeepInMind>
                  {"The same network processes both pictures. Each picture therefore has one representation, and swapping the pair leaves its Euclidean distance unchanged."}
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
                  Both pictures use the same weights, so both routes contribute to one parameter gradient. We add those contributions before updating. If we updated two separate copies instead, they could stop representing the same mapping. To check the shared gradient, nudge one weight, run both pictures again, and measure the change in their pair loss.
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
                  {"For each checked parameter, the two route contributions add to the shared gradient. The finite-difference estimates agree with those sums to about 10⁻¹¹ in this test; using one route alone differs by as much as 0.1462."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The last layer’s biases learn nothing">
                <p>
                  The final embedding-layer bias shifts both pictures by the same amount. Their difference is unchanged, so a loss depending only on that difference has zero gradient for the shared bias. In this calculation, the two route contributions are 0.1462 and −0.1462 and cancel. This conclusion depends on that particular loss and output arrangement.
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
              "The nearest neighbor has the correct known class for 56 crosses, 58 discs and 59 bars out of sixty each, but only 40 squares. The unseen rings often become the squares' nearest neighbors. This shows a limitation of using a classifier's representation as a distance: it was trained to distinguish its known classes, while our retrieval question includes another shape.",
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
              "This design assigns each image one vector through a shared encoder, then measures Euclidean distance between the vectors. The distance is symmetric and both training and retrieval use the same coordinate system. Other systems can use separate query and item encoders, but they need an objective that makes those outputs compatible. Sharing is the design choice used here, not a mathematical requirement of every similarity model.",
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
              "For a same-kind pair, this objective uses half the squared distance. For a different-kind pair, it uses half the squared shortfall inside the margin:\n\n```math\nSame kind: 0.5 × 0.6² = 0.18\nDifferent kinds: 0.5 × (1 − 0.6)² = 0.08\n```\n\nA descent update attracts the same-kind vectors and repels a different-kind pair that is still inside the margin. At or beyond the margin, this repulsive term is zero.",
            ),
            trueFalse(
              "The margin of 1 was chosen before any margin was compared, because the untrained positions already sit 0.7325 apart on average.",
              true,
              "A margin near the initial distance scale gives this experiment a useful starting comparison. The later margin sweep also changes the learning rate, because margin and update scale interact in this setup. Dividing the rate by the squared margin is the tested adjustment here, not a universal rule for every encoder. Margins can still be selected using a separate validation task.",
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
                  of sixteen is read the way the neighboring page reads it.
                </p>
                <p>
                  {"Both training objectives improve in the reported runs. The pair loss falls from 0.1351 in the first epoch to 0.0122 in the fortieth. The three-kind classifier gets 0.9778 of the held-out labels correct among its three trained kinds."}
                </p>
                <p>
                  {"We compare four representations: raw pixels, the reference classifier trained with bars, the three-kind classifier, and the eight positions trained on pairs. Training-dependent results use weight seeds 0, 1 and 2. Widgets show seed 0 unless another seed is selected."}
                </p>
                <KeepInMind>
                  Two networks learn from the same 180 pictures of three kinds,
                  one trained on pairs and one trained to name the kinds, and both
                  are then asked about bars and rings they never saw.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Among the kinds it was trained on, it keeps up">
                <p>
                  {"First restrict the search to the 180 held-out crosses, squares and discs. Every candidate then belongs to one of the trained kinds. The classifier and pair-trained positions can be compared without bars or rings changing the candidate set."}
                </p>
                <MetricComparisonLedger view="seen" />
                <p className={caption}>

                  Nearest neighbors of the right kind among the held-out pictures
                  of the three trained kinds only, for each seed.
                </p>
                <p>

                  On seed 0 the positions give 171 of 180 pictures a nearest
                  neighbor of their own kind against the three-kind
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
                  {"Add bars and rings to the search, bringing the collection to 300 pictures. Neither appeared in pair training. In these runs, bars retrieve their own kind less often with the pair-trained positions than with the three-kind classifier features. They also become neighbors of some crosses, reducing cross agreement."}
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
                <p>Rings are held out from every network in this comparison, including the classifiers. Their nearest-neighbor results therefore provide a separate test from the trained kinds. In this experiment, direct pair training performs worse on that test than the raw-pixel baseline, which limits the generalization claim supported by these data.</p>
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
                  {"Holding out bars is one test of a new category. Repeat it with cross, disc or square held out instead, using seed 0. The comparison below asks whether the weaker retrieval is specific to bars. A separate width control tests sixteen output values instead of eight."}
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
                <p>The width control retrains the pair network at seed 0 with sixteen outputs instead of eight. Bars retrieve their own kind 31 times rather than 33, and crosses 37 times rather than 39. Rings improve to 43 of 60 from 33, matching the reference classifier but remaining below raw pixels. Width affects these results, but this comparison does not make it the sole explanation of the held-out-kind failures.</p>
                <KeepInMind>
                  {"For each held-back kind at seed 0, pair-trained positions return that kind 21 to 33 times out of 60; classifier features return it 44 to 52 times. Widening the pair output to sixteen values changes the counts, but does not reverse the bar comparison."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A reading on which the pairs win, and why it misleads">
                <p>
                  {"A different measure gives the pair-trained positions a better result. For a kind, divide its mean within-kind distance by its mean distance to other kinds. A smaller ratio means that within-kind distances are smaller relative to between-kind distances. Rings have a lower ratio in the pair representation than in the three-kind classifier representation in all six studies."}
                </p>
                <Equation>
                  {"ratio(kind) = mean d inside the kind / mean d from the kind to everything else"}
                </Equation>
                <>
<p>
                  {"For rings, the ratios are 0.5230 against 0.5984 on seed 0, 0.4431 against 0.6945 on seed 1, and 0.3532 against 0.7923 on seed 2. These averages give a different comparison from the nearest-neighbor counts. A ratio can improve because distances to other kinds grow, even if nearby nonrings still interrupt ring retrieval. It does not tell us the category of the closest picture."}
                </p>
                <p>A uniform rescaling does not change which neighbor is closest. Nearest-neighbor agreement therefore tests a different property from the ratio of average within-kind and between-kind distances. For a retrieval task, checking the returned neighbors directly helps us see failures that an improved aggregate ratio can hide.</p>
</>
                <KeepInMind>
                  {"The ring ratio improves in every study while ring nearest-neighbor agreement gets worse. For this retrieval task, we need to inspect the returned neighbors as well as average distances."}
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
                  {"A margin specifies separation in the output coordinates. Those coordinates have no fixed physical unit. If we double every position and double the margin, the loss changes by the common scale factor derived below. That is a relation between arrangements; it does not guarantee that two training runs will reach matching arrangements."}
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
                <p>Changing the margin from 1 to 2 and rescaling all output positions accordingly rescales this distance-based loss. It does not automatically make the two optimization runs equivalent: their initialization and parameter gradients also matter. The experiments use division of the step size by the squared margin as an explicit comparison policy, then measure its effect rather than treating it as a universal correction for every architecture.</p>
                <KeepInMind>
                  {"Rescaling all positions and the margin by the same positive factor rescales this loss by the square of that factor. The experiments also adjust the step size, but that policy does not make every parameter update or final arrangement equivalent."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. At one step size, a larger margin freezes everything onto one point">
                <p>
                  {"In the tested runs, keeping the reference step size while raising the margin to 2 or 4 makes the positions collapse toward one point. The wider margin alone does not produce a wider useful arrangement. Inspect the distances as well as the loss to see this failure."}
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
                  {"These runs collapse to nearly coincident positions. At exact coincidence, this implementation returns zero position gradients, so the different-kind loss can remain positive without providing an update. The stalled loss at margin 2 is about 1.3913."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. With the step size scaled, the margin changes little that holds up">
                <p>The scaled-step comparisons show that changing the optimization setting can avoid several collapsed runs and produce arrangements that broadly follow the changed margin. That is a result for the tested runs. The remaining seed sensitivity matters, so a successful example does not guarantee that every margin and initialization will train reliably.</p>
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
                  {"With the tested scaled step sizes, the margin affects both scale and retrieval. Seed 0 reaches 49 correct ring neighbors out of 60 at margin 4, but the improvement does not hold across the other seeds."}
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
                  {"If we keep same-kind pairs and remove every different-kind pair, what stops all pictures from receiving one position? Nothing in the remaining loss penalizes that answer. The controlled run below uses the same starting weights and batches to show how the positions change when the separating term is removed."}
                </p>
                <CollapseChart />
                <p className={caption}>
                  The two runs share their starting weights and their batches.
                  Only the pairs of two kinds differ.
                </p>
                <p>
                  {"The mean distance between evaluation positions starts at 0.7325 in both runs. With same-kind pairs only, it reaches 0.0393 after one epoch and 0.0018 after forty; the ordinary run ends at 0.8284. The positions still differ in their last digits, so the search can return neighbors even though their overall separation is small. The same-kind shares among ten neighbors are 0.2917 for crosses, 0.3000 for squares and 0.2633 for discs. The search includes 300 evaluation pictures, with 60 in each of five kinds. Random neighbors would therefore give roughly one-fifth agreement. These results exceed that rough baseline, but a small overall spread alone neither establishes nor rules out useful neighbor ordering."}
                </p>
                <KeepInMind>
                  {"Same-kind-only training shrinks the mean separation from 0.7325 to 0.0018 in forty epochs. Some same-kind neighbor preference remains. The loss has no term requiring different kinds to stay apart."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The loss calls the collapse a success">
                <p>The pull-only run reaches mean loss 0.0000078 at epoch forty, compared with 0.0122 for the ordinary run. Those values come from different objectives: the first omits the term that penalizes collapse. Its smaller value therefore does not establish better learning or more useful distances.</p>
                <WhyThisWorks title="Why every constant answer is a perfect answer">
                  <>
<p>
                  {"With same-kind pairs only, the loss is a sum of squared distances. It is nonnegative and reaches zero if every picture has the same position. This network can produce that answer by setting its final layer weights to zero. The measured run moves toward collapse, although the objective also permits other zero-loss arrangements that keep each connected group of same-kind examples together."}
                </p>
                  <p>
                    The push is the only term that a constant answer fails, since it charges half the margin squared for every pair of two kinds sitting on top of each other. Hadsell, Chopra and LeCun gave exactly this argument for including it.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"A constant representation is a zero-loss answer for same-kind pairs alone. A falling value of that objective therefore does not establish useful separation between different kinds."}
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
              "Adding held-back bars to the retrieval collection reduces the pair-trained model’s same-kind matches, including matches for crosses. The reported ring results also fail to improve on raw pixels. These measurements show that success on trained categories did not transfer reliably to these unseen ones. The chosen tower, pair objective and training data all contribute to that result.",
            ),
            several(
              "Searched only among the 180 held-out pictures of crosses, squares and discs, so that no unseen kind can be anyone’s nearest, which of these hold?",
              [
                              "On seed 0 the positions trained on pairs give 171 of 180 pictures a nearest neighbor of their own kind, against 179 for the three-kind classifier’s layer",
                              "On seed 2 the positions are ahead of the three-kind classifier, 178 against 176",
                              "The raw pixels do better than either network on this search",
                              "Seed 1 is the pair tower’s strongest seed",
                            ],
              [0, 1],
              "On the kinds it was trained on, the distance learned from pairs finds the right kind for 157 to 178 of 180 across the three seeds against 174 to 179 for the classifier’s layer, so it is not a weak tower. Seed 1 is its weak seed, 157 against 174, and the pixels manage only 144. What goes wrong is where it puts what it was never shown, which is the next question.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Nearest neighbour has the same kind, among 180 held-out pictures:\n                     seed 0  seed 1  seed 2\npair-trained vectors 171     157     178\nclassifier vectors   179     174     176\nraw pixels           144     144     144"
              },
            ),
            choice(
              "Measured as a kind’s mean distance inside itself divided by its mean distance to everything else, the rings look tighter in the pair-trained positions in all six studies. Why is that not the verdict the page takes?",
              [
                              "The ratio is a confound, since pushing the three trained kinds a margin apart enlarges every kind’s distance to everything else and so lowers the ratio for a kind that did not gather at all",
                              "The ratio was only measured on seed 0, so it says nothing about the other seeds",
                              "A ratio of distances is not a distance and cannot be compared across spaces",
                              "The ratio excludes the rings’ nearest neighbors, which is the quantity a search reads",
                            ],
              0,
              "The denominator averages distances to all other kinds. Moving the trained kinds farther from the rings can lower this ratio even when the ring cloud itself does not tighten. Nearest-neighbor matches answer the retrieval question more directly. They too can change when relative group positions move; only a uniform rescaling of every distance leaves their order unchanged.",
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
              "Changing the margin changes the target distance scale and the gradients encountered during this training run. The rate used at margin one is unstable in the reported margin-two experiment. The page’s inverse-square rate adjustment is a useful tested control, but scaling all output vectors also changes how gradients reach earlier parameters, so it is not a universal learning-rate identity. Inspect optimization and retrieval after the change.",
            ),
            trueFalse(
              "With every different-kind pair left out, the loss fell to 0.0000078 by the fortieth epoch because every picture had been given nearly the same position, not because a better distance had been learned.",
              true,
              "With only attractive same-kind pairs, assigning every picture the same vector makes every pair loss zero. The objective has no term requiring different kinds to stay apart. The observed loss reduction can therefore accompany worse retrieval. A falling objective shows progress on the stated optimization problem; it does not establish that the representation supports the retrieval task.",
            ),
        ],
        },
        {
          title: "Part 7. What The Pairs Cost",
          content: (
            <>
              <SubSection title="25. Pairs grow with the square of the pictures">
                <p>
                  {"If we compare every pair in a collection, the number of loss terms grows roughly with the square of the picture count. That can make exhaustive pair training expensive even when each picture representation is computed once and reused. Large collections usually need a policy for choosing which pairs to train on."}
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
                  {"The 180 training pictures contain 16,110 pairs. A million pictures contain nearly half a trillion. At that scale, selecting informative pairs is far more practical than evaluating every pair in every training pass."}
                </KeepInMind>
              </SubSection>

              <SubSection title="26. What one training computed">
                <p>Forty epochs with seven batches of 276 pairs evaluate 77,280 pair losses, covering 16,015 of the 16,110 possible pairs, or 0.9941. Each batch reuses the computations from its 24 pictures across their pairs. The reference timing is about 1.4 seconds for this pair run versus 2.3 for the three-kind classifier. These are environment-dependent measurements; the widget reports timings for its current machine.</p>
                <KeepInMind>
                  {"This small run evaluates 77,280 pair losses and covers 0.9941 of the 16,110 distinct possible pairs. Repeated pair evaluations and distinct pair coverage measure different costs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Most pairs of two kinds stop teaching">
                <p>A different-kind pair beyond the margin contributes zero loss and zero positional gradient. At the end of this fit, that covers 0.7909 of training different-kind pairs and 0.6620 of held-out ones. Many evaluated pairs therefore supply no further separating update. Finding that fact still requires work unless the training procedure selects useful pairs in advance.</p>
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
          title: "Part 8. Equivalent Arrangements and Missing Pair Evidence" , id: "part-8-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="28. What the loss leaves undecided">
                <p>Translating, rotating or reflecting every position together preserves pairwise Euclidean distances and this loss. The zero shared-bias gradient above measures the translation case for this output arrangement. Training on distances alone therefore does not fix an origin or orientation. A coordinate may be useful within a fitted system, but its interpretation is not automatically shared by an independently trained one.</p>
                <p>Independent fits can choose different orientations and origins for their representations. Directly comparing their coordinates or taking a cross-fit distance is therefore unreliable unless we establish a shared alignment. Within one fit, translating or rotating all positions together leaves pair distances unchanged. The drawing measures directions from the collection&apos;s center so a change of origin does not determine what it shows.</p>
                <KeepInMind>
                  {"Training on pair distances leaves the coordinate origin and orientation undecided. It also leaves freedom wherever the supplied pairs and margin constraints do not determine an arrangement. A low loss does not uniquely specify every pairwise distance."}
                </KeepInMind>
              </SubSection>

              <SubSection title="29. The degenerate cases, one by one">
                <p>The remaining cases distinguish inadequate supervision from undefined calculations. Contradictory pair labels can prevent all constraints being satisfied without making the loss itself undefined. Coincident positions can instead require an explicit gradient convention, and an empty pair set needs an aggregation policy. The table states the response used by this implementation.</p>
                <DerivationTable
                  expressionHeading="Pairs, labels or margin"
                  reasonHeading="Effect on the learned distance"
                  rows={[
                    {
                      expression: "two kinds at distance zero",
                      reason: "The different-kind loss is ½ m² and is defined. For positive margin, its gradient with respect to coincident positions has no unique direction. This implementation returns zero; a chosen perturbation or direction is another possible policy. A differentiable radial loss can instead have a well-defined zero gradient at coincidence.",
                    },
                    {
                      expression: "a margin of zero",
                      reason: "max(0, 0 − d) is zero for every pair, so the push term vanishes and only the pulls are left, which is the next row.",
                    },
                    {
                      expression: "no pairs of two kinds",
                      reason: "Every constant representation has zero same-kind loss. Other zero-loss arrangements may keep separate same-kind groups at different positions. The objective does not require those groups to be separated. Here the mean distance fell from 0.7325 to 0.0018 in forty epochs.",
                    },
                    {
                      expression: "no pairs of one kind",
                      reason: "The loss reaches zero when all supplied different-kind pairs meet the margin. Without same-kind pairs, no term asks matching pictures to stay close. Zero loss alone therefore does not establish useful same-kind retrieval.",
                    },
                    {
                      expression: "a kind with one picture",
                      reason: "That picture has no same-kind pair. Its supplied different-kind pairs ask for margin separation, but do not give it a matching example to approach. A training run may still fail to satisfy those requests.",
                    },
                    {
                      expression: "sameness that is not transitive",
                      reason: "if a and b are judged one kind, b and c one kind, and a and c two kinds, the triangle inequality gives d(a, c) ≤ d(a, b) + d(b, c). Pulling both pairs to zero puts a and c on one point, which the margin forbids, so no arrangement has a loss of zero, and how the conflict is split depends on how many such pairs there are.",
                    },
                    {
                      expression: "a margin without a scale",
                      reason: "Scaling positions and a positive margin together rescales this loss by c². Interpreting a margin requires the output coordinate scale; predicting the final distances also requires understanding the training setup and whether it satisfies the pair constraints.",
                    },
                    {
                      expression: "a kind that appears in no pair",
                      reason: "its positions are defined, since the network answers any picture, and the loss never said anything about them. Measured here, held-back bars found a bar 27 to 34 times of 60, where the pixels manage 54.",
                    },
                    {
                      expression: "positions from two trainings",
                      reason: "A cross-fit distance is numerically defined, but the two learned coordinate systems need not align. Establish a shared alignment before treating it as evidence of similarity.",
                    },
                    {
                      expression: "two pictures exactly as near",
                      reason: "An exact tie needs a rule if one result must be returned. This API chooses the first minimum in collection order. Nearly coincident positions can have tiny unequal distances, so small spread does not itself prove an exact tie.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"The loss evaluates the labeled pairs it is given. At coincident positions its value is defined, while a different-kind gradient needs a direction convention. Missing or conflicting labels can leave many acceptable arrangements or prevent zero loss. Unseen kinds still receive positions, but their retrieval behavior needs its own evaluation."}
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
              "Under this objective, a different-kind pair currently at or beyond the margin contributes zero loss and gradient. Selecting pairs that still violate the margin can concentrate training on active comparisons. A pair may become active again after other updates change the vectors. Larger collections make pair selection important because evaluating every possible pair becomes expensive.",
            ),
            choice(
              "How many pairs do the 180 training pictures make?",
              ["16,110", "5,310", "10,800", "499,500"],
              0,
              "Pairs among n pictures number n times n minus 1 over 2, which for 180 is 16,110, of which 5,310 are of one kind and 10,800 of two. A thousand pictures make 499,500 and a million nearly half a trillion, so at any real size most pairs are never looked at and which pairs are shown becomes a decision. At this size the forty epochs computed 77,280 pair losses and met 16,015 of the 16,110 different pairs.",
            ),
            several(
              "For a loss that uses only Euclidean distances between positions, which changes leave every distance unchanged?",
              [
                "Adding the same vector to every position",
                "Turning the whole arrangement",
                "Reflecting the whole arrangement",
                "Doubling every position"
              ],
              [0, 1, 2],
              "A shared translation cancels when two positions are subtracted. Orthogonal rotations and reflections preserve their Euclidean length. Multiplying all positions by two doubles distances, so a distance-based loss with a fixed margin can detect that change.",
            ),
            trueFalse(
              "Positions from two separate trainings of this network can be compared with each other directly.",
              false,
              "Separate fits need not use compatible coordinates. A common translation, rotation or reflection preserves within-fit distances while changing the stored vectors. Cross-fit distances are therefore not automatically meaningful. Use one consistent fitted encoder, or estimate and validate an alignment from corresponding examples before combining representations. Centering removes a translation but does not resolve every possible mismatch.",
            ),
        ],
        },
        {
          title: "Practice. Training A Distance From Pairs Of Your Own",
          practice: [
            exercise(
              "Build the tower and cost two pairs before any training",
              [
  "Use the supplied twelve pictures and initial eight-coordinate tower. Measure all sixty-six distinct picture-pair distances.",
  "Print their mean, then the distance between pictures 0 and 2 and its contrastive loss under both same-kind and different-kind labels at margin one. These two crosses are deliberately scored under both hypothetical labels."
],
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
              { hints: [
  "The same-kind term pulls vectors together; the different-kind term penalizes distances inside the margin.",
  "Keep the pair label separate from the vectors so the same distance can be evaluated under both requested rules."
], check: numberCheck("What is the mean distance between two positions before any training?", 0.7209, 0.001, "The initial mean distance is 0.7209 over these sixty-six picture pairs. The initial tower already creates a distance scale before the pair objective trains it."), question: "What distances and pair losses exist before the image tower learns?" },
            ),
            exercise(
              "Walk one pair down both towers and add the slopes",
              [
  "For the two supplied crosses, backpropagate the same-kind pair loss through both tower uses. Print the final position-layer bias gradients from each and their sum.",
  "Carry both input derivatives into the sixteen-unit hidden layer. Print its largest absolute summed weight gradient beside the two separate contributions at that same index."
],
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
              { hints: [
  "The loss produces opposite output-position derivatives for the two pictures.",
  "Shared parameters need the sum of both uses’ derivatives before one update. Cancellation at the last bias does not imply cancellation in every earlier layer."
], check: numberCheck("What is the largest bias slope of the position layer through one tower alone?", 0.6528, 0.001, "One tower use has a largest absolute position-bias derivative of 0.6528. The other use contributes the opposite value, so the shared final bias update cancels."), question: "How should two uses of one image tower combine their gradients?" },
            ),
            exercise(
              "Train on every pair of the dozen",
              [
  "Use the supplied forty-pass training loop over all sixty-six pairs of the twelve pictures, accumulating each picture’s pair contributions before a shared backward pass.",
  "Print mean within-kind and cross-kind distances, fraction of cross-kind pairs at or beyond the margin, and same-kind nearest-neighbor count excluding self. This evaluates training pictures, not unseen retrieval."
],
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
              { hints: [
  "Keep pair labels aligned with picture indices throughout aggregation.",
  "Pairs already beyond the contrastive margin have no repulsive loss term in this objective."
], check: numberCheck("What is the mean distance within a kind after training?", 0.0552, 0.001, "The within-kind mean distance falls to 0.0552 on the twelve training pictures. Held-out pictures would be needed to assess the learned distance beyond those examples."), question: "Does pairwise training create useful distances among these training pictures?" },
            ),
            exercise(
              "Leave out the pairs of two kinds",
              [
  "Restrict the supplied training loop to same-kind pairs, leaving out every different-kind pair. Keep the pictures, starting tower and forty-pass settings unchanged.",
  "Print mean distance over all pictures before/after training, final objective and same-kind nearest-neighbor count. Compare this objective’s missing repulsion with the earlier full-pair experiment."
],
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
              { hints: [
  "Filter pairs before the loop, rather than merely omitting them from evaluation.",
  "A representation can reduce all attractive pair distances by moving many pictures toward the same point. Inspect retrieval as well as loss."
], check: numberCheck("What is the mean distance between positions after training on one-kind pairs alone?", 0.0279, 0.001, "The same-kind-only mean distance falls to 0.0279. The objective lacks a penalty for bringing different kinds together, so this low value can accompany collapsed retrieval."), question: "Can the loss fall while the representation collapses?" },
            ),
          ],
        },
      ]}
    />
  );
}
