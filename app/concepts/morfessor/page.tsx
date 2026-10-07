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
import { CountCutLadder } from "@/components/widgets/CountCutLadder";
import { DescriptionCostBars } from "@/components/widgets/DescriptionCostBars";
import { HeldOutReadings } from "@/components/widgets/HeldOutReadings";
import { MorfessorPlayground } from "@/components/widgets/MorfessorPlayground";
import { SearchEpochs } from "@/components/widgets/SearchEpochs";
import { UphillSplits } from "@/components/widgets/UphillSplits";
import { WeightDial } from "@/components/widgets/WeightDial";

export const metadata: Metadata = {
  title: "Morfessor · oop_ml",
  description:
    "Learn recurring word parts by balancing the cost of a piece inventory against the cost of the text.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function MorfessorPage() {
  return (
    <ConceptPage
      lessonId="morfessor"
      intuition={lessonIntuitions["morfessor"]}
      technicalStart="Part 2. The Shortest Description"
      openingTitle="Where Would the Language Put the Cut?"
      playgroundIntro="Compare the inventory cost and corpus cost for alternative cuts. Check which familiar word parts emerge and which cuts follow frequency instead."
      title="Morfessor"
      tagline="Learn recurring word parts by balancing the cost of a piece inventory against the cost of the text."
      prerequisites={
        <>
          You need two things from earlier in this section. Something has
          already decided where the words are, so everything below takes a text
          cut on its spaces and asks what the pieces inside a word should be.
          And you have seen a vocabulary grown by counting, where the piece
          bought next is whichever one shortens the corpus most right now. This
          page keeps the same question and changes the answer to it, so the
          first part is a measurement of what counting does to words whose
          joints nobody disputes. Logarithms appear, and one binomial
          coefficient, and nothing else.
        </>
      }

      playground={<MorfessorPlayground />}
      sections={[
        {
          title: "Part 1. Where a Count Puts Its Cuts",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twelve words whose joints nobody disputes">
                <p>
                  Every page in this section carries the same sentence, and this
                  one carries a very small corpus beside it, because the
                  argument needs words we can already agree about. Three verbs
                  in four forms each, walk and talk and play, with the bare stem
                  and the three endings s, ed and ing, twelve words in all,
                  each occurring three times. These familiar forms give us an
                  intuitive linguistic reference: walking contains the stem
                  walk and the ending ing. We can compare learned pieces with
                  that reference while remembering that a compression
                  objective is not itself a test of grammatical correctness.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  The sentence comes back in Part 6, read by tables fitted to
                  eighteen sentences of ordinary English. The twelve forms are
                  where the mechanism is worked out, because they are small
                  enough that every number below can be checked. Their familiar
                  structure also makes it easier to see when the statistical
                  objective prefers a different split from the linguistic one.
                </p>
                <KeepInMind>
                  This small corpus is a test instrument. Thirty-six word occurrences tell
                  us where a method puts its cuts and why it put them there,
                  which is all the twelve forms are being asked for; how any of
                  this behaves on a billion words is a different question and
                  one this corpus cannot answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What counting buys first">
                <p>
                  Grow a vocabulary on those twelve words by the usual rule,
                  which is to start from single characters and repeatedly join
                  whichever adjacent pair occurs most often. The twelve forms
                  use 13 distinct characters, which comes to 15 symbols once a
                  character that ends a word is held apart from the same
                  character inside one, so the smallest table is 16 rows and
                  every row after that is bought by a merge.
                </p>
                <CountCutLadder />
                <>
<p>
                  The first four rows bought are al, alk, la and pla. Every one of them cuts a stem somewhere inside it. The reason is not subtle. In walk and talk, and in every form built on either of them, the letters a and l sit next to each other, which is eight of the twelve words, and the counting finds no pair that occurs more often than that.
                </p>
                <p>
                  So a joins l, and then al joins k, and by the third row the play forms have contributed la. Nothing in the counting has any way of preferring the boundary between walk and ing to the boundary between w and alk.
                </p>
</>
                <KeepInMind>
                  The three stems arrive as the eighth, ninth and tenth rows
                  bought, behind seven rows that cut across them. A vocabulary
                  that is stopped anywhere before that has spent every row it
                  had on pieces which straddle a joint.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The same cut on ordinary English">
                <p>
                  That could be an artefact of twelve made-up words, so here is
                  the same thing on eighteen sentences of ordinary English about
                  reports and costs and analyses, 72 distinct words across 133
                  occurrences, grown to the point where no adjacent pair occurs
                  twice any more, which is 135 rows. The pieces it holds are the
                  frequent substrings of those eighteen sentences, and where
                  they fall relative to a word&rsquo;s parts is not something
                  the fit had an opinion about.
                </p>
                <NumberTable
                  headings={["the word", "shortest description", "commonest pair"]}
                  rows={[
                    ["lower", "low · er", "lower"],
                    ["lowest", "low · est", "lowe · st"],
                    ["costing", "cost · ing", "costing"],
                    ["costs", "cost · s", "co · sts"],
                    ["analysts", "analysts", "analy · sts"],
                    ["reran", "reran", "re · r · an"],
                    ["readings", "readings", "re · a · d · in · g · s"],
                  ]}
                  caption="Both tables hold 135 rows and were fitted to the same eighteen sentences. The left column is the method this page is about, and it is what Part 2 onwards builds."
                />
                <p>
                  Two of those are worth pausing on. The merge-grown table cuts
                  lowest into lowe and st, which puts the cut one letter to the
                  left of the joint, and costs into co and sts, which puts it
                  two letters to the left. Both are frequent substrings of that
                  corpus and neither is a part of anything. On the running
                  sentence the same table reads analysis with its full stop as
                  analysi followed by s with the stop attached, and reads the
                  first half of low-cost as lo followed by w.
                </p>
                <KeepInMind>
                  A frequent substring and a part of a word are different
                  things, and on any real corpus they disagree often. The
                  question this page answers is what could be asked for instead,
                  given that nobody is going to label the joints.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What is missing is a reason to prefer a joint">
                <>
<p>
                  It would be easy to conclude that counting is simply the wrong rule, and that is not it. The rule is doing exactly what it promises, which is to buy the row that removes the most pieces from the corpus right now. What it lacks is any notion that a set of pieces has a price of its own.
                </p>
                <p>
                  Every row costs the same as every other row, one, so the only thing left to compare is the saving, and a piece that spans a joint saves just as readily as one that respects it.
                </p>
</>
                <>
<p>
                  Suppose instead that a set of pieces had a price which depended on what the pieces were. A short list of pieces that recur all over the corpus would then be cheap, and a long list of pieces each used once would be dear, and the arithmetic itself would have a reason to prefer walk and ing over w and alk, since alk turns up in eight words but leaves a stray w or t outside it in every one of them, and those strays have to be paid for too.
                </p>
                <p>
                  That is the idea the rest of this page works out, and the work is in making &ldquo;price&rdquo; mean something exact.
                </p>
</>
                <KeepInMind>
                  Nothing here says the joints are recoverable from text alone.
                  The claim is narrower, that a criterion which charges for the
                  list of pieces as well as for the text sometimes lands on the
                  joints where a criterion that charges only for the text does
                  not.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Shortest Description",
          content: (
            <>
              <SubSection title="5. Two ways to write a word list down">
                <p>
                  Imagine having to send somebody the twelve forms over a wire
                  that charges by the symbol. One way is to spell each word out.
                  That needs no list of pieces at all, and it spells walk four
                  times over, once inside each of walk, walks, walked and
                  walking, and spells talk and play four times each as well. The
                  other way is to send a list of pieces first, and then send each
                  word as a run of references into that list. Now walk is spelled
                  once, and walking is two references.
                </p>
                <p>
                  Neither is obviously better, and which one wins depends on
                  numbers. The list has to be paid for, and every reference has
                  to be paid for, and a piece that is used once has cost us a
                  place in the list to save nothing. Creutz and Lagus took that
                  arithmetic seriously and made it the definition. The best set
                  of pieces is the one for which the list plus the text, added
                  together, is shortest.
                </p>
                <KeepInMind>
                  The two parts are not two objectives to be balanced by taste.
                  They are two halves of one message, and the thing being
                  minimised is the length of that message, which is a single
                  number.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Three amounts, added">
                <>
<p>
                  The message has three parts and it is worth naming them before any formula. The first spells every piece of the list out, one character at a time, with a marker after each so a reader knows where one spelling stops. The second says how often each piece is used, since a reader who is about to decode references needs to know what they are worth.
                </p>
                <p>
                  The third is the corpus itself, written as a run of references, where a piece that is used often is cheap per use and a piece that is used once is dear every single time.
                </p>
</>
                <Equation>{`description  =  spelling the list  +  writing the counts  +  writing the text`}</Equation>
                <p>
                  The first two together are the price of the list, and they fall
                  as the list gets shorter. The third is the price of the text,
                  and it rises as the pieces get smaller, because smaller pieces
                  mean more references. Section 8 prices both of them on the
                  twelve forms and watches the two move against each other.
                </p>
                <KeepInMind>
                  All the logarithms here are natural, so the amounts are in
                  nats. A nat is about 1.4427 bits, and the unit cancels out of
                  every comparison on this page, so nothing turns on it.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Two words, small enough to check by hand">
                <p>
                  The smallest corpus with a real decision in it is two words,
                  walk and walks, once each. Left whole the list holds two
                  pieces and the text is two references. Split, the list holds
                  walk and s, the text is three references, and walk is now used
                  twice.
                </p>
                <WorkedExample title="walk and walks, both ways">
                  <p>
                    Left whole, the list is walk and walks, which is nine
                    characters with two end markers, eleven symbols in all.
                    Spelling that costs 19.4454. There is only one way to deal
                    two references between two pieces, so saying how often each
                    is used costs nothing at all. Writing the text costs 1.3863,
                    since each of the two references is worth one of two equally
                    likely pieces. The three add to 20.8317.
                  </p>
                  <p>
                    Split into walk and s, the list is five characters with two
                    end markers, seven symbols, and spelling it costs 12.2351.
                    Now there are two ways to deal three references between two
                    pieces, so the counts cost 0.6931. Writing the text costs
                    1.9095, since there are three references and one of the two
                    pieces is rarer than the other. The three add to 14.8378,
                    which is 5.9939 shorter.
                  </p>
                </WorkedExample>
                <p>
                  Look at which part paid for which. Splitting made the text
                  dearer, by 0.5232, and made the counts dearer, by 0.6931. It
                  made the spelling cheaper by 7.2103, because walk stopped being
                  written down twice. On a corpus of two words the shared stem
                  already pays for the split, and it pays out of the spelling.
                </p>
                <KeepInMind>
                  A split always makes the text longer, since it turns one
                  reference into two. It can only be worth making if the list
                  gets shorter by more, and the list gets shorter exactly when
                  the piece it removes was being spelled out inside several
                  words.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why the middle is a minimum">
                <>
<p>
                  With twelve words rather than two we can price the two extremes and something in between, and see the shape. Give every word a piece of its own and the text is as short as it can be, 36 references for 36 word occurrences, while the list is as long to write out as it can be, 78 symbols.
                </p>
                <p>
                  Give every character a piece of its own and the list is as cheap to spell as it gets, since each of its 13 pieces is one character, while the text has swollen to 198 references. Between them sit the three stems and the three endings.
                </p>
</>
                <DescriptionCostBars />
                <p>
                  Spelling the list falls all the way across the panel, from
                  191.7754 to 51.3662, and writing the text rises all the way,
                  from 89.4566 to 474.8646. A quantity whose two components move
                  monotonically in opposite directions has its smallest value
                  somewhere in the middle, and here that is the middle bar, at
                  185.4634 against 301.0812 for one piece per word and 569.3002
                  for one piece per character.
                </p>
                <WhyThisWorks title="Why the character extreme is so much dearer">
                  <>
<p>
                    The list of 13 characters is genuinely cheap to write down, 51.3662 against 191.7754. What ruins it is the other two parts. The text needs 198 references rather than 36, and each one is worth about the logarithm of 198 minus the logarithm of how often that character occurs, so the whole third part comes to 474.8646, more than five times what it was.
                  </p>
                  <p>
                    Saying how often each of 13 pieces is used across 198 references also costs 43.0695, against 19.8491 for twelve pieces across 36, because there are far more ways to deal 198 references into 13 piles than 36 into 12. So the 140.4092 saved on the spelling is spent several times over by the other two parts.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  There is a genuine minimum somewhere between one piece per word
                  and one piece per character, and it is a fact about the
                  arithmetic rather than a hope. Whether the minimum falls on
                  anything a linguist would recognise is a separate question, and
                  Part 7 is where it is answered honestly.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Counting a Description",
          content: (
            <>
              <SubSection title="9. Spelling the list">
                <p>
                  Writing the list out means writing its characters, and the
                  cheapest way to write a stream of symbols whose frequencies are
                  known is to give a symbol that occurs often a short code and a
                  symbol that occurs rarely a long one. The length that comes out
                  of doing that as well as it can be done is fixed by the
                  frequencies alone, and it is the expression below, where L is
                  how many symbols the whole list contains and each n is how many
                  times one symbol occurs in it.
                </p>
                <Equation>{"spelling  =  L log L  −  Σ over symbols  n log n"}</Equation>
                <p>
                  The symbols counted here are the characters of the pieces plus
                  one end marker per piece, since without the markers a reader
                  cannot tell where one spelling stops and the next begins. The
                  frequencies used are the frequencies inside the list, not
                  inside the corpus, which matters because a piece appears in the
                  list once however often the corpus uses it.
                </p>
                <WorkedExample title="Spelling the list walk, walks">
                  <>
                    <p>
                      The spelling table contains nine letters and two end markers. Four
                      letters occur twice, one occurs once, and the marker occurs twice.
                      The spelling cost subtracts the count-weighted log counts from the
                      total-length term.
                    </p>
                    <Equation>{"total length L = 9 + 2 = 11\nΣ count × ln(count) = 4 × (2 ln 2) + 1 ln 1 + 2 ln 2\n                   ≈ 6.93147\nL ln L = 11 ln 11 ≈ 26.37685\nspelling cost ≈ 26.37685 − 6.93147 ≈ 19.4454"}</Equation>
                  </>
                </WorkedExample>
                <KeepInMind>
                  This is the part that rewards reuse. A piece that turns up
                  inside four words is spelled here once rather than four times,
                  and that saving is the same whether those four words occur
                  three times each or three thousand times each, which is a fact
                  Part 5 is built on.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Writing down how often each piece is used">
                <p>
                  A reader who has the list still cannot decode a reference
                  without knowing what the pieces are worth, so the counts have
                  to be sent as well. There are N references in the corpus
                  altogether and M pieces, and every piece is used at least once,
                  so the counts are one particular way of dealing N things into M
                  non-empty piles. There are exactly as many such ways as the
                  binomial coefficient below, and saying which one it is costs its
                  logarithm.
                </p>
                <Equation>{"counts  =  log C(N − 1, M − 1)"}</Equation>
                <p>
                  It is the smallest of the three parts on every lexicon this
                  page prices, 15.6828 out of 185.4634 for the three stems and
                  three endings, and it is not decoration. It is what stops a
                  list of many rarely used pieces from looking free, since the
                  number of ways to deal the references grows with the number of
                  piles.
                </p>
                <WorkedExample title="The two-word example, both ways">
                  <p>
                    Left whole there are two references and two pieces, so N and
                    M are both 2 and there is exactly one way to deal them, one
                    each. The logarithm of one is zero, so this part costs
                    nothing. Split, there are three references and two pieces, so
                    the deals are two and one or one and two, and the cost is the
                    logarithm of 2, which is 0.6931.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Every piece is used at least once by construction, since a
                  piece nothing uses would never have been in the list. That is
                  why the count is over non-empty piles, and it is why the
                  expression has N minus one and M minus one in it rather than N
                  and M.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Writing the corpus as a run of references">
                <p>
                  The last part is the corpus itself. Each of the N references is
                  written under the simplest possible model, which is that the
                  chance of a piece is how often it occurs divided by N, with no
                  attention paid to what came before it. Writing one reference to
                  a piece used c times then costs the logarithm of N minus the
                  logarithm of c, and summing that over every reference gives the
                  expression below.
                </p>
                <Equation>{"text  =  N log N  −  Σ over pieces  c log c"}</Equation>
                <>
<p>
                  So a piece used 12 times out of 63 costs 1.6582 every time it is used, and a piece used once out of 63 costs 4.1431 every time, which is to say once. The model behind this is the crudest one available, since it says that a piece is as likely after ing as after walk, which is plainly false about language.
                </p>
                <p>
                  It is the part of the arithmetic most obviously open to improvement and the part this family of methods leaves alone, because a model with memory makes the search inside it much harder.
                </p>
</>
                <NumberTable
                  headings={[
                    "the list of pieces",
                    "pieces",
                    "references",
                    "list cost",
                    "text cost",
                    "total",
                  ]}
                  rows={[
                    ["one piece per word", "12", "36", "211.6245", "89.4566", "301.0812"],
                    ["three stems, three endings", "6", "63", "73.2276", "112.2358", "185.4634"],
                    ["one piece per character", "13", "198", "94.4357", "474.8646", "569.3002"],
                  ]}
                  caption="The twelve forms at three occurrences each, in nats. The list column is spelling plus counts, and every figure here is the one drawn in the panel above."
                />
                <KeepInMind>
                  Going from twelve pieces to six costs 22.7791 more in the text
                  and saves 138.3969 on the list. The saving is not close, which
                  is why this corpus is one the method gets right, and Part 5 is
                  what happens when it is close.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the criterion does and does not fix">
                <p>
                  With the three parts written down, the definition is complete
                  and it is worth being precise about what has been defined. A
                  set of pieces has been given a number. Any two sets of pieces
                  can now be compared, including sets nobody would ever propose,
                  and the comparison is arithmetic rather than judgement. That is
                  a great deal more than the counting rule had, since the counting
                  rule can only compare two candidates at the same vocabulary
                  size.
                </p>
                <p>
                  What has not been defined is any way of finding the best set.
                  The number of ways to cut twelve words into pieces is the
                  product over words of two raised to the number of positions
                  between characters, which is two to the fifty-fourth power for
                  these twelve, and there is no known way to search it exactly.
                  So the criterion and the search are two
                  separate things, and everything true about one of them can be
                  false about the other.
                </p>
                <KeepInMind>
                  Minimum description length names the criterion. It does not
                  name what any program returns, and the gap between the two is
                  measurable rather than theoretical, which is what Part 5
                  measures.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "Grown by joining the commonest adjacent pair, the first four rows bought on the twelve forms are al, alk, la and pla, every one of them cutting a stem. Why?",
              [
                "The letters a and l sit next to each other in eight of the twelve words and no pair occurs more often",
                "The rule prefers short pieces, and a stem is longer than the pieces it buys first",
                "The stems occur too often to be worth a row of their own",
                "The rule starts from whole words, so it has to cut a stem before it can reach one",
              ],
              0,
              "The counting is doing exactly what it promises, which is to buy the row that removes the most pieces from the corpus right now. Nothing in it prefers the boundary between walk and ing to the boundary between w and alk, because every row costs the same as every other row and only the saving is left to compare. The three stems arrive as the eighth, ninth and tenth rows bought.",
            ),
            trueFalse(
              "Splitting a word always makes the text part of the description longer.",
              true,
              "A split turns one reference into two, so the text can only grow. It is worth making when the list gets shorter by more, and the list gets shorter exactly when the piece it removes was being spelled out inside several words. On walk and walks the split costs 0.5232 more in the text and 0.6931 more in the counts, and saves 7.2103 on the spelling.",
            ),
            trueFalse(
              "Giving every character a piece of its own gives the shortest description, since the list is then as cheap to spell as it can be.",
              false,
              "The spelling really is cheapest there, 51.3662 against 191.7754 for one piece per word, and the other two parts ruin it. The text swells from 36 references to 198 and comes to 474.8646, the counts come to 43.0695 against 19.8491, and the total is 569.3002 where the three stems and three endings reach 185.4634.",
            ),
            several(
              "Which of these hold of the three parts the description is made of?",
              [
                "The spelling uses the frequencies of characters inside the list, not inside the corpus",
                "The counts are the smallest of the three on every lexicon the page prices",
                "The text is written under a model with no memory, so a piece is as likely after ing as after walk",
                "Every piece in the list is used at least once, which is why the counts are dealt into non-empty piles",
              ],
              [0, 1, 2, 3],
              "All four hold. A piece appears in the list once however often the corpus uses it, which is the saving a split is after. The counts are 15.6828 out of 185.4634 for the three stems and three endings, and they are what stops a list of many rarely used pieces from looking free. A piece nothing uses would never have been in the list, so the deal is over non-empty piles and the expression has N minus one and M minus one in it rather than N and M. What the three parts do not say is how to find the best set, since the twelve words admit two to the fifty-fourth arrangements and no exact search over them is known.",
            ),
            choice(
              "Sending the twelve forms costs the list plus the text. What happens to those two as the pieces get smaller?",
              [
                "Both fall, which is why the smallest pieces give the shortest description",
                "The list rises and the text falls, so the minimum is one piece per word",
                "The list falls and the text rises, so the minimum sits somewhere in between",
                "Neither moves, since the same characters are being sent either way",
              ],
              2,
              "Spelling the list falls all the way across the panel and writing the text rises all the way, and a quantity whose two components move monotonically in opposite directions has its smallest value somewhere in the middle. That there is a genuine minimum between one piece per word and one piece per character is a fact about the arithmetic. Whether it falls on anything a linguist would recognise is a separate question.",
            ),
        ],
        },
        {
          title: "Part 4. The Search",
          content: (
            <>
              <SubSection title="13. Start with every word whole, then reconsider one at a time">
                <p>
                  The search Creutz and Lagus proposed is about as simple as a
                  search can be. Begin with every distinct word as a piece of its
                  own, which is one of the two extremes Part 2 priced. Then take
                  the words one at a time, in a shuffled order, and for each one
                  ask whether the description would be shorter with that word cut
                  somewhere. Keep going in passes until a pass barely changes the
                  total.
                </p>
                <p>
                  The important detail is that a word is reconsidered with
                  everything else exactly as it currently stands. Its current
                  pieces are taken out of the books, the word is put back whole,
                  and the question is asked against the list as the other eleven
                  words have left it. So an early decision about walked changes
                  what the arithmetic says about walking, and the order the words
                  are visited in is a real input, which is why the order is drawn
                  from a seed and the seed is part of the fit.
                </p>
                <KeepInMind>
                  The books are the list of pieces with their counts and the
                  characters those pieces are spelled in. Every price on this page
                  is computed from those two tables as they stand at that moment,
                  so nothing is ever estimated or carried over.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The recursion on one word">
                <p>
                  Asking whether one word should be cut is a small procedure with
                  one recursive step. Price the description with the word left
                  whole. Then, for each of the positions between its characters,
                  price the description with the word replaced by the two halves
                  that position makes, and keep the cheapest. If no split is
                  strictly cheaper, the word stays whole and we are done with it.
                  If one is, take it, and then ask the same question of each half.
                </p>
                <DerivationTable
                  expressionHeading="the step"
                  reasonHeading="what it does"
                  rows={[
                    {
                      expression: "price the piece left whole",
                      reason: "with every other word’s current pieces in the books, since that is what it will actually sit beside",
                    },
                    {
                      expression: "price each split, one per gap",
                      reason: "putting both halves in, pricing, and taking them out again, so nothing is left behind by a candidate that lost",
                    },
                    {
                      expression: "take the cheapest, if it beats whole",
                      reason: "strictly, so a tie leaves the piece whole; among equally cheap splits the earliest position wins",
                    },
                    {
                      expression: "recurse into each half",
                      reason: "with the other half already in the books, so the second cut is priced against the first rather than in isolation",
                    },
                  ]}
                />
                <p>
                  Two things in that are choices rather than consequences. A
                  split has to be strictly cheaper, so a candidate that changes
                  nothing is refused, which keeps a fit from wandering between
                  equal descriptions forever. And when several positions are
                  equally cheap the earliest wins, which is arbitrary and has to
                  be stated somewhere or two runs of the same procedure disagree.
                </p>
                <KeepInMind>
                  The recursion only ever cuts. It never joins two pieces back
                  together within a word, and it never proposes a piece that is
                  not a contiguous run of some word&rsquo;s characters. Both of
                  those bound what the search can reach.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Twelve forms, six pieces, two passes">
                <p>
                  Run that on the twelve inflected forms and it works. The
                  description goes from 301.0812, which is every word whole, to
                  185.4634, and the pieces it settles on are exactly walk, talk
                  and play, used 12 times each, with s, ed and ing used 9 times
                  each. Every training word comes out as a bare stem or as a stem
                  followed by an ending, and 63 references replace 36 much longer
                  spellings.
                </p>
                <NumberTable
                  headings={["the word", "read as"]}
                  rows={[
                    ["walk", "walk"],
                    ["walks", "walk · s"],
                    ["walked", "walk · ed"],
                    ["walking", "walk · ing"],
                    ["playing", "play · ing"],
                  ]}
                  caption="Five of the twelve, with the other seven following the same pattern. Compare the merge-grown table of Part 1, which reads walking as w, alk, i, n and g until it has bought 26 rows."
                />
                <p>
                  It takes two passes, and the second one finds nothing. The
                  first pass already reaches all six pieces, and the second is
                  what lets the search know it has stopped moving, since the test
                  for stopping is that a pass changed the total by very little.
                  Every seeded visiting order tried reaches the same six.
                </p>
                <KeepInMind>
                  This is the result the method exists for, and it is worth
                  keeping in view how narrow the demonstration is. Twelve words
                  with three shared stems and three shared endings is the most
                  favourable arrangement imaginable, and the next Part uses the
                  same twelve words to break it.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A larger corpus, pass by pass">
                <p>
                  On the eighteen sentences the walk is longer and it is worth
                  watching, because a pass does not only add pieces. Fitted with
                  the text half of the cost weighted at a quarter, which Part 6
                  explains, the search takes eight passes and the list shrinks
                  from 67 pieces to 57 while the total falls from 1391.8737 to
                  976.7130.
                </p>
                <SearchEpochs />
                <p>
                  The churn is the part worth seeing. The second pass gives up
                  carries, dropped, first and greed in favour of carrie, dropp,
                  fir and gre, which is what cutting one word does to the pieces
                  of another, since taking a word&rsquo;s spelling out of the
                  books changes the price of every spelling that is left. The
                  fourth pass gives up Dr, Every, Monday, Nobody and Tuesday, all
                  of which had survived three passes, because by then the list
                  has enough short pieces to spell them from.
                </p>
                <KeepInMind>
                  Passes stop when one of them changes the total by less than a
                  set fraction of it, which is a stopping rule rather than a
                  proof of anything. It says the walk has slowed down. It does
                  not say the walk had anywhere better to go.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Cutting a word the corpus never held">
                <p>
                  A fitted list has to read words it never saw, and the rule for
                  that is separate from the rule that learned it. Take the word,
                  consider every way of cutting it into pieces the list holds, and
                  take the way whose total price under the same reference cost is
                  lowest. That is a shortest-path problem over the positions in
                  the word and is solved exactly rather than greedily.
                </p>
                <NumberTable
                  headings={["the word", "read as", "price", "stand-ins"]}
                  rows={[
                    ["walkings", "walk · ing · s", "5.5500", "0"],
                    ["stalking", "s · talk · ing", "5.5500", "0"],
                    ["splay", "s · play", "3.6041", "0"],
                    ["walkxed", "walk · x · ed", "33.6061", "1"],
                    ["jumping", "j · u · m · p · ing", "121.9537", "4"],
                  ]}
                  caption="Read by the six pieces the twelve forms taught, with the price in nats."
                />
                <p>
                  A character no piece covers is allowed through as a piece of
                  its own, at a price deliberately set higher than any reading
                  made entirely of known pieces could reach, which is the length
                  of the word times the logarithm of the number of references,
                  plus one. That guarantees a known reading always wins where one
                  exists, and it is why jumping costs 121.9537 where walkings
                  costs 5.5500. The four unknown characters are what the price is
                  reporting.
                </p>
                <KeepInMind>
                  Look at stalking and splay. Both are read using the piece s,
                  which the corpus taught as an ending, in front of the stem
                  rather than behind it. Nothing in the list records where a
                  piece belongs, and Part 7 comes back to that.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Same Corpus, Five Times Over",
          content: (
            <>
              <SubSection title="18. More of the same data, a worse answer">
                <p>
                  Here is the finding that changed how I read this method. Take
                  the same twelve inflected forms, change nothing about them, and
                  write each one five times instead of three. More data, in the
                  ordinary sense, of exactly the same kind. The search now leaves
                  every single word whole and finds no pieces at all.
                </p>
                <NumberTable
                  headings={["each word occurs", "pieces found", "best first move"]}
                  rows={[
                    ["once", "6", "−5.3157"],
                    ["twice", "6", "−4.4685"],
                    ["3 times", "6", "−2.4630"],
                    ["4 times", "6", "−0.3771"],
                    ["5 times", "12", "+1.7333"],
                    ["6 times", "12", "+3.8544"],
                  ]}
                  caption="The best first move is the cheapest of the fifty-four ways of cutting one word in two, measured in nats against leaving every word whole. The best move is played into play and ed in every row, tied exactly with the same cut of playing and of plays."
                />
                <p>
                  This is not a case of the answer getting slightly worse. At
                  five occurrences each the fit reports twelve pieces, which are
                  the twelve words, at a description length of 367.2274. The list
                  of three stems and three endings, on that same corpus, has a
                  description length of 262.9413. So the search finished
                  104.2861 nats away from a list it was free to report, and the
                  criterion it is named after says that list is the better of the
                  two.
                </p>
                <KeepInMind>
                  Hand this fit the six-piece list and its own arithmetic says
                  that list is 104.2861 nats better, and it still returns the
                  twelve whole words. What the method is defined to want and
                  what the procedure returns are two different things here, and
                  the reason turns out to sit in the arithmetic of Part 3 rather
                  than in the search.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Why more of the same turns a saving into a cost">
                <p>
                  Go back to what a split does to each of the three parts. It
                  makes the list cheaper, because a piece stops being spelled
                  inside several words. It makes the text dearer, because one
                  reference becomes two. Now ask what happens to each of those
                  when every word occurs more often.
                </p>
                <>
<p>
                  The saving on the list does not move at all. A piece is spelled in the list once, whatever its count, so removing a duplicated spelling saves the same number of nats whether the words occurred three times or three thousand. The extra cost on the text grows with the counts, since every occurrence of the word now pays for one more reference than it did.
                </p>
                <p>
                  One side of the trade is flat in the counts and the other side is linear in them, so there is a count above which the trade stops paying.
                </p>
</>
                <Equation>{"list saving   fixed in the counts\ntext cost     grows with the counts"}</Equation>
                <p>
                  On these twelve words that crossing point sits between four
                  occurrences each and five. At four, the best available cut is
                  worth 0.3771 nats and the search takes it. At five it costs
                  1.7333 and the search refuses it, correctly, since taking it
                  really would make the description longer.
                </p>
                <KeepInMind>
                  The undersegmentation of frequent words is not a bug in a
                  search. It follows from the shape of the criterion, and it is
                  why the family of methods built on this criterion all offer
                  some way of damping the counts.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Every first move is uphill">
                <p>
                  There are exactly 54 ways of cutting one of the twelve words in
                  two, which is the whole set of moves available from the
                  starting position. Pricing all of them at both repeat counts
                  shows the stall from the other side.
                </p>
                <UphillSplits />
                <p>
                  At three occurrences each, 9 of the 54 lower the description
                  and the search has somewhere to go. At five, none of them do.
                  The whole field has slid to the right of the line, so whichever
                  word the shuffled order visits first, and whichever position it
                  considers, the answer is that the word stays whole. The first
                  pass changes nothing, the stopping rule notices that nothing
                  changed, and the fit reports itself finished after one pass.
                </p>
                <p>
                  Three moves tie for cheapest at every repeat count, since
                  cutting played into play and ed, playing into play and ing,
                  and plays into play and s each leave the list holding the same
                  characters and the text holding the same counts. Ties like
                  that are why the recursion needs a stated rule for choosing
                  among equally cheap positions.
                </p>
                <p>
                  The dearest move at three occurrences is worth looking at too.
                  Cutting walks into wa and lks costs 14.2842 nats, which is far
                  more than the cheapest move saves, and it is dear for the
                  reason the whole method rests on. Neither wa nor lks is shared
                  with anything, so the list gets no shorter, and the text gets a
                  reference longer for nothing.
                </p>
                <KeepInMind>
                  A search that can only take a step which improves the total,
                  starting from a position where no single step improves the
                  total, stops there. Getting from twelve whole words to three
                  stems and three endings needs several cuts made together, and
                  this search never proposes two cuts at once.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The dial that lets it through">
                <p>
                  Since the problem is that the text half of the cost grows too
                  fast, the repair offered by every implementation of this method
                  is to multiply that half by something. Set the multiplier below
                  one and the text counts for less, so splits stay worth making
                  at higher counts. Set it above one and the fit splits less.
                </p>
                <Equation>{"total  =  list  +  weight × text"}</Equation>
                <WeightDial />
                <p>
                  On the five-occurrence corpus the answer changes between
                  0.83794 and 0.83795. Anywhere below that the search finds the
                  three stems and the three endings; anywhere above, every word
                  stays whole. At half, which is a setting somebody might well
                  choose without knowing any of this, the fit lands on the six
                  pieces and reports 169.4115.
                </p>
                <>
<p>
                  It has to be said plainly what that number is and is not. It is not comparable with 262.9413, because a different quantity is being minimised once the multiplier is not one. The multiplier is not part of the principle at all, and turning it is admitting that the two-part code, as written, prices frequent words wrongly for this purpose.
                </p>
                <p>
                  Set at half it recovers walk, talk, play, s, ed and ing from a corpus where the plain code recovers nothing, and it does that by declaring that a reference costs half what writing it down actually costs, which is a statement nobody can defend from the coding argument that produced the criterion.
                </p>
</>
                <KeepInMind>
                  The multiplier is the honest place to put a preference for
                  smaller pieces. It does not repair the search, which is still
                  greedy and still stalls, and there is a setting for every corpus
                  above which the same corpus stalls again.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "Write each of the same twelve forms five times instead of three and the search finds no pieces at all. What causes that?",
              [
                "The shuffled visiting order happens to start on a word that cannot be cut",
                "The saving on the list is flat in the counts while the added text cost grows with them, so above some count the trade stops paying",
                "The stopping rule fires early because the total is larger to begin with",
                "More occurrences make the counts part dominate, and the counts part has no notion of shared spellings",
              ],
              1,
              "A piece is spelled in the list once whatever its count, so removing a duplicated spelling saves the same number of nats at any corpus size, while every occurrence of a split word pays for one more reference. On these twelve words the crossing sits between four occurrences each and five, where the best available cut goes from being worth 0.3771 nats to costing 1.7333.",
            ),
            trueFalse(
              "Handed the six-piece list on the five-occurrence corpus, the fit reports it, since its own arithmetic says that list is 104.2861 nats better.",
              false,
              "It still returns the twelve whole words. What the method is defined to want and what the procedure returns are two different things here, and the reason sits in the arithmetic rather than in the search. At five occurrences none of the 54 single cuts lowers the description, where at three occurrences 9 of them do, so the first pass changes nothing and the stopping rule notices.",
            ),
            choice(
              "Multiplying the text half of the cost by a half recovers walk, talk, play, s, ed and ing on the five-occurrence corpus and reports 169.4115. What is that number?",
              [
                "The description length of the six-piece list, directly comparable with the 262.9413 reported earlier",
                "The minimum of a different quantity, so it is not comparable with 262.9413 at all",
                "A lower bound on the description length, since the multiplier can only shrink the total",
                "The description length of the corpus under the twelve whole words at the new weighting",
              ],
              1,
              "Once the multiplier is not one a different quantity is being minimised, and the multiplier is not part of the principle at all. It recovers the six pieces by declaring that a reference costs half what writing it down actually costs, which nobody can defend from the coding argument that produced the criterion. It is the honest place to put a preference for smaller pieces, and it does not repair the search.",
            ),
            choice(
              "A fitted list reads jumping at a price of 121.9537 where walkings costs 5.5500. What is the large number reporting?",
              [
                "That jumping is longer than any word the list was fitted to",
                "That four of its characters are covered by no piece, each allowed through at a price set above any reading made of known pieces",
                "That the search refused to cut jumping and returned it whole",
                "That the reading of jumping was found greedily rather than exactly",
              ],
              1,
              "A character no piece covers is allowed through as a piece of its own at a price deliberately set higher than any reading made entirely of known pieces could reach. That guarantees a known reading always wins where one exists. Reading an unseen word is otherwise a shortest-path problem over the positions in it and is solved exactly rather than greedily.",
            ),
            trueFalse(
              "Cutting one word can change what the search decides about another, because each word is reconsidered against the list as the other words have left it.",
              true,
              "A word’s current pieces are taken out of the books, the word is put back whole, and the question is asked against the list as it stands at that moment, so an early decision about walked changes what the arithmetic says about walking. That is why the visiting order is a real input, drawn from a seed that is part of the fit. On the eighteen sentences the second pass gives up carries, dropped, first and greed in favour of carrie, dropp, fir and gre, which is what cutting one word does to the pieces of another.",
            ),
        ],
        },
        {
          title: "Part 6. What the Pieces Cost",
          content: (
            <>
              <SubSection title="22. Sequence length against a table of the same size">
                <p>
                  Everything downstream of a tokenizer pays in pieces, so that is
                  the currency to compare in. On the twelve forms the six pieces
                  and their marked twins make a table of 13 rows, and that table
                  reads the corpus in 63 pieces. A merge-grown table needs 30 rows
                  to reach the same 63.
                </p>
                <NumberTable
                  headings={["how the pieces were chosen", "rows", "the corpus, in pieces"]}
                  rows={[
                    ["shortest description", "13", "63"],
                    ["commonest pair, 16 rows", "16", "198"],
                    ["commonest pair, 24 rows", "24", "96"],
                    ["commonest pair, 30 rows", "30", "63"],
                  ]}
                  caption="Twelve inflected forms at three occurrences each. The merge-grown table reaches the same length with more than twice the rows, and the rows it spends the difference on are pieces like al and pla."
                />
                <p>
                  That comparison flatters the shorter description, and it does so
                  for a reason worth naming rather than hiding. The 13 rows are
                  only the pieces the corpus needed. They do not include the
                  alphabet, so there is no row for most single characters, and
                  the next section is what that costs.
                </p>
                <KeepInMind>
                  On its own corpus a description chosen to be short is short.
                  That is close to a tautology, since shortening the description
                  of that corpus is the whole objective, and it says nothing yet
                  about any other text.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The list has no alphabet in it">
                <p>
                  Here is where this method is worse than the one it is being
                  compared with, and it is worth reporting rather than burying.
                  Nothing in the criterion rewards keeping a piece for a character
                  no word needs on its own. On the eighteen sentences the letter k
                  never survives as a piece of its own, because every word that
                  uses it can be spelled from longer pieces, and the same is true
                  of almost every letter at the settings that give the most
                  compact description.
                </p>
                <HeldOutReadings />
                <p>
                  The three readings are the whole trade in one place. The first
                  table describes its own eighteen sentences in 167 pieces where
                  the merge-grown table of the same 135 rows needs 267, and it
                  can spell 4 of the corpus&rsquo;s 35 characters on their own
                  against the merge-grown table&rsquo;s 34. Handed a sentence it
                  never saw, it returns 18 stand-ins out of 28 pieces where the
                  merge-grown table returns 1 out of 25, and gluing its pieces
                  back does not give the sentence back.
                </p>
                <p>
                  Turning the multiplier down to a quarter fixes it, and the way
                  it fixes it says what was wrong. At a quarter the text half
                  counts for so little that keeping single characters becomes
                  affordable, the list holds 34 of the 35 characters, the sentence
                  comes out in 31 pieces with no stand-ins at all, and gluing them
                  back gives exactly what went in. The price is that the eighteen
                  sentences now take 338 pieces rather than 167.
                </p>
                <KeepInMind>
                  A vocabulary is judged on text it was not fitted to, and a
                  criterion that measures only how well a corpus is described has
                  no term for that at all. Anybody using this in earnest reserves
                  rows for the alphabet whatever the criterion says, which is a
                  patch on the objective rather than a consequence of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where each method is ahead">
                <p>
                  Setting the two side by side on the eighteen sentences, at 135
                  rows each, the honest summary is that they are ahead in
                  different places and neither dominates.
                </p>
                <NumberTable
                  headings={[
                    "how the pieces were chosen",
                    "the corpus",
                    "the sentence",
                    "stand-ins",
                    "glued back",
                  ]}
                  rows={[
                    ["shortest description", "167 pieces", "28 pieces", "18", "changed"],
                    ["commonest pair", "267 pieces", "25 pieces", "1", "changed"],
                  ]}
                  caption="Both fitted to the same eighteen sentences, both 135 rows, both reading a sentence none of them contained."
                />
                <InAModel>
                  <>
<p>
                    At the scale a language model works at, the reasons a held-out sentence matters shift. A vocabulary is fitted to hundreds of billions of words, so the long tail is deep enough that most characters survive on their own however the pieces were chosen, and the failure of section 23 stops being automatic. What does not shift is the finding of Part 5, since a web-scale corpus is exactly where the commonest words occur millions of times, which is the regime where this criterion undersegments hardest unless a multiplier holds it back.
                  </p>
                  <p>
                    Pieces chosen this way are used in practice on agglutinative languages, where a particular inflected form may occur once in a corpus or not at all, so a count-driven vocabulary has very little to count.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Neither table is wrong on its own terms. Asked to describe
                  those eighteen sentences in as few symbols as it can, the
                  first one wins by a hundred pieces; asked to read a sentence
                  written outside them, it hands back 18 stand-ins where the
                  second hands back one. Which of those matters depends on what
                  reads the pieces afterwards, and nothing on this page measures
                  that.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="25. What the search finds is not what the method is named for">
                <p>
                  The name says minimum description length, and the search
                  returns a local minimum of a function over a space it can only
                  move through one cut at a time. Those are different objects,
                  and Part 5 measured the difference on a corpus small enough to
                  hand the better answer to, where it came to 104.2861 nats.
                </p>
                <p>
                  Nothing about that is peculiar to the corpus. The space of ways
                  to cut a word list into pieces is astronomically large, no exact
                  search over it is known, and the greedy walk has the property
                  every greedy walk has, which is that it stops the moment no
                  single move improves the total. A description that needs two
                  cuts made together to become cheaper is unreachable, and there
                  is no way to know from inside the walk whether such a
                  description exists.
                </p>
                <p>
                  Which is also why the answer to &ldquo;what is the shortest
                  description of this corpus&rdquo; is unknown even here. The
                  three stems and three endings are shorter than what the search
                  returned at five occurrences; whether anything is shorter still
                  is a question nobody on this page has answered, and answering it
                  means enumerating the two-to-the-fifty-fourth arrangements of
                  those twelve words.
                </p>
                <KeepInMind>
                  A fit reports the description it reached and how many passes it
                  took. Neither of those is evidence about the minimum, and the
                  only honest reading of a converged fit is that no single further
                  cut would have helped.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. The cost function is a set of choices about how one would write a list down">
                <>
<p>
                  The three parts of Part 3 look like facts and several of them are decisions. Spelling the list character by character under the frequencies of characters within the list is one way of writing a list of strings down, and it is why a piece made of common letters is cheaper than one made of rare letters, which is a statement about spelling rather than about morphology.
                </p>
                <p>
                  Charging for the counts by the number of ways to deal references into non-empty piles is another. Writing the text under a model with no memory is a third, and it is the one that is most obviously false about language.
                </p>
</>
                <DerivationTable
                  expressionHeading="the choice"
                  reasonHeading="what turns on it"
                  rows={[
                    {
                      expression: "characters, under the list’s own frequencies",
                      reason: "makes a piece spelled in common letters cheaper than one spelled in rare letters, so the criterion has a mild preference between two pieces of equal length and equal usefulness. Nothing about morphology says it should.",
                    },
                    {
                      expression: "one end marker per piece",
                      reason: "required, since without it the list is one undivided run of characters. It also makes the list cost grow with the number of pieces independently of their length, which is part of why a long list of short pieces is dear.",
                    },
                    {
                      expression: "log C(N − 1, M − 1) for the counts",
                      reason: "one of several defensible codes for a table of counts. A different code changes every total on this page by a different amount, and could move where the crossing point of Part 5 falls.",
                    },
                    {
                      expression: "a text model with no memory",
                      reason: "prices ing after walk exactly as it prices ing after ing. A model with memory would describe the corpus in fewer nats and would make the search inside it much harder, which is the trade nobody in this family takes.",
                    },
                    {
                      expression: "a multiplier on the text half",
                      reason: "not part of the criterion at all, and the thing that decides the answer whenever the counts are large. Setting it is choosing how much segmentation is wanted, which is the judgement the criterion was supposed to remove.",
                    },
                  ]}
                />
                <KeepInMind>
                  There is no such thing as the description length of a corpus.
                  There is only its length under some scheme for writing it down,
                  and the scheme is written by whoever wrote the method. That is
                  the general form of the caveat, and the multiplier is the place
                  where it becomes impossible to overlook.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. A cheap piece is not a morpheme">
                <p>
                  The criterion has no notion of meaning, of position, or of what
                  a language is built from, and two measurements on this page show
                  it rather than argue it. The first is that the piece s, learned
                  from the endings of walks, talks and plays, is used in front of
                  a stem when the fitted list reads splay as s followed by play
                  and stalking as s, talk and ing. Both readings are cheaper than
                  any alternative the list allows, and both are wrong about the
                  words.
                </p>
                <p>
                  The second is sharper, because there the criterion is not being
                  fooled, it is disagreeing. Take undo, untie, redo and retie, ten
                  times each, where the prefixes are as clear as anything in
                  English. Left whole, that corpus has a description length of
                  111.7806. Cut into un, re, do and tie, it has a description
                  length of 148.5946. The morphological answer is 36.8140 nats
                  worse, and the fit therefore leaves all four words whole.
                </p>
                <WhyThisWorks title="Why the prefixes lose">
                  <>
<p>
                    Splitting all four words doubles the references, from 40 to 80, and the text cost is exactly doubled with them, from 55.4518 to 110.9035, since both lists hold four pieces used equally often. Spelling the list does get cheaper, from 47.2085 to 26.4129, because un and re and do and tie come to nine characters where the four whole words come to eighteen.
                  </p>
                  <p>
                    But 20.7956 saved there, against 55.4517 added to the text and 2.1579 added to the counts, leaves the split 36.8140 behind. The words are too short, and there are too few of them, for the shared spellings to pay.
                  </p>
</>
                </WhyThisWorks>
                <p>
                  So the pieces this method finds are the ones that make a
                  particular corpus cheap to describe under a particular coding
                  scheme, and their agreement with morphology is a happy
                  consequence on some corpora and absent on others. Creutz and
                  Lagus chose the word morph rather than morpheme for exactly
                  that reason, and undo and untie are where the distinction
                  stops being a hedge and becomes the actual answer.
                </p>
                <KeepInMind>
                  Where the pieces do land on the joints, it is because a language
                  reuses its stems and endings often enough that spelling them
                  once pays. Where a language does not, or where the corpus is too
                  small or the counts too large for the trade to work, the
                  criterion says so plainly and the answer it gives is not
                  morphology.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            several(
              "On the eighteen sentences, with 135 rows each, which of these hold of the shortest-description table against the merge-grown one?",
              [
                "It describes its own eighteen sentences in 167 pieces where the merge-grown table needs 267",
                "It can spell 4 of the corpus’s 35 characters on their own, against the merge-grown table’s 34",
                "Handed a sentence it never saw, it returns 18 stand-ins out of 28 pieces where the merge-grown table returns 1 out of 25",
                "It is ahead of the merge-grown table on its own corpus and on the unseen sentence alike",
              ],
              [0, 1, 2],
              "They are ahead in different places and neither dominates. On its own corpus a description chosen to be short is short, which is close to a tautology since that is the whole objective. Nothing in the criterion rewards keeping a piece for a character no word needs on its own, so gluing the pieces back does not give the unseen sentence back.",
            ),
            choice(
              "Turning the multiplier down to a quarter puts 34 of the 35 characters in the list and reads the unseen sentence in 31 pieces with no stand-ins. What does it cost?",
              [
                "The eighteen sentences now take 338 pieces rather than 167",
                "The fit no longer converges, since single characters can always be cut further",
                "The merge-grown table then describes the corpus in fewer pieces than it did",
                "Nothing, which is why a quarter is the setting the page recommends",
              ],
              0,
              "At a quarter the text half counts for so little that keeping single characters becomes affordable, and gluing the pieces back then gives exactly what went in. Anybody using this in earnest reserves rows for the alphabet whatever the criterion says, which is a patch on the objective rather than a consequence of it.",
            ),
            choice(
              "On undo, untie, redo and retie at ten occurrences each, the whole words price at 111.7806 and the split into un, re, do and tie at 148.5946. What does that show?",
              [
                "The search was fooled by a tie between equally cheap cutting positions",
                "The criterion is disagreeing rather than being fooled, since the morphological answer really is 36.8140 nats worse under it",
                "The prefixes are too rare in that corpus for the spelling to notice them",
                "The multiplier was left at one, and at any setting below one the split wins",
              ],
              1,
              "Splitting all four words doubles the references and doubles the text cost with them, and the spelling only saves 20.7956, because un and re and do and tie come to nine characters where the four whole words come to eighteen. The words are too short, and there are too few of them, for the shared spellings to pay. Creutz and Lagus chose the word morph rather than morpheme for exactly this reason.",
            ),
            trueFalse(
              "A converged fit has found the shortest description of its corpus.",
              false,
              "The only honest reading of a converged fit is that no single further cut would have helped. The search returns a local minimum of a function over a space it can move through one cut at a time, and a description needing two cuts made together is unreachable. Even on these twelve words the shortest description is unknown, since answering that means enumerating two to the fifty-fourth arrangements.",
            ),
            trueFalse(
              "On the eighteen sentences the letter k never survives as a piece of its own, because every word that uses it can be spelled from longer pieces.",
              true,
              "Nothing in the criterion rewards keeping a piece for a character no word needs on its own, and at the settings that give the most compact description the same is true of almost every letter, which is how the fitted list comes to hold 4 of the corpus’s 35 characters. The cost arrives on text the list was not fitted to, where the unseen sentence comes back with 18 stand-ins out of 28 pieces, and the usual repair is to reserve rows for the alphabet whatever the criterion says.",
            ),
        ],
        },
        {
          title: "Practice. Fitting the Twelve Forms With the Library",
          practice: [
            exercise(
              "Fit the twelve forms and read the six pieces",
              ["Build the corpus of Part 1, the twelve inflected forms three times each, and fit the shortest-description search to it with the seed the page uses. Print the description length it reached, how many passes it took and whether it converged, then the pieces it settled on with their counts, the number of references they make, and how the word walking was cut.", "Part 4 says the description goes from 301.0812 to 185.4634 in two passes, that the pieces are walk, talk and play used 12 times each with s, ed and ing used 9 times each, and that 63 references replace the 36 whole words."],
              `from oop_ml import MorfessorBaseline

forms = ["walk", "walks", "walked", "walking", "talk", "talks", "talked", "talking",
         "play", "plays", "played", "playing"]
corpus = [" ".join(word for word in forms for _ in range(3))]

model = MorfessorBaseline(random_seed=0).fit(corpus)
# Print the cost to four places with the passes run and whether it converged,
# then the pieces with their counts, the total number of references, and the
# pieces the training word walking was cut into.`,
              `from oop_ml import MorfessorBaseline

forms = ["walk", "walks", "walked", "walking", "talk", "talks", "talked", "talking",
         "play", "plays", "played", "playing"]
corpus = [" ".join(word for word in forms for _ in range(3))]

model = MorfessorBaseline(random_seed=0).fit(corpus)
print(f"cost {model.cost:.4f} nats after {model.epochs_run} passes, converged {model.converged}")
pieces = sorted(model.morphs, key=lambda morph: (-morph.count, morph.text))
print(f"{model.morphs.n_morphs} pieces: " + ", ".join(f"{morph.text} {morph.count}" for morph in pieces))
print(f"{model.morphs.total} references replace {len(forms) * 3} whole words")
print(f"walking is cut as {model.segmentations['walking'].morphs}")`,
              `cost 185.4634 nats after 2 passes, converged True
6 pieces: play 12, talk 12, walk 12, ed 9, ing 9, s 9
63 references replace 36 whole words
walking is cut as ('walk', 'ing')`,
              { hints: ["The corpus goes to fit, as with every tokenizer here, and a list holding one string of the twelve words three times each is a corpus. The seed fixes the visiting order; the page uses 0, and on this corpus every seed tried reaches the same six pieces.", "cost, epochs_run and converged are properties of the fitted model. morphs is the list of pieces, each with a text and a count, and total on it is how many references the corpus is written in.", "segmentations is indexed by training word and answers how that word was cut, so the pieces of walking are model.segmentations['walking'].morphs."], check: numberCheck("What description length, in nats, does the fit report?", 185.4634, 0.0005, "That is the middle bar of Part 2, the three stems and three endings, which the search reaches in its first pass. The second pass finds nothing and exists only so the stopping rule can see that the total stopped moving. The 63 references are the nine occurrences of a bare stem at one reference each plus the twenty-seven inflected occurrences at two each, which is 9 plus 54.") },
            ),
            exercise(
              "Repeat the corpus and watch the search stall",
              ["Part 5 says the same twelve forms written five times each instead of three leave every word whole, and that multiplying the text half of the cost by a half recovers the six pieces. Fit the forms at three, four and five repeats at the plain weight of one, and at five repeats with the weight at a half, and print for each the number of pieces, the description length and the passes run.", "The page prints the totals at three repeats and at five, and at five with the weight at a half. It says the cut is still worth taking at four repeats, where the best move is worth 0.3771 nats, but never prints what that fit costs."],
              `from oop_ml import MorfessorBaseline

forms = ["walk", "walks", "walked", "walking", "talk", "talks", "talked", "talking",
         "play", "plays", "played", "playing"]

for repeats, weight in [(3, 1.0), (4, 1.0), (5, 1.0), (5, 0.5)]:
    corpus = [" ".join(word for word in forms for _ in range(repeats))]
    # Fit with the seed 0 and the given weight on the text half of the cost,
    # then print the repeats and weight, the number of pieces, the cost to
    # four places and the passes run.
    pass`,
              `from oop_ml import MorfessorBaseline

forms = ["walk", "walks", "walked", "walking", "talk", "talks", "talked", "talking",
         "play", "plays", "played", "playing"]

for repeats, weight in [(3, 1.0), (4, 1.0), (5, 1.0), (5, 0.5)]:
    corpus = [" ".join(word for word in forms for _ in range(repeats))]
    model = MorfessorBaseline(random_seed=0, corpus_weight=weight).fit(corpus)
    print(f"{repeats} times each at weight {weight}: {model.morphs.n_morphs} pieces, cost {model.cost:.4f}, {model.epochs_run} passes")`,
              `3 times each at weight 1.0: 6 pieces, cost 185.4634, 2 passes
4 times each at weight 1.0: 6 pieces, cost 224.3765, 3 passes
5 times each at weight 1.0: 12 pieces, cost 367.2274, 1 passes
5 times each at weight 0.5: 6 pieces, cost 169.4115, 2 passes`,
              { hints: ["The repeat count is only how many times each form is written into the corpus string, so the same loop over the forms with a different range builds every corpus.", "corpus_weight is a field of the constructor, and one is the plain two-part code. Half is the setting Part 5 lands on.", "A fit that found no cut reports as many pieces as there are distinct words, twelve, and one pass, since the first pass changed nothing and the stopping rule noticed."], check: numberCheck("What description length, in nats, does the fit at four repeats report?", 224.3765, 0.0005, "At four repeats the trade still pays, so the fit reaches the same six pieces as at three and reports the two-part code of that list over 84 references. At five the best available cut costs 1.7333 nats rather than saving anything, so the search stops at the twelve whole words and 367.2274, and only the weight at a half, which minimises a different quantity, brings the six pieces back at 169.4115.") },
            ),
            exercise(
              "Read words the corpus never held",
              ["Part 4 says a fitted list reads a word it never saw by taking the cheapest cut into known pieces, with a character no piece covers allowed through on its own at a price above any reading made of known pieces. Fit the twelve forms at three repeats and ask the model for the best cut of walkings, stalking, splay and jumping, printing the pieces and the price of each.", "The page quotes 5.5500 for walkings and 121.9537 for jumping, and says stalking and splay are read with the ending s in front of a stem. Confirm the second route to the same number by pricing the cut the search chose piece by piece."],
              `from oop_ml import MorfessorBaseline

forms = ["walk", "walks", "walked", "walking", "talk", "talks", "talked", "talking",
         "play", "plays", "played", "playing"]
corpus = [" ".join(word for word in forms for _ in range(3))]
model = MorfessorBaseline(random_seed=0).fit(corpus)

for word in ["walkings", "stalking", "splay", "jumping"]:
    # Ask for the best segmentation of the word, print its pieces and its cost
    # to four places, and print the cost of that same cut priced piece by piece.
    pass`,
              `from oop_ml import MorfessorBaseline

forms = ["walk", "walks", "walked", "walking", "talk", "talks", "talked", "talking",
         "play", "plays", "played", "playing"]
corpus = [" ".join(word for word in forms for _ in range(3))]
model = MorfessorBaseline(random_seed=0).fit(corpus)

for word in ["walkings", "stalking", "splay", "jumping"]:
    reading = model.best_segmentation(word)
    piece_by_piece = model.cost_of_segmentation(reading.morphs)
    print(f"{word}: {reading.morphs} costs {reading.cost:.4f}, priced piece by piece {piece_by_piece:.4f}")`,
              `walkings: ('walk', 'ing', 's') costs 5.5500, priced piece by piece 5.5500
stalking: ('s', 'talk', 'ing') costs 5.5500, priced piece by piece 5.5500
splay: ('s', 'play') costs 3.6041, priced piece by piece 3.6041
jumping: ('j', 'u', 'm', 'p', 'ing') costs 121.9537, priced piece by piece 121.9537`,
              { hints: ["best_segmentation takes one word and answers an object with morphs and cost. It has to be a single word, since the search runs over the positions inside it.", "cost_of_segmentation takes a sequence of pieces and prices it, a known piece at its reference cost and an unknown single character at the penalty. Handing it the morphs the search chose should give the search's own number back."], check: numberCheck("What does the model charge to read jumping, in nats?", 121.9537, 0.0005, "Only ing is a known piece, so j, u, m and p each go through on their own at the penalty, which is the length of the word times the logarithm of the number of references, plus one. The penalty is set above any reading made entirely of known pieces so that a known reading always wins where one exists, and the four unknown characters are what the large number is reporting. splay costs 3.6041 by the same arithmetic, two known pieces and nothing else, which is why nothing stops the ending s from being read in front of a stem.") },
            ),
            exercise(
              "Fit the two-word corpus, and the four prefixed words",
              ["Part 2 priced walk and walks by hand, 20.8317 left whole and 14.8378 split into walk and s. Fit the search to that corpus and see whether it finds the split. Then fit it to undo, untie, redo and retie ten times each, where Part 7 says the criterion prefers the whole words at 111.7806 to the prefixes and roots at 148.5946.", "Print, for each fit, the description length to four places and the pieces with their counts. The second fit should leave all four words whole, which is the criterion disagreeing with the morphology rather than the search failing to find it."],
              `from oop_ml import MorfessorBaseline

two_words = ["walk walks"]
prefixed = [" ".join(word for word in ["undo", "untie", "redo", "retie"] for _ in range(10))]

for label, corpus in [("two words", two_words), ("four prefixed words", prefixed)]:
    # Fit with the seed 0 and print the label, the cost to four places, and
    # every piece with its count.
    pass`,
              `from oop_ml import MorfessorBaseline

two_words = ["walk walks"]
prefixed = [" ".join(word for word in ["undo", "untie", "redo", "retie"] for _ in range(10))]

for label, corpus in [("two words", two_words), ("four prefixed words", prefixed)]:
    model = MorfessorBaseline(random_seed=0).fit(corpus)
    pieces = ", ".join(f"{morph.text} {morph.count}" for morph in model.morphs)
    print(f"{label}: cost {model.cost:.4f} with pieces {pieces}")`,
              `two words: cost 14.8378 with pieces s 1, walk 2
four prefixed words: cost 111.7806 with pieces redo 10, retie 10, undo 10, untie 10`,
              { hints: ["Both corpora are lists of one string. The first holds the two words once each, and the second holds the four prefixed words ten times each.", "The two-word fit should land on walk used twice and s used once at 14.8378, which is the split Part 2 priced by hand, and the prefixed fit should leave all four words whole at 111.7806."], check: numberCheck("What description length, in nats, does the two-word fit report?", 14.8378, 0.0005, "The split costs 0.5232 more in the text and 0.6931 more in the counts and saves 7.2103 on the spelling, because walk stops being written down twice, so the search takes it and reports the 14.8378 that Part 2 worked by hand. On the prefixed words the same arithmetic goes the other way, since un, re, do and tie save 20.7956 on the spelling but double the references, and the fit reports 111.7806 with every word whole.") },
            ),
          ],
        },
      ]}
    />
  );
}
