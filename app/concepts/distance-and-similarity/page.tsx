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
import { ContrastAsDimensionsGrow } from "@/components/widgets/ContrastAsDimensionsGrow";
import { CostOfOneQuestion } from "@/components/widgets/CostOfOneQuestion";
import { DetourThroughAThirdWord } from "@/components/widgets/DetourThroughAThirdWord";
import { LengthAgainstUse } from "@/components/widgets/LengthAgainstUse";
import { MovedFarFromOrigin } from "@/components/widgets/MovedFarFromOrigin";
import { NearnessPlayground } from "@/components/widgets/NearnessPlayground";
import { RuleAgreement } from "@/components/widgets/RuleAgreement";
import { ThreeWordCounts } from "@/components/widgets/ThreeWordCounts";
import { WhereNearnessIsUndefined } from "@/components/widgets/WhereNearnessIsUndefined";

export const metadata: Metadata = {
  title: "Distance and Similarity · oop_ml",
  description:
    "Once words have vectors, we still need to decide what makes two vectors similar. Their distance, direction, and length can give us different answers, depending on the comparison we choose.",
};

export default function DistanceAndSimilarityPage() {
  return (
    <ConceptPage
      lessonId="distance-and-similarity"
      intuition={lessonIntuitions["distance-and-similarity"]}
      technicalStart="Part 2. Six Rules, Asked of Two Words"
      openingTitle="The Vectors Are Fixed; the Nearest Word Can Still Change"
      playgroundIntro="Choose the same pair under different comparison rules. Check whether a high or low score means a close match and whether vector length affects it."
      title="Distance and Similarity"
      tagline={"Once words have vectors, we still need to decide what makes two vectors similar. Their distance, direction, and length can give us different answers, depending on the comparison we choose."}
      prerequisites={
        <>
          A model that arranges things so that near means alike has to be asked
          what near means, and nothing about that question belongs to any one
          kind of data. It is answered here on word positions, because those are
          small enough to fit live and to check by hand, and the answers carry
          over unchanged to the positions a network gives pictures. The six
          rules themselves are worked through on ordinary measurements over
          on{" "}
          <Link
            href="/concepts/distance-metrics"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            what near means
          </Link>
          , which this page leans on rather than repeating; here the same six
          are asked of word positions, where several of them answer
          differently. It helps to have seen a dot product written out once,
          which the{" "}
          <Link
            href="/primers/linear-algebra"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>{" "}
          does.
        </>
      }

      playground={<NearnessPlayground />}
      sections={[
        {
          title: "Part 1. A Position Only Means What a Rule Reads",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What a table of positions claims">
                <p>
                  Suppose we have given every word in a collection of texts a
                  handful of coordinates, so that each word is a point rather
                  than a number in a list. On its own that is a table, and a
                  table makes no claim about anything. It becomes a claim only
                  at the moment we say that two words near each other in it are
                  alike, because near is not a property of the table, it is a
                  property of the table together with some rule for turning two
                  rows into one verdict.
                </p>
                <p>
                  So the interesting object is not really the positions. It is the rule, and the positions are worth exactly what the rule can read out of them. Two people can hold the same table, ask the same question of it, and get different answers, and neither of them has made a mistake, because they picked up different rules.
                </p>
                <p>
                  Everything else on this page is an elaboration of that sentence, and two whole sections of this site rest on it, since every method that learns positions for words, and every network that learns them for pictures, is judged by whether nearness in what it produced turns out to mean something. Nothing below is a fact about language.
                </p>
                <p>
                  The worked numbers use words because a table of them is small enough to check by hand, and the same six rules are asked of a picture in exactly the same way.
                </p>
                <KeepInMind>
                  <p>
                    A table of positions and a rule for comparing two of them
                    are separate things, and only the pair together says
                    anything. Where a piece of writing tells you that two words
                    came out near each other, it has quietly told you which rule
                    it used, or it has told you nothing.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Twenty-four documents, and the table fitted to them">
                <p>
                  The collection this page works on is twenty-four short
                  documents, twelve about cooking and twelve about sailing, and
                  between them they use twenty-three distinct words. Ten of
                  those belong to the cooking documents, ten to the sailing
                  ones, and three of them, <span className="font-mono">and</span>
                  , <span className="font-mono">the</span> and{" "}
                  <span className="font-mono">we</span>, turn up in both. It is
                  a small collection on purpose, small enough that every answer
                  on this page can be traced to particular words.
                </p>
                <p>
                  From that collection a table is fitted by looking at which
                  words stood within two positions of which others, scoring each
                  pairing by how much more often it happened than chance would
                  explain, and squeezing the result down so that each word ends
                  up with four numbers. How that is done is a whole page of its
                  own further along, and none of what follows depends on it. The
                  word this page stands at is{" "}
                  <span className="font-mono">sail</span>, whose four numbers
                  come out at 0.5369, 0.5223, 0.2690 and &minus;0.2075.
                </p>
                <InAModel>
                  <p>
                    Twenty-three words at four numbers each is ninety-two
                    numbers to hold, and twenty-three words make two hundred and
                    fifty-three distinct pairs that can be asked about. A real
                    vocabulary is nearer fifty thousand words at three hundred
                    numbers, which is fifteen million numbers, and the count of
                    pairs it could be asked about runs past a billion. That the
                    small collection and the large one are the same shape of
                    object is what makes the small one worth working on.
                  </p>
                </InAModel>
              </SubSection>

              <SubSection title="3. A distance and a similarity are different objects">
                <p>
                  There are two ways of putting a verdict about two positions
                  into a number, and they point in opposite directions. A
                  distance answers with something that grows as the two things
                  get less alike, is zero when there is nothing between them,
                  and has no upper limit at all, since two positions can always
                  be moved further apart. A similarity answers with something
                  that grows as they get more alike, and the useful ones are
                  bounded, so that the largest value means as alike as this
                  measure can express.
                </p>
                <p>
                  The boundedness is the difference that matters in practice rather than the direction. Two words that come back 0.0175 apart under a rule whose gap cannot exceed 2 are plainly near the top of what that rule can say, and the same pair is 0.3046 apart under the straight line, which means nothing at all until we know what the typical gap in this table is.
                </p>
                <p>
                  So a similarity can be read on its own and a distance can only be read against other distances from the same table, which is why reported figures in this area are usually similarities.
                </p>
                <NumberTable
                  headings={["", "a distance", "a bounded similarity"]}
                  rows={[
                    ["as alike as possible", "0", "the ceiling"],
                    ["less alike", "grows", "falls"],
                    ["upper limit", "none in general", "fixed, and known"],
                    ["comparable across tables", "no", "yes"],
                  ]}
                  caption="Two ways of answering the same question, and what each answer can be read against."
                />
                <KeepInMind>
                  <p>
                    Nothing forces a distance to be unbounded. Two of the six
                    rules below happen to have a ceiling, and one of those is
                    built by subtracting a similarity from a fixed number. The
                    claim is about the general case, not about every member of
                    the family.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Turning one into the other, and what survives">
                <p>
                  Given a similarity with a known ceiling we can always make a
                  distance out of it by subtracting, and the two then order
                  every pair identically, because subtracting from a constant
                  reverses an order and reverses nothing else. That is worth
                  saying plainly, since it means a page reporting an angle and a
                  page reporting one minus that angle are reporting the same
                  ranking, and any argument between them is about presentation.
                </p>
                <Equation>{`gap  =  ceiling  −  similarity`}</Equation>
                <p>
                  What the conversion does not give us is a distance in the
                  full sense. A distance in that sense makes a promise about
                  three words at once, that going from one to another by way of
                  a third never comes to less than going straight there, and
                  this page calls it the detour promise. Reversing an order
                  preserves which pair is nearer;
                  it does not preserve the arithmetic relations between the
                  numbers, so a rule that fails to keep the detour promise fails
                  it just as badly once it has been subtracted from a ceiling,
                  which is the failure Part 5 measures on this collection.
                </p>
                <WhyThisWorks>
                  <p>
                    Take two pairs with similarities s and t and suppose s is
                    greater than t. Then c &minus; s is less than c &minus; t
                    for any fixed c, so the pair that scored higher on
                    similarity scores lower on the gap, and the ranking is
                    exactly reversed. Since the map is one to one, no two pairs
                    that were distinguishable become tied, and no tie is broken.
                    Nothing about the map depends on which similarity we
                    started with.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  <p>
                    Because the order survives, a nearest-word list computed
                    from a similarity and one computed from the matching gap are
                    the same list. Where two lists on this page differ, it is
                    never for this reason.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Six Rules, Asked of Two Words",
          content: (
            <>
              <SubSection title="5. Three words small enough to count on paper">
                <p>
                  Before reading rules off a fitted table, where nobody can
                  check the arithmetic, it is worth building the crudest
                  possible table by hand. Take two words from the collection,{" "}
                  <span className="font-mono">oven</span> and{" "}
                  <span className="font-mono">wind</span>, and give every other
                  word two numbers, which are how often it stood within two
                  positions of each. That is an embedding, in the sense that
                  matters here, because it gives each word a position worked out
                  from how the word was used.
                </p>
                <p>
                  Three words are enough. Counted across the twenty-four
                  documents, <span className="font-mono">bake</span> stood
                  beside <span className="font-mono">oven</span> five times and
                  beside <span className="font-mono">wind</span> never,{" "}
                  <span className="font-mono">stir</span> stood beside{" "}
                  <span className="font-mono">oven</span> twice and beside{" "}
                  <span className="font-mono">wind</span> never, and{" "}
                  <span className="font-mono">sail</span> stood beside{" "}
                  <span className="font-mono">wind</span> five times and beside{" "}
                  <span className="font-mono">oven</span> never. So the three
                  positions are (5, 0), (2, 0) and (0, 5), and every number the
                  next six steps quote can be got with a pencil.
                </p>
                <ThreeWordCounts showScale={false} />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Two of the three lie along one axis and the third lies along
                  the other. Watch the top row of the table, since{" "}
                  <span className="font-mono">bake</span> and{" "}
                  <span className="font-mono">stir</span> are the pair the six
                  rules will most obviously disagree about.
                </p>
              </SubSection>

              <SubSection title="6. Adding up the gaps, with and without squaring">
                <p>
                  The most obvious rule takes the two positions coordinate by
                  coordinate, works out how far apart the two numbers are in
                  each, and adds those up. The second most obvious squares each
                  gap before adding and takes a square root at the end, which is
                  the straight-line distance we would measure with a ruler if
                  the coordinates were drawn on paper. They differ in how much a
                  single large disagreement is allowed to matter, since squaring
                  turns a gap of four into sixteen where a gap of two becomes
                  four.
                </p>
                <Equation>{`summed gaps    =  |a₁ − b₁| + |a₂ − b₂| + …

straight line  =  √( (a₁ − b₁)² + (a₂ − b₂)² + … )`}</Equation>
                <WorkedExample>
                  <p>
                    Between <span className="font-mono">bake</span> at (5, 0)
                    and <span className="font-mono">sail</span> at (0, 5) the
                    two gaps are 5 and 5. Summed, that is 10. Squared and added,
                    25 and 25 make 50, whose square root is 7.0711. Between{" "}
                    <span className="font-mono">bake</span> and{" "}
                    <span className="font-mono">stir</span> at (2, 0) the gaps
                    are 3 and 0, and both rules answer 3, because with only one
                    coordinate in disagreement there is nothing for the squaring
                    to redistribute.
                  </p>
                  <Equation>{`bake to sail    summed gaps    =  |5 − 0| + |0 − 5|  =  10
                straight line  =  √( 5² + 5² )  =  √50  ≈  7.0711

bake to stir    summed gaps    =  |5 − 2| + |0 − 0|  =  3
                straight line  =  √( 3² + 0² )  =  3`}</Equation>
                </WorkedExample>
                <p>
                  On the fitted table the two rules almost never part company.
                  Asked for the nearest word to each of the twenty-three, they
                  give the same answer twenty-three times out of twenty-three,
                  which is the agreement square in step 16. That is not a
                  general truth about the two rules, and it is a good reason not
                  to spend effort choosing between them here.
                </p>
              </SubSection>

              <SubSection title="7. Keeping only the coordinate that disagrees most">
                <p>
                  Pushing the squaring further, to cubes and fourth powers and
                  beyond, concentrates more and more of the answer on whichever
                  single coordinate disagrees most, and in the limit the rule
                  reads that coordinate and discards the rest. A pair of words
                  is then as far apart as their worst disagreement and no
                  further, whatever happens in the other coordinates.
                </p>
                <Equation>{`worst coordinate  =  max over i of  |aᵢ − bᵢ|`}</Equation>
                <WorkedExample>
                  <p>
                    <span className="font-mono">bake</span> against{" "}
                    <span className="font-mono">sail</span> has gaps of 5 and 5,
                    so the worst is 5, against 7.0711 by the straight line and
                    10 by the summed gaps. Adding a third context in which the
                    two agreed perfectly would leave 5 untouched and would drag
                    the other two answers nowhere, since a gap of zero
                    contributes nothing to either.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    This rule is the right one where a word should count as far
                    off if it is far off in any single respect, which is a real
                    question to ask about tolerances and a strange one to ask
                    about meaning, since the coordinates of a fitted table have
                    no individual interpretation for a worst case to be about.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Throwing the length away">
                <p>
                  The fourth rule reads only which way a position points from
                  the origin and ignores how far along that direction it lies.
                  Two words whose positions lie on one ray through the origin
                  are identical to it however different their lengths, and two
                  words at right angles are as unlike as non-negative counts can
                  be. It is computed as the dot product of the two positions
                  divided by both their lengths, which gives a similarity, and
                  the matching gap is one minus that.
                </p>
                <Equation>{`similarity  =  (a · b) / (‖a‖ ‖b‖)

gap         =  1  −  similarity`}</Equation>
                <WorkedExample>
                  <>
                    <p>
                      Bake and stir point in the same direction even though their
                      vectors have different lengths. Cosine distance removes that
                      length difference.
                    </p>
                    <Equation>{"cosine similarity = (5 × 2 + 0 × 0) / (5 × 2) = 1\ncosine distance = 1 − 1 = 0"}</Equation>
                    <p>
                      Bake and sail point at right angles, so their similarity is zero
                      and their cosine distance is one.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  Because the answer never leaves a fixed range this is one of
                  the two bounded rules. On counts, which cannot go below zero,
                  the gap runs from 0 to 1, and on a fitted table whose
                  coordinates may be negative it runs from 0 to 2, with 2
                  reached only by a pair pointing exactly opposite ways.
                </p>
              </SubSection>

              <SubSection title="9. Asking only whether two numbers are equal">
                <p>
                  The fifth rule does no arithmetic on the values at all. It
                  looks at each coordinate, asks whether the two numbers are the
                  same number, and reports the share of coordinates on which
                  they are not. Nothing about the size of a disagreement reaches
                  it, which is exactly right when the numbers are codes standing
                  for categories and there is no sense in which one code is
                  further from another.
                </p>
                <Equation>{`coordinates that differ  =  (how many i have aᵢ ≠ bᵢ) / (how many i there are)`}</Equation>
                <p>
                  Asked of a fitted table it produces something worth looking at
                  rather than something useful. Standing at{" "}
                  <span className="font-mono">sail</span> it reports the nearest
                  word as <span className="font-mono">flour</span> at 0.5, and
                  every other word in the collection at exactly 1.0, so
                  twenty-one of the twenty-two candidates are tied for last and
                  the winner won by a coincidence. Across all two hundred and
                  fifty-three pairs of words only six share even one coordinate
                  exactly, and the best of those, at two coordinates in common,
                  is <span className="font-mono">flour</span> with{" "}
                  <span className="font-mono">sail</span>, a cooking word and a
                  sailing word, which the collection has arranged as mirror
                  images of each other.
                </p>
                <KeepInMind>
                  <p>
                    Equality between two computed numbers is exact equality, so
                    a coordinate that differs in the sixteenth digit counts as a
                    full disagreement, and a rule that reads coordinates as
                    labels has nothing to say about a table whose coordinates
                    are quantities. It is on this page because leaving it out
                    would suggest that all six rules are candidates for a
                    fitted table, and they are not.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Reading each gap against the size of what it separates">
                <p>
                  The sixth rule divides each coordinate&rsquo;s gap by the
                  total size of the two numbers it sits between, then adds those
                  fractions up. Every coordinate then contributes somewhere
                  between nothing and one, whatever units it happens to be in,
                  so no single coordinate can take over an answer merely by
                  holding larger numbers. The price is that it is most sensitive
                  near zero, since a move from one to two costs the same third
                  as a move from a thousandth to two thousandths.
                </p>
                <Equation>{`gaps against their size  =  sum over i of  |aᵢ − bᵢ| / (|aᵢ| + |bᵢ|)`}</Equation>
                <WorkedExample>
                  <>
                    <p>
                      Canberra distance measures each coordinate difference relative to
                      the magnitudes of the two values. The convention used here assigns
                      zero to a coordinate where both are zero.
                    </p>
                    <Equation>{"bake to stir = |5 − 2| / (|5| + |2|) + 0 = 3/7 ≈ 0.4286\nbake to sail = |5 − 0| / 5 + |0 − 5| / 5 = 1 + 1 = 2"}</Equation>
                    <p>
                      Two is the largest possible Canberra distance in two coordinates.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  A coordinate where both words hold zero would be zero divided
                  by zero, and it is treated as contributing nothing on the
                  grounds that the two words agree there and agreement should
                  not be charged for. That is a convention rather than a
                  derivation, and it is the first of several on this page.
                </p>
              </SubSection>

              <SubSection title="11. All six on one pair">
                <p>
                  Put together, the six answers for one pair of hand-counted
                  words show how little they have in common.{" "}
                  <span className="font-mono">bake</span> and{" "}
                  <span className="font-mono">stir</span> are 3 apart under
                  three of the rules, exactly 0 apart under the angle, half a
                  table apart under the one that reads coordinates as labels,
                  and 0.4286 apart under the last of them, and every one of
                  those numbers is right about something.
                </p>
                <NumberTable
                  headings={[
                    "rule",
                    "bake, stir",
                    "bake, sail",
                    "stir, sail",
                  ]}
                  rows={[
                    ["straight line", "3.0000", "7.0711", "5.3852"],
                    ["summed gaps", "3.0000", "10.0000", "7.0000"],
                    ["worst coordinate", "3.0000", "5.0000", "5.0000"],
                    ["angle", "0.0000", "1.0000", "1.0000"],
                    ["coordinates that differ", "0.5000", "1.0000", "1.0000"],
                    ["gaps against their size", "0.4286", "2.0000", "2.0000"],
                  ]}
                  caption="Every rule on every pair of the three hand-counted words, from positions (5, 0), (2, 0) and (0, 5)."
                />
                <p>
                  Read the first column against the second. Under the angle,{" "}
                  <span className="font-mono">bake</span> and{" "}
                  <span className="font-mono">stir</span> are as close as two
                  words can be and <span className="font-mono">sail</span> is as
                  far as a pair of counts can get. Under the summed gaps the
                  first pair is 3 apart and the second 10, so the ordering
                  agrees while the scale does not, and under the coordinates
                  that differ the first pair scores half only because they
                  happen to share a zero. There is no arrangement of these
                  numbers under which one rule is a rescaling of another.
                </p>
                <KeepInMind>
                  <p>
                    Nothing in these three words tells us which column to
                    believe. What decides it is a claim about the data, and the
                    claim that decides it for word positions is the subject of
                    the next Part.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A table of positions, on its own, says that two words near each other in it are alike.",
              false,
              "Near is a property of the table together with some rule for turning two rows into one verdict, so only the pair of them says anything. Two people can hold the same table, ask the same question and come away with different answers without either having made a mistake, because they picked up different rules.",
            ),
            choice(
              "Why are figures in this area usually reported as similarities rather than as distances?",
              [
                "A similarity is quicker to compute",
                "The useful similarities are bounded, so a figure can be read on its own",
                "A distance cannot be computed on a fitted table",
                "A similarity is symmetric and a distance is not",
              ],
              1,
              "Two words 0.0175 apart under a rule whose gap cannot exceed 2 are plainly near the top of what that rule can say. The same pair is 0.3046 apart under the straight line, which means nothing until the typical gap in this table is known, so a distance can only be read against other distances from the same table.",
            ),
            trueFalse(
              "A nearest-word list computed from a bounded similarity and one computed from the gap made by subtracting it from its ceiling are the same list.",
              true,
              "Subtracting from a constant reverses the order and reverses nothing else, and the map is one to one, so no tie is created and none is broken. A page reporting an angle and a page reporting one minus that angle are therefore reporting the same ranking. What the conversion does not give is a distance in the full sense, since a rule that fails the detour promise fails it just as badly after the subtraction.",
            ),
            choice(
              "Under the rule that divides each coordinate’s gap by the size of the two numbers it sits between, bake at (5, 0) and sail at (0, 5) come out at 2. What is that 2?",
              [
                "A ceiling the implementation chose",
                "The largest possible answer in two coordinates",
                "The same answer the straight line gives",
                "The answer the summed gaps give for the same pair",
              ],
              1,
              "Each coordinate contributes its gap divided by the size of the two numbers it sits between, which comes to exactly 1 whenever one of the two is zero and can never come to more, so two coordinates give 1 + 1. No single coordinate can take over an answer merely by holding larger numbers. The price is that the rule is most sensitive near zero, since a move from one to two costs the same third as a move from a thousandth to two thousandths. The summed gaps give 10 for this pair and the straight line 7.0711.",
            ),
            several(
              "Which of these does the page report about the rule that reads coordinates as labels?",
              [
                "Standing at sail it names flour nearest at 0.5 and every other word at exactly 1.0",
                "Only six of the 253 pairs share even one coordinate exactly",
                "Equality is exact, so a coordinate differing in the sixteenth digit counts as a full disagreement",
                "It is the right rule for a table whose coordinates are quantities",
              ],
              [0, 1, 2],
              "Twenty-one of the twenty-two candidates are tied for last, so the winner won by a coincidence. A rule that reads coordinates as labels has nothing to say about a table whose coordinates are quantities, and it suits codes standing for categories, where there is no sense in which one code is further from another. It is on the page because leaving it out would suggest all six are candidates for a fitted table.",
            ),
        ],
        },
        {
          title: "Part 3. What the Length of a Position Carries",
          content: (
            <>
              <SubSection title="12. Counting one word twice over">
                <p>
                  Here is the experiment that separates the rules into two
                  groups. Leave the collection alone but count one word&rsquo;s
                  company twice over, as though the same documents had been
                  gathered twice for that word and once for everybody else. Its
                  position moves straight out along the direction it already
                  pointed, and nothing about which words it stood beside has
                  changed.
                </p>
                <ThreeWordCounts />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drag the slider and watch the angle column and the one beside
                  it stay where they are while the other four climb. The
                  positions are the hand-counted three, so every number in the
                  table can still be checked.
                </p>
                <WorkedExample>
                  <p>
                    Counting <span className="font-mono">bake</span> twice over
                    puts it at (10, 0). Its gap to{" "}
                    <span className="font-mono">stir</span> goes from 3.0000 to
                    8.0000 under all three of the summed and squared rules, and
                    from 0.4286 to 0.6667 under the rule that reads each gap
                    against its size, while the angle stays
                    at exactly 0.0000 and the share of coordinates that differ
                    stays at exactly 0.5000. Four rules of six say the two words
                    have grown apart, and nothing about the way either word was
                    used has changed.
                  </p>
                  <p>
                    Each of the six can be redone with a pencil, with{" "}
                    <span className="font-mono">bake</span> at (10, 0) and{" "}
                    <span className="font-mono">stir</span> where it was, at
                    (2, 0).
                  </p>
                  <Equation>{`summed gaps               |10 − 2| + |0 − 0|         =  8
straight line             √( 8² + 0² )               =  8
worst coordinate          max( 8, 0 )                =  8
gaps against their size   8 ∕ (10 + 2) + 0           ≈  0.6667
angle                     1 − (10 × 2) ∕ (10 × 2)    =  0
coordinates that differ   1 of 2                     =  0.5`}</Equation>
                  <p>
                    The doubled count sits on the top and on the bottom of the
                    angle&rsquo;s fraction and cancels, and the rule that reads
                    coordinates as labels never looked at its size in the first
                    place. Nothing cancels it in the other four.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    The two rules that did not move are not invariant to
                    everything. Doubling a whole coordinate across the entire
                    vocabulary, which is what changing the unit of a measurement
                    would do, moves the angle too. What they ignore is scaling
                    one word&rsquo;s own position, which is the operation
                    counting it twice over performs.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What a length records, measured two ways">
                <p>
                  If the length of a position carries how much of the word we
                  saw, and its direction carries how the word was used, then a
                  rule that ignores length is asking about usage and a rule that
                  reads it is asking about usage and volume together. That is
                  the standard argument for comparing word positions by angle,
                  and on this collection it is worth checking rather than
                  repeating, because the two fits disagree about it.
                </p>
                <LengthAgainstUse />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The same twenty-three words under two ways of fitting. Look at
                  the leftmost dots, which are the three words used most, and
                  notice that they sit at the bottom of one panel and the top of
                  the other.
                </p>
                <p>
                  On the counting fit the relationship between how often a word
                  was used and how long its position came out is{" "}
                  <span className="font-mono">&minus;0.6284</span>, which is
                  strong and runs the wrong way for the standard argument. The
                  three commonest words, <span className="font-mono">and</span>,{" "}
                  <span className="font-mono">the</span> and{" "}
                  <span className="font-mono">we</span> at eight uses each, have
                  three of the shortest positions, at 0.3708, 0.3667 and 0.5770,
                  where <span className="font-mono">deck</span> at five uses
                  reaches 1.1628. On the fit that learns by predicting
                  neighbours, on the identical documents, the same relationship
                  is <span className="font-mono">+0.7005</span>.
                </p>
                <p>
                  The two signs are both explicable and that is the point. A method that scores a pairing by how much it beats chance gives a word occurring everywhere a low score against everything, since it beats chance nowhere, and a method that nudges a position once per occurrence moves a common word further from where it started.
                </p>
                <p>
                  So the length of a position records something about the fitting procedure at least as much as something about the word, and the standard argument for the angle is an argument about one family of methods rather than about word positions in general.
                </p>
                <KeepInMind>
                  <p>
                    The argument for comparing by angle survives this in a
                    weaker form. Length is the part of a position most easily
                    moved by how the fit was run, and the sign it takes against
                    a word&rsquo;s use count depends on which method ran, so an
                    argument beginning from what a length always means has
                    begun from something these two fits do not agree on.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="14. On the unit sphere the rules stop disagreeing">
                <p>
                  There is a tidy consequence of all this. If every position is
                  first scaled to length one, so that only direction is left,
                  then the straight-line gap between two of them is a fixed
                  function of the angle between them, falling as the similarity
                  rises. Ranking by one is therefore ranking by the other, and
                  the question of which rule to use goes away.
                </p>
                <Equation>{`for ‖a‖ = ‖b‖ = 1:    ‖a − b‖  =  √( 2 − 2 (a · b) )`}</Equation>
                <p>
                  Checked on the twenty-three words, the identity holds to
                  6.1&thinsp;&times;&thinsp;10&#8315;&#185;&#8310;, and the
                  order the angle gives from{" "}
                  <span className="font-mono">sail</span> is the same order the
                  straight line gives, word for word down the whole vocabulary.
                  Neither of those orders is the one the straight line gives on
                  the table before scaling, which is what step 15 shows.
                </p>
                <WhyThisWorks>
                  <p>
                    Expanding the square of the gap gives ‖a‖² &minus; 2(a
                    &middot; b) + ‖b‖², and both squared lengths are 1, so the
                    whole thing is 2 &minus; 2(a &middot; b). The square root is
                    increasing, so the gap rises exactly as the dot product
                    falls, and on unit positions the dot product is the
                    similarity. Nothing here depends on the number of
                    coordinates.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  <p>
                    This is why the choice between an angle and a ruler is only
                    a real choice on positions that have not been scaled. Once
                    they have been, it is a choice of what to print.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Which Word Is Nearest, and Under Which Rule",
          content: (
            <>
              <SubSection title="15. One word&rsquo;s neighbours under all six">
                <p>
                  With the hand-counted table behind us we can put the question
                  to the fitted one. Standing at{" "}
                  <span className="font-mono">sail</span>, which word is
                  nearest? The playground at the top of the page answers it six
                  times over, and the six answers are not one answer.
                </p>
                <NumberTable
                  headings={["rule", "nearest", "reading", "then", "reading"]}
                  rows={[
                    ["straight line", "mast", "0.2750", "rope", "0.3046"],
                    ["summed gaps", "mast", "0.4799", "rope", "0.5576"],
                    ["worst coordinate", "mast", "0.1990", "rope", "0.2289"],
                    ["angle", "rope", "0.0175", "mast", "0.0555"],
                    ["coordinates that differ", "flour", "0.5000", "and", "1.0000"],
                    ["gaps against their size", "rope", "0.7160", "crew", "0.8951"],
                  ]}
                  caption="The two words each rule puts closest to sail, whose own position has length 0.8225."
                />
                <p>
                  Three rules say <span className="font-mono">mast</span> and
                  two say <span className="font-mono">rope</span>, and the two
                  candidates swap places rather than one of them being far down
                  the other list. The cause is visible in the lengths, since{" "}
                  <span className="font-mono">rope</span> at 1.0713 is a good
                  deal longer than <span className="font-mono">sail</span> at
                  0.8225 while <span className="font-mono">mast</span> at 0.8281
                  is almost exactly as long, so the ruler is charging{" "}
                  <span className="font-mono">rope</span> for a length
                  difference the angle refuses to look at.
                </p>
                <p>
                  Standing at <span className="font-mono">oven</span> instead,
                  five rules of six agree on{" "}
                  <span className="font-mono">eggs</span>, and the disagreement
                  vanishes. That is the ordinary case, and it is worth knowing
                  that the rules mostly agree before spending any time on where
                  they do not.
                </p>
              </SubSection>

              <SubSection title="16. How often two rules name the same nearest word">
                <p>
                  One word is an anecdote. Asking every rule for the nearest
                  word to every one of the twenty-three, and counting how often
                  two rules gave the same answer, turns the question into a
                  measurement.
                </p>
                <RuleAgreement />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Each cell counts the words on which the row rule and the
                  column rule name the same nearest neighbour, out of
                  twenty-three. The diagonal is twenty-three by construction.
                </p>
                <p>
                  The summed gaps and the straight line agree on all
                  twenty-three; the worst coordinate agrees with them on
                  twenty-one; the gaps read against their size agree on
                  nineteen; the angle agrees on fifteen; and the rule reading
                  coordinates as labels agrees with the straight line on two and
                  with the angle on none at all. Fourteen of the twenty-three
                  words get the same answer from all five rules that read the
                  coordinates as quantities, which is a majority and not a
                  consensus.
                </p>
                <InAModel>
                  <p>
                    Fifteen out of twenty-three is a disagreement rate a reader
                    of a published nearest-word list has no way to see, since
                    such a list is printed under one rule and the other five
                    answers are never computed. Where a claim rests on a
                    particular word appearing near another, the rule is part of
                    the claim.
                  </p>
                </InAModel>
              </SubSection>

              <SubSection title="17. Where a disagreement is real and where it is an accident">
                <p>
                  Not all eight of the words where the angle and the straight
                  line part company are the same kind of case, and the panel in
                  step 16 lists them. Six are the length effect from step 15
                  working on genuinely close pairs, where{" "}
                  <span className="font-mono">sail</span> and{" "}
                  <span className="font-mono">rope</span> or{" "}
                  <span className="font-mono">flour</span> and{" "}
                  <span className="font-mono">whisk</span> are near each other
                  by both rules and the two swap two candidates over. The other
                  two are among the function words, where{" "}
                  <span className="font-mono">and</span>,{" "}
                  <span className="font-mono">the</span> and{" "}
                  <span className="font-mono">we</span> are all short and all
                  close to each other, so the ranking between them is decided by
                  very little.
                </p>
                <p>
                  The rule reading coordinates as labels is a different matter
                  and its disagreements are not disagreements at all. Its answer
                  for <span className="font-mono">sail</span> is{" "}
                  <span className="font-mono">flour</span>, a word from the other
                  topic, and its answer for{" "}
                  <span className="font-mono">oven</span> is{" "}
                  <span className="font-mono">anchor</span>, also from the other
                  topic, and both come from the collection having been built so
                  that each cooking word has a sailing counterpart in the same
                  position of the cycle. That symmetry puts a handful of
                  coordinates at exactly equal values across the two topics, and
                  a rule that reads only equality finds nothing else to go on.
                </p>
                <KeepInMind>
                  <p>
                    A rule can be applied to a table without being applicable to
                    it. Six of the six run on these positions and return numbers;
                    five of the six are answering a question about the words.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Counting bake twice over moves it from (5, 0) to (10, 0). Which rules then say it has grown apart from stir?",
              [
                "All six of them",
                "Four of the six, with the angle and the label rule unmoved",
                "Only the angle",
                "None, since nothing about how the word was used has changed",
              ],
              1,
              "The gap to stir goes from 3.0000 to 8.0000 under all three of the summed and squared rules, and from 0.4286 to 0.6667 under the rule reading each gap against its size, while the angle stays at exactly 0.0000 and the share of coordinates that differ stays at exactly 0.5000. The two that held still are not invariant to everything, since doubling a whole coordinate across the vocabulary moves the angle too.",
            ),
            trueFalse(
              "The two fits agree that a word used more often ends up with a longer position.",
              false,
              "On the counting fit the relationship between how often a word was used and the length of its position is −0.6284, and on the fit that learns by predicting neighbours, over the identical documents, it is +0.7005. A method scoring a pairing by how much it beats chance gives a word occurring everywhere a low score, and a method nudging a position once per occurrence pushes a common word further out. Length records something about the procedure at least as much as about the word.",
            ),
            trueFalse(
              "Once every position has been scaled to length one, choosing between the angle and the ruler is a choice of what to print.",
              true,
              "Expanding the squared gap leaves two minus twice the dot product when both lengths are one, and the square root is increasing, so the gap rises exactly as the similarity falls. Checked on the twenty-three words the identity holds to 6.1 × 10⁻¹⁶ and the two orders from sail agree word for word. Neither order is the one the straight line gives before the scaling.",
            ),
            choice(
              "Asked which word is nearest to sail, what do the six rules answer?",
              [
                "One answer, since the rules mostly agree",
                "Three say mast and two say rope, and the two candidates swap places",
                "Six different words",
                "Nothing, since sail sits too near the origin",
              ],
              1,
              "Rope at 1.0713 is a good deal longer than sail at 0.8225 while mast at 0.8281 is almost exactly as long, so the ruler charges rope for a length difference the angle refuses to look at. Standing at oven instead, five rules of six agree on eggs, which is the ordinary case and worth knowing before spending time on where they part.",
            ),
            several(
              "Every rule was asked for the nearest word to each of the twenty-three. Which of these does the count show?",
              [
                "The summed gaps and the straight line name the same word all twenty-three times",
                "The angle names the same word as the straight line fifteen times",
                "All six rules name the same word fourteen times",
                "The rule reading coordinates as labels agrees with the angle twice",
              ],
              [0, 1],
              "Fourteen is the count for the five rules that read the coordinates as quantities, which is a majority and not a consensus, and the sixth cannot join them, since it agrees with the straight line on two words and with the angle on none at all. Fifteen out of twenty-three is a disagreement rate a reader of a published nearest-word list has no way to see, since the list is printed under one rule and the other answers are never computed.",
            ),
        ],
        },
        {
          title: "Part 5. What It Costs to Ask",
          content: (
            <>
              <SubSection title="18. One question is the whole table">
                <p>
                  Asking which word is nearest to{" "}
                  <span className="font-mono">sail</span> means reading every
                  other position in the collection, because none of these rules
                  gives any way of ruling a word out without computing its
                  answer. On the twenty-three-word table that is twenty-two
                  comparisons of four numbers each, which is eighty-eight
                  multiplications and then a sort. It is nothing, and it grows
                  as the product of the vocabulary and the number of
                  coordinates.
                </p>
                <CostOfOneQuestion />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  One question against vocabularies of rising size, timed once
                  on whichever machine is serving this page, so the
                  milliseconds depend on that machine while the multiplications
                  do not.
                </p>
                <p>
                  A vocabulary of fifty thousand words at three hundred
                  coordinates costs fifteen million multiplications for one
                  question, and two hundred thousand words costs sixty million.
                  That is a real amount of arithmetic to pay for one answer, and
                  it is paid every time somebody asks, since nothing was
                  precomputed at fitting time that a question can reuse.
                </p>
              </SubSection>

              <SubSection title="19. Every question at once">
                <p>
                  What saves this in practice is that the arithmetic is a shape
                  a machine is extremely good at. Squaring out the straight-line
                  gap turns the expensive part into a single multiplication of
                  two blocks of numbers, and comparing by angle after scaling
                  every position to length one is the same multiplication with
                  the lengths already divided out.
                </p>
                <Equation>{`‖a − b‖²  =  ‖a‖²  −  2 (a · b)  +  ‖b‖²`}</Equation>
                <p>
                  The two squared-length terms are one pass over each side, and
                  the middle term for every pair at once is one block
                  multiplication, which is the operation numerical libraries have
                  spent decades making fast. So the count of multiplications is
                  unchanged and the time is not, and asking a hundred questions
                  costs far less than a hundred times one question.
                </p>
                <KeepInMind>
                  <p>
                    Nothing about this changes the answer, which is the whole
                    reason it is allowed. It is the same sum in a different
                    order, and step 20 is about the one situation where that
                    turns out not to be true.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The shortcut that can lose the answer">
                <p>
                  The identity in step 19 recovers a small number by subtracting
                  large nearly equal ones, and that is the classic way to lose
                  it. Word positions sit near the origin, so nothing goes wrong
                  on the table as fitted. It goes wrong when the positions have
                  been moved, which is not a strange thing to have happened,
                  since adding a constant offset to every coordinate is
                  something a preprocessing step can do without meaning
                  anything by it.
                </p>
                <MovedFarFromOrigin />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The gap between <span className="font-mono">sail</span> and{" "}
                  <span className="font-mono">mast</span>, which is 0.2750,
                  measured three ways with the same amount added to every
                  coordinate of both. Read the middle column downwards.
                </p>
                <p>
                  Moving both positions out by a hundred million leaves the true
                  gap at 0.2750 and makes the shortcut answer 2.8284, which is
                  ten times too large and so has stopped being a degraded
                  reading of the right quantity. At a million out the shortcut
                  is still giving 0.2742, wrong in the fourth digit, and a
                  nearest-word list built from readings like that would reorder
                  quietly and raise nothing.
                </p>
                <p>
                  The repair is to subtract a common point from both positions
                  before applying the identity, which leaves every gap unchanged
                  because shifting everything equally moves no pair relative to
                  another, and makes the squared lengths numbers of the size of
                  the spread rather than of the offset. The third column is that,
                  and it agrees with the direct subtraction at every distance
                  out. On two thousand four hundred ordinary pairs the two agree
                  to within four parts in ten thousand million million of the
                  answer.
                </p>
                <WhyThisWorks title="Why the wrong answer is 2.8284 and not some other number">
                  <p>
                    The wrong answers are not arbitrary, and tracing them shows
                    what was lost. A machine number carries about sixteen
                    significant digits, so the larger a number is, the wider
                    the step to the next number the machine can hold. The
                    identity adds and subtracts two squared lengths, and what
                    it is trying to leave behind is the true squared gap, which
                    for this pair is 0.0756.
                  </p>
                  <Equation>{`a hundred million out    squared lengths  ≈ 4 × 10¹⁶     step between machine numbers  8
                         returned  8                     √8  ≈  2.8284

a million out            squared lengths  ≈ 4 × 10¹²     step between machine numbers  ≈ 0.0005
                         returned  0.0752                √0.0752  ≈  0.2742`}</Equation>
                  <p>
                    At a hundred million out nothing smaller than 8 can come
                    out of the subtraction except zero, so 0.0756 has no way of
                    surviving it, and the 2.8284 in the table is the square
                    root of the smallest step available. At a million out the
                    steps are fine enough to land within one of them of the
                    truth, which is why that reading is wrong only in its
                    fourth digit.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  <p>
                    This is a fact about how a gap is computed rather than about
                    any table of positions, and it is worth knowing because the
                    failure is silent. A gap that has lost every one of its
                    digits is still a non-negative number and still takes its
                    place in a sort beside the readings that survived.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Why there is no way to skip most of the table">
                <p>
                  Reading every position for every question looks like something
                  that ought to be avoidable, and for some rules it is, because
                  they promise that a detour is never shorter than the direct
                  route. That promise is what lets a search discard a whole
                  group of words at once, since if a group&rsquo;s representative
                  is far from the question then everything grouped with it is
                  far too. The rule that compares by angle does not make the
                  promise, and on this collection it breaks it often.
                </p>
                <DetourThroughAThirdWord />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Every ordered triple of distinct words, checked under every
                  rule. Only one rule has any red in it.
                </p>
                <p>
                  Of the ten thousand six hundred and twenty-six triples,
                  fifteen hundred and forty have a shorter detour under the
                  angle, and the worst of them is a long way from marginal. From{" "}
                  <span className="font-mono">harbour</span> to{" "}
                  <span className="font-mono">crew</span> reads 1.1066 directly,
                  and going by way of <span className="font-mono">mast</span>{" "}
                  costs 0.4469 and then 0.2313, which is 0.6782, a saving of
                  0.4284. The other five rules have not one violation between
                  them.
                </p>
                <Equation>{`direct              harbour → crew           1.1066
by way of mast      harbour → mast → crew    0.4469 + 0.2313  =  0.6782
saved by the detour                          1.1066 − 0.6782  =  0.4284`}</Equation>
                <InAModel>
                  <p>
                    So a search that prunes on that promise is not available for
                    the rule this topic most wants to use, and the methods that
                    make large vocabularies answerable in practice give up exact
                    answers instead, returning a list that is usually the
                    nearest words rather than provably the nearest words. That
                    trade is a subject of its own and this page does not open
                    it; what belongs here is why the exact route has no shortcut.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Nearness Stops Being Defined",
          content: (
            <>
              <SubSection title="22. Nothing in the data chooses the rule">
                <p>
                  Everything so far has been a comparison between rules, and it
                  is worth being clear that no amount of further data settles
                  which one to take. A collection of documents fixes the
                  positions, and having fixed them it has said everything it can
                  say. Which of the six readings of those positions is the right
                  one is a question about what we meant by alike, and the
                  documents were never asked.
                </p>
                <p>
                  That is not a counsel of despair, because the choice can be argued from properties rather than guessed. If a word&rsquo;s volume in the collection should not affect who its neighbours are, that argues for the angle and rules out four of the others, and step 12 makes the argument checkable. If some coordinate is a category code, that argues for the rule that reads equality and rules out the rest.
                </p>
                <p>
                  What cannot happen is for the choice to be made by fitting, since every one of the six will fit any table at all.
                </p>
                <KeepInMind>
                  <p>
                    A method that reports which rule performed best on a task
                    has not escaped this, since somebody chose the task, and the
                    claim about what alike means has moved into that choice
                    where it is harder to see.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A position with no direction">
                <p>
                  The origin is where the difference between the rules stops
                  being a preference and becomes a question of whether there is
                  an answer. A position at the origin has a perfectly ordinary
                  straight-line gap to everything, equal to the other
                  word&rsquo;s own length, because a straight line needs no
                  division and the origin is a point like any other. It has no
                  angle to anything, because the cosine divides by both lengths
                  and one of them is zero, so the quotient does not exist.
                </p>
                <WhereNearnessIsUndefined />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Seven inputs, what the mathematics leaves undefined about each
                  and what came back. Two of the seven have no answer at all,
                  and two more have an answer only because somebody chose one.
                </p>
                <p>
                  Where a quantity does not exist there are three things an implementation can do, and each costs something. It can refuse, which is honest and forces a caller to decide; it can return a convention, which keeps a calculation running and puts a number that was never measured into a list that will be sorted; or it can return something not a number, which propagates and makes every later comparison false.
                </p>
                <p>
                  The middle one is the usual choice for a zero position under the angle, where the convention is that it sits at a right angle to everything, and it is defensible, though the number it puts into a list that will be sorted was never measured from anything.
                </p>
                <KeepInMind>
                  <p>
                    The convention has a consequence that reads as a paradox. A
                    position at the origin is at gap 1.0000 from itself, so the
                    rule that a thing is at gap zero from itself fails, and it
                    fails at exactly one point.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Nearness weakens as the space grows">
                <p>
                  Distance discriminates less as coordinates are added, and this
                  is a property of distance rather than of any table. With more
                  coordinates each pair of positions accumulates more small
                  differences, those differences average out, and the nearest
                  and the farthest positions to a given point draw together
                  until the word we call nearest is barely nearer than the rest.
                </p>
                <ContrastAsDimensionsGrow />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  How much further the farthest word is than the nearest, at
                  four widths, for the fitted table and for a table of the same
                  shape whose numbers were drawn independently.
                </p>
                <p>
                  On the fitted table the figure falls from 39.42 at two coordinates to 7.02 at four, 3.51 at eight and 0.63 at sixteen, so at the widest the farthest word is only about six tenths further off than the nearest one. The usual demonstration of this uses positions drawn independently, and the grey bars are that, and up to eight coordinates the fitted table holds up substantially better, at 3.51 against 1.04.
                </p>
                <p>
                  At sixteen the advantage reverses and the fitted table reads 0.63 against 0.70, which is a real crossing rather than noise in one seed and is reported here because the tidier claim would have been that structure always helps.
                </p>
                <KeepInMind>
                  <p>
                    Twenty-three words in sixteen coordinates is a table with
                    almost as many numbers as it has room for, so the crossing
                    says something about this collection being small as much as
                    about width. What it does not permit is the assertion that a
                    fitted table escapes the effect.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Alike, without saying in what respect">
                <p>
                  The last limit is the one the rest of this topic inherits and
                  cannot fix. Every rule on this page answers with one number,
                  and one number cannot carry a respect. Two words come back
                  alike, and nothing in the answer says whether they are alike
                  in subject, in grammatical role, in register, in how often
                  they were used, or in having been mangled by the same quirk of
                  the collection.
                </p>
                <p>
                  A consequence shows up in the answers themselves. The measure
                  is symmetric to the last bit, so reading a pair one way round
                  and the other gives figures 0.0 apart, and yet the relation
                  built out of it is not. Five of the twenty-three words have a
                  nearest word that does not name them back, and{" "}
                  <span className="font-mono">mast</span> is the clearest of
                  them, since its nearest is{" "}
                  <span className="font-mono">sail</span> while{" "}
                  <span className="font-mono">sail</span>&rsquo;s nearest is{" "}
                  <span className="font-mono">rope</span>.
                </p>
                <WhereNearnessIsUndefined panel="asymmetry" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The words whose nearest neighbour has a different nearest
                  neighbour of its own. The measure reads the same in both
                  directions, and yet which word comes first does not.
                </p>
                <p>
                  This is the shape of the objection raised against
                  similarity-as-distance long before any of these tables
                  existed, that people judge a small thing to be like a large
                  one more readily than the reverse, and that the judgement can
                  break the detour rule as well. What the arithmetic here shows
                  is a mild version of the same thing arising from a perfectly
                  symmetric measure, purely because being the nearest is a
                  comparison against a field of candidates and the field changes
                  with the word.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what is undefined, or what has to be decided"
                  rows={[
                    {
                      expression: "nearest, under no stated rule",
                      reason:
                        "not a question. Six rules answer it here and five of them read the coordinates as quantities, and fourteen of twenty-three words get the same answer from all five.",
                    },
                    {
                      expression: "the angle from the origin",
                      reason:
                        "undefined, since the cosine divides by both lengths and one is zero. Refusing forces a caller to decide; the usual convention places it at a right angle to everything, which then makes it 1.0000 from itself.",
                    },
                    {
                      expression: "a word the collection never used",
                      reason:
                        "there is no position, so the question names something absent. Nothing about the rule is at fault and no rule can supply the missing row.",
                    },
                    {
                      expression: "two words at the same position",
                      reason:
                        "which is nearer has no answer, since both read 0.0000. Whatever order is returned came from outside the rule, usually from where the words happened to sit in the table.",
                    },
                    {
                      expression: "the nearest word in a vocabulary of one",
                      reason:
                        "the set the question ranges over is empty once the word itself is struck out, and an empty answer is the correct one rather than a failure.",
                    },
                    {
                      expression:
                        "is this pair nearer than that pair, across two tables",
                      reason:
                        "undefined for an unbounded rule, since its numbers only mean something against other numbers from the same table. A bounded similarity can be compared, though only as far as the two fits share a scale.",
                    },
                    {
                      expression: "how much further apart, at three hundred coordinates",
                      reason:
                        "still defined and worth progressively less, since nearest and farthest close on each other as coordinates are added, measured here as 39.42 at two and 0.63 at sixteen.",
                    },
                    {
                      expression: "alike in what respect",
                      reason:
                        "not answerable by any of these rules, since each returns one number and a respect is not a number. Anything said about the respect was decided before the comparison, by what the positions were fitted from.",
                    },
                  ]}
                />
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "Adding a hundred million to every coordinate of sail and mast, whose gap is 0.2750, makes the expanded form of the straight line answer what?",
              [
                "0.2750 still, since shifting everything equally moves no pair",
                "2.8284, ten times too large",
                "Zero, since the two positions now coincide",
                "A non-finite value, which is refused",
              ],
              1,
              "The identity recovers a small number by subtracting large nearly equal ones, which is the classic way to lose it. At a million out it still reads 0.2742, wrong in the fourth digit, and a nearest-word list built from readings like that would reorder quietly and raise nothing. The repair is to subtract a common point from both positions first, which changes no gap and brings the squared lengths down to the size of the spread.",
            ),
            trueFalse(
              "On this collection the angle breaks the promise that a detour is never shorter than the direct route, and none of the other five rules breaks it once.",
              true,
              "Fifteen hundred and forty of the ten thousand six hundred and twenty-six triples have a shorter detour under the angle, and the worst is far from marginal, since harbour to crew reads 1.1066 directly and 0.6782 by way of mast. The promise is what lets a search discard a whole group of words at once, so a search that prunes on it is not available for the rule this topic most wants to use.",
            ),
            choice(
              "What does a position sitting at the origin have?",
              [
                "A straight-line gap to everything and no angle to anything",
                "Neither a gap nor an angle",
                "An angle of zero to everything",
                "A gap of zero to everything",
              ],
              0,
              "A straight line needs no division and the origin is a point like any other, so the gap is just the other word’s own length. The cosine divides by both lengths and one of them is zero, so that quotient does not exist. The usual answer is the convention that the origin sits at a right angle to everything, which has the consequence that it is at gap 1.0000 from itself.",
            ),
            trueFalse(
              "A fitted table escapes the way distance discriminates less as coordinates are added.",
              false,
              "On the fitted table the figure falls from 39.42 at two coordinates to 7.02 at four, 3.51 at eight and 0.63 at sixteen. Up to eight coordinates it does hold up substantially better than independently drawn numbers, 3.51 against 1.04, and at sixteen the advantage reverses to 0.63 against 0.70. Twenty-three words in sixteen coordinates is a table with almost as many numbers as it has room for, so the crossing says something about this collection being small as well.",
            ),
            trueFalse(
              "The measure reads the same in both directions, so being the nearest word is mutual.",
              false,
              "Reading a pair one way round and the other gives figures 0.0 apart, and the relation built out of it is still not symmetric. Five of the twenty-three words have a nearest word that does not name them back, and mast is the clearest, since its nearest is sail while sail’s nearest is rope. Being the nearest is a comparison against a field of candidates, and the field changes with the word.",
            ),
        ],
        },
        {
          title: "Practice. Asking Six Rules With the Library",
          practice: [
            exercise(
              "Ask all six rules about three hand-counted words",
              ["Part 2 counts three words against two contexts and gets bake at (5, 0), stir at (2, 0) and sail at (0, 5). The starter wraps each as a RowBlock of one row, which is what a rule takes, and adds bake counted three times over. Loop over DistanceMetric, which holds the six rules, and print each rule’s answer for bake against stir, for bake against sail, and for the tripled bake against stir, to four places.", "The first two columns should be the table of step 11. Step 12 counts bake twice and watches four rules move and two stay. Counting it three times is not on the page, so the third column is yours, and the same two rules should refuse to move."],
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric

contexts = ["beside_oven", "beside_wind"]
bake = RowBlock(np.array([[5.0, 0.0]]), contexts)
stir = RowBlock(np.array([[2.0, 0.0]]), contexts)
sail = RowBlock(np.array([[0.0, 5.0]]), contexts)
tripled = RowBlock(np.array([[15.0, 0.0]]), contexts)

for metric in DistanceMetric:
    # metric.between takes two blocks and answers a grid with one row per
    # row of the first and one column per row of the second. Print the
    # rule's value and its three answers.
    ...`,
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric

contexts = ["beside_oven", "beside_wind"]
bake = RowBlock(np.array([[5.0, 0.0]]), contexts)
stir = RowBlock(np.array([[2.0, 0.0]]), contexts)
sail = RowBlock(np.array([[0.0, 5.0]]), contexts)
tripled = RowBlock(np.array([[15.0, 0.0]]), contexts)

for metric in DistanceMetric:
    to_stir = metric.between(bake, stir)[0, 0]
    to_sail = metric.between(bake, sail)[0, 0]
    after = metric.between(tripled, stir)[0, 0]
    print(f"{metric.value:9s} bake-stir {to_stir:.4f}  bake-sail {to_sail:.4f}  tripled bake-stir {after:.4f}")`,
              `euclidean bake-stir 3.0000  bake-sail 7.0711  tripled bake-stir 13.0000
manhattan bake-stir 3.0000  bake-sail 10.0000  tripled bake-stir 13.0000
chebyshev bake-stir 3.0000  bake-sail 5.0000  tripled bake-stir 13.0000
cosine    bake-stir 0.0000  bake-sail 1.0000  tripled bake-stir 0.0000
hamming   bake-stir 0.5000  bake-sail 1.0000  tripled bake-stir 0.5000
canberra  bake-stir 0.4286  bake-sail 2.0000  tripled bake-stir 0.7647`,
              { hints: ["DistanceMetric is an enum, so looping over it visits the six rules, and each one’s value is its name. The page’s summed gaps, straight line, worst coordinate, angle, coordinates that differ and gaps against their size are manhattan, euclidean, chebyshev, cosine, hamming and canberra.", "between answers a grid even for two single rows, so the one number is at [0, 0]."], check: numberCheck("With bake counted three times over, what does the canberra rule answer for bake against stir, to four places?", 0.7647, 5e-05, "The rule reads each gap against the size of the two numbers it sits between, so the first coordinate gives 13 over 17, which is 0.7647, and the second, where both hold zero, gives nothing. It was 3 over 7 at one count and 8 over 12 at two. The angle is still 0 and the share of coordinates that differ is still 0.5, because scaling one word’s own position is exactly what those two ignore, and nothing about how bake was used has changed.") },
            ),
            exercise(
              "Ask every rule for every word’s nearest neighbour",
              ["The starter fits the table of step 2 and wraps all twenty-three positions as one RowBlock. For each rule, take the grid of gaps between every word and every other, rule out a word being its own neighbour, and record each word’s nearest. Print what each rule names nearest to sail and at what gap, then how many of the twenty-three words each rule agrees with the straight line about, and with the angle.", "The six answers for sail should be step 15, three saying mast and two saying rope, with flour from the rule that reads labels. The agreement with the straight line should be the counts of step 16, which are 23, 21, 19, 15 and 2. The column against the angle is the one to read for the check."],
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
words = list(space.vocabulary)
names = ["first", "second", "third", "fourth"]
rows = RowBlock(np.asarray(space.table), names)
here = words.index("sail")

nearest = {}
for metric in DistanceMetric:
    # Take np.array(metric.between(rows, rows)), put np.inf on its diagonal,
    # and store the word at each row's argmin under metric.value. Print the
    # word nearest sail and the smallest gap in sail's row.
    ...

# For each rule, count the words on which its nearest matches the
# euclidean one, and the words on which it matches the cosine one.`,
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
words = list(space.vocabulary)
names = ["first", "second", "third", "fourth"]
rows = RowBlock(np.asarray(space.table), names)
here = words.index("sail")

nearest = {}
for metric in DistanceMetric:
    gaps = np.array(metric.between(rows, rows))
    np.fill_diagonal(gaps, np.inf)
    nearest[metric.value] = [words[place] for place in gaps.argmin(axis=1)]
    print(f"{metric.value:9s} sail -> {nearest[metric.value][here]:5s} at {gaps[here].min():.4f}")

for name, answers in nearest.items():
    line = sum(a == b for a, b in zip(answers, nearest["euclidean"]))
    angle = sum(a == b for a, b in zip(answers, nearest["cosine"]))
    print(f"{name:9s} agrees with the straight line on {line:2d}, with the angle on {angle:2d}")`,
              `euclidean sail -> mast  at 0.2750
manhattan sail -> mast  at 0.4799
chebyshev sail -> mast  at 0.1990
cosine    sail -> rope  at 0.0175
hamming   sail -> flour at 0.5000
canberra  sail -> rope  at 0.7160
euclidean agrees with the straight line on 23, with the angle on 15
manhattan agrees with the straight line on 23, with the angle on 15
chebyshev agrees with the straight line on 21, with the angle on 15
cosine    agrees with the straight line on 15, with the angle on 23
hamming   agrees with the straight line on  2, with the angle on  0
canberra  agrees with the straight line on 19, with the angle on 18`,
              { hints: ["between(rows, rows) is a 23 by 23 grid of gaps. np.array makes a copy that can be written to, and np.fill_diagonal with np.inf stops every word winning its own row.", "argmin(axis=1) is the column of the smallest gap in each row, which indexes the list of words.", "zip pairs two lists of answers word by word, and summing a == b over the pairs counts the agreements."], check: numberCheck("On how many of the twenty-three words do canberra and the angle name the same nearest word?", 18, 0.0, "The rule that reads each gap against its size names rope for sail, as the angle does, and it agrees with the angle on 18 words where the straight line manages 15, while still agreeing with the straight line on 19, so on this table it sits between the two. A published nearest-word list is printed under one rule and the other five answers are never computed, which is why step 16 says the rule is part of the claim.") },
            ),
            exercise(
              "Scale every position to length one",
              ["Step 14 says that once every position has length one, the straight-line gap is a fixed function of the angle and the two rules rank alike. Divide every row of the table by its own length, take the straight-line gaps on the scaled rows and the angle’s gaps on the original ones, and print the largest difference between the first and the square root of twice the second, over every pair of different words. Then print how many words keep the angle’s nearest word under the straight line, before scaling and after, and the scaled gap from sail to rope.", "The identity should hold to rounding, the two counts should be the 15 of step 16 and all 23, and the last line is a figure the page does not print."],
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
words = list(space.vocabulary)
names = ["first", "second", "third", "fourth"]
table = np.asarray(space.table)
unit = table / np.linalg.norm(table, axis=1, keepdims=True)
apart = ~np.eye(len(words), dtype=bool)

# Take the euclidean gaps on RowBlock(unit, names), the euclidean gaps on
# RowBlock(table, names) and the cosine gaps on RowBlock(table, names), each
# as np.array.

# Print the largest of |straight on unit - sqrt(2 * angle)| over [apart].

# Put np.inf on each grid's diagonal and count the rows whose argmin
# matches the angle's, for the unscaled straight line and the scaled one.

# Print the scaled straight-line gap between sail and rope to four places.`,
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
words = list(space.vocabulary)
names = ["first", "second", "third", "fourth"]
table = np.asarray(space.table)
unit = table / np.linalg.norm(table, axis=1, keepdims=True)
apart = ~np.eye(len(words), dtype=bool)

scaled = np.array(DistanceMetric.EUCLIDEAN.between(RowBlock(unit, names), RowBlock(unit, names)))
straight = np.array(DistanceMetric.EUCLIDEAN.between(RowBlock(table, names), RowBlock(table, names)))
angle = np.array(DistanceMetric.COSINE.between(RowBlock(table, names), RowBlock(table, names)))

print(f"largest gap in the identity: {np.abs(scaled - np.sqrt(2 * angle))[apart].max():.1e}")
for grid in (scaled, straight, angle):
    np.fill_diagonal(grid, np.inf)
before = int(np.sum(straight.argmin(axis=1) == angle.argmin(axis=1)))
after = int(np.sum(scaled.argmin(axis=1) == angle.argmin(axis=1)))
print(f"same nearest word as the angle: {before} before scaling, {after} after")
print(f"sail to rope on the unit sphere: {scaled[words.index('sail'), words.index('rope')]:.4f}")`,
              `largest gap in the identity: 1.8e-15
same nearest word as the angle: 15 before scaling, 23 after
sail to rope on the unit sphere: 0.1872`,
              { hints: ["A RowBlock is built from an array with one row per word and a name per column, so RowBlock(unit, names) is the scaled table in the form a rule takes.", "The angle’s gap is one minus the cosine, so twice it is 2 minus twice the dot product of the two unit positions, which is what step 14 puts under the square root.", "A boolean grid that is False on the diagonal picks out the pairs of different words. The diagonal is left out because a word’s gap to itself is zero up to rounding, and a square root magnifies rounding near zero."], check: numberCheck("What is the straight-line gap between sail and rope once both have length one, to four places?", 0.1872, 5e-05, "On unit positions the squared gap is 2 minus twice the cosine. sail and rope have a cosine of 0.9825, so the squared gap is about 0.035 and its root is 0.1872. Before scaling the same pair was 0.3046 apart and lost first place to mast, because rope is the longer position. With the lengths divided out the straight line names rope, as the angle does, and it agrees with the angle on all 23 words where it agreed on 15.") },
            ),
            exercise(
              "Move two words far from the origin and measure the same gap",
              ["Step 20 measures the gap between sail and mast three ways after adding the same amount to every coordinate of both. For amounts of 0, ten thousand, a million and a hundred million, print the gap by subtracting first and squaring afterwards, the gap by the expanded form of step 19, and the gap the library’s euclidean rule returns, each to four places. Print beside them the step between neighbouring machine numbers at the size of the squared length, which np.spacing gives.", "The direct column and the library column should read 0.2750 all the way down. The expanded column should fail the way the page reports, in the fourth digit at a million and completely at a hundred million. Read the last column against it."],
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
words = list(space.vocabulary)
names = ["first", "second", "third", "fourth"]
sail = np.asarray(space.vector_of("sail").values)
mast = np.asarray(space.vector_of("mast").values)

for shift in (0.0, 1e4, 1e6, 1e8):
    a, b = sail + shift, mast + shift
    # direct: the square root of the sum of (a - b) squared.
    # expanded: the square root of a @ a - 2 * (a @ b) + b @ b, with
    # anything below zero treated as zero.
    # library: DistanceMetric.EUCLIDEAN.between on the two as one-row blocks.
    # Print all three, and np.spacing(a @ a).
    ...`,
              `import numpy as np
from oop_ml.core.data.row_block import RowBlock
from oop_ml.core.distance.metric import DistanceMetric
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
words = list(space.vocabulary)
names = ["first", "second", "third", "fourth"]
sail = np.asarray(space.vector_of("sail").values)
mast = np.asarray(space.vector_of("mast").values)

for shift in (0.0, 1e4, 1e6, 1e8):
    a, b = sail + shift, mast + shift
    direct = np.sqrt(np.sum((a - b) ** 2))
    expanded = np.sqrt(max(a @ a - 2 * (a @ b) + b @ b, 0.0))
    library = DistanceMetric.EUCLIDEAN.between(RowBlock(a[None, :], names), RowBlock(b[None, :], names))[0, 0]
    print(f"{shift:11,.0f} out: direct {direct:.4f}  expanded {expanded:.4f}  library {library:.4f}  step {np.spacing(a @ a):.1e}")`,
              `          0 out: direct 0.2750  expanded 0.2750  library 0.2750  step 1.1e-16
     10,000 out: direct 0.2750  expanded 0.2750  library 0.2750  step 6.0e-08
  1,000,000 out: direct 0.2750  expanded 0.2742  library 0.2750  step 4.9e-04
100,000,000 out: direct 0.2750  expanded 2.8284  library 0.2750  step 8.0e+00`,
              { hints: ["a @ b is the dot product of two arrays, so a @ a is a squared length. The expanded form is the two squared lengths with twice the dot product taken away.", "a[None, :] turns a position into a grid of one row, which is the shape a RowBlock holds, and between then answers a grid of one number."], check: numberCheck("What does the expanded form return for the gap at a hundred million out, to four places?", 2.8284, 5e-05, "At that distance each squared length is near 4 followed by sixteen noughts, where neighbouring machine numbers are 8 apart, so the three terms can only combine to a multiple of 8 and the true squared gap of 0.0756 cannot survive. They came to 8, and its square root is 2.8284. The library’s rule subtracts a common point from both positions before it uses the identity, which is the repair of step 20, and reads 0.2750 at every distance.") },
            ),
          ],
        },
      ]}
    />
  );
}
