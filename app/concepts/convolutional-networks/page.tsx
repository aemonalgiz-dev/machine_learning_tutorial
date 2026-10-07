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
import { CnnDepthExplorer } from "@/components/widgets/CnnDepthExplorer";
import { CnnFieldGrowth } from "@/components/widgets/CnnFieldGrowth";
import { CnnFilterBoard } from "@/components/widgets/CnnFilterBoard";
import { CnnPartsBoard } from "@/components/widgets/CnnPartsBoard";
import { CnnShiftChart } from "@/components/widgets/CnnShiftChart";
import { CnnTrainingCurves } from "@/components/widgets/CnnTrainingCurves";
import { CnnUnseenKind } from "@/components/widgets/CnnUnseenKind";

export const metadata: Metadata = {
  title: "Convolutional Networks · oop_ml",
  description:
    "Combine convolution, activation, pooling, and a classifier into a trainable image model.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ConvolutionalNetworksPage() {
  return (
    <ConceptPage
      lessonId="convolutional-networks"
      intuition={lessonIntuitions["convolutional-networks"]}
      technicalStart="Part 2. Training It End to End"
      openingTitle="From Local Patterns to a Name for the Picture"
      playgroundIntro="Follow a picture through its feature maps to its class scores. Compare the trained model with the alternatives before drawing conclusions about any one layer."
      title="Convolutional Networks"
      tagline="Combine convolution, activation, pooling, and a classifier into a trainable image model."
      prerequisites={
        <>
          The individual layers have their own worked examples. The{" "}
          <Link href="/concepts/convolution" className={link}>
            convolution
          </Link>{" "}
          page is where a small grid of weights is swept across a picture, the{" "}
          <Link href="/concepts/pooling" className={link}>
            pooling
          </Link>{" "}
          page is where a map is shrunk by keeping the largest value in each
          window, and{" "}
          <Link href="/concepts/shapes-and-flattening" className={link}>
            shapes and flattening
          </Link>{" "}
          is where a stack of maps becomes a row a dense layer can read. The
          loop that trains the whole thing is the one on{" "}
          <Link href="/concepts/training-a-network" className={link}>
            training a network
          </Link>
          , and Part 3 compares what the network learns with the hand-designed
          grids of{" "}
          <Link href="/concepts/filters-and-edges" className={link}>
            filters and edges
          </Link>
          .
        </>
      }

      playground={<CnnDepthExplorer />}
      sections={[
        {
          title: "Part 1. The Problem and the Assembly",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Four kinds of small picture">
                <p>
                  Every picture on this page is sixteen pixels on a side, one channel of brightness, and holds one of four shapes, a cross, a square outline, a filled disc or a diagonal bar. Each shape is drawn at a random position, at a random size within a range, at a random brightness against a random background, with a little noise on every pixel, so that no single pixel can give the answer away.
                </p>
                <p>
                  The network learns from 240 of them, sixty of each kind, and is scored on another 240 it never sees while training. The box at the top of the page holds the first held-out picture of each kind.
                </p>
                <NumberTable
                  headings={["kind", "how it is drawn"]}
                  rows={[
                    ["cross", "two bars two pixels thick through a common centre, six to nine pixels across"],
                    ["square outline", "one pixel thick, six to ten pixels on a side, almost nothing inside"],
                    ["filled disc", "a radius between 2.6 and 4.6 pixels, the most lit pixels of the four"],
                    ["diagonal bar", "seven to eleven steps long, rising or falling, two pixels wide"],
                  ]}
                  caption="The ranges are the ones the pictures are drawn from. A shape is always placed at least one pixel in from the edge."
                />
                <KeepInMind>
                  The same kind appears at many positions and sizes, so the
                  held-out half holds crosses at places and sizes the
                  training half never had exactly, and a network is scored on
                  finding the shape wherever it was drawn.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a dense network makes of them">
                <p>
                  The obvious first attempt reads the 256 pixels as a row and hands them to dense layers. A cross in the top left corner and the same cross in the bottom right share no lit pixel, so to a layer that reads a row they are two unrelated patterns, and the network has to learn every kind again at every position it might appear.
                </p>
                <p>
                  Sixty pictures of each kind is nowhere near enough for that. I built a dense network of about the same size as the convolutional one on this page, 256 pixels to 9 units to 16 to 4 scores, 2541 parameters, and trained it with the same loop on the same pictures.
                </p>
                <NumberTable
                  headings={["dense layers on the raw pixels", "seed 0", "seed 1", "seed 2"]}
                  rows={[
                    ["held-out accuracy", "0.679", "0.729", "0.663"],
                    ["training-half accuracy", "0.917", "0.958", "0.946"],
                    ["calls changed by a one-pixel shift", "35.1%", "30.8%", "37.9%"],
                  ]}
                  caption="The same 40 epochs, batches of 16 and step size as every other network on the page. The seed sets the starting weights."
                />
                <p>
                  It names about two held-out pictures in three, it does not
                  finish learning even the pictures it was trained on, and
                  moving a picture by one pixel changes its answer on about a
                  third of them. That is the failure the rest of the page is
                  measured against.
                </p>
                <KeepInMind>
                  A dense layer is told nothing about which pixels are
                  neighbours or that a shape means the same thing anywhere,
                  so it has to learn both from the examples, and on 240
                  pictures it cannot.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The assembly, layer by layer">
                <p>
                  The convolutional network does two rounds of the same thing
                  and then answers. A convolution sweeps small grids of weights
                  across the picture, a pooling keeps the largest value in each
                  two by two window and halves the picture, and the pair is
                  repeated on what the first pair produced. The last maps are
                  flattened into a row of 128 numbers, a dense layer turns that
                  into 16, and a final layer gives one score per kind.
                </p>
                <NumberTable
                  headings={["layer", "reads", "answers", "parameters"]}
                  rows={[
                    ["convolution, 4 filters of 3 by 3", "1 × 16 × 16", "4 × 16 × 16", "40"],
                    ["max pooling, 2 by 2", "4 × 16 × 16", "4 × 8 × 8", "0"],
                    ["convolution, 8 filters of 3 by 3", "4 × 8 × 8", "8 × 8 × 8", "296"],
                    ["max pooling, 2 by 2", "8 × 8 × 8", "8 × 4 × 4", "0"],
                    ["flattening", "8 × 4 × 4", "128", "0"],
                    ["dense, 16 units", "128", "16", "2064"],
                    ["one score per kind", "16", "4", "68"],
                  ]}
                  caption="2468 parameters in all. Each convolution adds a pixel of zeros around its input first, so it answers at every pixel it reads."
                />
                <p>
                  A convolution&rsquo;s count does not depend on the size of
                  the picture, since each filter is one small grid used at
                  every position. It is the number of filters times the
                  weights in one filter, which reads every channel beneath it,
                  plus one bias each.
                </p>
                <Equation>{"parameters  =  filters × (channels × 3 × 3 + 1)"}</Equation>
                <>
                  <p>
                    Count the weights and biases in each layer separately. Each
                    convolutional filter has one weight per input channel and kernel
                    position, plus one bias. Each dense output has one weight per input
                    and one bias.
                  </p>
                  <Equation>{"first convolution  = 4 × (1 × 9 + 1) = 40\nsecond convolution = 8 × (4 × 9 + 1) = 296\nhidden dense layer = 128 × 16 + 16 = 2,064\noutput dense layer = 16 × 4 + 4 = 68\ntotal parameters   = 40 + 296 + 2,064 + 68 = 2,468"}</Equation>
                  <p>
                    Most of the parameters belong to the hidden dense layer.
                  </p>
                </>
                <KeepInMind>
                  The convolutions hold 336 of the network&rsquo;s 2468
                  parameters and do 27,648 of its 29,760 multiplications per
                  picture, and Part 6 comes back to that split.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. One number of the first map, by hand">
                <p>
                  Every number in the maps at the top of the page comes from
                  the same small sum. Take the held-out cross, and the one
                  place where any first-layer filter answers most strongly,
                  which is the third filter at row 11, column 11, counting
                  from zero at the top left. The filter lays its nine weights
                  over the three by three patch centred there, multiplies each
                  weight by the pixel beneath it, adds the nine products and
                  the filter&rsquo;s bias, and keeps the result if it is above
                  zero.
                </p>
                <WorkedExample title="The third filter on the cross, at row 11, column 11">
                  <NumberTable
                    headings={["", "left", "middle", "right"]}
                    rows={[
                      ["pixels, top row", "0.6827", "0.7593", "0.2488"],
                      ["pixels, middle row", "0.8277", "0.6225", "0.2252"],
                      ["pixels, bottom row", "0.7779", "0.6726", "0.1840"],
                      ["weights, top row", "1.3403", "1.1731", "−0.4083"],
                      ["weights, middle row", "1.5522", "−0.0975", "−0.1631"],
                      ["weights, bottom row", "1.3262", "−0.2975", "−0.6597"],
                      ["products, top row", "0.9150", "0.8907", "−0.1016"],
                      ["products, middle row", "1.2847", "−0.0607", "−0.0367"],
                      ["products, bottom row", "1.0316", "−0.2001", "−0.1214"],
                    ]}
                  />
                  <p>
                    The nine products add to 3.6014, the bias is −0.9630, and
                    the score is 2.6384. It is above zero, so the activation function keeps it
                    unchanged. The pooling window this position shares holds
                    0.5139, 2.3726, 0 and 2.6384, and the pooled map keeps
                    2.6384 for all four.
                  </p>
                </WorkedExample>
                <p>
                  The weights are large on the left column and small or
                  negative on the right, and the patch is bright on its left
                  and dim on its right, which is why this is where the filter
                  answers most. One of the cross&rsquo;s bars, two pixels
                  thick, covers the left two columns of the patch.
                </p>
                <KeepInMind>
                  Every map on the page is this sum repeated at every
                  position with the same nine weights, and every pooled
                  number is the largest of four such sums.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Training It End to End",
          content: (
            <>
              <SubSection title="5. The loop, and the curve it draws">
                <p>
                  The network is trained with the plain loop from the training
                  page, 40 passes over the 240 training pictures in shuffled
                  batches of 16 with a step size of 0.1, every layer corrected
                  at once from the loss at the top. After each pass I read how
                  many pictures it names correctly in both halves.
                </p>
                <CnnTrainingCurves />
                <p>
                  At weight seed 0 the loss over the first pass is 1.3691,
                  which is close to the loss of spreading the probability
                  evenly over four kinds, since that is the natural logarithm
                  of 4, 1.3863. After the first pass the network names 0.346
                  of the held-out pictures. It first names every training
                  picture at the end of pass 33, when the loss is 0.0347, and
                  finishes at a loss of 0.0190 and a held-out accuracy of
                  0.971.
                </p>
                <KeepInMind>
                  A loss that starts near the logarithm of the number of kinds
                  is a network that has not yet preferred any of them, which
                  is a quick check that the starting weights are small enough.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Three starts, three networks">
                <p>
                  The starting weights are drawn at random, and a network this
                  small ends somewhere different for each draw. Everything on
                  this page that depends on training is reported at three
                  weight seeds, and the widgets draw seed 0 unless a button
                  says otherwise.
                </p>
                <NumberTable
                  headings={["the network", "seed 0", "seed 1", "seed 2"]}
                  rows={[
                    ["held-out accuracy after pass 40", "0.971", "0.921", "0.967"],
                    ["best held-out accuracy, and the pass", "0.971, 36", "0.938, 27", "0.967, 25"],
                    ["training-half accuracy after pass 40", "1.000", "1.000", "1.000"],
                    ["loss over pass 40", "0.0190", "0.0133", "0.0122"],
                  ]}
                />
                <p>
                  The three differ by 0.05 on the held-out half, from 221 to
                  233 pictures of 240, and the lowest final loss belongs to
                  seed 2 while the best held-out score belongs to seed 0, so a
                  lower loss on the training half did not order them. Seed 1
                  reached 0.938 at pass 27 and then fell back to 0.921 while
                  its loss kept falling.
                </p>
                <KeepInMind>
                  A difference smaller than the spread between seeds of the
                  same arrangement is not evidence about the arrangement.
                  Every comparison in Parts 5 and 6 is read against that
                  spread.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Perfect on the pictures it saw">
                <p>
                  All three networks name every training picture by the end,
                  and none of them names every held-out one. After the
                  training half is perfect, the loss keeps falling, from
                  0.0347 at pass 33 to 0.0190 at pass 40 at seed 0, which is
                  the network growing more certain about pictures it already
                  names rather than learning anything new about the kinds.
                  The{" "}
                  <Link href="/concepts/training-a-network" className={link}>
                    training page
                  </Link>{" "}
                  covers the two curves and when to stop; what matters here
                  is that 240 pictures are enough for this network to
                  memorise, so the held-out half is the only score on the
                  page that measures anything.
                </p>
                <KeepInMind>
                  A training accuracy of 1.000 says the network has enough
                  parameters to fit these pictures. Every arrangement on the
                  page except the dense one reaches it, so it cannot tell them
                  apart.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What the First Layer Learns",
          content: (
            <>
              <SubSection title="8. The four filters beside the hand-designed grid">
                <p>
                  The usual account is that the first layer of a trained
                  convolutional network learns edge detectors, the same kind
                  of grid the{" "}
                  <Link href="/concepts/filters-and-edges" className={link}>
                    filters and edges
                  </Link>{" "}
                  page builds by hand. To test it I took the Sobel grid from
                  that page, turned it in eighths of a turn so that there is
                  one for every direction an edge can face, and asked which of
                  the eight each trained filter is closest to in shape.
                </p>
                <CnnFilterBoard />
                <p>
                  Closeness is the cosine between the two grids of nine numbers after each filter&rsquo;s own mean is taken off, which is 1 for the same shape and 0 for an unrelated one. At seed 0 the four filters come out at 0.675, 0.543, 0.814 and 0.794. That sounds like edges until it is set beside what nine random numbers manage, since with eight directions to choose from one of them is always fairly close.
                </p>
                <p>
                  Over 2000 random grids the closest Sobel grid is at a median of 0.466, and one draw in ten comes closer than 0.724.
                </p>
                <KeepInMind>
                  Two of the four trained filters, at 0.814 and 0.794, are
                  closer to an edge grid than nine random draws in ten, and
                  the other two are not. A closeness means something only
                  beside that baseline.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The most edge-like filter was drawn that way">
                <p>
                  The board also shows each filter as it was before training, and that changes the reading. The fourth filter, the one closest to an edge that is brighter to the lower right, was already at 0.754 when its weights were drawn, and training moved its nine weights by 0.09 of their starting length. It looks like an edge detector because the random draw put one there.
                </p>
                <p>
                  The third filter did move, by 1.86 times its starting length, and its closeness rose from 0.594 to 0.814, so of the two edge-like filters one was learned and one was inherited.
                </p>
                <NumberTable
                  headings={["seed 0", "closest direction", "closeness at start", "trained", "moved"]}
                  rows={[
                    ["filter 1", "brighter below", "0.309", "0.675", "1.33"],
                    ["filter 2", "brighter to the right", "0.552", "0.543", "0.01"],
                    ["filter 3", "brighter to the upper left", "0.594", "0.814", "1.86"],
                    ["filter 4", "brighter to the lower right", "0.754", "0.794", "0.09"],
                  ]}
                  caption="Moved is the length of the change in the nine weights over the length of the starting weights."
                />
                <KeepInMind>
                  A trained filter that resembles an edge grid may have
                  started that way. Comparing it with its own starting weights
                  is the only way to tell which.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Two filters that barely trained">
                <p>
                  The second and fourth filters at seed 0 hardly moved, and the reason is the activation function after the convolution, which passes a score through when it is above zero and answers zero otherwise. Where it answers zero it also passes no slope back, so a filter whose scores are below zero almost everywhere receives almost no correction.
                </p>
                <p>
                  Over every position of every held-out picture, the second filter answers above zero on 0.08% of them and the fourth on 2.3%. Their weights sum below zero, to −3.395 for the second and −0.738 for the fourth, and on pictures that are brighter than zero nearly everywhere that is enough to keep them quiet from the first step.
                </p>
                <InAModel title="Across the three seeds">
                  <p>
                    Counting a filter as nearly silent when it answers above
                    zero on fewer than one position in twenty, seed 0 has two
                    of its four first-layer filters in that state, seed 1 has
                    none and seed 2 has one. The network at seed 0 names 0.971
                    of the held-out pictures with half its first layer
                    effectively switched off, and it is the best of the three.
                  </p>
                </InAModel>
                <KeepInMind>
                  A unit whose activation function answers zero on everything it sees stops
                  learning, and nothing in the loss says so. Four filters is
                  few enough that losing two is visible here; in a layer of
                  hundreds it would pass unnoticed.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The learned filters answer to brightness too">
                <p>
                  A Sobel grid&rsquo;s nine weights sum to zero, so a patch of even brightness gives it nothing however bright it is. The two filters that did train at seed 0 have weights summing to 3.256 and 3.766, with biases of −0.589 and −0.963, so each answers to a patch that is bright overall, more strongly if the brightness sits on one side.
                </p>
                <p>
                  That is closer to a detector for the edge of a lit region than to a pure edge detector, and on these pictures, where every shape is lit against a darker ground, the two are nearly the same thing.
                </p>
                <KeepInMind>
                  Here the claim that the first layer learns edge detectors
                  held in part. Two of four filters became roughly edge-like,
                  one of those by its starting draw, both also respond to
                  plain brightness, and the other two barely trained at all.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A loss of 1.3691 over the first pass is about what a network spreading its probability evenly over the four kinds would report.",
              true,
              "The natural logarithm of 4 is 1.3863, and a loss starting near it says the network has not yet preferred any kind. It is a quick check that the starting weights are small enough, and after that first pass the network names 0.346 of the held-out pictures.",
            ),
            trueFalse(
              "The seed that finished with the lowest loss on the training half also gave the best held-out score.",
              false,
              "The lowest final loss belongs to seed 2 and the best held-out score to seed 0, so the training loss did not order them. All three name every training picture by the end, which is why a training accuracy of 1.000 cannot tell the arrangements apart, and why a difference smaller than the 0.05 spread between seeds is not evidence about an arrangement.",
            ),
            choice(
              "At seed 0 the four first-layer filters score 0.675, 0.543, 0.814 and 0.794 against the nearest of eight turned Sobel grids. Why is that not yet evidence of edge detectors?",
              [
                "Cosine after the mean is taken off is not a measure of shape",
                "Nine random numbers reach a median of 0.466 against the nearest of the eight, and one draw in ten beats 0.724",
                "The filters had not been trained for long enough to settle",
                "Each filter was compared with a single upright Sobel grid, so edges facing other ways were missed",
              ],
              1,
              "With eight directions to choose from, one of them is always fairly close, so a closeness means something only beside that baseline. Two of the four, at 0.814 and 0.794, come closer than nine random draws in ten, and the other two do not. Every filter was compared with all eight turned grids and scored against the nearest, which is exactly what gives a random grid its head start.",
            ),
            trueFalse(
              "Of the two edge-like filters at seed 0, one was learned and the other was already edge-like when its weights were drawn.",
              true,
              "The fourth filter was at 0.754 when its weights were drawn, and training moved them by 0.09 of their starting length, so it resembles an edge detector because the random draw put one there. The third filter did move, by 1.86 times its starting length, and rose from 0.594 to 0.814. Comparing a trained filter against its own starting weights is the only way to tell the two apart.",
            ),
            several(
              "Which of these does the page report about the two nearly silent filters at seed 0?",
              [
                "They answer above zero on 0.08% and 2.3% of positions across the held-out pictures",
                "Where the activation answers zero it passes no slope back, so they receive almost no correction",
                "Their weights sum below zero, to −3.395 and −0.738",
                "They are why seed 0 is the worst of the three networks",
              ],
              [0, 1, 2],
              "Seed 0 names 0.971 of the held-out pictures with half its first layer effectively switched off, and it is the best of the three. On pictures brighter than zero nearly everywhere, weights summing below zero are enough to keep a filter quiet from the first step. Four filters is few enough for this to be visible, and in a layer of hundreds it would pass unnoticed, since nothing in the loss says so.",
            ),
        ],
        },
        {
          title: "Part 4. What Each Depth Sees",
          content: (
            <>
              <SubSection title="12. The maps at each depth">
                <p>
                  The box at the top of the page carries one held-out picture of each kind through the network. The first convolution gives four maps the size of the picture, one per filter, bright where that filter&rsquo;s pattern is. Pooling halves each to eight by eight, keeping the largest value in each window, so a bright answer survives even if it moved within its window.
                </p>
                <p>
                  The second convolution reads all four pooled maps at once through its own three by three windows, 36 weights and a bias per filter, and gives eight maps, and the second pooling halves those to four by four.
                </p>
                <p>
                  On the cross, the maps after the first convolution follow
                  the bars, and the two nearly silent filters from section 10
                  are dark almost everywhere. By the second pooling each of the eight
                  maps is sixteen numbers, and no longer looks like the
                  picture at all. What it holds is where in the picture, to
                  within four pixels, each of eight second-layer patterns was
                  found.
                </p>
                <KeepInMind>
                  The second layer does not read pixels. It reads the first
                  layer&rsquo;s answers, so its patterns are arrangements of
                  first-layer patterns, which is what the word depth means in
                  a network like this.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. From maps to a vector to an answer">
                <p>
                  The flattening lays the eight four by four maps out as a
                  row of 128, the dense layer turns them into sixteen numbers
                  between −1 and 1, and the last layer gives four scores that
                  become probabilities. The sixteen numbers are the vector the{" "}
                  <Link href="/concepts/a-vector-for-a-picture" className={link}>
                    vector for a picture
                  </Link>{" "}
                  page reads off this same network.
                </p>
                <NumberTable
                  headings={["held-out picture", "cross", "square outline", "filled disc", "diagonal bar"]}
                  rows={[
                    ["a cross", "0.9968", "0.0009", "0.0022", "0.0000"],
                    ["a square outline", "0.0156", "0.9842", "0.0002", "0.0000"],
                    ["a filled disc", "0.4678", "0.0003", "0.5158", "0.0160"],
                    ["a diagonal bar", "0.0045", "0.0011", "0.0060", "0.9885"],
                  ]}
                  caption="The probabilities the network gives the first held-out picture of each kind, at seed 0."
                />
                <p>
                  Three of the four are named with near certainty. The disc
                  is named correctly by a margin of 0.048, with nearly half the
                  probability on a cross, and the maps in the box show why a
                  small filled disc and the middle of a thick cross are
                  similar things to a filter three pixels wide.
                </p>
                <KeepInMind>
                  The answer is decided by sixteen numbers, and everything
                  before them exists to make those sixteen say what kind of
                  shape the picture holds and nothing about where it was.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. How far one unit sees, from the geometry">
                <p>
                  A unit in the first map reads a three by three patch. A unit
                  after the first pooling reads a two by two block of those,
                  whose patches overlap, so it depends on a four by four patch
                  of pixels. Each layer widens the patch by an amount set by
                  its window and by how far apart its inputs sit, and pooling
                  doubles how far apart the next layer&rsquo;s inputs sit, so
                  every layer after a pooling widens the view twice as fast.
                </p>
                <Equation>{"field after  =  field before + (window − 1) × spacing before"}</Equation>
                <Equation>{"spacing after  =  spacing before × stride"}</Equation>
                <DerivationTable
                  expressionHeading="layer, field, spacing"
                  reasonHeading="what changed"
                  rows={[
                    { expression: "a pixel          1    1", reason: "one pixel sees itself, and neighbouring pixels are one apart." },
                    { expression: "convolution      3    1", reason: "a window of 3 over inputs one apart adds 2. The stride is 1, so the spacing stays." },
                    { expression: "pooling          4    2", reason: "a window of 2 over inputs one apart adds 1, and the stride of 2 doubles the spacing." },
                    { expression: "convolution      8    2", reason: "a window of 3 over inputs two apart adds 4." },
                    { expression: "pooling         10    4", reason: "a window of 2 over inputs two apart adds 2, and the spacing doubles again." },
                    { expression: "dense           16    ·", reason: "a dense unit reads every number of the flattened row, so it sees the whole picture." },
                  ]}
                />
                <KeepInMind>
                  After two rounds a single number sees ten pixels by ten, and
                  the largest square outline in the collection is ten pixels
                  on a side, so the last maps are the first place where one
                  unit can take in a whole shape.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Checked by brightening every pixel">
                <p>
                  The geometry says which pixels a unit could depend on. To
                  check it I brightened each of the 256 pixels of the held-out
                  cross by 0.5, one at a time, and recorded which of them
                  moved a chosen unit at all. The drawing shows the units
                  stacked over the middle of the picture, one at each depth,
                  and the box at the top of the page does the same for any
                  unit you click.
                </p>
                <CnnFieldGrowth />
                <p>
                  No pixel outside a window ever moved its unit, at any depth. Inside, the counts are 9 of 9, 14 of 16, 63 of 64 and 92 of 100. The shortfall is the pooling and the activation function. A maximum passes on only the largest value in its window, so a pixel that feeds only a losing position does not reach the unit, and a pixel that feeds only a unit whose activation function answered zero does not either.
                </p>
                <p>
                  For the unit in the corner of the last maps the window runs from three pixels outside the picture to six inside, so 49 of its 100 pixels exist and the rest are the padding&rsquo;s zeros; 45 of the 49 moved it.
                </p>
                <KeepInMind>
                  The geometry gives the most a unit can see. What it actually
                  responds to, on a given picture, is a subset, and the subset
                  changes with the picture, since which positions win a
                  pooling window depends on what is in it.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Why depth buys a wider view">
                <p>
                  Without pooling, the same two convolutions give a field of 3
                  and then 5, since the second convolution&rsquo;s inputs are
                  still one pixel apart. The pooling between them is what lets
                  the second layer&rsquo;s three by three window cover eight
                  pixels instead of five, and the second pooling takes it to
                  ten.
                </p>
                <>
                  <p>
                    A single convolution with a ten-by-ten kernel sees ten pixels across
                    at once. On a one-channel image, eight such filters would need:
                  </p>
                  <Equation>{"large-kernel parameters = 8 × (10 × 10 + 1) = 808\ntwo small convolutions = 40 + 296 = 336"}</Equation>
                  <p>
                    The larger filters would look for a complete pattern directly. The
                    two smaller convolutions build later features from the earlier
                    features, using fewer parameters in this example.
                  </p>
                </>
                <KeepInMind>
                  Depth widens the view cheaply because each layer reuses
                  what the one beneath found, and pooling makes it widen
                  faster by spreading each layer&rsquo;s inputs further apart.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Taking Pooling Away",
          content: (
            <>
              <SubSection title="17. What removing pooling changes besides pooling">
                <p>
                  Taking the two poolings out leaves both convolutions reading
                  and answering at full size, so the last maps are eight of
                  sixteen by sixteen and the flattening hands the dense layer
                  2048 numbers instead of 128. No arrangement removes pooling
                  and leaves everything else as it was, since the pooling is
                  what decides that width.
                </p>
                <NumberTable
                  headings={["", "the network", "pooling taken away"]}
                  rows={[
                    ["flattened width", "128", "2048"],
                    ["dense layer parameters", "2064", "32784"],
                    ["all parameters", "2468", "33188"],
                    ["multiplications per picture", "29,760", "115,776"],
                    ["field of the last convolution", "8", "5"],
                  ]}
                />
                <p>
                  So the network without pooling has 13.4 times the parameters
                  and does 3.9 times the arithmetic per picture, and anything
                  measured on it measures the loss of pooling and the gain in
                  parameters together.
                </p>
                <KeepInMind>
                  Removing pooling also removes the shrinking, and the
                  shrinking is what kept the dense layer small. The two cannot
                  be separated in this arrangement, and every number below
                  carries both.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Held-out accuracy without pooling">
                <p>
                  Trained with the same loop from the same three seeds, the
                  network without pooling names every training picture, as
                  the network does, and does worse on the held-out half at
                  every seed.
                </p>
                <CnnPartsBoard variants={["reference", "without_pooling"]} />
                <p>
                  The held-out scores are 0.875, 0.821 and 0.817 against
                  0.971, 0.921 and 0.967. The gap, between 0.096 and 0.150 at
                  matching seeds, is larger than the spread of either
                  arrangement across its own seeds, so it is a difference in
                  the arrangement. The larger network fitted the training half
                  just as completely and carried less of it over to pictures
                  it had not seen.
                </p>
                <KeepInMind>
                  Pooling helped here, and some of the help may be nothing
                  more than keeping the dense layer small enough that 240
                  pictures could constrain it. The measurement cannot say how
                  much.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The textbook claim, measured on moved pictures">
                <p>
                  The reason usually given for pooling is that it makes a
                  network indifferent to where a pattern sits, within a
                  window. To test that I moved every held-out picture one, two
                  and three pixels right, left, down and up, keeping only the
                  moves that left the whole shape inside the frame and filling
                  the strip left behind from the picture&rsquo;s own edge, and
                  counted how often the network&rsquo;s answer changed.
                </p>
                <CnnShiftChart variants={["reference", "without_pooling"]} />
                <NumberTable
                  headings={["calls changed", "seed 0", "seed 1", "seed 2"]}
                  rows={[
                    ["the network, one pixel", "6.7%", "11.5%", "5.5%"],
                    ["pooling taken away, one pixel", "16.8%", "23.3%", "24.9%"],
                    ["the network, three pixels", "12.0%", "19.9%", "11.9%"],
                    ["pooling taken away, three pixels", "33.7%", "40.6%", "38.4%"],
                  ]}
                  caption="947 moved pictures at one pixel, 825 at two and 700 at three, since fewer moves keep the shape in frame as the distance grows."
                />
                <p>
                  With pooling a one-pixel move changes the answer on 5.5 to
                  11.5 percent of pictures, and without it on 16.8 to 24.9
                  percent, so pooling cut the sensitivity to a shift by
                  between two and four times. It did not remove it. At seed 0
                  the network names 0.970 of the pictures moved by one pixel
                  before the move and 0.939 after it.
                </p>
                <KeepInMind>
                  The textbook claim that pooling makes a network indifferent
                  to small shifts did not hold at this scale. Pooling made the
                  network less sensitive to a move of one pixel, and still one
                  answer in every nine to eighteen changed.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Why a two by two maximum cannot promise it">
                <p>
                  A maximum over a window is unchanged by a move only if the
                  largest value stays inside the same window. The windows are
                  fixed to the grid, two pixels wide, so a move of one pixel
                  carries half the positions across a window boundary, and
                  wherever the winner crosses, the pooled value changes. After
                  two poolings the grid of windows is four pixels wide, and
                  the dense layer that reads the result gives each of the 128
                  numbers its own weights, so it is not indifferent to which
                  window a pattern landed in at all.
                </p>
                <WhyThisWorks title="Why a move of two is not safer than a move of one">
                  <p>
                    A move of two pixels lines up with the first pooling&rsquo;s
                    windows, so the first pooled maps simply move by one
                    position. But the second pooling&rsquo;s windows are four
                    pixels wide, and a move of one position in its input
                    crosses its boundaries just as a move of one pixel crossed
                    the first. Measured at seed 0 a move of two changes 8.1%
                    of answers, between the 6.7% at one pixel and 12.0% at
                    three, with no sign that the alignment helped.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Pooling gives a little tolerance inside each window and none
                  across windows, and the dense layer at the end sees exactly
                  which window everything is in. Azulay and Weiss found the
                  same shortfall in networks thousands of times this size.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "After two rounds of convolve and pool, how much of the picture does one number see?",
              ["Three pixels by three", "Five by five", "Ten by ten", "The whole sixteen by sixteen"],
              2,
              "Each layer widens the patch by an amount set by its window and by how far apart its inputs sit, and a pooling doubles that spacing, so every layer after a pooling widens the view twice as fast. Without the poolings the same two convolutions reach 3 and then 5. The largest square outline in the collection is ten pixels on a side, so the last maps are the first place one unit can take in a whole shape.",
            ),
            trueFalse(
              "Brightening the held-out cross one pixel at a time never found a pixel outside a unit’s window that moved the unit, and found some inside the window that did not move it either.",
              true,
              "No pixel outside a window ever moved its unit at any depth, and inside the counts are 9 of 9, 14 of 16, 63 of 64 and 92 of 100. The shortfall is the pooling and the activation function, since a pixel feeding only a losing position in a maximum never reaches the unit, and neither does one feeding a unit whose activation answered zero. The geometry gives the most a unit can see, and what it responds to is a subset that changes with the picture.",
            ),
            choice(
              "Taking the two poolings out and training from the same three seeds gives what?",
              [
                "Held-out scores of 0.875, 0.821 and 0.817 against 0.971, 0.921 and 0.967",
                "A network that can no longer fit even its training half",
                "Scores inside the spread between seeds, so no difference in the arrangement",
                "A smaller network, since the poolings were holding weights",
              ],
              0,
              "The gap at matching seeds runs from 0.096 to 0.150, larger than the spread of either arrangement across its own seeds, so it is a difference in the arrangement. The network without pooling still names every training picture. It also carries 13.4 times the parameters and 3.9 times the arithmetic, because removing the pooling removes the shrinking that kept the dense layer small, so the measurement carries both at once.",
            ),
            trueFalse(
              "Pooling made the network indifferent to a one-pixel move, which is the reason usually given for having it.",
              false,
              "With pooling a one-pixel move changes the answer on 5.5 to 11.5 percent of pictures and without it on 16.8 to 24.9, so pooling cut the sensitivity by between two and four times and did not remove it. A maximum survives a move only while the largest value stays inside the same window, and the dense layer at the end gives each of the 128 numbers its own weights, so it is not indifferent to which window a pattern landed in at all.",
            ),
            choice(
              "A move of two pixels lines up with the first pooling’s two-pixel windows. What did moving the held-out pictures by two pixels do at seed 0?",
              [
                "It changed 8.1% of answers, between the 6.7% at one pixel and the 12.0% at three",
                "It changed no answers, since every pattern stayed inside its window",
                "It changed fewer answers than a move of one pixel, since the alignment helped",
                "It changed more answers than a move of three pixels",
              ],
              0,
              "The first pooled maps simply move by one position, but the second pooling’s windows are four pixels wide, and a move of one position in its input crosses its boundaries just as a move of one pixel crossed the first. So the measurement shows no sign that the alignment helped. Pooling gives a little tolerance inside each window and none across windows.",
            ),
        ],
        },
        {
          title: "Part 6. Taking the Convolutions Away",
          content: (
            <>
              <SubSection title="21. A dense network of comparable size">
                <p>
                  Section 2 opened the page on the dense network, and here it
                  is beside the others. Taking the convolutions away entirely
                  and keeping the parameter count close, 2541 against 2468,
                  the dense network names 0.663 to 0.729 of the held-out
                  pictures against the network&rsquo;s 0.921 to 0.971, and it
                  is the only arrangement that fails to fit its own training
                  half in 40 passes.
                </p>
                <CnnPartsBoard
                  variants={["reference", "one_round", "without_pooling", "dense"]}
                />
                <p>
                  Its trouble shows on the moved pictures as well. A one-pixel
                  move changes its answer on 30.8 to 37.9 percent of them,
                  more than pooling taken away, and at seed 0 about five times
                  the network&rsquo;s 6.7 percent.
                </p>
                <CnnShiftChart
                  variants={["reference", "one_round", "without_pooling", "dense"]}
                />
                <KeepInMind>
                  With the same number of weights, the arrangement that uses
                  them as small grids swept across the picture names 0.19 to
                  0.30 more of the held-out pictures than the arrangement that
                  gives every pixel its own weight.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What each arrangement costs">
                <p>
                  Parameters are only one cost. Every weight in a dense layer
                  is used once per picture, and every weight in a convolution
                  is used at every position it is swept to, so the two counts
                  come apart.
                </p>
                <NumberTable
                  headings={["arrangement", "parameters", "multiplications per picture"]}
                  rows={[
                    ["the network", "2,468", "29,760"],
                    ["one round only", "4,220", "13,376"],
                    ["pooling taken away", "33,188", "115,776"],
                    ["no convolutions", "2,541", "2,512"],
                  ]}
                  caption="Multiplications are counted as one per weight per position it is used at. Pooling compares and flattening rearranges, and neither is counted."
                />
                <p>
                  The network and the dense one hold nearly the same number of
                  weights, and the network does 11.8 times as much arithmetic
                  on each picture, 9,216 multiplications in the first
                  convolution and 18,432 in the second against 2,048 in its
                  dense layer. That arithmetic is where the held-out accuracy
                  came from. The training chart in section 5 prints how long
                  the training took on the machine that answered, which moves
                  from run to run while these counts do not.
                </p>
                <KeepInMind>
                  Sharing weights across positions is why the network holds
                  fewer parameters than the dense one and still does 11.8
                  times its arithmetic, and on a larger picture the
                  arithmetic would grow with the area while the 336
                  convolution weights stayed as they are.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. What the second round contributes">
                <p>
                  One more arrangement asks what the second round of convolve
                  and pool adds. Keeping only the first round leaves four maps
                  of eight by eight, 256 numbers, for the dense layer, which
                  now holds 4112 weights, so the network with one round has
                  more parameters than the network with two, 4220 against
                  2468.
                </p>
                <NumberTable
                  headings={["", "seed 0", "seed 1", "seed 2"]}
                  rows={[
                    ["one round, held out", "0.896", "0.892", "0.858"],
                    ["two rounds, held out", "0.971", "0.921", "0.967"],
                    ["one round, calls changed by one pixel", "11.9%", "14.9%", "19.9%"],
                    ["two rounds, calls changed by one pixel", "6.7%", "11.5%", "5.5%"],
                  ]}
                />
                <p>
                  The second round raised the held-out accuracy at every seed,
                  by 0.029 to 0.109, and lowered the share of answers a
                  one-pixel move changed, while taking 1752 parameters away.
                  In the geometry of section 14, one round leaves each number
                  seeing four pixels by four, and two rounds leave it seeing
                  ten, which is most of a shape.
                </p>
                <KeepInMind>
                  The second round is cheaper in parameters than the dense
                  weights it replaces, and better on the held-out pictures,
                  because it lets the network describe a shape as an
                  arrangement of the pieces the first round found.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="24. A picture of another size">
                <p>
                  A convolution and a pooling can read a picture of any size,
                  since both are defined window by window. The dense layer
                  cannot. Its weights are one per number of the flattened
                  row, and the length of that row is fixed by the picture
                  the network was built for.
                </p>
                <NumberTable
                  headings={["side", "after two poolings", "flattened width", "the dense layer reads 128"]}
                  rows={[
                    ["12", "3 × 3", "72", "undefined"],
                    ["15", "3 × 3", "72", "undefined"],
                    ["16", "4 × 4", "128", "defined"],
                    ["17", "4 × 4", "128", "defined, the last row and column never read"],
                    ["20", "5 × 5", "200", "undefined"],
                    ["32", "8 × 8", "512", "undefined"],
                  ]}
                  caption="Eight maps at the end, so the flattened width is 8 times the square of what two halvings leave."
                />
                <p>
                  A seventeen-pixel picture happens to fit, because a two by
                  two pooling of an odd side keeps only whole windows and
                  leaves the last row and column out, which is a quiet way to
                  lose a pixel. The usual repair for other sizes is to pool
                  each final map down to a single number, whatever its size,
                  which makes the row as long as the number of maps; the
                  network here does not do that, and so it reads sixteen by
                  sixteen and sixteen by sixteen only.
                </p>
                <KeepInMind>
                  The convolutional part of the network is defined for any
                  picture, and the dense part is defined for one size, so the
                  whole network is defined for one size.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A kind it was never shown">
                <p>
                  The last layer turns four scores into four probabilities
                  that sum to one, so every picture is shared out among the
                  four kinds and no picture can be given to none of them.
                  Shown sixty rings, a kind it never trained on, the network
                  has no way to say that a ring is none of these.
                </p>
                <CnnUnseenKind />
                <p>
                  It called 48 of the 60 rings a square outline, 9 a cross and 3 a filled disc, which is a reasonable guess in shape, a closed outline with nothing inside. Its confidence dropped, and not by much. The probability of its call averaged 0.861 on the rings against 0.948 on the held-out pictures of the kinds it knows, and 63% of the rings were called with more than 0.9.
                </p>
                <p>
                  Shown a picture with nothing on it at all, an even brightness of 0.15, it calls it a diagonal bar with a probability of 0.892.
                </p>
                <KeepInMind>
                  A probability from this last layer is a share among the
                  kinds the network was built with. It is not a measure of
                  whether the picture belongs to any of them, and a blank
                  picture shows that plainly.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. The cases where the arrangement has no answer">
                <p>
                  Each of these is a fact about stacking windows, strides and
                  a dense layer, and each is a decision any convolutional
                  network faces, whatever builds it.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "a window wider than what it reads, padding included", reason: "the output extent is the input extent minus the window, plus twice the padding, divided by the stride, plus one, and when that comes out below one there is no position to place the window. The arrangement is undefined before any picture arrives, which is why it can be checked when the network is built." },
                    { expression: "an odd side under a two by two pooling", reason: "the windows cover the side in whole pairs, so one row and one column are never read. Defined, and lossy, and the only choices are to accept the loss, pad to an even side first, or use windows that overlap." },
                    { expression: "a picture of any size but the one built for", reason: "the flattened row is a different length from the dense layer’s weights, so the product is not defined. Section 24 has the widths." },
                    { expression: "every filter started with the same weights", reason: "identical filters give identical answers, receive identical corrections and stay identical forever, so a layer of four is a layer of one. The starting weights must differ, which is why they are drawn at random." },
                    { expression: "a filter whose activation function answers zero everywhere", reason: "no slope passes back through a zero answer, so the filter receives no correction and never changes. At seed 0 two of the four first-layer filters were within a few percent of this." },
                    { expression: "a unit whose window runs past the picture", reason: "the padding supplies zeros that are not pixels, so the unit is comparing a shape with a black border that was never photographed. The corner unit of the last maps has 49 of its 100 pixels inside the picture." },
                    { expression: "a shape moved partly out of the frame", reason: "the part outside is gone, so the moved picture holds a different, smaller shape, and asking whether the answer should stay the same has no answer. The shift test above leaves such moves out." },
                    { expression: "a kind outside the set", reason: "the probabilities are shared among the kinds the last layer was built with and always sum to one, so there is no way to answer none of these. Section 25 measures what it does instead." },
                  ]}
                />
                <KeepInMind>
                  Two of these are silent in practice, the filter that stops
                  answering and the picture of a kind outside the set, since
                  in both the network goes on producing numbers that look like
                  answers, and section 25 measured how confident those numbers
                  can be.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            choice(
              "The network and the dense one hold nearly the same number of weights, 2468 against 2541. How does the arithmetic per picture compare?",
              [
                "The same, since the weight counts match",
                "The network does 11.8 times as much",
                "The dense network does more, since every pixel has a weight of its own",
                "It cannot be counted until a picture arrives",
              ],
              1,
              "Every weight in a dense layer is used once per picture and every weight in a convolution is used at every position it is swept to, so the two counts come apart. The network’s two convolutions do 9,216 and 18,432 multiplications against the 2,048 of its own dense layer, and that arithmetic is where the held-out accuracy came from. On a larger picture it would grow with the area while the 336 convolution weights stayed as they are.",
            ),
            choice(
              "Keeping only the first round of convolve and pool gives what?",
              [
                "Fewer parameters and a better held-out score, since the network is simpler",
                "4220 parameters, more than the two-round network, and a score lower by 0.029 to 0.109",
                "2468 parameters, the same, since the second round holds few weights",
                "4220 parameters and the same held-out score",
              ],
              1,
              "One round leaves four maps of eight by eight, so the dense layer holds 4112 weights and the network 4220 against 2468. The second round raised the held-out accuracy at every seed and lowered the share of answers a one-pixel move changed, while taking 1752 parameters away. One round leaves each number seeing four pixels by four where two rounds leave it seeing ten, which is most of a shape.",
            ),
            trueFalse(
              "A convolution and a pooling are defined window by window, so the network can read a picture of any size.",
              false,
              "The two halves of the network differ. A dense layer’s weights are one per number of the flattened row, and that length is fixed by the picture the network was built for, so the whole network is defined for one size. The usual repair is to pool each final map down to a single number, which this one does not do. A seventeen-pixel picture happens to fit, because a two by two pooling of an odd side keeps only whole windows and quietly leaves the last row and column out.",
            ),
            several(
              "Which of these hold of the probabilities the last layer gives a picture of a kind it was never shown?",
              [
                "They sum to one over the four kinds it was built with, so no picture can be given to none of them",
                "On sixty rings the probability of the call averaged 0.861, against 0.948 on the kinds the network knows",
                "A blank picture of even brightness is spread evenly over the four kinds",
                "A probability above 0.9 is kept for the kinds it trained on, so a lower one marks a picture from outside the set",
              ],
              [0, 1],
              "Every picture is shared out among the four kinds, and the network called 48 of the 60 rings a square outline, a reasonable guess for a closed outline with nothing inside. Its confidence dropped only a little, and 63% of the rings were called with more than 0.9, so a high probability does not mark a known kind. A blank picture of even brightness 0.15 is called a diagonal bar with a probability of 0.892, which is nowhere near an even spread.",
            ),
            trueFalse(
              "Of the four arrangements trained on this page, the dense network on the raw pixels is the only one that does not name every training picture after 40 passes.",
              true,
              "Its training-half accuracy ends at 0.917, 0.958 and 0.946 across the three seeds, while the network, the one with a single round and the one with pooling taken away all reach 1.000. That is why a training accuracy of 1.000 cannot tell the other arrangements apart and the held-out half has to. The dense network holds about as many weights as the network, 2541 against 2468, so the difference lies in how the weights are arranged and not in how many there are.",
            ),
        ],
        },
        {
          title: "Practice. Assembling the Network and Training a Small One",
          practice: [
            exercise(
              "Count the weights and the multiplications",
              ["Part 1 lists the network layer by layer and Part 6 counts what each arrangement costs to run. The starter builds the seven layers as a stack for a sixteen by sixteen picture of one channel. Walk it, printing for each layer the arrangement it answers with, how many parameters it holds and how many multiplications it does on one picture, counting a multiplication the way Part 6 does, one per weight per position the weight is used at.", "The page gives 40, 296, 2,064 and 68 parameters, 2,468 in all, and 9,216, 18,432 and 2,048 multiplications among 29,760. Then print the share of the parameters and the share of the multiplications that belong to the two convolutions, which the page states as counts and not as shares."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear

draw = np.random.default_rng(0)
stack = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(4)]),
])

parameters, multiplications = [], []
for layer in stack:
    held, used = 0, 0
    # For a convolution and for a dense layer, set held to the number of
    # parameters and used to the multiplications on one picture. Pooling and
    # flattening stay at zero.
    parameters.append(held)
    multiplications.append(used)
    print(f"{type(layer).__name__:10} answers {layer.shape.answers}, holds {held}, multiplies {used} times")
# Print both totals, how much of each belongs to the two convolutions, which
# sit at positions 0 and 2, and each share to three places.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear

draw = np.random.default_rng(0)
stack = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(4)]),
])

