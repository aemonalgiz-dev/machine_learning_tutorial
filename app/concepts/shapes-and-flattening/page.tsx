import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { ShapeStackBuilder } from "@/components/widgets/ShapeStackBuilder";

export const metadata: Metadata = {
  title: "The Shape Guarantee · oop_ml",
  description:
    "A network that cannot work is refused before it reads a single row, in integer comparisons, and the refusal names both arrangements. Flatten is the bridge from a picture to a row, and forgetting it is the case the whole check exists to catch.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function ShapesAndFlatteningPage() {
  return (
    <ConceptPage
      title="The Shape Guarantee"
      tagline="Every seam in a network settled in integer arithmetic, before any data arrives."
      prerequisites={
        <>
          The layers being joined here are the{" "}
          <Link href="/concepts/convolution" className={linkClass}>
            convolution
          </Link>{" "}
          and{" "}
          <Link href="/concepts/pooling" className={linkClass}>
            pooling
          </Link>{" "}
          layers that read a picture, and the{" "}
          <Link href="/concepts/dense-layers" className={linkClass}>
            dense layer
          </Link>{" "}
          that reads a row. Nothing on this page needs calculus, only counting.
        </>
      }
      history={
        <>
          <p>
            The arrangement this page checks is almost as old as the field.
            Kunihiko Fukushima&rsquo;s neocognitron, published in 1980, already
            alternated layers that extract features across a picture with
            layers that shrink it, and in 1989 Yann LeCun and colleagues at
            Bell Labs trained that arrangement by backpropagation to read
            handwritten digits off envelopes for the United States Postal
            Service. LeNet-5, the 1998 network that came out of that work,
            has the shape every convolutional network since has borrowed. A
            picture goes in, convolutions and pooling layers shrink it while
            deepening it, and at some point the picture is laid out flat into a
            row so that ordinary dense layers can finish the job.
          </p>
          <p>
            The seam where the picture becomes a row is where practitioners
            have been making the same mistake ever since, and the two families
            of framework answer it differently. Theano, built at the
            Universit&eacute; de Montr&eacute;al from 2007, described a network
            as a symbolic graph and could work out every intermediate shape
            before running anything, so a mismatch was a build-time complaint.
            PyTorch, released publicly in 2017, chose the opposite trade and
            runs each layer as it is called, which buys enormous flexibility
            and means a shape mismatch surfaces only once the data reaches that
            layer, often minutes into a training run. This library takes the
            first bargain, and this page is what it bought.
          </p>
        </>
      }
      playground={<ShapeStackBuilder />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Each card in the box above is one layer, and between every pair
                of cards there is a seam. A seam is green when the layer above
                reads exactly what the layer beneath answers, and red when it
                does not. Nothing has been trained, and no data has been handed
                to anything. Every number on every card is integer arithmetic
                done at construction, which is the whole claim of the page.
              </p>
              <p>
                Notice that each card prints two different facts about each of
                its sides. There is an arrangement, written as a tuple like
                (4, 6, 6), and there is a bare count, 144. A convolution cares
                about the arrangement, because it slides a window over rows and
                columns and needs to know how many of each there are. A dense
                layer cares only about the count, because it holds one weight
                per number arriving and has no notion of a row or a column at
                all. Keeping those two facts apart is what lets the library
                catch the mistake this page is named for.
              </p>
              <p>
                Press the missing flatten button. A convolution answers with
                (8, 26, 26) and a dense layer beneath it reads (5408,). The
                counts agree exactly, 8 times 26 times 26 is 5408, and the seam
                is still red. Add a flatten between them and it turns green.
                That is the case the check exists for, and it is invisible to
                anything that compares only how many numbers there are.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Every layer in the library carries a shape, and a shape is a
                pair of tuples, what the layer reads and what it answers with.
                A dense layer of ten neurons reading a row of thirty-six has
                the shape (36,) to (10,). A convolution reading a
                single-channel eight by eight picture and sweeping four kernels
                has the shape (1, 8, 8) to (4, 6, 6). The one-dimensional case
                is not special, it is just the arrangement that happens to have
                one side.
              </p>
              <p>
                Joining two layers is then one question asked of two shapes, and
                the library asks it with a single comparison.
              </p>
              <Equation>{"a layer follows another when\n    previous.answers == this.reads"}</Equation>
              <p>
                That is equality of tuples, not equality of counts. (8, 26, 26)
                and (5408,) are different tuples, so the comparison is false,
                and no amount of agreement about how many numbers there are
                changes it. The comparison lives on the shape rather than in
                whichever loop is assembling the network, because &ldquo;do
                these two fit together&rdquo; is a sentence about two shapes.
              </p>
              <p>
                A guard a caller can forget to run is not a guarantee, though,
                which is why the check does not live in a function you call. It
                lives in the constructor of the stack. A stack of layers
                refuses to come into existence unless every seam in it holds,
                so there is no way to hold a badly joined network in your hands
                and only find out later. That is the difference between
                checking and guaranteeing, and it is why the widget above can
                report a red seam but the library cannot be made to run one.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                The stack the box loads with is four layers, and every extent in
                it can be worked out with a pencil. It starts from a small
                square picture with one channel, eight rows and eight columns,
                and finishes with ten numbers, one per digit a reader might be
                classifying.
              </p>
              <p>
                The convolution sweeps four kernels of three by three, one
                position at a time, with no padding. A three-wide window laid
                along an eight-wide row can start at six different places, so
                each output row and column is six long, and there are four of
                them because there are four kernels.
              </p>
              <Equation>{"(1, 8, 8)   conv, 4 kernels of 3 x 3   ->  (4, 6, 6)\n    8 - 3 + 1 = 6 positions along each side"}</Equation>
              <p>
                The pooling layer takes a two by two window and moves it two at
                a time, so the windows tile the picture without overlapping and
                each six-long side becomes three long. The channel count is
                untouched, because pooling summarises within a channel and never
                across them. Flatten then does no arithmetic at all beyond
                multiplying the extents together, and the dense layer answers
                with one number per neuron whatever it read.
              </p>
              <Equation>{"(4, 6, 6)   pool, 2 x 2 at stride 2   ->  (4, 3, 3)\n(4, 3, 3)   flatten                  ->  (36,)      4 x 3 x 3 = 36\n(36,)       dense, 10 neurons        ->  (10,)"}</Equation>
              <p>
                The readout above shows exactly those four rows, with counts of
                64, 144, 36, 36 and 10 along the way, and reports the stack as
                reading (1, 8, 8) and answering (10,). Every one of those
                numbers is pinned by a test, so the page cannot quietly drift
                away from what the library does.
              </p>
            </>
          ),
        },
        {
          title: "Counts Agree and Arrangements Do Not",
          content: (
            <>
              <p>
                The case worth dwelling on is the one where the counts agree,
                because it is the one that looks fine. Take the twenty-eight by
                twenty-eight picture the postal-service networks read, sweep
                eight kernels of three by three, and the answer is (8, 26, 26).
                Put a dense layer straight after it and tell it nothing about
                what it reads, and it will helpfully read as many numbers as
                arrive.
              </p>
              <Equation>{"8 x 26 x 26 = 5408        the convolution answers (8, 26, 26)\n                          the dense layer reads   (5408,)"}</Equation>
              <p>
                Both sides hold 5408 numbers. A check that compared counts
                would pass this, the network would train, and it would train on
                a picture read as a single long row with the rows and columns
                run together, which is precisely the structure a convolution
                exists to exploit. It would not crash. It would simply be worse
                than it should be, for a reason nothing reported. The library
                refuses it, and the refusal says why in as many words.
              </p>
              <Equation>{"layer 0 answers with (8, 26, 26) and layer 1 reads (5408,);\nboth hold 5408 numbers, so it is the arrangement that\ndisagrees and not the width"}</Equation>
              <p>
                That last clause is deliberate, and it was added because of how
                a reader meets this message. Told only that one layer answers
                5408 and the next reads 5408, a reader goes looking for a bug in
                the library rather than for the missing layer in their own
                network. State a width the counts do not even agree on, a dense
                layer reading (784,) after the same convolution, and the
                message drops the clause, because there is nothing surprising
                left to explain. The fix in both cases is the same one word, a
                flatten between them, which is the join said out loud.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Every extent on every card comes from one of four rules, and
                none of them needs anything more than division. A convolution
                and a pooling layer share the same counting argument. Lay a
                window of width k along a side of width n, add p rows of zeros
                at each edge first, and slide it s at a time. The first position
                starts at the left edge and the last is wherever the window
                still fits, so the number of positions is the number of whole
                strides that fit in what is left over, plus the first one.
              </p>
              <Equation>{"out = (n - k + 2p) / s   rounded down,   + 1"}</Equation>
              <p>
                Check it against the worked stack. The convolution had n of 8,
                k of 3, p of 0 and s of 1, giving five over one and one more,
                which is six. The pooling layer had n of 6, k of 2 and s of 2,
                giving four over two and one more, which is three. When the
                window does not fit at all the formula would go negative, and
                the library refuses the layer instead, in its own words, saying
                that a window of five does not fit in a picture three by three.
              </p>
              <p>
                The other two rules are shorter. A flatten answers with the
                product of the extents it reads, one side holding every number
                that arrived, which is why it changes no numbers and only
                changes their arrangement. A dense layer answers with its neuron
                count, whatever it read, because each neuron contributes exactly
                one number.
              </p>
              <Equation>{"flatten   (c, h, w)  ->  (c x h x w,)\ndense     (n,)       ->  (neurons,)"}</Equation>
              <p>
                Every term in every one of those rules is known when the layer
                is constructed. The kernel size, the stride and the padding are
                chosen by whoever wrote the network; the incoming extents come
                from the layer beneath, by the same argument, all the way down
                to the picture the network was told it would read. So the entire
                chain is decidable before a single row of data exists, and the
                library settles it there rather than waiting to be surprised.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
