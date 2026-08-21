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
    "A word's position claims nothing until a rule for comparing two positions is fixed, and which rule is fixed decides what the whole space says.",
};

export default function DistanceAndSimilarityPage() {
  return (
    <ConceptPage
      title="Distance and Similarity"
      tagline="Every claim a space of learned positions makes is a claim about the rule that compares two of them, and there is more than one rule."
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
      history={
        <>
          <p>
            The first people to write a claim about meaning as a distance were
            psychologists rather than computer scientists. Charles Osgood,
            George Suci and Percy Tannenbaum, at the University of Illinois,
            published <em>The Measurement of Meaning</em> in 1957 with a
            practical difficulty in front of them, which was that they wanted to
            compare what a word meant to one group of people against what it
            meant to another, and asking either group for a definition gave
            them prose they could not compare. What they did instead was hand
            people a concept and a long list of opposed adjective pairs, good
            against bad, strong against weak, fast against slow, and ask for a
            rating on each. Factoring the ratings turned up three directions
            that kept reappearing, which they named evaluation, potency and
            activity, and every concept then had coordinates along them. Having
            got that far they needed one number for two concepts, and they took
            the straight-line distance between the two points, which is the
            move this page is about. A position had become an answer only
            because a rule for reading two of them had been chosen.
          </p>
          <p>
            That the straight line is a choice, rather than the meaning of the
            word distance, had been argued twenty years earlier and in another
            field entirely. Prasanta Chandra Mahalanobis, working on
            anthropometric survey data in Bengal, published &ldquo;On the
            generalised distance in statistics&rdquo; in the Proceedings of the
            National Institute of Sciences of India in 1936. His objection to
            the straight line was that two measurements which rise and fall
            together are not two independent pieces of evidence, so counting
            each of them at full weight overstates how far apart two people
            are, and his distance divides the gap by the spread and the
            correlation of the measurements before adding anything up. Whatever
            one thinks of that particular answer, the argument underneath it is
            the one this page keeps returning to, which is that the rule is
            part of the model and not part of the arithmetic.
          </p>
          <p>
            The sharpest statement of the limit came from Amos Tversky, at
            Stanford, in &ldquo;Features of similarity&rdquo; in Psychological
            Review in 1977. He collected the judgements people actually make
            when asked how similar two things are and found that they are not
            symmetric, since a small country is judged more like a large one
            than the large one is like it, and that they can break the rule
            that a detour is never shorter than the direct route. Since a
            distance is required to be symmetric and to keep that rule,
            similarity as people use the word is not a distance, and Tversky
            built his account out of shared and unshared features instead. The
            six questions this page works through, in order, are these. What
            does a table of positions actually claim? What separates a distance
            from a similarity, given that the two can order things identically?
            What is each of six rules measuring about two lists of numbers, and
            which of them make sense for a word? What is in the length of a
            word&rsquo;s position, as against its direction? When do two rules
            disagree about which word is nearest, and how often? And what does
            asking cost, and where does the question stop having an answer at
            all?
          </p>
        </>
      }
      playground={<NearnessPlayground />}
      sections={[
        {
          title: "Part 1. A Position Only Means What a Rule Reads",
          defaultOpen: true,
          content: (
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
                  So the interesting object is not really the positions. It is
                  the rule, and the positions are worth exactly what the rule
                  can read out of them. Two people can hold the same table, ask
                  the same question of it, and get different answers, and
                  neither of them has made a mistake, because they picked up
                  different rules. Everything else on this page is an
                  elaboration of that sentence, and two whole sections of this
                  site rest on it, since every method that learns positions for
                  words, and every network that learns them for pictures, is
                  judged by whether nearness in what it produced turns out to
                  mean something. Nothing below is a fact about language. The
                  worked numbers use words because a table of them is small
                  enough to check by hand, and the same six rules are asked of
                  a picture in exactly the same way.
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
                  The boundedness is the difference that matters in practice
                  rather than the direction. Two words that come back 0.0175
                  apart under a rule whose gap cannot exceed 2 are plainly near
                  the top of what that rule can say, and the same pair is 0.3046
                  apart under the straight line, which means nothing at all
                  until we know what the typical gap in this table is. So a
                  similarity can be read on its own and a distance can only be
                  read against other distances from the same table, which is
                  why reported figures in this area are usually similarities.
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
                  full sense. Reversing an order preserves which pair is nearer;
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
          ),
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
                  <p>
                    <span className="font-mono">bake</span> at (5, 0) and{" "}
                    <span className="font-mono">stir</span> at (2, 0) have a dot
                    product of 10 and lengths of 5 and 2, so the similarity is
                    10 divided by 10, which is 1, and the gap is 0. The two
                    words are as alike as this rule can say, while every other
                    rule on the page puts them 3 apart or thereabouts.{" "}
                    <span className="font-mono">bake</span> against{" "}
                    <span className="font-mono">sail</span> has a dot product of
                    0, a similarity of 0 and a gap of 1.
                  </p>
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
                  <p>
                    <span className="font-mono">bake</span> at (5, 0) against{" "}
                    <span className="font-mono">stir</span> at (2, 0) gives 3
                    divided by 7 in the first coordinate, which is 0.4286, and
                    nothing in the second, where both numbers are zero and the
                    two words agree. Against{" "}
                    <span className="font-mono">sail</span> at (0, 5) both
                    coordinates give 5 divided by 5, so the answer is 2, which
                    is the largest a two-coordinate table can produce.
                  </p>
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
                  The two signs are both explicable and that is the point. A
                  method that scores a pairing by how much it beats chance gives
                  a word occurring everywhere a low score against everything,
                  since it beats chance nowhere, and a method that nudges a
                  position once per occurrence moves a common word further from
                  where it started. So the length of a position records
                  something about the fitting procedure at least as much as
                  something about the word, and the standard argument for the
                  angle is an argument about one family of methods rather than
                  about word positions in general.
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
                  That is not a counsel of despair, because the choice can be
                  argued from properties rather than guessed. If a word&rsquo;s
                  volume in the collection should not affect who its neighbours
                  are, that argues for the angle and rules out four of the
                  others, and step 12 makes the argument checkable. If some
                  coordinate is a category code, that argues for the rule that
                  reads equality and rules out the rest. What cannot happen is
                  for the choice to be made by fitting, since every one of the
                  six will fit any table at all.
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
                  Where a quantity does not exist there are three things an
                  implementation can do, and each costs something. It can refuse,
                  which is honest and forces a caller to decide; it can return a
                  convention, which keeps a calculation running and puts a
                  number that was never measured into a list that will be sorted;
                  or it can return something not a number, which propagates and
                  makes every later comparison false. The middle one is the
                  usual choice for a zero position under the angle, where the
                  convention is that it sits at a right angle to everything, and
                  it is defensible, though the number it puts into a list that
                  will be sorted was never measured from anything.
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
                  On the fitted table the figure falls from 39.42 at two
                  coordinates to 7.02 at four, 3.51 at eight and 0.63 at sixteen,
                  so at the widest the farthest word is only about six tenths
                  further off than the nearest one. The usual demonstration of
                  this uses positions drawn independently, and the grey bars are
                  that, and up to eight coordinates the fitted table holds up
                  substantially better, at 3.51 against 1.04. At sixteen the
                  advantage reverses and the fitted table reads 0.63 against
                  0.70, which is a real crossing rather than noise in one seed
                  and is reported here because the tidier claim would have been
                  that structure always helps.
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
      ]}
    />
  );
}
