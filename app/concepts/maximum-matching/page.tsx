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

export const metadata: Metadata = {
  title: "Maximum Matching · oop_ml",
  description:
    "Use a dictionary to take the longest available word at each position.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function MaximumMatchingPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["maximum-matching"]}
      technicalStart="Part 2. Take the Longest Entry That Fits"
      openingTitle="Where Do the Words End When There Are No Spaces?"
      playgroundIntro="Follow the chosen dictionary entry at each position. Compare forward and backward scans and identify the first choice where their segmentations diverge."
      title="Maximum Matching"
      tagline="Use a dictionary to take the longest available word at each position."
      prerequisites={
        <>
          Everything earlier in this section assumed that something in the
          writing marks where one word stops, and this page is the first that
          cannot assume it. Nothing else is needed. There is no probability here
          and no training of any kind; the only arithmetic is counting, and the
          only knowledge the method has is a list of words somebody wrote down.
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
                  We have been carrying one sentence through this section, and
                  every rule so far has begun by looking for whitespace in it.
                  Take the whitespace away and the sentence is still perfectly
                  readable, since a reader finds the words from knowing English
                  rather than from the gaps, and every rule we have written stops
                  working at once.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  The sentence is 51 characters of which six are spaces, and a
                  rule that splits on those spaces finds seven words. Removing
                  them leaves 45 characters and the same seven words, and the
                  five rules from earlier in this section find between one and
                  ten pieces in it, not one of which is a word of English.
                </p>
                <SpacelessSentence />
                <p>
                  It is worth being precise about what has gone. The rules were
                  never reading the language. They were reading a mark the writer
                  put in, and doing an increasingly careful job of deciding what
                  belongs on either side of that mark. With the mark gone there
                  is nothing left for them to be careful about, and the pattern
                  language models use, which is the most elaborate of the five,
                  answers ten pieces because it still finds the punctuation.
                </p>
                <KeepInMind>
                  Splitting on spaces was never a way of finding words. It was a
                  way of reading a decision somebody else had already made and
                  written into the text. Where nobody made it, the question has
                  to be answered from knowledge of the language, and that
                  knowledge has to come from somewhere.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. How many ways forty-five characters can be cut">
                <p>
                  Before reaching for a method it is worth knowing how large the
                  problem is. Between any two neighbouring characters there is
                  either a boundary or there is not, and those choices are
                  independent, so a text has one fewer place to decide about
                  than it has characters, and two ways to decide each of them.
                </p>
                <Equation>{"readings of n characters  =  2^(n − 1)"}</Equation>
                <p>
                  For our sentence with its spaces gone that is two to the
                  forty-fourth, which comes to 17,592,186,044,416. A word list
                  rules almost all of those out, since a reading whose pieces are
                  not words is not a reading anybody wants, but nothing about the
                  problem is small.
                </p>
                <NumberTable
                  headings={["text", "characters", "ways to cut them"]}
                  rows={[
                    ["our sentence, spaces removed", "45", "17,592,186,044,416"],
                    ["we play at the wildlife park", "9", "256"],
                    ["research into the origin of life", "6", "32"],
                  ]}
                  caption="Two to the power of one less than the length, counted for the three texts this page works through. It counts every cut and not only the readings a word list allows, which is why it grows so fast."
                />
                <p>
                  Nine characters give 256 and that is enumerable by hand. The
                  interesting thing about this table is how quickly that stops
                  being true, and the whole family of methods this section
                  covers is a series of answers to it. This page&rsquo;s answer
                  is the cheapest one there is, which is to decide each boundary
                  as you reach it and never reconsider.
                </p>
                <KeepInMind>
                  Every method in this section is a way of not looking at all the
                  readings. The differences between them are entirely differences
                  in how much of the text they consult before committing to a
                  cut.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Why the rest of this page is in Chinese">
                <p>
                  English with the spaces taken out is a good way to feel the
                  problem and a bad way to study the method, and the reason is
                  that it is artificial. The spaces were there and I removed
                  them, so there is one right answer and I know it. Chinese is
                  written this way, which changes the question, because the
                  ambiguity that turns up is not damage somebody did to the text.
                </p>
                <Equation>{"研究生命起源"}</Equation>
                <p>
                  Those six characters read as research, life, origin, and they
                  also read as graduate student, fate, origin. Both readings are
                  built out of real Chinese words, both are grammatical, and
                  nothing in the six characters chooses. That is the shape of the
                  problem a segmenter is actually solving, and no amount of
                  removing spaces from English produces it.
                </p>
                <p>
                  So the rest of the page works on the two Chinese sentences this
                  method is classically shown on, each with the small word list
                  that goes with it. The one above is the tie, and the other,
                  which reads as we play at the wildlife park, is the one it is
                  usually shown failing. Both are nine characters or fewer, so
                  both can be checked by hand, and the English sentence comes
                  back in sections 7, 10 and 14, where it makes points a Chinese
                  fixture cannot.
                </p>
                <KeepInMind>
                  The earlier rules do not merely do badly on a Chinese sentence.
                  Four of the five hand back the whole sentence as one word, and
                  the standard word boundary rule hands back one word per
                  character, which are the two most wrong answers available. A
                  reader finds five words in it.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. A word list, and nothing else">
                <p>
                  The knowledge has to be carried in some form and the oldest
                  form is a list of words. That is all this method is given. It
                  can ask whether some run of characters is on the list and it
                  can ask nothing else, so it has no way of knowing that one word
                  is common and another rare, or that one reading is more
                  plausible than another.
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
                  A word list says which readings are possible. It cannot say
                  which are likely, since it holds no counts, and everything
                  awkward on this page comes back to that one limitation.
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
                <WhyThisWorks>
                  <p>
                    The reason a rule this crude is worth anything is a fact
                    about the language rather than about the rule. Chinese words
                    are mostly one or two characters, so at any position there
                    are rarely many candidates, and when a longer entry is
                    available at all it is usually because the longer word really
                    is the one written. Preferring length is standing in for
                    preferring the reading that uses whole words rather than
                    fragments.
                  </p>
                  <p>
                    That argument is worth stating carefully because it is a
                    statement about frequencies, and the method holds no
                    frequencies. It works to the extent that the longest match
                    and the likeliest reading coincide, and every failure on this
                    page is a place where they come apart.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Nothing in the rule looks ahead. The choice at a position is
                  made from the characters at that position and the list, and the
                  rest of the text has no vote.
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
                  Run it on our English sentence with the spaces gone, against a
                  list of 810 common English words. It comes back with 24 pieces
                  where a space would have given seven, and eighteen of those 24
                  are single characters that no entry covered.
                </p>
                <NumberTable
                  headings={["", "pieces", "of them entries", "lone characters"]}
                  rows={[
                    ["scanned from the left", "24", "7", "18"],
                    ["scanned from the right", "24", "7", "18"],
                    ["the shortest reading there is", "24", "7", "18"],
                  ]}
                  caption="The same 45 characters against a list of 810 ordinary English words, where a space would have given seven words. The two scans agree here, and 24 is also the fewest pieces any reading against that list could have used, reached by exactly one reading."
                />
                <p>
                  It is worth being careful about whose fault that is, because
                  the obvious reading of the number is the wrong one. The failure
                  is not greed. Searching every reading whose pieces are either
                  entries or lone characters, the fewest any of them uses is also
                  24, and exactly one reading reaches it, which is the one the
                  method found. There was no better answer available and the
                  method did not pass one by.
                </p>
                <p>
                  The failure is the list. Alvarez is a surname and an ordinary
                  word list holds no surnames, so its seven letters come back as
                  seven pieces. Dr is an abbreviation and lists hold no
                  abbreviations. The full stop, the apostrophe and the two
                  hyphens are punctuation and lists hold no punctuation. What the
                  method could find, it found; expect, the, low, cost and
                  analysis all came back whole.
                </p>
                <InAModel>
                  <p>
                    The piece count is the cost that matters, because a sequence
                    of pieces is what everything downstream reads and pays for. A
                    model that would have read this sentence in seven units reads
                    it in 24, and the eighteen lone characters carry almost no
                    information about the sentence at all. The count of
                    one-character pieces is therefore worth watching in its own
                    right, since eighteen of 24 is a report that the list covered
                    very little of what it was handed.
                  </p>
                </InAModel>
                <KeepInMind>
                  What comes back is decided by what the list holds, and on text
                  carrying a surname, an abbreviation and four punctuation marks
                  that is seven pieces out of 24. The measurement is fair to the
                  method and the test is not, since nobody built this for a
                  script that writes its spaces.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. What it costs to run">
                <p>
                  At each position the method offers at most as many candidates
                  as the longest entry in the list is long, and each candidate is
                  one lookup. So a run of n characters against a list whose
                  longest entry is L characters costs at most n multiplied by L
                  lookups, and every one of them is a membership test.
                </p>
                <Equation>{"lookups  ≤  n × L"}</Equation>
                <p>
                  Measured, our 45 characters against a list whose longest entry
                  is ten characters cost 191 lookups scanning from the left and
                  156 scanning from the right, against a bound of 450. The
                  wildlife park sentence cost nine. Those nine questions stand
                  against the 256 readings that sentence admits, and the 191
                  against 17,592,186,044,416, which is why a rule with this many
                  faults is still the thing every learned segmenter is measured
                  against.
                </p>
                <p>
                  There is one honest gap in what I can report here. The usual
                  claim about maximum matching is that it is right far more often
                  than a rule this crude deserves, on ordinary Chinese prose with
                  a real dictionary behind it. I have no annotated Chinese corpus
                  on this site to check that against, so no accuracy figure
                  appears anywhere on this page. What is measured here is what
                  the method does on texts small enough to verify by hand.
                </p>
                <KeepInMind>
                  The work is linear in the length of the text, and the method
                  answers without having looked at the whole of it. Every other
                  method in this section reads more of the text before committing
                  to anything, and each of them pays for that in a different way.
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
              "Searching every reading whose pieces are either entries or lone characters, exactly one reaches 24 and it is the one the method found. The sentence carries a surname, an abbreviation and four punctuation marks, none of which an ordinary word list holds, so seven letters of Alvarez come back as seven pieces. What the method could find it found, and expect, the, low, cost and analysis all came back whole.",
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
              "At each position the method offers at most as many candidates as the longest entry is long, and each candidate is one membership test, so a run of n characters against a list whose longest entry is L characters costs at most n times L lookups, which is 45 times 10 here. Measured, the left-to-right scan cost 191 and the right-to-left scan 156. Those few questions stand against the 17,592,186,044,416 ways the 45 characters could be cut, which is why a rule with this many faults is still what every learned segmenter is measured against.",
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
                  The two are usually called forward and backward maximum
                  matching, and it is worth resisting the idea that one of them
                  is the method and the other is a variation on it. They are the
                  same greedy discipline applied along a text that has two ends.
                  Neither has a claim on being first.
                </p>
                <KeepInMind>
                  A rule that reads a text in order has to be told which order,
                  and the problem of finding words in a line of characters does
                  not come with one.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Where the two disagree, in English">
                <p>
                  The clearest demonstration of this is in English and is the one
                  everybody uses. Take four ordinary words, run them together,
                  and hand the result to the same list of 810 words scanning each
                  way.
                </p>
                <ScanComparison scenarioKeys={["table"]} />
                <p>
                  From the left, the longest entry beginning at the start is not
                  the three-letter one. It is theta, the Greek letter, which the
                  list holds like any other word, and taking it leaves bledownthere
                  behind. That reads out as bled, own, there, all three of them
                  entries, and the answer is four pieces of four real English
                  words that nobody would write. From the right, every take is
                  the intended word and the answer is the sentence.
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
                  Two defensible answers, identical on every count you could
                  form, differing only in which end the scan started from. If a
                  rule for choosing between them is wanted, it will have to come
                  from outside the method.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. And where they disagree in Chinese">
                <p>
                  The same disagreement on the wildlife park sentence is
                  sharper, because there the two answers are not even the same
                  length. Scanning from the left gives six pieces and scanning
                  from the right gives five, and the five are what a reader
                  answers.
                </p>
                <ScanComparison scenarioKeys={["park"]} />
                <>
<p>
                  Moving from the right, the first thing the scan meets is 动物园, the word for zoo, whole. Having taken it, everything in front falls into place, and the two words that led the other scan astray never come up because the positions they begin at are never visited. The usual argument for why that happens more often than chance is about the language rather than about this sentence.
                </p>
                <p>
                  Chinese compounds tend to carry their head at the end, so a scan coming from the right meets the whole compound before it meets a fragment that begins inside it, where a scan coming from the left meets the fragment first. That is an argument about Chinese and it is not something nine characters can confirm.
                </p>
</>
                <p>
                  Which puts the usual default in an awkward position. Scanning
                  from the left is what maximum matching ordinarily means, and on
                  both texts here where the two disagree it gives the worse answer
                  while asking slightly more questions to get it, 191 against 156
                  lookups on our English sentence, nine against eight on this
                  one, twenty against eighteen on the four English words. Three
                  texts are a small sample and they point the same way on both
                  counts.
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
                  Since both scans are cheap, the obvious move is to run both and
                  keep whichever answer looks more like a segmentation. That is
                  the bidirectional heuristic, and it is worth writing its rules
                  down in full because they look like principles and are not.
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
                        "a stray character stranded on its own is usually the wreckage of a word cut in the wrong place. Also a preference, and it separates answers that rule one leaves level.",
                    },
                    {
                      expression: "3. then take the backward one",
                      reason:
                        "the head-final argument of the previous section, which is a fact about Chinese and about no other language. Where both counts tie it is the whole of the decision.",
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
                  None of the three rules is derived from anything. Across the
                  five texts this page works through, the first settles one, the
                  second settles two and the third settles two, so a convention
                  with no argument behind it outside Chinese decides two cases in
                  five.
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
                  The failure at the centre of this method is not that it
                  sometimes picks the wrong word. It is that a choice made at one
                  position determines which positions are visited afterwards, so
                  a slightly greedy take early can leave the rest of the text
                  with nothing good to do.
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
                    The measurement that makes this a failure rather than a
                    difference of opinion is the count. Searching every reading
                    of those nine characters whose pieces are entries or lone
                    characters, the fewest any of them uses is five, and two
                    readings reach five. The left-hand scan answered six. It did
                    not merely give an answer someone might disagree with; it
                    gave an answer that is worse by the crudest measure
                    available, and a shorter one was sitting there.
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
                  Greedy means the choice is never revisited, and that is the
                  whole of the trouble. The method has no way of noticing that a
                  take was expensive, because noticing would mean scoring a whole
                  reading rather than a position.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A stretch that no entry covers">
                <p>
                  The other thing the rule has to answer for is what to do when
                  nothing fits at all. There is only one available answer. Take
                  one character, call it a word, and carry on. Nobody chose that,
                  since a method whose entire vocabulary is a list has nothing
                  else it could possibly say about a character the list lacks.
                </p>
                <p>
                  Here is our own sentence contributing to the Chinese half of
                  the page. Put Alvarez in front of the sentence about the origin
                  of life, written the way Chinese writes a foreign name, and
                  hand the result to the same five-word list.
                </p>
                <ScanComparison scenarioKeys={["name"]} />
                <p>
                  The five characters of the surname come back as five separate
                  pieces, so a text a reader answers in four words comes back in
                  eight, and only three of the eight are entries. Nothing has
                  gone wrong here in the sense of the previous section; eight is
                  also the fewest pieces any reading against that list could
                  have used, and both scans reach it. The method did everything
                  it could and the answer is still five characters of noise in
                  front of three words.
                </p>
                <InAModel>
                  <p>
                    Proper names, loanwords, numbers, technical terms and
                    anything coined after the list was written all land here, and
                    in real text they are a great deal of what a reader most
                    wants to find. It is the reason the methods later in this
                    section can hand a run that nothing covered to a model that
                    guesses at its shape, instead of leaving it as one piece per
                    character.
                  </p>
                </InAModel>
                <KeepInMind>
                  A character the list has never seen becomes a word of its own.
                  That is the only thing a method built out of a list can do with
                  it, and on the eleven characters here it turns four words into
                  eight pieces.
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
                  There is no signal here to read. An answer built out of entries
                  looks the same whether the list was complete or not, so a
                  missing word is not a failure the method can report, and the
                  only way to find one is to already know the answer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="16. Nothing in the problem picks an end to start from">
                <p>
                  The rule says to take the longest entry that fits where you are
                  standing. It does not say where to stand first, and the text
                  does not say either, because a line of characters has two ends
                  and finding the words in it is not a directional question. The
                  method is therefore not one method. It is two, and they are
                  equally faithful to the rule as written.
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
                  Running both and keeping one does not close this, it only moves
                  it. Where the two answers tie on both counts, and they do tie
                  on the English text here, the answer is decided by a standing
                  preference that has no argument behind it except a
                  generalisation about the shape of Chinese words. Applied to
                  English that generalisation means nothing whatever, and it is
                  still what decides.
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
                  There is a difference between a method that can be wrong about
                  a word and a method that cannot express the word at all, and
                  this one is the second. The set of readings available to it is
                  exactly the set that can be spelled out of the list plus lone
                  characters, and a segmentation containing a word the list does
                  not hold is not a poor answer here. It is not in the space of
                  answers.
                </p>
                <p>
                  The consequence is that the method cannot tell you when it has
                  gone wrong for this reason, because being unable to represent
                  something and being unable to detect its absence are the same
                  fact. Nothing comes back as a residual or as a probability that
                  came out low, since the method computes neither. With the word
                  for zoo taken out of the list, the answer is six pieces every
                  one of which is an entry, which is exactly what a correct answer
                  looks like.
                </p>
                <>
<p>
                  There is a genuine decision attached here, and it is the one the rest of this section is made of. If every piece must be an entry, this is the only way the method can fail. If readings are scored instead, a small amount of probability can be held back for a word nobody has seen, and the method gains the ability to answer with a degree of doubt rather than with a wrong answer stated flatly.
                </p>
                <p>
                  The price is that the score has to be estimated from counts, and counts have to come from a corpus somebody segmented.
                </p>
</>
                <KeepInMind>
                  The word list is the boundary of what this method can say rather
                  than a setting inside it. Every question about coverage is
                  therefore a question about the list, and none of them is a
                  question the method can be asked.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Longest is standing in for likeliest">
                <p>
                  Underneath everything on this page is one substitution. What
                  anybody wants is the most plausible reading of the text. What
                  the method optimises is the length of the piece it is looking
                  at right now, and the two are related only by the rough
                  observation that long matches tend to be intended matches.
                </p>
                <>
<p>
                  Where they come apart the method has no defence, and it has no defence in a specific way that is worth stating. Both readings of 研究生命起源 use three pieces and both are built of real words, so length has nothing to say about them, and the arithmetic that would say something is a comparison of how often those words occur.
                </p>
                <p>
                  Both readings of the four English words use four pieces of four real words, and the same is true there. Neither tie is a coincidence. Length is a coarse quantity that takes few values, so on a short text several readings land on the same value of it and the method has run out of things to compare.
                </p>
</>
                <p>
                  That is where the next method starts. Give every entry a
                  frequency, lay out every reading the list permits rather than
                  committing at each step, and score a whole reading by the words
                  it used. Scoring a reading only by how few pieces it has
                  recovers something close to the greedy answer, so the rule on
                  this page turns out to be a particular choice of score, and the
                  ties above stop being ties.
                </p>
                <KeepInMind>
                  Taking the longest match is a heuristic standing in for taking
                  the likeliest reading, and it earns its place because the two
                  usually agree. Every failure above is a place where they came
                  apart, and the method had nothing to notice it with.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs and questions on
                  which the method stops being defined rather than becoming
                  approximate, with what has to be decided in each case and what
                  turns on the decision. The ones worth a reader&rsquo;s
                  attention are the decisions, since those are what anybody
                  setting this up has to make and nothing in the method makes
                  them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "which end the scan starts from",
                      reason:
                        "undetermined, and the two answers are equally faithful to the rule. On four English words run together they share only their last piece and are level on every count; on the wildlife park sentence they differ by a whole piece and only one of them is right. Anything reporting a segmentation has to report the direction with it.",
                    },
                    {
                      expression: "two readings with the same number of pieces",
                      reason:
                        "the method is indifferent, so no answer is more correct and a choice has to be imported. Both readings of the six characters meaning research into the origin of life use three pieces; both readings of the seventeen English characters use four, and exactly two readings of those characters reach four, so the two the scans found are the whole of the shortlist.",
                    },
                    {
                      expression: "a word the list does not hold",
                      reason:
                        "not producible, which is stronger than not found. The reading that contains it is outside the set the method can express, so there is no sense in which it was considered and rejected. A transliterated surname of five characters comes back as five pieces, and eight pieces is also the fewest any available reading uses.",
                    },
                    {
                      expression: "whether the answer is missing a word",
                      reason:
                        "unanswerable from the answer. With the word for zoo taken out of a nine-word list, both scans return six pieces every one of which is an entry, which is indistinguishable from a correct answer. Detecting the gap would mean knowing the segmentation already, so there is no diagnostic to be had from the answer itself.",
                    },
                    {
                      expression: "a stretch no entry covers",
                      reason:
                        "one piece per character, which is the only thing a method whose vocabulary is a list can do. It is not an error state and nothing marks it as different from a match, though the count of one-character pieces is a usable measurement of how much of the text the list failed to cover.",
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
                        "outside the method. Whether a Chinese compound is one word or two is unsettled in the language itself, so two annotated corpora will disagree about the same string. No accuracy figure appears anywhere above for that reason, and any that did would be a figure about one corpus rather than about the method.",
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
              "A character the list has never seen becomes a word of its own, since a method whose whole vocabulary is a list has nothing else it can say about it, so the five characters of the surname come back as five lone pieces in front of three entries. Nothing greedy went wrong in the sense of the wildlife park sentence, where a five-piece reading was available and the left-hand scan passed it by. Here the method did everything it could and the answer is still five characters of noise in front of three words, which is why the methods later in this section hand a run that nothing covered to a model that guesses at its shape.",
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
              "The wildlife park sentence is the one the first rule settles, since five pieces beat six. The sentence about the origin of life and the same sentence behind the surname both tie on pieces, and in each the left-hand reading strands 命 on its own, so the second rule keeps the right-hand answer. The four English words and our sentence with its spaces gone are level on both counts, which leaves the standing preference for the right-to-left scan to decide them. None of the three rules is derived from anything, so a convention with no argument behind it outside Chinese decides two cases in five.",
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
              "Which of the two happens is settled by where the missing word sat relative to the direction of the scan. An answer built out of entries looks the same whether the list was complete or not, so a missing word is not a failure the method can report, and the only way to find one is to already know the answer.",
            ),
            trueFalse(
              "A segmentation containing a word the list does not hold is a poor answer under this method.",
              false,
              "It is not an answer at all. The readings available are exactly those spellable out of the list plus lone characters, so such a segmentation is not in the space of answers rather than being badly scored within it. Being unable to represent something and being unable to detect its absence are the same fact, which is why nothing comes back as a residual or as a probability that came out low.",
            ),
        ],
        },
        {
          title: "Practice. Scanning the Two Sentences With the Library",
          practice: [
            exercise(
              "Scan the wildlife park sentence from both ends",
              ["Build the nine-word list from Part 2 and run the greedy rule over 我们在野生动物园玩 from the left and then from the right. Print each answer with its piece count and how many of its pieces are lone characters.", "Part 2 found six pieces scanning from the left and Part 3 found five from the right, and the five are what a reader answers. The library’s segmenter is a pre-tokenizer, so it answers with words that carry their text and their span in the sentence."],
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
              { hints: ["A word list becomes a dictionary through WordDictionary.from_words, which gives every entry a frequency of one, the honest statement that nothing beyond the list is known.", "MaximumMatchingSegmenter takes the dictionary and a direction at construction. MatchingDirection.FORWARD scans from the left and MatchingDirection.BACKWARD from the right.", "split answers a Words object. Its texts property is the pieces as strings, n_words is the count, and iterating it gives each piece with a text attribute, which is how to count the one-character ones."], check: numberCheck("How many pieces does the right-to-left scan answer?", 5, 0.5, "Moving from the right, the first thing the scan meets is the word for zoo, whole, and everything in front of it falls into place. From the left the second take is 在野 rather than 在, which moves the cursor one character too far, lets 生动 line up as an entry, and leaves three lone characters behind, six pieces in all.") },
            ),
            exercise(
              "Let the heuristic choose on the surname sentence",
              ["Part 4 put the surname in front of the sentence about the origin of life. Run the five-word list over 阿尔瓦雷斯研究生命起源 three ways, from the left, from the right and both ways with the heuristic keeping one, and print each answer with its piece count, its lone-character count and how many of its pieces the list holds.", "Both scans answer eight pieces, so the heuristic’s first rule cannot decide. The lesson says five characters of the surname come back alone; count the lone characters on each side and you will see which rule does."],
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
              { hints: ["MatchingDirection has three members, and iterating the enum visits FORWARD, BACKWARD and BIDIRECTIONAL in that order, so one loop runs all three.", "The dictionary supports the in operator, so piece.text in dictionary says whether the list holds a piece.", "A character the list lacks comes back as a word of its own, which is a one-character piece that in dictionary answers false for."], check: numberCheck("How many lone characters does the left-to-right scan leave on the surname sentence?", 6, 0.5, "The five characters of the surname come back alone whichever way the scan runs, since no entry covers them. Scanning from the left then takes 研究生, the graduate student reading, which strands 命 as a sixth. From the right the scan takes 生命 whole and leaves five, so the two answers tie at eight pieces and the heuristic’s second rule, fewer lone characters, keeps the right-to-left answer.") },
            ),
            exercise(
              "Take the word for zoo out of the list",
              ["Part 4 removes 动物园 from the nine-word list and runs both scans on the wildlife park sentence again. Do the same, and for each scan print the pieces and how many of them are entries of the shortened list.", "The right-to-left scan was the one that got the sentence right. Without the word for zoo it has nothing whole to meet at the end, and what it answers instead carries no mark that anything is missing."],
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
              { hints: ["The shortened list is an ordinary dictionary built from eight words, so the segmenter is constructed exactly as before.", "Counting entries is piece.text in shortened over the pieces, and a count equal to the piece count means every piece is an entry."], check: numberCheck("How many of the right-to-left scan’s pieces are entries once the word for zoo is gone?", 6, 0.5, "Without 动物园 the scan from the right has nothing whole to take at the end, so it takes 园, then 物, and from there the same two false words the left-hand scan fell for, ending in the identical six pieces. Every one of them is an entry, which is exactly what a correct answer looks like, and that is why a missing word is not a failure the method can report.") },
            ),
            exercise(
              "Try to match across a space",
              ["Part 1 says whitespace ends a run before any matching begins, so a list holding thecat as an entry will not produce it from the two words the cat. Build that list, split the cat and then thecat, and print every piece with the span it was cut from.", "Each word the segmenter answers carries a start and an end offset into the text it came from, so the second piece of the cat should begin after the space rather than at the fourth character."],
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
              { hints: ["The direction defaults to scanning from the left, so a segmenter built from the dictionary alone is the forward one.", "Iterating the Words object gives Word objects, each with text, start and end attributes. The span is half open, so text[start:end] is the slice the piece came from."], check: numberCheck("At what offset does the piece cat start in the text the cat?", 4, 0.5, "The space at offset 3 closed the first run before any lookup happened, so the longest entry beginning at offset 0 could only be sought inside the, and cat is found in a second run that starts at offset 4. Handed thecat with no space, the same list produces the six-letter entry whole, since now nothing closes the run.") },
            ),
          ],
        },
      ]}
    />
  );
}
