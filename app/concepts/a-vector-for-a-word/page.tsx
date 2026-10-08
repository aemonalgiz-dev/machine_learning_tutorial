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

export const metadata: Metadata = {
  title: "A Vector for a Word · oop_ml",
  description:
    "A token's ID tells us which word it identifies, but not how that word relates to another. A vector gives us several numerical coordinates whose learned relationships can support useful comparisons.",
};

export default function WordVectorPage() {
  return (
    <ConceptPage
      lessonId="a-vector-for-a-word"
      intuition={lessonIntuitions["a-vector-for-a-word"]}
      technicalStart="Part 2. Nearness Measured As An Angle"
      openingTitle="A Word's ID Cannot Tell Us What It Resembles"
      playgroundIntro="Compare the nearest vectors for a selected word. Inspect both the similarity values and the source text that gave those relationships meaning."
      title="A Vector for a Word"
      tagline={"A token's ID tells us which word it identifies, but not how that word relates to another. A vector gives us several numerical coordinates whose learned relationships can support useful comparisons."}
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
                  A tokenizer finishes by handing every piece of text a number,
                  and that number is a name. It says which row of a lookup table
                  the word lives in, so we can check whether two pieces of text
                  are the same piece of text, and that is genuinely all it
                  promises. Nothing about the numbers being ordered makes the
                  words ordered, and nothing about two numbers being close makes
                  the words close, which is easy to say and worth measuring
                  before we accept it.
                </p>
                <p>
                  The corpus this page works on is twenty-four short documents, twelve of them about cooking and twelve about sailing, and they hold twenty-three distinct words between them. The numbers are dealt out commonest first, so a number does carry exactly one fact about a word, which is roughly how common it was. What it does not carry is anything about what the word means.
                </p>
                <p>
                  Over all 253 pairs of words, the correlation between how far apart two words&rsquo; numbers are and how alike they later turn out to be is &minus;0.0852, which is small enough that the scatter of those pairs shows no slope at all.
                </p>
                <WordSphere />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Every word of the table is a direction, drawn on the sphere
                  those directions live on. Coloured by subject the words fall
                  into two caps on opposite sides. Coloured by token number,
                  which is the same twenty-three dots in the same places, the
                  colours are scattered over the whole sphere, because the
                  number a word was dealt says nothing about where it ended up.
                </p>
                <KeepInMind>
                  A token number answers one question, whether two pieces of
                  text are the same. Every other question we might want to ask
                  about a word, and in particular whether it resembles another
                  one, is unanswerable from the number alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Twenty-four documents, and twenty-three words">
                <p>
                  The corpus is a design and not a piece of prose, and
                  saying so early saves confusion later. Each document is six
                  words long, each topic is spelled from ten words of its own,
                  and the two topics share only the words <em>and</em>,{" "}
                  <em>the</em> and <em>we</em>, one per document. Within a topic
                  the documents step through the ten words in a cycle, so that
                  every topic word keeps the same kind of company as every other
                  one. A cooking document reads{" "}
                  <span className="font-mono">
                    oven bake stir the whisk dough
                  </span>{" "}
                  and a sailing document reads{" "}
                  <span className="font-mono">
                    harbour anchor and tide mast rope
                  </span>
                  .
                </p>
                <p>
                  The reason to use something so plain is that we have to be
                  able to judge the answers. When the page reports that{" "}
                  <em>sail</em> came out near <em>rope</em> and far from{" "}
                  <em>oven</em>, that is checkable against the texts in a way
                  that a result on a corpus of a billion words is not, and where
                  the design produces an answer a reader would not have
                  predicted the page says so instead of quietly choosing a
                  different example.
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
                  caption="Eight of the twenty-three, in the order the numbers were dealt out. Neighbouring numbers land in different topics as readily as in the same one."
                />
                <KeepInMind>
                  Twenty-four documents, twenty-three words, and a vocabulary
                  ordered by how often each word was used. Every number on this
                  page comes from this one corpus unless it says otherwise.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A position instead of a number">
                <p>
                  Replace each word&rsquo;s single number with several numbers,
                  and read those numbers as coordinates. The word is then a
                  point somewhere, and points can be compared in ways names
                  cannot, since two points have a direction from one to the
                  other and an amount of separation between them. That is the
                  whole idea, and everything the rest of the page does is a
                  consequence of it.
                </p>
                <p>
                  How the coordinates are worked out is a separate subject with
                  pages of its own. For the record, the ones used here come from
                  counting how often each pair of words falls within two
                  positions of each other, scoring each pair by how much more
                  often that happened than chance would explain, and squeezing
                  the resulting table down to four numbers per word. Nothing
                  else on this page leans on that choice, and Part 5 turns the
                  whole table to prove it.
                </p>
                <WorkedExample title="Where sail ended up">
                  <p>
                    The word <em>sail</em> has number 13, and it was used six
                    times. Its position is four numbers.
                  </p>
                  <Equation>
                    {"sail = (0.5369, 0.5223, 0.2690, −0.2075)"}
                  </Equation>
                  <p>
                    Twenty-three words at four numbers each is 92 numbers, where
                    the numbering scheme needed 23. The table has to be held for
                    as long as the model is used, so every question the rest of
                    this page asks is asked of four times the storage.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A position is several numbers read together as a point.
                  Storing one costs the number of words times the number of
                  coordinates, which is 92 numbers here.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What one of the four numbers is, and is not">
                <p>
                  It is tempting to look at the first coordinate of{" "}
                  <em>sail</em>, which is 0.5369, and ask what it measures. The
                  answer is that it measures nothing on its own. It is not a
                  score for how nautical a word is, and it does not become one
                  if we line up the words with a large first coordinate and hunt
                  for what they have in common. The coordinates exist so pairs
                  of them
                  can be multiplied together, and what the fit determined was
                  the collection of those products and not the individual
                  numbers.
                </p>
                <p>
                  This is not a philosophical caution, it is a checkable fact
                  about the table, and Part 5 checks it by turning the whole
                  space and watching every coordinate move while every
                  comparison between words stays exactly where it was. Until
                  then it is enough to read a coordinate as a bookkeeping entry
                  and to treat only the comparisons as meaningful.
                </p>
                <KeepInMind>
                  A single coordinate names no property of a word. Only
                  relationships between whole positions carry anything, which is
                  why the next Part is about how to measure one.
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
                <p>
                  Given two points there are two obvious readings of close. One
                  is the ordinary distance between them, the length of the line
                  joining the two points, which is what a ruler would say. The
                  other is the angle between the two arrows drawn from the
                  origin out to each point, which asks whether they lie in the
                  same direction and ignores how far along that direction each
                  one has got.
                </p>
                <p>
                  The two readings genuinely disagree, and the disagreement is
                  not rare or delicate. A word placed far out along a direction
                  and a word placed just a little way along the same direction
                  point identically and sit a long way apart, so the ruler calls
                  them distant and the angle calls them identical. Which of the
                  two we should use depends on which quantity, the direction or
                  the distance from the origin, was the one the fit was
                  determining, and that question has an answer.
                </p>
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
                <p>
                  The angle between two arrows is got from their dot product,
                  which is the sum of the products of matching coordinates,
                  divided by the two lengths. Dividing by the lengths is what
                  removes them from the answer, and what is left is the cosine
                  of the angle, a number between &minus;1 and 1. One means the
                  two arrows point the same way, zero means they are at right
                  angles, and &minus;1 means they point in opposite directions.
                </p>
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
                <p>
                  Three things about that formula are worth stating before we
                  use it. It is symmetric, so the order of the two words does
                  not matter. It is entirely blind to length, so doubling every
                  coordinate of one word changes nothing. And it is undefined
                  when either arrow has no length at all, since a point sitting
                  exactly at the origin has no direction to compare, and the
                  correct behaviour there is to refuse, and never to answer
                  zero, which would falsely report the word as being at right
                  angles to everything.
                </p>
                <WhyThisWorks>
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
                <WorkedExample title="Three cosines, worked">
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
                    <em>man</em> and <em>woman</em>, which point in precisely
                    the same direction, are 2.0000 apart. The ruler and the
                    angle do not merely differ in the fine detail here, they put
                    the pairs in opposite orders.
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
                  neighbour.
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
                    All four products are positive, which is what pointing the
                    same way looks like in coordinates. Every coordinate of{" "}
                    <em>rope</em> sits further from zero than the one it is
                    paired with, and the ruler measures exactly those four
                    differences, which is where its 0.3046 comes from. The
                    cosine divides by 1.0713 and so never charges for them.
                  </p>
                </WorkedExample>
                <AngleAgainstGap word="sail" choices={["sail", "oven", "the", "crew"]} />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same word&rsquo;s neighbours ranked twice. Rows in pink
                  changed place between the two columns, and the length column
                  is where the explanation lives.
                </p>
                <KeepInMind>
                  Standing at <em>sail</em>, the two readings of near disagree
                  about first place, 0.9825 against 0.9445 by angle and 0.2750
                  against 0.3046 by the ruler, and the whole of the difference
                  is that one neighbour is longer than the other.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What a vector’s length carries instead">
                <p>
                  So what is a vector&rsquo;s length a fact about? The usual
                  answer, and the one I expected to be able to report, is that
                  it tracks how often the word was seen, because a common word
                  is adjusted more times during a fit and so drifts further from
                  wherever it started. On this table the relationship is real
                  and runs the other way. The correlation between how often a
                  word was used and how long its vector came out is{" "}
                  &minus;0.6284, which is to say the commoner a word is here,
                  the shorter its position.
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
                  The direction of that correlation is not the point, and it
                  would be a mistake to carry away the number rather than the
                  argument. What matters is that the length is answering a
                  question about the word&rsquo;s frequency and distinctiveness,
                  which is a different question from the one we are asking when
                  we ask whether two words resemble each other, and dividing it
                  out is how we stop it from contributing to an answer it has no
                  business in.
                </p>
                <KeepInMind>
                  Length carries something, and here what it carries is how
                  ordinary a word is, at a correlation of &minus;0.6284 with its
                  use count. Cosine similarity divides it out, which is the
                  argument for using the angle rather than the ruler.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A token number here carries exactly one fact about a word, roughly how common it was.",
              true,
              "The numbers are dealt out commonest first, so the number does record that much. What it does not record is anything about meaning. Over all 253 pairs of words the correlation between how far apart two numbers are and how alike the words turn out to be is −0.0852, which is small enough that the scatter shows no slope at all.",
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
              "The measure is symmetric, and dividing by both lengths is what removes length from the answer. A point at the origin has no direction to compare, so the comparison is undefined. Answering zero there would be a claim that the word stands at right angles to everything, which is a much stronger statement than the truth, and the correct behaviour is to refuse.",
            ),
            choice(
              "Standing at sail, the two readings of near disagree about first place. Which neighbour wins under each?",
              [
                "rope by angle and mast by the ruler",
                "mast by angle and rope by the ruler",
                "rope under both readings",
                "mast under both readings",
              ],
              0,
              "By angle rope leads at 0.9825 against 0.9445 for mast, and by the ruler the order reverses, mast at a gap of 0.2750 against 0.3046 for rope. The whole of the difference is length. sail is 0.8225 long and mast 0.8281, so mast sits at almost the same distance from the origin, while rope at 1.0713 is well beyond it and the ruler charges it for the extra reach.",
            ),
            trueFalse(
              "On this table the more often a word was used, the longer its position came out.",
              false,
              "That is the usual expectation and the measurement runs the other way here, at a correlation of −0.6284 between use count and length. The three commonest words, used eight times each, have the three shortest positions at 0.3708, 0.3667 and 0.5770. A word that turns up beside everything is not surprising beside anything, and these coordinates were scored on surprise.",
            ),
            choice(
              "What is the argument for comparing two words by the angle rather than by the ruler?",
              [
                "The angle is cheaper to compute than the distance",
                "Length is answering a question about how ordinary a word is, which is not the question being asked",
                "The ruler cannot be computed when a word sits at the origin",
                "The ruler is blind to how often a word was used, and the angle is not",
              ],
              1,
              "Length carries something real, and on this table what it carries is frequency and distinctiveness rather than meaning. Dividing it out is how it is stopped from contributing to an answer it has no business in. It is the angle, not the ruler, that fails at the origin, and it is the length the ruler reads that tracks use count, at −0.6284 here, so blindness to frequency is the angle’s property and not the ruler’s.",
            ),
        ],
        },
        {
          title: "Part 3. The Questions A Position Makes Possible",
          content: (
            <>
              <SubSection title="10. Which words are nearest this one">
                <p>
                  Once every word has a position and we have a way of scoring a
                  pair, the first new question falls out. Take a word, score it
                  against every other word in the vocabulary, sort, and read off
                  the top of the list. Nothing in the fit was asked to produce a
                  list of neighbours; the list is a consequence of every word
                  having been placed somewhere, which is why the answer is worth
                  looking at and is not merely definitional.
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
                  A nearest-neighbour list is the first question a number could
                  not be asked. It is produced by scoring the whole table and
                  sorting, and the word asked about is struck out of its own
                  answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Whether the answer is any good">
                <p>
                  A list of neighbours looks convincing whatever it contains, so
                  it is worth checking it in both directions. In the direction
                  that works, <em>sail</em> and <em>rope</em> score 0.9825 while{" "}
                  <em>sail</em> and <em>flour</em> score 0.0661 and{" "}
                  <em>sail</em> and <em>oven</em> score &minus;0.0518. Words
                  from the same topic are near one, words from different topics
                  are near zero, and the fit was never told which topic any word
                  belonged to.
                </p>
                <p>
                  In the direction that does not work, <em>sail</em> and{" "}
                  <em>boat</em> score only 0.3638, which is far lower than a
                  reader who knows English would predict for two words that name
                  parts of the same activity. That is a fact about the corpus and not
                  about the method, and tracing it turns up something more
                  interesting than the miss itself.
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
                  caption="Four of the five agree with a reader’s judgement. The fifth is reported because hiding it would misrepresent what a small corpus can support."
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
                  of them were seen beside picked out in colour. Switch to{" "}
                  <span className="font-mono">sail and boat</span> and watch the
                  direct count go up while the cosine goes down.
                </p>
                <p>
                  That is worth pausing on, since it is easy to read a cosine as
                  a count of how often two words appeared together and it is
                  not. Two words are placed together when they are used in the
                  same kind of position, whether or not they were ever used in
                  the same breath, and it is the second-hand evidence that
                  carries most of the work here. It also sets the honest limit
                  on what a high cosine claims, which is similar company and not
                  similar meaning.
                </p>
                <KeepInMind>
                  The measure separates the two topics cleanly, at 0.9825 within
                  and 0.0661 across for one pair each. It reads the company two
                  words each keep and never whether they keep each other&rsquo;s,
                  which is why a pair that never once met scores 0.9825 and a
                  pair that met twice scores 0.3638.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. How alike two named words are">
                <p>
                  The second question is the smaller one, and it is worth
                  separating from the first because it is the one that gets used
                  inside larger systems. Given two words we already have in
                  mind, how alike are they? That is a single number, computed
                  without touching the rest of the vocabulary, and it can be
                  compared across pairs because the scale is fixed at both ends.
                </p>
                <p>
                  Being able to compare across pairs is the part that a number
                  could never give us. Saying that <em>oven</em> and{" "}
                  <em>bake</em> score 0.9267 while <em>sail</em> and{" "}
                  <em>flour</em> score 0.0661 puts the two pairs on one scale,
                  and a system downstream can set a threshold on that scale and
                  have it mean roughly the same thing everywhere in the
                  vocabulary.
                </p>
                <KeepInMind>
                  Scoring a named pair costs one dot product and two lengths,
                  and the answers are comparable across pairs because the scale
                  runs from &minus;1 to 1 regardless of the words.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Questions the table cannot answer">
                <p>
                  Some questions we can put to a table of positions have no
                  answer, and the reasons are arithmetic ones and not
                  matters of policy. A word the texts never contained has no row to read,
                  and there is nothing to return, since the whole content of a
                  position is what the fit learned about that word and it
                  learned nothing. Asking for the position of <em>kettle</em>{" "}
                  here is that case.
                </p>
                <p>
                  The other case is a point sitting exactly at the origin. It
                  has no direction, so the angle between it and anything else
                  does not exist, and returning zero would be a claim that it
                  stands at right angles to every word, which is a much stronger
                  statement than the truth. The consistent treatment is to
                  refuse the comparison and to leave such a word out of every
                  neighbour list, which is why the fifth word of the sketch
                  never appears in an answer.
                </p>
                <UnanswerableQuestions />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Each row is a question put to one of the two tables. Some have
                  an answer and some do not, and the ones that do not are
                  undefined rather than merely awkward.
                </p>
                <KeepInMind>
                  A word outside the vocabulary has no position, and a position
                  at the origin has no direction. Both are gaps in the
                  definition rather than gaps in an implementation, and the
                  honest response to each is to say so.
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
                <p>
                  Answering a question costs the whole table as well. A
                  nearest-neighbour query here scores the word against all 22
                  others before it can sort, and in general it scans every row,
                  because a cosine gives no way to rule a word out without
                  computing it. That is the honest place where the older
                  approach wins. Checking whether two pieces of text are the same
                  word is one integer comparison and it is exact, where the
                  nearest-neighbour question is a scan and its answer is a
                  ranking that can be argued with.
                </p>
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
                  Nothing in fitting a table asks for this. A fit is told to
                  place words so that words keeping the same company end up
                  together, and whether the resulting arrangement also lines up
                  parallel differences is something to be checked afterwards
                  and is not guaranteed. It holds well on large
                  tables and it holds patchily on small ones, and this page
                  reports both.
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
                  The arithmetic is done on unit vectors rather than on the
                  positions themselves. Each of the three words is first divided
                  by its own length, so that it becomes an arrow of length one
                  pointing the same way, and only then are the three added and
                  subtracted. The standard form is called 3CosAdd, after Levy
                  and Goldberg, and the reason for the normalising is the
                  measurement of Part 2.
                </p>
                <p>
                  If the raw positions were added, a word that happens to be
                  long would dominate the sum, and we have already established
                  that length here records how ordinary a word is rather than
                  what it means. The result would be an answer driven by which
                  of the three words was the rarest. Dividing each one by its
                  length gives all three an equal say, so the sum is a statement
                  about directions alone.
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

              <SubSection title="17. The sketch worked all the way through">
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
                      reason: "here the division matters. woman sits three times as far out as man, and after normalising the two are the same arrow, which is the sketch saying they differ only in how far along one direction they lie.",
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
                  Notice what would happen if we did not strike out the three
                  words of the question. The sum came to (1, 0), which is
                  exactly <em>king</em>&rsquo;s own direction, so <em>king</em>{" "}
                  scores a cosine of 1.0000 against it and takes first place,
                  with <em>queen</em> tying behind. The analogy appears to
                  answer itself, and the answer carries no information at all.
                </p>
                <p>
                  This happens because the word that was added first is a whole unit of the sum, and the other two frequently cancel a good part of each other. The published accounts of the analogy result usually say that the question words are excluded and leave it at that, so I measured how often it actually matters.
                </p>
                <p>
                  Over every ordered triple of the twenty-three words, which is 10,626 questions, the top answer without exclusion is one of the three words already in the question 4,118 times, a share of 0.3875. That is often and not always, and it is worth saying so plainly instead of repeating the stronger claim.
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
                  It does not come out. The sum lands nearest <em>rope</em> at
                  0.7847, then <em>deck</em> at 0.7323 and <em>mast</em> at
                  0.7210, and <em>wind</em> is nowhere in the first three. All
                  three answers are sailing words, so the arithmetic did carry
                  the topic across correctly, and what it did not carry is the
                  position within the cycle. On a table of twenty-three words
                  fitted to a hundred and forty-four word occurrences, the
                  differences between positions are simply not determined finely
                  enough to encode which step of a cycle a word sits at.
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
                  The analogy is a property some tables have and this one has
                  only partly. It moved the answer into the right topic and
                  missed the intended word, which is the honest report and is
                  more useful than a demonstration arranged to succeed.
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
              "The score reads the company each word keeps and never whether they keep each other’s. boat is placed by harbour and anchor, and sail never once appears near either, so the two end up pointing in different directions. Length is divided out by the cosine, so it cannot be the explanation.",
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
              "A word the texts never contained has no row to read, since the whole content of a position is what the fit learned about that word. A point at the origin has no direction, so the angle does not exist and the honest response is to refuse. The other two have perfectly ordinary answers, 0.9825 for one pair that never met and −0.0518 for sail against oven.",
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
              "That is a share of 0.3875, so leaving the question words in changes 39% of the answers, which is often rather than always. The word added first is a whole unit of the sum and the other two frequently cancel a good part of each other, which is why 4,048 of the 4,118 return a word that was added and only 70 the word that was subtracted. The exclusion belongs to how the analogy is evaluated and not to the arithmetic, and length was already taken out when each word was reduced to a unit vector.",
            ),
            trueFalse(
              "The analogy what is to sugar as sail is to flour carries the topic across and misses the designed answer, which is wind.",
              true,
              "The sum lands nearest rope at 0.7847, then deck at 0.7323 and mast at 0.7210, all of them sailing words, so the arithmetic moved the answer into the right topic and did not carry the position within the cycle. Twenty-three words fitted to a hundred and forty-four word occurrences do not determine the differences between positions finely enough for that, and the page reports the miss rather than arranging a demonstration to succeed.",
            ),
        ],
        },
        {
          title: "Part 5. No Coordinate Means Anything On Its Own",
          content: (
            <>
              <SubSection title="20. Turning the whole table">
                <p>
                  Part 1 claimed that a single coordinate names nothing, and
                  here is the demonstration. Take the fitted table and turn every
                  word by the same angle in the plane of its first two
                  coordinates, in the way a sheet of graph paper can be rotated
                  under a set of fixed points. Every word moves in the same way,
                  and every coordinate of every word changes.
                </p>
                <p>
                  At a quarter turn, <em>sail</em>&rsquo;s first coordinate goes
                  from 0.5369 to &minus;0.5223, which is a swing across most of
                  the range the table uses and includes a change of sign. Its
                  length does not move at all, and neither does any pair&rsquo;s
                  cosine, the largest change over all 253 pairs being smaller
                  than 1e-15, which is rounding and not a change. All 23
                  words keep the same nearest word.
                </p>
                <SpaceRotation word="sail" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drag the slider and watch the top row of dots become the
                  bottom row. The two panels at the bottom hold the neighbour
                  lists before and after, and they do not change.
                </p>
                <WhyThisWorks>
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
                  The turned table is not a damaged copy of the original. It is
                  a table that gives the same answer to every question we know
                  how to ask, which means that whatever the fit determined, it
                  did not determine the coordinates. It determined the dot
                  products, and the coordinates are one of infinitely many ways
                  of writing those down.
                </p>
                <p>
                  Reading a coordinate as a named feature is ruled out by that,
                  since a turn destroys the reading without changing anything a
                  reader could measure. So is any arithmetic that puts two
                  tables&rsquo; coordinates side by side, whether that is
                  comparing a word&rsquo;s third coordinate here against its
                  third coordinate there or adding one table&rsquo;s position for
                  a word to another table&rsquo;s, since the two are written
                  along axes that have nothing to do with each other.
                </p>
                <p>
                  One small thing does change under a turn, and it is worth
                  reporting because it looks like a contradiction and is not.
                  The full ranking of neighbours survives for 21 of the 23
                  words and not for all of them. The two exceptions swap a pair
                  of words whose cosines are equal to sixteen digits, so what
                  moved is which of two exactly tied words the sort happened to
                  put first, and a tie has to be broken somehow.
                </p>
                <KeepInMind>
                  A fit determines the comparisons between positions and not the
                  positions. Any statement about a single coordinate, or about
                  one coordinate against another table&rsquo;s, is a statement
                  about an arbitrary choice.
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
                  The definition gives each word in the vocabulary exactly one
                  position, and a vocabulary is a list of spellings. Where one
                  spelling is used for two unrelated things, the fit has one
                  point to describe both, and the arithmetic that places it is
                  driven by every context it appeared in at once. There is no
                  choice available, since a single point that has to be near two
                  separated groups ends up between them, at a middling distance
                  from each and inside neither.
                </p>
                <p>
                  I built the case rather than waiting for it, since the
                  documents have no ambiguous word of their own. Every use of{" "}
                  <em>pan</em> in the cooking texts and of <em>rope</em> in the
                  sailing texts was respelled <em>sheet</em>, which is a real
                  ambiguity in English, since a sheet is a baking tray in one
                  trade and a rope that controls a sail in the other. The texts
                  are otherwise untouched and the fit is the same one.
                </p>
                <SenseCollision />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  What the merged spelling is now nearest, against what the two
                  words it replaced were nearest when they were separate.
                </p>
                <p>
                  The result is what the geometry forces. Where <em>pan</em>{" "}
                  scored 0.9981 against its nearest word and <em>rope</em>{" "}
                  scored 0.9825 against its own, <em>sheet</em> reaches only
                  0.8635, and its list of neighbours alternates between the two
                  topics. Its mean cosine to the cooking words is 0.3504 and to
                  the sailing words 0.4318, which are nearly the same number,
                  where an ordinary cooking word like <em>dough</em> scores
                  0.4015 to its own topic and 0.1481 to the other. The merged
                  word can no longer say which topic it belongs to, and nothing
                  in the fit reported that anything had gone wrong.
                </p>
                <KeepInMind>
                  One position per spelling means a word with two senses gets a
                  point between them. Measured here, the merged word&rsquo;s
                  best neighbour falls from about 0.99 to 0.8635 and its pull
                  towards the two topics becomes almost equal at 0.3504 and
                  0.4318.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Two fits of one corpus cannot be compared number by number">
                <p>
                  Part 5 showed that a table has no fixed axes, and this is the
                  practical consequence. Two fits of the same texts that both
                  work will not agree about coordinates, so no quantity built
                  out of coordinates directly can be carried from one to the
                  other, and any comparison between two tables has to be made
                  out of quantities a turn leaves alone.
                </p>
                <p>
                  To measure that rather than assert it, the same twenty-four
                  documents were fitted twice by a different technique, one that
                  begins from random positions, changing nothing but the seed.
                  Both fits found the shape that is there, putting two words of
                  one topic nearer each other than two words of different
                  topics, at 0.8333 against 0.7313 in the first fit and 0.8676
                  against 0.5593 in the second. On the coordinates they agree
                  about nothing. The word <em>sail</em> in one fit has a cosine
                  of 0.4954 to the same word in the other, and the two fits put a
                  word&rsquo;s first coordinate 0.3292 apart on average and
                  0.8760 apart at worst.
                </p>
                <TwoFitsCompared />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same texts fitted twice from different starts. Both found
                  the topics; neither agrees with the other about where anything
                  is.
                </p>
                <p>
                  On this corpus the two fits do not even agree about the
                  neighbour lists, sharing 28 of the 69 nearest-word places, and
                  the second fit separated the topics more sharply than the
                  first. That is an honest complication rather than the claim I
                  set out to make, and its cause is that twenty-four documents
                  do not pin down a table well enough for a random start to be
                  washed out. The narrower point survives it, since even two
                  fits that agreed perfectly about every neighbour would still
                  be written in unrelated axes.
                </p>
                <KeepInMind>
                  Coordinates are not portable between fits, so a comparison of
                  two tables has to be phrased in cosines rather than in
                  coordinates. On a corpus this small, even the cosines only
                  partly agree.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A corpus’s habits become the model’s opinions">
                <p>
                  The last limit is the one that follows from the definition
                  most directly and gets discussed least clearly. Nearness in
                  one of these tables is defined by what kept company with what
                  in the texts that were read. It is a summary of usage, and it
                  is a summary of the usage in that particular collection, so
                  every regularity of those texts, including the ones nobody
                  intended, is in the answers.
                </p>
                <p>
                  The corpus here shows the mechanism at a size we can check.{" "}
                  <em>sail</em> and <em>boat</em> score 0.3638, which is wrong
                  about English and right about these twenty-four documents,
                  where the heaviest company <em>boat</em> keeps is{" "}
                  <em>harbour</em> at 6.0 and <em>anchor</em> at 3.0, and{" "}
                  <em>sail</em> never once appears near either of them. Nothing
                  in the fit was
                  mistaken. The texts placed the two words in different company,
                  the fit reported it, and a system reading the answer downstream
                  has no way of knowing that the difference came from how these
                  particular documents were composed.
                </p>
                <p>
                  Scale changes the size of the effect and not its nature. A much larger collection replaces the artefacts of a designed corpus with the habits of whoever wrote the collection, and a habit that shows up consistently in the writing shows up as a small angle between the words involved. What makes this awkward is that the resulting opinion is not held anywhere in particular.
                </p>
                <p>
                  It is distributed across every coordinate of every affected word, so there is no entry to correct, and Part 5 has already shown why editing coordinates directly is not a coherent operation.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a word the texts never contained",
                      reason: "it has no position, because a position is what the fit inferred from that word’s contexts and there were none. There is a real choice attached, since a table may reserve one row for everything it has not seen, and the cost of doing so is that every unseen word is then declared identical to every other unseen word.",
                    },
                    {
                      expression: "a position sitting exactly at the origin",
                      reason: "it has no direction, so the angle between it and anything else does not exist. Answering zero would claim it stands at right angles to every word in the vocabulary, which is a much stronger statement than the truth, so the comparison is undefined rather than merely awkward.",
                    },
                    {
                      expression: "an analogy whose words cancel exactly",
                      reason: "the sum is the origin, and nothing is near the origin in the sense the measure uses, so the question has no answer. On the sketch, asking about king with queen subtracted reaches this, since the two lie in exactly the same direction.",
                    },
                    {
                      expression: "one spelling used for two unrelated things",
                      reason: "there is one point available and two places it would need to be, so it lands between them and is near neither. Measured on these documents, the merged word’s best neighbour falls to 0.8635 where the two words it replaced reached 0.9981 and 0.9825.",
                    },
                    {
                      expression: "asking which coordinate means what",
                      reason: "the question has no answer, because a fit determines the comparisons between positions and not the positions. A quarter turn of the whole table moves one word’s first coordinate from 0.5369 to −0.5223 and moves no cosine by as much as 1e-15.",
                    },
                    {
                      expression: "comparing two tables coordinate by coordinate",
                      reason: "the same fact again, now between fits rather than within one. Two fits of these documents put a word’s first coordinate 0.3292 apart on average, and any comparison that is going to mean anything has to be built from angles, which a turn leaves alone.",
                    },
                    {
                      expression: "asking whether an answer is true rather than usual",
                      reason: "the method has no notion of true. It reports what kept company with what in the texts it read, so a regularity of those texts is indistinguishable from a fact about the language, and the only way to change an answer is to change the texts and fit again.",
                    },
                  ]}
                />
                <KeepInMind>
                  A table of positions is a summary of one collection&rsquo;s
                  usage, and it cannot distinguish a fact about the language
                  from a habit of the writers. Since the summary is spread
                  across every coordinate of every word, and coordinates are not
                  individually meaningful anyway, there is no entry to edit
                  afterwards.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "When a table has taken on a habit of the texts it was fitted to, there is no single entry that could be corrected afterwards.",
              true,
              "The opinion is spread across every coordinate of every affected word, and Part 5 showed that a coordinate means nothing on its own, so editing one is not a coherent operation. sail and boat at 0.3638 is the mechanism at a size that can be checked. It is wrong about English and right about these twenty-four documents, where the heaviest company boat keeps is harbour at 6.0 and anchor at 3.0 and sail never once appears near either, and nothing in the fit was mistaken.",
            ),
            choice(
              "One thing does change under the turn. What is it, and why is it not a contradiction?",
              [
                "The lengths of the longest words move slightly, because rotation is only approximate in floating point",
                "The full neighbour ranking survives for 21 of the 23 words, and the two exceptions swap words whose cosines are equal to sixteen digits",
                "Two words change their nearest word, because their positions crossed during the turn",
                "The cosines between words of different topics move, because those are the smallest and so the least stable",
              ],
              1,
              "A rotation preserves every dot product, so every length and every cosine stays where it was, the largest change over all 253 pairs being below 1e-15, while sail’s first coordinate swings from 0.5369 to −0.5223. What moved is which of two exactly tied words the sort happened to put first, and a tie has to be broken somehow. All 23 words keep the same nearest word, so nothing about the comparison itself changed, which is the whole point of the demonstration.",
            ),
            several(
              "Which of these does the rotation rule out?",
              [
                "Reading a coordinate as a named feature of a word",
                "Comparing a word’s third coordinate in one table against its third coordinate in another",
                "Adding one table’s position for a word to another table’s position for it",
                "Comparing two words by cosine within a single table",
              ],
              [0, 1, 2],
              "A turn destroys any reading of a coordinate without changing anything a reader could measure, and it leaves two tables written along axes that have nothing to do with each other. The cosine within one table is exactly what the turn preserves, so it is the quantity that survives and the one a comparison has to be phrased in.",
            ),
            choice(
              "Every use of pan in the cooking texts and of rope in the sailing texts was respelled sheet. What did the fit then report?",
              [
                "sheet took two positions, one per sense",
                "sheet reached only 0.8635 against its best neighbour, and its pull towards the two topics became nearly equal",
                "sheet was left out of the table, since its company was contradictory",
                "sheet kept pan’s position, since cooking words are commoner in the corpus",
              ],
              1,
              "pan scored 0.9981 against its nearest word and rope 0.9825, and the merged spelling reaches 0.8635 with a neighbour list alternating between the two topics. Its mean cosine is 0.3504 to the cooking words and 0.4318 to the sailing ones, where an ordinary cooking word like dough scores 0.4015 to its own topic and 0.1481 to the other. Nothing in the fit reported that anything had gone wrong.",
            ),
            trueFalse(
              "Two fits of the same twenty-four documents from different random starts disagreed about the coordinates but agreed about the neighbour lists.",
              false,
              "They share only 28 of the 69 nearest-word places, and the second fit separated the topics more sharply than the first. Both did find the shape that is there, putting two words of one topic nearer each other than two of different topics. The cause is that twenty-four documents do not pin down a table well enough for a random start to be washed out.",
            ),
        ],
        },
        {
          title: "Practice. Asking The Table With The Library",
          practice: [
            exercise(
              "Fit the twenty-four documents and stand at sail",
              ["Fit PointwiseMutualInformationEmbeddings to the twenty-four documents with a window of two and four numbers per word, which is the fit behind every figure on the page, and take the table it answers with. Print how many words and coordinates it holds, the four numbers of sail, and the five words nearest sail. Then print the cosine of each of six named pairs to four places.", "The position should be the one section 3 prints, the neighbours should be the list of section 10, and the first five pairs should be the figures of sections 11 and 12. The sixth pair, boat and harbour, is one the page describes and never scores."],
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
              { hints: ["The embedder is constructed with window and dimension, fit takes the list of documents as plain strings and answers the fitted embedder, and its embeddings property is the table of positions.", "The table knows n_words and dimension. vector_of takes a word and answers its position, whose values are the coordinates, and most_similar takes a word and n_results and answers neighbours that each carry a word and a similarity.", "similarity takes two words and answers their cosine as a plain number."], check: numberCheck("What is the cosine between boat and harbour, to four places?", 0.9919, 5e-05, "The sailing documents step through their ten words in a cycle, and harbour is the word after boat in it, so the two are seen beside nearly the same words, and a cosine reads the company two words each keep. sail sits two steps before boat in the same cycle and scores only 0.3638 against it, which section 11 traced to boat being placed by harbour and anchor.") },
            ),
            exercise(
              "Rank by the angle and by the ruler",
              ["Standing at sail, print for rope, mast, deck and crew the cosine, the ordinary distance between the two positions, and the length of the neighbour’s position, each to four places. Then double every coordinate of rope and print its cosine with sail and its distance from sail again.", "The four rows should be section 8, with rope first by the angle and mast first by the ruler, and the lengths beside them saying why. Section 6 says that doubling a word’s coordinates changes nothing about its cosine. See what the same doubling does to the ruler, which is a figure the page does not give."],
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
              { hints: ["np.linalg.norm of an array is its length, and of the difference of two arrays it is the ordinary distance between the two points.", "The table only scores words it holds, and a doubled rope is not one of them. cosine_similarity is the function underneath, and it takes two arrays."], check: numberCheck("How far is sail from rope with its coordinates doubled, to four places?", 1.3433, 5e-05, "Doubling rope leaves it pointing exactly where it pointed, so the cosine is still 0.9825, while its length goes from 1.0713 to twice that and the ruler now reads 1.3433 where it read 0.3046. Nothing about the direction changed. Length on this table records how ordinary a word is, which is section 9, and a measure that moves this much with it is answering a different question from the one being asked.") },
            ),
            exercise(
              "Put the designed analogy to the table",
              ["Section 19 asks what is to sugar as sail is to flour, and the corpus was built so that the answer would be wind. Ask the fitted table with its analogy method, adding sail and sugar and subtracting flour, and ask for twenty results, which is every word left once the three of the question are struck out. Print the first five with their cosines, then the place wind came in and its cosine.", "The first three should be rope, deck and mast with the figures of section 19. The page says only that wind is nowhere in the first three, so how far down it actually came is yours to find."],
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
              { hints: ["analogy takes two lists, the words whose directions are added and the words whose directions are subtracted, and n_results. It leaves the question words out of the running on its own.", "What comes back can be looped over, giving answers that each carry a word and a similarity, and its words property is the ranked words alone, which a list can search with index."], check: numberCheck("At what place does wind come in the ranking of twenty?", 11, 0.0, "The arithmetic carried the topic across, which is why four sailing words lead the list, and it did not carry the position within the cycle, so the designed answer sits at a cosine of 0.4474 with five sailing words, the three shared words and two cooking words ahead of it. A hundred and forty-four word occurrences do not determine the differences between positions finely enough to say which step of a cycle a word is at, which is the honest report section 19 gives.") },
            ),
            exercise(
              "Turn the whole table and ask again",
              ["Part 5 turns every word by the same angle in the plane of its first two coordinates. The starter builds the matrix that does it. For a quarter turn and for a turn of thirty degrees, multiply the table by the matrix, wrap the result in a new WordEmbeddings over the same vocabulary, and print the first coordinate of sail in the turned table, the largest change in any pair’s cosine, and how many of the 23 words keep the same nearest word.", "At the quarter turn the coordinate should be the figure of section 20 and the largest change should be rounding. Thirty degrees is an angle the page does not print, and every answer should survive it just the same."],
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
              { hints: ["space.table is the whole table as an array with one row per word, so multiplying it on the right by the matrix turns every word at once. WordEmbeddings takes a vocabulary and a table, and space.vocabulary is the one to reuse.", "Looping over a vocabulary gives its words. Every pair once is each word with each word after it, which is 253 pairs for 23 words.", "most_similar with n_results=1 answers one neighbour, and its words property is a tuple holding that one word, so two of them compare with ==."], check: numberCheck("What is sail’s first coordinate after a turn of thirty degrees, to four places?", 0.2038, 5e-05, "The first coordinate went from 0.5369 to 0.2038, and at the quarter turn to −0.5223, while no cosine moved by more than rounding and all 23 words kept their nearest word. A rotation preserves every dot product, and lengths and cosines are built from dot products, so the turned table answers every question the way the original did. Whatever the fit determined, it was not the number 0.5369.") },
            ),
          ],
        },
      ]}
    />
  );
}
