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
    "A network that cannot work is refused before it reads a single row, in integer comparisons, and the refusal names both arrangements. Flattening is the bridge from a picture to a row, and leaving it out is the case the whole check exists to catch.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ShapesAndFlatteningPage() {
  return (
    <ConceptPage
      title="The Shape Guarantee"
      tagline="Every seam in a network settled in integer arithmetic, before any data arrives."
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
      history={
        <>
          <p>
            The running example here is a handwritten digit, twenty-eight rows
            of twenty-eight grey values, and that picture has a specific
            provenance. Kunihiko Fukushima published the neocognitron in
            Biological Cybernetics in 1980, a model that alternated layers
            picking out small features anywhere in a picture with layers that
            shrank what those layers found, so that a stroke recognised
            slightly to the left was still the same stroke. In 1989 Yann LeCun
            and colleagues at AT&amp;T Bell Laboratories in Holmdel trained
            that arrangement by backpropagation on handwritten postal codes
            supplied by the United States Postal Service, published as
            &ldquo;Backpropagation Applied to Handwritten Zip Code
            Recognition&rdquo;, and the 1998 paper that grew out of that line
            of work, &ldquo;Gradient-Based Learning Applied to Document
            Recognition&rdquo;, is where the shape every convolutional network
            has borrowed since was written down. A picture goes in,
            convolutions and pooling layers shrink it while deepening it, and
            somewhere in the middle the picture is laid out flat into a single
            row so that ordinary dense layers can finish.
          </p>
          <p>
            That seam, where the picture becomes a row, is where the same
            mistake has been made ever since, and the two families of framework
            answer it in opposite ways. Theano, built at the Universit&eacute;
            de Montr&eacute;al from 2007, described a whole network as a
            symbolic graph and compiled it before running any of it, so a
            disagreement between two layers was something the build complained
            about. PyTorch, released publicly in 2017, took the other bargain
            and runs each layer at the moment it is called, which buys a great
            deal of flexibility and means a shape disagreement surfaces only
            when data reaches the offending layer, often some minutes into a
            training run and always with the message written in terms of an
            array rather than in terms of the join. The epistemic problem
            underneath is small and stubborn. Everything needed to settle
            whether two layers fit together is known when they are written
            down, and a framework that waits for data to tell it has thrown
            that knowledge away.
          </p>
          <p>
            This page asks six questions in order. What can a network refuse to
            be built out of, and why should the refusal come before any data is
            read? What is a shape here, given that it is a tuple of extents
            rather than a count of numbers? How is one seam between two layers
            checked? What is flattening, and where in a chain does it belong?
            Why does the check belong to an object that cannot exist unless
            every seam holds, rather than to a function a caller may forget to
            call? And what must a complete implementation state, including
            where this one is known to be weak?
          </p>
        </>
      }
      playground={<ShapeStackBuilder />}
      sections={[
        {
          title: "Part 1. What a Network Refuses to Be",
          defaultOpen: true,
          content: (
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
          ),
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
                  <p>
                    Take the third row by hand. n is 8, k is 3, p is 0 and s is
                    2, so 8 minus 3 is 5, divided by 2 with the remainder
                    dropped is 2, plus one is 3. The layer answers (4, 3, 3),
                    which holds 36 numbers, and the odd side length is the
                    remainder being thrown away rather than anything going
                    wrong.
                  </p>
                </WorkedExample>
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
                  Two of those twelve rows are the ones to carry away, since
                  the other ten are refusals and these two are not. A step
                  unties tied weights and a layer cannot be handed a position,
                  and in both cases the implementation says so instead of
                  pretending otherwise or quietly substituting something
                  plausible.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
