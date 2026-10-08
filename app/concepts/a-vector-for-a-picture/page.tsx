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
import { PictureNeighbourPlayground } from "@/components/widgets/PictureNeighbourPlayground";
import { PictureSeedLedger } from "@/components/widgets/PictureSeedLedger";
import { PictureVectorEdges } from "@/components/widgets/PictureVectorEdges";
import { PictureVectorSphere } from "@/components/widgets/PictureVectorSphere";
import { PictureVectorWalk } from "@/components/widgets/PictureVectorWalk";

export const metadata: Metadata = {
  title: "A Vector for a Picture · oop_ml",
  description:
    "Two photographs of the same object may look very different pixel by pixel. A trained network can provide a compact vector of features that gives us a more useful way to compare them.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const caption = "text-sm text-slate-500 dark:text-slate-400";

export default function PictureVectorPage() {
  return (
    <ConceptPage
      lessonId="a-vector-for-a-picture"
      intuition={lessonIntuitions["a-vector-for-a-picture"]}
      technicalStart="Part 2. Reading A Vector Off A Network That Names"
      openingTitle="Pictures Can Look Alike Without Matching Pixel for Pixel"
      playgroundIntro="Compare the nearest pictures under pixel distance and embedding similarity. Inspect the actual pictures, including mistakes, rather than judging the representation only by its plotted clusters."
      title="A Vector for a Picture"
      tagline={"Two photographs of the same object may look very different pixel by pixel. A trained network can provide a compact vector of features that gives us a more useful way to compare them."}
      prerequisites={
        <>
          The network on this page is the one assembled on{" "}
          <Link href="/concepts/convolutional-networks" className={link}>
            convolutional networks
          </Link>{" "}
          and trained the way{" "}
          <Link href="/concepts/training-a-network" className={link}>
            training a network
          </Link>{" "}
          describes, and nearness is measured by the angle defined on{" "}
          <Link href="/concepts/distance-and-similarity" className={link}>
            distance and similarity
          </Link>
          . This is the picture counterpart of{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            a vector for a word
          </Link>
          , and several of its arguments are that page&rsquo;s arguments met
          again with pictures.
        </>
      }

      playground={<PictureNeighbourPlayground />}
      sections={[
        {
          title: "Part 1. Pixels Make A Poor Ruler",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Four kinds of picture, and a question about nearness">
                <p>
                  Every picture on this page is sixteen pixels on a side, with one brightness per pixel, and holds one of four shapes, a cross, the outline of a square, a filled disc or a diagonal bar. Each shape is drawn at a random position and a random size, against a random background, lifted by a random amount above that background, with a little noise on every pixel, so that no two crosses are alike and no single pixel gives a cross away.
                </p>
                <p>
                  We would like a way of saying that two crosses are near each other and a cross and a disc are not, and that turns out to be much harder to write down than it sounds.
                </p>
                <p>
                  The page asks six questions, in order. When two pictures are compared pixel by pixel, how often is a picture&rsquo;s nearest neighbour the same kind, and why does it miss? What is the vector a trained network gives a picture, and how is it read off? Where do pictures the network never saw land in that space, and is a picture&rsquo;s nearest neighbour there its own kind more often than its nearest by pixels?
                </p>
                <p>
                  Is that gathering something training did, or would an untrained network of the same shape do it too? Which layer of the network gives the best position? And where does a ring end up, a fifth kind the network was never shown?
                </p>
                <NumberTable
                  headings={["the collection", "on this page"]}
                  rows={[
                    ["side of one picture", "16 pixels, one brightness each"],
                    ["kinds the network is taught", "cross, square, disc, bar"],
                    ["pictures it learns from", "240, 60 of each kind"],
                    ["pictures held out", "240, 60 of each kind"],
                    ["background brightness", "between 0 and 0.3"],
                    ["shape lifted above it by", "between 0.4 and 0.7"],
                    ["a fifth kind, never taught", "ring, 60 drawn"],
                  ]}
                  caption="The pictures are drawn by arithmetic so the page can say exactly what is in them. The held-out half is where every nearness below is measured."
                />
                <KeepInMind>
                  Every number on this page is measured on the 240 held-out
                  pictures unless it says otherwise, and the question throughout
                  is whether a picture&rsquo;s nearest other picture is the same
                  kind as it.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Nearness by pixels, and how often it is right">
                <p>
                  The obvious way to compare two pictures is to lay one over the
                  other and add up how differently each pixel is lit. Two
                  pictures that agree everywhere score zero, and the more pixels
                  disagree, and the more they disagree by, the larger the score.
                  It needs no training and no idea of what a shape is, which is
                  its appeal.
                </p>
                <Equation>
                  {"distance(a, b) = √( Σₚ (aₚ − bₚ)² ),   p running over all 256 pixels"}
                </Equation>
                <p>
                  For each of the 240 held-out pictures, find the picture nearest it by that distance among the other 239, and ask whether it is the same kind. It is for 194 of them, a share of 0.8083, which is far better than the one in four a random choice would manage and is the number everything else on this page has to beat.
                </p>
                <p>
                  The 46 misses are not spread evenly. Of the 60 crosses, 11 have a disc as their nearest picture, and of the 60 squares, 7 have a bar and 6 a cross.
                </p>
                <WorkedExample title="One picture the pixels get wrong">
                  <p>
                    Held-out picture 2 is a disc. Its nearest picture by pixels
                    is a cross, at a distance of 1.9275, and the next is another
                    cross at 2.2680, so the nearest disc only comes third, at
                    2.3905. The playground at the top of the page opens on this
                    picture, and its button for a picture the pixels get wrong
                    steps through all 46 of them.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  By straight-line distance between pixels, a held-out
                  picture&rsquo;s nearest neighbour is its own kind for 194 of
                  the 240. That is the baseline, and it asks nothing of any
                  network.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What the pixels are actually comparing">
                <p>
                  A pixel distance gives two pictures credit only for being lit
                  in the same places. A cross and a disc drawn over the same
                  spot share a good many lit pixels and come out close, while
                  two crosses drawn a few pixels apart share almost none and
                  come out far. Every pixel also carries the background, so two
                  pictures with similar backgrounds look alike whatever is
                  drawn on them.
                </p>
                <p>
                  Comparing by angle rather than by distance does not help on its own. Every pixel of every picture sits above zero, so all 240 pictures point in roughly the same direction, and two pictures of one kind have a mean cosine of 0.5937 against 0.5799 for two of different kinds, a difference of 0.0138. The nearest-neighbour count by angle is 196.
                </p>
                <p>
                  Subtracting each picture&rsquo;s own mean brightness before comparing removes the shared lift, and the count rises to 212 of 240, a share of 0.8833, though the two mean cosines are then 0.1527 and 0.1181 and still barely apart.
                </p>
                <Equation>
                  {"cosine(a, b) = (a · b) / (‖a‖ ‖b‖)"}
                </Equation>
                <p>
                  What we would want is a comparison that ignores where the
                  shape sits, how big it is and how bright, and still notices
                  which shape it is. Nobody can write that comparison down pixel
                  by pixel, which is why the rest of the page lets a network
                  find one.
                </p>
                <KeepInMind>
                  Pixels by angle manage 196 of 240, and pixels less each
                  picture&rsquo;s own mean manage 212, the best any comparison of
                  raw pixels reached here. After the mean is removed, two
                  pictures of one kind are barely more alike than two of
                  different kinds, at 0.1527 against 0.1181.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Reading A Vector Off A Network That Names",
          content: (
            <>
              <SubSection title="4. A network trained only to name four kinds">
                <p>
                  The network is the one every picture page on the site shares.
                  It convolves the picture with four small filters and keeps the
                  largest value in each two by two block, does the same again
                  with eight filters, lays what is left out in one row of 128
                  numbers, passes those through a dense layer of 16, and ends in
                  four scores, one per kind. It learns from the 240 training
                  pictures for 40 passes, and the only thing its loss asks is
                  that each picture&rsquo;s own kind score highest.
                </p>
                <PictureVectorWalk view="layers" />
                <p className={caption}>
                  The network one step at a time. The highlighted row is the
                  layer this page reads a picture&rsquo;s vector from.
                </p>
                <p>
                  Of its 2,468 learned numbers, 2,064 belong to the dense layer
                  of 16. It names every training picture correctly and 0.9708 of
                  the held-out ones. That second figure moves with the starting
                  weights, and trained from two other weight seeds the same
                  design names 0.9208 and 0.9667 of the held-out pictures, so
                  where a claim below depends on training it is reported over all
                  three. The widgets draw the first seed, the one every picture
                  page calls the network, except where a table lays the three
                  side by side.
                </p>
                <KeepInMind>
                  A small convolutional network of 2,468 numbers, trained only to
                  name four kinds, names 0.9208 to 0.9708 of held-out pictures
                  correctly across three weight seeds.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Throw away the naming and keep the layer before it">
                <p>
                  The method is short enough to say in a sentence. Put a picture
                  through the trained network, stop one layer short of the
                  answer, and keep the sixteen numbers found there as the
                  picture&rsquo;s position. That list is the picture&rsquo;s
                  vector, or its embedding, and the last layer, which turned
                  those sixteen numbers into four scores, is simply not used.
                </p>
                <Equation>
                  {"v = tanh(W f + b)          f the 128 flattened numbers, W 16 × 128, b 16\nscores = U v + c           U 4 × 16, c 4"}
                </Equation>
                <p>
                  Each of the sixteen numbers is a hyperbolic tangent, so it lies
                  strictly between &minus;1 and 1, and the length of the whole
                  vector can never reach &radic;16, which is 4. The loss the
                  network was trained on is a statement about one picture at a
                  time and its label.
                </p>
                <Equation>
                  {"loss for one picture = − log( e^(score of its own kind) / Σₖ e^(scoreₖ) )"}
                </Equation>
                <p>
                  Nothing in that expression mentions a second picture. Whether
                  two pictures of the same kind end up with nearby vectors is a
                  question about an arrangement nobody specified, and it is the
                  claim on the card that led here, which Part 4 puts to a test.
                </p>
                <KeepInMind>
                  A picture&rsquo;s vector is the sixteen numbers of the layer
                  before the answer, each between &minus;1 and 1. The training
                  that produced them scored one picture at a time and never
                  compared two.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Four pictures taken all the way through">
                <p>
                  Here are the first held-out picture of each kind, each with
                  its sixteen numbers drawn as bars above and below zero. The
                  bars of a bar-shaped picture and of a square look nothing
                  alike, and nobody could say from them which bar stands for
                  what, which step 8 comes back to.
                </p>
                <PictureVectorWalk view="four" />
                <p className={caption}>
                  The four pictures, their vectors, and the two ways of comparing
                  them. The two grids hold the same six pairs, measured once by
                  the angle between vectors and once by the distance between
                  pixels.
                </p>
                <p>
                  Three of the four are named without doubt, the cross at a
                  probability of 0.9968, the square at 0.9842 and the bar at
                  0.9885. The disc is named a disc by a whisker, 0.5158 against
                  0.4678 for a cross, and it is the same held-out picture 2 whose
                  nearest picture by pixels was a cross. Its vector is 2.8774
                  long, where the square&rsquo;s is 3.6335.
                </p>
                <KeepInMind>
                  Taken all the way through, three of the four pictures are named
                  at 0.98 or above and the disc at 0.5158, which makes it the
                  hard picture of the four.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. One cosine worked by hand">
                <p>
                  The angle between two vectors is read from their dot product,
                  the sum of the products of matching numbers, divided by both
                  lengths. For the cross and the square every quantity is on the
                  widget above, so the whole calculation can be checked.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="what it is"
                  rows={[
                    {
                      expression: "cross · square = 3.2608",
                      reason: "the sixteen products of matching coordinates, added.",
                    },
                    {
                      expression: "‖cross‖ = 3.0017,  ‖square‖ = 3.6335",
                      reason: "each the square root of the sum of its own squared coordinates.",
                    },
                    {
                      expression: "3.2608 / (3.0017 × 3.6335) = 0.2990",
                      reason: "dividing by both lengths leaves the cosine of the angle between them, about 73 degrees.",
                    },
                  ]}
                />
                <p>
                  Among these four the nearest pair by angle is the cross and
                  the disc, at 0.4199, and the nearest pair by pixels is the same
                  two, at a distance of 4.0616. The square and the bar are the
                  farthest apart both ways, at &minus;0.3454 and 6.2299. Four
                  pictures are enough to check the arithmetic and far too few to
                  say anything about kinds, so the next Part asks the question of
                  all 240.
                </p>
                <KeepInMind>
                  <p>
                    The table gives the dot product and both vector lengths. Divide the
                    dot product by the product of the lengths.
                  </p>
                  <Equation>{"cosine(cross, square) ≈ 3.2608 / (3.0017 × 3.6335) ≈ 0.2990"}</Equation>
                </KeepInMind>
              </SubSection>

              <SubSection title="8. No one of the sixteen numbers means anything on its own">
                <p>
                  It is tempting to ask what the third of the sixteen numbers
                  measures, roundness perhaps, or how many corners there are.
                  The way to test that is to train the same design again from
                  different starting weights and see whether the third number
                  still does the same job. It does not, and neither does any
                  other, while which kind lands near which barely changes.
                </p>
                <PictureSeedLedger view="coordinates" />
                <p className={caption}>
                  Each row compares the reference network with one retrained from
                  another weight seed, on the same 240 held-out pictures.
                </p>
                <p>
                  The same picture&rsquo;s vector under the reference network and under seed 1 has a mean cosine of &minus;0.1387, and under seed 2 of 0.0187, so on average one picture&rsquo;s two vectors are at right angles. The nearest picture is the same picture under both networks for only 40 and 45 of the 240, yet the nearest picture is the same kind under both for 225 and 230.
                </p>
                <p>
                  This is the finding the word page makes by turning its whole table, met here with the network retrained instead, and it has the same consequence, since only comparisons between vectors from one network carry anything.
                </p>
                <KeepInMind>
                  Two trainings of one design give one picture vectors whose mean
                  cosine is &minus;0.1387 and 0.0187, and still agree about the
                  kind of its nearest neighbour for 225 and 230 of 240 pictures.
                  A coordinate is a bookkeeping entry of one training.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Comparing two pictures by the angle between them rather than by the distance between them is enough to stop the shared background dominating.",
              false,
              "Every pixel of every picture sits above zero, so all 240 pictures point in roughly the same direction and the angle barely separates them, a mean cosine of 0.5937 within a kind against 0.5799 across. It lifts the count from 194 to 196. What does help is subtracting each picture’s own mean brightness first, which takes the count to 212.",
            ),
            choice(
              "Which comparison of raw pixels found its own kind most often on the 240 held-out pictures?",
              [
                "Straight-line distance between the pixels",
                "The angle between the pictures",
                "The angle after each picture’s own mean brightness is subtracted",
                "The angle between the pictures after each is scaled to length one",
              ],
              2,
              "Removing each picture’s own mean takes the count to 212 of 240, the best any comparison of raw pixels reached here, against 194 for plain distance and 196 for the angle. Scaling to length one is what the cosine already does, so it is the same comparison as the angle and the same 196. Even with the mean removed the two mean cosines, 0.1527 within a kind and 0.1181 across, are barely apart, which is why the rest of the page lets a network find a better comparison.",
            ),
            trueFalse(
              "Nothing in the loss the network was trained on mentions a second picture, so pictures of one kind ending up with nearby vectors was never asked for by name.",
              true,
              "The loss for one picture is the negative log of the share of the softmax its own kind receives, a statement about that picture and its own label alone. Whether pictures of one kind end up near each other is therefore a question about an arrangement nobody specified, which is what Part 4 puts to a test, and the answer there is that training did it anyway.",
            ),
            choice(
              "Why can a picture’s vector on this network never be as long as 4?",
              [
                "The vectors are scaled to length one before anything is measured",
                "Each of the sixteen numbers is a hyperbolic tangent, so it lies strictly between −1 and 1",
                "The dense layer holds 2,064 of the network’s 2,468 learned numbers",
                "The four scores on top of the vector have to add to one",
              ],
              1,
              "Sixteen numbers each below 1 in size cannot make a vector as long as √16, which is 4. The scaling to length one happens later and only for the drawing, and the scores are a separate layer that is not used at all when a vector is read off.",
            ),
            trueFalse(
              "Retraining the same design from a different starting seed leaves each of the sixteen numbers measuring the same thing it measured before.",
              false,
              "One picture’s vector under the reference network and under seed 1 has a mean cosine of −0.1387, and under seed 2 of 0.0187, so on average the same picture’s two vectors are at right angles. What survives retraining is which kind lands near which, since the nearest picture is the same kind under both networks for 225 and 230 of the 240. A coordinate is a bookkeeping entry of one training.",
            ),
        ],
        },
        {
          title: "Part 3. Where The Held-Out Pictures Land",
          content: (
            <>
              <SubSection title="9. Sixteen numbers, drawn as a turning sphere">
                <p>
                  Sixteen numbers cannot be drawn, so the drawing below takes
                  three liberties and says so. Every vector is first scaled to
                  length one, since the angle is what we are comparing and the
                  length plays no part in it. The 240 directions are then
                  projected onto the three directions along which they spread
                  most, and each projected point is pushed back out onto the
                  sphere.
                </p>
                <PictureVectorSphere />
                <p className={caption}>
                  Every held-out picture as a dot, coloured by its kind. The four
                  kinds sit in four separate patches of the sphere, and the
                  drawing keeps 81.1% of the spread of the directions.
                </p>
                <p>
                  The figures under the drawing are measured on all sixteen
                  numbers, not on the three drawn. Two pictures of one kind have
                  a mean cosine of 0.7588, an angle of about 41 degrees, and two
                  pictures of different kinds 0.0022, which is almost exactly a
                  right angle. For raw pixels the same two figures were 0.5937
                  and 0.5799.
                </p>
                <KeepInMind>
                  In the network&rsquo;s sixteen numbers, pictures of one kind
                  are about 41 degrees apart on average and pictures of different
                  kinds about 90. The drawing keeps 81.1% of the spread, so the
                  four patches it shows are really there.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. A picture’s nearest neighbour, by vector and by pixels">
                <p>
                  The question from Part 1 can now be asked of the vectors. For
                  each held-out picture, find the picture whose vector makes the
                  smallest angle with its own, and ask whether it is the same
                  kind. This is a one-neighbour vote in the sense of{" "}
                  <Link href="/concepts/k-nearest-neighbours" className={link}>
                    k-nearest neighbours
                  </Link>
                  , scored with each picture left out of its own search.
                </p>
                <Equation>
                  {"share = (1/240) Σᵢ [ kind of the nearest other picture to i = kind of i ]"}
                </Equation>
                <PictureSeedLedger view="pixels" />
                <p className={caption}>
                  The three pixel rows do not depend on any network and so read
                  the same under every seed. The last row is the vector.
                </p>
                <p>
                  By the vector, a picture&rsquo;s nearest neighbour is its own
                  kind for 233 of 240 under the reference network, and for 230
                  and 235 under the other two seeds, against 194 by pixel
                  distance and 212 for the best pixel comparison. Of the 46
                  pictures the pixels get wrong, the vector gets 43 right.
                  Measuring the vectors by straight-line distance rather than by
                  angle gives 233 on the reference network too, so on this
                  network the choice between the two readings of near makes no
                  difference to the count.
                </p>
                <KeepInMind>
                  A picture&rsquo;s nearest neighbour by vector is its own kind
                  for 230 to 235 of 240 across three seeds, where the pixels
                  manage 194. The improvement holds on every seed.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The seven the vector still gets wrong">
                <p>
                  A count hides which pictures go wrong, and the answer is
                  informative. Laid out as a table of each kind against the kind
                  of its nearest neighbour, the pixels spread their mistakes over
                  every pair, and five of the vector&rsquo;s seven fall between
                  a disc and a cross.
                </p>
                <PictureSeedLedger view="confusion" />
                <p className={caption}>
                  Each row is a kind, and each cell counts the pictures of that
                  kind whose nearest neighbour was of the column&rsquo;s kind. The
                  diagonal is right and everything tinted is a mistake.
                </p>
                <p>
                  On the reference network all 60 squares find a square, and 59
                  of 60 bars find a bar. Three discs have a cross as their
                  nearest neighbour and two crosses a disc, and the remaining two
                  mistakes are a cross beside a square and a bar beside a disc.
                  Crosses and discs are the pair both tables mix most, 11 and 9
                  times by pixels and 2 and 3 times by the vector, and the disc
                  of step 6, which the network itself only just named a disc, is
                  one of the three.
                </p>
                <KeepInMind>
                  The vector&rsquo;s seven mistakes on the reference network fall
                  mostly between crosses and discs, the pair the pixels confuse
                  most as well, and the worst of them is a picture the network was
                  unsure how to name.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the vector costs">
                <p>
                  The vector is shorter than the picture, sixteen numbers where
                  the picture has 256, so holding it and comparing it are
                  cheaper. Making it is not. Every picture has to go through the
                  two convolutions and the dense layer first, and the network has
                  to be trained before the first picture can be given a vector at
                  all.
                </p>
                <NumberTable
                  headings={["", "by pixels", "by the vector"]}
                  rows={[
                    ["numbers kept per picture", "256", "16"],
                    ["numbers kept for 240 pictures", "61,440", "3,840"],
                    ["multiplications to compare two pictures", "256", "16"],
                    ["multiplications to make one picture’s vector", "none", "29,696"],
                    ["before the first comparison", "nothing", "40 passes over 240 pictures"],
                    ["held-out pictures whose nearest is their kind", "194", "233"],
                  ]}
                  caption="The multiplications to make a vector are counted from the layer shapes in step 4."
                />
                <>
                  <p>
                    The multiplication count comes from the positions, filters and
                    weights used at each stage. Count one new picture first.
                  </p>
                  <Equation>{"first convolution  = 16 × 16 × 4 × 9 = 9,216\nsecond convolution = 8 × 8 × 8 × 36 = 18,432\ndense layer        = 128 × 16 = 2,048\ntotal              = 9,216 + 18,432 + 2,048 = 29,696\ntwo new pictures   = 2 × 29,696 = 59,392"}</Equation>
                  <p>
                    Producing the two vectors already costs more than the 256
                    multiplications needed for a pixel comparison. A vector can repay
                    that cost when a picture is compared many times, because it is
                    computed once and kept.
                  </p>
                  <p>That is the setting in <Link href="/concepts/searching-a-collection-of-pictures" className="underline">searching a collection of pictures</Link>.</p>
                </>
                <KeepInMind>
                  A vector costs 29,696 multiplications to make and a trained
                  network before that, and then 16 multiplications per
                  comparison against the pixels&rsquo; 256. It is the cheaper
                  choice only when pictures are compared many times.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Did Anyone Ask For This?",
          content: (
            <>
              <SubSection title="13. What the naming asked for">
                <p>
                  The card this page sits under says pictures of one kind land
                  near each other without anyone having asked for that. It is
                  worth being exact about what was asked. The loss asked that
                  each picture&rsquo;s own score come out highest, and the scores
                  are one flat layer on top of the sixteen numbers, so to satisfy
                  it the sixteen numbers had to be arranged so that a flat cut
                  can separate each kind from the others.
                </p>
                <p>
                  That is a demand about the arrangement, though it is weaker
                  than nearness. Kinds can sit on the right sides of flat cuts
                  and still be long and spread out, so that a picture&rsquo;s
                  nearest neighbour lies across a cut. There is also a second
                  explanation to rule out, which is that convolution and pooling
                  gather pictures of one kind by their construction, whatever the
                  weights, in which case training would deserve little of the
                  credit.
                </p>
                <WhyThisWorks title="Why separable does not mean near">
                  <p>
                    Picture two kinds as two long thin clouds lying side by side and a flat cut running between them. Every point of each cloud is on its own side, so a flat layer names them all correctly. Yet a point at the far end of one cloud can be much nearer the facing point of the other cloud than any point of its own, so its nearest neighbour is the wrong kind.
                  </p>
                  <p>
                    Separability constrains which side of a cut a picture is on, and nearness depends on the whole shape of each kind, which the loss never mentions.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The loss asked for kinds that a flat cut can separate, which
                  does not by itself make them near. And the gathering might owe
                  more to the design of the network than to its training, which
                  is the thing to test next.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The same network, never trained">
                <p>
                  The control is the same design with its starting weights, the
                  very numbers training began from, and nothing learned. It is
                  given the same held-out pictures, its sixteen numbers are read
                  off the same layer, and the same questions are asked of them.
                </p>
                <PictureVectorSphere initialNetwork="untrained" />
                <p className={caption}>
                  The untrained network&rsquo;s vectors, drawn the same way. The
                  kinds are smeared across one region of the sphere, and the
                  switch above the drawing puts the trained network back for
                  comparison.
                </p>
                <p>
                  Untrained, the network names 0.2125 of the held-out pictures
                  correctly, a little under the one in four a guess would get. By
                  its sixteen numbers, a picture&rsquo;s nearest neighbour is its
                  own kind for 189 of 240, and under the other two seeds for 180
                  and 186, which is below the 194 the raw pixels managed on every
                  seed. Its pictures all point nearly the same way, at a mean
                  cosine of 0.7394 within a kind and 0.7325 across kinds.
                </p>
                <KeepInMind>
                  An untrained network of the same design gathers the kinds worse
                  than the raw pixels do, 180 to 189 of 240 against 194, and puts
                  pictures of one kind barely nearer than pictures of two.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Random convolutions are not nothing">
                <p>
                  The untrained network is not useless everywhere, though, and
                  the place it is useful is the place Jarrett and Saxe pointed
                  at. Reading the untrained network one layer earlier, at the 128
                  numbers the convolutions and poolings hand on, gives a nearest
                  neighbour of the right kind more often than the raw pixels do.
                </p>
                <PictureSeedLedger view="control" />
                <p className={caption}>
                  The first table counts nearest neighbours of the right kind,
                  and the second puts the mean cosine within a kind beside the
                  mean cosine across kinds.
                </p>
                <p>
                  The untrained 128 find their own kind for 201, 206 and 208 of
                  240 across the three seeds, above the 194 of pixel distance on
                  every seed and below the 212 of pixels less their mean. A random
                  filter bank followed by keeping the largest value in each
                  block already discards some of where a shape sits. Then the
                  untrained dense layer squeezes those 128 numbers into sixteen
                  through random weights and loses some of what was kept, 201
                  falling to 189 on the reference seed.
                </p>
                <KeepInMind>
                  Random convolutions and pooling on their own lift the count
                  above raw pixels, to 201 to 208 of 240. It is the dense layer of
                  sixteen that needs training, since untrained it makes things
                  worse.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What training added">
                <p>
                  Setting the two networks side by side answers the question.
                  Training took the sixteen numbers from 189 pictures with a
                  nearest neighbour of their own kind to 233 on the reference
                  seed, from 180 to 230 and from 186 to 235 on the other two. It
                  also opened the gap between the mean cosine within a kind and
                  across kinds from 0.0069 to 0.7566.
                </p>
                <p>
                  So the card&rsquo;s claim holds, with one qualification. The
                  gathering is the work of training, since the untrained design
                  gathers worse than pixels. Nobody asked for it by name, since
                  the loss never compared two pictures. What the loss did ask
                  for, kinds a flat cut can separate, is close enough to the
                  gathering that on four kinds this distinct the one brought the
                  other along with it, and step 13 is the reason to expect that
                  to fail on kinds that are harder to tell apart.
                </p>
                <KeepInMind>
                  Training did the gathering, lifting the count from 180 to 189
                  of 240 untrained to 230 to 235 trained, on the same design and
                  the same starting weights. The loss asked only for kinds a flat
                  cut could separate, and on these four kinds nearness came with
                  it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "The mean cosines quoted beneath the sphere drawing, 0.7588 within a kind and 0.0022 across, are measured on all sixteen numbers rather than on the three directions drawn.",
              true,
              "The drawing takes three liberties and says so, scaling every vector to length one, projecting onto the three directions of widest spread and pushing the points back onto the sphere. The figures under it come from the full sixteen numbers, where two pictures of one kind sit about 41 degrees apart and two of different kinds almost exactly at a right angle. The drawing keeps 81.1% of the spread, which is why the four patches it shows are really there.",
            ),
            choice(
              "By the vector, a held-out picture’s nearest neighbour is its own kind for how many of the 240 on the reference network?",
              ["233", "194", "212", "240"],
              0,
              "The vector manages 233 on the reference network and 230 and 235 on the other two seeds, against 194 for pixel distance and 212 for the best comparison of raw pixels. Of the 46 pictures the pixels get wrong, the vector gets 43 right, and five of its own seven mistakes fall between crosses and discs, the pair the pixels confuse most as well.",
            ),
            trueFalse(
              "Since a vector is sixteen numbers where a picture is 256, comparing pictures by vector is the cheaper choice whenever it is available.",
              false,
              "Holding and comparing a vector is cheaper, at 16 multiplications against 256, but making one costs 29,696 multiplications and a trained network before that. Producing the two vectors for a single comparison already costs more than the comparison by pixels, so a vector repays itself only when a picture is compared many times.",
            ),
            several(
              "Which of these hold of the untrained network of the same design?",
              [
                "It names 0.2125 of the held-out pictures correctly, a little under what a guess would get",
                "Its sixteen numbers find their own kind less often than straight-line pixel distance does",
                "Its 128 numbers before the dense layer find their own kind more often than straight-line pixel distance does",
                "Its 128 numbers before the dense layer beat every comparison of raw pixels",
              ],
              [0, 1, 2],
              "Untrained, the sixteen gather 189, 180 and 186 of 240 across the three seeds, below the 194 that pixel distance manages on every seed, which is why the gathering is credited to training, which took the count to 233, 230 and 235 and opened the gap between the mean cosine within a kind and across kinds from 0.0069 to 0.7566. Read one layer earlier the same untrained network reaches 201, 206 and 208, above pixel distance but below the 212 of pixels less their own mean, so beating every comparison of raw pixels overstates it.",
            ),
            trueFalse(
              "Kinds that a flat cut separates can still be long and spread out, so that a picture’s nearest neighbour lies across the cut.",
              true,
              "Separability constrains which side of a cut a picture falls on and says nothing about the shape of each kind. Picture two long thin clouds lying side by side with a cut between them. Every point is named correctly, yet a point at the far end of one cloud can be nearer the facing point of the other than any point of its own. That is why a loss asking only for separable kinds does not by itself make them near, and why Part 4 had to measure whether nearness came anyway.",
            ),
        ],
        },
        {
          title: "Part 5. Which Layer Makes The Best Vector",
          content: (
            <>
              <SubSection title="17. Three places a vector could be read">
                <p>
                  The method reads the layer before the answer, but the network
                  offers two other rows of numbers a picture could be given. One
                  is the 128 numbers the convolutions hand on before the dense
                  layer, and the other is the four scores themselves. The usual
                  advice is that the layer before the answer is the right one,
                  and the way to check that is to measure all three with the same
                  question.
                </p>
                <PictureSeedLedger view="layers" />
                <p className={caption}>
                  The same trained network read at three depths, over three
                  weight seeds.
                </p>
                <p>
                  By nearest neighbour the flattened 128 find their own kind for
                  231, 234 and 237 of 240, the sixteen for 233, 230 and 235, and
                  the four scores for 229, 219 and 230. The flattened layer beats
                  the sixteen on two seeds of the three and loses on the
                  reference seed, so the preference for the layer before the
                  answer did not show up here as a clear win on this count. The
                  four scores come last on every seed.
                </p>
                <KeepInMind>
                  By nearest neighbour, the flattened 128 and the sixteen are
                  within a few pictures of each other and trade places between
                  seeds, and the four scores are the worst of the three every
                  time.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. By margin, the layer of sixteen is the clearest">
                <p>
                  A nearest-neighbour count only asks whether the single closest
                  picture is right. The mean cosine within a kind against across
                  kinds asks how far apart the kinds sit as a whole, and on that
                  question the three layers separate cleanly.
                </p>
                <NumberTable
                  headings={["layer, reference seed", "within a kind", "across kinds", "gap"]}
                  rows={[
                    ["flattened, 128 numbers", "0.5143", "0.4062", "0.1081"],
                    ["hidden layer, 16 numbers", "0.7588", "0.0022", "0.7566"],
                    ["scores, 4 numbers", "0.8757", "−0.1755", "1.0512"],
                  ]}
                  caption="Mean cosines over the 240 held-out pictures. The table above gives the same figures for all three seeds."
                />
                <p>
                  The flattened layer barely separates the kinds on average, since its gap is 0.1081, and it wins on nearest neighbour only because the single nearest picture is still usually right. The sixteen open a gap seven times as wide with an eighth as many numbers. The four scores open the widest gap of all and still have the worst count, because four numbers leave room only for four directions, and within a kind there is little left to rank pictures by, so a picture between two kinds finds its nearest neighbour almost by chance.
                </p>
                <p>
                  Four scores also have no room for a kind they were not trained to score, which is the next Part&rsquo;s subject.
                </p>
                <KeepInMind>
                  The layer of sixteen separates the kinds by a mean-cosine gap of
                  0.7566, where the flattened layer manages 0.1081. That is the
                  argument for reading it, and it is an argument about margin, not
                  about the nearest-neighbour count.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. A Kind The Network Was Never Shown",
          content: (
            <>
              <SubSection title="19. What the network calls a ring">
                <p>
                  A ring is a round outline, drawn the same way as the four other
                  kinds, and no training picture was ever a ring. Put through the
                  network, a ring still has to be named one of the four kinds,
                  because four scores are all the network has, and it names most
                  of them squares, the other outline.
                </p>
                <p>
                  Of 60 rings, the reference network names 48 squares, 9 crosses
                  and 3 discs. The seed 1 network names 38 squares and 19
                  crosses, and seed 2 names 37 squares, 13 crosses, 7 discs and 3
                  bars. Nothing in the answer marks it as a guess. Ring 0 is named
                  a square at a probability of 0.9371, close to the 0.9842 the
                  network gave the real square of step 6, and switching the
                  playground to rings shows the same for most of the others.
                </p>
                <KeepInMind>
                  The network names 37 to 48 of 60 rings squares across three
                  seeds, often with high confidence, since naming has no way to
                  answer that a picture is none of the four.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Do rings gather?">
                <p>
                  The more interesting question is about positions rather than
                  names. If the vector describes pictures and not only which
                  label to give them, rings ought to land near each other even
                  though nothing ever called them anything. To test that, the 60
                  rings are added to the 240 held-out pictures, and each
                  ring&rsquo;s nearest neighbour among the other 299 is found.
                </p>
                <PictureVectorSphere initialRings />
                <p className={caption}>
                  The rings are the hollow dots, placed with the same projection
                  as the four kinds, which was fitted without them. Most of them
                  sit together, beside and partly inside the squares.
                </p>
                <p>
                  They mostly do. On the reference network 44 of the 60 rings
                  have another ring as their nearest neighbour, and 45 and 43
                  under the other two seeds. On the reference network 15 of the
                  other 16 find a square. The mean cosine from a ring to another
                  ring is 0.7388 and from a ring to a square 0.7294, so a ring is
                  nearly as close to the squares as to other rings. Under seed 2
                  it is the other way round, 0.5088 to other rings against
                  0.5527 to squares.
                </p>
                <KeepInMind>
                  Rings find another ring as their nearest neighbour 43 to 45
                  times in 60, so they do gather, though on average a ring sits
                  about as near the squares as it does the other rings.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Here the pixels do better, and the earlier layer best of all">
                <p>
                  This is the place where the method loses to the obvious
                  alternative, and it is worth stating plainly. Comparing rings
                  by their raw pixels, 46 of 60 have another ring as nearest
                  neighbour, more than the vector manages on any of the three
                  seeds. The reason shows up when every layer is asked the same
                  question.
                </p>
                <PictureSeedLedger view="rings" />
                <p className={caption}>
                  How many of 60 rings find another ring, read at each layer and
                  from the pixels, then what the network names them and how near
                  they sit to each kind.
                </p>
                <p>
                  The flattened 128 gather 50, 55 and 55 rings across the seeds, the sixteen 44, 45 and 43, and the four scores 41, 32 and 29. Pixels less their own mean gather 50. So the deeper the layer, the fewer rings find each other, and the layer this page reads the vector from sits in the middle.
                </p>
                <p>
                  The reading I take from that is that everything after the convolutions was trained to keep what helps name four kinds and to drop the rest, and what tells a ring from a square was never any help in naming four kinds, so each later layer holds less of it.
                </p>
                <KeepInMind>
                  For a kind no training named, the vector of sixteen gathers 43
                  to 45 rings of 60 against 46 for raw pixels and 50 to 55 for
                  the flattened layer, so the layer with the widest gap between
                  the four trained kinds gathers the rings less well than the one
                  below it on every seed.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where A Picture’s Vector Stops Being Meaningful",
          content: (
            <>
              <SubSection title="22. What a length is, and what the angle throws away">
                <p>
                  Comparing by angle divides each vector by its length, so
                  whatever the length carried plays no part in any nearness on
                  this page. On this network the length has a ceiling, since
                  sixteen numbers each below 1 in size cannot make a vector as
                  long as 4, and many of the numbers sit close to that ceiling.
                </p>
                <PictureVectorEdges view="lengths" />
                <p className={caption}>
                  Lengths of the 240 held-out vectors, and how often a nearest
                  neighbour is the right kind under each reading of near.
                </p>
                <p>
                  Held-out vectors run from 1.4867 to 3.9429 in length with a mean of 2.9769, and 0.2437 of all their coordinates are beyond 0.95 in size. The length correlates with the probability the network gives its top kind at 0.4355, so it carries some of the network&rsquo;s confidence, and dividing it out discards that. Here nothing turns on it, since the count is 233 of 240 by angle and by distance alike.
                </p>
                <p>
                  The angle has one gap of its own, which is that a vector of length zero has no direction. With a hyperbolic tangent layer that needs all sixteen inputs to be exactly zero, which essentially never happens, but a layer of rectified units puts every picture that lights none of its units exactly at zero, and there the angle does not exist.
                </p>
                <KeepInMind>
                  A vector&rsquo;s length here is between 1.4867 and 3.9429 and
                  tracks confidence at a correlation of 0.4355. The angle
                  discards it, and at the origin the angle is undefined.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A picture holding nothing">
                <p>
                  A picture with no shape in it still gets a vector, because the
                  network always answers. The question is what that vector
                  means, and the measurement says it means very little.
                </p>
                <PictureVectorEdges view="blank" />
                <p className={caption}>
                  Four pictures with nothing drawn in them, at four flat
                  brightnesses, and where each lands.
                </p>
                <p>
                  An all-black picture and a flat one at 0.15 light none of the first convolution&rsquo;s 1,024 numbers, so nothing of either picture gets past the first layer, and the two receive exactly the same vector, at a cosine of 1.0000. That vector depends on nothing but the network&rsquo;s own biases carried through its weights, and it is named a bar at a probability of 0.8921, with a mean cosine of 0.7629 to the held-out bars.
                </p>
                <p>
                  A flat picture at 0.3, the brightest background training ever drew, lights 464 of the 1,024 and is still named a bar, at 0.9324. So an empty picture has a position and a name, and both come from the biases rather than from anything in the picture.
                </p>
                <KeepInMind>
                  Every dark blank picture is given one and the same vector, named
                  a bar at 0.8921, because nothing of it survives the first
                  convolution. The method gives a position to a picture with
                  nothing in it.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A brightness training never showed">
                <p>
                  Training drew every shape between 0.4 and 0.7 above its
                  background, so a picture made much dimmer or much brighter is
                  outside anything the network was shown. Multiplying a whole
                  picture by a constant changes nothing about its shape, and a
                  description of shape would not move. The vector moves a long
                  way.
                </p>
                <PictureVectorEdges view="brightness" />
                <p className={caption}>
                  Each line is one of the four pictures of step 6, multiplied
                  through, with its cosine to its own vector at full brightness.
                  The dashed line is the picture as it was drawn.
                </p>
                <p>
                  At a quarter of its brightness every one of the four is named a
                  bar, and the cross&rsquo;s vector has a cosine of &minus;0.1928
                  to where it started. At half brightness the cross is still
                  named a cross but its cosine has fallen to 0.5697, and the disc
                  is named a bar. Brighter pictures hold up better, the cross at
                  0.9084 at twice its brightness and the square at 0.9554 at three
                  times. Dim pictures drift towards the position the blank
                  picture was given, which is why the name they fall into is bar.
                </p>
                <KeepInMind>
                  At a quarter of its brightness a picture&rsquo;s vector is
                  somewhere else entirely, a cosine of &minus;0.1928 for the
                  cross, and every one of the four is named a bar. A vector is
                  only meaningful for pictures like the ones training drew.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the method stops being defined">
                <p>
                  Reading a vector off a classifier asks three things of a
                  picture and a collection. The picture has to be something the
                  network can read, the vector has to have a direction, and the
                  kinds a question asks about have to be distinctions the training
                  gave the network a reason to keep. Where one of those fails the
                  vector does not become approximate, it becomes either undefined
                  or defined and empty of meaning, and the table says which.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a vector of length zero",
                      reason: "it has no direction, so the cosine is a zero over a zero. Whether this can happen depends on the layer read, since a hyperbolic tangent layer reaches zero only if all its inputs are exactly zero and a rectified layer reaches it whenever a picture lights none of its units. The choices are to refuse the comparison, or to fall back to straight-line distance, which calls every such picture identical to every other.",
                    },
                    {
                      expression: "a picture holding nothing",
                      reason: "defined and empty. The network always answers, so the picture gets a position, and that position is made by the biases rather than by the picture. Measured here, every dark blank picture is given one vector, named a bar at 0.8921.",
                    },
                    {
                      expression: "a picture of another size",
                      reason: "undefined for this network. The dense layer reads exactly 128 numbers, which is 8 channels of 4 by 4 after two poolings of a 16 by 16 picture, and a 20 by 20 picture would hand on 8 by 5 by 5, which is 200, so there is no vector at all. The usual choice is to summarise each channel over the whole picture, which gives 8 numbers whatever the size and gives up where in the picture anything was.",
                    },
                    {
                      expression: "a kind the network was never taught",
                      reason: "the nearness is defined and its meaning is not what it was. The sixteen numbers were shaped to separate four other kinds, so what distinguishes the new kind is kept only by accident. Measured here, 43 to 45 of 60 rings gather where raw pixels gather 46, and the four scores have to name every ring one of four kinds.",
                    },
                    {
                      expression: "vectors from two different trainings",
                      reason: "undefined as a comparison. The two sets of axes have nothing to do with each other, so one picture’s two vectors are at a mean cosine of −0.1387 and 0.0187 across two retrainings. Comparisons are only meaningful inside one network.",
                    },
                    {
                      expression: "a collection holding one picture",
                      reason: "the nearest other picture names a set with nothing in it, so the question has no answer rather than a bad one.",
                    },
                    {
                      expression: "two pictures exactly as near",
                      reason: "the nearest neighbour is not unique, so a rule has to choose, and any rule is arbitrary. Choosing the earlier picture keeps the answer repeatable, which is the most a rule can offer here.",
                    },
                    {
                      expression: "a picture brighter or dimmer than any trained on",
                      reason: "defined, and not comparable with the pictures training drew. Nothing in the loss asked the vector to ignore brightness, so at a quarter of its brightness every one of the four pictures of step 6 is named a bar.",
                    },
                    {
                      expression: "a question the labels never asked",
                      reason: "whether two crosses are the same size, say. The loss rewarded only telling kinds apart, so whether size survives into the sixteen numbers is an accident of one training, and the answer can differ from one weight seed to the next.",
                    },
                  ]}
                />
                <KeepInMind>
                  Every line above comes from the same fact, that the vector is
                  whatever a network kept in order to name four kinds. It is
                  undefined where there is no direction or the picture cannot be
                  read, and defined but empty where the picture or the question
                  lies outside what that naming needed.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            trueFalse(
              "Among the three layers measured, the sixteen numbers separate the four kinds by the widest mean-cosine gap.",
              false,
              "The four scores open the widest gap of all, and they still come last on the nearest-neighbour count on every seed. Four numbers leave room for only four directions, so within a kind there is little left to rank pictures by and a picture between two kinds finds its nearest neighbour almost by chance. The argument for the sixteen is that they open a gap of 0.7566 where the flattened layer manages 0.1081, with an eighth as many numbers.",
            ),
            choice(
              "Of the readings measured on the 60 rings, which gathered them best?",
              [
                "The four scores",
                "The sixteen numbers this page calls the vector",
                "The flattened 128 before the dense layer",
                "Straight-line distance between raw pixels",
              ],
              2,
              "The flattened 128 gather 50, 55 and 55 rings of 60 across the seeds, against 44, 45 and 43 for the sixteen, 41, 32 and 29 for the four scores, and 46 for raw pixels. The deeper the layer the fewer rings find each other, because everything after the convolutions was trained to keep what helps name four kinds, and what tells a ring from a square never helped with that. Even in the sixteen the rings only just gather, since on the reference network a ring’s mean cosine to another ring is 0.7388 and to a square 0.7294.",
            ),
            trueFalse(
              "The reference network names ring 0 a square at a probability of 0.9371, close to the 0.9842 it gave a real square, so nothing in its answer marks the ring as a kind it never saw.",
              true,
              "Four scores are all the network has, so a ring has to be named one of the four, and the reference network names 48 of the 60 squares, the other outline. Naming has no way to answer that a picture is none of the four, which is why the more useful question is where the rings land rather than what they are called.",
            ),
            several(
              "Which of these hold of the reference network’s vectors?",
              [
                "An all-black picture and a flat picture at a brightness of 0.15 receive exactly the same vector",
                "The length of a vector correlates with the probability the network gives its top kind, at 0.4355",
                "A flat picture at 0.3 lights none of the first convolution’s 1,024 numbers",
                "Comparing by angle keeps whatever the length of a vector carries",
              ],
              [0, 1],
              "Neither the all-black picture nor the flat one at 0.15 lights any of the first convolution’s 1,024 numbers, so nothing of either gets past the first layer and the two come out at a cosine of 1.0000, named a bar at 0.8921 from the biases alone. A flat picture at 0.3, the brightest background training ever drew, lights 464 of them and is still named a bar. Lengths run from 1.4867 to 3.9429 and carry some of the network’s confidence, and comparing by angle divides every vector by its length, so the length is exactly what the angle discards.",
            ),
            choice(
              "The four pictures of step 6 are multiplied down to a quarter of their brightness. What happens?",
              [
                "Their vectors barely move, since multiplying a picture through changes nothing about its shape",
                "Every one of the four is named a bar, and the cross’s vector reaches a cosine of −0.1928 to where it started",
                "They are named as before but at lower probabilities",
                "They light none of the first convolution, so all four receive the blank picture’s vector",
              ],
              1,
              "A description of shape would not move, and the vector moves a long way. Dim pictures drift towards the position the blank picture was given, which is why the name they all fall into is bar. Training drew every shape between 0.4 and 0.7 above its background, so a picture made much dimmer is outside anything the network was shown.",
            ),
        ],
        },
        {
          title: "Practice. Reading A Vector Off A Network Of Your Own",
          practice: [
            exercise(
              "Build the network of Part 2 and count what it learns",
              ["Build the network of Part 2 with the library, layer by layer, and count the numbers it learns. The walk in Part 2 lists each layer's answer shape and how many of its numbers are learned, 2,468 in all with 2,064 in the dense layer of 16.", "Two convolutions, each followed by a pooling, then the flattening, the dense layer of sixteen hyperbolic tangents and the four scores. A convolution learns its kernels and one bias per filter, a dense layer its weight matrix and one bias per neuron, and pooling and flattening learn nothing at all."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear

weights = np.random.default_rng(0)
stack = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(4)]),
])

# For every layer of the stack, print its position, the shape it answers,
# how many numbers that is, and how many of its numbers are learned.
# Then print the learned numbers in all.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear

weights = np.random.default_rng(0)
stack = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(4)]),
])

