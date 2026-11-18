import { pageMetadata } from "@/lib/seo";
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
import { BoundaryCostPanel } from "@/components/widgets/BoundaryCostPanel";
import { CharacterClassStrip } from "@/components/widgets/CharacterClassStrip";
import { MarkBetweenTable } from "@/components/widgets/MarkBetweenTable";
import { ScriptCoveragePanel } from "@/components/widgets/ScriptCoveragePanel";
import { WordBreakPlayground } from "@/components/widgets/WordBreakPlayground";

export const metadata: Metadata = pageMetadata("/concepts/unicode-word-boundaries", {
  title: "Unicode Word Boundaries · Perceptron Lab",
  description:
    "Writing systems use different kinds of characters and boundary conventions. Unicode information supports more general splitting rules than English letters and spaces alone, while some language-specific boundaries still need other methods.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function UnicodeWordBoundariesPage() {
  return (
    <ConceptPage
      lessonId="unicode-word-boundaries"
      intuition={lessonIntuitions["unicode-word-boundaries"]}
      technicalStart="Part 2. The Classes"
      openingTitle="Spaces Are Only One Clue to a Word Boundary"
      playgroundTitle="Where should this text be split?"
      playgroundIntro="Inspect the character classes on either side of a proposed break. Compare the resulting segments with a whitespace split of the same text."
      title="Unicode Word Boundaries"
      tagline={"Writing systems use different kinds of characters and boundary conventions. Unicode information supports more general splitting rules than English letters and spaces alone, while some language-specific boundaries still need other methods."}
      prerequisites={
        <>
          The{" "}
          <Link href="/concepts/splitting-on-spaces" className={link}>
            splitting on spaces
          </Link>{" "}
          page, which measures the rule this one repairs and introduces the six
          sentences both pages count over. Nothing else. The rules here read
          characters and nothing else, so no model, no corpus and no fitting step
          appears anywhere on this page.
        </>
      }

      playground={<WordBreakPlayground />}
      sections={[
        {
          title: "Part 1. The Assumption Behind a Space",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What a space assumes, and the writing it fails on">
                <p>
                  A space can mark a word boundary, but punctuation can also separate useful units and some writing contains no spaces between words. We need a rule whose decisions can be inspected one character at a time.
                </p>
                <p>
                  We will reuse the Dr. Alvarez sentence to compare that rule with splitting at whitespace. A second example without spaces will show where the familiar cue stops helping.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  Splitting this sentence at runs of white space gives seven plausible pieces. That works because the writer put gaps where the words separate. Other writing systems do not use spaces that way. We need to examine what a boundary rule can infer from characters when that convenient clue is absent.
                </p>
                <p>
                  Here is the same rule on eleven characters of Japanese, which
                  hold what a reader of Japanese would call several words. There
                  is no white space anywhere in them, so there is exactly one
                  maximal run of non-space characters and the answer is one piece
                  holding the whole sentence. The rule reports no difficulty,
                  because from inside the rule there is none. It was asked where
                  the gaps are and it correctly answered that there are none.
                </p>
                <NumberTable
                  headings={["text", "characters", "pieces at every run of spaces"]}
                  rows={[
                    ["the sentence about Dr. Alvarez", "51", "7"],
                    ["eleven characters of Japanese", "11", "1"],
                    ["nine characters of Chinese", "9", "1"],
                    ["seven characters of Thai", "7", "1"],
                  ]}
                  caption="Whitespace splitting returns one uninterrupted piece for each unspaced example. Section 10 compares those outputs with this Unicode-based implementation."
                />
                <KeepInMind>
                  {"A broader boundary rule can use character properties as well as spaces. Unicode supplies a default convention intended for many kinds of text. It is a starting point that applications can tailor, rather than a complete word analysis for every language."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What it means for a standards body to say where a word breaks">
                <p>

                  A committee cannot answer &ldquo;what is a word&rdquo; for
                  every language, and the Unicode word boundary rules do not try.
                  They answer a narrower question that turns out to be answerable.
                  Between any two neighboring characters of a text there is a
                  position, and the rules say, for that position, whether a word
                  is allowed to end there. Nothing more.
                </p>
                <>
<p>
                  {"The method uses character properties and ordered rules. Properties classify letters, digits, joining marks and other units. Rules inspect those classes around a proposed boundary, sometimes looking beyond the two immediately adjacent characters. This SDK approximates the property mapping; later examples show where that approximation matters."}
                </p>
                <p>
                  The rules are tried in their published order, the first that applies decides, and the last one applies to everything.
                </p>
</>
                <Equation>{"a nonempty text of n characters has n − 1 internal boundary positions\neach decision inspects the surrounding character classes and rule context\nthe answer is the first numbered rule that matches that context"}</Equation>
                <p>
                  {"Rule order resolves cases where several descriptions could apply, so no numerical score or learned tie-break is needed. We make a decision at each boundary. Efficient implementations can track the context as they scan; the simple SDK implementation sometimes scans backward through ignored marks, so its runtime is not always one constant amount of work per boundary."}
                </p>
                <KeepInMind>
                  The Unicode rules identify boundary positions using character properties. They do not promise a linguistic analysis of every word. We will see both what these rules handle and where a language-specific method is still needed.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Compare space cuts with Unicode boundaries in the Alvarez sentence" id="3-the-running-sentence-under-both-rules">
                <p>
                  These boundary rules return nine segments where whitespace splitting returned seven. Compare both results with the sentence in the playground. The changed treatment of punctuation and internal boundaries gives us specific cases to investigate.
                </p>
                <WorkedExample title="Nine words, and where each came from">
                  <Equation>
                    {"Dr             [0, 2)\n" +
                      "Alvarez        [4, 11)\n" +
                      "didn't         [12, 18)\n" +
                      "expect         [19, 25)\n" +
                      "the            [26, 29)\n" +
                      "low            [30, 33)\n" +
                      "cost           [34, 38)\n" +
                      "re             [39, 41)\n" +
                      "analysis       [42, 50)"}
                  </Equation>
                  <p>
                    The full stop after{" "}
                    <span className="font-mono">Dr</span> is gone, and so is the
                    one that ends the sentence, since neither is inside any of
                    the nine spans. The hyphen in{" "}
                    <span className="font-mono">low-cost</span> separated the two
                    halves and the hyphen in{" "}
                    <span className="font-mono">re-analysis</span> did the same.
                    The apostrophe in{" "}
                    <span className="font-mono">didn&rsquo;t</span> did not, and
                    that is the one to keep hold of, because an apostrophe and a
                    hyphen are both a mark standing between two letters and only
                    one of them ended a word.
                  </p>
                </WorkedExample>
                <p>
                  The nine words hold 41 of the sentence&rsquo;s 51 characters
                  between them, where the seven pieces of the space rule held 45.
                  The ten characters in no word at all are the six spaces, both
                  hyphens and both full stops. Section 14 measures the same
                  difference over all six sentences.
                </p>
                <KeepInMind>
                  Nine words against seven, and the disagreement is entirely
                  about four characters, two hyphens and two stops. Which of the
                  two answers is right is a question the rules cannot settle and
                  section 16 faces.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. One position at a time">
                <p>
                  The whole algorithm is small enough to run by hand, and running
                  it once is worth more than reading about it. Take{" "}
                  <span className="font-mono">can&rsquo;t stop</span>, ten
                  characters, so nine positions to ask about.
                </p>
                <Equation>
                  {"c  a  n  '  t     s  t  o  p\n" +
                    "0  1  2  3  4  5  6  7  8  9"}
                </Equation>
                <DerivationTable
                  expressionHeading="position"
                  reasonHeading="the classes there, and what the first matching rule says"
                  rows={[
                    {
                      expression: "1, 2",
                      reason:
                        "a letter on each side, which the rule for two letters keeps together, so no break.",
                    },
                    {
                      expression: "3",
                      reason:
                        "a letter, then an apostrophe with a letter after it. The rule for a letter reaching across one mark to another letter keeps it, so no break.",
                    },
                    {
                      expression: "4",
                      reason:
                        "the mirror of the position before it, a letter before the apostrophe and a letter here, kept by the matching rule, so no break.",
                    },
                    {
                      expression: "5",
                      reason:
                        "a letter and then a space, which no rule mentions, so the catch-all applies and the word ends.",
                    },
                    {
                      expression: "6",
                      reason:
                        "a space and then a letter, which no rule mentions either, so the catch-all applies again and a word begins.",
                    },
                    {
                      expression: "7, 8, 9",
                      reason:
                        "two letters each time, kept, so the second word runs to the end of the text.",
                    },
                  ]}
                />
                <p>
                  Three segments come out of that,{" "}
                  <span className="font-mono">can&rsquo;t</span> across positions
                  0 to 5, the space on its own, and{" "}
                  <span className="font-mono">stop</span> to the end. Notice that
                  the space is a segment. The rules cut the text into stretches
                  and every character of the text lands in exactly one of them,
                  which is why the segments always reproduce the text when joined
                  and why deciding which of them are words is a separate step.
                  Section 12 is about that step.
                </p>
                <WhyThisWorks title="Why the catch-all breaks rather than joins">
                  <>
<p>
                  {"The final rule breaks wherever an earlier rule has not kept or separated a boundary. That gives the specification a defined default without listing every possible pair separately. Earlier rules handle particular contexts, including letters across certain punctuation and paired regional indicators."}
                </p>
                  <p>
                  {"A code point assigned no special joining behavior falls through to the default break. That supplies a defined boundary, but it does not establish that separating it is better for every task. New Unicode properties may also require an updated data table."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"The rules produce segments that tile the source. Filtering those segments into a word-only result is a separate operation and can discard punctuation or whitespace. A decision per boundary does not itself guarantee linear runtime in this teaching implementation."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Questions on Part 1",
          quiz: [
            choice(
              "What do the Unicode word boundary rules define?",
              [
                "Whether a word is allowed to end at a position between two neighboring characters",
                "What a word is in each language the standard covers",
                "Which of the resulting stretches count as words",
                "A score for each candidate boundary, with ties broken by rule order",
              ],
              0,
              "The boundary rules decide where a sequence may be divided into segments. The tokenizer then applies its word-only filter to choose which segments to return. That filter is why complete segmentation and returned word count can differ, even when the same boundaries were used.",
            ),
            trueFalse(
              "When several boundary rules could match a position, this implementation leaves their conflict unresolved.",
              false,
              "The rules are applied in order, and the first matching rule decides the boundary. Overlapping conditions therefore have a defined outcome. There is no learned score or later vote among matching rules.",
            ),
            choice(
              "Why does the last rule in the list break rather than join?",
              [
                "Because then only the pairs that must be held together need naming, and there are around a dozen of those",
                "Because breaking is the more common answer on ordinary English",
                "Because a joining catch-all would conflict with the rules above it",
                "Because the standard has no class for an unfamiliar character",
              ],
              0,
              "The catch-all supplies a boundary when no earlier rule joins the surrounding classes. This lets the rule list state specific joining patterns without listing every possible separated pair. It is a default policy; whether its output is useful for an unfamiliar script still needs to be checked.",
            ),
            several(
              "The sentence about Dr. Alvarez gives nine words to the boundary rules and seven pieces to the space rule. Which of these are true of the difference?",
              [
                "The hyphens in low-cost and in re-analysis both ended a word",
                "The apostrophe in didn’t did not end a word",
                "The nine words hold more of the sentence’s 51 characters than the seven pieces did",
                "The disagreement is about the six spaces",
              ],
              [0, 1],
              "The disagreement is entirely about four characters, the two hyphens and the two full stops, and the spaces are not among them, since both rules leave every space outside every word. An apostrophe and a hyphen are both a mark standing between two letters, and only one of them ended a word, which is a fact about the class each was put in. The nine words hold 41 of the 51 characters where the seven pieces held 45, because a mark that is not part of a word is not returned as one, so the longer answer holds less of the writing.",
            ),
            trueFalse(
              "Put can’t stop to the rules and three segments come out, and the space between the two words is one of them.",
              true,
              "The rules cut the text into stretches and every character lands in exactly one of them, so the space has to be a segment of its own. Positions 5 and 6 are both decided by the catch-all, which breaks on either side of it, where the apostrophe at position 3 is kept inside can’t by the rule for a letter reaching across one mark to another letter. That the segments tile the text is why joining them always reproduces it, and why deciding which of them are words is a separate step.",
            ),
        ],
        },
        {
          title: "Part 2. The Classes",
          content: (
            <>
              <SubSection title="5. Eighteen classes, and the seven that six sentences reach">
                <>
<p>
                  {"This SDK uses eighteen class names. Some identify letters, digits, spaces or line endings; others distinguish marks whose joining behavior depends on context. These are the implementation’s categories, not a claim that every Unicode version or library exposes exactly this same table."}
                </p>
                <p>
                  The interesting ones describe what a character is allowed to do, so there is a class for marks that may stand between two letters, another for marks that may stand between two digits, and another for marks that may do either.
                </p>
</>
                <p>
                  The rule set uses eighteen classes, but not every class appears in every input. Across the six shared sentences, all 375 characters fall into seven of them. That count explains which parts of the rule our English fixture exercises; it leaves the other classes untested rather than showing that they are unnecessary.
                </p>
                <NumberTable
                  headings={["class", "characters", "which characters those are"]}
                  rows={[
                    ["a letter", "298", "every letter of the six sentences"],
                    ["a space", "57", "every space"],
                    [
                      "may stand between two letters or two digits",
                      "7",
                      "the seven full stops",
                    ],
                    ["none of the above", "6", "the six hyphens"],
                    ["a digit", "4", "the four digits of 2019"],
                    ["may stand between two digits", "2", "the two commas"],
                    ["an apostrophe", "1", "the apostrophe in didn’t"],
                  ]}
                  caption="Every character of the six sentences, by class. Seven classes of the eighteen, and the other eleven exist for writing this corpus does not contain."
                />
                <>
<p>
                  The eleven that never turn up are the point of the exercise rather than an inefficiency. They are there for Hebrew and katakana, for the marks that combine with the letter before them and the invisible formatting characters, for the halves of a flag and the ends of lines, and for three joining marks these six sentences happen never to use, a quotation mark, a colon and a low line.
                </p>
                <p>
                  {"Testing only these seven classes would leave the other cases unchecked. A later input could introduce an unseen class in English or another language, so passing this small corpus does not establish complete boundary behavior."}
                </p>
</>
                <KeepInMind>
                  {"Grouping code points by class lets the rules apply to many characters without naming each one. The property mapping and the contextual rules both matter, and this SDK’s approximations limit how closely it matches a complete implementation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Every character of a short text, with its class">
                <p>
                  The first eighteen characters of the sentence about Dr. Alvarez, each
                  with the class it was given and a mark wherever a word ended.
                  This is the whole machinery, and there is nothing behind it.
                </p>
                <CharacterClassStrip />
                <p>
                  Read the run of letters from position 4 to position 10 and the
                  reason the rules never look at those characters individually is
                  visible. Seven characters, one class, and the same rule applied
                  six times. Every one of the five boundaries the rules found
                  sits where the class changes, and the apostrophe at position 16
                  is a change of class where no word ended, which is what the
                  next section is about.
                </p>
                <p>The Unicode standard publishes word-break properties in its data files. This teaching implementation instead derives classes from general character categories and selected lists in the annex. That approximation can assign an unfamiliar character differently from a complete implementation. The limitation belongs to this implementation’s coverage, rather than to the standard’s boundary method.</p>
                <KeepInMind>
                  {"The output depends on both the character classes and the rules that inspect their context. Changing a mark’s class can alter a boundary, but the surrounding letters, digits or other marks still matter."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. One mark between two letters, and the same mark between two digits">
                <p>Place each of twelve marks between a and b, then between 1 and 2. Comparing those contexts shows how the assigned classes interact with their neighboring characters.</p>
                <MarkBetweenTable />
                <p>A colon joins the letters in <span className="font-mono">a:b</span> but separates the digits in <span className="font-mono">12:30</span>. A comma does the reverse for <span className="font-mono">a,b</span> and <span className="font-mono">1,000</span>. The middle dot follows the colon because it has the same relevant boundary class.</p>
<p>The character’s class stays fixed. The joining rules inspect that class together with the classes around it, which is why changing letters to digits can change the boundary.</p>
                <p>The hyphen and underscore are both punctuation, but these rules assign them different joining behavior. The underscore can connect neighboring letters and digits, keeping <span className="font-mono">snake_case_name</span> whole. The hyphen separates the surrounding runs. A narrow no-break space can also join the numeric groups here, even though the whitespace tokenizer treats it as a separator.</p>
                <InAModel>
                  <p>
                    Those two rows are why a file name comes apart under these
                    rules while a variable name does not. Reading{" "}
                    <span className="font-mono">re-analysis_2019.csv</span> gives
                    three words, since the hyphen and the last stop separate and
                    the low line does not, and{" "}
                    <span className="font-mono">analysis_2019</span> survives in
                    the middle of it. Nothing about that is a mistake in the
                    rules. It is what happens when a rule designed for prose is
                    pointed at a string that was written for a file system.
                  </p>
                </InAModel>
                <KeepInMind>
                  {"To predict a boundary, inspect the classes around it and the matching rule. The same mark can join letters in one context and separate digits in another. Its appearance or name alone is not enough."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The characters the rules make invisible first">
                <p>
                  {"Some rules ignore combining marks and formatting characters while examining surrounding context. Ignoring them for that decision does not delete them from the segment. Start-of-text and newline cases have exceptions, so this is not a separate preprocessing pass applied unconditionally before every rule."}
                </p>
                <p>
                  The reason is that one word can be written two ways. The word{" "}
                  <span className="font-mono">r&eacute;sum&eacute;</span> can be
                  six characters, each accented letter a character of its own, or
                  eight, each accent a separate combining mark following its
                  letter. Both are the same word and a reader cannot tell them
                  apart on the page. Put both to the rules and both come back as
                  one word, and they do so because the two marks in the second
                  spelling were made invisible before the rule for two letters
                  was asked anything.
                </p>
                <WhyThisWorks title="Why hiding beats listing">
                  <>
<p>
                  {"Rules can treat a run of ignored marks as transparent when they compare the relevant neighbors. That avoids spelling out every possible number of intervening marks in each letter or numeric rule. The marks remain in the returned source span."}
                </p>
                  <p>
                  {"This implementation repeatedly looks backward through ignored marks. Long runs can therefore make the work grow quadratically in the run length. Tracking the previous relevant position is one way to avoid repeating that scan. Ordinary short examples may hide the cost, so do not infer a runtime bound from them."}
                </p>
</>
                </WhyThisWorks>
                <>
<p>
                  Our simplified implementation mishandles the zero-width joiner in some emoji sequences. The Unicode word-boundary rules give it special treatment, while this implementation treats it like ordinary ignored formatting. It attaches to the preceding emoji and allows a break after it, returning two segments for a joined sequence. This is an implementation limitation, not a claim about the full standard.
                </p>
                <p>
                  {"The joined-emoji discrepancy involves the simplified class mapping and special handling that the complete rules provide for zero-width joiners. Compare this implementation with the specified version before treating its output as the standard’s exact behavior."}
                </p>
</>
                <KeepInMind>
                  {"Both spellings of résumé remain one word even though they use six and eight code points. Ignoring combining marks for boundary decisions explains that agreement. The joined-emoji example shows why ignoring every format character in the same way is insufficient."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 2",
          quiz: [
            choice(
              "A colon holds a:b together and separates 12:30, while a comma separates a,b and holds 1,000 together. What does that show?",
              [
                "Each answer is one general rule about a class, applied to a character somebody put in that class",
                "The rules carry a special case for times and another for thousands groups",
                "A colon joins letters and a comma joins digits because of what the two marks mean",
                "The rules look at the characters on either side individually rather than at their classes",
              ],
              0,
              "There is a class for marks that may stand between two letters and another for marks that may stand between two digits, and a mark is in one, both or neither. Neither answer is a rule about the colon or about the comma, which is the whole argument for having classes at all.",
            ),
            choice(
              "Why does snake_case_name come back as one word while low-cost comes back as two?",
              [
                "The low line is in the class that joins whatever it finds on both sides, and the hyphen is in none of the joining classes",
                "A low line is not punctuation and a hyphen is",
                "The rules carry a clause for identifiers written in code",
                "A low line has no white space around it",
              ],
              0,
              "The underscore belongs to a connector class that can join the surrounding letters and digits. The hyphen does not receive that joining behavior under these default rules. Their broad punctuation role is not enough to predict the result; the assigned classes and ordered rules determine the cuts.",
            ),
            choice(
              "Seven classes account for every character in the six sentences. What does the page say about the eleven that never turn up?",
              [
                "They are the point of the exercise, since a rule written for the seven would look complete here and be wrong on the first document that was not in English",
                "They are an inefficiency the standard could drop",
                "They are reserved for scripts the standard has not yet added",
                "They matter only once the marks are kept rather than dropped",
              ],
              0,
              "The eleven are there for Hebrew and katakana, for combining marks and invisible formatting characters, for the halves of a flag and the ends of lines, and for three joining marks these sentences happen never to use. Covering what a corpus does not contain is what lets the same dozen rules run on writing nobody tested them on.",
            ),
            choice(
              "In the first eighteen characters of the sentence about Dr. Alvarez every boundary the rules found sits where the class changes, and the apostrophe at position 16 is a change of class where no word ended. Why did no word end there?",
              [
                "A letter stands on each side of it, so the rule for a letter reaching across one mark to another letter applies before the catch-all is reached",
                "An apostrophe is placed in the letter class, so the class does not change there",
                "The apostrophe is hidden before any other rule runs, as a combining mark is",
                "No space stands next to it, and the rules break only at spaces",
              ],
              0,
              "A change of class is where a boundary can be, since two letters are always kept together, but it is the rules that decide whether one is. The apostrophe has a class of its own, so the class does change at position 16, and the rule for a letter reaching across a mark to a letter is tried before the catch-all and keeps the two sides together. Hiding is done for combining marks and invisible formatting characters only, which is section 8, and the rules break at a great deal more than spaces, since both hyphens of the sentence ended a word.",
            ),
            several(
              "Which of these follow from hiding combining marks and invisible formatting characters before any other rule runs?",
              [
                "Both spellings of résumé, six characters and eight, come back as one word",
                "Each decision has to look back over a run of hidden characters to find its real neighbor",
                "The dozen rules underneath can be stated about the characters a reader sees",
                "Two emoji joined by the character that joins them come back as one segment",
              ],
              [0, 1, 2],
              "Hiding the marks once, at the start, is the alternative to writing every rule again for a run of marks in the middle and a third time for two runs. The joining character between two emoji is treated as ordinary invisible formatting here, so it is absorbed and the sequence breaks after it, which is a real difference from a complete implementation and sits on the classes rather than on the rules.",
            ),
        ],
        },
        {
          title: "Part 3. What the Rules Buy Over a Space",
          content: (
            <>
              <SubSection title="9. Punctuation stops riding on the word in front of it">
                <p>
                  {"Whitespace splitting keeps attached punctuation inside its runs. The Unicode-based rule can instead separate marks that lack a joining role in their context. In the word-only output, those punctuation segments are then omitted. Separating and omitting are distinct decisions."}
                </p>
                <BoundaryCostPanel />
                <p>
                  Read the two lists underneath the table. Every entry on the
                  left is an entry on the right with something taken off it,{" "}
                  <span className="font-mono">away</span> against{" "}
                  <span className="font-mono">away.</span>,{" "}
                  <span className="font-mono">2019</span> against{" "}
                  <span className="font-mono">2019,</span>,{" "}
                  <span className="font-mono">low</span> and{" "}
                  <span className="font-mono">cost</span> against{" "}
                  <span className="font-mono">low-cost</span>. The two rules
                  agree about 35 of the 47 entries and disagree about 12 in each
                  direction, and the 12 are the whole of what these rules are
                  for.
                </p>
                <p>Both rules produce 47 distinct entries in these six sentences, although they use different spellings. The whitespace table contains both <span className="font-mono">re-analysis</span> and <span className="font-mono">re-analysis.</span>; removing attached punctuation can let such variants share entries.</p>
<p>Other cuts create new entries for compound parts and punctuation policies remove others. Those changes balance here. A larger corpus may repeat more variants, but its vocabulary saving still depends on which spellings and components occur.</p>
                <KeepInMind>
                  On this corpus the repair is visible in which entries the two
                  rules hold rather than in how many, since exactly one word
                  appears here in two spellings. The table size argument needs a
                  corpus where that happens often, and six sentences is not one.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. A script that puts nothing between its words">
                <p>
                  This example marks a limit of the default boundary rules. They provide consistent boundaries based on the character classes, but the annex does not claim that those boundaries supply complete Chinese word segmentation. A language-specific segmenter needs further evidence about which adjacent characters belong to the same word.
                </p>
                <ScriptCoveragePanel />
                <>
<p>
                  Read the Japanese sentence first, because it is the informative one. Eleven characters, mixing three scripts, and the rules give seven words where the space rule gives one. The five katakana characters at the front are held together into one word, correctly, because katakana has a class of its own and a rule that joins it to itself.
                </p>
                <p>
                  Everything after them is one word per character, because the standard deliberately leaves the kanji and the hiragana out of the letter class. Some of that answer is right and some of it is a placeholder, and the rules make no distinction between the two.
                </p>
</>
                <p>
                  Chinese and Thai are the placeholder alone. Nine Chinese
                  characters become nine words where a reader sees four, and
                  seven Thai characters become seven. Korean is the control and
                  shows this is a decision rather than an inability, since Korean
                  is written with spaces and the annex keeps its syllables in the
                  letter class, so the rules find the same two words there that
                  the space rule finds.
                </p>
                <WhyThisWorks title="Why cutting everywhere is the better failure">
                  <>
<p>
                  {"Character-by-character boundaries give a later segmenter smaller units to combine. One uninterrupted run can also be segmented later. Neither output alone establishes word boundaries, and a vocabulary can contain a multi-character run. Choose the representation the next stage expects rather than treating either shape as an automatic failure signal."}
                </p>
                  <p>
                  {"For the word task in these examples, we need additional language-specific evidence, such as a dictionary or learned boundaries. The default output can be used as input to that procedure, but the procedure still needs its own validation."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"These defaults provide defined boundaries on unspaced input. They do not certify complete word segmentation. A caller needs to know that limitation; a list of single-character pieces is not itself an error flag."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. A space inside a word, and a word with no letters in it">
                <p>
                  Two of the rows in that panel are not about scripts at all, and
                  they are the sharpest demonstration that the rules are reading
                  something other than the gaps. A French thousands group is
                  written with a narrow no-break space, which is white space by
                  every ordinary test, so the space rule cuts{" "}
                  <span className="font-mono">1 000 sensors</span> into three
                  pieces and reports one number as two. The boundary rules put
                  that character in the class that joins what it finds on both
                  sides, so the number stays whole and the answer is two words.
                </p>
                <>
<p>
                  {"The displayed regional flags each use two regional-indicator code points. A rule pairs those indicators, so two such flags form two segments rather than one uninterrupted run. Other flag emoji, including tag-based flags, use different sequences."}
                </p>
                <p>
                  {"The SDK’s word-only filter discards both displayed flag segments because they contain neither a letter nor a number. The boundary and filter operations have different purposes: the first finds segments, and the second selects which ones this caller wants to count as words."}
                </p>
</>
                <KeepInMind>
                  A character called a space that does not end a word, and a
                  boundary found correctly around something that is then not
                  counted as a word. Both come from the same source, which is
                  that these rules read a character&rsquo;s class and never its
                  appearance or its name.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Words, or every segment">
                <p>
                  The rules divide the text into segments that cover it completely. We still need to decide which segments count as words for our task. On the sentence about Dr. Alvarez, the rules return 19 segments. Nine contain a letter or digit; those are the nine we counted as words in section 3. The remaining segments are six spaces, two hyphens and two full stops. Let&apos;s compare the complete segmentation with the word-only result.
                </p>
                <NumberTable
                  headings={[
                    "what is kept",
                    "the sentence about Dr. Alvarez",
                    "the six sentences",
                  ]}
                  rows={[
                    ["every segment, spacing included", "19", "141"],
                    ["everything that is not spacing", "13", "84"],
                    ["only what holds a letter or a digit", "9", "69"],
                  ]}
                  caption="The same segmentation, filtered three ways. The middle row keeps non-whitespace segments, including the punctuation segments in this sentence. Other mark sequences can have joining rules."
                />
                <p>
                  Keeping the marks costs 15 more pieces on the six sentences and
                  buys back everything the segments held, so the text can be
                  reproduced from the pieces and the spacing. Dropping them is
                  the usual choice and it is the one measured everywhere else on
                  this page. What matters is that the choice sits outside the
                  rules, which is why two implementations of the same standard
                  can hand you different answers without either having got the
                  standard wrong.
                </p>
                <KeepInMind>
                  The rules produce segments and a separate decision produces
                  words. Anyone comparing two tools that both claim to implement
                  this standard should check which of the three readings above
                  each of them is doing before concluding that they disagree.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What It Costs",
          content: (
            <>
              <SubSection title="13. More pieces, and everything downstream pays per piece">
                <p>
                  {"On these six sentences, the word-only boundary result has 69 pieces compared with 63 whitespace pieces. A model that processes one position per piece receives a longer sequence. Dense all-position attention has quadratic pair counts within a sequence; total runtime also depends on the other operations and how the text is grouped."}
                </p>
                <InAModel>
                  <p>
                  {"The difference is small in absolute terms here, but its impact on a large dataset depends on how often the same patterns recur. Compare sequence lengths and vocabulary entries on representative text. Neither measure necessarily moves in the opposite direction to the other."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The supplied corpus gives 63 whitespace pieces and 69 word-only Unicode pieces. These are counts for this representation, not a measured model runtime."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Characters that end up in no word at all">
                <p>
                  The second bill is the writing itself. Adding up the spans says
                  how much of a text survived into a word, and the boundary rules
                  keep less of it than the space rule does, because a mark that is
                  not part of a word is not returned as one.
                </p>
                <NumberTable
                  headings={[
                    "measured over the same writing",
                    "cut at every boundary",
                    "cut at every run of spaces",
                  ]}
                  rows={[
                    ["characters of the sentence about Dr. Alvarez, of 51", "41", "45"],
                    ["characters of the six sentences, of 375", "303", "318"],
                    ["share of the writing kept", "80.8%", "84.8%"],
                    ["the words glued back give the sentence", "no", "yes"],
                  ]}
                  caption="The same two rules on the same texts. The rule that keeps more of the writing is the one that cannot separate a comma from a word."
                />
                <p>
                  Gluing the nine words back with single spaces gives{" "}
                  <span className="font-mono">
                    Dr Alvarez didn&rsquo;t expect the low cost re analysis
                  </span>
                  , which is a line with the abbreviation&rsquo;s stop gone, both
                  compounds pulled apart and the sentence&rsquo;s own full stop
                  missing. The space rule&rsquo;s seven pieces glue back exactly.
                  This word-only output omits punctuation. An application that needs the reader’s original text must retain it elsewhere.
                  </p>
                <p>
                  The loss is recoverable while the source is still in hand,
                  because every word carries the offsets it came from and the
                  characters between one word and the next are still there to be
                  read. It is not recoverable from a list of words, which is what
                  most things downstream are given.
                </p>
                <KeepInMind>
                  {"The two word-only outputs retain 80.8 percent and 84.8 percent of this corpus’s source characters. Those percentages measure coverage, not agreement with intended words. The Chinese example demonstrates the distinction: one unsegmented piece can retain every character."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where splitting on spaces is the better rule">
                <>
<p>
                  {"If an application wants an address or file name as one unit, the whitespace output may fit that requirement better. In the shown address, word-only filtering leaves 18 of 19 characters. The file name becomes three pieces. Those outcomes need a task decision rather than a universal ranking of the rules."}
                </p>
                <p>
                  A text holding a single approving hand and nothing else comes back as no words at all, because the rules found the segment correctly and then the word test refused it for holding no letter and no digit.
                </p>
</>
                <p>
                  {"Addresses, paths and emoji also occur inside ordinary prose. A caller may want them preserved as whole units even while splitting surrounding words. The whitespace rule retains any uninterrupted run; a tailored tokenizer can protect selected spans or keep the complete segmentation."}
                </p>
                <KeepInMind>
                  {"For tasks involving addresses, paths or emoji, compare the complete segments with the word-only result. Keeping non-whitespace segments, protecting special spans or applying tailored rules are possible choices. The default word filter may otherwise drop a segment the application needs."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Rules Stop Being Defined",
          content: (
            <>
              <SubSection title="16. The standard says where a word may break, and leaves what a word is open">
                <p>
                  It is easy to read a standard with the word &ldquo;word&rdquo;
                  in the title as having settled what a word is, and this one
                  does not, on purpose. What it fixes is a set of positions at
                  which a break is permitted. Which of the resulting stretches
                  count as words, whether the marks are kept, and whether the
                  rules should be adjusted for a particular language are all
                  outside it, and the annex says as much by calling its own rules
                  a default and inviting tailoring.
                </p>
                <p>The two rules share 35 of their 47 vocabulary spellings and differ on 12 each. Whether <span className="font-mono">low-cost</span> should be one retrieval unit or two depends on the application’s task.</p>
<p>Programs using the same boundary version and settings can agree on the cuts. Other programs may tailor them, including for text selection. Conformance to a shared convention and usefulness for a particular language or search task are separate checks.</p>
                <KeepInMind>
                  {"Check both the boundary specification and the application’s filtering or tailoring. Programs can disagree because one implements the standard differently, or because they make different documented choices around it. Both kinds of difference deserve investigation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. It reads characters, so an abbreviation is beyond it">
                <p>
                  {"These default rules do not consult an abbreviation dictionary or infer sentence roles. The running sentence shows a period after an abbreviation and one at the sentence end. The example below makes their character contexts easier to compare."}
                </p>
                <WorkedExample title="The same character, three appearances, two answers">
                  <Equation>
                    {"The U.S. sensors arrived.\n\n" +
                      "the stop inside U.S.       kept, a letter stands on each side\n" +
                      "the stop closing U.S.      dropped, a space follows it\n" +
                      "the stop ending the line   dropped, nothing follows it"}
                  </Equation>
                  <p>
                    The stop inside{" "}
                    <span className="font-mono">U.S.</span> has a letter on each
                    side, so the rule for a letter reaching across a mark keeps
                    it and the word survives as{" "}
                    <span className="font-mono">U.S</span>. The stop that closes
                    the abbreviation has a space after it rather than a letter,
                    so the same rule does not apply and it is separated. The stop
                    that ends the sentence is separated too, by the same
                    reasoning, and the two are indistinguishable to the rules
                    because neither has a following letter for the relevant joining rule.
                  </p>
                </WorkedExample>
                <p>
                  {"Abbreviation knowledge can support a tailored rule. A separate sentence-boundary annotation can also mark a period that belongs to an abbreviation. One nonoverlapping token split need not carry every annotation by itself, so keeping both roles does not require an unavoidable loss."}
                </p>
                <KeepInMind>
                  These default class rules do not consult abbreviation knowledge. The period after {" "}
                  <span className="font-mono">Dr</span>  is separated because its joining context does not match. The Chinese character-level output is a different limitation: it does not supply complete linguistic word segmentation.</KeepInMind>
              </SubSection>

              <SubSection title="18. The scripts the standard declines by name">
                <p>
                  {"The annex explicitly limits the default rules for several languages without routine word spaces. Applications needing reliable word segmentation there should use more sophisticated language-specific procedures. The SDK’s simplified class mapping produces the illustrated character-level results, which should not be mistaken for a complete language analysis."}
                </p>
                <>
<p>
                  A boundary produced by the default rules records the convention those rules implement. It is not automatically a claim about a linguistic word. Where the task needs word segmentation beyond those conventions, an application must add the appropriate language-specific procedure and check its output against that task.
                </p>
                <p>
                  The nine words the Chinese line came back as are nine correct applications of a rule that says break when nothing else applies, and there were four words there.
                </p>
</>
                <KeepInMind>
                  {"The documented limitation tells us when to add another procedure. Returning seven pieces from seven Thai code points is still a defined result here, not a refusal message. A word-segmentation application must evaluate it against the desired words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Agreed rather than correct, which is the more useful kind of authority">
                <p>
                  Everything above suggests the rules are a convention, and they
                  are. It would be a mistake to hear that as a criticism. A
                  convention that everybody follows has properties a better rule
                  that nobody follows does not, and they are worth naming, since
                  they are the actual reason to use this rule rather than to
                  invent one.
                </p>
                <>
<p>
                  {"Programs using the same version, complete property data, rules and tailoring can reproduce boundaries. Text-selection behavior may use additional application choices. Versioning helps preserve that convention, but it does not guarantee useful segmentation for every untested language."}
                </p>
                <p>
                  {"Newly assigned characters can require an updated Unicode data table or implementation. Class-based rules make those updates easier to share; they do not guarantee sensible behavior from every older binary without an update."}
                </p>
</>
                <p>
                  Agreement matters when one stage creates pieces and another expects to receive them in the same form. Recording the rule version and implementation makes that agreement testable. It also lets us distinguish an implementation mismatch from a boundary that follows the agreed convention but does not meet a particular linguistic task.
                </p>
                <KeepInMind>
                  The useful question to put to these rules is whether everything
                  reading the text afterwards was told the same thing, since a
                  vocabulary built under one reading and consulted under another
                  misses on every entry the two disagree about, which on the six
                  sentences here would be 12 of 47.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What Unicode boundaries leave to the application" id="20-what-is-left-undecided-gathered">
                <p>A Unicode boundary is not automatically the word boundary needed by every application. The remaining decisions concern what we count as a word, how we handle punctuation and whether language-specific knowledge is required.</p>
                <DerivationTable
                  expressionHeading="Character or word convention"
                  reasonHeading="Where boundary rules need interpretation"
                  rows={[
                    {
                      expression: "which segments are words",
                      reason:
                        "decided outside the rules, which produce segments that tile the text and stop there. The sentence about Dr. Alvarez gives 19 segments, and 9, 13 or 19 pieces depending on the test applied afterwards. Two tools implementing the same standard can differ here without either being wrong.",
                    },
                    {
                      expression: "a hyphen joining two words",
                      reason:
                        "not settled by the writing. The hyphen is in none of the joining classes, so the rules separate, and four of the twelve entries the two rules disagree about here are the halves of a compound while the other eight are a mark taken off the end of a word. A dictionary wants one unit and a search index wants two, and the text records only that a hyphen was typed.",
                    },
                    {
                      expression: "a full stop ending an abbreviation",
                      reason:
                        "The default rules do not identify every abbreviation or sentence role. A tailored procedure can use language evidence, and a separate sentence annotation can record a period with both roles. The token split alone need not represent every annotation.",
                    },
                    {
                      expression: "a script written without spaces",
                      reason:
                        "declined by the standard itself, which leaves those letters out of the joining class and says a dictionary is required. The answer is then one word per character, nine for a Chinese line where a reader finds four, which is the catch-all rule applied correctly and is not a segmentation.",
                    },
                    {
                      expression: "a segment holding no letter and no digit",
                      reason:
                        "found correctly and then discarded by a test the rules do not contain. Two flags give two segments and zero words, and a text of one emoji gives one segment and zero words, so a caller expecting at least one word per non-empty text has to check the count.",
                    },
                    {
                      expression: "text that is not prose",
                      reason:
                        "outside what the rules were written for. An address loses the character that makes it an address and keeps 18 of its 19 characters; a file name becomes three words. Nothing is wrong in the rules, and the decision that has to be made is whether such spans are protected before the rules see them.",
                    },
                    {
                      expression: "the spacing between the words",
                      reason:
                        "The word-only filter omits whitespace and some punctuation. Its words contain 303 of 375 source characters. Exact restoration needs retained segments or the source plus spans; offsets alone do not preserve the discarded characters.",
                    },
                    {
                      expression: "which version of the rules ran",
                      reason:
                        "a real question rather than a pedantic one, since the rules are versioned and have grown, most visibly when a clause counting flag halves in pairs was added for emoji. An answer is reproducible only alongside the version that produced it.",
                    },
                    {
                      expression: "a language’s own preferences",
                      reason:
                        "left open on purpose. The annex calls its rules a default and invites tailoring, so a language that wants its clitics split or its compounds kept is expected to adjust them, and any such adjustment is outside what two implementations can be held to.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Keep the boundary version and implementation visible in reproducible results. Check the segment filter separately from the cuts. If the application needs language-specific words, validate that task directly instead of inferring success from a returned list."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            choice(
              "Nine Chinese characters come back as nine words where a reader sees four. How does the page read that answer?",
              [
                "As a refusal written as an answer, since nothing in the characters said otherwise",
                "As a defect the annex does not acknowledge",
                "As an answer that is wrong while reporting perfect coverage",
                "As a tie between two rules that the published order settled badly",
              ],
              0,
              "The letters of those scripts are deliberately left out of the class that holds letters together, so the catch-all applies on both sides of every one of them, and the annex states that finding words there needs a dictionary or a model. The third answer describes the space rule, which returns the whole run as one word and reports no difficulty at all.",
            ),
            several(
              "Which of these are true of what the boundary rules cost over the six sentences?",
              [
                "They produce 69 words where cutting at spaces produces 63, about a tenth more",
                "They keep 80.8 percent of the writing inside a word, against 84.8",
                "Keeping every mark as a piece of its own would cost 15 more pieces again, 84 against 69",
                "They leave more distinct entries than the space rule does",
                "The nine words of the sentence about Dr. Alvarez glue back to it exactly, as the seven pieces do",
              ],
              [0, 1, 2],
              "Both filtered rules produce 47 distinct entries here, but their entries and occurrence counts differ. The boundary filter separates compound parts and omits punctuation, increasing the total piece count while losing characters needed for a literal reconstruction. Equal vocabulary sizes therefore establish neither equal representations nor equal processing cost. Offsets locate omissions, but exact source characters still need to be retained separately.",
            ),
            choice(
              "In a sentence carrying U.S., why does the stop inside the abbreviation survive into a word while the stop closing it does not?",
              [
                "The one inside has a letter on each side, so the rule for a letter reaching across a mark applies, and the closing one has a space after it",
                "The rules hold a list of abbreviations and recognize U.S. among them",
                "The closing stop is also the sentence’s own stop, which the rules treat separately",
                "A stop is in none of the joining classes, so neither of them survives",
              ],
              0,
              "The period inside U.S. sits between letters and is retained by the joining rule. Its final period has no following letter, so it becomes a separate segment and the default word filter omits it. The rule does not label abbreviation or sentence-ending roles. An application needing those roles must add suitable context, rules or a model.",
            ),
            trueFalse(
              "Two flags in a row give two correct segments and a word count of zero.",
              true,
              "The segmentation rule groups the regional-indicator characters into two flag segments. The default word filter then excludes both because they contain no qualifying letter or digit. Those operations answer different questions: preserving segment boundaries and selecting word-like segments. Keep all segments if the application needs the flags.",
            ),
            choice(
              "What does the page name as the actual reason to use these rules?",
              [
                "Agreement, since two programs following the annex select the same characters and a version number makes an answer reproducible",
                "That a word ends where the annex says it ends",
                "That they segment every script the standard covers",
                "That they are quicker than a dictionary or a model",
              ],
              0,
              "A published boundary convention lets separate programs divide the same text consistently. That consistency is useful for indexing, selection and downstream processing. It does not guarantee the boundaries match every language’s linguistic words or every application’s needs. Evaluate those goals separately from conformance to the stated rules.",
            ),
        ],
        },
        {
          title: "Practice. Reading the Running Sentence by Both Rules",
          practice: [
            exercise(
              "Read the sentence about Dr. Alvarez by both rules, then the six sentences",
              [
  "Apply UnicodeWordPreTokenizer and WhitespacePreTokenizer to the supplied Dr. Alvarez sentence and six-sentence notebook.",
  "For each rule print the sentence’s piece count, covered source-character count and single-space-join equality. Then print notebook pieces, covered characters out of all source characters and coverage percentage to one decimal place.",
  "Compute source coverage from spans. The boundary tokenizer’s default word filter omits some punctuation, while whitespace runs retain attached punctuation; neither coverage percentage alone determines a useful word segmentation."
],
              `from oop_ml import UnicodeWordPreTokenizer, WhitespacePreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
notebook = [
    sentence,
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rules = {
    "at every boundary": UnicodeWordPreTokenizer(),
    "at every run of spaces": WhitespacePreTokenizer(),
}

# For each rule, split the sentence and print the number of words, how many
# characters the words hold, and whether the words glued with single spaces
# equal the sentence. Then, over the notebook, print the total pieces, the
# total characters held, and that total as a percentage of all characters.`,
              `from oop_ml import UnicodeWordPreTokenizer, WhitespacePreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
notebook = [
    sentence,
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rules = {
    "at every boundary": UnicodeWordPreTokenizer(),
    "at every run of spaces": WhitespacePreTokenizer(),
}

for name, rule in rules.items():
    words = rule.split(sentence)
    held = sum(word.end - word.start for word in words)
    print(f"{name}: {words.n_words} words holding {held} of {len(sentence)} characters")
    print(f"  glued with single spaces, exact: {' '.join(words.texts) == sentence}")
    pieces = sum(rule.split(text).n_words for text in notebook)
    covered = sum(word.end - word.start for text in notebook for word in rule.split(text))
    characters = sum(len(text) for text in notebook)
    print(f"  six sentences: {pieces} pieces holding {covered} of {characters} characters")
    print(f"  share kept {100 * covered / characters:.1f} per cent")`,
              `at every boundary: 9 words holding 41 of 51 characters
  glued with single spaces, exact: False
  six sentences: 69 pieces holding 303 of 375 characters
  share kept 80.8 per cent
at every run of spaces: 7 words holding 45 of 51 characters
  glued with single spaces, exact: True
  six sentences: 63 pieces holding 318 of 375 characters
  share kept 84.8 per cent`,
              {
question: "What does a word-boundary filter omit that whitespace splitting retains?",
 hints: [
  "Each piece exposes start and end. Sum their half-open lengths for coverage.",
  "For the corpus sum lengths over all supplied sentences as the denominator.",
  "Compare a single-space join with the original sentence separately from counting retained characters."
], check: numberCheck("What percentage of the notebook’s source characters lies inside the word-only pieces, to one decimal place?", 80.8, 0.05, "The word-boundary filter covers 80.8 percent of notebook characters. That describes source retention for this output policy, rather than an accuracy score for its word choices.") },
            ),
            exercise(
              "Put one mark between two letters, then between two digits",
              [
  "For each of the twelve supplied marks, build a/mark/b and 1/mark/2 probes using chr(code). Split both with UnicodeWordPreTokenizer.",
  "Print the code point, name and whether each probe remains one word. Then print totals for marks joining letters, marks joining digits and marks whose two decisions differ.",
  "A mark has a fixed boundary class in this implementation, but joining rules also inspect its neighbors. Keep letter and digit contexts side by side to see how the same class behaves in each."
],
              `from oop_ml import UnicodeWordPreTokenizer

marks = {
    "apostrophe": 0x0027,
    "right single quotation mark": 0x2019,
    "full stop": 0x002E,
    "colon": 0x003A,
    "middle dot": 0x00B7,
    "comma": 0x002C,
    "low line": 0x005F,
    "narrow no-break space": 0x202F,
    "hyphen-minus": 0x002D,
    "quotation mark": 0x0022,
    "solidus": 0x002F,
    "space": 0x0020,
}
rule = UnicodeWordPreTokenizer()

# For each mark, split the letter a, the mark and the letter b, then the
# digit 1, the mark and the digit 2. A side is held together when one word
# comes back. Print a row per mark, then how many marks hold two letters
# together, how many hold two digits together, and how many differ.`,
              `from oop_ml import UnicodeWordPreTokenizer

marks = {
    "apostrophe": 0x0027,
    "right single quotation mark": 0x2019,
    "full stop": 0x002E,
    "colon": 0x003A,
    "middle dot": 0x00B7,
    "comma": 0x002C,
    "low line": 0x005F,
    "narrow no-break space": 0x202F,
    "hyphen-minus": 0x002D,
    "quotation mark": 0x0022,
    "solidus": 0x002F,
    "space": 0x0020,
}
rule = UnicodeWordPreTokenizer()

joins_letters = joins_digits = differ = 0
for name, code in marks.items():
    letters = rule.split(f"a{chr(code)}b").n_words == 1
    digits = rule.split(f"1{chr(code)}2").n_words == 1
    joins_letters += letters
    joins_digits += digits
    differ += letters != digits
    print(f"U+{code:04X}  {name:28s}  letters {str(letters):5s}  digits {digits}")
print(f"{joins_letters} of {len(marks)} hold two letters together")
print(f"{joins_digits} of {len(marks)} hold two digits together")
print(f"{differ} marks answer differently on the two sides")`,
              `U+0027  apostrophe                    letters True   digits True
U+2019  right single quotation mark   letters True   digits True
U+002E  full stop                     letters True   digits True
U+003A  colon                         letters True   digits False
U+00B7  middle dot                    letters True   digits False
U+002C  comma                         letters False  digits True
U+005F  low line                      letters True   digits True
U+202F  narrow no-break space         letters True   digits True
U+002D  hyphen-minus                  letters False  digits False
U+0022  quotation mark                letters False  digits False
U+002F  solidus                       letters False  digits False
U+0020  space                         letters False  digits False
7 of 12 hold two letters together
6 of 12 hold two digits together
3 marks answer differently on the two sides`,
              {
question: "Does punctuation join letters and digits in the same way?",
 hints: [
  "A result with n_words == 1 is joined for this probe.",
  "Keep both Boolean results before accumulating their totals and testing whether they differ."
], check: numberCheck("How many of the twelve marks hold two letters together?", 7, 0.0, "Seven marks join the two letters. The digit comparison differs for some punctuation, showing that the rule considers surrounding character classes rather than the mark alone.") },
            ),
            exercise(
              "Count the segments, then the words, then the marks kept",
              [
  "Ask UnicodeWordPreTokenizer for every segment of the supplied sentence and verify that concatenating those segments recovers it.",
  "Compare segment count, non-whitespace pieces with keep_punctuation=True, and default word-only pieces. Repeat the counts over the six-sentence notebook and print distinct-entry counts for the two filtered outputs.",
  "Boundary segmentation cuts the source into adjacent spans. Selecting which of those spans to return is a later policy, so do not confuse the full segmentation with the word-only output."
],
              `from oop_ml import Corpus, UnicodeWordPreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
notebook = [
    sentence,
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
words_only = UnicodeWordPreTokenizer()
keeping_marks = UnicodeWordPreTokenizer(keep_punctuation=True)

# Print how many segments the sentence has and whether joining their texts
# returns the sentence, then the piece count keeping every mark and the word
# count keeping words alone. Over the notebook, print the total segments, and
# for each of the two readings the total pieces and the number of distinct
# entries.`,
              `from oop_ml import Corpus, UnicodeWordPreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
notebook = [
    sentence,
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
words_only = UnicodeWordPreTokenizer()
keeping_marks = UnicodeWordPreTokenizer(keep_punctuation=True)

segments = words_only.segments_of(sentence)
print(f"segments of the running sentence: {segments.n_words}")
print(f"joined, the segments give the sentence back: {''.join(segments.texts) == sentence}")
print(f"keeping every mark: {keeping_marks.split(sentence).n_words} pieces")
print(f"keeping words alone: {words_only.split(sentence).n_words} words")

corpus = Corpus.of(notebook)
print(f"six sentences, segments: {sum(words_only.segments_of(text).n_words for text in notebook)}")
for name, rule in [("keeping every mark", keeping_marks), ("keeping words alone", words_only)]:
    counts = list(corpus.word_counts(rule))
    print(f"six sentences, {name}: {sum(count.count for count in counts)} pieces, {len(counts)} entries")`,
              `segments of the running sentence: 19
joined, the segments give the sentence back: True
keeping every mark: 13 pieces
keeping words alone: 9 words
six sentences, segments: 141
six sentences, keeping every mark: 84 pieces, 50 entries
six sentences, keeping words alone: 69 pieces, 47 entries`,
              {
question: "How does cutting the full text differ from selecting only its word segments?",
 hints: [
  "segments_of(text) gives the complete segmentation, including punctuation and spacing.",
  "Construct a second rule with keep_punctuation=True for the non-whitespace comparison.",
  "Use Corpus.word_counts on each filtered rule for piece occurrences and distinct spellings."
], check: numberCheck("How many distinct entries do the six sentences produce when every mark is kept as a piece of its own?", 50, 0.0, "Keeping punctuation gives fifty distinct notebook entries. The extra punctuation entries come from a different output filter applied after boundary segmentation.") },
            ),
            exercise(
              "Writing that separates the two rules, in both directions",
              [
  "The starter supplies nine contrasting texts, including unspaced scripts, flags, an address, a file name and an emoji. Keep every supplied code point unchanged.",
  "For each labeled text print default Unicode word count, whitespace piece count and complete Unicode segment count. Preserve the listed order.",
  "Compare words with segments: a symbol can form a segment while the default word-only filter returns no word. These default rules are not a dictionary-based linguistic word segmenter for every language."
],
              `from oop_ml import UnicodeWordPreTokenizer, WhitespacePreTokenizer

texts = {
    "eleven characters of Japanese": "アルバレス博士は驚いた",
    "nine characters of Chinese": "我来到北京清华大学",
    "seven characters of Thai": "ภาษาไทย",
    "Korean, written with spaces": "한국어 단어",
    "a French thousands group": "1\\u202f000 sensors",
    "two flags": "\\U0001f1eb\\U0001f1f7\\U0001f1e9\\U0001f1ea",
    "an address": "alvarez@example.com",
    "a file name": "re-analysis_2019.csv",
    "a single approving hand": "\\U0001f44d",
}
boundaries = UnicodeWordPreTokenizer()
spaces = WhitespacePreTokenizer()

# For each text, print its label, the number of words the boundary rules
# find, the number of pieces the space rule finds, and the number of
# segments the boundary rules cut it into.`,
              `from oop_ml import UnicodeWordPreTokenizer, WhitespacePreTokenizer

texts = {
    "eleven characters of Japanese": "アルバレス博士は驚いた",
    "nine characters of Chinese": "我来到北京清华大学",
    "seven characters of Thai": "ภาษาไทย",
    "Korean, written with spaces": "한국어 단어",
    "a French thousands group": "1\\u202f000 sensors",
    "two flags": "\\U0001f1eb\\U0001f1f7\\U0001f1e9\\U0001f1ea",
    "an address": "alvarez@example.com",
    "a file name": "re-analysis_2019.csv",
    "a single approving hand": "\\U0001f44d",
}
boundaries = UnicodeWordPreTokenizer()
spaces = WhitespacePreTokenizer()

for label, text in texts.items():
    n_words = boundaries.split(text).n_words
    n_pieces = spaces.split(text).n_words
    n_segments = boundaries.segments_of(text).n_words
    print(f"{label:30s} words {n_words}  pieces on spaces {n_pieces}  segments {n_segments}")`,
              `eleven characters of Japanese  words 7  pieces on spaces 1  segments 7
nine characters of Chinese     words 9  pieces on spaces 1  segments 9
seven characters of Thai       words 7  pieces on spaces 1  segments 7
Korean, written with spaces    words 2  pieces on spaces 2  segments 3
a French thousands group       words 2  pieces on spaces 3  segments 3
two flags                      words 0  pieces on spaces 1  segments 2
an address                     words 2  pieces on spaces 1  segments 3
a file name                    words 3  pieces on spaces 1  segments 5
a single approving hand        words 0  pieces on spaces 1  segments 1`,
              {
question: "How do the rules behave on scripts and symbols that spaces do not separate?",
 hints: [
  "Call boundary.split(text), spaces.split(text) and boundary.segments_of(text) separately.",
  "Use the labels to display the report without requiring every script in the console.",
  "The narrow no-break space is an explicit code point in the starter; replacing it with an ordinary space changes the numeric grouping probe."
], check: numberCheck("How many words do the boundary rules find in the eleven characters of Japanese?", 7, 0.0, "The Japanese probe returns seven default word pieces. Some character classes join into a run and others remain separate under these default rules, so this count is not a claim of seven linguistic words.") },
            ),
          ],
        },
      ]}
    />
  );
}
