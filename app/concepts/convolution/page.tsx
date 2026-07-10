import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { ConvolutionPlayground } from "@/components/widgets/ConvolutionPlayground";
import { ConvolutionParameterCount } from "@/components/widgets/ConvolutionParameterCount";

export const metadata: Metadata = {
  title: "Convolution · oop_ml",
  description:
    "A small kernel swept across a picture, one set of weights reused at every position, and why that holds hundreds to tens of thousands of times fewer parameters than a dense layer of the same width.",
};

export default function ConvolutionPage() {
  return (
    <ConceptPage
      title="Convolution"
      tagline="A small kernel swept across a picture, one set of weights reused at every position."
      prerequisites={
        <>
          A convolution is a layer, and the{" "}
          <Link
            href="/concepts/dense-layers"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            dense layer page
          </Link>{" "}
          is where what a layer reads and answers was first settled. The sum
          at the heart of this page is the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s dot product, taken over a three by three patch instead of a
          row.
        </>
      }
      history={
        <>
          <p>
            In 1959 David Hubel and Torsten Wiesel slid a microelectrode into
            the visual cortex of an anaesthetised cat and projected spots and
            bars onto a screen in front of it, looking for whatever made a
            single neuron fire. Each cell, they found, answered to a small
            patch of the visual field and to nothing outside it, and within
            that patch it wanted one particular thing, most often a bar or an
            edge at one particular angle. By 1962 they had sorted the cells
            into simple ones, which wanted the edge at an exact place, and
            complex ones, which wanted the same edge and did not mind where in
            the patch it fell. The picture of vision that came out of that
            work, one detector for one feature, tiled across the whole field,
            is the picture this page is built on, and it earned them the Nobel
            Prize in 1981.
          </p>
          <p>
            Kunihiko Fukushima turned it into an architecture in 1980. His
            Neocognitron put a small detector at every position of an image
            and let one set of weights serve all of them, so that a pattern
            was recognised wherever it appeared, and its weights were learned
            without a teacher. Yann LeCun, at AT&amp;T Bell Laboratories in
            1989, trained such a network by backpropagation on handwritten
            postal codes collected by the United States Postal Service. His
            argument was one about counting. The data was fewer than ten
            thousand digits, a dense network wide enough to read a picture
            had far more free weights than that could pin down, and sharing
            the weights was the way to have fewer of them without reading
            less. The same idea, deeper and on a far larger scale, was what
            Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton used to win
            the ImageNet competition in 2012 by a margin no earlier entry had
            come near, which is the point at which the rest of the field
            noticed.
          </p>
        </>
      }
      playground={<ConvolutionPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The picture on the left is eight cells by eight, with a square
                painted in the middle. The small grid is the kernel, nine
                weights and nothing more. The grid on the right is the answer,
                six by six, and every one of its cells was formed in the same
                way. Take the three by three window of the picture that sits
                under it, multiply each of the nine pixels by the weight in
                the same position of the kernel, and add the nine products up.
                Hover an answer cell and the window that made it lights up on
                the picture, with the nine products laid out beneath.
              </p>
              <p>
                The kernel the page opens with detects vertical edges. Its
                left column is negative and its right column positive, so a
                window with dark on the left and light on the right sums to
                something large and positive, a window that is the same shade
                all the way across sums to zero, and a window going from light
                to dark sums to something negative. That is exactly what the
                answer shows, a column of indigo where the square begins,
                nothing across its interior, and a column of amber where it
                ends. Switch to the horizontal edge kernel and the same
                picture answers with its top and bottom edges instead. Paint
                the diagonal and both kernels find it, each at half the
                strength the square gave them.
              </p>
              <p>
                Notice what the kernel never does. It never reads a pixel
                outside its window, so it can only ever say something about a
                neighbourhood, and it never changes from one position to the
                next, so whatever it says about one neighbourhood it says
                about all of them. Those two facts, locality and sharing, are
                the whole of what makes this layer different from a dense one,
                and everything else on this page follows from them.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A dense layer reads a row and forgets its arrangement. Hand it
                the sixty-four pixels of this picture and it has no idea that
                pixel 0 sits beside pixel 1 and above pixel 8. Shuffle the
                pixels with a fixed permutation and a dense layer trains
                exactly as well, because it was never told the geometry. A
                convolution is told. It reads a window, and the window is what
                the geometry is.
              </p>
              <p>
                The sweep works like this. Place the kernel with its corner on
                the picture&rsquo;s top left cell, take the weighted sum over
                the nine pixels beneath it, and write that number in the top
                left cell of the answer. Move the kernel one cell to the right
                and do it again. When the kernel reaches the right edge, drop
                down a row and start again from the left. An eight by eight
                picture has six places along each side that a three by three
                window fits into, so the answer is six by six, and each of its
                thirty-six cells came from the same nine weights.
              </p>
              <Equation>
                {
                  "answer[i, j] = Σ over u, v of  kernel[u, v] · picture[i + u, j + v]  +  bias"
                }
              </Equation>
              <p>
                Two settings change the sweep without changing the sum.
                Padding adds a border of zeros around the picture before the
                kernel starts, which lets the window sit over the corners and
                keeps the answer the same size as the picture. The library
                pads with zeros specifically, because a zero contributes
                nothing to any sum it enters and so invents no pixel the
                picture never had. Stride is how far the window moves between
                positions, and a stride of two reads every other window and
                answers with a map half the size. Press the buttons above the
                picture and the answer resizes as it must.
              </p>
              <p>
                One filter gives one map. A real layer holds a bank of them,
                each with its own nine weights and its own bias, and answers
                with one map per filter, which is why the library&rsquo;s
                layer reads (channels, height, width) and answers with
                (filters, height, width). A colour picture has three channels
                and each filter reads all three at once, so its weights are
                three by three by three, twenty-seven numbers and a bias,
                still a small count, still shared across every position.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Leave the square painted, the vertical edge kernel chosen, and
                stride and padding at their defaults, then hover the cell in
                row 2, column 0 of the answer, the one the page shows whenever
                nothing is hovered. Its window covers rows 2 to 4 and columns
                0 to 2 of the picture. The first two of those columns lie
                outside the square and the third is the square&rsquo;s left
                edge.
              </p>
              <Equation>
                {
                  "the window       the kernel        the products\n0  0  1          -1  0  1          0  0  1\n0  0  1     ×    -2  0  2     =    0  0  2\n0  0  1          -1  0  1          0  0  1\n\nsum of the products  =  1 + 2 + 1  =  4"
                }
              </Equation>
              <p>
                Six of the nine products are zero because the pixel beneath
                them is zero, and the remaining three are the kernel&rsquo;s
                right column, 1, 2 and 1, each multiplied by a pixel of one.
                The library answers 4, exactly. Move one cell to the right and
                the window reads columns 1 to 3, still dark on the left and
                lit on the right, so it answers 4 again. Two more cells along,
                the window lies entirely inside the square, every pixel is
                one, and the kernel&rsquo;s left and right columns cancel to
                zero. At column 4 the window straddles the square&rsquo;s
                right edge, lit on the left and dark on the right, and the sum
                is −4. The whole of answer row 2 reads 4, 4, 0, 0, −4, −4.
              </p>
              <p>
                The readouts underneath the widget count what the layer
                holds. Nine weights and one bias, ten parameters. A dense
                layer that reads the same sixty-four pixels and answers with
                the same thirty-six numbers would need sixty-four weights and
                a bias for every one of its thirty-six outputs, which is 2,340
                parameters, 234 times as many. Turn padding on and the answer
                grows to eight by eight, the dense layer grows to 4,160, 416
                times as many, and the convolution still holds ten.
              </p>
            </>
          ),
        },
        {
          title: "Why 234 Times Fewer",
          content: (
            <>
              <p>
                The saving has two sources and they are worth separating,
                which is what the middle readout under the widget is for.
                Locality is the first. Each answer cell reads nine pixels
                rather than sixty-four, so even a layer that used a fresh set
                of nine weights and a fresh bias at every position would hold
                thirty-six times ten, which is 360 parameters against the
                dense layer&rsquo;s 2,340. Sharing is the second, and the
                larger. Those thirty-six sets of nine are one set of nine used
                thirty-six times, and the thirty-six biases are one bias. Ten
                parameters, and the answer is exactly the same size.
              </p>
              <p>
                The ratio grows with the picture, because the dense
                layer&rsquo;s count is the product of the two widths while
                the convolution&rsquo;s does not depend on the picture at all.
                The library&rsquo;s own example is a 28 by 28 picture, the
                size of a handwritten digit, through eight filters of three by
                three. The convolution holds 80 parameters. A layer keeping
                the window and sharing nothing would hold 54,080. The dense
                layer reading the same 784 pixels and answering the same map
                of 8 by 26 by 26, which is 5,408 numbers, holds 4,245,280,
                which is 53,066 times as many. Move the sliders below and
                watch the three bars. They are on a log scale, because on a
                linear one the convolution&rsquo;s bar would not be visible.
              </p>
              <ConvolutionParameterCount />
              <p>
                There is a price, and it is the one Hubel and Wiesel&rsquo;s
                cells paid. A kernel can only ever say something about a
                neighbourhood, so a single layer cannot tell a face from a
                scrambled arrangement of the same eyes and mouth. The answer
                to that is not a wider kernel but another convolution on top
                of this one, whose window over the first layer&rsquo;s map
                covers a wider patch of the original picture, and so on
                upward, which is what the deep in a deep convolutional network
                means.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Three facts about this layer are arithmetic rather than hope,
                and each takes a few lines. The first is the size of the
                answer. A window of side k placed on a picture of side n,
                padded by p zeros on each edge and moved s cells at a time,
                fits at a position every s cells from the first until its far
                edge runs out of picture, and the floor is where a stride that
                does not divide evenly loses its last partial step.
              </p>
              <Equation>
                {
                  "answer side  =  ⌊(n − k + 2p) / s⌋ + 1\n\nn = 8, k = 3, p = 0, s = 1     ⌊5 / 1⌋ + 1  =  6\nn = 8, k = 3, p = 1, s = 1     ⌊7 / 1⌋ + 1  =  8\nn = 8, k = 3, p = 0, s = 2     ⌊5 / 2⌋ + 1  =  3\nn = 8, k = 3, p = 1, s = 2     ⌊7 / 2⌋ + 1  =  4"
                }
              </Equation>
              <p>
                Every term is known before any picture arrives, so the library
                computes the answer&rsquo;s extents at construction and
                refuses a configuration whose answer would be smaller than one
                cell, with the sum written into the refusal. Ask the counting
                widget above for a kernel of side 7 over a picture of side 4
                and what comes back is that the answer would have height (4 −
                7 + 2 · 0) // 1 + 1 = −2, so the window does not fit over what
                it reads.
              </p>
              <p>
                The second fact is the sum itself, written with the stride and
                the padding in it. The picture is indexed as it was painted,
                and a position that falls on the border reads a zero.
              </p>
              <Equation>
                {
                  "answer[i, j]  =  bias  +  Σ over c, u, v of\n                  kernel[c, u, v] · picture[c, i·s + u − p, j·s + v − p]"
                }
              </Equation>
              <p>
                Strictly this is a cross-correlation, and a convolution in the
                signal-processing sense would flip the kernel top to bottom
                and left to right before the sweep. The name has stuck to the
                unflipped version throughout machine learning because the flip
                makes no difference to a kernel that is learned. Whatever
                weights the flipped version would arrive at, the unflipped one
                arrives at their mirror image, and the two answer identically.
              </p>
              <p>
                The third fact is the one the library&rsquo;s own tests pin,
                that a shifted picture gives a shifted answer. Take a picture
                and move every pixel one column to the right, so that the new
                picture at column j is the old picture at column j − 1, and
                substitute that into the sum at stride one.
              </p>
              <Equation>
                {
                  "shifted[i, j]  =  Σ kernel[u, v] · picture[i + u, j − 1 + v]  =  answer[i, j − 1]"
                }
              </Equation>
              <p>
                The answer to the shifted picture is the old answer, shifted
                by the same amount. Nothing about the kernel had to know where
                the square was, which is the property Fukushima built the
                Neocognitron to have and the reason a filter that has learned
                an edge has learned it everywhere. Press the square button
                above, hover row 2, column 0, then paint the square one column
                to the right and hover row 2, column 1. The same 4 has moved
                with it, and the cell it left behind now reads 0.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