total = 0
for position, layer in enumerate(stack):
    learned = 0
    if isinstance(layer, Conv2d):
        learned = layer.kernels.size + layer.bias_vector.size
    if isinstance(layer, DenseLayer):
        learned = layer.weight_matrix.size + layer.bias_vector.size
    total += learned
    print(f"layer {position} answers {layer.shape.answers}, {layer.shape.n_outputs} numbers, {learned} learned")
print(f"learned numbers in all {total}")`,
              `layer 0 answers (4, 16, 16), 1024 numbers, 40 learned
layer 1 answers (4, 8, 8), 256 numbers, 0 learned
layer 2 answers (8, 8, 8), 512 numbers, 296 learned
layer 3 answers (8, 4, 4), 128 numbers, 0 learned
layer 4 answers (128,), 128 numbers, 0 learned
layer 5 answers (16,), 16 numbers, 2064 learned
layer 6 answers (4,), 4 numbers, 68 learned
learned numbers in all 2468`,
              { hints: ["A LayerStack takes its layers in order, and each layer's reads has to match what the one before answers, which is how (8, 4, 4) becomes the 128 the flattening hands on. The stack can be iterated and indexed like a list.", "A Conv2d keeps its learned numbers in kernels and bias_vector, a DenseLayer in weight_matrix and bias_vector, and every array has a size. MaxPool2d and Flatten hold nothing.", "Each layer's shape.answers is the arrangement it hands on and shape.n_outputs the count of numbers in it, which is the pair the walk in Part 2 lists for every row."], check: numberCheck("How many learned numbers does the network hold in all?", 2468, 0.5, "The two convolutions hold 40 and 296, the dense layer of sixteen 2,064 and the four scores 68, and pooling and flattening learn nothing, which is the 2,468 Part 2 quotes. The dense layer of sixteen holds most of them because each of its sixteen neurons reads all 128 flattened numbers.") },
            ),
            exercise(
              "Train on a dozen pictures and compare them by vector and by pixels",
              ["Train the same design on a dozen pictures of your own, six crosses and six square outlines drawn at random positions with the page's random backgrounds, lifts and noise, and read each picture's vector off the layer of sixteen. The script draws the pictures and trains the network for 40 passes on all twelve at once. Write the comparison.", "Part 3 found a mean cosine of 0.7588 within a kind and 0.0022 across on the 240 held-out pictures, and a nearest neighbour of the right kind for 233 of 240 by vector against 194 by pixel distance. A dozen pictures of two kinds give different numbers, and the same two questions can be asked of them."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

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

weights = np.random.default_rng(1)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
stack = start
for epoch in range(40):
    stack = stack.stepped_by(stack.backward_pass(pictures, np.eye(2)[labels], SoftmaxCrossEntropy()), 0.1)

# Read the sixteen numbers of layer 5 for every picture and scale each vector
# to length one. Print the mean cosine within a kind and across kinds, then
# how many of the 12 have a nearest neighbour of their own kind by vector,
# and how many by straight-line distance between their 256 pixels.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

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

weights = np.random.default_rng(1)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
stack = start
for epoch in range(40):
    stack = stack.stepped_by(stack.backward_pass(pictures, np.eye(2)[labels], SoftmaxCrossEntropy()), 0.1)

vectors = np.asarray(stack.respond_to(pictures)[5].outputs)
directions = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
cosines = directions @ directions.T
same = labels[:, None] == labels[None, :]
others = ~np.eye(12, dtype=bool)
print(f"mean cosine within a kind {cosines[same & others].mean():.4f}")
print(f"mean cosine across kinds {cosines[~same].mean():.4f}")
np.fill_diagonal(cosines, -np.inf)
print(f"nearest by vector is its own kind for {(labels[cosines.argmax(axis=1)] == labels).sum()} of 12")
flat = pictures.reshape(12, -1)
gaps = np.sqrt(((flat[:, None, :] - flat[None, :, :]) ** 2).sum(axis=2))
np.fill_diagonal(gaps, np.inf)
print(f"nearest by pixels is its own kind for {(labels[gaps.argmin(axis=1)] == labels).sum()} of 12")`,
              `mean cosine within a kind 0.6983
mean cosine across kinds 0.0785
nearest by vector is its own kind for 12 of 12
nearest by pixels is its own kind for 8 of 12`,
              { hints: ["respond_to on the stack answers every layer's response in order, so the sixteen numbers are the response at position 5, read through its outputs.", "Divide every vector by its length, and the matrix of dot products between the scaled vectors is every cosine at once. Two pictures share a kind where their labels agree, and the diagonal compares a picture with itself and has to be left out of both means.", "For the nearest neighbour, set the diagonal to minus infinity before taking each row's largest cosine, and to plus infinity for the pixel distances before taking each row's smallest."], check: numberCheck("What mean cosine do two pictures of one kind have in the trained network's sixteen numbers?", 0.6983, 0.001, "Two crosses, or two squares, point about 46 degrees apart on average while a cross and a square are nearly at a right angle, 0.0785, which is the arrangement Part 3 found on the page at 0.7588 and 0.0022. By vector every one of the twelve finds its own kind, where the pixels manage eight, a dozen-picture version of 233 against 194.") },
            ),
            exercise(
              "Ask whether training did the gathering",
              ["Part 4 asks whether the gathering is the work of training or of the design. The starter keeps the network's starting weights as start and the network after forty passes as stack. Read the sixteen numbers off both, and for each print how many of the twelve it names correctly, the mean cosine within a kind and across kinds, the gap between the two, and how many pictures find their own kind as nearest neighbour.", "On the page training took the gap from 0.0069 to 0.7566 and the count from 189 to 233 of 240. The starting weights here are the very numbers training began from, so whatever gap they open is what the design alone contributes."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

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

weights = np.random.default_rng(1)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
stack = start
for epoch in range(40):
    stack = stack.stepped_by(stack.backward_pass(pictures, np.eye(2)[labels], SoftmaxCrossEntropy()), 0.1)

# For start and then for stack, read the scores and the sixteen numbers of
# every picture. Print how many of the 12 the network names correctly, the
# mean cosine within a kind and across kinds, their gap, and how many
# pictures have a nearest neighbour of their own kind.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

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

weights = np.random.default_rng(1)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
stack = start
for epoch in range(40):
    stack = stack.stepped_by(stack.backward_pass(pictures, np.eye(2)[labels], SoftmaxCrossEntropy()), 0.1)

same = labels[:, None] == labels[None, :]
others = ~np.eye(12, dtype=bool)
for name, network in (("untrained", start), ("trained", stack)):
    response = network.respond_to(pictures)
    named = np.asarray(response.outputs).argmax(axis=1)
    vectors = np.asarray(response[5].outputs)
    directions = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
    cosines = directions @ directions.T
    within, across = cosines[same & others].mean(), cosines[~same].mean()
    np.fill_diagonal(cosines, -np.inf)
    own = (labels[cosines.argmax(axis=1)] == labels).sum()
    print(f"{name}: names {(named == labels).sum()} of 12, within {within:.4f}, across {across:.4f}, gap {within - across:.4f}, nearest own kind {own} of 12")`,
              `untrained: names 7 of 12, within 0.6851, across 0.6981, gap -0.0130, nearest own kind 9 of 12
trained: names 12 of 12, within 0.6983, across 0.0785, gap 0.6198, nearest own kind 12 of 12`,
              { hints: ["Every step builds a new stack rather than changing the old one, so start is still the network before any step and stack the network after forty, and the same reading can be taken from both.", "The stack response's own outputs are the last layer's scores, so the name the network gives a picture is the position of its largest score, and the sixteen numbers are the response at position 5.", "A gap near zero means pictures of one kind sit no nearer than pictures of two, which is the untrained network's position on the page as well, at 0.7394 within a kind against 0.7325 across."], check: numberCheck("What gap between the mean cosine within a kind and across kinds does the untrained network open?", -0.013, 0.001, "Before training the two means are 0.6851 and 0.6981, so pictures of one kind are if anything slightly farther apart than pictures of two, and the network names seven of twelve, about what a coin would. Forty passes on the same starting weights open the gap to 0.6198 and take the nearest-neighbour count from nine to twelve, which is the page's argument on a dozen pictures. The design on its own did not gather the kinds.") },
            ),
            exercise(
              "Dim a picture and watch its vector move",
              ["Part 7 multiplies a picture through and watches its vector move. Take the first cross, read its vector at full brightness, then at a quarter, a half and twice its brightness, and print the cosine of each to the full-brightness vector, the vector's length, and what the network names the picture.", "On the reference network the cross at a quarter of its brightness reached a cosine of −0.1928 to where it started and was named a bar. The network here has only two names to choose from, so the question is how far the vector moves rather than what the picture is called."],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

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

weights = np.random.default_rng(1)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
stack = start
for epoch in range(40):
    stack = stack.stepped_by(stack.backward_pass(pictures, np.eye(2)[labels], SoftmaxCrossEntropy()), 0.1)

# Read the first cross's vector at full brightness and scale it to length
# one. Then for each of the factors 0.25, 0.5, 1.0 and 2.0, put the picture
# multiplied by that factor through the stack and print the cosine of its
# vector to the full-brightness one, its length, and the kind it is named.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, HyperbolicTangent, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear, SoftmaxCrossEntropy

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

weights = np.random.default_rng(1)
start = LayerStack([
    Conv2d(reads=(1, 16, 16), n_filters=4, kernel_size=3, activation=RectifiedLinear(), padding=1),
    MaxPool2d(reads=(4, 16, 16)),
    Conv2d(reads=(4, 8, 8), n_filters=8, kernel_size=3, activation=RectifiedLinear(), padding=1, random_seed=1),
    MaxPool2d(reads=(8, 8, 8)),
    Flatten(reads=(8, 4, 4)),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 128) ** 0.5, 128), bias=0.0, activation=HyperbolicTangent()) for _ in range(16)]),
    DenseLayer([Neuron(weights=weights.normal(0.0, (2 / 16) ** 0.5, 16), bias=0.0, activation=Identity()) for _ in range(2)]),
])
stack = start
for epoch in range(40):
    stack = stack.stepped_by(stack.backward_pass(pictures, np.eye(2)[labels], SoftmaxCrossEntropy()), 0.1)

original = np.asarray(stack.respond_to(pictures[:1])[5].outputs)[0]
original = original / np.linalg.norm(original)
for factor in (0.25, 0.5, 1.0, 2.0):
    response = stack.respond_to(pictures[:1] * factor)
    vector = np.asarray(response[5].outputs)[0]
    cosine = original @ vector / np.linalg.norm(vector)
    named = ("cross", "square")[int(np.asarray(response.outputs)[0].argmax())]
    print(f"at {factor} of its brightness the cross has cosine {cosine:.4f} to itself, length {np.linalg.norm(vector):.4f}, named {named}")`,
              `at 0.25 of its brightness the cross has cosine 0.5684 to itself, length 0.4839, named cross
at 0.5 of its brightness the cross has cosine 0.9511 to itself, length 0.7920, named cross
at 1.0 of its brightness the cross has cosine 1.0000 to itself, length 1.5317, named cross
at 2.0 of its brightness the cross has cosine 0.9896 to itself, length 2.4193, named cross`,
              { hints: ["A picture multiplied by a factor is still a block the stack can read, and pictures[:1] * factor keeps the leading rows axis that respond_to expects.", "The cosine to the original is the dot product of the two vectors divided by both lengths, so scale the full-brightness vector to length one first and only the dimmed vector's length is left to divide by."], check: numberCheck("What cosine does the cross at a quarter of its brightness have to its own full-brightness vector?", 0.5684, 0.001, "Multiplying the picture by a quarter changes nothing about its shape, and the vector still turns away, to a cosine of 0.5684, with its length falling from 1.5317 to 0.4839. Twice the brightness barely moves it, at 0.9896, which is the page's finding too, that brighter pictures hold up better than dimmer ones. On the reference network the same experiment reached −0.1928, and this network, trained on twelve pictures for two names, has less to lose.") },
            ),
          ],
        },
      ]}
    />
  );
}
