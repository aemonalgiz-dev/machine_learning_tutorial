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
import { ExceptionEntryTable } from "@/components/widgets/ExceptionEntryTable";
import { MosesCostPanel } from "@/components/widgets/MosesCostPanel";
import { MosesPlayground } from "@/components/widgets/MosesPlayground";
import { PrefixListPanel } from "@/components/widgets/PrefixListPanel";
import { RoundTripPanel } from "@/components/widgets/RoundTripPanel";
import { StopProbePanel } from "@/components/widgets/StopProbePanel";

export const metadata: Metadata = pageMetadata("/concepts/moses-rules", {
  title: "Moses Rules · Perceptron Lab",
  description:
    "Moses tokenization separates punctuation while accounting for language-specific forms such as abbreviations. Its exceptions affect which marks remain attached to a word and which become separate pieces.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MosesRulesPage() {
  return (
    <ConceptPage
      lessonId="moses-rules"
      intuition={lessonIntuitions["moses-rules"]}
      technicalStart="Part 2. The Full Stop, and the List It Cannot Do Without"
      openingTitle="A Full Stop Does Not Always End a Sentence"
      playgroundTitle="See how punctuation and language settings change the pieces"
      playgroundIntro="Compare a sentence-ending period, an abbreviation, and a decimal. Inspect which rule applies and where an exception list changes the cut."
      title="Moses Rules"
      tagline={"Moses tokenization separates punctuation while accounting for language-specific forms such as abbreviations. Its exceptions affect which marks remain attached to a word and which become separate pieces."}
      prerequisites={
        <>
          The{" "}
          <Link href="/concepts/splitting-on-spaces" className={link}>
            splitting on spaces
          </Link>{" "}
          page, which introduces the sentence and the six-sentence notebook
          these pages count over, and the{" "}
          <Link href="/concepts/penn-treebank-rules" className={link}>
            Penn Treebank rules
          </Link>{" "}
          page, which is the rule list this one is measured against on every
          section below and the one it is most often confused with. The{" "}
          <Link href="/concepts/unicode-word-boundaries" className={link}>
            Unicode word boundaries
          </Link>{" "}
          page is useful and not required. Nothing is fitted here, so no corpus
          is needed to make the rules work, only to count what they do.
        </>
      }

      playground={<MosesPlayground />}
      sections={[
        {
          title: "Part 1. Rules Written for a Translation System",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The pieces have to go back together again">
                <p>
                  A word counter can finish once it has produced pieces. A translation system still has work to do: after its model chooses output pieces, those pieces must become readable text again. A rule that is convenient on input can leave the output with misplaced spaces or punctuation.
                </p>
                <p>
                  The earlier space and boundary rules gave us useful points of comparison. Here we will judge a tokenizer together with its reverse operation, using the same sentence so the punctuation decisions remain visible.
                </p>

                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  In a phrase-based translation pipeline, separate spellings can divide counts across entries. Keeping <span className="font-mono">Dr.</span> together and separating the final period from <span className="font-mono">re-analysis</span> can make those counts more consistent. Splitting <span className="font-mono">didn&apos;t</span> also gives alignment a smaller unit to work with. Whether the target language expresses negation as a separate word depends on that language and translation.
                </p>
                <KeepInMind>
                  {"The translation pipeline needs consistent counting units and a way to display generated units as readable text. Those are related requirements, but readable detokenization does not by itself guarantee recovery of an input’s exact original spacing."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Punctuation and contractions in the Alvarez sentence" id="2-the-running-sentence-cut-with-every-span">
                <p>
                  Here is the whole method applied once. Nine pieces, each shown
                  with the half-open span of the sentence it stands for, so the
                  first number is where it starts and the second is one past
                  where it stops.
                </p>
                <WorkedExample title="Nine pieces, and where each came from">
                  <Equation>
                    {"Dr.            [0, 3)\n" +
                      "Alvarez        [4, 11)\n" +
                      "didn           [12, 16)\n" +
                      "'t             [16, 18)\n" +
                      "expect         [19, 25)\n" +
                      "the            [26, 29)\n" +
                      "low-cost       [30, 38)\n" +
                      "re-analysis    [39, 50)\n" +
                      ".              [50, 51)"}
                  </Equation>
                  <p>
                    Four things happened. The contraction was cut at the
                    apostrophe, at a position where there is no space. The final
                    stop came off and became a piece of its own. The stop after{" "}
                    <span className="font-mono">Dr</span> did not, so the
                    abbreviation survived whole. And both hyphenated compounds
                    were left exactly as they were written.
                  </p>
                </WorkedExample>
                <p>
                  {"At the default settings, each displayed piece equals its source slice. Their spans cover the sentence except for its six spaces. Later options deliberately rewrite escaping characters and hyphens, so we will inspect how those mappings affect the output."}
                </p>
                <KeepInMind>
                  {"The nine spans cover 45 of 51 source characters. Only the six spaces are excluded in this example, and the default pieces are not rewritten. Their strings alone still do not record the original spacing."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Nine pieces twice over, and seven of them the same">
                <p>
                  The annotation rules give nine pieces on that sentence too,
                  which is why the two are so often taken for one method. They
                  are not the same nine. Seven of the pieces are shared, and the
                  two that are not are the halves of the contraction.
                </p>
                <NumberTable
                  headings={["rule", "pieces", "what it did to the contraction"]}
                  rows={[
                    [
                      "every run of spaces",
                      "7",
                      "left it whole, along with both stops",
                    ],
                    [
                      "the annotation rules",
                      "9",
                      "cut it into did and n't, in front of the negation",
                    ],
                    [
                      "these rules",
                      "9",
                      "cut it into didn and 't, at the apostrophe",
                    ],
                    [
                      "a table of exceptions",
                      "13",
                      "cut in front of the negation, and both compounds cut at the hyphen as well",
                    ],
                  ]}
                  caption="Four answers to one sentence. The two nines share seven pieces, and the two that differ are exactly the two halves of the contraction."
                />
                <p>
                  Treebank retains the negative ending <span className="font-mono">n&apos;t</span> as a unit. Moses instead cuts at the straight apostrophe according to its language setting. Either split can concatenate back to the source word. That property does not decide which units best suit a grammar annotator or a translation aligner.
                </p>
                <KeepInMind>
                  The two rule lists agree on the count and part on one word,
                  and the disagreement is whether the cut goes where the
                  morpheme is or where the mark is. The rest of the page is
                  about the clause where they part much more widely.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What the rules read, and what they do not">
                <p>
                  The implementation first processes each non-whitespace run, then makes a second pass to handle the final stop. We can inspect the decisions in order:
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what is consulted to answer it"
                  rows={[
                    {
                      expression: "is this character a piece on its own",
                      reason:
                        "whether it is a letter, a digit, a stop, an apostrophe or a hyphen. Anything else stands alone wherever it is, one character at a time, with one exception for a comma that has a digit on both sides of it.",
                    },
                    {
                      expression: "which side does this apostrophe go with",
                      reason:
                        "the character before it and the character after it, plus the setting that says which language is being read. Nothing else, and no list of forms.",
                    },
                    {
                      expression: "does this final stop belong to the word",
                      reason:
                        "whether there is another stop and a letter inside the word, whether the word is on a named list, and the first character of the next word. This is the only clause anywhere here that reads a list.",
                    },
                  ]}
                />
                <p>
                  There is no dictionary of English, no frequency count and
                  nothing learned from a corpus. Two switches sit beside the
                  clauses and are off unless a caller asks, one that cuts a
                  compound at its hyphen and leaves a marker where the hyphen
                  was, and one that rewrites a handful of characters a file
                  format would otherwise swallow. Both are in Part 4, because
                  both are rewritings and both are undoable, which is the
                  argument of that part.
                </p>
                <KeepInMind>
                  {"The scanner applies character tests, then makes a pass over the units for final periods. The abbreviation entries are part of its configuration. No model is fitted, but reproducing the result still requires the same lists, options and implementation."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Full Stop, and the List It Cannot Do Without",
          content: (
            <>
              <SubSection title="5. One character doing two jobs">
                <p>
                  A full stop marks the end of a sentence and it marks an
                  abbreviation, and it is the same character both times. In our
                  running sentence both jobs are being done, once after{" "}
                  <span className="font-mono">Dr</span> and once at the end, and
                  a rule that cuts every stop off gets the second right and the
                  first wrong while a rule that cuts none off does the reverse.
                </p>
                <p>
                  {"The Treebank-style heuristic separates the last eligible period in an input. It works for the two periods in our running sentence. It does not guarantee that every other period is an abbreviation or that every one-sentence input gets the desired attachment."}
                </p>
                <p>
                  {"The Moses-style rule can examine each period-ending unit without assuming it is the end of the entire input. It uses interior periods, abbreviation entries and the following unit as evidence. A named list is one way to add lexical knowledge; shape and position alone do not settle every case."}
                </p>
                <KeepInMind>
                  For this full-stop decision, the Moses-style rule looks at the preceding word&apos;s identity, using a list of forms that should keep their stop. The annotation rule instead uses its position in the text. Let&apos;s try more than Dr. Alvarez, because that one example hides several ways the two rules disagree.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Four clauses, and only one of them is a list">
                <p>
                  {"The rule retains a single final period when any of the four conditions below holds. Read these as operational tests, not proofs that the unit is an abbreviation. A following lowercase letter, for example, is a useful cue that can still be wrong."}
                </p>
                <Equation>
                  {
                    "the part before the stop holds another stop and a letter\n" +
                    "        U.S.   e.g.   i.e.\n" +
                    "the part before the stop is on the named list\n" +
                    "        Dr.    Prof.   Ltd.   Nov.   J.\n" +
                    "the part before the stop is on the figures list and a figure follows\n" +
                    "        No. 5   Art. 3\n" +
                    "the next word begins with a lowercase letter\n" +
                    "        et al. ran   approx. forty"
                  }
                </Equation>
                <p>
                  {"An interior period plus a letter keeps forms such as the listed initialisms together. It can also match other strings with that shape. The lowercase lookahead assumes a sentence probably did not end before a lowercase word. Informal writing and names with unconventional capitalization can violate that assumption."}
                </p>
                <p>
                  The third clause exists because{" "}
                  <span className="font-mono">No.</span> is an abbreviation in{" "}
                  <span className="font-mono">No. 5</span> and an ordinary word
                  in <span className="font-mono">No. Nothing arrived.</span>{" "}
                  Those two are the same five characters and the difference is
                  entirely in what comes next, so the entry carries a condition
                  rather than an unconditional promise.
                </p>
                <KeepInMind>
                  {"The list and the character conditions contribute differently on different inputs. Section 10 counts which conditions actually retain periods in the supplied eighteen-example collection. That lets us separate the implemented tests from the examples that happen to exercise them."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The same stop, kept in one text and split in another">
                <p>
                  The way to see those clauses working is to give the rules the
                  same abbreviation twice with different writing after it. Ten
                  stops are below, every one of them somewhere in the middle of
                  its text rather than at the end, so every one of them has an
                  answer that can be stated before any rule is run.
                </p>
                <StopProbePanel />
                <p>
                  Read the three pairs. <span className="font-mono">No.</span>{" "}
                  keeps its stop before a figure and loses it before a sentence,
                  which is the third clause doing exactly what it was written
                  for. <span className="font-mono">approx.</span> is on no list
                  at all and keeps its stop before{" "}
                  <span className="font-mono">forty</span> and loses it before{" "}
                  <span className="font-mono">40</span>, which is the fourth
                  clause rescuing a word nobody thought of and then failing on
                  the same word for a reason that has nothing to do with the
                  word. And <span className="font-mono">et al.</span> survives
                  before a lowercase verb and is cut in front of a capital.
                </p>
                <KeepInMind>
                  Three of the five stops these rules kept were kept by the
                  character after them rather than by anything about the word
                  carrying it, and every one of the five they split would have
                  been kept had that character been lowercase, including the one
                  that really did end a sentence. A clause that reads the next
                  word is cheap, and it makes the answer depend on writing that
                  has nothing to do with the abbreviation.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Scored against an answer written down first">
                <p>
                  Those ten stops can be scored, since each of them has a right
                  answer. Eight belong to the word in front of them and two end a
                  sentence. These rules place seven of the ten where they belong,
                  the annotation rules place eight, and a written-out table of
                  exceptions places four.
                </p>
                <p>
                  {"In this probe set, the Treebank-style rule retains all ten internal periods, so its eight correct answers equal the number labeled “keep.” Moses returns both decisions and gets seven correct. The exception-table comparison also returns both decisions. Accuracy describes these ten cases; class balance and the kinds of errors matter when deciding which procedure fits another collection."}
                </p>
                <NumberTable
                  headings={[
                    "over the same ten stops",
                    "these rules",
                    "the annotation rules",
                    "a table of exceptions",
                  ]}
                  rows={[
                    ["placed where it belongs", "7", "8", "4"],
                    ["answered kept", "5", "10", "2"],
                    ["stops whose answer is kept", "8", "8", "8"],
                  ]}
                  caption="On these ten probes, retaining every period yields eight correct labels. Moses and the exception-table rule both return a mix of kept and split decisions."
                />
                <KeepInMind>
                  {"The positional rule has the highest accuracy on these ten probes, while always retaining the period. Moses makes a more varied decision here, but that alone does not establish better accuracy on new data. Compare the errors and intended input pipeline as well as the total."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. An abbreviation nobody listed">
                <p>
                  All three of the misses above are the same failure.{" "}
                  <span className="font-mono">Gov.</span> is a title and is not
                  on the list, and the word after it is a surname beginning with
                  a capital, so no clause saves it and the rules answer{" "}
                  <span className="font-mono">Gov</span> and a stop. The
                  annotation rules keep it whole, and they are right by accident,
                  since they would keep{" "}
                  <span className="font-mono">small.</span> whole in the same
                  position.
                </p>
                <Equation>
                  {"Gov. Reyes asked for the figures.\n" +
                    "        ->  Gov  .  Reyes  asked  for  the  figures  .\n\n" +
                    "Dr. Alvarez signed the re-analysis.\n" +
                    "        ->  Dr.  Alvarez  signed  the  re-analysis  ."}
                </Equation>
                <p>
                  Two titles, written identically, one on the list and one not,
                  and the difference in the output is a spurious piece and a
                  spurious row. That is the exact failure the whole method was
                  built to prevent, since{" "}
                  <span className="font-mono">Gov</span> now sits in the table
                  beside every other truncated word and the stop it lost sits
                  beside every sentence-final stop.
                </p>
                <WhyThisWorks title="Why a longer list does not close this">
                  <p>
                  Adding <span className="font-mono">Gov</span> would fix that listed title. It would not establish coverage of <span className="font-mono">Sen</span> or other forms. The returned pieces do not say which lexical test failed, so representative tests or added diagnostics are useful alongside list maintenance.
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"The result does not include an unknown-abbreviation warning. Inspecting the returned pieces, checking known examples or adding diagnostics can expose a coverage gap that a successful API response does not report."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Fifty-five entries, and how many a corpus reaches">
                <p>
                  The English exception list has 55 entries: 27 named forms, 26 individual capital letters for initials, and two forms whose stops are kept only before a number. Let&apos;s measure how often these entries affect the examples rather than infer their usefulness from the list&apos;s length.
                </p>
                <p>
                  {"The six-sentence notebook has only one abbreviation, so it exercises little of the list. The second collection contains eighteen examples written for this page in a meeting-minutes style. They include titles, months, article numbers and company suffixes. They are an authored test collection, not a representative sample of proceedings."}
                </p>
                <PrefixListPanel />
                <p>
                  {"There are 39 period-ending candidate units in the eighteen examples, and 19 distinct list entries match. The other 36 entries do not match this collection. Those numbers measure coverage of the test cases, not how many individual hash-table entries the code physically inspects. Five abbreviations in the collection are absent from the list."}
                </p>
                <p>
                  {"In this collection, the rule retains twenty periods: eighteen through the ordinary prefix list and two through the numeric-only list. Neither the interior-period condition nor lowercase lookahead retains one. The examples contain no matching U.S.-style form, and their titles generally precede capitalized surnames. Another collection can exercise those conditions differently."}
                </p>
                <KeepInMind>
                  {"The collection reaches 19 of 55 entries and includes five abbreviations absent from the list. Every retained period here is retained by one of the lists. Unused entries and untriggered character conditions remain part of the method, even though this small collection does not test them."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Both rule lists give nine pieces on the sentence about Dr. Alvarez and part on the contraction, one cutting in front of the n and the other at the apostrophe. What decided it here?",
              [
                "Only the cut at the apostrophe lets the pieces be joined back into the sentence",
                "The cut at the apostrophe needs nothing known about English, and the same script had to run over eleven languages",
                "The cut in front of the n opens a second row for a word the corpus already holds",
                "The apostrophe is the only mark the rules are allowed to cut at",
              ],
              1,
              "These rules use an apostrophe-based cut, while the Treebank convention separates the negation piece. Both can preserve source characters for this sentence, so reconstruction alone does not select the better convention. The choice depends on what the downstream pipeline expects to count or annotate. Language-specific settings and exceptions still need to be stated.",
            ),
            trueFalse(
              "On the ten scored stops the annotation rules place eight where they belong against these rules’ seven, and a set of ten with the proportions reversed would have given the annotation rules two.",
              true,
              "The Treebank rule keeps all ten tested periods, so its eight correct results match the test set’s eight kept-label examples. That constant decision would score differently on a differently balanced set. Moses makes both kept and split decisions here. Compare performance within each labeled group or use a representative test set before drawing a broader conclusion.",
            ),
            choice(
              "The clause that rescues an abbreviation nobody listed reads one character of lookahead. What is it reading, and why?",
              [
                "Whether the next character is a capital, since an English sentence begins with one so a lowercase word after a stop means the stop did not end a sentence",
                "Whether the next character is a letter, since a stop between two letters is never a sentence stop",
                "Whether the next character is a space, since a sentence stop is always followed by one",
                "Whether the next character is a figure, since a figure after a stop marks an article number",
              ],
              0,
              "It is a piece of reasoning about writing rather than about language, and it costs one character. It also makes the answer depend on writing that has nothing to do with the abbreviation, which is why approx. keeps its stop before forty and loses it before 40. The figure test is the third clause, which is the condition attached to particular entries such as No.",
            ),
            several(
              "Counted over the eighteen minuted sentences, which of these hold of the list of 55 entries?",
              [
                "19 entries answered the question and the other 36 were never consulted at all",
                "Five real abbreviations turn up that no entry covers",
                "Every stop that was kept was kept by a list rather than by a clause reading characters",
                "The clause that catches an interior stop carried most of the kept stops",
              ],
              [0, 1, 2],
              "Twenty stops were kept over those sentences, 18 by the named list and 2 by the figures list, and the two cheap clauses kept none. The interior-stop clause needs a word like U.S., which these sentences happen not to contain, and the lowercase clause needs an abbreviation followed by an ordinary lowercase word, which almost never happens here because the abbreviations are titles and the next word is a surname.",
            ),
            trueFalse(
              "When no clause covers a word, a caller can tell from the output that the list was consulted and found nothing.",
              false,
              "The rules never refuse and never report. Gov is a title and is not on the list, and the word after it is a capitalized surname, so no clause saves it and Gov comes back beside every other truncated word with the stop it lost beside every sentence-final stop. Adding Gov leaves Sen, and adding that leaves the next one.",
            ),
        ],
        },
        {
          title: "Part 3. A Rule Everywhere, and a Named List of Places It Must Not",
          content: (
            <>
              <SubSection title="11. The shape, and why it is not simply a longer rule">
                <p>
                  Step back from the full stop for a moment, because the clause
                  that reads a list has a shape that turns up all over this
                  section of the site and is worth naming once. A rule states
                  what to do everywhere, a table names the places where the rule
                  must not be followed, and the table is consulted first.
                </p>
                <Equation>
                  {"for each run of characters with no spacing in it\n" +
                    "        if the run is named in the table\n" +
                    "                do what the table says and stop\n" +
                    "        otherwise\n" +
                    "                apply the rules"}
                </Equation>
                <p>A longer pattern could include alternatives for these finite spellings. The lookup table keeps word-specific conventions separate from the general suffix rule, making each exception easier to inspect and change. That is a maintainability choice, not a limit on what regular expressions can match.</p>
                <p>A shape-based pattern can group abbreviations with ordinary capitalized words ending in a period. A lookup table lets the tokenizer name particular abbreviations explicitly. Its coverage still depends on the maintained entries and language setting; recognizing the punctuation shape does not supply every lexical convention.</p>
                <KeepInMind>
                  A table keeps named lexical exceptions separate from a general rule. The later lessons on {" "}
                  <Link href="/concepts/maximum-matching" className={link}>
                    Maximum matching
                  </Link>{" "}
                  and{" "}
                  <Link href="/concepts/the-word-lattice" className={link}>
                    the word lattice
                  </Link>{" "}
                   use larger dictionaries, while still needing search procedures and fallback rules.</KeepInMind>
              </SubSection>

              <SubSection title="12. The clause with no list at all">
                <p>
                  Set beside that, the apostrophe clause here is the interesting
                  case, because it is the place where these rules have no list
                  and the annotation rules do. Cutting at the apostrophe is one
                  statement, applied to every apostrophe standing between two
                  letters, and it covers{" "}
                  <span className="font-mono">didn&apos;t</span>,{" "}
                  <span className="font-mono">it&apos;s</span>,{" "}
                  <span className="font-mono">they&apos;re</span> and{" "}
                  <span className="font-mono">y&apos;all</span> alike.
                </p>
                <Equation>
                  {"didn't   ->  didn   't\n" +
                    "can't    ->  can    't\n" +
                    "won't    ->  won    't\n" +
                    "1990's   ->  1990   's\n" +
                    "students'->  students   '\n" +
                    "l'analyse->  l   'analyse   under the English setting\n" +
                    "l'analyse->  l'   analyse   under the French setting"}
                </Equation>
                <p>
                  These forms do not need individual entries in the apostrophe rule. The output <span className="font-mono">didn</span> plus <span className="font-mono">&apos;t</span> is a character split rather than the Treebank negative unit <span className="font-mono">n&apos;t</span>. For French and Italian, the setting moves an apostrophe between letters to the other piece. This mirrors a common elision convention without claiming complete clitic analysis for either language.
                </p>
                <InAModel>
                  <p>
                    That trade shows up as a cost in the very thing the rules
                    were built to protect. Over the six sentences of the
                    notebook, these rules produce 49 different pieces and the
                    annotation rules produce 48, and the extra one is{" "}
                    <span className="font-mono">didn</span>. The notebook already
                    contains <span className="font-mono">did</span> in{" "}
                    <span className="italic">the drift did not go away</span>, so
                    the annotation cut reuses a row that already exists and this
                    one opens a row holding a single occurrence. Six sentences
                    are far too few to settle anything, and the direction is
                    still worth reporting, since the whole reason for touching
                    the apostrophe was to stop one word occupying two rows.
                  </p>
                </InAModel>
                <KeepInMind>
                  {"The final-period decision combines named prefixes with character context. The apostrophe decision uses context and a language setting instead of a word list. These are different ways to encode a convention; their usefulness depends on the forms the application needs to handle."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. An entry says where a word is cut, never what it becomes">
                <p>
                  {"The optional rule-and-exception table requires listed pieces to concatenate to the named source form. That is a contract of this interface. A different transformation stage could normalize text, provided it records enough information when reconstruction is required."}
                </p>
                <ExceptionEntryTable />
                <p>
                  Expanding <span className="font-mono">can&apos;t</span> into <span className="font-mono">can</span> and <span className="font-mono">not</span> would normalize the spelling rather than merely divide its source characters. This exception-table interface rejects that proposal. A different stage could perform it with a source mapping or transformation record when exact reconstruction is required.
                </p>
                <p>

                  Normalizing a word to a different word is a real job and it is
                  done elsewhere in a pipeline, before or after this step, where
                  it can be recorded. The one place these rules do change a
                  piece&rsquo;s text is the subject of the next part, and they do
                  it in a way that can be read backwards.
                </p>
                <KeepInMind>
                  {"The proposal panel accepts only segmentations whose pieces join to the original form. Three of six fail that check. A valid entry can change boundaries while leaving the source spelling unchanged."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. One table per language, and one setting that does not choose it">
                <p>
                  The list of abbreviations is English. A French text handed to
                  these rules gets the English abbreviations checked against it,
                  and the setting that turns the apostrophe cut around does not
                  turn the list around, because there is nothing to turn it to
                  unless somebody has written the French file.
                </p>
                <p>The original toolkit used language-specific abbreviation files. Recognizing a particular abbreviation therefore depends on the entries in the selected file. The measured examples here are English. The French and Italian controls in this teaching implementation change the apostrophe split; they do not demonstrate complete coverage of those languages.</p>
                <WorkedExample title="The Alvarez sentence under the French punctuation rules">
                  <Equation>
                    {"English setting   Dr.  Alvarez  didn  't  expect  the  low-cost  re-analysis  .\n" +
                      "French setting    Dr.  Alvarez  didn'  t  expect  the  low-cost  re-analysis  ."}
                  </Equation>
                  <p>
                  {"In this teaching implementation, switching to French moves the displayed apostrophe boundary while retaining the same English abbreviation list. It therefore does not provide French abbreviation coverage. The original toolkit’s language-specific data files are a separate part of reproducing its language behavior."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  The clause is a rule plus a data file, and the file has a
                  language written on it. What that means for correctness is the
                  subject of the last part.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Round Trip",
          content: (
            <>
              <SubSection title="15. What a translation system hands back is text">
                <p>
                  {"A translation system must turn generated tokens into readable output. That does not require a translation to reproduce the original source sentence or spacing. Here we test a narrower tokenization property: whether the input’s non-whitespace characters survive and which transformations need an inverse."}
                </p>
                <p>
                  We can test whether tokenization preserves the non-spacing characters. Discard the spans, concatenate the pieces without separators, and compare the result with the source after removing spacing. State that target clearly: passing this check would not establish that the original spacing can be recovered.
                </p>
                <RoundTripPanel />
                <p>
                  {"On the quoted example, both lists give fourteen pieces. Joining the default Moses pieces without separators reproduces the source after whitespace is removed. The Treebank quote spellings fail that direct check because two pieces are rewritten. On the eighteen authored minutes-style examples, the check passes eighteen times for Moses and seventeen for Treebank. A separate inverse mapping can address a known rewrite, but exact source recovery needs enough information to distinguish its possible inputs."}
                </p>
                <KeepInMind>
                  Fourteen pieces against fourteen, and no rewriting against
                  two. The two rule lists cut the sentence in almost the same
                  places, and what separates them here is whether a piece is
                  allowed to hold something the writing never did.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Two texts, one answer, and no way back">
                <p>
                  {"Compare a sentence containing straight quotation marks with one containing literal double backquotes and apostrophes. If tokenization normalizes them to the same pieces, the output strings alone cannot identify which spelling was supplied."}
                </p>
                <Equation>
                  {'she said "wait" and left\n' +
                    "she said ``wait'' and left"}
                </Equation>
                <p>
                  Under the annotation rules, these inputs produce the same seven pieces, so those pieces cannot reveal which quotation spelling the source used. The original needs to be retained if that distinction matters. The Moses-style rules here instead produce seven pieces for the first input and nine for the second, because the backquotes remain separate characters. That difference preserves evidence that the annotation normalization removed.
                </p>
                <KeepInMind>
                  To reverse a rewrite uniquely, different original forms must remain distinguishable. Replacing plain quotation marks with backquotes can erase that distinction when the source already contains literal backquotes. We need retained source information or an escaping convention to reconstruct both cases correctly.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The two rewritings these rules do, and why both come back">
                <p>
                  There are two things these rules will change about a
                  piece&rsquo;s text, and both are off unless asked for. The
                  first replaces eight characters with names, because a phrase
                  table is a text file whose fields are separated by vertical
                  bars and whose decoder reads angle brackets as markup, so a
                  vertical bar in a training sentence would have been read as a
                  field boundary and corrupted its row.
                </p>
                <Equation>
                  {"&  ->  &amp;        |  ->  &#124;\n" +
                    "<  ->  &lt;         >  ->  &gt;\n" +
                    "'  ->  &apos;       \"  ->  &quot;\n" +
                    "[  ->  &#91;        ]  ->  &#93;"}
                </Equation>
                <p>
                  The inverse is applied to each token’s text with the escaping option known. Escaping ampersands too keeps a literal entity-like spelling distinguishable from an escaped quotation character such as <span className="font-mono">&amp;quot;</span>. In the quoted example, the two quotes and contraction apostrophe become three rewritten pieces. Reversing those mappings restores their non-whitespace source characters, not the discarded spacing.
                </p>
                <p>
                  The second rewriting is the compound. Cutting{" "}
                  <span className="font-mono">low-cost</span> into three lets{" "}
                  <span className="font-mono">low</span> and{" "}
                  <span className="font-mono">cost</span> share their statistics
                  with every other use of those words, and the piece left in the
                  middle is spelt{" "}
                  <span className="font-mono">@-@</span> rather than{" "}
                  <span className="font-mono">-</span> so that the same script
                  can tell a hyphen that joined a compound from a dash that stood
                  between two words. That marker is one character wide in the
                  source and three characters long as a piece, and it undoes to
                  the hyphen it stands for.
                </p>
                <WorkedExample title="Split the compounds in the Alvarez sentence">
                  <Equation>
                    {"Dr.  Alvarez  didn  't  expect  the\n" +
                      "low  @-@  cost  re  @-@  analysis  ."}
                  </Equation>
                  <p>
                    Thirteen pieces where there were nine, and the two markers
                    each name a single character of the sentence. Over the
                    eighteen minuted sentences the same switch takes 228 pieces
                    to 240, and over the six-sentence notebook it takes 72 to 84,
                    which is twelve more in each case.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  {"Both options can change a piece’s spelling while retaining its source span. Reversal also requires knowing which option and mapping produced the spelling. Apply the inverse to token boundaries before joining; positions alone do not explain how an arbitrary rewrite should be undone."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What the round trip does not buy">
                <p>
                  It is easy to read all this as saying the text comes back, and
                  it does not, quite. Joining the pieces in order recovers every
                  character that is not spacing, and it recovers none of the
                  spacing. Joining them with one space each gives the source for
                  all eighteen minuted sentences when the text was only cut at
                  the spaces, and for two of the eighteen under these rules.
                </p>
                <p>
                  The two that do come back are the sentences that happen to end
                  in an abbreviation, so that every piece was already separated
                  by a space in the writing. The other sixteen have a comma or a
                  final stop standing alone, and a space in front of a comma is
                  not English. Restoring that is the job of the second script
                  that shipped alongside, and it is a set of conventions about a
                  language rather than anything the pieces carry.
                </p>
                <p>
                  {"The source plus spans can recover the original text. At the default Moses settings, piece strings alone retain the non-whitespace characters in order; separators still need a convention or a separate record. Treebank-style normalization can additionally merge distinct quotation spellings."}
                </p>
                <KeepInMind>
                  Two of eighteen sentences come back from the pieces alone by
                  putting one space between each pair. Reversible here means the
                  characters survive in order, and something downstream still has
                  to know that English writes no space before a comma.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Why keep word-specific contraction conventions in a lookup table instead of expanding one general suffix pattern?",
              [
                "A table is faster than a pattern when the same clause runs over eleven languages",
                "Word-specific conventions are easier to inspect and maintain as entries than folded into a general suffix pattern.",
                "A pattern cannot read an apostrophe standing between two letters",
                "The table also records rewritten spellings that a pattern cannot produce.",
              ],
              1,
              "A longer regular expression could include alternatives for these finite spellings. A table keeps the word-specific choices separate from the general pattern, making them easier to inspect and change. The reason is maintainability and a clear convention, not that the characters are mathematically impossible to match.",
            ),
            trueFalse(
              "An entry in a table of this shape may say where a word is cut and may not say what the pieces are spelt as, so can’t cannot be listed as can and not.",
              true,
              "This lookup-table API requires the listed pieces to concatenate to the original spelling. That keeps each piece a literal source span. Listing can and not for can’t would violate that contract, so normalization would need a different operation and enough information to reverse it if exact reconstruction matters. Other tokenization APIs can permit rewritten spellings.",
            ),
            choice(
              "The annotation rules rewrite an opening quotation mark into two backquotes. Why can that not be undone?",
              [
                "The rewriting changes the span the piece names, so the original position is lost",
                "Two backquotes is how a typist of the period produced the mark, so nothing in the output distinguishes a rewritten sentence from one typed that way",
                "The mapping is not recorded anywhere, unlike the eight-character table",
                "Backquotes are not characters a phrase table is allowed to hold",
              ],
              1,
              "The annotation rules map a sentence with plain quotation marks and its backquote-and-apostrophe variant to the same seven pieces. Those pieces alone cannot tell us which form was supplied. The Moses-style rules here keep them distinct: the plain version gives seven pieces and the typed version nine, since the backquotes are treated separately.",
            ),
            trueFalse(
              "Joining the pieces with one space between each pair gives back all eighteen minuted sentences.",
              false,
              "A single-space join reproduces only two of the eighteen supplied sentences. In the others, separated punctuation and contraction pieces need different joining rules. The pieces retain the non-whitespace character sequence here, but not the original gaps. Spans locate those gaps; the retained source supplies their exact contents.",
            ),
            choice(
              "Under the French setting the contraction of the sentence about Dr. Alvarez is cut behind its apostrophe instead of in front of it. What else in the sentence comes out differently?",
              [
                "Nothing, since the setting moves the apostrophe cut and the list of abbreviations stays the English one",
                "The title loses its stop, since the French list does not hold it",
                "Both compounds are cut at the hyphen, as French writes them",
                "The apostrophe is rewritten as a named character",
              ],
              0,
              "The same clause was written once and turned round for French and Italian by moving the cut to the other side of the mark, which is a setting rather than a second table. The list is a data file with a language written on it, and a language is supported exactly when somebody has sat down and listed its abbreviations. Every measurement on the page is English.",
            ),
        ],
        },
        {
          title: "Part 5. What It Costs",
          content: (
            <>
              <SubSection title="19. More pieces, and everything downstream pays per piece">
                <p>
                  {"Separating punctuation can increase the number of input positions. The cost depends on how the next stage uses those pieces. Dense attention has quadratic pair counts within a sequence, while lookup, batching and other operations have different scaling."}
                </p>
                <MosesCostPanel />
                <p>
                  {"On the eighteen authored minutes-style examples, Moses produces 228 pieces and whitespace splitting produces 192, an increase of 18.75 percent. The exception-table rule gives 243 because it also separates hyphenated compounds."}
                </p>
                <Equation>
                  {"228 − 192   =  36 more pieces\n" +
                    "36 / 192    =  18.75 percent"}
                </Equation>
                <p>
                  The 36 are not spread evenly over the writing. Twenty of them
                  are full stops standing alone, eight are commas and four are
                  quotation marks, which is the 32 pieces holding no letter and
                  no digit, and the rest are the second halves of the
                  contractions and possessives. On the
                  six-sentence notebook these rules give 72, splitting on spaces
                  gives 63, the annotation rules give 72 as well and the table
                  gives 84.
                </p>
                <p>
                  Every rule in that table keeps the same number of characters,
                  931 on the minutes and 318 on the notebook, which is everything
                  in the writing that is not spacing. That is worth noticing
                  because it is not true of the boundary rules on the earlier
                  page, which find the marks correctly and then discard them.
                  What separates the four here is where the cuts fall.
                </p>
                <KeepInMind>
                  {"The collection gives 228 pieces rather than 192, with 32 punctuation-only pieces among the 228. These counts describe representation length and composition. The next comparisons ask whether the different units reduce vocabulary duplication or handle particular forms better."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The vocabulary the rules were meant to shrink">
                <p>
                  {"Separating punctuation is intended to reduce duplicated surface forms, so compare the distinct entries as well as the sequence length. The minutes-style collection has 137 whitespace entries and 136 Moses entries. The notebook has 47 and 49. The small examples therefore show one saving and one increase."}
                </p>
                <p>
                  Nothing is wrong with either number. The mechanism is real and
                  it is visible in the panel above as the words the crude rule
                  spells more than one way, five of them on the minutes and one
                  on the notebook, each an extra row that separating the mark
                  collapses into one. What is missing at this size is repetition.
                  A saving of five rows is paid for by the rows the marks and the
                  contraction halves open, and the two come out level.
                </p>
                <WorkedExample title="Where the 137 and the 136 come from">
                  <p>
                    Lay the two lists of entries for the minutes side by side.
                    They share 106 entries. The crude rule holds 31 that these
                    rules do not, and these rules hold 30 that the crude rule
                    does not.
                  </p>
                  <Equation>
                    {"entries both rules hold                               106\n" +
                      "\n" +
                      "only at spaces\n" +
                      "  a marked run whose word has no other row            24    small.   Gov.\n" +
                      "  a marked run whose word already has a row            5    re-analysis.   Okafor,\n" +
                      "  a contraction                                        2    didn't   It's\n" +
                      "  at spaces               106 + 24 + 5 + 2   =       137\n" +
                      "\n" +
                      "only under these rules\n" +
                      "  the words those 24 runs become                      24    small   Gov\n" +
                      "  marks standing alone                                 3    .   ,   \"\n" +
                      "  pieces of a contraction or possessive                3    didn   't   's\n" +
                      "  under these rules       106 + 24 + 3 + 3   =       136"}
                  </Equation>
                  <p>
                  {"The accounting block distinguishes replacement entries from duplication savings. Some marked spellings are replaced by new bare forms; repeated variants can instead merge into entries already present. Punctuation and contraction pieces add entries of their own. The resulting net difference is one fewer entry in the minutes-style collection and two more in the notebook."}
                </p>
                </WorkedExample>
                <InAModel>
                  <>
<p>
                  {"Separating a fixed set of punctuation marks introduces a limited set of punctuation entries that can be reused. It may also remove many word-plus-punctuation variants as more words recur in different contexts. The net saving depends on those repetitions and the other cuts; corpus size alone does not guarantee it."}
                </p>
                  <p>
                  {"Only five whitespace entries in the eighteen examples duplicate a word under an attached mark. That limits the possible saving in this collection. Larger representative corpora may repeat more such variants, but their net entry counts still need to be measured."}
                </p>
</>
                </InAModel>
                <KeepInMind>
                  137 different pieces against 136 on the minutes and 47 against
                  49 on the notebook, which is a saving of one and a loss of two.
                  The claim about surface vocabulary is a claim about a large
                  corpus and it should not be quoted as though it held at any
                  size.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where the annotation rules are ahead">
                <p>
                  On the minuted corpus the two rule lists produce 228 and 227
                  pieces and disagree on fourteen entries each way, which the
                  panel above lists in full. Ten of those fourteen are one word
                  with and without a full stop, and they are informative because
                  they do not all run in the same direction.
                </p>
                <NumberTable
                  headings={[
                    "in the writing",
                    "these rules",
                    "the annotation rules",
                    "which is right",
                  ]}
                  rows={[
                    ["Gov. Reyes", "Gov and a stop", "Gov.", "the annotation rules"],
                    ["Sen. Duarte", "Sen and a stop", "Sen.", "the annotation rules"],
                    ["Fig. 4", "Fig and a stop", "Fig.", "the annotation rules"],
                    ["Rev. Santos", "Rev and a stop", "Rev.", "the annotation rules"],
                    [
                      "approx. 40",
                      "approx and a stop",
                      "approx.",
                      "the annotation rules",
                    ],
                    ["was small. It", "small and a stop", "small.", "these rules"],
                    [
                      "by Okafor Co.",
                      "Co.",
                      "Co and a stop",
                      "either attachment; annotate the sentence role separately",
                    ],
                    [
                      "in Jan.",
                      "Jan.",
                      "Jan and a stop",
                      "either attachment; annotate the sentence role separately",
                    ],
                    [
                      "residual, etc.",
                      "etc.",
                      "etc and a stop",
                      "either attachment; annotate the sentence role separately",
                    ],
                    [
                      "until Dec.",
                      "Dec.",
                      "Dec and a stop",
                      "either attachment; annotate the sentence role separately",
                    ],
                  ]}
                  caption="The ten disagreements that are a full stop. The first five are abbreviations outside the list, the sixth is the positional rule meeting two sentences in one text, and the last four are that rule reaching the end of a text."
                />
                <p>
                  {"Five displayed cases favor the positional attachment and one favors the Moses attachment. Four sentence-final abbreviations use one period for two roles; either token attachment can be paired with a sentence-boundary annotation. These examples test different conventions and input conditions. They do not establish a universal winner or an unavoidable loss."}
                </p>
                <KeepInMind>
                  {"The positional rule handles several listed abbreviations that the shorter Moses list misses. It also keeps an earlier sentence-ending period attached in the joined example. Choose and test the procedure for the supplied sentence structure and annotation convention."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Where the cruder rule wins, and where the annotation rules do">
                <p>
                  {"Addresses, company names and percentages can occur inside prose. Both listed punctuation rules can split them into several tokens. Whether those splits are suitable depends on whether the application wants whole identifiers, searchable parts or annotation units."}
                </p>
                <NumberTable
                  headings={[
                    "in the writing",
                    "at every run of spaces",
                    "these rules",
                    "the annotation rules",
                  ]}
                  rows={[
                    ["AT&T signed it.", "AT&T", "AT and & and T", "AT and & and T"],
                    ["It rose 40% overnight.", "40%", "40 and %", "40 and %"],
                    ["at a@b.com now", "a@b.com", "a and @ and b.com", "a and @ and b.com"],
                    [
                      "re-analysis_2019.csv",
                      "one piece",
                      "re-analysis and _ and 2019.csv",
                      "one piece",
                    ],
                  ]}
                  caption="If the task is to retain each identifier or numeric expression whole, whitespace splitting supplies that result in these four examples. The character categories do not change; the desired grouping does."
                />
                <p>
                  The last row is worth dwelling on, because the reason for it is
                  arbitrary rather than principled. A hyphen is one of the
                  characters these rules leave inside a word, so{" "}
                  <span className="font-mono">low-cost</span> survives. The underscore is absent from that rule&apos;s allowed list, so the filename is split there. This difference comes from the written punctuation policy. The annotation rules use another policy and keep this filename together.
                </p>
                <KeepInMind>
                  {"If whole identifiers are required, preserve their spans or use a tokenizer that supplies them as units. If components are useful, splitting may be appropriate. The example filename is divided differently by these rules, so test that requirement explicitly."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. When Language-Specific Rules Meet Different Writing" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="23. The correctness is a property of a data file">
                <p>
                  The prefix table helps retain a title such as <span className="font-mono">Dr.</span> when the other character conditions do not match. Without that entry, the default still gives a defined split. The question is whether that split matches the intended abbreviation convention.
                </p>
                <>
<p>
                  So the method is a rule and a table, and what the method does to a text is not determined until somebody has written the table down. That has three consequences worth separating. The answer for a given text depends on which file was loaded, so two callers running the same rules on the same sentence can get different pieces without either being unfaithful.
                </p>
                <p>
                  {"The original toolkit has language-specific tables. Without an appropriate table, its general rules can still return pieces, but abbreviation behavior may not match that language’s convention. The teaching implementation keeps its English table under every supported language setting."}
                </p>
</>
                <p>
                  {"Record which table and options produced the results. Measurements from two configurations can be compared as different configurations, but should not be described as identical runs. Adding Gov or Sen would change decisions on those forms and could change both accuracy and piece counts in this collection."}
                </p>
                <KeepInMind>
                  The rules are exact relative to a table, and the table is a
                  document somebody maintains. Reporting what a method does to a
                  text therefore means reporting which table was in front of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. An abbreviation ending a sentence has no answer">
                <p>
                  A sentence can end with an abbreviation and use one full stop for both the abbreviation and sentence boundary. A rule looking only at that punctuation mark cannot determine the intended structure in every case. We need context or an explicit convention for handling the ambiguity.
                </p>
                <Equation>
                  {"The re-analysis was signed by Okafor Co.\n\n" +
                    "        Co.  is what the abbreviation needs\n" +
                    "        .    is what the sentence needs\n" +
                    "        Co.  and  .   would invent a character"}
                </Equation>
                <p>
                  {"A nonoverlapping token sequence attaches the period once: to Co. or to a separate punctuation token. That does not prevent a separate sentence annotation from marking the same source position. The two tokenizations encode different attachment conventions; neither must discard knowledge that the period also ends a sentence."}
                </p>
                <p>
                  {"The next stage determines which token attachment is convenient. A model counting sentences can use a sentence-boundary annotation, while a surface-form table may keep the abbreviation spelling. Four of the eighteen examples end in abbreviations, so the token and boundary policies should be stated together."}
                </p>
                <KeepInMind>
                  {"One period can have two roles. Choose a token attachment and record the sentence boundary separately when needed. A partition of the source does not have to express every linguistic annotation by duplicating characters."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Reversibility is a constraint on what a rule may do">
                <p>
                  {"Dividing text into source-preserving pieces differs from transforming the spelling. A pipeline can do both, but a transformation stage needs its own reconstruction policy if the original matters. The following examples show where simply joining token strings is insufficient."}
                </p>
                <p>
                  Combining <span className="font-mono">The</span> and <span className="font-mono">the</span> can pool occurrences, but it also removes the case distinction from those token strings. Case may matter to the task. Expanding contractions, changing spellings, replacing numbers or removing accents likewise needs an explicit policy for which distinctions to retain.
                </p>
                <p>
                  This pipeline separates dividing the writing from transforming it. A caller that needs to undo a transformation must retain its inverse or the original source. The two transformations allowed here come with explicit reverse mappings: the table of eight escaped characters and the marker for a hyphen. Their documented mappings make those particular changes recoverable; they do not make every possible input transformation reversible.
                </p>
                <KeepInMind>
                  {"A many-to-one transformation needs retained source information if it must be undone exactly. Keeping that record can be part of the tokenizer or another pipeline stage. The location of the stage is a design choice; information preservation is the requirement."}
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Punctuation and language decisions the rules leave open" id="26-what-is-left-undecided-gathered">
                <p>The selected language and punctuation conventions are part of this tokenizer. The cases below show where those choices change a split and where a downstream application still needs its own rule.</p>
                <DerivationTable
                  expressionHeading="Text or language convention"
                  reasonHeading="Which split requires a policy"
                  rows={[
                    {
                      expression: "an abbreviation ending a sentence",
                      reason:
                        "The token convention determines whether the period stays with the abbreviation or is separate. A sentence-boundary annotation can record its second role at the same source position. Four of the eighteen examples end this way.",
                    },
                    {
                      expression: "an abbreviation nobody listed",
                      reason:
                        "cut, and indistinguishable from a word the clauses examined and left alone. Nothing reports that a list was consulted and found nothing. Eighteen sentences of the register the rules were made for reach 19 of the 55 entries and contain five abbreviations outside them.",
                    },
                    {
                      expression: "which table is loaded",
                      reason:
                        "assumed, never determined. The rule is exact relative to a table and the table is a document somebody maintains, so the same rules over the same sentence give different pieces to two callers holding different files, and neither is being unfaithful.",
                    },
                    {
                      expression: "a language with no table",
                      reason:
                        "outside what the method says rather than handled badly. Every measurement on this page is English. The setting that turns the apostrophe cut around for French and Italian does not turn the abbreviations around, because a list of abbreviations for a language is written by somebody who knows it.",
                    },
                    {
                      expression: "where the cut goes inside a contraction",
                      reason:
                        "not settled by the writing. Cutting at the mark and cutting in front of the morpheme both give pieces that join back to the word, and what chooses is whether the pieces are meant to align to units of another language. Over six sentences that single choice costs one extra row, since didn is a form the corpus holds nowhere else.",
                    },
                    {
                      expression: "restoring the spacing",
                      reason:
                        "outside the method entirely. Joining the pieces in order recovers every character that is not spacing and none of the spacing, and joining them with one space each reproduces 2 of the 18 sentences here against 18 for the rule that only cuts at spaces. Where the spaces go is a set of conventions about a language.",
                    },
                    {
                      expression: "a rewriting with no inverse",
                      reason:
                        "This exception-table interface accepts boundary changes whose pieces concatenate to the named input. A many-to-one normalization needs retained information for exact reversal. It can be implemented in a separate stage or a tokenizer with an explicit source mapping; its vocabulary effect depends on the data.",
                    },
                    {
                      expression: "a rewriting whose output could have been typed",
                      reason:
                        "undoable only when nothing else produces the same characters. That holds for the eight named characters here and fails for the annotation rules' quotation marks, where two texts that differ come back as one identical answer of seven pieces.",
                    },
                    {
                      expression: "writing that is not prose",
                      reason:
                        "An address is split by the listed punctuation rule. The shown filename is also split at its underscore under Moses, while Treebank keeps it whole. Decide whether the application needs whole spans or components, then test that requirement.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Record the abbreviation table, language setting and rewriting options with the output. Then test coverage, boundary choices and reconstruction separately. Those checks describe what this tokenizer does without treating one successful round trip or one accuracy count as a complete evaluation."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "The motive was to make the surface vocabulary smaller. What did measuring it find?",
              [
                "137 different pieces against 136 on the minutes and 47 against 49 on the notebook, which is a saving of one and a loss of two",
                "A saving of about a fifth on both corpora, which is what the rules were built for",
                "No change at all, since the same characters are kept either way",
                "A saving on the notebook and a loss on the minutes, because the notebook holds more marks",
              ],
              0,
              "The mechanism is real and visible, in the words the crude rule spells more than one way, five of them on the minutes and one on the notebook. What is missing at this size is repetition, so a saving of five rows is paid for by the rows the marks and the contraction halves open. The claim about surface vocabulary is a claim about a large corpus and should not be quoted as though it held at any size.",
            ),
            choice(
              "Why does the argument pay at corpus scale when it does not pay on eighteen sentences?",
              [
                "A larger corpus holds fewer marks per sentence, so the fixed cost falls away",
                "The rows a mark opens are bounded while the rows a mark costs are not, since every common noun eventually appears with a comma after it, with a stop after it, and inside brackets",
                "A larger corpus lets the list of abbreviations grow until no stop is misplaced",
                "At scale the pieces holding no letter and no digit stop being counted separately",
              ],
              1,
              "Repeated punctuation can reuse a small set of vocabulary entries, while separating it can combine several punctuated forms of one word into one base spelling. New compound parts and contraction fragments can also add entries. Whether the total shrinks depends on the corpus and splitting rules; a larger corpus alone does not guarantee a saving.",
            ),
            trueFalse(
              "Can a literal, nonoverlapping partition give a sentence-final abbreviation its period and also return that same source period as a second separate piece?",
              false,
              "A partition assigns each source character to one piece. Duplicating that period into a second piece would change the contract. This does not prevent a separate annotation from recording both its abbreviation and sentence-ending roles. The tokenization policy and the linguistic roles are different questions.",
            ),
            several(
              "Which of these changes to a piece’s text does the method allow itself?",
              [
                "Replacing eight characters a phrase table would otherwise swallow with names",
                "Spelling the hyphen of a cut compound as a marker three characters long",
                "Folding the case, so that The and the share one row",
                "Expanding a contraction into the two words it stands for",
              ],
              [0, 1],
              "The permitted rewrites have inverse conventions, and the spans still refer to the original source. Exact recovery also depends on avoiding collisions with literal escape-like input and preserving discarded spacing. Lowercasing or expanding contractions can merge distinct spellings unless extra information is retained, so those operations need an explicit reconstruction policy.",
            ),
            trueFalse(
              "Two people running these rules over the same sentence can get different pieces without either of them being unfaithful to the method.",
              true,
              "The rules are exact relative to a table of abbreviations, and the table is a document somebody maintains. Every count on the page was taken with one file of 55 entries, and a file with Gov and Sen in it would move the score on the ten stops and the piece counts at the same time. Nothing in the output says which file was loaded, since a word that lost its stop looks the same whether the file was short or the word was not an abbreviation.",
            ),
        ],
        },
        {
          title: "Practice. Running the Rules and Putting the Pieces Back",
          practice: [
            exercise(
              "Cut the sentence about Dr. Alvarez under both rule lists",
              [
  "Split the supplied Dr. Alvarez sentence with MosesPreTokenizer and PennTreebankPreTokenizer. These fixed rules need no training corpus.",
  "For Moses, print each piece beside its zero-based, half-open source span. Then print both piece counts, the number of distinct spellings shared by the two results, and the sorted spellings unique to each rule set.",
  "Use sets for the spelling comparison. This measures shared distinct pieces, rather than aligned occurrences or agreement about their positions."
],
              `from oop_ml import MosesPreTokenizer, PennTreebankPreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."

# Split the sentence with a MosesPreTokenizer and print each piece with
# its start and end. Split it with a PennTreebankPreTokenizer as well, and
# print how many pieces each gave, how many texts the two share, and the
# texts that only one of them produced.`,
              `from oop_ml import MosesPreTokenizer, PennTreebankPreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."

here = MosesPreTokenizer().split(sentence)
for word in here:
    print(f"{word.text:12s} [{word.start}, {word.end})")

there = PennTreebankPreTokenizer().split(sentence)
shared = set(here.texts) & set(there.texts)
print(f"{here.n_words} pieces here, {there.n_words} pieces there, {len(shared)} shared")
print("only here: ", sorted(set(here.texts) - shared))
print("only there:", sorted(set(there.texts) - shared))`,
              `Dr.          [0, 3)
Alvarez      [4, 11)
didn         [12, 16)
't           [16, 18)
expect       [19, 25)
the          [26, 29)
low-cost     [30, 38)
re-analysis  [39, 50)
.            [50, 51)
9 pieces here, 9 pieces there, 7 shared
only here:  ["'t", 'didn']
only there: ['did', "n't"]`,
              {
question: "Where do two English rule sets disagree on the same contraction?",
 hints: [
  "split returns pieces carrying text, start and end, plus a texts tuple for the whole result.",
  "Set intersection gives shared spellings. Set differences show which contraction pieces each rule set chose."
], check: numberCheck("How many pieces do the two rule lists share on the sentence about Dr. Alvarez?", 7, 0.0, "The results share seven distinct spellings. Moses and the Treebank rules divide didn’t at different positions; their different conventions can give equally long results.") },
            ),
            exercise(
              "Give the same abbreviation two different followers",
              [
  "Each supplied pair contains the same abbreviation with different text after it. Split all six texts with the Moses rules and inspect the abbreviation, rather than assuming its spelling determines the result.",
  "Print the split pieces with a kept/split label for the abbreviation’s period. Finish with the total retained periods, keeping the supplied text order.",
  "A retained stop is part of the abbreviation piece; a detached stop is its own piece."
],
              `from oop_ml import MosesPreTokenizer

cases = [
    ("No. 5 shows the drift.", "No."),
    ("No. Nothing shows the drift.", "No."),
    ("The reading was approx. 40 per cent.", "approx."),
    ("The reading was approx. forty per cent.", "approx."),
    ("Alvarez et al. ran the analysis.", "al."),
    ("Alvarez et al. Ran it again.", "al."),
]
rule = MosesPreTokenizer()

# For each case, split the text and print whether the word with its stop
# is among the pieces, followed by the pieces. Then print how many of the
# six stops were kept.`,
              `from oop_ml import MosesPreTokenizer

cases = [
    ("No. 5 shows the drift.", "No."),
    ("No. Nothing shows the drift.", "No."),
    ("The reading was approx. 40 per cent.", "approx."),
    ("The reading was approx. forty per cent.", "approx."),
    ("Alvarez et al. ran the analysis.", "al."),
    ("Alvarez et al. Ran it again.", "al."),
]
rule = MosesPreTokenizer()

kept = 0
for text, word in cases:
    pieces = rule.split(text).texts
    stayed = word in pieces
    kept += stayed
    print(f"{'kept ' if stayed else 'split'}  {'  '.join(pieces)}")
print(f"{kept} of {len(cases)} stops kept")`,
              `kept   No.  5  shows  the  drift  .
split  No  .  Nothing  shows  the  drift  .
split  The  reading  was  approx  .  40  per  cent  .
kept   The  reading  was  approx.  forty  per  cent  .
kept   Alvarez  et  al.  ran  the  analysis  .
split  Alvarez  et  al  .  Ran  it  again  .
3 of 6 stops kept`,
              {
question: "Can the following word change whether an abbreviation keeps its period?",
 hints: [
  "Test whether the full abbreviation spelling occurs in the split’s texts.",
  "Accumulate that Boolean test over the six inputs. Compare the following word or digit within each pair to explain the changed decision."
], check: numberCheck("How many of the six stops do the rules keep?", 3, 0.0, "Three stops remain attached. In these probes, the rules use what follows the abbreviation, so identical abbreviations do not always receive identical cuts.") },
            ),
            exercise(
              "Count what the rules cost over the minutes",
              [
  "The supplied eighteen sentences contain repeated words and hyphenated compounds. Compare whitespace splitting, the default Moses rules and Moses with compound splitting enabled.",
  "For each rule print total piece occurrences and distinct piece spellings over the corpus. The second count is the size a vocabulary would need before reserving any unknown entry.",
  "Use the same sentences for all three rules. A compound can disappear as one entry while introducing several new component entries."
],
              `from oop_ml import Corpus, MosesPreTokenizer, WhitespacePreTokenizer

minutes = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "Mr. Okafor asked whether the sensors had been calibrated in Nov. 2019.",
    "Mrs. Lindqvist replied that Art. 3 of the agreement covers calibration.",
    "The contract was signed by Alvarez Instruments Ltd. and by Okafor Co.",
    "Prof. Nakamura said the drift was 5,300 parts per million, not 1,000.",
    "Gov. Reyes had asked for the same figures in Jan.",
    "Sen. Duarte objected that Fig. 4 was drawn from the wrong column.",
    "The delegation met at St. Andrew's, near Mt. Pleasant.",
    "Ms. Haddad read out the reading, the drift and the residual, etc.",
    '"We cannot sign this," said Mr. Okafor, "until No. 5 is corrected."',
    "The reading of 3.14 was checked against the low-cost sensor vs. the reference one.",
    "J. Alvarez had run the first analysis in 2019.",
    "The re-analysis cost 1,000 euros and took until Dec.",
    "It's the store room readings, not the field ones, that drifted.",
    "The committee's own well-known preference is for a re-analysis.",
    "Inc. and Corp. are written differently in the two translations.",
    "Rev. Santos asked whether approx. 40 per cent was the right share.",
    "The drift was small. It did not go away.",
]
rules = {
    "at spaces": WhitespacePreTokenizer(),
    "these rules": MosesPreTokenizer(),
    "with compounds cut": MosesPreTokenizer(aggressive_hyphen_splitting=True),
}
corpus = Corpus.of(minutes)

# For each rule, count the corpus's words under it, and print the rule's
# name, the total number of pieces and the number of different pieces.`,
              `from oop_ml import Corpus, MosesPreTokenizer, WhitespacePreTokenizer

minutes = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "Mr. Okafor asked whether the sensors had been calibrated in Nov. 2019.",
    "Mrs. Lindqvist replied that Art. 3 of the agreement covers calibration.",
    "The contract was signed by Alvarez Instruments Ltd. and by Okafor Co.",
    "Prof. Nakamura said the drift was 5,300 parts per million, not 1,000.",
    "Gov. Reyes had asked for the same figures in Jan.",
    "Sen. Duarte objected that Fig. 4 was drawn from the wrong column.",
    "The delegation met at St. Andrew's, near Mt. Pleasant.",
    "Ms. Haddad read out the reading, the drift and the residual, etc.",
    '"We cannot sign this," said Mr. Okafor, "until No. 5 is corrected."',
    "The reading of 3.14 was checked against the low-cost sensor vs. the reference one.",
    "J. Alvarez had run the first analysis in 2019.",
    "The re-analysis cost 1,000 euros and took until Dec.",
    "It's the store room readings, not the field ones, that drifted.",
    "The committee's own well-known preference is for a re-analysis.",
    "Inc. and Corp. are written differently in the two translations.",
    "Rev. Santos asked whether approx. 40 per cent was the right share.",
    "The drift was small. It did not go away.",
]
rules = {
    "at spaces": WhitespacePreTokenizer(),
    "these rules": MosesPreTokenizer(),
    "with compounds cut": MosesPreTokenizer(aggressive_hyphen_splitting=True),
}
corpus = Corpus.of(minutes)

for name, rule in rules.items():
    counts = corpus.word_counts(rule)
    print(f"{name:19s} {counts.total} pieces, {counts.n_words} different")`,
              `at spaces           192 pieces, 137 different
these rules         228 pieces, 136 different
with compounds cut  240 pieces, 138 different`,
              {
question: "Does splitting hyphenated words always shrink a vocabulary?",
 hints: [
  "Corpus.of(sentences).word_counts(rule) counts the pieces produced by that rule.",
  "The counts expose total for occurrences and n_words for distinct spellings. They answer different questions."
], check: numberCheck("How many different pieces do the minutes give with every compound cut at its hyphen?", 138, 0.0, "Compound splitting produces 138 distinct pieces on this corpus. The new component spellings outweigh the compound entries removed here; the direction depends on which components already occur elsewhere.") },
            ),
            exercise(
              "Switch the rewriting on and undo it",
              [
  "Enable the Moses rewriting option for the supplied eighteen sentences. Some token spellings will use escape names instead of the original punctuation characters.",
  "Count pieces whose text differs from the source slice named by their span. For each sentence join the pieces without separators, replace escape names through the supplied UNESCAPES mapping, and compare with the source stripped of whitespace.",
  "Print the total rewritten-piece count and the number of recovered sentences. This experiment checks the supplied corpus after whitespace removal; it does not recover the discarded layout or prove invertibility for arbitrary text containing escape-like names."
],
              `import re

from oop_ml import MosesPreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.moses import UNESCAPES

minutes = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "Mr. Okafor asked whether the sensors had been calibrated in Nov. 2019.",
    "Mrs. Lindqvist replied that Art. 3 of the agreement covers calibration.",
    "The contract was signed by Alvarez Instruments Ltd. and by Okafor Co.",
    "Prof. Nakamura said the drift was 5,300 parts per million, not 1,000.",
    "Gov. Reyes had asked for the same figures in Jan.",
    "Sen. Duarte objected that Fig. 4 was drawn from the wrong column.",
    "The delegation met at St. Andrew's, near Mt. Pleasant.",
    "Ms. Haddad read out the reading, the drift and the residual, etc.",
    '"We cannot sign this," said Mr. Okafor, "until No. 5 is corrected."',
    "The reading of 3.14 was checked against the low-cost sensor vs. the reference one.",
    "J. Alvarez had run the first analysis in 2019.",
    "The re-analysis cost 1,000 euros and took until Dec.",
    "It's the store room readings, not the field ones, that drifted.",
    "The committee's own well-known preference is for a re-analysis.",
    "Inc. and Corp. are written differently in the two translations.",
    "Rev. Santos asked whether approx. 40 per cent was the right share.",
    "The drift was small. It did not go away.",
]
rule = MosesPreTokenizer(escape_special_characters=True)
names = re.compile("|".join(re.escape(name) for name in UNESCAPES))

# For each sentence, split it, add to a count the pieces whose text
# differs from the slice of the sentence between start and end, join the
# texts, replace every name with the character UNESCAPES gives for it,
# and add to a second count when that equals the sentence without its
# spacing. Print both counts.`,
              `import re

from oop_ml import MosesPreTokenizer
from oop_ml.core.natural_language_processing.tokenization.word_level.moses import UNESCAPES

minutes = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "Mr. Okafor asked whether the sensors had been calibrated in Nov. 2019.",
    "Mrs. Lindqvist replied that Art. 3 of the agreement covers calibration.",
    "The contract was signed by Alvarez Instruments Ltd. and by Okafor Co.",
    "Prof. Nakamura said the drift was 5,300 parts per million, not 1,000.",
    "Gov. Reyes had asked for the same figures in Jan.",
    "Sen. Duarte objected that Fig. 4 was drawn from the wrong column.",
    "The delegation met at St. Andrew's, near Mt. Pleasant.",
    "Ms. Haddad read out the reading, the drift and the residual, etc.",
    '"We cannot sign this," said Mr. Okafor, "until No. 5 is corrected."',
    "The reading of 3.14 was checked against the low-cost sensor vs. the reference one.",
    "J. Alvarez had run the first analysis in 2019.",
    "The re-analysis cost 1,000 euros and took until Dec.",
    "It's the store room readings, not the field ones, that drifted.",
    "The committee's own well-known preference is for a re-analysis.",
    "Inc. and Corp. are written differently in the two translations.",
    "Rev. Santos asked whether approx. 40 per cent was the right share.",
    "The drift was small. It did not go away.",
]
rule = MosesPreTokenizer(escape_special_characters=True)
names = re.compile("|".join(re.escape(name) for name in UNESCAPES))

rewritten = 0
recovered = 0
for sentence in minutes:
    words = rule.split(sentence)
    rewritten += sum(word.text != sentence[word.start:word.end] for word in words)
    undone = names.sub(lambda found: UNESCAPES[found.group(0)], "".join(words.texts))
    recovered += undone == "".join(sentence.split())

print(f"pieces rewritten: {rewritten}")
print(f"sentences recovered: {recovered} of {len(minutes)}")`,
              `pieces rewritten: 8
sentences recovered: 18 of 18`,
              {
question: "Can the escaped token spellings recover the original non-whitespace text?",
 hints: [
  "piece.text differs from sentence[piece.start:piece.end] when the rule rewrote its spelling.",
  "The supplied pattern locates escape names. Its replacement callback can look up match.group(0) in UNESCAPES.",
  "Compare with \"\".join(sentence.split()), since whitespace is intentionally absent from this reconstruction."
], check: numberCheck("How many pieces of the eighteen sentences does the switch rewrite?", 8, 0.0, "Eight pieces are rewritten and all eighteen supplied sentences recover after whitespace removal. This establishes the round trip for these inputs and this reconstruction procedure, rather than for every possible source string.") },
            ),
          ],
        },
      ]}
    />
  );
}
