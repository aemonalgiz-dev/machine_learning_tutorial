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
import { CodebookExplorer } from "@/components/widgets/CodebookExplorer";
import { DistortionCurveChart } from "@/components/widgets/DistortionCurveChart";
import { NearDisagreementTable } from "@/components/widgets/NearDisagreementTable";
import { NearestEntryTable } from "@/components/widgets/NearestEntryTable";
import { SameNumberTable } from "@/components/widgets/SameNumberTable";
import { UnusedEntriesTable } from "@/components/widgets/UnusedEntriesTable";

export const metadata: Metadata = {
  title: "Codebook Quantization · Perceptron Lab",
  description:
    "A codebook replaces a continuous vector with an ID for a nearby representative. The number and placement of representatives determine the available codes and the error introduced by that replacement.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function CodebookQuantisationPage() {
  return (
    <ConceptPage
      lessonId="codebook-quantisation"
      intuition={lessonIntuitions["codebook-quantisation"]}
      technicalStart="Part 2. A Table of Positions, and the Nearest One Wins"
      openingTitle="Replace Many Possible Vectors with a Small Set of Representatives"
      playgroundTitle="Which stored vector should represent this point?"
      playgroundIntro="Compare an input vector with its selected codebook entry and reconstruction. Increase the codebook size and inspect both the error and the number of entries used."
      title="Codebook Quantization"
      tagline={"A codebook replaces a continuous vector with an ID for a nearby representative. The number and placement of representatives determine the available codes and the error introduced by that replacement."}
      prerequisites={
        <>
          {"Start with "}{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          {" for the relationship between pieces and IDs. Here the pieces are numerical vectors. We will use "}{" "}
          <Link href="/concepts/k-means" className={link}>
            k-means
          </Link>{" "}
          {" to fit representative vectors, and "}{" "}
          <Link href="/concepts/distance-metrics" className={link}>
            distance metrics
          </Link>{" "}
          {" to compare an input with those representatives."}</>
      }

      playground={<CodebookExplorer />}
      sections={[
        {
          title: "Part 1. A Picture Is Already Numbers",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Why this page changes the example">
                <p>The earlier examples divided text into pieces and assigned IDs. Vector quantization starts with numerical vectors, so we will use image patches whose values can be inspected directly. A text system could quantize learned text vectors as well, but would also need an account of how the text became those vectors.</p>
                <p>The image has sixteen rows and sixteen columns of brightness values. We divide its 256 values into 128 two-value patches, each made from neighboring pixels. That deliberately small patch can be drawn as a point in a plane, making its replacement by a representative easy to inspect.</p>
                <KeepInMind>
                  The running example on this page is a picture, cut into pairs
                  of side-by-side pixels. The shared sentence returns on the
                  pages either side of this one.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The four pictures, and what each is for">
                <p>
                  {"The photograph changes gradually, so neighboring pixels usually have similar brightness. The poster has four bands of tone with a little added grain. We will compare both with a striped chart and a randomly speckled square. Each uses the same number of patches, letting us inspect how the arrangement of brightness values affects the error."}
                </p>
                <p>
                  {"The chart has sharp edges and only a few distinct patches. The speckled square draws each pixel independently before rounding. Its pairs spread across the brightness plane rather than gathering near the diagonal."}
                </p>
                <NumberTable
                  headings={[
                    "picture",
                    "pieces",
                    "different pieces",
                    "what it is there to show",
                  ]}
                  rows={[
                    ["photograph", "128", "53", "the ordinary case, where neighboring pixels agree"],
                    ["poster", "128", "93", "content with a natural number of parts"],
                    ["printed chart", "128", "5", "very little variety, and hard edges"],
                    ["speckled square", "128", "127", "no structure, as a control"],
                  ]}
                  caption="Every picture has the same 128 pieces; what differs is how many of them are different from each other."
                />
                <p>

                  The playground can quantize each of the four images at different codebook sizes. Set the photograph&apos;s size to two and compare it with the reconstruction. Which differences can two representatives retain, and which have disappeared?
                </p>
                <KeepInMind>
                  The photograph is the running example. The other three are
                  there because a single picture cannot show what the method
                  does and does not exploit.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The contract, asked of something that was never text">
                <p>This lesson chooses an interface that represents each image patch by a whole-number ID, much as a text tokenizer identifies a piece of text. That is one possible representation. Image models also routinely read floating-point pixel values or vectors directly. For our discrete interface, we must decide what a piece is, which ID it receives, what the decoder returns, and how much the reconstruction differs from the input. The <Link href="/concepts/what-a-token-is" className={link}>
                    vocabulary page
                  </Link> explains the corresponding decisions for text.</p>
                <p>A text vocabulary can reproduce the original characters when its encoding is reversible and covers the input. A codebook instead replaces each patch with a representative vector. This usually changes some values. An exact match to an entry can still reconstruct exactly, so loss is not inevitable for every input. We will measure the reconstruction error rather than assume that every replacement is equally damaging.</p>
                <KeepInMind>
                  {"Encoding and decoding need the same representatives in the same order. Unlike a reversible text encoding, a smaller codebook generally cannot preserve every distinct input patch. Reconstruction error tells us how much the replacement changes this collection."}
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Why the brightnesses cannot be the vocabulary">
                <p>We could keep the raw brightness values, and many image models do. Here we want a compact discrete alphabet of patch representatives. Enumerating every possible patch is usually a poor way to build that alphabet: even a finite pixel format can have far more possible patches than we want entries. A learned codebook spends its entries on representative patches instead. The small rounded example below lets us count the difference.</p>
                <>
                  <p>
                    Rounding brightness to two decimal places still leaves 101 possible
                    values per pixel. A two-pixel piece can combine any of them.
                  </p>
                  <Equation>{"possible two-pixel pieces = 101 × 101 = 10,201"}</Equation>
                  <p>
                    The photograph uses only fifty-three of those possibilities.
                    Enumerating every possible piece spends most of the table on
                    combinations absent from this picture.
                  </p>
                </>
                <WhyThisWorks title="Why the count grows with the coordinates too">
                  <>
                    <p>
                      The number of possible pieces grows exponentially with the number
                      of pixels per piece.
                    </p>
                    <Equation>{"two pixels:     101² = 10,201 possibilities\nsixteen pixels: 101¹⁶ ≈ 1.17 × 10³² possibilities"}</Equation>
                    <p>
                      A useful codebook therefore records representative pieces from the
                      data instead of trying to list every possible combination.
                    </p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  {"A continuous brightness model has infinitely many possible pairs. A finite pixel format has finitely many, but that list can still be too large to store as a useful vocabulary. A fitted codebook uses a smaller set of representatives."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Table of Positions, and the Nearest One Wins",
          content: (
            <>
              <SubSection title="5. The rule, in one line">
                <p>
                  We keep a list of representative vectors called a codebook. Each entry&apos;s position is its code. To encode a new vector, compare it with the entries and return the nearest entry&apos;s position. To reconstruct it, retrieve that representative. The reconstructed vector may differ from the original, so we will measure the error as well as the size of the codebook.
                </p>
                <Equation>
                  {"number of v  =  the position i minimising  ||v − entryᵢ||²"}
                </Equation>
                <p>

                  The square is there for convenience rather than for meaning.
                  Squaring is increasing on non-negative numbers, so the entry
                  that minimizes the squared distance is the entry that
                  minimizes the distance, and the square saves a square root
                  that would change no answer.
                </p>
                <KeepInMind>
                  {"Vector quantization represents a vector by the ID of a codebook entry. This example chooses the entry with the smallest squared Euclidean distance. The entry’s vector is what the decoder returns."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Four vectors against three entries">
                <p>
                  {"Use three entries: (0, 0), (4, 0) and (0, 3), with IDs 0, 1 and 2. Compare them with four inputs: (1, 0), (3, 1), (1, 2) and (2, 0). The table lists each squared distance and marks the chosen entry."}
                </p>
                <NearestEntryTable showTie={false} />
                <WorkedExample title="One row, by hand">
                  <>
                    <p>
                      Compare the vector (3, 1) with each of the three codebook entries.
                      Squared Euclidean distance is enough to rank them.
                    </p>
                    <Equation>{"entry 0 at (0, 0): 3² + 1² = 10\nentry 1 at (4, 0): (−1)² + 1² = 2\nentry 2 at (0, 3): 3² + (−2)² = 13"}</Equation>
                    <p>
                      Entry 1 is nearest. Encoding stores the ID one; decoding returns
                      its representative vector, (4, 0).
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The four vectors become 0, 1, 2 and 0. Two different vectors
                  have already received the same number, at the fourth row, and
                  that is what a finite table does rather than an accident of
                  these four.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The tie, and the rule that settles it">
                <p>
                  The last of the four vectors, (2, 0), is 4 away in squared
                  distance from entry 0 and 4 away from entry 1. Nothing in the
                  rule says which of them it should get, because the rule says
                  nearest and there are two of those. Something has to decide,
                  and whatever decides is arbitrary in the strict sense that a
                  different choice would be equally correct.
                </p>
                <p>
                  {"Here a tie goes to the earlier entry in the table. Put (4, 0) first and the tied input reconstructs as that vector instead. The other three inputs keep their nearest representative, although reordering also changes some IDs. Their reconstruction errors stay the same."}
                </p>
                <NearestEntryTable />
                <KeepInMind>
                  A tie has no right answer, so it has a stated one. The
                  convention here is the earlier position in the table, and a
                  reader comparing two implementations of this method should
                  expect them to disagree on ties unless both have written the
                  rule down.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. This table has been met before, under another name">
                <p>
                  {"The centers fitted by "}<Link href="/concepts/k-means" className={link}>
                    k-means
                  </Link>{" can serve as codebook entries. Assigning a patch to its nearest center is the encoding step. K-means minimizes the sum of squared assignment distances, called inertia; dividing that total by the number of patches gives the mean reconstruction error used here."}
                </p>
                <p>
                  {"A table fitted to one collection may represent that collection well and perform poorly on another. We will test this by fitting on the photograph and encoding the chart. Keep the original patches during evaluation so their reconstruction errors can be measured."}
                </p>
                <InAModel>
                  <p>
                  {"HuBERT uses offline clustering of speech features to create target labels for a masked-prediction task. K-means supplies one way to create those labels: the nearest cluster center determines a frame’s label. HuBERT itself receives continuous audio-derived inputs; it is trained to predict the cluster labels for masked regions."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://arxiv.org/abs/2106.07447">{"Hsu et al.: HuBERT (2021)"}</Link></p>
                </InAModel>
                <KeepInMind>
                  {"A fitted k-means center table can therefore be reused as a codebook. The clustering procedure chooses the representatives; the quantizer looks up the nearest one."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Reading the numbers back again">
                <p>
                  {"Decoding retrieves the vector at the supplied ID. To rebuild the picture, put each retrieved patch back in its original location. Reject an ID outside the codebook’s range rather than inventing a representative for it."}
                </p>
                <p>
                  {"Decoding restores the selected representative. It cannot recover differences between input patches that received the same ID."}
                </p>
                <KeepInMind>
                  Encoding is a search over the table, decoding is an index into
                  it. Only one of the two can lose anything, and it is the
                  first.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Round Trip Is Lossy, and the Loss Is a Number",
          content: (
            <>
              <SubSection title="10. What a piece loses on the way through">
                <p>
                  Send a piece through and back. The piece (0.35, 0.39) of the
                  photograph, under a table of four entries, becomes the number
                  0, and the number 0 means the vector (0.4490, 0.5119). The
                  piece did not survive. What survives is the entry it was
                  nearest to, and the difference between the two is gone in the
                  sense that nothing downstream holds it.
                </p>
                <p>
                  That is not a defect to be repaired by a better
                  implementation. A table of four entries can distinguish four
                  things, and the photograph has 53 different pieces, so at
                  least 49 of them have to arrive somewhere they did not start.
                  What is worth asking is how much is lost rather than whether
                  anything is, and the answer to that is a number.
                </p>
                <KeepInMind>
                  {"A patch equal to its representative reconstructs exactly. If there are more distinct patches than representatives, at least some patches must change or share an ID."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The rounding error, defined">
                <p>
                  Take each piece, subtract the entry it became, square the
                  result coordinate by coordinate, add those up, and average
                  over the pieces. That average is the rounding error of the
                  whole collection under that table, and it is what a coder
                  calls the distortion.
                </p>
                <Equation>
                  {"error  =  (1 / n) × Σᵢ ||pieceᵢ − entry(pieceᵢ)||²"}
                </Equation>
                <p>
                  {"For the four inputs, average the squared gaps to obtain the distortion. Since each patch has two pixels, divide by two before taking the square root to obtain the root mean squared error per pixel."}
                </p>
                <Equation>{"Mean squared distance per patch = (1 + 2 + 2 + 4) / 4 = 2.25\nRMSE per pixel = √(2.25 / 2) ≈ 1.061"}</Equation>
                <WhyThisWorks title="Why this is the quantity, rather than some other measure of miss">
                  <p>

                    The choice of squares is not neutral, and it is the same choice the update rule makes. The point minimizing the total squared distance to a set of points is their mean, which is why the step that moves an entry to the mean of the pieces that chose it is the step that lowers this number.
                  </p>
                  <p>
                  {"If the objective is the sum of absolute coordinate differences, a coordinate-wise median minimizes each group’s error. Updating to the mean is no longer guaranteed to improve that objective. Choose the fitting update to match the error being minimized."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  The rounding error is the mean squared distance from a piece
                  to the entry it became. It is k-means&rsquo; inertia divided by
                  the number of rows, and the same choice of squares underlies
                  both.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The photograph at sixteen entries">
                <p>
                  Now the measurement. The photograph&rsquo;s 128 pieces against
                  a table of sixteen entries chosen from those same pieces give
                  a rounding error of 0.000418, which is a typical miss of
                  0.0145 on a pixel whose brightness runs from 0 to 1. The
                  furthest any piece had to travel is a squared gap of 0.00243,
                  which is 0.0493 in the plane. Every one of the sixteen entries
                  wins at least one piece.
                </p>
                <CodebookExplorer initialPicture="photograph" initialCodes={16} />
                <p>

                  Turn the table size down and watch two things at once. The
                  points in the plane are the pieces and the marked positions
                  are the entries, and at two entries the picture visibly
                  becomes two tones while the error goes up by a factor of
                  nearly sixty. The pieces lie in a narrow band along the
                  diagonal, because a pixel and its neighbor are nearly equal
                  in a smooth picture, and that band is what makes a small table
                  do as well as it does here.
                </p>
                <KeepInMind>
                  {"At sixteen entries, the photograph’s RMSE per pixel is about 0.0145 on the zero-to-one brightness scale. We will use the mean squared patch error, 0.000418, for the later comparisons."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What the numbers cost to write down">
                <p>
                  {"Sixteen entries require four bits per ID in a fixed-length encoding. The ID stream is smaller than storing every original brightness separately at ordinary pixel precision, but the codebook also costs space. Count both before calling the result a saving."}
                </p>
                <Equation>{"ID stream = 128 patches × 4 bits = 512 bits\nOriginal = 256 pixel values\nCodebook = 16 entries × 2 pixel values"}</Equation>
                <>
                  <p>
                    The codebook must travel with the IDs, or the receiver cannot
                    reconstruct their meaning. This example uses sixteen entries with
                    two coordinates each.
                  </p>
                  <Equation>{"codebook = 16 × 2 = 32 brightness values\nencoded picture = 128 IDs + 32 codebook values\noriginal picture = 256 brightness values"}</Equation>
                  <p>
                    These are counts of stored values, not equal-sized bytes: an ID and
                    a brightness value may use different representations. Sharing the
                    same table across many pictures amortizes the codebook cost.
                  </p>
                </>
                <NumberTable
                  headings={[
                    "entries",
                    "bits per number",
                    "bits for the picture",
                    "numbers in the table",
                    "rounding error",
                  ]}
                  rows={[
                    ["1", "0", "0", "2", "0.113862"],
                    ["2", "1", "128", "4", "0.024903"],
                    ["4", "2", "256", "8", "0.007695"],
                    ["8", "3", "384", "16", "0.001877"],
                    ["16", "4", "512", "32", "0.000418"],
                    ["32", "5", "640", "64", "0.000053"],
                  ]}
                  caption="Storage for the photograph’s IDs, excluding the codebook. With one possible ID, the stream needs no distinguishing bits, but its representative and the image dimensions still need to be available."
                />
                <KeepInMind>
                  {"For the power-of-two sizes shown, doubling the table adds one bit per fixed-length ID. An arbitrary size needs enough whole bits to identify every entry. Reusing a codebook across images can spread its storage cost over more patches."}
                </KeepInMind>
                <Equation>{"Fixed-length bits per ID = ⌈log₂(K)⌉\nFor K = 53: log₂(53) ≈ 5.73, so use 6 bits per ID"}</Equation>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
  "For this bounded two-pixel representation, rounding brightness to two decimals gives a finite grid; enumerating it still spends entries on combinations the picture may not contain.",
  true,
  "Two decimal places leave 101 values per pixel and so 10,201 possible two-pixel pieces, which is finite. The photograph uses fifty-three of them, so enumerating the grid spends almost the whole table on combinations this picture never produces, and the size of that grid is set by the sensor rather than by the picture. At sixteen pixels a piece the same grid runs to about 1.17 × 10³² possibilities.",
  {
    "description": "Use two-pixel pieces and include both brightness endpoints.",
    "data": "Each pixel brightness lies in [0,1]. Rounded values are 0.00,0.01,...,1.00. A piece has exactly two coordinates."
  },
),
            choice(
              "The vector (2, 0) sits 4 away in squared distance from entry 0 at (0, 0) and 4 away from entry 1 at (4, 0). What settles the number it gets?",
              [
                "The entry that is smaller as a vector",
                "The entry that comes first in the table",
                "Whichever entry has won fewer vectors so far",
                "Nothing, and the lookup refuses a tie",
              ],
              1,
              "The SDK resolves equal distances by the earlier table entry. Reordering changes numerical IDs, and the tied vector can reconstruct to a different equally distant representative. Uniquely nearest physical representatives stay the same. The total squared distortion in this example remains unchanged.",
            ),
            choice(
  "The calculation below returns 0.000418. What does that value measure?",
  [
                  "The largest squared gap any single piece had to travel",
                  "The mean squared distance from a piece to the entry it became",
                  "The share of pieces that came back unchanged",
                  "The squared gaps summed over all 128 pieces",
                ],
  1,
  "For each patch, sum the squared coordinate differences from its selected codebook vector, then average those patch distances. That mean squared Euclidean distortion is 0.000418 here. The largest single patch distance is 0.00243. The reported 0.0145 brightness error is a root-mean-square value per coordinate, which is a different summary and unit.",
  {
    "description": "codes contains the selected nearest entry for each piece.",
    "code": "reconstructed = codebook[codes]\nsquared_distance = ((pieces - reconstructed)**2).sum(axis=1)\nreported_error = squared_distance.mean()"
  },
),
            several(
  "Which statements hold for this codebook fitted by k-means?",
  [
                  "Cluster k becomes entry k, and a lookup is the assign step run on one row",
                  "Inertia is the rounding error before it is divided by the number of pieces",
                  "The two are an analogy, since a codebook is fitted by a different procedure",
                  "The warning that a grouping belongs to the rows it was fitted on transfers unchanged",
                ],
  [0, 1, 3],
  "With these fitted k-means centers and the same squared-Euclidean comparison, nearest-code assignment uses the same rule as cluster prediction. The centers supply the codebook representatives; the IDs identify the selected centers. That agreement concerns the assignment operation. Codebook validation, reconstruction and the quality of any later learned model remain separate concerns.",
  {
    "description": "The fitting and lookup use squared Euclidean distance.",
    "data": "The codebook stores the k-means centers in their fitted order. A piece receives the index of its nearest center. Distortion is mean squared Euclidean distance per piece; inertia is the corresponding sum."
  },
),
        ],
        },
        {
          title: "Part 4. What a Bigger Table Buys",
          content: (
            <>
              <SubSection title="14. The sweep, on all four pictures">
                <p>
                  {"Increasing the codebook size reduces the measured error in this sweep. Compare the reduction on each picture: the same extra ID bit does not buy the same improvement for every collection. A logarithmic plot makes repeated proportional reductions easier to compare."}
                </p>
                <DistortionCurveChart />
                <p>
                  {"The photograph and speckled square show different reductions at the same table sizes. The listed factors compare each error with the next one in its own sweep. They describe these fitted examples, rather than a guaranteed amount of improvement per added bit."}
                </p>
                <KeepInMind>
                  A doubled table always costs one more bit per piece and does
                  not always buy the same reduction. What it buys depends on
                  the collection, which is the next section.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. What the textbook predicts, and what was measured">
                <p>
                  {"High-rate quantization theory describes an idealized large-codebook limit. For a suitable smooth distribution filling d dimensions and squared-error distortion, the best achievable distortion scales approximately as K raised to minus two over d. This gives a reference for interpreting the sweep, with assumptions that a small finite sample may not satisfy."}
                </p>
                <Equation>{"Distortion ≈ C × K^(−2/d)\nDoubling K gives a reduction factor of 2^(2/d)\nd = 2: factor 2\nd = 1: factor 4"}</Equation>
                <p>
                  The speckled square is the case that result describes, since every pixel there was drawn independently and the pieces genuinely fill the square, and its measured factors of 1.74 to 2.63 sit around the predicted two.
                </p>
                <p>The two coordinates in these photograph patches are strongly related: neighboring pixels usually have similar brightness. The patches therefore cluster near the line where the coordinates are equal.</p>
<p>The measured spread along that line is 163.6 times the perpendicular spread. Although each patch is written with two coordinates, most observed variation lies close to one direction. This helps explain why its error reduction differs from a uniformly occupied two-dimensional example.</p>
<p>The measured reduction factors are 4.57, 3.24, 4.10, 4.49, and 7.96. Several are close to the idealized one-dimensional factor of four. The last occurs when the codebook is approaching the number of distinct patches in this small photograph, where a large-sample scaling argument is no longer a reliable description.</p>
<p>The comparison supports a useful distinction: the number of coordinates and the effective dimension occupied by the data need not be the same. It does not turn the idealized rate into an exact prediction for every finite codebook.</p>
                <NumberTable
                  headings={[
                    "picture",
                    "spread along over spread across",
                    "measured factor per doubling",
                    "factor predicted for that many dimensions",
                  ]}
                  rows={[
                    ["speckled square", "1.4", "1.74 to 2.63", "2, for two dimensions"],
                    ["printed chart", "2.9", "2.07 then 7.21", "2, for two dimensions"],
                    ["photograph", "163.6", "3.24 to 7.96", "4, for one dimension"],
                    ["poster", "642.7", "69.81 at four, then 1.76 to 2.33", "4, for one dimension"],
                  ]}
                  caption="The ratio of the two spreads is how flat the collection of pieces is. Nothing about the method changes across these rows; only the pieces do. The two outsized factors have different causes. The poster’s 69.81 arrives at the table size its four tones ask for, which is section 16, and the printed chart’s 7.21 arrives one step before its five different pieces are all held, which is section 17."
                />
                <KeepInMind>
                  {"Patches concentrated near a line can behave differently from patches spread over a plane. These finite examples help explain that distinction; they do not establish the asymptotic rate or a fixed benefit from every doubling."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where the content decides the size">
                <p>
                  The poster is four flat bands of tone with a faint grain over
                  them, and its sweep does something neither of the others does.
                  Going from two entries to four cuts the error by 69.81, which
                  is far outside anything the smooth curve of the photograph
                  reaches. Going from four to eight cuts it by 1.76, which is
                  worse than the speckled square manages at the same step.
                </p>
                <p>
                  {"Four representatives capture the poster’s four main tones. Further entries mostly reduce the added grain. The large drop at four reflects how this particular picture was constructed. Compare that change with the smoother sweeps of the photograph and speckled square."}
                </p>
                <KeepInMind>
                  {"A sharp reduction can suggest a useful codebook size, but it does not prove a natural number of groups. Check the data, fitting variability and the storage budget before choosing from the curve."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Where the curve stops">
                <p>For this photograph, there are 53 distinct two-pixel patches. A table containing each distinct patch would allow exact reconstruction of these inputs. The fitted 53-entry table gives a measured squared reconstruction error of about 4.6 × 10⁻³³, a negligible numerical residue at this scale. That is very close to zero, but it is a representable nonzero result, not bitwise equality.</p>
                <p>
                  {"More than 53 entries cannot all represent different observed patches exactly once. Additional entries could be unused or duplicated. This SDK rejects duplicate representatives, so some larger fitted tables are refused. That is an implementation constraint, not a failure of nearest-entry lookup as mathematics."}
                </p>
                <p>
                  {"The chart has only five distinct patches. In the fitted eight-entry table, five entries suffice for exact reconstruction and three are unused. The sixteen-entry fit is refused here because it produces duplicate representatives."}
                </p>
                <KeepInMind>
                  {"Once every observed patch is represented, additional entries cannot improve its exact reconstruction. They may be unused, duplicate existing entries, or represent inputs absent from this collection. The SDK’s duplicate-entry rule limits which fitted tables this example accepts."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Two Pieces, One Number",
          content: (
            <>
              <SubSection title="18. Pieces that share a number">
                <p>

                  Fewer entries than different pieces means some pieces share a
                  number, and the interesting question is how different two
                  pieces sharing a number can be. On the photograph at two
                  entries, the pieces (0.00, 0.00) and (0.41, 0.45) both become
                  the number 0, and both come back as (0.2067, 0.2366). Those
                  two pieces are 0.6088 apart in the plane, one of them being
                  black and the other being close to mid gray.
                </p>
                <SameNumberTable panel="collisions" />
                <p>
                  The widest such pair narrows as the table grows, from 0.6088
                  at two entries to 0.0894 at sixteen, which is the same trade
                  the previous Part measured seen from a different side. It never
                  reaches zero while there are fewer entries than different
                  pieces, and at every size there is some pair the numbers
                  cannot tell apart.
                </p>
                <KeepInMind>
                  Two genuinely different pieces receiving one number is the
                  ordinary working of the method rather than an edge case, and
                  the table size is what sets how different they may be.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A picture the table was never chosen for">
                <p>

                  Everything so far has quantized a picture against a table
                  chosen from that same picture. Take the photograph&rsquo;s
                  table of sixteen entries and put the printed chart to it
                  instead. The rounding error goes from 0.000418 to 0.104290,
                  which is 249.5 times worse, and 11 of the 16 entries are never
                  asked for at all.
                </p>
                <SameNumberTable panel="elsewhere" />
                <p>

                  The reason is visible in the plane. The photograph&rsquo;s
                  entries all lie in the narrow band near the diagonal, since
                  that is where its pieces were, and the chart&rsquo;s pieces
                  include (0.90, 0.05), a bright pixel next to a dark one, which
                  is a place no entry has any reason to be. That piece is given
                  the number 13, and 13 means the vector (0.4286, 0.4771), which
                  is mid gray twice over. A hard edge has become a flat patch.
                </p>
                <InAModel>
                  <p>
                    A fixed coordinate grid handles this example differently. It rounds each coordinate to a permitted level without fitting representatives to a sample, so it covers the square even in regions absent from training. With sufficiently fine levels, it would keep (0.90, 0.05) close to its original position. We should compare that alternative when the fitted codebook leaves this region poorly represented.
                  </p>
                  <p>
                  {"A fixed grid spends some representatives outside the photograph’s narrow band. Whether that is worthwhile depends on the inputs it will later encode. The 249.5 ratio above compares two pictures encoded with the same fitted table; it does not compare that table with a fixed grid."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"A fitted codebook may transfer poorly when new patches occupy regions missing from its training sample. Measure reconstruction error on representative new inputs rather than assuming that a valid ID means a good match."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The number carries no notion of how near it was">
                <p>
                  Look at the two rows of the previous table together. The
                  chart&rsquo;s piece (0.05, 0.05) lands on entry 11 at a squared
                  gap of 0.001, which is as good a match as anything on the
                  photograph gets. Its piece (0.90, 0.05) lands on entry 13 at a
                  squared gap of 0.404696, four hundred times as large. What is
                  sent downstream in the two cases is the number 11 and the
                  number 13, and nothing else.
                </p>
                <p>
                  {"An ID identifies a representative, not the input’s original distance from it. Looking up the representative restores its coordinates, but cannot reveal which of several nearby input patches produced that ID."}
                </p>
                <p>
                  {"If later processing needs the reconstruction error, calculate and record it while the original input is available. The ID can still be sent alongside that additional information."}
                </p>
                <KeepInMind>
                  {"The IDs alone do not report reconstruction quality. Retaining the original patches or recording residuals makes that quality measurable after encoding."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
  "What explains the difference between these two recorded quantization experiments?",
  [
                  "The speckled square is quantized in fewer pieces, so each doubling has less to work with",
                  "The photograph’s pieces concentrate near a diagonal, so several measured reductions resemble lower-dimensional quantization behavior",
                  "The photograph's tables were fitted from more starting draws",
                  "The speckled square is noisier, so its error cannot be measured as precisely",
                ],
  1,
  "High-resolution quantization theory predicts a dimension-dependent error rate under its assumptions. The filled-square example has measured reductions near the two-dimensional prediction. The photograph varies much more along a diagonal than across it, with a reported variance ratio of 163.6, and several reductions lie near the one-dimensional prediction. These finite experiments illustrate how occupied geometry matters; the asymptotic rate is not a guarantee for every fitted table size.",
  {
    "description": "Both use 128 two-coordinate pieces, matching codebook sizes and the same fitting budget.",
    "data": "Speckled-square pieces fill a two-dimensional square.\nPhotograph pieces concentrate near a diagonal line; variance along that line is 163.6 times the perpendicular variance.\nMeasured error-reduction factors per doubling: speckled square 1.74-2.63; photograph 4.57-7.96."
  },
),
            trueFalse(
              "In this invented four-tone poster, a large error reduction when the table reaches four entries is consistent with its four repeated tones; it does not establish that every error curve reveals a true number of clusters.",
              true,
              "Moving from two entries to four reduces this poster's error by a factor 69.81; moving from four to eight gives 1.76. Four representatives account for its main tones, while the faint grain still leaves reconstruction error. This constructed example explains the sharp reduction. A smooth error curve on another image need not identify a natural cluster count.",
            ),
            trueFalse(
              "Asking for more entries than there are distinct observed patches guarantees that every entry represents a different observed patch.",
              false,
              "With more entries than distinct observed patches, entries cannot all represent different observed patches. They may duplicate one another or remain unused, depending on the fit. In this experiment, the photograph's 53-entry reconstruction error is about 4.6 × 10⁻³³, a negligible but nonzero numerical residue. A large codebook does not guarantee useful distinct assignments.",
            ),
            choice(
  "What happens when this saved photograph codebook is applied to the chart?",
  [
                  "The error rises to 0.104290 and 11 of the 16 entries are never asked for",
                  "The lookup refuses, because the chart's pieces fall outside the table",
                  "The error rises a little, since both are pictures of the same size",
                  "The chart's hard edges survive, because an unmatched piece keeps its own value",
                ],
  0,
  "That is 249.5 times worse than the 0.000418 the table manages on the picture it was chosen from. Every entry sits in the narrow band near the diagonal where the photograph's pieces were, so the chart’s piece (0.90, 0.05) is given number 13, and 13 means (0.4286, 0.4771), which is mid gray twice over. A hard edge comes back as a flat patch.",
  {
    "description": "Keep the same saved 16-entry codebook; only the evaluation image changes.",
    "data": "Evaluation image | Mean squared distance | Entries used\nOriginal photograph | 0.000418 | 16 of 16\nPrinted chart | 0.104290 | 5 of 16"
  },
),
            trueFalse(
  "A downstream model receiving only these entry IDs can tell which input pieces were close matches and which were far from their chosen entry.",
  false,
  "The ID identifies the chosen representative, not the distance from the original input. The chart's two example distances are 0.001 and 0.404696, but an ID-only message does not carry either value. If the later application needs those distances, measure and retain them during quantization. Other monitoring may reveal a changed distribution, but it cannot recover the exact discarded input-to-entry distance from the ID alone.",
  {
    "description": "The downstream interface carries no source vectors, reconstruction distances or confidence values.",
    "data": "Quantizer output per piece: one codebook index only."
  },
),
        ],
        },
        {
          title: "Part 6. Choosing the Table, and Entries That Never Win",
          content: (
            <>
              <SubSection title="21. Where the table comes from">
                <p>
                  {"Fit the table by alternating two operations: assign each patch to its nearest entry, then move each used entry to the mean of its assigned patches. Repeat until the stopping criterion is met. This is the k-means procedure used here. Linde, Buzo and Gray’s 1980 vector-quantizer design paper developed this kind of alternating design for compression: a limited codebook should represent a much larger set of signal vectors with low distortion."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://www.cs.cmu.edu/~bhiksha/courses/mlsp.fall2010/class14/LBG.pdf">{"Linde, Buzo and Gray: An Algorithm for Vector Quantizer Design (1980)"}</Link></p>
                <p>
                  It inherits every property of that procedure, including the
                  awkward one that it finds a local answer rather than the best
                  one and which local answer depends on where it started. On this
                  photograph that turns out to matter very little. Six different
                  starting draws at eight entries reach two answers, 0.0018756
                  and 0.0018772, which differ in the sixth decimal place. That is
                  a fact about this collection, whose pieces lie along a line,
                  rather than a guarantee, and on a collection with several
                  genuinely different good tables the spread would be real.
                </p>
                <KeepInMind>
                  The table is fitted, by the same alternating procedure the
                  clustering page describes. It is a local answer, and here the
                  starting draw moved it by less than a part in a thousand.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Entries the collection never asks for">
                <p>
                  {"An unused entry still occupies codebook storage. The fixed-length ID width is set by the table’s allocated size, so deleting unused entries saves ID bits only when it crosses a bit-width boundary. All entries in this photograph’s fitted tables up to size 32 are used, but k-means does not guarantee that for every dataset and initialization."}
                </p>
                <p>

                  Fit on half the photograph and measure on the other half and
                  they appear. The table below fits on the top 64 pieces and then
                  quantizes both halves, and at sixteen entries the half it never
                  saw asks for only ten of them while rounding three times worse
                  than the half it was fitted on.
                </p>
                <UnusedEntriesTable />
                <p>
                  The last column is the same idea taken further, a table fitted
                  on the whole photograph and put to the printed chart, where 27
                  of 32 entries are never asked for. A model reading five
                  distinct numbers out of a possible 32 is paying five bits a
                  piece to say something that needed three, and nothing in the
                  numbers says so.
                </p>
                <KeepInMind>
                  {"Count the IDs actually used as well as the entries allocated. Unused entries can indicate a mismatch with the new inputs, redundant representatives, or a fitting issue. Their presence alone does not establish the cause."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The two ends of the range">
                <p>
                  With one codebook entry, every input patch receives code zero. No bits are needed to distinguish that code from another code, because there is no alternative. The representative is the mean patch, and the reported reconstruction error is 0.113862. That equals the mean squared distance to the patch mean. We still have to store the representative, but the sequence of codes retains none of the differences among patches.
                </p>
                <p>
                  {"At 53 entries, this fitted table reconstructs the photograph to a negligible floating-point residual. A larger table adds no necessary capacity for these same distinct patches. In practice, choose a size using total storage cost and reconstruction error on the inputs you expect to encounter."}
                </p>
                <NumberTable
                  headings={["table size", "what the numbers carry", "rounding error"]}
                  rows={[["1 entry","one repeated ID; 0 distinguishing bits per patch","0.113862, the spread about the mean"],["16 entries","4 fixed-length bits per patch","0.000418"],["53 entries","which of 53 entries; 6 fixed-length bits per patch","4.6 × 10⁻³³, a negligible nonzero residual"],["54 entries","this fitted table is refused because of duplicate representatives","no accepted fit returned"]]}
                />
                <KeepInMind>
                  {"A one-entry table retains the mean patch and loses variation among patches. A table containing every distinct observed patch can reconstruct that collection exactly in ideal arithmetic. Either endpoint can be useful; the appropriate size depends on the accuracy and storage the application needs."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Choosing the Codebook and Handling Ambiguous Matches" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="24. What any complete description has to settle">
                <p>
                  {"Specify these choices when building or comparing quantizers. They determine what gets encoded and how the resulting IDs are interpreted."}
                </p>
                <DerivationTable
                  expressionHeading="what must be settled"
                  reasonHeading="what turns on it"
                  rows={[{"expression":"what a piece is","reason":"A two-pixel pair here, or a larger image patch or speech-feature frame elsewhere. Larger pieces can capture more local relationships but require representatives with more coordinates."},{"expression":"how many entries","reason":"The allocated entry count determines the fixed-length ID width. More entries may reduce distortion but also cost codebook storage. A table can exceed the number of distinct observed patches; some entries may then be unused."},{"expression":"what near means","reason":"Euclidean distance is one choice. The squared Euclidean fitting objective explains the mean update. A different distance can change assignments and may require a different fitting update."},{"expression":"how ties are broken","reason":"The earlier entry wins here. Other conventions can choose another equally distant representative, so state the rule when results must be reproducible."},{"expression":"where the table came from","reason":"Record the fitting collection and settings. A table fitted on one sample may distort inputs with different patterns; the cross-picture comparison in section19 demonstrates one such failure."}]}
                />
                <KeepInMind>
                  {"Matching the table size is not enough to reproduce an encoding. The patch definition, distance, tie rule and fitted representatives must agree too."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the arithmetic runs out">
                <p>
                  {"Some inputs cannot be compared or decoded under this interface. Other cases are mathematically valid but rejected by this implementation. Keep those separate when deciding how to validate a request."}
                </p>
                <DerivationTable
                  expressionHeading="Codebook or input condition"
                  reasonHeading="Effect on assigning a code"
                  rows={[{"expression":"a table with no entries","reason":"undefined, with no choice attached. Nearest is the smallest of a set of distances, and there are no distances to take the smallest of, so there is no answer rather than a bad one."},{"expression":"two entries at the same point","reason":"Nearest-entry assignment remains possible with a tie rule, and both IDs decode to the same vector. This SDK rejects duplicate representatives. More entries than distinct observed patches need not force duplicates: unused distinct entries are also possible."},{"expression":"a piece with a different number of coordinates","reason":"undefined. A distance is a sum over matched coordinates, and there is no pairing between a piece of three numbers and an entry of two, so the first step of the rule cannot begin."},{"expression":"a coordinate that is not a number","reason":"NaN prevents the ordinary distance ordering needed to find a nearest entry. Validate that every input coordinate is finite before searching."},{"expression":"a coordinate that is infinite","reason":"This interface rejects infinite coordinates. With finite representatives, an infinite input does not yield ordinary finite Euclidean distances suitable for the comparison."},{"expression":"a number no entry owns","reason":"An out-of-range ID cannot be decoded. A generator restricted to exactly the valid IDs can prevent this case; an unconstrained integer source must be checked."},{"expression":"a piece exactly between two entries","reason":"defined only once a convention is added, since nearest is not unique. The convention costs nothing in error, as section 7 measures, and decides which numbers come out, so two implementations without the same one disagree on inputs both handle correctly."},{"expression":"a piece nowhere near any entry","reason":"defined, and that is the problem. The rule always answers, since some entry is nearest however far away it is, so an input from outside anything the table was chosen for is rounded silently. A squared gap of 0.404696 and one of 0.001 both come back as one whole number."},{"expression":"the distance between two of the numbers","reason":"meaningless, exactly as it is for a word vocabulary. A number is a position in a list, so numbers 3 and 4 need not name nearby entries, and any ordering the fitting happened to produce is an accident of it. The entries have positions in a space; the numbers do not inherit them."},{"expression":"an entry that no piece is nearest to","reason":"Lookup is defined, but an unused entry adds codebook storage. Removing it reduces fixed-length ID width only if the entry count crosses a bit-width boundary. Count actual usage when evaluating a codebook."}]}
                />
                <KeepInMind>
                  {"Duplicate representatives still permit nearest-entry lookup with a tie rule, but they give different IDs the same reconstruction. This SDK rejects that redundancy. A distant input is different: lookup succeeds, while its reconstruction may be poor."}
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Nearest, under a distance somebody chose">
                <p>
                  {"Euclidean distance measures the straight-line gap between two vectors. Manhattan distance sums the absolute coordinate gaps. Either can define nearest-entry lookup, and they need not select the same representative."}
                </p>
                <NearDisagreementTable />
                <p>
                  Of the photograph&rsquo;s 128 pieces against a table of eight entries, exactly one changes hands. The piece (0.13, 0.30) is 0.1078 from entry 5 and 0.1303 from entry 1 by the straight line, so it goes to entry 5, and it is 0.1480 from entry 5 and 0.1437 from entry 1 by the sum of the gaps, so it goes to entry 1.
                </p>
                <p>
                  {"One patch changes assignment under these two distance rules. Changing the lookup rule without changing the fitting objective means the table may no longer be optimized for that lookup. Here the entries were fitted to minimize squared Euclidean error."}
                </p>
                <KeepInMind>
                  {"Choose a distance and fitting objective that agree. For the squared Euclidean objective used here, the mean is the minimizing representative within each assigned group. An absolute-distance objective calls for a different update."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            trueFalse(
  "In these reported runs, the whole-photograph tables use every entry when evaluated on their fitting pieces; the displayed unused entries occur after the evaluated pieces change.",
  true,
  "The supplied report distinguishes fitting pieces from later evaluation pieces. Its whole-photograph fits use every entry on that same photograph through size 32, while the two changed evaluation collections leave entries unused. This is a finding about these runs, not a theorem that every fitted codebook always uses every entry.",
  {
    "description": "These are the reported runs for this fixture, not a guarantee for every fit.",
    "data": "Fit/evaluation data | Entry use\nWhole photograph / same photograph, sizes through 32 | every entry used\nTop 64 photograph pieces / unseen half, size 16 | 10 used\nWhole photograph / printed chart, size 32 | 5 used"
  },
),
            trueFalse(
              "Six starting draws at eight entries reached 0.0018756 and 0.0018772, which shows the fitting procedure finds the best table.",
              false,
              "Lloyd updates and the stopping rule depend on the initial centers. Similar final distortions from six starts show stability for those runs; they do not prove that no better codebook exists. Different starts or data can produce other local solutions. A global optimum needs stronger evidence than agreement among a few initializations.",
            ),
            trueFalse(
  "For a one-entry codebook fitted by squared error, the entry is the mean piece and the distortion equals the mean squared distance from the pieces to that mean.",
  true,
  "The mean patch minimizes squared reconstruction error for a one-entry codebook, and its distortion is the mean squared distance from that mean. With only one available code, no bits are needed to choose among code IDs. The decoder must still store the representative. Thus the code sequence distinguishes no input patches, while the saved codebook retains their fitted mean.",
),
            choice(
  "How many of these six assignments change when lookup switches from squared Euclidean distance to Manhattan distance?",
  ["None", "One", "About a third", "All of them, since the table was fitted under the straight line"],
  1,
  "The first five pieces keep their nearest entry under both rules. For [0.8,0.025], squared Euclidean distance prefers entry 1 while Manhattan distance prefers entry 0. Changing the lookup distance can therefore change some assignments without changing all of them. If the table was fitted using squared Euclidean error, a different lookup metric also changes the criterion used after fitting.",
  {
    "description": "Use the same fixed two-entry codebook for both lookups. Compare matching coordinates; do not refit the entries.",
    "data": "Codebook:\nentry 0 = [0,0]\nentry 1 = [1,0.75]\nSix two-pixel brightness pieces:\n[0,0]\n[0.25,0]\n[0,0.25]\n[1,0.75]\n[0.75,0.75]\n[0.8,0.025]\nSquared Euclidean distance: sum((piece-entry)**2)\nManhattan distance: sum(abs(piece-entry))\nBreak a tie using the earlier entry."
  },
),
            several(
              "Which of these inputs leave the nearest-entry rule with no answer at all, rather than with an answer that has to be read with care?",
              [
                "A table with no entries",
                "A coordinate that is not a number",
                "A piece nowhere near any entry",
                "An entry that no piece is nearest to",
              ],
              [0, 1],
              "Nearest is the smallest of a set of distances, and an empty table has no distances to take the smallest of, while a coordinate that is not a number makes every distance involving it not a number either, so no comparison between two of them holds. A piece far from every entry is the opposite problem, since some entry is nearest however far away it is and the rule answers silently. An entry no piece chooses is well defined and quietly wasteful, which is why the distinct numbers a table produces have to be counted.",
            ),
        ],
        },
        { id: "practice-quantising-the-photograph-with-the-library",
          title: "Practice. Quantizing the Photograph With the Library",
          practice: [
            exercise(
              "Four vectors against three entries",
              [
  "Construct entries (0,0), (4,0) and (0,3), then quantize the four supplied vectors against them. Print IDs, each reconstructed vector and mean squared Euclidean distortion.",
  "Reorder the entries with (4,0) first and print IDs and distortion again. Separate an ID’s table position from the physical entry it identifies; an equal-distance tie chooses the first entry."
],
              `from oop_ml import Codebook, CodebookQuantizer

entries = [[0.0, 0.0], [4.0, 0.0], [0.0, 3.0]]
vectors = [[1.0, 0.0], [3.0, 1.0], [1.0, 2.0], [2.0, 0.0]]

quantizer = CodebookQuantizer(codebook=Codebook(entries))
# Quantise the four vectors, then print their ids, the vector each comes
# back as, and the rounding error to two places.

# Build a second quantizer whose table lists (4, 0) first, quantise the
# same four vectors, and print its ids and its rounding error.`,
              `from oop_ml import Codebook, CodebookQuantizer

entries = [[0.0, 0.0], [4.0, 0.0], [0.0, 3.0]]
vectors = [[1.0, 0.0], [3.0, 1.0], [1.0, 2.0], [2.0, 0.0]]

quantizer = CodebookQuantizer(codebook=Codebook(entries))
assignment = quantizer.quantize(vectors)
print(f"ids {assignment.ids}")
for vector, back in zip(vectors, assignment.reconstruction):
    print(f"{vector} comes back as {back.tolist()}")
print(f"rounding error {assignment.distortion:.2f}")

reordered = CodebookQuantizer(codebook=Codebook([[4.0, 0.0], [0.0, 0.0], [0.0, 3.0]]))
again = reordered.quantize(vectors)
print(f"ids with (4, 0) first {again.ids}")
print(f"rounding error again {again.distortion:.2f}")`,
              `ids (0, 1, 2, 0)
[1.0, 0.0] comes back as [0.0, 0.0]
[3.0, 1.0] comes back as [4.0, 0.0]
[1.0, 2.0] comes back as [0.0, 3.0]
[2.0, 0.0] comes back as [0.0, 0.0]
rounding error 2.25
ids with (4, 0) first (1, 0, 2, 0)
rounding error again 2.25`,
              { hints: [
  "Compare squared distances to every entry for each input.",
  "Reordering renumbers moved entries. For the tied input, inspect the reconstructed vector as well as its numeric ID."
], check: numberCheck("What is the mean squared Euclidean reconstruction distance across the four vectors?", 2.25, 0.005, "The mean squared Euclidean distortion is 2.25. Reordering changes two numeric IDs here; the tied input keeps ID zero while choosing a different equally distant entry."), question: "Which entry represents each vector, and how does table order affect a tie?" },
            ),
            exercise(
              "Choose the photograph’s table of sixteen",
              [
  "Build the supplied photograph and its 128 two-pixel pieces. Fit the sixteen-center grouping with the supplied settings and use those centers as the codebook.",
  "Print distinct source-piece count, distortion, used entries, largest squared reconstruction distance and the busiest entry’s piece count. Count entry usage from assigned IDs."
],
              `from collections import Counter

import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
# Fit a grouping of sixteen clusters with random_seed=7, turn its centroids
# into a codebook, and quantise the pieces. Print how many different pieces
# there are, the rounding error to six places, how many entries are in use,
# the largest squared gap to five places, and the busiest entry's count.`,
              `from collections import Counter

import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
grouping = KMeans(n_clusters=16, random_seed=7).fit(features)
quantizer = CodebookQuantizer(codebook=Codebook.from_centroids(grouping.centroids))
assignment = quantizer.quantize(pieces)

gaps = np.sum((pieces - assignment.reconstruction) ** 2, axis=1)
usage = Counter(assignment.ids)
print(f"different pieces {len(np.unique(pieces, axis=0))}")
print(f"rounding error {assignment.distortion:.6f}")
print(f"entries in use {len(usage)} of 16")
print(f"largest squared gap {gaps.max():.5f}")
print(f"busiest entry holds {usage.most_common(1)[0][1]} pieces")`,
              `different pieces 53
rounding error 0.000418
entries in use 16 of 16
largest squared gap 0.00243
busiest entry holds 17 pieces`,
              { hints: [
  "Keep the same two-pixel layout for fitting and quantizing.",
  "A Counter over result IDs gives both used-entry count and largest occupancy."
], check: numberCheck("How many pieces does the busiest of the sixteen entries hold?", 17, 0.5, "The busiest entry represents seventeen pieces. The learned centers follow the piece distribution rather than assigning equal occupancy to every code."), question: "How evenly does a learned codebook represent the photograph’s pixel pairs?" },
            ),
            exercise(
              "Put the photograph’s table to the printed chart",
              [
  "Fit the same sixteen-entry codebook from photograph pieces, then apply it unchanged to the supplied chart pieces.",
  "Print chart distortion, its ratio to photograph distortion and unused entries. Find the chart piece with greatest squared reconstruction distance and print that piece, its ID and distance."
],
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
stripes = ((columns // 3) % 2 == 0).astype(float)
level = np.where(rows < 8, 0.9, 0.5)
chart_pieces = np.round(np.where(stripes > 0, level, 0.05), 2).reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
grouping = KMeans(n_clusters=16, random_seed=7).fit(features)
quantizer = CodebookQuantizer(codebook=Codebook.from_centroids(grouping.centroids))
at_home = quantizer.quantize(pieces)
# Quantise the chart's pieces with the same quantizer. Print the chart's
# rounding error to six places, how many times worse it is than at_home to
# one place, how many entries the chart never asks for, and the worst-matched
# chart piece with the number it was given and its squared gap.`,
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
stripes = ((columns // 3) % 2 == 0).astype(float)
level = np.where(rows < 8, 0.9, 0.5)
chart_pieces = np.round(np.where(stripes > 0, level, 0.05), 2).reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
grouping = KMeans(n_clusters=16, random_seed=7).fit(features)
quantizer = CodebookQuantizer(codebook=Codebook.from_centroids(grouping.centroids))
at_home = quantizer.quantize(pieces)
away = quantizer.quantize(chart_pieces)

gaps = np.sum((chart_pieces - away.reconstruction) ** 2, axis=1)
worst = int(np.argmax(gaps))
print(f"chart rounding error {away.distortion:.6f}")
print(f"times worse than at home {away.distortion / at_home.distortion:.1f}")
print(f"entries never asked for {16 - len(set(away.ids))} of 16")
print(f"worst piece {chart_pieces[worst].tolist()} became number {away.ids[worst]}")
print(f"its squared gap {gaps[worst]:.6f}")`,
              `chart rounding error 0.104290
times worse than at home 249.5
entries never asked for 11 of 16
worst piece [0.9, 0.05] became number 13
its squared gap 0.404696`,
              { hints: [
  "Do not refit on the chart; the mismatch is what this experiment measures.",
  "Calculate each piece’s squared distance to its assigned reconstruction before finding the worst one."
], check: numberCheck("What is the ratio of chart distortion to photograph distortion under the same fitted codebook?", 249.5, 0.1, "The chart distortion is about 249.5 times the photograph distortion. The same codebook poorly covers patterns that were uncommon in the fitting photograph."), question: "What happens when a photograph-trained codebook represents a printed chart?" },
            ),
            exercise(
              "Ask for a table the photograph cannot supply",
              [
  "Group the photograph pieces into fifty-three centers, then fifty-four, using the supplied settings. For each, report whether grouping fitted and then attempt codebook construction and quantization.",
  "Print distortion if construction succeeds. Otherwise catch the library error and print its class and message, keeping the failed stage visible. This checks the actual fitted centers and the SDK’s uniqueness requirement, rather than a universal upper bound on possible codebook size."
],
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans, MLLibError

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]

# For 53 entries and then 54: fit the grouping, build the codebook from its
# centroids, quantise the pieces and print the rounding error in scientific
# notation. Catch the library's own error when a step refuses, and print
# its class name and its message.`,
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans, MLLibError

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]

for n_entries in (53, 54):
    grouping = KMeans(n_clusters=n_entries, random_seed=7).fit(features)
    print(f"{n_entries} entries: the grouping fitted")
    try:
        codebook = Codebook.from_centroids(grouping.centroids)
    except MLLibError as refusal:
        print(f"  {type(refusal).__name__}: {refusal}")
        continue
    assignment = CodebookQuantizer(codebook=codebook).quantize(pieces)
    print(f"  rounding error {assignment.distortion:.1e}")`,
              `53 entries: the grouping fitted
  rounding error 4.6e-33
54 entries: the grouping fitted
  NonUniqueTokensError: codes 37 and 53 are the same vector, which would be two ids for one point`,
              { hints: [
  "The clustering routine and the codebook enforce different contracts.",
  "An empty or repeated cluster center may be accepted by grouping yet create duplicate codebook vectors."
], question: "Why can this 54-center clustering fit succeed while codebook construction rejects its result?" },
            ),
          ],
        },
      ]}
    />
  );
}
