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
import { AMissingWord } from "@/components/widgets/AMissingWord";
import { GreedyWalk } from "@/components/widgets/GreedyWalk";
import { MaximumMatchingPlayground } from "@/components/widgets/MaximumMatchingPlayground";
import { ScanComparison } from "@/components/widgets/ScanComparison";
import { SpacelessSentence } from "@/components/widgets/SpacelessSentence";

export const metadata: Metadata = pageMetadata("/concepts/maximum-matching", {
  title: "Maximum Matching · Perceptron Lab",
  description:
    "A dictionary can suggest word boundaries when spaces are absent. Maximum matching chooses the longest available word at each position, so an early local choice can affect the segmentation that follows.",
});

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function MaximumMatchingPage() {
  return (
    <ConceptPage
      lessonId="maximum-matching"
      intuition={lessonIntuitions["maximum-matching"]}
      technicalStart="Part 2. Take the Longest Entry That Fits"
      openingTitle="Where Do the Words End When There Are No Spaces?"
      playgroundTitle="What does the longest available word leave behind?"
      playgroundIntro="Follow the chosen dictionary entry at each position. Compare forward and backward scans and identify the first choice where their segmentations diverge."
      title="Maximum Matching"
      tagline={"A dictionary can suggest word boundaries when spaces are absent. Maximum matching chooses the longest available word at each position, so an early local choice can affect the segmentation that follows."}
      prerequisites={
        <>
          So far, our examples have offered visible clues such as spaces. Now we will try text where those clues do not identify every word. This first method uses a supplied word list. We need no training procedure yet: we will look for matching entries and see what happens when several entries could fit.
        </>
      }

      playground={<MaximumMatchingPlayground />}
      sections={[
        {
          title: "Part 1. Text With Nothing Between the Words",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Our sentence, with its spaces taken out">
                <p>

                  Let&apos;s remove the spaces from our example sentence. We may still recognize the words because we know English, though some passages can become ambiguous. A space-based program has no such knowledge. We will give it a word list and ask how it could use that list to propose boundaries.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  {"The running sentence has 51 characters, including six spaces. Removing those spaces leaves 45 characters. The earlier rules then return between one and ten pieces, depending on punctuation handling. None recovers all seven intended whitespace-separated units from those remaining runs."}
                </p>
                <SpacelessSentence />
                <p>
                  Removing spaces takes away a major cue used by the earlier rules. Some punctuation is still present: the language-model pattern returns ten pieces because it can split around those characters. But it has no dictionary or learned boundary model with which to recover all the intended words from the remaining letter runs.
                </p>
                <KeepInMind>
                  {"Whitespace splitting uses separators already present in the source. Without them, a word-segmentation task needs additional evidence. A dictionary is one possible source of that evidence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. How many ways forty-five characters can be cut">
                <p>
                  How many possible boundary patterns are there before we consult a dictionary? Each gap between adjacent characters has two choices, cut or continue. There is one fewer gap than characters. These are combinatorial choices; we have not assumed that linguistic boundaries are probabilistically independent.
                </p>
                <Equation>{"readings of n characters  =  2^(n − 1)"}</Equation>
                <p>
                  {"The table below gives the unrestricted boundary-pattern count for the 45-character input. A dictionary can rule out many patterns, but we still need a procedure to choose among the permitted paths."}
                </p>
                <NumberTable
                  headings={["text", "characters", "ways to cut them"]}
                  rows={[
                    ["our sentence, spaces removed", "45", "17,592,186,044,416"],
                    ["we play at the wildlife park", "9", "256"],
                    ["research into the origin of life", "6", "32"],
                  ]}
                  caption="This counts all binary boundary patterns for each of the three texts. Many patterns will not be valid dictionary segmentations, which is why the unrestricted count is much larger than the set we eventually search."
                />
                <p>
                  {"The possible boundary patterns grow quickly with input length. Greedy matching avoids enumerating them: it chooses one local match and continues. That makes a useful simple baseline, while leaving us to test what those early choices prevent later."}
                </p>
                <KeepInMind>
                  {"These methods differ in which candidates they retain, what evidence they use and how they score a complete segmentation. Maximum matching commits locally; later methods can compare alternatives before choosing."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Why the rest of this page is in Chinese">
                <p>
                  {"Removing English spaces gives us a known reference split to compare with the result. Chinese lets us study word segmentation in writing that does not routinely mark those boundaries with spaces. Ambiguity can occur in either case; the source of the missing separator differs."}
                </p>
                <Equation>{"研究生命起源"}</Equation>
                <p>
                  {"The dictionary supports two paths through these six characters: research, life, origin; or graduate student, fate, origin. Their pieces have different meanings. Merely confirming that each piece is a dictionary entry does not decide which whole interpretation fits the intended context."}
                </p>
                <p>
                  {"We will compare that six-character input with a nine-character wildlife-park example. Each has a small supplied dictionary, so every match can be checked. The English running sentence returns later to show what changes when the dictionary lacks names or punctuation."}
                </p>
                <KeepInMind>
                  {"For the wildlife-park input, we use a five-word reference segmentation. The earlier whitespace and letter-run methods can leave the unspaced text whole, while the word-only Unicode rule uses smaller character-based segments. Neither supplies that reference split without additional evidence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="4. A word list, and nothing else">
                <p>
                  {"This method uses a supplied dictionary. At a candidate boundary, it asks whether the substring is an entry. Even if the dictionary stores frequencies, maximum matching ignores them and chooses by length. It therefore has no frequency score for comparing the complete readings."}
                </p>
                <p>
                  Two properties of the list matter and both come up later. Its
                  longest entry bounds every question the method asks, since
                  there is no point offering a candidate longer than anything the
                  list holds. And whatever is not on the list does not exist as
                  far as the method is concerned, which is the whole subject of
                  the fourteenth section below.
                </p>
                <p>
                  One rule sits underneath all of this and is easy to miss.
                  Whitespace still ends a run before any matching begins, so a
                  match can never reach across a space. Handed the two words the
                  cat with a space in them, a list holding thecat as an entry
                  will not produce it, because the space closed the run first.
                  That is what keeps the method usable on a page of Chinese that
                  quotes an English name, or on anything with a line break in it.
                </p>
                <KeepInMind>
                  {"The dictionary supplies candidates; the matching rule chooses among them. Coverage and the greedy choice are separate limitations. A complete list of the intended words still does not guarantee the greedy scan will select their path."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Take the Longest Entry That Fits",
          content: (
            <>
              <SubSection title="5. The rule">
                <p>
                  Stand at the start of the text. Look for the longest run of
                  characters beginning where you stand that the word list holds.
                  Cut there, move past what you took, and do the same again. If
                  no entry at all begins where you stand, take one character and
                  move on by one.
                </p>
                <Equation>
                  {"take  =  the longest w with  text[i : i + |w|] = w  and  w in the list"}
                </Equation>
                <p>
                  That is the whole method, and the two names it goes by each
                  describe half of it. Maximum matching names the choice at a
                  position, which is the longest available match. Greedy longest
                  match names the discipline about the whole text, which is that
                  the choice is made once and never revisited, whatever it turns
                  out to have cost further along.
                </p>
                <WhyThisWorks title="Why short words make longest matching a useful starting rule">
                  <p>
                  {"Why try the longest entry? If the dictionary contains a complete multi-character word and also its smaller parts, taking the full word can avoid unnecessary fragmentation. That is a plausible preference, not evidence that the longest available entry is usually intended on every Chinese input. The examples below show where it fails."}
                </p>
                  <p>
                  {"The method does not compute which path is most likely. It uses the longest local match as a proxy for a useful word boundary. We need to inspect both the dictionary coverage and the consequences of that local preference."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"The scan reads enough characters to test candidate entries, up to the dictionary’s maximum length. It does not compare the complete segmentations left after those candidates. That is the lookahead it gives up."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The rule walked through, one position at a time">
                <p>
                  Here is the whole method on the wildlife park sentence, with a
                  list of nine words beside it. At each position it offers the
                  longest candidate the list could possibly hold, then the next
                  longest, and stops at the first one it finds. Every question it
                  asks is shown, so the answer can be checked against the list
                  without taking anything on trust.
                </p>
                <GreedyWalk scenarioKey="park" />
                <WorkedExample>
                  <p>
                    Scanning from the left it asks nine questions in all. At the
                    start 我们在 is not on the list and 我们 is, so it takes 我们
                    and moves on two. At the third character 在野生 is not there
                    and 在野 is, so it takes 在野. At the fifth 生动物 is not
                    there and 生动 is, so it takes 生动. What is left after that
                    is 物, 园 and 玩, three single characters, and the answer is
                    six pieces.
                  </p>
                  <p>
                    The list holds 在野, which means out of office, and 生动,
                    which means vivid. Both are real Chinese words. Neither is in
                    this sentence.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Nine questions settled a cut that 256 readings of those nine
                  characters were available for, and the whole of the method is
                  in the widget above. Everything after this section is about
                  what that speed costs.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The same rule on our own sentence">
                <p>
                  {"With spaces removed, the running English sentence gives 24 pieces under the 810-entry dictionary. Seven pieces are dictionary entries and eighteen are one character long. Those categories overlap: a one-character piece can also be a valid entry, so the eighteen are not eighteen uncovered fallbacks."}
                </p>
                <NumberTable
                  headings={["", "pieces", "of them entries", "single-character pieces"]}
                  rows={[
                    ["scanned from the left", "24", "7", "18"],
                    ["scanned from the right", "24", "7", "18"],
                    ["the shortest reading there is", "24", "7", "18"],
                  ]}
                  caption="The same 45 characters against a list of 810 ordinary English words, where a space would have given seven words. The two scans agree here, and 24 is also the fewest pieces any reading against that list could have used, reached by exactly one reading."
                />
                <p>
                  Here the dictionary is the limiting factor. An exhaustive search using its entries and lone-character fallbacks also needs at least 24 pieces. Exactly one path reaches that minimum, and the greedy method found it. A better search cannot return a shorter path until the available pieces change.
                </p>
                <p>
                  {"This supplied dictionary lacks the surname Alvarez, the abbreviation Dr and the punctuation needed to keep those forms whole. Other dictionaries could include them. The scan does find entries such as expect, the, low, cost and analysis, while returning the unmatched remainder as single-character pieces."}
                </p>
                <InAModel>
                  <p>
                  {"The output is more fragmented: 24 positions instead of the original seven whitespace pieces. The characters still preserve their order and spelling; a one-character piece does not have almost no information. Inspect entry membership separately from length when judging dictionary coverage."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The supplied list cannot keep several names and punctuation forms whole. Changing the search alone cannot create a missing multi-character entry. This controlled example separates dictionary coverage from the greedy search’s choices."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. How many dictionary lookups does the scan require?" id="8-what-it-costs-to-run">
                <p>
                  At each position the method offers at most as many candidates
                  as the longest entry in the list is long, and each candidate is
                  one lookup. So a run of n characters against a list whose
                  longest entry is L characters costs at most n multiplied by L
                  lookups, and every one of them is a membership test.
                </p>
                <Equation>{"lookups  ≤  n × L"}</Equation>
                <p>
                  {"The trace counts 191 candidate lookups from the left and 156 from the right for the 45-character input, below the stated bound of 450. The wildlife-park trace has nine. These counts show how little of the possible segmentation space a greedy scan explores; they are not measured runtime or an accuracy benchmark against every learned segmenter."}
                </p>
                <p>
                  The examples here use texts and dictionary entries small enough to inspect by hand. There is no annotated Chinese evaluation corpus on the site, so they do not supply a general accuracy estimate for maximum matching. They show what the selection rule does when its entries and ambiguous choices are visible.
                </p>
                <KeepInMind>
                  {"For a fixed maximum entry length, the stated lookup-count bound grows linearly with input length. Actual runtime also includes forming and testing candidate substrings. The scan commits without scoring every remaining path, which is why it can miss a better complete segmentation."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Against a list of 810 common English words, the method answers our sentence in 24 pieces where a space would have given seven. What is responsible?",
              [
                "Greed, since a shorter reading was available and an early take passed it by",
                "The list, since 24 is also the fewest pieces any reading against that list could use",
                "The direction of the scan, since the mirror image would have found seven",
                "The bound on candidate length, since no entry longer than ten characters was ever offered",
              ],
              1,
              "Against this supplied dictionary and single-character fallback, exactly one path reaches the minimum of 24 pieces, and the greedy scan finds it. This list lacks the surname, abbreviation and punctuation forms needed for the reference split; another dictionary could include them. Search alone cannot emit an unavailable multi-character entry.",
            ),
            choice(
              "Why is a rule as crude as take the longest entry worth anything at all?",
              [
                "Chinese words are mostly one or two characters, so when a longer entry is available it is usually the word really written",
                "The longest match is the one a word list can confirm most cheaply",
                "Taking the longest entry is guaranteed to produce the fewest pieces",
                "A longer entry is held by the list only when it is more frequent than its parts",
              ],
              0,
              "Preferring length stands in for preferring the reading that uses whole words rather than fragments. That is a statement about frequencies and the method holds no frequencies, so it works exactly to the extent that the longest match and the likeliest reading coincide. On the wildlife park sentence the fewest pieces available is five and the left-hand scan answers six, so taking the longest entry carries no guarantee of the fewest pieces.",
            ),
            trueFalse(
              "Handed the two words the cat with a space between them, a list holding thecat as an entry will produce it.",
              false,
              "Whitespace ends a run before any matching begins, so the space closed the first run before the first lookup and the two runs are matched on their own, answering the and then cat. Holding thecat changes nothing, since no candidate ever spans the space. That is what keeps the method usable on a page of Chinese that quotes an English name, or on anything with a line break in it.",
            ),
            several(
              "Which of these hold of the word list this method is given?",
              [
                "Its longest entry bounds every question the method asks at a position",
                "Whatever is not on the list does not exist as far as the method is concerned",
                "It holds counts, so it can prefer a common word to a rare one",
                "A match may reach across a space when the joined characters form an entry",
              ],
              [0, 1],
              "There is no point offering a candidate longer than anything the list holds, which is also what bounds the cost at the length of the text times the length of the longest entry. A word list says which readings are possible and cannot say which are likely, since it holds no counts, and everything awkward on the page comes back to that one limitation.",
            ),
            trueFalse(
              "On our sentence with its spaces gone, 45 characters against a list whose longest entry is ten characters, the left-to-right scan asked 191 questions of the list, inside a bound of 450.",
              true,
              "The longest entry bounds the number of candidate lengths tested at each position. This gives at most 450 membership lookups for the supplied 45-character run and ten-character maximum entry. The measured forward scan uses 191 and the backward scan 156. That is a lookup-count bound, not a complete runtime analysis: constructing and hashing candidate strings also costs work.",
            ),
        ],
        },
        {
          title: "Part 3. Which End You Start From",
          content: (
            <>
              <SubSection title="9. The same rule, run backwards">
                <p>
                  Nothing in the rule said which end to start from. Stand at the
                  end of the text instead, take the longest entry that ends
                  where you are standing, move back past it, and repeat. That is
                  the identical rule reflected, it costs about the same to run,
                  and it can give a different answer.
                </p>
                <Equation>
                  {"take  =  the longest w with  text[j − |w| : j] = w  and  w in the list"}
                </Equation>
                <p>
                  These are forward and backward maximum matching. Both make a greedy longest-match choice, but they begin at opposite ends. Neither direction is inherently the reference answer. We can compare the segmentations they produce on the same text.
                </p>
                <KeepInMind>
                  A rule that reads a text in order has to be told which order,
                  and the problem of finding words in a line of characters does
                  not come with one.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Where the two disagree, in English">
                <p>
                  {"The English string formed from the, table, down and there provides another controlled example. Run the same 810-entry dictionary in both directions to compare how the first match changes what remains."}
                </p>
                <ScanComparison scenarioKeys={["table"]} />
                <p>
                  {"From the left, theta is the longest starting entry. That leaves bledownthere, which can be split into bled, own and there, all listed. The four-piece result differs from our intended the, table, down, there. The backward scan returns that reference path in this example."}
                </p>
                <p>
                  Both answers use four pieces, both use four entries of the
                  list, and neither uses a single lone character. Counting cannot
                  separate them, and the widget above says so from the other
                  side. Searching every reading of those seventeen characters,
                  exactly two of them use as few as four pieces, and those two
                  are these two.
                </p>
                <KeepInMind>
                  {"The two outputs tie on piece count and singleton count, the measures used by the bidirectional heuristic. Other evidence, such as word frequencies or context, could distinguish them. The tie is in these chosen counts, not in every conceivable measurement."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. And where they disagree in Chinese">
                <p>
                  On the wildlife-park example, direction changes both the pieces and their count. The left-to-right scan returns six, while the right-to-left scan returns the intended five-piece reading for this illustration. Neither direction has acquired a general way to infer that intention: each still makes its own local longest-match decision.
                </p>
                <ScanComparison scenarioKeys={["park"]} />
                <>
<p>
                  {"From the right, the scan first takes 玩. It can then take 动物园, the word for zoo, as a whole. That changes which earlier positions are visited and avoids the two misleading matches chosen by the forward scan."}
                </p>
                <p>
                  {"Backward preference is a heuristic convention. Linguistic arguments about compound structure can motivate testing it, but the two small examples do not establish a language-wide advantage. Its accuracy needs a specified corpus and word convention."}
                </p>
</>
                <p>
                  {"The examples have different lookup counts as well as different paths. The unspaced English sentence gives the same output in both directions, with 191 versus 156 lookups. The park example uses nine versus eight; the four-word English example uses twenty versus eighteen. These observations do not make backward scanning universally better."}
                </p>
                <KeepInMind>
                  The mirror image of a greedy rule is another greedy rule with
                  the mirror-image blind spot, and nothing says the two blind
                  spots have to cost the same in a given language. On the two
                  disagreements here the left-hand scan is wrong both times.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Running both, and keeping one">
                <p>
                  We can run both scans and apply a preference rule when they disagree. That is the bidirectional heuristic. The rules below are chosen preferences, so we should test their consequences rather than treat them as guarantees of a correct segmentation.
                </p>
                <DerivationTable
                  expressionHeading="rule"
                  reasonHeading="the argument for it"
                  rows={[
                    {
                      expression: "1. fewer pieces wins",
                      reason:
                        "an answer in fewer pieces used longer words, and a longer word is likelier to have been intended than the fragments that fit inside it. It is a preference, not a theorem, and it is the same preference the rule at a single position already expresses.",
                    },
                    {
                      expression: "2. then fewer lone characters",
                      reason:
                        "Fewer single-character pieces is a secondary preference. Some single characters are valid words, so it is not a direct count of errors or unknowns. Here it separates paths that tie on piece count.",
                    },
                    {
                      expression: "3. then take the backward one",
                      reason:
                        "A fixed backward preference makes the tie reproducible. It is a convention to evaluate on the target corpus, not a linguistic theorem unique to Chinese.",
                    },
                  ]}
                />
                <p>
                  On the wildlife park sentence the first rule settles it, since
                  five pieces beat six. On the tied sentence from section 3 the
                  first rule cannot, because both scans answer three pieces, and
                  the second decides it. Scanning from the left gives 研究生, 命,
                  起源, the graduate student reading, which strands 命 on its own;
                  scanning from the right gives 研究, 生命, 起源 with no lone
                  characters at all.
                </p>
                <ScanComparison scenarioKeys={["origins"]} />
                <p>
                  And on the four English words both counts tie, four pieces and
                  no lone characters either way, so the third rule decides, and
                  the answer it lands on is right for a reason that has nothing
                  to do with English. Searching every reading of those characters
                  turns up exactly two that reach four pieces, so the two counts
                  had genuinely nothing to work with and what settled it was the
                  convention.
                </p>
                <KeepInMind>
                  {"These are preferences rather than optimality guarantees. Across the five shown inputs, piece count settles one choice, singleton count settles two and the backward tie rule settles two. The chosen rule gives a reproducible answer even where the counts provide no further distinction."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Where the Greedy Choice Goes Wrong",
          content: (
            <>
              <SubSection title="13. A long match early forces a bad cut later">
                <p>
                  {"A local choice determines which position the scan visits next. Taking a longer entry early can prevent it from seeing a useful word beginning inside that entry. We can inspect that mechanism directly in the park example."}
                </p>
                <p>
                  On the wildlife park sentence, scanning from the left, the
                  second take is 在野 rather than 在. Both are entries, 在野 is
                  longer, so the rule takes it. That moves the cursor one
                  character further along than it should be, and from there the
                  characters 生动 line up as an entry when they are the end of one
                  word and the start of another, and after that there is nothing
                  left but three single characters.
                </p>
                <WorkedExample>
                  <p>
                    An exhaustive search over the permitted pieces finds two five-piece segmentations of these nine characters. The forward greedy scan returns six pieces. If our criterion is the fewest pieces, it has missed a better available path. That does not make either five-piece result linguistically correct by itself; it establishes a failure under the stated count criterion.
                  </p>
                </WorkedExample>
                <p>
                  This is worth separating from the direction question of the
                  previous part, since the two look similar and are not. There,
                  two answers were level on every count and something had to
                  break a tie. Here one answer is a piece longer than a reading
                  the same list permits, and taking that extra character at
                  position two is what cost it, since no amount of care at the
                  later positions could undo a cut already made.
                </p>
                <KeepInMind>
                  {"The greedy scan does not revisit a chosen match or compare its whole-path cost with alternatives. To discover that another path uses fewer pieces, run a separate search or choose a procedure that retains those alternatives."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A stretch that no entry covers">
                <p>
                  {"When no multi-character entry fits, this implementation returns one character and continues. That is its chosen fallback. Other interfaces could group an unknown run, report an error or ask another model; those would define a different segmentation policy."}
                </p>
                <p>
                  Here is our own sentence contributing to the Chinese half of
                  the page. Put Alvarez in front of the sentence about the origin
                  of life, written the way Chinese writes a foreign name, and
                  hand the result to the same five-word list.
                </p>
                <ScanComparison scenarioKeys={["name"]} />
                <p>
                  {"The five surname characters become five pieces, so the four-word reference becomes eight pieces, three of them dictionary entries. Eight is also the minimum piece count allowed by this dictionary and fallback, and both scans reach it. The characters are preserved; the missing entry prevents the surname from being returned as one unit."}
                </p>
                <InAModel>
                  <p>
                  {"Names, loanwords, numbers and technical terms can expose this gap when the supplied list lacks them. A larger or domain-specific dictionary can help. Another option is an unknown-word model that proposes boundaries from character patterns, with its own errors to evaluate."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The chosen fallback returns one source character at a time. On the eleven-character example, that gives eight pieces for a four-word reference. The fallback preserves text, while dictionary coverage limits the available multi-character words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. And when nothing in the answer says anything is wrong">
                <p>
                  A run of lone characters at least looks like something. The
                  harder case is the one where a word is missing from the list
                  and the answer that comes back is made entirely of entries,
                  because then there is no mark on it anywhere.
                </p>
                <p>
                  Take the word for zoo out of the nine-word list and run both
                  scans on the wildlife park sentence again. The right-hand scan,
                  which was the one that got the sentence right, now produces the
                  same six pieces the left-hand scan produced, and all six of
                  them are entries.
                </p>
                <AMissingWord />
                <>
<p>
                  The English case shows the two halves of it. Take table out of the 810 words and the scan from the left answers exactly what it answered before, theta, bled, own, there, four pieces and four entries, so losing the word changed nothing about the answer or about how finished it looks. The scan from the right falls apart visibly instead, to six pieces of which three are lone characters, so on that side there is at least something to see.
                </p>
                <p>
                  Which of those two happens is settled by where the missing word sat relative to the direction of the scan, and there is nothing in either answer that says a word went missing.
                </p>
</>
                <KeepInMind>
                  {"All-entry output does not certify that the dictionary contained the intended words. The method returns no confidence score for that claim. Reference annotations, targeted tests or another diagnostic can expose errors; knowing the entire correct segmentation in advance is not the only possible way to investigate them."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. When the Longest Match Is Not the Intended Word" , id: "part-5-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="16. Nothing in the problem picks an end to start from">
                <p>
                  {"Direction is part of the segmentation configuration. This SDK defaults to forward maximum matching and also supports backward and bidirectional choices. Each uses the same dictionary, but its order changes the candidate positions it visits."}
                </p>
                <p>
                  What turns on that is not small. On the four English words the
                  two answers are theta, bled, own, there and the, table, down,
                  there, which agree on the last piece and on nothing else, and
                  every count you could compare them by is level. On the wildlife
                  park sentence they differ by a whole piece. Anything that
                  reports a segmentation has to say which scan produced it, in the
                  same way that anything reporting a measurement has to say in
                  what units.
                </p>
                <p>
                  {"Running both shifts the decision to the preference rules. On the four-word English example, both counts tie and the fixed backward preference chooses the reference path. That agreement is one result for this example, not evidence that a Chinese-motivated convention is a general English segmentation model."}
                </p>
                <KeepInMind>
                  A rule that is undetermined has to be completed by a convention.
                  The right thing to do with a convention is to write it down
                  where the answer is reported, since a reader who does not know
                  which of two answers they are looking at cannot check either.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A word the list lacks is not merely missing">
                <p>
                  {"An unlisted multi-character word cannot be emitted as one piece under this dictionary-and-singleton policy. Its characters can still be returned individually or as smaller entries. A one-character word can be emitted by fallback even if it is absent from the dictionary."}
                </p>
                <p>
                  {"The output does not directly report whether an intended multi-character word was absent. With zoo removed, the six-piece result consists entirely of other dictionary entries. That illustrates why membership alone is not a correctness test; it does not make missing-word detection and representation mathematically the same property."}
                </p>
                <>
<p>
                  {"A scoring procedure can retain several candidate paths and compare whole segmentations. It may use dictionary frequencies, character evidence or context. Adding an unknown-word model can also broaden the candidates. A score is not automatically a calibrated confidence estimate, so uncertainty needs its own validation."}
                </p>
                <p>
                  {"One source of word-frequency scores is a corpus segmented under a stated convention. Other models can learn from different supervision or joint training. The next lesson shows the specific counts and scoring policy it uses."}
                </p>
</>
                <KeepInMind>
                  {"Coverage is a property of the supplied dictionary and fallback policy. We can inspect entry membership and test reference cases, but this greedy method does not turn those checks into a probability that the segmentation is correct."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Longest is standing in for likeliest">
                <p>

                  Underneath everything on this page is one substitution. What
                  anybody wants is the most plausible reading of the text. What
                  the method optimizes is the length of the piece it is looking
                  at right now, and the two are related only by the rough
                  observation that long matches tend to be intended matches.
                </p>
                <>
<p>
                  {"Both dictionary paths through 研究生命起源 contain three pieces, so piece count cannot distinguish them. Word frequencies would add a criterion, and context could add another. Neither turns every dictionary-valid path into an equally plausible interpretation."}
                </p>
                <p>
                  Both readings of the four English words use four pieces of four real words, and the same is true there. Neither tie is a coincidence. Length is a coarse quantity that takes few values, so on a short text several readings land on the same value of it and the method has run out of things to compare.
                </p>
</>
                <p>
                  The next method retains the available dictionary alternatives instead of committing to the first local choice. Frequencies can then contribute to a score for each complete reading. That gives us a different decision procedure to inspect, while still leaving the dictionary responsible for which words can be considered.
                </p>
                <KeepInMind>
                  {"Longest matching is an easy local preference to inspect. It does not compute the likeliest complete reading or guarantee the fewest pieces. The examples distinguish a greedy search error from a dictionary that cannot represent the reference words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Direction, missing words and ambiguous readings" id="19-where-the-method-has-nothing-to-say">
                <p>The longest-match rule still needs a direction, a dictionary and a way to handle unknown text. Each choice can change the resulting words even though every local step follows the rule correctly.</p>
                <DerivationTable
                  expressionHeading="Scan or dictionary choice"
                  reasonHeading="How the chosen words can change"
                  rows={[
                    {
                      expression: "which end the scan starts from",
                      reason:
                        "Direction is a configuration choice; this SDK defaults to forward. The four-word English outputs tie on piece and singleton counts, while the park outputs differ in count. Record the chosen direction when reproducing a result.",
                    },
                    {
                      expression: "two readings with the same number of pieces",
                      reason:
                        "The piece-count criterion ties; a reference annotation or another scoring rule can still prefer one path. The two six-character readings use three pieces. Exactly two seventeen-character English paths reach the minimum of four pieces.",
                    },
                    {
                      expression: "a word the list does not hold",
                      reason:
                        "An unlisted multi-character word cannot be returned as one piece under this fallback policy. Its characters remain available individually or through smaller entries. The five-character surname is split, and eight pieces is the minimum allowed by this example’s dictionary.",
                    },
                    {
                      expression: "whether the answer is missing a word",
                      reason:
                        "With zoo removed, both scans return six dictionary entries. Entry membership therefore does not certify the intended segmentation. A reference set, targeted test or added diagnostic can reveal a missing word; this output does not provide a correctness probability.",
                    },
                    {
                      expression: "a stretch no entry covers",
                      reason:
                        "This implementation returns one piece per character. The API reports whether each is an entry. A single-character piece can be a valid listed word, so count unmatched pieces separately from singleton pieces.",
                    },
                    {
                      expression: "a text a whitespace character runs through",
                      reason:
                        "settled before any matching happens, since whitespace ends a run and no match reaches across one. That is a decision rather than a consequence, and the argument for it is that the writer already marked a boundary there, so a method allowed to match across it would produce a word the text does not contain.",
                    },
                    {
                      expression: "which reading is the likelier one",
                      reason:
                        "never asked, because the method holds no frequencies and length is what it has instead. This is the substitution the whole method rests on and it is invisible while the two agree. It is also why the ties above are ties rather than close calls, since length takes few values and several readings of a short text land on the same one.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "Evaluate against a stated word convention and representative annotated data. Corpora may adopt different conventions, but that does not prevent a meaningful accuracy measure. These examples do not supply an annotated evaluation corpus or a general accuracy estimate.",
                    },
                  ]}
                />
                <KeepInMind>
                  Three of these are decisions rather than limits, namely which
                  end to scan from, how a tie between two readings of the same
                  length is settled, and what becomes of a stretch nothing
                  covers. Each has a defensible answer on more than one side and
                  each changes what comes back, so each belongs in whatever
                  describes a segmenter rather than being left to whoever writes
                  one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            choice(
              "Scanning the wildlife park sentence from the left gives six pieces. What went wrong?",
              [
                "Two of the nine characters are covered by no entry, so they came back alone",
                "The second take was the longer of two entries, which moved the cursor one character too far and let a later fragment line up as an entry",
                "The scan ran out of candidates because the list holds only nine words",
                "Nothing went wrong, since six is the fewest pieces any reading of those characters reaches",
              ],
              1,
              "Both 在 and 在野 are entries and the rule takes the longer, after which 生动 lines up as an entry although it is the end of one word and the start of another. Searching every reading, the fewest pieces any of them uses is five and two readings reach it, so the answer is worse by the crudest measure available. No amount of care at the later positions could undo a cut already made.",
            ),
            trueFalse(
              "With the surname written in front of the sentence about the origin of life, both scans answer eight pieces, and eight is also the fewest pieces any reading against the five-word list could use.",
              true,
              "Both scans reach the minimum piece count available under this dictionary and fallback policy, but neither has an entry for the surname. Its five characters are preserved as separate pieces, which loses the intended surname grouping. A lower piece count cannot repair a word the candidate vocabulary cannot express as one unit. A model or richer dictionary can provide another way to group unfamiliar spans.",
            ),
            choice(
              "Across the five texts the page works through, how do the three rules of the bidirectional heuristic divide the cases?",
              [
                "The first settles all five, since the two scans rarely tie on piece count",
                "The first settles one, the second two and the third two",
                "The first settles two, the second two and the third one",
                "The three rules disagree on two of the five, so the heuristic has no answer there",
              ],
              1,
              "The heuristic first prefers fewer pieces, then fewer one-character pieces, and finally uses its fixed direction preference. Those tests settle the displayed examples at different stages. They are explicit selection conventions rather than a probability model of the sentence. Evaluate them on the target language and text before treating their selected reading as correct.",
            ),
            several(
              "Which of these hold when a word is taken out of the list?",
              [
                "With the word for zoo removed, the right-hand scan produces six pieces every one of which is an entry",
                "With table removed, the left-hand scan answers exactly what it answered before",
                "With table removed, the right-hand scan falls apart to six pieces of which three are lone characters",
                "The answer carries some mark that a word went missing",
              ],
              [0, 1, 2],
              "Removing an entry can change later greedy choices or trigger character fallback. The output still may consist entirely of listed pieces, as in this example. Membership counts alone cannot identify the missing intended word. An annotated evaluation set, external vocabulary or contextual review can expose that limitation.",
            ),
            trueFalse(
              "This matcher can output a multi-character word absent from its dictionary and assign that word a low probability.",
              false,
              "The candidate choices are dictionary entries plus the stated single-character fallback. An absent multi-character word is therefore not generated as one piece, and the algorithm has no probability score to assign it. It can still return its characters separately or combine them with other listed entries. Candidate coverage and ranking among available candidates need separate checks.",
            ),
        ],
        },
        {
          title: "Practice. Scanning the Two Sentences With the Library",
          practice: [
            exercise(
              "Scan the wildlife park sentence from both ends",
              [
  "Use the supplied nine-entry dictionary to segment 我们在野生动物园玩, first from the left and then from the right. Each step takes the longest dictionary entry available at its current position.",
  "Print the pieces, total piece count and number of one-character pieces for each direction. Compare both with the reader segmentation given in the lesson; a locally longest match can block a useful match later."
],
              `from oop_ml import MatchingDirection, MaximumMatchingSegmenter, WordDictionary

sentence = "我们在野生动物园玩"
words = ["我们", "在", "在野", "野生", "生动", "动物园", "物", "园", "玩"]
dictionary = WordDictionary.from_words(words)

for direction in (MatchingDirection.FORWARD, MatchingDirection.BACKWARD):
    # Build a segmenter over the dictionary scanning in this direction, split the
    # sentence, and print the pieces, the piece count and the lone-character count.
    pass`,
              `from oop_ml import MatchingDirection, MaximumMatchingSegmenter, WordDictionary

sentence = "我们在野生动物园玩"
words = ["我们", "在", "在野", "野生", "生动", "动物园", "物", "园", "玩"]
dictionary = WordDictionary.from_words(words)

for direction in (MatchingDirection.FORWARD, MatchingDirection.BACKWARD):
    segmenter = MaximumMatchingSegmenter(dictionary=dictionary, direction=direction)
    pieces = segmenter.split(sentence)
    lone = sum(1 for piece in pieces if len(piece.text) == 1)
    print(f"{direction.value}: {' | '.join(pieces.texts)}")
    print(f"  {pieces.n_words} pieces, {lone} lone characters")`,
              `forward: 我们 | 在野 | 生动 | 物 | 园 | 玩
  6 pieces, 3 lone characters
backward: 我们 | 在 | 野生 | 动物园 | 玩
  5 pieces, 2 lone characters`,
              {
question: "Does the direction of a greedy word scan change the sentence it finds?",
 hints: [
  "Build WordDictionary.from_words(words), then pass it to MaximumMatchingSegmenter with the required MatchingDirection.",
  "split returns pieces carrying text. Use texts for the display, n_words for the total and len(piece.text) for the single-character count."
], check: numberCheck("How many pieces does the right-to-left scan answer?", 5, 0.5, "The backward scan gives five pieces. It encounters the zoo entry from the right before making the conflicting choice that misleads the forward scan on this sentence.") },
            ),
            exercise(
              "Let the heuristic choose on the surname sentence",
              [
  "Segment the supplied surname sentence 阿尔瓦雷斯研究生命起源 with the five-entry dictionary, using FORWARD, BACKWARD and BIDIRECTIONAL.",
  "For each result print its pieces, total piece count, one-character count and dictionary-entry count. The surname is absent from the dictionary, so examine how the heuristic treats the remaining ambiguity after those unfamiliar characters.",
  "BIDIRECTIONAL compares the two scans with fixed preferences. Its chosen cut is a heuristic result, not a contextual understanding of the surname or sentence."
],
              `from oop_ml import MatchingDirection, MaximumMatchingSegmenter, WordDictionary

sentence = "阿尔瓦雷斯研究生命起源"
dictionary = WordDictionary.from_words(["研究", "研究生", "生命", "命", "起源"])

for direction in MatchingDirection:
    pieces = MaximumMatchingSegmenter(dictionary=dictionary, direction=direction).split(sentence)
    # Count the lone characters and the pieces the dictionary holds, then print
    # the pieces and the three counts for this direction.
    pass`,
              `from oop_ml import MatchingDirection, MaximumMatchingSegmenter, WordDictionary

sentence = "阿尔瓦雷斯研究生命起源"
dictionary = WordDictionary.from_words(["研究", "研究生", "生命", "命", "起源"])

for direction in MatchingDirection:
    pieces = MaximumMatchingSegmenter(dictionary=dictionary, direction=direction).split(sentence)
    lone = sum(1 for piece in pieces if len(piece.text) == 1)
    entries = sum(1 for piece in pieces if piece.text in dictionary)
    print(f"{direction.value}: {' | '.join(pieces.texts)}")
    print(f"  {pieces.n_words} pieces, {lone} lone characters, {entries} entries")`,
              `forward: 阿 | 尔 | 瓦 | 雷 | 斯 | 研究生 | 命 | 起源
  8 pieces, 6 lone characters, 3 entries
backward: 阿 | 尔 | 瓦 | 雷 | 斯 | 研究 | 生命 | 起源
  8 pieces, 5 lone characters, 3 entries
bidirectional: 阿 | 尔 | 瓦 | 雷 | 斯 | 研究 | 生命 | 起源
  8 pieces, 5 lone characters, 3 entries`,
              {
question: "How does the bidirectional heuristic choose when both scans use eight pieces?",
 hints: [
  "Iterating MatchingDirection visits all three directions. Construct a segmenter for each one.",
  "Count one-character pieces with len(piece.text) == 1 and known entries with piece.text in dictionary.",
  "When piece counts tie, compare the number of one-character pieces before looking for a later tie rule."
], check: numberCheck("How many lone characters does the left-to-right scan leave on the surname sentence?", 6, 0.5, "The forward scan leaves six one-character pieces. Five come from the absent surname and the sixth from a conflicting match later in the sentence, which lets the heuristic distinguish the tied scans.") },
            ),
            exercise(
              "Take the word for zoo out of the list",
              [
  "Remove 动物园, the zoo entry, from the supplied wildlife-park dictionary. Run the forward and backward maximum-matching scans on the same sentence again.",
  "Print each segmentation and the number of its pieces found in the shortened dictionary. Compare this with the earlier backward scan, which could take the complete zoo entry.",
  "A count of known pieces tells us whether the pieces were listed. It does not tell us whether their combination expresses the intended words."
],
              `from oop_ml import MatchingDirection, MaximumMatchingSegmenter, WordDictionary

sentence = "我们在野生动物园玩"
words = ["我们", "在", "在野", "野生", "生动", "动物园", "物", "园", "玩"]
shortened = WordDictionary.from_words([word for word in words if word != "动物园"])

# For the forward and the backward direction, split the sentence against the
# shortened list and print the pieces, the piece count and how many pieces are entries.`,
              `from oop_ml import MatchingDirection, MaximumMatchingSegmenter, WordDictionary

sentence = "我们在野生动物园玩"
words = ["我们", "在", "在野", "野生", "生动", "动物园", "物", "园", "玩"]
shortened = WordDictionary.from_words([word for word in words if word != "动物园"])

for direction in (MatchingDirection.FORWARD, MatchingDirection.BACKWARD):
    pieces = MaximumMatchingSegmenter(dictionary=shortened, direction=direction).split(sentence)
    entries = sum(1 for piece in pieces if piece.text in shortened)
    print(f"{direction.value}: {' | '.join(pieces.texts)}")
    print(f"  {pieces.n_words} pieces, {entries} of them entries")`,
              `forward: 我们 | 在野 | 生动 | 物 | 园 | 玩
  6 pieces, 6 of them entries
backward: 我们 | 在野 | 生动 | 物 | 园 | 玩
  6 pieces, 6 of them entries`,
              {
question: "Will a missing dictionary word announce itself as a failure?",
 hints: [
  "Construct a fresh WordDictionary from the remaining eight entries and use it for both directions.",
  "Count membership for every returned piece. A fully listed segmentation can still be the wrong reading."
], check: numberCheck("How many of the right-to-left scan’s pieces are entries once the word for zoo is gone?", 6, 0.5, "All six backward-scan pieces are dictionary entries after the removal, even though the intended zoo word has been lost. Dictionary membership therefore cannot expose this error by itself.") },
            ),
            exercise(
              "Try to match across a space",
              [
  "Build the supplied dictionary containing the, cat and thecat. Segment \"the cat\" and \"thecat\" with the same forward matcher.",
  "For each input, print its piece count and every piece’s start and end offsets. The offsets are zero-based and half-open: the start is included and the end is excluded.",
  "This segmenter first separates whitespace-delimited runs. The entry thecat can match inside one run, but cannot cross the space between two runs."
],
              `from oop_ml import MaximumMatchingSegmenter, WordDictionary

dictionary = WordDictionary.from_words(["thecat", "the", "cat"])
segmenter = MaximumMatchingSegmenter(dictionary=dictionary)

for text in ("the cat", "thecat"):
    # Split the text and print each piece with its start and end offsets.
    pass`,
              `from oop_ml import MaximumMatchingSegmenter, WordDictionary

dictionary = WordDictionary.from_words(["thecat", "the", "cat"])
segmenter = MaximumMatchingSegmenter(dictionary=dictionary)

for text in ("the cat", "thecat"):
    pieces = segmenter.split(text)
    print(f"{text!r} -> {pieces.n_words} piece(s)")
    for piece in pieces:
        print(f"  {piece.text!r} at [{piece.start}, {piece.end})")`,
              `'the cat' -> 2 piece(s)
  'the' at [0, 3)
  'cat' at [4, 7)
'thecat' -> 1 piece(s)
  'thecat' at [0, 6)`,
              {
question: "Can the matcher join an entry across whitespace?",
 hints: [
  "MaximumMatchingSegmenter defaults to FORWARD.",
  "Iterate split(text) to read piece.text, piece.start and piece.end. Check each span with text[start:end]."
], check: numberCheck("At what offset does the piece cat start in the text the cat?", 4, 0.5, "Cat starts at offset 4 in \"the cat\". The space ends the first matching run, so the six-letter entry is available only for the input without that space.") },
            ),
          ],
        },
      ]}
    />
  );
}
