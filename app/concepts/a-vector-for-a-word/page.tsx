import { pageMetadata } from "@/lib/seo";
import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
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
import { AnalogyWorkbench } from "@/components/widgets/AnalogyWorkbench";
import { AngleAgainstGap } from "@/components/widgets/AngleAgainstGap";
import { ExclusionSweepPanel } from "@/components/widgets/ExclusionSweepPanel";
import { SenseCollision } from "@/components/widgets/SenseCollision";
import { SharedCompany } from "@/components/widgets/SharedCompany";
import { SpaceRotation } from "@/components/widgets/SpaceRotation";
import { TwoFitsCompared } from "@/components/widgets/TwoFitsCompared";
import { UnanswerableQuestions } from "@/components/widgets/UnanswerableQuestions";
import { WordPositionPlayground } from "@/components/widgets/WordPositionPlayground";
import { WordSphere } from "@/components/widgets/WordSphere";
import { WordSpaceScatter } from "@/components/widgets/WordSpaceScatter";

export const metadata: Metadata = pageMetadata("/concepts/a-vector-for-a-word", {
  title: "A Vector for a Word · Perceptron Lab",
  description:
    "A token ID identifies an entry but does not describe its relationships to other entries. Learned vectors supply numerical coordinates whose comparisons can capture patterns in how words are used.",
});

