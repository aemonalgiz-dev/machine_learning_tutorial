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
import { CostAgainstCodes } from "@/components/widgets/CostAgainstCodes";
import { GridUsage } from "@/components/widgets/GridUsage";
import { QuantiserPlayground } from "@/components/widgets/QuantiserPlayground";
import { RungLadder } from "@/components/widgets/RungLadder";

export const metadata: Metadata = {
  title: "Finite Scalar Quantisation · oop_ml",
  description:
    "Squash each coordinate on its own and round it to one of a few levels, so the set of codes is a product of the per-coordinate choices and nothing has to be fitted at all.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FiniteScalarQuantisationPage() {
  return (
    <ConceptPage
      title="Finite Scalar Quantisation"
      tagline="Squash each coordinate on its own and round it to one of a few levels, so the set of codes is a product of the per-coordinate choices and nothing has to be fitted at all."
      prerequisites={
        <>
          Two pages sit under this one. The page on{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            giving a word a vector
          </Link>{" "}
          is where the four numbers this page rounds come from, since a word has
          to become a handful of coordinates before anybody can round them, and
          the seventy-two word vectors used throughout here are read off the same
          eighteen English sentences that page and the others in this section
          work on. The page on{" "}
          <Link href="/concepts/k-means" className={link}>
            grouping rows around centres
          </Link>{" "}
          is the fitted table this one is measured against, since a set of
          representative vectors found by grouping is exactly the thing finite
          scalar quantisation does without. If you want the wider question of
          what it means for a model to read whole numbers rather than text, the
          page on{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          asks it.
        </>
      }
      history={
        <>
          <p>
            The problem is older than any of the models it is now used in. Stuart
            Lloyd, at Bell Laboratories in 1957, was asked how to choose the
            levels of a pulse code modulation system, which is to say how to pick
            a small set of numbers so that replacing a measurement by the nearest
            of them loses as little as possible. He wrote the answer as an
            internal report, &ldquo;Least Squares Quantization in PCM&rdquo;,
            gave the alternating procedure that is now the ordinary way of
            grouping rows around centres, and the report was not published in a
            journal until 1982. Joel Max reached the same conditions
            independently in 1960. Robert Gray&rsquo;s 1984 survey
            &ldquo;Vector Quantization&rdquo; is where the version that rounds a
            whole vector at once, rather than each of its numbers separately, was
            laid out for a general audience, and it is that version that carried
            the field for the next thirty years.
          </p>
          <p>
            It arrived inside neural models in 2017. A&auml;ron van den Oord,
            Oriol Vinyals and Koray Kavukcuoglu, at DeepMind, wanted a model
            whose internal description of a picture was a grid of whole numbers
            rather than a grid of real vectors, so that a second model could be
            trained over those numbers the way a language model is trained over
            words. Their &ldquo;Neural Discrete Representation Learning&rdquo;
            put a table of code vectors inside the network and snapped the
            encoder&rsquo;s output at each position to the nearest of them. The
            table has to be learned along with everything else, and that is where
            the trouble started, because a code only moves when something is
            assigned to it, the encoder has to be held near the codes it is being
            snapped to, and the snapping itself has no derivative, so the
            gradient has to be passed around it. Patrick Esser, Robin Rombach and
            Bj&ouml;rn Ommer&rsquo;s VQGAN in 2021 made the arrangement famous
            and inherited every one of those difficulties.
          </p>
          <p>
            Fabian Mentzer, David Minnen, Eirikur Agustsson and Michael
            Tschannen, at Google Research in 2023, asked what would happen if the
            table were not learned at all. Their paper is called &ldquo;Finite
            Scalar Quantization: VQ-VAE Made Simple&rdquo;, and the proposal is
            the whole of it. Bound each coordinate of the encoder&rsquo;s output
            to a fixed interval, round it to one of a small number of evenly
            spaced levels, and take the set of codes to be every combination of
            those per-coordinate choices. Nothing is fitted, so there is no table
            to collapse and nothing to hold the encoder near. The configuration
            they report most often is four coordinates rounded to eight, five,
            five and five levels, which is a thousand codes, and Part 3 here is
            about why that multiplication is the right arithmetic.
          </p>
          <p>
            The page answers six questions in order. What does a learned table of
            representative vectors actually cost, and which of those costs made
            somebody want to be rid of it? What is the method, exactly, and what
            is fixed rather than fitted? How does a handful of per-coordinate
            choices become one whole number, and how many such numbers are there?
            What is the rounding rule, and why does the version anybody writes
            first lose a level whenever the level count is even? What does giving
            up the fit cost, measured against a table of the same size fitted to
            the same vectors? And where does the method stop being defined?
          </p>
        </>
      }
      playground={<QuantiserPlayground />}
      sections={[
        {
          title: "Part 1. The Table Somebody Had to Learn",
          defaultOpen: true,
          content: (
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
                <p>
                  Four real numbers are exactly what a model that reads
                  continuous vectors wants and exactly what a model that reads
                  whole numbers cannot use. If we want the second kind of model,
                  which is the kind that predicts the next unit of a sequence the
                  way a language model predicts the next word, then cost has to
                  become one number out of a fixed and finite set. That is the
                  question this page answers, and it is the same question a
                  tokenizer answers for a piece of text, asked of something that
                  was never text in the first place.
                </p>
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
                  The established answer, and a very good one, is to keep a table
                  of representative vectors and to answer with whichever of them
                  is nearest. Six hundred four-coordinate vectors drawn about the
                  origin, rounded to a table of sixty-four representatives found
                  by grouping those same vectors around centres, sit an average
                  squared distance of 0.1368 from the representative they were
                  given. That is a good answer and it is what this page is
                  measured against throughout.
                </p>
                <p>
                  It costs three things. It costs a fit, which is an iterative
                  search that has to be run before a single vector can be
                  rounded. It costs a collection to fit on, which has to look
                  like the vectors that will arrive later. And when the table is
                  learned by gradient inside a model rather than by grouping, it
                  can end up with rows that nothing is ever assigned to, because
                  a row only moves when something is assigned to it, so a row
                  that begins far from the data stays there and takes no part.
                </p>
                <p>
                  The third of those is worth stating carefully, because it is
                  the complaint the method on this page is usually introduced
                  against and it is the one that is easiest to overstate. Fitted
                  by grouping, on the six hundred vectors here, a table of any
                  size from sixteen up to a hundred and sixty uses every single
                  one of its rows. The unused rows are a fact about a particular
                  training loop rather than about tables as such, and Part 5
                  measures which of the two arrangements actually leaves codes
                  empty.
                </p>
                <KeepInMind>
                  The fit and the collection to fit on are unconditional costs. A
                  table with rows nothing lands on is a cost of one way of
                  learning the table, and the measurements in Part 5 show it is
                  not the way that leaves the most codes empty here.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What we would like instead">
                <p>
                  Suppose the set of codes were decided in advance, by a rule
                  written down before any data arrived, and suppose the rule were
                  cheap enough that finding a vector&rsquo;s code took no search
                  at all. Then there would be no fit, no collection to fit on and
                  nothing about the codes for a training loop to get wrong. The
                  price would be that the codes sit where the rule put them
                  rather than where the vectors are, and the rest of this page is
                  about how large that price turns out to be.
                </p>
                <p>
                  Finite scalar quantisation is one such rule, and it is about as
                  simple as a rule can be. Push each coordinate into a bounded
                  interval, round it to one of a few evenly spaced levels, and
                  let the code be the combination of what each coordinate chose.
                  None of those three steps consults a collection of vectors.
                </p>
                <KeepInMind>
                  The whole method is a fixed rule applied to each coordinate
                  separately. Every consequence on this page follows from the
                  rule being fixed in advance and from it being applied to one
                  coordinate at a time.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Squashing and Rounding, One Coordinate at a Time",
          content: (
            <>
              <SubSection title="4. Bounding a coordinate so the levels have somewhere to be">
                <p>
                  A coordinate arriving from a model can be any size at all, and
                  a finite set of levels cannot cover the whole number line at a
                  useful spacing. So the first step is to squeeze the coordinate
                  into a bounded interval, and the function used for it is the
                  hyperbolic tangent, which takes any number and returns
                  something strictly between &minus;1 and 1, leaves small numbers
                  almost alone and flattens large ones towards the ends.
                </p>
                <Equation>{"bounded  =  tanh(z)     in  (−1, 1)"}</Equation>
                <p>
                  The word strictly matters in the mathematics and not in the
                  arithmetic a computer actually does. In exact terms the
                  hyperbolic tangent never reaches 1, so the ends of the interval
                  are approached and never attained. In the arithmetic these
                  measurements are made in, the value reaches exactly 1 at an
                  input of 18.99034, and every input larger than that gives the
                  same answer. The first coordinate of the word cost, 0.5904,
                  comes back as 0.5302; an input of 3 comes back as 0.99505.
                </p>
                <KeepInMind>
                  The squashing is the same function for every coordinate and
                  every collection. It looks at nothing, which is what makes the
                  method free of a fit and is also the first of the three limits
                  in Part 6.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The levels, and how they are spaced">
                <p>
                  Inside that interval we place a small number of levels, evenly
                  spaced, with one at each end. Call the number of them L. Then
                  the levels run from &minus;1 to 1 in steps of 2 divided by
                  L &minus; 1, and every coordinate of every vector will be
                  rounded to one of them.
                </p>
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
                  Each coordinate gets its own level count, so a configuration is
                  a list of them. The one reported most often in the original
                  work is eight levels for the first coordinate and five for each
                  of the other three.
                </p>
                <KeepInMind>
                  The levels are evenly spaced in the bounded interval, not in
                  whatever units the coordinate arrived in. Squashing is not
                  linear, so evenly spaced there means unevenly spaced here, and
                  Part 6 opens on that.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Rounding to the nearest level">
                <p>
                  With the coordinate bounded and the levels fixed, the rounding
                  is the obvious thing. It is convenient to do it on whole
                  numbers rather than on fractions, so the bounded value is first
                  multiplied by the half width, which is L &minus; 1 over 2, and
                  that puts the levels at consecutive whole numbers with the two
                  ends at plus and minus the half width.
                </p>
                <Equation>
                  {"h  =  (L − 1) / 2\n\nposition  =  round( tanh(z) × h )"}
                </Equation>
                <p>
                  At five levels the half width is 2, the positions are
                  &minus;2, &minus;1, 0, 1 and 2, and reading a position back as
                  a level is a division by 2. At eight levels the half width is
                  3.5, and that half is exactly where the trouble in Part 4 comes
                  from. For now take the rule as written and note that it is one
                  multiplication and one rounding per coordinate, with no search
                  and no comparison against anything.
                </p>
                <KeepInMind>
                  Finding a vector&rsquo;s code costs one multiplication and one
                  rounding per coordinate. A table of representatives costs a
                  distance to every row, which is why the arrangement here needs
                  no clever lookup however many codes there are.
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
                <p>
                  With eight, five, five and five levels the multipliers are 1,
                  8, 40 and 200. The word cost&rsquo;s digits were 5, 3, 2 and 1,
                  so its code is 5 + 24 + 80 + 200, which is 309.
                </p>
                <WorkedExample title="The same arithmetic on four chosen numbers">
                  <p>
                    Take 1.0, &minus;0.5, 0.2 and 3.0, which are picked so that
                    each case turns up once, one coordinate landing well inside,
                    one landing exactly on a level, one sitting near the middle
                    and one nearly reaching the end.
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
                  This is where the method differs from a learned table in the
                  way that matters most for anybody planning a system. A table of
                  a thousand vectors has to be found, stored and kept from
                  degenerating; a grid of a thousand codes is four small numbers
                  written in a configuration file. Doubling the first
                  coordinate&rsquo;s levels from eight to sixteen doubles the
                  code count without adding a single fitted parameter, and a
                  thousand codes is 9.9658 bits, which is what each position of
                  the sequence costs a model downstream.
                </p>
                <InAModel>
                  Nothing about the grid grows with the number of codes except
                  the model&rsquo;s own output layer, which has to score one of
                  them. A learned table of a hundred thousand rows is a hundred
                  thousand vectors to hold and to move during training, where the
                  grid of a hundred thousand codes that five coordinates at ten
                  levels each would give is five small numbers written into a
                  configuration, and reaching a million codes from there is
                  adding a sixth coordinate.
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
                <p>
                  Two corners are worth knowing. Code 0 is the vector with every
                  coordinate at &minus;1, and code 999 in the published
                  configuration is the vector with every coordinate at 1, which
                  is what any sufficiently large input lands on. A vector every
                  one of whose coordinates saturates is reproduced exactly, and
                  its rounding error is zero.
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
                <WhyThisWorks>
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
                    That is not true when the set of codes is a list rather than
                    a product, which is exactly why a table has to be searched.
                    Materialising the thousand grid points and asking which is
                    nearest gives the same code and the same error as rounding
                    the four coordinates one at a time, and the point of the
                    method is that the second route never needs the table.
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
          title: "Part 4. The Rounding Rule, and Where the Obvious One Fails",
          content: (
            <>
              <SubSection title="12. The rule anybody writes first">
                <p>
                  Section 6 gave the rule as multiply by the half width and
                  round, and that is what anybody writes the first time. It is
                  right for an odd level count and wrong for an even one, and the
                  way it is wrong is quiet enough that a system built on it will
                  train, produce codes and report plausible numbers.
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
                  An interval of width 2h contains 2h + 1 whole numbers when h is
                  a whole number and 2h when it is not, and the half width is a
                  whole number exactly when the level count is odd.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Swept from two levels to twelve">
                <p>
                  One example is not evidence, so here is the whole sweep. For
                  every level count from two to twelve, two hundred thousand
                  inputs spread across the range were rounded under both rules
                  and the distinct results counted. The widget draws each level
                  count as a line from &minus;1 to 1, the obvious rule&rsquo;s
                  levels above the line and the corrected rule&rsquo;s below.
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
                  The fault is not a rounding inaccuracy that could be tightened
                  away. The obvious rule delivers L &minus; 1 levels whenever L
                  is even, for every even L, and the two extreme levels it does
                  reach are the ones nearest the ends rather than the ends
                  themselves.
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
                <p>
                  Including inputs large enough that the squashing returns
                  exactly 1, the obvious rule at eight levels reaches nine
                  distinct levels rather than seven, one more at each end. At
                  twelve it reaches thirteen and at four it reaches five. But at
                  two, six and ten it reaches one, five and nine, which is no
                  more than before. The reason is the tie rule. A value landing
                  exactly half way between two whole numbers is rounded to the
                  even one, so 3.5 becomes 4 and 2.5 becomes 2, and whether the
                  extra levels appear depends on whether the half width&rsquo;s
                  whole part is odd or even.
                </p>
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
                  Even where they appear the extra levels are no use, since they
                  are reached only by inputs beyond the point at which the
                  squashing has flattened completely. Under the obvious rule at
                  eight levels a system would have seven levels in ordinary use,
                  two more that fire only on saturating inputs, and a total of
                  nine where eight were configured, which is a worse state of
                  affairs than being one short.
                </p>
                <KeepInMind>
                  The behaviour at saturation depends on the tie rule and on
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
                  The offset is applied before rounding and undone after it. Half
                  of a fix is worse than none here, since applying it only on the
                  way in would shift every level off the interval it was supposed
                  to be symmetric in.
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
                <p>
                  All-even configurations are where it bites. At four levels
                  across four coordinates the obvious rule reaches eighty-one of
                  the two hundred and fifty-six codes configured and the error is
                  79 per cent higher; at two levels it reaches one code out of
                  sixteen and the whole arrangement answers the same number for
                  every vector. The published configuration is the interesting
                  case, because three of its four level counts are odd, so only
                  the first coordinate is affected, the reachable codes fall from
                  a thousand to eight hundred and seventy-five, and the error
                  rises by four per cent. A system built on the obvious rule and
                  tested at eight, five, five and five would look almost right.
                </p>
                <KeepInMind>
                  Test a rounding rule at an all-even configuration, and at two
                  levels in particular. A configuration with one even count out
                  of four hides the fault behind a four per cent difference that
                  reads as noise.
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
                  So a coordinate of exactly zero comes back as 1/7 and carries a
                  squared error of 1/49, which is 0.020408, while at five levels
                  zero is a level, comes back as zero and costs nothing. Both are
                  correct. The levels are symmetric about zero either way, and an
                  even number of symmetric levels cannot include the
                  centre.
                </p>
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
                  The error is measured against the squashed vector rather than
                  the original one, because the grid lives in the bounded
                  interval. Measured against the original, a vector that arrived
                  far outside the interval would dominate the number and say
                  nothing about the grid.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Against a table fitted to the same vectors">
                <p>
                  A number like 0.2312 means nothing on its own, so the widget
                  above draws a second line. At every code count the same six
                  hundred vectors were also rounded to a table of exactly that
                  many representatives, found by grouping those same six hundred
                  vectors around centres. That is the arrangement finite scalar
                  quantisation is doing without, given every advantage, since it
                  is fitted on precisely the vectors it is then judged on.
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
                  The fitted table is better everywhere, by between 2.04 and 4.96
                  times. That is the honest price of the method, and it is worth
                  reading twice before deciding it is small. What is bought with
                  it is that the right-hand column of that table required a fit
                  and the left-hand one did not, and that in a model being trained
                  end to end the fit would be happening inside the training loop
                  and interacting with everything else in it.
                </p>
                <KeepInMind>
                  On this collection the fixed grid is between two and five times
                  worse than a table fitted to the very vectors it is judged on.
                  Anybody choosing between the two is trading that factor against
                  a fit they no longer have to run or debug.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. How the codes are spent matters as much as how many there are">
                <p>
                  The line in section 18 is not monotone, and the reason is a
                  real property of the method rather than an artefact of the
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
                  Three configurations of exactly sixty-four codes differ by 29
                  per cent in error depending only on how the levels are
                  distributed, and giving eight levels to one coordinate while
                  leaving the other three at two is the worst of them by a clear
                  margin. On a collection where every coordinate matters equally,
                  spreading the levels evenly is what pays, and the level counts
                  are therefore a real design choice rather than a formality.
                </p>
                <KeepInMind>
                  Which coordinates get the levels is a choice, and it is not a
                  choice the method makes for you. The published eight, five,
                  five, five is uneven on purpose, and on a collection whose
                  first coordinate carries more than the others that is the right
                  shape.
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
                <p>
                  Of the 420 that were reached, 293 hold exactly one vector, 88
                  hold two, 28 hold three, 9 hold four and two codes hold five and
                  six. That is about as even a spread as six hundred vectors over
                  a thousand codes can be, and the emptiness is a consequence of
                  having more codes than vectors rather than of anything going
                  wrong. The fitted table of the same size is not available for
                  comparison at a thousand codes, but at every size where it is,
                  from sixteen up to a hundred and sixty, it uses every single one
                  of its codes while the grid uses 152 of 160 and 80 of 81.
                </p>
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
                  A fixed grid has unused codes for a different reason than a
                  learned table does, and on these collections it has more of
                  them. The grid&rsquo;s codes sit where the rule put them, so
                  every code covering a region the vectors avoid is empty by
                  construction and no amount of training will move it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
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
                <p>
                  Read the first and fourth rows together. At a tenth of the
                  scale the error is 0.0564 and at full scale it is 0.0565, which
                  is the same number to three places, and yet the first reaches
                  thirty codes and the second reaches four hundred and twenty. At
                  eight times the scale the error is six times lower and only a
                  hundred and seventeen codes are reached, because 81 per cent of
                  all coordinates have been pushed past 0.99 and are landing on
                  the ends, where they are reproduced almost exactly and describe
                  almost nothing. A low rounding error is therefore not by itself
                  evidence that the arrangement is working, and the number of
                  codes reached has to be read beside it.
                </p>
                <KeepInMind>
                  Where the data sits relative to the squashing is the single
                  most important thing about a system built this way, and the
                  method decides none of it. In a trained model the encoder ends
                  up deciding it, which moves the question rather than answering
                  it.
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
                  This cuts both ways, and it is worth being clear which way. A
                  method that chose the number of codes from the data would be a
                  method with a fit in it, which is the thing being given up. The
                  fixed count is the price of that, and its practical form is
                  that the level counts have to be chosen by somebody who has
                  looked at the vectors, which is a fit performed by a person
                  rather than by an algorithm.
                </p>
                <KeepInMind>
                  Removing the fit does not remove the need to know something
                  about the data. It moves that knowledge from a fitted table
                  into a configuration, where it is written down by hand and is
                  not checked by anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The coordinates are treated one at a time">
                <p>
                  The last limit is the deepest, and it is a consequence of the
                  set of codes being a product. Every combination of
                  per-coordinate choices exists, whether or not any vector ever
                  wants it, and no combination can be added, removed or moved.
                  Structure between two coordinates is therefore unrepresentable,
                  not badly represented.
                </p>
                <p>
                  Take six hundred vectors whose first two coordinates rise
                  together, at a correlation of 0.9486, and the same draw with
                  that lean taken out. At sixty-four codes the grid&rsquo;s error
                  is 0.4583 on the leaning collection and 0.4574 on the straight
                  one, which is the same number, so the grid does not notice the
                  lean at all. What changes is how much of the grid is reachable,
                  since the vectors now occupy a diagonal band and the corners off
                  that band are visited by nothing. Forty-six of the sixty-four
                  codes are used against all sixty-four before.
                </p>
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
                  caption="A lean between two coordinates is something a fitted table can spend on and a product grid cannot."
                />
                <p>
                  The fitted table goes the other way. Its error falls from 0.1327
                  to 0.0834 when the lean is introduced, because a collection
                  concentrated in a band is easier to cover with representatives
                  placed where the vectors are. So a dependence between
                  coordinates is information, one arrangement uses it and the
                  other cannot, and the gap between them widens from 3.45 times
                  to 5.50 times on exactly that account.
                </p>
                <KeepInMind>
                  A product of per-coordinate choices can only describe a box.
                  Any shape the vectors actually occupy inside that box costs
                  codes that are spent on regions nothing visits, and the method
                  has no mechanism for noticing.
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
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "one level for a coordinate",
                      reason:
                        "the half width is zero, so reading a position back as a level is a division by zero and the arithmetic has nothing to say. Behind that is the reason it does not matter, since a coordinate with one level takes one value whatever arrives and contributes nothing to the code.",
                    },
                    {
                      expression: "no coordinates at all",
                      reason:
                        "the number of codes is an empty product, which is one, so there is exactly one code and it stands for the empty vector. Defined, and useless, in the way an empty sum is zero.",
                    },
                    {
                      expression: "a coordinate that never varies",
                      reason:
                        "defined, and wasteful in a way nothing reports. The levels are placed by the rule and not by the data, so every vector takes the same level there and that coordinate's whole level count is spent on a distinction that never arises. A learned table would never place two representatives apart along such a coordinate.",
                    },
                    {
                      expression: "a coordinate that is not a finite number",
                      reason:
                        "the squashing of an undefined quantity is undefined, so there is no position to round to and no digit to compose. This is the one case that has to be refused rather than answered.",
                    },
                    {
                      expression: "an input past the point where the squashing flattens",
                      reason:
                        "defined and irreversible. Beyond about 19 in ordinary computer arithmetic the squashed value is exactly 1, so 19 and a million give the same code, and the method cannot distinguish inputs that a model may well be distinguishing.",
                    },
                    {
                      expression: "a value exactly half way between two levels",
                      reason:
                        "genuinely undecided, and any rule is arbitrary. Rounding half to the nearer even whole number is the usual choice; it costs nothing on ordinary data, since a tie needs an exact half, and it is why zero is not the middle level at an even level count. What turns on it is repeatability, so the rule has to be stated rather than left to whichever function was reached for.",
                    },
                    {
                      expression: "an even level count",
                      reason:
                        "defined, and only if the half offset is applied. Without it the interval of width L − 1 holds L − 1 whole numbers rather than L, so the count delivered is not the count configured, and at two levels it collapses to one. This is a decision an implementation faces and gets wrong quietly.",
                    },
                    {
                      expression: "more codes than vectors",
                      reason:
                        "defined, and guaranteed to leave codes empty by counting alone. Six hundred vectors cannot reach more than six hundred of a thousand codes, and reached 420. Nothing is wrong; the number of codes is not a claim about how many are used.",
                    },
                    {
                      expression: "two vectors that round to the same code",
                      reason:
                        "defined, and the entire point. The code names a point of the grid, not the vector that produced it, so composing and decomposing a code is one to one while quantising is not. What is lost is exactly the rounding error the cost is measured by.",
                    },
                    {
                      expression: "a dependence between two coordinates",
                      reason:
                        "defined, and unrepresentable. The set of codes is a product, so it is a box, and a collection lying along a diagonal inside that box leaves the corners empty while the error stays where it was. Measured at a correlation of 0.9486, the grid's error moved by 0.0009 and eighteen of its sixty-four codes stopped being used.",
                    },
                    {
                      expression: "the scale of the incoming coordinates",
                      reason:
                        "defined at every scale and different at each of them, with nothing in the method choosing. Multiplying a collection by eight lowered the rounding error sixfold and cut the codes reached from 420 to 117, so the two readings that matter move in opposite directions and neither one alone says whether the arrangement is working.",
                    },
                  ]}
                />
                <KeepInMind>
                  Only two lines above are genuine refusals, the level count of
                  one and the coordinate that is not a number. Everything else is
                  defined, which is the difficulty, since a configuration that
                  wastes most of its codes or that cannot see the shape of its own
                  data still answers every question it is asked.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
