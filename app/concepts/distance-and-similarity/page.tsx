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
  title: "Distance and Similarity · Perceptron Lab",
  description:
    "Vectors can be compared by the differences between their coordinates or by the angle between them. Those choices treat length differently and can change which words count as similar.",
};

export default function DistanceAndSimilarityPage() {
  return (
    <ConceptPage
      lessonId="distance-and-similarity"
      intuition={lessonIntuitions["distance-and-similarity"]}
      technicalStart="Part 2. Six Rules, Asked of Two Words"
      openingTitle="The Vectors Are Fixed; the Nearest Word Can Still Change"
      playgroundTitle="When do closeness and similarity disagree?"
      playgroundIntro="Choose the same pair under different comparison rules. Check whether a high or low score means a close match and whether vector length affects it."
      title="Distance and Similarity"
      tagline={"Vectors can be compared by the differences between their coordinates or by the angle between them. Those choices treat length differently and can change which words count as similar."}
      prerequisites={
        <>
          {"The same vectors can have different nearest neighbors under different comparison rules. We will calculate those differences on a small word-vector table. These formulas also apply to image vectors, though their usefulness still depends on what the coordinates represent. For examples using ordinary measurements, read "}{" "}
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
                  Suppose each word already has a vector. We want to use those vectors to find similar words, but we still need to choose what similarity means numerically. Should we compare the distance between their endpoints, or the directions they point in? Those choices can rank the same words differently. Let&apos;s calculate both before deciding which information we want to keep.
                </p>
                <p>A representation becomes useful through the comparisons we make with it. The same vectors can produce different rankings under different rules because each rule retains different information. We need to choose that information according to the task.</p>
                <p>The rest of the page asks what each rule keeps and discards. A numerical comparison can be calculated correctly while giving poor search results. We will separate the properties of the comparison rule from evidence that its neighbors are useful for this collection of documents.</p>
                <p>
                  The worked numbers use words because a table of them is small enough to check by hand, and the same six rules are asked of a picture in exactly the same way.
                </p>
                <KeepInMind>
                  <p>
                  {"When reporting nearest neighbors, name the comparison rule. Without it, another reader cannot reproduce the ranking or know which properties were retained."}
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
                  {"This example has 23 words, four coordinates per word and 253 unordered pairs. Larger vocabularies require more storage and comparisons, but the same operations apply. The small table lets us inspect those operations before dealing with scale."}
                </p>
                </InAModel>
              </SubSection>

              <SubSection title="3. A distance and a similarity are different objects">
                <p>A distance is normally smaller for nearby representations, while a similarity score is normally larger for a stronger match. Their numerical ranges depend on the rule. Cosine similarity is bounded, for example, while a dot-product score is not generally bounded. The direction of a ranking and the meaning of its scale need to be stated explicitly.</p>
                <p>
                  {"A bounded score gives us a known numerical range, but not a calibrated meaning. A cosine gap near zero indicates nearly aligned vectors; deciding whether that alignment is useful still requires evidence from the representation and task. An unbounded Euclidean distance is also interpretable when its coordinate units and scale are known."}
                </p>
                <p>
                  {"Read either kind of score with its definition and context. Changing preprocessing or the fitted representation can change what the same numerical value implies, even when the formula has fixed bounds."}
                </p>
                <NumberTable
                  headings={["", "a distance", "a bounded similarity"]}
                  rows={[["ranking direction","smaller means closer","larger means more similar"],["possible range","depends on the rule and domain","fixed for the stated rule"],["zero or ceiling means","depends on what the rule ignores","may still identify different vectors"],["comparison across tables","requires compatible representation and scale","also requires compatible representation and calibration"]]}
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
                  {"Subtract a similarity from a known ceiling to make a dissimilarity score. Higher similarity then means a smaller gap. This preserves the preferred-neighbor ordering when each score is ranked in the appropriate direction. It does not automatically create a mathematical metric."}
                </p>
                <Equation>{`gap  =  ceiling  −  similarity`}</Equation>
                <p>Reversing the ranking is not enough to create a mathematical distance. Such a distance must also satisfy the triangle inequality: going through an intermediate point cannot make the total shorter than the direct distance. We call that the detour condition here. Subtracting a similarity from a ceiling gives a dissimilarity score, but does not automatically establish that condition. Part 5 tests the resulting scores on this collection.</p>
                <WhyThisWorks title="Why subtracting similarity reverses its ordering">
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
                  Let&apos;s first use a small table whose entries we can inspect directly. We can check the arithmetic there before applying the rules to fitted vectors. Take two words from the collection,{" "}
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
                  {"For a Minkowski distance, use absolute coordinate gaps raised to a power p, sum them, then take the p-th root. As p grows, the largest gap dominates. The limit is the maximum absolute coordinate difference, called Chebyshev distance."}
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
                  {"Hamming distance ranks flour nearest to sail here because two coordinates are exactly equal. Most other candidates differ in every coordinate and tie. That equality reflects this constructed table; it does not establish that the two words have similar usage."}
                </p>
                <KeepInMind>
                  <p>
                  {"Exact equality treats a tiny numeric difference as a full coordinate mismatch. That makes Hamming distance useful for categorical or binary positions, but generally unsuitable for continuous fitted coordinates where approximate closeness matters."}
                </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Reading each gap against the size of what it separates">
                <p>
                  {"Canberra distance divides each absolute coordinate gap by the sum of the two magnitudes, then adds the fractions. Each nonzero term is at most one. It removes a shared change of units within a coordinate, but becomes sensitive to small absolute changes near zero."}
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
                  {"Cosine gives bake and stir zero gap because their directions agree. The length-sensitive rules retain their different counts. Hamming records only that one coordinate matches. These formulas answer different numerical questions; a single rescaling does not make all six equivalent."}
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
              "The vectors supply coordinates, but a comparison rule determines what counts as near. Euclidean distance uses separation in those coordinates; cosine compares directions. The same table can therefore produce different neighbor lists without either calculation being numerically wrong. Whether either list is useful requires the task's own evaluation.",
            ),
            choice(
              "What useful information does a bounded similarity range provide?",
              [
                "A similarity is quicker to compute",
                "It gives a fixed numerical scale, while typical values and task usefulness still need evidence",
                "A distance cannot be computed on a fitted table",
                "A similarity is symmetric and a distance is not",
              ],
              1,
              "A known range locates a value relative to its numerical endpoints. For example, cosine distance 0.0175 is close to zero on a range ending at two. That does not establish that a pair is usefully similar for a task, or show how unusual the score is. Both bounded similarities and ordinary distances need representative comparisons or validation.",
            ),
            trueFalse(
              "A nearest-word list computed from a bounded similarity and one computed from the gap made by subtracting it from its ceiling are the same list.",
              true,
              "Subtracting a similarity from one fixed constant reverses its order, so descending similarity and ascending transformed distance have the same ranking and ties in exact arithmetic. This does not by itself establish the triangle inequality or any other metric property. Ranking equivalence and the guarantees needed for a particular search algorithm are separate questions.",
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
              "Canberra distance measures each coordinate's absolute gap relative to the sum of its absolute values. Exactly one value is nonzero in each coordinate of this pair, so both contributions are one.\n\n```math\nCanberra distance = 1 + 1 = 2\n```\n\nThis prevents a large-valued coordinate from dominating solely through its units, but also makes small changes near zero influential. A both-zero coordinate needs the implementation's stated zero contribution.",
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
              "Hamming distance records exact coordinate matches and ignores the size of unequal gaps. In this fitted numerical table, most candidates therefore tie and one exact equality can decide the winner. The value is defined, but that equality pattern does not represent the intended word resemblance. The same rule can be useful for coordinates that really encode categorical matches.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "The rule counts the fraction of coordinates that differ by exact equality.\nFrom sail: flour scores 0.5; each of the other 21 candidates scores 1.0.\nAcross the 253 word pairs, only 6 share any coordinate exactly.\nThese coordinates are learned numerical quantities, not category labels."
              },
            ),
        ],
        },
        {
          title: "Part 3. What the Length of a Position Carries",
          content: (
            <>
              <SubSection title="12. Counting one word twice over">
                <p>
                  {"Multiply bake’s hand-counted vector by two, as a controlled representation change. Its relative context proportions stay fixed while its total count doubles. This experiment does not refit the whole corpus; a joint fitting procedure could also change other vectors."}
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
                  {"Bake moves from(5,0) to(10,0), while stir stays at(2,0). The length-sensitive gaps increase in this example. Cosine stays fixed because the direction is unchanged. Hamming also stays fixed for this pair because exactly one coordinate matches before and after scaling."}
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
                  {"Cosine cancels the positive scale factor. Hamming stays unchanged here because the equality pattern happens to stay the same. Scaling another vector could turn an equal coordinate into an unequal one, or the reverse."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                  {"Cosine is invariant to positive scaling of a whole nonzero vector. Scaling just one coordinate across all vectors generally changes angles. Hamming has a different property: an invertible shared coordinate transformation preserves equality, while scaling just one word need not."}
                </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What a length records, measured two ways">
                <p>
                  Sometimes vector length reflects frequency or magnitude while direction reflects the pattern of usage. In that case cosine and a length-sensitive score answer different questions. But we need to check whether the fitted vectors actually have that interpretation. The two fits here behave differently, so we cannot assume it from the representation&apos;s name.
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
                  where <span className="font-mono">deck</span>  at five uses
                  reaches 1.1628. On the fit that learns by predicting
                  neighbors, on the identical documents, the same relationship
                  is <span className="font-mono">+0.7005</span>.
                </p>
                <p>
                  {"The counting and predictive fits produce different frequency–length relationships. Their objectives, weighting and initialization all affect vector norms. More updates to a frequent word do not by themselves prove that its vector must become longer."}
                </p>
                <p>
                  So the length of a position records something about the fitting procedure at least as much as something about the word, and the standard argument for the angle is an argument about one family of methods rather than about word positions in general.
                </p>
                <KeepInMind>
                  <p>
                  {"These two fits rule out a universal interpretation of vector length as word frequency. Choose whether to retain magnitude by checking the fitted representation and the task."}
                </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="14. On the unit sphere the rules stop disagreeing">
                <p>
                  {"Normalize every nonzero vector to length one. Euclidean distance and cosine similarity then give the same nearest-neighbor ordering, with reversed score direction. Other rules, such as Manhattan distance, need not agree with them."}
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
                <WhyThisWorks title="Deriving the distance between two unit vectors">
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
              <SubSection title="15. One word&rsquo;s neighbors under all six" id="15-one-wordandrsquo-s-neighbours-under-all-six">
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
                  <span className="font-mono">eggs</span>, and the disagreement vanishes. Many of the rankings in this example agree. The differences we examine next concern the cases where choosing a rule changes the result.
                </p>
              </SubSection>

              <SubSection title="16. How often two rules name the same nearest word">
                <p>
                  {"Check every word to measure how often the rules agree on this table. That extends the example beyond sail, although it still describes only these 23 fitted words."}
                </p>
                <RuleAgreement />
                <p className="text-sm text-slate-600 dark:text-slate-400">

                  Each cell counts the words on which the row rule and the
                  column rule name the same nearest neighbor, out of
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
                  {"Cosine and Euclidean distance agree on fifteen of the twenty-three nearest-word queries and disagree on eight. A list printed under one rule does not reveal how another rule would rank the same vectors. When a conclusion depends on a particular neighbor, the comparison rule is part of the evidence."}
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
                  {"All six rules return numbers on these inputs. That alone does not make each suitable for the intended word-retrieval task. Evaluate the ranking against the relationships we want to recover."}
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
              "Euclidean, Manhattan and Chebyshev distances rise from 3 to 8 in this pair, while Canberra rises from about 0.4286 to 0.6667. Cosine remains zero because bake's positive rescaling preserves its direction. Hamming remains 0.5 because the pattern of equal and unequal coordinates happens to stay unchanged. Hamming is not generally invariant to rescaling one vector; that result depends on the supplied entries.",
            ),
            trueFalse(
              "The two fits agree that a word used more often ends up with a longer position.",
              false,
              "The two recorded fits have opposite associations between use count and vector length:−0.6284 for the context-count representation and+0.7005 for the predictive fit on the same documents. The objective and finite fitting procedure therefore affect the observed lengths. These correlations do not establish a universal causal rule that frequent words must be longer or shorter.",
            ),
            trueFalse(
              "Once every position has been scaled to length one, choosing between the angle and the ruler is a choice of what to print.",
              true,
              "For nonzero vectors scaled to unit length, squared Euclidean distance is determined by their dot product.\n\n```math\n||u − v||² = 2 − 2(u · v)\n```\n\nThe square root is increasing, so ascending Euclidean distance and descending cosine similarity give the same exact ranking on these unit vectors. The measured comparison agrees up to floating-point rounding. Scaling first can change the Euclidean ranking relative to the original, non-unit vectors.",
            ),
            choice(
              "Asked which word is nearest to sail, what do the six rules answer?",
              [
                "One answer, since the rules mostly agree",
                "Euclidean, Manhattan and Chebyshev choose mast; cosine and Canberra choose rope; Hamming chooses flour",
                "Six different words",
                "Nothing, since sail sits too near the origin",
              ],
              1,
              "For sail, Euclidean, Manhattan and Chebyshev select mast; cosine and Canberra select rope. Hamming selects a different word through exact coordinate equality. Rope's larger length difference affects Euclidean distance even though its direction is more aligned with sail. For oven, five rules agree on eggs in this run. Agreement on one query does not make the rules equivalent.",
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
              "Manhattan and Euclidean choose the same neighbor for all 23 queries. Cosine and Euclidean agree on 15 and disagree on eight. The five numerical-gap rules all agree on 14 queries, while Hamming agrees with Euclidean on two and with cosine on none. Thus 15 is an agreement count, not a disagreement rate. A published neighbor list depends on which comparison produced it.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Nearest-word comparisons over 23 queries:\nsummed absolute gaps vs Euclidean distance: agree on 23\ncosine vs Euclidean distance: agree on 15\nexact-coordinate disagreement vs Euclidean distance: agree on 2\nexact-coordinate disagreement vs cosine: agree on 0\nAll five numerical-distance rules agree on 14 queries.\nThe exact-coordinate rule is a sixth rule."
              },
            ),
        ],
        },
        {
          title: "Part 5. What It Costs to Ask",
          content: (
            <>
              <SubSection title="18. One question is the whole table">
                <p>
                  {"This implementation scans every other vector and sorts the resulting scores. For 23 words and four coordinates, it examines 22 candidate rows. The work per row depends on the rule: Manhattan distance uses absolute differences, while cosine uses products and lengths. Exact indexes can sometimes prune a search, so a full scan is an implementation choice here."}
                </p>
                <CostOfOneQuestion />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  One question against vocabularies of rising size, timed once
                  on whichever machine is serving this page, so the
                  milliseconds depend on that machine while the multiplications
                  do not.
                </p>
                <p>
                  {"The displayed operation count grows with vocabulary size and vector width. It is a simple product-count estimate, not an exact instruction count for every metric. Normalized vectors, precomputed norms, batching and search indexes can change the work required for repeated queries."}
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
                  {"The identity lets a numerical library compute many dot products in a matrix multiplication, with norms supplied separately. Batching can improve hardware use, but its speedup depends on the implementation and workload. It does not guarantee a particular reduction in runtime."}
                </p>
                <KeepInMind>
                  <p>
                  {"The identity is exact over real numbers. Floating-point evaluation changes rounding and can lose accuracy when large terms cancel. The next comparison measures that failure."}
                </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The shortcut that can lose the answer">
                <p>
                  {"The expanded formula subtracts large nearly equal terms to recover a small squared gap. That can lose significant digits. Adding a common offset leaves Euclidean distances unchanged, so it provides a controlled way to expose the numerical issue. It would not preserve cosine similarity, which depends on the origin."}
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
                  {"Subtracting a common reference point before using the identity reduces the large shared offset. In this experiment it agrees closely with direct subtraction. This can improve stability, but cannot recover differences already lost when the original coordinates were rounded."}
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
                  {"At the larger offset, rounding of the squared-length terms overwhelms the true small squared gap. The returned 8 produces the displayed 2.8284 distance. The exact residual depends on evaluation order and floating-point implementation; the important failure is cancellation, not a universal quantization step for every expression."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  <p>

                    Numerical cancellation can erase a small distance even when the inputs are valid. A result rounded to zero still looks like an acceptable nonnegative distance and can enter the neighbor ordering without an error. We need to check the calculation itself when comparing nearly coincident vectors.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Why there is no way to skip most of the table">
                <p>
                  {"A metric’s triangle inequality can help an index discard candidates. It needs a bound on each group’s radius as well as the distance to its representative; a distant center alone is not enough. The one-minus-cosine score fails the triangle inequality, so it cannot directly use that particular bound."}
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
                  {"This failure rules out applying metric bounds directly to one-minus-cosine. It does not make exact cosine search impossible: normalize nonzero vectors and use Euclidean distance on the unit sphere, which gives the same ranking and satisfies the triangle inequality. Large systems may also choose approximate indexes for speed, with their own recall checks."}
                </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Zero Directions and Comparisons Without Shared Coordinates", id: "part-6-where-nearness-stops-being-defined",
          content: (
            <>
              <SubSection title="22. Nothing in the data chooses the rule">
                <p>
                  The fitted vectors alone cannot tell us which definition of similarity suits our task. We can test candidate measures against relevant judgments or downstream outcomes. Without such a criterion, collecting more documents does not decide whether length, direction or another property is what we meant by alike.
                </p>
                <p>

                  That is not a counsel of despair, because the choice can be argued from properties rather than guessed. If a word&rsquo;s volume in the collection should not affect who its neighbors are, that argues for the angle and rules out four of the others, and step 12 makes the argument checkable. If some coordinate is a category code, that argues for the rule that reads equality and rules out the rest.
                </p>
                <p>
                  {"A system can select a comparison rule by fitting or tuning against task evidence. The task still determines what success means. The vectors alone do not choose the intended relation without such a criterion."}
                </p>
                <KeepInMind>
                  <p>
                  {"When selecting a rule from task results, report the task and evaluation procedure. A better score on one criterion may not mean better similarity for another purpose."}
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
                <p>An undefined score needs a policy. We can reject the input and ask the caller to decide what to do. We can return a documented fallback, but must remember that the number follows a convention rather than the original formula. A NaN can carry the invalid result forward, although it needs explicit handling: ordinary ordering comparisons with NaN are false, and NaN does not compare equal even to itself.</p>
                <p>
                  {"The implementation uses a documented zero-vector fallback for cosine distance. That keeps a numeric result available, but it is not an angle measured from the original formula. Other libraries may reject the input or return an invalid value."}
                </p>
                <KeepInMind>
                  <p>
                  {"Under this fallback, the zero vector has cosine distance 1 from itself. That violates the zero-self-distance property of a metric. The exception comes from extending an undefined cosine, not from the ordinary formula for nonzero vectors."}
                </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Nearness weakens as the space grows">
                <p>
                  {"In some high-dimensional distributions, relative distances concentrate: the nearest and farthest sampled points become less distinct compared with their overall distance. This depends on the data distribution and coordinate structure. Merely adding coordinates does not guarantee it, especially when they are redundant or irrelevant zeros."}
                </p>
                <ContrastAsDimensionsGrow />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  How much further the farthest word is than the nearest, at
                  four widths, for the fitted table and for a table of the same
                  shape whose numbers were drawn independently.
                </p>
                <p>

                  On the fitted table the figure falls from 39.42 at two coordinates to 7.02 at four, 3.51 at eight and 0.63 at sixteen, so at the widest the farthest word is only about six tenths further off than the nearest one. The usual demonstration of this uses positions drawn independently, and the gray bars are that, and up to eight coordinates the fitted table holds up substantially better, at 3.51 against 1.04.
                </p>
                <p>
                  {"At sixteen coordinates, the fitted table’s reported contrast is 0.63 and the random table’s is 0.70. That is a result of this experiment. One displayed sample does not establish that the crossing is reproducible across seeds."}
                </p>
                <KeepInMind>
                  <p>
                  {"The fitted table has only 23 words, so these width comparisons use a small sample of pairwise relationships. Check different data and fitting settings before generalizing the curve. The example illustrates possible loss of distance contrast rather than a universal law for learned vectors."}
                </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Alike, without saying in what respect">
                <p>
                  {"Each score compresses a comparison into one number. The formula and representation determine what it measures, but the returned value alone does not explain which shared properties made the pair score highly. Inspect those properties when the application needs an explanation."}
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

                  The words whose nearest neighbor has a different nearest
                  neighbor of its own. The measure reads the same in both
                  directions, and yet which word comes first does not.
                </p>
                <p>
                  {"In 1977, Tversky examined human similarity judgments that do not follow all the assumptions of geometric distance, including symmetry. Our nearest-neighbor example shows a different distinction: symmetric pair scores need not produce reciprocal first choices because each query has different competing candidates. It does not reproduce the psychological experiment."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://doi.org/10.1037/0033-295X.84.4.327">{"Tversky: Features of Similarity (1977)"}</Link></p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what is undefined, or what has to be decided"
                  rows={[{"expression":"nearest, under no stated rule","reason":"not a question. Six rules answer it here and five of them read the coordinates as quantities, and fourteen of twenty-three words get the same answer from all five."},{"expression":"the angle from the origin","reason":"Cosine is undefined for a zero vector. This implementation uses a fallback that gives distance1 even from zero to itself. Rejecting or returning an invalid value are other policies; state which is used."},{"expression":"a word the collection never used","reason":"there is no position, so the question names something absent. Nothing about the rule is at fault and no rule can supply the missing row."},{"expression":"two words at the same position","reason":"Equal scores do not select a unique winner. The tie rule chooses an order. Duplicate nonzero vectors score zero under the listed distances, but zero-vector cosine still needs its fallback."},{"expression":"the nearest word in a vocabulary of one","reason":"the set the question ranges over is empty once the word itself is struck out, and an empty answer is the correct one rather than a failure."},{"expression":"is this pair nearer than that pair, across two tables","reason":"Either bounded or unbounded scores can be compared when the representations, units and evaluation scale are compatible. Fixed bounds alone do not calibrate meaning across independently fitted tables."},{"expression":"how much further apart, at three hundred coordinates","reason":"The formula remains defined for finite compatible vectors. Distance concentration can weaken contrast under some distributions, but is not guaranteed by dimensionality alone."},{"expression":"alike in what respect","reason":"The representation and formula specify the properties being compared. The single returned score usually does not explain which features were responsible; inspect the inputs or use additional analysis."}]}
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
              "Cosine distance violates the triangle inequality for 1,540 of the 10,626 tested triples. For example, harbour to crew is 1.1066 directly but 0.6782 through mast. A search cannot apply a triangle-inequality bound directly to this distance without justification. This does not rule out indexing cosine queries: on nonzero normalized vectors, an equivalent Euclidean or angular formulation can provide different valid search bounds.",
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
              "Euclidean distance from the origin is the other vector’s length. Mathematical cosine is undefined when either vector is zero. This SDK’s DistanceMetric.COSINE leaves zero rows at zero during normalization and returns distance one, even from zero to itself. Its separate word-embedding cosine helper instead rejects zero vectors. These are documented interface policies, not geometric directions assigned to a zero vector.",
            ),
            trueFalse(
              "A fitted table escapes the way distance discriminates less as coordinates are added.",
              false,
              "The reported distance-separation statistic falls from 39.42 at two coordinates to 7.02 at four,3.51 at eight and 0.63 at sixteen. The fitted vectors retain more contrast than the independent draws at some widths, but not at sixteen in this experiment. A learned representation is therefore not automatically protected from distance concentration. The vocabulary size and fitting choices limit how broadly this small comparison can be interpreted.",
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
              [
  "Use the supplied count vectors for bake, stir and sail, plus bake with every count tripled. Run all six DistanceMetric rules on bake/stir, bake/sail and tripled-bake/stir.",
  "Print distances to four decimal places in enum order. Cosine here is a distance, so aligned nonzero vectors give zero rather than similarity one."
],
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
              { hints: [
  "Each metric takes RowBlock inputs and returns pairwise distances.",
  "Compare the effect of scaling within this specific example. Hamming counts unequal coordinates; it is not generally scale-invariant for arbitrary vectors."
], check: numberCheck("What Canberra distance is returned between tripled bake and stir, to four decimal places?", 0.7647, 5e-05, "Canberra distance is 0.7647. It scales each coordinate difference by the magnitudes present at that coordinate, so increasing one vector can change this distance."), question: "Which distance rules change when one word-count vector grows?" },
            ),
            exercise(
              "Ask every rule for every word’s nearest neighbour",
              [
  "Use the supplied fitted twenty-three-word vector table. For each metric compute the complete pairwise distance matrix and exclude self-matches.",
  "Print sail’s selected neighbor/distance, then count agreement of all nearest-neighbor IDs with Euclidean and cosine distance. Use the same tie behavior as the starter."
],
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
              { hints: [
  "Set diagonal distances to infinity before choosing row minima.",
  "Keep each metric’s full neighbor-index array so the agreement counts compare corresponding words."
], check: numberCheck("For how many of the 23 words do Canberra distance and cosine distance select the same nearest word?", 18, 0.0, "The two rules agree on eighteen word neighbors. Changing a distance rule changes the ranking question even though the fitted vectors stay fixed."), question: "Can the distance rule change every word’s nearest neighbor?" },
            ),
            exercise(
              "Scale every position to length one",
              [
  "Normalize every nonzero word vector to length one. Compare Euclidean distances on those rows with cosine distances on the original rows.",
  "Print the maximum residual in the supplied distance identity over distinct pairs, the count of cosine-neighbor matches before/after scaling and the unit-vector distance from sail to rope."
],
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
              { hints: [
  "Divide each row by its own norm, retaining the coordinate axis.",
  "Compare complete pair matrices using the specified identity, then exclude self-matches for ranking."
], check: numberCheck("What is the straight-line gap between sail and rope once both have length one, to four places?", 0.1872, 5e-05, "The unit-vector distance is 0.1872. Once individual lengths are removed, Euclidean distance and cosine distance rank these nonzero vectors consistently."), question: "Will Euclidean and cosine rankings agree after unit-length scaling?" },
            ),
            exercise(
              "Move two words far from the origin and measure the same gap",
              [
  "Translate sail and mast by the same supplied offsets, from zero through one hundred million in every coordinate. Their true separation is unchanged.",
  "Print direct-subtraction distance, the supplied expanded-form distance, library Euclidean distance and np.spacing at squared-length scale for each offset. Use four decimal places for distances."
],
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
              { hints: [
  "The expanded expression subtracts large nearly equal terms; inspect spacing where those terms are stored.",
  "Compute the direct difference before squaring as an independent reference."
], check: numberCheck("What does the expanded form return for the gap at a hundred million out, to four places?", 2.8284, 5e-05, "The expanded form returns 2.8284 at the largest translation. Large nearly equal squared terms lose the small separation through floating-point cancellation."), question: "Why can subtracting large squared lengths lose a small distance?" },
            ),
          ],
        },
      ]}
    />
  );
}
