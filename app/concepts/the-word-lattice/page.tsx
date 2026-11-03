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
import { GrowingWordList } from "@/components/widgets/GrowingWordList";
import { LatticeBoard } from "@/components/widgets/LatticeBoard";
import { LatticePlayground } from "@/components/widgets/LatticePlayground";
import { PathLadder } from "@/components/widgets/PathLadder";
import { ReadingsAgainstSteps } from "@/components/widgets/ReadingsAgainstSteps";



export const metadata: Metadata = {
  title: "The Word Lattice · Perceptron Lab",
  description: "A word lattice retains alternative ways to divide a sequence into words. Complete paths represent different segmentations, allowing choices to be compared before committing to an early boundary.",
};

export default function TheWordLatticePage() {
  return (
    <ConceptPage
      lessonId="the-word-lattice"
      intuition={lessonIntuitions["the-word-lattice"]}
      technicalStart="Part 2. What a Whole Reading Is Worth"
      openingTitle="A Good First Word Can Leave a Bad Ending"
      playgroundTitle="Compare complete paths through a sentence"
      playgroundIntro="Trace two complete paths through the same text. Compare their total scores, rather than judging a path only by the length of its first word."
      title="The Word Lattice"
      tagline={"A word lattice retains alternative ways to divide a sequence into words. Complete paths represent different segmentations, allowing choices to be compared before committing to an early boundary."}
      prerequisites={
        <>
          The previous lesson compared greedy dictionary scans. Here we retain alternatives and give each candidate a frequency-based weight. The examples use supplied count tables. We divide each count by the total and add logarithms along a complete path; each calculation will be shown beside its input values.</>
      }

      playground={<LatticePlayground />}
      sections={[
        {
          title: "Part 1. What Committing at Each Step Costs",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Where the greedy scan left off">
                <p>
                  The greedy scan committed to the longest entry at each position, which could leave an awkward remainder. We can instead retain the candidate words as paths and compare complete readings. That changes how available entries are selected; it still cannot select a word absent from the dictionary or its stated fallback rules.
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
                <>
<p>
                  After under, the longest matching entry in this 810-word English list is theta. Selecting it leaves b, l and e uncovered by entries, so the greedy result has seven pieces rather than the intended five. Reading the candidate spans shows why a locally valid word can still be the wrong choice for the complete text.
                </p>
                <p>The greedy scan compares matches at the current position and commits before checking the best complete segmentation. It therefore does not account for the three extra pieces left after theta. To compare that consequence before committing, we need to retain alternative paths through the whole text.</p>
</>
                <p>
                  {"The lattice changes the search over available candidates. In the bare dictionary model, an absent multi-character word still cannot appear as one edge. The surname example later will separate that coverage problem from greedy commitment."}
                </p>
                <KeepInMind>
                  {"The greedy scan does not compare complete path scores before committing. The lattice retains the alternatives so their later consequences can contribute to the choice."}
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
                  {"The five-entry dictionary permits both the research/life/origin path and the graduate-student/fate/origin path through these six characters. Entry membership alone does not identify the intended interpretation."}
                </p>
                <LatticeBoard scenarioKeys={["research"]} />
                <>
<p>
                  {"There are ten candidates: five matched dictionary entries and five additional one-character fallbacks. A character can have a fallback edge even while a longer dictionary word spans it. Each edge records its start and end; the two-character entry at the beginning goes from 0 to 2, and the three-character entry goes from 0 to 3."}
                </p>
                <p>
                  An arrangement like this one is what the method is named after, and this sense of the word, a set of positions with arcs between them, has nothing to do with the lattice of order theory that the same word names in algebra.
                </p>
</>
                <KeepInMind>
                  {"The graph contains all paths allowed by this dictionary and fallback policy. It has not chosen among them yet. If a reference segmentation uses an unavailable multi-character word, that reference path is absent too."}
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
                  A path represents a complete segmentation. That gives us a way to score an early choice together with the pieces it leaves for the rest of the sentence. We can now compare a long first word with a shorter one without committing before we know how the sentence ends.
                </p>
                <KeepInMind>
                  {"A complete segmentation corresponds to a path through this acyclic graph. Once each edge has a score that adds along the path, dynamic programming can compare those paths without enumerating every one."}
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Why there are so many fewer paths than cuts">
                <p>
                  {"For a nonempty n-character run, each internal position can be cut or joined. The dictionary restricts the longer pieces, while one-character fallback edges remain available. A proposed piece with neither a dictionary edge nor an allowed fallback cannot appear on a lattice path."}
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
                  {"These examples use far fewer candidate edges than unrestricted boundary patterns. The 28-character input has 2,592 paths but only 45 candidates. The 45-character input has fewer paths because dictionary gaps restrict its choices. The candidate count, rather than the number of complete paths, controls the path-scoring pass."}
                </p>
                <KeepInMind>
                  {"A compact graph can encode many complete segmentations. Enumerating a small example may be practical, but path counts can grow rapidly on ambiguous text. The later recurrence works over candidates so it does not need to list every complete reading."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What a Whole Reading Is Worth",
          content: (
            <>
              <SubSection title="5. A reading is worth the counts of the words it used">
                <p>
                  {"Assign each dictionary entry its supplied frequency divided by the dictionary total. Multiplying those values treats the pieces as independent for scoring. The teaching examples use specified counts, including hand-assigned ones, rather than evidence that every path has been observed. Fallback weights will require a further qualification because they add mass outside the dictionary."}
                </p>
                <Equation>
                  {"P(reading)  =  product over its words w of  count(w) / total"}
                </Equation>
                <p>
                  {"Real word use depends on context, and counts depend on the text or weights chosen. The unigram assumption ignores those dependencies. It makes this particular position-only recurrence possible; richer models can still use dynamic programming if their state retains the needed history."}
                </p>
                <DerivationTable
                  expressionHeading="entry"
                  reasonHeading="its count, its share of 33, and what it scores"
                  rows={[
                    {
                      expression: "研究",
                      reason:
                        "supplied count 10, share 10/33, log score −1.1939",
                    },
                    {
                      expression: "生命",
                      reason:
                        "supplied count 8, share 8/33, log score −1.4171",
                    },
                    {
                      expression: "起源",
                      reason:
                        "supplied count 5, share 5/33, log score −1.8871",
                    },
                    {
                      expression: "研究生",
                      reason:
                        "supplied count 6, share 6/33, log score −1.7047",
                    },
                    {
                      expression: "命",
                      reason:
                        "supplied count 4, share 4/33, log score −2.1102",
                    },
                    {
                      expression: "any single character no entry covers",
                      reason:
                        "treated as though it had been counted once, so a share of 1/33, and a score of −3.4965. It is a convention rather than an estimate and the sixteenth section argues with it.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"The counts give this score a way to prefer one permitted path over another. They do not tell us which segmentation the language actually produces unless representative evidence and the scoring assumptions support that interpretation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Why the product becomes a sum">
                <p>
                  {"A reading with forty pieces multiplies forty weights. As a product gets smaller, finite-precision arithmetic can lose it to underflow; the point depends on the weights and numeric type. It is not inevitable for every forty-word sentence. Logarithms let us add the corresponding values instead of carrying a very small product."}
                </p>
                <Equation>
                  {"score(reading)  =  sum over its words w of  log( count(w) / total )"}
                </Equation>
                <p>
                  {"Taking logs preserves the order of positive path weights because the logarithm is increasing. The listed reference weights are below one, so their log scores are negative and a larger score wins. A difference of log scores gives the log ratio of those model weights, not a direct measure of the writer’s intention."}
                </p>
                <WhyThisWorks title="Why adding log probabilities lets us reuse the best remaining path">
                  <>
<p>
                    There is a second reason to prefer the sum, and it is structural rather than numerical. A sum over the words of a reading is a sum over the arcs of a path, so the score of a path is the total of the weights on the arcs it walks. That is the shape every shortest-path argument needs, and it is what lets the fourteenth section split a path into a head and a tail and reason about the two separately.
                  </p>
                  <p>
                  {"A product recurrence could also reuse the same independent factors. The additive form is convenient because it avoids very small products and expresses the path total as a sum of edge weights."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>

                  Logarithms here are bookkeeping and not modeling. The model is
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
                  <>
                    <p>
                      Each three-piece reading multiplies its three word probabilities.
                      In log space, add the log probabilities instead.
                    </p>
                    <Equation>{"research reading = ln(10/33) + ln(8/33) + ln(5/33) ≈ −4.4981\ngraduate-student reading = ln(6/33) + ln(4/33) + ln(5/33) ≈ −5.7020\nlog-score difference ≈ 1.2040"}</Equation>
                  </>
                  <>
                    <p>
                      Both readings contain three pieces, so their common denominator
                      cancels when we compare probabilities.
                    </p>
                    <Equation>{"probability ratio = (10 × 8 × 5) / (6 × 4 × 5)\n                  = 400 / 120 = 10/3\nlog ratio = ln(10/3) ≈ 1.2040\nlosing probability / winning probability = 120/400 = 0.30"}</Equation>
                    <p>
                      The thirty percent shown by the widget is relative to the winning
                      path. It is not the losing path’s normalized share of all possible
                      readings.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  The method ranks the research reading higher under the supplied counts. It has not independently established what the writer intended. Section 20 examines how dependent that preference is on the evidence and scoring assumptions.
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
                <>
                  <p>
                    After the count changes, the graduate-student reading wins. Compare
                    the two path products again.
                  </p>
                  <Equation>{"probability ratio = (20 × 12 × 5) / (10 × 8 × 5)\n                  = 1,200 / 400 = 3\nlog-score difference = ln 3 ≈ 1.0986"}</Equation>
                  <p>
                    The log-score difference is about 1.0986; the probability ratio is
                    three. Greedy longest matching is unchanged because it does not
                    consult these counts.
                  </p>
                </>
                <InAModel>
                  <p>
                  {"Changing only the supplied counts can change the selected path. That is a different source of variation from changing a greedy scan’s direction. If counts are estimated from text, their provenance and representativeness matter; simply collecting more text does not guarantee a better segmentation."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The same candidate graph gives different winners under the two specified count tables. Record both the candidates and the scoring data when reproducing the result. The search rule still determines how those inputs are used."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Constructing the lattice supplies candidate spans and scores without selecting the final segmentation.",
              true,
              "The lattice contains each fitting dictionary entry and the specified character fallbacks. It represents possible routes through the source; a separate best-path calculation chooses among them. It cannot contain an arbitrary multi-character word absent from the dictionary as one edge, so its coverage is already a modeling choice.",
            ),
            choice(
              "A text of n characters admits two to the power of n minus one cuts. What does the word list buy?",
              [
                "Almost none of those cuts are paths, since a cut whose pieces are not entries has no arcs to walk along",
                "It brings the count of readings down to something small",
                "It rules out every reading that uses a bare single character",
                "It fixes the number of readings at ten whatever the text",
              ],
              0,
              "The dictionary restricts which multi-character pieces can become edges, while fallbacks keep uncovered positions traversable. A complete segmentation combines compatible edges. The remaining number of paths can still grow rapidly, although a small example may be easy to enumerate. Dynamic programming reuses suffix results instead of needing to enumerate every complete path.",
            ),
            choice(
              "Why is the model computed as a sum of logarithms rather than as the product of shares it actually is?",
              [
                "A product of many shares falls below the smallest number a computer can tell from zero, and a sum over arcs is the shape every result about paths is written in",
                "The logarithm changes which reading wins, in favor of the shorter one",
                "It makes every score positive and so easier to compare",
                "It turns the shares into probabilities that add to one",
              ],
              0,
              "Logarithms preserve the ordering of positive path weights and turn multiplication into addition. This is convenient for dynamic programming and avoids some numerical underflow from multiplying many small values. The scores are nonpositive under these word shares, with zero possible for a share of one. Changing to logs does not change the underlying weighting assumptions.",
            ),
            trueFalse(
              "Changing these word counts reverses the best reading and also changes which candidate spans exist.",
              false,
              "The lattice is character for character the same, the same ten candidates at the same ten spans, and only the answer moves. Greedy longest matching is unchanged as well, because it never consults these counts. That is the difference worth carrying away, since the greedy rule’s answer is a property of the direction it was run in and this one’s is a property of the counts it was given.",
            ),
            several(
              "What limitations follow from using independent corpus word-frequency weights?",
              [
                "Words are not independent, since research is far likelier before origin than after it",
                "The counts come from whatever text somebody happened to count",
                "Independence lets this decoder keep one suffix score per position.",
                "The counts are the only evidence about the language the method has",
              ],
              [0, 1, 2, 3],
              "All four hold, and neither failing is fatal. Treating the words as independent is false about language and is exactly what lets the search in Part 4 keep one number per position, so the cost and the crudeness are the same fact. The counts are evidence about whatever text was counted rather than about the language, and one lattice under two sets of counts gives two opposite answers, so where the counts came from is the whole question and not one this method contains an answer to.",
            ),
        ],
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
                  {"Every English dictionary entry in this example has weight one, as do its singleton fallbacks. The five-piece reference scores −33.4852 and the seven-piece greedy result scores −46.8792. The latter ranks fourth and has one part in 656,100 of the reference path’s weight. This difference comes from its two additional edge factors, not from measured word-frequency preferences."}
                </p>
                <WhyThisWorks title="How an early word choice changes the cost of the remaining text">
                  <p>
                  {"After taking theta, the path must still cover the characters left behind. Their singleton edges contribute to the total just as the earlier word does. Comparing whole-path sums therefore accounts for that remainder, which the local longest-match choice did not score."}
                </p>
                  <p>
                  {"The graph contains candidates at every position, and the path search compares their complete suffix scores. That is different from committing locally and later undoing a cut. Greedy and lattice methods draw on the same dictionary entries, but the lattice retains alternatives the greedy scan did not follow."}
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
                  {"If a dictionary has no measured frequencies, assigning one to every entry is one possible policy. With more than one total count and the same fallback weight, all edges then share a negative log score. Maximizing the total favors paths with fewer pieces. That is the shortest-path criterion, not evidence of linguistic likelihood."}
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
                  {"Under equal negative edge scores, the search finds a minimum-piece path. Several paths can share that minimum, so another tie rule may select a different segmentation from the reference. Fewer pieces is a criterion, not an automatic improvement in word accuracy."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The same nine words, counted">
                <p>
                  The nine-word example uses hand-assigned illustrative counts, not measurements from a Chinese corpus. The preposition and pronoun receive high values, the compounds in the intended reading receive intermediate values, and the alternatives receive lower ones. Keeping that construction explicit lets us inspect how counts change a path score without presenting the resulting preference as empirical language evidence.
                </p>
                <LatticeBoard scenarioKeys={["park-plain", "park-counted"]} />
                <p>
                  {"Under the illustrative counts, the reference path scores −10.9001 and the other five-piece path scores −16.6684. Their gap is 5.7683, corresponding to a relative weight of about one three-hundred-and-twentieth for the latter. The misleading edges remain in the graph with lower assigned frequencies; the experiment has not measured that they are rare in natural text."}
                </p>
                <InAModel>
                  <p>
                  Counts can distinguish paths that a length rule leaves tied, but their usefulness depends on how well they represent the text being segmented. The examples show that scoring mechanism on short, inspectable inputs. Without an annotated Chinese evaluation corpus, they do not establish how much accuracy this score would add on ordinary prose.
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
                  {"Every edge score includes the dictionary total in its denominator. Adding frequency to an unrelated entry raises that total. Longer paths contain more denominator factors than shorter paths, so their relative ranking can change even when the sentence’s own entry counts stay fixed."}
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
                <>
                  <p>
                  The compound has count three, while each of its two separate words has count ten. The model compares probabilities obtained using the corpus total, rather than comparing those raw counts alone. Changing that total can therefore change which complete reading wins. The threshold below makes this dependence explicit for the stated score.
                </p>
                  <Equation>{"tie condition: 3 × total = 10 × 10\ntie total = 100/3 ≈ 33.3333"}</Equation>
                  <p>
                    At total thirty-two, splitting wins by about 0.0408 in log score.
                    Adding two occurrences of an unrelated word raises the total to
                    thirty-four, making the compound win by about 0.0198. The sentence
                    and its candidate counts did not change.
                  </p>
                </>
                <>
<p>
                  {"The control scales all six counts by a hundred, raising the total from 32 to 3,200. Every relative frequency stays the same, and the winning score remains −6.7729. That differs from adding frequency to only one unrelated entry, which changes the distribution."}
                </p>
                <p>
                  Counting the same text over again moves nothing. What moved the answer above was one count belonging to a word this sentence never uses.
                </p>
</>
                <InAModel>
                  <>
<p>
                  {"The inequality compares the weight assigned to one compound with the product of its two parts’ weights. That is enough to explain this decision. These are word-entry counts, not measured counts of the two parts appearing together. The algebra alone does not establish that the two parts are associated in a corpus."}
                </p>
                  <p>
                  {"Adding unrelated frequency changes a two-piece path’s denominator twice and a one-piece path’s denominator once. In this score, that can favor the compound. Vocabulary width alone does not decide the result: the entry counts and total mass matter."}
                </p>
</>
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
                  {"The 28-character example has 2,592 complete paths. Rather than score each one separately, compute the best suffix score at each position, working from right to left. The recurrence reuses the result whenever several candidates lead to the same suffix."}
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
                <WhyThisWorks title="Why a better tail would imply a better complete path">
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
                  <>
<p>
                    The step doing the work is that the score is a sum whose terms depend on nothing but the arcs, so a tail is worth the same whatever head it was reached by. That is exactly the independence assumption of the fifth section, cashed in. If a word&rsquo;s score depended on the word before it, a tail would be worth different amounts after different heads, the swap would change what the tail scored, and a single number per position would no longer be enough.
                  </p>
                  <p>
                  {"A model depending on the preceding word needs state that remembers that word, or an equivalent context. A dense table could multiply the state count by vocabulary size, though sparse or constrained states may use less. More history changes the search cost rather than making dynamic programming impossible."}
                </p>
</>
                </WhyThisWorks>
                <p>
                  {"The reuse argument is an instance of Bellman’s principle of optimality. Viterbi decoding also chooses high-scoring paths through states with limited history. The next character tagger uses related max-sum reasoning, but its state includes a character-position tag rather than only a word boundary."}
                </p>
                <KeepInMind>
                  {"One score per boundary suffices here because each edge has a fixed value independent of the earlier path. A contextual model needs additional state. The independence assumption is therefore a practical simplification whose linguistic accuracy should be evaluated separately from the search algorithm."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The extra search needed to compare complete readings" id="15-what-it-costs-measured-against-the-greedy-scan">
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
                  caption="Candidate substring queries on three examples. The lattice uses between two and seven times the greedy query counts here. Their stated lookup bounds are linear in input length for fixed maximum entry length; these are not measured runtime ratios."
                />
                <>
<p>
                  There is one cost that is not a count of questions and it matters more in practice. The greedy scan can hand back its first word after reading a few characters; this one cannot say anything until it has reached the end of the run and come back, because best(0) is the last number the table fills in.
                </p>
                <p>
                  {"For the backward suffix calculation, the run must be available before the first selected word is emitted. A streaming application can buffer finite runs, use a different search policy or delay its output. Whitespace is this implementation’s chosen run boundary."}
                </p>
</>
                <KeepInMind>
                  {"The shown examples use between two and seven times as many candidate queries as the greedy scans. Both stated lookup bounds depend on input length and maximum dictionary entry length. This is the measured search tradeoff, not evidence that every modern dictionary segmenter uses this algorithm."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Standing after under, the greedy scan took the five-letter Greek letter. What does scoring the whole path change about that choice?",
              [
                "A path through it still has to reach the end of the text with single characters, so the purchase and the bill are terms in the same sum",
                "The candidate is removed from the lattice",
                "The scan backtracks out of the bad choice once the stranded characters appear",
                "The scan looks three characters ahead before committing",
              ],
              0,
              "The complete-path score includes the pieces left after the tempting theta match. The alternative using the and table has a better total under this dictionary, so it wins even though theta is the longer local entry. Dynamic programming compares full route totals while reusing suffix scores; it does not have to commit to the greedy match and repair it afterward.",
            ),
            trueFalse(
              "With a word list and no counts, maximizing the score means using as few words as possible.",
              true,
              "Every entry has been counted once, so every word is worth the same and the score is that one value added up once per word. On the wildlife park sentence the best paths use five words for −10.9861 where the greedy scan from the left used six for −13.1833. What is not repaired is the reading, since two different paths use five words and score identically to the last bit.",
            ),
            trueFalse(
              "Multiplying every dictionary count by the same positive factor changes the relative frequency shares of its listed entries.",
              false,
              "Each listed count and their total grow by the same factor, so their shares are unchanged. In this supplied example, the winning all-entry path and its score stay unchanged too. This SDK’s unlisted-character fallback uses a fixed pseudo-count, so uniform scaling of listed counts can change that fallback’s relative weight. Do not generalize this control to every path containing unknown characters.",
            ),
            choice(
              "Reading a compound whole is worth more than reading it as its two separate words exactly when what holds?",
              [
                "Its two halves attract, which is their pointwise mutual information being above zero",
                "Its count is larger than the sum of its two halves’ counts",
                "The compound is longer than two characters",
                "The total of all counts is below one hundred",
              ],
              0,
              "Dividing both sides of the tie condition by the total twice turns it into a comparison between the share of the compound and the product of the shares of its halves. Mass belonging to other words lowers the share of each half and so lowers their product twice as fast as it lowers the share of the compound, which is why a wide vocabulary makes long words easier to keep.",
            ),
            choice(
              "The search keeps one number per position. What makes that enough?",
              [
                "A tail is worth the same whatever head reached it, because the score is a sum whose terms depend on nothing but the arcs",
                "Every position offers exactly one candidate that can lie on the best path",
                "The candidates at a position are tried longest first",
                "The table is filled from the left, so a head is settled before its tail",
              ],
              0,
              "That is the independence assumption cashed in. If a word’s score depended on the word before it, a tail would be worth different amounts after different heads, the swap argument would fail, and the repair would be one number per position and per preceding word, which multiplies the table by the size of the list. The table is filled from the right-hand end, since the score at the end of the text is zero.",
            ),
        ],
        },
        {
          title: "Part 5. A Stretch the Word List Never Saw",
          content: (
            <>
              <SubSection title="16. What one count is worth">
                <p>
                  {"This implementation adds a one-character edge when that character is not a dictionary entry, so every non-whitespace position remains traversable. It assigns that fallback a frequency weight of one. That is an explicit policy, not an observed count or the only possible unknown-word model."}
                </p>
                <Equation>
                  {"score of a character no entry covers  =  log( 1 / total )"}
                </Equation>
                <p>
                  With a total count of 33, the fallback log score is −3.4965, below the rarest listed entry at −2.1102 and the commonest at −1.1939. This fallback is a convention rather than an observed frequency. Lowering it penalizes unknown-character paths more heavily; raising it can make individual characters preferable to listed words. We should test that policy on text containing unknowns.
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
                  {"The one-count fallback guarantees a path through otherwise uncovered characters. Its score is a convention in this model. A different fallback weight or unknown-word procedure would need its own stated behavior and evaluation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A word always beats the characters underneath it">
                <p>
                  {"Compare a listed word with a path made only of unlisted one-character fallbacks over the same span. Under this default scoring rule, the listed word cannot have a lower score. That does not compare it with paths containing other listed words or known single-character entries."}
                </p>
                <WhyThisWorks title="Why a stored word beats its unknown characters under this scoring rule">
                  <>
<p>
                  {"For a positive integer word count, the listed word’s numerator is at least one. With a total above one, dividing once beats multiplying several one-over-total fallback factors. If the total is exactly one, the scores can tie, so the implementation’s longer-edge preference matters."}
                </p>
                  <p>
                    So for any k of two or more the entry wins, and at k equal to one the question does not arise, because a character the list holds gets no fallback candidate.
                  </p>
</>
                </WhyThisWorks>
                <p>
                  {"A listed word beats or ties the all-unknown-character path over its span. Other listed component words can still outscore it, as the earlier compound example showed. The five surname fallbacks contribute −17.4826 here, but they retain the characters and can later be grouped by an unknown-word model."}
                </p>
                <KeepInMind>
                  {"Fallback edges guarantee graph coverage and carry a specified penalty. They do not prove how many linguistic words the dictionary missed. A path using listed components can still omit an intended larger word."}
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
                  {"The full example scores −21.9806. The surname contributes −17.4826 and the remaining six characters keep their previous contribution of −4.4981. The gap stays 1.2040 because these compared paths share the same surname prefix. The four-word reference becomes eight pieces under both greedy and lattice methods. Equal piece counts do not imply equal computation cost."}
                </p>
                <InAModel>
                  <p>
                  {"The SDK can optionally pass consecutive unlisted singleton pieces from the chosen path to a fitted unknown-word segmenter. That stage may join them using character evidence, as the next lesson explains. It does not automatically detect an intended word that was split entirely into other listed entries."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"Unlisted names or new terms can produce these fallback runs. Their source characters and entry membership identify where this dictionary lacked a direct match. Other missing words may be hidden by valid smaller entries, so the signal is useful but incomplete."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Tied Paths and Words Missing From the Dictionary" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="19. Two readings can score exactly the same">
                <p>
                  {"Several paths can attain the same maximum score. The numeric objective then leaves a tie, but this SDK still chooses deterministically by preferring the longer candidate at the tied boundary. Record that policy alongside the score."}
                </p>
                <PathLadder scenarioKeys={["table"]} />
                <>
<p>
                  {"The two four-piece paths through the seventeen-character English input each score −26.7881 under the equal weights. One matches our reference segmentation and the other does not. Their shared score means this objective cannot distinguish them; the implementation’s longer-edge tie rule determines the returned path."}
                </p>
                <p>
                  {"This SDK prefers the longer candidate when the complete suffix scores tie. In the English example, that selects theta and returns the nonreference path. The backward greedy scan had returned the reference reading. The tie policy is deterministic, not a linguistic correctness test."}
                </p>
</>
                <p>
                  {"When every edge has the same weight, paths with equal piece counts have equal totals. Different frequencies can separate some of those ties, but products can still agree. A score gap and the tie policy describe different aspects of the result."}
                </p>
                <KeepInMind>
                  {"A zero gap means the scoring objective does not prefer one top path over the other. The tie rule still returns a definite answer. A positive gap describes separation under these weights; it is not automatically calibrated confidence in the chosen words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The counts are an opinion about one body of text">
                <p>
                  {"The reported ratio is a property of the supplied count table and score. If the counts come from a corpus, record which text and segmentation convention produced them. The reference tables here are illustrative, so their ratios are not empirical measurements of genre-wide language use."}
                </p>
                <p>
                  {"The two count tables over five words give opposite winners with nonzero margins. That demonstrates sensitivity to the weights. It does not show that one reading is correct in news and the other in university administration, because no such genre experiment was performed."}
                </p>
                <p>
                  {"Counts can be estimated from a segmented corpus, in which case its annotation convention affects the model. They can also be assigned for a demonstration, as here, or learned jointly with segmentation under another procedure. State that provenance instead of assuming every table ultimately came from a hand-segmented corpus."}
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
                  {"The bare lattice contains listed word edges and permitted single-character fallbacks. It cannot produce an absent multi-character word as one edge simply by improving the existing counts. Adding an entry or applying the optional unknown segmenter changes that candidate coverage."}
                </p>
                <>
<p>
                  The listed word probabilities already sum to one because each is its count divided by the count total. The fallback then assigns additional mass to unlisted characters without renormalizing that distribution. We can use the resulting values as path scores, but should not describe the full extended scoring rule as a normalized word probability model.
                </p>
                <p>
                  {"The extended edge weights are not a normalized distribution over all listed and fallback words. Their products still define a reproducible ranking of the allowed paths. A standalone path score is not a calibrated probability of a correct segmentation."}
                </p>
</>
                <>
<p>
                  {"Exponentiating a log-score difference gives the ratio of the two path weights. Common edge contributions cancel only where both paths actually share them. No claim that all fallback mass cancels is needed, and different normalizations can affect paths of different lengths."}
                </p>
                <p>

                  A normalized probability model over possible words needs a stated treatment of words outside its recorded list. Reserving probability mass for those possibilities changes the model being fitted. It is a separate modeling decision from finding the highest-scoring path in the fixed lattice already supplied.
                </p>
</>
                <KeepInMind>
                  {"Inspect candidate coverage, score construction and tie handling separately. Entry membership does not certify the reference segmentation, and a large score gap does not certify a confidence level. Both remain useful descriptions of what this particular search selected."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What the path score leaves undecided" id="22-where-the-method-has-nothing-to-say">
                <p>A best-scoring path can still be tied with another path, and a missing dictionary entry can change every available reading. Before trusting the selected words, check what the search was allowed to consider and how it settled a tie.</p>
                <DerivationTable
                  expressionHeading="Dictionary, counts or competing path"
                  reasonHeading="Effect on the selected reading"
                  rows={[
                    {
                      expression: "two readings with the same score",
                      reason:
                        "The maximum score can be shared by several paths. This SDK then prefers the longer candidate at the tied boundary. The two shown English paths score −26.7881, and that deterministic preference returns the nonreference segmentation.",
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
                        "Adding frequency to a word absent from the sentence changes the shared denominator. The supplied total of 32 favors splitting; adding two occurrences gives 34 and favors the compound. The displayed 33.3333 threshold is rounded; the exact value is 100/3. Scaling all six counts by a hundred leaves their shares unchanged.",
                    },
                    {
                      expression: "a character no entry covers",
                      reason:
                        "a convention rather than an estimate, scored as though the character had been counted once. It has to be something for a path to exist at all, and what it is set to decides whether an unfamiliar stretch is guessed at or given up on. At a total of 33 it is −3.4965, worse than the rarest real entry at −2.1102.",
                    },
                    {
                      expression: "a word the list does not hold",
                      reason:
                        "An absent multi-character entry cannot become one edge by changing counts alone. The five surname characters remain in the output as fallbacks and contribute −17.4826 here. Adding the word or using the optional unknown segmenter can change the available units.",
                    },
                    {
                      expression: "whether a word depends on the word before it",
                      reason:
                        "This edge score ignores the preceding word. A contextual model needs additional state so suffix scores account for that history. A dense table over every possible previous word can be larger by vocabulary size; sparse representations may use fewer states.",
                    },
                    {
                      expression: "what a score means on its own",
                      reason:
                        "It is the sum of the chosen edge log weights under the stated model. Listed word shares sum to one, while fallback weights add unnormalized mass. The score is usable for ranking, but it is not by itself a calibrated probability that the segmentation is correct.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "Evaluate the output against a stated word convention and representative annotations. Different corpora may choose different conventions, which must be recorded. Those choices do not prevent a meaningful accuracy measurement; the small examples here do not provide one.",
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
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "A character no entry covers has to be scored somehow. What score does it get?",
              [
                "The score of a word counted exactly once, which against a list counted 33 times is −3.4965",
                "Zero, since nothing whatever is known about it",
                "The score of the rarest entry in the list, −2.1102",
                "The score of the commonest entry in the list, −1.1939",
              ],
              0,
              "It is the smallest score a real entry could have had, and it is a convention rather than a measurement. Setting it lower makes a stretch of unknown characters so expensive that the path contorts to avoid it, and setting it higher lets single characters start winning against real words.",
            ),
            trueFalse(
              "Some arrangement of the counts would let a stretch of unknown characters outscore a single entry covering the same stretch.",
              false,
              "A listed entry has count at least one, while each unlisted-character fallback uses count one over the same total. A sequence of two or more such fallback factors cannot strictly exceed the listed entry covering that span. If the total is one they can tie, rather than the entry winning strictly. This is a consequence of the scoring convention, not evidence that an unknown word is linguistically worse.",
            ),
            trueFalse(
              "When two readings have equal total scores, those scores alone do not prefer one reading over the other.",
              true,
              "A fixed tie rule makes the returned path reproducible, but equal scores provide no model-based preference between those paths. Reporting the score gap exposes that ambiguity. A positive gap describes preference under this scoring model; it is not automatically a calibrated probability that the segmentation is correct.",
            ),
            choice(
              "Why should these raw path weights not be reported as normalized confidence values?",
              [
                "The entries’ shares already add to one, and each uncovered single character is handed a further share on top of that",
                "The logarithm destroys the normalization",
                "The counts came from a corpus rather than from the language itself",
                "A product of many shares falls below the smallest number a computer holds",
              ],
              0,
              "The listed-word frequency shares sum to one, and the fallback policy adds further character weights without renormalizing that vocabulary. A raw path log score is therefore a ranking weight under this convention, not a calibrated segmentation probability. Exponentiating a score difference gives the ratio of two path weights. One could normalize over candidate paths, but that would still be a model-defined distribution requiring evaluation.",
            ),
            several(
              "Which of these are decisions rather than limits of the method?",
              [
                "How a tie is settled",
                "What an uncovered character is worth",
                "What text the counts were taken from",
                "That a reading using a word the list lacks was never a candidate",
              ],
              [0, 1, 2],
              "Each of the three has a defensible answer on more than one side and each changes the cut, so each belongs in whatever describes a segmenter. The fourth is the ceiling rather than a choice, since however good the scoring becomes the word list is the boundary of what can be said. The fourth decision the page names is which words the list carries besides the ones a sentence uses.",
            ),
        ],
        },
        {
          title: "Practice. Scoring Whole Readings With the Library",
          practice: [
            exercise(
              "Score both readings under both sets of counts",
              [
  "Build both supplied word-count dictionaries and segment 研究生命起源 with each lattice model.",
  "Print the dictionary total, selected reading and total log score. Also score both supplied candidate readings directly from their word-frequency shares, printing each to four decimal places.",
  "Compare a model-selected score with your direct calculation under the same dictionary. The available candidate words stay fixed while their counts change."
],
              `import math
from oop_ml import DictionaryEntry, DictionaryLatticeSegmenter, WordDictionary

sentence = "研究生命起源"
tables = {
    "research favoured": {"研究": 10, "生命": 8, "起源": 5, "研究生": 6, "命": 4},
    "student favoured": {"研究": 10, "生命": 8, "起源": 5, "研究生": 20, "命": 12},
}
readings = {"research": ("研究", "生命", "起源"), "student": ("研究生", "命", "起源")}

for label, counts in tables.items():
    dictionary = WordDictionary([DictionaryEntry(word, count) for word, count in counts.items()])
    # Ask a lattice segmenter over this dictionary for the best path of the sentence,
    # print its words and total, then print each reading's score from the definition.
    pass`,
              `import math
from oop_ml import DictionaryEntry, DictionaryLatticeSegmenter, WordDictionary

sentence = "研究生命起源"
tables = {
    "research favoured": {"研究": 10, "生命": 8, "起源": 5, "研究生": 6, "命": 4},
    "student favoured": {"研究": 10, "生命": 8, "起源": 5, "研究生": 20, "命": 12},
}
readings = {"research": ("研究", "生命", "起源"), "student": ("研究生", "命", "起源")}

for label, counts in tables.items():
    dictionary = WordDictionary([DictionaryEntry(word, count) for word, count in counts.items()])
    path = DictionaryLatticeSegmenter(dictionary=dictionary).best_path(sentence)
    print(f"{label}, total {dictionary.total_frequency}: {' | '.join(path.words)} scores {path.total_log_score:.4f}")
    for name, words in readings.items():
        total = dictionary.total_frequency
        score = sum(math.log(dictionary.frequency_of(word) / total) for word in words)
        print(f"  {name} reading from the definition {score:.4f}")`,
              `research favoured, total 33: 研究 | 生命 | 起源 scores -4.4981
  research reading from the definition -4.4981
  student reading from the definition -5.7020
student favoured, total 55: 研究生 | 命 | 起源 scores -4.9319
  research reading from the definition -6.0305
  student reading from the definition -4.9319`,
              {
question: "Can changing word counts reverse the best complete segmentation?",
 hints: [
  "Construct WordDictionary from DictionaryEntry(word, count), rather than from_words, which would discard the counts.",
  "best_path exposes words and total_log_score.",
  "Use frequency_of and total_frequency to compute each word’s share, take its logarithm and sum over a reading."
], check: numberCheck("What does the best path score under the counts that favor the graduate student?", -4.9319, 0.0005, "The best path under the student-favoring counts scores about -4.9319. The changed frequencies reverse the ranking while leaving the available spellings unchanged.") },
            ),
            exercise(
              "Lay out the lattice and read every candidate",
              [
  "Build the research-favoring dictionary from the supplied counts and ask its segmenter for the lattice of 研究生命起源.",
  "Print the candidate-edge count and character count, then every candidate’s word, half-open span, log score and entry/fallback label. Finish with the lattice’s own best path and score.",
  "An edge represents one possible piece over a source span. Single-character fallback edges keep otherwise uncovered positions traversable; they do not claim that each character is a meaningful word."
],
              `from oop_ml import DictionaryEntry, DictionaryLatticeSegmenter, WordDictionary

sentence = "研究生命起源"
counts = {"研究": 10, "生命": 8, "起源": 5, "研究生": 6, "命": 4}
dictionary = WordDictionary([DictionaryEntry(word, count) for word, count in counts.items()])

# Build the lattice of the sentence, print how many candidates it holds, then print
# each candidate's word, span and log score, marking whether the list holds it, and
# finally the words and total of the lattice's own best path.`,
              `from oop_ml import DictionaryEntry, DictionaryLatticeSegmenter, WordDictionary

sentence = "研究生命起源"
counts = {"研究": 10, "生命": 8, "起源": 5, "研究生": 6, "命": 4}
dictionary = WordDictionary([DictionaryEntry(word, count) for word, count in counts.items()])

lattice = DictionaryLatticeSegmenter(dictionary=dictionary).lattice_of(sentence)
print(f"{lattice.n_edges} candidates over {lattice.n_positions} characters")
for edge in lattice:
    kind = "entry" if edge.word in dictionary else "fallback"
    print(f"  {edge.word} [{edge.start}, {edge.end}) scores {edge.log_score:.4f} ({kind})")

best = lattice.best_path()
print(f"best path {' | '.join(best.words)} scores {best.total_log_score:.4f}")`,
              `10 candidates over 6 characters
  研 [0, 1) scores -3.4965 (fallback)
  研究 [0, 2) scores -1.1939 (entry)
  研究生 [0, 3) scores -1.7047 (entry)
  究 [1, 2) scores -3.4965 (fallback)
  生 [2, 3) scores -3.4965 (fallback)
  生命 [2, 4) scores -1.4171 (entry)
  命 [3, 4) scores -2.1102 (entry)
  起 [4, 5) scores -3.4965 (fallback)
  起源 [4, 6) scores -1.8871 (entry)
  源 [5, 6) scores -3.4965 (fallback)
best path 研究 | 生命 | 起源 scores -4.4981`,
              {
question: "Which candidate edges does the lattice actually search?",
 hints: [
  "lattice_of(text) returns n_edges, n_positions and iterable LatticeEdge records.",
  "Each edge exposes word, start, end and log_score. Membership in the dictionary distinguishes listed entries from fallback characters.",
  "Call lattice.best_path() after inspecting the edges to compare the complete selected route."
], check: numberCheck("How many candidates does the lattice hold for the six characters?", 10, 0.5, "The lattice has ten candidate edges: dictionary entries fitting the text and single-character fallbacks. Its edge count is not a count of complete segmentations, since a complete path combines compatible edges.") },
            ),
            exercise(
              "Repair the greedy scan on five English words",
              [
  "Build the supplied five-entry dictionary with equal counts and segment thewaterunderthetable with both forward maximum matching and the dictionary lattice.",
  "Print both cuts and piece counts. Score the greedy cut using the same per-piece frequency rule, and print the lattice path’s score, their score gap and corresponding likelihood ratio.",
  "The dictionary includes theta as well as the words needed for the intended sentence. That longer local match can leave less useful pieces afterward."
],
              `import math
from oop_ml import DictionaryLatticeSegmenter, MaximumMatchingSegmenter, WordDictionary

text = "thewaterunderthetable"
dictionary = WordDictionary.from_words(["the", "water", "under", "table", "theta"])
one_word = math.log(1 / dictionary.total_frequency)

# Split the text with the greedy scan from the left and print its pieces, their count
# and the reading's score from the definition. Then find the lattice's best path and
# print its words, its count and its total, and the gap between the two scores.`,
              `import math
from oop_ml import DictionaryLatticeSegmenter, MaximumMatchingSegmenter, WordDictionary

text = "thewaterunderthetable"
dictionary = WordDictionary.from_words(["the", "water", "under", "table", "theta"])
one_word = math.log(1 / dictionary.total_frequency)

greedy = MaximumMatchingSegmenter(dictionary=dictionary).split(text)
print(f"greedy: {' | '.join(greedy.texts)} in {greedy.n_words} pieces")
print(f"  scored from the definition {greedy.n_words * one_word:.4f}")

path = DictionaryLatticeSegmenter(dictionary=dictionary).best_path(text)
print(f"best path: {' | '.join(path.words)} in {path.n_edges} words")
print(f"  scores {path.total_log_score:.4f}")

gap = path.total_log_score - greedy.n_words * one_word
print(f"gap {gap:.4f}, two words at {one_word:.4f} each, so one part in {math.exp(gap):.0f}")`,
              `greedy: the | water | under | theta | b | l | e in 7 pieces
  scored from the definition -11.2661
best path: the | water | under | the | table in 5 words
  scores -8.0472
gap 3.2189, two words at -1.6094 each, so one part in 25`,
              {
question: "Can considering a complete path avoid a locally tempting word?",
 hints: [
  "Use MaximumMatchingSegmenter for the greedy result and DictionaryLatticeSegmenter.best_path for the complete-path result.",
  "All listed entries and single-character fallbacks have the same score with this equal-count dictionary.",
  "Compare complete scores under the same five-entry dictionary. Scores from the lesson’s larger dictionary are a separate experiment."
], check: numberCheck("What does the lattice’s best path score on the five-word list?", -8.0472, 0.0005, "The lattice path scores about -8.0472 and uses five words. Its complete score beats the longer greedy result, which takes theta and leaves trailing single characters.") },
            ),
            exercise(
              "Count a word the sentence never uses",
              [
  "Build the supplied research-sentence dictionary, then add 很 with counts zero, one, two and three in separate fits. The added word does not occur in the text being segmented.",
  "For each dictionary print the added count, total frequency, best reading and log score. As a separate control, multiply all original counts by one hundred and print that result.",
  "The added word changes the total used to normalize every word frequency without adding a candidate in this sentence. The control changes numerator and denominator together."
],
              `from oop_ml import DictionaryEntry, DictionaryLatticeSegmenter, WordDictionary

sentence = "研究生命起源"
counts = {"研究": 6, "研究生": 1, "生命": 3, "生": 10, "命": 10, "起源": 2}

for added in (0, 1, 2, 3):
    table = dict(counts)
    if added:
        table["很"] = added
    # Build the dictionary from the table, find the best path of the sentence, and
    # print the count added, the total, the words and the score.
    pass

# Then build a dictionary with every count multiplied by 100 and print its best path
# and score the same way.`,
              `from oop_ml import DictionaryEntry, DictionaryLatticeSegmenter, WordDictionary

sentence = "研究生命起源"
counts = {"研究": 6, "研究生": 1, "生命": 3, "生": 10, "命": 10, "起源": 2}

for added in (0, 1, 2, 3):
    table = dict(counts)
    if added:
        table["很"] = added
    dictionary = WordDictionary([DictionaryEntry(word, count) for word, count in table.items()])
    path = DictionaryLatticeSegmenter(dictionary=dictionary).best_path(sentence)
    print(f"很 counted {added}, total {dictionary.total_frequency}: {' | '.join(path.words)} scores {path.total_log_score:.4f}")

scaled = WordDictionary([DictionaryEntry(word, count * 100) for word, count in counts.items()])
path = DictionaryLatticeSegmenter(dictionary=scaled).best_path(sentence)
print(f"every count times 100, total {scaled.total_frequency}: {' | '.join(path.words)} scores {path.total_log_score:.4f}")`,
              `很 counted 0, total 32: 研究 | 生 | 命 | 起源 scores -6.7729
很 counted 1, total 33: 研究 | 生 | 命 | 起源 scores -6.8960
很 counted 2, total 34: 研究 | 生命 | 起源 scores -6.9956
很 counted 3, total 35: 研究 | 生命 | 起源 scores -7.0825
every count times 100, total 3200: 研究 | 生 | 命 | 起源 scores -6.7729`,
              {
question: "Can an unrelated dictionary count change a segmentation?",
 hints: [
  "Construct a new WordDictionary for each count setting.",
  "Keep the input sentence fixed and inspect both path and score.",
  "For the control multiply every original count, rather than only counts of words used by the winning path."
], check: numberCheck("What does the best path score once 很 is counted twice, at a total of 34?", -6.9956, 0.0005, "At total frequency thirty-four the best score is about -6.9956 and the compound reading wins. Its changed ranking comes from normalization, while uniformly scaling all counts leaves frequency shares unchanged.") },
            ),
          ],
        },
      ]}
    />
  );
}
