import type { Metadata } from "next";
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
import { GrowingWordList } from "@/components/widgets/GrowingWordList";
import { LatticeBoard } from "@/components/widgets/LatticeBoard";
import { LatticePlayground } from "@/components/widgets/LatticePlayground";
import { PathLadder } from "@/components/widgets/PathLadder";
import { ReadingsAgainstSteps } from "@/components/widgets/ReadingsAgainstSteps";

const TAGLINE =
  "Rather than committing at each step, lay out every reading the word list permits and take the best whole path. What a path is scored by, why the best one can be found without looking at the others, and why adding one word changes the cut of a text that does not contain it.";

export const metadata: Metadata = {
  title: "The Word Lattice · oop_ml",
  description: TAGLINE,
};

export default function TheWordLatticePage() {
  return (
    <ConceptPage
      title="The Word Lattice"
      tagline={TAGLINE}
      prerequisites={
        <>
          The greedy scan of the previous page, since this one is the repair for
          the two failures measured there. A word list is no longer enough on its
          own; every entry has to carry a count of how often it occurs, and the
          only arithmetic is multiplying those counts together and then taking
          logarithms so that the multiplication becomes addition.
        </>
      }
      history={
        <>
          <p>
            By the early 1990s every system that indexed or searched Chinese
            began by guessing where the words were, and the guess was almost
            always the greedy dictionary scan. What its users kept running into
            was not that it was crude but that it had nothing to be crude with.
            A word list can say that a reading is possible and it cannot say
            that one possible reading is more plausible than another, so when two
            readings of a sentence were both built out of real words there was
            no quantity anywhere in the method to compare them by. The
            dictionaries themselves had the missing quantity all along, since a
            lexicographer counts occurrences, and what nobody had written down
            was how to spend a count on a whole sentence rather than on a word.
          </p>
          <p>
            The paper that wrote it down is Richard Sproat, Chilin Shih, William
            Gale and Nancy Chang&rsquo;s 1996 article in Computational
            Linguistics on a stochastic finite-state word segmentation algorithm
            for Chinese, written at AT&amp;T Bell Laboratories. They built the
            dictionary as a weighted machine in which every entry carried a cost
            equal to minus the logarithm of its estimated probability, laid that
            machine over the sentence, and asked for the cheapest way through.
            Finding the words stopped being a scan with a rule attached and
            became a shortest-path problem, which is a question with one answer
            rather than a procedure with a convention bolted to it.
          </p>
          <p>
            The search that answers it was already old. Richard
            Bellman&rsquo;s work on dynamic programming at RAND in the 1950s is
            where the argument comes from, that if the whole of a route is best
            then the tail of that route is best for the tail of the problem, so a
            best route can be assembled backwards from its end. Andrew
            Viterbi&rsquo;s 1967 paper in the IEEE Transactions on Information
            Theory applied exactly that recurrence to decoding convolutional
            codes coming off a noisy channel, and it is the same recurrence used
            here with words in place of code states. The segmenter most people
            reach for in Python today, Jieba, is this method almost line for
            line, building the graph of dictionary matches over each run of
            characters and taking the most probable path through it, with a
            separate character model kept for the stretches its dictionary
            missed.
          </p>
          <p>
            This page asks six questions in order. What exactly is laid out when
            every reading is laid out at once? What is a whole reading worth, and
            why is that a sum rather than a product? What does scoring the whole
            path fix that scoring each step could not? Why is finding the best of
            an enormous number of readings affordable at all? What does a stretch
            no entry covers cost, and what does that cost decide? And where does
            the scoring stop deciding, so that something outside it has to?
          </p>
        </>
      }
      playground={<LatticePlayground />}
      sections={[
        {
          title: "Part 1. What Committing at Each Step Costs",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Where the greedy scan left off">
                <p>
                  The previous page took the longest entry of a word list that
                  fitted where the scan was standing, cut there, and went again.
                  Two things went wrong with that and they are worth having in
                  front of us as numbers, because everything on this page is
                  aimed at the first of them and nothing on this page touches the
                  second.
                </p>
                <NumberTable
                  headings={[
                    "text",
                    "scanning from the left",
                    "scanning from the right",
                    "a person",
                  ]}
                  rows={[
                    [
                      "我们在野生动物园玩",
                      "6 pieces",
                      "5 pieces",
                      "5 words",
                    ],
                    ["thewaterunderthetable", "7 pieces", "5 pieces", "5 words"],
                  ]}
                  caption="Both texts against the word lists the previous page used, which are nine Chinese words and 810 common English words. In each case a long entry that happened to begin where the scan was standing was taken, and what came after it had nothing good left to do."
                />
                <p>
                  The English case is the one to look at closely, since anybody
                  can check it. Standing after under, the longest entry in a list
                  of 810 ordinary English words that begins there is theta, the
                  Greek letter, which the list holds like any other word. Taking
                  it leaves b, l and e behind, three characters no entry covers,
                  and the answer comes back in seven pieces where five would have
                  done. The scan had no way of knowing that theta was going to
                  cost three pieces later, because at the moment it chose, later
                  did not exist.
                </p>
                <p>
                  The second failure is not repaired here and it would be
                  dishonest to imply it is. A word the list does not hold cannot
                  be produced by anything on this page either, and the surname
                  Alvarez will still come back as its separate characters at the
                  end. What changes is only the first failure, which is the one
                  about committing early.
                </p>
                <KeepInMind>
                  A rule that decides one cut at a time cannot notice that a cut
                  was expensive, since noticing would mean comparing whole
                  readings and it only ever holds one position. Everything below
                  follows from deciding to compare whole readings instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Every reading the list permits, laid out at once">
                <p>
                  Instead of standing at a position and choosing, stand at every
                  position and write down every entry of the list that begins
                  there, keeping all of them. Add, at each position, the single
                  character standing there, whether the list holds it or not, so
                  that nothing in the text is left with no way past it. That
                  collection of candidates is the word lattice, and it is the
                  whole of what the method builds.
                </p>
                <p>
                  Here it is for the six characters that mean either research
                  into the origin of life or a graduate student&rsquo;s fate and
                  origin. Five words are in the list, and the sentence is exactly
                  the case where a word list alone has nothing to say, since both
                  readings use three real words.
                </p>
                <LatticeBoard scenarioKeys={["research"]} />
                <p>
                  Ten candidates in all, which are the five entries at the
                  positions where they fit and the five single characters that no
                  entry covers. Each one knows where it starts and where it ends,
                  so the arc for the first entry runs from position 0 to position
                  2 and the arc for the three-character entry runs from 0 to 3.
                  An arrangement like this one is what the method is named after,
                  and this sense of the word, a set of positions with arcs
                  between them, has nothing to do with the lattice of order
                  theory that the same word names in algebra.
                </p>
                <KeepInMind>
                  Nothing has been decided yet. The lattice is a statement of
                  what the list permits and it contains the greedy answer, the
                  answer a reader would give, and every wrong answer as well, all
                  on the same footing.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A reading is a path from one end to the other">
                <p>
                  Reading the sentence means choosing candidates that fit
                  together, which means each one starts exactly where the last
                  one ended, the first starts at the beginning and the last ends
                  at the end. Follow the arcs above from the left edge to the
                  right edge without a gap and without an overlap, and what you
                  have walked is one reading of the sentence.
                </p>
                <WorkedExample>
                  <p>
                    From position 0 there are three arcs. Taking the
                    three-character one lands at position 3, from where the only
                    arc goes to 4, and from 4 the two-character one finishes at
                    6, so that walk spells the graduate student reading in three
                    words. Taking the two-character arc from 0 lands at 2, from
                    where the two-character arc lands at 4 and the last one
                    finishes, which spells the research reading, also in three
                    words. Taking the single character from 0 lands at 1 and
                    commits the walk to four pieces or more.
                  </p>
                  <p>
                    Every one of those walks is a reading, and so is every other
                    walk from the left edge to the right, however silly. There
                    are ten of them here in all.
                  </p>
                </WorkedExample>
                <p>
                  This is the move the whole page rests on. The previous
                  page&rsquo;s rule scored a position, since the longest entry
                  beginning here is a fact about here. A path is a whole reading,
                  so anything said about a path is said about the sentence, and a
                  candidate taken early can now be made to answer for what it
                  leaves behind.
                </p>
                <KeepInMind>
                  A reading and a path are the same object seen twice. Finding a
                  best path through a graph is a problem with a settled answer
                  and a known cost, which is why the rest of this page has
                  something to work with.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Why there are so many fewer paths than cuts">
                <p>
                  Between any two neighbouring characters there is either a
                  boundary or there is not, so a text of n characters admits two
                  to the power of n minus one cuts. Almost none of those are
                  paths, because a cut whose pieces are not entries has no arcs
                  to walk along, and that is the first thing the word list buys.
                </p>
                <NumberTable
                  headings={[
                    "text",
                    "characters",
                    "ways to cut them",
                    "readings the list permits",
                    "candidates",
                  ]}
                  rows={[
                    ["研究生命起源", "6", "32", "10", "10"],
                    ["我们在野生动物园玩", "9", "256", "16", "14"],
                    ["thetabledownthere", "17", "65,536", "216", "30"],
                    [
                      "thetabledownthereinthegarden",
                      "28",
                      "134,217,728",
                      "2,592",
                      "45",
                    ],
                    [
                      "our sentence, spaces removed",
                      "45",
                      "17,592,186,044,416",
                      "240",
                      "54",
                    ],
                  ]}
                  caption="The Chinese texts against their own small lists and the English against the 810 common words. The fourth column counts complete paths and the fifth counts candidates. Our own sentence has few readings for an unhappy reason, which is that a surname, an abbreviation and four punctuation marks leave stretches where the only candidate anywhere is a single character."
                />
                <p>
                  Ten of thirty-two on six characters, and 240 of seventeen and
                  a half trillion on forty-five, so the filter tightens as the
                  text lengthens without ever bringing the count down to
                  something small. The number to watch is the last column, which
                  is how many candidates there are, and which the fifteenth
                  section will show is also how many steps the search takes.
                  Twenty-eight characters of ordinary English permit 2,592
                  readings and the search touches 45 things.
                </p>
                <KeepInMind>
                  The list rules out most cuts and leaves a number of readings
                  that still grows with the length of the text. Enumerating them
                  is therefore not on the table, and everything in Part 4 is
                  about not having to.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. What a Whole Reading Is Worth",
          content: (
            <>
              <SubSection title="5. A reading is worth the counts of the words it used">
                <p>
                  Every entry of the list carries a count of how often it was
                  seen. Treat that count divided by the total of all the counts
                  as the chance of meeting that word, treat the words of a
                  reading as independent of one another, and the chance of the
                  whole reading is the product of the chances of its words. That
                  is the entire model, and both of its assumptions are wrong in
                  ways worth stating.
                </p>
                <Equation>
                  {"P(reading)  =  product over its words w of  count(w) / total"}
                </Equation>
                <p>
                  Words are not independent, since research is far likelier
                  before origin than after it, and the counts come from whatever
                  text somebody happened to count. Neither is fatal here. The
                  independence is what makes the search in Part 4 possible at
                  all, and the counts are the only evidence about the language
                  the method has.
                </p>
                <DerivationTable
                  expressionHeading="entry"
                  reasonHeading="its count, its share of 33, and what it scores"
                  rows={[
                    {
                      expression: "研究",
                      reason:
                        "counted 10 times, so a share of 10/33, and a score of −1.1939",
                    },
                    {
                      expression: "生命",
                      reason:
                        "counted 8 times, so a share of 8/33, and a score of −1.4171",
                    },
                    {
                      expression: "起源",
                      reason:
                        "counted 5 times, so a share of 5/33, and a score of −1.8871",
                    },
                    {
                      expression: "研究生",
                      reason:
                        "counted 6 times, so a share of 6/33, and a score of −1.7047",
                    },
                    {
                      expression: "命",
                      reason:
                        "counted 4 times, so a share of 4/33, and a score of −2.1102",
                    },
                    {
                      expression: "any single character no entry covers",
                      reason:
                        "treated as though it had been counted once, so a share of 1/33, and a score of −3.4965. It is a convention rather than an estimate and the sixteenth section argues with it.",
                    },
                  ]}
                />
                <KeepInMind>
                  The counts are the whole of the difference between this page
                  and the last one. A word list says which readings exist; a
                  counted word list says which of them the language actually
                  produces, to the extent that whoever did the counting was
                  reading the same language.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Why the product becomes a sum">
                <p>
                  Multiplying shares together is the right arithmetic and the
                  wrong thing to compute. Every share is below one, so a reading
                  of forty words is a product of forty numbers below one, and on
                  a real dictionary where a common word has a share near one in a
                  thousand that product falls below the smallest number a
                  computer can tell from zero long before the sentence ends.
                  Taking logarithms turns the product into a sum and the problem
                  goes away.
                </p>
                <Equation>
                  {"score(reading)  =  sum over its words w of  log( count(w) / total )"}
                </Equation>
                <p>
                  Nothing about which reading wins changes, because the logarithm
                  is increasing, so whichever product was larger has the larger
                  logarithm. Every score is negative, since every share is below
                  one, and a score nearer zero is a likelier reading. Two scores
                  can be compared by subtracting them, and the difference is the
                  logarithm of how many times likelier one reading is than the
                  other, which is a more useful thing to hold than a ratio of two
                  very small numbers.
                </p>
                <WhyThisWorks>
                  <p>
                    There is a second reason to prefer the sum, and it is
                    structural rather than numerical. A sum over the words of a
                    reading is a sum over the arcs of a path, so the score of a
                    path is the total of the weights on the arcs it walks. That
                    is the shape every shortest-path argument needs, and it is
                    what lets the fourteenth section split a path into a head and
                    a tail and reason about the two separately. A product would
                    work for the same reason, since it factors the same way, but
                    the additive form is the one every result about paths is
                    written in.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Logarithms here are bookkeeping and not modelling. The model is
                  the product of shares; the sum of logarithms is that product
                  written so it can be computed, and the two rank every reading
                  identically.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The ambiguity settled by the counts">
                <p>
                  Now the six characters from the second section can be answered.
                  Both readings use three words of the list, so counting pieces
                  says nothing about them, and the greedy rule of the previous
                  page gave one answer from the left and the other from the right
                  with no way to choose. Score both whole and the counts choose.
                </p>
                <PathLadder scenarioKeys={["research"]} />
                <WorkedExample>
                  <p>
                    The research reading multiplies 10 by 8 by 5 and divides by
                    33 three times, which in logarithms is −1.1939 and −1.4171
                    and −1.8871 added up to −4.4981. The graduate student reading
                    multiplies 6 by 4 by 5 over the same three divisions, which
                    is −1.7047 and −2.1102 and −1.8871 added up to −5.7020. The
                    gap is 1.2040.
                  </p>
                  <p>
                    That gap is the logarithm of 400 over 120, since the
                    divisions by 33 are the same three divisions on both sides
                    and cancel, and 400 over 120 is 10 over 3. So the winning
                    reading is three and a third times as likely as the other one
                    under these counts, and the widget prints the same thing as a
                    share of 30 per cent.
                  </p>
                </WorkedExample>
                <p>
                  It is worth being exact about what has been settled here. The
                  method has not discovered that the sentence is about research.
                  It has reported that under one particular set of counts the
                  research reading is the likelier of the two, and the twentieth
                  section is about how much weight that will carry.
                </p>
                <KeepInMind>
                  Where the previous page had two defensible answers and a
                  convention for choosing between them, there is now a number
                  attached to each answer and a difference between the numbers.
                  Whether the number points the right way is a separate question
                  from whether there is a number at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The same candidates, the other set of counts">
                <p>
                  Move two counts and nothing else. Let the graduate student
                  entry be counted 20 times rather than 6 and the single
                  character be counted 12 rather than 4, which takes the total
                  from 33 to 55. The lattice is character for character the same,
                  the same ten candidates at the same ten spans, and the answer
                  reverses.
                </p>
                <PathLadder scenarioKeys={["research-student"]} />
                <p>
                  The graduate student reading now scores −4.9319 and the
                  research reading −6.0305, a gap of 1.0986, which is the
                  logarithm of 1200 over 400 and so exactly three. Meanwhile the
                  greedy rule answers the same thing it answered before, from the
                  left the graduate student and from the right the research,
                  because it reads no counts and there was nothing in it for the
                  change to reach.
                </p>
                <InAModel>
                  <p>
                    That is the difference worth carrying away from this part.
                    The greedy rule&rsquo;s answer is a property of the direction
                    it was run in; this method&rsquo;s answer is a property of
                    the counts it was given. The first is a fact about the
                    procedure and can only be argued about by argument. The
                    second is a fact about a body of text, which means it can be
                    measured, disagreed with by counting something else, and
                    improved by counting more.
                  </p>
                </InAModel>
                <KeepInMind>
                  One lattice, two sets of counts, two answers, and the segmenter
                  is not what decided. Where the counts came from is therefore
                  the whole question, and it is not a question this method
                  contains an answer to.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What Scoring the Whole Path Fixes",
          content: (
            <>
              <SubSection title="9. A long match early is paid for by what it forces later">
                <p>
                  Back to the English text the greedy scan broke. Standing after
                  under, taking theta was free as far as the greedy rule could
                  see, because the rule was comparing five characters against
                  three at one position. Scoring the whole path, the same choice
                  is no longer free, since a path through theta has to get from
                  the end of theta to the end of the text and there are only
                  single characters left to do it with.
                </p>
                <PathLadder scenarioKeys={["water"]} />
                <p>
                  Every entry in this list is counted once, so every word is
                  worth the same and the score of a reading is simply how many
                  words it used, times the score of one word. The reading a
                  person gives uses five and scores −33.4852. The reading the
                  greedy scan gives uses seven and scores −46.8792, which puts it
                  fourth on the list above and makes it one part in 656,100 as
                  likely, that being 810 twice over for the two extra words it
                  had to spend.
                </p>
                <WhyThisWorks>
                  <p>
                    The mechanism is worth stating carefully because it is the
                    whole of the repair. Taking theta buys one word where under
                    ends and costs three at the three characters it strands
                    behind it. A rule that scores a position sees only the
                    purchase. A rule that scores a path sees the purchase and the
                    bill in the same number, because both are terms in the same
                    sum, and the sum is what is being maximised.
                  </p>
                  <p>
                    Notice what has not happened. Nothing looked ahead from that
                    position and nothing backtracked out of a bad choice, since
                    no choice was made there at all. Every candidate is still
                    built the same way it was on
                    the previous page; all that changed is that the comparison is
                    made between totals over whole paths rather than between
                    lengths at one position.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Greedy failure is not a failure of the candidates. Both answers
                  above were available to the previous page and it had no
                  quantity in which one of them was worse. The repair is a
                  quantity, and the quantity is a sum over a whole reading.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. With nothing but a word list, the score is a count of words">
                <p>
                  Suppose there are no counts, only a list of words, which is
                  ordinarily what somebody has. Then every entry has been counted
                  once and every word is worth the same, so the score of a
                  reading is that one value added up once per word, and
                  maximising the score means using as few words as possible. The
                  method is still doing something, and what it is doing is the
                  shortest reading rather than the likeliest one.
                </p>
                <Equation>
                  {"every count 1  ⇒  score(reading)  =  (number of words) × log( 1 / total )"}
                </Equation>
                <PathLadder scenarioKeys={["park-plain"]} />
                <p>
                  On the wildlife park sentence with nine words all counted once,
                  every candidate scores −2.1972, and the best paths use five
                  words for −10.9861 where the greedy scan from the left used six
                  for −13.1833. So the piece count is repaired. What is not
                  repaired is the reading, because two different paths use five
                  words and they score identically to the last bit, and the one
                  that comes back is the wrong one. The right one is second on
                  the list above and the greedy scan from the right had found it.
                </p>
                <KeepInMind>
                  A word list with no counts still improves the answer, and it
                  improves the count of pieces rather than the choice between
                  pieces. Where two readings are the same length it has nothing
                  left, which is exactly the position the previous page was in.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The same nine words, counted">
                <p>
                  Give those nine words counts and the tie disappears. I have to
                  be honest about where these particular counts came from, since
                  nothing on this site counts Chinese text and I wrote them by
                  hand, putting the preposition and the pronoun high, the two
                  compounds the sentence uses in the middle, and the two
                  compounds it does not use low. They are a plausible ordering
                  rather than a measurement, and the point they make is about
                  what counts do, not about these counts.
                </p>
                <LatticeBoard scenarioKeys={["park-plain", "park-counted"]} />
                <p>
                  With them the reading a person gives scores −10.9001 and the
                  other five-word reading scores −16.6684, a gap of 5.7683, so
                  the loser is now worth about a three-hundred-and-twentieth of
                  the winner rather than exactly as much. The two arcs that led
                  the greedy scan astray, the one meaning out of office and the
                  one meaning vivid, are still in the lattice and are still
                  perfectly legal readings; they are simply rare, which is
                  something a count records and a number of pieces cannot.
                </p>
                <InAModel>
                  <p>
                    On a real dictionary this is where almost all of the accuracy
                    comes from. The counts spread the candidates out over a wide
                    range of scores, so exact ties become rare and the ordering
                    between two readings is decided by evidence rather than by a
                    rule about which one to prefer. I have no annotated Chinese
                    corpus on this site to put a number on how much accuracy
                    that is worth, so no accuracy figure appears anywhere on this
                    page, and what is measured here is what happens on texts
                    short enough to check by hand.
                  </p>
                </InAModel>
                <KeepInMind>
                  Counts turn a tie into a preference. That is a different repair
                  from the one in the ninth section, which turned a wrong answer
                  into a right one on a text that had no tie in it at all, and
                  the two are worth keeping apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Adding a word changes the cut of a text without it">
                <p>
                  Here is the consequence that surprised me, and it follows from
                  the division rather than from anything about words. Every score
                  is a count divided by the total of all counts, so adding an
                  entry raises that total and lowers every score by the same
                  amount. A reading with four words has four of those lowered
                  scores and a reading with three has three, so the longer reading
                  loses more, and the ordering between two readings of different
                  lengths can turn over without a single one of their own counts
                  moving.
                </p>
                <Equation>
                  {"one word wins over two  ⇔  count(whole) × total  >  count(first) × count(second)"}
                </Equation>
                <p>
                  Take six words in which the compound meaning life is counted 3
                  times while each of its two characters, both ordinary words on
                  their own, is counted 10, and let the whole list have been
                  counted 32 times. Then reading the compound as two words is
                  worth more than reading it whole, and the sentence comes back
                  in four pieces. Now count one more word, one that occurs
                  nowhere in the sentence at all.
                </p>
                <GrowingWordList />
                <p>
                  The condition above is 3 times the total against 10 times 10,
                  so the two readings are exactly level when the total reaches
                  33.3333, and any total above that reads the compound whole. At
                  32 the split wins by 0.0408. Counting one unrelated word twice
                  takes the total to 34, and the compound wins by 0.0198. Nothing
                  about the sentence, its candidates or their counts changed
                  between those two answers.
                </p>
                <p>
                  My first reading of this was that it made the answer depend on
                  how much text had been counted, and the control at the bottom
                  of the widget says otherwise. Multiply all six counts by a
                  hundred, so that the total runs from 32 to 3,200, and the
                  winning score stays at −6.7729 to the last bit, because every
                  share is a count over a total and multiplying both leaves it
                  alone. Counting the same text over again moves nothing. What
                  moved the answer above was one count belonging to a word this
                  sentence never uses.
                </p>
                <InAModel>
                  <p>
                    The condition itself is a quantity this site has a page on
                    already. Dividing both sides by the total twice turns it into
                    a comparison between the share of the compound and the product
                    of the shares of its two characters, which is exactly the
                    pointwise mutual information between them being above zero,
                    and reading a compound whole is worth it precisely when its
                    two halves attract. Mass belonging to other words lowers the
                    share of each half and so lowers their product twice as fast
                    as it lowers the share of the compound, which is why a wide
                    vocabulary makes long words easier to keep.
                  </p>
                </InAModel>
                <KeepInMind>
                  The best path is a property of the whole string and of the whole
                  list, so a cut at position two can move because of a character
                  at position nine or because of a word that appears at neither.
                  Anything reporting a segmentation is reporting it with respect
                  to a particular list, and to everything else that list happens
                  to hold.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Finding the Best Path Without Looking at the Paths",
          content: (
            <>
              <SubSection title="13. The recurrence">
                <p>
                  Twenty-eight characters of ordinary English permit 2,592
                  readings and a longer text permits very many more, so scoring
                  every reading and taking the best is not a method. What is done
                  instead is to ask, at each position, one question whose answer
                  is a single number, and to ask it from the right-hand end of the
                  text backwards.
                </p>
                <Equation>
                  {"best(i)  =  max over candidates w starting at i of  log( count(w)/total ) + best(i + length of w)"}
                </Equation>
                <p>
                  The number best(i) is the score of the best reading of
                  everything from position i to the end. At the very end there is
                  nothing left to read, so best(n) is zero. Working leftwards,
                  every position has already had the positions to its right
                  answered, so each candidate at position i costs its own score
                  plus a number already sitting in the table. Remembering which
                  candidate won at each position is enough to walk the answer back
                  out from position zero.
                </p>
                <DerivationTable
                  expressionHeading="position"
                  reasonHeading="what the candidates there are worth, and which wins"
                  rows={[
                    {
                      expression: "best(6) = 0",
                      reason: "past the last character, nothing left to read.",
                    },
                    {
                      expression: "best(5) = −3.4965",
                      reason:
                        "only 源, which no entry covers, so −3.4965 plus nothing.",
                    },
                    {
                      expression: "best(4) = −1.8871",
                      reason:
                        "起源 at −1.8871 plus 0, against 起 at −3.4965 plus best(5) = −6.9930. The entry wins.",
                    },
                    {
                      expression: "best(3) = −3.9973",
                      reason: "only 命, at −2.1102, plus best(4) = −1.8871.",
                    },
                    {
                      expression: "best(2) = −3.3042",
                      reason:
                        "生命 at −1.4171 plus best(4) = −1.8871, against 生 at −3.4965 plus best(3) = −3.9973, which is −7.4938.",
                    },
                    {
                      expression: "best(1) = −6.8007",
                      reason: "only 究, at −3.4965, plus best(2) = −3.3042.",
                    },
                    {
                      expression: "best(0) = −4.4981",
                      reason:
                        "研究 at −1.1939 plus best(2), which is −4.4981; against 研究生 at −1.7047 plus best(3), which is −5.7020; against 研 at −3.4965 plus best(1), which is −10.2972. The first wins, and the other two are the second and the fifth readings on the ranking in section 7.",
                    },
                  ]}
                />
                <p>
                  Ten additions, one per candidate, settled a choice among ten
                  readings, and the arithmetic never mentioned a reading. Notice
                  that −5.7020 and −10.2972 turn up in that table as losing
                  branches at position zero and turn up on the ranked list in the
                  seventh section as whole readings, which they are.
                </p>
                <KeepInMind>
                  Each candidate is looked at once and contributes one addition
                  and one comparison, so the work is proportional to the number of
                  candidates however many readings those candidates spell out.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Why the end of a best path is best for what is left">
                <p>
                  The recurrence is only correct if a fact holds that is easy to
                  assume and worth checking. It is that if the best reading of the
                  whole text passes through position i, then the part of it from i
                  onwards is the best reading of everything from i onwards.
                  Without that, keeping one number per position throws away a tail
                  that some other head would have wanted.
                </p>
                <WhyThisWorks>
                  <p>
                    Suppose it failed. Then the best whole path reaches position
                    i by some head and finishes with some tail, and there is a
                    different tail from i that scores more than the one it
                    finished with. Swapping the better tail in leaves the head
                    untouched and raises the total, which gives a complete path
                    scoring more than the one we had called best, and that cannot
                    be. The swap is legal because both tails start at exactly the
                    position where the head ends, so either fits on as it stands.
                  </p>
                  <p>
                    The step doing the work is that the score is a sum whose terms
                    depend on nothing but the arcs, so a tail is worth the same
                    whatever head it was reached by. That is exactly the
                    independence assumption of the fifth section, cashed in. If a
                    word&rsquo;s score depended on the word before it, a tail
                    would be worth different amounts after different heads, the
                    swap would change what the tail scored, and a single number
                    per position would no longer be enough. The repair is to keep
                    one number per
                    position and per preceding word, which multiplies the table by
                    the size of the list, and is where the cheapness stops.
                  </p>
                </WhyThisWorks>
                <p>
                  This is the argument Bellman called the principle of optimality
                  and the recurrence is the one Viterbi published for decoding a
                  channel, with the words of a sentence standing where the states
                  of a code stood. The character-level tagger of the next page in
                  this section runs the identical recurrence one level down, over
                  positions in a word rather than words in a sentence.
                </p>
                <KeepInMind>
                  The affordability of this method is bought with the assumption
                  that a word&rsquo;s score does not depend on its neighbours. It
                  is a false assumption about language and it is the reason one
                  number per position suffices, so the cost and the crudeness are
                  the same fact.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. What it costs, measured against the greedy scan">
                <p>
                  Each position offers at most as many candidates as the longest
                  entry is long, so a run of n characters against a list whose
                  longest entry is L characters costs at most n multiplied by L
                  questions, exactly the bound the greedy scan had. The difference
                  is that the greedy scan stops asking at a position as soon as
                  one candidate hits, and this one asks about all of them, because
                  a candidate that loses at a position may still be on the best
                  path.
                </p>
                <Equation>{"questions  ≤  n × L"}</Equation>
                <ReadingsAgainstSteps />
                <NumberTable
                  headings={[
                    "text",
                    "the best path",
                    "greedy, from the left",
                    "greedy, from the right",
                  ]}
                  rows={[
                    ["我们在野生动物园玩", "24 questions", "9", "8"],
                    ["thetabledownthere", "125 questions", "20", "18"],
                    ["our sentence, spaces removed", "405 questions", "191", "156"],
                  ]}
                  caption="Substrings the word list was asked about, on the three texts. The best path costs between two and seven times what the greedy scan costs on these, and both are linear in the length of the text against a number of readings that is not."
                />
                <p>
                  There is one cost that is not a count of questions and it
                  matters more in practice. The greedy scan can hand back its
                  first word after reading a few characters; this one cannot say
                  anything until it has reached the end of the run and come back,
                  because best(0) is the last number the table fills in. On a
                  sentence that is nothing, and on a stream of text that has to be
                  cut into runs first, it is the reason whitespace ending a run
                  matters as much here as it did on the previous page.
                </p>
                <KeepInMind>
                  Between two and seven times the questions, and the same order of
                  growth, in exchange for a comparison between whole readings
                  where the greedy scan compared candidates at one position. That
                  is the trade, and it is why a modern dictionary segmenter runs
                  this rather than the greedy scan.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. A Stretch the Word List Never Saw",
          content: (
            <>
              <SubSection title="16. What one count is worth">
                <p>
                  A path has to exist for every text, including a text made
                  entirely of characters nobody wrote down, so every position
                  carries a single-character candidate whether or not the list
                  holds it. That candidate needs a score, and there is no evidence
                  anywhere from which to estimate one. What is used is the
                  smallest score a real entry could have had, which is the score
                  of a word counted exactly once.
                </p>
                <Equation>
                  {"score of a character no entry covers  =  log( 1 / total )"}
                </Equation>
                <p>
                  Against a list counted 33 times that is −3.4965, which is worse
                  than the rarest of the five entries at −2.1102 and much worse
                  than the commonest at −1.1939. It is a convention rather than a
                  measurement and it is worth saying so plainly, because it is
                  doing real work. Set it lower and a stretch of unknown
                  characters becomes so expensive that the path will contort to
                  avoid it; set it higher and single characters start winning
                  against real words.
                </p>
                <LatticeBoard scenarioKeys={["name"]} />
                <p>
                  Here is our own sentence contributing to the Chinese half of the
                  page again, with Alvarez written the way Chinese writes a
                  foreign name and put in front of the six characters from before.
                  The five characters of the surname have no arcs above them at
                  all, only the flat single-character candidates along the
                  baseline, which is what a stretch the list never saw looks like.
                </p>
                <KeepInMind>
                  Treating an unseen character as though it had been seen once is
                  the smallest lie that keeps a path available everywhere. It is
                  not an estimate of anything and no part of it was fitted to
                  data.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A word always beats the characters underneath it">
                <p>
                  That choice has a consequence worth checking, which is that a
                  stretch of unknown characters can never outscore a single entry
                  covering the same stretch, however the entries are counted. So
                  the fallback never eats a word, and no arrangement of the
                  counts lets it.
                </p>
                <WhyThisWorks>
                  <p>
                    An entry covering k characters scores the logarithm of its
                    count over the total. The k unknown characters underneath it
                    score the logarithm of one over the total, k times over, which
                    is the logarithm of one over the total raised to the k. Since
                    an entry is counted at least once, its numerator is at least
                    one; since the total is above one, dividing by it k times is
                    worse than dividing by it once. So for any k of two or more
                    the entry wins, and at k equal to one the question does not
                    arise, because a character the list holds gets no fallback
                    candidate.
                  </p>
                </WhyThisWorks>
                <p>
                  It also says something about the shape of the failure. The
                  method will not chop a word it knows into characters, and it
                  will always chop a word it does not know into characters, so
                  every error of this kind falls on the same side. Five unknown
                  characters cost five times −3.4965, which is −17.4826, and there
                  is no arrangement of the list that would have got any of it
                  back.
                </p>
                <KeepInMind>
                  The fallback is a floor rather than a competitor. It guarantees
                  a path exists and it never wins an argument with a word, so what
                  it costs is a measure of how much of the text the list did not
                  cover.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Where the surname leaves the answer">
                <p>
                  Score the whole thing and the arithmetic separates cleanly,
                  which is itself informative. The surname contributes its five
                  fallback scores and the rest of the sentence contributes exactly
                  what it contributed before the surname was in front of it.
                </p>
                <PathLadder scenarioKeys={["name"]} />
                <p>
                  The best path scores −21.9806, which is −17.4826 for the
                  surname plus the −4.4981 the six characters scored on their own,
                  and the gap to the next reading is 1.2040, exactly the gap it
                  was without the surname. Eleven characters that a person reads
                  as four words come back as eight pieces, five of which carry
                  almost nothing about the sentence. The greedy scan answered
                  eight pieces here as well, so on this text the two methods cost
                  the same and are wrong in the same place.
                </p>
                <InAModel>
                  <p>
                    This is where the last piece of a working segmenter goes.
                    Having found the best path, look for stretches of consecutive
                    single characters that no entry covers, and hand each stretch
                    to a model that guesses at word boundaries from the characters
                    themselves rather than from a list. The lattice cannot do it,
                    since a word it has never seen is on no path here, and the
                    handoff is only possible because the fallback marks those
                    stretches out unmistakably. That model is the next page in
                    this section.
                  </p>
                </InAModel>
                <KeepInMind>
                  Names, loanwords, numbers and anything coined after the list was
                  written all land in the same place, and the method does not
                  repair it and does not pretend to. What it does is leave the
                  damage clearly labelled for something else to look at.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="19. Two readings can score exactly the same">
                <p>
                  The method asks for the reading with the highest score, and a
                  highest score can be reached by more than one reading. When it
                  is, the question the method poses has several correct answers
                  and the method contains nothing whatever that prefers one of
                  them. Something outside the score has to finish the job, and
                  whatever that something is, it is a convention of the same kind
                  the previous page was made of.
                </p>
                <PathLadder scenarioKeys={["table"]} />
                <p>
                  Seventeen characters of ordinary English against 810 words
                  counted once each. Two readings use four words, they score
                  −26.7881 apiece and the two numbers are equal in every bit, so
                  the gap is zero and neither is likelier. One of them is the
                  sentence and the other is four real English words nobody would
                  write, and what decides is a rule about which candidate to keep
                  when a comparison comes out level. Prefer the longer candidate,
                  which is the usual choice, and the five-letter Greek letter is
                  taken and the wrong reading comes back. The greedy scan run from
                  the right end had answered correctly.
                </p>
                <p>
                  Ties are not an accident of a small example either. With every
                  count equal the score is a count of words times a constant, so
                  every reading of a given length scores identically and ties are
                  the normal case rather than the exception; the wildlife park
                  sentence in the tenth section ties for the same reason. Counts
                  make ties rare without making them impossible, since two
                  readings can multiply out to the same product.
                </p>
                <KeepInMind>
                  Where the top two scores are equal, reporting a single answer is
                  reporting a convention as though it were a result. The number
                  worth carrying beside any segmentation is the gap to the next
                  reading, since a gap of zero says the method chose nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The counts are an opinion about one body of text">
                <p>
                  The score of a reading is built entirely out of counts, and a
                  count is a fact about whatever somebody counted rather than
                  about the language. So when this method reports that one reading
                  is three and a third times likelier than another, it is
                  reporting a property of a corpus, and it will report a different
                  number for a different corpus without anything having gone
                  wrong.
                </p>
                <p>
                  The eighth section is that statement made concrete. Two sets of
                  counts over the same five words, one lattice, and two opposite
                  answers with confident-looking margins on both. Neither is a
                  mistake. If the counted text was news, the research reading is
                  the right answer for news; if it was university administration,
                  the graduate student reading is the right answer for that, and
                  the method has no access to which body of text a reader has in
                  mind.
                </p>
                <p>
                  There is a further wrinkle, which is that the counts have to
                  come from text somebody has already segmented, since counting
                  occurrences of a word means knowing where the words were. The
                  method therefore consumes the answer to a version of the
                  question it exists to answer. That is not circular in practice,
                  because a small hand-segmented corpus can build counts good
                  enough to segment a large one, and it does mean any claim about
                  what these numbers measure runs back to a body of text somebody
                  cut up by hand.
                </p>
                <KeepInMind>
                  Likelier is always likelier under some counting. A margin
                  reported without saying what was counted is a number without
                  units, and two segmenters that disagree about a sentence may
                  have counted different text and both be working correctly.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. A word off the list is on no path, and the scores are not probabilities">
                <p>
                  Two more places where the method is silent rather than
                  approximate. The first is the ceiling. The readings available are exactly
                  those spellable out of the list plus single characters, so a
                  reading containing a word the list lacks was never a candidate,
                  and no amount of improvement to the counts can reach it. However
                  good the scoring becomes, the word list is the boundary of what
                  can be said.
                </p>
                <p>
                  The second is that the scores are not probabilities of anything,
                  and it is worth seeing why rather than taking it as a caution.
                  Every entry&rsquo;s share is its count over the total of every
                  count, so the shares of the entries add to exactly one already.
                  Each single character the list does not hold is then handed
                  another share of one over the total on top of that. The numbers
                  being multiplied together therefore add to more than one over
                  the things they describe, so a score ranks readings correctly
                  and is no probability.
                </p>
                <p>
                  That is why the widgets on this page print a gap and a ratio
                  rather than a confidence. The difference between two scores is
                  readable, since the extra mass sits in both of them and cancels
                  in the comparison, and a single score standing on its own cannot
                  be read as how sure anything is. Building a segmenter that
                  answers with a genuine probability means reserving mass for
                  words nobody has written down and taking it away from the ones
                  the list holds, which is a different model rather than a
                  correction to this one.
                </p>
                <KeepInMind>
                  Neither of these shows up in an answer. A reading built entirely
                  out of entries looks the same whether the list was complete or
                  not, and the winning score looks the same whether or not the
                  quantity behind it could be read as a degree of belief. What can
                  be read is the difference between two scores.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs and questions on
                  which the method stops being defined rather than becoming
                  approximate, with what has to be decided in each case and what
                  turns on the decision. The decisions are the ones worth a
                  reader&rsquo;s attention, since nothing in the method makes them
                  and every one of them changes what comes back.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "two readings with the same score",
                      reason:
                        "undetermined, since a maximum over a finite set orders nothing among the elements that attain it. On seventeen characters of English two readings score −26.7881 in every bit; the rule that finishes the job is a preference between candidates, and preferring the longer one returns four real words nobody would write.",
                    },
                    {
                      expression: "a word list with no counts at all",
                      reason:
                        "well defined and answering a different question, since every entry counted once makes the score a count of words and the answer the shortest reading. That fixes a piece count and leaves every reading of a given length tied, which on nine Chinese characters is two readings at −10.9861 of which one is right.",
                    },
                    {
                      expression: "where the counts came from",
                      reason:
                        "not asked, and not answerable from inside. The same lattice over the same five words answers research at a margin of 1.2040 under one set of counts and a graduate student at 1.0986 under another. Both margins are honest reports about different bodies of text.",
                    },
                    {
                      expression: "what else the same word list holds",
                      reason:
                        "decides answers about words it does not contain, since every score is divided by the total of every count and a reading using more words is divided more often. Six words counted 32 times split a compound into its two characters; counting one unrelated word twice, so 34 in all, reads it whole, and the two are level at a total of 33.3333 exactly. Multiplying all six counts by a hundred changes nothing at all, so what decides is the counts belonging to other words rather than how much text was read.",
                    },
                    {
                      expression: "a character no entry covers",
                      reason:
                        "a convention rather than an estimate, scored as though the character had been counted once. It has to be something for a path to exist at all, and what it is set to decides whether an unfamiliar stretch is guessed at or given up on. At a total of 33 it is −3.4965, worse than the rarest real entry at −2.1102.",
                    },
                    {
                      expression: "a word the list does not hold",
                      reason:
                        "not producible, which is stronger than not found. The reading containing it is outside the set of paths, so there is no sense in which it was scored and rejected, and improving the counts cannot reach it. Five characters of a transliterated surname cost −17.4826 and no arrangement of the counts recovers any of it.",
                    },
                    {
                      expression: "whether a word depends on the word before it",
                      reason:
                        "assumed not to, which is false about language and is what makes the search cheap. One number per position suffices only because a tail is worth the same whatever head reached it; scoring a word against its predecessor multiplies the table by the size of the list.",
                    },
                    {
                      expression: "what a score means on its own",
                      reason:
                        "nothing, because the numbers being multiplied do not add up to one. The entries' shares already total one and every uncovered character is handed another share on top, so a ratio between two readings can be read and a single score cannot be read as a confidence.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "outside the method, as it was on the previous page. Whether a Chinese compound is one word or two is unsettled in the language itself, so two annotated corpora will disagree about the same string, and any accuracy figure would be a figure about one of them.",
                    },
                  ]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely how a tie
                  is settled, what an uncovered character is worth, what text the
                  counts were taken from, and which words the list carries besides
                  the ones a sentence uses. Each has a defensible answer on more
                  than one side and each changes the cut, so each belongs in
                  whatever describes a segmenter rather than being left to whoever
                  writes one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
