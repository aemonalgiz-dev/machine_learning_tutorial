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
  title: "A Vector for a Picture · Perceptron Lab",
  description:
    "A trained image network can represent a picture as a vector of features. Comparing those vectors can capture similarities that direct pixel comparisons miss, depending on what the network learned.",
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
      playgroundTitle="Compare pictures using their numerical descriptions"
      playgroundIntro="Compare the nearest pictures under pixel distance and embedding similarity. Inspect the actual pictures, including mistakes, rather than judging the representation only by its plotted clusters."
      title="A Vector for a Picture"
      tagline={"A trained image network can represent a picture as a vector of features. Comparing those vectors can capture similarities that direct pixel comparisons miss, depending on what the network learned."}
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
                <p>Each image is a sixteen-by-sixteen brightness grid containing a cross, square outline, filled disc or diagonal bar. We vary position, size and brightness, and add a little pixel noise. Two crosses can therefore look different pixel by pixel while still belonging to the same shape class. This gives us a reason to investigate another representation.</p>
                <p>

                  We can recognize two crosses even when their positions or brightness differ. How could we give the computer a distance that reflects that resemblance? We will start by comparing pixels, then examine the representation learned by a network trained to classify the shapes.
                </p>
                <p>Begin with nearest neighbors under pixel distance, then compare them with neighbors in the trained representation. We will measure whether the nearest image has the same shape label, using images excluded from training. That gives the representation a concrete question to answer.</p>
                <p>An untrained network of the same shape provides a useful comparison: it helps us separate the architecture’s effect from what training changed. We will also inspect different layers and test rings, a shape the classifier was never trained to recognize.</p>
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
                  {"For each of the 240 held-out images, find the nearest among the other 239 by pixel distance. The neighbor has the same category in 194 cases, a share of 0.8083. That is well above the roughly one-in-four rate of a uniform random choice among these balanced categories. It gives us a measured baseline for the learned representation."}
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
                  picture&rsquo;s nearest neighbor is its own kind for 194 of
                  the 240. That is the baseline, and it asks nothing of any
                  network.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What the pixels are actually comparing">
                <p>
                  {"Pixel distance depends on where brightness appears. A cross and a disc in the same location can share many bright pixels, while shifted crosses may overlap little. Similar backgrounds can also reduce the distance. These effects can conflict with the shape-category similarity we want to measure."}
                </p>
                <p>
                  {"Using cosine directly on these nonnegative brightness vectors gives only a small gap between the groups. Same-kind pairs have mean cosine 0.5937 and different-kind pairs 0.5799, a difference of 0.0138. The nearest-neighbor count is 196. Positive background brightness contributes shared structure, but nonnegative coordinates alone do not force every vector to point in nearly the same direction."}
                </p>
                <p>
                  Subtracting each picture&rsquo;s own mean brightness before comparing removes the shared lift, and the count rises to 212 of 240, a share of 0.8833, though the two mean cosines are then 0.1527 and 0.1181 and still barely apart.
                </p>
                <Equation>
                  {"cosine(a, b) = (a · b) / (‖a‖ ‖b‖)"}
                </Equation>
                <p>For this task, we would like a comparison that is less sensitive to a shape&apos;s position, size and brightness while retaining evidence about its kind. We could try hand-designed descriptors or train a representation from examples. This page investigates the learned route and checks what it preserves, including for pictures outside the training conditions.</p>
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
                  {"This is the classifier used on the earlier image pages. It applies four convolution filters and two-by-two max pooling, then repeats those operations with eight filters. Flattening gives 128 values, a dense layer produces 16 features, and a final layer gives four class scores. Training uses the 240 labeled images for 40 passes. Its cross-entropy objective rewards assigning higher probability to the observed class, rather than directly specifying which image vectors should be near one another."}
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
                <p>For this network, the layer before the final classifier returns sixteen values for each picture. We keep those values together as a vector, also called its embedding, and compare pictures using that representation. The last layer would turn them into four class scores; leaving it out lets us investigate the features it was trained to use rather than only its chosen label.</p>
                <Equation>
                  {"v = tanh(W f + b)          f the 128 flattened numbers, W 16 × 128, b 16\nscores = U v + c           U 4 × 16, c 4"}
                </Equation>
                <p>Each of the 16 coordinates uses hyperbolic tangent activation. In real-number arithmetic each lies strictly between −1 and 1, giving a vector length below 4; finite-precision calculations can round saturated values to the endpoints. The training loss scores one picture and its label at a time. It does not directly specify the distance between two pictures.</p>
                <Equation>
                  {"loss for one picture = − log( e^(score of its own kind) / Σₖ e^(scoreₖ) )"}
                </Equation>
                <p>
                  {"The loss contains one image's scores and its label. It does not contain the distance between that image and another one. Classification can still encourage useful shared features, but the resulting nearest-neighbor structure is something we need to evaluate, as Part 4 does."}
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
                  {"The display takes the first held-out image of each category and draws its sixteen feature values above and below zero. A square and a bar produce visibly different patterns. The bar heights alone do not label a coordinate as a particular visual property; section 8 discusses how such interpretations can be tested."}
                </p>
                <PictureVectorWalk view="four" />
                <p className={caption}>
                  The four pictures, their vectors, and the two ways of comparing
                  them. The two grids hold the same six pairs, measured once by
                  the angle between vectors and once by the distance between
                  pixels.
                </p>
                <p>The network assigns its chosen class probabilities of 0.9968 for the cross, 0.9842 for the square and 0.9885 for the bar. For the disc it assigns 0.5158 to disc and 0.4678 to cross. Those are model outputs rather than guarantees of correctness. This disc has vector length 2.8774, compared with 3.6335 for the square.</p>
                <KeepInMind>
                  {"For these four examples, the model assigns the correct class probability 0.98 or above in three cases and 0.5158 for the disc. The disc is the least confident of this selected group, which gives us a useful case to inspect rather than a general difficulty score."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Compare two image descriptors coordinate by coordinate" id="7-one-cosine-worked-by-hand">
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
                  {"Of these four images, cross and disc are nearest both by cosine, 0.4199, and by pixel distance, 4.0616. Square and bar are farthest apart under both comparisons, at −0.3454 and 6.2299 respectively. This small set lets us check a calculation and inspect examples. The following part evaluates category retrieval across all 240 held-out images."}
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
                <p>A coordinate might correlate with roundness or some other property, but we should test that interpretation rather than assume it. Retraining from different starting weights changes the coordinate system in this experiment. Similar retrieval behavior can remain even when a particular numbered coordinate no longer plays the same apparent role.</p>
                <PictureSeedLedger view="coordinates" />
                <p className={caption}>
                  Each row compares the reference network with one retrained from
                  another weight seed, on the same 240 held-out pictures.
                </p>
                <p>Comparing each picture&apos;s reference vector with its vector from another fit gives mean cosines of −0.1387 for seed 1 and 0.0187 for seed 2. These averages show little consistent coordinate alignment; they do not mean every pair of corresponding vectors is perpendicular. The nearest picture is identical across the fits for only 40 and 45 of the 240 queries, while the nearest picture has the same kind across fits for 225 and 230. Useful within-fit comparisons can survive even when coordinates do not align across fits.</p>
                <p>As with the rotated word-vector table, coordinates from independent fits need not be directly comparable. Within one fit, the distances still describe its learned arrangement. Comparing vectors across fits requires establishing a suitable shared alignment rather than assuming that matching coordinate numbers have the same meaning.</p>
                <KeepInMind>
                  {"Across the two retrained networks, the corresponding-vector mean cosines are −0.1387 and 0.0187, while nearest-neighbor categories agree for 225 and 230 of 240 queries. A feature's numbered coordinate belongs to its fitted representation. Useful within-fit retrieval does not require matching coordinate values across independent fits."}
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
              "In exact arithmetic, why is this network’s sixteen-coordinate tanh vector shorter than 4 for finite input scores?",
              [
                "The vectors are scaled to length one before anything is measured",
                "Each of the sixteen numbers is a hyperbolic tangent, so it lies strictly between −1 and 1",
                "The dense layer holds 2,064 of the network’s 2,468 learned numbers",
                "The four scores on top of the vector have to add to one",
              ],
              1,
              "For a finite score, mathematical tanh has magnitude strictly below one. Sixteen such coordinates therefore have Euclidean norm strictly below four. Floating-point tanh can round a saturated output to an endpoint, so the strict bound is a mathematical statement. The later unit-length normalization and the final class-score layer are separate operations.",
            ),
            trueFalse(
              "Retraining a learned representation from another starting seed guarantees that each coordinate keeps the same meaning.",
              false,
              "The training objective does not name the hidden coordinates. Permuting hidden units together with the next layer’s matching weight columns preserves predictions while changing coordinate labels. Separate fits can therefore disagree coordinate by coordinate. Comparing or combining their vectors requires a compatible representation, not just equal vector width.",
            ),
        ],
        },
        {
          title: "Part 3. Where The Held-Out Pictures Land",
          content: (
            <>
              <SubSection title="9. Sixteen numbers, drawn as a turning sphere">
                <p>
                  {"The drawing reduces sixteen coordinates to three. It first normalizes each vector so we compare directions. Principal component analysis then projects the 240 vectors onto three axes fitted to their variation. Finally, the projected points are normalized onto the sphere. Projection and this last normalization can change the displayed angles, so the numerical comparisons still use the original vectors."}
                </p>
                <PictureVectorSphere />
                <p className={caption}>

                  Every held-out picture as a dot, colored by its kind. The four
                  kinds sit in four separate patches of the sphere, and the
                  drawing keeps 81.1% of the spread of the directions.
                </p>
                <p>The reported similarities use all sixteen coordinates, not the three-dimensional drawing. Same-kind pairs have mean cosine 0.7588 and different-kind pairs 0.0022, compared with 0.5937 and 0.5799 for raw pixels. Taking the arccosine of 0.7588 gives about 41 degrees; that is the angle corresponding to the mean cosine, not necessarily the mean of the individual pair angles.</p>
                <KeepInMind>
                  {"The mean cosines correspond to angles of about 41 degrees within a category and 90 degrees across categories. Those are angles of the mean cosines, not averages of all pair angles. The three-axis projection retains 81.1% of the measured variation before points are placed on the sphere. That percentage alone does not establish cluster quality; the full-vector measurements provide a separate check."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. A picture’s nearest neighbor, by vector and by pixels" id="10-a-pictures-nearest-neighbour-by-vector-and-by-pixels">
                <p>

                  The question from Part 1 can now be asked of the vectors. For
                  each held-out picture, find the picture whose vector makes the
                  smallest angle with its own, and ask whether it is the same
                  kind. This is a one-neighbor vote in the sense of{" "}
                  <Link href="/concepts/k-nearest-neighbours" className={link}>

                    k-nearest neighbors
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

                  By the vector, a picture&rsquo;s nearest neighbor is its own
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

                  A picture&rsquo;s nearest neighbor by vector is its own kind
                  for 230 to 235 of 240 across three seeds, where the pixels
                  manage 194. The improvement holds on every seed.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The seven the vector still gets wrong">
                <p>

                  A count hides which pictures go wrong, and the answer is
                  informative. Laid out as a table of each kind against the kind
                  of its nearest neighbor, the pixels spread their mistakes over
                  every pair, and five of the vector&rsquo;s seven fall between
                  a disc and a cross.
                </p>
                <PictureSeedLedger view="confusion" />
                <p className={caption}>

                  Each row is a kind, and each cell counts the pictures of that
                  kind whose nearest neighbor was of the column&rsquo;s kind. The
                  diagonal is right and everything tinted is a mistake.
                </p>
                <p>

                  On the reference network all 60 squares find a square, and 59
                  of 60 bars find a bar. Three discs have a cross as their
                  nearest neighbor and two crosses a disc, and the remaining two
                  mistakes are a cross beside a square and a bar beside a disc.
                  Crosses and discs are the pair both tables mix most, 11 and 9
                  times by pixels and 2 and 3 times by the vector, and the disc
                  of step 6, which the network itself only just named a disc, is
                  one of the three.
                </p>
                <KeepInMind>
                  {"Most of the seven retrieval mistakes involve crosses and discs, the same pair often confused under pixel distance. One is the disc whose class prediction was uncertain in the earlier four-image example. Inspecting those cases tells us more than the aggregate count alone."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the vector costs">
                <p>A stored sixteen-value vector takes less space and fewer coordinates to compare than the 256 raw pixels. Producing it still requires the convolutions and dense layer. A network with untrained weights can also produce values, as the control below shows; obtaining this learned representation requires fitting the network before using its features.</p>
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
                  {"Creating a vector requires the trained network and the reported 29,696 multiplications. Once it is stored, a dot-product comparison uses 16 coordinate multiplications instead of the pixel comparison's 256. Reusing vectors across many comparisons can amortize their construction cost. These counts exclude other work such as additions and normalization."}
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
                  {"The classifier learns from class probabilities produced by a linear layer over the sixteen features. That encourages features the final layer can use to distinguish the classes. Correct class ordering alone is not the full cross-entropy objective, and neither is nearest-neighbor retrieval. We therefore evaluate whether nearby feature vectors actually share a shape category."}
                </p>
                <p>

                  That is a demand about the arrangement, though it is weaker
                  than nearness. Kinds can sit on the right sides of flat cuts
                  and still be long and spread out, so that a picture&rsquo;s
                  nearest neighbor lies across a cut. There is also a second
                  explanation to rule out, which is that convolution and pooling
                  gather pictures of one kind by their construction, whatever the
                  weights, in which case training would deserve little of the
                  credit.
                </p>
                <WhyThisWorks title="Why separable does not mean near">
                  <p>

                    Picture two kinds as two long thin clouds lying side by side and a flat cut running between them. Every point of each cloud is on its own side, so a flat layer names them all correctly. Yet a point at the far end of one cloud can be much nearer the facing point of the other cloud than any point of its own, so its nearest neighbor is the wrong kind.
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
                  its sixteen numbers, a picture&rsquo;s nearest neighbor is its
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
                  neighbor of the right kind more often than the raw pixels do.
                </p>
                <PictureSeedLedger view="control" />
                <p className={caption}>

                  The first table counts nearest neighbors of the right kind,
                  and the second puts the mean cosine within a kind beside the
                  mean cosine across kinds.
                </p>
                <p>
                  {"At the flattened 128-value layer, the untrained networks return same-category neighbors for 201, 206 and 208 of 240 images. Each exceeds the 194 from pixel distance and falls below the 212 from mean-subtracted pixels. Adding the untrained sixteen-value dense layer lowers the reference count from 201 to 189. This identifies a change between representations; it does not by itself isolate exactly which geometric property caused that change."}
                </p>
                <KeepInMind>
                  {"The untrained convolution-and-pooling representation reaches 201 to 208 same-category neighbors out of 240, above raw pixel distance. The later untrained dense representation performs worse here. That does not establish that convolution weights never need training, only how these particular untrained layers compare."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What training added">
                <p>

                  Setting the two networks side by side answers the question.
                  Training took the sixteen numbers from 189 pictures with a
                  nearest neighbor of their own kind to 233 on the reference
                  seed, from 180 to 230 and from 186 to 235 on the other two. It
                  also opened the gap between the mean cosine within a kind and
                  across kinds from 0.0069 to 0.7566.
                </p>
                <p>For the selected sixteen-value layer and these four shape classes, training improves the measured nearest-neighbor result across all three starting seeds. The classification loss did not explicitly request that neighbor structure. Its class-separation objective produced useful retrieval features in this experiment, but that relationship still needs evaluation for other kinds and conditions.</p>
                <KeepInMind>
                  {"Across the three starts, the untrained counts range from 180 to 189 correct neighbor categories out of 240, while the trained counts range from 230 to 235. The convolution and dense layers have not changed their sizes. Their weights have changed so that the four category probabilities fit the training labels. The improved retrieval shows that this training also made same-category pictures more similar under the sixteen-value representation, even though the loss never compared pairs of pictures directly."}
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
              "The similarity figures use all sixteen coordinates. The drawing first normalizes vectors, then projects onto three principal directions and normalizes the projected points onto a sphere. Those transformations can distort angles and apparent separation. Its retained-variance figure describes the projection, while the full-vector retrieval measurements provide the evidence for useful grouping.",
            ),
            choice(
              "By the vector, a held-out picture’s nearest neighbor is its own kind for how many of the 240 on the reference network?",
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
              "What does this comparison tell us about the untrained network?",
              [
                              "It names 0.2125 of the held-out pictures correctly, a little under what a guess would get",
                              "Its sixteen numbers find their own kind less often than straight-line pixel distance does",
                              "Its 128 numbers before the dense layer find their own kind more often than straight-line pixel distance does",
                              "Its 128 numbers before the dense layer beat every comparison of raw pixels",
                            ],
              [0, 1, 2],
              "Untrained, the sixteen gather 189, 180 and 186 of 240 across the three seeds, below the 194 that pixel distance manages on every seed, which is why the gathering is credited to training, which took the count to 233, 230 and 235 and opened the gap between the mean cosine within a kind and across kinds from 0.0069 to 0.7566. Read one layer earlier the same untrained network reaches 201, 206 and 208, above pixel distance but below the 212 of pixels less their own mean, so beating every comparison of raw pixels overstates it.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Nearest neighbour has the same kind, out of 240:\nraw pixel distance: 194\npixels after subtracting each picture’s mean: 212\nuntrained 16-number layer, seeds 0/1/2: 189 / 180 / 186\nuntrained 128-number layer, seeds 0/1/2: 201 / 206 / 208\n\nUntrained classifier accuracy, seed 0: 0.2125\nFour equally common kinds: chance accuracy 0.25"
              },
            ),
            trueFalse(
              "Kinds that a flat cut separates can still be long and spread out, so that a picture’s nearest neighbor lies across the cut.",
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
                  {"The sixteen-value hidden layer is one candidate representation. We can also compare the 128 flattened convolutional features and the four final class scores. Evaluating all three with the same retrieval question shows what choosing a layer changes, rather than assuming the penultimate layer must be best."}
                </p>
                <PictureSeedLedger view="layers" />
                <p className={caption}>
                  The same trained network read at three depths, over three
                  weight seeds.
                </p>
                <p>

                  By nearest neighbor the flattened 128 find their own kind for
                  231, 234 and 237 of 240, the sixteen for 233, 230 and 235, and
                  the four scores for 229, 219 and 230. The flattened layer beats
                  the sixteen on two seeds of the three and loses on the
                  reference seed, so the preference for the layer before the
                  answer did not show up here as a clear win on this count. The
                  four scores come last on every seed.
                </p>
                <KeepInMind>

                  By nearest neighbor, the flattened 128 and the sixteen are
                  within a few pictures of each other and trade places between
                  seeds, and the four scores are the worst of the three every
                  time.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. By margin, the layer of sixteen is the clearest">
                <p>

                  A nearest-neighbor count only asks whether the single closest
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
                <p>The flattened layer has a small mean-cosine gap, but a picture&apos;s single nearest neighbor is still often the right kind. The sixteen-number representation separates the kinds more clearly on average. The four class scores have the widest mean gap and the weakest nearest-neighbor result in this comparison. Four coordinates still allow infinitely many directions. Their limitation here comes from what training asked the scores to do: choose among the four labels. That objective need not preserve the geometry we want for retrieval.</p>
                <p>The classifier&apos;s four output labels cannot name a fifth kind. Its score vectors might still distinguish some unseen pictures, so we should measure that rather than infer it from the number of coordinates. The next part introduces rings to test this.</p>
                <KeepInMind>
                  {"The sixteen-value layer's mean-cosine gap is 0.7566, compared with 0.1081 for the flattened layer. This is one reason to investigate that representation. The class-score vectors have a still larger gap in the table, so this comparison does not establish that sixteen features win every measure. Neighbor retrieval and mean separation assess different properties."}
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

                  We can also test a shape that the classifier never learned to name. If its vectors describe useful visual relationships, perhaps pictures of rings will be close to other rings. We add 60 rings to the 240 held-out pictures and find each ring&apos;s nearest neighbor among the other 299. This lets us investigate the representation beyond the labels used during fitting.
                </p>
                <PictureVectorSphere initialRings />
                <p className={caption}>
                  The rings are the hollow dots, placed with the same projection
                  as the four kinds, which was fitted without them. Most of them
                  sit together, beside and partly inside the squares.
                </p>
                <p>

                  They mostly do. On the reference network 44 of the 60 rings
                  have another ring as their nearest neighbor, and 45 and 43
                  under the other two seeds. On the reference network 15 of the
                  other 16 find a square. The mean cosine from a ring to another
                  ring is 0.7388 and from a ring to a square 0.7294, so a ring is
                  nearly as close to the squares as to other rings. Under seed 2
                  it is the other way round, 0.5088 to other rings against
                  0.5527 to squares.
                </p>
                <KeepInMind>

                  Rings find another ring as their nearest neighbor 43 to 45
                  times in 60, so they do gather, though on average a ring sits
                  about as near the squares as it does the other rings.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Here the pixels do better, and the earlier layer best of all">
                <p>

                  For the rings, raw pixels do better: 46 of 60 have another ring as their nearest neighbor. That exceeds the learned vector result under all three seeds. Let&apos;s ask the same question at each layer to see where the representation loses this useful distinction.
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
                <p>The decreasing ring result is consistent with later layers favoring distinctions useful for the four training labels. Separating a ring from a square was not part of that objective. The measurements show where this network loses a useful retrieval distinction; they do not establish that every later layer necessarily discards all information unrelated to its labels.</p>
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
                  {"Cosine divides out vector length, so any information represented by magnitude does not affect that comparison. With sixteen tanh coordinates, real-number arithmetic gives a norm below 4; finite precision can reach endpoint coordinate values. The following plot checks the actual lengths and what they correlate with in this dataset."}
                </p>
                <PictureVectorEdges view="lengths" />
                <p className={caption}>

                  Lengths of the 240 held-out vectors, and how often a nearest
                  neighbor is the right kind under each reading of near.
                </p>
                <p>The held-out vector lengths range from 1.4867 to 3.9429, with mean 2.9769; 0.2437 of their coordinates exceed 0.95 in magnitude. Length correlates with the top class probability at 0.4355 in this sample. That associates magnitude with a model output, not calibrated correctness. Angular comparison discards magnitude, while both distance choices here return the correct nearest-neighbor kind for 233 of 240 queries.</p>
                <p>
                  {"A zero vector has no direction, so cosine is undefined for it. Tanh produces a zero vector when all its pre-activations are zero. ReLU produces one whenever every unit is inactive. Whether either case occurs depends on the inputs, parameters and selected layer; the activation name alone does not establish that it is impossible or negligible."}
                </p>
                <KeepInMind>
                  A vector&rsquo;s length here is between 1.4867 and 3.9429 and
                  tracks confidence at a correlation of 0.4355. The angle
                  discards it, and at the origin the angle is undefined.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A picture holding nothing">
                <p>
                  {"A blank image still produces a vector and class scores in this network. That output is mathematically defined, but the classifier has no blank category. The examples below test how a representation trained on four shape classes behaves when no shape is present."}
                </p>
                <PictureVectorEdges view="blank" />
                <p className={caption}>
                  Four pictures with nothing drawn in them, at four flat
                  brightnesses, and where each lands.
                </p>
                <p>
                  An all-black picture and a flat one at 0.15 light none of the first convolution&rsquo;s 1,024 numbers, so nothing of either picture gets past the first layer, and the two receive exactly the same vector, at a cosine of 1.0000. That vector depends on nothing but the network&rsquo;s own biases carried through its weights, and it is named a bar at a probability of 0.8921, with a mean cosine of 0.7629 to the held-out bars.
                </p>
                <p>A flat picture at brightness 0.3 activates 464 of the first convolution&apos;s 1,024 values and is named a bar with probability 0.9324. Although it contains no drawn shape, its brightness still affects the computation alongside the learned weights and biases. A confident output therefore does not establish that the input contained the kind the classifier names.</p>
                <KeepInMind>
                  {"The two dark blank examples activate none of the first convolution's outputs and receive the same vector, classified as a bar with probability 0.8921. This is a measured collision for those inputs. It does not prove that every possible dark or blank image produces that vector."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A brightness training never showed">
                <p>Training placed every shape between 0.4 and 0.7 above its background. Much dimmer or brighter inputs change that training condition. Their underlying geometry is unchanged by uniform positive scaling, but a learned feature map is not automatically invariant to the change. We can measure whether the comparison remains useful instead of assuming that the class label supplies that guarantee.</p>
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
                  {"At a quarter of their original brightness, all four tested images are classified as bars; the cross's vector has cosine −0.1928 with its original vector. This shows a failure under that brightness change. It does not establish that representations can never transfer beyond training conditions; such transfer needs its own evaluation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. When the Image Cannot Supply a Useful Descriptor" id="25-where-the-method-stops-being-defined">
                <p>The following cases separate an undefined comparison from a representation that is defined but unhelpful for the task. A zero-length vector has no angular direction, while an unfamiliar or empty picture can still receive a numerical embedding and class scores. Those outputs need interpretation against the distinctions and conditions represented during training.</p>
                <DerivationTable
                  expressionHeading="Image or vector condition"
                  reasonHeading="Effect on the image comparison"
                  rows={[
                    {
                      expression: "a vector of length zero",
                      reason: "Cosine is undefined because the vector has zero norm. Tanh gives a zero output vector when all pre-activations are zero; ReLU does so when every unit is inactive. Euclidean distance remains defined. Two zero vectors have distance zero, while a zero vector's distance from a nonzero vector equals that other vector's norm. That fallback changes the comparison being made.",
                    },
                    {
                      expression: "a picture holding nothing",
                      reason: "A blank image still has brightness values and produces a defined computation. The two tested dark blank inputs activate no first-layer units and therefore receive the same later vector, classified as a bar at 0.8921. Other blank brightnesses can activate different units, so the conclusion should not be extended to every blank image.",
                    },
                    {
                      expression: "a picture of another size",
                      reason: "This fixed network expects 128 flattened values: 8 channels of 4 by 4 after pooling a 16 by 16 image. A 20 by 20 input would instead give 8 by 5 by 5, or 200 values, so it does not match that dense layer. One alternative architecture summarizes each of the 8 channels spatially. This removes the explicit spatial grid from the descriptor, although its learned channels can still carry location-dependent information.",
                    },
                    {
                      expression: "a kind the network was never taught",
                      reason: "The embedding and its distances remain defined. Features learned from four categories may transfer to another shape, but that needs evaluation. Here 43 to 45 of the 60 rings find another ring as nearest neighbor, compared with 46 under pixel distance. The classifier's four output labels still cannot name ring as an additional category.",
                    },
                    {
                      expression: "vectors from two different trainings",
                      reason: "Equal-width vectors from separate fits can be compared numerically, but matching coordinates are not automatically aligned. The reported corresponding-vector mean cosines are −0.1387 and 0.0187 across two retrainings. Cross-model comparison needs evidence of a shared representation or an alignment procedure; it is not mathematically undefined merely because the models were trained separately.",
                    },
                    {
                      expression: "a collection holding one picture",
                      reason: "the nearest other picture names a set with nothing in it, so the question has no answer rather than a bad one.",
                    },
                    {
                      expression: "two pictures exactly as near",
                      reason: "If the application requires one result, it needs a declared tie-breaking rule. Choosing the earlier picture is deterministic, but does not make it closer. Another application might use a stable identifier or return every tied result. The distance calculation alone does not choose among equal distances.",
                    },
                    {
                      expression: "a picture brighter or dimmer than any trained on",
                      reason: "The representation is still defined, but its behavior under this brightness change is worse in the measured examples. At a quarter of their original brightness, all four images of step 6 are classified as bars. Evaluate such input changes explicitly rather than assuming the class objective guarantees brightness invariance.",
                    },
                    {
                      expression: "a question the labels never asked",
                      reason: "For example, we might want to compare the sizes of two crosses. The classifier was evaluated on shape categories, so that result alone does not establish size-sensitive retrieval. Some size information may remain in the features; testing labeled size comparisons would tell us whether it supports the new task.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"These cases require different responses. An incompatible input shape can fail before a vector is produced, and a zero vector has no cosine direction. Blank images, unfamiliar shapes and new brightness conditions can instead produce valid vectors whose task behavior needs testing. Keep those mathematical and empirical questions separate."}
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
              "The four class scores have the widest mean-cosine gap but the poorest nearest-neighbor count in these runs. Four coordinates allow infinitely many directions; the result is not a four-direction limit. Classification training and nearest-neighbor retrieval reward different properties. The sixteen-number representation is useful here because of its measured retrieval behavior, rather than a rule that a particular width must work best.",
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
              "The flattened representation retrieves same-ring neighbors more often than the deeper representations in this test. Later layers were trained for four known classes, so their objective need not retain every distinction useful for an unseen ring category. The measured decline supports checking multiple layers; it does not establish that deeper features must always generalize worse.",
            ),
            trueFalse(
              "The reference network names ring 0 a square at a probability of 0.9371, close to the 0.9842 it gave a real square, so nothing in its answer marks the ring as a kind it never saw.",
              true,
              "The classifier must distribute probability among its four known classes, and it labels 48 of the 60 rings as square outlines. It has no explicit unknown-class output. A high maximum probability is therefore not a reliable signal that an image belongs to a training category. Unknown-input detection would require another design and evaluation.",
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
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "First convolution: 1,024 outputs\nflat brightness 0:     0 positive outputs\nflat brightness 0.15:  0 positive outputs\nflat brightness 0.30: 464 positive outputs\n\nThe first two pictures reach identical later-layer vectors.\nVector length versus top-class probability: correlation 0.4355\nCosine similarity divides the dot product by both vector lengths."
              },
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
              "Dimming preserves the spatial arrangement of these shapes but changes their pixel values. Their learned vectors move toward the blank-image representation, and their predicted class becomes bar. The training images used a narrower brightness range, so this test exposes sensitivity outside that range. A representation is not automatically brightness-invariant because it was trained to recognize shape classes.",
            ),
        ],
        },
        {
          title: "Practice. Reading A Vector Off A Network Of Your Own",
          practice: [
            exercise(
              "Build the network of Part 2 and count what it learns",
              [
  "Build the supplied seven-layer image network: two convolution/pooling rounds, flattening, a sixteen-unit tanh layer and a four-score output layer. Keep the channel and spatial dimensions declared in the starter.",
  "For each layer print its output shape, output-value count and learned-parameter count. Finish with the total learned parameters. Count kernels/weights and biases; pooling and flattening store no learned parameters."
],
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
              { hints: [
  "Inspect each layer’s shape.answers and shape.n_outputs before counting its stored arrays.",
  "Conv2d stores kernels and bias_vector; DenseLayer stores weight_matrix and bias_vector. Array .size counts all entries."
], check: numberCheck("How many learned numbers does the network hold in all?", 2468, 0.5, "There are 2468 learned parameters. The sixteen-unit dense layer holds most because it connects each unit to every flattened input; output-value count is a separate measurement."), question: "Where does this image network keep its learned parameters?" },
            ),
            exercise(
              "Train on a dozen pictures and compare them by vector and by pixels",
              [
  "The starter generates twelve pictures, six crosses and six square outlines, and trains the supplied network for forty full-batch passes. Use its sixteen-unit hidden output as each picture’s vector.",
  "Print mean cosine similarity within a kind and across kinds. Then count same-kind nearest neighbors using vector cosine and raw-pixel distance, excluding each picture itself.",
  "These comparisons reuse the twelve training pictures. They demonstrate the measurement procedure, not held-out retrieval accuracy."
],
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
              { hints: [
  "Keep each picture’s label beside its vector so pair groups and neighbor labels use the same order.",
  "Use each distinct within-kind pair once, and all cross-kind pairs. Exclude the diagonal when selecting neighbors."
], check: numberCheck("What mean cosine do two pictures of one kind have in the trained network's sixteen numbers?", 0.6983, 0.001, "Same-kind training pairs average cosine 0.6983 here. Compare this with the cross-kind mean and then evaluate unseen pictures before treating the grouping as general retrieval accuracy."), question: "Do learned vectors find same-kind pictures more reliably than raw pixels?" },
            ),
            exercise(
              "Ask whether training did the gathering",
              [
  "Compare start, the preserved initial network, with stack, its trained version, on the same twelve supplied pictures.",
  "For each print classification count, mean within-kind cosine, mean across-kind cosine, their difference and same-kind nearest-neighbor count. Read both representations from the sixteen-unit hidden layer.",
  "The comparison changes learned parameters while keeping architecture, pictures and measurement definitions fixed."
],
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
              { hints: [
  "Use the corresponding hidden output from each network, preserving the same picture/label order.",
  "Compute all summaries separately for the initial and trained vectors. A classification score and a retrieval score test different uses of them."
], check: numberCheck("What gap between the mean cosine within a kind and across kinds does the untrained network open?", -0.013, 0.001, "The initial within-kind mean is slightly below the cross-kind mean, giving a gap of −0.0130. On these twelve training images, the trained representation separates the two shape classes more clearly. Evaluation on new images is a separate check."), question: "Which part of the picture grouping comes from training?" },
            ),
            exercise(
              "Dim a picture and watch its vector move",
              [
  "Use the trained small network and its first cross. Multiply all pixel values by 0.25, 0.5, 1.0 and 2.0 without retraining.",
  "For each brightness print cosine similarity to the original hidden vector, vector length and predicted class. Keep the original vector as the reference for every row.",
  "This probes brightness sensitivity of this fitted network; two-class success here does not establish brightness invariance."
],
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
              { hints: [
  "Extract the original sixteen-coordinate vector once. Recompute it for each brightness-scaled input.",
  "Compare directions with cosine and lengths with the norm, then obtain the class from the output scores."
], check: numberCheck("What cosine does the cross at a quarter of its brightness have to its own full-brightness vector?", 0.5684, 0.001, "The quarter-brightness vector has cosine 0.5684 to its original. The shape is unchanged, but this learned representation is sensitive to the altered pixel scale."), question: "Does preserving a picture’s shape also preserve its learned vector?" },
            ),
          ],
        },
      ]}
    />
  );
}
