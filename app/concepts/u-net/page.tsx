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
  title: "U-Net · oop_ml",
  description:
    "Sometimes we need to know which pixels belong to an object, not just whether the object is present. U-Net learns from images paired with labelled masks and carries spatial detail forward to help reconstruct those boundaries.",
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
      playgroundIntro="Compare the predicted mask with the target pixel by pixel. Pay particular attention to boundaries and thin shapes when the skip connections are removed."
      title="U-Net"
      tagline={"Sometimes we need to know which pixels belong to an object, not just whether the object is present. U-Net learns from images paired with labelled masks and carries spatial detail forward to help reconstruct those boundaries."}
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
                  This one asks, for every one of its 256 pixels, whether the pixel belongs to the shape. The answer is a picture of its own, one yes or no per pixel, and every picture in the collection is drawn with that answer attached, which is called its mask. The box at the top of the page shows the first held-out picture of each kind with its mask.
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
                <p>
                  The last line is the trap in scoring this task by the share of
                  pixels right. Only about one pixel in nine belongs to a shape,
                  so a network that never calls anything a shape gets 0.889 of
                  pixels right while finding nothing at all, and two networks
                  that differ in whether they find the shape can differ by a few
                  hundredths on that score. So the page reports the share of
                  pixels right and always sets beside it a second score that a
                  network answering nothing cannot win, which section 3 defines.
                </p>
                <KeepInMind>
                  A per-pixel answer is 256 answers per picture, most of them
                  ground, and a score dominated by ground says little about
                  whether the shape was found.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a classifier keeps and what it throws away">
                <p>
                  The obvious start is the network that already names these
                  pictures, which gets 0.971 of the held-out kinds right. Its
                  first four layers keep the arrangement of the picture, since a
                  convolution answers at every position and a pooling halves the
                  maps without shuffling them. Then the flattening lays the last
                  maps out as a row of 128 numbers, the dense layers mix all of
                  them into sixteen and then four, and from that point on no
                  number stands for any place in the picture.
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
                  To see how little the kind alone says about where, I took the
                  kind the classifier calls each held-out picture, averaged the
                  masks of every training picture of that kind, and called a
                  pixel shape wherever that average was above one half. The same
                  was done with each picture&rsquo;s true kind, to be sure the
                  classifier&rsquo;s few mistakes were not the problem.
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
                  Knowing the kind exactly is worth an overlap of 0.080, since a
                  cross can be drawn anywhere and the average of crosses drawn
                  everywhere is a faint blur in the middle. What the classifier
                  learned to throw away, the position, is the whole of what this
                  task asks for.
                </p>
                <KeepInMind>
                  A classifier is built to give the same answer wherever the
                  shape is, so once it has flattened its maps there is nothing
                  left in it that could say where the shape was.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Scoring a mask, and the pixels at its edge">
                <p>
                  The second score counts only pixels that matter. Take the
                  pixels a network calls shape and the pixels that truly are,
                  count the pixels in both, and divide by the pixels in either.
                  A network that calls nothing scores zero, a network that calls
                  everything scores the shape&rsquo;s share of the picture, and
                  only an exact mask scores one. It is usually called the
                  intersection over union, and this page calls it the overlap
                  and averages it over pictures, so a thin square outline counts
                  as much as a large disc.
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
                  The third score is the claim this whole architecture is built
                  on. A pixel is on the edge if the pixel above, below, left or
                  right of it has the other label, which counts both the
                  shape&rsquo;s outermost pixels and the ground&rsquo;s innermost,
                  and the frame of the picture does not count as a change. Of
                  the 61,440 held-out pixels, 12,433 are on an edge and 49,007
                  are not, and on the cross above 52 are on an edge, of which the
                  network got 39 right.
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
                  What is different is what happens to the two convolutions&rsquo;
                  answers. In the classifier each is read by the pooling above it
                  and then forgotten. Here each is also kept, the four full-size
                  maps and the eight half-size maps, because the way back up is
                  going to need them.
                </p>
                <KeepInMind>
                  The encoder of a U-Net is an ordinary shrinking network, and
                  the only change to it is that two of its intermediate answers
                  are held on to.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The middle, where the picture is smallest">
                <>