parameters, multiplications = [], []
for layer in stack:
    held, used = 0, 0
    if isinstance(layer, Conv2d):
        held = layer.kernels.size + layer.bias_vector.size
        used = layer.kernels.size * layer.shape.answers[1] * layer.shape.answers[2]
    if isinstance(layer, DenseLayer):
        held = layer.weight_matrix.size + layer.bias_vector.size
        used = layer.weight_matrix.size
    parameters.append(held)
    multiplications.append(used)
    print(f"{type(layer).__name__:10} answers {layer.shape.answers}, holds {held}, multiplies {used} times")
swept_held, swept_used = parameters[0] + parameters[2], multiplications[0] + multiplications[2]
print(f"{sum(parameters)} parameters, {swept_held} of them in the convolutions, a share of {swept_held / sum(parameters):.3f}")
print(f"{sum(multiplications)} multiplications, {swept_used} of them in the convolutions, a share of {swept_used / sum(multiplications):.3f}")`,
              `Conv2d     answers (4, 16, 16), holds 40, multiplies 9216 times
MaxPool2d  answers (4, 8, 8), holds 0, multiplies 0 times
Conv2d     answers (8, 8, 8), holds 296, multiplies 18432 times
MaxPool2d  answers (8, 4, 4), holds 0, multiplies 0 times
Flatten    answers (128,), holds 0, multiplies 0 times
DenseLayer answers (16,), holds 2064, multiplies 2048 times
DenseLayer answers (4,), holds 68, multiplies 64 times
2468 parameters, 336 of them in the convolutions, a share of 0.136
29760 multiplications, 27648 of them in the convolutions, a share of 0.929`,
              { hints: ["A stack can be walked like a list, and isinstance tells a convolution from a dense layer. A convolution keeps what it learns in kernels and bias_vector, a dense layer in weight_matrix and bias_vector, and each of those has a size.", "A convolution uses every kernel weight once at every position of its answer. Its shape.answers holds filters, height and width, so the positions are the last two extents multiplied together.", "A dense layer uses each weight once per picture, so its multiplications are the size of its weight matrix. The biases are added and not multiplied, so they count as parameters only."], check: numberCheck("What share of the network’s multiplications do the two convolutions do, to three places?", 0.929, 0.0005, "The two convolutions hold 336 of the 2,468 parameters, a share of 0.136, and do 27,648 of the 29,760 multiplications, a share of 0.929. A dense weight is used once per picture, while a kernel weight is used at every position it is swept to, 256 positions in the first convolution and 64 in the second, so the layers holding the fewest weights do nearly all the arithmetic. That is the split Part 6 comes back to when it says the two counts come apart.") },
            ),
            exercise(
              "Work out how far one unit sees, and add a third round",
              ["Part 4 works out how far one unit sees from two rules. The field grows by the window less one, times the spacing the layer’s inputs arrive with, and the spacing is then multiplied by the stride. Apply both to the layers themselves, reading each window and each stride off the layer. The starter holds the two rounds of the page’s network.", "Add a third round, a convolution of sixteen filters reading what the second pooling answers and a pooling after it, and print the arrangement, the field and the spacing after every layer. The page gives fields of 3, 4, 8 and 10 for the first four layers. The third round is not on the page."],
              `from oop_ml import Conv2d, LayerStack, MaxPool2d, RectifiedLinear

