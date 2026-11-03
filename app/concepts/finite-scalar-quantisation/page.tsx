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
import { CostAgainstCodes } from "@/components/widgets/CostAgainstCodes";
import { GridUsage } from "@/components/widgets/GridUsage";
import { QuantiserPlayground } from "@/components/widgets/QuantiserPlayground";
import { RungLadder } from "@/components/widgets/RungLadder";

export const metadata: Metadata = {
  title: "Finite Scalar Quantization · Perceptron Lab",
  description:
    "Finite scalar quantization restricts each coordinate to a small set of levels. Combining the coordinate choices produces a discrete code without selecting a whole vector from a learned codebook.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FiniteScalarQuantisationPage() {
  return (
    <ConceptPage
      lessonId="finite-scalar-quantisation"
      intuition={lessonIntuitions["finite-scalar-quantisation"]}
      technicalStart="Part 2. Squashing and Rounding, One Coordinate at a Time"
      openingTitle="Round Each Coordinate Instead of Learning a Table"
      playgroundTitle="Round a vector onto a finite grid"
      playgroundIntro="Follow a vector through bounding, rounding, and code construction. Compare the selected coordinate levels with the original values."
      title="Finite Scalar Quantization"
      tagline={"Finite scalar quantization restricts each coordinate to a small set of levels. Combining the coordinate choices produces a discrete code without selecting a whole vector from a learned codebook."}
      prerequisites={
        <>
          {"The "}{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            giving a word a vector
          </Link>{" "}
          {" lesson constructs the four-coordinate word representations used here. The "}{" "}
          <Link href="/concepts/k-means" className={link}>

            grouping rows around centers
          </Link>{" "}

          {" lesson explains how to fit representatives for comparison. For the relationship between pieces and IDs, read "}{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          {"."}</>
      }

      playground={<QuantiserPlayground />}
      sections={[
        {
          title: "Part 1. The Table Somebody Had to Learn",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Where a word becomes four numbers, and where it has to become one">
                <p>
                  Take the eighteen short English sentences about reports and
                  costs that the rest of this section works on, and give every
                  word in them four numbers describing how it is used. That gives
                  seventy-two words and, because a word occurring in only one
                  sentence comes out with the same description as every other
                  word in that sentence, thirty-five distinct vectors between
                  them. The word cost comes out as 0.5904, 0.5241, &minus;0.1293
                  and &minus;0.3151.
                </p>
                <>
<p>Some sequence-model interfaces require an ID from a finite set rather than a continuous input vector. To use our four-coordinate representation with such an interface, we need a rule for assigning it a discrete code. This is an interface choice, not a claim that models in general cannot use real-valued inputs.</p>
                <p>Quantization is the replacement of a continuous value or vector by one of a limited set of representatives. The code identifies the representative. The difference between the original and reconstructed vector lets us measure the information lost through that choice.</p>
</>
                <KeepInMind>
                  Everything on this page rounds vectors rather than strings. The
                  sentence this section carries, about Dr Alvarez and the
                  low-cost re-analysis, is not a corpus, so its words appear here
                  only where the eighteen sentences happen to contain them, which
                  is twice out of its seven pieces.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a table of representative vectors costs">
                <p>
                  {"A learned codebook assigns each input to its nearest representative. As a comparison, we fit 64 representatives to 600 four-coordinate vectors and measure the mean squared assignment distance. The reported error is 0.1368. We will compare this with a grid that does not fit representatives."}
                </p>
                <p>A learned codebook requires representative vectors to be fitted on suitable data before we can use them for rounding. That adds a training step and ties the representatives to the collection we fitted them on. Some entries may also receive few or no assignments. With assignment-based updates, those unused entries receive little direct learning signal, so implementations may need an explicit policy for them.</p>
                <p>Unused codebook entries are a possible training problem, rather than an inevitable property of codebooks. Grouping the six hundred vectors here into tables from sixteen to a hundred and sixty entries uses every row in each table. Part 5 compares the code usage of the two arrangements, so we can distinguish a training-loop problem from the choice of a learned table itself.</p>
                <KeepInMind>
                  The fit and the collection to fit on are unconditional costs. A
                  table with rows nothing lands on is a cost of one way of
                  learning the table, and the measurements in Part 5 show it is
                  not the way that leaves the most codes empty here.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What we would like instead">
                <p>
                  {"A fixed grid places its allowed representative values before seeing the observations. Encoding can then work coordinate by coordinate, without searching a learned table of complete vectors. The representatives follow the rule rather than adapting to the input distribution. In 2023, Mentzer and colleagues proposed finite scalar quantization as a simpler discrete bottleneck for learned image representations, reducing the codebook-management work of vector quantization."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://arxiv.org/abs/2309.15505">{"Mentzer et al.: Finite Scalar Quantization: VQ-VAE Made Simple (2023)"}</Link></p>
                <p>Finite scalar quantization makes that choice separately for each coordinate. It maps the coordinate into a bounded range, rounds to an allowed level and combines the resulting level indices into one code. The rule itself uses no fitted codebook, although a surrounding model can still learn representations that work well with it.</p>
                <KeepInMind>
                  {"This lesson uses a symmetric grid in the tanh-bounded interval to make the rounding visible. The paper’s implementation uses a shifted bounding function and a different normalization for even level counts, so these numerical examples are not a reproduction of its code. In a trained model, a straight-through gradient estimate lets the encoder learn despite rounding having zero derivative almost everywhere. The SDK demonstration here rounds supplied vectors; it does not train that encoder."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Squashing and Rounding, One Coordinate at a Time",
          content: (
            <>
              <SubSection title="4. Bounding a coordinate so the levels have somewhere to be">
                <p>
                  A model&apos;s coordinate can fall outside the range covered by our finite levels. We first map it into a bounded interval using tanh. Near zero the function changes values only slightly; farther out it approaches the interval&apos;s ends. In exact arithmetic its output is strictly between minus one and one, though floating-point evaluation can round to an endpoint. We then scale and round to the permitted levels.
                </p>
                <Equation>{"bounded  =  tanh(z)     in  (−1, 1)"}</Equation>
                <p>
                  {"In finite precision, tanh can round to an endpoint. In the calculation used here, it returns exactly 1 near an input of 18.99034. That threshold depends on precision and implementation. For comparison, cost’s first coordinate maps to about 0.5302, while an input of 3 maps to about 0.99505."}
                </p>
                <KeepInMind>
                  {"The bounding function uses the same formula for every coordinate. It needs no fitted parameters, but the scale of its input determines how much variation survives near the interval’s ends."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The levels, and how they are spaced">
                <>
                  <p>
                    Place L evenly spaced levels between minus one and one, including
                    both endpoints. There is one fewer interval than there are levels.
                  </p>
                  <Equation>{"level spacing = (1 − (−1)) / (L − 1) = 2 / (L − 1)"}</Equation>
                  <p>
                    Every bounded coordinate will be rounded to one of those levels.
                  </p>
                </>
                <Equation>
                  {"level j  =  −1 + 2 j / (L − 1),   for j = 0 … L − 1"}
                </Equation>
                <p>
                  At five levels those are &minus;1, &minus;0.5, 0, 0.5 and 1. At
                  eight they are &minus;1, &minus;5/7, &minus;3/7, &minus;1/7,
                  1/7, 3/7, 5/7 and 1, spaced two sevenths apart. Notice that
                  zero is a level when L is odd and is not one when L is even,
                  which looks like a detail here and returns in Part 4 as the
                  reason a whole rounding rule has to be corrected.
                </p>
                <p>
                  {"We will use eight levels for the first coordinate and five for each of the other three. The FSQ paper includes this as one of several configurations."}
                </p>
                <KeepInMind>
                  The levels are evenly spaced in the bounded interval, not in
                  whatever units the coordinate arrived in. Squashing is not
                  linear, so evenly spaced there means unevenly spaced here, and
                  Part 6 opens on that.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Rounding to the nearest level">
                <>
                  <p>

                    Scale the bounded coordinate so that neighboring levels are one
                    unit apart. The rounding step can then operate on a unit-spaced
                    grid.
                  </p>
                  <Equation>{"half width = (L − 1) / 2\nscaled coordinate = bounded coordinate × half width"}</Equation>
                  <p>
                    The endpoints lie at minus and plus the half width. With an even
                    number of levels, those endpoints are half-integers, so the grid
                    convention must account for that offset.
                  </p>
                </>
                <Equation>
                  {"h  =  (L − 1) / 2\n\nposition  =  round( tanh(z) × h )"}
                </Equation>
                <p>
                  {"For five levels, the half width is 2, so integer positions map back to levels by division by 2. For eight levels, the half width is 3.5. Simply rounding to integers does not produce the intended symmetric eight-level grid. Part 4 adds the required offset; the worked vector below uses that corrected rule."}
                </p>
                <KeepInMind>
                  {"The calculation grows with the number of coordinates, rather than requiring a distance to every complete grid point. It includes bounding, scaling and rounding each coordinate, followed by composing the digits into an ID."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The word cost, taken all the way through">
                <p>
                  Everything so far applies to one coordinate. Doing it to all
                  four of the word cost&rsquo;s numbers, at eight levels for the
                  first and five for the rest, is the whole method on one vector,
                  and it is small enough to check with a pencil. The playground
                  at the top of the page has a button that loads exactly these
                  four numbers.
                </p>
                <WorkedExample title="Four coordinates, four levels chosen">
                  <Equation>
                    {"coordinate   value      squashed    × h − offset   position   digit   level\n" +
                      "  1 (8 levels)  0.5904    0.5302       1.3557          1        5     3/7\n" +
                      "  2 (5 levels)  0.5241    0.4809       0.9618          1        3     1/2\n" +
                      "  3 (5 levels) −0.1293   −0.1285      −0.2570          0        2       0\n" +
                      "  4 (5 levels) −0.3151   −0.3051      −0.6102         −1        1    −1/2"}
                  </Equation>
                  <p>
                    The offset in the third column is a half for the first
                    coordinate and zero for the other three, and Part 4 is
                    entirely about why. The digit is the position shifted so that
                    the lowest one is zero, which for eight levels means adding
                    four and for five means adding two.
                  </p>
                </WorkedExample>
                <p>
                  So the word cost has chosen level 5 of 8 on its first
                  coordinate and levels 3, 2 and 1 of 5 on the others, and the
                  four numbers it will be replaced by are 3/7, 1/2, 0 and
                  &minus;1/2. The squared distance from where it was to where it
                  ended up, measured in the bounded interval, is 0.065215.
                </p>
                <KeepInMind>
                  Nothing in that table consulted another vector, another word or
                  a collection. The same four numbers would have produced the
                  same four digits on the first day of a project with no data at
                  all.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Reading the Levels as Digits",
          content: (
            <>
              <SubSection title="8. Four small numbers into one">
                <p>
                  The four digits are the answer, but a model that reads whole
                  numbers wants one number and not four. Turning four bounded
                  digits into one number is something we already know how to do,
                  because it is how writing numbers down works. In ordinary
                  decimal, three digits become one number by multiplying the
                  second by ten and the third by a hundred; here the multipliers
                  are the level counts themselves, because that is how many
                  values each digit can take.
                </p>
                <Equation>
                  {"code  =  d₀ + L₀ d₁ + L₀ L₁ d₂ + L₀ L₁ L₂ d₃"}
                </Equation>
                <>
                  <p>
                    The four coordinates have eight, five, five and five possible
                    levels. Their place-value multipliers are one, eight, forty and two
                    hundred. The word cost was assigned digits 5, 3, 2 and 1.
                  </p>
                  <Equation>{"code = 5 × 1 + 3 × 8 + 2 × 40 + 1 × 200\n     = 5 + 24 + 80 + 200\n     = 309"}</Equation>
                  <p>
                    This packs four discrete choices into one integer without losing
                    which level was chosen in each coordinate.
                  </p>
                </>
                <WorkedExample title="The same arithmetic on four chosen numbers">
                  <p>
                  {"Take the input vector [1.0, −0.5, 0.2, 3.0]. After tanh, these coordinates fall in different parts of the bounded interval. Apply the same level counts and offset rule as before."}
                </p>
                  <Equation>
                    {"squashed    0.7616   −0.4621    0.1974    0.9951\n" +
                      "digits           6         1         2         4\n" +
                      "\n" +
                      "code  =  6 × 1 + 1 × 8 + 2 × 40 + 4 × 200  =  894"}
                  </Equation>
                  <p>
                    Its four numbers come back as 5/7, &minus;1/2, 0 and 1, and
                    the squared distance from the squashed input to those is
                    0.0426547.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The composition is arbitrary in the same way that writing the
                  units digit on the right is arbitrary. What matters is that it
                  is one to one, so no two combinations of digits share a code
                  and every code names exactly one combination.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Why the number of codes is a product">
                <p>
                  Because each coordinate chooses independently of the others,
                  every combination of choices is available and the number of
                  codes is the number of combinations. That is the product of the
                  level counts, and it is the arithmetic that gives the published
                  configuration its size.
                </p>
                <Equation>{"8 × 5 × 5 × 5  =  1000"}</Equation>
                <p>
                  {"A thousand grid points can be specified by four level counts, without storing a thousand fitted vectors. Doubling one coordinate’s level count doubles the number of combinations. Storage still depends on how the resulting IDs are encoded, and a downstream model may need parameters for the codes it reads or predicts."}
                </p>
                <Equation>{"Code count = 8 × 5 × 5 × 5 = 1000\nlog₂(1000) ≈ 9.966\nFixed-length ID width = ⌈log₂(1000)⌉ = 10 bits"}</Equation>
                <InAModel>
                  {"Increasing the number of levels does not add fitted parameters to this quantizer. It can still increase ID width and the storage or computation of downstream code embeddings and output layers. Account for those costs separately from the grid specification."}
                </InAModel>
                <KeepInMind>
                  The number of codes is a product of the per-coordinate level
                  counts, which means it grows very quickly with the number of
                  coordinates. Ten coordinates at two levels each is already a
                  thousand and twenty four codes.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Back out again, and what a code stands for">
                <p>
                  Going the other way is the same arithmetic in reverse. Divide
                  the code by the first level count and the remainder is the
                  first digit; divide the quotient by the second and the
                  remainder is the second digit, and so on. Each digit then names
                  its level, and the four levels together are the vector the code
                  stands for.
                </p>
                <WorkedExample title="The code 309 back into its digits">
                  <p>
                    Section 8 composed the word cost&rsquo;s digits 5, 3, 2 and 1
                    into the code 309. Undoing that is four divisions, each by
                    the next level count, keeping the remainder as the digit and
                    carrying the quotient on to the next.
                  </p>
                  <Equation>
                    {"309 ÷ 8  =  38 remainder 5   →   d₀ = 5\n" +
                      " 38 ÷ 5  =   7 remainder 3   →   d₁ = 3\n" +
                      "  7 ÷ 5  =   1 remainder 2   →   d₂ = 2\n" +
                      "  1 ÷ 5  =   0 remainder 1   →   d₃ = 1"}
                  </Equation>
                  <p>
                    The digits name the levels 3/7, 1/2, 0 and &minus;1/2 of
                    section 7, which is the vector the code stands for. The
                    quotient reaching zero on the last division is what being one
                    to one looks like from this side, since a code of 1000 or more
                    would leave a quotient over after the fourth division and
                    name no combination of digits at all.
                  </p>
                </WorkedExample>
                <p>
                  {"Code 0 represents the all-minus-one grid corner; code 999 represents the all-plus-one corner. A sufficiently large positive input can map to the latter. If tanh has rounded every coordinate to 1, its bounded-space rounding error is zero. That does not reconstruct the original large input values."}
                </p>
                <KeepInMind>
                  A code stands for a point of the grid and not for the vector
                  that produced it. Two different vectors that round the same way
                  come back identical, which is what rounding means and is
                  measured as a cost in Part 5.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Rounding each coordinate finds the nearest point of the whole grid">
                <p>
                  There is a claim hidden in all of this that deserves to be made
                  explicit, because without it the method would be doing
                  something different from what a table of representatives does.
                  A table answers with the nearest representative. Rounding each
                  coordinate separately does not obviously answer with the
                  nearest point of the grid, and yet it does.
                </p>
                <WhyThisWorks title="Why choosing the nearest level separately minimizes the total squared distance">
                  <p>
                    The squared distance from a bounded vector to a grid point is
                    a sum over coordinates of the squared gap in that coordinate,
                    and the coordinates of a grid point can be chosen
                    independently of one another. A sum of terms where each term
                    depends on one choice and the choices are unconstrained is
                    made smallest by making each term smallest on its own, so the
                    nearest grid point is the one whose coordinate is nearest in
                    every coordinate separately.
                  </p>
                  <Equation>
                    {"‖b − g‖²  =  Σ (bᵢ − gᵢ)²,   and each gᵢ is free"}
                  </Equation>
                  <p>
                  {"For this product grid, the nearest level can be chosen independently in each coordinate. An arbitrary list of representative vectors does not generally have that separable structure. Explicitly searching all thousand grid points gives the same minimum squared error here, provided ties follow the same convention."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  The grid is a genuine set of a thousand representative vectors
                  and could be written out. It is never written out, because
                  finding the nearest one is four roundings.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            several(
              "Which costs of this SDK’s k-means-codebook workflow are absent from its fixed-grid quantization route?",
              [
                "An iterative run estimating the codebook centers from training vectors",
                "Training vectors whose distribution influences the chosen representatives",
                "Rows that nothing is ever assigned to, however the table was learned",
                "An exhaustive lookup comparing the input with every stored representative",
              ],
              [0, 1, 3],
              "A learned codebook requires a procedure and data for selecting its representative vectors. This quantizer instead fixes a product of per-coordinate levels. Each input still needs bounding, level selection and code packing, but does not search a learned list of whole-vector representatives. Whether either representation uses its available codes well is a separate measurement.",
            ),
            choice(
              "At five levels the levels are −1, −0.5, 0, 0.5 and 1. Why is zero not a level at eight?",
              [
                "Because the squashing never returns exactly zero",
                "Because the levels are symmetric about zero, and an even number of symmetric levels cannot include the center",
                "Because the first level is placed at zero and the rest are counted upward from it",
                "Because the offset of a half is applied before rounding and not undone",
              ],
              1,
              "Five evenly spaced symmetric levels include a middle level at zero. Eight such levels have no single middle entry, so zero lies between two levels. The SDK's tie convention chooses a reconstruction of about 0.1429 and a squared error of about 0.020408. An odd level count can preserve zero exactly in this layout; the choice depends on what that coordinate needs to represent.",
            ),
            choice(
              "The four coordinates have eight, five, five and five levels, and the word cost chose digits 5, 3, 2 and 1. What code does it get?",
              ["11", "309", "875", "1000"],
              1,
              "The SDK packs the first coordinate as the least significant digit. Later coordinates use the products of the earlier level counts as place values.\n\n```math\ncode = 5 × 1 + 3 × 8 + 2 × 40 + 1 × 200\n     = 5 + 24 + 80 + 200\n     = 309\n```\n\nThis convention gives each valid digit tuple one unique code. Another ordering can also work if encoding and decoding use the same convention.",
            ),
            trueFalse(
              "Rounding each coordinate on its own gives the nearest point of the grid.",
              true,
              "For this Cartesian grid, each coordinate can choose its level independently. Squared Euclidean distance adds the coordinate costs, so minimizing each one also minimizes their sum. An arbitrary learned codebook need not contain every combination of coordinate levels; there the independent choices may not identify an available vector. The materialized grid comparison confirms the same choice and distortion for this fixture.",
            ),
            trueFalse(
              "Doubling the first coordinate’s levels from eight to sixteen doubles the number of codes without adding a single fitted parameter.",
              true,
              "The number of possible codes is the product of the level counts, so doubling one count doubles capacity. The (8, 5, 5, 5) configuration has 1,000 codes. Its information-capacity logarithm is about 9.9658 bits, while a separate fixed-width binary ID needs ten bits. The grid parameters are configuration values rather than 1,000 learned representative vectors; a surrounding encoder and decoder can still have learned parameters.",
            ),
        ],
        },
        {
          title: "Part 4. The Rounding Rule, and Where the Obvious One Fails",
          content: (
            <>
              <SubSection title="12. The rule anybody writes first">
                <p>
                  {"The unshifted rule in section 6 works for odd level counts but does not form the intended even-level grid. Inspect the positions it can return before using it to create IDs. A plausible error value alone will not reveal a wrong output alphabet."}
                </p>
                <Equation>
                  {"h  =  (L − 1) / 2\n\nposition  =  round( tanh(z) × h )"}
                </Equation>
                <p>
                  Look at what the half width is. At five levels it is 2, so the
                  bounded interval becomes &minus;2 to 2 and rounding it gives
                  five whole numbers, which is what was asked for. At eight
                  levels it is 3.5, so the interval becomes &minus;3.5 to 3.5,
                  and the whole numbers strictly inside that are &minus;3 up to
                  3. There are seven of them.
                </p>
                <KeepInMind>
                  {"When h is an integer, the closed interval from −h to h contains 2h+1 integer positions. When h is a half-integer, it contains 2h integer positions. The latter gives one fewer position than the even level count asks for, before considering floating-point saturation at the boundaries."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Swept from two levels to twelve">
                <p>
                  {"Compare both rules over 200,001 inputs from −10 to 10, for each level count from two through twelve. Count the distinct rounded positions. The widget places the unshifted rule’s levels above the line and the corrected levels below it."}
                </p>
                <RungLadder />
                <p>
                  The pattern is exact rather than approximate. At every one of
                  the six even level counts the obvious rule reaches one level
                  fewer than was asked for, and at every one of the five odd
                  counts the two rules agree completely. The worst case is the
                  smallest. Asked for two levels, the obvious rule produces
                  one, because the half width is 0.5 and everything in
                  &minus;0.5 to 0.5 rounds to zero, so the coordinate carries no
                  information at all and nothing raises a complaint.
                </p>
                <NumberTable
                  headings={[
                    "levels asked for",
                    "half width",
                    "levels the obvious rule reaches",
                    "levels the corrected rule reaches",
                  ]}
                  rows={[
                    ["2", "0.5", "1", "2"],
                    ["3", "1.0", "3", "3"],
                    ["4", "1.5", "3", "4"],
                    ["5", "2.0", "5", "5"],
                    ["8", "3.5", "7", "8"],
                    ["10", "4.5", "9", "10"],
                    ["12", "5.5", "11", "12"],
                  ]}
                  caption="Seven of the eleven level counts swept. Every even one is short by exactly one."
                />
                <KeepInMind>
                  {"In this nonsaturating sweep, the unshifted rule produces one fewer level for every even count tested. The saturation experiment below shows why that count is not a universal statement about all floating-point inputs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What happens at the very ends, and why it is not a rescue">
                <p>
                  There is a tempting objection. If the bounded value reached
                  exactly 1, then multiplying by a half width of 3.5 would give
                  3.5, and rounding that gives 4, so surely the missing outer
                  levels come back at saturation. They partly do, and it does not
                  help, and measuring it turns up something the objection does
                  not predict.
                </p>
                <>
<p>
                  Including inputs large enough that the squashing returns exactly 1, the obvious rule at eight levels reaches nine distinct levels rather than seven, one more at each end. At twelve it reaches thirteen and at four it reaches five. But at two, six and ten it reaches one, five and nine, which is no more than before.
                </p>
                <p>
                  The reason is the tie rule. A value landing exactly half way between two whole numbers is rounded to the even one, so 3.5 becomes 4 and 2.5 becomes 2, and whether the extra levels appear depends on whether the half width&rsquo;s whole part is odd or even.
                </p>
</>
                <NumberTable
                  headings={[
                    "levels asked for",
                    "half width",
                    "on ordinary inputs",
                    "including inputs that saturate",
                  ]}
                  rows={[
                    ["2", "0.5", "1", "1"],
                    ["4", "1.5", "3", "5"],
                    ["6", "2.5", "5", "5"],
                    ["8", "3.5", "7", "9"],
                    ["10", "4.5", "9", "9"],
                    ["12", "5.5", "11", "13"],
                  ]}
                  caption="The extra pair at the ends appears at four, eight and twelve and not at two, six and ten."
                />
                <p>
                  {"At eight configured levels, saturation adds two outer positions under the unshifted rule. It then produces nine positions overall, outside the intended eight-level alphabet. Reaching additional values at the ends therefore does not fix the mismatch."}
                </p>
                <KeepInMind>

                  The behavior at saturation depends on the tie rule and on
                  whether the half width rounds outward, which is why it turns up
                  at some even level counts and not others. It is not a repair
                  under any of them.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The half offset, which puts the level back">
                <p>
                  The repair is to shift the whole thing by a half before
                  rounding, and to shift it back when a position is read as a
                  level. Subtracting a half moves the interval from &minus;3.5 to
                  3.5 down to &minus;4 to 3, whose whole numbers are &minus;4 up
                  to 3, and there are eight of them.
                </p>
                <Equation>
                  {"offset  =  1/2 when L is even, 0 when L is odd\n" +
                    "\n" +
                    "position  =  round( tanh(z) × h − offset )\n" +
                    "level     =  ( position + offset ) / h"}
                </Equation>
                <p>
                  Adding the offset back on the way out is what keeps the levels
                  where section 5 said they were, symmetric about zero with one
                  at each end. For an odd level count the offset is zero and
                  nothing changes at all, which is why the two rules agree
                  wherever L is odd and why the sweep in section 13 has an exact
                  pattern rather than a noisy one.
                </p>
                <KeepInMind>
                  {"Apply the offset before rounding, then add it back when reconstructing the level. Omitting the second step shifts the reconstruction values away from the symmetric grid."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the fault costs on a whole configuration">
                <p>
                  A missing level per coordinate compounds, because the number of
                  codes is a product. Rounding the six hundred vectors under both
                  rules gives the size of the loss, and the surprise is how much
                  it depends on the configuration rather than on the method.
                </p>
                <NumberTable
                  headings={[
                    "configuration",
                    "codes asked for",
                    "codes the obvious rule reaches",
                    "error, obvious",
                    "error, corrected",
                  ]}
                  rows={[
                    ["2, 2, 2, 2", "16", "1", "2.1428", "0.8200"],
                    ["4, 4, 4, 4", "256", "81", "0.1984", "0.1108"],
                    ["8, 8, 8, 8", "4096", "2401", "0.0322", "0.0232"],
                    ["8, 5, 5, 5", "1000", "875", "0.0587", "0.0565"],
                    ["5, 5, 5, 5", "625", "625", "0.0674", "0.0674"],
                  ]}
                  caption="Six hundred vectors, rounded both ways. The error is the mean squared distance from the bounded vector to its code."
                />
                <>
<p>
                  {"The all-even configurations show a larger difference in this test. With four levels per coordinate, the unshifted rule can reach 81 combinations rather than 256, and its measured error is about 79% higher. With [8,5,5,5], only one coordinate is affected: its reachable count is 875 rather than 1000, with about 4% higher error. These reachability counts describe the rule, not the number of codes actually observed in 600 samples."}
                </p>
                <p>
                  A system built on the obvious rule and tested at eight, five, five and five would look almost right.
                </p>
</>
                <KeepInMind>
                  {"Include all-even settings and the two-level case when checking a rounding implementation. Testing only [8,5,5,5] leaves most coordinates unaffected and may conceal the incorrect grid."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Zero is not a level when the count is even">
                <p>
                  One consequence of the offset is worth stating on its own,
                  since it looks like a bug the first time it is met. Under an
                  even level count zero is not one of the levels, so the zero
                  vector cannot be reproduced. At eight levels the bounded value
                  is 0, multiplying by 3.5 gives 0, subtracting the half gives
                  &minus;0.5, and the tie rule sends that to the even whole
                  number 0 rather than to &minus;1.
                </p>
                <Equation>
                  {"tanh(0) × 3.5 − 0.5  =  −0.5   →   position 0   →   level 1/7"}
                </Equation>
                <p>
                  {"At eight levels, a bounded coordinate of zero ties between the two middle levels. This implementation chooses the positive one under its round-to-even convention. At five levels, zero itself is available and reconstructs exactly."}
                </p>
                <Equation>{"Eight-level reconstruction of zero = 1/7\nSquared error = (1/7 − 0)² = 1/49 ≈ 0.020408\nFive-level reconstruction of zero = 0; squared error = 0"}</Equation>
                <KeepInMind>
                  A method whose levels are symmetric and even in number has no
                  level at the middle. If the middle matters for a particular
                  coordinate, that is an argument for giving it an odd level
                  count rather than for changing the rounding.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What Giving Up the Fit Costs",
          content: (
            <>
              <SubSection title="18. The rounding error, and how it falls as the codes multiply">
                <p>
                  The cost of saying a vector in codes is how far it had to move
                  to be said, and the natural summary is the mean over the
                  collection of the squared distance from where a vector was to
                  the code it became. Measured in the bounded interval, since
                  that is where the grid lives, on six hundred four-coordinate
                  vectors, that number falls as the codes multiply.
                </p>
                <CostAgainstCodes />
                <p>
                  The red line is the fixed grid. Sixteen codes cost 0.8200,
                  eighty-one cost 0.2312, and a hundred and sixty cost 0.2828.
                  That last pair is not a mistake and is the subject of section
                  20.
                </p>
                <KeepInMind>
                  {"Here we measure the gap from tanh’s output to its chosen grid point. This isolates the rounding step. It does not measure how well the original unsquashed vector can be recovered; assessing the whole representation requires checking that loss too."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Against a table fitted to the same vectors">
                <p>
                  {"Compare the grid with a codebook fitted to the same 600 bounded vectors. At each listed code count, both methods encode the same inputs and use the same squared-error measure. The fitted table is evaluated on its own training sample, so this comparison measures in-sample reconstruction rather than transfer to new inputs."}
                </p>
                <NumberTable
                  headings={[
                    "codes",
                    "configuration",
                    "grid",
                    "fitted table",
                    "times worse",
                  ]}
                  rows={[
                    ["16", "2, 2, 2, 2", "0.8200", "0.3719", "2.21"],
                    ["24", "3, 2, 2, 2", "0.6782", "0.2864", "2.37"],
                    ["36", "3, 3, 2, 2", "0.5509", "0.2173", "2.53"],
                    ["54", "3, 3, 3, 2", "0.3918", "0.1610", "2.43"],
                    ["64", "4, 4, 2, 2", "0.4828", "0.1368", "3.53"],
                    ["81", "3, 3, 3, 3", "0.2312", "0.1136", "2.04"],
                    ["160", "5, 4, 4, 2", "0.2828", "0.0570", "4.96"],
                  ]}
                  caption="Six hundred vectors, rounded to a fixed grid and to a fitted table of the same size."
                />
                <p>
                  On the comparisons shown, the fitted codebook&apos;s reconstruction error is lower by factors from 2.04 to 4.96. The fixed grid avoids fitting a codebook, but pays for that simplicity in reconstruction error here. In an end-to-end learned system, we would also need to examine how the encoder adapts to the quantizer before extending this result.
                </p>
                <KeepInMind>
                  {"The fitted table has lower in-sample error in these comparisons. The fixed grid avoids that fitting step. This is evidence about the supplied vectors; a learned encoder may adapt its outputs to the grid and change the comparison."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. How the codes are spent matters as much as how many there are">
                <p>

                  The line in section 18 is not monotone, and the reason is a
                  real property of the method rather than an artifact of the
                  collection. Sixty-four codes spent as four, four, two, two cost
                  0.4828, while fifty-four codes spent as three, three, three,
                  two cost 0.3918. Fewer codes, better spent, is the lower error.
                </p>
                <NumberTable
                  headings={["configuration", "codes", "rounding error"]}
                  rows={[
                    ["8, 2, 2, 2", "64", "0.6228"],
                    ["2, 2, 2, 8", "64", "0.6145"],
                    ["4, 4, 2, 2", "64", "0.4828"],
                    ["3, 3, 3, 2", "54", "0.3918"],
                  ]}
                  caption="Four ways to spend a budget, on the same six hundred vectors."
                />
                <p>
                  {"The equal-size configurations have different errors because they allocate resolution to different coordinates. The more balanced setting performs best among these examples. The appropriate allocation also depends on each coordinate’s scale and how its error affects the task."}
                </p>
                <KeepInMind>
                  {"Choose level counts using the representation and the task. The published [8,5,5,5] is one tested setting, not proof that the first coordinate inherently contains more useful information."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. How evenly the codes are used">
                <p>
                  A code that nothing ever lands on is wasted capacity, and it is
                  the failure the fixed grid is often assumed to have removed. It
                  has not been removed, and measuring it is the point of this
                  section. Six hundred vectors rounded on a grid of a thousand
                  codes reach 420 of them, so 580 codes name a point of the box
                  that nothing in the collection went near.
                </p>
                <GridUsage />
                <>
<p>
                  {"Among the 420 used codes, 293 receive one vector, 88 receive two, 28 receive three, nine receive four, and the last two receive five and six. Having more codes than vectors guarantees some unused codes. It does not make this the most even possible occupancy: 600 distinct assignments would be more even."}
                </p>
                <p>
                  The fitted table of the same size is not available for comparison at a thousand codes, but at every size where it is, from sixteen up to a hundred and sixty, it uses every single one of its codes while the grid uses 152 of 160 and 80 of 81.
                </p>
</>
                <p>
                  The seventy-two word vectors are the harder case, and switching
                  the widget to them shows why. They reach 19 codes of the
                  thousand, leaving 981 empty. Part of that is the corpus, since
                  the seventy-two words have only thirty-five distinct vectors
                  between them, but rounding then takes those thirty-five down to
                  nineteen, so lower and estimate, which arrived as different
                  vectors, come back identical.
                </p>
                <KeepInMind>
                  {"The fixed grid’s points do not move toward the observed vectors. A surrounding encoder can still learn to send inputs to different points. Unused codes in this sample therefore do not imply that no training could change their usage."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "Multiply by the half width and round is right for an odd level count. What does it do at an even one?",
              [
                "It delivers one level fewer than was asked for, at every even level count",
                "It delivers one level more than was asked for",
                "It delivers the right number of levels but shifts them all off center",
                "It raises a complaint, because the half width is not a whole number",
              ],
              0,
              "For these strictly nonsaturated inputs, the naive scale-and-round rule reaches every odd-count level but one fewer position at each even count. In the two-level case it returns only zero. Exact floating-point saturation can change endpoint behavior, which the next question tests; it is not a reliable repair.",
            ),
            trueFalse(
              "Letting the squashing reach exactly 1 brings the missing outer levels back.",
              false,
              "Finite-precision tanh can round extreme inputs to exactly an endpoint. For the naive rule, that makes eight configured levels produce nine distinct values instead of seven. At two, six and ten levels, ties-to-even rounding still leaves only one, five and nine values in this experiment. Neither outcome gives the intended level set reliably. Saturation is therefore not a repair for the even-level formula.",
            ),
            choice(
              "At which configuration would a system built on the obvious rounding rule look almost right?",
              [
                "Two levels across all four coordinates",
                "Four levels across all four coordinates",
                "Eight levels for the first coordinate and five for each of the others",
                "Any of them, since the error rises by the same amount everywhere",
              ],
              2,
              "Only the first coordinate in (8, 5, 5, 5) has an even count. The naive rule reaches 875 rather than 1,000 codes and gives about four percent higher error in this comparison. That small change does not make the implementation correct. With four levels on every coordinate, it reaches 81 of 256 codes and gives 79 percent higher error. With two per coordinate, all inputs receive the same code.",
            ),
            several(
              "Which statements agree with these measured quantization comparisons?",
              [
                              "The fitted table is better everywhere, by between 2.04 and 4.96 times",
                              "Giving eight levels to one coordinate and two to each of the other three is the worst of the three ways of spending sixty-four codes, at 0.6228",
                              "Sixty-four codes spent as four, four, two, two cost 0.4828, while fifty-four codes spent as three, three, three, two cost 0.3918",
                              "From sixteen codes up to a hundred and sixty the fitted table uses every one of its codes, while the grid uses 152 of 160 and 80 of 81",
                            ],
              [0, 1, 2, 3],
              "The learned codebooks were fitted and evaluated on the same supplied vectors, so their errors are in-sample measurements. The fixed grids also differ in how they allocate levels across coordinates. Increasing total capacity need not create a nested set of grid points: the reported errors at 16,81 and 160 codes are 0.8200,0.2312 and 0.2828. Three different 64-code configurations differ by 29 percent in error. Capacity alone does not specify the geometry.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "codes | configuration | grid | fitted table | times worse\n16 | 2, 2, 2, 2 | 0.8200 | 0.3719 | 2.21\n24 | 3, 2, 2, 2 | 0.6782 | 0.2864 | 2.37\n36 | 3, 3, 2, 2 | 0.5509 | 0.2173 | 2.53\n54 | 3, 3, 3, 2 | 0.3918 | 0.1610 | 2.43\n64 | 4, 4, 2, 2 | 0.4828 | 0.1368 | 3.53\n81 | 3, 3, 3, 3 | 0.2312 | 0.1136 | 2.04\n160 | 5, 4, 4, 2 | 0.2828 | 0.0570 | 4.96\n\nconfiguration | codes | rounding error\n8, 2, 2, 2 | 64 | 0.6228\n2, 2, 2, 8 | 64 | 0.6145\n4, 4, 2, 2 | 64 | 0.4828\n3, 3, 3, 2 | 54 | 0.3918\n\nFor each fitted table from 16 through 160 codes, every code is used.\nGrid usage: 80 of 81 codes; 152 of 160 codes.\nThe fitted tables were trained and scored on these same 600 vectors."
              },
            ),
            trueFalse(
              "Of the 981 codes the seventy-two word vectors leave empty, only sixteen are the rounding’s doing.",
              true,
              "There are only 35 distinct input vectors, so even a perfect identity-preserving assignment could use at most 35 of the 1,000 codes.\n\n```math\nminimum empty codes from the input count = 1,000 − 35 = 965\nadditional merges during quantization    = 35 − 19 = 16\n```\n\nThe observed 19 used codes reflect both the limited input variety and the further merging caused by quantization. Lower and estimate illustrate distinct vectors receiving one code.",
            ),
        ],
        },
        {
          title: "Part 6. What a Finite Coordinate Grid Cannot Preserve" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="22. The levels are evenly spaced in the squashed interval and nowhere else">
                <p>
                  Section 5 placed the levels evenly between &minus;1 and 1, and
                  the squashing that maps a coordinate into that interval is not
                  linear. So levels that are evenly spaced after squashing are
                  not evenly spaced before it, and they are far more crowded near
                  zero than near the ends. Nothing about where they fall in the
                  original units is chosen, or even looked at.
                </p>
                <p>
                  The consequence is that the scale of the incoming coordinates
                  decides everything, and the method has no opinion about that
                  scale. Multiplying the six hundred vectors by a factor before
                  squashing them, at a fixed configuration of a thousand codes,
                  moves both how many codes are reached and what the rounding
                  costs, and the two do not move together.
                </p>
                <NumberTable
                  headings={[
                    "multiplied by",
                    "rounding error",
                    "codes reached",
                    "coordinates past 0.99 after squashing",
                  ]}
                  rows={[
                    ["0.1", "0.0564", "30", "0.0000"],
                    ["0.25", "0.0674", "144", "0.0000"],
                    ["0.5", "0.0710", "392", "0.0004"],
                    ["1", "0.0565", "420", "0.0737"],
                    ["2", "0.0334", "284", "0.3833"],
                    ["4", "0.0177", "176", "0.6467"],
                    ["8", "0.0095", "117", "0.8121"],
                  ]}
                  caption="The same vectors and the same thousand codes, at seven scales."
                />
                <>
<p>
                  {"At one-tenth scale and full scale, the bounded-space errors are both near 0.056, but the inputs reach 30 and 420 codes respectively. At eight-times scale, about 81% of coordinates lie beyond magnitude 0.99 after tanh. The rounding error is smaller partly because many values sit near the end levels, while differences in their original magnitudes have been compressed."}
                </p>
                <p>
                  A low rounding error is therefore not by itself evidence that the arrangement is working, and the number of codes reached has to be read beside it.
                </p>
</>
                <KeepInMind>
                  {"Input scaling changes both grid usage and the information lost during bounding. A learned encoder can adjust that scale, but the adjustment must be evaluated against reconstruction or the downstream task rather than bounded-space error alone."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The number of codes is fixed before the data is seen">
                <p>
                  A configuration of level counts fixes the number of codes
                  exactly, and no property of a collection can change it. Six
                  hundred vectors on a grid of a thousand codes can reach at most
                  six hundred of them, so at least four hundred are empty before
                  anything is measured, and seventy-two word vectors on the same
                  grid leave at least nine hundred and twenty-eight empty by
                  simple counting.
                </p>
                <p>

                  We have fixed the number of levels rather than learned representatives from the data. That still leaves a modeling choice: how many levels should each coordinate receive? We can compare candidate settings on suitable development data. Avoiding codebook fitting does not remove the need to select and evaluate that choice.
                </p>
                <KeepInMind>
                  {"A fixed grid still needs configuration and evaluation. Choose the levels on suitable development data, then check the resulting representation on inputs that were not used to choose them."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The coordinates are treated one at a time">
                <p>
                  {"The grid contains every combination of its per-coordinate levels. It cannot move those points to follow a diagonal concentration in the supplied coordinates. It can still encode vectors in that region; the cost is that many other combinations may go unused."}
                </p>
                <>
<p>
                  {"Compare the sample whose first two coordinates have correlation 0.9486 with the version without that dependence. At 64 codes, their grid errors are 0.4583 and 0.4574. The small difference here does not mean a scalar quantizer is incapable of retaining dependence."}
                </p>
                <p>
                  What changes is how much of the grid is reachable, since the vectors now occupy a diagonal band and the corners off that band are visited by nothing. Forty-six of the sixty-four codes are used against all sixty-four before.
                </p>
</>
                <NumberTable
                  headings={[
                    "collection",
                    "grid error",
                    "grid codes used",
                    "fitted table error",
                  ]}
                  rows={[
                    ["first two coordinates leaning together", "0.4583", "46 of 64", "0.0834"],
                    ["the same draw without the lean", "0.4574", "64 of 64", "0.1327"],
                  ]}
                  caption="The fitted table can place representatives in the diagonal region. The fixed grid keeps its locations, although the used IDs can still reveal the dependence."
                />
                <p>
                  {"The fitted table’s error is lower on the correlated sample, where the vectors concentrate in a narrower region. Its improvement over the grid is larger in that comparison. These results show the benefit of adapting representative locations to these inputs; they do not establish that the fixed-grid representation contains no information about their dependence."}
                </p>
                <KeepInMind>
                  {"A product grid includes combinations absent from the data. It does not relocate points to avoid those regions. An upstream transformation or learned encoder can change the coordinates before quantization."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Every case gathered">
                <p>
                  Some inputs leave the method undefined rather than merely
                  inaccurate, and some leave it defined with a choice attached
                  that somebody has to make. The table separates the two, since
                  the second kind is where an implementation has to decide
                  something and the decision shows up in the answers.
                </p>
                <DerivationTable
                  expressionHeading="Coordinate or level choice"
                  reasonHeading="What the quantizer can represent"
                  rows={[{"expression":"one level for a coordinate","reason":"The reconstruction formula used here divides by a zero half width, so this implementation requires at least two levels. Another quantizer could define a constant one-level representative explicitly."},{"expression":"no coordinates at all","reason":"Mathematically, an empty product gives one code for the empty vector. This SDK requires a nonempty configuration and rejects that case."},{"expression":"a coordinate that never varies","reason":"defined, and wasteful in a way nothing reports. The levels are placed by the rule and not by the data, so every vector takes the same level there and that coordinate's whole level count is spent on a distinction that never arises. A learned table would never place two representatives apart along such a coordinate."},{"expression":"a coordinate that is not a finite number","reason":"This interface rejects nonfinite inputs. NaN does not define a real-valued position to round. Infinite values have tanh limits at the endpoints, but they are still outside this input contract."},{"expression":"an input past the point where the squashing flattens","reason":"defined and irreversible. Beyond about 19 in ordinary computer arithmetic the squashed value is exactly 1, so 19 and a million give the same code, and the method cannot distinguish inputs that a model may well be distinguishing."},{"expression":"a value exactly half way between two levels","reason":"Two nearest levels have equal squared error. This implementation rounds halfway integer positions to even. State the convention for reproducibility; exact ties such as zero can occur frequently in structured inputs."},{"expression":"an even level count","reason":"The symmetric grid here requires the offset for even counts. Other valid scalar-quantizer conventions are possible, including the different bounding and normalization used in the original FSQ implementation."},{"expression":"more codes than vectors","reason":"defined, and guaranteed to leave codes empty by counting alone. Six hundred vectors cannot reach more than six hundred of a thousand codes, and reached 420. Nothing is wrong; the number of codes is not a claim about how many are used."},{"expression":"two vectors that round to the same code","reason":"defined, and the entire point. The code names a point of the grid, not the vector that produced it, so composing and decomposing a code is one to one while quantizing is not. What is lost is exactly the rounding error the cost is measured by."},{"expression":"a dependence between two coordinates","reason":"The grid does not adapt its locations to a diagonal concentration, so some combinations may remain unused. The observed ID frequencies and reconstructed vectors can nevertheless retain dependence between coordinates."},{"expression":"the scale of the incoming coordinates","reason":"defined at every scale and different at each of them, with nothing in the method choosing. Multiplying a collection by eight lowered the rounding error sixfold and cut the codes reached from 420 to 117, so the two readings that matter move in opposite directions and neither one alone says whether the arrangement is working."}]}
                />
                <KeepInMind>
                  {"Validate the input contract before quantizing, then evaluate how much information the chosen grid preserves. A request can be accepted and still give an unsuitable representation for the task."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 6",
          quiz: [
            choice(
              "At a tenth of the scale the error is 0.0564 and at full scale it is 0.0565. What does that show?",
              [
                "That the method is insensitive to the scale of the coordinates arriving at it",
                "That a low rounding error is not by itself evidence the arrangement is working, since one reaches thirty codes and the other four hundred and twenty",
                "That the error is the right quantity to tune the scale against",
                "That both scales are too small for the squashing to matter",
              ],
              1,
              "These errors are measured after tanh, so they compare reconstructed and bounded coordinates rather than the original magnitudes. At scale eight, about 81 percent of coordinates exceed absolute value 0.99 and 117 codes are used. Many different magnitudes are compressed near the same endpoints. A small bounded-space error can therefore accompany lost magnitude distinctions; read saturation and code use beside distortion.",
            ),
            trueFalse(
              "Removing the fit removes the need to know something about the data.",
              false,
              "The quantizer can have fixed levels without fitting individual representatives. Its usefulness still depends on the input distribution, coordinate scaling and chosen capacity. Those settings can be selected from a budget or compared on development data. Removing learned codebook entries does not remove the need to evaluate the resulting representation.",
            ),
            choice(
              "Six hundred vectors whose first two coordinates rise together at a correlation of 0.9486 are set beside the same draw with the lean taken out. What did the grid do?",
              [
                "Its error fell on the leaning collection, since a concentrated collection is easier to cover",
                "Its errors are nearly equal, 0.4583 and 0.4574, while the correlated inputs use fewer grid codes",
                "It reached more of its codes on the leaning collection",
                "It refused the leaning collection, since a product of per-coordinate choices cannot describe a band",
              ],
              1,
              "With the correlated inputs, the grid uses 46 of 64 codes instead of all 64. Its fixed coordinate levels do not adapt to the narrower occupied region. The fitted codebook does adapt to these training vectors, and its recorded error falls from 0.1327 to 0.0834. An upstream transformation could change the grid's input geometry, but that is outside this unchanged-grid comparison.",
            ),
            choice(
              "Which two of the listed configurations are rejected, rather than merely returning a poor representation?",
              [
                "Two, a level count of one and a coordinate that is not a number",
                "None, because a product grid always has an answer",
                "Every case where a configuration wastes most of its codes",
                "Every case where the squashing saturates",
              ],
              0,
              "Everything else is defined, which is the difficulty. A configuration that wastes most of its codes, or that cannot see the shape of its own data, still answers every question it is asked, and the answer looks like any other.",
            ),
        ],
        },
        {
          title: "Practice. Rounding the Word Cost With the Library",
          practice: [
            exercise(
              "Take the word cost through the grid",
              [
  "Build the supplied four-dimensional word vectors from the term-document table and apply the starter’s scaling. Quantize cost with level counts (8,5,5,5).",
  "Print its original and tanh-squashed coordinates, digits, packed code, reconstructed grid point and squared distance from the squashed input. The reconstruction is in squashed coordinates, not the original embedding scale."
],
              `import numpy as np
from oop_ml import FiniteScalarQuantizer, LatentSemanticAnalysis

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]

embeddings = LatentSemanticAnalysis(dimension=4).fit(sentences).embeddings
table = np.asarray(embeddings.table) / 4.0
cost = table[list(embeddings.vocabulary).index("cost")]
# Build the quantizer with levels (8, 5, 5, 5), quantise cost as a block of
# one row, and print its four numbers and their squashed values to four
# places, its digits, its code, its reconstruction and its squared
# distance to six places.`,
              `import numpy as np
from oop_ml import FiniteScalarQuantizer, LatentSemanticAnalysis

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]

embeddings = LatentSemanticAnalysis(dimension=4).fit(sentences).embeddings
table = np.asarray(embeddings.table) / 4.0
cost = table[list(embeddings.vocabulary).index("cost")]
quantizer = FiniteScalarQuantizer(levels=(8, 5, 5, 5))
assignment = quantizer.quantize([cost])
code = assignment.ids[0]

print(f"cost {np.round(cost, 4).tolist()}")
print(f"squashed {np.round(np.tanh(cost), 4).tolist()}")
print(f"digits {quantizer.digits_of(code)}")
print(f"code {code} of {quantizer.n_codes}")
print(f"stands for {np.round(assignment.reconstruction[0], 4).tolist()}")
print(f"squared distance moved {assignment.distortion:.6f}")`,
              `cost [0.5904, 0.5241, -0.1293, -0.3151]
squashed [0.5302, 0.4809, -0.1285, -0.3051]
digits (5, 3, 2, 1)
code 309 of 1000
stands for [0.4286, 0.5, 0.0, -0.5]
squared distance moved 0.065215`,
              { hints: [
  "Quantize accepts an observation-by-coordinate block even for one word.",
  "Use ids and digits_of for code structure; compare reconstruction with tanh(input) when measuring the stated distortion."
], check: numberCheck("Which packed code does cost receive with level counts (8, 5, 5, 5)?", 309, 0.5, "The packed code is 309. Its digits identify one grid coordinate per dimension; the single integer is an address for their combination."), question: "How does a four-coordinate word vector become one grid code?" },
            ),
            exercise(
              "Count what each rounding rule reaches",
              [
  "Sweep the supplied two hundred thousand inputs for each level count from two through twelve. Compare distinct library codes with distinct positions from the starter’s naive squash/scale/round rule.",
  "Print both reachable counts for every setting. Then quantize exactly zero at eight and five levels, reporting reconstruction and squared distortion."
],
              `import numpy as np
from oop_ml import FiniteScalarQuantizer

inputs = np.linspace(-10.0, 10.0, 200_001)
squashed = np.tanh(inputs)

for n_levels in range(2, 13):
    # Count the distinct codes the quantizer reaches on the inputs, and the
    # distinct values of round(squashed * half width) where the half width
    # is (n_levels - 1) / 2, and print both beside the level count.
    pass

# Quantise the single coordinate 0.0 at eight levels and at five, and print
# what it comes back as and its squared distance to six places.`,
              `import numpy as np
from oop_ml import FiniteScalarQuantizer

inputs = np.linspace(-10.0, 10.0, 200_001)
squashed = np.tanh(inputs)

for n_levels in range(2, 13):
    quantizer = FiniteScalarQuantizer(levels=(n_levels,))
    reached = len(set(quantizer.quantize(inputs.reshape(-1, 1)).ids))
    half_width = (n_levels - 1) / 2
    obvious = len(np.unique(np.rint(squashed * half_width)))
    print(f"{n_levels:2d} levels: library reaches {reached:2d}, obvious rule reaches {obvious:2d}")

for n_levels in (8, 5):
    zero = FiniteScalarQuantizer(levels=(n_levels,)).quantize([[0.0]])
    print(f"zero at {n_levels} levels comes back as {zero.reconstruction[0][0]:.4f}, squared distance {zero.distortion:.6f}")`,
              ` 2 levels: library reaches  2, obvious rule reaches  1
 3 levels: library reaches  3, obvious rule reaches  3
 4 levels: library reaches  4, obvious rule reaches  3
 5 levels: library reaches  5, obvious rule reaches  5
 6 levels: library reaches  6, obvious rule reaches  5
 7 levels: library reaches  7, obvious rule reaches  7
 8 levels: library reaches  8, obvious rule reaches  7
 9 levels: library reaches  9, obvious rule reaches  9
10 levels: library reaches 10, obvious rule reaches  9
11 levels: library reaches 11, obvious rule reaches 11
12 levels: library reaches 12, obvious rule reaches 11
zero at 8 levels comes back as 0.1429, squared distance 0.020408
zero at 5 levels comes back as 0.0000, squared distance 0.000000`,
              { hints: [
  "A one-coordinate quantizer needs a one-element levels tuple and a two-dimensional input column.",
  "Count distinct IDs separately from distinct naive rounded values; inspect the even-level half-way case."
], check: numberCheck("How many distinct positions does the starter's naive rule reach when twelve levels are requested?", 11, 0.5, "The naive rule reaches eleven positions at twelve requested levels. Its even-level rounding convention fails to use the complete intended grid."), question: "Can a naive rounding rule reach every promised level?" },
            ),
            exercise(
              "The same six hundred vectors at three scales",
              [
  "Use the same seeded six hundred four-coordinate vectors at scale factors 0.1, 1 and 8 with one unchanged thousand-code grid.",
  "For each print distortion in tanh-squashed coordinates, distinct codes reached and fraction of squashed coordinates whose absolute value exceeds 0.99."
],
              `import numpy as np
from oop_ml import FiniteScalarQuantizer

vectors = np.random.default_rng(7).normal(0.0, 1.5, size=(600, 4))
quantizer = FiniteScalarQuantizer(levels=(8, 5, 5, 5))

for factor in (0.1, 1.0, 8.0):
    # Quantise the vectors multiplied by the factor, then print the rounding
    # error to four places, how many distinct codes were reached, and the
    # share of squashed coordinates whose size exceeds 0.99, to four places.
    pass`,
              `import numpy as np
from oop_ml import FiniteScalarQuantizer

vectors = np.random.default_rng(7).normal(0.0, 1.5, size=(600, 4))
quantizer = FiniteScalarQuantizer(levels=(8, 5, 5, 5))

for factor in (0.1, 1.0, 8.0):
    scaled = vectors * factor
    assignment = quantizer.quantize(scaled)
    past_the_edge = np.mean(np.abs(np.tanh(scaled)) > 0.99)
    print(f"multiplied by {factor}: error {assignment.distortion:.4f}, "
          f"codes reached {len(set(assignment.ids))} of {quantizer.n_codes}, "
          f"past 0.99 {past_the_edge:.4f}")`,
              `multiplied by 0.1: error 0.0564, codes reached 30 of 1000, past 0.99 0.0000
multiplied by 1.0: error 0.0565, codes reached 420 of 1000, past 0.99 0.0737
multiplied by 8.0: error 0.0095, codes reached 117 of 1000, past 0.99 0.8121`,
              { hints: [
  "Scale the original input block, not the grid.",
  "A large input can saturate tanh near an endpoint. Compare code coverage and saturation with distortion before judging the result."
], check: numberCheck("How many of the thousand codes are reached at eight times the scale?", 117, 0.5, "The enlarged inputs reach 117 codes. Many squashed coordinates saturate near grid extremes, so lower squashed-space distortion can coexist with reduced code coverage."), question: "Does a lower grid distortion necessarily mean that more codes are useful?" },
            ),
            exercise(
              "The seventy-two words on the thousand-code grid",
              [
  "Quantize all seventy-two supplied word vectors on the same thousand-code grid. Print word count, distinct vector count, codes reached, empty codes and largest number of words sharing one code.",
  "Finish with the codes assigned to lower and the punctuated estimate entry from the vocabulary. Preserve the exact spelling estimate. when looking it up."
],
              `from collections import Counter

import numpy as np
from oop_ml import FiniteScalarQuantizer, LatentSemanticAnalysis

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]

embeddings = LatentSemanticAnalysis(dimension=4).fit(sentences).embeddings
table = np.asarray(embeddings.table) / 4.0
words = list(embeddings.vocabulary)
# Quantise the whole table at levels (8, 5, 5, 5). Print the number of
# words, the number of distinct rows in the table, the codes reached, the
# codes left empty, the largest number of words on one code, and the codes
# of lower and of estimate.`,
              `from collections import Counter

import numpy as np
from oop_ml import FiniteScalarQuantizer, LatentSemanticAnalysis

sentences = [
    "The report was expected on Monday.",
    "The costs were lower than the first estimate.",
    "We reviewed the results and rewrote the summary.",
    "Dr. Bell asked for the analysis of the samples.",
    "A second analysis agreed with the first analysis.",
    "The low readings weren't expected.",
    "The team rechecked the costing and the totals.",
    "Every report carries the date and the analyst's name.",
    "The revised estimate was lower again.",
    "Nobody expected the samples to arrive early.",
    "The cost of the analysis was the reason.",
    "The analysts reran the tests on Tuesday.",
    "The lowest cost was the reason the report was late.",
    "The reviewers expected a lower estimate.",
    "The high-cost option was dropped.",
    "The size of the August batch was fixed.",
    "Dr. Bell rewrote the costing and the report.",
    "The analysis was expected to cost less.",
]

embeddings = LatentSemanticAnalysis(dimension=4).fit(sentences).embeddings
table = np.asarray(embeddings.table) / 4.0
words = list(embeddings.vocabulary)
quantizer = FiniteScalarQuantizer(levels=(8, 5, 5, 5))
assignment = quantizer.quantize(table)
usage = Counter(assignment.ids)

print(f"words {len(words)}")
print(f"distinct vectors {len(set(tuple(row) for row in np.round(table, 12)))}")
print(f"codes reached {len(usage)} of {quantizer.n_codes}")
print(f"codes left empty {quantizer.n_codes - len(usage)}")
print(f"words on the busiest code {usage.most_common(1)[0][1]}")
print(f"lower is code {assignment.ids[words.index('lower')]}")
print(f"estimate is code {assignment.ids[words.index('estimate.')]}")`,
              `words 72
distinct vectors 35
codes reached 19 of 1000
codes left empty 981
words on the busiest code 28
lower is code 748
estimate is code 748`,
              { hints: [
  "Result IDs retain vocabulary-row order. A Counter measures occupancy without losing duplicate words.",
  "Use the exact vocabulary spelling rather than removing its punctuation."
], check: numberCheck("How many words share the busiest code?", 28, 0.5, "Twenty-eight words share the busiest code. A nominal thousand-code grid does not imply that a particular input table uses its capacity evenly."), question: "How much of the nominal grid does this word table actually use?" },
            ),
          ],
        },
      ]}
    />
  );
}
