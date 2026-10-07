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
  title: "The Shape Guarantee · oop_ml",
  description:
    "Track how each layer arranges its inputs and outputs, and make reshaping explicit.",
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
      playgroundIntro="Compare each layer's output shape with the next layer's expected input. Look for cases with equal value counts but different arrangements."
      title="The Shape Guarantee"
      tagline="Track how each layer arranges its inputs and outputs, and make reshaping explicit."
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
                <p>
                  Build a network for the digit picture and you write down a
                  list of layers in order. A convolution that sweeps eight
                  small kernels across the picture, a pooling layer that
                  shrinks what it found, another convolution, another pooling
                  layer, and then dense layers that read everything at once and
                  answer with ten numbers, one per digit. Nothing about that
                  list mentions data. It is a description of what each step
                  reads and what it hands upward.
                </p>
                <p>
                  Two of those steps can disagree. A convolution hands upward
                  something with channels, rows and columns, and a dense layer
                  reads a single row of numbers, so putting one straight above
                  the other asks a layer to read something it has no idea how
                  to read. In the box above, load the missing flatten preset
                  and the seam between the two cards turns red. Load the digit
                  chain and every seam is green.
                </p>
                <p>
                  Notice what happened in between. Nothing was trained, no
                  picture was sent, and no array was reserved for one. The
                  verdict on each seam is a comparison of two short tuples of
                  whole numbers, and the digit chain holds six of those seams,
                  so the answer for the whole network is six such comparisons.
                </p>
                <KeepInMind>
                  A network is refused for the shape it describes, not for what
                  happens when data reaches it. Everything on this page is
                  decided by counting.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why the refusal comes before the data">
                <p>
                  Suppose the check happened later instead, at the moment the
                  first block of pictures reached the offending layer. The
                  network would already have been constructed, the weights
                  already drawn at random, an optimiser already built around
                  them, and the training loop already started. The failure
                  would arrive somewhere inside a matrix multiplication, and
                  what it could say is that one array had a certain number of
                  columns and another had a different number, which is a true
                  statement about arrays and says nothing about which seam of
                  which network the writer got wrong.
                </p>
                <p>
                  Checking first costs nothing worth measuring. The digit chain
                  above holds seven layers, which is six seams, which is six
                  comparisons of tuples that are at most three long. No memory
                  is reserved for a batch and no epoch begins.
                </p>
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
                <p>
                  The digit chain in the box reports that it reads (1, 28, 28)
                  and answers (10,), and those are the only two figures a
                  reader has to reconcile against the world. The 5408 numbers
                  the first convolution hands upward, the 1352 the first
                  pooling layer leaves, the 400 that arrive at the bridge, are
                  facts about the chain and about nothing else.
                </p>
                <KeepInMind>
                  Two facts come from outside and every other extent in the
                  chain is a consequence, which is why the chain can be checked
                  without asking the world anything.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Shape Is an Arrangement, Not a Count",
          content: (
            <>
              <SubSection title="4. What a layer says about its two sides">
                <p>
                  Every layer carries a shape, and a shape here is a pair. One
                  side is what one input to the layer looks like and the other
                  is what one output looks like. Each side is written as a
                  tuple of extents, one number per side of the arrangement, so
                  the digit picture is (1, 28, 28) and a row of thirty-six
                  numbers is (36,).
                </p>
                <p>
                  A dense layer is not a special case, only the case where the
                  arrangement happens to have one side. Ten neurons reading a
                  row of thirty-six have the shape (36,) to (10,), which is the
                  same object as the convolution&rsquo;s (1, 28, 28) to
                  (8, 26, 26) with shorter tuples in it.
                </p>
                <Equation>{"reads    (1, 28, 28)\nanswers  (8, 26, 26)"}</Equation>
                <p>
                  The alternative would be to describe each side with a single
                  number, how many values it holds. That works perfectly for a
                  dense layer, whose neurons hold one weight per arriving
                  number and have no notion of a row or a column, and it
                  destroys the only thing a convolution cares about.
                </p>
                <KeepInMind>
                  Reading and answering are two different facts and are kept as
                  one object rather than two loose values, because a pair whose
                  meaning depends on which came first is a thing waiting to be
                  passed in the wrong order.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Eight numbers, arranged two ways">
                <p>
                  Take the smallest example that shows the difference at all.
                  Eight numbers arranged as two channels of two rows by two
                  columns, written (2, 2, 2), and the same eight numbers laid
                  out in a single row, written (8,). Those are different
                  arrangements of an identical amount of data.
                </p>
                <p>
                  Ask for each of them as a shape on its own and the answer
                  keeps both facts. The first reads (2, 2, 2) and holds 8
                  numbers; the second reads (8,) and holds 8 numbers. The
                  counts are equal and the arrangements are not, which is the
                  whole of the distinction this page is built on.
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
                <p>
                  Zero is worth dwelling on, since it looks like the harmless
                  edge and is the dangerous one. A layer of height zero is not
                  a degenerate layer that happens to do nothing; it is an
                  absent layer, and its shape would agree with whatever sat
                  above it for free, since a product with a zero in it is zero
                  and a tuple with a zero in it matches nothing anyone meant.
                </p>
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
              "Seven layers make six seams, and each seam is settled by comparing two short tuples of whole numbers. Nothing is trained, no picture is sent, and no memory is reserved for a batch, which is why checking first costs nothing worth measuring.",
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
              "Only the two ends of a chain have anything to do with the data. Everything between them is internal, chosen by whoever wrote the network and settled among the layers themselves, so the 5408, the 1352 and the 400 are facts about the chain and about nothing else.",
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
              "A dense layer’s neurons hold one weight per arriving number and have no notion of a row or a column, so a count tells them everything. A convolution’s whole subject is neighbourhood, so collapsing (8, 26, 26) to 5408 throws away what it exists to exploit. The count is the extents multiplied together, so it is derived from the arrangement and never the other way round.",
            ),
            several(
              "An extent is a whole number of at least one. Which of these are refused at the point the shape is written?",
              [
                "A picture of height zero",
                "A negative width",
                "A side with no extents at all",
                "An extent larger than the one in the layer beneath",
              ],
              [0, 1, 2],
              "The zero, the negative and the empty side are all refused when the shape is made, so no layer downstream has to carry a branch for meeting one. Zero looks like the harmless edge and is the dangerous one, since a layer of height zero is an absent layer whose shape would agree with whatever sat above it. An extent being larger than the one beneath it is not a fault in the shape. It is a seam question, and a seam is settled by comparing the two shapes.",
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
                <p>
                  Both sides hold 5408 numbers. A check comparing counts passes
                  it. Nothing crashes, the network trains, and it trains on a
                  picture whose rows have been run end to end into one long
                  strip, which throws away exactly the neighbourhood structure
                  the convolution beneath it existed to exploit. The result is
                  a model that works, converges, and is worse than it should
                  be, for a reason nothing anywhere reported.
                </p>
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
                <p>
                  The (5408,) reading is not the only thing that slips past a
                  count comparison. Two of the three extents swapped, so the
                  rows become the channels, gives (26, 8, 26). One extent
                  halved and another doubled gives (4, 52, 26). Both hold 5408
                  numbers, both are refused, and neither is the harmless
                  relabelling that a flat row at least is.
                </p>
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
                <p>
                  Read down the count column and the four numbers are the same.
                  Read down the verdict column and one of those four is
                  different. That is the gap a count comparison cannot see
                  into, and three of the four things inside it are arrangement
                  errors of the kind that produce a model reading the picture
                  sideways.
                </p>
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
                <p>
                  There is nothing surprising left to explain in that case. A
                  reader looking at 5408 on one side and 784 on the other
                  already knows the two do not match, and a clause telling them
                  the arrangement is at fault would be noise.
                </p>
                <KeepInMind>
                  The extra clause appears only when the counts agree, which is
                  the one situation where a reader would otherwise think the
                  refusal was itself a mistake.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Why the refusal names both arrangements">
                <p>
                  An earlier version of that message reported the two element
                  counts rather than the two arrangements, and on the case this
                  whole check exists to catch it printed that layer 0 answered
                  with 5408 numbers and layer 1 read 5408. That is a refusal
                  whose own text says the two sides agree.
                </p>
                <p>
                  A reader meeting that message goes looking for a fault in the
                  checking rather than for the missing layer in their own
                  network, which is the opposite of what an early refusal is
                  for. The message now names both arrangements, and adds the
                  clause about the counts only when they really do agree.
                </p>
                <WhyThisWorks>
                  <p>
                    The join was always checked correctly. It compared extents,
                    and the extents disagreed, so the answer was right. What
                    was wrong was only how the answer described itself, which
                    is why nothing failed and nothing was slower and a test of
                    the verdict would have passed. A refusal is read by a
                    person, and a refusal that contradicts itself costs that
                    person more time than the mistake it is reporting.
                  </p>
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
              <SubSection title="13. The bridge, said out loud as a layer">
                <p>
                  There is one place where a picture and a row genuinely are
                  interchangeable, and the tempting repair is to weaken the
                  seam check until it lets that one place through. That would
                  mean comparing counts, and Part 3 is what comparing counts
                  costs.
                </p>
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
                  The conversion is a layer because a layer can be checked. A
                  looser rule cannot be checked, since by construction it
                  admits three wrong arrangements for every right one.
                </KeepInMind>
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
                  particular chain. Flattening is a relabelling of the numbers
                  it was handed, so it cannot change how many there are.
                </p>
                <KeepInMind>
                  The count peaks early and falls for the rest of the chain.
                  Where the picture becomes a row is not where the data gets
                  smaller; the pooling layers did that.
                </KeepInMind>
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
                <p>
                  When a network learns, blame travels down the chain in the
                  opposite direction, and the bridge has to send it back to
                  where it came from. That step is the forward reshape read
                  backwards and nothing more, since the number at position k of
                  the row is the number that was at position k of the picture,
                  so the slope of the loss at one of them is the slope at the
                  other.
                </p>
                <p>
                  What has to hold is that the two reshapes agree about which
                  position is which, which is why both use the same ordering,
                  with the last extent varying fastest. Choose differently in
                  one of the two directions and the layer would still run, the
                  shapes would still all agree, and the blame would arrive at
                  the wrong pixels.
                </p>
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
                    <p>
                      I put a single nonzero number at that place and it came out at
                      position 5 of the row. Sending blame back down at position 5
                      alone returned it to channel 1, row 0, column 1 and to nowhere
                      else, and the layer reported no gradient.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The bridge also has no parameters, so it produces no gradient
                  at all rather than a gradient full of zeros. A block of zeros
                  would be a small false claim about having something to learn,
                  and the honest answer is that there is nothing here for a
                  step to move.
                </p>
                <KeepInMind>
                  The layer computes nothing in either direction, and it
                  reshapes rather than copies wherever the numbers are already
                  laid out contiguously, so the largest intermediate a
                  convolutional chain holds is not duplicated to cross the
                  bridge.
                </KeepInMind>
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
              "It passes, which is the whole reason arrangements are compared instead. Nothing crashes and the network trains, on a picture whose rows have been run end to end into one long strip, so the result is a model that works, converges and is worse than it should be for a reason nothing anywhere reported.",
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
              "With 5408 on one side and 784 on the other, a reader already knows the two do not match and the clause would be noise, so the sentence stops after the two arrangements. The clause appears only where a reader would otherwise think the refusal was itself a mistake. An earlier message reported the two counts instead, and on the case the check exists for its own text said that 5408 met 5408.",
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
              "Which of these hold for the bridge, the flattening layer?",
              [
                "It produces no gradient at all rather than a block of zeros",
                "Its backward reshape uses the same ordering as its forward one, with the last extent varying fastest",
                "It reshapes rather than copies wherever the numbers are already laid out contiguously",
                "Handing it a row rather than a picture is refused, since there is nothing to flatten",
              ],
              [0, 1, 2],
              "A block of zeros would be a small false claim about having something to learn, and the two reshapes have to agree about which position is which or the blame arrives at the wrong pixels while every shape still agrees. Under that ordering the number at channel 1, row 0, column 1 of a (2, 2, 2) picture sits at position 5 of the row in both directions. Flattening a row is allowed and is the identity, reading (36,) and answering (36,), and it is still worth having because it states a join a reader would otherwise carry in their head.",
            ),
        ],
        },
        {
          title: "Part 5. The Arithmetic Behind Every Extent",
          content: (
            <>
              <SubSection title="18. Sliding a window along a side">
                <p>
                  Every extent a convolution or a pooling layer answers with
                  comes from one counting argument. Lay a window of width k
                  along a side of width n and slide it s at a time. The first
                  position is at the left edge, and after that there is one
                  more position for every whole stride that fits in what is
                  left over.
                </p>
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
                  exactly and differ only in what each window is summarised
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
                  caption="A convolution reading (1, 8, 8), so n is 8 in every row. The two rows answering 8 are the settings that leave the picture the size it was."
                />
                <p>
                  Read the second and sixth rows together. A window of three
                  with one row of padding and a window of five with two both
                  leave the side at eight, which is the pairing worth
                  remembering, since a window of width 2m + 1 with m of padding
                  always does.
                </p>
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
                    <p>
                      I moved those 336 numbers by a hundred each and the pooling
                      layer&rsquo;s answer did not change at any position. Moving one
                      covered number changed it. Nothing was refused and nothing was
                      reported, which is the sense in which the layer says nothing
                      about the positions it never reaches.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>
                  The division drops its remainder, so a window that does not
                  quite reach the far edge simply never covers those last few
                  positions, and the layer says nothing about it.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. When the window does not fit">
                <p>
                  Push the window wider than what it reads and the sum would go
                  to zero or below, and a layer of extent zero is not a layer.
                  Both kinds refuse it, and the two refusals are phrased
                  differently because the two layers reach the failure
                  differently.
                </p>
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
                  A window exactly as wide as the side is allowed and answers
                  with one position. It is one wider that is refused, which is
                  the boundary worth checking when reading either message.
                </KeepInMind>
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
                <p>
                  So the chain is the object. It takes the layers in order and
                  walks up them, and it will not come into existence unless
                  every seam holds. There is no way to be holding a badly
                  joined chain, because the constructor either hands one back
                  or raises.
                </p>
                <p>
                  That is what makes every later pass cheap. A forward pass
                  through the chain re-establishes nothing, since the interior
                  seams were settled when it was built, and the only width
                  anything checks is the first layer&rsquo;s, which that layer
                  checks for itself against the block it was handed.
                </p>
                <WhyThisWorks>
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
                <p>
                  It said something else once. An earlier version built its own
                  report out of the counts rather than the arrangements, so a
                  chain beginning with a convolution over (1, 28, 28)
                  cheerfully reported that it read (784,). Every seam inside it
                  was still checked correctly, since the seam comparison never
                  consulted the collapsed figure, and only the chain&rsquo;s
                  description of itself was wrong.
                </p>
                <p>
                  That is the quiet half of it. A caller sizing a block of
                  input from what the chain said it read would build a row of
                  784 numbers and be refused by the chain&rsquo;s own first
                  layer, which is a confusing place to be. Every test that
                  existed was built out of dense layers, where the arrangement
                  and the count are the same number and so cannot be told
                  apart, which is precisely why nothing caught it.
                </p>
                <KeepInMind>
                  A test suite written entirely in the case where two facts
                  coincide cannot notice an implementation that confuses them.
                  The fixture that catches this one answers with eight numbers
                  arranged as (2, 2, 2).
                </KeepInMind>
              </SubSection>

              <SubSection title="26. The seam a chain still cannot check">
                <p>
                  One thing is left open and is documented rather than
                  defended. Two different pooling layers can carry the identical
                  shape. A window of three at stride one over (1, 4, 4) answers
                  (1, 2, 2), and so does a window of two at stride two, and the
                  two reach that answer by covering different positions.
                </p>
                <p>
                  On the way back down, either of them would accept the
                  other&rsquo;s slopes without complaint, since all a layer can
                  check is that the block it was handed matches its own shape,
                  and blame would be routed to positions that never won a
                  window. Closing that would need a response carrying which
                  layer produced it.
                </p>
                <p>
                  No chain can reach the case, because a chain pairs each layer
                  with its own response by construction, so this is a hole in
                  what a layer can verify on its own rather than a hole in the
                  guarantee. It is written down in the implementation instead
                  of being guarded against.
                </p>
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
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="27. What a complete implementation must specify">
                <p>
                  A complete implementation has to state how a side of a shape
                  is written and what an extent may be, whether a seam is
                  settled by arrangement or by count, how the output extents of
                  a windowed layer are computed and what happens to the
                  remainder, whether padding is available and where in the sum
                  it enters, which ordering a flattening layer uses and whether
                  the backward direction uses the same one, whether a
                  flattening layer produces a gradient or nothing, what a chain
                  reports as its own two ends, whether a chain of one layer is
                  allowed, whether an empty chain is allowed, and what a step
                  does to a layer that appears at more than one position.
                </p>
                <p>
                  The last two on that list are where this implementation is
                  known to be weak, and the next two steps show each of them
                  happening rather than describing them.
                </p>
              </SubSection>

              <SubSection title="28. One layer standing at two positions">
                <p>
                  Weight tying is putting the same layer object at two places
                  in one chain, so that whatever one of them learns the other
                  learns as well. It is how a pair of towers is made to read
                  two inputs the same way, and it is written by simply passing
                  the same object twice.
                </p>
                <p>
                  This chain accepts that, runs forward through it, scores it
                  and walks the blame back down without a word. Then a step
                  rebuilds every position from that position&rsquo;s own
                  gradient, and the two positions come back as two different
                  layers.
                </p>
                <SharedLayerStep />
                <p>
                  One object went in and two came out. On the small square
                  layer above, one step at a rate of 0.1 leaves the two
                  positions 1.54375 apart at their furthest, and a rate a
                  hundred times smaller leaves them 0.0154375 apart, so
                  shrinking the step narrows the gap in proportion and never
                  closes it.
                  Nothing anywhere raised, and a network written this way would
                  train perfectly happily while quietly not doing the thing it
                  was written to do.
                </p>
                <p>
                  Nothing here does this today, and it is recorded
                  rather than repaired because the repair is a real piece of
                  design. Gradients would have to be grouped by which set of
                  parameters they describe rather than by which position they
                  came from, and that is a change to what a step is, not a
                  patch to how one is applied.
                </p>
                <KeepInMind>
                  A chain here is a list of positions, and a step rebuilds
                  positions. Two positions holding one object is a fact the
                  step has no way of noticing.
                </KeepInMind>
              </SubSection>

              <SubSection title="29. Whole numbers handed to a layer">
                <p>
                  Every block a layer reads goes through the same boundary. It
                  is turned into floating point and scanned for values that are
                  not finite, and those two things are all that happens to it.
                  For measurements that is exactly right, since a height and a
                  weight are quantities and being off in the last bit is
                  meaningless.
                </p>
                <p>
                  For anything meant as a position it is wrong twice over. A
                  value of 2.9999999999999996 goes through as itself and would
                  be truncated to 2 by anything using it as a position, and a
                  value of &minus;1 goes through as itself and would wrap
                  around to the last row of whatever table it indexed. Neither
                  is checked, because the two checks a position wants are that
                  it is whole and that it is in range, and neither of those is
                  the check being made.
                </p>
                <CoercedNumbers />
                <p>
                  The third failure is the one that cannot be argued away. Ask
                  for five distinct whole numbers including 9007199254740992
                  and the number one above it, and four distinct values come
                  back, because floating point stops being able to tell
                  consecutive whole numbers apart at that size. The finiteness
                  scan passes every one of them.
                </p>
                <KeepInMind>
                  Nothing is broken today, since no layer here takes positions.
                  It is what a layer looking words up in a table would have to
                  change first, and it is the same hole that stops anything
                  spectral being handed complex values.
                </KeepInMind>
              </SubSection>

              <SubSection title="30. The edges, probed">
                <p>
                  Each row below was asked rather than reasoned about, and
                  reports what came back, whether that was a refusal, an acceptance, or something
                  documented and left alone.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    {
                      expression: "an extent of zero",
                      reason:
                        "refused where the shape is made, since a side of zero is an absent layer rather than a small one and would agree with anything above it.",
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
                        "refused, with the clause about counts dropped, since nothing there is surprising.",
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
                        "accepted, and one step leaves two layers where there was one. Documented rather than defended; nothing raises.",
                    },
                    {
                      expression: "whole numbers meant as positions",
                      reason:
                        "accepted, coerced to floating point, never checked for being whole or in range, and two consecutive large ones arrive as one. Documented rather than defended.",
                    },
                  ]}
                />
                <p>
                  Two of those twelve rows are the ones to carry away. Eight
                  of the twelve are refusals, and two are ordinary acceptances,
                  a chain of one layer and a bridge over a row, which do
                  exactly what was asked. The last two are accepted and then
                  do something the caller did not ask for. A step
                  unties tied weights and a layer cannot be handed a position,
                  and in both cases the implementation says so instead of
                  pretending otherwise or quietly substituting something
                  plausible.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "A three-wide window walks an eight-wide side two steps at a time, with one row of padding at each edge. How many sides does the layer answer with?",
              ["Three", "Four", "Six", "Eight"],
              1,
              "Padding widens the side the window walks along by two, so the sum is (8 − 3 + 2) // 2 + 1, which is 7 // 2 + 1 = 4 with the remainder dropped. Three is the same window and stride with no padding, six is the same window one step at a time with no padding, and eight is what one row of padding gives at a stride of one, the setting that leaves the picture the size it was.",
            ),
            trueFalse(
              "A window exactly as wide as the side it reads is allowed, and the layer answers with a side of one.",
              true,
              "A window of eight over a side of eight starts in exactly one place. It is one wider that is refused, since the sum would then go to zero and a layer of extent zero is not a layer. The convolution writes that sum out in full, (8 − 9 + 2 * 0) // 1 + 1 = 0, because padding and stride are both in it and a reader needs to see which term they got wrong.",
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
              "Every seam inside it was still checked correctly, because the seam comparison never consulted the collapsed figure. Only the chain’s description of itself was wrong, which is the quiet half, since a caller sizing a block from that report builds a row of 784 numbers and is refused by the chain’s own first layer. Every test that existed was built out of dense layers, where the arrangement and the count are written with the same number, which is precisely why nothing caught it.",
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
              "In both of those the implementation says so rather than pretending otherwise. One step at a rate of 0.1 leaves two tied positions 1.54375 apart at their furthest and a rate a hundred times smaller leaves them 0.0154375 apart, so shrinking the step never closes the gap. The pooling ambiguity is documented rather than guarded against, and no chain can reach it, since a chain pairs each layer with its own response by construction. A window wider than its side is one of the eight refusals.",
            ),
        ],
        },
        {
          title: "Practice. Checking a Chain With the Library",
          practice: [
            exercise(
              "Build the digit chain and read every extent",
              ["Build Part 4’s digit chain with the library, a convolution of 8 kernels of 3 by 3, a pooling layer of window 2 at stride 2, a convolution of 16 kernels, a second pooling layer, the bridge, a dense layer of 32 neurons and a dense layer of 10. Each layer above the first reads what the one beneath it answers, and the dense layers can hold zero weights, since nothing here reads a weight. Print what every layer reads and answers and how many numbers it hands on, then the chain’s own two ends.", "Section 14’s table should come back line for line, ending at 400 numbers arriving at the bridge. The loop then runs the same settings over a colour picture of (3, 32, 32), which the lesson never builds, so nothing on the page tells you what arrives at the bridge there."],
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
              { hints: ["Every layer carries a shape with reads and answers, each a tuple of extents. Passing the layer beneath’s shape.answers as the next layer’s reads is the whole of how a chain is written.", "A dense layer is built from neurons, and a neuron holds a width and not a picture, so it wants the count the bridge answers with. That count is bridge.shape.n_outputs, and np.zeros of that length is one neuron’s weights.", "A shape also reports n_inputs and n_outputs, the extents of each side multiplied together. LayerStack can be looped over layer by layer, and type(layer).__name__ gives a name to print."], check: numberCheck("With the same seven layers over a picture of (3, 32, 32), how many numbers arrive at the bridge?", 576, 0.5, "The sides run 32, 30, 15, 13 and 6. Each convolution takes two off, the first pooling layer halves 30 exactly, and the second drops a remainder, since (13 − 2) // 2 + 1 is 6 and one row and one column are never covered. Sixteen channels of 6 by 6 hold 576 numbers. The three colour channels change the first layer’s reads and nothing after it, because the first convolution answers with its eight kernels whatever it read.") },
            ),
            exercise(
              "Leave the bridge out, then ask each seam yourself",
              ["A dense layer of ten neurons holding 5408 weights each is built without complaint. Put it straight above the first convolution and print what the stack says. Then put a Flatten between them and print the two ends of the chain that now exists.", "Section 10’s table asks five readings to sit above the same convolution. A Flatten accepts any arrangement as what it reads, so use one as a stand-in for a layer reading each of the five, and print for each how many numbers it holds, whether the counts agree, and whether the seam holds. The seam question is the shape’s own follows."],
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
              { hints: ["LayerStack raises ShapeMismatchError from its constructor at the first seam that fails, and the exception printed as it is carries the whole sentence, position, both arrangements and the clause about the counts.", "The bridge is Flatten(reads=first.shape.answers). It reads (8, 26, 26) and answers (5408,), so both of its seams hold by exact equality.", "A shape has a method follows that takes the shape beneath and answers whether this one may sit above it, and n_inputs and n_outputs are the counts on its two sides."] },
            ),
            exercise(
              "Count the window positions before the layer does",
              ["Each setting below is a side, a window, a stride and a padding. The first six are rows of Part 5’s tables over a side of eight, including the window of nine that does not fit. For each one, count the positions with section 19’s sum, then build a convolution of four kernels over a square picture of that side and print what it answers with beside your count, or its refusal.", "The last setting is the digit picture’s side of 28 under a window of 5 at a stride of 2 with 2 of padding, which the lesson never works. Count it by hand before running the script."],
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
              { hints: ["Python’s // is the division that drops its remainder, which is the floor the lesson’s sum needs for these whole numbers.", "Conv2d takes reads, n_filters, kernel_size and activation, with stride and padding as keywords, and it works out its own answering side from them. Its shape.answers is (kernels, height, width).", "A window that does not fit is refused by the constructor with one of the library’s own errors, all of which derive from MLLibError, so wrap the construction in try and except and print the exception."], check: numberCheck("What side does a window of 5 at a stride of 2 with 2 of padding leave from a side of 28?", 14, 0.5, "Two of padding at each edge widen the side the window walks along to 32, so the sum is (28 − 5 + 4) // 2 + 1, which is 27 // 2 + 1 = 14 with a remainder of one dropped. A window of width 2m + 1 with m of padding leaves the side alone at a stride of one, so at a stride of two it halves it, and the layer answers (4, 14, 14).") },
            ),
            exercise(
              "Step one layer standing at two positions",
              ["The layer below is the small square layer of section 28, with the two rows and two targets its box uses. Put the same object at both positions of one stack, confirm that the stack really does hold one object twice, and run one backward pass under SquaredError. Print the loss, which the lesson does not quote.", "Then step the stack from that one backward pass at rates of 0.1, 0.01 and 0.001. For each, print whether the two positions are still one object and the largest gap between their weight matrices to seven places. Section 28 gives 1.54375 at a rate of 0.1 and 0.0154375 at a rate a hundred times smaller. The rate between them is yours to measure."],
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
              { hints: ["A square layer reads exactly what it answers with, so LayerStack([shared, shared]) has one seam and it holds. A stack is indexed by position, and `is` asks whether two positions hold the same object rather than equal ones.", "backward_pass takes the rows, the targets and the loss and answers one gradient per position, with the loss on it. stepped_by takes that and a learning rate and answers a new stack, leaving the old one untouched, so one backward pass serves all three rates.", "Each position of the stepped stack is a dense layer with a weight_matrix. Subtract one from the other, take np.abs and then np.max."], check: numberCheck("How far apart, at their furthest, are the two positions’ weights after one step at a rate of 0.01?", 0.154375, 1e-06, "A step moves each position by the rate times that position’s own gradient, and the two positions were handed different gradients, so the gap is the rate times the largest difference between those two gradients. That makes it exactly proportional to the rate, 1.54375 at 0.1, 0.154375 at 0.01 and 0.0154375 at 0.001. No rate closes it, and at every rate the two positions come back as two objects where one went in.") },
            ),
          ],
        },
      ]}
    />
  );
}