stack = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    # Add a third round here, a convolution of sixteen filters with the same
    # window and padding, and a pooling that reads what it answers.
])

field, spacing = 1, 1
for layer in stack:
    # Read the layer's window and stride, grow the field, then widen the
    # spacing, and print the arrangement answered, the field and the spacing.
    pass`,
              `from oop_ml import Conv2d, LayerStack, MaxPool2d, RectifiedLinear

stack = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Conv2d(reads=(8, 4, 4), n_filters=16, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=2),
    MaxPool2d(reads=(16, 4, 4)),
])

field, spacing = 1, 1
for layer in stack:
    window = layer.kernel_size if isinstance(layer, Conv2d) else layer.window
    field += (window - 1) * spacing
    spacing *= layer.stride
    print(f"{type(layer).__name__:9} answers {layer.shape.answers}, field {field}, spacing {spacing}")`,
              `Conv2d    answers (4, 16, 16), field 3, spacing 1
MaxPool2d answers (4, 8, 8), field 4, spacing 2
Conv2d    answers (8, 8, 8), field 8, spacing 2
MaxPool2d answers (8, 4, 4), field 10, spacing 4
Conv2d    answers (16, 4, 4), field 18, spacing 4
MaxPool2d answers (16, 2, 2), field 22, spacing 8`,
              { hints: ["The third convolution reads (8, 4, 4), which is what the second pooling answers. A convolution with a padding of one answers at the size it reads, so with sixteen filters the pooling after it reads (16, 4, 4).", "A convolution keeps its window as kernel_size and a pooling keeps its own as window, and both keep a stride.", "Grow the field before widening the spacing, since a layer’s window is laid over inputs at the spacing they arrive with."], check: numberCheck("How many pixels across does one unit see after the third pooling?", 22, 0.5, "The third convolution’s inputs sit four pixels apart, so its window of three adds eight and takes the field from 10 to 18, and the pooling after it adds four more. A field of 22 is wider than the picture’s 16 pixels, so every unit that deep has part of its window outside the picture and reads the padding’s zeros there, the case Part 7 lists as a unit whose window runs past the picture. Each pooling doubled the spacing, which is why the third round widened the view by twelve pixels where the first widened it by three.") },
            ),
            exercise(
              "Offer the dense layer a picture of another size",
              ["Part 7 says the convolutions and the poolings can be laid over a picture of any size and the dense layer cannot, because its weights are one per number of the flattened row. The starter holds a dense layer of sixteen units reading 128 numbers, the width the network was built with, and for each side in its list it builds the two rounds and the flattening for a picture of that side. Offer the dense layer to a stack on top of them.", "Print what the two poolings leave, the length of the flattened row, and whether the dense layer joins or what the library says when it does not. The page’s table has sides 12, 15, 16, 17, 20 and 32. Side 24 is not in it."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, LayerStack, MaxPool2d, MLLibError, Neuron, RectifiedLinear

dense = DenseLayer([Neuron(weights=np.zeros(128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)])
for side in (12, 15, 16, 17, 20, 24, 32):
    half, quarter = side // 2, side // 4
    front = LayerStack([
        Conv2d(reads=(1, side, side), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
        MaxPool2d(reads=(4, side, side)),
        Conv2d(reads=(4, half, half), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
        MaxPool2d(reads=(8, half, half)),
        Flatten(reads=(8, quarter, quarter)),
    ])
    # Try to build a stack of the front layers followed by the dense layer.
    # Print the side, what the second pooling answers, the length of the
    # flattened row, and either that the dense layer joins or the library's
    # refusal in its own words.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, LayerStack, MaxPool2d, MLLibError, Neuron, RectifiedLinear

dense = DenseLayer([Neuron(weights=np.zeros(128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)])
for side in (12, 15, 16, 17, 20, 24, 32):
    half, quarter = side // 2, side // 4
    front = LayerStack([
        Conv2d(reads=(1, side, side), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
        MaxPool2d(reads=(4, side, side)),
        Conv2d(reads=(4, half, half), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
        MaxPool2d(reads=(8, half, half)),
        Flatten(reads=(8, quarter, quarter)),
    ])
    try:
        LayerStack([*front, dense])
        verdict = "the dense layer joins"
    except MLLibError as refusal:
        verdict = f"refused, {refusal}"
    print(f"side {side}: two poolings leave {front[3].shape.answers}, a row of {front.shape.n_outputs}, {verdict}")`,
              `side 12: two poolings leave (8, 3, 3), a row of 72, refused, layer 4 answers with (72,) and layer 5 reads (128,)
side 15: two poolings leave (8, 3, 3), a row of 72, refused, layer 4 answers with (72,) and layer 5 reads (128,)
side 16: two poolings leave (8, 4, 4), a row of 128, the dense layer joins
side 17: two poolings leave (8, 4, 4), a row of 128, the dense layer joins
side 20: two poolings leave (8, 5, 5), a row of 200, refused, layer 4 answers with (200,) and layer 5 reads (128,)
side 24: two poolings leave (8, 6, 6), a row of 288, refused, layer 4 answers with (288,) and layer 5 reads (128,)
side 32: two poolings leave (8, 8, 8), a row of 512, refused, layer 4 answers with (512,) and layer 5 reads (128,)`,
              { hints: ["A LayerStack checks every join when it is built and raises a refusal deriving from MLLibError when one does not hold, so building one inside a try block is the whole test. No picture is needed.", "A stack can be unpacked like a list, so [*front, dense] is the five front layers with the dense layer after them.", "A stack’s own shape reports what its last layer answers, so the length of the flattened row is front.shape.n_outputs, and front[3] is the second pooling."], check: numberCheck("How long is the flattened row for a picture 24 pixels on a side?", 288, 0.5, "Two halvings of 24 leave six by six, and eight maps of six by six flatten to 288 numbers, which a dense layer built for 128 cannot read. Only sides 16 and 17 join, and 17 joins only because a two by two pooling of an odd side keeps whole windows and drops the last row and column, the quiet loss Part 7 points out. Every refusal here arrives when the stack is built, in a comparison of two arrangements, before any picture exists.") },
            ),
            exercise(
              "Train a small one end to end, then move its pictures",
              ["The page’s pictures are drawn by the site and not by the library, so this problem draws a smaller collection of its own. Two hundred pictures twelve pixels on a side, half crosses and half square outlines five pixels across, each placed at random with its left edge in columns 1 to 6, lit at 0.6 on a ground of 0.1 with a little noise. The network is the page’s arrangement cut down to fit. The first hundred pictures train it and the second hundred are held out.", "Write the loop of Part 2, thirty passes over the training hundred in shuffled batches of ten at a step size of 0.1, and print the loss over the first and the last pass beside the logarithm of the number of kinds, which Part 2 says a loss should start near. Then print the held-out accuracy and repeat Part 5’s test. Move every held-out picture one pixel right, filling the strip left behind from the picture’s own edge, and count how many calls change, separately for the shapes the move pushed against the right edge, where no training shape sat."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

draw = np.random.default_rng(0)
labels, corners = np.arange(200) % 2, draw.integers(1, 7, size=(200, 2))
pictures = np.zeros((200, 1, 12, 12))
for picture, label, (top, left) in zip(pictures, labels, corners):
    patch = picture[0, top : top + 5, left : left + 5]
    if label == 0:
        patch[2, :] = patch[:, 2] = 1.0  # a cross
    else:
        patch[[0, 4], :] = patch[:, [0, 4]] = 1.0  # a square outline
pictures = 0.1 + 0.5 * pictures + draw.normal(0.0, 0.05, pictures.shape)

stack = LayerStack([
    Conv2d(reads=(1, 12, 12), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
    MaxPool2d(reads=(4, 12, 12)),
    Conv2d(reads=(4, 6, 6), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 6, 6)),
    Flatten(reads=(8, 3, 3)),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 72) ** 0.5, 72), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
loss, targets = SoftmaxCrossEntropy(), np.eye(2)[labels]
for epoch in range(1, 31):
    order, total = draw.permutation(100), 0.0
    # Walk the shuffled order ten pictures at a time. For each batch take the
    # stack's backward pass, add the batch's loss times its size to total, and
    # step the stack by 0.1.
    if epoch in (1, 30):
        print(f"pass {epoch}: loss {total / 100:.4f}")
print(f"an even split over two kinds costs {np.log(2):.4f}")

held, kinds = pictures[100:], labels[100:]
# Print the held-out accuracy. Then build the moved pictures, find which
# calls changed, and print the count of changes in all, among the shapes
# whose left edge was in column 6, and among the rest.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

draw = np.random.default_rng(0)
labels, corners = np.arange(200) % 2, draw.integers(1, 7, size=(200, 2))
pictures = np.zeros((200, 1, 12, 12))
for picture, label, (top, left) in zip(pictures, labels, corners):
    patch = picture[0, top : top + 5, left : left + 5]
    if label == 0:
        patch[2, :] = patch[:, 2] = 1.0  # a cross
    else:
        patch[[0, 4], :] = patch[:, [0, 4]] = 1.0  # a square outline
pictures = 0.1 + 0.5 * pictures + draw.normal(0.0, 0.05, pictures.shape)

stack = LayerStack([
    Conv2d(reads=(1, 12, 12), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=0),
    MaxPool2d(reads=(4, 12, 12)),
    Conv2d(reads=(4, 6, 6), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 6, 6)),
    Flatten(reads=(8, 3, 3)),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 72) ** 0.5, 72), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=draw.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
loss, targets = SoftmaxCrossEntropy(), np.eye(2)[labels]
for epoch in range(1, 31):
    order, total = draw.permutation(100), 0.0
    for first in range(0, 100, 10):
        chosen = order[first : first + 10]
        backward = stack.backward_pass(pictures[chosen], targets[chosen], loss)
        total += backward.loss * len(chosen)
        stack = stack.stepped_by(backward, 0.1)
    if epoch in (1, 30):
        print(f"pass {epoch}: loss {total / 100:.4f}")
print(f"an even split over two kinds costs {np.log(2):.4f}")

held, kinds = pictures[100:], labels[100:]
calls = np.asarray(stack.respond_to(held).outputs).argmax(axis=1)
print(f"held-out accuracy {np.mean(calls == kinds):.3f}")
moved = np.concatenate([held[..., :1], held[..., :-1]], axis=3)
changed = np.asarray(stack.respond_to(moved).outputs).argmax(axis=1) != calls
pushed = corners[100:, 1] == 6
print(f"moved one pixel right, {changed.sum()} of 100 calls changed")
print(f"pushed against the right edge, {changed[pushed].sum()} of {pushed.sum()} changed")
print(f"everywhere else, {changed[~pushed].sum()} of {(~pushed).sum()} changed")`,
              `pass 1: loss 0.6998
pass 30: loss 0.0070
an even split over two kinds costs 0.6931
held-out accuracy 1.000
moved one pixel right, 20 of 100 calls changed
pushed against the right edge, 20 of 22 changed
everywhere else, 0 of 78 changed`,
              { hints: ["One step is backward_pass on the stack with a batch of pictures, their rows of targets and the loss, followed by stepped_by with what came back and the step size, which answers a new stack. The batch’s loss is on what backward_pass returns.", "What a stack’s respond_to answers has outputs, the last layer’s scores with one row per picture, and the call is the position of the largest score in the row.", "A picture moved one pixel right is its first column repeated, followed by every column but the last, joined along the last axis.", "The second number in each row of corners is the column of the shape’s left edge, and a shape five pixels across whose left edge starts in column 6 is the one the move leaves against the right edge."], check: numberCheck("How many of the hundred held-out calls change when every picture moves one pixel right?", 20, 1.5, "The network names every held-out picture, and a move of one pixel still changes twenty of its calls. All twenty are among the 22 shapes the move pushed against the right edge, a place no training shape sat, and none of the other 78 changed. That is what Part 5 says of the dense layer at the end, which gives each flattened number its own weights and so is not indifferent to which window a pattern landed in. The page’s own network changed 5.5 to 11.5 percent of its calls under a move of one pixel.") },
            ),
          ],
        },
      ]}
    />
  );
}