export default function WordVectorPage() {
  return (
    <ConceptPage
      lessonId="a-vector-for-a-word"
      intuition={lessonIntuitions["a-vector-for-a-word"]}
      technicalStart="Part 2. Nearness Measured As An Angle"
      openingTitle="A Word's ID Cannot Tell Us What It Resembles"
      playgroundTitle="What makes two word vectors close?"
      playgroundIntro="Compare the nearest vectors for a selected word. Inspect both the similarity values and the source text that gave those relationships meaning."
      title="A Vector for a Word"
      tagline={"A token ID identifies an entry but does not describe its relationships to other entries. Learned vectors supply numerical coordinates whose comparisons can capture patterns in how words are used."}
      prerequisites={
        <>
          The tokenizing pages end with a lookup table from a piece of text to a
          number, and this page begins by asking what that number is good for.
          Nothing else is assumed, though it helps to be comfortable with the
          idea that a list of numbers can be treated as a point, and to have
          seen a dot product written out once.
        </>
      }

      playground={<WordPositionPlayground />}
      sections={[
        {
          title: "Part 1. A Number That Only Names",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What a word’s number can and cannot say">
                <p>
                  A tokenizer gives each piece an ID so we can find it again. That number identifies an entry in a table; it does not measure the piece&apos;s meaning. We could renumber the vocabulary and still identify exactly the same words. So, if we want to compare words numerically, we need something beyond their IDs.
                </p>
                <p>
                  The corpus this page works on is twenty-four short documents, twelve of them about cooking and twelve about sailing, and they hold twenty-three distinct words between them. The numbers are dealt out commonest first, so a number does carry exactly one fact about a word, which is roughly how common it was. What it does not carry is anything about what the word means.
                </p>
                <p>
                  {"Across the 253 word pairs, the correlation between ID separation and cosine similarity is −0.0852. That weak linear relationship is a measurement of this numbering scheme. It does not give the IDs an inherent meaning, and it is not exactly zero."}
                </p>
                <WordSphere />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {"The display draws word directions on a sphere. Topic colors form two groups; ID colors do not follow the same arrangement. The plot helps compare the fitted directions, while the underlying vectors retain four coordinates."}
                </p>
                <KeepInMind>
                  {"An ID lets us retrieve an entry and test whether two entries are the same. Its numerical size is not a similarity measure. Any relationship implied by a particular numbering convention must be supplied separately."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Twenty-four documents, and twenty-three words">
                <p>
                  {"These documents are constructed examples. Each contains six words. Cooking and sailing each use ten topic words, with and, the and we shared between them. Topic words move through a repeating cycle, giving us known patterns to compare with the fitted vectors. One example is oven bake stir the whisk dough; another is harbour anchor and tide mast rope."}
                </p>
                <p>
                  {"Because the documents are short, we can check a neighbor result against the actual contexts. If sail is close to rope but far from oven, inspect which words surround each one. We will also examine results that disagree with ordinary English usage."}
                </p>
                <NumberTable
                  headings={["word", "its number", "times used", "topic"]}
                  rows={[
                    ["and", "0", "8", "shared"],
                    ["the", "1", "8", "shared"],
                    ["we", "2", "8", "shared"],
                    ["anchor", "3", "7", "sailing"],
                    ["boat", "4", "7", "sailing"],
                    ["sail", "13", "6", "sailing"],
                    ["rope", "20", "5", "sailing"],
                    ["whisk", "22", "5", "cooking"],
                  ]}
                  caption="Eight of the twenty-three, in the order the numbers were dealt out. Neighboring numbers land in different topics as readily as in the same one."
                />
                <KeepInMind>
                  Twenty-four documents, twenty-three words, and a vocabulary
                  ordered by how often each word was used. Every number on this
                  page comes from this one corpus unless it says otherwise.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A position instead of a number">
                <p>
                  We can assign each word a vector and treat its entries as coordinates. Now we can measure distances or compare directions. But putting words at points does not make those comparisons useful by itself. We need a way of choosing the coordinates so that the relationships reflect something we care about in the text.
                </p>
                <p>
                  {"The coordinates here come from counting word pairs within a two-position window, scoring their association, then reducing that table to four coordinates per word. The broader idea has a long history: Harris’s 1954 work examined language through the environments in which its elements occur. Context gives us evidence about relationships without requiring someone to label every pair of words as similar."}
                </p>
                <p className="text-sm"><a className="underline underline-offset-4" href="https://doi.org/10.1080/00437956.1954.11659520">{"Harris: Distributional Structure (1954)"}</a></p>
                <WorkedExample title="Where sail ended up">
                  <p>
                    The word <em>sail</em> has number 13, and it was used six
                    times. Its position is four numbers.
                  </p>
                  <Equation>
                    {"sail = (0.5369, 0.5223, 0.2690, −0.2075)"}
                  </Equation>
                  <p>
                  {"The vector table stores four values per word rather than one ID. It also needs the vocabulary mapping, just as the ID representation does. The exact byte cost depends on the numeric types; counting stored values is only the first comparison."}
                </p>
                <Equation>{"23 words × 4 coordinates = 92 vector values\n23 words × 1 ID = 23 ID values"}</Equation>
                </WorkedExample>
                <KeepInMind>
                  A position is several numbers read together as a point.
                  Storing one costs the number of words times the number of
                  coordinates, which is 92 numbers here.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What one of the four numbers is, and is not">
                <p>
                  {"Sail’s first coordinate is 0.5369. In this fitted space, that axis was not defined as a nautical score or another named property. It may correlate with an interpretable feature, but the similarity calculation uses the whole vector. Rotating the space can change that coordinate while preserving the comparisons."}
                </p>
                <p>
                  {"Part 5 rotates all the vectors together. Their coordinates change while their lengths and pairwise angles remain the same. That shows why this representation does not give an individual axis a unique interpretation."}
                </p>
                <KeepInMind>
                  {"Read a coordinate as part of this fitted representation. A named interpretation needs separate evidence; it does not follow from the coordinate’s position in the row."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Nearness Measured As An Angle",
          content: (
            <>
              <SubSection title="5. Two ways to call two positions close">
                <p>There are two useful ways to compare these vectors. Endpoint distance measures the gap between their positions. An angular comparison measures the alignment of arrows drawn from the origin, treating arrows on the same line differently from arrows with nearby endpoints.</p>
                <p>The comparison rules can disagree because they measure different things. Two vectors can point in the same direction while ending far apart. Cosine treats their directions as identical; Euclidean distance still records the gap between their endpoints. We need to know whether length carries useful information before deciding which comparison suits the task.</p>
                <Equation>
                  {"ordinary distance between a and b = √( Σᵢ (aᵢ − bᵢ)² )"}
                </Equation>
                <KeepInMind>
                  Two points are close in two different senses, along the line
                  joining them and in the direction they lie in. The rest of
                  this Part settles which of the two a word&rsquo;s position was
                  built to support.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The cosine of the angle between them">
                <p>For nonzero vectors, divide their dot product by the product of their lengths. The result is cosine similarity: it retains angular alignment while removing the effect of vector length. Its value is one for the same direction, zero for a right angle and minus one for opposite directions. A zero vector needs a separate policy because it has no defined direction.</p>
                <Equation>
                  {"cosine(a, b) = (a · b) / (‖a‖ ‖b‖),   where a · b = Σᵢ aᵢ bᵢ"}
                </Equation>
                <p>
                  The two bars around a letter stand for the length of its
                  arrow, which is the ordinary distance from the origin out to
                  the point, the square root of the sum of its squared
                  coordinates. For <em>sail</em>, whose four numbers Part 1
                  gave, the length comes out a little under one.
                </p>
                <Equation>
                  {"‖a‖ = √( Σᵢ aᵢ² )\n" +
                    "‖sail‖ = √( 0.5369² + 0.5223² + 0.2690² + (−0.2075)² ) ≈ √0.6765 ≈ 0.8225"}
                </Equation>
                <p>Cosine similarity is symmetric, so swapping the two vectors does not change the result. Multiplying either nonzero vector by a positive constant also leaves the score unchanged because its direction stays the same. A zero vector has no direction, so the formula is undefined there. We must either reject it or state a fallback convention. A returned zero would be that convention, rather than a measured right angle.</p>
                <WhyThisWorks title="Deriving cosine similarity from the dot product">
                  The dot product of two arrows equals the product of their
                  lengths times the cosine of the angle between them, which is
                  the law of cosines rearranged. Dividing the dot product by the
                  two lengths therefore leaves the cosine on its own, and the
                  reason the answer cannot escape &minus;1 and 1 is simply that
                  a cosine cannot.
                </WhyThisWorks>
                <KeepInMind>
                  Cosine similarity is the dot product divided by both lengths.
                  It runs from &minus;1 to 1, it ignores length completely, and
                  it does not exist for a point at the origin.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The sketch, where the cosines can be checked on paper">
                <p>
                  Four numbers per word is already too many to picture, so
                  before we trust the measure on the real table let us check it
                  on a drawing. Five words in two dimensions, arranged so that
                  every answer can be read off graph paper. Two of them lie
                  along the horizontal axis at different distances out, two lie
                  along the vertical axis at different distances out, and the
                  fifth sits at the origin with no direction at all.
                </p>
                <NumberTable
                  headings={["word", "position", "length"]}
                  rows={[
                    ["king", "(1, 0)", "1"],
                    ["queen", "(2, 0)", "2"],
                    ["man", "(0, 1)", "1"],
                    ["woman", "(0, 3)", "3"],
                    ["silent", "(0, 0)", "0"],
                  ]}
                  caption="Five words placed by hand. Nothing was fitted here; the positions were chosen so the answers are obvious."
                />
                <WorkedExample title="Same, perpendicular and opposite word directions">
                  <>
                    <p>
                      Take king and queen first. Their vectors have lengths one and two.
                      Multiply matching coordinates and add them to get the dot product,
                      then divide by both lengths.
                    </p>
                    <Equation>{"king · queen = 1 × 2 + 0 × 0 = 2\ncosine similarity = 2 / (1 × 2) = 1.0000"}</Equation>
                    <p>
                      They point in exactly the same direction. The fact that one is
                      twice as long makes no difference to cosine similarity.
                    </p>
                  </>
                  <>
                    <p>
                      King and man point at right angles. Man and woman point in the
                      same direction. The same calculation distinguishes those two
                      cases.
                    </p>
                    <Equation>{"king · man = 1 × 0 + 0 × 1 = 0\ncosine(king, man) = 0 / (1 × 1) = 0.0000\n\nman · woman = 0 × 0 + 1 × 3 = 3\ncosine(man, woman) = 3 / (1 × 3) = 1.0000"}</Equation>
                  </>
                  <p>
                    Now compare that with the ruler. <em>king</em> and{" "}
                    <em>man</em>, which are at right angles, are 1.4142 apart.{" "}
                    <em>man</em> and <em>woman</em>, which point in precisely the same direction, are 2.0000 apart. Distance and angle therefore rank these pairs differently. We need to decide which kind of resemblance the task calls for.
                  </p>
                  <p>
                    Both gaps come straight from the distance formula of
                    section 5, with the two positions of each pair subtracted
                    coordinate by coordinate.
                  </p>
                  <Equation>
                    {"distance(king, man) = √( (1 − 0)² + (0 − 1)² ) = √2 ≈ 1.4142\n" +
                      "distance(man, woman) = √( (0 − 0)² + (1 − 3)² ) = √4 = 2.0000"}
                  </Equation>
                </WorkedExample>
                <KeepInMind>

                  On a table small enough to draw, the angle and the ruler
                  disagree about which pair is closer, and they disagree because
                  one word sits three times as far from the origin as its
                  neighbor.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why the angle and not the gap">
                <p>
                  The same disagreement shows up on the real table, and it shows
                  up at the very top of a ranking and not somewhere down in the
                  noise. Stand at <em>sail</em>, whose own position has
                  length 0.8225, and ask what is nearest. By angle the answer is{" "}
                  <em>rope</em>, at a cosine of 0.9825, with <em>mast</em>{" "}
                  second at 0.9445. By the ruler the order is reversed,{" "}
                  <em>mast</em> at a gap of 0.2750 and <em>rope</em> at 0.3046.
                </p>
                <p>
                  The reason is visible in the third column.{" "}
                  <em>rope</em> has length 1.0713 and <em>mast</em> has length
                  0.8281, and <em>sail</em> is 0.8225 long, so <em>mast</em> is
                  at almost exactly the same distance from the origin as{" "}
                  <em>sail</em> is while <em>rope</em> is well beyond it. The
                  ruler charges <em>rope</em> for that extra reach even though
                  the two words point more nearly the same way than{" "}
                  <em>sail</em> and <em>mast</em> do, and the question is
                  whether the extra reach is a fact about meaning.
                </p>
                <WorkedExample title="The cosine of sail and rope, from their coordinates">
                  <p>
                    Part 1 gave the four numbers of <em>sail</em>. Here they
                    are again with the four of <em>rope</em> under them. The
                    dot product is the four products of matching coordinates
                    added up, and the cosine is that sum divided by both
                    lengths.
                  </p>
                  <Equation>
                    {"sail = (0.5369, 0.5223, 0.2690, −0.2075)     length 0.8225\n" +
                      "rope = (0.5948, 0.6715, 0.3906, −0.4364)     length 1.0713\n\n" +
                      "sail · rope ≈ 0.3193 + 0.3507 + 0.1051 + 0.0906 = 0.8657\n" +
                      "cosine ≈ 0.8657 / (0.8225 × 1.0713) ≈ 0.9825"}
                  </Equation>
                  <p>
                  {"The products are positive because the matching coordinates have the same signs. That contributes to the positive dot product, but does not by itself establish equal directions. Euclidean distance records coordinate differences; cosine normalizes both vectors before comparing their alignment."}
                </p>
                </WorkedExample>
                <AngleAgainstGap word="sail" choices={["sail", "oven", "the", "crew"]} />
                <p className="text-sm text-slate-500 dark:text-slate-400">

                  The same word&rsquo;s neighbors ranked twice. Rows in pink
                  changed place between the two columns, and the length column
                  is where the explanation lives.
                </p>
                <KeepInMind>
                  Standing at <em>sail</em>{", cosine ranks rope first while Euclidean distance ranks mast first. Their lengths help explain the different rankings."}</KeepInMind>
              </SubSection>

              <SubSection title="9. What a vector’s length carries instead">
                <p>
                  {"Vector length depends on how the representation was fitted. In this table, frequency and length have correlation −0.6284: the more frequent words tend to have shorter vectors. Another objective or preprocessing choice can produce a different relationship. Inspect it rather than assuming a universal frequency rule."}
                </p>
                <p>
                  The three commonest words are <em>and</em>, <em>the</em> and{" "}
                  <em>we</em>, used eight times each, and they have the three
                  shortest positions in the table at 0.3708, 0.3667 and 0.5770.
                  Words like <em>deck</em> and <em>dough</em>, used five times,
                  are the longest at 1.1628. That is a consequence of how these
                  particular coordinates were worked out, since a word that
                  turns up beside everything is not surprising beside anything,
                  and a scoring rule built on surprise gives it very little to
                  say. A different way of finding the coordinates would move
                  this number and could easily reverse its sign.
                </p>
                <WordSpaceScatter mode="lengths" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Each dot is a word, placed by how often the texts used it and
                  how long its position came out. The three dots on the right,
                  low down, are the words both topics share.
                </p>
                <p>
                  {"These lengths vary with frequency and context patterns in this corpus. If we want a comparison that ignores magnitude, cosine provides it. That is a modeling choice; it does not prove that length is irrelevant to every language task."}
                </p>
                <KeepInMind>
                  {"Cosine removes magnitude from this comparison. Euclidean distance retains it. Choose based on what the representation and task need, rather than treating one as the default definition of meaning."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "This fitted vocabulary orders token IDs by observed frequency rather than semantic similarity.",
              true,
              "This vocabulary assigns IDs by frequency order, so the ID provides a frequency rank. It does not provide a numerical measure of meaning. The observed correlation between ID gaps and the later similarity scores is −0.0852 across 253 pairs, showing little relationship in this constructed table. Renumbering the same entries would not change which words they identify.",
            ),
            several(
              "Which of these hold of cosine similarity?",
              [
                "The order of the two words does not matter",
                "Doubling every coordinate of one word leaves the answer unchanged",
                "It has no value for a word whose position sits exactly at the origin",
                "A word at the origin scores zero against every other word",
              ],
              [0, 1, 2],
              "Cosine similarity is symmetric and removes positive changes of vector length through its normalization. A zero vector has no direction, so the mathematical quotient is undefined. This SDK rejects that comparison. Another interface could document a convention, but its returned value would not be a measured angle for the zero vector.",
            ),
            choice(
              "Standing at sail, the two readings of near disagree about first place. Which neighbor wins under each?",
              [
                "rope by angle and mast by the ruler",
                "mast by angle and rope by the ruler",
                "rope under both readings",
                "mast under both readings",
              ],
              0,
              "Cosine selects rope: its score is 0.9825, compared with 0.9445 for mast. Euclidean distance selects mast at 0.2750, compared with 0.3046 for rope. Rope has the closer direction but a larger length difference from sail; mast has a slightly less aligned direction and almost the same length. Euclidean distance combines both differences, which reverses the ranking.",
            ),
            trueFalse(
              "On this table the more often a word was used, the longer its position came out.",
              false,
              "In this fitted table, use count and vector length have correlation −0.6284. The three most frequent words have the shortest lengths: 0.3708, 0.3667 and 0.5770. These vectors come from context-association scores and a reduction, so a word common in many contexts need not get a long vector. The result describes this fitting procedure and corpus, rather than a general law relating frequency to length.",
            ),
            choice(
              "What is the argument for comparing two words by the angle rather than by the ruler?",
              [
                "The angle is cheaper to compute than the distance",
                "Cosine can suit a comparison where direction matters and overall magnitude should be ignored",
                "The ruler cannot be computed when a word sits at the origin",
                "The ruler is blind to how often a word was used, and the angle is not",
              ],
              1,
              "Cosine is useful when the direction should matter and overall magnitude should not. In this example, length is associated with frequency and how distinctive a word's contexts are. Ignoring it can suit the comparison, but that is a task choice rather than proof that magnitude contains no useful information. Euclidean distance retains both directional and length differences, while cosine also requires nonzero vectors.",
            ),
        ],
        },
        {
          title: "Part 3. The Questions A Position Makes Possible",
          content: (
            <>
              <SubSection title="10. Which words are nearest this one">
                <p>

                  Now we can search for a word&apos;s neighbors. Compare its vector with each other vocabulary vector, sort the scores, and inspect the closest entries. The fitting objective did not directly specify this list, so the neighbors give us a way to investigate the relationships the representation learned.
                </p>
                <InAModel title="The five words nearest sail">
                  <p>
                    <span className="font-mono">
                      rope 0.9825, mast 0.9445, deck 0.9421, crew 0.9361, and
                      0.6946
                    </span>
                  </p>
                  <p>
                    Four sailing words, then a gap of a quarter of the scale
                    before the first word that belongs to no topic. The word
                    itself is left out of its own list, since a word is at a
                    cosine of exactly one to itself and would otherwise take
                    first place in every answer.
                  </p>
                </InAModel>
                <KeepInMind>

                  A nearest-neighbor list is the first question a number could
                  not be asked. It is produced by scoring the whole table and
                  sorting, and the word asked about is struck out of its own
                  answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Whether the answer is any good">
                <p>

                  A neighbor list can look plausible even when its relationships are weak. Let&apos;s inspect examples where it agrees with the known topic groups and where it does not. In the first case, <em>sail</em> and <em>rope</em> score 0.9825 while{" "}
                  <em>sail</em> and <em>flour</em> score 0.0661 and{" "}
                  <em>sail</em> and <em>oven</em> score &minus;0.0518. Words
                  from the same topic are near one, words from different topics
                  are near zero, and the fit was never told which topic any word
                  belonged to.
                </p>
                <p>
                  {"Sail and boat score only 0.3638, despite their familiar relationship in English. The score reflects this corpus, preprocessing and fitted representation. We can inspect their contexts to investigate the result."}
                </p>
                <NumberTable
                  headings={["pair", "cosine", "what a reader would expect"]}
                  rows={[
                    ["sail and rope", "0.9825", "close, and it is"],
                    ["oven and bake", "0.9267", "close, and it is"],
                    ["sail and flour", "0.0661", "unrelated, and it is"],
                    ["sail and oven", "−0.0518", "unrelated, and it is"],
                    ["sail and boat", "0.3638", "close, and it is not"],
                  ]}
                  caption="Four of the five agree with a reader’s judgment. The fifth is reported because hiding it would misrepresent what a small corpus can support."
                />
                <p>
                  Counting the company each word keeps, with the same window of
                  two positions the fit used, gives the explanation and
                  overturns the obvious guess along the way.{" "}
                  <em>sail</em> and <em>rope</em>, at a cosine of 0.9825, never
                  occur within two positions of each other anywhere in the
                  twenty-four documents, so their direct company is exactly 0.
                  What they do share is the company they each keep with{" "}
                  <em>crew</em> and <em>deck</em>. Meanwhile <em>sail</em> and{" "}
                  <em>boat</em> do occur together, twice, and still come out at
                  0.3638, because <em>boat</em>&rsquo;s heaviest company is{" "}
                  <em>harbour</em> and <em>anchor</em>, neither of which{" "}
                  <em>sail</em> ever meets in these texts.
                </p>
                <SharedCompany />
                <p className="text-sm text-slate-500 dark:text-slate-400">

                  The company each word of the pair keeps, with the words both
                  of them were seen beside picked out in color. Switch to{" "}
                  <span className="font-mono">sail and boat</span> and watch the
                  direct count go up while the cosine goes down.
                </p>
                <p>A high cosine does not necessarily mean that two words occurred next to one another. Similar contexts can place their vectors in similar directions even if the words never co-occurred. In this example, the evidence concerns patterns of usage. Whether those patterns represent the kind of meaning needed for a later task still requires evaluation.</p>
                <KeepInMind>
                  {"In these examples, similar context patterns can produce a high cosine even without direct co-occurrence. The selected pairs illustrate that mechanism; two comparisons alone do not establish clean separation across every word in both topics."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. How alike two named words are">
                <p>
                  We can also compare a particular pair of words without searching the whole vocabulary. The similarity is calculated from their two vectors. With the same scoring rule and fixed scale, we can compare that value with scores for other pairs. This smaller calculation is useful inside systems that already know which candidates they need to evaluate.
                </p>
                <p>
                  {"Oven and bake score 0.9267, while sail and flour score 0.0661. Both use the same formula and vector table. A threshold may help a downstream task, but it needs evaluation: the same cosine value need not have the same relevance for every kind of word or query."}
                </p>
                <KeepInMind>
                  {"For a known pair, calculate the dot product and both lengths. This is cheaper than ranking the whole vocabulary. Compare the resulting scores under a common protocol, then check whether they distinguish the relationships needed by the task."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Questions the table cannot answer">
                <p>
                  {"Kettle has no row in this vocabulary, so this lookup cannot return a fitted vector for it. A system may reject the word, use an unknown-word row, or construct a representation from smaller pieces. Each option changes what the returned result means."}
                </p>
                <p>
                  {"A zero vector has no direction, so its cosine is undefined. This implementation rejects that comparison and omits zero vectors from neighbor candidates. A different system could return a documented fallback, but that value would not be a measured right angle."}
                </p>
                <UnanswerableQuestions />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Each row is a question put to one of the two tables. Some have
                  an answer and some do not, and the ones that do not are
                  undefined rather than merely awkward.
                </p>
                <KeepInMind>
                  {"A missing vocabulary row and an undefined cosine need different handling. State whether the system rejects them or substitutes a fallback so callers can interpret the result."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What all of this costs">
                <>
                  <p>
                    A dense embedding table stores one row per word and one value per
                    coordinate.
                  </p>
                  <Equation>{"example table = 23 words × 4 coordinates = 92 values\nlarger table = 50,000 × 300 = 15,000,000 values"}</Equation>
                  <p>
                    Compared with storing one ID per word, the number of coordinates
                    determines the storage multiplier. Increasing the vocabulary does
                    not reduce that multiplier.
                  </p>
                </>
                <p>This nearest-neighbor query compares the word with all 22 other entries before ranking them. The implementation performs a full scan. Indexing methods can reduce the later search work for larger collections, but the present result comes from those explicit comparisons. Checking whether two IDs name the same entry is a different task: it needs one equality comparison and supplies no ranking of similar words.</p>
                <NumberTable
                  headings={["question", "what it costs here"]}
                  rows={[
                    ["are these two the same word", "one comparison, exact"],
                    ["how alike are these two words", "one dot product and two lengths"],
                    ["which words are nearest this one", "22 scores, then a sort"],
                    ["holding the table at all", "92 numbers rather than 23"],
                  ]}
                />
                <KeepInMind>
                  Positions cost four times the storage on this corpus and turn
                  a lookup into a scan of the whole vocabulary. What they buy is
                  the two questions in the middle rows, which the numbering
                  scheme cannot be asked at all.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. An Analogy As Arithmetic",
          content: (
            <>
              <SubSection title="15. What the analogy claims">
                <p>
                  The observation that made these tables famous is about
                  differences between positions. If the step from one word
                  to a second word is much the same step as the one from a third
                  word to a fourth, then taking the first word, undoing the
                  first step and applying it to the third should land near the
                  fourth. Written as a sentence, that is the claim that the
                  difference between two positions can stand for a relation
                  between two words.
                </p>
                <p>
                  {"This fitting procedure does not directly train on analogy questions. Parallel differences sometimes emerge from learned context patterns, but their accuracy depends on the representation and the relation being tested. We will try the same arithmetic on a designed drawing and on the fitted corpus."}
                </p>
                <Equation>
                  {"answer ≈ nearest word to  (first + third − second)"}
                </Equation>
                <KeepInMind>
                  An analogy is the claim that a relation is a difference
                  between positions. It is an empirical property of a fitted
                  table rather than something the fitting procedure was asked
                  to produce.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Unit vectors, and why they are used">
                <p>
                  {"Here the three input vectors are normalized to unit length before addition and subtraction. Levy and Goldberg call the cosine-based analogy criterion 3CosAdd in their 2014 analysis of the earlier word-vector arithmetic. Normalization lets each term contribute a direction without its original magnitude setting the weight."}
                </p>
                <p className="text-sm"><a className="underline underline-offset-4" href="https://aclanthology.org/W14-1618/">{"Levy and Goldberg: Linguistic Regularities in Sparse and Explicit Word Representations (2014)"}</a></p>
                <p>
                  {"Adding raw vectors would retain their different magnitudes. Since the analogy here is defined in terms of cosine directions, normalize the three inputs before combining them. This removes one source of unequal weighting; it does not guarantee a useful answer."}
                </p>
                <Equation>
                  {"q = first/‖first‖ − second/‖second‖ + third/‖third‖"}
                </Equation>
                <KeepInMind>
                  Each word of the question is reduced to length one before the
                  addition, so that the three contribute equally and the answer
                  cannot be decided by whichever of them is longest.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Follow the king, man and woman analogy in the drawing" id="17-the-sketch-worked-all-the-way-through">
                <p>
                  The five-word drawing is small enough to follow every step, so
                  let us put the famous question to it. What is to{" "}
                  <em>woman</em> as <em>king</em> is to <em>man</em>? The three
                  positions are (1, 0), (0, 1) and (0, 3), and their lengths are
                  1, 1 and 3.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="what it gives, and why"
                  rows={[
                    {
                      expression: "king / 1 = (1, 0)",
                      reason: "already of length one, so dividing changes nothing.",
                    },
                    {
                      expression: "man / 1 = (0, 1)",
                      reason: "also already of length one.",
                    },
                    {
                      expression: "woman / 3 = (0, 1)",
                      reason: "here the division matters. woman sits three times as far out as man, and after normalizing the two are the same arrow, which is the sketch saying they differ only in how far along one direction they lie.",
                    },
                    {
                      expression: "(1, 0) − (0, 1) + (0, 1) = (1, 0)",
                      reason: "the subtracted and added arrows cancel exactly, leaving the direction king pointed in, at a length of 1.0000.",
                    },
                    {
                      expression: "nearest to (1, 0), question words struck out",
                      reason: "queen, at a cosine of 1.0000, since queen is the only other word lying along that direction.",
                    },
                  ]}
                />
                <AnalogyWorkbench space="sketch" initial={["king", "man", "woman"]} />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Every intermediate of the calculation, on the drawing. Untick
                  the switch to see what the next step is about.
                </p>
                <KeepInMind>
                  On the sketch the arithmetic is exact. The sum comes to
                  (1, 0), and the only word left in the running that lies along
                  that direction is <em>queen</em>, at a cosine of 1.0000.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Why the question words are kept out of the running">
                <p>
                  {"Without excluding the question words, king ties with queen at cosine 1 in this drawing. The implementation’s tie ordering returns king first. That candidate is one of the supplied words, so it does not answer the intended analogy question."}
                </p>
                <p>The first positive word contributes its full unit vector to the analogy sum, while the added and subtracted vectors can partly cancel. That can place a query word itself near the resulting direction. Excluding the question words changes the candidate set, so the comparison below measures how often that exclusion changes the selected answer.</p>
                <p>
                  Among the 10,626 ordered triples of these twenty-three words, the top answer without exclusion is one of the question&apos;s own words in 4,118 cases, a share of 0.3875. That happens often in this experiment, but it does not happen for every triple.
                </p>
                <p>
                  The split within those 4,118 is the more interesting half.
                  4,048 of them return one of the two words that were added and
                  only 70 return the word that was subtracted, which is what the
                  arithmetic predicts, since subtracting a word&rsquo;s
                  direction pushes the sum away from it rather than towards it.
                </p>
                <ExclusionSweepPanel />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The bar is every question asked without exclusion, split by
                  what came back. The three rows underneath are single questions
                  asked both ways.
                </p>
                <KeepInMind>
                  Leaving the question words in the running returns one of them
                  in 4,118 of 10,626 questions here, and almost all of those are
                  words that were added and not the one subtracted. The
                  exclusion belongs to how the analogy is evaluated and not to
                  the arithmetic, and dropping it changes 39% of the answers.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The same question on the documents">
                <p>
                  The sketch was built so the analogy would work. The documents
                  were not, and putting the same machinery to them is where the
                  claim gets tested. The corpus has a parallel structure by
                  construction, since each topic steps through its ten words in
                  the same cycle, so <em>flour</em> occupies the position in
                  cooking that <em>sail</em> occupies in sailing, and{" "}
                  <em>sugar</em> the position that <em>wind</em> does. The
                  question &ldquo;what is to <em>sugar</em> as <em>sail</em> is
                  to <em>flour</em>&rdquo; therefore has a designed answer,
                  which is <em>wind</em>.
                </p>
                <p>
                  {"The nearest result is rope, followed by deck and mast; wind is absent from the first three. These are sailing words, but the intended correspondence within the constructed cycle is not recovered. This test demonstrates a failed analogy, without identifying corpus size alone as its cause."}
                </p>
                <AnalogyWorkbench
                  space="documents"
                  initial={["sail", "flour", "sugar"]}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same calculation on the fitted table. The topic transfers
                  and the position within the topic does not.
                </p>
                <KeepInMind>
                  {"The corpus-based analogy reaches the intended topic but misses the intended word. Keep both observations when judging what this representation supports."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "A high cosine between two words means the texts often used them near each other.",
              false,
              "sail and rope score 0.9825 and never occur within two positions of each other anywhere in the twenty-four documents, so their direct company is exactly 0. What they share is the company they each keep with crew and deck. Two words are placed together when they are used in the same kind of position, whether or not they were ever used in the same breath.",
            ),
            choice(
              "sail and boat do occur together twice and still score only 0.3638. Why?",
              [
                "Two occurrences are too few for the window of two positions to notice",
                "boat is a rarer word, so its position is longer and the cosine is charged for that",
                "The heaviest company boat keeps is harbour and anchor, neither of which sail ever meets in these texts",
                "boat belongs to neither topic, so it sits between the two caps",
              ],
              2,
              "The two direct co-occurrences are only part of the context evidence. Boat is associated with harbour and anchor, while sail has different nearby-word patterns in this constructed corpus. Their full vectors therefore need not point in the same direction. Direct co-occurrence can affect a fitted representation without being the same quantity as cosine similarity.",
            ),
            several(
              "Which of these questions has no answer on this table?",
              [
                              "The position of kettle, a word the texts never contained",
                              "The cosine between a word and a position sitting exactly at the origin",
                              "The cosine between two words that never once occurred together",
                              "The cosine between a cooking word and a sailing word",
                            ],
              [0, 1],
              "An absent vocabulary word has no stored row to retrieve. A zero vector also has no defined cosine direction, which this SDK reports as an invalid comparison. The other examples have defined values: 0.9825 for a pair that never directly co-occurred and −0.0518 for sail against oven. A low or negative similarity is different from a missing representation or an undefined comparison.",
              {
                "description": "This is a fixed word lookup table without an unknown-word row. Every listed cooking and sailing word has a nonzero vector. Kettle is absent. Pairs need not have occurred together to have separately learned vectors."
              },
            ),
            choice(
              "Why are the three words of an analogy question struck out before the answer is read?",
              [
                "Their cosines against the sum are undefined, so they cannot be ranked",
                "Left in, one of them takes first place in 4,118 of the 10,626 questions, nearly always one of the two that were added",
                "The arithmetic cannot be carried out until they are removed",
                "They are the three longest words in the table, and length would decide the answer",
              ],
              1,
              "In the measured query sweep, leaving question words eligible changes about 39 percent of selected answers. Of the 4,118 affected results,4,048 choose a positive term and 70 a negative term. The vector sum contains those query terms, so one can remain closest when the other contributions partly cancel. Excluding them is a candidate-selection policy for this evaluation, not part of vector addition itself.",
            ),
            trueFalse(
              "The analogy what is to sugar as sail is to flour carries the topic across and misses the designed answer, which is wind.",
              true,
              "The result ranks rope, deck and mast first, with similarities 0.7847,0.7323 and 0.7210. Those are sailing words, but the intended wind is eleventh. The trained representation therefore supports the broad topic shift without reproducing this proposed within-topic analogy. The construction of the corpus does not force the fitting objective to preserve every intended relation.",
            ),
        ],
        },
        {
          title: "Part 5. No Coordinate Means Anything On Its Own",
          content: (
            <>
              <SubSection title="20. Turning the whole table">
                <p>
                  {"Rotate every word vector in the plane of its first two coordinates. Those two coordinates generally change; the remaining two stay fixed. We can then compare the lengths, cosines and neighbor lists before and after the rotation."}
                </p>
                <p>
                  {"At a quarter turn, sail’s first coordinate changes from 0.5369 to −0.5223. In exact arithmetic, the rotation preserves lengths and pairwise cosines. Here the largest measured cosine difference is below 1e−15, consistent with floating-point rounding. All 23 words retain the same top neighbor."}
                </p>
                <SpaceRotation word="sail" />
                <p className="text-sm text-slate-500 dark:text-slate-400">

                  Drag the slider and watch the top row of dots become the
                  bottom row. The two panels at the bottom hold the neighbor
                  lists before and after, and they do not change.
                </p>
                <WhyThisWorks title="Why rotating every vector preserves their comparisons">
                  A rotation preserves every dot product, so it preserves every
                  length, which is a dot product of a vector with itself, and
                  every cosine, which is built from three dot products. Since the
                  whole content of the table as far as our questions are
                  concerned is its dot products, the turned table answers every
                  question identically to the original one.
                </WhyThisWorks>
                <KeepInMind>
                  Turning the space moves every coordinate a long way and moves
                  no answer at all, the largest change in any of the 253 cosines
                  being below 1e-15.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What that rules out">
                <p>
                  {"The rotated table preserves the dot-product geometry used by these queries. Coordinates are therefore not uniquely determined by those comparisons: multiple coordinate systems can describe them. That does not mean a fitting algorithm cannot choose a particular basis."}
                </p>
                <p>
                  {"A coordinate’s interpretation depends on the basis. Before comparing independently fitted vectors coordinate by coordinate, establish a common basis or align the spaces. Without that step, an apparent coordinate change can come from orientation as well as a changed relationship."}
                </p>
                <p>

                  The full neighbor ordering survives the rotation for 21 of the 23 words. In the other two lists, a pair swaps places even though its cosines agree to sixteen digits. This is sensitivity in the ordering of effectively tied results, rather than a meaningful change in the underlying geometry.
                </p>
                <KeepInMind>
                  {"Pairwise comparisons survive a shared orthogonal rotation. Interpret raw coordinates within their fitted basis, and account for alignment before comparing them across fits."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where One Position Per Word Stops Being Enough",
          content: (
            <>
              <SubSection title="22. A word that means two things">
                <p>
                  {"One stored vector per spelling cannot choose a different representation for each occurrence. If a word appears in unrelated contexts, all of those uses influence the same fitted row. It may favor one sense or combine patterns from several; it is not forced to lie exactly between two sense groups."}
                </p>
                <p>The constructed documents originally contain no shared ambiguous content word. For this comparison, every cooking use of pan and every sailing use of rope is replaced with sheet. A sheet can name a baking tray or a rope controlling a sail. The rest of the documents and the fitting procedure stay fixed, so we can inspect what one stored vector does when the same spelling occurs in both topic contexts.</p>
                <SenseCollision />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  What the merged spelling is now nearest, against what the two
                  words it replaced were nearest when they were separate.
                </p>
                <p>
                  {"In the merged corpus, sheet’s best neighbor scores 0.8635. Its mean cosine is 0.3504 to cooking words and 0.4318 to sailing words. The neighbor list contains both topics. These measurements show how merging the spellings changes this representation, while the static row still cannot select a sense for an individual occurrence."}
                </p>
                <KeepInMind>
                  {"Merging two uses into one vocabulary entry changes its context evidence. A static vector represents that shared entry; selecting a sense from the surrounding sentence requires additional context-dependent processing."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Two fits of one corpus cannot be compared number by number">
                <p>
                  {"Independent fits need not use aligned axes, even when they encode similar relationships. Compare rotation-invariant quantities or align the spaces before using coordinates directly. A deterministic fit may reproduce its coordinates; disagreement is a possibility rather than a requirement."}
                </p>
                <p>
                  {"For a separate experiment, fit the same documents twice with a randomly initialized method and change only the seed. Both runs give higher mean within-topic similarity than across-topic similarity. Their raw coordinates also differ. Those coordinate differences combine possible changes in orientation with changes in the learned geometry."}
                </p>
                <TwoFitsCompared />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same texts fitted twice from different starts. Both found
                  the topics; neither agrees with the other about where anything
                  is.
                </p>
                <p>The two fits share 28 of the 69 nearest-word positions, and the second separates the constructed topics more strongly. Their learned relationships differ as well as their coordinate axes. With only twenty-four documents, initialization can affect the fitted result. Even if the neighbor rankings had agreed, however, that would not make individual coordinates comparable without accounting for transformations of the representation.</p>
                <KeepInMind>
                  {"Cosines provide one way to compare relationships across these fits without assuming aligned axes. Alignment methods offer another route when the coordinates themselves need to be compared. Neither removes genuine differences in what the runs learned."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A corpus’s habits become the model’s opinions">
                <p>
                  {"Context-based vectors summarize patterns in the training text. Those patterns can include deliberate topic structure, uneven coverage or stereotypes. A vector comparison reports an association under that representation; it does not independently verify a claim about the world."}
                </p>
                <p>
                  {"The low sail–boat similarity follows the context patterns in these constructed documents. It differs from a broad English-language judgment of relatedness. Inspecting the source contexts helps explain the discrepancy; a downstream application should not interpret the score as a verified statement about English."}
                </p>
                <p>A larger corpus can replace the patterns we deliberately put into this small example with patterns in its authors&apos; writing. Some of those patterns may reflect stereotypes or imbalanced coverage. A model can reproduce them in similarity results even when nobody gave it a rule about the affected groups. We therefore need to inspect the behavior of the representation on the task where we intend to use it.</p>
                <p>The association is represented through relationships among vectors. Editing one coordinate is not a general repair: we can rotate the whole space without changing its similarities, so that coordinate has no fixed meaning. Proposed repairs need checks on the affected comparisons and on the useful relationships they might also change.</p>
                <DerivationTable
                  expressionHeading="Word or vector condition"
                  reasonHeading="What can be compared"
                  rows={[{"expression":"a word the texts never contained","reason":"it has no position, because a position is what the fit inferred from that word’s contexts and there were none. There is a real choice attached, since a table may reserve one row for everything it has not seen, and the cost of doing so is that every unseen word is then declared identical to every other unseen word."},{"expression":"a position sitting exactly at the origin","reason":"it has no direction, so the angle between it and anything else does not exist. Answering zero would claim it stands at right angles to every word in the vocabulary, which is a much stronger statement than the truth, so the comparison is undefined rather than merely awkward."},{"expression":"an analogy whose words cancel exactly","reason":"If the normalized terms sum to zero, cosine has no query direction. In the drawing, king minus queen cancels after normalization. Reject it or use a documented alternative rather than rank an undefined cosine."},{"expression":"one spelling used for two unrelated things","reason":"A static row combines context evidence from the spelling’s uses. It may reflect a dominant sense or several senses; no theorem forces it to a midpoint. In this experiment, sheet’s best neighbor scores0.8635."},{"expression":"asking which coordinate means what","reason":"A coordinate may correlate with a named feature, but that interpretation depends on the chosen basis. Rotating this space changes coordinates while preserving the dot-product comparisons."},{"expression":"comparing two tables coordinate by coordinate","reason":"Independent fits may have different orientations and different learned relationships. Align the spaces or compare suitable invariant quantities before interpreting raw coordinate changes."},{"expression":"asking whether an answer is true rather than usual","reason":"Context association does not independently verify truth. Improve the data or objective, adapt the representation, or change how the application uses it, then evaluate the affected behavior."}]}
                />
                <KeepInMind>
                  {"An embedding records associations under its data and objective. It can be updated or adapted, but editing one coordinate is not a general repair for an unwanted association. Evaluate the resulting behavior and any useful relationships the change also affects."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "Editing one arbitrarily chosen coordinate is a guaranteed way to repair an unwanted learned association without changing useful word relationships.",
              false,
              "The coordinates have no fixed dictionary meanings: rotating the whole space preserves the comparisons. An arbitrary coordinate edit can change several relationships and does not guarantee the intended repair. A proposed change needs checks on the affected comparisons and on useful behavior elsewhere. This does not mean that changing or retraining representations is impossible.",
            ),
            choice(
              "One thing does change under the turn. What is it, and why is it not a contradiction?",
              [
                "The lengths of the longest words move slightly, because rotation is only approximate in floating point",
                "The full neighbor ranking survives for 21 of the 23 words, and the two exceptions swap words whose cosines are equal to sixteen digits",
                "Two words change their nearest word, because their positions crossed during the turn",
                "The cosines between words of different topics move, because those are the smallest and so the least stable",
              ],
              1,
              "The shared rotation changes coordinate values while preserving dot products and vector lengths. Across 253 pairs, the largest measured cosine change is below 1e−15, even though sail's first coordinate moves from 0.5369 to −0.5223. All 23 nearest-word identities remain unchanged. Tiny numerical differences can still affect effectively tied rankings, which is why a tie policy should be explicit.",
            ),
            several(
              "Which readings are unjustified when separate word tables have not been aligned?",
              [
                              "Automatically treating an arbitrary coordinate as a named feature without additional evidence",
                              "Comparing a word’s third coordinate in one table against its third coordinate in another",
                              "Adding one table’s position for a word to another table’s position for it",
                              "Comparing two words by cosine within a single table",
                            ],
              [0, 1, 2],
              "A coordinate describes an axis chosen by this fit, rather than an automatically named feature. Two unaligned fits need not attach the same direction to coordinate three. Cross-fit addition is numerically possible, but its interpretation needs a common coordinate system. Cosines between two words within either table survive a shared rotation.",
              {
                "description": "Rotate every vector within one table by the same orthogonal rotation. Its within-table cosines stay the same. Separate fits can choose different orientations; no alignment between their axes has been supplied."
              },
            ),
            choice(
              "Every use of pan in the cooking texts and of rope in the sailing texts was respelled sheet. What did the fit then report?",
              [
                "sheet took two positions, one per sense",
                "sheet reached only 0.8635 against its best neighbor, and its pull towards the two topics became nearly equal",
                "sheet was left out of the table, since its company was contradictory",
                "sheet kept pan’s position, since cooking words are commoner in the corpus",
              ],
              1,
              "The replacement gives sheet one row for contexts previously assigned to pan and rope. Its nearest score is 0.8635, and its neighbors mix the two constructed topics. Its mean similarities to cooking and sailing words are 0.3504 and 0.4318; dough has 0.4015 to cooking and 0.1481 to sailing. One stored vector summarizes both uses. That ambiguity does not make the fitting calculation invalid or automatically trigger an error.",
            ),
            trueFalse(
              "Two fits of the same twenty-four documents from different random starts disagreed about the coordinates but agreed about the neighbor lists.",
              false,
              "The two fitted tables share 28 of 69 nearest-word positions, and the second separates these topics more strongly. Their relationships differ as well as their coordinate axes. This finite fitting experiment is sensitive to initialization; the observed difference is not explained away merely by rotating one coordinate system. Evaluate stability as well as whether either fit recovers the intended topic pattern.",
            ),
        ],
        },
        {
          title: "Practice. Asking The Table With The Library",
          practice: [
            exercise(
              "Fit the twenty-four documents and stand at sail",
              [
  "Fit PointwiseMutualInformationEmbeddings on the supplied twenty-four documents with window=2 and four dimensions. This uses observed context counts to build the word table.",
  "Print vocabulary size and vector width, sail’s coordinates, its five nearest words and the six supplied pairwise cosines, each to four decimal places. Keep pair order as supplied."
],
              `from oop_ml.core.natural_language_processing.embeddings import (
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

pairs = [
    ("sail", "rope"),
    ("sail", "boat"),
    ("sail", "flour"),
    ("sail", "oven"),
    ("oven", "bake"),
    ("boat", "harbour"),
]

# Fit the embedder with window=2 and dimension=4 and keep its embeddings.
# Print n_words and dimension, the values of vector_of("sail") rounded to
# four places, and the word and similarity of each of most_similar("sail").

# For each pair, print the two words and their similarity to four places.`,
              `from oop_ml.core.natural_language_processing.embeddings import (
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

pairs = [
    ("sail", "rope"),
    ("sail", "boat"),
    ("sail", "flour"),
    ("sail", "oven"),
    ("oven", "bake"),
    ("boat", "harbour"),
]

space = PointwiseMutualInformationEmbeddings(window=2, dimension=4).fit(documents).embeddings
print(f"{space.n_words} words, {space.dimension} numbers each")
print(f"sail = {[round(float(value), 4) for value in space.vector_of('sail').values]}")
for neighbour in space.most_similar("sail", n_results=5):
    print(f"  {neighbour.word:5s} {neighbour.similarity:.4f}")

for first, second in pairs:
    print(f"{first} and {second}: {space.similarity(first, second):.4f}")`,
              `23 words, 4 numbers each
sail = [0.5369, 0.5223, 0.269, -0.2075]
  rope  0.9825
  mast  0.9445
  deck  0.9421
  crew  0.9361
  and   0.6946
sail and rope: 0.9825
sail and boat: 0.3638
sail and flour: 0.0661
sail and oven: -0.0518
oven and bake: 0.9267
boat and harbour: 0.9919`,
              { hints: [
  "Fit the provided documents, then use the model’s embeddings table for word lookups and comparisons.",
  "most_similar returns neighbors with word and similarity. similarity compares the two named words."
], check: numberCheck("What is the cosine between boat and harbour, to four places?", 0.9919, 5e-05, "Boat and harbour score 0.9919. Their similar neighbors in this deliberately cyclic training corpus make their fitted directions similar."), question: "Which words acquire similar vectors from their surrounding words?" },
            ),
            exercise(
              "Rank by the angle and by the ruler",
              [
  "Using the same fitted table, compare sail with rope, mast, deck and crew. Print cosine similarity, Euclidean distance and neighbor-vector length to four decimal places.",
  "Then double rope’s coordinates and print its cosine and Euclidean distance to the unchanged sail vector. This changes magnitude while retaining direction."
],
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)
from oop_ml.core.natural_language_processing.embeddings.vectors import (
    cosine_similarity,
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
sail = np.asarray(space.vector_of("sail").values)

# For rope, mast, deck and crew, take the word's values as an array and
# print space.similarity("sail", word), the norm of sail minus the array,
# and the norm of the array.

# Double rope's array. Print cosine_similarity(sail, doubled) and the norm
# of sail minus doubled.`,
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)
from oop_ml.core.natural_language_processing.embeddings.vectors import (
    cosine_similarity,
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
sail = np.asarray(space.vector_of("sail").values)

for word in ("rope", "mast", "deck", "crew"):
    other = np.asarray(space.vector_of(word).values)
    cosine = space.similarity("sail", word)
    print(f"{word}: cosine {cosine:.4f}, gap {np.linalg.norm(sail - other):.4f}, length {np.linalg.norm(other):.4f}")

doubled = 2 * np.asarray(space.vector_of("rope").values)
print(f"rope doubled: cosine {cosine_similarity(sail, doubled):.4f}")
print(f"rope doubled: gap {np.linalg.norm(sail - doubled):.4f}")`,
              `rope: cosine 0.9825, gap 0.3046, length 1.0713
mast: cosine 0.9445, gap 0.2750, length 0.8281
deck: cosine 0.9421, gap 0.4759, length 1.1628
crew: cosine 0.9361, gap 0.4691, length 1.1392
rope doubled: cosine 0.9825
rope doubled: gap 1.3433`,
              { hints: [
  "Compute each norm separately from the distance between vectors.",
  "Cosine divides out vector lengths. Euclidean distance retains the effect of doubling one vector."
], check: numberCheck("How far is sail from rope with its coordinates doubled, to four places?", 1.3433, 5e-05, "The doubled rope vector is 1.3433 from sail. Its direction is unchanged, so cosine stays fixed while Euclidean distance responds to its greater magnitude."), question: "Why can cosine and ordinary distance choose different neighbors?" },
            ),
            exercise(
              "Put the designed analogy to the table",
              [
  "Use the fitted table’s analogy method to add sail and sugar and subtract flour. Rank the twenty remaining vocabulary words, excluding the three query terms.",
  "Print the first five candidates with cosines, then wind’s one-based rank and score. The corpus was designed to pair these words, but inspect the returned ranking rather than assuming the intended answer wins."
],
              `from oop_ml.core.natural_language_processing.embeddings import (
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

# Call space.analogy with the words to add, the words to subtract and
# n_results=20. Print the word and similarity of the first five answers.

# Find where wind sits in the ranked words, counting the first as 1, and
# print that place with wind's similarity to four places.`,
              `from oop_ml.core.natural_language_processing.embeddings import (
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

ranked = space.analogy(["sail", "sugar"], ["flour"], n_results=20)
for answer in list(ranked)[:5]:
    print(f"{answer.word:5s} {answer.similarity:.4f}")

words = list(ranked.words)
place = words.index("wind") + 1
print(f"wind came in at place {place} of {len(words)}")
print(f"wind scored {ranked[place - 1].similarity:.4f}")`,
              `rope  0.7847
deck  0.7323
mast  0.7210
crew  0.6895
the   0.5441
wind came in at place 11 of 20
wind scored 0.4474`,
              { hints: [
  "Pass the positive and negative word lists in the API’s declared form.",
  "Keep the complete ranked result to find wind’s position after printing its first five entries."
], check: numberCheck("At what place does wind come in the ranking of twenty?", 11, 0.0, "Wind ranks eleventh. The analogy’s intended relationship is not guaranteed by a small context-trained table, even when the corpus was designed to suggest it."), question: "Does the deliberately paired corpus support the proposed vector analogy?" },
            ),
            exercise(
              "Turn the whole table and ask again",
              [
  "Use the starter’s rotation matrix to rotate the first two coordinates of every word vector by ninety degrees, then thirty degrees. Wrap each rotated table in WordEmbeddings with the unchanged vocabulary.",
  "Print sail’s new first coordinate, maximum change in any distinct word-pair cosine and the number of words retaining their nearest neighbor. Use the same original table for both rotations."
],
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)
from oop_ml.core.natural_language_processing.embeddings.vectors import (
    WordEmbeddings,
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

for degrees in (90, 30):
    angle = np.radians(degrees)
    turn = np.eye(4)
    turn[:2, :2] = [[np.cos(angle), np.sin(angle)], [-np.sin(angle), np.cos(angle)]]
    # Build the turned table as space.table @ turn and wrap it in a
    # WordEmbeddings with space.vocabulary. Print sail's first coordinate
    # there, the largest difference between the two tables' similarity over
    # every pair of words, and how many words have the same most_similar
    # word in both.
    ...`,
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings import (
    PointwiseMutualInformationEmbeddings,
)
from oop_ml.core.natural_language_processing.embeddings.vectors import (
    WordEmbeddings,
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

for degrees in (90, 30):
    angle = np.radians(degrees)
    turn = np.eye(4)
    turn[:2, :2] = [[np.cos(angle), np.sin(angle)], [-np.sin(angle), np.cos(angle)]]
    turned = WordEmbeddings(space.vocabulary, np.asarray(space.table) @ turn)
    pairs = [(a, b) for place, a in enumerate(words) for b in words[place + 1 :]]
    change = max(abs(space.similarity(a, b) - turned.similarity(a, b)) for a, b in pairs)
    kept = sum(space.most_similar(w, n_results=1).words == turned.most_similar(w, n_results=1).words for w in words)
    print(f"{degrees} degrees: sail's first coordinate {turned.vector_of('sail').values[0]:.4f}")
    print(f"  largest change in a cosine over {len(pairs)} pairs: {change:.1e}")
    print(f"  words keeping their nearest word: {kept} of {len(words)}")`,
              `90 degrees: sail's first coordinate -0.5223
  largest change in a cosine over 253 pairs: 2.2e-16
  words keeping their nearest word: 23 of 23
30 degrees: sail's first coordinate 0.2038
  largest change in a cosine over 253 pairs: 4.4e-16
  words keeping their nearest word: 23 of 23`,
              { hints: [
  "Apply the same matrix to every vector; rotating only one word would change its relationships.",
  "An orthogonal rotation preserves dot products and lengths. Small residual differences can come from floating-point arithmetic."
], check: numberCheck("What is sail’s first coordinate after a turn of thirty degrees, to four places?", 0.2038, 5e-05, "The new coordinate is 0.2038, while all cosine relationships remain unchanged up to rounding. The common rotation changes axes without changing relative geometry."), question: "Can individual coordinates change while all cosine relationships remain the same?" },
            ),
          ],
        },
      ]}
    />
  );
}
