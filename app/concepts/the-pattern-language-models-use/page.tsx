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
import { BranchReader } from "@/components/widgets/BranchReader";
import { ContractionGallery } from "@/components/widgets/ContractionGallery";
import { DialectPanel } from "@/components/widgets/DialectPanel";
import { PatternCostPanel } from "@/components/widgets/PatternCostPanel";
import { PatternPlayground } from "@/components/widgets/PatternPlayground";
import { SpaceLedger } from "@/components/widgets/SpaceLedger";

export const metadata: Metadata = pageMetadata("/concepts/the-pattern-language-models-use", {
  title: "The Pattern Language Models Use · Perceptron Lab",
  description:
    "Regular expressions describe patterns of characters that should stay together or be split apart. Initial groups of letters, numbers and punctuation constrain the pieces a tokenizer can learn afterward.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PatternWordsPage() {
  return (
    <ConceptPage
      lessonId="the-pattern-language-models-use"
      intuition={lessonIntuitions["the-pattern-language-models-use"]}
      technicalStart="Part 2. One Expression, Twelve Branches"
      openingTitle="The Space Has to Belong Somewhere"
      playgroundTitle="Watch the pattern separate words, numbers and punctuation"
      playgroundIntro="Make the spaces visible and inspect which piece owns each one. Join the pieces and compare the result with the original text."
      title="The Pattern Language Models Use"
      tagline={"Regular expressions describe patterns of characters that should stay together or be split apart. Initial groups of letters, numbers and punctuation constrain the pieces a tokenizer can learn afterward."}
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
                  The earlier methods mostly returned word-like pieces while leaving ordinary spacing out of the token sequence. That is convenient when counting words or annotating grammar. What if a language model must reproduce the spacing as part of its output? Then the representation needs to keep information those earlier tasks could discard.
                </p>
                <p>
                  Once spacing is lost, a later step has to reconstruct it using additional rules or guesses. We will examine a pattern that keeps it attached to the pieces. Our familiar sentence lets us compare the result with the earlier tokenizers, including punctuation and the boundaries beside it.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  {"The running sentence contains 51 characters, including six spaces. The earlier word-only outputs omit those spaces. The Unicode method can also return complete segments if requested; here we compare the word-only setting used on the earlier page."}
                </p>
                <KeepInMind>
                  {"This pattern keeps separators in the piece sequence. That allows direct concatenation to reproduce the source, without a separate language-specific spacing convention. It is a different requirement from returning only word-like units."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Separate the Alvarez sentence while keeping its spaces" id="2-the-running-sentence-cut-with-the-spaces-visible">
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
                  {"A leading space becomes part of a piece’s spelling. In the running sentence, cost follows a hyphen and has no leading space, while expect follows a space and carries one. To see the effect on one repeated word, compare Alvarez at a sentence start and after a space in the corpus later on."}
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
                  The coverage check tries four thousand generated texts, each up to thirty characters long, drawn from 1,972 candidate characters. The set includes four kinds of spacing and examples such as a fraction, Roman numeral, superscript, subscript and underscore. Concatenating the returned pieces recovers the input in all four thousand tests. This tests the selected character set and engine, alongside the earlier argument about how the branches cover the input.
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"The pieces concatenate to all six original notebook sentences. The compared word-only outputs do not preserve those separators directly. This test concerns source reconstruction, not whether one method finds better linguistic word boundaries."}
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
                  {"If tokenization maps a line break and a space to the same input, those tokens alone cannot identify the original layout. A later formatter can still generate a line break by convention. It would be reconstructing a plausible layout rather than recovering a distinction preserved in the encoding."}
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
                  {"The initial split is defined by a regular expression and its matching engine. Each nonempty match becomes a piece. The pattern on this page covers the whole input; other expressions can leave gaps, so coverage needs its own check."}
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
                  {"The middle branches match runs of Unicode letters, runs of Unicode numbers, and runs of other non-whitespace characters. Numbers include more than decimal digits in the published expression. Part 5 compares that definition with the SDK’s Python-compatible approximation."}
                </p>
                <Equation>
                  {" ?\\p{L}+        a run of letters\n" +
                    " ?\\p{N}+        a run of numbers\n" +
                    " ?[^\\s\\p{L}\\p{N}]+   a run of everything else that is not spacing"}
                </Equation>
                <p>
                  The three classes cover non-whitespace characters, and the remaining branches cover whitespace. Letter runs stop before a period, so <span className="font-mono">dog</span> and a following <span className="font-mono">.</span> enter separate runs. A BPE learner restricted to those runs cannot merge them across that boundary. This controls candidate pieces; it does not define linguistic words.
                </p>
                <p>
                  The same class rule separates <span className="font-mono">low-cost</span> and <span className="font-mono">re-analysis</span> into three pieces each. It also separates <span className="font-mono">3.14</span> into number, period and number. It groups character kinds rather than parsing compounds or decimal structure.
                </p>
                <KeepInMind>
                  {"These branches group character kinds rather than linguistic words. They can process different scripts, but the resulting pieces need not match each language’s word boundaries. A hyphen belongs to the remaining non-whitespace class, so a letter run stops before it."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The question mark in front, which is the whole idea">
                <p>
                  Each of the three run branches begins with <span className="font-mono">{" ?"}</span>: an optional ordinary space. At a space followed by a matching run, the match starts with that space. The engine does not have to move backward after finding the word.
                </p>
                <Equation>
                  {'the drift    ->    "the"  " drift"\n' +
                    'thedrift     ->    "thedrift"'}
                </Equation>
                <p>
                  {"An optional ordinary space attaches to the following letter, number or punctuation run. That preserves the space within the sequence and can distinguish a spaced occurrence from an unspaced one. A learned subword vocabulary may split either run further, so it can contain both space-prefixed and unprefixed pieces."}
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
                    "57 / 142   ≈  40 percent"}
                </Equation>
                <p>
                  {"On these six sentences, removing the optional spaces creates 57 additional pieces. Keeping them gives about forty percent fewer pieces than that no-attachment variant. Both variants retain all source characters, so this is a sequence-length saving rather than a difference in text content."}
                </p>
                <KeepInMind>
                  {"The optional space appears in three branches. On this corpus it reduces the number of pieces by 57 compared with the otherwise identical no-attachment pattern, while retaining the same characters."}
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
                  {"Before two ordinary spaces followed by a word, the letter branch cannot yet match. The whitespace lookahead branch consumes the first space but leaves the last one for the following word. At the end of input, it can consume the entire remaining whitespace run. Other whitespace characters do not necessarily attach like an ordinary space."}
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
                  {"This branch keeps an ordinary leading space attached in the doubled-space example. The notebook has only single internal spaces, which the following runs claim directly, so its six sentences never exercise this branch. More varied whitespace needs additional cases."}
                </p>
                <KeepInMind>
                  {"The doubled-space example has eight pieces under either variant, but their boundaries differ. The lookahead keeps the final ordinary space with the next run. That is the measured benefit here, not a guarantee of identical piece counts for every whitespace input."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Twelve branches, and the four that six sentences reach">
                <p>
                  The final branch matches remaining runs of whitespace, completing the twelve alternatives. We can record which branches actually match our examples to see how much of the rule those examples exercise.
                </p>
                <BranchReader />
                <p>
                  Over the six sentences, four of the twelve claimed a piece. The
                  letters branch took 68 of the 85, which is four pieces in
                  five; the marks branch took 15; the digits branch took one,
                  which is the year in the third sentence; and one of the seven
                  contractions took one, which is the{" "}
                  <span className="font-mono">&apos;t</span> of{" "}
                  <span className="font-mono">didn&apos;t</span>. The other
                  eight branches, six contractions and both spacing branches,
                  never fired. The spacing branches are unreached because single
                  spaces are claimed by the words after them, which is the
                  previous section&apos;s point arriving as a count.
                </p>
                <p>

                  A malformed expression can be rejected before it reads the input. In the panel, all three mistyped branches fail to compile, making that particular error visible. A pattern that does compile still needs behavioral tests: it can divide text differently from the intended rule without producing a syntax error. Compilation and correct segmentation are separate checks.
                </p>
                <KeepInMind>
                  {"Four branches match the notebook. The eight unmatched branches cover other literal endings and whitespace situations. A different collection of ordinary prose can exercise them, so this sample does not characterize all prose."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The sentence about Dr. Alvarez is fifty-one characters, six of them spaces. How many of the fourteen pieces begin with a space?",
              ["Six", "None", "Eight", "Fourteen"],
              0,
              "Reading the spans down, they run from 0 to 51 with no gap anywhere, so every character of the sentence, spaces included, is inside some piece and inside exactly one. Six spaces therefore turn up at the front of six pieces rather than being thrown away.",
            ),
            trueFalse(
              "Because its pieces give the sentence back exactly, the pattern is also better than the four earlier rules at saying where the words are.",
              false,
              "Exact reconstruction checks character preservation, not linguistic word boundaries. This pattern lets a decoder recover the source by concatenating pieces without language-specific joining rules. Earlier tokenizers may discard separators or rewrite spellings, so their output needs another reconstruction policy or retained source information. Which segmentation is useful depends on the downstream task.",
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
              "All four follow from one optional character written in three places. It puts the spacing inside the pieces, which is why they join back, and it saves 57 pieces on six sentences, one for every space, which is a text forty percent shorter for everything downstream to read. The price is that a word with its space and the same word without are two pieces, which is why the pieces such a model works in so often look like words with a space stuck to the front.",
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
                  <span className="font-mono">didn&apos;t</span> would come out
                  as three pieces rather than two. Deleting them from the pattern
                  and changing nothing else takes our sentence from fourteen
                  pieces to fifteen, with{" "}
                  <span className="font-mono">&apos;</span> and{" "}
                  <span className="font-mono">t</span> standing separately where{" "}
                  <span className="font-mono">&apos;t</span> stood.
                </p>
                <p>
                  {"The seven literal branches have no optional leading space. They can match a suffix immediately after the preceding letter run. A standalone quoted spelling or an archaic word beginning with the same characters can also match; the expression does not verify that a contraction host exists."}
                </p>
                <KeepInMind>
                  {"Ordering gives these literal spellings priority over the punctuation run that could otherwise claim their apostrophe. The list encodes selected English forms; it does not recognize their grammatical role."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the seven catch">
                <p>
                  {"The seven spellings cover selected English contractions and possessive forms. Their letters can represent different grammatical uses: for example, the same spelling can stand for is, has or a possessive marker. The pattern matches characters rather than choosing among those meanings."}
                </p>
                <NumberTable
                  headings={["in the writing", "the pattern", "what the ending is"]}
                  rows={[
                    ["it's here", "it / 's / ·here", "is in this example"],
                    ["they're here", "they / 're / ·here", "are"],
                    ["I've seen it", "I / 've / ·seen / ·it", "have"],
                    ["we'll see", "we / 'll / ·see", "will"],
                    ["he'd gone", "he / 'd / ·gone", "had in this example"],
                    ["she didn't go", "she / ·didn / 't / ·go", "a negative contraction; the split follows its spelling"],
                    [
                      "she'd've gone",
                      "she / 'd / 've / ·gone",
                      "two of them, matched one after the other",
                    ],
                  ]}
                  caption="A slash separates one piece from the next, and a raised dot inside a piece is a space the piece carries. The last row is the one worth noticing, where two of the seven match in a row and the word comes apart into three."
                />
                <p>
                  The cut falls at the apostrophe every time, which is the
                  translation rules&apos; choice rather than the annotation
                  rules&apos;. On{" "}
                  <span className="font-mono">didn&apos;t</span> the annotation
                  rules produce <span className="font-mono">did</span> and{" "}
                  <span className="font-mono">n&apos;t</span>, because the
                  negation is a morpheme spelled with the n; here the pieces are{" "}
                  <span className="font-mono">·didn</span> and{" "}
                  <span className="font-mono">&apos;t</span>, so the second is
                  not a morpheme of anything and the first is not a word. What
                  makes that acceptable is that nothing downstream is expected to
                  read a piece as a word.
                </p>
                <KeepInMind>
                  {"The seven branches can keep an apostrophe with a selected following spelling. That reduces fragmentation for matched forms without assigning them a morpheme label."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What they miss, which was half of what I put to them">
                <p>

                  The contraction branch recognizes seven literal spellings. The twelve-text panel includes ordinary alternatives outside that list, and six inputs produce no match in this branch. Reading those examples beside the pattern shows exactly what its shortcut recognizes, rather than treating the list as a general description of contractions.
                </p>
                <ContractionGallery />
                <p>
                  Capitalization and apostrophe spelling are separate cases. <span className="font-mono">IT&apos;S</span> misses the lowercase literal branch that matches <span className="font-mono">it&apos;s</span>. The curly form <span className="font-mono">didn&rsquo;t</span> misses the ASCII branch that matches <span className="font-mono">didn&apos;t</span>. In each case, the other branches still preserve the characters.
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
                  The selected forms <span className="font-mono">y&apos;all</span>, <span className="font-mono">o&apos;clock</span> and <span className="font-mono">l&apos;analyse</span> are not covered by the seven literals and produce three pieces each. Treebank leaves these examples whole. Which grouping is preferable depends on the desired units; a pretokenizer need not identify a full word or morpheme.
                </p>
                <KeepInMind>
                  {"Six of the twelve probe inputs do not match the contraction branch. Other branches still return pieces and preserve the text. The output has no separate warning that an intended contraction was handled as punctuation, so inspect the cases relevant to the task."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The branch that fires on a word it was not written for">
                <p>
                  The misses are one half of what a list of spellings does, and
                  this is the other. The branch matching{" "}
                  <span className="font-mono">&apos;t</span> was written for the
                  end of <span className="font-mono">didn&apos;t</span>, and it
                  fires on any apostrophe followed by a t, wherever that pair
                  stands.
                </p>
                <Equation>
                  {"didn't cold    ->    didn    't    ·cold\n" +
                    "'twas cold     ->    't      was   ·cold"}
                </Equation>
                <p>
                  {"The second example uses the same token spelling at the beginning of an archaic contraction rather than at a negative ending. Those uses share an ID if a later vocabulary keeps the piece whole. A model can learn different uses from context; sharing the token does not make the piece mathematically or linguistically invalid."}
                </p>
                <WhyThisWorks title="Why a longer list does not close this">
                  <p>
                  Adding a literal such as <span className="font-mono">&apos;a</span> would also affect other inputs beginning with those characters, including <span className="font-mono">y&apos;all</span> and <span className="font-mono">l&apos;analyse</span>. The branch still would not identify grammatical roles. Context conditions or longer prioritized alternatives can address particular cases, but they introduce further choices to test.
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"A literal branch cannot distinguish two uses of the same characters by grammatical role. Adding context conditions or different alternatives can change that behavior, but it also changes the rule. A longer unqualified list alone is not a semantic analysis."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What the pattern that followed changed">
                <p>
                  {"The panel compares a controlled variant with two changes: case-insensitive matching for the seven forms and a maximum of three decimal digits per run. These choices are used in later tokenizer designs, but the displayed variant holds the other branches fixed to isolate their effects; it is not a complete specification of every later model’s tokenizer."}
                </p>
                <Equation>
                  {"'s|'t|'re|'ve|'m|'ll|'d     becomes    (?i:'s|'t|'re|'ve|'m|'ll|'d)\n" +
                    " ?\\p{N}+                    becomes     ?\\p{N}{1,3}"}
                </Equation>
                <p>
                  Case-insensitive literals change the shown uppercase <span className="font-mono">THE DRIFT DIDN&apos;T GO AWAY</span> example from seven pieces to six. The number change divides <span className="font-mono">1000000</span> into three groups instead of one, changing that probe from seven pieces to nine. Those are segmentation results; they do not show that a model has learned the resulting groups or improved at arithmetic.
                </p>
                <p>
                  The controlled variant leaves curly apostrophes and unlisted forms such as <span className="font-mono">y&apos;all</span> unchanged. The split of <span className="font-mono">didn&apos;t</span> still follows the apostrophe rather than the negative morpheme. Other character alternatives, context rules, lookup tables or learned segmentation could make different choices; a language-specific list is not the sole possible repair.
                </p>
                <KeepInMind>
                  {"Case-insensitive matching removes the tested capitalization difference. The three-digit limit changes the number grouping and can increase sequence length. Neither comparison measures whether a model performs arithmetic better."}
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
                  {"The pattern returns a longer initial piece sequence than the compared word-only rules on this corpus. A later model’s runtime depends on the final tokens and its operations. Dense all-position attention has quadratic pair counts within each sequence, while other costs scale differently."}
                </p>
                <PatternCostPanel />
                <p>
                  Over the six sentences the pattern gives 85 pieces where
                  splitting on spaces gives 63, the boundary rules give 69 and
                  both rule lists give 72.
                </p>
                <Equation>
                  {"85 − 63   =  22 more pieces\n" +
                    "22 / 63   ≈  35 percent"}
                </Equation>
                <p>
                  {"The pattern gives about 35 percent more pieces than whitespace splitting on this notebook. It also retains all 375 source characters. The earlier word-only outputs retain 318 or 303, so they are not all meeting the same reconstruction requirement."}
                </p>
                <p>The last row removes the optional space from the pattern while retaining all source characters. It returns 142 pieces for the same six sentences, compared with 85 when that space is included. Both variants reconstruct the text exactly, so this comparison isolates the effect of attaching spacing to nearby pieces.</p>
                <KeepInMind>
                  {"Compare counts beside the information retained: 85 pattern pieces versus 63 whitespace pieces, or 85 versus 142 for the two full-coverage pattern variants. The appropriate comparison depends on whether exact source reconstruction is required."}
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
                  Forty-one of the 53 begin with a space. Two words are spelled both
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
                  {"Removing optional space attachment gives 52 distinct pieces instead of 53 on this corpus, while increasing occurrences from 85 to 142. The counts show why entry count and sequence length should be considered separately. They do not establish a universal bound on every learned subword vocabulary."}
                </p>
                  <p>
                  {"For a fixed whole letter run, adding or omitting one ordinary leading space gives two variants under this branch. A downstream tokenizer may split those runs into other pieces, so this observation does not bound every representation’s vocabulary."}
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
                  {"For an unspaced input consisting only of characters in the letter class, the pattern returns one letter run. That preserves the input but does not identify internal linguistic word boundaries. Punctuation, numbers or other classes can still split unspaced text."}
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
                  in any sense it would recognize, since its pieces do join back
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
                <p>The pattern supplies an initial split before vocabulary learning. It restricts which characters a later piece can span. In writing without spaces, its boundaries can be sparse, so the learned vocabulary or another segmentation method still needs to account for long letter runs.</p>
                <KeepInMind>
                  {"The shown eight-code-point Japanese text becomes one pattern piece and six word-only Unicode pieces. These are different initial boundary conventions; neither count alone establishes complete Japanese word segmentation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. A first cut, before any vocabulary is learned">
                <p>
                  The pieces produced by this pattern are an intermediate representation. A later subword vocabulary can split within them, so they are not necessarily the final tokens a model receives. In particular, a piece such as{" "}
                  <span className="font-mono">·Alvarez</span> can be split into smaller pieces by the vocabulary learned on the{" "}
                  <Link href="/concepts/byte-pair-encoding" className={link}>
                    byte pair encoding
                  </Link>{" "}
                  page.
                </p>
                <p>
                  {"If BPE is trained separately inside each pretokenized run, it cannot merge across those boundaries. A letter run and a following period therefore remain separated. That is a design choice in this pipeline, not a requirement for every BPE system."}
                </p>
                <KeepInMind>
                  {"The initial split constrains the later vocabulary learner. Keeping letter runs apart from punctuation prevents certain merges. Test whether those constraints suit the target text instead of assuming they are always the cheapest or best boundaries."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "The branch matching straight apostrophe plus t was included for endings such as didn't. What does it do to 'twas cold?",
              [
                "It matches the straight 't prefix and leaves was, even though the prefix is not a negation here.",
                "Nothing, since the branch fires only at the end of a word",
                "It leaves 'twas whole because no letter precedes the apostrophe.",
                "It leaves the apostrophe standing alone, as it does in y’all",
              ],
              0,
              "The branch matches a spelling wherever that alternative is encountered. It does not check whether the piece is a grammatical negation. Here it also matches at the start of the typed form, while all characters still survive. That matters if a later application interprets the piece as a grammatical label; a language model can also learn to use it simply as a recurring text piece.",
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
              "IT’S and didn’t with a curved mark each come out as three pieces where the ordinary spelling gives two, and nothing anywhere reports that a list was consulted and found nothing. Two of the seven do match in a row, so she’d’ve comes apart into three pieces with both endings caught, and didn’t with the straight mark is the case the branch exists for. The other misses were y’all, o’clock, a French l’analyze and a possessive whose apostrophe has no letter after it.",
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
              "The later patterns discussed here change case-sensitive contraction matching and group long digit runs into smaller pieces. Case-insensitive matching keeps differently capitalized suffixes on the same branch without necessarily lowercasing their token spellings. Digit grouping changes the units available for learning numeric patterns, at a cost in sequence length. Whether it improves arithmetic needs evaluation rather than following from the split alone.",
            ),
            choice(
              "Which comparison isolates the optional-leading-space rule while preserving the same source characters?",
              [
                "85 against the 142 the same pattern gives with its optional space deleted",
                "85 against the 63 of splitting on spaces",
                "85 against the 69 of the boundary rules",
                "85 against the 72 of both rule lists",
              ],
              0,
              "Removing optional leading spaces changes where retained spaces are grouped while keeping every character recoverable. That directly tests this pattern choice. Comparing with whitespace splitting is still useful, but it also changes source retention and other cuts. State those differences rather than treating either comparison as universally fair or unfair.",
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
                  {"This SDK ports Unicode-property branches into Python’s built-in regex notation. The resulting categories differ on some code points. An engine supporting the original properties, or explicit category ranges, could avoid that particular approximation."}
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
                <p>The letter and number branches also differ in what they classify as a digit. The comparison builds the published classes from Unicode general categories across all 1,114,112 code-point positions. Both patterns then run through the same matching machinery, so the tested difference comes from class membership rather than a change of engine.</p>
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
                  and one here, for the mirror-image reason. The third test text contains both{" "}
                  <span className="font-mono">a²</span> and{" "}
                  <span className="font-mono">x₂</span>; each is cut in two as
                  published and kept whole here.
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
                  A character in the wrong category does not always change token boundaries. If whitespace isolates it on both sides, it remains a one-character run under either classification. Let&apos;s test it next to other characters to expose where the category choice affects the segmentation.
                </p>
                <p>
                  {"The test places each of the 1,151 affected code points in four arrangements. Standing between spaces, none changes its piece boundaries. Directly after a letter, directly after a digit, or directly before a letter, every tested code point changes them. These are the tested contexts; more complex runs still depend on the surrounding classes and branches."}
                </p>
                <p>
                  {"The six notebook sentences and the shown Cyrillic and Arabic-digit examples produce identical pieces under both category versions. Their tested characters do not trigger the disputed grouping. English can still contain fractions, superscripts or subscripts, so the difference is not restricted to a particular language or excluded from ordinary writing."}
                </p>
                <KeepInMind>
                  {"The four context tests give zero disagreements in isolation and disagreements for all 1,151 characters beside the tested letter or digit. The notebook counts elsewhere are unchanged because that corpus contains none of those disputed code points."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. English Contractions and the Limits of a Fixed Pattern" , id: "part-6-where-the-method-stops-being-defined",
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
                  The seven literals group selected English forms even in mixed-language input. They have no matching literal for a French article in <span className="font-mono">l&apos;analyse</span>, so other branches separate its apostrophe. That output remains defined; whether it supplies useful boundaries for the next stage is a task question.
                </p>
                <p>
                  Removing the seven literals removes those explicit English forms and changes the running sentence from fourteen pieces to fifteen. Other approaches can add pattern context, use a language-specific table or learn boundaries. The <Link href="/concepts/moses-rules" className={link}>
                    Moses rules
                  </Link> page illustrates a rule-plus-table design. Compare these choices on the target text rather than treating one dominant language as a condition for validity.
                </p>
                <KeepInMind>
                  {"The class branches return defined pieces across scripts, while the literal branches preferentially group selected English forms. A piece list does not explain which branch matched it. The branch display adds that information so the choices can be inspected."}
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
                  {"Pretokenization does not assign semantic labels to these pieces. Some happen to be words or useful word parts; others are punctuation or number fragments. A learned vocabulary and model can give them contextual roles later. Do not assume every initial piece is one linguistic word."}
                </p>
                <KeepInMind>
                  {"The pattern’s contract is a character-based split with complete coverage. A word-count task needs a separate convention for which pieces count as words. A model pipeline may instead want subword boundaries and exact reconstruction, so judge the split against its intended use."}
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

                  The regex engine defines character classes and matching behavior. Two implementations can therefore interpret similar-looking expressions differently, especially when one uses Unicode properties and another approximates them. Check the actual class membership and matching semantics, including repetition and lookahead, when porting the pattern.
                </p>
                <p>
                  {"Record the regex dialect, flags and character-property version alongside the expression. Similar notation does not guarantee that two ports match the same strings."}
                </p>
</>
                <p>
                  {"The comparison here compiles two category definitions in the same matching machinery. The notebook gives identical boundaries under both definitions; other probes expose differences. Recording the engine and Unicode version remains necessary when reproducing those results elsewhere."}
                </p>
                <KeepInMind>
                  A pattern is exact only relative to an engine, in the way the
                  translation rules of the previous page are exact only relative
                  to their file of abbreviations, so saying what a pattern did to
                  a text means saying what read it.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Decisions hidden in the order of the pattern branches" id="26-what-is-left-undecided-gathered">
                <p>Branch order decides which matching rule gets the text first. The English contraction list, character categories and handling of spaces are part of that choice, so changing the pattern can change the pieces without changing the sentence.</p>
                <DerivationTable
                  expressionHeading="Spelling or pattern branch"
                  reasonHeading="What the expression matches"
                  rows={[
                    {
                      expression: "a contraction the seven spellings do not hold",
                      reason:
                        "Other branches still split and preserve the text. Six of twelve probes miss the seven literal forms, including uppercase and curly-apostrophe alternatives. The returned pieces contain no separate contraction-coverage diagnostic.",
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
                        "An uninterrupted letter-class run becomes one piece. Other character classes can still split unspaced text. The pattern preserves the source but may leave internal word segmentation to a later stage.",
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
                  {"Record the expression, engine and Unicode properties together. Then check coverage and inspect the branches relevant to the target text. The seven English literal forms are one explicit choice in this otherwise character-based split, not a guarantee about every language’s words."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "If the punctuation class matches only characters that are neither whitespace nor word characters, what happens to an underscore?",
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
              "In the Unicode data used for this comparison, 1,831 characters have a number category. How many receive different classes in the two pattern readings?",
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
              "Cut the sentence about Dr. Alvarez and write the pieces back",
              [
  "Construct PatternPreTokenizer from the supplied published pattern and split the Dr. Alvarez sentence.",
  "Print every piece in quoted form beside its half-open span. Then print the piece count, count of pieces beginning with a space, original space count and whether joining piece texts without separators exactly recovers the sentence.",
  "These are preliminary pieces before any subword merges. Their leading spaces are real retained characters, so do not add another separator when reconstructing the text."
],
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
              {
question: "Can a pattern preserve every character while choosing useful preliminary pieces?",
 hints: [
  "Pass pattern by keyword to the constructor.",
  "Use !r to reveal a leading space and startswith(\" \") to count it.",
  "Compare \"\".join(result.texts) with the source. Contiguous source coverage and exact reconstruction are different checks from token count."
], check: numberCheck("How many of the fourteen pieces begin with a space?", 6, 0.0, "Six pieces begin with a space, accounting for the six spaces in this particular sentence. The pattern retains those spaces inside its pieces, so direct concatenation recovers the source.") },
            ),
            exercise(
              "Count the six sentences under five rules",
              [
  "Apply the five supplied rules to the same six-sentence notebook. For each print total pieces, distinct spellings and the number of sentences recovered by joining their piece texts with no separator.",
  "Then print how often the pattern rule produces the exact pieces \" the\" and \"the\". Preserve their different leading-space spelling when counting.",
  "Equal-looking words can occupy different vocabulary rows because of retained spacing. The round-trip test also shows whether the rule discarded source characters."
],
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
              {
question: "How much do five preliminary splitting rules retain from the same notebook?",
 hints: [
  "Corpus.word_counts(rule) supplies total and n_words for the first two counts.",
  "Compare an empty-string join with each original sentence and sum the successful comparisons.",
  "Use count_of on the exact spaced and unspaced strings. A visually hidden leading character still distinguishes an entry."
], check: numberCheck("How many times does the pattern produce the word the with a space in front of it?", 9, 0.0, "The spaced piece \" the\" occurs nine times, while bare \"the\" never occurs in this notebook’s pattern output. Vocabulary spellings reflect the actual preliminary pieces, including spaces.") },
            ),
            exercise(
              "Delete one part of the pattern at a time",
              [
  "The starter supplies three patterns: the original, one without contraction branches and one without optional leading spaces on character runs.",
  "Build a tokenizer for each. Print token counts for the Dr. Alvarez sentence and the complete six-sentence notebook, plus how many notebook sentences still reconstruct by direct concatenation.",
  "Change only the pattern supplied to the tokenizer. Retaining all characters does not force a particular number of pieces."
],
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
              {
question: "Which part of the pattern is responsible for each change in token count?",
 hints: [
  "Each pattern is a Python string passed with pattern=.",
  "Sum split(text).n_words over the notebook. Test reconstruction separately for each sentence.",
  "Inspect what happens to the apostrophe suffix when its special branch is removed; it can become separate punctuation and letters."
], check: numberCheck("How many pieces do the six sentences give with the seven contraction branches deleted?", 86, 0.0, "Removing the contraction branches gives 86 notebook pieces. The characters still survive, but the contraction’s punctuation and letters are grouped differently.") },
            ),
            exercise(
              "Put twelve spellings to the seven branches",
              [
  "Apply the supplied pattern to all twelve probe texts. For each print the piece count, whether any piece exactly equals one of the seven supplied contraction suffixes, and the escaped source.",
  "Finish with the number of probes triggering that exact-suffix test. Preserve capitals and apostrophe characters rather than normalizing the inputs.",
  "A branch match reports what the regular expression did. It does not establish that it recognized the grammatical role intended by the writer."
],
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
              {
question: "When do the pattern’s contraction branches actually match typed text?",
 hints: [
  "Use any(piece in endings for piece in result.texts) for the stated test.",
  "Use ascii or !a to distinguish the curved apostrophe from the straight one.",
  "Keep the supplied endings unchanged. Their matching is case-sensitive in this pattern."
], check: numberCheck("On how many of the twelve texts does a contraction branch fire?", 6, 0.0, "Six probes contain a matching suffix piece. Some familiar contractions miss because of spelling, while a suffix-shaped match can also occur in a different grammatical use.") },
            ),
          ],
        },
      ]}
    />
  );
}
