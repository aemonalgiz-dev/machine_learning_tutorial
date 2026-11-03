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
import { UNetArchitecture } from "@/components/widgets/UNetArchitecture";
import { UNetBaselineBoard } from "@/components/widgets/UNetBaselineBoard";
import { UNetExplorer } from "@/components/widgets/UNetExplorer";
import { UNetLargerPicture } from "@/components/widgets/UNetLargerPicture";
import { UNetTrainingCurves } from "@/components/widgets/UNetTrainingCurves";

export const metadata: Metadata = {
  title: "U-Net · Perceptron Lab",
  description:
    "U-Net learns from images paired with labeled masks to predict a label for each pixel. Connections from earlier layers preserve spatial detail as the network reconstructs a higher-resolution output.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function UNetPage() {
  return (
    <ConceptPage
      lessonId="u-net"
      intuition={lessonIntuitions["u-net"]}
      technicalStart="Part 2. The Shape of the U"
      openingTitle="Knowing What Is There Does Not Tell Us Where"
      playgroundTitle="Follow image details down and back up the network"
      playgroundIntro="Compare the predicted mask with the target pixel by pixel. Pay particular attention to boundaries and thin shapes when the skip connections are removed."
      title="U-Net"
      tagline={"U-Net learns from images paired with labeled masks to predict a label for each pixel. Connections from earlier layers preserve spatial detail as the network reconstructs a higher-resolution output."}
      prerequisites={
        <>
          The way down is the network on the{" "}
          <Link href="/concepts/convolutional-networks" className={link}>
            convolutional networks
          </Link>{" "}
          page, two rounds of{" "}
          <Link href="/concepts/convolution" className={link}>
            convolution
          </Link>{" "}
          and{" "}
          <Link href="/concepts/pooling" className={link}>
            pooling
          </Link>{" "}
          on the same sixteen by sixteen pictures. Those lessons explain the
          individual operations. The loop that trains them together is on{" "}
          <Link href="/concepts/training-a-network" className={link}>
            training a network
          </Link>
          . Part 3 follows how the loss depends on each layer and how those
          derivatives pass back through the network.
        </>
      }

      playground={<UNetExplorer />}
      sections={[
        {
          title: "Part 1. An Answer for Every Pixel",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The same pictures, a different question">
                <>
<p>
                  Every picture here is one of the sixteen by sixteen pictures from the convolutional networks page, a cross, a square outline, a filled disc or a diagonal bar drawn at a random place and size, brightness and background, with a little noise on every pixel. That page asked which of the four kinds each picture held.
                </p>
                <p>

                  Now we want a decision for each of the image&apos;s 256 pixels: does it belong to the shape? We train with labeled data, pairing every image with its correct segmentation mask. In this drawn dataset we know the mask because we placed the shape ourselves. The display shows held-out images with their masks, so we can compare a predicted region with the labeled target.
                </p>
</>
                <NumberTable
                  headings={["the held-out half", "count"]}
                  rows={[
                    ["pictures", "240"],
                    ["pixels, 256 to a picture", "61,440"],
                    ["share of pixels that are shape", "0.111"],
                    ["pixels right if every pixel is called ground", "0.889"],
                  ]}
                />
                <p>Only about one pixel in nine belongs to a shape. Predicting background everywhere therefore gives pixel accuracy 0.889 while finding none of the shapes. That baseline shows why overall pixel accuracy is insufficient here. We will keep it beside a measure of overlap with the shape region, defined in section 3.</p>
                <KeepInMind>
                  {"A per-pixel prediction must distinguish the shape from the background. Because most pixels here are background, overall accuracy can look high even when the predicted shape is poor."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a classifier keeps and what it throws away">
                <p>
                  {"The existing classifier gets 0.971 of the held-out image categories right. Its convolutions and pooling keep spatially arranged feature maps. Flattening then places the last maps in a row of 128 numbers, and dense layers combine them into sixteen features and four class scores. Flattening is reversible if we retain the shape; it is the final category output that no longer supplies a location for every pixel."}
                </p>
                <NumberTable
                  headings={["layer of the classifier", "answers", "still arranged as a picture"]}
                  rows={[
                    ["convolution", "4 × 16 × 16", "yes"],
                    ["max pooling", "4 × 8 × 8", "yes"],
                    ["convolution", "8 × 8 × 8", "yes"],
                    ["max pooling", "8 × 4 × 4", "yes"],
                    ["flattening", "128", "no"],
                    ["dense", "16", "no"],
                    ["dense", "4", "no"],
                  ]}
                />
                <p>
                  {"One baseline starts from the predicted image category. Average the training masks for that category, then predict shape wherever the average exceeds one half. Repeat using the true category to check whether classification mistakes explain the result. This uses category-level information without giving the baseline the particular image's shape location."}
                </p>
                <NumberTable
                  headings={["answering from the kind alone", "pixels right", "overlap with the true shape"]}
                  rows={[
                    ["the kind the classifier calls", "0.898", "0.081"],
                    ["the picture’s true kind", "0.898", "0.080"],
                  ]}
                  caption="Overlap is defined in section 3; one is a perfect mask and zero is a mask that shares no pixel with the truth."
                />
                <p>
                  {"Even the true category gives overlap only 0.080 with this baseline. Crosses appear at different locations, so their average mask does not identify the cross in a particular image. A category label and a segmentation mask answer different questions."}
                </p>
                <KeepInMind>
                  {"The classifier is trained to name the shape regardless of its position. That label alone is insufficient for segmentation. Its earlier feature maps may still contain location information, which gives us something useful to reuse."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Scoring a mask, and the pixels at its edge">
                <p>
                  {"We can evaluate foreground overlap instead of counting every correct background pixel. Count the pixels marked as shape in both the prediction and the target, then divide by the pixels marked as shape in either one. This is intersection over union, or IoU. On the nonempty target masks here, predicting no shape scores zero, predicting shape everywhere scores the shape's fraction of the image, and an exact prediction scores one. This page averages IoU over images, so a thin outline counts as much as a large disc."}
                </p>
                <Equation>{"overlap  =  pixels called shape and truly shape  ÷  pixels called shape or truly shape"}</Equation>
                <WorkedExample title="The held-out cross, answered by the U without its skip connections">
                  <>
                    <p>
                      The cross contains twenty-eight shape pixels. The network without
                      skip connections predicts twenty-three shape pixels, nineteen of
                      them correctly. Intersection over union compares those nineteen
                      shared pixels with every pixel in either set.
                    </p>
                    <Equation>{"union = actual shape + predicted shape − intersection\n      = 28 + 23 − 19 = 32\nIoU = 19 / 32 ≈ 0.594\n\ncorrect pixels = 256 − 9 missed shape − 4 false shape = 243\npixel accuracy = 243 / 256 ≈ 0.949"}</Equation>
                    <p>
                      The high pixel accuracy includes the many background pixels. IoU
                      makes the missed and extra shape pixels more visible.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  {"We also measure accuracy near the boundary. A pixel counts as a boundary pixel when its neighbor above, below, left or right has the other label. This includes pixels on both sides of the shape outline. The image frame itself does not count as a label change."}
                </p>
                <p>
                  {"Of the 61,440 held-out pixels, 12,433 meet that definition and 49,007 do not. On the cross above, 52 are boundary pixels and the network predicts 39 of them correctly. Scoring this group separately lets us test whether skip connections help preserve the outline."}
                </p>
                <KeepInMind>
                  The share of pixels right is always reported beside the
                  overlap and never alone, and the pixels at the edge are
                  scored apart from the rest because that is where the skip
                  connections are claimed to help.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Shape of the U",
          content: (
            <>
              <SubSection title="4. The way down is the classifier’s first half">
                <p>
                  The left side of the U is the start of the classifier, kept as
                  it was. A convolution with four filters reads the picture and
                  answers four maps the size of the picture, a pooling halves
                  them, a convolution with eight filters reads those and a second
                  pooling halves again, leaving eight maps of four by four. The
                  two convolutions hold 40 and 296 parameters, the same 336 as
                  on the convolutional networks page, since the count depends on
                  the filters and not on what comes after them.
                </p>
                <Equation>{"parameters  =  filters × (channels read × 3 × 3 + 1)"}</Equation>
                <p>
                  {"The U-Net also sends each encoder convolution's output to a later decoder stage. It keeps the four full-size maps and the eight half-size maps for these connections. The classifier instead uses those maps along a single forward path; it does not supply them to a segmentation decoder."}
                </p>
                <KeepInMind>
                  {"In this teaching network, the encoder uses the classifier's convolution-and-pooling arrangement. The skip connections make its intermediate maps available to the decoder as well as to the next pooling layer."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The middle, where the picture is smallest">
                <>
<p>
                  {"At the bottom, another convolution uses eight three-by-three filters on the eight four-by-four maps. The resulting map has sixteen spatial positions, spaced four input pixels apart. The receptive-field calculation gives a potential input patch eighteen pixels wide. Near the frame, some of that patch is padding rather than observed image pixels."}
                </p>
                <p>
                  {"These coarse maps can combine information from a broad part of the image. Their spatial grid is less detailed than the input grid, but the channels can still encode location information within that grid. Coarse spacing is not a proof that every finer distinction has disappeared."}
                </p>
</>
                <KeepInMind>
                  {"Pooling increases the spacing between map positions. Skip connections let the decoder combine those broad features with encoder features kept at finer spatial resolutions, reducing what it must reconstruct from the coarse maps alone."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The way back up, by repeating each value">
                <p>
                  {"One simple way to grow the maps back to sixteen by sixteen is to repeat each value over a two-by-two block. Both sides double without adding learned parameters. During backpropagation, every copied output contributes a derivative to the original value, so the original receives the sum of those contributions."}
                </p>
                <Equation>{"up[2i + a, 2j + b]  =  x[i, j]      for a and b each 0 or 1"}</Equation>
                <Equation>{"slope at x[i, j]  =  sum over a, b of  slope at up[2i + a, 2j + b]"}</Equation>
                <WorkedExample title="A two by two map grown to four by four">
                  <p>{"The original map has p and q on its top row, with r and s below. Upsampling repeats each value into a block of four entries. If the four derivatives arriving at p's block are 0.1, 0.2, 0.3 and 0.4, the derivative for p is their combined 1.0. Each copied output depends on the same original value, so all four routes contribute to its update."}</p>
                </WorkedExample>
                <p>
                  {"The original paper used learned two-by-two up-convolutions in its expanding path. This example uses repetition to make the resizing and its derivative easy to inspect. Repetition alone adds no new detail, but the decoder convolutions that follow can transform its output. Skip connections supply additional features from the encoder."}
                </p>
                <KeepInMind>
                  Repeating a value cannot put back detail that pooling threw
                  away. A four by four map grown to sixteen by sixteen is still
                  sixteen blocks of four by four pixels each.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The skip connections, laid alongside">
                <>
<p>
                  At each depth on the way up, the decoder takes the maps that came up from below and the maps the encoder kept at the same size, and lays them side by side as one block with more channels. At half size eight repeated maps and the encoder&rsquo;s eight make a block of sixteen, and at full size eight and four make twelve.
                </p>
                <p>
                  The convolution that follows reads every channel through its three by three windows, so at every position it sees both what the middle concluded and what the encoder saw there at full resolution, and its weights decide how to combine them.
                </p>
</>
                <UNetArchitecture />
                <p>
                  The layers on this page are a chain, each reading only what the
                  one before it answered, so the two joins are made outside the
                  layers, by laying one block beside another between two of
                  them, and the backward pass is walked by hand around them.
                </p>
                <NumberTable
                  headings={["layer", "with the skips", "without them"]}
                  rows={[
                    ["way down, two convolutions", "336", "336"],
                    ["the middle", "584", "584"],
                    ["half-size decoder convolution", "8 × (16 × 9 + 1) = 1,160", "8 × (8 × 9 + 1) = 584"],
                    ["full-size decoder convolution", "4 × (12 × 9 + 1) = 436", "4 × (8 × 9 + 1) = 292"],
                    ["one score per pixel", "5", "5"],
                    ["all parameters", "2,521", "1,801"],
                  ]}
                />
                <p>
                  {"With these fixed channel counts, adding the joins adds 720 decoder parameters. The network with skips has 2,521 parameters, close to the classifier's 2,468; the network without skips has 1,801. The comparison in Part 4 therefore changes both access to encoder features and decoder parameter count. A different experiment could adjust widths to compare equal-sized models."}
                </p>
                <KeepInMind>
                  {"Concatenation itself has no learned weights. In this design it increases the channels read by the decoder convolutions, which adds weights and computation. Keeping the encoder maps available also uses memory."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. How far an answer pixel can see, by each route">
                <p>
                  An answer pixel now has three routes back to the picture, and
                  they see very different amounts of it. Through the middle it
                  reaches the widest patch, at the coarsest spacing. Across the
                  full-size skip it reaches only a few pixels around itself, at
                  the finest. The half-size skip is in between. The rule for each
                  step is the one from the convolutional networks page, where a
                  window adds its width less one, times the spacing of what it
                  reads, and a repetition halves the spacing without widening
                  anything.
                </p>
                <DerivationTable
                  expressionHeading="route, and field after each step"
                  reasonHeading="what the step did"
                  rows={[
                    { expression: "through the middle   3, 4, 8, 10", reason: "the way down, as in the classifier. Spacing 1, 2, 2, then 4 after the second pooling." },
                    { expression: "                     18", reason: "the middle’s three by three window over numbers four pixels apart adds 8." },
                    { expression: "                     22, then 24", reason: "each decoder convolution, after a repetition, adds its window over numbers two and then one pixel apart." },
                    { expression: "across at half size  8, then 12, 14", reason: "the encoder’s second convolution sees 8; the two decoder convolutions add 4 and 2." },
                    { expression: "across at full size  3, then 5", reason: "the encoder’s first convolution sees 3, and the full-size decoder convolution adds 2. The last layer is one by one and adds nothing." },
                  ]}
                />
                <KeepInMind>
                  Through the middle an answer pixel can depend on a patch
                  wider than the picture, and across the full-size skip on a
                  patch of five by five, so the decoder&rsquo;s last convolution
                  is reading a wide coarse view and a narrow sharp one at the
                  same position.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. One score per pixel, and what it costs to be wrong">
                <p>
                  {"A final one-by-one convolution uses the four decoder features at each pixel to produce one score. A sigmoid converts that score to a probability of shape, and the prediction is shape when that probability exceeds one half. The loss below adds binary cross-entropy over every pixel and divides by the number of pictures. That denominator matters when we choose the learning rate."}
                </p>
                <Equation>{"p  =  1 ÷ (1 + e^(−score))"}</Equation>
                <Equation>{"loss  =  − (1 ÷ pictures) × sum over every pixel of  [ y log p + (1 − y) log (1 − p) ]"}</Equation>
                <WorkedExample title="Row 5, column 10 of the held-out cross, an edge pixel of the shape">
                  <NumberTable
                    headings={["seed 0", "score", "probability of shape", "that pixel’s loss"]}
                    rows={[
                      ["with the skip connections", "7.0074", "0.99910", "0.00090"],
                      ["without them", "0.0832", "0.5208", "0.6524"],
                    ]}
                  />
                  <>
                    <p>
                      This pixel belongs to the shape. Cross-entropy therefore uses the
                      negative logarithm of the probability assigned to shape.
                    </p>
                    <Equation>{"pixel loss = −ln(0.5208) ≈ 0.6524"}</Equation>
                    <p>
                      The network without skips predicts shape with only slightly more
                      than fifty percent probability. The network with skips is much
                      more confident on this pixel.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  {"This loss sums 256 pixel terms per picture, so shared weights receive contributions from many positions. Its scale differs from a loss averaged over all pixels. The reported runs use step size 0.003, compared with the classifier's 0.1, for 20 passes over the same 240 training pictures in shuffled batches of 16. Those are settings for this objective and experiment, not a universal required ratio."}
                </p>
                <KeepInMind>
                  {"Check whether a segmentation loss is summed or averaged over pixels before reusing a classifier's learning rate. Changing that convention changes gradient magnitudes even when the prediction task stays the same."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A network that never calls any pixel shape still gets 0.889 of pixels right.",
              true,
              "Only about one pixel in nine of these pictures belongs to a shape, so answering ground everywhere is right almost nine times in ten. That is why the share of pixels right is never reported on its own here, and always has a score beside it that answering nothing cannot win.",
            ),
            choice(
              "What does the overlap score give a network that calls every pixel shape?",
              [
                "Zero",
                "The shape’s share of the picture",
                "One half",
                "One",
              ],
              1,
              "The overlap divides the pixels in both sets by the pixels in either, so calling everything shape leaves the numerator at the shape’s own size and the denominator at the whole picture. Calling nothing scores zero, and only an exact mask scores one.",
            ),
            choice(
              "The classifier gets 0.971 of held-out kinds right. Turning each picture’s true kind into a mask, by averaging the training masks of that kind, is worth what overlap?",
              ["0.080", "0.556", "0.889", "0.971"],
              0,
              "A class label says which shape is present without locating its pixels. Averaging same-class training masks spreads different positions into a blur, so even knowing the correct class does not recover this image’s mask. That demonstrates the limits of the label-based reconstruction, not proof that every hidden feature in the classifier discarded position.",
            ),
            several(
              "Which of these hold for the two skip connections in this U?",
              [
                              "They add no layer, and only widen what one decoder convolution reads",
                              "They cost 720 parameters, all of them in the two decoder convolutions",
                              "They have weights of their own, trained alongside the convolutions",
                              "They leave the two arrangements compared in Part 4 the same size",
                            ],
              [0, 1],
              "Concatenation retains both channel blocks without adding trainable weights of its own. The following convolution has more input channels and therefore stores more weights. In the displayed layouts, that increases the total from 1,801 to 2,521 parameters. The join can also require memory and data movement; zero trainable parameters does not mean zero runtime cost.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "layer | with the skips | without them\nway down, two convolutions | 336 | 336\nthe middle | 584 | 584\nhalf-size decoder convolution | 8 × (16 × 9 + 1) = 1,160 | 8 × (8 × 9 + 1) = 584\nfull-size decoder convolution | 4 × (12 × 9 + 1) = 436 | 4 × (8 × 9 + 1) = 292\none score per pixel | 5 | 5\nall parameters | 2,521 | 1,801\n\nEach skip concatenates an encoder feature block with a decoder block.\nIt has no weights of its own, but increases the input channel count of the following convolution."
              },
            ),
            choice(
              "Growing a map by repetition copies each value over a two by two block. Blames of 0.1, 0.2, 0.3 and 0.4 arrive at the four copies of one value. What is owed to the value itself?",
              ["0.1", "0.25", "0.4", "1.0"],
              3,
              "Moving the value a little moves all four copies by that amount together, so its slope is the total of the four slopes that arrive, 1.0 here. The same reason makes the blame at an encoder answer a sum rather than a choice, since that answer too is read more than once.",
            ),
        ],
        },
        {
          title: "Part 3. Carrying the Blame Back Through a Join",
          content: (
            <>
              <SubSection title="10. The forward walk">
                <p>{"The forward pass saves each encoder convolution's output. Before a decoder convolution, it joins the upsampled maps with the saved encoder maps, placing the repeated maps first. That channel order also determines how the backward pass separates the derivatives for the two routes."}</p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="what is read, and what is kept"
                  rows={[
                    { expression: "e1 = convolve(picture)", reason: "4 × 16 × 16, kept for the full-size join." },
                    { expression: "e2 = convolve(pool(e1))", reason: "8 × 8 × 8, kept for the half-size join." },
                    { expression: "m = convolve(pool(e2))", reason: "8 × 4 × 4, the middle." },
                    { expression: "d2 = convolve([repeat(m), e2])", reason: "reads 16 × 8 × 8, the first 8 channels from below and the last 8 across." },
                    { expression: "d1 = convolve([repeat(d2), e1])", reason: "reads 12 × 16 × 16, 8 channels from below and 4 across." },
                    { expression: "score = one by one(d1)", reason: "1 × 16 × 16, flattened to 256 scores for the loss." },
                  ]}
                />
                <KeepInMind>

                  Each encoder answer is read twice in the forward pass, once by
                  the pooling above it and once by the decoder across the U,
                  and that is the fact the backward pass has to honor.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The backward walk, split and then added">
                <p>{"A decoder convolution returns input derivatives for the complete joined block. Splitting them in the original channel order recovers the contribution for the upsampled maps and the contribution for the saved encoder maps. The first continues through the lower route. The second is retained until the backward pass reaches its encoder convolution, where it is added to the contribution arriving through the pooled route."}</p>
                <Equation>{"blame at e2  =  blame down through the pooling  +  blame across the skip"}</Equation>
                <WhyThisWorks title="Why the two parts are added">
                  <p>{"The encoder output e2 affects the loss through two routes: the pooled path through the middle, and the skip connection into the decoder convolution. Its gradient adds the contributions from both routes because both depend on the same stored value. The repeated values in section 6 follow the same rule: derivatives arriving at the four copies must be added for the original value."}</p>
                </WhyThisWorks>
                <KeepInMind>
                  Nothing in the join has weights, so the join&rsquo;s whole
                  backward pass is a split on the way into the decoder and an
                  addition on the way into the encoder.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Checked against a finite difference">
                <p>
                  {"A central finite difference estimates a derivative independently of the backward implementation. Increase one weight by a millionth and measure the loss, then decrease it by the same amount and measure again. Divide the loss difference by two millionths. The recorded check applies this to twelve weights of every convolution in the untrained U with skips at seed 0, using the first held-out image of each kind, and to twelve input pixels."}
                </p>
                <NumberTable
                  headings={["convolution", "largest slope", "largest disagreement", "if the skip’s share is not added"]}
                  rows={[
                    ["way down, first", "9.505", "2.1 × 10⁻⁸", "6.838"],
                    ["way down, second", "4.941", "1.4 × 10⁻⁸", "4.054"],
                    ["the middle", "0.650", "1.6 × 10⁻⁸", "1.6 × 10⁻⁸"],
                    ["half-size decoder", "4.517", "2.0 × 10⁻⁸", "2.0 × 10⁻⁸"],
                    ["full-size decoder", "2.718", "1.7 × 10⁻⁸", "1.7 × 10⁻⁸"],
                    ["one score per pixel", "15.782", "1.2 × 10⁻⁸", "1.2 × 10⁻⁸"],
                    ["the picture’s pixels", "0.320", "1.3 × 10⁻⁸", ""],
                  ]}
                  caption="Four pictures, a nudge of one millionth each way. The last column runs the same walk with the addition of section 11 left out."
                />
                <p>
                  {"The largest reported discrepancies are about two hundred-millionths. That is strong agreement for these checked entries at this finite-difference step, rather than a proof for every input or parameter. Omitting the skip-gradient addition leaves the middle and decoder derivatives unchanged, but changes the two encoder results by 6.838 and 4.054 on slopes no larger than 9.505."}
                </p>
                <KeepInMind>
                  {"Omitting a skip contribution can leave a program that still runs and updates its encoder through the deeper route. Running successfully therefore does not establish that every gradient contribution is present. A finite-difference check can expose this particular error."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. How much of the blame crosses the skip">
                <p>The gradient contributions at each encoder convolution can be inspected separately. The recorded comparison uses the Euclidean norm, which combines a block’s entries into one magnitude. It uses the same four pictures before and after training, letting us compare the sizes of the pooled-route and skip-route contributions under the same inputs.</p>
                <NumberTable
                  headings={["length of the blame", "across the skip", "down through the pooling", "their sum"]}
                  rows={[
                    ["first convolution, before training", "1.861", "6.551", "6.921"],
                    ["first convolution, after training", "0.573", "0.587", "0.830"],
                    ["second convolution, before training", "5.333", "5.769", "7.873"],
                    ["second convolution, after training", "0.311", "0.520", "0.599"],
                  ]}
                  caption="The norm of the sum is smaller than the sum of the norms because the gradient blocks are not perfectly aligned. This does not require their dot product to be negative."
                />
                <p>
                  {"Before training, the first convolution's deep-route gradient norm is 6.551, compared with 1.861 across the skip. After twenty passes, the two norms are similar at 0.573 and 0.587. Similar norms do not mean each supplies exactly half the update; their directions matter too. The skip also provides a shorter derivative path through two convolutions rather than five through the middle."}
                </p>
                <KeepInMind>
                  A skip carries detail up to the decoder on the way forward
                  and carries blame down to the encoder on the way back, and in
                  this U, after training, about as much blame reaches the first
                  convolution by the short route as by the long one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. With and Without the Skip Connections",
          content: (
            <>
              <SubSection title="14. The same U trained twice">
                <p>
                  {"The reported comparison trains both arrangements from the same seed and scores them on the 240 held-out images after every pass. The encoder and middle start with the same weights. Decoder input widths differ because one arrangement includes the saved feature maps, so its decoder weights and parameter count also differ. This tests these two complete arrangements rather than isolating one variable at equal model size."}
                </p>
                <UNetTrainingCurves />
                <p>
                  At seed 0 the U with skips reaches an overlap of 0.909 after
                  four passes and 0.987 after ten, and finishes at 0.992 with a
                  loss of 0.0023 per pixel. The U without them does not get
                  past 0.64 at any pass, and its curve jumps. At seed 2 it was
                  at 0.556 after pass 10 and at exactly zero after pass 11,
                  calling no pixel of any held-out picture shape, and at seed 1
                  it fell from 0.556 after pass 18 to 0.040 after pass 19.
                </p>
                <KeepInMind>
                  Without the skips the only route to a pixel&rsquo;s answer is
                  through sixteen coarse positions, and the network moves
                  between calling a blurred shape and calling nothing from one
                  pass to the next.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Three starts each">
                <p>
                  A network this small ends somewhere different for each draw of
                  its starting weights, so both arrangements were trained from
                  three seeds, and the widgets draw seed 0 unless a button says
                  otherwise.
                </p>
                <NumberTable
                  headings={["held-out, after pass 20", "seed 0", "seed 1", "seed 2"]}
                  rows={[
                    ["overlap, with the skips", "0.992", "0.995", "0.995"],
                    ["overlap, without them", "0.623", "0.163", "0.559"],
                    ["pixels right, with the skips", "0.9992", "0.9994", "0.9994"],
                    ["pixels right, without them", "0.949", "0.906", "0.935"],
                  ]}
                />
                <p>
                  {"With skips, the three recorded seeds agree within 0.004 in overlap. Without them, overlap ranges from 0.163 to 0.623. The worst no-skip run still gets 0.906 of pixels right, only about 0.016 above the background-only baseline of 0.889 when the difference is calculated using the unrounded accuracies. Every recorded skip-connected run has higher overlap than every no-skip run."}
                </p>
                <KeepInMind>
                  {"Across the three recorded starts, the overlap advantage of the skip-connected arrangement is larger than either arrangement's seed-to-seed spread. Overall pixel accuracy makes that difference look smaller because most background pixels are easy for both networks."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where the errors are">
                <p>
                  {"Do the saved high-resolution features help near shape outlines? The following comparison counts prediction errors separately at the defined boundary pixels and elsewhere."}
                </p>
                <NumberTable
                  headings={["held-out", "edge pixels right", "other pixels right"]}
                  rows={[
                    ["with the skips, seed 0, 1, 2", "0.996, 0.997, 0.997", "1.000, 1.000, 0.9999"],
                    ["without them, seed 0, 1, 2", "0.758, 0.618, 0.705", "0.998, 0.979, 0.993"],
                  ]}
                  caption="12,433 held-out pixels are on an edge and 49,007 are not."
                />
                <InAModel title="Seed 0, pixel by pixel">
                  <p>
                  {"Without skips, seed 0 gets 3,130 held-out pixels wrong, including 3,007 boundary pixels. It misses 1,760 shape pixels and adds 1,370 false shape pixels. Those totals show errors of both kinds; the displayed masks reveal where their outlines differ. With skips, 47 of the 48 errors lie at boundaries, and 45 of those 48 are missed shape pixels."}
                </p>
                </InAModel>
                <p>
                  {"Most of the difference lies near shape boundaries. The skip connections give the decoder direct access to finer-resolution encoder features, while the other arrangement must form its output from the coarse middle maps. The results support that explanation on this dataset; they do not establish a hard four-pixel limit on what a learned decoder can represent."}
                </p>
                <KeepInMind>
                  {"The measured improvement is concentrated at the boundaries: accuracy there rises from between 0.62 and 0.76 without skips to about 0.997 with them. The separate interior scores show where the two arrangements were already similar."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The thin shapes suffer most">
                <p>
                  Split by kind, the U without skips does worst on the square
                  outline, which is one pixel thick and so is all edge, and best
                  on the filled disc, which has an inside.
                </p>
                <NumberTable
                  headings={["overlap, seed 0", "cross", "square outline", "filled disc", "diagonal bar"]}
                  rows={[
                    ["with the skips", "0.998", "0.996", "0.996", "0.977"],
                    ["without them", "0.650", "0.415", "0.769", "0.658"],
                  ]}
                />
                <p>
                  {"Choose the square outline in the playground and disable the skips. The predicted region is broader and its corners less precise in this example. Repetition starts from coarse blocks, but the later decoder convolutions can refine those values, so a one-pixel line is not mathematically forbidden without a skip. Here the saved features make that reconstruction much easier. The diagonal bar is the skip-connected network's weakest category at 0.977; its narrow stepped outline leaves little interior area."}
                </p>
                <KeepInMind>
                  The less of a shape lies away from its edge, the more it needs
                  the full-size detail, and every pixel of a one-pixel outline
                  is on its edge.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "A backward pass that forgets the skip’s share of the blame fails loudly, so the mistake shows up without a check.",
              false,
              "Omitting a skip contribution can leave finite gradients of the expected shape, so the backward pass need not fail visibly. The encoder still receives a contribution through the middle, but it is missing another route from the same output. Here a numerical gradient check exposes that discrepancy. Layers reached only once can still have correct gradients, which helps localize the error.",
            ),
            choice(
              "What does this error breakdown tell us about the U-Net without skips?",
              [
                              "Nearly all on an edge, 3,007 of them, about as many shape pixels missed as invented",
                              "Spread over edge pixels and other pixels in proportion to how many of each there are",
                              "Mostly inside the shapes, since the middle cannot tell what kind a shape is",
                              "Mostly in the ground far from any shape, which the coarse maps fill in",
                            ],
              0,
              "The breakdown shows many of the no-skip model’s errors occur near shape boundaries. Its false-positive and false-negative counts are both substantial even though its interior/background accuracy is high. Those counts do not prove a uniform pixel displacement or a hard four-pixel localization limit. Retained high-resolution features help the decoder in this experiment, and the edge-specific measurements show where the improvement occurs.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Seed 0, U-Net without skips:\nwrong held-out pixels: 3,130\nwrong pixels on an edge: 3,007\nshape pixels incorrectly called ground: 1,760\nground pixels incorrectly called shape: 1,370\n\nHeld-out pixels on edges: 12,433; other pixels: 49,007."
              },
            ),
            trueFalse(
              "After twenty passes, about as much blame reaches the first convolution across the full-size skip as through the middle.",
              true,
              "The two routes measured 0.573 and 0.587 after training, where before training the middle carried 6.551 against the skip’s 1.861. The short route passes through two convolutions where the route through the middle passes through five, which is the second thing a skip does beside carrying detail forward.",
            ),
            several(
              "Which of these did the training comparison find?",
              [
                              "At seed 0 the U with skips finishes at an overlap of 0.992",
                              "The U without skips does not get past 0.64 at any pass",
                              "The worst seed without skips still gets 0.906 of pixels right",
                              "The three seeds without skips agree with each other within 0.004",
                            ],
              [0, 1, 2],
              "The skip-connected runs agree within 0.004 in overlap; the no-skip runs range from 0.163 to 0.623. The worst no-skip accuracy is displayed as 0.906. Its gain over predicting background everywhere is about 0.016 using the unrounded accuracies, so subtracting the separately rounded displays need not reproduce that exact difference. Most background pixels are easy for both arrangements.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "held-out, after pass 20 | seed 0 | seed 1 | seed 2\noverlap, with the skips | 0.992 | 0.995 | 0.995\noverlap, without them | 0.623 | 0.163 | 0.559\npixels right, with the skips | 0.9992 | 0.9994 | 0.9994\npixels right, without them | 0.949 | 0.906 | 0.935\n\nDuring these measured runs the no-skip U-Net never exceeds overlap 0.64.\nCalling every pixel ground gives pixel accuracy about 0.889."
              },
            ),
            choice(
              "Which kind does the U without skips do worst on?",
              [
                "The square outline",
                "The filled disc",
                "The diagonal bar",
                "The cross",
              ],
              0,
              "The no-skip model performs worst on the one-pixel square outline in this comparison. Thin outlines are difficult to preserve after repeated spatial reduction because almost every foreground pixel lies on a boundary. A filled disc has a larger interior region. This explains a useful architectural concern, rather than proving that a coarse decoder can never reconstruct a thin shape.",
            ),
        ],
        },
        {
          title: "Part 5. A Threshold Does Better Here",
          content: (
            <>
              <SubSection title="18. The obvious alternative, measured">
                <>
<p>
                  {"These generated images put a brighter shape against a dimmer background. A simple threshold rule is therefore a useful baseline. The shared-threshold experiment compares 41 levels from 0.20 to 0.60 using training-pixel accuracy and selects 0.41. Selecting on the training data keeps the held-out images available for evaluating the chosen rule."}
                </p>
                <p>
                  The second chooses a level for each picture from that picture alone, by Otsu&rsquo;s rule of 1979, which tries every cut between two brightnesses and keeps the one that splits the picture into two groups whose means are furthest apart for their sizes.
                </p>
</>
                <UNetBaselineBoard />
                <NumberTable
                  headings={["held-out", "overlap", "edge pixels right", "pixels wrong"]}
                  rows={[
                    ["one level for every picture, 0.41", "0.983", "0.995", "105"],
                    ["a level for each picture", "0.9999", "1.000", "1"],
                    ["the U with skips, seed 0", "0.992", "0.996", "48"],
                    ["the U without skips, seed 0", "0.623", "0.758", "3,130"],
                  ]}
                />
                <p>
                  {"The skip-connected network beats the shared threshold by about 0.01 in overlap and also has better boundary accuracy. Otsu's per-image threshold does better still, missing one pixel in 61,440. The network uses 2,521 learned parameters and twenty passes over 240 labeled images. Otsu estimates a threshold from each image's brightness values without training on masks. That is the relevant baseline advantage here."}
                </p>
                <KeepInMind>
                  On these pictures a U-Net with 2,521 trained parameters got 48
                  held-out pixels wrong, and a threshold chosen for each picture
                  got one wrong.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Why, and what that says about the task">
                <>
<p>
                  {"The image generator makes the shape at least 0.4 brighter than its background, while pixel noise has spread 0.05. Foreground and background therefore form well-separated brightness groups within most images. A threshold can use that separation without learning the shape category or a detailed spatial model."}
                </p>
                <p>
                  {"The original U-Net addressed biomedical segmentation, where local brightness alone may not separate structures reliably and labeled images can be scarce. It combines image context with high-resolution features to predict detailed regions. The collection here does not reproduce that difficulty: brightness already provides a very strong cue. Testing the broader advantage would require a different image distribution."}
                </p>
</>
                <p>
                  {"This collection illustrates how the architecture computes a mask and how these versions behave with and without skips. It does not show that a neural network is necessary for the task. The per-image threshold already labels 61,439 of the 61,440 held-out pixels correctly."}
                </p>
                <KeepInMind>
                  Before training, compare with a brightness-threshold baseline. On these held-out images, that rule gets all but one of 61,440 pixels right. A network result needs to be judged against that strong performance on this deliberately simple image distribution.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. A Kind and a Size It Never Saw",
          content: (
            <>
              <SubSection title="20. Rings">
                <p>
                  {"The classifier has four output categories, so it cannot name ring as a new category and calls most rings square outlines. The segmenter instead predicts shape versus background at each pixel. That output definition also applies to rings, although good predictions on a new shape are not guaranteed. The following results use the same sixty ring examples as the classifier comparison."}
                </p>
                <NumberTable
                  headings={["overlap on 60 rings", "seed 0", "seed 1", "seed 2"]}
                  rows={[
                    ["with the skips", "0.991", "0.970", "0.995"],
                    ["without them", "0.487", "0.048", "0.451"],
                  ]}
                />
                <>
<p>
                  With the skips the rings come out almost as well as the kinds it trained on. Its errors are ring pixels called ground, 20, 70 and 11 of the 2,257 at the three seeds, and it calls at most 2 of the 2,046 pixels inside the rings&rsquo; holes shape, so it did not fill a ring in as if it were a disc.
                </p>
                <p>
                  Without the skips, at seed 0, it called 245 of those hole pixels shape and missed 908 ring pixels, which in the box at the top of the page looks like a smudge where a ring should be. The rings are the last four pictures there.
                </p>
</>
                <KeepInMind>
                  {"These ring results show useful transfer for the skip-connected binary segmenter on this image distribution. They do not turn its shape/background labels into a ring category. Deciding what each pixel belongs to and assigning a new image category remain different tasks."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A picture twice the size">
                <p>
                  {"This classifier's dense layer expects the flattened size produced by a sixteen-by-sixteen input. The U uses local operations instead, so its weights can be reused at compatible spatial sizes. The reported test joins four held-out images into one 32-by-32 image and applies the seed-0 skip-connected network without retraining. The pooling and join shapes still need to agree, as section 22 checks."}
                </p>
                <UNetLargerPicture />
                <p>

                  It gets all 1,024 pixels right, and its call at every pixel is
                  the same as when the four pictures were read apart, including
                  the pixels next to the seams, where a window now reads the
                  neighboring picture instead of the zeros it saw at the frame
                  during training. On a picture with nothing drawn on it, an even
                  brightness of 0.15, it calls no pixel shape, and the largest
                  probability of shape it gives any pixel is 0.0044, where the
                  classifier called the same blank picture a diagonal bar.
                </p>
                <KeepInMind>
                  {"Fully convolutional describes this use of convolutional feature maps rather than a fixed-size dense output. It permits reuse across compatible image sizes, but pooling, padding and skip joins still impose shape rules. Here the same weights processed an image four times the training area."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Image Shapes, Skip Connections and the Limits of the Labels" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="22. Sides that do not halve evenly">
                <p>
                  A join lays two blocks of maps side by side, which means
                  nothing unless they are the same height and width. The
                  repeated maps come from halving the picture and doubling it
                  back, and a side that does not halve evenly loses a row on the
                  way down that repetition cannot restore, so the two blocks
                  meeting at the join are of different sizes.
                </p>
                <NumberTable
                  headings={["side", "halved", "halved again", "doubled back", "half-size join", "full-size join"]}
                  rows={[
                    ["16", "8", "4", "8, then 16", "8 beside 8", "16 beside 16"],
                    ["18", "9", "4", "8, then 16", "8 beside 9, undefined", "16 beside 18, undefined"],
                    ["20", "10", "5", "10, then 20", "10 beside 10", "20 beside 20"],
                    ["30", "15", "7", "14, then 28", "14 beside 15, undefined", "28 beside 30, undefined"],
                    ["32", "16", "8", "16, then 32", "16 beside 16", "32 beside 32"],
                  ]}
                  caption="For the same-padding, halving-and-repetition design shown here, two poolings require sides divisible by four for these joins to align. The corresponding condition with d poolings is divisibility by two to the power d."
                />
                <>
<p>
                  {"One option is to pad the input to a compatible size, then remove the padding from the final output. That introduces a choice about border context. Another is to crop the larger feature map before concatenation. The original paper cropped encoder maps because its unpadded convolutions reduced their spatial sizes."}
                </p>
                <p>
                  Or resize the picture, which changes every shape in it. Without the joins the question does not arise at the joins, but it moves to the answer, which for a side of 30 comes out 28 wide and cannot be compared with a mask of 30.
                </p>
</>
                <KeepInMind>
                  {"For the halving-and-repetition arrangement shown here, compatible sides divide evenly at every pooling stage. Other U-Net implementations can use explicit padding, cropping or size-aware resizing to align their maps. The architecture name alone does not specify how borders and odd sizes are handled."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The cases where the method has no answer">
                <p>
                  {"The image shape, prediction rule and evaluation convention each determine which outputs we can interpret. The cases below separate missing input context from an invalid join or an undefined metric."}
                </p>
                <DerivationTable
                  expressionHeading="Mask, prediction or image shape"
                  reasonHeading="Effect on segmentation and its score"
                  rows={[
                    { expression: "a picture with no shape in it", reason: "if the network also calls nothing, the overlap is zero pixels over zero pixels and is undefined. Counting it as one, leaving the picture out, or pooling the counts over all pictures before dividing are the three choices, and each gives a different average. The blank picture of section 21 is this case, and the U called nothing." },
                    { expression: "a picture with no shape, and a call of some", reason: "the overlap is zero whatever the size of the mistake, so one wrongly called pixel and a wrongly called half picture score the same." },
                    { expression: "a probability of exactly one half", reason: "The rule used here predicts shape only above one half, so an exact tie is background. Another threshold convention could assign that tie differently. State the convention instead of leaving the case unspecified." },
                    { expression: "a side not divisible by two to the power of the depth", reason: "the joins pair blocks of different sizes, which is undefined. Section 22 has the widths and the three ways out." },
                    { expression: "a shape touching the frame", reason: "a window at the frame reads the padding’s zeros, which are not pixels, so the network learned the frame as a dark border. A picture with a bright shape running off its edge asks it about a situation it was never shown. Every shape in this collection is drawn at least one pixel in from the frame." },
                    { expression: "two shapes touching", reason: "a mask says which pixels are shape and not which shape, so two touching shapes are one region in the answer. The paper met this with touching cells and weighted the loss heavily on the thin gaps between them, which is a change to the loss and not to the architecture." },
                    { expression: "blame split in another order than the join", reason: "If the forward pass places encoder maps first but the backward split treats those channels as repeated maps, derivatives follow the wrong branches. Matching shapes may let the computation run. A finite-difference check such as section 12 can reveal the incorrect gradient routing." },
                    { expression: "detail finer than the smallest map, with no skip", reason: "Repetition initially copies each value over a block, four pixels across here after both enlargements. The following learned convolutions can vary the final predictions within those blocks. They cannot recover information absent from every retained feature, but coarse map spacing alone does not prove that all finer location information was lost." },
                  ]}
                />
                <KeepInMind>
                  {"A mistaken gradient split may still produce finite updates, while an empty-union IoU needs an explicit convention. These are different failures. Numerical checks can test the gradient path, and evaluation code must state what it does with an empty foreground union."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "Why does a level chosen for each picture do so well on this collection?",
              [
                "A shape pixel is its picture’s background plus a lift of at least 0.4 against a noise spread of 0.05, so brightness falls into two separated groups",
                "Otsu’s rule was fitted on the 240 training masks",
                "Every picture in the collection shares one background brightness",
                "The U was trained with a step of 0.003, which is too small to compete",
              ],
              0,
              "These generated pictures separate foreground and background mainly by brightness. Choosing a threshold from each image therefore matches how the data was constructed, without needing labeled masks for fitting. That makes it a useful baseline here. Images with overlapping brightness ranges, texture or shadows can require a different method.",
            ),
            trueFalse(
              "The U with skips, with its 2,521 trained parameters, gets fewer held-out pixels wrong than a brightness level chosen for each picture.",
              false,
              "The U gets 48 held-out pixels wrong and the level chosen per picture gets one wrong in 61,440, with no parameters and without ever seeing a mask. What the U does beat is one fixed level for every picture, by about 0.01 in overlap and on the edges too, since a fixed level has no way to follow a picture whose background happens to be bright.",
            ),
            several(
              "Which of these hold on the sixty rings, a kind neither arrangement trained on?",
              [
                "With skips, the dominant errors are ring pixels called ground",
                "With the skips, at most 2 of the 2,046 pixels inside the holes are called shape",
                "Without the skips, seed 0 called 245 of those hole pixels shape",
                "Both arrangements had to be retrained on rings before they could answer"
              ],
              [0, 1, 2],
              "The prediction target is a foreground/background mask, so the network can produce a mask for an unseen shape category without adding another output class. Whether that mask is useful still requires evaluation. The reported ring results, including the hole pixels, show what these fitted models actually did; the output format alone gives no guarantee of generalization.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "60 rings, absent from both training sets; evaluated directly without retraining.\nTrue ring pixels: 2,257; pixels inside ring holes: 2,046.\nWith skips, missed ring pixels, seeds 0/1/2: 20 / 70 / 11.\nWith skips, at most 2 hole pixels are called shape.\nWithout skips, seed 0 calls 245 hole pixels shape and misses 908 ring pixels."
              },
            ),
            choice(
              "Why can the U read a 32 by 32 picture without retraining, where the classifier cannot?",
              [
                "The U has no dense layer, so every layer reads its input window by window",
                "The U was trained on pictures of several sizes",
                "The U chooses how many poolings to use from the side it is given",
                "The seams between the four pictures are padded with zeros during the pass",
              ],
              0,
              "The U’s convolutional parameters are shared across spatial positions, so they can be reused in a larger compatible spatial layout. The classifier’s dense head expects a fixed flattened feature count. Boundary conditions still matter: adjoining tiles lets windows read neighboring pixels where separate tiles used padding. The reported agreement is a result for this example, not a guarantee for every image or architecture.",
            ),
            several(
              "For this U-Net with two floor-halving poolings and two exact doublings, which statements describe the shape problem and its possible repairs?",
              [
                "Cropping the larger block down is what the paper did, and it throws away the encoder’s outermost rows",
                "Padding the input to a side divisible by four introduces border values that the network processes",
                "Without extra cropping or padding, both joins in this implementation match when the side is divisible by four",
                "Without the joins the trouble moves to the answer, which for a side of 30 comes out 28 wide"
              ],
              [0, 1, 2, 3],
              "For this implementation, two floor halvings followed by two doublings recover a side exactly when it is divisible by four. With side 30 the decoder returns side 28, so a direct comparison with the original mask fails. Cropping, padding and resizing are design choices; none makes divisibility a universal requirement of every U-Net architecture.",
              {
                "description": "The lesson’s convolutions preserve spatial size. Direct skip joins require equal spatial extents and do not automatically crop, pad or resize. Consider the unmodified two-pooling implementation unless a repair is explicitly stated. A padded prediction can be cropped back to the original image for evaluation."
              },
            ),
        ],
        },
        {
          title: "Practice. Building and Walking a Small U With the Library",
          practice: [
            exercise(
              "Count the U with its skips, without them, and with one",
              [
  "Complete the supplied decoder convolutions and one-by-one pixel-score layer for the U-shaped layouts with both skips, neither skip and the full-size skip only.",
  "Print every convolution’s parameter count and each total. A skip concatenates retained channels with the upsampled channels, increasing the next convolution’s input width without storing its own learned weights."
],
              `from oop_ml import Conv2d, Identity, RectifiedLinear

bend = RectifiedLinear()
for name, half_skip, full_skip in (("both skips", 8, 4), ("neither skip", 0, 0), ("the full-size skip only", 0, 4)):
    convolutions = {
        "down 1": Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=0),
        "down 2": Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=1),
        "middle": Conv2d(reads=(8, 4, 4), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=2),
        # Add "decoder half", eight filters reading the middle's eight maps
        # at eight by eight plus half_skip more channels, "decoder full", four
        # filters reading eight maps at sixteen by sixteen plus full_skip
        # more, and "score", one filter of one by one with an Identity
        # activation reading the four maps.
    }
    # Count each convolution's kernels and biases, and print the counts and
    # their total beside the arrangement's name.`,
              `from oop_ml import Conv2d, Identity, RectifiedLinear

bend = RectifiedLinear()
for name, half_skip, full_skip in (("both skips", 8, 4), ("neither skip", 0, 0), ("the full-size skip only", 0, 4)):
    convolutions = {
        "down 1": Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=0),
        "down 2": Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=1),
        "middle": Conv2d(reads=(8, 4, 4), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=2),
        "decoder half": Conv2d(reads=(8 + half_skip, 8, 8), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=3),
        "decoder full": Conv2d(reads=(8 + full_skip, 16, 16), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=4),
        "score": Conv2d(reads=(4, 16, 16), n_filters=1, kernel_size=1, activation=Identity(), random_seed=5),
    }
    counts = {label: layer.kernels.size + layer.bias_vector.size for label, layer in convolutions.items()}
    print(f"{name}: {counts}")
    print(f"{name}: {sum(counts.values())} parameters in all")`,
              `both skips: {'down 1': 40, 'down 2': 296, 'middle': 584, 'decoder half': 1160, 'decoder full': 436, 'score': 5}
both skips: 2521 parameters in all
neither skip: {'down 1': 40, 'down 2': 296, 'middle': 584, 'decoder half': 584, 'decoder full': 292, 'score': 5}
neither skip: 1801 parameters in all
the full-size skip only: {'down 1': 40, 'down 2': 296, 'middle': 584, 'decoder half': 584, 'decoder full': 436, 'score': 5}
the full-size skip only: 1945 parameters in all`,
              { hints: [
  "Use the channel counts supplied for each layout rather than reusing one decoder in all three.",
  "Count kernels over both input channels and output filters, then include one bias per output filter."
], check: numberCheck("How many parameters does the U hold with the full-size skip only?", 1945, 0.5, "The full-size-skip layout stores 1945 parameters. Its concatenated encoder channels increase the following convolution’s weight count without giving the skip itself weights."), question: "How do skip connections change the decoder’s input-channel count?" },
            ),
            exercise(
              "Grow a two by two map, and send the blame back",
              [
  "Build the supplied nearest-neighbor repetition layer on the two-by-two map [1,2;3,4]. Print its input/output shapes and enlarged map.",
  "Use the specified upstream contributions on the upper-left and lower-right repeated blocks, with zero elsewhere. Print input derivatives, the upper-left total and the layer’s parameter gradient."
],
              `import numpy as np
from oop_ml import NearestUpsample2d

small = np.array([[1.0, 2.0], [3.0, 4.0]])
arriving = np.zeros((1, 1, 4, 4))
arriving[0, 0, :2, :2] = [[0.1, 0.2], [0.3, 0.4]]
arriving[0, 0, 2:, 2:] = 1.0

# Build the repetition for one channel of two by two, respond to small as a
# block of one row and one channel, and print the arrangements it reads and
# answers and the grown map. Then ask for its correction from arriving, and
# print what it hands down, what the top left value is owed, and its gradient.`,
              `import numpy as np
from oop_ml import NearestUpsample2d

small = np.array([[1.0, 2.0], [3.0, 4.0]])
arriving = np.zeros((1, 1, 4, 4))
arriving[0, 0, :2, :2] = [[0.1, 0.2], [0.3, 0.4]]
arriving[0, 0, 2:, 2:] = 1.0

up = NearestUpsample2d(reads=(1, 2, 2))
response = up.respond_to(small[None, None])
print(f"reads {up.shape.reads}, answers {up.shape.answers}")
print(response.outputs[0, 0])
correction = up.correction_for(response, arriving)
print(correction.passed_down[0, 0])
print(f"the top left value is owed {correction.passed_down[0, 0, 0, 0]:.1f}")
print(f"the layer's own gradient is {correction.gradient}")`,
              `reads (1, 2, 2), answers (1, 4, 4)
[[1. 1. 2. 2.]
 [1. 1. 2. 2.]
 [3. 3. 4. 4.]
 [3. 3. 4. 4.]]
[[1. 0.]
 [0. 4.]]
the top left value is owed 1.0
the layer's own gradient is None`,
              { hints: [
  "Every repeated output depends on one original cell. Their derivatives therefore add at that cell.",
  "The repetition stores no trainable weights, even though it passes derivatives backward."
], check: numberCheck("What input derivative reaches the original upper-left cell after its repeated outputs are combined?", 1.0, 0.05, "The upper-left input derivative is 1.0. Every repeated output from that one source contributes back to the same source cell."), question: "How should repeated upsampled cells send gradients back to their shared source?" },
            ),
            exercise(
              "Walk one join back by hand, and check it with a nudge",
              [
  "Use the supplied minimal U and finite-difference result for one first-convolution weight. Run backward from the unchanged forward response.",
  "Split the final convolution’s input derivative in concatenation order: repeated middle maps first, retained encoder maps afterward. Carry the middle branch back through repetition, middle convolution and pooling, then add the skip contribution at the encoder output.",
  "Print the chosen weight’s measured derivative, full-path derivative and derivative omitting the skip, plus norms of both arriving contributions and their sum."
],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, Conv2d, Flatten, Identity, MaxPool2d, NearestUpsample2d, RectifiedLinear

bend, loss = RectifiedLinear(), BinaryCrossEntropy()
down = Conv2d(reads=(1, 8, 8), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=0)
pool = MaxPool2d(reads=(4, 8, 8))
middle = Conv2d(reads=(4, 4, 4), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=1)
up = NearestUpsample2d(reads=(4, 4, 4))
join = Conv2d(reads=(8, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), padding=1, random_seed=2)
flat = Flatten(reads=(1, 8, 8))

mask = np.zeros((8, 8))
mask[2:6, 2:6] = 1.0
picture, target = (0.1 + 0.5 * mask)[None, None], mask.reshape(1, 64)

losses = []
for nudge in (1e-6, -1e-6, 0.0):
    kernels = down.kernels.copy()
    kernels[0, 0, 1, 1] += nudge
    kept = down.with_parameters(kernels, down.bias_vector).respond_to(picture)
    pooled = pool.respond_to(kept.outputs)
    deep = middle.respond_to(pooled.outputs)
    grown = up.respond_to(deep.outputs)
    joined = join.respond_to(np.concatenate([grown.outputs, kept.outputs], axis=1))
    flattened = flat.respond_to(joined.outputs)
    measured = loss.measure(flattened.outputs, target)
    losses.append(measured.value)
print(f"slope measured by the nudge {(losses[0] - losses[1]) / 2e-6:.4f}")

# Walk back from measured.gradient through flat and join, split what join
# hands down into its first four channels and its last four, carry the first
# four down through up, middle and pool, and take the first convolution's
# correction from the two parts added and from the deep part alone. The
# nudged weight is entry [0, 4] of the gradient's weights.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, Conv2d, Flatten, Identity, MaxPool2d, NearestUpsample2d, RectifiedLinear

bend, loss = RectifiedLinear(), BinaryCrossEntropy()
down = Conv2d(reads=(1, 8, 8), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=0)
pool = MaxPool2d(reads=(4, 8, 8))
middle = Conv2d(reads=(4, 4, 4), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=1)
up = NearestUpsample2d(reads=(4, 4, 4))
join = Conv2d(reads=(8, 8, 8), n_filters=1, kernel_size=3, activation=Identity(), padding=1, random_seed=2)
flat = Flatten(reads=(1, 8, 8))

mask = np.zeros((8, 8))
mask[2:6, 2:6] = 1.0
picture, target = (0.1 + 0.5 * mask)[None, None], mask.reshape(1, 64)

losses = []
for nudge in (1e-6, -1e-6, 0.0):
    kernels = down.kernels.copy()
    kernels[0, 0, 1, 1] += nudge
    kept = down.with_parameters(kernels, down.bias_vector).respond_to(picture)
    pooled = pool.respond_to(kept.outputs)
    deep = middle.respond_to(pooled.outputs)
    grown = up.respond_to(deep.outputs)
    joined = join.respond_to(np.concatenate([grown.outputs, kept.outputs], axis=1))
    flattened = flat.respond_to(joined.outputs)
    measured = loss.measure(flattened.outputs, target)
    losses.append(measured.value)
print(f"slope measured by the nudge {(losses[0] - losses[1]) / 2e-6:.4f}")

blame = flat.correction_for(flattened, measured.gradient).passed_down
blame = join.correction_for(joined, blame).passed_down
below, across = blame[:, :4], blame[:, 4:]
below = up.correction_for(grown, below).passed_down
below = middle.correction_for(deep, below).passed_down
below = pool.correction_for(pooled, below).passed_down
added = down.correction_for(kept, below + across).gradient.weights[0, 4]
forgotten = down.correction_for(kept, below).gradient.weights[0, 4]
print(f"slope from the walk with the skip's share added {added:.4f}")
print(f"slope from the walk with the skip's share left out {forgotten:.4f}")
print(f"length across the skip {np.linalg.norm(across):.3f}, down through the pooling {np.linalg.norm(below):.3f}, their sum {np.linalg.norm(below + across):.3f}")`,
              `slope measured by the nudge 0.0897
slope from the walk with the skip's share added 0.0897
slope from the walk with the skip's share left out 0.4354
length across the skip 3.499, down through the pooling 1.179, their sum 3.752`,
              { hints: [
  "Keep the channel slices aligned with the forward concatenation order.",
  "Both routes read the same encoder output. Sum their derivatives before its correction_for call."
], check: numberCheck("What slope does the walk give the nudged weight when the two parts are added, to four places?", 0.0897, 0.0005, "The complete-path derivative is 0.0897 and matches the finite difference. Omitting the skip route removes a real contribution to the shared encoder output."), question: "Which derivative contribution is lost if the skip path is omitted?" },
            ),
            exercise(
              "Train a small U with its skip and without it",
              [
  "The supplied small U training uses forty labeled outline images and keeps forty separate for evaluation. Compare the trained one-full-size-skip network with the no-skip version.",
  "On held-out images call pixels shape when raw score exceeds zero. Print pixel accuracy, mean per-image intersection-over-union and predicted shape-pixel count for each, then the all-background pixel-accuracy baseline."
],
              `import numpy as np
from oop_ml import BinaryCrossEntropy, Conv2d, Flatten, Identity, MaxPool2d, NearestUpsample2d, RectifiedLinear

draw = np.random.default_rng(0)
masks = np.zeros((80, 12, 12))
for mask, (top, left) in zip(masks, draw.integers(1, 7, size=(80, 2))):
    mask[top : top + 5, left : left + 5] = 1.0
    mask[top + 1 : top + 4, left + 1 : left + 4] = 0.0  # a square outline, one pixel thick
pictures = (0.1 + 0.5 * masks + draw.normal(0.0, 0.05, masks.shape))[:, None]
targets, bend, loss = masks.reshape(80, 144), RectifiedLinear(), BinaryCrossEntropy()

for skip in (True, False):
    layers = [
        Conv2d(reads=(1, 12, 12), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=0),
        MaxPool2d(reads=(4, 12, 12)),
        Conv2d(reads=(4, 6, 6), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=1),
        MaxPool2d(reads=(8, 6, 6)),
        Conv2d(reads=(8, 3, 3), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=2),
        NearestUpsample2d(reads=(8, 3, 3), factor=4),
        Conv2d(reads=(12 if skip else 8, 12, 12), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=3),
        Conv2d(reads=(4, 12, 12), n_filters=1, kernel_size=1, activation=Identity(), random_seed=4),
        Flatten(reads=(1, 12, 12)),
    ]

    def forward(block):
        responses = []
        for position, layer in enumerate(layers):
            if skip and position == 6:  # the join, repeated maps first
                block = np.concatenate([block, responses[0].outputs], axis=1)
            responses.append(layer.respond_to(block))
            block = responses[-1].outputs
        return responses

    for epoch in range(100):
        for first in range(0, 40, 8):
            responses = forward(pictures[first : first + 8])
            blame = loss.measure(responses[-1].outputs, targets[first : first + 8]).gradient
            for position in reversed(range(len(layers))):
                if skip and position == 0:  # the first convolution is owed both parts
                    blame = blame + across
                correction = layers[position].correction_for(responses[position], blame)
                blame = correction.passed_down
                if skip and position == 6:  # split in the order the join was built
                    blame, across = blame[:, :8], blame[:, 8:]
                layers[position] = layers[position].stepped_by(correction.gradient, 0.005)

    # Score pictures[40:] against targets[40:]. Print, for this arrangement,
    # the share of pixels right, the mean overlap and the pixels called shape.
# Print the share of held-out pixels right if every pixel is called ground.`,
              `import numpy as np
from oop_ml import BinaryCrossEntropy, Conv2d, Flatten, Identity, MaxPool2d, NearestUpsample2d, RectifiedLinear

draw = np.random.default_rng(0)
masks = np.zeros((80, 12, 12))
for mask, (top, left) in zip(masks, draw.integers(1, 7, size=(80, 2))):
    mask[top : top + 5, left : left + 5] = 1.0
    mask[top + 1 : top + 4, left + 1 : left + 4] = 0.0  # a square outline, one pixel thick
pictures = (0.1 + 0.5 * masks + draw.normal(0.0, 0.05, masks.shape))[:, None]
targets, bend, loss = masks.reshape(80, 144), RectifiedLinear(), BinaryCrossEntropy()

for skip in (True, False):
    layers = [
        Conv2d(reads=(1, 12, 12), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=0),
        MaxPool2d(reads=(4, 12, 12)),
        Conv2d(reads=(4, 6, 6), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=1),
        MaxPool2d(reads=(8, 6, 6)),
        Conv2d(reads=(8, 3, 3), n_filters=8, kernel_size=3, activation=bend, padding=1, random_seed=2),
        NearestUpsample2d(reads=(8, 3, 3), factor=4),
        Conv2d(reads=(12 if skip else 8, 12, 12), n_filters=4, kernel_size=3, activation=bend, padding=1, random_seed=3),
        Conv2d(reads=(4, 12, 12), n_filters=1, kernel_size=1, activation=Identity(), random_seed=4),
        Flatten(reads=(1, 12, 12)),
    ]

    def forward(block):
        responses = []
        for position, layer in enumerate(layers):
            if skip and position == 6:  # the join, repeated maps first
                block = np.concatenate([block, responses[0].outputs], axis=1)
            responses.append(layer.respond_to(block))
            block = responses[-1].outputs
        return responses

    for epoch in range(100):
        for first in range(0, 40, 8):
            responses = forward(pictures[first : first + 8])
            blame = loss.measure(responses[-1].outputs, targets[first : first + 8]).gradient
            for position in reversed(range(len(layers))):
                if skip and position == 0:  # the first convolution is owed both parts
                    blame = blame + across
                correction = layers[position].correction_for(responses[position], blame)
                blame = correction.passed_down
                if skip and position == 6:  # split in the order the join was built
                    blame, across = blame[:, :8], blame[:, 8:]
                layers[position] = layers[position].stepped_by(correction.gradient, 0.005)

    called, truth = forward(pictures[40:])[-1].outputs > 0, targets[40:] > 0
    overlap = np.mean((called & truth).sum(axis=1) / (called | truth).sum(axis=1))
    print(f"{'with the skip' if skip else 'without it'}: pixels right {np.mean(called == truth):.3f}, overlap {overlap:.3f}, pixels called shape {called.sum()}")
print(f"calling every pixel ground gets {np.mean(targets[40:] == 0):.3f} of pixels right")`,
              `with the skip: pixels right 1.000, overlap 1.000, pixels called shape 640
without it: pixels right 0.908, overlap 0.379, pixels called shape 554
calling every pixel ground gets 0.889 of pixels right`,
              { hints: [
  "Use the binary pixel labels for intersection and union, averaging the per-image ratios as specified.",
  "Most pixels are background. Compare the shape overlap with the accuracy baseline before judging a model."
], check: numberCheck("What share of the held-out pixels does the U without its skip get right, to three places?", 0.908, 0.01, "The no-skip model has pixel accuracy 0.908. Compare its overlap with the all-background baseline before treating that accuracy as a good segmentation."), question: "Can pixel accuracy conceal a poor shape mask?" },
            ),
          ],
        },
      ]}
    />
  );
}
