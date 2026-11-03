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
import { ChainLedger } from "@/components/widgets/ChainLedger";
import { CoercedNumbers } from "@/components/widgets/CoercedNumbers";
import { ExtentProbe } from "@/components/widgets/ExtentProbe";
import { SeamChecker } from "@/components/widgets/SeamChecker";
import { ShapeStackBuilder } from "@/components/widgets/ShapeStackBuilder";
import { SharedLayerStep } from "@/components/widgets/SharedLayerStep";
import { WindowPositions } from "@/components/widgets/WindowPositions";

export const metadata: Metadata = {
  title: "The Shape Guarantee · Perceptron Lab",
  description:
    "An array's shape records how values are arranged and which belong to the same example. Flattening puts each example's values into a vector, so the original spatial organization is no longer explicit.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ShapesAndFlatteningPage() {
  return (
    <ConceptPage
      lessonId="shapes-and-flattening"
      intuition={lessonIntuitions["shapes-and-flattening"]}
      technicalStart="Part 3. One Seam, Settled in Integers"
      openingTitle="The Right Number of Values Can Still Be the Wrong Shape"
      playgroundTitle="Which layer outputs can the next layer read?"
      playgroundIntro="Compare each layer's output shape with the next layer's expected input. Look for cases with equal value counts but different arrangements."
      title="The Shape Guarantee"
      tagline={"An array's shape records how values are arranged and which belong to the same example. Flattening puts each example's values into a vector, so the original spatial organization is no longer explicit."}
      prerequisites={
        <>
          The layers joined here are the{" "}
          <Link href="/concepts/convolution" className={link}>
            convolution
          </Link>{" "}
          and{" "}
          <Link href="/concepts/pooling" className={link}>
            pooling
          </Link>{" "}
          layers that read a picture, and the{" "}
          <Link href="/concepts/dense-layers" className={link}>
            dense layer
          </Link>{" "}
          that reads a row. Nothing on this page needs calculus, and almost
          nothing on it needs arithmetic beyond division with the remainder
          thrown away.
        </>
      }

      playground={<ShapeStackBuilder />}
      sections={[
        {
          title: "Part 1. What a Network Refuses to Be",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A chain that cannot work">
                <p>{"A digit-classification network can be described as an ordered list of layers before we pass it any images. In this chain, eight convolution kernels produce response maps, pooling reduces them, and another convolution and pooling stage prepare the representation for dense layers. The final output has ten entries, one per digit. Each connection still needs a precise agreement about the shape it receives and produces."}</p>
                <p>{"Adjacent layers need to agree on the arrangement of their inputs and outputs. A convolution returns channels with rows and columns; the dense layer here expects one row of values. A flattening step preserves those values while arranging them in the form the dense layer accepts. Load the missing flatten preset to see the mismatch marked red, then the digit chain to see the compatible connections in green."}</p>
                <p>This check compares the shapes declared by neighboring layers. It does not train the network or pass an image through it. The digit chain has six connections to check. A compatible shape is necessary for those connections to run, although it does not establish that the numerical operations or learned predictions are correct.</p>
                <KeepInMind>
                  This page checks whether the declared layer shapes are compatible before running a batch. Passing that check does not establish that the data values are valid or that the network will learn useful predictions.</KeepInMind>
              </SubSection>

              <SubSection title="2. Why the refusal comes before the data">
                <p>If we wait until a batch reaches an incompatible layer, the failure occurs during execution. An array error may report mismatched dimensions without identifying the intended connection between layers. Checking the declared shapes first lets this SDK name the adjacent layers and both arrangements before training starts.</p>
                <p>The digit chain has seven layers and six adjacent joins. Checking those joins compares tuples with at most three entries each. It needs no batch and performs none of the network’s forward calculations.</p>
                <InAModel>
                  Deeper networks make the argument stronger rather than
                  weaker. Every seam a chain adds is one more comparison at
                  construction and one more place a run could otherwise fail
                  after minutes of work, so the saving grows with exactly the
                  thing that makes the mistake easier to make.
                </InAModel>
                <KeepInMind>
                  What checking early buys is a refusal that can name the seam
                  and both sides of it. A failure that arrives inside an array
                  operation has only the two arrays to describe, and it has
                  already cost whatever the run had spent up to that point.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The two facts the data supplies">
                <p>
                  Only the two ends of a chain have anything to do with the
                  data. The first layer has to read what the pictures actually
                  are, which for a handwritten digit is one channel of
                  twenty-eight rows by twenty-eight columns. The last layer has
                  to answer with what the task wants, which for ten digits is
                  ten numbers. Everything between those two is internal, chosen
                  by whoever wrote the network, and settled among the layers
                  themselves.
                </p>
                <p>{"The digit chain declares an input shape of (1, 28, 28) and an output shape of (10,). Those describe the image supplied by the caller and the prediction it receives. The intermediate counts, 5408 after the first convolution, 1352 after the first pooling layer and 400 at the bridge, describe internal representations. They belong to the architecture rather than requiring additional measurements from the caller."}</p>
                <KeepInMind>
                  The caller supplies the input representation and chooses the required output. Once the intermediate layers and their settings are declared, their shapes can be derived and compared without running the data through them.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Shape Is an Arrangement, Not a Count",
          content: (
            <>
              <SubSection title="4. What a layer says about its two sides">
                <p>A layer declares the shape of one input example and the shape of one output example. Each is a tuple containing the size of every axis. A digit image has one channel, twenty-eight rows and twenty-eight columns, written (1, 28, 28). A feature row with thirty-six entries has one axis, written (36,). An axis size is also called an extent.</p>
                <p>
                  A dense layer is not a special case, only the case where the
                  arrangement happens to have one side. Ten neurons reading a
                  row of thirty-six have the shape (36,) to (10,), which is the
                  same object as the convolution&rsquo;s (1, 28, 28) to
                  (8, 26, 26) with shorter tuples in it.
                </p>
                <Equation>{"reads    (1, 28, 28)\nanswers  (8, 26, 26)"}</Equation>
                <p>An element count alone would report 784 for the input image. It would not identify the channel, row and column axes. A dense layer needs a feature row, while a convolution uses the spatial arrangement to choose neighboring pixels. Keeping the complete shape lets the connection check distinguish those representations.</p>
                <KeepInMind>
                  The input and output shapes have different roles. Keeping them in named fields makes it clear which arrangement a layer accepts and which it produces.</KeepInMind>
              </SubSection>

              <SubSection title="5. Eight numbers, arranged two ways">
                <p>Arrange eight numbers as two channels, each with two rows and two columns: shape (2, 2, 2). The same values can be written as a feature row of shape (8,). The amount of data is equal, but the axes are different.</p>
                <p>
                  The first arrangement has shape (2, 2, 2); the flattened arrangement has shape (8,). Both contain eight values. Flattening changes how we address those values, so the receiving layer needs to know which arrangement it will get.
                </p>
                <ExtentProbe />
                <p>
                  This is also the fixture that can tell a correct report from
                  a wrong one. A chain built only out of layers that read rows
                  cannot, because for those the arrangement and the count are
                  written with the same number, so a report that quietly
                  collapsed (36,) into 36 would look identical to a report that
                  did not. Build a chain that starts by reading (2, 2, 2) and
                  it says it reads (2, 2, 2), where a collapsed report would
                  say (8,) and be refused by the chain&rsquo;s own first layer.
                </p>
                <KeepInMind>
                  Any test of arrangements written entirely out of dense layers
                  is passed by an implementation that only ever counts. The
                  fixture has to hold numbers arranged as something that is not
                  a row.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What an extent may be">
                <p>
                  An extent is a whole number of at least one, and both of the
                  ways that can fail are refused when the shape is made. Ask
                  for a picture of height zero and nothing is built. Ask for a
                  negative width and nothing is built. Ask for a side with no
                  extents at all and nothing is built.
                </p>
                <DerivationTable
                  expressionHeading="what was asked for"
                  reasonHeading="what came back"
                  rows={[
                    {
                      expression: "(1, 0, 28)",
                      reason:
                        "refused, in the words “n_inputs extents must be at least 1, got 0”.",
                    },
                    {
                      expression: "(1, 28, −1)",
                      reason:
                        "refused, in the words “n_inputs extents must be at least 1, got −1”.",
                    },
                    {
                      expression: "a reading side with nothing in it",
                      reason:
                        "refused, in the words “n_inputs needs at least one extent”.",
                    },
                    {
                      expression: "an answering side with nothing in it",
                      reason:
                        "refused, and the message names that side instead, “n_outputs needs at least one extent”.",
                    },
                  ]}
                />
                <p>This SDK requires every declared extent to be positive, so it rejects a zero-height layer. That is an interface rule for these network layers. Arrays with a zero-length axis are valid in NumPy, and tuple equality would still distinguish their shapes; they do not automatically match every other arrangement.</p>
                <KeepInMind>
                  An extent of zero is refused at the point where it is
                  written, so no layer downstream ever has to carry a branch
                  for what to do when it meets one.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A count is a product, and a product forgets">
                <p>
                  Beside the arrangement, each side of a shape reports how many
                  numbers it holds, and that figure is simply the extents
                  multiplied together. It is a genuinely useful number, since a
                  dense layer really does need exactly that many weights per
                  neuron, and it is a lossy summary of the thing it was
                  computed from.
                </p>
                <Equation>{"(8, 26, 26)   holds  8 × 26 × 26  =  5408 numbers\n(26, 8, 26)   holds  26 × 8 × 26  =  5408 numbers\n(4, 52, 26)   holds  4 × 52 × 26  =  5408 numbers\n(5408,)       holds              5408 numbers"}</Equation>
                <p>
                  Four different arrangements, one count. Multiplication does
                  not care about the order of its arguments and does not
                  remember how many of them there were, so every one of those
                  reports 5408 and only one of them is what a particular
                  convolution actually produced.
                </p>
                <WorkedExample>
                  <p>
                    The first convolution of the digit chain reads (1, 28, 28),
                    which holds 784 numbers, and answers (8, 26, 26), which
                    holds 5408. Both facts come back from the same object, and
                    the page keeps them in separate columns everywhere it shows
                    them, because a reader who has only the second column
                    cannot recover the first.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The count is derived from the arrangement and never the other
                  way round. Anything that decides a question using the count
                  alone has thrown away information it was handed.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Deciding whether the seven-layer digit chain is well formed costs six comparisons of tuples that are at most three numbers long.",
              true,
              "Each neighboring pair contributes one shape comparison, so seven layers require six comparisons. These checks use only the declared dimensions. They can find an incompatible connection before a batch is evaluated or training begins.",
            ),
            choice(
              "The digit chain reports that it reads (1, 28, 28) and answers (10,). Which figures in the chain does a reader have to reconcile against the world?",
              [
                "Only those two, since the first layer has to read what the pictures are and the last has to answer what the task wants",
                "The 784 numbers in the picture and the 5408 the first convolution produces",
                "The 5408 handed up by the first convolution and the 400 that arrive at the bridge",
                "The window size and the stride of each convolution",
              ],
              0,
              "The input shape must match how each example is represented, and the output shape must match the answers the application needs. Intermediate shapes describe representations chosen within the network. They still affect computation and capacity, but a caller supplies the input at one end and reads the result at the other.",
            ),
            choice(
              "Why is each side of a shape written as a tuple of extents rather than as a single count of how many numbers it holds?",
              [
                "A count works perfectly for a dense layer and destroys the only thing a convolution cares about",
                "A count is more expensive to compare than a tuple",
                "A dense layer cannot be described by a count at all",
                "The count cannot be worked out from the extents",
              ],
              0,
              "A dense layer’s neurons hold one weight per arriving number and have no notion of a row or a column, so a count tells them everything. A convolution’s whole subject is neighborhood, so collapsing (8, 26, 26) to 5408 throws away what it exists to exploit. The count is the extents multiplied together, so it is derived from the arrangement and never the other way round.",
            ),
            several(
              "This SDK’s shape type requires a nonempty tuple of positive integer extents. Which requests are rejected when constructing that shape?",
              [
                              "A picture of height zero",
                              "A negative width",
                              "A side with no extents at all",
                              "An extent larger than the one in the layer beneath",
                            ],
              [0, 1, 2],
              "Zero, negative and empty-tuple requests violate this SDK’s stated shape contract. These are design rules for this layer interface; NumPy itself does support arrays with zero-sized axes and scalar arrays. Whether two otherwise valid layer shapes meet is a separate comparison at their connection.",
            ),
            trueFalse(
              "A chain built only out of dense layers cannot tell an implementation that compares arrangements from one that only ever counts.",
              true,
              "For a row the arrangement and the count are written with the same number, so a report that quietly collapsed (36,) into 36 would look identical to one that did not. The fixture has to hold numbers arranged as something that is not a row. A chain that starts by reading (2, 2, 2) says it reads (2, 2, 2), where a collapsed report would say (8,) and be refused by the chain’s own first layer.",
            ),
        ],
        },
        {
          title: "Part 3. One Seam, Settled in Integers",
          content: (
            <>
              <SubSection title="8. The one comparison a join makes">
                <p>
                  Between two layers there is one question. Can the upper layer
                  read what the lower layer hands it? Everything a chain
                  guarantees is that question asked once per seam, and the
                  answer is an equality of two tuples.
                </p>
                <Equation>{"a layer follows another when\n    previous.answers  ==  this.reads"}</Equation>
                <p>
                  Equality of tuples compares length first and then each extent
                  in turn, so (8, 26, 26) and (5408,) are unequal before the
                  numbers in them are even looked at. That comparison lives on
                  the shape rather than in whichever loop is assembling the
                  network, because whether two layers fit together is a
                  sentence about two shapes and about nothing else.
                </p>
                <KeepInMind>
                  Each seam costs one comparison of two tuples, and no
                  arithmetic is done on the extents inside them. The six seams
                  of the digit chain are six such comparisons.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The case where the counts agree">
                <p>
                  Now the case the whole check exists for. Sweep eight kernels
                  of three by three across the digit picture and the answer is
                  (8, 26, 26). Put a dense layer straight above it and write
                  down how many numbers it reads, which anybody working it out
                  by hand computes as eight times twenty-six times twenty-six,
                  and the dense layer reads (5408,).
                </p>
                <p>A count-only check would accept this connection because both sides contain 5408 values. The dense layer still expects a feature row, so passing the unchanged feature maps to it fails its arrangement check. If we explicitly flatten the maps, the connection becomes valid. Flattening preserves the values and can be reversed when the original shape and reading order are known; it does not by itself prove that a trained model will perform worse.</p>
                <SeamChecker />
                <p>
                  The seam is refused, and the refusal says so in as many
                  words.
                </p>
                <Equation>{"layer 0 answers with (8, 26, 26) and layer 1 reads (5408,);\nboth hold 5408 numbers, so it is the arrangement that\ndisagrees and not the width"}</Equation>
                <KeepInMind>
                  A count comparison does not fail loudly on this case. It
                  passes, which is why the arrangement is compared instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Three rearrangements a count would have let through">
                <p>Other arrangements can also contain 5408 values. Swapping the channel and row axes gives (26, 8, 26). Another possible arrangement is (4, 52, 26). Neither matches the convolution’s declared (8, 26, 26) output. Such conversions need explicit operations; equal counts do not perform or justify them.</p>
                <NumberTable
                  headings={[
                    "what the upper layer reads",
                    "numbers",
                    "counts agree",
                    "seam holds",
                  ]}
                  rows={[
                    ["(8, 26, 26)", "5408", "yes", "yes"],
                    ["(5408,)", "5408", "yes", "no"],
                    ["(26, 8, 26)", "5408", "yes", "no"],
                    ["(4, 52, 26)", "5408", "yes", "no"],
                    ["(784,)", "784", "no", "no"],
                  ]}
                  caption="Every row sits above a convolution answering (8, 26, 26). Four of the five agree on the count and one of the five holds."
                />
                <p>Four entries in the count column are 5408, but only the exact (8, 26, 26) arrangement matches the convolution’s output. The other three require a conversion before they can describe what the next layer receives. Comparing counts alone cannot identify which conversion is intended.</p>
                <KeepInMind>
                  Equal counts is a far weaker statement than equal
                  arrangement, and the weaker statement admits mistakes that do
                  not announce themselves at any later point.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. When the widths disagree as well">
                <p>
                  State a width the counts do not even agree on and the same
                  seam is refused with less to say. A dense layer told it reads
                  (784,), which is the count of the picture that went in rather
                  than the count of what came out, is placed above the same
                  convolution and is refused with the sentence stopping after
                  the two arrangements.
                </p>
                <Equation>{"layer 0 answers with (8, 26, 26) and layer 1 reads (784,)"}</Equation>
                <p>Here the element counts differ as well: 5408 values are produced and the dense layer expects 784. The message reports both complete arrangements. It does not add the equal-count explanation used in the previous case.</p>
                <KeepInMind>
                  The extra clause appears only when the counts agree, which is
                  the one situation where a reader would otherwise think the
                  refusal was itself a mistake.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Why the refusal names both arrangements">
                <p>Suppose an error reported only that layer 0 produces 5408 values and layer 1 expects 5408. The counts agree, so the message would hide the reason for rejection: one side has three axes and the other has one.</p>
                <p>The error therefore reports the complete input and output shapes. When the counts agree, it also states that their arrangements differ. That gives us enough information to decide whether an explicit flattening or another conversion belongs between the layers.</p>
                <WhyThisWorks title="Why matching element counts do not guarantee matching shapes">
                  <p>A connection test should check both the decision and the explanation returned to the caller. In this example, rejecting the incompatible tuples is correct. Reporting only their equal counts would leave the cause unclear. Testing the displayed shapes catches that separate reporting error.</p>
                </WhyThisWorks>
                <KeepInMind>
                  Naming both arrangements is what turns the refusal into an
                  instruction. A reader told that (8, 26, 26) met (5408,) knows
                  to put a bridge between them; a reader told that 5408 met
                  5408 has been given nothing to act on.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Where the Picture Becomes a Row",
          content: (
            <>
              <SubSection title="13. Adding a Flattening Layer" id="13-the-bridge-said-out-loud-as-a-layer">
                <p>To connect these convolution outputs to a dense layer, we need a row containing every feature-map value. That requires a stated conversion from (8, 26, 26) to (5408,). A count-only connection check would conceal the conversion rather than perform it.</p>
                <p>
                  So the extents keep having to match exactly, and the one
                  legitimate conversion is written down as a layer of its own.
                  A flattening layer reads (8, 26, 26) and answers (5408,), and
                  it carries that conversion inside its own shape, so both of
                  its seams are settled by the same exact equality as every
                  other seam in the chain.
                </p>
                <Equation>{"conv     (1, 28, 28)  →  (8, 26, 26)\nflatten  (8, 26, 26)  →  (5408,)\ndense    (5408,)      →  (10,)"}</Equation>
                <p>
                  Three layers, two seams, both green. The bridge is something
                  a network states it has rather than a hole in the rule that
                  would have caught its absence, and that is the entire design
                  decision.
                </p>
                <KeepInMind>
                  An explicit flattening layer declares the conversion and lets both adjacent joins use the same shape comparison as the rest of the network. A count-only rule cannot distinguish this intended conversion from other rearrangements.</KeepInMind>
              </SubSection>

              <SubSection title="14. Counting the numbers at every step">
                <p>
                  The full digit chain is two convolutions each followed by a
                  pooling layer, then the bridge, then two dense layers. Watch
                  the count of numbers along it and the shape of the whole
                  design becomes visible in one column.
                </p>
                <ChainLedger />
                <p>
                  The picture arrives holding 784 numbers, and the first
                  convolution takes it to 5408, since eight kernels each
                  produce a whole picture of their own and the sides shrink by
                  only two. The first pooling layer takes it back to 1352, the
                  second convolution raises it to 1936, the second pooling
                  layer brings it to 400, and the bridge leaves it at 400.
                  Then the dense layers cut it to 32 and to 10.
                </p>
                <NumberTable
                  headings={["step", "answers", "numbers"]}
                  rows={[
                    ["the picture", "(1, 28, 28)", "784"],
                    ["convolution, 8 kernels of 3 × 3", "(8, 26, 26)", "5408"],
                    ["pooling, 2 × 2 at stride 2", "(8, 13, 13)", "1352"],
                    ["convolution, 16 kernels of 3 × 3", "(16, 11, 11)", "1936"],
                    ["pooling, 2 × 2 at stride 2", "(16, 5, 5)", "400"],
                    ["flatten", "(400,)", "400"],
                    ["dense, 32 neurons", "(32,)", "32"],
                    ["dense, 10 neurons", "(10,)", "10"],
                  ]}
                  caption="The chain reads (1, 28, 28) and answers (10,). The bridge is the one step whose count is the same on both sides."
                />
                <p>

                  The bridge is the only row in that table where the two counts
                  are equal, and that is not a coincidence about this
                  particular chain. Flattening is a relabeling of the numbers
                  it was handed, so it cannot change how many there are.
                </p>
                <KeepInMind>
                  The largest representation in this chain appears after the first convolution. The count then falls, rises at the second convolution and falls again. Flattening changes the arrangement while preserving the count; pooling is what reduces it at the preceding step.</KeepInMind>
              </SubSection>

              <SubSection title="15. Taking the bridge out">
                <p>
                  Now delete the bridge from that chain and leave everything
                  else where it was. The second pooling layer answers
                  (16, 5, 5), the dense layer above it is written to read the
                  400 numbers that arrive, and the seam between them is
                  refused.
                </p>
                <Equation>{"layer 3 answers with (16, 5, 5) and layer 4 reads (400,);\nboth hold 400 numbers, so it is the arrangement that\ndisagrees and not the width"}</Equation>
                <p>
                  The dense layer itself was built without complaint, because
                  400 weights per neuron is a perfectly ordinary layer and
                  nothing about it is wrong in isolation. Every seam above it
                  holds too, since the dense layers agree with each other. One
                  seam out of five is red, and the chain does not exist.
                </p>
                <KeepInMind>
                  The refusal names a position and the two arrangements at it,
                  because every layer in this chain was built without
                  complaint. A dense layer reading 400 numbers is a perfectly
                  ordinary layer; what is wrong is where it was put.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A bridge over a row, which changes nothing">
                <p>
                  Hand a flattening layer a row instead of a picture and it
                  reads (36,) and answers (36,). It is the identity, it moves
                  nothing, and it is still worth having, because it states a
                  join that a reader would otherwise be carrying in their head.
                </p>
                <p>
                  A chain of a bridge over a row followed by a dense layer
                  holds, with the seam green and the chain reporting that it
                  reads (36,). Nothing objects to the redundancy and nothing
                  needs to.
                </p>
                <KeepInMind>
                  Flattening a row is allowed, since the reading side and the
                  answering side of that layer are the same tuple and every
                  seam around it still holds by exact equality.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The way back down">
                <p>{"Flattening changes the arrangement of entries without changing their values. Its backward pass restores the original arrangement of the arriving derivatives using the inverse reshape. The loss derivative associated with one flat-row position belongs to the same entry that occupied that position in the image's declared reading order."}</p>
                <p>{"Forward and backward reshaping must use the same reading order, with the last extent varying fastest here. A different order on the way back would still produce an array of the expected shape, but its derivatives would refer to the wrong pixels. Shape agreement alone cannot detect that mistaken correspondence."}</p>
                <WorkedExample title="Where one number lands">
                  <>
                    <p>
                      Take section 5&rsquo;s eight numbers arranged as (2, 2, 2). With
                      the last extent varying fastest, the row is filled by walking
                      along one row of the picture, then down to the next row, and
                      only then on to the next channel. A number at channel c, row i
                      and column j of a picture with h rows and w columns therefore
                      lands at one known position of the flat row, counting from
                      zero.
                    </p>
                    <Equation>{"position = c × (h × w) + i × w + j\n\nchannel 1, row 0, column 1 of (2, 2, 2)\nposition = 1 × (2 × 2) + 0 × 2 + 1 = 5"}</Equation>
                    <p>{"A single nonzero entry at that location appears at position 5 of the flattened row. Sending an input derivative only to position 5 restores it to channel 1, row 0, column 1. No other position receives it. The layer reports no parameter gradient because reshaping has no trainable parameters."}</p>
                  </>
                </WorkedExample>
                <p>Flattening has no trainable parameters. Its backward operation rearranges the incoming gradient to the original input shape; there is no parameter gradient or optimizer update for this layer. A zero-filled parameter array would imply parameters that this operation does not have.</p>
                <KeepInMind>
                  Flattening performs a reshape in each direction, with no learned parameters or numerical transformation of the entries. Within the reshape, NumPy can reuse the same storage when the layout permits a view. The SDK’s input conversion may still make a copy, so this does not establish that the complete layer call allocates no new storage.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "A seam check that compared counts would fail loudly on a dense layer written to read (5408,) placed straight above a convolution answering (8, 26, 26).",
              false,
              "A count-only check would accept this connection because both shapes contain 5,408 values. It would miss the difference between spatial axes and a flat feature axis. What happens at evaluation then depends on the implementation: it might fail or interpret the values incorrectly. Passing a count check is no evidence that training will work or converge.",
            ),
            several(
              "A convolution answers (8, 26, 26). Which of these readings, placed straight above it, are refused?",
              [
                              "(5408,)",
                              "(26, 8, 26)",
                              "(4, 52, 26)",
                              "(784,)",
                            ],
              [0, 1, 2, 3],
              "All four are refused, because a seam holds only when the two tuples are equal and the one reading that holds is (8, 26, 26) itself. The flat row of 5408, the swap that turns rows into channels and the halving of one extent against the doubling of another all hold 5408 numbers, so a count comparison would have let those three through. (784,) is the count of the picture that went in rather than of what came out, so there the counts disagree as well and the refusal says less.",
              {
                "description": "This SDK requires exact equality between the output shape tuple of one layer and the input shape tuple of the next. It does not silently flatten, transpose or reshape a connection."
              },
            ),
            choice(
              "When does the refusal add the clause saying it is the arrangement that disagrees and not the width?",
              [
                "Only when the two sides really do hold the same count",
                "On every refused seam, so the reader always knows what to look at",
                "Only when one of the two sides is a flat row",
                "Only on the seam nearest the picture",
              ],
              0,
              "The extra clause appears when the element counts agree but the shape tuples differ. It explains why two arrangements containing 5,408 values can still be incompatible. When the counts also differ, the displayed input and output shapes already show that mismatch.",
            ),
            choice(
              "Along the digit chain the count of numbers runs 784, 5408, 1352, 1936, 400, 400, 32 and 10. Which step leaves the count where it was, and why?",
              [
                "The flatten, since it relabels the numbers it was handed and cannot change how many there are",
                "The second pooling layer, since a window of two at a stride of two only rearranges what it reads",
                "The first convolution, since its sides shrink by only two",
                "The last dense layer, since ten answers are what the task wants",
              ],
              0,
              "The bridge reads (16, 5, 5) and answers (400,), which is 400 numbers on both sides. The count peaks at 5408 straight after the first convolution, because eight kernels each produce a whole picture of their own, and it is the pooling layers that bring it down, to 1352 and then to 400. Where the picture becomes a row is not where the data gets smaller.",
            ),
            several(
              "Which statements hold for this SDK’s flattening layer?",
              [
                "It has no trainable-parameter gradient, but still passes the arriving gradient back to its input",
                "Its backward reshape uses the same ordering as its forward one, with the last extent varying fastest",
                "It reshapes rather than copies wherever the numbers are already laid out contiguously",
                "Handing it a row rather than a picture is refused, since there is nothing to flatten"
              ],
              [0, 1, 2],
              "There are no parameters to update, but the input still needs a gradient. Backward reshapes that gradient to the original input shape using the same element order. A contiguous input permits a view rather than a data copy here. Flattening an already flat row is allowed and leaves its shape unchanged.",
              {
                "description": "Use the SDK’s order-preserving reshape: the last axis varies fastest. Flattening has no learned weights. Its forward input is a contiguous array, allowing the reshape to use the existing storage."
              },
            ),
        ],
        },
        {
          title: "Part 5. The Arithmetic Behind Every Extent",
          content: (
            <>
              <SubSection title="18. Sliding a window along a side">
                <p>For these undilated convolution and pooling layers, the number of window positions determines each spatial output extent. Start with a side of length n, a window of width k and a stride of s. Place the first window at the left edge, then count how many additional full strides still leave the entire window inside the input.</p>
                <Equation>{"positions  =  (n − k) // s  +  1"}</Equation>
                <p>
                  Set the window and the stride below and count the green bars.
                  Each one is one place the window can start, and the number of
                  them is the extent the layer answers with along that side.
                </p>
                <WindowPositions />
                <p>
                  A three-wide window along an eight-wide side, one step at a
                  time, starts at six different places, so a convolution
                  reading (1, 8, 8) answers with sides of six. A window of one
                  starts everywhere and leaves the side at eight; a window of
                  eight starts in exactly one place and leaves the side at one.
                </p>
                <KeepInMind>

                  Nothing in this rule depends on what the window computes,
                  which is why a convolution and a pooling layer share it
                  exactly and differ only in what each window is summarized
                  down to.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Padding and stride in the same sum">
                <p>
                  Padding adds p rows and columns of zeros at each edge before
                  any of this happens, so the side the window walks along is
                  wider by 2p. That is the whole of its effect on the
                  arithmetic, and it enters the same sum.
                </p>
                <Equation>{"positions  =  (n − k + 2p) // s  +  1"}</Equation>
                <NumberTable
                  headings={["window", "stride", "padding", "sides answered"]}
                  rows={[
                    ["3", "1", "0", "6"],
                    ["3", "1", "1", "8"],
                    ["3", "2", "0", "3"],
                    ["3", "2", "1", "4"],
                    ["5", "1", "0", "4"],
                    ["5", "1", "2", "8"],
                    ["1", "1", "0", "8"],
                    ["8", "1", "0", "1"],
                  ]}
                  caption="A convolution reading (1, 8, 8), so n is 8 in every row. Rows answering 8 preserve the input side length."
                />
                <p>With stride one, a window of three and one cell of padding on each side preserves the input side length. So does a window of five with two cells of padding. More generally, an odd window of width 2m + 1 and padding m preserves that length when the stride is one.</p>
                <WorkedExample>
                  <>
                    <p>
                      The third row has input side eight, kernel side three, no padding
                      and stride two. Count the complete window positions using the
                      floor operation. The convolution in the box above sweeps four
                      kernels, so it answers with four channels of that side.
                    </p>
                    <Equation>{"output side = floor((8 + 2 × 0 − 3) / 2) + 1\n            = floor(5/2) + 1\n            = 2 + 1 = 3\noutput values = 4 channels × 3 × 3 = 36"}</Equation>
                    <p>
                      The output shape is (4, 3, 3). The leftover input position does
                      not fit another complete stride.
                    </p>
                  </>
                </WorkedExample>
                <InAModel title="Along the digit chain">
                  <>
                    <p>
                      The same sum produces every picture-shaped extent in section
                      14&rsquo;s table. None of the four windowed layers of the digit
                      chain has padding, so each side is the incoming side less the
                      window, divided by the stride with the remainder dropped, plus
                      one.
                    </p>
                    <Equation>{"convolution, window 3, stride 1    (28 − 3) // 1 + 1 = 26\npooling, window 2, stride 2        (26 − 2) // 2 + 1 = 13\nconvolution, window 3, stride 1    (13 − 3) // 1 + 1 = 11\npooling, window 2, stride 2        (11 − 2) // 2 + 1 = 5      remainder 1"}</Equation>
                    <p>
                      Only the last of the four divisions leaves a remainder, and it
                      is the dropped remainder happening in a real chain. Five windows
                      of two at a stride of two cover ten of the eleven rows and ten
                      of the eleven columns, so the last row and the last column of
                      every channel are never inside a window.
                    </p>
                    <Equation>{"numbers arriving    16 × 11 × 11 = 1936\nnumbers covered     16 × 10 × 10 = 1600\nnever read          1936 − 1600  = 336"}</Equation>
                    <p>Changing the 336 uncovered entries cannot affect these pooling outputs, because no window reads them. A covered entry can affect an output if it is selected by max pooling. Changing a covered value that remains below the window’s maximum may leave the output unchanged.</p>
                  </>
                </InAModel>
                <KeepInMind>
                  The division drops its remainder, so a window that does not
                  quite reach the far edge simply never covers those last few
                  positions, and the layer says nothing about it.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. When the window does not fit">
                <p>With no padding, a window wider than the input has no complete position to occupy. These layer constructors reject a configuration whose spatial output extent would be zero or negative. A convolution with padding must compare the window against the padded side length.</p>
                <DerivationTable
                  expressionHeading="what was asked for"
                  reasonHeading="what came back"
                  rows={[
                    {
                      expression: "conv, window 9, over (1, 8, 8)",
                      reason:
                        "refused, with the sum written out, “this convolution’s answer would have height (8 − 9 + 2 * 0) // 1 + 1 = 0, so the window does not fit over what it reads”.",
                    },
                    {
                      expression: "pooling, window 7, over (4, 6, 6)",
                      reason:
                        "refused, in the words “a window of 7 does not fit in a picture 6 by 6”.",
                    },
                    {
                      expression: "conv, window 8, over (1, 8, 8)",
                      reason: "built, answering sides of exactly 1.",
                    },
                  ]}
                />
                <p>
                  The convolution spells out its arithmetic because padding and
                  stride are both in it and a reader needs to see which of the
                  four terms they got wrong. The pooling layer has no padding,
                  so the sentence can name the two numbers and stop.
                </p>
                <KeepInMind>
                  Without padding, a window exactly as wide as the input fits in one position. A wider window has no complete position and is rejected. Padding changes the available side length, so it must be included when checking a convolution.</KeepInMind>
              </SubSection>

              <SubSection title="21. What the other two kinds of layer answer">
                <p>
                  The other two rules need no arithmetic worth the name. A
                  flattening layer answers with the product of the extents it
                  reads, all of them in a single side, which is why it changes
                  no number and only changes their arrangement. A dense layer
                  answers with its neuron count whatever it read, since each
                  neuron contributes exactly one number.
                </p>
                <Equation>{"flatten  (c, h, w)  →  (c × h × w,)\ndense    (n,)       →  (neurons,)"}</Equation>
                <p>
                  Those two are where the count and the arrangement come back
                  together. A dense layer really does only need the count of
                  what arrives, and the bridge is what turns an arrangement
                  into that count legitimately.
                </p>
                <KeepInMind>
                  A dense layer is written with a width, and a person filling
                  that width in works out how many numbers arrive and types it.
                  Nothing infers it for them, which is exactly why the chain
                  above it has to be the thing that objects.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Nothing here waits for data">
                <p>
                  Look back at what those rules need. The window, the stride
                  and the padding were chosen by whoever wrote the network. The
                  neuron count was chosen the same way. The incoming extents
                  come from the layer beneath by the same argument, and that
                  recursion bottoms out at the picture the network was told it
                  would read.
                </p>
                <p>
                  So every extent in the chain is a function of choices already
                  made, and there is no term anywhere in it that a batch of
                  data could supply. That is why the whole thing is decidable
                  at construction rather than merely convenient to check there.
                </p>
                <KeepInMind>
                  Every term in every one of these rules is a choice already
                  made or an extent already derived, so a batch of data has
                  nothing to add to the question and waiting for one tells you
                  no more than counting does.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Why the Check Belongs to an Object",
          content: (
            <>
              <SubSection title="23. An answer nobody is obliged to read">
                <p>
                  Suppose the seam comparison were offered as a function a
                  caller runs. It would answer correctly every time it was
                  asked, and a caller could assemble a network out of layers
                  that do not chain, never ask it once, and find out hours
                  later inside a matrix multiplication.
                </p>
                <p>
                  The comparison would be correct on every occasion it was
                  made, and it has no way of making itself happen. A guard a
                  caller has to remember protects the callers who remember it,
                  and the mistake this page is about is made by somebody
                  writing down seven layers who has no reason to think anything
                  is wrong with them.
                </p>
                <KeepInMind>
                  A rule spanning several values belongs to an object that
                  enforces it when it is made, rather than to a check every
                  caller has to know exists.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A chain that refuses to exist">
                <p>{"The chain object validates the layers' interfaces when it is constructed. It follows their declared shapes in order and returns a chain only if each output fits the next input. A mismatch raises an error at construction, so later calls do not have to discover the same incompatible connection during prediction."}</p>
                <p>The stack checks the configured joins once at construction. During a forward pass, each layer still validates the actual block it receives. Those runtime checks cover shape and valid incoming values; the constructor does not replace them.</p>
                <WhyThisWorks title="Why the editor can show a connection that execution rejects">
                  <p>
                    The builder at the top of this page can show you a red seam
                    and a chain carrying one cannot be made to run, and both
                    statements are true at once. The builder asks the seam
                    question directly, one seam at a time, which is why it can
                    report a verdict on a chain that does not exist. Building
                    the chain is a separate act, and it is the act that
                    refuses.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A caller can decline to run a check and cannot decline to run
                  a constructor, which is the whole reason the six seams of the
                  digit chain are settled by building the chain rather than by
                  asking about them.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. What the chain says about itself">
                <p>
                  A chain also reports its own two ends, and that report has to
                  be in the same vocabulary its layers use. The digit chain
                  says it reads (1, 28, 28) and answers (10,).
                </p>
                <p>If the stack reported only its input count, it would describe this image input as (784,). That would lose the declared (1, 28, 28) arrangement even if every internal join had been checked correctly. The stack’s own input description must therefore retain the first layer’s complete shape.</p>
                <p>A caller using a reported (784,) input shape would build rows that the first convolution rejects. A test using only dense layers would not reveal that reporting mistake, because each example already has one feature axis. An image-shaped fixture is needed to check that the stack retains multiple input axes.</p>
                <KeepInMind>
                  A test suite written entirely in the case where two facts
                  coincide cannot notice an implementation that confuses them.
                  The fixture that catches this one answers with eight numbers
                  arranged as (2, 2, 2).
                </KeepInMind>
              </SubSection>

              <SubSection title="26. The seam a chain still cannot check">
                <p>Shape alone cannot identify which layer produced a saved response. For example, pooling with a window of three at stride one over (1, 4, 4) outputs (1, 2, 2). A window of two at stride two gives the same output shape while covering different input positions.</p>
                <p>{"On the backward pass, either layer would accept the other's derivative block if the shape matched. That check cannot establish which forward response produced the block, so it could route derivatives to positions that never won a pooling window. Detecting that mismatch would require retaining the producing layer's identity with its response."}</p>
                <p>The stack’s normal backward pass pairs each layer with the response recorded at that position during its own forward pass. A caller using the layer API directly must preserve that association. Matching shapes alone cannot establish that a response came from the correct operation.</p>
                <KeepInMind>
                  The guarantee is about chains, and a layer handed a block
                  from nowhere in particular has less to go on. Saying which of
                  those two situations you are in is part of the contract.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Checking Arrangements Before Connecting Layers" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="27. The dimensions and window conventions a shape must record" id="27-what-a-complete-implementation-must-specify">
                <p>Two neighboring layers need to agree on what their dimensions mean. Define the allowed extents and whether compatibility requires the same arrangement or only the same count. A windowed layer must also specify how it computes output extents, handles a remainder and applies padding.</p>
                <p>Flattening needs a fixed reading order and a backward pass that restores the corresponding input arrangement. Distinguish the gradient passed to the preceding layer from a parameter gradient: flattening passes input gradients backward but has no trainable parameters. Also specify which complete input and output shapes the stack reports.</p>
                <p>Finally, decide whether a chain may contain one layer or no layers. If the same layer appears at several positions, make clear how an update treats that shared object. These choices affect execution even when every displayed shape looks compatible.</p>
                <p>
                  The last two on that list are where this implementation is
                  known to be weak, and the next two steps show each of them
                  happening rather than describing them.
                </p>
              </SubSection>

              <SubSection title="28. One layer standing at two positions">
                <p>Weight tying means reusing the same parameters at more than one position or branch. Each use contributes to the gradient for that shared parameter set, and an update must keep the parameters shared. Passing the same layer object twice expresses that intent here, but the next example tests whether the SDK’s update preserves it.</p>
                <p>{"This chain accepts the shared object, runs the forward calculation, evaluates the loss and computes the backward derivatives. Its update then rebuilds each position from that position's gradient, producing two distinct layer objects. Reusing an object in the input list therefore does not preserve parameter sharing after this implementation's update."}</p>
                <SharedLayerStep />
                <p>The forward pass starts with one shared object, but the update returns two separate layers. In this example, a learning rate of 0.1 leaves corresponding parameters up to 1.54375 apart. A rate one hundred times smaller leaves a largest difference of 0.0154375. Reducing the step reduces this observed separation; it does not restore parameter sharing. The update raises no error for the loss of sharing.</p>
                <p>Preserving weight tying would require combining the gradients from every use of the shared parameter set before applying one update. The current step method instead updates each list position independently. Callers who need tied weights must use an update implementation that retains that shared identity.</p>
                <KeepInMind>
                  A chain here is a list of positions, and a step rebuilds
                  positions. Two positions holding one object is a fact the
                  step has no way of noticing.
                </KeepInMind>
              </SubSection>

              <SubSection title="29. Whole numbers handed to a layer">
                <p>The base input boundary converts values to float64 and checks that they are finite. Those checks suit the real-valued measurements used by these layers. They do not validate integer positions or preserve every possible large integer exactly.</p>
                <p>An index needs different checks. The value 2.9999999999999996 is finite but is not an integer; explicitly converting it to an integer would truncate it to 2. Python and NumPy do not generally accept that float as an array index. A negative integer such as −1 can select the final entry under ordinary indexing rules. An index-taking API must therefore check both whole-number type and allowed range before lookup.</p>
                <CoercedNumbers />
                <p>Float64 also cannot distinguish every pair of consecutive integers at large magnitudes. In the displayed input, five distinct integers include 9007199254740992 and the next integer. Conversion leaves only four distinct floating-point values. Every result is finite, so a finiteness check cannot detect the lost distinction.</p>
                <KeepInMind>
                  These network layers currently consume real-valued measurements. An embedding lookup layer would need an integer-preserving input path with range checks. An operation accepting complex values would likewise need a representation that keeps both components instead of this real float64 conversion.</KeepInMind>
              </SubSection>

              <SubSection title="30. Equal counts, different arrangements and invalid extents" id="30-the-edges-probed">
                <p>
                  Each row below was asked rather than reasoned about, and
                  reports what came back, whether that was a refusal, an acceptance, or something
                  documented and left alone.
                </p>
                <DerivationTable
                  expressionHeading="Shape or extent"
                  reasonHeading="Whether the values can be rearranged"
                  rows={[
                    {
                      expression: "an extent of zero",
                      reason:
                        "refused by this SDK’s positive-extent requirement when the shape is constructed.",
                    },
                    {
                      expression: "a negative extent",
                      reason:
                        "refused by the same guard, naming the side and the value it was given.",
                    },
                    {
                      expression: "a side with no extents at all",
                      reason:
                        "refused, and the message names the reading side or the answering side, whichever was empty.",
                    },
                    {
                      expression: "counts agree, arrangements do not",
                      reason:
                        "refused, with both arrangements named and a clause saying that the width is not what disagrees.",
                    },
                    {
                      expression: "neither the counts nor the arrangements agree",
                      reason:
                        "refused with both arrangements reported; no equal-count explanation is needed.",
                    },
                    {
                      expression: "a chain of one layer",
                      reason:
                        "accepted, with no seams to check, reporting that layer’s own two sides as its own.",
                    },
                    {
                      expression: "a chain of no layers",
                      reason:
                        "refused, in the words “a stack needs at least one layer”, since there is no network to describe.",
                    },
                    {
                      expression: "flattening something that is already a row",
                      reason:
                        "accepted and the identity, reading (36,) and answering (36,), because stating a join that happens to be trivial is not a mistake.",
                    },
                    {
                      expression: "a convolution or a pooling layer handed a row",
                      reason:
                        "refused by the layer itself, in the words “a convolution reads (channels, height, width), got 1 extents”.",
                    },
                    {
                      expression: "a window wider than what it reads",
                      reason:
                        "refused, the convolution writing its sum out in full and the pooling layer naming the window and the picture.",
                    },
                    {
                      expression: "one layer at two positions of one chain",
                      reason:
                        "accepted for the forward pass; the current update creates separate layers for the two positions and does not preserve parameter sharing.",
                    },
                    {
                      expression: "whole numbers meant as positions",
                      reason:
                        "converted to floating point without index-specific integer or range checks; sufficiently large consecutive integers can lose their distinct values.",
                    },
                  ]}
                />
                <p>The final two cases need checks beyond matching shape tuples. Reusing a layer object does not preserve weight tying under this update method. Passing finite floats does not establish that values are valid integer indices. Shape compatibility answers one question about execution; parameter sharing and input meaning need their own contracts.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "An eight-wide input has one padded cell on each edge. A three-wide window moves at stride two. How many output positions fit along this axis?",
              ["Three", "Four", "Six", "Eight"],
              1,
              "Four complete window positions fit. Padding extends the available side before the window starts moving, and a stride of two skips every other possible starting position. A partial window at the far edge does not add another output position.",
            ),
            trueFalse(
              "A window exactly as wide as the side it reads is allowed, and the layer answers with a side of one.",
              true,
              "Without padding, a window of eight covers an eight-wide side in exactly one position. A window of nine cannot fit at all. This SDK rejects the resulting zero output extent. The error includes the window, stride and padding settings so the caller can identify why no complete window fits.",
            ),
            choice(
              "Why is the whole question decidable when the network is written rather than merely convenient to check there?",
              [
                "Every term in the extent rules is a choice already made or an extent already derived, and the recursion bottoms out at the picture the network was told it would read",
                "The first batch of pictures is inspected cheaply before any epoch begins",
                "Counts are compared rather than arrangements, and a count needs no data",
                "A dense layer works out its own width from whatever arrives beneath it",
              ],
              0,
              "The window, the stride, the padding and the neuron count were all chosen by whoever wrote the network, and the incoming extents come from the layer beneath by the same argument. A batch of data has nothing to add, so waiting for one tells you no more than counting does. Nothing infers a dense layer’s width for the person filling it in, which is exactly why the chain above it has to be the thing that objects.",
            ),
            trueFalse(
              "The chain that cheerfully reported it read (784,) while beginning with a convolution over (1, 28, 28) was also checking its interior seams wrongly.",
              false,
              "The internal connection check and the stack’s reported input shape are separate pieces of behavior. Internal connections can pass while an incorrect public shape leads the caller to prepare the wrong input arrangement. Testing only flat dense layers would miss that distinction; a spatial-input test checks that the public shape preserves every axis.",
            ),
            several(
              "Of the twelve edges Part 7 probes, two are accepted and then do something the caller did not ask for. Which two?",
              [
                "A step unties tied weights, so one layer object at two positions comes back as two different layers",
                "Whole numbers meant as positions are turned into floating point and never checked for being whole or in range",
                "Two pooling layers carrying the identical shape are told apart, so blame is never routed to positions that never won a window",
                "A window wider than the side it reads is accepted and answers with an extent of zero",
              ],
              [0, 1],
              "Reusing one layer object at two positions does not make this stack combine their gradients into a shared-parameter update. The two positions receive separate updated objects; a smaller nonzero rate reduces their numerical difference without preserving identity. The other accepted case is a pooling response from a different layer with compatible dimensions. An ordinary stack uses each layer’s own response, so that mismatch arises when the backward API is used directly.",
            ),
        ],
        },
        {
          title: "Practice. Checking a Chain With the Library",
          practice: [
            exercise(
              "Build the digit chain and read every extent",
              [
  "Build the supplied two convolution/pooling rounds, Flatten and dense layers of widths thirty-two and ten. Propagate each preceding output shape into the next layer’s input.",
  "For grayscale (1,28,28) and color (3,32,32) inputs, print every layer’s input shape, output shape and output-value count, then the stack endpoints and width entering Flatten. Parameter values may be zero here because the exercise inspects shape contracts."
],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear

for picture in [(1, 28, 28), (3, 32, 32)]:
    first = Conv2d(reads=picture, n_filters=8, kernel_size=3, activation=RectifiedLinear())
    # Build the rest of the chain, each layer reading what the one beneath
    # answers: a MaxPool2d of window 2 and stride 2, a Conv2d of 16 kernels of
    # 3 by 3, another MaxPool2d, and a Flatten as the bridge.

    # Build a dense layer of 32 neurons reading the count the bridge answers
    # with, and a dense layer of 10 neurons reading 32, all with zero weights.

    # Stack the seven layers. Print each layer's name, reads, answers and the
    # count it hands on, then the chain's two ends, then the count arriving at
    # the bridge on a line of its own.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, Identity, LayerStack, MaxPool2d, Neuron, RectifiedLinear

for picture in [(1, 28, 28), (3, 32, 32)]:
    first = Conv2d(reads=picture, n_filters=8, kernel_size=3, activation=RectifiedLinear())
    shrink = MaxPool2d(reads=first.shape.answers, window=2, stride=2)
    second = Conv2d(reads=shrink.shape.answers, n_filters=16, kernel_size=3, activation=RectifiedLinear())
    shrink_again = MaxPool2d(reads=second.shape.answers, window=2, stride=2)
    bridge = Flatten(reads=shrink_again.shape.answers)
    hidden = DenseLayer([Neuron(np.zeros(bridge.shape.n_outputs), bias=0, activation=Identity()) for _ in range(32)])
    digits = DenseLayer([Neuron(np.zeros(32), bias=0, activation=Identity()) for _ in range(10)])

    chain = LayerStack([first, shrink, second, shrink_again, bridge, hidden, digits])
    for layer in chain:
        shape = layer.shape
        print(f"{type(layer).__name__:10} reads {str(shape.reads):12} answers {str(shape.answers):12} hands on {shape.n_outputs}")
    print(f"the chain reads {chain.shape.reads} and answers {chain.shape.answers}")
    print(f"numbers arriving at the bridge {bridge.shape.n_inputs}")`,
              `Conv2d     reads (1, 28, 28)  answers (8, 26, 26)  hands on 5408
MaxPool2d  reads (8, 26, 26)  answers (8, 13, 13)  hands on 1352
Conv2d     reads (8, 13, 13)  answers (16, 11, 11) hands on 1936
MaxPool2d  reads (16, 11, 11) answers (16, 5, 5)   hands on 400
Flatten    reads (16, 5, 5)   answers (400,)       hands on 400
DenseLayer reads (400,)       answers (32,)        hands on 32
DenseLayer reads (32,)        answers (10,)        hands on 10
the chain reads (1, 28, 28) and answers (10,)
numbers arriving at the bridge 400
Conv2d     reads (3, 32, 32)  answers (8, 30, 30)  hands on 7200
MaxPool2d  reads (8, 30, 30)  answers (8, 15, 15)  hands on 1800
Conv2d     reads (8, 15, 15)  answers (16, 13, 13) hands on 2704
MaxPool2d  reads (16, 13, 13) answers (16, 6, 6)   hands on 576
Flatten    reads (16, 6, 6)   answers (576,)       hands on 576
DenseLayer reads (576,)       answers (32,)        hands on 32
DenseLayer reads (32,)        answers (10,)        hands on 10
the chain reads (3, 32, 32) and answers (10,)
numbers arriving at the bridge 576`,
              { hints: [
  "A spatial output keeps channel, height and width axes until Flatten.",
  "The dense input width is the product of the immediately preceding spatial dimensions; recompute it for each image layout."
], check: numberCheck("With the same seven layers over a picture of (3, 32, 32), how many numbers arrive at the bridge?", 576, 0.5, "There are 576 values before Flatten for the color-image setting. Their channels and spatial dimensions determine the dense input width, not the earlier grayscale case."), question: "Which dimensions reach the dense layer after the image stack?" },
            ),
            exercise(
              "Leave the bridge out, then ask each seam yourself",
              [
  "Attempt the supplied convolution-to-dense stack without Flatten and print the library refusal. Add Flatten, then print the valid stack endpoints.",
  "Use the five candidate input shapes supplied in the starter to compare element counts and shape.follows compatibility against the same convolution output. Print each candidate, count, count-equality check and compatibility check."
],
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, Identity, LayerStack, Neuron, RectifiedLinear, ShapeMismatchError

first = Conv2d(reads=(1, 28, 28), n_filters=8, kernel_size=3, activation=RectifiedLinear())
dense = DenseLayer([Neuron(np.zeros(5408), bias=0, activation=Identity()) for _ in range(10)])
readings = [(8, 26, 26), (5408,), (26, 8, 26), (4, 52, 26), (784,)]

# Try to stack the dense layer straight above the convolution and print the
# refusal. Then stack them with a Flatten between and print the chain's ends.

# For each reading, build a Flatten that reads it, and print the count it
# holds, whether that equals the count the convolution answers with, and
# whether its shape follows the convolution's shape.`,
              `import numpy as np
from oop_ml import Conv2d, DenseLayer, Flatten, Identity, LayerStack, Neuron, RectifiedLinear, ShapeMismatchError

first = Conv2d(reads=(1, 28, 28), n_filters=8, kernel_size=3, activation=RectifiedLinear())
dense = DenseLayer([Neuron(np.zeros(5408), bias=0, activation=Identity()) for _ in range(10)])
readings = [(8, 26, 26), (5408,), (26, 8, 26), (4, 52, 26), (784,)]

try:
    LayerStack([first, dense])
except ShapeMismatchError as refusal:
    print(f"refused, {refusal}")

chain = LayerStack([first, Flatten(reads=first.shape.answers), dense])
print(f"with the bridge the chain reads {chain.shape.reads} and answers {chain.shape.answers}")

for reading in readings:
    above = Flatten(reads=reading)
    counts_agree = above.shape.n_inputs == first.shape.n_outputs
    seam_holds = above.shape.follows(first.shape)
    print(f"{str(reading):12} holds {above.shape.n_inputs:4}, counts agree {counts_agree}, seam holds {seam_holds}")`,
              `refused, layer 0 answers with (8, 26, 26) and layer 1 reads (5408,); both hold 5408 numbers, so it is the arrangement that disagrees and not the width
with the bridge the chain reads (1, 28, 28) and answers (10,)
(8, 26, 26)  holds 5408, counts agree True, seam holds True
(5408,)      holds 5408, counts agree True, seam holds False
(26, 8, 26)  holds 5408, counts agree True, seam holds False
(4, 52, 26)  holds 5408, counts agree True, seam holds False
(784,)       holds  784, counts agree False, seam holds False`,
              { hints: [
  "The ordered axis sizes describe how values are arranged, not only how many exist.",
  "Flatten explicitly declares the conversion to one feature axis; it does not make all equal-sized arrangements interchangeable."
], question: "Is matching the number of values enough to join two layers?" },
            ),
            exercise(
              "Count the window positions before the layer does",
              [
  "For every supplied side/window/stride/padding setting, independently count valid window positions along one axis. Then construct its four-filter square convolution.",
  "Print your count beside the actual output shape, or the caught refusal for a window that cannot fit. Include the final twenty-eight-pixel setting with window five, stride two and padding two."
],
              `from oop_ml import Conv2d, Identity, MLLibError

settings = [(8, 3, 1, 0), (8, 3, 2, 0), (8, 3, 2, 1), (8, 5, 1, 2), (8, 8, 1, 0), (8, 9, 1, 0), (28, 5, 2, 2)]

# For each side, window, stride and padding in settings, count the positions
# with (n - k + 2p) // s + 1.

# Then build a Conv2d of 4 kernels reading (1, side, side) with those settings
# and Identity() as its activation. Print your count beside what the layer
# answers with, or beside its refusal if it will not be built.`,
              `from oop_ml import Conv2d, Identity, MLLibError

settings = [(8, 3, 1, 0), (8, 3, 2, 0), (8, 3, 2, 1), (8, 5, 1, 2), (8, 8, 1, 0), (8, 9, 1, 0), (28, 5, 2, 2)]

for side, window, stride, padding in settings:
    counted = (side - window + 2 * padding) // stride + 1
    label = f"side {side:2} window {window} stride {stride} padding {padding}, counted {counted:2}"
    try:
        layer = Conv2d(
            reads=(1, side, side), n_filters=4, kernel_size=window,
            activation=Identity(), stride=stride, padding=padding,
        )
    except MLLibError as refusal:
        print(f"{label}, refused, {refusal}")
        continue
    print(f"{label}, the layer answers {layer.shape.answers}")`,
              `side  8 window 3 stride 1 padding 0, counted  6, the layer answers (4, 6, 6)
side  8 window 3 stride 2 padding 0, counted  3, the layer answers (4, 3, 3)
side  8 window 3 stride 2 padding 1, counted  4, the layer answers (4, 4, 4)
side  8 window 5 stride 1 padding 2, counted  8, the layer answers (4, 8, 8)
side  8 window 8 stride 1 padding 0, counted  1, the layer answers (4, 1, 1)
side  8 window 9 stride 1 padding 0, counted  0, refused, this convolution's answer would have height (8 - 9 + 2 * 0) // 1 + 1 = 0, so the window does not fit over what it reads
side 28 window 5 stride 2 padding 2, counted 14, the layer answers (4, 14, 14)`,
              { hints: [
  "Count positions after padding and require a complete window at each stride.",
  "A nonpositive output extent must be treated as invalid rather than constructing an empty convolution."
], check: numberCheck("What side does a window of 5 at a stride of 2 with 2 of padding leave from a side of 28?", 14, 0.5, "The output side is fourteen. Only positions where the complete padded window fits at the given stride contribute output cells."), question: "Can you predict output width before constructing each convolution?" },
            ),
            exercise(
              "Step one layer standing at two positions",
              [
  "Use the supplied square dense layer twice in one stack. Print whether both positions reference the same object, then run the supplied squared-error backward pass and print loss.",
  "From that same backward result step at rates 0.1, 0.01 and 0.001. Print identity equality of updated positions and their maximum weight difference. This probes this stack’s update semantics; it is not a shared-gradient implementation."
],
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, SquaredError

shared = DenseLayer([
    Neuron([1.0, 0.5], bias=0.0, activation=Identity()),
    Neuron([-0.5, 2.0], bias=0.0, activation=Identity()),
])
rows = np.array([[1.0, 2.0], [3.0, -1.0]])
targets = np.array([[0.0, 0.0], [1.0, 1.0]])

# Stack the shared layer twice, check that position 0 is position 1 with \`is\`,
# run one backward pass on the rows and targets, and print the loss.

# For each rate, step the stack by the backward pass, and print whether the
# two positions are still one object and the largest absolute difference
# between their weight matrices.`,
              `import numpy as np
from oop_ml import DenseLayer, Identity, LayerStack, Neuron, SquaredError

shared = DenseLayer([
    Neuron([1.0, 0.5], bias=0.0, activation=Identity()),
    Neuron([-0.5, 2.0], bias=0.0, activation=Identity()),
])
rows = np.array([[1.0, 2.0], [3.0, -1.0]])
targets = np.array([[0.0, 0.0], [1.0, 1.0]])

chain = LayerStack([shared, shared])
backward = chain.backward_pass(rows, targets, SquaredError())
print(f"one object at both positions before the step, {chain[0] is chain[1]}")
print(f"loss {backward.loss:.4f}")

for rate in (0.1, 0.01, 0.001):
    stepped = chain.stepped_by(backward, rate)
    gap = np.max(np.abs(stepped[0].weight_matrix - stepped[1].weight_matrix))
    print(f"rate {rate}, one object after {stepped[0] is stepped[1]}, largest gap {gap:.7f}")`,
              `one object at both positions before the step, True
loss 33.9219
rate 0.1, one object after False, largest gap 1.5437500
rate 0.01, one object after False, largest gap 0.1543750
rate 0.001, one object after False, largest gap 0.0154375`,
              { hints: [
  "Check object identity separately from numerical equality.",
  "Each comparison starts from the same original stack and backward result. Carrying one stepped stack into the next would change the experiment."
], check: numberCheck("How far apart, at their furthest, are the two positions’ weights after one step at a rate of 0.01?", 0.154375, 1e-06, "The maximum updated-weight difference is 0.154375 at rate 0.01. This stack steps its two layer positions separately, so initial object aliasing does not implement tied-parameter training."), question: "Does putting the same layer object in two positions preserve weight sharing after an update?" },
            ),
          ],
        },
      ]}
    />
  );
}
