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
import { UNetArchitecture } from "@/components/widgets/UNetArchitecture";
import { UNetBaselineBoard } from "@/components/widgets/UNetBaselineBoard";
import { UNetExplorer } from "@/components/widgets/UNetExplorer";
import { UNetLargerPicture } from "@/components/widgets/UNetLargerPicture";
import { UNetTrainingCurves } from "@/components/widgets/UNetTrainingCurves";

export const metadata: Metadata = {
  title: "U-Net · oop_ml",
  description:
    "A network that shrinks a picture to work out what is in it and grows it back to say where, carrying the fine detail across on connections that skip the middle, measured with and without those connections.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function UNetPage() {
  return (
    <ConceptPage
      title="U-Net"
      tagline="A U-Net answers for every pixel of a picture by shrinking it to find what is there and growing it back to say where, and its skip connections carry the fine detail across the middle. Here it is built small enough to train in seconds and measured with and without them."
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
          on the same sixteen by sixteen pictures, and none of that is explained
          again. The loop that trains it is the one on{" "}
          <Link href="/concepts/training-a-network" className={link}>
            training a network
          </Link>
          , and Part 3 leans on the idea there that each layer works out its
          own share of the blame and hands the rest down.
        </>
      }
      history={
        <>
          <p>
            The problem this architecture was built for is labelling every
            pixel of a picture, and before 2015 the way to do it with a neural
            network was to ask a classifier the question once per pixel. Dan
            Cireşan, Alessandro Giusti, Luca Gambardella and J&uuml;rgen
            Schmidhuber at IDSIA in Lugano won the 2012 ISBI challenge on
            segmenting neuronal membranes in electron microscope stacks that
            way, in &ldquo;Deep Neural Networks Segment Neuronal Membranes in
            Electron Microscopy Images&rdquo; at NIPS 2012. A network read a
            window of pixels around one position and said whether that
            position was membrane, and then the window moved on by one pixel
            and the whole network ran again. It was slow, since neighbouring
            windows share almost all their pixels and every one was read
            afresh, and the size of the window set a trade that could not be
            escaped, since a wider window gave the network more context and
            also more pooling to throw away where exactly the membrane was.
          </p>
          <p>
            Jonathan Long, Evan Shelhamer and Trevor Darrell at Berkeley removed
            the repetition in &ldquo;Fully Convolutional Networks for Semantic
            Segmentation&rdquo; at CVPR 2015. They read a trained
            classifier&rsquo;s dense layers as convolutions, so a single pass
            over a whole picture answered a coarse grid of scores, grew that
            grid back to full size with a learned upsampling, and, finding the
            coarse answer blurred at every edge, added in scores computed from
            earlier layers that still had finer grids. Olaf Ronneberger,
            Philipp Fischer and Thomas Brox at Freiburg took that further in
            &ldquo;U-Net: Convolutional Networks for Biomedical Image
            Segmentation&rdquo; at MICCAI the same year. They made the way back
            up as deep as the way down, with as many channels, and at every
            depth they laid the encoder&rsquo;s maps alongside the decoder&rsquo;s
            rather than adding scores, so the decoder could use the detail
            however it liked. Their convolutions used no padding, so each map
            shrank a little and the encoder&rsquo;s maps had to be cropped to
            fit. They trained on the thirty annotated slices of that same ISBI
            electron microscope challenge, stretched by random elastic
            deformations, and won the ISBI cell tracking challenge of 2015. The
            drawing of the network in their paper is shaped like a U, and that
            is the whole of where the name came from.
          </p>
          <p>
            This page builds the smallest U that still shows the idea, on the
            pictures the convolutional networks page names, and asks six
            questions of it in order. Why a network that names a picture has
            nothing left to say where its shape is; what the U is made of and
            where its parameters go; how the blame is carried back through a
            join, since the layers used here are a chain and the joins have to
            be made outside them; what the skip connections buy, measured on
            held-out pictures with and without them and separately at the edge
            of each shape; how the U compares with simply cutting the
            brightness at a threshold, which on these pictures turns out to be
            better; and what it does with a kind of shape and a size of picture
            it never trained on, before the last Part asks where the method
            stops being defined.
          </p>
        </>
      }
      playground={<UNetExplorer />}
      sections={[
        {
          title: "Part 1. An Answer for Every Pixel",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The same pictures, a different question">
                <p>
                  Every picture here is one of the sixteen by sixteen pictures
                  from the convolutional networks page, a cross, a square
                  outline, a filled disc or a diagonal bar drawn at a random
                  place and size, brightness and background, with a little noise
                  on every pixel. That page asked which of the four kinds each
                  picture held. This one asks, for every one of its 256 pixels,
                  whether the pixel belongs to the shape. The answer is a
                  picture of its own, one yes or no per pixel, and every picture
                  in the collection is drawn with that answer attached, which is
                  called its mask. The box at the top of the page shows the
                  first held-out picture of each kind with its mask.
                </p>
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
                  <p>
                    The cross has 28 shape pixels. The network without skip
                    connections, at weight seed 0, calls 23 pixels shape, and 19
                    of those are truly shape. So the pixels in either set number
                    28 + 23 − 19 = 32, and the overlap is 19 ÷ 32 = 0.594. It
                    gets 243 of the 256 pixels right, which is 0.949, and the
                    thirteen it gets wrong are the nine shape pixels it missed
                    and the four ground pixels it called shape.
                  </p>
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
          ),
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
                <p>
                  At the bottom of the U one more convolution, eight filters of
                  three by three, reads the eight maps of four by four and
                  answers eight more of the same size. Each of its sixteen
                  positions stands for a block of four by four pixels of the
                  picture, and by the geometry the convolutional networks page
                  worked out, a number here can depend on a patch eighteen pixels
                  wide, wider than the picture itself. So the middle is the one
                  place where every number can take in a whole shape, and it is
                  also the place with the least idea where, to finer than four
                  pixels, anything is.
                </p>
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
                <p>
                  At each depth on the way up, the decoder takes the maps that
                  came up from below and the maps the encoder kept at the same
                  size, and lays them side by side as one block with more
                  channels. At half size eight repeated maps and the
                  encoder&rsquo;s eight make a block of sixteen, and at full size
                  eight and four make twelve. The convolution that follows reads
                  every channel through its three by three windows, so at every
                  position it sees both what the middle concluded and what the
                  encoder saw there at full resolution, and its weights decide
                  how to combine them.
                </p>
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
                  <p>
                    The pixel is shape, so its loss is the negative logarithm of
                    the probability of shape, and −log 0.5208 = 0.6524. The
                    network without skips called it shape by a margin of 0.02,
                    about as unsure as a coin, while the network with them is
                    sure.
                  </p>
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
          title: "Part 5. A Threshold Does Better Here",
          content: (
            <>
              <SubSection title="18. The obvious alternative, measured">
                <p>
                  Every picture in this collection is a dim background with a
                  brighter shape drawn on it, so the obvious way to find the
                  shape is to call every pixel brighter than some level shape.
                  I tried two versions. The first uses one level for every
                  picture, the one of 41 levels from 0.20 to 0.60 that got most
                  training pixels right, which was 0.41. The second chooses a
                  level for each picture from that picture alone, by Otsu&rsquo;s
                  rule of 1979, which tries every cut between two brightnesses
                  and keeps the one that splits the picture into two groups
                  whose means are furthest apart for their sizes.
                </p>
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
                <p>
                  The threshold wins because the pictures were drawn so that it
                  would. A shape pixel is its picture&rsquo;s background plus a
                  lift of at least 0.4, and the noise on each pixel has a spread
                  of 0.05, so within one picture the shape and the ground are two
                  groups of brightness with a gap between them, and splitting the
                  gap is the whole task. What the U-Net was invented for is the
                  case where that is not true, where a membrane in an electron
                  microscope picture is no brighter than the inside of the cell
                  beside it and the only way to tell them apart is the shape of
                  the surroundings. That case is not in this collection, and
                  building it would need pictures drawn some other way.
                </p>
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
                <p>
                  With the skips the rings come out almost as well as the kinds
                  it trained on. Its errors are ring pixels called ground, 20,
                  70 and 11 of the 2,257 at the three seeds, and it calls at most
                  2 of the 2,046 pixels inside the rings&rsquo; holes shape, so
                  it did not fill a ring in as if it were a disc. Without the
                  skips, at seed 0, it called 245 of those hole pixels shape and
                  missed 908 ring pixels, which in the box at the top of the page
                  looks like a smudge where a ring should be. The rings are the
                  last four pictures there.
                </p>
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
                <p>
                  There are three ways out, and each costs something. Pad the
                  picture up to the next side that halves evenly, which invents
                  pixels at the border that the network then has to answer for.
                  Crop the larger block down to the smaller, which is what the
                  paper did throughout, since its unpadded convolutions shrank
                  every map anyway, and which throws away the encoder&rsquo;s
                  outermost rows. Or resize the picture, which changes every
                  shape in it. Without the joins the question does not arise at
                  the joins, but it moves to the answer, which for a side of 30
                  comes out 28 wide and cannot be compared with a mask of 30.
                </p>
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
      ]}
    />
  );
}
