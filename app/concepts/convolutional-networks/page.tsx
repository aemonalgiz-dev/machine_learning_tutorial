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

export const metadata: Metadata = pageMetadata("/concepts/convolutional-networks", {
  title: "Convolutional Networks · Perceptron Lab",
  description:
    "Convolutional networks combine local image patterns through successive layers. Training learns which combinations help predict an image's label, with later representations drawing on larger regions of the input.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ConvolutionalNetworksPage() {
  return (
    <ConceptPage
      lessonId="convolutional-networks"
      intuition={lessonIntuitions["convolutional-networks"]}
      technicalStart="Part 2. Training It End to End"
      openingTitle="From Local Patterns to a Name for the Picture"
      playgroundTitle="Follow an image from pixels to class scores"
      playgroundIntro="Follow a picture through its feature maps to its class scores. Compare the trained model with the alternatives before drawing conclusions about any one layer."
      title="Convolutional Networks"
      tagline={"Convolutional networks combine local image patterns through successive layers. Training learns which combinations help predict an image's label, with later representations drawing on larger regions of the input."}
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
                <p>Each picture is sixteen pixels on a side with one brightness channel. It contains a cross, square outline, filled disc or diagonal bar. Position, size, brightness and background vary, with added pixel noise. We want the network to recognize a shape across those variations rather than depend on one fixed bright location.</p>
                <p>
                  The network learns from 240 of them, sixty of each kind, and is scored on another 240 it never sees while training. The box at the top of the page holds the first held-out picture of each kind.
                </p>
                <NumberTable
                  headings={["kind", "how it is drawn"]}
                  rows={[
                    ["cross", "two bars two pixels thick through a common center, six to nine pixels across"],
                    ["square outline", "one pixel thick, six to ten pixels on a side, almost nothing inside"],
                    ["filled disc", "a radius between 2.6 and 4.6 pixels, the most lit pixels of the four"],
                    ["diagonal bar", "seven to eleven steps long, rising or falling, two pixels wide"],
                  ]}
                  caption="The ranges are the ones the pictures are drawn from. A shape is always placed at least one pixel in from the edge."
                />
                <KeepInMind>
                  Training and held-out pictures are separate draws from the same generator. Both contain varied positions and sizes. The held-out results measure recognition on new draws; exact combinations can still overlap by chance, and this does not test every possible position, size or real-world image.</KeepInMind>
              </SubSection>

              <SubSection title="2. What a dense network makes of them">
                <p>One starting point is to arrange the 256 pixels in a row and use dense layers. Each dense weight is attached to a particular position, so moving a cross changes which weights receive its bright pixels. A dense network can learn from translated examples, but this architecture does not automatically reuse the same local detector at every position. Convolution makes that reuse explicit.</p>
                <p>For comparison, we train a dense network with roughly the same parameter count: 256 pixel inputs, hidden widths nine and sixteen, then four output scores, giving 2,541 parameters. It uses the same loop and the same training pictures as the convolutional model. This lets us compare the two architectures on this small controlled dataset, rather than assume that either must perform better.</p>
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
                  This baseline correctly names about two thirds of the held-out pictures. It also has errors on the training pictures, and a one-pixel shift changes its answer on about a third of the images. We now have specific things to investigate: fitting the shapes, predicting new examples, and responding to small movements.
                </p>
                <KeepInMind>

                  The dense baseline does not enforce local pixel neighborhoods or shared detectors. Its measured fit and held-out performance are weaker under this training setup. That does not establish that every dense network must fail with 240 examples.</KeepInMind>
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
                  over the three by three patch centered there, multiplies each
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
                  <p>The weighted products give a sum of 3.6014. Add the filter bias to obtain its score:</p>
<Equation>{`score = 3.6014 + (−0.9630) = 2.6384
ReLU output = max(0, 2.6384) = 2.6384
pooling window = [0.5139, 2.3726, 0, 2.6384]
pooled output = 2.6384`}</Equation>
<p>ReLU keeps the positive score unchanged. Max pooling then retains the largest of the four activated values.</p>
                </WorkedExample>
                <p>
                  The weights are large on the left column and small or
                  negative on the right, and the patch is bright on its left
                  and dim on its right, which is why this is where the filter
                  answers most. One of the cross&rsquo;s bars, two pixels
                  thick, covers the left two columns of the patch.
                </p>
                <KeepInMind>
                  Each first-layer response repeats this weighted sum and activation at another position. Later convolutions use the same principle but also sum over their input channels. Max pooling selects among activated responses, not necessarily the raw weighted sums.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Training It End to End",
          content: (
            <>
              <SubSection title="5. The loop, and the curve it draws">
                <p>Training makes forty passes through the 240 training pictures, using shuffled batches of sixteen and a learning rate of 0.1. Backpropagation calculates each layer’s gradients from the batch loss before the parameters are updated. After every pass, the recorded results include accuracy on both the training and held-out sets.</p>
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
                  Uniform predictions over four classes give a cross-entropy loss equal to the natural logarithm of four. A loss near that value is a useful reference, but does not prove that every prediction is uniform or that the initial weights have an appropriate scale. Inspect the outputs as well as the mean loss.</KeepInMind>
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
                  The spread across these three seeds gives context for architecture comparisons. Small differences may be sensitive to initialization. Three runs are not enough to establish a sharp cutoff below which architecture effects are impossible or above which they are certain.</KeepInMind>
              </SubSection>

              <SubSection title="7. Perfect on the pictures it saw">
                <p>All three runs correctly classify every training picture by the end, but still make held-out errors. After seed 0 first reaches perfect training accuracy, its reported loss falls from 0.0347 at pass 33 to 0.0190 at pass 40. Accuracy can stay fixed while cross-entropy changes, because the loss also depends on the probabilities assigned to labels. That change alone does not tell us whether useful new features are being learned. The <Link href="/concepts/training-a-network" className={link}>training page</Link> explains training and validation curves. If these held-out readings guide checkpoint or architecture selection, a further test set is needed for an independent final estimate.</p>
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
                <p>First-layer filters sometimes resemble edge detectors. The <Link href="/concepts/filters-and-edges" className={link}>filters and edges page</Link> builds such grids by hand. Here the widget compares each trained filter with eight directional Sobel-style templates, then compares those similarities with a random-filter baseline.</p>
                <CnnFilterBoard />
                <p>The comparison subtracts each grid’s mean, flattens its nine entries and measures their cosine similarity. A value of one means the centered grids point in the same direction, while zero means they are orthogonal; zero does not establish statistical independence or the absence of every relationship. At seed 0 the best-template similarities are 0.675, 0.543, 0.814 and 0.794. Taking the best of eight templates can also give sizable similarities for random weights, so we need the baseline below.</p>
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

              <SubSection title="9. A filter that started edge-like" id="9-the-most-edge-like-filter-was-drawn-that-way">
                <p>The board also shows the starting weights. The fourth filter’s best-template similarity was already 0.754 before training and reaches 0.794 afterward. Its weight change has length 0.09 times its starting norm. Much of its edge-like orientation was therefore present initially, although training still changed it.</p>
                <p>The third filter changes more: its weight displacement is 1.86 times its starting norm, and its best-template similarity rises from 0.594 to 0.814. Comparing before and after separates the initial resemblance from the change observed during training, without classifying the resulting filter as wholly inherited or wholly learned.</p>
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
                  Compare trained filters with their starting values before attributing a visual resemblance to learning. The similarity score, weight changes and actual responses provide complementary information.</KeepInMind>
              </SubSection>

              <SubSection title="10. Two filters that barely trained">
                <p>These convolutions use ReLU: positive scores pass through and nonpositive scores become zero. The backward derivative is zero on the nonpositive branch under this SDK’s convention. A filter active at very few positions therefore has few routes for the loss gradient on those inputs. The board measures that activity as well as weight movement.</p>
                <p>After training at seed 0, the second filter is positive at 0.08% of held-out positions and the fourth at 2.3%. Their weight sums are −3.395 and −0.738. On a uniformly positive patch, a negative weight sum pushes the weighted contribution downward, but nonuniform pixels and the bias also matter. These final measurements do not establish that every score was negative from the first training step.</p>
                <InAModel title="Across the three seeds">
                  <p>Using fewer than five percent positive positions as a nearly-silent threshold, seed 0 has two such first-layer filters, seed 1 has none and seed 2 has one. Seed 0 nevertheless has the best held-out accuracy of these three runs, 0.971. Rarely active is not identical to disabled: even an infrequent response can affect later layers.</p>
                </InAModel>
                <KeepInMind>
                  A ReLU filter with nonpositive scores on all its current inputs receives no data-loss gradient through those activations. In plain gradient descent, its own parameters then remain unchanged on that pass. Changing earlier inputs, optimizer state or additional objective terms can alter the situation in other networks. Activity measurements are useful alongside the loss, which does not identify the inactive filter directly.</KeepInMind>
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
              "Uniform probabilities across four classes give cross-entropy about 1.3863. The first-pass mean of 1.3691 is close to that useful reference. A similar mean alone does not prove every prediction is uniform or that initialization has the right scale: confident correct and incorrect predictions can also average to it. Inspect probabilities and later training behavior too.",
            ),
            trueFalse(
              "The seed that finished with the lowest loss on the training half also gave the best held-out score.",
              false,
              "Seed 2 has the lowest final training loss, while seed 0 has the best held-out accuracy in this comparison. Training loss therefore does not rank these runs by held-out accuracy. The variation across seeds also warns against treating a small single-run difference as a reliable architectural advantage. More repeats or an appropriate uncertainty analysis would strengthen that comparison.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "the network | seed 0 | seed 1 | seed 2\nheld-out accuracy after pass 40 | 0.971 | 0.921 | 0.967\nbest held-out accuracy, and the pass | 0.971, 36 | 0.938, 27 | 0.967, 25\ntraining-half accuracy after pass 40 | 1.000 | 1.000 | 1.000\nloss over pass 40 | 0.0190 | 0.0133 | 0.0122"
              },
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
              {"description":"Use these values and conventions.","data":"Trained filters: best centred cosine to eight turned Sobel patterns = [0.675,0.543,0.814,0.794]\nRandom nine-number filters, tested against the same eight patterns: median best cosine = 0.466; 90th percentile = 0.724."},
            ),
            trueFalse(
              "Of the two edge-like filters at seed 0, one was learned and the other was already edge-like when its weights were drawn.",
              true,
              "The fourth filter already resembled an edge kernel at initialization and changed little during training. The third began less similar and changed substantially before reaching its final resemblance. Comparing each filter with its own initial weights helps separate inherited structure from training-induced change. Resemblance alone still does not establish how the filter is used on real inputs.",
              {
                "description": "The table compares each filter with its closest edge template. Relative movement is the size of its weight change divided by its initial weight length. Use these observations to judge the statement.",
                "data": "seed 0 | closest direction | closeness at start | trained | moved\nfilter 1 | brighter below | 0.309 | 0.675 | 1.33\nfilter 2 | brighter to the right | 0.552 | 0.543 | 0.01\nfilter 3 | brighter to the upper left | 0.594 | 0.814 | 1.86\nfilter 4 | brighter to the lower right | 0.754 | 0.794 | 0.09"
              },
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
              "Seed 0 has the highest held-out score despite two filters being nearly silent. Negative weight sums help explain weak responses on broadly bright patches, but the actual response also depends on the patch and bias. Where ReLU receives a negative score its local derivative is zero, so that position supplies no weight correction through this activation.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Seed 0, first layer, ReLU activation:\nfilter 2: positive at 0.08% of held-out positions; weights sum to −3.395\nfilter 4: positive at 2.3% of held-out positions; weights sum to −0.738\n\nReLU derivative is zero for negative scores.\nHeld-out accuracy, seeds 0/1/2: 0.971 / 0.921 / 0.967"
              },
            ),
        ],
        },
        {
          title: "Part 4. What Each Depth Sees",
          content: (
            <>
              <SubSection title="12. The maps at each depth">
                <p>The top activity carries one held-out picture of each kind through the network. The first convolution produces four spatial response maps. The first max-pooling stage halves their sides, retaining the maximum in each two-by-two window. Moving a response can leave a pooled value unchanged when the window’s maximum remains the same, but arbitrary small shifts need not do so.</p>
                <p>
                  The second convolution reads all four pooled maps at once through its own three by three windows, 36 weights and a bias per filter, and gives eight maps, and the second pooling halves those to four by four.
                </p>
                <p>On the cross, the first maps respond along parts of the bars, while the two nearly silent filters are dark at most positions. After the second pooling, each of eight channels has a four-by-four map. Neighboring output positions are spaced four input pixels apart, but each can depend on a ten-by-ten input region. That sampling spacing is not a guarantee of locating a pattern to within four pixels.</p>
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
                <p>{"Three of these four examples receive strongly concentrated predicted probabilities. The disc is also classified correctly, but its margin is only 0.048 and almost half the probability is assigned to a cross. The displayed maps let us compare the local responses to a small filled disc and the middle of a thick cross. A filter three pixels wide sees only those local patches, rather than the whole shape at once."}</p>
                <KeepInMind>
                  The final decision uses a sixteen-value learned representation. Training encourages it to distinguish the four labels, but does not require it to discard every trace of position. Later shift measurements show that location can still affect the prediction.</KeepInMind>
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
                    { expression: "a pixel          1    1", reason: "one pixel sees itself, and neighboring pixels are one apart." },
                    { expression: "convolution      3    1", reason: "a window of 3 over inputs one apart adds 2. The stride is 1, so the spacing stays." },
                    { expression: "pooling          4    2", reason: "a window of 2 over inputs one apart adds 1, and the stride of 2 doubles the spacing." },
                    { expression: "convolution      8    2", reason: "a window of 3 over inputs two apart adds 4." },
                    { expression: "pooling         10    4", reason: "a window of 2 over inputs two apart adds 2, and the spacing doubles again." },
                    { expression: "dense           16    ·", reason: "a dense unit reads every number of the flattened row, so it sees the whole picture." },
                  ]}
                />
                <KeepInMind>
                  The final pooled units have nominal ten-by-ten receptive fields. Such a region can cover many generated shapes when suitably aligned; smaller shapes may already fit earlier fields, and some larger or differently aligned shapes extend beyond one unit’s region. The dense layer can combine responses from the whole map.</KeepInMind>
              </SubSection>

              <SubSection title="15. Checked by brightening every pixel">
                <p>The geometry gives the region that can affect a unit. The widget checks finite sensitivity by adding 0.5 to each input pixel separately and recording whether the selected response changes. It shows one unit at each depth near the image center. Clicking another unit in the top activity runs the same comparison there.</p>
                <CnnFieldGrowth />
                <p>No perturbed pixel outside the geometric field changes the selected response in these measurements. Inside the fields, the changed counts are 9 of 9, 14 of 16, 63 of 64 and 92 of 100. ReLU and max-pooling choices can block contributions on a given input, while cancellations or a perturbation too small to change the selected path can also leave a value unchanged. Because the perturbation is finite, it can sometimes change which ReLU branch or pooling winner is used.</p>
                <p>For the selected corner unit in the last maps, the nominal field extends outside the picture. Forty-nine of its hundred positions are real pixels and the rest are padding zeros. Perturbing forty-five of those forty-nine pixels changes its measured response in this example.</p>
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
                  Here the small-window stack reaches a ten-pixel field with fewer convolution parameters than the illustrated large-kernel alternative. Pooling increases the spacing between later inputs, so later windows span more original pixels. The tradeoffs include lower spatial resolution and additional nonlinear operations.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Taking Pooling Away",
          content: (
            <>
              <SubSection title="17. What removing pooling changes besides pooling">
                <p>Removing the two pooling stages without adding another spatial reduction leaves eight sixteen-by-sixteen final maps. Flattening then produces 2,048 values rather than 128, so the dense layer needs a different input width. We could introduce another reduction, such as strided convolution, but that would be a different comparison. The variant here simply removes pooling and adjusts the dense input size.</p>
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
                <p>The no-pooling held-out scores are 0.875, 0.821 and 0.817, compared with 0.971, 0.921 and 0.967 for the reference. The matched-seed gaps range from 0.096 to 0.150 and exceed each variant’s observed three-seed range. This is consistent evidence for a difference under this setup, not a significance test or proof of a single cause. Both variants fit the training labels completely, while their generalization differs.</p>
                <KeepInMind>
                  Pooling helped in this experiment. It also reduced the size of the dense layer, leaving fewer parameters for the 240 training images to constrain. These measurements do not separate that benefit from pooling&apos;s other effects.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The textbook claim, measured on moved pictures">
                <p>Pooling may reduce sensitivity to position changes, but it does not enforce general shift invariance. The widget tests this by moving held-out pictures one, two and three pixels in each cardinal direction. It keeps only moves that leave the shape inside the frame, fills the exposed strip using the image edge and records how often the predicted class changes.</p>
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
                  In these runs, one-pixel shifts change between 5.5 and 11.5 percent of the reference network’s predictions. That is less than for the no-pooling variant, but still demonstrates shift sensitivity. These controlled comparisons change several downstream properties, including the dense layer’s width.</KeepInMind>
              </SubSection>

              <SubSection title="20. Why a two by two maximum cannot promise it">
                <p>A window maximum is unchanged only when the changed window still has the same maximum value. Staying within one window is not sufficient if other values or filter responses also change. With fixed two-pixel windows, half of the input positions lie immediately beside a sampling boundary. Two pooling stages give a final grid spaced four original pixels apart. The dense layer assigns separate weights to those positions, so shifted features can change the predicted class.</p>
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
                  This network reduces some shift sensitivity without eliminating it. Pooling boundaries, padding and the position-dependent dense readout all matter. Azulay and Weiss also investigate translation sensitivity in larger image classifiers.</KeepInMind>
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
              "Which statement agrees with the matched-seed pooling comparison?",
              [
                              "Held-out scores of 0.875, 0.821 and 0.817 against 0.971, 0.921 and 0.967",
                              "A network that can no longer fit even its training half",
                              "Scores inside the spread between seeds, so no difference in the arrangement",
                              "A smaller network, since the poolings were holding weights",
                            ],
              0,
              "The matched-seed results favor the pooled arrangement in this experiment. Removing pooling also increases parameter count and counted multiplications, because the dense layer receives a larger flattened representation. This comparison therefore changes several properties at once. It measures the complete arrangements; it does not isolate one universal effect of pooling.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "                         seed 0   seed 1   seed 2\nheld-out, with pooling    0.971    0.921    0.967\nheld-out, without pooling 0.875    0.821    0.817\n\nBoth arrangements reach training accuracy 1.000.\nParameters: with pooling 2,468; without pooling 33,188.\nMultiply counts: with pooling 29,760; without pooling 115,776."
              },
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
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Seed 0, fraction of classifications changed by a shift:\n1 pixel: 6.7%\n2 pixels: 8.1%\n3 pixels: 12.0%\n\nTwo successive pooling layers each have window 2 and stride 2."
              },
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
                <p>The reference CNN and dense baseline have similar parameter counts, but the CNN performs 11.8 times as many counted weighted multiplications per image. Its first and second convolutions account for 9,216 and 18,432, followed by 2,048 in the hidden dense layer and the output layer’s work. More arithmetic alone does not explain higher accuracy; the architecture and learned transformations differ. The training chart reports elapsed time separately because runtime also depends on the machine and implementation.</p>
                <KeepInMind>
                  Convolution reuses each weight at many positions, so parameter count and operation count differ. The two convolution layers have 336 parameters including biases. With their kernel and channel counts fixed, a larger image increases their spatial work while those parameter counts stay fixed. The final dense layer would need separate consideration if its flattened input changed.</KeepInMind>
              </SubSection>

              <SubSection title="23. What the second round contributes">
                <p>The one-round variant retains four eight-by-eight maps, giving the dense layer 256 inputs. That hidden dense layer has 4,112 parameters including biases. The whole variant therefore has 4,220 parameters, compared with 2,468 in the two-round reference. Removing a convolution-pooling round has made the later dense layer larger.</p>
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
                  The second convolution-pooling round uses fewer parameters than the dense connections it replaces and performs better in these runs. It also enlarges receptive fields and adds learned feature combinations. The experiment changes these properties together, so it does not isolate one explanation for the accuracy difference.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. When a New Image Does Not Fit the Network" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="24. A picture of another size">
                <p>The same convolution and pooling rules can be configured for different input sizes, provided the windows fit. This SDK records exact input extents on each constructed layer and checks them at runtime. Changing those extents also changes the flattened width. A dense layer requires that width to match its fixed input-weight count.</p>
                <NumberTable
                  headings={["side", "after two poolings", "flattened width", "the dense layer reads 128"]}
                  rows={[
                    ["12", "3 × 3", "72", "undefined"],
                    ["15", "3 × 3", "72", "undefined"],
                    ["16", "4 × 4", "128", "defined"],
                    ["17", "4 × 4", "128", "same dense width if spatial layers are rebuilt for side 17"],
                    ["20", "5 × 5", "200", "undefined"],
                    ["32", "8 × 8", "512", "undefined"],
                  ]}
                  caption="Eight maps at the end, so the flattened width is 8 times the square of what two halvings leave."
                />
                <p>If we rebuild the spatial layers for side seventeen, the pooling floor still leaves four-by-four final maps, so the dense input width remains 128. The first pooling omits a row and column of convolution responses; it does not imply that the corresponding original pixels had no effect on retained neighboring responses. The current SDK network is configured for side sixteen and rejects a differently sized input. Global pooling is one way to give a classifier a fixed-width input across different spatial sizes, but it is not used here.</p>
                <KeepInMind>
                  Distinguish a rule that can be rebuilt for a new geometry from a layer instance configured for one geometry. This network checks its sixteen-by-sixteen input. A differently configured spatial front end must still produce a width accepted by the dense layers.</KeepInMind>
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
                <p>For sixty ring images, the network predicts square outline forty-eight times, cross nine times and filled disc three times. These labels are the available choices, even though ring was absent from training. The mean probability assigned to the selected class is 0.861 on rings and 0.948 on the known-class held-out set. Sixty-three percent of rings receive a selected-class probability above 0.9. High softmax scores therefore do not establish that an image belongs to the training label set.</p>
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
                  expressionHeading="Image or window shape"
                  reasonHeading="Effect on the network output"
                  rows={[
                    { expression: "a window wider than what it reads, padding included", reason: "the output extent is the input extent minus the window, plus twice the padding, divided by the stride, plus one, and when that comes out below one there is no position to place the window. The arrangement is undefined before any picture arrives, which is why it can be checked when the network is built." },
                    { expression: "an odd side under a two by two pooling", reason: "at stride two, only complete windows are used, leaving one row and column of that layer’s input outside its windows. Padding or a different spatial reduction can change that behavior." },
                    { expression: "a picture differing from the configured input shape", reason: "this SDK rejects the configured input-shape mismatch. If the spatial layers are rebuilt, check the resulting flattened width separately; some different image sizes produce the same width." },
                    { expression: "every filter started with the same weights", reason: "identical filters produce identical initial maps, but downstream weights can give them different gradients and separate them. Persistent symmetry requires the rest of the connections and updates to preserve that symmetry too. Random initialization is a common way to avoid such symmetry." },
                    { expression: "a filter whose activation function answers zero everywhere", reason: "for ReLU on nonpositive scores, this SDK passes zero data-loss derivative through that activation. A completely inactive first-layer filter therefore gets no such gradient on those inputs; low activity is not the same as permanent inactivity." },
                    { expression: "a unit whose window runs past the picture", reason: "the padding supplies zeros that are not pixels, so the unit is comparing a shape with a black border that was never photographed. The corner unit of the last maps has 49 of its 100 pixels inside the picture." },
                    { expression: "a shape moved partly out of the frame", reason: "cropping removes observed parts of the shape. Whether the classifier should retain its label depends on the task and remaining evidence. The shift test excludes those moves to isolate position changes that retain the whole shape." },
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
              "A dense weight participates once per example, while each convolution weight is reused across spatial positions. The two convolution layers therefore account for most of this network’s counted multiplications despite storing fewer parameters than its dense layer. Larger images increase that arithmetic without increasing kernel storage. This operation count alone does not explain the measured accuracy.",
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
              "One convolution-and-pooling round leaves four eight-by-eight maps. Its dense hidden layer then contains 4,112 weights and biases, and the whole network has 4,220 parameters. The two-round version has fewer parameters and a wider theoretical receptive field at its final maps. It also performs better in the reported runs, which is evidence about these full configurations.",
            ),
            trueFalse(
              "A convolution and a pooling are defined window by window, so the network can read a picture of any size.",
              false,
              "Local convolution kernels can be reused over different image sizes, but this SDK’s layer still declares a specific input shape. A following dense layer also expects a fixed flattened width. Rebuilding the spatial front for a different size may or may not preserve that width: the seventeen-pixel example does because pooling discards incomplete edge windows. Global pooling is one way to give a dense head a size-independent feature count.",
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
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "The output is a softmax over four known kinds, with no “unknown” class.\nMean top-class probability:\nknown kinds: 0.948\n60 unseen rings: 0.861\n63% of rings receive a top-class probability above 0.9.\nA flat picture of brightness 0.15 is called a bar at probability 0.892."
              },
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
              [
  "Inspect the supplied seven-layer network on one sixteen-by-sixteen single-channel picture. For each layer print output shape, learned parameters and weight multiplications per picture.",
  "Count one multiplication per weight at each position using it; exclude additions and activation/pooling work. Finish with totals and the shares belonging to the two convolutions."
],
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
              { hints: [
  "A dense weight is used once per observation; a kernel weight is reused at every output position.",
  "Keep this narrow operation count distinct from runtime or complete hardware cost."
], check: numberCheck("What share of the network’s multiplications do the two convolutions do, to three places?", 0.929, 0.0005, "The convolution share is 0.929 of the counted multiplications. Small parameter storage can still mean much arithmetic when each weight is reused over many positions."), question: "Does the layer storing most parameters also do most multiplications?" },
            ),
            exercise(
              "Work out how far one unit sees, and add a third round",
              [
  "Extend the supplied two convolution/pooling rounds with a sixteen-filter convolution and another pooling layer. Read window sizes and strides from each layer.",
  "For every layer print output shape, theoretical receptive-field width and spacing between neighboring responses in original-pixel units. Begin with width and spacing one; preserve the starter’s padding settings."
],
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
              { hints: [
  "Before updating spacing, enlarge the field using the incoming spacing and the additional window positions.",
  "Then multiply spacing by stride. The theoretical field can extend into padding beyond the actual image."
], check: numberCheck("How many pixels across does one unit see after the third pooling?", 22, 0.5, "The theoretical field is twenty-two pixels wide. It extends beyond the sixteen-pixel image, so some locations in that field refer to padding rather than measured pixels."), question: "How much of the original image can one deeper response depend on?" },
            ),
            exercise(
              "Offer the dense layer a picture of another size",
              [
  "For every supplied picture side, construct the same two convolution/pooling rounds and Flatten, then attempt to attach the dense layer expecting 128 features.",
  "Print the second pooling’s output shape, flattened width and either successful join or the library refusal. Keep convolution and pooling settings fixed across sides."
],
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
              { hints: [
  "Recompute each output arrangement from its immediate predecessor.",
  "A convolutional spatial stack can change its output width with image size, while the existing dense weight matrix cannot."
], check: numberCheck("How long is the flattened row for a picture 24 pixels on a side?", 288, 0.5, "The flattened width is 288. That arrangement cannot feed the already fixed dense layer expecting 128 inputs without changing its contract."), question: "Which picture sizes still fit the network’s fixed dense input?" },
            ),
            exercise(
              "Train a small one end to end, then move its pictures",
              [
  "The starter supplies two hundred noisy twelve-pixel pictures, split into one hundred training and one hundred held-out images. Complete thirty shuffled-batch training passes using the supplied rate and batch size.",
  "Print first/last training loss and the two-class uniform reference loss. Report held-out accuracy, then move each held-out image one pixel right using the specified edge fill. Count changed calls overall, at the right-edge subgroup and elsewhere."
],
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
              { hints: [
  "Use held-out labels only for evaluation. Retain the generator’s edge-subgroup indicator for the final split.",
  "A translation can move a shape beyond positions seen during training. Compare subgroup errors rather than only overall accuracy."
], check: numberCheck("How many of the hundred held-out calls change when every picture moves one pixel right?", 20, 1.5, "Twenty held-out calls change after shifting. The right-edge subgroup exposes sensitivity that the original perfect held-out accuracy did not show."), question: "Can high held-out accuracy hide sensitivity to where a shape sits?" },
            ),
          ],
        },
      ]}
    />
  );
}
