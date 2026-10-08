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
import { BranchReader } from "@/components/widgets/BranchReader";
import { ContractionGallery } from "@/components/widgets/ContractionGallery";
import { DialectPanel } from "@/components/widgets/DialectPanel";
import { PatternCostPanel } from "@/components/widgets/PatternCostPanel";
import { PatternPlayground } from "@/components/widgets/PatternPlayground";
import { SpaceLedger } from "@/components/widgets/SpaceLedger";

export const metadata: Metadata = {
  title: "The Pattern Language Models Use · oop_ml",
  description:
    "Before learning smaller pieces, a tokenizer may need to separate runs of letters, numbers, and punctuation. A regular expression can describe those initial groups while retaining information about the spaces around them.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PatternWordsPage() {
  return (
    <ConceptPage
      lessonId="the-pattern-language-models-use"
      intuition={lessonIntuitions["the-pattern-language-models-use"]}
      technicalStart="Part 2. One Expression, Twelve Branches"
      openingTitle="The Space Has to Belong Somewhere"
      playgroundIntro="Make the spaces visible and inspect which piece owns each one. Join the pieces and compare the result with the original text."
      title="The Pattern Language Models Use"
      tagline={"Before learning smaller pieces, a tokenizer may need to separate runs of letters, numbers, and punctuation. A regular expression can describe those initial groups while retaining information about the spaces around them."}
      prerequisites={
        <>
          The{" "}
          <Link href="/concepts/splitting-on-spaces" className={link}>
            splitting on spaces
          </Link>{" "}
          page, which introduces the sentence and the six-sentence notebook
          these pages count over. The{" "}
          <Link href="/concepts/unicode-word-boundaries" className={link}>
            Unicode word boundaries
          </Link>
          ,{" "}
          <Link href="/concepts/penn-treebank-rules" className={link}>
            Penn Treebank rules
          </Link>{" "}
          and{" "}
          <Link href="/concepts/moses-rules" className={link}>
            Moses rules
          </Link>{" "}
          pages are the three this one is measured against, and each is useful
          without being required. Nothing is fitted here, so no corpus is needed
          to make the rule work, only to count what it does.
        </>
      }

      playground={<PatternPlayground />}
      sections={[
        {
          title: "Part 1. What Happens to the Space",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Four rules, and the character none of them keeps">
                <p>
                  The four rules on the pages before this one disagree about
                  almost everything, and agree about one thing without ever
                  saying so. Splitting on spaces asks where the gaps are, the
                  boundary rules ask which pairs of characters a word may break
                  between, the annotation rules ask which units a grammar talks
                  about, and the translation rules ask what a phrase table
                  should have a row for. Every one of them answers with the
                  writing and throws the spacing away.
                </p>
                <p>
                  That is invisible until something has to go the other way. A
                  model that reads text and produces text has to hand a person a
                  sentence at the end, and if the pieces it was trained on do
                  not carry the spacing then something else has to put the
                  spacing back by guessing. We carry the same sentence the other
                  pages carry, since it breaks in the places that matter.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  Fifty-one characters, of which six are spaces. Every one of
                  the four rules gives back some arrangement of the other
                  forty-five, and none of them gives back a single one of the
                  six.
                </p>
                <KeepInMind>
                  The question this page is about is not where the words are,
                  which the four earlier rules already answer in four different
                  ways. It is what happens to the characters between the words,
                  which all four of them treat as a separator rather than as
                  part of the writing.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The running sentence, cut, with the spaces visible">
                <p>
                  Here is the whole method applied once. Fourteen pieces, each
                  shown with the half-open span of the sentence it stands for,
                  and a raised dot standing where a space is, since a space at
                  the front of a piece is the entire point and is otherwise
                  impossible to see.
                </p>
                <WorkedExample title="Fourteen pieces, and where each came from">
                  <Equation>
                    {"Dr           [0, 2)      ·the         [25, 29)\n" +
                      ".            [2, 3)      ·low         [29, 33)\n" +
                      "·Alvarez     [3, 11)     -            [33, 34)\n" +
                      "·didn        [11, 16)    cost         [34, 38)\n" +
                      "'t           [16, 18)    ·re          [38, 41)\n" +
                      "·expect      [18, 25)    -            [41, 42)\n" +
                      "                         analysis     [42, 50)\n" +
                      "                         .            [50, 51)"}
                  </Equation>
                  <p>
                    Six of the fourteen begin with a space, which is exactly the
                    number of spaces in the sentence. Read the spans down and
                    they run from 0 to 51 with no gap anywhere, so every
                    character of the sentence, spaces included, is inside some
                    piece and inside exactly one.
                  </p>
                </WorkedExample>
                <p>
                  Notice what that does to a word that turns up twice.{" "}
                  <span className="font-mono">cost</span> at position 34 follows
                  a hyphen, so it carries no space, while{" "}
                  <span className="font-mono">expect</span> at position 18
                  follows a space and carries one. Those are two different
                  pieces even where they would be the same word, and section 16
                  counts what that costs.
                </p>
                <KeepInMind>
                  Fourteen pieces holding 51 of the sentence&rsquo;s 51
                  characters. Nothing was dropped, nothing was rewritten, and
                  six of the pieces begin with the space they follow.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Putting it back, which here is writing the pieces one after another">
                <p>
                  The test is worth stating before the numbers. Take the pieces,
                  throw the spans away, write them one after another with
                  nothing at all between them, and ask whether what comes out is
                  the sentence. Not the sentence less its spacing, which is the
                  most any of the four earlier rules can manage, but the
                  sentence.
                </p>
                <SpaceLedger />
                <p>
                  The pattern passes, on all six sentences of the notebook. The
                  crudest rule fails and is rescued by putting one space between
                  every pair, which happens to reproduce all six because the
                  notebook is written with single spaces and no punctuation
                  standing alone. The other three fail both tests, since a full
                  stop with a space in front of it is not English, so anything
                  reading their pieces needs a second set of conventions about
                  the language before it can produce a sentence at all.
                </p>
                <WhyThisWorks title="Why the pattern cannot fail this test">
                  <p>
                    It is a property of the branches rather than a happy result.
                    The three branches that read writing take, in turn, a run of
                    letters, a run of digits, and a run of everything that is
                    neither of those nor spacing, and between them those three
                    classes cover every character that is not spacing. The last
                    two branches take the spacing. So at every position in any
                    text some branch matches at least one character, no position
                    is ever skipped, and the pieces tile the text by
                    construction.
                  </p>
                  <p>
                    That is a claim strong enough to be worth attacking, so I
                    put four thousand texts drawn at random to the pattern,
                    each up to thirty characters long and each drawn from 1,972
                    different characters with spacing of four kinds, a fraction,
                    a Roman numeral, a superscript, a subscript and an
                    underscore among them, and asked every time whether the
                    pieces written one after another were the text again. They
                    were, four thousand times out of four thousand.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Six of six sentences come back exactly here and none of six
                  under any of the four earlier rules. The pattern is no better
                  than the others at saying where the words are, and it is the
                  only one of the five whose answer can be undone by somebody
                  who knows nothing about English.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Two texts that differ only in their spacing">
                <p>
                  The sharpest way to see what discarding the spacing costs is
                  to write two texts that differ in nothing else. Put{" "}
                  <span className="font-mono">one two</span> beside{" "}
                  <span className="font-mono">one&nbsp;&nbsp;two</span>, with two
                  spaces in the second, and ask each rule what it makes of them.
                </p>
                <p>
                  All four earlier rules answer with the identical two pieces
                  both times, and the panel above puts three more pairs to them,
                  a doubled space inside a sentence, a tab standing where a
                  space stood and a line break standing where a space stood. In
                  all sixteen of those readings the two texts of a pair came
                  back as one answer. Under the pattern all four pairs come back
                  as two answers, because the spacing is inside the pieces
                  rather than between them.
                </p>
                <p>
                  That looks at first like a small matter of tidiness, and what
                  it actually bounds is what a model can be asked for. A model
                  trained on pieces that cannot tell a line break from a space
                  has no way to produce a line break, and a list, a table or a
                  program is laid out in precisely the characters those rules
                  threw away.
                </p>
                <KeepInMind>
                  Two texts that differ come back as one answer under every rule
                  that treats spacing as a separator, and as two answers under a
                  rule that treats it as writing. Nothing downstream can recover
                  a distinction the pieces do not carry.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Expression, Twelve Branches",
          content: (
            <>
              <SubSection title="5. The whole rule is one line">
                <p>
                  The four earlier rules are lists of clauses, and one of them
                  needs a data file besides. This one is a single regular
                  expression, and the expression is the whole of the method.
                  Every non-empty match is a piece, the matches are taken left
                  to right without overlapping, and there is nothing else.
                </p>
                <Equation>
                  {"'s|'t|'re|'ve|'m|'ll|'d| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+"}
                </Equation>
                <p>
                  Read the vertical bars as the word &ldquo;or&rdquo; and the
                  expression is a list of twelve things, tried in the order they
                  are written. At each position the engine tries the first, then
                  the second, and takes the first one that succeeds; that match
                  becomes a piece, and the search starts again from the
                  character after it. So the order carries weight of its own,
                  since it is what settles every position where two branches
                  could both have matched.
                </p>
                <p>
                  A regular expression is a description of a set of strings,
                  written in a small notation of its own, and an engine is the
                  program that reads the description and finds the stretches
                  of a text that fit it. The notation is large, and this
                  expression uses very little of it. The ten marks below are
                  all of them, and each of the next four sections is one or two
                  of them at work.
                </p>
                <DerivationTable
                  expressionHeading="the notation"
                  reasonHeading="how to read it"
                  rows={[
                    {
                      expression: "'t",
                      reason:
                        "those characters, exactly as written, an apostrophe and then the letter t",
                    },
                    {
                      expression: "a|b",
                      reason:
                        "either the thing on the left or the thing on the right, with the left tried first",
                    },
                    {
                      expression: " ?",
                      reason:
                        "one space if a space is there, and nothing if it is not",
                    },
                    {
                      expression: "\\p{L}",
                      reason: "any one letter, of any script",
                    },
                    {
                      expression: "\\p{N}",
                      reason:
                        "any one character filed as a number, the ordinary digits among them",
                    },
                    {
                      expression: "\\s",
                      reason:
                        "any one character of spacing, which covers a space, a tab and a line break",
                    },
                    {
                      expression: "\\S",
                      reason: "any one character that is not spacing",
                    },
                    {
                      expression: "[^ ... ]",
                      reason:
                        "any one character that is none of the things listed between the brackets",
                    },
                    {
                      expression: "+",
                      reason:
                        "one or more of whatever stands just before it, taking as many as it can",
                    },
                    {
                      expression: "(?! ... )",
                      reason:
                        "succeeds only where the thing inside does not come next, and takes no characters itself",
                    },
                  ]}
                />
                <p>
                  Read with those, the eighth branch says an optional space
                  followed by one or more letters, and the eleventh says one or
                  more characters of spacing with nothing but spacing, or
                  nothing at all, coming next.
                </p>
                <p>
                  Three of the twelve read the writing, two read the spacing,
                  and the seven at the front are a list of English contractions
                  which Part 3 is about. The next three sections take the middle
                  five one at a time.
                </p>
                <KeepInMind>
                  Twelve alternatives, tried in order, first one wins. Everything
                  else on this page is a consequence of which twelve they are and
                  what order they are in.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Three branches that carve everything which is not spacing">
                <p>
                  The middle three branches are the ones doing nearly all the
                  work. They say that a run of letters is one thing, a run of
                  digits is one thing, and a run of anything else that is not
                  spacing is one thing, and they are tried in that order.
                </p>
                <Equation>
                  {" ?\\p{L}+        a run of letters\n" +
                    " ?\\p{N}+        a run of numbers\n" +
                    " ?[^\\s\\p{L}\\p{N}]+   a run of everything else that is not spacing"}
                </Equation>
                <p>
                  Between them those three classes account for every character
                  that is not spacing, with no character in two of them, which
                  is why nothing is ever dropped and why every position starts a
                  match. That is also exactly the repair the pattern was written
                  for. A run of letters stops at a full stop whether or not a
                  linguist would call the stop part of the word, so{" "}
                  <span className="font-mono">dog</span> and{" "}
                  <span className="font-mono">dog.</span> are never two rows in
                  anything learned afterwards, and the rule needed no list of
                  abbreviations and no knowledge of English to say so.
                </p>
                <p>
                  What it costs is the reverse case. On our sentence{" "}
                  <span className="font-mono">low-cost</span> comes apart into
                  three pieces and{" "}
                  <span className="font-mono">re-analysis</span> into three
                  more, because a hyphen is not a letter, and{" "}
                  <span className="font-mono">3.14</span> would come apart into
                  three as well. The rule knows nothing about compounds and
                  nothing about numbers, and that is the same fact as its
                  knowing nothing about abbreviations.
                </p>
                <KeepInMind>
                  Letters, digits, and everything else that is not spacing. A
                  partition of the characters rather than a description of the
                  language, which is why it applies unchanged to a text in any
                  script and why it will cut a compound word in half.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The question mark in front, which is the whole idea">
                <p>
                  Each of those three branches begins with{" "}
                  <span className="font-mono">&nbsp;?</span>, a space followed by
                  a question mark, which in this notation means one space if
                  there is one and nothing if there is not. So a run of letters
                  reaches backwards by one character and takes the space in front
                  of it along.
                </p>
                <Equation>
                  {'the drift    ->    "the"  " drift"\n' +
                    'thedrift     ->    "thedrift"'}
                </Equation>
                <p>
                  Everything the space attachment buys follows from that one
                  optional character. The spacing ends up inside the pieces, so
                  the pieces join back to the writing. A word that begins a line
                  and the same word in the middle of a sentence become two
                  different pieces, which is information a model can use, since
                  in English they are genuinely different situations. And a
                  vocabulary learned over these pieces afterwards will hold{" "}
                  <span className="font-mono">&nbsp;the</span> with its space
                  rather than <span className="font-mono">the</span> without it,
                  which is why the pieces such a model works in so often look
                  like words with a space stuck to the front.
                </p>
                <p>
                  It also buys length, which was the stated reason. Deleting
                  those three characters from the pattern and changing nothing
                  else turns our sentence from fourteen pieces into twenty, since
                  each of the six spaces then stands alone, and turns the six
                  sentences of the notebook from 85 pieces into 142.
                </p>
                <Equation>
                  {"142 − 85   =  57 pieces saved\n" +
                    "57 / 142   ≈  40 per cent"}
                </Equation>
                <p>
                  That is 57 pieces saved on six sentences, or a text forty per
                  cent shorter for everything downstream to read. The 57 is
                  also the number of spaces in the six sentences, since the
                  only thing the change does is decide whether a space is a
                  piece of its own or the front of the piece after it.
                </p>
                <KeepInMind>
                  One optional character, written in three places, is what puts
                  the spacing inside the pieces instead of between them. It costs
                  nothing to write and it saves 57 pieces on six sentences
                  against the same pattern with those three characters taken out.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The branch that hands the last space back">
                <p>
                  The eleventh branch is the one that looks fussy on first
                  reading and turns out to be protecting the previous three. It
                  is{" "}
                  <span className="font-mono">\s+(?!\S)</span>, which reads as a
                  run of spacing that is not followed by anything other than
                  spacing.
                </p>
                <p>
                  Consider two spaces in a row. The word branches cannot start
                  there, since each takes at most one space and then needs a
                  letter. The greedy reading would take both spaces as one piece
                  and leave the following word bare. This branch refuses to do
                  that. It takes as much spacing as it can while stopping short
                  of the next piece of writing, so it hands the final space back
                  for the following word to claim.
                </p>
                <WorkedExample title="Two spaces, with the branch and without it">
                  <Equation>
                    {'Dr.  Alvarez  didn\'t expect\n\n' +
                      "with it        Dr  .  ·  ·Alvarez  ·  ·didn  't  ·expect\n" +
                      "without it     Dr  .  ··  Alvarez  ··  didn  't  ·expect"}
                  </Equation>
                  <p>
                    Eight pieces both times, so the branch is not buying length.
                    What it buys is that{" "}
                    <span className="font-mono">·Alvarez</span> after two spaces
                    is the same piece as{" "}
                    <span className="font-mono">·Alvarez</span> after one, where
                    without the branch the second reading gives a bare{" "}
                    <span className="font-mono">Alvarez</span> and the corpus
                    ends up holding both.
                  </p>
                </WorkedExample>
                <p>
                  Attaching the space to the following word is only worth doing
                  if a word reliably has its space, and irregular spacing is
                  exactly the case where it would not, which is what the branch
                  is for. Six sentences of ordinary prose never
                  reach this branch at all, because a single space is claimed by
                  the word after it and the branch is never tried.
                </p>
                <KeepInMind>
                  Doubled spacing is common in real writing and would otherwise
                  produce a second spelling of every word that follows it. The
                  branch costs one lookahead and closes that hole, at no cost in
                  pieces.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Twelve branches, and the four that six sentences reach">
                <p>
                  The last branch is a bare run of spacing, which catches
                  whatever is left, and that is the twelve. It is worth seeing
                  which of them actually do anything, since a rule with twelve
                  clauses and a rule with four are different objects however the
                  first is written.
                </p>
                <BranchReader />
                <p>
                  Over the six sentences, four of the twelve claimed a piece. The
                  letters branch took 68 of the 85, which is four pieces in
                  five; the marks branch took 15; the digits branch took one,
                  which is the year in the third sentence; and one of the seven
                  contractions took one, which is the{" "}
                  <span className="font-mono">&rsquo;t</span> of{" "}
                  <span className="font-mono">didn&rsquo;t</span>. The other
                  eight branches, six contractions and both spacing branches,
                  never fired. The spacing branches are unreached because single
                  spaces are claimed by the words after them, which is the
                  previous section&rsquo;s point arriving as a count.
                </p>
                <p>
                  One more thing about the notation, which is a small point and a
                  real one. An expression that is not well formed is refused
                  before it reads any text at all, since a bracket that never
                  closes names no set of matches and therefore no rule. Three
                  plausible mistypings of a single branch are in the panel above
                  and all three are refused. That is the one kind of error this
                  method can report; every other failure it has is silent, which
                  is Part 6.
                </p>
                <KeepInMind>
                  Twelve branches, four of them reached by six sentences, and one
                  of them claiming four pieces in five. The remaining eight are
                  there for writing that ordinary prose does not contain, which is
                  a description of most of this pattern.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The running sentence is fifty-one characters, six of them spaces. How many of the fourteen pieces begin with a space?",
              ["Six", "None", "Eight", "Fourteen"],
              0,
              "Reading the spans down, they run from 0 to 51 with no gap anywhere, so every character of the sentence, spaces included, is inside some piece and inside exactly one. Six spaces therefore turn up at the front of six pieces rather than being thrown away.",
            ),
            trueFalse(
              "Because its pieces give the sentence back exactly, the pattern is also better than the four earlier rules at saying where the words are.",
              false,
              "It is no better at that, and giving the writing back is a different property. What it does have is that its answer can be undone by somebody who knows nothing about English, where the three rules that read writing need a second set of conventions about the language before they can produce a sentence at all.",
            ),
            several(
              "Which of these follow from the optional space at the front of the three writing branches?",
              [
                "The spacing ends up inside the pieces, so the pieces join back to the writing",
                "A word beginning a line and the same word in the middle of a sentence become two different pieces",
                "The six sentences give 85 pieces where the same pattern without it gives 142",
                "A vocabulary learned over these pieces holds the with its space in front rather than without it",
              ],
              [0, 1, 2, 3],
              "All four follow from one optional character written in three places. It puts the spacing inside the pieces, which is why they join back, and it saves 57 pieces on six sentences, one for every space, which is a text forty per cent shorter for everything downstream to read. The price is that a word with its space and the same word without are two pieces, which is why the pieces such a model works in so often look like words with a space stuck to the front.",
            ),
            choice(
              "Over the six sentences, how many of the twelve branches claimed a piece?",
              ["Four", "Five", "Nine", "All twelve"],
              0,
              "The letters branch took 68 of the 85, which is four pieces in five, the marks branch took 15, the digits branch took the year in the third sentence, and one of the seven contractions took the ending of didn’t. Both spacing branches never fired, because a single space is claimed by the word after it.",
            ),
            choice(
              "What does the eleventh branch, a run of spacing not followed by anything other than spacing, buy?",
              [
                "That a word after two spaces is the same piece as the same word after one",
                "Shorter texts, since a run of spacing becomes a single piece",
                "That spacing at the very end of a text is never dropped",
                "A guarantee that no piece is ever empty",
              ],
              0,
              "It is eight pieces either way, so the branch is not buying length. It takes as much spacing as it can while stopping short of the next piece of writing, handing the final space back for the following word to claim, and without it the doubled-space reading leaves a bare word that the corpus then holds as a second spelling.",
            ),
        ],
        },
        {
          title: "Part 3. The Seven Spellings at the Front",
          content: (
            <>
              <SubSection title="10. Why they are written first">
                <p>
                  The seven branches at the head of the expression are seven
                  literal spellings, and they are the only place in the whole
                  pattern where a particular language appears.
                </p>
                <Equation>{"'s   't   're   've   'm   'll   'd"}</Equation>
                <p>
                  Being first is what makes them do anything. An apostrophe is
                  not a letter, so without these seven the marks branch would
                  claim it, and{" "}
                  <span className="font-mono">didn&rsquo;t</span> would come out
                  as three pieces rather than two. Deleting them from the pattern
                  and changing nothing else takes our sentence from fourteen
                  pieces to fifteen, with{" "}
                  <span className="font-mono">&rsquo;</span> and{" "}
                  <span className="font-mono">t</span> standing separately where{" "}
                  <span className="font-mono">&rsquo;t</span> stood.
                </p>
                <p>
                  Notice also that these seven carry no optional space, unlike
                  the three branches beneath them. That is not an oversight. A
                  contraction ending never has a space in front of it, since it
                  is glued to the word it belongs to, so an optional space would
                  match nothing it was not going to match anyway.
                </p>
                <KeepInMind>
                  Seven spellings, written before everything else so that they
                  beat the branch which would otherwise claim the apostrophe. It
                  is the one clause here that could not have been written by
                  somebody who did not know which language the text was in.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the seven catch">
                <p>
                  What they catch is a verb ending that English writes as part of
                  the previous word. Six of the seven are verb forms, and one,
                  the first, is the possessive that is spelt the same way as the
                  contraction of <span className="font-mono">is</span>.
                </p>
                <NumberTable
                  headings={["in the writing", "the pattern", "what the ending is"]}
                  rows={[
                    ["it’s here", "it / ’s / ·here", "is, or a possessive"],
                    ["they’re here", "they / ’re / ·here", "are"],
                    ["I’ve seen it", "I / ’ve / ·seen / ·it", "have"],
                    ["we’ll see", "we / ’ll / ·see", "will"],
                    ["he’d gone", "he / ’d / ·gone", "had, or would"],
                    ["she didn’t go", "she / ·didn / ’t / ·go", "not"],
                    [
                      "she’d’ve gone",
                      "she / ’d / ’ve / ·gone",
                      "two of them, matched one after the other",
                    ],
                  ]}
                  caption="A slash separates one piece from the next, and a raised dot inside a piece is a space the piece carries. The last row is the one worth noticing, where two of the seven match in a row and the word comes apart into three."
                />
                <p>
                  The cut falls at the apostrophe every time, which is the
                  translation rules&rsquo; choice rather than the annotation
                  rules&rsquo;. On{" "}
                  <span className="font-mono">didn&rsquo;t</span> the annotation
                  rules produce <span className="font-mono">did</span> and{" "}
                  <span className="font-mono">n&rsquo;t</span>, because the
                  negation is a morpheme spelt with the n; here the pieces are{" "}
                  <span className="font-mono">·didn</span> and{" "}
                  <span className="font-mono">&rsquo;t</span>, so the second is
                  not a morpheme of anything and the first is not a word. What
                  makes that acceptable is that nothing downstream is expected to
                  read a piece as a word.
                </p>
                <KeepInMind>
                  The seven turn one written word into two pieces at the
                  apostrophe. They are a fact about how English spells a handful
                  of verb endings, and they get their answer from the spelling
                  rather than from the grammar.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What they miss, which was half of what I put to them">
                <p>
                  A list of seven literal spellings misses everything that is not
                  one of those seven spellings, and the interesting part is how
                  ordinary the misses are. I put twelve texts to the branch,
                  chosen to be things a person actually types, and six of them
                  matched nothing.
                </p>
                <ContractionGallery />
                <p>
                  Two of the misses are the same word written slightly
                  differently. A sentence in capitals misses, because the seven
                  are written in small letters and the notation is case
                  sensitive, so{" "}
                  <span className="font-mono">IT&rsquo;S</span> comes out as
                  three pieces where{" "}
                  <span className="font-mono">it&rsquo;s</span> comes out as two.
                  A word processor&rsquo;s curved apostrophe misses, because the
                  seven name the straight one, and{" "}
                  <span className="font-mono">didn&rsquo;t</span> typed that way
                  comes out as three pieces where the same word typed with the
                  straight mark comes out as two. Both of those are the same
                  sentence to a reader and two different sequences to whatever
                  reads the pieces.
                </p>
                <p>
                  One miss is no contraction at all. The apostrophe of{" "}
                  <span className="font-mono">the students&rsquo; notes</span>{" "}
                  has no letter after it, so none of the seven spellings can
                  begin there, and it stands alone as a mark between{" "}
                  <span className="font-mono">·students</span> and{" "}
                  <span className="font-mono">·notes</span>.
                </p>
                <p>
                  The other three are words the list simply does not hold.{" "}
                  <span className="font-mono">y&rsquo;all</span> and{" "}
                  <span className="font-mono">o&rsquo;clock</span> come apart
                  into three pieces each, and a French{" "}
                  <span className="font-mono">l&rsquo;analyse</span> comes apart
                  into three as well, with the article and the noun in separate
                  pieces and the mark alone between them. The annotation rules
                  keep all three whole, which is one of the two places on this
                  page where a rule from an earlier page is straightforwardly
                  ahead of this one, and section 17 is the other.
                </p>
                <KeepInMind>
                  Six of twelve ordinary spellings reach no branch, and what
                  comes back from each of the six is a longer reading of a word
                  the corpus already holds spelt another way. Nothing is refused,
                  no piece looks wrong, and nothing anywhere reports that a list
                  was consulted and found nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The branch that fires on a word it was not written for">
                <p>
                  The misses are one half of what a list of spellings does, and
                  this is the other. The branch matching{" "}
                  <span className="font-mono">&rsquo;t</span> was written for the
                  end of <span className="font-mono">didn&rsquo;t</span>, and it
                  fires on any apostrophe followed by a t, wherever that pair
                  stands.
                </p>
                <Equation>
                  {"didn't cold    ->    didn    't    ·cold\n" +
                    "'twas cold     ->    't      was   ·cold"}
                </Equation>
                <p>
                  In the second the pattern has cut a word at its own beginning
                  and produced a piece that stands for the elided{" "}
                  <span className="font-mono">it</span> of an archaic{" "}
                  <span className="font-mono">it was</span>, using a branch whose
                  only reason for existing is the negation. Nothing is wrong with
                  the pieces, in the sense that they join back to the word, and
                  the piece is nonetheless the wrong piece, since it will share a
                  row in everything downstream with every negated verb in the
                  corpus.
                </p>
                <WhyThisWorks title="Why a longer list does not close this">
                  <p>
                    The obvious repair is more spellings, and it works for any
                    particular word. What it cannot change is the shape of the
                    answer. These branches are spellings, so they fire on the
                    spelling wherever it appears, and any spelling short enough
                    to be common is short enough to appear inside something else.
                    Adding{" "}
                    <span className="font-mono">&rsquo;a</span> to catch{" "}
                    <span className="font-mono">y&rsquo;all</span> would then
                    cut every French{" "}
                    <span className="font-mono">l&rsquo;analyse</span> after the
                    article rather than before the noun, which is worse than what
                    it does now.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The same two characters end a negation and begin an archaic
                  contraction of two other words, and a branch written as a
                  spelling cannot tell those apart, because it was never given
                  anything to tell them apart with. Lengthening the list moves
                  which words are affected without changing that.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What the pattern that followed changed">
                <p>
                  These are not academic complaints, and the evidence is that the
                  tokenizers released for the models after this one repair two of
                  them and leave the rest. The panel above shows both changes on
                  the texts that exhibit them.
                </p>
                <Equation>
                  {"'s|'t|'re|'ve|'m|'ll|'d     becomes    (?i:'s|'t|'re|'ve|'m|'ll|'d)\n" +
                    " ?\\p{N}+                    becomes     ?\\p{N}{1,3}"}
                </Equation>
                <p>
                  The first makes the seven spellings insensitive to case, so a
                  sentence shouted in capitals is cut the same way as the same
                  sentence written normally, and the seven-piece reading of{" "}
                  <span className="font-mono">THE DRIFT DIDN&rsquo;T GO AWAY</span>{" "}
                  becomes a six-piece one. The second caps a run of digits at
                  three characters, so{" "}
                  <span className="font-mono">1000000</span> becomes three pieces
                  rather than one, and a long figure the model has never seen
                  before becomes groups of digits it has seen many times. That
                  one costs length, since the same sentence goes from seven
                  pieces to nine.
                </p>
                <p>
                  What did not change is the case that has no cheap repair.
                  Nothing in either pattern catches the curved apostrophe, nothing
                  holds{" "}
                  <span className="font-mono">y&rsquo;all</span>, and the cut on{" "}
                  <span className="font-mono">didn&rsquo;t</span> still falls at
                  the mark rather than in front of the negation. Those are the
                  ones that would need a list per language rather than a change to
                  a branch.
                </p>
                <KeepInMind>
                  Two changes, one buying consistency at no cost and one buying
                  arithmetic at a cost in length. Both leave the seven spellings a
                  list of English forms, which is what section 23 is about.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What It Costs",
          content: (
            <>
              <SubSection title="15. More pieces than any rule before it">
                <p>
                  The bill is length. Everything reading the text afterwards pays
                  per piece, and a model that compares every position with every
                  other position pays roughly with the square of the count, so a
                  rule that separates a hyphen is spending on every pass over the
                  corpus for the rest of the pipeline&rsquo;s life.
                </p>
                <PatternCostPanel />
                <p>
                  Over the six sentences the pattern gives 85 pieces where
                  splitting on spaces gives 63, the boundary rules give 69 and
                  both rule lists give 72.
                </p>
                <Equation>
                  {"85 − 63   =  22 more pieces\n" +
                    "22 / 63   ≈  35 per cent"}
                </Equation>
                <p>
                  That is 35 per cent more than the
                  crudest rule from identical writing, and it is the largest
                  count of the five. It also keeps all 375 characters where the
                  three rules that keep the writing keep 318 and the boundary
                  rules keep 303, so part of the extra length is the spacing
                  itself now being carried.
                </p>
                <p>
                  The row worth reading twice is the last one, which is the
                  pattern with its optional space deleted. That gives 142 pieces
                  for the same six sentences, and it is the honest comparison,
                  since it is the only other arrangement that also gives every
                  sentence back. Against a rule that keeps the spacing at all, 85
                  is the short answer rather than the long one.
                </p>
                <KeepInMind>
                  85 pieces against 63, or 85 against 142 if the comparison is
                  restricted to rules that can give the writing back. Which of
                  those two numbers is the fair one depends entirely on whether a
                  reader has to be handed the text at the end.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. The same word, spelt twice">
                <p>
                  The cost that is not length is the one the space attachment
                  causes directly. A word carries its leading space, so the same
                  word with and without one are two different pieces, and
                  anything counting pieces afterwards keeps two rows where a rule
                  that discarded the spacing would keep one.
                </p>
                <p>
                  Over the six sentences the pattern produces 53 different
                  pieces, where splitting on spaces produces 47, the boundary
                  rules 47, the annotation rules 48 and the translation rules 49.
                  Forty-one of the 53 begin with a space. Two words are spelt both
                  ways in the same six sentences, and the panel above names them.{" "}
                  <span className="font-mono">Alvarez</span> begins the third
                  sentence and stands mid-sentence in the first, and{" "}
                  <span className="font-mono">analysis</span> stands after a space
                  twice and after the hyphen of{" "}
                  <span className="font-mono">re-analysis</span> twice.
                </p>
                <InAModel>
                  <>
<p>
                    That reads like a defeat and the arithmetic is more interesting than that. Deleting the optional space, which removes the doubling entirely, gives 52 different pieces rather than 53. So the whole cost of attaching the space, on this corpus, is one extra row, and what it bought was 57 fewer pieces. Six sentences are far too few to settle anything, and the direction is worth reporting, since the doubling is the objection that is always raised and it is bounded in a way the length saving is not.
                  </p>
                  <p>
                    A word is spelt at most twice however often it appears, while every occurrence of it pays the length.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  53 different pieces against 47 for the crudest rule, and 53
                  against 52 for the same pattern with the space attachment taken
                  out, so on these six sentences the doubling costs one row and
                  the space attachment saves 57 pieces.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Where an earlier rule is the better one">
                <p>
                  There is a kind of writing on which this method does nothing
                  whatever, and it is not an exotic one. Handed a sentence in a
                  script that puts no spaces between its words, the pattern finds
                  a single run of letters and answers with one piece.
                </p>
                <Equation>
                  {"低コストの再分析\n\n" +
                    "        the pattern        one piece, the whole sentence\n" +
                    "        the boundary rules 低  コスト  の  再  分  析"}
                </Equation>
                <p>
                  The boundary rules of the second sibling page give six pieces
                  there, because the standard has rules about which scripts break
                  between characters and this pattern has a class called
                  &ldquo;letter&rdquo; and nothing else. The pattern is not wrong
                  in any sense it would recognise, since its pieces do join back
                  to the sentence; it has simply found nothing. Whatever runs
                  afterwards has to do the entire job, and the pages on{" "}
                  <Link href="/concepts/maximum-matching" className={link}>
                    maximum matching
                  </Link>{" "}
                  and{" "}
                  <Link href="/concepts/the-word-lattice" className={link}>
                    the word lattice
                  </Link>{" "}
                  are about doing it.
                </p>
                <p>
                  That is the honest description of what the pattern is for. It
                  is a cheap first cut that stops a later stage from joining
                  characters that should not be joined, and where the writing has
                  no spaces there is almost nothing for it to stop.
                </p>
                <KeepInMind>
                  One piece against six on the same eight characters. A rule
                  built out of character kinds and a space is a rule about
                  writing systems that use a space, and it says so by returning
                  the whole sentence.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. A first cut, before any vocabulary is learned">
                <p>
                  It is worth being exact about where this method stops, because
                  the pieces on this page are not what a model reads. They are the
                  units a vocabulary is then learned inside, and{" "}
                  <span className="font-mono">·Alvarez</span> will very likely be
                  cut again into two or three smaller pieces by the method on the{" "}
                  <Link href="/concepts/byte-pair-encoding" className={link}>
                    byte pair encoding
                  </Link>{" "}
                  page.
                </p>
                <p>
                  What the pattern does is forbid certain joins. A later stage
                  that counts adjacent pairs and merges the commonest will never
                  be offered the pair that would make{" "}
                  <span className="font-mono">dog.</span> one unit, because the{" "}
                  <span className="font-mono">g</span> and the{" "}
                  <span className="font-mono">.</span> are in different pieces
                  and it never sees across a boundary. That is why the pattern
                  had to come first and why it can be as crude as it is; the
                  refinement happens afterwards and this stage only has to stop
                  the refinement from going somewhere it should not.
                </p>
                <KeepInMind>
                  The pattern draws walls that the learning is not allowed to
                  cross, and it draws them out of character kinds because that is
                  the cheapest description of &ldquo;these two things are not the
                  same sort of thing&rdquo; that needs no corpus.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "The branch that matches an apostrophe and a t was written for the end of didn’t. What does it do to ’twas cold?",
              [
                "It fires at the front of the word, giving ’t and was, so a piece standing for an elided it shares a row with every negation",
                "Nothing, since the branch fires only at the end of a word",
                "It leaves ’twas whole, since no letter stands in front of the apostrophe",
                "It leaves the apostrophe standing alone, as it does in y’all",
              ],
              0,
              "The seven branches are spellings, so each fires on its spelling wherever that stands, and a spelling short enough to be common is short enough to turn up inside something else. The pieces still join back to the word, and the piece is nonetheless the wrong one for everything downstream. A longer list moves which words are affected without changing that shape.",
            ),
            several(
              "Twelve ordinary spellings were put to the contraction branches and six matched nothing. Which of these were among the misses?",
              [
                "A sentence in capitals, since the seven are written in small letters and the notation is case sensitive",
                "A word processor’s curved apostrophe, since the seven name the straight one",
                "she’d’ve, since two of the seven cannot match one after the other",
                "didn’t typed with the straight mark, which the list was written for",
              ],
              [0, 1],
              "IT’S and didn’t with a curved mark each come out as three pieces where the ordinary spelling gives two, and nothing anywhere reports that a list was consulted and found nothing. Two of the seven do match in a row, so she’d’ve comes apart into three pieces with both endings caught, and didn’t with the straight mark is the case the branch exists for. The other misses were y’all, o’clock, a French l’analyse and a possessive whose apostrophe has no letter after it.",
            ),
            choice(
              "What did the tokenizers released for the models after this one change?",
              [
                "They made the seven spellings case insensitive and capped a run of digits at three characters",
                "They added the curved apostrophe to the seven and made room for y’all",
                "They moved the cut on didn’t to fall in front of the negation",
                "They dropped the seven spellings so the pattern reads every language alike",
              ],
              0,
              "One buys consistency at no cost, since a sentence shouted in capitals is then cut the way the same sentence written normally is. The other buys arithmetic at a cost in length, since a long figure becomes groups of digits the model has seen many times and the same sentence goes from seven pieces to nine. The curved apostrophe, y’all and the place of the cut on didn’t are exactly what did not change, and the seven spellings are still a list of English forms.",
            ),
            choice(
              "The pattern gives 85 pieces over the six sentences. Which comparison does the page call the honest one?",
              [
                "85 against the 142 the same pattern gives with its optional space deleted",
                "85 against the 63 of splitting on spaces",
                "85 against the 69 of the boundary rules",
                "85 against the 72 of both rule lists",
              ],
              0,
              "The deleted-space version is the only other arrangement that also gives every sentence back, so it is the one comparison between two rules answering the same question. Against the crudest rule, 85 is 35 per cent more from identical writing and the largest count of the five, and which of the two numbers is fair depends entirely on whether a reader has to be handed the text at the end.",
            ),
            trueFalse(
              "Over these six sentences, attaching the space to the following word costs one extra distinct piece and saves 57 pieces of length.",
              true,
              "The pattern produces 53 different pieces against 47 for the crudest rule, but deleting the optional space, which removes the doubling entirely, gives 52 rather than 53 and 142 pieces rather than 85. Only Alvarez and analysis are spelt both ways here. A word is spelt at most twice however often it appears, while every occurrence of it pays the length, so the doubling is bounded in a way the saving is not.",
            ),
        ],
        },
        {
          title: "Part 5. One Pattern, Two Engines",
          content: (
            <>
              <SubSection title="19. Two classes named by Unicode's own categories">
                <p>
                  Everything above has been read off the published expression,
                  and running it requires an engine, and this is where a pattern
                  turns out not to be quite a rule. Two of the classes in it are
                  named by Unicode general category. A letter is anything the
                  standard files under the letter categories, written{" "}
                  <span className="font-mono">\p&#123;L&#125;</span>, and a
                  number is anything filed under the number categories, written{" "}
                  <span className="font-mono">\p&#123;N&#125;</span>.
                </p>
                <p>
                  Python&rsquo;s own regular expression engine has no such
                  notation, and the published pattern was written for a
                  third-party one that does. So running it here means writing the
                  two classes another way, and the two nearest things available
                  are not the same two classes.
                </p>
                <NumberTable
                  headings={["as published", "written here", "and the difference"]}
                  rows={[
                    [
                      "a letter is \\p{L}",
                      "a letter is [^\\W\\d_]",
                      "a word character that is neither a digit nor the underscore, which admits everything a letter category holds and some things it does not",
                    ],
                    [
                      "a number is \\p{N}",
                      "a number is \\d",
                      "a decimal digit only, where the number categories also hold Roman numerals, fractions, superscripts and a good deal else",
                    ],
                    [
                      "everything else is [^\\s\\p{L}\\p{N}]",
                      "everything else is [^\\s\\w]|_",
                      "the underscore has to be written back in by hand, and section 20 is what happens if it is not",
                    ],
                  ]}
                  caption="Three classes, and none of them translates exactly. The first two are the interesting pair, because between them they move 1,151 characters from one class to the other."
                />
                <KeepInMind>
                  The published pattern names its classes by an external
                  standard, and an engine that cannot name that standard has to
                  approximate it. The approximation is close and it is not exact,
                  and the rest of this part is how far off it is.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The character that would otherwise have vanished">
                <p>
                  Start with the third class, because its failure is the loudest
                  and the easiest to check. The published version says everything
                  that is not spacing, a letter or a number, and the underscore
                  is none of those three, so it is caught. The obvious short form
                  here says everything that is not spacing and not a word
                  character, and to this engine the underscore is a word
                  character.
                </p>
                <p>
                  So the underscore falls into no class at all. It is not a
                  letter under the first branch, which excludes it explicitly, it
                  is not a digit, it is not caught by the short form of the third,
                  and it is not spacing. No branch matches at that position, the
                  engine advances one character, and the character is simply gone.
                </p>
                <WorkedExample title="One file name, with the class written out and with the short form">
                  <Equation>
                    {"re-analysis_2019.csv\n\n" +
                      "written out    re  -  analysis  _  2019  .  csv     joins back to the name\n" +
                      "short form     re  -  analysis     2019  .  csv     one character is in no piece"}
                  </Equation>
                  <p>
                    Nothing is raised, the pieces look entirely reasonable, and
                    the test that catches it is the round trip of section 3. That
                    is the argument for having a test of that shape at all, since
                    reading the pieces would not have found it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A pattern whose branches do not between them cover every
                  character drops the ones they miss, silently, one at a time.
                  The published classes cover everything and the nearest short
                  form here does not, which is a translation error rather than a
                  difference of opinion.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The exact texts that come out differently">
                <p>
                  The letters and the numbers are the pair that cannot be
                  repaired, and the reason is a disagreement about what counts as
                  a digit. To measure it, I built the published classes out of
                  Unicode&rsquo;s own general categories, one codepoint at a time
                  over all 1,114,112 of them, so both readings run through the
                  same machinery and the classes are the only thing between them.
                </p>
                <DialectPanel />
                <p>
                  Unicode files 1,831 characters under a number category. Of
                  those, 680 are decimal digits and are numbers under both
                  readings. The remaining 1,151, which is where Roman numerals,
                  vulgar fractions, superscripts and subscripts live, are numbers
                  to the published classes and letters here, because the test for
                  a letter used here is a word character that is not a decimal
                  digit and those characters pass it. In the other direction there
                  is no disagreement at all. All 136,104 characters Unicode files
                  as letters are letters under both readings.
                </p>
                <p>
                  Three of the seven texts in the panel split differently, and
                  they are the ones to quote.{" "}
                  <span className="font-mono">1½</span> is one piece as published
                  and two here, since the published reading joins the figure and
                  the fraction into one run of numbers while here the figure is a
                  digit and the fraction is a letter.{" "}
                  <span className="font-mono">aⅫ</span> is two pieces as published
                  and one here, for the mirror-image reason. And{" "}
                  <span className="font-mono">a²</span> and{" "}
                  <span className="font-mono">x₂</span> are each cut in two as
                  published and each kept whole here.
                </p>
                <KeepInMind>
                  1,151 characters of Unicode are in one class as published and
                  the other class here, and 136,104 are in the same class under
                  both. Any text containing one of the 1,151 is a text on which
                  the two readings can part.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. How far the difference reaches, and where it stops">
                <p>
                  Before treating that as a serious defect it is worth asking
                  when it shows, because a character being in the wrong class is
                  not the same as a text being cut differently. The classes only
                  decide where one run stops and the next begins, so a character
                  with spacing on both sides is a run of one whichever class it
                  is in.
                </p>
                <p>
                  I put each of the 1,151 into four arrangements and asked
                  whether the two readings gave different pieces. Standing alone
                  between two spaces, 0 of the 1,151 split differently. Directly
                  after a letter, all 1,151 did. Directly after a digit, all
                  1,151 did. Directly before a letter, all 1,151 did. The
                  condition is exactly adjacency, with no exceptions in either
                  direction, and{" "}
                  <span className="font-mono">chapter Ⅻ of the agreement</span>{" "}
                  is read identically by both while{" "}
                  <span className="font-mono">1½</span> is not.
                </p>
                <p>
                  On ordinary English writing it therefore never shows. All six
                  sentences of the notebook are cut identically by both readings,
                  as are the Cyrillic and Arabic-digit texts in the panel, and no
                  alphabetic script can produce a difference at all, since every
                  one of the 136,104 characters Unicode calls a letter is a
                  letter under both readings. The difference is confined to
                  writing that puts one of a particular 1,151 characters directly
                  against a letter or a digit, which is a real kind of writing
                  and a narrow one.
                </p>
                <KeepInMind>
                  0 of 1,151 differ standing alone and 1,151 of 1,151 differ
                  beside a letter or a digit, so the disagreement is about
                  adjacency rather than about the characters themselves. Every
                  count on the rest of this page is unaffected, because none of
                  the sentences counted contains one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="23. Seven spellings are a statement about one language">
                <p>
                  Five of the twelve branches read character kinds and apply to
                  any writing at all. The other seven are a list of English verb
                  endings, and they sit at the head of the expression where they
                  are tried before everything else, so the part of the method
                  that is specific to one language is also the part that runs
                  first.
                </p>
                <p>
                  What that costs on another language is not that the pattern
                  does the wrong thing there, since it has nothing to say about
                  the case at all. A French text meets a rule that cuts after{" "}
                  <span className="font-mono">&rsquo;t</span> and has no clause
                  at all for{" "}
                  <span className="font-mono">l&rsquo;</span>, so{" "}
                  <span className="font-mono">l&rsquo;analyse</span> is three
                  pieces and{" "}
                  <span className="font-mono">c&rsquo;était</span> would be
                  three, while an English contraction beside them is two. There
                  is no setting to change and nothing to load, because the list is
                  written into the expression.
                </p>
                <p>
                  What is genuinely open is which way that should be resolved,
                  and it is a real decision rather than an oversight. Dropping the
                  seven makes the pattern language-neutral and costs one more
                  piece per contraction in English, which on our sentence is
                  fifteen pieces instead of fourteen. Adding a list per language
                  makes the rule a rule plus a data file, which is the shape the{" "}
                  <Link href="/concepts/moses-rules" className={link}>
                    Moses rules
                  </Link>{" "}
                  page describes at length, with the correctness of the method
                  then located in a document somebody maintains. The published
                  pattern took neither and hard-coded one language, which is a
                  choice defensible only when the corpus is mostly that language.
                </p>
                <KeepInMind>
                  Five branches of the twelve would work as well on a Turkish
                  newspaper as on an English one, and the seven that run before
                  them were written by somebody looking at English. A word cut by
                  the second group and a word cut by the first come back looking
                  the same, so nothing in the output says which of the two
                  answered.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. There is no word anywhere in the rule">
                <p>
                  The deeper thing this method leaves undefined is the one it
                  never claimed. Nothing in the expression refers to a word.
                  There is no vocabulary, no dictionary, no frequency and no
                  notion of a morpheme, and the whole rule is a partition of the
                  characters into kinds together with a statement about where a
                  run of one kind stops.
                </p>
                <p>
                  That is why it will cut a word it has never seen in a place no
                  reader would.{" "}
                  <span className="font-mono">re-analysis</span> is a word to
                  anybody reading it and three pieces here, because a hyphen is
                  not a letter. A decimal number is cut at its point, and an
                  address at the character that makes it an address. None of that
                  is a failure of the rule; a run of letters really does stop at
                  the hyphen, and the rule promised exactly that and nothing
                  more.
                </p>
                <p>
                  What follows is that a piece from this method carries no claim
                  at all about meaning, and treating one as a word is the reader
                  importing something the method did not supply. That matters
                  most where the pieces look most like words, which is ordinary
                  English prose, and least where they obviously do not, which is
                  a script with no spaces in it.
                </p>
                <KeepInMind>
                  The method answers a question about character kinds and a
                  reader asks a question about words, and in English prose the two
                  answers coincide often enough to be mistaken for each other.
                  Where they part, the method is doing what it said it would, and
                  the reader is the one who has to notice.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A pattern names a rule only once an engine is named">
                <p>
                  The last thing the method leaves open is a property of writing
                  a rule as a pattern at all, rather than anything about this
                  pattern. An expression is a piece of notation, and a piece of
                  notation means whatever the thing reading it takes it to mean.
                </p>
                <>
<p>
                  Part 5 measured one instance of that and it is worth stating in general. The classes an expression names are defined by the engine, so two engines can agree about every operator and part company over what a letter is; and they can also part company over what the operators do, since the greedy and the lazy readings of a repetition, the meaning of a lookahead at the end of a text, and whether a match may be empty are all conventions rather than consequences.
                </p>
                <p>
                  The same expression is then two different rules, and both are being applied faithfully.
                </p>
</>
                <p>
                  The practical consequence is about reporting rather than about
                  quality. Publishing the expression is not the same as
                  publishing the method, so two people who ran that expression
                  over one corpus with different engines have not necessarily
                  measured the same thing, and nothing in either output would say
                  so. On the corpus counted here it would have made no
                  difference, which is the ordinary case and is exactly why the
                  exceptions are hard to notice.
                </p>
                <KeepInMind>
                  A pattern is exact only relative to an engine, in the way the
                  translation rules of the previous page are exact only relative
                  to their file of abbreviations, so saying what a pattern did to
                  a text means saying what read it.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. What is left undecided, gathered">
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
                      expression: "a contraction the seven spellings do not hold",
                      reason:
                        "cut as though the apostrophe were ordinary punctuation, and indistinguishable in the output from a word that has no contraction in it. Six of twelve ordinary spellings put to the branch reached none of the seven, including the same word in capitals and the same word typed with a curved apostrophe.",
                    },
                    {
                      expression: "a language other than English",
                      reason:
                        "outside what the seven branches say rather than handled badly, since they are literal spellings written into the expression with no setting to change and no file to load. What must be decided is whether to drop them, which costs one piece per English contraction, or to carry a list per language, which moves the correctness of the method into a document.",
                    },
                    {
                      expression: "a spelling short enough to appear inside another word",
                      reason:
                        "matched wherever it stands, because the branches are spellings rather than rules. The branch written for a negation cuts the archaic beginning of a word at the same two characters, and no lengthening of the list changes that shape.",
                    },
                    {
                      expression: "which engine reads the expression",
                      reason:
                        "assumed, never determined. The classes and several of the operators are defined by the engine, so the same expression can be two different rules with both applied faithfully. 1,151 characters of Unicode change class between the published reading and the one available here.",
                    },
                    {
                      expression: "a character in no branch at all",
                      reason:
                        "dropped, silently, one character at a time. The classes as published cover everything, so the case cannot arise there; written another way it can, and the underscore is the character it happens to. Reading the pieces does not find it and asking whether they join back to the text does.",
                    },
                    {
                      expression: "writing that puts no spaces between its words",
                      reason:
                        "answered with one piece for the whole sentence, which is faithful and empty. A rule built from character kinds and an optional space has nothing to find where the writing carries no spacing, so the entire question of where the words are is left to whatever runs next.",
                    },
                    {
                      expression: "what a piece means",
                      reason:
                        "not claimed anywhere. There is no vocabulary and no notion of a morpheme in the expression, so a piece is a run of one kind of character and nothing else, and a hyphenated word, a decimal number and an address are each cut at the character that defines them.",
                    },
                    {
                      expression: "where the spacing goes when a text is produced",
                      reason:
                        "settled, unusually, and worth listing for that reason. Because every character including the spacing is inside exactly one piece, the pieces written one after another are the text, on 6 of 6 sentences here and on 4,000 of 4,000 random texts. That is the one question every rule on the earlier pages leaves open and this one closes.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying past this page. A method written
                  as a pattern has its meaning divided between the expression and
                  the engine, so quoting the expression is only half of saying
                  what was done. And a rule built from character kinds is
                  genuinely general everywhere except the one clause somebody
                  wrote in a language, which here is the clause that runs first.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "The short form used here for the third class says everything that is not spacing and not a word character. What then happens to an underscore?",
              [
                "No branch matches at that position, the engine advances one character, and the character is gone",
                "The letters branch claims it, since a word character is near enough a letter",
                "The digits branch claims it",
                "The engine refuses the pattern before it reads any text",
              ],
              0,
              "The published third class says everything that is not spacing, a letter or a number, and the underscore is none of those three, so it is caught. Under the short form it falls into no class at all. Nothing is raised and the pieces look entirely reasonable, which is why the round trip is the test that finds it and reading the pieces is not.",
            ),
            choice(
              "Unicode files 1,831 characters under a number category. How many of them land in a different class under the two readings?",
              ["1,151", "680", "1,831", "136,104"],
              0,
              "The 680 decimal digits are numbers under both readings. The rest, where Roman numerals, vulgar fractions, superscripts and subscripts live, are numbers to the published classes and letters here, because the test for a letter used here is a word character that is not a decimal digit. In the other direction there is no disagreement at all.",
            ),
            trueFalse(
              "Put any one of the 1,151 characters between two spaces and the two readings cut the text identically, even though they file the character under different classes.",
              true,
              "The classes only decide where one run stops and the next begins, so a character with spacing on both sides is a run of one whichever class it is in. None of the 1,151 split differently standing alone, and all of them did directly beside a letter or a digit. The condition is exactly adjacency, which is why the Roman numeral in chapter Ⅻ of the agreement is read identically by both and 1½ is not.",
            ),
            several(
              "Which of these does the method genuinely leave open?",
              [
                "Which way the seven English branches should go, since dropping them is language-neutral and a list per language makes the rule a rule plus a data file",
                "What a letter is, since the classes an expression names are defined by whatever engine reads it",
                "Where the words are in writing that puts no spaces between them, which it answers with one piece for the whole sentence",
                "Whether the pieces join back to the text, which depends on the corpus",
              ],
              [0, 1, 2],
              "Which way the seven branches should go is a real decision rather than an oversight, and the published pattern took neither route and hard-coded one language. There is no word anywhere in the rule, so a sentence in a script without spaces comes back as one run of letters where the boundary rules find six pieces. The round trip is not open at all, because the three writing branches and the two spacing branches cover every character between them, so the pieces tile any text by construction.",
            ),
            trueFalse(
              "Publishing the expression is the same thing as publishing the method.",
              false,
              "An expression is a piece of notation, and it means whatever the thing reading it takes it to mean. Two engines can agree about every operator and part company over what a letter is, and they can also differ over the greedy and lazy readings of a repetition or whether a match may be empty. So two people who ran the expression over one corpus with different engines have not necessarily measured the same thing, and nothing in either output would say so.",
            ),
        ],
        },
        {
          title: "Practice. Running the Pattern and Taking It Apart",
          practice: [
            exercise(
              "Cut the running sentence and write the pieces back",
              ["Build the library’s pattern rule around the published pattern and put the running sentence to it. Print each piece beside its half-open span, with the piece in quotation marks so that a space at the front of it can be seen. Then write the pieces one after another with nothing between them and compare with the sentence.", "Part 1 arrived at fourteen pieces whose spans run from 0 to 51 with no gap, and at the sentence coming back exactly. Count the pieces that begin with a space and compare that with the number of spaces in the sentence.", "The published pattern is not exported from the top of the library, so it is imported here from the module that holds it."],
              `from oop_ml import PatternPreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.pattern import GPT2_PATTERN

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
rule = PatternPreTokenizer(pattern=GPT2_PATTERN)

# Split the sentence and print each piece, formatted with !r so that it
# is quoted, beside its start and end. Print how many pieces there are,
# how many begin with a space, how many spaces the sentence holds, and
# whether the texts joined with nothing between them equal the sentence.`,
              `from oop_ml import PatternPreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.pattern import GPT2_PATTERN

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
rule = PatternPreTokenizer(pattern=GPT2_PATTERN)

words = rule.split(sentence)
for word in words:
    print(f"{word.text!r:11s} [{word.start}, {word.end})")

leading = sum(word.text.startswith(" ") for word in words)
print(f"{words.n_words} pieces, {leading} of them begin with a space")
print(f"{sentence.count(' ')} spaces in the sentence")
print(f"written one after another, exact: {''.join(words.texts) == sentence}")`,
              `'Dr'        [0, 2)
'.'         [2, 3)
' Alvarez'  [3, 11)
' didn'     [11, 16)
"'t"        [16, 18)
' expect'   [18, 25)
' the'      [25, 29)
' low'      [29, 33)
'-'         [33, 34)
'cost'      [34, 38)
' re'       [38, 41)
'-'         [41, 42)
'analysis'  [42, 50)
'.'         [50, 51)
14 pieces, 6 of them begin with a space
6 spaces in the sentence
written one after another, exact: True`,
              { hints: ["The rule takes the pattern by keyword when it is constructed, and the text goes to split, which answers words that each carry text, start and end.", "A piece’s text holds its space as an ordinary character. Inside an f-string, an exclamation mark and the letter r after a value prints it in quotation marks, and the test for a leading space is whether the text starts with one.", "The texts of the split, joined with the empty string, are the pieces written one after another. No space goes between them, because the spaces are already inside."], check: numberCheck("How many of the fourteen pieces begin with a space?", 6, 0.0, "Six pieces begin with a space and the sentence holds six spaces, which is the whole method in one count. Every space is at the front of the piece after it, so all 51 characters are inside a piece and the pieces written one after another are the sentence. The four earlier rules give back some arrangement of the other 45 characters and none of the six.") },
            ),
            exercise(
              "Count the six sentences under five rules",
              ["Part 4 counted the six sentences of the notebook under the four earlier rules and under the pattern. Do the same with the library’s five rules. For each, print how many pieces the six sentences became, how many different pieces there were, and how many of the six sentences come back when their pieces are written one after another with nothing between them.", "The counts should be 63, 69, 72, 72 and 85, with 53 different pieces under the pattern, and only the pattern should give any sentence back. Then count how often the pattern produces the word the with a space in front of it and how often without, which the page does not print.", "The published pattern is not exported from the top of the library, so it is imported here from the module that holds it."],
              `from oop_ml import Corpus, MosesPreTokenizer, PatternPreTokenizer, PennTreebankPreTokenizer
from oop_ml import UnicodeWordPreTokenizer, WhitespacePreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.pattern import GPT2_PATTERN

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
pattern = PatternPreTokenizer(pattern=GPT2_PATTERN)
rules = {
    "at spaces": WhitespacePreTokenizer(),
    "word boundaries": UnicodeWordPreTokenizer(),
    "annotation rules": PennTreebankPreTokenizer(),
    "translation rules": MosesPreTokenizer(),
    "the pattern": pattern,
}
corpus = Corpus.of(notebook)

# For each rule, print the total pieces, the different pieces, and how
# many sentences equal their own pieces joined with nothing between.
# Then print how many times the pattern counted " the" and "the".`,
              `from oop_ml import Corpus, MosesPreTokenizer, PatternPreTokenizer, PennTreebankPreTokenizer
from oop_ml import UnicodeWordPreTokenizer, WhitespacePreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.pattern import GPT2_PATTERN

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
pattern = PatternPreTokenizer(pattern=GPT2_PATTERN)
rules = {
    "at spaces": WhitespacePreTokenizer(),
    "word boundaries": UnicodeWordPreTokenizer(),
    "annotation rules": PennTreebankPreTokenizer(),
    "translation rules": MosesPreTokenizer(),
    "the pattern": pattern,
}
corpus = Corpus.of(notebook)

for name, rule in rules.items():
    counts = corpus.word_counts(rule)
    back = sum("".join(rule.split(text).texts) == text for text in notebook)
    print(f"{name:17s} {counts.total} pieces, {counts.n_words} different, {back} of 6 come back")

counts = corpus.word_counts(pattern)
print(f"with its space: {counts.count_of(' the')}")
print(f"without it: {counts.count_of('the')}")`,
              `at spaces         63 pieces, 47 different, 0 of 6 come back
word boundaries   69 pieces, 47 different, 0 of 6 come back
annotation rules  72 pieces, 48 different, 0 of 6 come back
translation rules 72 pieces, 49 different, 0 of 6 come back
the pattern       85 pieces, 53 different, 6 of 6 come back
with its space: 9
without it: 0`,
              { hints: ["The corpus’s word_counts takes a rule and answers the count of every distinct piece over all six sentences, with total for every piece counted and n_words for the different ones.", "A sentence comes back when its split’s texts, joined with the empty string, equal the sentence. A true answer adds as one, so the six tests can be summed.", "count_of takes a piece exactly as the rule produced it, so the with a space in front and the without one are two separate questions."], check: numberCheck("How many times does the pattern produce the word the with a space in front of it?", 9, 0.0, "All nine uses of the in the six sentences stand in the middle of a sentence, so every one is the piece with its space and the bare piece never occurs. That is why section 7 says a vocabulary learned over these pieces holds the word with a space stuck to the front. The capitalised word at the head of two sentences is a third piece again, which the pattern cannot fold together, since a capital is a different character.") },
            ),
            exercise(
              "Delete one part of the pattern at a time",
              ["Sections 7 and 10 each delete one part of the pattern and count what changes. The script starts with the pattern as the library writes it, with the seven contraction branches taken off the front, and with the optional space taken off the three runs. Build a rule around each, and print how many pieces the running sentence and the six sentences give, and how many of the six sentences still come back exactly.", "The running sentence should go from fourteen pieces to fifteen and to twenty, and the six sentences from 85 to the 142 of section 7. The page does not count the six sentences without the contraction branches, so work out what you expect from how many contractions they hold before you run it."],
              `from oop_ml import PatternPreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
patterns = {
    "the pattern": r"'s|'t|'re|'ve|'m|'ll|'d| ?[^\\W\\d_]+| ?\\d+| ?(?:[^\\s\\w]|_)+|\\s+(?!\\S)|\\s+",
    "no contractions": r" ?[^\\W\\d_]+| ?\\d+| ?(?:[^\\s\\w]|_)+|\\s+(?!\\S)|\\s+",
    "no optional space": r"'s|'t|'re|'ve|'m|'ll|'d|[^\\W\\d_]+|\\d+|(?:[^\\s\\w]|_)+|\\s+",
}

# For each pattern, build a PatternPreTokenizer around it and print the
# number of pieces the first sentence gives, the number all six give, and
# how many of the six equal their pieces joined with nothing between.`,
              `from oop_ml import PatternPreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
patterns = {
    "the pattern": r"'s|'t|'re|'ve|'m|'ll|'d| ?[^\\W\\d_]+| ?\\d+| ?(?:[^\\s\\w]|_)+|\\s+(?!\\S)|\\s+",
    "no contractions": r" ?[^\\W\\d_]+| ?\\d+| ?(?:[^\\s\\w]|_)+|\\s+(?!\\S)|\\s+",
    "no optional space": r"'s|'t|'re|'ve|'m|'ll|'d|[^\\W\\d_]+|\\d+|(?:[^\\s\\w]|_)+|\\s+",
}

for name, source in patterns.items():
    rule = PatternPreTokenizer(pattern=source)
    sentence = rule.split(notebook[0]).n_words
    total = sum(rule.split(text).n_words for text in notebook)
    back = sum("".join(rule.split(text).texts) == text for text in notebook)
    print(f"{name:18s} sentence {sentence}, notebook {total}, {back} of 6 come back")`,
              `the pattern        sentence 14, notebook 85, 6 of 6 come back
no contractions    sentence 15, notebook 86, 6 of 6 come back
no optional space  sentence 20, notebook 142, 6 of 6 come back`,
              { hints: ["Each pattern is an ordinary string handed to PatternPreTokenizer by the keyword pattern. The r in front of the quotation mark keeps Python from reading the backslashes itself.", "The pieces of the notebook are the sum over the six sentences of the n_words of each split.", "Deleting the contraction branches changes only a text that holds one of the seven endings, and it turns that one piece into two, the apostrophe and the letters after it."], check: numberCheck("How many pieces do the six sentences give with the seven contraction branches deleted?", 86, 0.0, "The six sentences hold exactly one contraction, the one in the running sentence, so deleting the seven branches adds exactly one piece, 86 where there were 85. That is section 9’s count seen from the other side, since only one of the seven branches claimed a piece over the whole notebook. All three patterns still give every sentence back, because each still covers every character, which is why 142 is the comparison section 15 calls the honest one.") },
            ),
            exercise(
              "Put twelve spellings to the seven branches",
              ["Section 12 put twelve things a person actually types to the pattern and found that the contraction branches fired on half of them. Put the same twelve to the rule. For each, print how many pieces came back and whether any piece is exactly one of the seven spellings, and then count the texts on which one fired.", "Six should fire and six should not. The texts are printed with ascii so that the curved apostrophe shows up as the different character it is, which is the reason the fifth text misses while the first, the same words to a reader, does not.", "The published pattern is not exported from the top of the library, so it is imported here from the module that holds it."],
              `from oop_ml import PatternPreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.pattern import GPT2_PATTERN

texts = [
    "she didn't go", "it's here", "they're here", "IT'S HERE",
    "she didn\\u2019t go", "y'all came", "o'clock struck", "the students' notes",
    "'twas cold", "he can't won't shan't", "l'analyse est pr\\u00eate", "she'd've gone",
]
endings = {"'s", "'t", "'re", "'ve", "'m", "'ll", "'d"}
rule = PatternPreTokenizer(pattern=GPT2_PATTERN)

# For each text, split it and decide whether any of its pieces is one of
# the seven endings. Print the number of pieces, the answer, and the text
# formatted with !a. Then print on how many of the twelve a branch fired.`,
              `from oop_ml import PatternPreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.pattern import GPT2_PATTERN

texts = [
    "she didn't go", "it's here", "they're here", "IT'S HERE",
    "she didn\\u2019t go", "y'all came", "o'clock struck", "the students' notes",
    "'twas cold", "he can't won't shan't", "l'analyse est pr\\u00eate", "she'd've gone",
]
endings = {"'s", "'t", "'re", "'ve", "'m", "'ll", "'d"}
rule = PatternPreTokenizer(pattern=GPT2_PATTERN)

fired = 0
for text in texts:
    pieces = rule.split(text).texts
    hit = any(piece in endings for piece in pieces)
    fired += hit
    print(f"{len(pieces)} pieces  {'fired ' if hit else 'missed'}  {text!a}")
print(f"a contraction branch fired on {fired} of {len(texts)}")`,
              `4 pieces  fired   "she didn't go"
3 pieces  fired   "it's here"
3 pieces  fired   "they're here"
4 pieces  missed  "IT'S HERE"
5 pieces  missed  'she didn\\u2019t go'
4 pieces  missed  "y'all came"
4 pieces  missed  "o'clock struck"
4 pieces  missed  "the students' notes"
3 pieces  fired   "'twas cold"
7 pieces  fired   "he can't won't shan't"
5 pieces  missed  "l'analyse est pr\\xeate"
4 pieces  fired   "she'd've gone"
a contraction branch fired on 6 of 12`,
              { hints: ["A contraction branch fired exactly when one of the pieces is one of the seven spellings, since those branches carry no space and match nothing else.", "any over the pieces, asking of each whether it is in the set of endings, gives the answer for one text.", "Inside an f-string, an exclamation mark and the letter a after a value formats it with ascii, which writes a character outside the basic set as its code."], check: numberCheck("On how many of the twelve texts does a contraction branch fire?", 6, 0.0, "Six fire and six miss. The misses are the capitals, the curved apostrophe, two words and a French article the list does not hold, and a possessive with no letter after its mark. One of the six that fire is the archaic word at the start of the ninth text, where the branch written for a negation cuts a word at its own beginning, so a count of how often the list fired says nothing about how often it was right.") },
            ),
          ],
        },
      ]}
    />
  );
}
