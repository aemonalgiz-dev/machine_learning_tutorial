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
import { PictureNeighbourPlayground } from "@/components/widgets/PictureNeighbourPlayground";
import { PictureSeedLedger } from "@/components/widgets/PictureSeedLedger";
import { PictureVectorEdges } from "@/components/widgets/PictureVectorEdges";
import { PictureVectorSphere } from "@/components/widgets/PictureVectorSphere";
import { PictureVectorWalk } from "@/components/widgets/PictureVectorWalk";

export const metadata: Metadata = {
  title: "A Vector for a Picture · oop_ml",
  description:
    "Train a network to name four kinds of picture, keep the layer before its answer, and measure whether pictures of one kind land near each other there.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const caption = "text-sm text-slate-500 dark:text-slate-400";

export default function PictureVectorPage() {
  return (
    <ConceptPage
      title="A Vector for a Picture"
      tagline="Read a picture’s embedding off the layer just before a classifier’s answer, the idea published as deep features and neural codes, and measure whether pictures of one kind really do land together there."
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
      history={
        <>
          <p>
            Before any of this, comparing two photographs meant comparing
            something a person had designed. Josef Sivic and Andrew Zisserman,
            at Oxford, described in &ldquo;Video Google&rdquo; in 2003 a
            system that found the frames of a film showing a given object by
            describing small patches around distinctive points, sorting those
            descriptions into a vocabulary of visual words, and borrowing the
            machinery of text retrieval to rank frames by the words they
            shared. The descriptors were built by hand to stay the same under a
            change of viewpoint or lighting, and the difficulty was that nobody
            could say in advance whether what they kept was what made two
            pictures pictures of the same thing.
          </p>
          <p>
            The idea on this page came out of a classifier. Alex Krizhevsky,
            Ilya Sutskever and Geoffrey Hinton, at Toronto, trained a large
            convolutional network to name a thousand kinds of object for the
            ImageNet competition, and in &ldquo;ImageNet Classification with
            Deep Convolutional Neural Networks&rdquo; in 2012 they looked
            inside it by taking the 4096 numbers of its last hidden layer for a
            test image and fetching the training images whose numbers were
            nearest. The images that came back showed the same kind of thing,
            and they pointed out that those images were generally not close to
            the query pixel by pixel. Jeff Donahue and his colleagues at
            Berkeley took the same activations off a trained network and used
            them as the input to entirely different tasks in &ldquo;DeCAF&rdquo;,
            circulated in 2013, and Ali Sharif Razavian, Hossein Azizpour,
            Josephine Sullivan and Stefan Carlsson, at KTH in Stockholm, called
            the result &ldquo;an astounding baseline for recognition&rdquo; in
            2014. Artem Babenko, Anton Slesarev, Alexandr Chigorin and Victor
            Lempitsky used the vectors for image retrieval the same year and
            called them neural codes, which with deep features is the name the
            method still goes by.
          </p>
          <p>
            A control for the claim was available before the claim was made.
            Kevin Jarrett, Koray Kavukcuoglu, Marc&rsquo;Aurelio Ranzato and
            Yann LeCun, at New York University, reported in 2009 that a
            two-stage convolutional architecture with random filters recognised
            objects surprisingly well, and Andrew Saxe and colleagues at
            Stanford explained in 2011 why convolution followed by pooling
            responds to some patterns and not others even when nothing has been
            learned. So when a trained network&rsquo;s vectors gather pictures
            of one kind, the honest question is how much of that the training
            did. This page repeats the Toronto experiment at the scale of
            sixteen-pixel pictures of four shapes, where every number can be
            measured inside a request, and adds that control.
          </p>
        </>
      }
      playground={<PictureNeighbourPlayground />}
      sections={[
        {
          title: "Part 1. Pixels Make A Poor Ruler",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Four kinds of picture, and a question about nearness">
                <p>
                  Every picture on this page is sixteen pixels on a side, with
                  one brightness per pixel, and holds one of four shapes, a
                  cross, the outline of a square, a filled disc or a diagonal
                  bar. Each shape is drawn at a random position and a random
                  size, against a random background, lifted by a random amount
                  above that background, with a little noise on every pixel, so
                  that no two crosses are alike and no single pixel gives a
                  cross away. We would like a way of saying that two crosses are
                  near each other and a cross and a disc are not, and that turns
                  out to be much harder to write down than it sounds.
                </p>
                <p>
                  The page asks six questions, in order. When two pictures are
                  compared pixel by pixel, how often is a picture&rsquo;s
                  nearest neighbour the same kind, and why does it miss? What is
                  the vector a trained network gives a picture, and how is it
                  read off? Where do pictures the network never saw land in that
                  space, and is a picture&rsquo;s nearest neighbour there its own
                  kind more often than its nearest by pixels? Is that gathering
                  something training did, or would an untrained network of the
                  same shape do it too? Which layer of the network gives the best
                  position? And where does a ring end up, a fifth kind the
                  network was never shown?
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
                  For each of the 240 held-out pictures, find the picture
                  nearest it by that distance among the other 239, and ask
                  whether it is the same kind. It is for 194 of them, a share of
                  0.8083, which is far better than the one in four a random
                  choice would manage and is the number everything else on this
                  page has to beat. The 46 misses are not spread evenly. Of the
                  60 crosses, 11 have a disc as their nearest picture, and of
                  the 60 squares, 7 have a bar and 6 a cross.
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
                  Comparing by angle rather than by distance does not help on
                  its own. Every pixel of every picture sits above zero, so all
                  240 pictures point in roughly the same direction, and two
                  pictures of one kind have a mean cosine of 0.5937 against
                  0.5799 for two of different kinds, a difference of 0.0138. The
                  nearest-neighbour count by angle is 196. Subtracting each
                  picture&rsquo;s own mean brightness before comparing removes
                  the shared lift, and the count rises to 212 of 240, a share of
                  0.8833, though the two mean cosines are then 0.1527 and
                  0.1181 and still barely apart.
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
          ),
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
                  The cosine between the cross and the square is 3.2608 divided
                  by 3.0017 times 3.6335, which is 0.2990, and every number in
                  that calculation is on the page.
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
                  The same picture&rsquo;s vector under the reference network and
                  under seed 1 has a mean cosine of &minus;0.1387, and under seed
                  2 of 0.0187, so on average one picture&rsquo;s two vectors are
                  at right angles. The nearest picture is the same picture under
                  both networks for only 40 and 45 of the 240, yet the nearest
                  picture is the same kind under both for 225 and 230. This is
                  the finding the word page makes by turning its whole table, met
                  here with the network retrained instead, and it has the same
                  consequence, since only comparisons between vectors from one
                  network carry anything.
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
                <p>
                  The 29,696 is 16 &times; 16 positions times 4 filters times 9
                  weights for the first convolution, which is 9,216, then 8
                  &times; 8 positions times 8 filters times 36 weights for the
                  second, which is 18,432, then 128 &times; 16 for the dense
                  layer, which is 2,048. So comparing two new pictures once is
                  dearer by vector than by pixels, 59,392 multiplications to make
                  two vectors against 256 to compare the pixels. The vector pays
                  for itself when each picture is compared many times, since its
                  vector is made once and kept, which is the situation{" "}
                  <Link
                    href="/concepts/searching-a-collection-of-pictures"
                    className={link}
                  >
                    searching a collection of pictures
                  </Link>{" "}
                  is about.
                </p>
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
                    Picture two kinds as two long thin clouds lying side by side
                    and a flat cut running between them. Every point of each
                    cloud is on its own side, so a flat layer names them all
                    correctly. Yet a point at the far end of one cloud can be
                    much nearer the facing point of the other cloud than any
                    point of its own, so its nearest neighbour is the wrong kind.
                    Separability constrains which side of a cut a picture is on,
                    and nearness depends on the whole shape of each kind, which
                    the loss never mentions.
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
                  The flattened layer barely separates the kinds on average,
                  since its gap is 0.1081, and it wins on nearest neighbour only
                  because the single nearest picture is still usually right. The
                  sixteen open a gap seven times as wide with an eighth as many
                  numbers. The four scores open the widest gap of all and still
                  have the worst count, because four numbers leave room only for
                  four directions, and within a kind there is little left to rank
                  pictures by, so a picture between two kinds finds its nearest
                  neighbour almost by chance. Four scores also have no room for
                  a kind they were not trained to score, which is the next
                  Part&rsquo;s subject.
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
                  The flattened 128 gather 50, 55 and 55 rings across the seeds,
                  the sixteen 44, 45 and 43, and the four scores 41, 32 and 29.
                  Pixels less their own mean gather 50. So the deeper the layer,
                  the fewer rings find each other, and the layer this page reads
                  the vector from sits in the middle. The reading I take from
                  that is that everything after the convolutions was trained to
                  keep what helps name four kinds and to drop the rest, and what
                  tells a ring from a square was never any help in naming four
                  kinds, so each later layer holds less of it.
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
                  Held-out vectors run from 1.4867 to 3.9429 in length with a
                  mean of 2.9769, and 0.2437 of all their coordinates are beyond
                  0.95 in size. The length correlates with the probability the
                  network gives its top kind at 0.4355, so it carries some of
                  the network&rsquo;s confidence, and dividing it out discards
                  that. Here nothing turns on it, since the count is 233 of 240
                  by angle and by distance alike. The angle has one gap of its
                  own, which is that a vector of length zero has no direction.
                  With a hyperbolic tangent layer that needs all sixteen inputs
                  to be exactly zero, which essentially never happens, but a
                  layer of rectified units puts every picture that lights none of
                  its units exactly at zero, and there the angle does not exist.
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
                  An all-black picture and a flat one at 0.15 light none of the
                  first convolution&rsquo;s 1,024 numbers, so nothing of either
                  picture gets past the first layer, and the two receive exactly
                  the same vector, at a cosine of 1.0000. That vector depends on
                  nothing but the network&rsquo;s own biases carried through its
                  weights, and it is
                  named a bar at a probability of 0.8921, with a mean cosine of
                  0.7629 to the held-out bars. A flat picture at 0.3, the
                  brightest background training ever drew, lights 464 of the
                  1,024 and is still named a bar, at 0.9324. So an empty picture
                  has a position and a name, and both come from the biases
                  rather than from anything in the picture.
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
      ]}
    />
  );
}
