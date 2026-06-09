import type { Metadata } from "next";
import Link from "next/link";
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
import { BoundaryCostPanel } from "@/components/widgets/BoundaryCostPanel";
import { CharacterClassStrip } from "@/components/widgets/CharacterClassStrip";
import { MarkBetweenTable } from "@/components/widgets/MarkBetweenTable";
import { ScriptCoveragePanel } from "@/components/widgets/ScriptCoveragePanel";
import { WordBreakPlayground } from "@/components/widgets/WordBreakPlayground";

export const metadata: Metadata = {
  title: "Unicode Word Boundaries · oop_ml",
  description:
    "The Unicode word boundary rules put every character into one of eighteen classes and then say, for each pair of neighbouring classes, whether a word may break between them. What that buys over a space, and what it still leaves undecided.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function UnicodeWordBoundariesPage() {
  return (
    <ConceptPage
      title="Unicode Word Boundaries"
      tagline="Every character gets a class, and a short list of numbered rules says which pairs of classes a word may break between."
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
      history={
        <>
          <p>
            The problem was small, concrete and everywhere. A text editor has to
            decide what a double-click selects, what happens when the cursor is
            moved one word to the left, and what the whole-word option in a find
            box means, and before there was a standard every program decided
            those for itself. The same document behaved differently in two
            programs on one machine, and a rule written by somebody who read
            English selected the wrong thing the moment the document was in
            Hebrew, in Thai or in Japanese. The Unicode Consortium, incorporated
            in 1991 after Joe Becker&rsquo;s 1988 proposal for one character set
            wide enough to hold every script, had by then settled what the
            characters were. It had not settled which runs of them a person would
            call a word.
          </p>
          <p>
            The answer was published as a Unicode Technical Report numbered 29,
            titled <em>Text Boundaries</em>, and later became a Unicode Standard
            Annex under the title <em>Unicode Text Segmentation</em>, edited by
            Mark Davis, one of the consortium&rsquo;s founders. It answers three
            questions in one document, where one user-perceived character ends,
            where one word ends, and where one sentence ends, and it names the
            applications it has in mind, which are exactly the editor&rsquo;s
            three. That is worth carrying into the rest of this page, because it
            explains the shape of what the annex chose. Rules that have to run on
            every keystroke cannot consult a dictionary, so they read a fixed
            window of characters around one position and decide there, and every
            property of the method described below follows from that constraint
            rather than from a theory of what a word is.
          </p>
          <p>
            The annex is unusually candid about what it does not do. It calls its
            own rules a default, states that they are meant to be tailored, and
            names the scripts it declines. Thai, Lao, Khmer, Myanmar and the Tai
            scripts write no spaces, and the annex deliberately leaves their
            letters out of the class that holds letters together, so its rules
            cut them at every character rather than pretending; Chinese and
            Japanese are the same case. For all of those it says a dictionary or
            a model is required and that its own rules are not a substitute, and
            the reference implementation the consortium sponsors ships that
            second mechanism alongside these rules. The one place the rules have
            visibly had to grow is emoji, where a clause counting regional
            indicators in pairs was added so that a flag would not be cut in
            half.
          </p>
          <p>
            The page answers five questions in order. What does splitting on
            spaces assume, and what writing does that assumption fail on? What
            does it mean for a standards body to define where a word breaks, and
            what does such a definition consist of? What are the character
            classes, and what does putting a character in one of them decide?
            What does the rule buy over a space, and what does it cost per piece
            and per character? And where does it stop being defined, so that its
            answer is an agreement rather than a fact?
          </p>
        </>
      }
      playground={<WordBreakPlayground />}
      sections={[
        {
          title: "Part 1. The Assumption Behind a Space",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. What a space assumes, and the writing it fails on">
                <p>
                  We carry one sentence through this page, the same one the rest
                  of this section carries, because it is short enough to check by
                  hand and awkward in four separate places.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  Cutting that at every run of white space gives seven pieces,
                  and they are reasonable pieces. The trouble is not the pieces.
                  It is that the rule which produced them has an assumption
                  inside it that it never states, which is that whoever wrote the
                  text put a gap between one word and the next. That is a habit
                  of a writing system rather than a property of language, and it
                  is false of a great deal of the world&rsquo;s writing.
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
                    ["the running sentence", "51", "7"],
                    ["eleven characters of Japanese", "11", "1"],
                    ["nine characters of Chinese", "9", "1"],
                    ["seven characters of Thai", "7", "1"],
                  ]}
                  caption="The first row is the sentence the rule was designed for and the last three are writing it cannot read at all. Section 10 puts those last three to the rules this page is about."
                />
                <KeepInMind>
                  A rule that cuts at spaces encodes one writing system&rsquo;s
                  typographic habit, and there is no reason a rule for finding
                  words should have to. The question this page takes up is what a
                  rule looks like when it is written without that assumption, by
                  somebody obliged to consider every script at once.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What it means for a standards body to say where a word breaks">
                <p>
                  A committee cannot answer &ldquo;what is a word&rdquo; for
                  every language, and the Unicode word boundary rules do not try.
                  They answer a narrower question that turns out to be answerable.
                  Between any two neighbouring characters of a text there is a
                  position, and the rules say, for that position, whether a word
                  is allowed to end there. Nothing more.
                </p>
                <p>
                  The definition therefore has two halves and no third. The first
                  half is a table that puts every character in the world into one
                  of a small number of classes, so that a rule never has to talk
                  about a character and can talk about a kind of character. The
                  second half is a numbered list of rules, each of which looks at
                  the classes on either side of one position and says break or do
                  not break. The rules are tried in their published order, the
                  first that applies decides, and the last one applies to
                  everything.
                </p>
                <Equation>
                  {"a text of n characters  has  n − 1  positions between characters\n" +
                    "each position  is  the pair of classes on either side of it\n" +
                    "the answer  =  the first numbered rule that matches that pair"}
                </Equation>
                <p>
                  Two things follow immediately and are worth having before any
                  detail. The rules never disagree with each other, because the
                  order settles every conflict by construction, so there is no
                  tie to break and no scoring. And the whole calculation is one
                  pass along the text asking a fixed question at each position,
                  so it costs what reading the text costs, which is what a rule
                  that has to run while somebody is typing needs.
                </p>
                <KeepInMind>
                  The standard defines where a word may break and does not define
                  a word. That gap is not an oversight and it is the subject of
                  the last part of this page, but it is worth noticing this
                  early, because everything the rules do well follows from having
                  asked the smaller question.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The running sentence, under both rules">
                <p>
                  Putting the sentence to the boundary rules gives nine words
                  where the space rule gave seven, and the playground above is
                  doing exactly that. It is worth reading the nine against the
                  seven before going further, because every difficulty on the
                  rest of the page is already visible in the difference between
                  them.
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
                  <p>
                    The last rule in the list applies to every pair of classes
                    that reached it, and it says break. That choice is what makes
                    the list short. If the catch-all joined, then every pair of
                    classes that should be separated would need a rule of its own,
                    and the number of pairs grows with the square of the number of
                    classes; because it breaks, only the pairs that must be held
                    together need naming, and there are around a dozen of those.
                    It also means an unfamiliar character, or one from a script
                    added to the standard later, gets separated from its
                    neighbours rather than silently glued to them, which is the
                    less damaging of the two errors when nothing is known.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  One pass, one question per position, first matching rule wins,
                  and a catch-all that breaks. The segments tile the text
                  exactly, so nothing is lost at this stage and the losses on the
                  rest of this page all happen when the segments that are not
                  words are dropped.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The Classes",
          content: (
            <>
              <SubSection title="5. Eighteen classes, and the seven that six sentences reach">
                <p>
                  Naming the classes is what turns the rules from a table of
                  characters into something a person can read and argue with.
                  There are eighteen of them. Most describe what a character is,
                  so there is one for letters, one for digits, one for the spaces
                  that separate words, one for the ends of lines. The interesting
                  ones describe what a character is allowed to do, so there is a
                  class for marks that may stand between two letters, another for
                  marks that may stand between two digits, and another for marks
                  that may do either.
                </p>
                <p>
                  Eighteen sounds like a lot for something this small, and on
                  ordinary English it is. I counted the class of every character
                  in the six sentences this section shares, 375 characters in
                  all, and seven classes account for the lot.
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
                <p>
                  The eleven that never turn up are the point of the exercise
                  rather than an inefficiency. They are there for Hebrew and
                  katakana, for the marks that combine with the letter before
                  them and the invisible formatting characters, for the halves of
                  a flag and the ends of lines, and for three joining marks these
                  six sentences happen never to use, a quotation mark, a colon
                  and a low line. A rule written for the seven classes that do
                  turn up would look complete on this corpus and would be wrong
                  on the first document that was not in English.
                </p>
                <KeepInMind>
                  The class of a character is decided once, before any rule runs,
                  and every rule is then written about classes. That is what
                  keeps the list of rules to about a dozen lines while the table
                  underneath covers every script.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Every character of a short text, with its class">
                <p>
                  The first eighteen characters of the running sentence, each
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
                <p>
                  One honest note about how these classes were arrived at. The
                  standard publishes them as a property in its own data files,
                  and what is shown here is worked out instead from each
                  character&rsquo;s general category together with the character
                  lists the standard prints in the annex. That is an
                  approximation. It is why a character from a script none of the
                  examples on this page reaches could in principle be placed in a
                  different class than a complete implementation would place it,
                  and it is a limitation of what you are looking at rather than
                  of the method.
                </p>
                <KeepInMind>
                  A class per character, then a decision per position between two
                  characters. Everything else on this page is a consequence of
                  which class a particular mark was put in.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. One mark between two letters, and the same mark between two digits">
                <p>
                  This is the experiment that makes the classes legible. I took
                  twelve marks, put each between the letters a and b, then put
                  the same mark between the digits 1 and 2, and read both by the
                  rules.
                </p>
                <MarkBetweenTable />
                <p>
                  The three rows where the two columns differ are the argument
                  for having classes at all. A colon holds two letters together,
                  so <span className="font-mono">a:b</span> is one word, and it
                  separates two digits, so a time written as{" "}
                  <span className="font-mono">12:30</span> comes back as two.
                  The comma does exactly the reverse, separating{" "}
                  <span className="font-mono">a,b</span> and holding{" "}
                  <span className="font-mono">1,000</span> together, and the
                  third row that differs is a middle dot, which behaves exactly
                  as the colon does because it was put in the same class. Neither
                  of those answers is a rule about the colon or about the comma.
                  Each is one general rule about a class, applied to a character
                  somebody put in that class.
                </p>
                <p>
                  The rows that look alike and are not are worth as much. A
                  hyphen and a low line are both a mark between two letters, and
                  the hyphen is in none of the joining classes so it separates,
                  while the low line is in the class that joins whatever it finds
                  on both sides, so{" "}
                  <span className="font-mono">snake_case_name</span> is one word.
                  A narrow no-break space is in that same joining class, so a
                  thousands group written with it stays whole, which is a
                  character that every rule reading white space calls a separator
                  and this table calls glue.
                </p>
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
                  What a mark does is decided entirely by the class it was put
                  in, and the same mark can join on one side of the table and
                  separate on the other. A reader who wants to predict what these
                  rules will do to a piece of writing needs the classes of its
                  marks and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The characters the rules make invisible first">
                <p>
                  One class is applied before any of the others and changes how
                  they are read. Combining marks, the characters that attach to
                  the letter in front of them, together with the invisible
                  formatting characters, are hidden from every later rule, so a
                  rule that asks about the character on the left gets the last
                  character that was not one of these.
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
                  <p>
                    The alternative is to write every rule twice, once for the
                    plain case and once allowing a run of marks in the middle,
                    and then a third time for two runs, and the list stops being
                    readable. Hiding the marks once, at the start, means the
                    dozen rules underneath can be stated about the characters a
                    reader sees. The cost is that each decision has to look back
                    over any run of hidden characters to find its real
                    neighbour, so a very long run of marks costs more than a
                    short one, and that is a price nobody pays because a run of
                    marks long enough to matter is not a word anybody has
                    written.
                  </p>
                </WhyThisWorks>
                <p>
                  There is a case where the hiding is too eager, and it is worth
                  reporting rather than smoothing over. The character that joins
                  two emoji into one picture is an invisible formatting character
                  by category, and the standard gives it a class of its own
                  precisely so that a joined sequence stays together. Treated as
                  ordinary invisible formatting, as it is here, it is absorbed
                  into the emoji before it and the sequence breaks after it, so
                  two joined emoji come back as two segments rather than one.
                  That is a real difference from a complete implementation and it
                  is on the classes rather than on the rules.
                </p>
                <KeepInMind>
                  Two spellings of one word, six characters and eight, and one
                  answer from the rules. The mechanism that gets that right is
                  one clause applied before everything else, and the same clause
                  is where the emoji case goes wrong.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What the Rules Buy Over a Space",
          content: (
            <>
              <SubSection title="9. Punctuation stops riding on the word in front of it">
                <p>
                  The failure the previous page measures is that a mark of
                  punctuation is not white space, so a run of non-space characters
                  carries it along, and a word that reaches the end of a clause
                  becomes a different entry from the same word inside one. These
                  rules put every mark in a class, and a mark in none of the
                  joining classes is separated from the letters beside it, so the
                  failure does not arise.
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
                <p>
                  Both rules come to 47 entries over these six sentences, and
                  that equality is worth naming so it is not misread as a
                  result. Separating the marks shrinks a table only where the
                  same word turns up both inside a clause and at the end of one,
                  so that its two spellings can collapse into a single entry, and
                  on this corpus that happens exactly once. It is visible in the
                  list on the right, which holds both{" "}
                  <span className="font-mono">re-analysis</span> and{" "}
                  <span className="font-mono">re-analysis.</span>, and no other
                  pair there differs only by a mark. Six sentences give most
                  words one chance to appear at all, so there is almost nothing
                  available to collapse.
                </p>
                <KeepInMind>
                  On this corpus the repair is visible in which entries the two
                  rules hold rather than in how many, since exactly one word
                  appears here in two spellings. The table size argument needs a
                  corpus where that happens often, and six sentences is not one.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. A script that puts nothing between its words">
                <p>
                  This is the case the rules were written for, and it is also
                  where they are most often described inaccurately. The claim is
                  not that the rules segment Chinese. The annex says the opposite
                  in as many words. What the rules do is give an answer that is
                  honest about the writing rather than one that looks like a
                  success.
                </p>
                <ScriptCoveragePanel />
                <p>
                  Read the Japanese sentence first, because it is the informative
                  one. Eleven characters, mixing three scripts, and the rules
                  give seven words where the space rule gives one. The five
                  katakana characters at the front are held together into one
                  word, correctly, because katakana has a class of its own and a
                  rule that joins it to itself. Everything after them is one word
                  per character, because the standard deliberately leaves the
                  kanji and the hiragana out of the letter class. Some of that
                  answer is right and some of it is a placeholder, and the rules
                  make no distinction between the two.
                </p>
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
                  <p>
                    Faced with a script it cannot segment, a rule has two ways to
                    fail. It can return the whole run as one word, which is what
                    the space rule does, or it can cut at every character, which
                    is what these rules do. The second is worse as a segmentation
                    and better as a signal, since a caller who sees nine words of
                    one character each has been told something about the writing,
                    while a caller who sees one word of nine characters has been
                    told nothing and has a piece that no vocabulary will ever
                    hold. It is also the answer that composes, because a
                    character is at least a unit something downstream can work
                    with. Neither is the answer, and the answer needs a
                    dictionary or a model, which is what the next section of this
                    site is about.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The rules do not solve the script without spaces and were never
                  claimed to. What they buy there is an answer that is wrong in a
                  visible way rather than an answer that is wrong while reporting
                  perfect coverage.
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
                <p>
                  The flags run the other way and are stranger. A flag is two
                  characters, neither of them a letter, and there is a rule that
                  counts them in pairs so that a flag is never cut in half. Two
                  flags in a row therefore give two segments, correctly, where
                  the space rule gives one piece holding both. Neither segment is
                  a word by the ordinary test, since a word has to hold a letter
                  or a digit and a flag holds neither, so the count of words for
                  that text is zero. The rules found the right boundary and then
                  the word test threw both pieces away, which is the two halves
                  of the method disagreeing rather than either being wrong.
                </p>
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
                  The rules cut a text into segments that tile it, and then
                  somebody has to say which segments are words. That second step
                  is not the standard&rsquo;s and there is more than one defensible
                  answer, so it is worth seeing both. On the running sentence the
                  rules find 19 segments. Nine of them hold a letter or a digit
                  and are the nine words of section 3. The other ten are the six
                  spaces, the two hyphens and the two full stops.
                </p>
                <NumberTable
                  headings={[
                    "what is kept",
                    "the running sentence",
                    "the six sentences",
                  ]}
                  rows={[
                    ["every segment, spacing included", "19", "141"],
                    ["everything that is not spacing", "13", "84"],
                    ["only what holds a letter or a digit", "9", "69"],
                  ]}
                  caption="The same rules, read three ways. The middle row keeps each mark of punctuation as a piece of its own, since the rules already break between any two marks."
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
                  The repair is not free and the first bill is length. Over the
                  six sentences the boundary rules produce 69 words where cutting
                  at spaces produces 63, which is about a tenth more, and the
                  extra pieces are the halves of the compounds. Anything reading
                  the text afterwards pays per piece, and for a model that
                  compares every position with every other position it pays
                  roughly with the square of that count.
                </p>
                <InAModel>
                  <p>
                    A tenth on a corpus of six sentences is a rounding error and
                    on a training run it is not. The same effect is the reason
                    the methods later in this section, which cut words into
                    pieces rather than joining them, are always reported with a
                    piece count beside their vocabulary size. The choice is
                    always the same shape, and it is between a table with fewer
                    entries and a corpus with more positions in it.
                  </p>
                </InAModel>
                <KeepInMind>
                  63 pieces against 69 on identical writing. That is what
                  separating the marks and splitting the compounds costs per
                  corpus, and it is paid every time the corpus is read.
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
                    ["characters of the running sentence, of 51", "41", "45"],
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
                  So the choice between the two is a choice about which loss is
                  cheaper, and a vocabulary is glad to be rid of the marks while
                  anything that has to hand the reader back their own text is
                  not.
                </p>
                <p>
                  The loss is recoverable while the source is still in hand,
                  because every word carries the offsets it came from and the
                  characters between one word and the next are still there to be
                  read. It is not recoverable from a list of words, which is what
                  most things downstream are given.
                </p>
                <KeepInMind>
                  80.8 per cent of the writing against 84.8. Neither number says
                  anything about whether the words are good words, and the panel
                  in section 10 shows the space rule reaching every one of the
                  nine characters of the Chinese line while returning them as a
                  single word.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where splitting on spaces is the better rule">
                <p>
                  There are texts where the simpler rule wins outright, and they
                  are not exotic. Three of them are in the panel in section 10.
                  An address comes back as two words with the character that
                  makes it an address gone, so 18 of its 19 characters survive
                  and the thing itself does not. A file name comes back as three.
                  A text holding a single approving hand and nothing else comes
                  back as no words at all, because the rules found the segment
                  correctly and then the word test refused it for holding no
                  letter and no digit.
                </p>
                <p>
                  What those three have in common is that they were not written
                  as prose. The rules were designed for what a person reading a
                  document would call a word, and a message identifier, a path
                  and a picture are none of them prose. The space rule keeps them
                  whole for the uninteresting reason that it keeps everything
                  whole, which is the right answer here by accident rather than
                  by design.
                </p>
                <KeepInMind>
                  Pointed at writing that is not prose, these rules come apart in
                  a way the cruder rule does not, and a text of one emoji becomes
                  zero words rather than one. Anything reading text that has
                  addresses or paths in it should either keep the segments rather
                  than the words or protect those spans before the rules see
                  them.
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
                <p>
                  The measurement in section 9 says the same thing without any
                  appeal to the document. Two careful rules put 35 of 47 entries
                  in the same place and 12 in different places, and nothing in
                  the writing decides the 12. Whether{" "}
                  <span className="font-mono">low-cost</span> is one unit or two
                  depends on whether a dictionary, a search index or a typesetter
                  is asking, and all three are right about their own purpose. A
                  standard can make every implementation give the same answer,
                  and this one did, which is why a double-click selects the same
                  characters in two different programs. It cannot make that
                  answer correct, because there is nothing here for it to be
                  correct about.
                </p>
                <KeepInMind>
                  Where the standard is silent it is silent deliberately, and the
                  silence is where the disagreements between real tools live. The
                  thing to ask of an implementation is which choices it made
                  after the rules ran, not whether it followed them.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. It reads characters, so an abbreviation is beyond it">
                <p>
                  The rules see classes of characters and nothing else, so any
                  question whose answer lives in a language rather than in the
                  writing is outside what they can decide. The full stop is the
                  clearest case, and it already appears twice in the running
                  sentence doing two different jobs. A sentence carrying an
                  abbreviation written with two stops shows all three readings at
                  once.
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
                    because they are indistinguishable in the characters.
                  </p>
                </WorkedExample>
                <p>
                  That is not a defect to be patched. The information that would
                  separate the two is a list of the abbreviations of a particular
                  language, and the moment a rule carries such a list it is a
                  rule for that language and has given up the property that
                  brought us here. Worse, the case has no correct answer even with
                  the list, since a sentence ending in an abbreviation is written
                  with one stop doing both jobs and no division of the characters
                  assigns it to both.
                </p>
                <KeepInMind>
                  Reading only characters is what lets one rule run on every
                  script, and it is the same thing that puts the abbreviation out
                  of reach. The running sentence loses the stop after{" "}
                  <span className="font-mono">Dr</span> for exactly the reason
                  the Chinese line was cut nine ways, which is that nothing in
                  the characters said otherwise.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The scripts the standard declines by name">
                <p>
                  The most unusual thing about this standard, read next to most
                  standards, is that it names its own limits in the document. The
                  scripts written without spaces are not handled badly by
                  accident. Their letters are deliberately left out of the class
                  that holds letters together, so the catch-all applies on both
                  sides of every one of them, and the annex states that finding
                  words in those scripts requires a dictionary or a model and
                  that these rules are not a substitute.
                </p>
                <p>
                  What follows is a statement about the method rather than about
                  any text. Where the writing separates its words with characters
                  the rules can see, whether that is a space in English or a
                  change of class in a Japanese sentence, the answer is
                  determined by the writing. Where it does not, the answer is
                  determined by nothing, and cutting at every character is a
                  refusal written as an answer. The nine words the Chinese line
                  came back as are nine correct applications of a rule that says
                  break when nothing else applies, and there were four words
                  there.
                </p>
                <KeepInMind>
                  Naming the decline in the document is worth more than a silent
                  failure would be, since it tells a reader that seven pieces
                  from seven Thai characters is the standard refusing rather than
                  the standard answering. Where the other half comes from is the
                  subject of the next section of this site.
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
                <p>
                  Two independent programs following the annex select the same
                  thing when a reader double-clicks, so a document behaves the
                  same way in both. The rules are published with a version, so an
                  answer can be reproduced years later by saying which version
                  produced it. They cover every script the standard covers rather
                  than the one their author reads, so a program does not fail
                  when it meets a language nobody tested it on. And because the
                  rules are stated on classes rather than on characters, a script
                  added to the standard later gets sensible behaviour without any
                  program being rewritten.
                </p>
                <p>
                  None of those is a claim that a word ends where the annex says
                  it ends. They are claims about agreement, and agreement is what
                  a person actually needs from the piece of a system that decides
                  where words are, since the decision is going to be made
                  identically millions of times and the cost of two parts of one
                  pipeline making it differently is far larger than the cost of
                  either being slightly wrong.
                </p>
                <KeepInMind>
                  The useful question to put to these rules is whether everything
                  reading the text afterwards was told the same thing, since a
                  vocabulary built under one reading and consulted under another
                  misses on every entry the two disagree about, which on the six
                  sentences here would be 12 of 47.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What is left undecided, gathered">
                <p>
                  The cases below are gathered from the whole page. The right
                  column says what the method does not determine and why, and it
                  quotes a number where the number is a fact about the method
                  rather than about any particular text.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "which segments are words",
                      reason:
                        "decided outside the rules, which produce segments that tile the text and stop there. The running sentence gives 19 segments, and 9, 13 or 19 pieces depending on the test applied afterwards. Two tools implementing the same standard can differ here without either being wrong.",
                    },
                    {
                      expression: "a hyphen joining two words",
                      reason:
                        "not settled by the writing. The hyphen is in none of the joining classes, so the rules separate, and four of the twelve entries the two rules disagree about here are the halves of a compound while the other eight are a mark taken off the end of a word. A dictionary wants one unit and a search index wants two, and the text records only that a hyphen was typed.",
                    },
                    {
                      expression: "a full stop ending an abbreviation",
                      reason:
                        "outside what a rule reading characters can decide, since the stop inside an abbreviation and the stop ending a sentence are the same character in the same surroundings. At the end of a sentence it is undecidable even with a list of abbreviations, because one character is closing both.",
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
                        "discarded, along with every mark, unless the segments are kept instead. The words hold 303 of the 375 characters of six sentences, and gluing them back with one space each does not reproduce any of them. The offsets are the only place the rest survives.",
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
                  Two of these are worth carrying past this page. The rules never
                  refuse, so a text they cannot segment comes back looking like a
                  text they could, and only the words themselves say which
                  happened. And the step that turns segments into words is not
                  part of the standard at all, which is where most of the
                  disagreement between real implementations actually lives.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