<p>
                  At the bottom of the U one more convolution, eight filters of three by three, reads the eight maps of four by four and answers eight more of the same size. Each of its sixteen positions stands for a block of four by four pixels of the picture, and by the geometry the convolutional networks page worked out, a number here can depend on a patch eighteen pixels wide, wider than the picture itself.
                </p>
                <p>
                  So the middle is the one place where every number can take in a whole shape, and it is also the place with the least idea where, to finer than four pixels, anything is.
                </p>
</>
                <KeepInMind>
                  The middle knows the most about what is in the picture and the
                  least about where, and the two come together because every
                  pooling that widened what a number could see also spread the
                  numbers further apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The way back up, by repeating each value">
                <p>
                  To answer at every pixel the maps have to grow back to sixteen
                  by sixteen, and the cheapest way is to copy each value over a
                  two by two block, which doubles both sides. It has nothing to
                  learn. On the way back, each value was copied to four places,
                  so it reaches the loss by four routes and its slope is the
                  total of the four slopes that arrive there.
                </p>
                <Equation>{"up[2i + a, 2j + b]  =  x[i, j]      for a and b each 0 or 1"}</Equation>
                <Equation>{"slope at x[i, j]  =  sum over a, b of  slope at up[2i + a, 2j + b]"}</Equation>
                <WorkedExample title="A two by two map grown to four by four">
                  <p>
                    A map holding p and q in its top row and r and s below
                    becomes a four by four map whose top left block is four
                    copies of p, top right four copies of q, and so on. If the
                    blame arriving at the top left block is 0.1, 0.2, 0.3 and
                    0.4, then p is owed their sum, 1.0, since moving p by a small
                    amount moves all four copies by that amount together.
                  </p>
                </WorkedExample>
                <p>
                  The paper used a learned upsampling instead, a two by two
                  convolution run backwards that can learn how to spread each
                  value. Repetition is used here because it has no weights to
                  get wrong, and whatever detail it cannot put back has to come
                  from somewhere else, which is the point of the next section.
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
                  The joins cost 720 parameters, all of them in the two decoder
                  convolutions, which read more channels. The U with them holds
                  2,521 parameters, close to the classifier&rsquo;s 2,468, and
                  the U without them 1,801, so the comparison in Part 4 is not
                  between networks of equal size. It could not be, since the
                  channels a skip adds are what the decoder spends weights on.
                </p>
                <KeepInMind>
                  A skip connection adds no layer. It widens what one decoder
                  convolution reads, and its whole cost is the extra weights
                  that convolution needs for the extra channels.
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
                  The last layer is a convolution with one filter of one by one,
                  which gives each pixel a score from the four numbers the layer
                  below answered there. The score is squashed into a probability
                  of shape, and a pixel is called shape when that probability is
                  above one half. Training makes small the negative logarithm of
                  the probability each pixel gave its true answer, added over
                  every pixel and divided by the number of pictures.
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
                  Because the loss adds up 256 pixels for every picture, the
                  slope on a shared kernel weight is a sum over 256 positions,
                  and the step size has to be much smaller than the
                  classifier&rsquo;s. Both arrangements here are trained with a
                  step of 0.003 against the classifier&rsquo;s 0.1, for 20 passes
                  over the same 240 training pictures in shuffled batches of 16.
                </p>
                <KeepInMind>
                  A per-pixel loss is the classifier&rsquo;s yes-or-no loss
                  asked 256 times per picture, and the step has to shrink to
                  match or the first few steps push every pixel to ground.
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
              "A cross can be drawn anywhere, so the average of crosses drawn everywhere is a faint blur in the middle and names no position. Using the kind the classifier calls instead of the true one gives 0.081, so its few mistakes were not what held the score down. What the classifier learned to throw away, the position, is the whole of what this task asks for.",
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
              "Nothing in a join has weights. A join lays one block beside another, and the whole cost is the extra channels the following convolution has to read, which is why the U with skips holds 2,521 parameters against 1,801 without them.",
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
                <p>
                  The forward pass is the chain of layers with two extra moves.
                  After each encoder convolution its answer is kept, and just
                  before each decoder convolution the kept answer is laid
                  alongside what came up from below, the repeated maps first
                  and the encoder&rsquo;s after them. The order matters, because
                  the way back has to split the blame in the same order.
                </p>
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
                  and that is the fact the backward pass has to honour.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The backward walk, split and then added">
                <p>
                  Walking back, each layer works out its own correction from the
                  blame that arrives at its answer and hands down the blame for
                  what it read. At a decoder convolution that blame covers the
                  whole joined block, so it is split by channel in the order the
                  block was built. The part for the repeated maps goes on down
                  through the repetition to the layers below. The part for the
                  encoder&rsquo;s maps is held until the walk reaches that
                  encoder convolution from above, and there the two are added.
                </p>
                <Equation>{"blame at e2  =  blame down through the pooling  +  blame across the skip"}</Equation>
                <WhyThisWorks title="Why the two parts are added">
                  <p>
                    The encoder&rsquo;s answer e2 changes the loss by two
                    routes, one through the pooling and the middle and one
                    straight across into the decoder convolution. A small change
                    in one number of e2 moves the loss by its effect along the
                    first route plus its effect along the second, and the slope
                    of a sum is the sum of the slopes. It is the same reason the
                    repetition in section 6 adds the four blames arriving at the
                    four copies of one value, since in both cases one number was
                    used more than once.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Nothing in the join has weights, so the join&rsquo;s whole
                  backward pass is a split on the way into the decoder and an
                  addition on the way into the encoder.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Checked against a finite difference">
                <p>
                  A backward pass written by hand can be checked without trusting
                  any of it. Nudge one weight up by a millionth, measure the
                  loss, nudge it down by the same amount, measure again, and the
                  difference divided by two millionths is the slope. I did that
                  for twelve weights of every convolution in the untrained U
                  with skips at seed 0, on the first held-out picture of each
                  kind, and for twelve pixels of those pictures.
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
                  The walk agrees with the finite difference to within about two
                  hundred-millionths everywhere, which is what the rounding in a
                  nudge of a millionth allows. The last column is the mistake a
                  hand-written join invites. Leaving out the addition does not
                  touch the middle or the decoder, which are above the joins,
                  and it puts the two encoder convolutions wrong by 6.838 and
                  4.054 on slopes no larger than 9.505.
                </p>
                <KeepInMind>
                  A walk that forgets the skip&rsquo;s share still runs and still
                  trains, since the encoder receives the blame from the middle,
                  and only a check like this one says that its slopes are wrong.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. How much of the blame crosses the skip">
                <p>
                  The two parts added at each encoder convolution can be
                  measured separately. I took the length of each block of blame,
                  the square root of the sum of its squares, on the same four
                  pictures, before training and after it.
                </p>
                <NumberTable
                  headings={["length of the blame", "across the skip", "down through the pooling", "their sum"]}
                  rows={[
                    ["first convolution, before training", "1.861", "6.551", "6.921"],
                    ["first convolution, after training", "0.573", "0.587", "0.830"],
                    ["second convolution, before training", "5.333", "5.769", "7.873"],
                    ["second convolution, after training", "0.311", "0.520", "0.599"],
                  ]}
                  caption="The sum is shorter than the two lengths added because the two blocks point partly against each other."
                />
                <p>
                  Before training the first convolution hears mostly from the
                  middle, 6.551 against 1.861 across the skip. After twenty
                  passes the two routes carry about the same, 0.573 and 0.587,
                  so the full-size skip has become half of what shapes the first
                  filters. That is the second thing a skip connection does,
                  beside carrying detail forward. It gives the layers nearest
                  the picture a short route from the loss that passes through
                  two convolutions, where the route through the middle passes
                  through five.
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
                  To measure what the joins buy, the U is trained with them and
                  without them from the same seed, which draws the same starting
                  weights for the way down and the middle, so the only
                  difference is whether the decoder can read the encoder&rsquo;s
                  maps. After every pass I scored both on the 240 held-out
                  pictures.
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
                  With the skips the three seeds agree within 0.004 in overlap.
                  Without them they spread from 0.163 to 0.623, and the worst
                  of them gets 0.906 of pixels right, which is only 0.016 above
                  the 0.889 that calling everything ground gets. Every seed of the U with skips beats
                  every seed of the U without them by more than the spread of
                  either.
                </p>
                <KeepInMind>
                  The difference the skips make is larger than anything the
                  choice of starting weights does to either arrangement, and
                  the share of pixels right alone would have made the two look
                  much closer than they are.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where the errors are">
                <p>
                  The claim for skip connections is that they put the edges back,
                  so I counted the wrong pixels separately on the edges and
                  away from them.
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
                    The U without skips gets 3,130 held-out pixels wrong, and
                    3,007 of them are on an edge. It misses 1,760 shape pixels
                    and invents 1,370, close to as many of one as the other, so
                    its shapes come out about the right size and are off by a
                    pixel or so along most of their outline. The U with skips
                    gets 48 pixels wrong, 47 of them on an edge, and 45 of the
                    48 are shape pixels it missed.
                  </p>
                </InAModel>
                <p>
                  Away from the edges both do nearly as well as each other, and
                  the whole difference sits in the band a pixel wide on either
                  side of each shape&rsquo;s outline. That is what section 5
                  predicts, since the middle can place a shape to within about
                  four pixels and no closer, and the full-size skip is what
                  carries the one-pixel detail across.
                </p>
                <KeepInMind>
                  Here the textbook claim held in exactly the form it is made.
                  The skip connections changed almost nothing away from the
                  edges and raised the share of edge pixels right from between
                  0.62 and 0.76 to about 0.997.
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
                  In the box at the top of the page, choose the square outline
                  and switch the skips off. The probability map draws a soft ring
                  roughly where the square is, too thick and with rounded
                  corners, since a one-pixel line cannot be drawn from blocks of
                  four. With the skips it is the square. The diagonal bar is the
                  U with skips&rsquo; weakest kind at 0.977, since a stair of
                  two-pixel steps puts every one of its pixels on an edge.
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
              "It still runs and still trains, because the encoder goes on receiving the blame that comes down through the middle. Only a finite difference check said the slopes were wrong, by 6.838 and 4.054 at the two encoder convolutions on slopes no larger than 9.505. The middle and the decoder sit above the joins, so their slopes came out right either way, and the error is confined to the layers whose answers were read twice and credited once.",
            ),
            choice(
              "At seed 0 the U without skips gets 3,130 held-out pixels wrong. Where are they?",
              [
                "Nearly all on an edge, 3,007 of them, about as many shape pixels missed as invented",
                "Spread over edge pixels and other pixels in proportion to how many of each there are",
                "Mostly inside the shapes, since the middle cannot tell what kind a shape is",
                "Mostly in the ground far from any shape, which the coarse maps fill in",
              ],
              0,
              "It misses 1,760 shape pixels and invents 1,370, so its shapes come out about the right size and are off by a pixel or so along most of their outline. Away from the edges it gets 0.998 of pixels right, nearly as many as the U with skips, since the middle can place a shape to within about four pixels and no closer. The skips raised the share of edge pixels right from between 0.62 and 0.76 to about 0.997.",
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
              "It is the U with skips whose three seeds agree within 0.004; without them they spread from 0.163 to 0.623. And 0.906 of pixels right is only 0.016 above what answering ground everywhere gets, which is how little that score separates the two arrangements.",
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
              "A square outline here is one pixel thick, so every pixel of it is on an edge and nothing is left for the coarse route to get right. The filled disc has an inside and is its best kind; the diagonal bar is the weakest kind for the U with skips, at 0.977, which is a different question.",
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
                  Every picture in this collection is a dim background with a brighter shape drawn on it, so the obvious way to find the shape is to call every pixel brighter than some level shape. I tried two versions. The first uses one level for every picture, the one of 41 levels from 0.20 to 0.60 that got most training pixels right, which was 0.41.
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
                  The U with skips beats one fixed level, by about 0.01 in
                  overlap and on the edges too, and a fixed level has no way to
                  follow a picture whose background happens to be bright. It
                  loses to a level chosen per picture, which gets one pixel
                  wrong in 61,440. The U has 2,521 parameters, took twenty passes
                  over 240 pictures and their masks to train, and is beaten by a
                  rule with no parameters that has never seen a mask.
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
                  The threshold wins because the pictures were drawn so that it would. A shape pixel is its picture&rsquo;s background plus a lift of at least 0.4, and the noise on each pixel has a spread of 0.05, so within one picture the shape and the ground are two groups of brightness with a gap between them, and splitting the gap is the whole task.
                </p>
                <p>
                  What the U-Net was invented for is the case where that is not true, where a membrane in an electron microscope picture is no brighter than the inside of the cell beside it and the only way to tell them apart is the shape of the surroundings. That case is not in this collection, and building it would need pictures drawn some other way.
                </p>
</>
                <p>
                  So what this collection can show about a U-Net is the
                  architecture itself, the gap between having the skips and not,
                  and where that gap sits. It cannot show the architecture
                  earning its place, since on this task a rule with no
                  parameters already gets 61,439 of the 61,440 held-out pixels
                  right.
                </p>
                <KeepInMind>
                  Before a network is trained to answer every pixel, it is worth
                  measuring how much of the answer a rule on each
                  picture&rsquo;s brightness already gives, and here it gave all
                  but one pixel in 61,440.
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
                  The classifier on the convolutional networks page had no way to
                  answer a ring, since it could only share each picture among the
                  four kinds it knew, and it called most rings a square outline.
                  A U-Net is asked only which pixels are shape, so a kind it
                  never saw is a question it can still answer. I drew the same sixty rings that page used and scored
                  both arrangements on them.
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
                  A per-pixel answer built from local detail carries over to a
                  shape the network never saw far better than a classifier&rsquo;s
                  kind does, and the detail that carries it over is the detail
                  the skips bring across.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A picture twice the size">
                <p>
                  The classifier reads sixteen by sixteen and no other size,
                  because its dense layer has one weight per number of the
                  flattened row. The U has no dense layer. Every layer in it
                  reads its input window by window, so the same trained weights
                  can read a bigger picture, and I laid four held-out pictures
                  out two by two as one picture of 32 by 32 and handed it to the
                  U with skips at seed 0 without retraining anything.
                </p>
                <UNetLargerPicture />
                <p>
                  It gets all 1,024 pixels right, and its call at every pixel is
                  the same as when the four pictures were read apart, including
                  the pixels next to the seams, where a window now reads the
                  neighbouring picture instead of the zeros it saw at the frame
                  during training. On a picture with nothing drawn on it, an even
                  brightness of 0.15, it calls no pixel shape, and the largest
                  probability of shape it gives any pixel is 0.0044, where the
                  classifier called the same blank picture a diagonal bar.
                </p>
                <KeepInMind>
                  A network with no dense layer is defined for pictures of other
                  sizes, which is what the word fully convolutional means, and
                  in this U it held on a picture four times the area it was
                  trained on.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where the Method Stops Being Defined",
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
                  caption="With two poolings the joins are defined exactly when the side is divisible by four, and with d poolings when it is divisible by two to the power d."
                />
                <>
<p>
                  There are three ways out, and each costs something. Pad the picture up to the next side that halves evenly, which invents pixels at the border that the network then has to answer for. Crop the larger block down to the smaller, which is what the paper did throughout, since its unpadded convolutions shrank every map anyway, and which throws away the encoder&rsquo;s outermost rows.
                </p>
                <p>
                  Or resize the picture, which changes every shape in it. Without the joins the question does not arise at the joins, but it moves to the answer, which for a side of 30 comes out 28 wide and cannot be compared with a mask of 30.
                </p>
</>
                <KeepInMind>
                  A U-Net with d poolings is defined for sides divisible by two
                  to the power d, and every other side needs a decision about
                  which pixels to invent or throw away.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The cases where the method has no answer">
                <p>
                  Each of these is a fact about answering every pixel with a
                  shrinking and growing network, and each is a decision any
                  implementation of it faces.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "a picture with no shape in it", reason: "if the network also calls nothing, the overlap is zero pixels over zero pixels and is undefined. Counting it as one, leaving the picture out, or pooling the counts over all pictures before dividing are the three choices, and each gives a different average. The blank picture of section 21 is this case, and the U called nothing." },
                    { expression: "a picture with no shape, and a call of some", reason: "the overlap is zero whatever the size of the mistake, so one wrongly called pixel and a wrongly called half picture score the same." },
                    { expression: "a probability of exactly one half", reason: "the pixel is neither called shape nor ground by the rule until a side is chosen for the tie. It moves the scores only when it happens, which in floating point is rare." },
                    { expression: "a side not divisible by two to the power of the depth", reason: "the joins pair blocks of different sizes, which is undefined. Section 22 has the widths and the three ways out." },
                    { expression: "a shape touching the frame", reason: "a window at the frame reads the padding’s zeros, which are not pixels, so the network learned the frame as a dark border. A picture with a bright shape running off its edge asks it about a situation it was never shown. Every shape in this collection is drawn at least one pixel in from the frame." },
                    { expression: "two shapes touching", reason: "a mask says which pixels are shape and not which shape, so two touching shapes are one region in the answer. The paper met this with touching cells and weighted the loss heavily on the thin gaps between them, which is a change to the loss and not to the architecture." },
                    { expression: "blame split in another order than the join", reason: "if the forward pass lays the encoder’s maps first and the backward pass takes the first channels as the repeated ones, every slope in the encoder is computed for the wrong maps. Nothing about the arithmetic refuses it, and only a check like section 12 finds it." },
                    { expression: "detail finer than the smallest map, with no skip", reason: "repetition copies each value over a block, so without a skip the answer can place an edge only on the block grid, four pixels here. Nothing after the middle can put back what the poolings discarded unless something carries it around them." },
                  ]}
                />
                <KeepInMind>
                  Two of these fail silently, the join whose blame is split in
                  the wrong order and the picture whose overlap is zero over
                  zero, since in both the numbers keep coming and only a check
                  from outside says they mean nothing.
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
              "The pictures were drawn so that splitting the gap in brightness is the whole task, and a rule that splits it has nothing left to learn. The rule has never seen a mask, which is what makes it beating a trained network worth reporting rather than embarrassing.",
            ),
            trueFalse(
              "The U with skips, with its 2,521 trained parameters, gets fewer held-out pixels wrong than a brightness level chosen for each picture.",
              false,
              "The U gets 48 held-out pixels wrong and the level chosen per picture gets one wrong in 61,440, with no parameters and without ever seeing a mask. What the U does beat is one fixed level for every picture, by about 0.01 in overlap and on the edges too, since a fixed level has no way to follow a picture whose background happens to be bright.",
            ),
            several(
              "Which of these hold on the sixty rings, a kind neither arrangement trained on?",
              [
                "With the skips, the errors are ring pixels called ground",
                "With the skips, at most 2 of the 2,046 pixels inside the holes are called shape",
                "Without the skips, seed 0 called 245 of those hole pixels shape",
                "Both arrangements had to be retrained on rings before they could answer",
              ],
              [0, 1, 2],
              "A U-Net is asked only which pixels are shape, so a kind it never saw is still a question it can answer without retraining. The handful of hole pixels called shape is what says it did not simply fill a ring in as though it were a disc.",
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
              "A dense layer has one weight per number of the flattened row, which fixes the classifier at sixteen by sixteen and no other size. At the seams a window reads the neighbouring picture rather than the zeros it saw at the frame during training, and the call at every pixel came out the same as when the four were read apart.",
            ),
            several(
              "A picture whose side does not halve evenly breaks the join. Which of these are true of the ways out?",
              [
                "Cropping the larger block down is what the paper did, and it throws away the encoder’s outermost rows",
                "Padding up to the next side that halves evenly invents pixels at the border the network then has to answer for",
                "A U with two poolings is defined for sides divisible by four",
                "Without the joins the trouble moves to the answer, which for a side of 30 comes out 28 wide",
              ],
              [0, 1, 2, 3],
              "All four hold. A U with d poolings needs a side divisible by two to the power d, and every other side forces a decision about which pixels to invent or throw away. Dropping the joins does not remove the difficulty, since halving 30 twice and doubling back gives 28, and an answer 28 wide cannot be compared with a mask of 30. Resizing the picture is the third way out, and it changes every shape in it.",
            ),
        ],
        },
        {
          title: "Practice. Building and Walking a Small U With the Library",
          practice: [
            exercise(
              "Count the U with its skips, without them, and with one",
              ["Part 2 counts the U layer by layer and finds that a skip adds no layer, only channels for one decoder convolution to read. The starter builds the two convolutions of the way down and the middle for a sixteen by sixteen picture, three times over, with the number of channels each skip would add.", "Add the half-size decoder convolution, the full-size one and the one by one convolution that scores each pixel, then print every convolution’s parameter count and the total for each of the three arrangements. The page gives 2,521 with both skips and 1,801 with neither. The U with the full-size skip only is not on the page."],
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
              { hints: ["A decoder convolution reads the maps that came up from below with the encoder’s maps laid after them, so its reads is the eight repeated channels plus whatever the skip adds, at the size of that depth.", "A convolution keeps what it learns in kernels and bias_vector, and each has a size. The pooling and the repetition between these layers hold nothing, so the convolutions are the whole count.", "A one by one convolution needs no padding to answer at every pixel, so the score layer leaves the padding out."], check: numberCheck("How many parameters does the U hold with the full-size skip only?", 1945, 0.5, "A skip has no weights of its own. Its whole cost is the extra channels one decoder convolution reads, which takes the full-size decoder from 292 parameters to 436 and the half-size one from 584 to 1,160. With both the U holds the page’s 2,521 and with neither 1,801, so the two skips cost 144 and 576, the 720 of Part 2, and the full-size skip alone leaves the U at 1,945.") },
            ),
            exercise(
              "Grow a two by two map, and send the blame back",
              ["Part 2 grows a map by copying each value over a two by two block, and works the way back by hand on a map of four values. Build the repetition for one map of two by two, hand it the values 1, 2, 3 and 4, and print what it answers.", "Then send blame back. Put 0.1, 0.2, 0.3 and 0.4 on the top left block of the answer, which is the page’s example, and 1.0 on each of the four cells of the bottom right block, and print what the layer hands down to the four values and the gradient it reports for itself."],
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
              { hints: ["NearestUpsample2d takes the arrangement it reads as channels, height and width, and repeats by a factor of two unless told otherwise.", "A layer reads a block whose leading axis is rows, so one map goes in as small[None, None], and the response’s outputs come back arranged the same way.", "correction_for takes the response and the blame arriving at the answer. What it hands down is passed_down, arranged like what the layer read, and its gradient is what the layer would learn from."], check: numberCheck("What is the top left value owed?", 1.0, 0.05, "Moving the value moves all four of its copies together, so its slope is the total of the four slopes that arrive at them, the 1.0 Part 2 worked by hand. The bottom right value is owed 4.0 for the same reason, and the two values whose copies were blamed nothing are owed nothing. The gradient is None because a repetition has no weights, which is why Part 2 says it has nothing to get wrong.") },
            ),
            exercise(
              "Walk one join back by hand, and check it with a nudge",
              ["Part 3 carries the blame back through a join by splitting it in the order the block was built, and adding the skip’s share where the encoder’s answer was read twice. The starter builds the smallest U that has a join. One convolution on the way down whose answer is kept, a pooling, a middle convolution, a repetition, and a last convolution that reads the four repeated maps with the four kept ones laid after them and answers one score per pixel. It runs the forward walk three times, twice with one weight of the first convolution nudged a millionth up and down, and measures that weight’s slope from the two losses.", "Write the walk back from the last forward pass, which is the one with no nudge. Split the blame the last convolution hands down into the part for the repeated maps and the part for the kept ones, carry the first part down through the repetition, the middle and the pooling, and ask the first convolution for its correction twice, once from the two parts added and once from the part that came down alone. Print both slopes for the nudged weight beside the measured one, and the lengths of the two parts and of their sum."],
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
              { hints: ["Every layer’s correction_for takes that layer’s own response and the blame arriving at its answer, and its passed_down is the blame for what the layer read, which is what the layer beneath is handed next.", "The joined block was built with the repeated maps first and the kept maps after them, so the blame splits the same way, the first four channels for the repetition and the last four across the skip.", "A convolution’s gradient holds its kernel slopes flattened to one row per filter, so the weight at filter 0, channel 0, row 1, column 1 of a three by three kernel is entry 4 of row 0.", "The length of a block of blame is the square root of the sum of its squares, which np.linalg.norm gives for a block of any arrangement."], check: numberCheck("What slope does the walk give the nudged weight when the two parts are added, to four places?", 0.0897, 0.0005, "With the two parts added the walk gives 0.0897, the slope the nudge measured. Leaving the skip’s share out gives 0.4354, nearly five times too large, from a walk that ran without complaint, which is the mistake Part 3 says only a check like this one finds. The first convolution’s answer was read twice, by the pooling and by the last convolution across the join, so it is owed the slope from both uses. The sum of the two parts is shorter than their two lengths added because the two blocks point partly against each other.") },
            ),
            exercise(
              "Train a small U with its skip and without it",
              ["Part 4 trains the U twice, with the joins and without. This problem does the same on a collection small enough to train in a few seconds. Eighty pictures twelve pixels on a side, each holding a square outline five pixels across and one pixel thick, the kind the page found hardest without skips, lit at 0.6 on a ground of 0.1 with a little noise. The first forty train the network and the last forty are held out. The U has two poolings, a middle, one repetition by a factor of four and one full-size skip, and the starter trains it each way for 100 passes at a step size of 0.005, with the walk of Part 3 written as a loop.", "Write the scoring of Part 1 on the held-out forty. Call a pixel shape where its score is above zero, which is a probability above one half, and print the share of pixels right, the overlap averaged over pictures and how many pixels were called shape. After both arrangements, print what calling every pixel ground would get."],
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
              { hints: ["forward answers every layer’s response in order, so the scores are the outputs of the last one, a row of 144 per picture, and a score above zero is a call of shape.", "The overlap for one picture is the count of pixels both called and truly shape over the count of pixels either called or truly shape. With rows of True and False those are & and |, summed along each row, and the mean over the forty rows is the score.", "Every picture here holds sixteen shape pixels, so the pixels in either set are never none and the division is always defined, which Part 7 points out is not so for a picture with no shape in it.", "Calling every pixel ground is right exactly where the target is zero."], check: numberCheck("What share of the held-out pixels does the U without its skip get right, to three places?", 0.908, 0.01, "Without the skip the U gets 0.908 of pixels right, only 0.019 above the 0.889 that calling every pixel ground gets, while its overlap is 0.379 against 1.000 with the skip. A square outline covers sixteen of the 144 pixels, the same one in nine as the page’s collection, so the share of pixels right is dominated by ground here too and makes the two arrangements look far closer than they are. The outline is one pixel thick and the middle works on a grid four pixels wide, which is Part 4’s point that a one-pixel line cannot be drawn from blocks of four.") },
            ),
          ],
        },
      ]}
    />
  );
}
