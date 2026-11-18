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
import { CountCutLadder } from "@/components/widgets/CountCutLadder";
import { DescriptionCostBars } from "@/components/widgets/DescriptionCostBars";
import { HeldOutReadings } from "@/components/widgets/HeldOutReadings";
import { MorfessorPlayground } from "@/components/widgets/MorfessorPlayground";
import { SearchEpochs } from "@/components/widgets/SearchEpochs";
import { UphillSplits } from "@/components/widgets/UphillSplits";
import { WeightDial } from "@/components/widgets/WeightDial";

export const metadata: Metadata = pageMetadata("/concepts/morfessor", {
  title: "Morfessor · Perceptron Lab",
  description:
    "Related words often reuse stems and endings. Morfessor searches for such reusable parts by balancing the cost of a stored vocabulary against the cost of describing the words with it.",
});

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function MorfessorPage() {
  return (
    <ConceptPage
      lessonId="morfessor"
      intuition={lessonIntuitions["morfessor"]}
      technicalStart="Part 2. The Shortest Description"
      openingTitle="Where Would the Language Put the Cut?"
      playgroundTitle="When is a word part worth storing?"
      playgroundIntro="Compare the inventory cost and corpus cost for alternative cuts. Check which familiar word parts emerge and which cuts follow frequency instead."
      title="Morfessor"
      tagline={"Related words often reuse stems and endings. Morfessor searches for such reusable parts by balancing the cost of a stored vocabulary against the cost of describing the words with it."}
      prerequisites={
        <>

          We will work inside words that have already been separated at spaces. Earlier methods selected pieces using corpus counts. Here we will ask a more specific question: can a compact description of the corpus favor recurring stems and endings? The first example compares learned pieces with familiar word forms. We will introduce the logarithms and the binomial coefficient when we need them for the description cost.
        </>
      }

      playground={<MorfessorPlayground />}
      sections={[
        {
          title: "Part 1. Where a Count Puts Its Cuts",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Familiar Stems and Endings" id="1-twelve-words-whose-joints-nobody-disputes">
                <p>

                  We can recognize walk inside walking before calculating any score. Will a method that rewards a short description of the training data choose that same split? Those are different questions, and a small corpus lets us compare their answers.
                </p>
                <p>
                  Use walk, talk and play, each in its bare form and with s, ed and ing endings. That gives twelve words, each occurring three times. The familiar forms supply a linguistic reference; the compression calculation must still earn its own choices.
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
                  The first selected pieces are al, alk, la and pla. They divide familiar stems internally. For example, a and l are adjacent in walk, talk and all their forms, which covers eight of the twelve words. A frequency-based rule has a good reason to select that pair, even though its objective does not require it to respect a stem boundary.
                </p>
                <p>
                  {"The merge rule selects a with l, then al with k; the play forms later contribute la. These choices reduce the number of references under the pair-count objective. They do not directly reward a linguistic boundary such as the one between walk and ing."}
                </p>
</>
                <KeepInMind>
                  {"The three complete stems appear as the eighth, ninth and tenth new merge entries. Earlier entries include fragments inside those stems. Stopping sooner can therefore leave a familiar stem split across several tokens."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The same cut on ordinary English">
                <p>

                  That could be an artifact of twelve made-up words, so here is
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
                  {"The merge-grown table splits lowest as lowe and st, one letter after the familiar low–est boundary. It splits costs as co and sts, two letters before the cost–s boundary. These pieces are frequent substrings in this corpus, but the cuts differ from that linguistic analysis. In the running sentence, the same vocabulary divides analysis before its final s and splits the beginning of low-cost as lo followed by w."}
                </p>
                <KeepInMind>
                  {"A frequent substring is not necessarily a linguistic morpheme. We want to compare a different objective using the same unlabeled words, rather than assuming that frequency alone must recover the familiar boundaries."}
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What is missing is a reason to prefer a joint">
                <>
<p>
                  {"Pair counting selects the largest weighted adjacent-pair count as a proxy for immediate compression. That can leave stems divided. A fixed vocabulary-entry budget does not separately price how the chosen piece strings are spelled."}
                </p>
                <p>
                  {"Each new merge uses one vocabulary entry regardless of the resulting string’s length. Under that budget, a merge crossing a morphological boundary can be just as useful as one preserving it if it removes as many references."}
                </p>
</>
                <>
<p>
                  {"Suppose we also charge for recording the pieces themselves. Reusing walk across several word types can then avoid spelling it repeatedly in the inventory. A candidate such as w plus alk has a different inventory and reference-frequency cost. We must price the complete alternatives to see which one wins."}
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
                  {"Sending an inventory has a cost, and so does encoding references to it. Repeated use can repay the inventory cost; a rarely used entry may not. Creutz and Lagus used this tradeoff to define the segmentation objective: prefer the inventory and corpus encoding with the lowest combined description cost."}
                </p>
                <KeepInMind>
                  {"At corpus weight one, the inventory and corpus terms are added under the coding scheme defined below. The SDK also permits a multiplier on the corpus term. That changes the objective, so we will state the weight when comparing costs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Three amounts, added">
                <>
<p>
                  Before writing the cost formula, let&apos;s describe what the encoded message must contain. It first spells each vocabulary piece, including a marker for the end of its spelling. It also records how often each piece is used, so a decoder can interpret the references that follow.
                </p>
                <p>
                  {"The final term encodes the corpus as references to those pieces. Under the frequency model used here, a frequent piece has a lower cost per reference than a rare one."}
                </p>
</>
                <Equation>{`description  =  spelling the list  +  writing the counts  +  writing the text`}</Equation>
                <p>
                  {"The first two terms describe the inventory, and the third describes its uses in the corpus. Smaller pieces usually require more references, but their encoded cost also depends on the piece frequencies. We need to recalculate all three terms to decide whether a proposed split shortens the complete description. Section 8 compares that balance for the twelve forms."}
                </p>
                <KeepInMind>
                  All the logarithms here are natural, so the amounts are in
                  nats. A nat is about 1.4427 bits, and the unit cancels out of
                  every comparison on this page, so nothing turns on it.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Two words, small enough to check by hand">
                <p>
                  {"Start with the two-word corpus walk and walks, once each. Leaving the words whole uses two inventory entries and two references. Splitting walks gives the entries walk and s, with three references because walk is reused."}
                </p>
                <WorkedExample title="walk and walks, both ways">
                  <p>
                  {"For whole words, the inventory contains nine letters and two end markers. The count term is zero because the two pieces must each occur once. The remaining terms give the total below."}
                </p>
                <Equation>{"Inventory symbols = 9 + 2 = 11\nSpelling cost ≈ 19.4454\nCount cost = ln C(1, 1) = 0\nCorpus cost ≈ 1.3863\nTotal ≈ 19.4454 + 0 + 1.3863 = 20.8317"}</Equation>
                  <p>
                  {"For the split inventory, walk and s contain five letters and two end markers. There are now two possible positive count assignments across the two entries. Compare its complete cost with the whole-word version."}
                </p>
                <Equation>{"Inventory symbols = 5 + 2 = 7\nSpelling cost ≈ 12.2351\nCount cost = ln C(2, 1) = ln 2 ≈ 0.6931\nCorpus cost ≈ 1.9095\nTotal ≈ 12.2351 + 0.6931 + 1.9095 ≈ 14.8378\nSaving ≈ 20.8317 - 14.8378 = 5.9939"}</Equation>
                </WorkedExample>
                <p>
                  {"The split increases the encoded corpus and count costs, but reduces inventory spelling enough to lower the complete total. The reused spelling, rather than a reduction in the number of references, supplies the saving in this example."}
                </p>
                <KeepInMind>
                  {"Splitting one occurrence into two pieces adds a reference. It also changes the piece frequencies used to price all references, so the encoded corpus cost can rise or fall. In the walk-and-walks example the corpus cost rises, while the saving in lexicon spelling makes the complete split description cheaper."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why the middle is a minimum">
                <>
<p>
                  {"For the twelve-word corpus, first give every word its own entry. That uses 36 references for 36 occurrences and an inventory spelling of 78 symbols. We will compare it with character pieces and with the familiar stems and endings."}
                </p>
                <p>
                  {"Using individual characters gives 13 inventory entries and 198 corpus references. Each entry is short to spell, but there are many more references to encode. The complete costs, not either count alone, determine the comparison."}
                </p>
</>
                <DescriptionCostBars />
                <p>
                  {"Across the candidates shown, lexicon spelling cost falls from 191.7754 to 51.3662, while corpus cost rises from 89.4566 to 474.8646. The stem-and-ending candidate has the lowest measured total: 185.4634, compared with 301.0812 for whole words and 569.3002 for characters. Opposing trends alone do not prove that a sum has an interior minimum; these actual totals establish the comparison."}
                </p>
                <WhyThisWorks title="Why the character extreme is so much dearer">
                  <>
<p>
                  {"The character inventory has lower spelling cost, 51.3662 rather than 191.7754, but a much larger corpus term. Its 198 references have different empirical frequencies, producing corpus cost 474.8646. Reference count and the distribution of those references both contribute."}
                </p>
                  <p>
                  {"The count-description term is also larger for the character candidate: 43.0695 rather than 19.8491. Together these terms outweigh the reduced spelling cost. The table below preserves all three candidates’ complete totals."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"The stem-and-ending inventory is the cheapest of these tested candidates. That result does not prove it is the globally shortest description, and a low description cost does not establish that the pieces are linguistic morphemes. Part 7 compares the statistical objective with that linguistic interpretation."}
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
                  {"The spelling term uses an idealized frequency code. Symbols frequent in the inventory receive shorter ideal code lengths than rare symbols. Summing those lengths gives the expression below, where L is the total symbol count and n is each symbol’s count. This entropy-based cost is not a claim that a finite binary code reaches every fractional length exactly or that all model-description overhead is included."}
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
                  {"The decoder also needs the piece frequencies used by the reference model. In this scheme, N references are allocated among M labeled entries, each with a positive count. The binomial coefficient below counts those positive count assignments; its logarithm is the ideal cost of identifying one under this choice of code."}
                </p>
                <Equation>{"counts  =  log C(N − 1, M − 1)"}</Equation>
                <p>
                  {"For the stem-and-ending candidate, this term contributes 15.6828 of the total 185.4634. It describes the frequency table separately from spelling the pieces and encoding their uses. Its binomial formula is a modeling choice; it does not simply increase whenever more entries are added."}
                </p>
                <WorkedExample title="The two-word example, both ways">
                  <p>
                  {"With walk and walks left whole, each of the two entries must be used once. After splitting, the three references can be allocated as two and one or one and two. These count assignments give the costs below."}
                </p>
                <Equation>{"Whole: ln C(2 - 1, 2 - 1) = ln 1 = 0\nSplit: ln C(3 - 1, 2 - 1) = ln 2 ≈ 0.6931"}</Equation>
                </WorkedExample>
                <KeepInMind>
                  {"This inventory retains only pieces with positive usage counts. That is why its count code considers nonempty groups. An implementation that also stored unused entries would need to specify a different count model."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Writing the corpus as a run of references">
                <p>
                  {"The corpus term uses a unigram model: each reference has probability equal to its piece count divided by the total number of references. It ignores preceding pieces. Summing the negative log probabilities gives the expression below."}
                </p>
                <Equation>{"text  =  N log N  −  Σ over pieces  c log c"}</Equation>
                <>
<p>
                  {"A piece used twelve times among 63 references has lower reference cost than a piece used only once. The calculation treats each occurrence independently of the preceding piece. It therefore ignores language patterns such as which endings tend to follow which stems."}
                </p>
                <Equation>{"Frequent piece: -ln(12 / 63) ≈ 1.6582 nats\nOnce-used piece: -ln(1 / 63) ≈ 4.1431 nats"}</Equation>
                <p>
                  {"A context-dependent model could capture some of those patterns, but would add parameters and change the segmentation search. The baseline implementation here keeps the unigram assumption. Other morphology models need not make the same choice."}
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
                  {"The stem-and-ending candidate has a higher corpus term but a sufficiently lower inventory term to win this comparison. That explains its lower total on these twelve forms; it does not prove that every corpus favors linguistic boundaries."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the criterion does and does not fix">
                <p>
                  We now have a total description cost for a proposed set of pieces and its encoding of the corpus. That lets us compare proposals with different vocabulary sizes using the same objective. A smaller cost means a shorter description under this coding scheme. It does not directly establish a better linguistic analysis.
                </p>
                <p>
                  {"The objective does not specify how to find its best segmentation. These twelve words have 54 possible internal boundary positions, giving two-to-the-fifty-fourth boundary assignments. Exhaustive search is possible in principle but expensive. The trainer below considers restricted local changes instead."}
                </p>
                <KeepInMind>
                  {"Minimum description length supplies an objective under a chosen coding scheme. The search supplies a candidate, which may fail to minimize it. Part 5 shows a cheaper segmentation than the trainer returns."}
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
              "BPE chooses the pair that makes the most current joins. That score does not identify a stem boundary, so intermediate entries can be al, alk, la and pla. The complete stems appear only as the eighth, ninth and tenth learned entries in this run. A count-based merge and a grammatical analysis optimize different things.",
            ),
            trueFalse(
              "Splitting one occurrence of a word into two pieces increases the number of piece references used for that occurrence.",
              true,
              "One reference becomes two for that occurrence, so the reference count increases. The encoded corpus cost also depends on the fitted piece frequencies and must be recalculated; it is not guaranteed to increase in every corpus. In the walk-and-walks example, the corpus term rises by 0.5232 nats and the count term by 0.6931, while the lexicon-spelling term falls by 7.2103. The complete objective decides whether that particular split helps.",
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
              "The inventory stores each distinct piece once, while the corpus records repeated uses. The count term describes how references are allocated across used pieces, which is why the nonempty-count formula uses the corresponding adjusted totals. For the six-piece inventory, that term contributes 15.6828 of the total 185.4634 nats. These costs define the objective; they do not supply a global search over all possible boundary assignments.",
            ),
            choice(
              "For the candidate segmentations priced in this example, how do lexicon spelling cost and corpus cost compare as the pieces become smaller?",
              [
                "Both fall, which is why the smallest pieces give the shortest description",
                "The list rises and the text falls, so the minimum is one piece per word",
                "Lexicon spelling cost falls while corpus cost rises; the tested stem-and-ending inventory has a smaller total than either extreme",
                "Neither moves, since the same characters are being sent either way",
              ],
              2,
              "Among the inventories shown, single characters make the lexicon inexpensive to spell but require many corpus references. Whole words have the opposite balance. The tested stem-and-ending inventory has the lowest combined cost of these candidates. This is an observed comparison, not a theorem that two opposing trends must have their minimum between the endpoints.",
            ),
        ],
        },
        {
          title: "Part 4. The Search",
          content: (
            <>
              <SubSection title="13. Start with every word whole, then reconsider one at a time">
                <p>
                  {"Begin with every distinct word stored whole. Visit words in a seeded shuffled order, reconsider their splits, and repeat passes until the cost changes little or the epoch limit is reached. This is the baseline local search used here."}
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
                  {"The current piece counts and inventory-character counts determine each proposal’s objective value. The search updates those tables while testing a change and restores rejected proposals. These are exact calculations from empirical counts, not a claim that the underlying language probabilities are known without estimation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The recursion on one word">
                <p>
                  For a proposed word, compare the cost of leaving it whole with the costs of splitting it at each internal position. Keep a split only if it is strictly cheaper under the complete description objective. If a split wins, apply the same comparison to each resulting part. This recursive procedure makes the chosen inventory depend on what reuse saves in the corpus, rather than on a supplied list of grammatical endings.
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
                  {"Within one recursive call, the procedure proposes splits rather than joins. At the next visit to a word, however, the outer loop restores that word to its whole form before reconsidering it, so earlier boundaries can disappear between passes. Pieces remain contiguous substrings of training words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Twelve forms, six pieces, two passes">
                <p>
                  {"On the twelve forms at three occurrences each, the cost falls from 301.0812 to 185.4634. The learned inventory is walk, talk and play, each used twelve times, and s, ed and ing, each used nine times. The corpus then uses 63 references rather than 36 whole-word references. Those extra references are offset by the smaller inventory cost."}
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

                  The learned pieces match the familiar stems and endings in this example. The setup is favorable: twelve words deliberately share three stems and three endings. In the next part we change the treatment of those same words to see how dependent the result is on the chosen objective.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A larger corpus, pass by pass">
                <p>
                  On the eighteen sentences, the search can remove pieces as well as add them. With the text-cost weight set to one quarter, it runs for eight passes. The vocabulary shrinks from 67 pieces to 57, while the total cost falls from 1391.8737 to 976.7130. Part 6 explains the weighting choice.
                </p>
                <SearchEpochs />
                <p>

                  The churn is the part worth seeing. The second pass gives up
                  carries, dropped, first and greed in favor of carrie, dropp,
                  fir and gre, which is what cutting one word does to the pieces
                  of another, since taking a word&rsquo;s spelling out of the
                  books changes the price of every spelling that is left. The
                  fourth pass gives up Dr, Every, Monday, Nobody and Tuesday, all
                  of which had survived three passes, because by then the list
                  has enough short pieces to spell them from.
                </p>
                <KeepInMind>
                  {"The stopping rule checks whether a pass changed the total cost by less than the configured relative threshold. A small change does not certify a global minimum or rule out an improvement that requires several boundaries to change together."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Cutting a word the corpus never held">
                <p>
                  {"After fitting, segmentation uses the fixed inventory and its reference costs. Dynamic programming finds a lowest-cost path through the word’s character positions, with permitted unknown-character fallbacks. This is exact for those fixed per-piece costs, rather than a new optimization of the whole training objective."}
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
                  {"An uncovered character can pass through as a single-character fallback with a deliberately high cost. The SDK sets that cost above the maximum total for any all-known segmentation of this word, so a fully known path wins when one exists. Jumping needs four such fallbacks and costs 121.9537; walkings needs none and costs 5.5500. The values include the chosen fallback penalty as well as known-piece costs."}
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
              <SubSection title="18. Repeated Counts Can Stall the Search" id="18-more-of-the-same-data-a-worse-answer">
                <p>
                  {"Repeat each of the same twelve forms five times instead of three. This adds occurrences without adding new word types or boundaries. At that count, the local search leaves all twelve words whole rather than recovering the six stem-and-ending pieces."}
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
                  {"The six-piece candidate costs 104.2861 nats less than the returned twelve-word candidate. The objective therefore prefers that supplied alternative, but the local search does not reach it. We need to examine both the cost of the first move and the restrictions on the moves the search proposes."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Why more of the same turns a saving into a cost">
                <p>
                  {"For the first proposed splits in this example, inventory spelling becomes cheaper while corpus encoding becomes more expensive. Repeating all word types preserves each fixed segmentation’s relative piece frequencies, but multiplies its corpus cost. The count-description term must still be recomputed."}
                </p>
                <>
<p>
                  {"The inventory spelling term depends on which pieces are present, not how often the corpus uses them. Uniformly repeating the corpus therefore leaves that term unchanged. For a fixed segmentation, the unigram corpus term scales with the repetition count, while the separate count-description term changes through its binomial formula."}
                </p>
                <p>
                  {"These terms can change the sign of an individual split’s cost. In this fixture, the first split stops being favorable between four and five occurrences per word. That is a measured crossing for these proposals, not a universal threshold for every corpus."}
                </p>
</>
                <Equation>{"spelling saving   fixed for a given inventory\ncorpus cost       scales with repeated counts\ncount-table cost  recomputed from N and M"}</Equation>
                <p>
                  On these twelve words that crossing point sits between four
                  occurrences each and five. At four, the best available cut is
                  worth 0.3771 nats and the search takes it. At five it costs
                  1.7333 and the search refuses it, correctly, since taking it
                  really would make the description longer.
                </p>
                <KeepInMind>
                  {"The five-occurrence result exposes an interaction between the objective and local search. The first single split increases cost, although several coordinated splits produce a cheaper inventory. Altering the corpus weight changes those barriers; changing the search strategy could address them in another way."}
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
                  {"The most expensive first proposal at three occurrences is walks split as wa and lks, increasing the cost by 14.2842 nats. Neither fragment is reused in the other words, so this proposal does not obtain the shared-spelling benefit of the familiar stem-and-ending split. Its complete cost, including count changes, is higher."}
                </p>
                <KeepInMind>
                  A search that can only take a step which improves the total,
                  starting from a position where no single step improves the
                  total, stops there. Getting from twelve whole words to three
                  stems and three endings needs several cuts made together, and
                  this search never proposes two cuts at once.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Weighting the Corpus Cost" id="21-the-dial-that-lets-it-through">
                <p>
                  {"The SDK exposes a multiplier on the corpus term. Reducing it makes corpus-reference cost less influential relative to inventory cost; increasing it gives corpus-reference cost more influence. This changes which splits are favorable, while leaving the local search procedure itself in place."}
                </p>
                <Equation>{"total  =  list  +  weight × text"}</Equation>
                <WeightDial />
                <p>
                  {"For this five-occurrence fixture, the transition near weight 0.83794 changes the returned result from six pieces to twelve whole words. At weight 0.5 the fit returns the six pieces with weighted objective 169.4115. Other weights or corpora can produce other segmentations; this single transition is not a general two-outcome rule."}
                </p>
                <>
<p>
                  {"The weighted total 169.4115 cannot be compared directly with the unweighted six-piece cost 262.9413. They assign different weight to the corpus term. Report the multiplier so readers know which objective produced a result, and evaluate whether that preference suits the intended segmentation task."}
                </p>
                <p>
                  {"At weight 0.5, the altered objective lets this search reach walk, talk, play, s, ed and ing. It discounts corpus-reference cost relative to inventory cost; it does not show that those references literally require half as much information to encode."}
                </p>
</>
                <KeepInMind>
                  {"Corpus weighting adjusts the preference used to compare proposals. It does not guarantee that the greedy search finds a global minimum, or that its pieces match linguistic morphemes. Both the reached cost and the linguistic result still need checking."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "Repeating each of the same twelve forms five times makes this search retain twelve whole-word pieces instead of six stems and endings. What changes in the cost comparison?",
              [
                "The shuffled visiting order happens to start on a word that cannot be cut",
                "The inventory-spelling term stays fixed for a chosen segmentation, its corpus term scales with repetition, and its separate count-description term is recomputed",
                "The stopping rule fires early because the total is larger to begin with",
                "More occurrences make the counts part dominate, and the counts part has no notion of shared spellings",
              ],
              1,
              "For a fixed segmentation, uniform repetition leaves the inventory-spelling term unchanged and scales the corpus-reference term. The count-description term must also be recalculated. Here the best initial local cut improves cost by 0.3771 nats at four occurrences but worsens it by 1.7333 at five. That can stall the local search even though the supplied six-piece segmentation has lower total cost.",
            ),
            trueFalse(
              "Handed the six-piece list on the five-occurrence corpus, the fit reports it, since its own arithmetic says that list is 104.2861 nats better.",
              false,
              "The six-piece inventory has lower complete cost, but the search starts from whole words and tests local changes. At five repetitions, none of its 54 initial single cuts lowers the objective, so it keeps the twelve whole words. At three repetitions, nine cuts improve it. A better combined segmentation can therefore exist even when this greedy first step cannot reach it.",
            ),
            choice(
              "Multiplying the text half of the cost by a half recovers walk, talk, play, s, ed and ing on the five-occurrence corpus and reports 169.4115. What is that number?",
              [
                "The description length of the six-piece list, directly comparable with the 262.9413 reported earlier",
                "A locally obtained value of a differently weighted objective, so it is not a directly comparable unweighted description length",
                "A lower bound on the description length, since the multiplier can only shrink the total",
                "The description length of the corpus under the twelve whole words at the new weighting",
              ],
              1,
              "The reported 169.4115 is the weighted objective with corpus_weight 0.5, not the unweighted description length. Reducing that multiplier changes the relative cost of corpus references and lexicon storage, and the search then finds the six pieces in this example. This is a deliberate change of objective. It does not establish that the original search found the best solution to the original objective.",
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
              "A word’s current pieces are taken out of the books, the word is put back whole, and the question is asked against the list as it stands at that moment, so an early decision about walked changes what the arithmetic says about walking. That is why the visiting order is a real input, drawn from a seed that is part of the fit. On the eighteen sentences the second pass gives up carries, dropped, first and greed in favor of carrie, dropp, fir and gre, which is what cutting one word does to the pieces of another.",
            ),
        ],
        },
        {
          title: "Part 6. What the Pieces Cost",
          content: (
            <>
              <SubSection title="22. Sequence length against a table of the same size">
                <p>
                  {"The learned six pieces and their word-ending variants produce a 13-row vocabulary including the unknown entry. It encodes this corpus in 63 pieces. The merge-grown vocabulary reaches the same sequence count at 30 rows. These counts describe different vocabulary designs as well as different training objectives."}
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
                  {"The objective minimizes a combined inventory and corpus cost, not sequence length alone. A shorter training sequence is therefore a result to measure, not a tautology. Performance on other text also depends on coverage and decoding behavior."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The list has no alphabet in it">
                <p>
                  The compact description does not necessarily keep a standalone entry for every character. In these eighteen sentences, k is always covered by longer selected pieces and does not survive on its own. Many other letters disappear too at the most compact settings. That creates a problem when a new word needs a character in a combination the selected pieces cannot spell.
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
                  {"At weight one quarter, this fit retains 34 of the 35 characters and reads the held-out sentence in 31 pieces with no stand-ins, allowing exact reconstruction. Its training corpus now uses 338 pieces rather than 167. This setting improves coverage on the measured sentence; it is not a guarantee of complete character coverage on all future text."}
                </p>
                <KeepInMind>
                  {"Check vocabulary coverage on text excluded from fitting. If exact reconstruction is required, reserving character or byte fallbacks can make that a design constraint rather than hoping the segmentation objective retains them. The objective by itself does not enforce such a constraint."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where each method is ahead">
                <p>At 135 vocabulary rows each, neither method has the smaller representation in every comparison on the eighteen sentences. One performs better on some measurements and the other on others. The results need to be read against the particular objective and text being compared.</p>
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
                  {"A larger corpus changes the available word types and counts, but does not guarantee that every character remains a standalone piece or that unseen text is covered. Evaluate the actual fitted vocabulary. Repeating frequent words can also change the local cost barriers described in Part 5; their effect depends on the objective, weight and search."}
                </p>
                  <p>
                  {"These methods are useful for languages with many productive word forms. In an agglutinative language, words can contain several successive grammatical parts, so individual full forms may be rare even when their components recur. Shared pieces can provide evidence that whole-word counts alone miss."}
                </p>
</>
                </InAModel>
                <KeepInMind>
                  {"Both vocabularies were fitted to the same eighteen sentences, but they optimize different criteria. The displayed description-based fit uses 167 training pieces, while the merge-grown fit uses 267. On the held-out sentence, their unknown stand-ins are 18 and one respectively. Those coverage and length results still do not measure the quality of a downstream language model."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Local Search and the Cost Choices Behind the Segmentation" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="25. What the search finds is not what the method is named for">
                <p>
                  {"Minimum description length names the objective. The search returns a segmentation found through restricted local changes, which need not minimize that objective globally. Part 5 supplies a better candidate than the five-occurrence run found, with a measured cost gap of 104.2861 nats."}
                </p>
                <p>
                  {"A finite word list has finitely many boundary assignments, so exhaustive enumeration is possible in principle. It becomes impractical quickly. This greedy search evaluates a restricted set of local changes, and several changes may need to work together before their combined saving becomes visible. A stopping threshold can also end a run with small improvements still possible."}
                </p>
                <p>
                  {"The three stems and three endings improve on the five-occurrence search result. This page has not established whether another segmentation is cheaper still. Exhaustively checking all two-to-the-fifty-fourth boundary assignments would be one way to settle that finite example, but it is not what this trainer does."}
                </p>
                <KeepInMind>
                  {"A fit reports its reached cost and number of passes. In this SDK, converged means the last epoch's cost change fell below the configured relative threshold. It does not certify the global minimum or prove that every remaining local improvement is exactly zero."}
                </KeepInMind>
              </SubSection>

              <SubSection title="26. The cost function is a set of choices about how one would write a list down">
                <>
<p>
                  {"The description cost depends on a coding scheme. Here the inventory uses empirical character frequencies, so equal-length strings can have different spelling costs. That preference concerns their encoded characters; it does not directly identify grammatical meaning or a morpheme boundary."}
                </p>
                <p>
                  {"The count term chooses a code over positive frequency assignments. The corpus term uses independent piece probabilities. These assumptions make the cost manageable, while omitting contextual relationships in language. A different scheme would define a different objective."}
                </p>
</>
                <DerivationTable
                  expressionHeading="the choice"
                  reasonHeading="what turns on it"
                  rows={[{"expression":"characters, under the list’s own frequencies","reason":"Under this character-frequency model, spelling cost depends on both length and symbol counts. A morphological analysis need not share that preference."},{"expression":"one end marker per piece","reason":"This scheme separates inventory spellings with end markers. Other self-delimiting representations, such as explicit lengths, are possible. The chosen markers contribute to the cost."},{"expression":"log C(N − 1, M − 1) for the counts","reason":"one of several defensible codes for a table of counts. A different code changes every total on this page by a different amount, and could move where the crossing point of Part 5 falls."},{"expression":"a text model with no memory","reason":"The unigram model gives ing the same probability after walk as after ing. Context-dependent alternatives can capture more structure, but change the parameters and search work. They are outside this baseline implementation."},{"expression":"a multiplier on the text half","reason":"The multiplier changes the relative contribution of corpus cost. It can change segmentation and local-search barriers. State it as part of the objective rather than interpreting weighted totals as unaltered message lengths."}]}
                />
                <KeepInMind>
                  {"A description length is always relative to a representation and coding scheme. State those choices and any corpus multiplier before interpreting the score. A lower value under one scheme does not establish a shorter real transmission under every other scheme."}
                </KeepInMind>
              </SubSection>

              <SubSection title="27. A cheap piece is not a morpheme">
                <p>
                  {"The learned inventory has no grammatical-position labels. It can therefore use s before play in splay or before talk in stalking, even though s was learned from plural or inflected endings. Those are low-cost readings under this inventory, but they do not match the familiar morphological analyses of the words."}
                </p>
                <p>
                  {"Consider undo, untie, redo and retie, each occurring ten times. Their familiar prefixes and stems define a linguistic comparison. Whole words cost 111.7806 under this scheme, while un, re, do and tie cost 148.5946. The supplied morphological candidate is therefore more expensive, and this fit leaves the words whole."}
                </p>
                <WhyThisWorks title="Why the prefixes lose">
                  <>
<p>
                    Splitting all four words doubles the references, from 40 to 80, and the text cost is exactly doubled with them, from 55.4518 to 110.9035, since both lists hold four pieces used equally often. Spelling the list does get cheaper, from 47.2085 to 26.4129, because un and re and do and tie come to nine characters where the four whole words come to eighteen.
                  </p>
                  <p>
                  In this example, the 20.7956 saving in inventory spelling is outweighed by the 55.4517 extra text cost and 2.1579 extra count cost. The split ends 36.8140 behind overall. Sharing the familiar spellings is therefore insufficient under this objective and corpus; the comparison has to include the longer sequence of references as well as the shorter inventory.
                </p>
</>
                </WhyThisWorks>
                <p>
                  {"The selected pieces aim to reduce description cost under the stated scheme; the local search does not certify a global minimum. Recurring grammatical parts can be useful for compression, but the objective does not require a morpheme analysis. The prefix example shows that a recognizable shared part can still make the complete description more expensive."}
                </p>
                <KeepInMind>
                  {"Reuse across different word types can make a shared stem economical to store. Token repetition, context assumptions and vocabulary coverage can favor different decisions. Treat the output as a statistical segmentation and compare it with linguistic analysis when that is the task."}
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
              "The two fitted inventories perform differently across the measurements. A description-length fit favors its stated combination of inventory and corpus cost; that is not the same objective as minimizing tokens in unseen text. Its unknown-character behavior also needs a separate check. A compact training description does not by itself establish exact reconstruction of the held-out sentence.",
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
              "At weight 0.25, single-character pieces become more affordable under the changed objective, and this fitted inventory reconstructs the held-out sentence exactly. Protecting the complete starting alphabet is another way to specify a coverage requirement. That requirement changes what inventories the trainer may choose; it does not follow automatically from the unconstrained description-length score.",
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
              "For these short repeated words, the shared spelling saves 20.7956 nats, while the extra references make the split inventory more expensive overall: 148.5946 versus 111.7806. A linguistically familiar division can therefore lose under this statistical storage objective. The selected pieces need not coincide with linguistic morphemes.",
            ),
            trueFalse(
              "A converged fit has found the shortest description of its corpus.",
              false,
              "The SDK's converged flag means the last epoch changed the cost by less than the configured relative threshold. It does not certify the globally shortest description, or even prove that every remaining local improvement is exactly zero. The search evaluates restricted local changes and can stop without reaching a better combined segmentation.",
            ),
            trueFalse(
              "On the eighteen sentences the letter k never survives as a piece of its own, because every word that uses it can be spelled from longer pieces.",
              true,
              "The objective can omit a single-character piece when the training words can be represented using longer entries. At the compact setting here, only four of the corpus's 35 characters remain as standalone pieces. The held-out sentence then uses 18 unknown entries among 28 tokens. Protecting alphabet entries would add a coverage constraint, with a corresponding effect on the fitted inventory and its cost.",
            ),
        ],
        },
        {
          title: "Practice. Fitting the Twelve Forms With the Library",
          practice: [
            exercise(
              "Fit the twelve forms and read the six pieces",
              [
  "The starter lists twelve inflected forms, each occurring three times. Fit the description-length learner with random_seed=0 and inspect whether it can reuse their repeated parts.",
  "Print the fitted description length in nats, passes run and convergence flag. Then print each learned piece with its count, the total piece references used to encode the corpus, and walking’s segmentation.",
  "Description length includes both the stored piece inventory and its use in the corpus. A smaller number is preferred under this teaching objective; it is not a judgment of grammatical correctness."
],
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
              {
question: "Which reusable stems and endings does the small corpus support?",
 hints: [
  "Fit the supplied corpus. Read cost, epochs_run and converged from the model.",
  "model.morphs supplies text and count for each piece, and its total counts references including repeated occurrences.",
  "model.segmentations[\"walking\"].morphs retrieves the stored training-word segmentation."
], check: numberCheck("What description length, in nats, does the fit report?", 185.4634, 0.0005, "The fitted cost is 185.4634 nats. The chosen inventory reuses stems and endings on this corpus. A later pass with no improvement establishes the stopping condition for this search.") },
            ),
            exercise(
              "Repeat the corpus and watch the search stall",
              [
  "Keep the twelve forms fixed, but change how often they appear. Fit corpora with three, four and five repeats per form at corpus_weight=1.0. Also fit five repeats at corpus_weight=0.5.",
  "For each setting print the learned-piece count, description length to four decimal places and passes run. Compare which fits retain whole words and which reuse stems and endings.",
  "Changing corpus_weight changes the objective being minimized. It is a separate intervention from changing the corpus counts, so label both settings in the report."
],
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
              {
question: "Can repeating the same forms change a description-length search?",
 hints: [
  "Build a fresh corpus and model for each repeat-count/weight pair.",
  "Read the fitted piece count rather than assuming the same segmentation survives repetition.",
  "A fit that makes no improvement in its first pass can stop with the original whole-word inventory."
], check: numberCheck("What description length, in nats, does the fit at four repeats report?", 224.3765, 0.0005, "At four repeats the fitted cost is 224.3765 nats and the model retains six pieces. The five-repeat search behaves differently, showing how corpus counts and the weighted objective affect this local search.") },
            ),
            exercise(
              "Read words the corpus never held",
              [
  "Fit the twelve-form corpus with three repeats per form. Ask for the cheapest segmentation of walkings, stalking, splay and jumping, which were not supplied as training words.",
  "For each word print the chosen pieces and cost to four decimal places. Price that same piece sequence independently with cost_of_segmentation and print the result beside the search cost.",
  "The teaching model can pass an uncovered character through with a penalty. Its known pieces can also occur in unfamiliar positions, so a cheap segmentation need not be a grammatical analysis."
],
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
              {
question: "How does a learned piece inventory handle an unfamiliar word?",
 hints: [
  "best_segmentation(word) returns morphs and cost for a single word.",
  "Pass that result’s morphs to cost_of_segmentation. It should reproduce the reported search score.",
  "Inspect which pieces are known before interpreting a large cost. An unfamiliar single character uses the fallback penalty."
], check: numberCheck("What segmentation cost does the fitted model report for jumping, in nats?", 121.9537, 0.0005, "Jumping costs 121.9537 nats in this fit. Ing is known, while its other characters use the fallback penalty. By contrast, a low-cost reuse of known pieces does not guarantee a sensible morphological reading.") },
            ),
            exercise(
              "Fit the two-word corpus, and the four prefixed words",
              [
  "Fit two supplied corpora with the same description-length learner: walk and walks once each, then undo, untie, redo and retie ten times each.",
  "For each corpus print the fitted cost to four decimal places and its learned pieces with counts. Compare the two-word fit’s reuse of walk with the prefixed corpus’s decision to keep complete words.",
  "A stem-and-affix interpretation is not built into the cost. Judge the result against the stated storage objective before treating it as an analysis of English."
],
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
              {
question: "When does the objective prefer whole words over familiar-looking parts?",
 hints: [
  "Each corpus is a list containing one string. Fit a fresh model for each.",
  "Inspect the fitted pieces rather than assuming that a linguistically plausible split must reduce the objective."
], check: numberCheck("What description length, in nats, does the two-word fit report?", 14.8378, 0.0005, "The two-word fit costs 14.8378 nats and reuses walk. The prefixed corpus keeps whole words under the same objective, so the two outcomes illustrate what that objective rewards on different counts.") },
            ),
          ],
        },
      ]}
    />
  );
}
