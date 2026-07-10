import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { PoolingPlayground } from "@/components/widgets/PoolingPlayground";
import { ShareTotalsChart } from "@/components/widgets/ShareTotalsChart";

export const metadata: Metadata = {
  title: "Pooling · oop_ml",
  description:
    "Shrink a picture by summarising each window, keeping the largest value or the average, and see that the two differ by one function, the one that decides which inputs get any correction at all.",
};

export default function PoolingPage() {
  return (
    <ConceptPage
      title="Pooling"
      tagline="Shrink a picture by summarising each window, and see which cells the layer blames on the way back."
      prerequisites={
        <>
          The picture being pooled is the bank of maps a convolution answers
          with, so the{" "}
          <Link
            href="/concepts/convolution"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            convolution page
          </Link>{" "}
          comes first, and the second half of this page leans on{" "}
          <Link
            href="/concepts/backpropagation"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            backpropagation
          </Link>
          , where a slope arriving from the layer above was first explained.
        </>
      }
      history={
        <>
          <p>
            In 1959 and again in 1962, David Hubel and Torsten Wiesel
            recorded from single neurons in the visual cortex of anaesthetised
            cats, trying to work out what a cell there actually responded to,
            and found two kinds. A simple cell fired for an edge at one
            orientation in one exact place. A complex cell fired for the same
            orientation anywhere inside a patch, as though it were summarising
            the simple cells beneath it and discarding where the edge had
            been. Kunihiko Fukushima built that arrangement into his
            Neocognitron in 1980, a network meant to recognise a pattern
            regardless of where it sat, by alternating layers of detectors
            with layers that answered wherever a detector had fired inside
            their window. That second kind of layer is pooling.
          </p>
          <p>
            Yann LeCun&rsquo;s zip-code network of 1989 shrank its maps by
            stepping each kernel two cells at a time, and the LeNet-5 of 1998
            made the shrink a layer of its own, averaging windows of two by
            two. Keeping the largest value instead came back by way of the
            cortex. Maximilian Riesenhuber and Tomaso Poggio argued in 1999
            that a maximum was what the complex cells were computing, Dominik
            Scherer, Andreas Müller and Sven Behnke compared the two on
            images in 2010 and found the maximum trained better, and the 2012
            network of Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton,
            built for the ImageNet contest, pooled maxima over windows of
            three at a stride of two, overlapping on purpose. The page below
            builds both kinds and shows where they part.
          </p>
        </>
      }
      playground={<PoolingPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Look at the two grids in the box. The left is a picture, four
                numbers by four, and the right is the same picture after a
                pooling layer, two by two. Nothing was learned and nothing was
                multiplied. A window two cells wide sat at the top left, the
                four numbers under it became one, the window moved two cells
                along and did it again, and four windows gave four answers.
                Under max the one number is the largest in the window, and
                under average it is their mean.
              </p>
              <p>
                What was thrown away is the point. A convolution answers with
                a map nearly as large as the picture it read, and much of what
                the map holds is repetition, since a detector that fires on an
                edge fires again one cell along. Pooling says a feature was
                found somewhere in this window and deliberately does not say
                where, which shrinks the map for the layers above and buys a
                small tolerance to shift. Load the vertical stroke and press
                nudge once. The picture has moved a whole column and the
                pooled map has not changed by a single number, because the
                stroke stayed inside the same windows. Press nudge again and
                the stroke crosses a window boundary, and the bright column of
                the pooled map moves one cell along.
              </p>
              <p>
                The window and stride sliders are the whole geometry. Slide
                the stride below the window and the windows overlap, so one
                cell can belong to several of them. Slide the window up to the
                picture&rsquo;s side and the whole picture becomes one window
                and one answer.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A pooling layer is three settings, the window, the stride and
                the kind. The window starts at the top left corner of the
                picture, the kind summarises the cells under it, and the
                window moves stride cells across and, at the end of each row,
                stride cells down. How many positions it can take along one
                side is settled before any picture arrives.
              </p>
              <Equation>
                {"pooled extent = ⌊(extent − window) / stride⌋ + 1"}
              </Equation>
              <p>
                For the box&rsquo;s opening picture that is (4 − 2) / 2 + 1 =
                2 on each side, so four by four pools to two by two. A stride
                of one gives (4 − 2) / 1 + 1 = 3 instead, nine windows over
                sixteen cells, with the windows overlapping. A window that
                does not divide the side evenly simply stops early, so a five
                by five picture under a window of two at a stride of two pools
                to two by two, and its last row and column belong to no window
                at all. The library settles this arithmetic at construction,
                and a window larger than the picture is refused in words
                before a single number is read, rather than as a shape error
                several layers later.
              </p>
              <p>
                There are no weights. A dense layer multiplies and then
                bends, a convolution multiplies a kernel at every position,
                and this layer does neither, so it has nothing to learn and
                nothing to store. Its score and its answer are one and the
                same block, and when a slope comes back down through it the
                layer reports no gradient of its own, honestly, rather than a
                block of zeros. What it does have to do on the way back is
                decide who is to blame, which is the section after the worked
                example.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, a four by four picture under
                a window of two at a stride of two, and choose max. Read the
                top-left window, the four cells 1, 5, 4 and 2. The largest is
                5, so the top-left answer is 5. The top-right window holds 1,
                3, 4 and 0, the bottom-left holds 0, 1, 2 and 1, and the
                bottom-right holds 3, 1, 7 and 5.
              </p>
              <Equation>{"max      [[5, 4],\n          [2, 7]]"}</Equation>
              <p>
                Now choose average. The same four windows sum to 12, 8, 4 and
                16, and each holds four cells.
              </p>
              <Equation>
                {
                  "12 / 4 = 3,   8 / 4 = 2,   4 / 4 = 1,   16 / 4 = 4\n\naverage  [[3, 2],\n          [1, 4]]"
                }
              </Equation>
              <p>
                Both maps are what the box shows, and neither took anything a
                pencil could not do. Hover an answer and its window lights up
                on the picture, with the winning cell marked under max. The
                two maps came from the same four windows and differ only in
                what was kept from each, which is the whole of the difference
                between the two layers on the way up. On the way back the
                difference is larger, and the overlay shows it.
              </p>
            </>
          ),
        },
        {
          title: "Who Gets Trained",
          content: (
            <>
              <p>
                Turn on the overlay with max chosen. A slope of one arrives at
                each of the four answers, and the layer has to say which of
                the sixteen cells each one came from. The top-left answer was
                5, and it was 5 because of one cell, the one holding 5, so
                that cell receives the whole slope and the other three receive
                nothing. Four cells of sixteen receive any correction at all,
                and whatever layer sits beneath this one learns only through
                those four. A maximum trains the winners.
              </p>
              <p>
                Choose average and every cell lights up, each with a quarter.
                The answer 3 was a quarter of each of its four cells, so each
                is a quarter responsible. Sixteen of sixteen receive
                correction, and each receives a little. Which is better is a
                question about the data rather than about the layer. What is
                not a matter of taste is that a maximum starves three cells in
                four of any gradient at every step, and a deep stack of them
                can leave whole regions of a lower layer untouched.
              </p>
              <p>
                The shares inside every window add up to one, one at the
                winner or four quarters, because each answer is a weighted
                mean of its window with weights summing to one, and a layer
                whose shares did not would be scaling the gradient on its way
                past. To one within float64, and not exactly. An average over
                a window of seven hands out forty-nine shares of one
                forty-ninth, that reciprocal has no exact float64, and the
                shares come to 0.9999999999999999. Set the picture side to 7,
                the window to 7 and the kind to average, and the last readout
                says so. Of the first thirty-two sides sixteen miss, the worst
                being side 31 at 4.4e-16, and the strip below marks which.
              </p>
              <ShareTotalsChart />
              <p>
                Now slide the stride to one on the worked example, and the
                windows overlap. The library adds rather than assigns, so the
                cell holding 4 wins three of the nine windows and shows 3, and
                under average an interior cell belongs to four windows and
                shows four quarters, exactly one. Writing an assignment there
                instead of an addition would keep only the last
                window&rsquo;s share, a smaller gradient of the right shape
                full of plausible numbers, and nothing but a gradient check
                would find it. Ties are decided rather than computed. Load the
                flat patch, where every window is a four-way tie and the
                derivative of a maximum does not exist, and the library sends
                the whole slope to the first cell in row-major order, top row
                first and left before right, the same cell its forward pass
                would have named.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Everything on the way back is the chain rule applied to one
                window, and a window is small enough to differentiate by hand.
                Write the n cells of one window as x₁ through xₙ and the
                answer as y.
              </p>
              <Equation>
                {
                  "max      y = max(x₁, …, xₙ)          ∂y/∂xᵢ = 1 if i won, 0 otherwise\naverage  y = (x₁ + … + xₙ) / n       ∂y/∂xᵢ = 1 / n"
                }
              </Equation>
              <p>
                The maximum&rsquo;s derivative comes from its being a
                selection. Over the region where the winner stays the winner,
                y simply is that cell, so moving the winner moves the answer
                one for one and moving any other cell moves it not at all.
                The average&rsquo;s comes from every cell entering with the
                same coefficient. Both rows of derivatives sum to one, which
                is the claim the last section leaned on.
              </p>
              <p>
                A slope g arriving at the answer is handed to the cells by
                multiplying. Cell i receives g times its share, and where
                windows overlap the cell sits in several of them and receives
                the sum.
              </p>
              <Equation>
                {"blame on xᵢ = Σ over windows holding i of   g · ∂y/∂xᵢ"}
              </Equation>
              <p>
                With g equal to one everywhere, which is what the overlay
                sends, the blame on a cell is the number of windows it won
                under max and the number of windows it belongs to over n under
                average, which is every figure the overlay prints. There is no
                parameter anywhere in this, so there is nothing to step, and a
                training loop passes the layer through unchanged, the other
                half of a layer with nothing to learn.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
