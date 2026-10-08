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
import { ComponentSpectrum } from "@/components/widgets/ComponentSpectrum";
import { LatentSpaceExplorer } from "@/components/widgets/LatentSpaceExplorer";
import { LeadingDirectionStrip } from "@/components/widgets/LeadingDirectionStrip";
import { NearestInOneSpace } from "@/components/widgets/NearestInOneSpace";
import { RebuiltRow } from "@/components/widgets/RebuiltRow";
import { SqueezeTradeoff } from "@/components/widgets/SqueezeTradeoff";
import { TermDocumentTable } from "@/components/widgets/TermDocumentTable";
import { TwoSensesOneRow } from "@/components/widgets/TwoSensesOneRow";

export const metadata: Metadata = {
  title: "Latent Semantic Analysis · oop_ml",
  description:
    "Documents about related subjects may use some of the same words in different amounts. Latent semantic analysis starts with a table of word use and keeps a smaller set of shared patterns for representing words and documents.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LatentSemanticAnalysisPage() {
  return (
    <ConceptPage
      lessonId="latent-semantic-analysis"
      intuition={lessonIntuitions["latent-semantic-analysis"]}
      technicalStart="Part 3. Squeezing The Table"
      openingTitle="A Large Word Table May Have a Smaller Pattern Inside It"
      playgroundIntro="Compare the original table with its weighted and reduced representations. Inspect neighbouring words and documents as you change the number of retained directions."
      title="Latent Semantic Analysis"
      tagline={"Documents about related subjects may use some of the same words in different amounts. Latent semantic analysis starts with a table of word use and keeps a smaller set of shared patterns for representing words and documents."}
      prerequisites={
        <>
          Everything here ends as a handful of coordinates, and two of them are
          compared by the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          between them, which is an angle rather than a distance. The squeeze in
          the middle of the method is the same decomposition that{" "}
          <Link href="/concepts/pca" className={link}>
            principal component analysis
          </Link>{" "}
          performs, applied to a different table and with one step deliberately
          left out, and Part 4 is where that difference is measured rather than
          asserted. Nothing later depends on having read that page, though a
          reader who has will recognise most of Part 3 on sight.
        </>
      }

      playground={<LatentSpaceExplorer />}
      sections={[
        {
          title: "Part 1. One Table, Two Readings",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four documents, and four small enough to print">
                <>
<p>
                  Everything on this page is fitted to one of two collections, and it is worth knowing exactly what is in them before any method touches them. The larger one is twenty-four documents, twelve about cooking and twelve about sailing. The cooking half is written from ten words, flour, sugar, butter, eggs, oven, bake, stir, whisk, dough and pan; the sailing half from ten of its own, sail, wind, boat, harbour, anchor, tide, mast, rope, deck and crew.
                </p>
                <p>
                  No content word appears in both halves. What the two halves do share is three words carrying no subject at all, and, the and we, and each document uses exactly one of them.
                </p>
</>
                <p>
                  Each document is six words long, five consecutive words of its
                  own half taken in a cycle and one of the three shared words,
                  so every word of a half keeps the same company as every other
                  word of that half. That arrangement is deliberate and it is
                  what makes the claims later on testable, since prose written
                  naturally has themes inside a subject, bake and oven against
                  whisk and eggs, and those would compete with the difference
                  between the subjects for the strongest direction.
                </p>
                <p>
                  The smaller collection is four documents of three words each,
                  the cat sat, the cat ran, the boat sailed and the boat sank.
                  It is here because every number that comes out of it can be
                  checked with a pencil, and because its whole table fits on the
                  screen at once.
                </p>
                <KeepInMind>
                  The one fact hidden from every fit on this page is that a
                  collection has two halves. Nobody tells a fit which half a
                  document came from, so the two numbers this page keeps
                  reporting, how alike two words of one half are and how alike a
                  word of each are, are the whole score.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A row is a word and a column is a document">
                <p>
                  Write down one row for every distinct word and one column for
                  every document, and in each cell put how many times that word
                  was used in that document. That is the whole of the input.
                  Nothing about order survives it, so the cat sat and sat the
                  cat give the same column, and nothing about which document
                  came first survives it either.
                </p>
                <>
<p>
                  The reason this one table can answer two different questions is that it can be read along either axis. Read a column and a document has become a list of numbers over the vocabulary, which is what it means to say a document is a point. Read a row and a word has become a list of numbers over the collection, which is the same claim about a word.
                </p>
                <p>
                  Neither reading needs anything the other does not have, so a method that works on the table is answering both questions at once whether or not it meant to.
                </p>
</>
                <TermDocumentTable corpus="four" />
                <p>
                  Seven distinct words over four documents gives 28 cells, and
                  12 of them hold anything, so 57.1% of the table is empty even
                  at this size. The row of the is 1, 1, 1, 1, and the row of sat
                  is 1, 0, 0, 0. Those two rows are the two extremes the rest of
                  this page is about.
                </p>
                <KeepInMind>
                  The emptiness is the normal condition rather than an accident
                  of a small example. On the twenty-four documents, 144 cells of
                  552 hold anything, so 73.9% is empty, and on any real
                  collection the figure runs past 99%, since a vocabulary of a
                  hundred thousand words meets a document of four hundred.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Where a table of counts stops working">
                <p>
                  Take two documents from the cooking half, flour sugar and
                  butter eggs oven and we bake stir whisk dough pan. Both are
                  about cooking, both were written from the same ten words, and
                  by the cycle that built them they happen to share no word at
                  all. Compare their columns and the answer is exactly zero,
                  because two lists of numbers that are never both non-zero in
                  the same place have nothing to multiply together.
                </p>
                <p>
                  Now take that first document against a sailing one, sail wind
                  and boat harbour anchor. They share the word and, and nothing
                  else. The table rates that pair at 0.1483, which is higher than
                  the 0.0000 it gave the two cooking documents. Read literally,
                  the collection is saying that a document about cooking is more
                  like a document about sailing than it is like another document
                  about cooking.
                </p>
                <SqueezeTradeoff />
                <p>
                  This is not one unlucky pair. Of the 132 pairs of documents
                  drawn from one half, 14 come out at exactly nothing, and so do
                  96 of the 144 pairs that cross the halves. Among words the
                  clash is sharper. Ten of the 90 pairs taken from one half score
                  exactly zero, and the mean over every pair made of a cooking
                  word and a sailing word is exactly zero as well, so flour
                  against bake and flour against anchor are the same number and
                  the table cannot tell the two situations apart.
                </p>
                <KeepInMind>
                  The failure is structural rather than statistical, and no
                  amount of extra text repairs it directly. Two things are alike
                  in this table only when they overlap, so the table can never
                  say that two words are alike because they keep the same
                  company, which is the one thing anybody wanted it to say.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Weighting What A Count Is Worth",
          content: (
            <>
              <SubSection title="4. A word used in every document">
                <p>
                  Look again at the row of the in the four-document table. It
                  reads 1, 1, 1, 1. That row is a perfectly good description of
                  the word, in the sense that it is exactly what the collection
                  observed, and it is useless for telling one document from
                  another, because whatever question is asked of it the answer is
                  the same for all four columns.
                </p>
                <p>
                  The damage is not only that the row says nothing. It is that
                  the row is loud. Under plain counts the takes a third of the
                  weight of every column, so a third of what any comparison of
                  two documents is reading is a quantity that is identical in
                  both and could not possibly separate them. Every document is
                  being pulled towards every other by the same amount, and that
                  pull is a third of the signal.
                </p>
                <KeepInMind>
                  The trouble with a word used everywhere is that its row is
                  loud as well as uninformative. A word used once has a row that
                  is mostly zeros and takes almost none of any column, so it can
                  be uninformative cheaply; a word in all four documents takes a
                  third of every column here to say the same thing four times.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Frequent here, rare elsewhere">
                <p>
                  The repair is to multiply each count by a weight that falls
                  with the number of documents the word turns up in. A word used
                  ten times in a document really is more about that document than
                  a word used once, so the count is kept; a word used in every
                  document really does separate nothing, so the count is
                  discounted by how widely the word is spread.
                </p>
                <Equation>{"weight(word) = log( (1 + documents) / (1 + documents holding the word) ) + 1"}</Equation>
                <p>
                  The additions inside are a smoothing, and they behave as though
                  one extra document contained every word once. Without them the
                  weight would be the logarithm of the number of documents over
                  the number holding the word, which is exactly zero for a word
                  in every document, and a weight of zero deletes the row
                  outright. With them the same word gets a weight of one, so it
                  counts for less than everything else and still counts.
                </p>
                <WorkedExample title="Seven words, four documents">
                  <>
                    <p>
                      The occurs in every document, cat and boat in two each, and the
                      remaining four words in one each. Smoothed inverse-document
                      frequency assigns weights from those document counts.
                    </p>
                    <Equation>{"the:              ln(5/5) + 1 = 1\ncat, boat:        ln(5/3) + 1 ≈ 1.5108\nsat, ran, sailed, sank: ln(5/2) + 1 ≈ 1.9163"}</Equation>
                    <p>
                      Rare words gain weight relative to the shared word. Its numerical
                      row stays unchanged, but its share of each document’s total falls.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  Switch the table in step 2 to weighted counts and watch what
                  stays put. Every cell that was empty is still empty, since a weight
                  multiplies a count and cannot create one, and every cell that
                  was filled is still filled. The weighting changes how loud each
                  row is and changes nothing about which cells the collection
                  ever wrote in, which is the limitation Part 6 comes back to.
                </p>
                <KeepInMind>
                  Without the smoothing, a word in every document is deleted
                  rather than discounted, and the difference matters on a small
                  collection where a real word can easily turn up everywhere. The
                  smoothed form hands such a word the smallest weight the formula
                  ever produces and leaves its row in the table, so a fit can
                  still use it where the rest of the collection turns out to
                  need it.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the weighting does on a larger collection">
                <p>
                  On the twenty-four documents the weighting moves very little,
                  and it is worth reporting that rather than the usual claim made
                  for it. No word appears in every document there. The three shared
                  words are each in eight documents and the subject words in five
                  to seven, so the weights run only from 2.0217 to 2.4271 and the
                  most common word is barely held back at all.
                </p>
                <NumberTable
                  headings={[
                    "how a count is weighted",
                    "share of the first document taken by its shared word",
                  ]}
                  rows={[
                    ["plain counts", "16.7%"],
                    ["weighted counts", "15.7%"],
                  ]}
                  caption="Measured on the twenty-four documents. The word in question is and, which appears in eight of the twenty-four; on the four-document collection, where a word really does appear everywhere, the same two figures are 33.3% and 22.6%."
                />
                <p>
                  The effect is nearly absent because this collection was built
                  without a word common enough for the weighting to work on. It
                  is therefore a poor demonstration of the weighting, and it also
                  means that no claim later on this page is being propped up by
                  it. Every one of them holds under both weightings, and the
                  playground has a switch so that can be checked rather than
                  taken on trust.
                </p>
                <KeepInMind>
                  The weighting is aimed at the words a natural collection is
                  full of, the, of, is, was, and it earns its keep in proportion
                  to how many of those there are. Where a collection has none,
                  it does almost nothing, which is a fact about the collection
                  rather than an argument against the weighting.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The table of counts rates a cooking document against a sailing one higher than it rates two cooking documents against each other.",
              true,
              "By the cycle that built them those two cooking documents happen to share no word at all, so their comparison is exactly zero, while the cross-half pair shares the word and and comes out at 0.1483. Two things are alike in this table only when they overlap, which is why the failure is structural rather than statistical.",
            ),
            choice(
              "The mean over every pair made of a cooking word and a sailing word is exactly zero. Why is that worse than it sounds?",
              [
                "Ten of the 90 pairs taken from one half also score exactly zero, so flour against bake and flour against anchor are the same number",
                "Zero is the lowest the comparison can go, so nothing has been lost",
                "The mean is dragged down by the three words both halves use",
                "It shows the two halves were written from one vocabulary",
              ],
              0,
              "The table cannot tell the two situations apart, and no amount of extra text repairs it directly. What anybody wanted the table to say is that two words are alike because they keep the same company, and overlap is the only thing it can see.",
            ),
            trueFalse(
              "The row of the is uninformative, and being uninformative it is at least harmless.",
              false,
              "The damage is that the row is loud as well as uninformative. Under plain counts the takes a third of the weight of every column here, so a third of what any comparison of two documents reads is a quantity that is identical in both. A word used once has a row that is mostly zeros and so can be uninformative cheaply.",
            ),
            choice(
              "Why do the additions inside the weighting formula matter?",
              [
                "Without them a word in every document gets a weight of exactly zero, which deletes its row, where the smoothed form hands it a weight of one",
                "They stop the weight going negative on a rare word",
                "They make the weights sum to one over the vocabulary",
                "They let a weight write a number into a cell the collection left empty",
              ],
              0,
              "They behave as though one extra document contained every word once, so the widest-spread word counts for less than everything else and still counts. On a small collection a real word can easily turn up everywhere, which is where the difference bites. A weight multiplies a count and cannot create one, so every cell that was empty stays empty.",
            ),
            trueFalse(
              "On the twenty-four documents the weighting makes a large difference to the comparisons.",
              false,
              "No word appears in every document there. The three shared words are each in eight documents and the subject words in five to seven, so the weights run only from 2.0217 to 2.4271 and the most common word is barely held back. That makes this a poor demonstration of the weighting, and it also means no later claim is propped up by it, since every one holds under both weightings.",
            ),
        ],
        },
        {
          title: "Part 3. Squeezing The Table",
          content: (
            <>
              <SubSection title="7. The closest table of a given rank">
                <p>
                  The squeeze rests on a fact about matrices that predates all
                  of this. Any table can be written as a sum of simple pieces,
                  each piece a direction over the words paired with a direction
                  over the documents and a single number saying how much of the
                  table that pairing accounts for. Sort the pieces by that number
                  and keep the largest few, and what is left is the closest table
                  of that rank there is.
                </p>
                <Equation>{"X  =  U S Vᵀ,   and keeping the k largest gives   X(k) = U(k) S(k) V(k)ᵀ"}</Equation>
                <p>
                  Closest is meant strictly. Add up the squared difference
                  between every cell of the original and the corresponding cell
                  of the rebuild, and no other table of that rank scores lower.
                  The size of that error is known in advance too, since it is
                  exactly the sum of the squares of the numbers that were thrown
                  away.
                </p>
                <Equation>{"sum over every cell of ( X − X(k) )²  =  the sum of the discarded squared numbers"}</Equation>
                <WhyThisWorks title="Why the error is the discarded weight, exactly">
                  <>
<p>
                    The pieces are chosen so that the directions over the words are at right angles to one another and so are the directions over the documents. Cells of the table therefore never interfere between one piece and another, so the total squared size of the table splits cleanly into a contribution per piece, each of them the square of that piece&rsquo;s number.
                  </p>
                  <p>
                    Dropping a piece removes its contribution and nothing else, which is why the error of the rebuild and the weight thrown away are one quantity rather than two that happen to agree. On the twenty-four documents at two directions kept, both are 371.3389.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  The method chooses its directions to make that squared error
                  as small as it can be, and nothing else. It is not asked to
                  find directions that mean anything, and Part 6 is about what
                  follows from that.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. What the squeeze fills in">
                <p>
                  A rebuilt table has entries in cells the collection never
                  wrote in, and that is the entire point rather than a side
                  effect. Take the row of flour. In the collection it holds a
                  weight in six of the twelve cooking documents and nothing
                  anywhere else. Keep two directions, rebuild, and the row holds
                  about 1.1 in all twelve cooking documents and no more than a
                  hundredth in any sailing one.
                </p>
                <RebuiltRow />
                <p>
                  The fit has decided that flour belongs to the cooking documents
                  it was never used in, from nothing but the company it kept in
                  the six where it was. Across the whole table the cells the
                  collection left empty come back at 0.4043 on average, and the
                  largest of them at 1.2970, which is more than half of the
                  2.2730 that a single observed use of flour carries.
                </p>
                <p>
                  It also fills some of them in with numbers no count can be. At
                  two directions kept, 104 cells of the rebuild are below zero,
                  the least of them at −0.0149; at eight directions kept the
                  figures are 208 cells and −0.3643. Nothing in the arithmetic
                  forbids that, because the fit is minimising a squared
                  difference over a whole table and has never been told that its
                  entries are counts.
                </p>
                <KeepInMind>
                  The rebuild is the closest table of low rank to what was
                  observed, which is a smaller claim than it sounds. The numbers
                  it puts where the collection was silent are what that closeness
                  costs, and they are not evidence about the word or the document
                  they sit between.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What each direction accounts for">
                <p>
                  Each kept direction carries a share of the table, its own
                  number squared over the total of every number squared. Those
                  shares are worth reading because they say how much a cut is
                  discarding, and because the shape of the sequence says whether
                  the collection has a few strong patterns in it or many weak
                  ones.
                </p>
                <ComponentSpectrum />
                <NumberTable
                  headings={[
                    "direction",
                    "its number",
                    "its share",
                    "the running total",
                  ]}
                  rows={[
                    ["1", "13.6994", "26.3%", "26.3%"],
                    ["2", "12.4510", "21.7%", "48.0%"],
                    ["3", "8.4582", "10.0%", "58.0%"],
                    ["4", "8.4500", "10.0%", "68.0%"],
                    ["5", "7.6517", "8.2%", "76.2%"],
                    ["6", "7.5307", "7.9%", "84.2%"],
                    ["8", "6.1192", "5.2%", "94.8%"],
                    ["14", "1.4763", "0.3%", "100.0%"],
                  ]}
                  caption="The twenty-four documents under weighted counts. The denominator is the total over every direction the table has, so a fit that keeps two of them reports 48.0% rather than claiming everything."
                />
                <p>
                  The last row is the one to notice. The running total reaches
                  the whole table at the fourteenth direction and never moves
                  again, because twenty-three words over twenty-four documents
                  arranged in this cycle leave only fourteen directions with any
                  spread in them at all. Asking for a fifteenth is asking for a
                  direction that accounts for nothing, and the coordinates every
                  word and document get on it are zero.
                </p>
                <KeepInMind>
                  The denominator has to be worked out before the truncation,
                  since afterwards the discarded numbers are gone and any fit
                  would report that it had kept everything. That is why a fit
                  keeping two directions here reports 48.0% and not 100%.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The two documents that shared no word, read again">
                <p>
                  Part 1 left two cooking documents rated at exactly nothing and
                  a cooking document rated above them by a sailing one. Rebuild
                  the table from two directions and compare the same pairs. The
                  two cooking documents come out at 0.9998 and the cross-half
                  pair falls to 0.0819, so the ordering has reversed and the
                  reversal is the method doing the job it was invented for.
                </p>
                <p>
                  Among words the same thing happens and the numbers are cleaner.
                  Flour against bake, which the collection rated at exactly zero
                  because the two never shared a document, comes out at 1.0000.
                  Flour against anchor, which the collection also rated at exactly
                  zero, comes out at −0.0028. The two pairs that the table could
                  not tell apart are now at opposite ends of the range.
                </p>
                <InAModel title="On this collection">
                  <p>
                    Averaged over every pair, two words of one half sit at 1.0000
                    from each other and a word of each half at 0.0021, so the
                    halves have come apart completely. A mean of 1.0000 also
                    means every pair inside a half came out at the top of the
                    range, which step 15 measures and reports as a loss.
                  </p>
                </InAModel>
                <KeepInMind>
                  Nothing here amounts to the fit having learned about cooking.
                  Flour and bake are used in documents that use the same other
                  words, so the same two directions account for both rows, and
                  describing both rows with those two directions is the whole of
                  what the rebuild did.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The First Direction Cannot Separate Anything",
          content: (
            <>
              <SubSection title="11. Every document on the same side of nothing">
                <p>
                  A natural expectation about the strongest direction is that it
                  is the one the collection divides along, so that cooking
                  documents land at one end of it and sailing documents at the
                  other. That expectation is wrong, and it is wrong for a reason
                  that has nothing to do with this collection.
                </p>
                <p>
                  A table of counts has no negative entry in it. A theorem of
                  Perron says that a matrix with no negative entry has a leading
                  direction with no negative entry either, so every document gets
                  a coordinate of the same sign on it. A direction on which
                  nothing is negative cannot put two groups on opposite sides,
                  since there are no opposite sides to be on.
                </p>
                <LeadingDirectionStrip />
                <p>
                  Measured on the twenty-four documents, every coordinate on the
                  leading direction lies between 2.6501 and 2.8994, and the two
                  halves&rsquo; means come out at 2.7948 and 2.7948, differing by
                  4.4 times ten to the minus sixteen, which is the last bit of a
                  double-precision number rather than a difference. That
                  direction carries 26.3% of the table, more than any other, and
                  it says nothing whatever about which half a document is in.
                </p>
                <KeepInMind>
                  What the leading direction measures is how much of the
                  collection&rsquo;s common vocabulary a document uses, which is
                  close to how long it is. It is real and it is the largest
                  single thing in the table, and any question about subject has
                  to be asked of the directions after it.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The direction after it does the separating">
                <p>
                  Switch the strip above to the second direction. Every cooking
                  document is now negative and every sailing document positive,
                  with the two means at −2.5388 and 2.5388, and no document is
                  anywhere near the line. The split the first direction could not
                  make is complete on the second, which carries 21.7% of the
                  table.
                </p>
                <p>
                  The words agree with the documents, since they came out of the
                  same decomposition. The three words both halves use, and, the
                  and we, have second coordinates of zero to fifteen decimal
                  places, which is the fit saying that a word used equally on
                  both sides has no position on the direction that tells the
                  sides apart. Every cooking word is on one side of them and
                  every sailing word on the other.
                </p>
                <WorkedExample title="The four-document collection, by hand">
                  <>
<p>
                    The same two facts fall out of the small collection in numbers anyone can check, and under plain counts they are whole numbers. Its four numbers are the square roots of 7, 3, 1 and 1, so the shares are seven twelfths, three twelfths, one twelfth and one twelfth. On the first direction all four documents sit at the square root of seven over two, which is 1.3229, the same value for every one of them, so it does not merely fail to separate the pairs, it reports them as identical.
                  </p>
                  <p>
                    On the second, the two cat documents sit at one value and the two boat documents at minus it. The word the sits at 2 on the first direction and at exactly 0 on the second, in the same place a word used in every document has to be.
                  </p>
</>
                </WorkedExample>
                <WhyThisWorks title="Where 7, 3, 1 and 1 come from, with a pencil">
                  <p>
                    Count, for every pair of the four documents, how many
                    words the two share. A document shares all three of its
                    words with itself, the two cat documents share two, the two
                    boat documents share two, and a cat document and a boat
                    document share only the word the.
                  </p>
                  <Equation>{`                  the cat sat   the cat ran   the boat sailed   the boat sank
the cat sat            3             2               1                1
the cat ran            2             3               1                1
the boat sailed        1             1               3                2
the boat sank          1             1               2                3`}</Equation>
                  <p>
                    A direction over the documents is a pattern of signs, and
                    the square of its number is what one row of this table
                    adds up to when the pattern&rsquo;s signs are put on it.
                    There are four patterns worth trying. Every document alike,
                    the cat pair against the boat pair, one cat document
                    against the other, and one boat document against the
                    other.
                  </p>
                  <Equation>{`every document alike              3 + 2 + 1 + 1  =  7
cat pair against boat pair        3 + 2 − 1 − 1  =  3
one cat document against the other        3 − 2  =  1
one boat document against the other       3 − 2  =  1`}</Equation>
                  <p>
                    The largest belongs to the pattern with no minus sign in
                    it, which is Perron&rsquo;s theorem on four documents, and
                    the next to the pattern that tells the halves apart. The
                    four add up to 12, the number of filled cells in a table
                    whose every filled cell holds a 1, and that is where the
                    twelfths come from. The pattern with every document alike,
                    scaled to length one, puts a half on each of the four, and
                    a half of the square root of 7 is the 1.3229 above.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Two directions are needed before this collection says anything
                  about its subject, and the first of them is spent on something
                  else. That is the general shape rather than a quirk here, and
                  it is why a fit that keeps one direction of a count table is
                  usually worth nothing at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Subtracting each word’s mean first">
                <p>
                  The other decomposition on this site starts by moving the data
                  so that its mean is at the origin, and that step is exactly
                  what is missing here. It is worth doing to the same table, once,
                  to see what the omission costs and what it buys.
                </p>
                <p>
                  Subtract from every row its own mean across the documents and
                  decompose what is left. The leading direction is now the
                  separating one, with the cooking half at 2.5388 and the sailing
                  half at −2.5388, and it carries 29.4% of the table against the
                  26.3% the unshifted leading direction carried. Every negative
                  entry the shift introduced is what makes the sign change
                  possible, and Perron no longer applies because the matrix is no
                  longer non-negative.
                </p>
                <NumberTable
                  headings={[
                    "the table",
                    "the leading direction’s share",
                    "the two halves on it",
                    "one mean minus the other",
                  ]}
                  rows={[
                    ["as counted", "26.3%", "2.7948 and 2.7948", "4.4 × 10⁻¹⁶"],
                    ["after shifting", "29.4%", "2.5388 and −2.5388", "5.0777"],
                  ]}
                  caption="The same twenty-four documents under weighted counts, decomposed twice. Shifting moves the split from the second direction to the first and changes nothing else about the fit that this page reports."
                />
                <>
<p>
                  So why not shift? Because the table has an interpretation the shifted one loses. An entry of the table as counted is a weight a document actually gave a word, and a rebuilt entry is a guess at the same quantity, which is what makes the rebuild readable and what makes a new document foldable into the space later.
                </p>
                <p>
                  Shifting also fills every empty cell with the negative of a row mean, which on a table that is 73.9% empty means almost the whole of it stops being sparse, and on a real collection that is the difference between a computation that fits in memory and one that does not.
                </p>
</>
                <KeepInMind>
                  The two methods are the same arithmetic applied to different
                  tables, and the choice of table is where they part company. A
                  reader arriving from the other page should expect the leading
                  direction here to behave unlike the leading component there,
                  since one of them was computed after a shift that the other
                  never performs.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "The squared error of a rebuild and the weight that was thrown away are one quantity, not two that happen to agree.",
              true,
              "The directions over the words are at right angles to one another and so are the directions over the documents, so the total squared size of the table splits cleanly into a contribution per piece, and dropping a piece removes its contribution and nothing else. On the twenty-four documents at two directions kept, both are 371.3389, which means the size of the error is known before the rebuild is made.",
            ),
            choice(
              "Rebuilt from two directions, the row of flour holds about 1.1 in all twelve cooking documents where the collection used it in six. What should be made of that?",
              [
                "It is the point of the method rather than a side effect, and the numbers it writes where the collection was silent are not evidence about the word and the document they sit between",
                "It shows the fit has learned what cooking is",
                "It is a rounding artefact of keeping too few directions",
                "It means flour really was used in all twelve and the counts were lost",
              ],
              0,
              "Across the whole table the empty cells come back at 0.4043 on average and the largest at 1.2970, which is more than half of the 2.2730 that a single observed use of flour carries. The rebuild also writes numbers no count can be, 104 cells below zero at two directions and 208 at eight, because the fit is minimising a squared difference and was never told its entries are counts.",
            ),
            several(
              "Which of these hold for the twenty-four documents once the table has been squeezed?",
              [
                "A fit keeping two directions reports 48.0 percent of the table, a share whose denominator was worked out before the cut",
                "The two cooking documents that share no word come out at 0.9998, above the 0.0819 of the cooking and sailing pair that share one",
                "Flour against bake and flour against anchor, both exactly zero in the table as counted, come out at 1.0000 and −0.0028",
                "The running total of the shares reaches the whole table at the fourteenth direction and never moves again",
              ],
              [0, 1, 2, 3],
              "All four hold. After the cut the discarded numbers are gone, so a share worked out then would report that the fit had kept everything. The reversal among the documents, and the two word pairs ending at opposite ends of the range, is the method doing the job it was invented for, and none of it amounts to the fit having learned about cooking, since flour and bake are simply used in documents that use the same other words. Twenty-three words over twenty-four documents arranged in this cycle leave only fourteen directions with any spread in them at all.",
            ),
            choice(
              "Why can the leading direction of a count table not put the two halves on opposite sides?",
              [
                "A matrix with no negative entry has a leading direction with no negative entry either, so every document gets a coordinate of the same sign and there are no opposite sides to be on",
                "That direction carries too small a share of the table to say anything",
                "The weighting flattens it",
                "The three shared words cancel along it",
              ],
              0,
              "Measured, every coordinate lies between 2.6501 and 2.8994 and the two halves’ means differ by 4.4 times ten to the minus sixteen, which is the last bit of a double-precision number rather than a difference. That direction carries 26.3 percent of the table and measures how much of the common vocabulary a document uses, which is close to how long it is. The split is complete on the second direction instead.",
            ),
            several(
              "Each row is shifted by its own mean across the documents before decomposing. Which of these follow?",
              [
                "The leading direction becomes the separating one, carrying 29.4 percent against the unshifted leading direction’s 26.3",
                "Perron no longer applies, because the matrix is no longer non-negative",
                "A rebuilt entry is still a guess at a weight some document gave a word",
                "Every empty cell is filled with the negative of a row mean, so a table that is 73.9 percent empty stops being sparse",
              ],
              [0, 1, 3],
              "The shift is what makes a sign change possible and what the leading direction gains by. What it costs is the reading, since an entry of the unshifted table is a weight a document actually gave a word, and that is what makes the rebuild readable and a new document foldable later. On a real collection the loss of sparsity is the difference between a computation that fits in memory and one that does not.",
            ),
        ],
        },
        {
          title: "Part 5. A Position For Every Word And Every Document",
          content: (
            <>
              <SubSection title="14. Two questions from one fit">
                <p>
                  The decomposition hands back two sets of directions, one over
                  the words and one over the documents, and both are scaled by
                  the numbers that say how much each direction accounts for. That
                  gives a coordinate list for every word and a coordinate list
                  for every document, in one space, from one fit.
                </p>
                <Equation>{"position of a word = U(k) S(k)        position of a document = V(k) S(k)"}</Equation>
                <p>
                  The scaling by those numbers is not decoration. Without it
                  every direction would count alike, and with it the inner
                  products between two words reproduce exactly the inner products
                  of the rebuilt table, which is the quantity the fit was chosen
                  to get right. The same holds for two documents.
                </p>
                <NearestInOneSpace />
                <p>
                  At six directions kept, the words nearest flour are sugar at
                  0.8777, pan at 0.8561, butter at 0.6810, then the shared word
                  and at 0.6756, then dough at 0.6193, and the documents nearest
                  the first one are flour sugar butter the eggs oven at 0.9963,
                  pan flour and sugar butter eggs at 0.9161 and sugar butter eggs
                  the oven bake at 0.8686. The first of those shares five
                  content words with the first document and the other two share
                  four each, which is the ordering anybody would have written by
                  hand.
                </p>
                <KeepInMind>
                  No other method on these pages answers both questions from one
                  fit. A method that learns word vectors by sliding a window
                  gives a text a position only by combining its words&rsquo;
                  positions afterwards, which is a second decision with its own
                  consequences; here the document coordinates came out of the
                  same decomposition as the word coordinates and needed no extra
                  rule.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where a squeeze this hard loses more than it keeps">
                <p>
                  The two directions that separated the halves so cleanly also
                  flattened everything inside a half. Every pair of cooking words
                  comes out between 0.9999 and 1.0000, so the fit cannot tell
                  flour from sugar, and cannot tell either of them from any of
                  the other eight cooking words. Every pair of cooking documents
                  comes out at 1.0000 as well, so asking which document is
                  nearest the first one returns a list in which every entry is at
                  the top.
                </p>
                <p>
                  The table as counted does better at that question, and it is
                  worth saying so plainly. Its angles between two cooking words
                  run all the way from 0.0000 to 0.8571, which is a real
                  ordering, and the fit at two directions replaces that ordering
                  with a single value. Switch the widget in Part 1 to the second
                  view and the amber band collapses to a point at the second row.
                </p>
                <NumberTable
                  headings={[
                    "the reading",
                    "of the table kept",
                    "angles inside a half, smallest to largest",
                    "mean angle across the halves",
                  ]}
                  rows={[
                    ["the table itself", "everything", "0.0000 to 0.8571", "0.0000"],
                    ["2 directions kept", "48.0%", "0.9999 to 1.0000", "0.0021"],
                    ["4 directions kept", "68.0%", "0.1247 to 1.0000", "0.0000"],
                    ["6 directions kept", "84.2%", "0.0727 to 0.9553", "0.0000"],
                    ["12 directions kept", "99.2%", "0.0030 to 0.8692", "0.0000"],
                    ["23 directions kept", "100.0%", "0.0000 to 0.8571", "0.0000"],
                  ]}
                  caption="The twenty-four documents under weighted counts. The last row keeps every direction, so the rebuild is the table again and the angles agree with the first row to nine decimal places, which is the agreement test for the whole procedure."
                />
                <p>
                  Six directions is where both things are true at once, with the
                  halves still apart at 0.0000 across and the words of one half
                  spread from 0.0727 to 0.9553. Nothing computed during the fit
                  turns over as the width passes that value, and the shares in
                  step 9 do not point at it either, since they fall smoothly. The
                  width is a judgement made from outside.
                </p>
                <KeepInMind>
                  Reading the table directly is the obvious alternative to
                  fitting it, and at this size it wins on one of the two
                  questions. It orders the words of one half where a hard squeeze
                  cannot, and it fails completely at the question the method was
                  invented for, which is the pair that never met.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A new document, placed without refitting">
                <p>
                  A collection that has been fitted once should not have to be
                  fitted again to say where a new text belongs. Weight the new
                  text&rsquo;s counts over the vocabulary already fitted, then
                  multiply by the directions over the words, and the answer is a
                  position in the same space as everything else.
                </p>
                <Equation>{"position of a new document = U(k)ᵀ x,   with x weighted by the fitted weights"}</Equation>
                <p>
                  The weights have to be the fitted ones rather than weights
                  recomputed from the new text, since a word&rsquo;s weight is a
                  statement about the collection and a single new document would
                  say that every word in it is equally rare. Applied to a
                  document that was in the fit, the same arithmetic returns
                  exactly the position that document already had, which is how
                  the two routes are held together.
                </p>
                <WorkedExample title="Three texts handed to the fitted space">
                  <>
<p>
                    We bake the dough and whisk the eggs lands at 3.7471 on the first direction and −1.9689 on the second, which is the cooking side. The crew sail the boat past the harbour lands at 3.3330 and 2.0586, which is the sailing side, and the word past is simply ignored because the collection never contained it.
                  </p>
                  <p>
                    A quiet afternoon lands at 0 and 0, since not one of its words is in the vocabulary, and a position of zero has no direction, so nothing is near it and asking what it resembles has no answer.
                  </p>
</>
                </WorkedExample>
                <p>
                  Type a text into the box under the playground to try this. A
                  text built from cooking words appears among the cooking
                  documents and one built from sailing words among the sailing
                  ones, and a text built from words the collection never saw
                  appears at the origin with a note saying why.
                </p>
                <KeepInMind>
                  Folding in is not refitting. The directions were chosen by the
                  original collection and a folded document is described in
                  terms of them, so a new document about something the collection
                  never covered gets a position that says how much it looks like
                  the subjects that were covered, which may be very little.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What it costs">
                <p>
                  The table on the twenty-four documents holds 552 numbers. A fit
                  keeping two directions holds 46 for the words, 48 for the
                  documents and 2 for the directions themselves, which is 96, and
                  a fit keeping six holds 288. That is the trade the method
                  offers, and at this size it is a factor of about six.
                </p>
                <NumberTable
                  headings={[
                    "what is stored",
                    "numbers",
                    "of the table kept",
                  ]}
                  rows={[
                    ["the whole table", "552", "100.0%"],
                    ["2 directions", "96", "48.0%"],
                    ["4 directions", "192", "68.0%"],
                    ["6 directions", "288", "84.2%"],
                  ]}
                  caption="Twenty-three words across twenty-four documents. The factorized representation saves storage only at sufficiently small widths."
                />
                <Equation>{"factorized storage = 23k + 24k + k = 48k values\noriginal table = 23 × 24 = 552 values"}</Equation>
                <p>
                  The saving looks thin because the collection is tiny, and the
                  shape of the arithmetic says why it is not thin in practice.
                  The table grows as the vocabulary times the number of documents
                  and the fit grows as their sum times the width, so at a hundred
                  thousand words and a million documents the table has a hundred
                  billion cells and a fit at three hundred directions has about
                  three hundred and thirty million numbers.
                </p>
                <KeepInMind>
                  The computation this page performs is a full decomposition of a
                  dense table, which costs the smaller side times the product of
                  both sides. On any collection worth the method a table that
                  dense cannot be held at all, and the usual answer is a sparse
                  table together with a decomposition that only ever computes the
                  leading few directions, which is an optimisation of this
                  calculation rather than a different one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Latent Semantic Analysis Stops Being Defined",
          content: (
            <>
              <SubSection title="18. A zero is a silence, and the fit reads it as a number">
                <p>
                  A cell holding zero means the collection did not observe that
                  word in that document. It does not mean the word does not
                  belong there, and the table has no way of saying which of the
                  two it meant. On the twenty-four documents that is 408 of the
                  552 cells, and on a real collection it is essentially all of
                  them.
                </p>
                <p>
                  The squeeze does not treat those cells as unknown. It minimises
                  the squared difference over every cell of the table, so a cell
                  holding zero is an observation of the value zero and the fit is
                  penalised for placing anything else there. A word that truly
                  belongs to a document it was never used in and a word that
                  truly does not belong there are pushing the fit in exactly the
                  same direction with exactly the same force.
                </p>
                <p>
                  That is a real modelling choice with a cost that can be stated.
                  Treating an empty cell as unknown rather than as a zero is a
                  different problem, the one a recommender solves when most of
                  the ratings are missing, and it has no closed-form answer of
                  this kind; the decomposition here is exact and quick precisely
                  because it is allowed to assume every cell was observed.
                </p>
                <KeepInMind>
                  The rebuild puts 0.4043 on average into the cells the
                  collection left empty, and the fit arrived at those numbers
                  while being told the true value in each of them was zero. Both
                  statements are true at once, and neither is evidence that the
                  filled-in number is right.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The directions are chosen for spread">
                <p>
                  The directions are chosen to account for as much of the
                  table&rsquo;s squared size as possible, and that is a statement
                  about where the numbers vary, not about what anyone wants to
                  know. Nothing in the procedure looks at a subject, a label or a
                  question. The strongest direction on this collection carries
                  26.3% of the table and measures how much common vocabulary a
                  document uses.
                </p>
                <p>
                  So a direction describes whatever the collection happened to
                  vary along. Assemble a collection where every document is
                  about one subject and differs only in length, and the leading
                  directions describe length; assemble one where half the
                  documents were transcribed by a different typist, and they may
                  describe the typist. The method has no way to prefer one of
                  those to another, and a fit gives no sign that it has found
                  something uninteresting.
                </p>
                <>
<p>
                  A related consequence is that the individual coordinates carry no meaning even when the fit is good. Two directions of equal strength are only determined up to a rotation within the plane they span, so the pair can be turned arbitrarily and the rebuild is unchanged. The four-document collection has exactly that, since its third and fourth numbers are both exactly 1, so its third and fourth directions are settled by the arithmetic and not by the data.
                </p>
                <p>
                  Each direction is also determined only up to a sign, since flipping a word direction and its matching document direction together leaves everything the fit says unchanged.
                </p>
</>
                <KeepInMind>
                  Anything read off these coordinates has to survive a sign flip
                  and, where numbers are tied, a rotation. An angle between two
                  words survives both; the value of one coordinate survives
                  neither, and neither does a comparison of one fit&rsquo;s third
                  coordinate with another&rsquo;s.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. One row per spelling">
                <p>
                  The table has one row for each distinct spelling, so a word
                  used for two unrelated things contributes both sets of company
                  to one row and gets one position. There is no second position
                  for the second sense to occupy, because there is no second row.
                </p>
                <p>
                  This is where the method states the limitation most plainly of
                  anything on these pages, since the row is right there to look
                  at. Take the running collection and respell one cooking word
                  and one sailing word as roll, a bread roll in one half and the
                  roll of a boat in the other. Nothing else changes.
                </p>
                <TwoSensesOneRow />
                <p>
                  Roll lands at zero on the direction that separates the halves,
                  in the same place the three words carrying no subject sit, and
                  its nearest neighbours are those three words at 1.0000, 0.9997
                  and 0.9997. It is 0.7219 from flour and 0.7050 from sail,
                  almost the same distance from both. One row holds the company
                  of both senses at once, and the position that fits both sets of
                  company is the one halfway between them, which is where the
                  words carrying no subject already sit.
                </p>
                <KeepInMind>
                  Matching by word fails in two directions, and the 1990 paper
                  is explicit that it addresses one of them. A request missing a
                  document because the two chose different spellings is what the
                  squeeze repairs; a request reaching a document because the two
                  shared a spelling used for different things is left exactly
                  where it was.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The cases with nothing to compute">
                <p>
                  Several inputs leave the method with nothing to work out rather
                  than something approximate to work out, and a few more leave it
                  with a genuine choice whose cost is worth knowing. The table
                  gathers both, with what the mathematics says in each case.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a cell holding zero",
                      reason:
                        "defined, and read as an observation of the value zero. The table cannot distinguish a word absent because it does not belong from a word absent because the writer chose another one, and the fit is penalised equally for departing from either. Here that is 408 of 552 cells.",
                    },
                    {
                      expression: "a document holding no word of the vocabulary",
                      reason:
                        "its column is entirely zero, so its position is the origin. The origin has no direction, so the angle between it and anything else is a zero divided by a zero and is undefined; a rank ordering of what such a document resembles does not exist rather than being empty.",
                    },
                    {
                      expression: "a word absent from the collection",
                      reason:
                        "there is no row, so no position. The honest answer is a refusal rather than a default position the collection never implied, and a new document containing the word is placed from its other words with that one ignored.",
                    },
                    {
                      expression: "asking for more directions than the table has",
                      reason:
                        "undefined. A table of m words by n documents has at most the smaller of m and n directions, so a twenty-third is the last one twenty-three words over twenty-four documents can offer and a twenty-fourth names something that is not there.",
                    },
                    {
                      expression: "asking for more directions than the table varies along",
                      reason:
                        "permitted, and empty. Rows that repeat one another leave directions accounting for exactly nothing, and this collection has twenty-three, of which only fourteen carry any spread, so directions fifteen and up hand every word and every document a coordinate of zero and are settled by the arithmetic rather than by the data.",
                    },
                    {
                      expression: "keeping exactly one direction",
                      reason:
                        "defined, and useless for separating anything. The table has no negative entry, so its leading direction has none either, and every document lands on one side of nothing. On the four documents every one of them lands on exactly the same value, 1.3229, so the fit reports four documents as one.",
                    },
                    {
                      expression: "two directions of equal strength",
                      reason:
                        "the plane they span is determined and the pair inside it is not, since any rotation within that plane rebuilds the same table. The four-document collection has two directions of strength exactly 1, so nothing that depends on which of those two a coordinate belongs to means anything.",
                    },
                    {
                      expression: "the sign of a direction",
                      reason:
                        "undetermined. Flipping a word direction together with its matching document direction leaves the rebuild identical, so a fit reports one of two equally correct answers and which one it reports is settled by the arithmetic. A cosine between two words comes through that flip unchanged, since both coordinates change sign together, and the value of a single coordinate does not.",
                    },
                    {
                      expression: "a word appearing in every document",
                      reason:
                        "defined, and a real choice about what to do with it. Weighted as the logarithm of the number of documents over the number holding it, its weight is exactly zero and the row is deleted; smoothed as this page does it, the weight is one and the row becomes the quietest in the table instead of vanishing from it. Measured on the four documents, that word takes 33.3% of a column unweighted and 22.6% weighted.",
                    },
                    {
                      expression: "a collection of one document",
                      reason:
                        "there is one column, so one direction, and it is the direction every word of that document already lies along. Nothing can be compared with anything, since the question the method answers is what company a word keeps across documents and there is only one.",
                    },
                    {
                      expression: "a rebuilt entry below zero",
                      reason:
                        "permitted, and unavoidable. The fit is a least-squares approximation over the whole table and was never told its entries are counts, so a rebuild may hold a negative weight, 104 cells of it at two directions here and 208 at eight, the least of them −0.3643.",
                    },
                    {
                      expression: "how many directions to keep",
                      reason:
                        "a real choice with nothing inside the fit to settle it. Too few and every word of a subject is forced onto one position, measured here as every pair inside a half sitting between 0.9999 and 1.0000; too many and the fit reproduces the table it was compressing, exactly so at full width. No quantity computed during the fit turns over as the width passes a good value.",
                    },
                    {
                      expression: "which of two words stood first",
                      reason:
                        "outside what the table represents. A cell counts occurrences within a document and nothing else, so the cat sat and sat the cat give one column, and no fit of the table can recover an order that was discarded before the fit began.",
                    },
                    {
                      expression: "which sense of a word is meant",
                      reason:
                        "outside what the method represents. One row per spelling, so a word used two ways contributes both sets of company to one row and settles between them, measured here at 0.7219 from a word of one sense’s half and 0.7050 from a word of the other’s, and nearest to the words that carry no subject at all.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those lines carry most of the weight in practice. The
                  table cannot tell a silence from a zero, and the fit is
                  obliged to treat it as a zero, which is the assumption every
                  filled-in number rests on; and the directions are chosen for
                  spread rather than for meaning, so a fit that has found
                  something nobody cares about looks exactly like a fit that has
                  found something.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "Keeping two directions separates the halves and orders the words inside a half at the same time.",
              false,
              "The two directions that separated the halves so cleanly also flattened everything inside one. Every pair of cooking words comes out between 0.9999 and 1.0000 and every pair of cooking documents at 1.0000, so the fit cannot tell flour from sugar. The table as counted does better at that one question, its cooking-word angles running from 0.0000 to 0.8571. Six directions is where both things hold at once, and nothing computed during the fit turns over at that width, so it is a judgement made from outside.",
            ),
            trueFalse(
              "The fit treats a cell the collection left empty as an observation of the value zero, and is penalised for placing anything else there.",
              true,
              "A cell holding zero means the collection did not observe that word in that document, which is 408 of the 552 cells here, and the table has no way of saying whether the word belongs there. The squeeze minimises the squared difference over every cell, so a word that truly belongs to a document it was never used in and a word that truly does not push the fit the same way with the same force. The 0.4043 the rebuild puts into those cells on average was arrived at while being told the true value in each was zero, and neither fact is evidence that a filled-in number is right.",
            ),
            choice(
              "A new text is folded into a fitted collection. Which weights are used on its counts?",
              [
                "The fitted ones, since a word’s weight is a statement about the collection and a single new document would say every word in it was equally rare",
                "Weights recomputed from the new text, so that it is described on its own terms",
                "None, since the new text took no part in the fit",
                "The weights belonging to the nearest fitted document",
              ],
              0,
              "Applied to a document that was in the fit, the same arithmetic returns exactly the position that document already had, which is how the two routes are held together. Folding in is not refitting, so a text about something the collection never covered gets a position saying how much it looks like the subjects that were covered, and a text with no word in the vocabulary lands at 0 and 0, where nothing is near it.",
            ),
            several(
              "Which of these survive the indeterminacies of the decomposition?",
              [
                "An angle between two words",
                "The value of a single coordinate",
                "A comparison of one fit’s third coordinate with another’s",
                "The rebuild itself, under a rotation of two directions of equal strength",
              ],
              [0, 3],
              "Each direction is settled only up to a sign, since flipping a word direction and its matching document direction together leaves everything the fit says unchanged. Two directions of equal strength are settled only up to a rotation within the plane they span, and the four-document collection has exactly that, its third and fourth numbers both being exactly 1, so those two directions come from the arithmetic rather than from the data.",
            ),
            choice(
              "One cooking word and one sailing word are respelled roll, and nothing else changes. Where does roll land?",
              [
                "At zero on the direction that separates the halves, 0.7219 from flour and 0.7050 from sail",
                "Among the cooking words, since that half comes first in the table",
                "At the origin, since the fit cannot place a word with two senses",
                "At two positions, one for each sense",
              ],
              0,
              "Its nearest neighbours are the three words carrying no subject, at 1.0000, 0.9997 and 0.9997, which is where a word with no position on that direction sits. One row holds the company of both senses at once and there is no second row for the second sense to occupy, so the position fitting both sets of company is the one halfway between them.",
            ),
        ],
        },
        {
          title: "Practice. Squeezing A Table With The Library",
          practice: [
            exercise(
              "Decompose the four documents under plain counts",
              ["Fit LatentSemanticAnalysis to the four-document collection, keeping all four directions and weighting by plain counts. Print the square of each direction’s number, the share of the table each carries, the first two coordinates of every document, and the first two coordinates of the word the.", "The squares should be the 7, 3, 1 and 1 of step 12, the shares should be twelfths, every document should sit at 1.3229 on the first direction, and the word the should sit at 2 and 0. Step 12 says the cat documents sit at one value on the second direction and the boat documents at minus it, without giving the value."],
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)
from oop_ml.core.natural_language_processing.embeddings.counts.term_document import (
    TermWeighting,
)

four = ["the cat sat", "the cat ran", "the boat sailed", "the boat sank"]

# Build LatentSemanticAnalysis with dimension=4 and
# weighting=TermWeighting.COUNT, and fit it to the four texts.

# Print each of singular_values squared, and each of variance_shares.

# For each text, print the first two numbers of its document vector.

# Print the first two coordinates of the word "the".`,
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)
from oop_ml.core.natural_language_processing.embeddings.counts.term_document import (
    TermWeighting,
)

four = ["the cat sat", "the cat ran", "the boat sailed", "the boat sank"]

model = LatentSemanticAnalysis(dimension=4, weighting=TermWeighting.COUNT).fit(four)
print("squares", [round(float(value) ** 2, 4) for value in model.singular_values])
print("shares ", [round(share, 4) for share in model.variance_shares])

for place, text in enumerate(four):
    first, second = model.document_vectors.vector_of(place)[:2]
    print(f"{text:15s} {first:.4f} {second:.4f}")

first, second = model.embeddings.vector_of("the").values[:2]
print(f"{'the':15s} {first:.4f} {second:.4f}")`,
              `squares [7.0, 3.0, 1.0, 1.0]
shares  [0.5833, 0.25, 0.0833, 0.0833]
the cat sat     1.3229 0.8660
the cat ran     1.3229 0.8660
the boat sailed 1.3229 -0.8660
the boat sank   1.3229 -0.8660
the             2.0000 0.0000`,
              { hints: ["The weighting is a field of the model and TermWeighting.COUNT is the plain count. Left out, the model weights by the formula of step 5, and the squares stop being whole numbers.", "A fitted model has singular_values, one per direction kept, and variance_shares beside them. Its document_vectors hold one position per document, reached with vector_of and the document’s place in the list.", "Its embeddings are the positions of the words. vector_of takes a word there, and the coordinates are the values of what comes back."], check: numberCheck("At what value do the two cat documents sit on the second direction, to four places?", 0.866, 5e-05, "The second direction is the pattern that sets the cat pair against the boat pair, and its number is the square root of 3. Scaled to length one that pattern puts a half on each document, so the cat documents sit at half the square root of 3, which is 0.8660, and the boat documents at minus it. The first direction does the same with the square root of 7 and no minus signs, which is the 1.3229 every document shares.") },
            ),
            exercise(
              "Squeeze the twenty-four documents at three widths",
              ["Fit LatentSemanticAnalysis to the twenty-four documents keeping two directions, then four, then six, with the weighting left at its default. At each width print the share of the table the kept directions carry between them and the cosine of flour with bake, of flour with sugar and of flour with anchor, and the cosine of the first document with the sixth and with the thirteenth, which are the two pairs of step 3.", "At two directions you should see the 48.0% of step 9 and the figures of step 10, with flour and bake at 1.0000 and the two cooking documents at 0.9998. At six you should see step 15, with flour and bake down at 0.0727 and flour and sugar at 0.8777. Four directions is a width the page does not report, and the pair of cooking documents that share no word is worth following down all three."],
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
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

for dimension in (2, 4, 6):
    # Fit a model keeping this many directions. Print the sum of its
    # variance_shares, the similarity of flour with bake, sugar and anchor
    # from its embeddings, and the similarity of document 0 with documents
    # 5 and 12 from its document_vectors.
    ...`,
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
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

for dimension in (2, 4, 6):
    model = LatentSemanticAnalysis(dimension=dimension).fit(documents)
    words = model.embeddings
    texts = model.document_vectors
    print(f"{dimension} directions keep {sum(model.variance_shares):.4f} of the table")
    print(f"  flour with bake {words.similarity('flour', 'bake'):.4f}, sugar {words.similarity('flour', 'sugar'):.4f}, anchor {words.similarity('flour', 'anchor'):.4f}")
    print(f"  first document with the sixth {texts.similarity(0, 5):.4f}, with the thirteenth {texts.similarity(0, 12):.4f}")`,
              `2 directions keep 0.4799 of the table
  flour with bake 1.0000, sugar 1.0000, anchor -0.0028
  first document with the sixth 0.9998, with the thirteenth 0.0819
4 directions keep 0.6801 of the table
  flour with bake 1.0000, sugar 0.8830, anchor -0.0001
  first document with the sixth 0.1743, with the thirteenth 0.0554
6 directions keep 0.8416 of the table
  flour with bake 0.0727, sugar 0.8777, anchor 0.0030
  first document with the sixth 0.0859, with the thirteenth 0.0855`,
              { hints: ["dimension is how many directions the model keeps. fit takes the list of texts and answers the fitted model.", "variance_shares has one share per kept direction, each worked out against the whole table, so their sum is what the cut kept.", "embeddings.similarity takes two words and document_vectors.similarity takes two places in the list of documents, counting from zero, so the sixth document is 5 and the first sailing one is 12."], check: numberCheck("What share of the table do four directions keep, to four places?", 0.6801, 5e-05, "The first two directions carry 26.3% and 21.7%, and the next two about a tenth each, which comes to 0.6801. Those two extra directions have begun to spread the cooking words out, flour with sugar falling from 1.0000 to 0.8830, while flour with bake is still at 1.0000, so four is not yet the width at which the fit can order the words of one half, which step 15 found at six. The widening has a price the last line of each block shows. The two cooking documents that share no word fall from 0.9998 to 0.1743 and then to 0.0859, level with the cooking and sailing pair, so the repair of step 10 belongs to the narrow fit.") },
            ),
            exercise(
              "Check the error against what was thrown away",
              ["Step 7 says the squared error of a rebuild is exactly the sum of the squares of the numbers that were discarded. Check it at two directions and at four. For each, take the table the fit decomposed and the rebuild of it, and print the summed squared difference between them beside the discarded weight. Then print how many cells the collection left empty, the mean of what the rebuild put in them, and how many cells of the rebuild are below zero.", "At two directions the two figures should both be the 371.3389 of step 7, with 408 empty cells filled to 0.4043 on average and 104 cells below zero, which is step 8. The row for four directions is yours."],
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
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

for dimension in (2, 4):
    model = LatentSemanticAnalysis(dimension=dimension).fit(documents)
    original = np.asarray(model.term_document_matrix.values)
    # The rebuild is model.decomposition.reconstruction(). The discarded
    # weight is the decomposition's total_squared_singular_values less the
    # sum of the kept singular_values squared. Print the squared error,
    # the discarded weight, the count of cells where original is 0, the
    # mean of the rebuild over those cells, and the count of rebuilt cells
    # below zero.
    ...`,
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
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

for dimension in (2, 4):
    model = LatentSemanticAnalysis(dimension=dimension).fit(documents)
    original = np.asarray(model.term_document_matrix.values)
    rebuilt = model.decomposition.reconstruction()
    error = np.sum((original - rebuilt) ** 2)
    kept = np.sum(np.asarray(model.singular_values) ** 2)
    discarded = model.decomposition.total_squared_singular_values - kept
    empty = original == 0
    print(f"{dimension} directions: error {error:.4f}, discarded {discarded:.4f}")
    print(f"  {empty.sum()} empty cells filled to {rebuilt[empty].mean():.4f} on average, {(rebuilt < 0).sum()} cells below zero")`,
              `2 directions: error 371.3389, discarded 371.3389
  408 empty cells filled to 0.4043 on average, 104 cells below zero
4 directions: error 228.3946, discarded 228.3946
  408 empty cells filled to 0.2541 on average, 136 cells below zero`,
              { hints: ["The decomposition remembers the squared size of the whole table as total_squared_singular_values, which was worked out before the cut, so subtracting the kept squares from it leaves the discarded weight.", "original == 0 is a grid of True and False the same shape as the table, and indexing the rebuild with it picks out exactly the cells the collection never wrote in."], check: numberCheck("What is the squared error of the rebuild from four directions, to four places?", 228.3946, 5e-05, "The whole table’s squared size is the same whatever is kept, and four directions keep 0.6801 of it where two kept 0.4799, so the error falls from 371.3389 to 228.3946 and matches the discarded weight to every digit printed, because dropping a piece removes its contribution and nothing else. The empty cells are filled less heavily, 0.2541 against 0.4043, and more of the rebuild goes below zero, 136 cells against 104, since nothing told the fit its entries are counts.") },
            ),
            exercise(
              "Fold new texts into a fitted collection",
              ["Fit the twenty-four documents at two directions and fold in the three texts of step 16 with transform, together with a fourth that takes two words from each half. Print the two coordinates of each. Then fold the twenty-four fitted documents themselves back in and print the largest difference from the positions the fit gave them, and print the second coordinate of whisk, eggs, deck and boat.", "The first three should be the figures of step 16, the cooking side, the sailing side and the origin. The fitted documents should come back where they were, to rounding. Read the second coordinates of the four words before deciding where the fourth text ought to land."],
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
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

texts = [
    "we bake the dough and whisk the eggs",
    "the crew sail the boat past the harbour",
    "a quiet afternoon",
    "whisk the eggs on the deck of the boat",
]

model = LatentSemanticAnalysis(dimension=2).fit(documents)

# Fold the texts in with model.transform, and print each one's two
# coordinates, which vector_of gives by the text's place in the list.

# Fold the fitted documents in the same way and print the largest absolute
# difference between those vectors and model.document_vectors.vectors.

# Print the second coordinate of whisk, eggs, deck and boat.`,
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
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

texts = [
    "we bake the dough and whisk the eggs",
    "the crew sail the boat past the harbour",
    "a quiet afternoon",
    "whisk the eggs on the deck of the boat",
]

model = LatentSemanticAnalysis(dimension=2).fit(documents)

folded = model.transform(texts)
for place, text in enumerate(texts):
    first, second = folded.vector_of(place)
    print(f"{first:.4f} {second:7.4f}  {text}")

again = np.asarray(model.transform(documents).vectors)
fitted = np.asarray(model.document_vectors.vectors)
print(f"fitted documents folded back in move by at most {np.abs(again - fitted).max():.1e}")

for word in ("whisk", "eggs", "deck", "boat"):
    print(f"{word:5s} {model.embeddings.vector_of(word).values[1]:7.4f}")`,
              `3.7471 -1.9689  we bake the dough and whisk the eggs
3.3330  2.0586  the crew sail the boat past the harbour
0.0000  0.0000  a quiet afternoon
3.2910  0.0000  whisk the eggs on the deck of the boat
fitted documents folded back in move by at most 3.1e-14
whisk -2.3562
eggs  -3.1580
deck   2.3562
boat   3.1580`,
              { hints: ["transform takes a list of texts and answers their positions in the fitted space, without refitting anything. What comes back has vector_of, taking a place in the list, and vectors, the whole grid.", "The weights transform puts on a new text’s counts are the ones the fit worked out, which is why a fitted document folded in lands where the fit put it.", "A word’s coordinates are model.embeddings.vector_of(word).values, and the second of them is at index 1."], check: numberCheck("Where on the first direction does the text with two words of each half land, to four places?", 3.291, 5e-05, "It lands at 3.2910 on the first direction and at 0.0000 on the second. whisk and deck sit at −2.3562 and 2.3562 on the direction that separates the halves and eggs and boat at −3.1580 and 3.1580, so the two cooking words pull the text exactly as far one way as the two sailing words pull it the other, while on and of are ignored because the collection never contained them and the word the adds nothing there because it is used equally on both sides. What is left is the first direction, which measures how much of the common vocabulary a text uses.") },
            ),
          ],
        },
      ]}
    />
  );
}
