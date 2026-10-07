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

export const metadata: Metadata = {
  title: "Moses Rules · oop_ml",
  description:
    "Combine punctuation rules with language-specific exceptions for translation-oriented tokenisation.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MosesRulesPage() {
  return (
    <ConceptPage
      lessonId="moses-rules"
      intuition={lessonIntuitions["moses-rules"]}
      technicalStart="Part 2. The Full Stop, and the List It Cannot Do Without"
      openingTitle="A Full Stop Does Not Always End a Sentence"
      playgroundIntro="Compare a sentence-ending period, an abbreviation, and a decimal. Inspect which rule applies and where an exception list changes the cut."
      title="Moses Rules"
      tagline="Combine punctuation rules with language-specific exceptions for translation-oriented tokenisation."
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
                  The three rules on the pages before this one were each
                  answering a question and none of them was asked what happened
                  next. Splitting on spaces asks where the gaps are, the
                  boundary rules ask which pairs of characters a word may break
                  between, and the annotation rules ask which units a person
                  marking up grammar needs a row for. Every one of those ends
                  when the pieces come out.
                </p>
                <p>
                  These rules were written by somebody with the pieces coming
                  out of one end of a system and going back in at the other. A
                  translation system was trained on pieces, decoded into pieces,
                  and then had to hand a reader a sentence, so whatever was done
                  on the way in had to be undoable on the way out. We carry the
                  same sentence the other pages carry, because it breaks in the
                  three places that matter here.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  Read it as somebody building a phrase table. The stop after{" "}
                  <span className="font-mono">Dr</span> has to stay, because{" "}
                  <span className="font-mono">Dr.</span> and{" "}
                  <span className="font-mono">Dr</span> would otherwise be two
                  rows for one title. The stop at the end has to come off, for
                  the same reason from the other side, since{" "}
                  <span className="font-mono">re-analysis.</span> and{" "}
                  <span className="font-mono">re-analysis</span> are one word
                  written twice. And the apostrophe in{" "}
                  <span className="font-mono">didn&rsquo;t</span> hides a
                  negation that the target language will spell as a word of its
                  own, so it has to be visible to whatever aligns the two sides.
                </p>
                <KeepInMind>
                  The question here is which runs of characters the counting
                  will have rows for, and the answer is under a constraint the
                  other three rules never met, that a reader has to be handed
                  the text back at the end. Every clause below is one or the
                  other of those two things.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The running sentence, cut, with every span">
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
                  Read the spans down the right-hand side and they run
                  continuously through the sentence, skipping only the six
                  spaces. Every piece is the slice of the sentence its two
                  numbers name, character for character, and unlike the previous
                  page that remains true in every part of this one.
                </p>
                <KeepInMind>
                  Nine pieces from a sentence of 51 characters, with 45 of those
                  characters inside a piece and the remaining six being the
                  spaces. Nothing was dropped and nothing was rewritten.
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
                  The cut in front of the n is a claim about English, that the
                  negation is a morpheme spelt{" "}
                  <span className="font-mono">n&rsquo;t</span>. The cut at the
                  apostrophe is a claim about nothing at all; it is one rule
                  applied wherever an apostrophe stands between two letters,
                  with no list and no exception. Both give back the sentence when
                  the pieces are joined, so reversibility does not choose between
                  them. What chose was that the second needs nothing known about
                  English to state, and the same script had to run over eleven
                  languages of proceedings while the first would have needed a
                  linguist for each of them.
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
                  It is worth being exact about how little there is here. The
                  whole method is one pass over each run of characters that has
                  no spacing in it, followed by a second pass that settles the
                  final stop, and the questions asked are these.
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
                  One list, of abbreviations, consulted by one clause.
                  Everything else is a character read in place with at most one
                  character of context, so the whole method is a single pass and
                  there is nothing in it to load.
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
                  The annotation rules settle this with a fact about their
                  pipeline rather than about English. They ran on one sentence
                  at a time, so the last stop in the text is the
                  sentence&rsquo;s and every other stop belongs to whatever it
                  is touching. That is exact when the text really is one
                  sentence and it is not a claim about words at all.
                </p>
                <p>
                  These rules could not use it. Proceedings arrive as paragraphs,
                  the sentence boundaries were another problem entirely, and the
                  same script had to run over eleven languages of them. So the
                  clause here asks about the word instead, and asking about the
                  word is where a list becomes unavoidable, because{" "}
                  <span className="font-mono">Dr.</span> and{" "}
                  <span className="font-mono">away.</span> are the same shape.
                  Nothing in the characters separates a title from an ordinary
                  word with a stop after it.
                </p>
                <KeepInMind>
                  Where the annotation rules answer from the position of the
                  stop in the text, these answer from the identity of the word in
                  front of it, and that is the choice which forces a list. The
                  two answers disagree far more often than the running sentence
                  suggests.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Four clauses, and only one of them is a list">
                <p>
                  A word ending in exactly one stop keeps that stop when any of
                  four things is true, and the list is only the second of them.
                  Read them as four separate attempts to recognise an
                  abbreviation, of which three cost nothing to state.
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
                  The first clause catches every initialism at once and needs no
                  vocabulary, since a word with an interior stop and a letter in
                  it is not an ordinary English word. The fourth is the
                  interesting one, and it is a piece of reasoning about writing
                  rather than about language, that an English sentence begins
                  with a capital, so a lowercase word after a stop means the stop
                  did not end a sentence. It costs one character of lookahead and
                  it rescues abbreviations that nobody ever listed.
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
                  Three of the four clauses read characters and one reads a
                  list, and which of them carries the weight is a question about
                  a corpus rather than about the rules. Section 10 answers it on
                  eighteen sentences and the answer is not the one this section
                  suggests.
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
                  The middle number is the one to be careful with. The
                  annotation rules answered <span className="italic">kept</span>{" "}
                  on all ten, because none of the ten stops is the last character
                  of its text and their clause keeps every stop that is not. So
                  their eight is exactly the number of cases whose answer happens
                  to be <span className="italic">kept</span>, reached without
                  distinguishing anything, and a set of ten with the proportions
                  reversed would have given them two. These rules answered{" "}
                  <span className="italic">kept</span> five times and{" "}
                  <span className="italic">split</span> five times, so their
                  seven is a score a differently balanced set would not move
                  nearly so far.
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
                  caption="A rule with no discrimination at all scores the number in the third row. Only the first column comes from a rule that answered both ways."
                />
                <KeepInMind>
                  A score on a set of cases is worth only as much as the balance
                  of the set, and the honest reading here is that these rules
                  distinguish and the annotation rules do not, rather than that
                  the annotation rules are ahead by one.
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
                    The obvious repair is more entries, and it helps, in the
                    sense that any particular missing word can be added. What it
                    cannot do is change the shape of the answer. A word the
                    clauses examined and left whole and a word no clause covers
                    come back looking the same, so a caller receives{" "}
                    <span className="font-mono">Gov</span> and a stop with
                    nothing anywhere reporting that a list was consulted and
                    found nothing. Adding{" "}
                    <span className="font-mono">Gov</span> leaves{" "}
                    <span className="font-mono">Sen</span>, and adding that
                    leaves the next one, and the writing gives no signal that
                    would let a rule notice it has met one.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The rules never refuse and never report, so a text they were
                  not written for comes back looking exactly like a text they
                  were. Only reading the pieces says which happened.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Fifty-five entries, and how many a corpus reaches">
                <p>
                  A list that carries a method and a list nobody hits are
                  different objects, so it is worth counting. The English list
                  here holds 55 entries, of which 27 are named words, 26 are the
                  single capitals that catch an initial in a name, and 2 keep
                  their stop only when a figure follows.
                </p>
                <p>
                  Counting over the six-sentence notebook would say nothing,
                  since it holds one abbreviation, so the corpus below is
                  eighteen sentences of minuted proceedings written for this
                  page, with titles, months, article numbers and company
                  suffixes in them. It is the register the rules were made for
                  and it is deliberately generous to them.
                </p>
                <PrefixListPanel />
                <p>
                  The question the list answers was asked 39 times over those
                  eighteen sentences, which is how many runs of characters ended
                  in exactly one stop, and 19 entries answered it. The other 36
                  were never consulted at all, so a third of the list is doing
                  every piece of the work it does here and the remaining
                  two-thirds is there for writing this corpus does not contain.
                  Five real abbreviations turn up that no entry covers, which is
                  five more than the unused entries would suggest.
                </p>
                <p>
                  The table in the middle of the panel is the finding I did not
                  expect, and it corrects what section 6 implies. Twenty stops
                  were kept over these eighteen sentences, 18 of them by the
                  named list and 2 by the figures list, and the two clauses that
                  read characters kept none at all. The interior-stop clause
                  needs a word like{" "}
                  <span className="font-mono">U.S.</span>, which these sentences
                  happen not to contain, and the lowercase clause needs an
                  abbreviation followed by an ordinary lowercase word, which in
                  eighteen separate sentences almost never happens because the
                  abbreviations here are titles and the next word is a surname.
                </p>
                <KeepInMind>
                  19 of 55 entries reached, over eighteen sentences chosen to
                  suit them, with five abbreviations outside the list in the same
                  eighteen, and every stop that was kept was kept by a list. The
                  cheap clauses are cheap and on this corpus they did nothing,
                  which is why the last part treats the list as the whole of the
                  method rather than as a supplement to it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Both rule lists give nine pieces on the running sentence and part on the contraction, one cutting in front of the n and the other at the apostrophe. What decided it here?",
              [
                "Only the cut at the apostrophe lets the pieces be joined back into the sentence",
                "The cut at the apostrophe needs nothing known about English, and the same script had to run over eleven languages",
                "The cut in front of the n opens a second row for a word the corpus already holds",
                "The apostrophe is the only mark the rules are allowed to cut at",
              ],
              1,
              "Both cuts give back the sentence when the pieces are joined, so reversibility does not choose between them. The cut in front of the n is a claim about English, that the negation is a morpheme, and would have needed a linguist per language. The cut at the apostrophe is one rule applied wherever an apostrophe stands between two letters, with no list and no exception.",
            ),
            trueFalse(
              "On the ten scored stops the annotation rules place eight where they belong against these rules’ seven, and a set of ten with the proportions reversed would have given the annotation rules two.",
              true,
              "The annotation rules answered kept on all ten, because none of the ten stops is the last character of its text. Their eight is exactly the number of cases whose answer happens to be kept, reached without distinguishing anything. These rules answered kept five times and split five times, so their seven is a score a differently balanced set would not move nearly so far, and the honest reading is that one rule distinguishes and the other does not.",
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
              "The rules never refuse and never report. Gov is a title and is not on the list, and the word after it is a capitalised surname, so no clause saves it and Gov comes back beside every other truncated word with the stop it lost beside every sentence-final stop. Adding Gov leaves Sen, and adding that leaves the next one.",
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
                <p>
                  The reason it is not a longer rule is that the exceptions are
                  not describable as characters. A rule that ends a word before{" "}
                  <span className="font-mono">n&rsquo;t</span> produces{" "}
                  <span className="font-mono">ca</span> from{" "}
                  <span className="font-mono">can&rsquo;t</span>, which is
                  wanted, and would produce{" "}
                  <span className="font-mono">wo</span> from{" "}
                  <span className="font-mono">won&rsquo;t</span> and{" "}
                  <span className="font-mono">sha</span> from{" "}
                  <span className="font-mono">shan&rsquo;t</span>, and any
                  attempt to fix one of those inside the pattern breaks the
                  others. As a table it is one line each, checked before the
                  pattern runs, and the pattern is untouched.
                </p>
                <p>
                  The same argument runs the other way for an abbreviation.{" "}
                  <span className="font-mono">Mr.</span> is a capital, two
                  lowercase letters and a stop, which is precisely the shape of{" "}
                  <span className="font-mono">Ran.</span>, so no reading of the
                  characters keeps one and cuts the other. A named list is what
                  is left over when the writing genuinely does not carry the
                  distinction, and reaching for one is a report that the
                  characters have been examined and found silent rather than a
                  shortcut past a rule somebody could have written.
                </p>
                <KeepInMind>
                  A table is the right shape exactly when the exception is a fact
                  about a particular word rather than about a pattern of
                  characters, and both halves of this page&rsquo;s stop clause
                  are that.{" "}
                  <Link href="/concepts/maximum-matching" className={link}>
                    Maximum matching
                  </Link>{" "}
                  and{" "}
                  <Link href="/concepts/the-word-lattice" className={link}>
                    the word lattice
                  </Link>{" "}
                  are this shape carried to its limit, where the table has grown
                  until it is the whole method and no rule is left underneath it.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The clause with no list at all">
                <p>
                  Set beside that, the apostrophe clause here is the interesting
                  case, because it is the place where these rules have no list
                  and the annotation rules do. Cutting at the apostrophe is one
                  statement, applied to every apostrophe standing between two
                  letters, and it covers{" "}
                  <span className="font-mono">didn&rsquo;t</span>,{" "}
                  <span className="font-mono">it&rsquo;s</span>,{" "}
                  <span className="font-mono">they&rsquo;re</span> and{" "}
                  <span className="font-mono">y&rsquo;all</span> alike.
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
                  Nothing there is listed and nothing is examined and left alone.
                  The price is that the halves are not morphemes, so{" "}
                  <span className="font-mono">didn</span> is not a word and the
                  negation is spelt <span className="font-mono">&rsquo;t</span>{" "}
                  here where a linguist writes{" "}
                  <span className="font-mono">n&rsquo;t</span>. The gain is that
                  the same clause was written once and turned round for French
                  and Italian by moving the cut to the other side of the mark,
                  which is a setting rather than a second table.
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
                  These rules read a list for the full stop and no list at all
                  for the apostrophe, and the annotation rules do the reverse on
                  both counts, which is the neatest summary of what separates
                  them. Which way round to go is decided by whether the
                  exception is a fact about one word or about a mark that behaves
                  the same wherever it stands.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. An entry says where a word is cut, never what it becomes">
                <p>
                  A table of this shape is under one constraint that is easy to
                  miss and is the reason the shape survives here at all. The
                  pieces an entry lists must join back to exactly the word the
                  entry names.
                </p>
                <ExceptionEntryTable />
                <p>
                  Without that constraint the obvious entries are tempting.{" "}
                  <span className="font-mono">can&rsquo;t</span> would go to{" "}
                  <span className="font-mono">can</span> and{" "}
                  <span className="font-mono">not</span>, which reads better than{" "}
                  <span className="font-mono">ca</span> and{" "}
                  <span className="font-mono">n&rsquo;t</span> and gives the
                  aligner two real words. What it costs is that a piece stops
                  being a stretch of the source, so the sentence can no longer be
                  reassembled from the pieces and their positions, and it costs
                  it for whichever words happen to be listed rather than
                  uniformly, which is worse than costing it everywhere.
                </p>
                <p>
                  Normalising a word to a different word is a real job and it is
                  done elsewhere in a pipeline, before or after this step, where
                  it can be recorded. The one place these rules do change a
                  piece&rsquo;s text is the subject of the next part, and they do
                  it in a way that can be read backwards.
                </p>
                <KeepInMind>
                  Three of the six proposals were refused, and the three refusals
                  are the same refusal, that an entry may say where a cut goes
                  and may not say what the pieces are to be spelt as. That single
                  constraint is what makes the pieces of a listed word no
                  different in kind from the pieces of an unlisted one.
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
                <p>
                  That is the honest description of the method rather than a
                  complaint about it. The original shipped one file per language
                  and the files were contributed by whoever needed that language,
                  so a language is supported exactly when somebody has sat down
                  and listed its abbreviations. On this page every measurement is
                  English, and the French and Italian settings in the playground
                  change only where the apostrophe cut falls.
                </p>
                <WorkedExample title="The running sentence under the French setting">
                  <Equation>
                    {"English setting   Dr.  Alvarez  didn  't  expect  the  low-cost  re-analysis  .\n" +
                      "French setting    Dr.  Alvarez  didn'  t  expect  the  low-cost  re-analysis  ."}
                  </Equation>
                  <p>
                    One piece boundary moved, from in front of the apostrophe to
                    behind it, and nothing else changed. The title kept its stop
                    under the French setting for the same reason it kept it
                    under the English one, which is that the list consulted is
                    still the English list. A French text gets no help from the
                    setting with its own abbreviations, and an English title
                    inside it would be recognised.
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
                  Here is the constraint stated plainly. A parser reading a
                  treebank never has to produce the original paragraph, so the
                  annotation rules were free to write things into a piece that
                  were not in the writing. A translation system produces a
                  sentence for somebody to read, so whatever it does on the way
                  in has to be undone on the way out.
                </p>
                <p>
                  The test is simple and it is worth stating before the numbers.
                  Take the pieces, throw away the spans, join them in order with
                  nothing between them, and ask whether what comes out is
                  everything in the source that is not spacing.
                </p>
                <RoundTripPanel />
                <p>
                  On the quoted sentence both rule lists give fourteen pieces and
                  they part completely on that test. These rules rewrite nothing
                  and the joined pieces are the sentence. The annotation rules
                  rewrite two pieces, an opening quotation mark into two
                  backquotes and a closing one into two apostrophes, and the
                  joined pieces are not the sentence and cannot be made into it.
                  Over the eighteen minuted sentences the same test passes
                  eighteen times here and seventeen times there.
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
                  The sharpest way to see why that rewriting cannot be undone is
                  to write a text in the spelling it produces. Take a sentence
                  with quotation marks in it and a second sentence typed with two
                  backquotes and two apostrophes, which is how a typist of the
                  period produced directional quotes on a machine that had none.
                </p>
                <Equation>
                  {'she said "wait" and left\n' +
                    "she said ``wait'' and left"}
                </Equation>
                <p>
                  Under the annotation rules those two come back as the identical
                  seven pieces. Nothing in the output distinguishes a sentence
                  whose quotation marks were rewritten from a sentence that was
                  typed that way, so anything wanting the original has to keep
                  the original, and the pieces alone are not a division of a text
                  any more. Under these rules the first gives seven pieces and
                  the second gives nine, because a backquote is not a quotation
                  mark and each stands alone, and the two texts are told apart.
                </p>
                <KeepInMind>
                  A rewriting can be undone only when nothing else produces the
                  same characters, and the annotation rules&rsquo; quotation
                  marks fail that against a spelling their own corpus was full
                  of, since the whole point of choosing two backquotes was that
                  a typist of the period wrote them.
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
                  Read the mapping in the other direction and every arrow still
                  points at exactly one thing, which is the whole difference from
                  the quotation-mark rewriting of the previous section. Nothing
                  else produces{" "}
                  <span className="font-mono">&amp;quot;</span>, so the script
                  that puts the text back together knows what it was reading.
                  With the switch
                  on, our quoted sentence has three pieces whose text is no
                  longer the writing, the two quotation marks and the apostrophe
                  in the contraction, and putting the mapping back recovers the
                  sentence exactly.
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
                <WorkedExample title="The running sentence with every compound cut">
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
                  Both rewritings change a piece&rsquo;s text and neither changes
                  the span it names, so a piece carries where it came from even
                  when it no longer looks like it. That is what lets a rewriting
                  be undone by a table rather than guessed at.
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
                  So the promise is narrower and more useful than it sounds. The
                  pieces plus their spans plus the source recover everything
                  exactly, and the pieces alone recover every character in order
                  with the spacing to be decided. What the annotation rules give
                  up is the second of those, and it is the one a system with no
                  access to the source has.
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
              "A rule that ends a word before n’t has its awkward cases held in a table that is checked before the pattern runs. Why can they not be written into a longer pattern?",
              [
                "A table is faster than a pattern when the same clause runs over eleven languages",
                "The exceptions are not describable as characters, since a rule cutting before n’t gives wo from won’t and sha from shan’t",
                "A pattern cannot read an apostrophe standing between two letters",
                "The table also records what each half should be spelt as, which a pattern cannot do",
              ],
              1,
              "Any attempt to fix one of those inside the pattern breaks the others, and as a table it is one line each, checked before the pattern runs, with the pattern untouched. A table is the right shape exactly when the exception is a fact about a particular word rather than about a pattern of characters. Reaching for one is a report that the characters have been examined and found silent.",
            ),
            trueFalse(
              "An entry in a table of this shape may say where a word is cut and may not say what the pieces are spelt as, so can’t cannot be listed as can and not.",
              true,
              "Three of the six proposals were refused and the three refusals are the same refusal. The pieces an entry lists must join back to exactly the word it names, and can and not join to cannot. Without that a piece stops being a stretch of the source, so the sentence can no longer be reassembled, and it stops being one for whichever words happen to be listed rather than uniformly.",
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
              "A rewriting can be undone only when nothing else produces the same characters, and the whole point of choosing two backquotes was that a typist of the period wrote them. A sentence with plain quotation marks and the same sentence typed with backquotes and apostrophes come back as the identical seven pieces under the annotation rules. Under these rules the plain one gives seven pieces and the typed one nine, because a backquote is not a quotation mark and each stands alone.",
            ),
            trueFalse(
              "Joining the pieces with one space between each pair gives back all eighteen minuted sentences.",
              false,
              "It gives back two of the eighteen, the ones that happen to end in an abbreviation so that every piece was already separated by a space in the writing. The other sixteen have a comma or a final stop standing alone, and a space in front of a comma is not English. The pieces plus their spans plus the source recover everything exactly, and the pieces alone recover every character in order with the spacing still to be decided.",
            ),
            choice(
              "Under the French setting the contraction of the running sentence is cut behind its apostrophe instead of in front of it. What else in the sentence comes out differently?",
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
                  The bill is length. Anything reading the text afterwards pays
                  per piece, and a model that compares every position with every
                  other position pays roughly with the square of the count, so a
                  rule that separates marks is spending on every pass over the
                  corpus for the rest of the pipeline&rsquo;s life.
                </p>
                <MosesCostPanel />
                <p>
                  On the eighteen minuted sentences these rules give 228 pieces
                  where splitting on spaces gives 192, which is 18.75 per cent
                  more from identical writing, and the written-out table gives
                  243 because it also cuts every compound at its hyphen.
                </p>
                <Equation>
                  {"228 − 192   =  36 more pieces\n" +
                    "36 / 192    =  18.75 per cent"}
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
                  228 against 192 on the same eighteen sentences, and 32 of the
                  228 hold no letter and no digit anywhere in them. Whatever
                  reads the corpus next pays that difference on every pass, and
                  the next two sections ask what it bought.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The vocabulary the rules were meant to shrink">
                <p>
                  The motive was to make the surface vocabulary smaller, so it is
                  fair to ask whether it did, and the measurement here is the one
                  that surprised me. Over the eighteen minuted sentences,
                  splitting on spaces produces 137 different pieces and these
                  rules produce 136. Over the six-sentence notebook, splitting on
                  spaces produces 47 and these rules produce 49, so at that size
                  the method makes the vocabulary larger.
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
                    The 24 runs in the first row change their spelling and
                    nothing else, since each gives up a row and the word inside
                    it takes one. The saving is the next two rows, seven
                    entries that go without a new word arriving, and against
                    it stand six new rows that hold no word, three marks and
                    three pieces of a contraction. Seven against six is the
                    saving of one. On the notebook the same accounting gives
                    two entries saved and four opened, which is the loss of
                    two.
                  </p>
                </WorkedExample>
                <InAModel>
                  <>
<p>
                    The argument only pays at corpus scale, and the reason is arithmetic rather than linguistics. The rows a mark opens are bounded, since there are a few dozen marks and each of them is one row however often it turns up. The rows a mark costs are not bounded, because every common noun in the language eventually appears with a comma after it, with a stop after it, and inside a pair of brackets.
                  </p>
                  <p>
                    Of the 137 entries these eighteen sentences give the crude rule, only 5 are a word that reached a second spelling, so the fixed cost of separating the marks is still the larger of the two here. The corpus of proceedings these rules were written for holds millions of sentences, and the fixed cost does not grow with any of them.
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
                      "neither, the stop does both jobs",
                    ],
                    [
                      "in Jan.",
                      "Jan.",
                      "Jan and a stop",
                      "neither, the stop does both jobs",
                    ],
                    [
                      "residual, etc.",
                      "etc.",
                      "etc and a stop",
                      "neither, the stop does both jobs",
                    ],
                    [
                      "until Dec.",
                      "Dec.",
                      "Dec and a stop",
                      "neither, the stop does both jobs",
                    ],
                  ]}
                  caption="The ten disagreements that are a full stop. The first five are abbreviations outside the list, the sixth is the positional rule meeting two sentences in one text, and the last four are that rule reaching the end of a text."
                />
                <p>
                  Five of the ten go to the annotation rules and one goes to
                  these, and four have no right answer at all and are the subject
                  of the next part. That is a real defeat on a real corpus, and it
                  comes about because the minutes are eighteen separate
                  sentences, which is exactly the arrangement the positional rule
                  was designed for. Run the same rules over the paragraph those
                  eighteen sentences would form and the positional rule loses
                  every internal stop at once, which the previous page measures.
                </p>
                <KeepInMind>
                  Where a text really is one sentence, a rule about position
                  beats a rule about vocabulary and needs no list to do it. These
                  rules were written for a pipeline where that could not be
                  assumed, and they pay for the assumption they refused to make.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Where the cruder rule wins, and where the annotation rules do">
                <p>
                  Pointed at writing that is not prose, these rules come apart in
                  the way every rule on these pages does, by separating a
                  character that really is punctuation in a sentence and really is
                  not one here. A company name written with an ampersand becomes
                  three pieces, a percentage becomes two, and an address is cut at
                  the character that makes it an address.
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
                  caption="The crudest rule is right on all four, since none of these separated characters is punctuation. The last row is the only one where the two rule lists differ, and these rules are the ones that come apart."
                />
                <p>
                  The last row is worth dwelling on, because the reason for it is
                  arbitrary rather than principled. A hyphen is one of the
                  characters these rules leave inside a word, so{" "}
                  <span className="font-mono">low-cost</span> survives, and an
                  underscore is not on that list, so the file name is cut in two
                  at a character doing exactly the same job. Nothing about
                  writing decides that. It is which characters somebody thought
                  of when the clause was written, and the annotation rules happen
                  to have thought of neither and so keep the whole thing.
                </p>
                <KeepInMind>
                  Anything reading text with identifiers, addresses or code in it
                  should protect those stretches before any of these rules see
                  them, because none of the four reports having met one. On the
                  file name here the method this page is about is the worst of
                  the three.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="23. The correctness is a property of a data file">
                <p>
                  Everything on this page has been a rule except one clause, and
                  that clause decides whether{" "}
                  <span className="font-mono">Dr.</span> is one piece or two.
                  Take the list away and the clause has no content, because the
                  three clauses beside it cannot recognise an abbreviation that
                  has no interior stop and is followed by a capital, and that
                  covers most titles at the head of a sentence.
                </p>
                <>
<p>
                  So the method is a rule and a table, and what the method does to a text is not determined until somebody has written the table down. That has three consequences worth separating. The answer for a given text depends on which file was loaded, so two callers running the same rules on the same sentence can get different pieces without either being unfaithful.
                </p>
                <p>
                  The table is per language, so a language nobody has written a file for is not badly handled, it is outside what the method says. And a table is finite while the abbreviations of a language are open, so there is always a next word, and no amount of adding entries changes that.
                </p>
</>
                <p>
                  The practical consequence is about reporting rather than about
                  quality. Two numbers measured on the same corpus by two people
                  who loaded different files are not comparable, and nothing in
                  the output says so, since a word that lost its stop looks the
                  same whether the file was short or the word was genuinely not
                  an abbreviation. Every count on this page was taken with one
                  file of 55 entries in front of the rules, and a file with{" "}
                  <span className="font-mono">Gov</span> and{" "}
                  <span className="font-mono">Sen</span> in it would move the
                  score in section 8 and the piece counts in section 19 at the
                  same time.
                </p>
                <KeepInMind>
                  The rules are exact relative to a table, and the table is a
                  document somebody maintains. Reporting what a method does to a
                  text therefore means reporting which table was in front of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. An abbreviation ending a sentence has no answer">
                <p>
                  There is one case where no list helps and no rule helps, and it
                  is worth stating as a fact about English writing rather than as
                  a shortcoming of anything. A sentence that ends in an
                  abbreviation is written with one full stop, and that stop is
                  closing the abbreviation and closing the sentence at the same
                  time.
                </p>
                <Equation>
                  {"The re-analysis was signed by Okafor Co.\n\n" +
                    "        Co.  is what the abbreviation needs\n" +
                    "        .    is what the sentence needs\n" +
                    "        Co.  and  .   would invent a character"}
                </Equation>
                <p>
                  A division of a text into pieces gives every character to
                  exactly one piece, so the two requirements cannot both be met.
                  Knowing that <span className="font-mono">Co.</span> is an
                  abbreviation does not help, because the question is not what
                  the word is, and the position of the stop does not help,
                  because both readings put it there. These rules answer{" "}
                  <span className="font-mono">Co.</span> and lose the
                  sentence&rsquo;s stop; the annotation rules answer{" "}
                  <span className="font-mono">Co</span> and a stop and lose the
                  abbreviation&rsquo;s. Neither is wrong, and a third method
                  would have to be wrong in one of those two ways as well.
                </p>
                <p>
                  What is genuinely open here is which of the two losses a
                  pipeline would rather have, and that is decided by what reads
                  the pieces. A model counting sentences wants the stop; a table
                  keyed on surface forms wants the abbreviation whole, since the
                  alternative puts a truncated title in a row of its own. Four of
                  the eighteen minuted sentences end this way, which is often
                  enough that the choice has to be made rather than deferred.
                </p>
                <KeepInMind>
                  The writing carries one character where the reading carries two
                  marks, so no method that partitions a text can be right here.
                  The decision to be made is which of the two things to lose, and
                  the two rule lists on these pages happen to have made opposite
                  ones.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Reversibility is a constraint on what a rule may do">
                <p>
                  The other place the method stops is not a case at all, it is a
                  boundary around the whole method. Requiring that the pieces
                  join back to the writing rules out a large class of things a
                  translation pipeline actually wanted, and those things do not
                  become impossible, they become somebody else&rsquo;s step.
                </p>
                <p>
                  Lowercasing is the plainest example. A phrase table with{" "}
                  <span className="font-mono">The</span> and{" "}
                  <span className="font-mono">the</span> as separate rows is
                  wasting evidence in exactly the way this method exists to
                  prevent, and folding the case is a rewriting that cannot be
                  read backwards, since{" "}
                  <span className="font-mono">the</span> does not say whether it
                  began a sentence. Expanding a contraction, normalising a
                  spelling, mapping a number to a placeholder and stripping an
                  accent are the same shape.
                </p>
                <p>
                  So a method under this constraint splits a pipeline in two. One
                  half is a division of the writing, which is what these rules
                  are, and the other half is a sequence of changes that a caller
                  must record if it wants them back. The two changes this method
                  does allow itself are exactly the two that arrive with an
                  inverse written down beside them, a table of eight characters
                  and one marker standing for a hyphen, and what admitted them
                  was that the mapping can be read in either direction rather
                  than that they were useful.
                </p>
                <KeepInMind>
                  Anything a translation pipeline wants that cannot be undone has
                  to happen in a step that is not this one, and the boundary is
                  drawn by whether an inverse exists rather than by whether the
                  change is a good idea.
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
                      expression: "an abbreviation ending a sentence",
                      reason:
                        "undecidable, with or without a list, because one character closes both the abbreviation and the sentence and a division of the text gives every character to exactly one piece. What must be decided is which loss to take, and the two rule lists on these pages take opposite ones. Four of the eighteen sentences here end this way.",
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
                        "refused rather than performed. Lowercasing, expanding a contraction and normalising a spelling all shrink the surface vocabulary, which is the method's own aim, and none can be read backwards, so each has to be a separate step that records what it did.",
                    },
                    {
                      expression: "a rewriting whose output could have been typed",
                      reason:
                        "undoable only when nothing else produces the same characters. That holds for the eight named characters here and fails for the annotation rules' quotation marks, where two texts that differ come back as one identical answer of seven pieces.",
                    },
                    {
                      expression: "writing that is not prose",
                      reason:
                        "outside what the rules were written for. An address is cut at the character that makes it an address, while a file name that the boundary rules cut into three survives whole here. What has to be decided is whether such stretches are protected before any rule sees them, since none of the four will say it met one.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying past this page. A method built
                  on a named list has its correctness located in a document
                  rather than in the rules, so the honest way to describe it
                  names the document. And requiring an inverse is a real
                  restriction with real casualties, which is why the methods
                  later in this section are described by whether they are
                  reversible before they are described by anything else.
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
              "There are a few dozen marks and each of them is one row however often it turns up, so the cost of separating them does not grow. Of the 137 entries the eighteen sentences give the crude rule, only 5 are a word that reached a second spelling, so at this size the fixed cost is still the larger of the two.",
            ),
            trueFalse(
              "A sentence ending in an abbreviation can be divided so that the abbreviation keeps its stop and the sentence keeps its stop as well.",
              false,
              "The writing carries one character where the reading carries two marks, and a division of a text gives every character to exactly one piece, so no method that partitions a text can be right here. These rules answer Co. and lose the sentence’s stop, while the annotation rules answer Co and a stop and lose the abbreviation’s. Four of the eighteen minuted sentences end this way, so the choice has to be made rather than deferred.",
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
              "Both allowed rewritings arrive with an inverse written down beside them, and both leave the span the piece names untouched, so a piece carries where it came from even when it no longer looks like it. Lowercasing cannot be read backwards, since the does not say whether it began a sentence, and expanding a contraction is the same shape. Anything a pipeline wants that cannot be undone has to happen in a step that is not this one.",
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
              "Cut the running sentence under both rule lists",
              ["Put the running sentence to the library’s Moses rules and print each piece beside the half-open span it came from. Then put the same sentence to the Penn Treebank rules, which are the annotation rules of this page, and count the pieces the two answers have in common.", "Part 1 arrived at nine pieces under each and seven shared, with the two that differ being the halves of the contraction. Print the pieces only one of the two rule lists produced, so that the disagreement can be read off."],
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
              { hints: ["Both rules are constructed with nothing, since the defaults are the English setting with both switches off, and the text goes to split.", "split answers a collection that can be iterated for words carrying text, start and end, and that knows n_words and the texts alone.", "Turning each answer’s texts into a set makes the shared pieces an intersection and the pieces only one side produced a difference."], check: numberCheck("How many pieces do the two rule lists share on the running sentence?", 7, 0.0, "Both give nine pieces and seven are the same. These rules cut the contraction at the apostrophe, into didn and a piece beginning with the mark, and the annotation rules cut it in front of the negation, into did and a piece beginning with n. The first needs nothing known about English to state, which is what decided it for a script that had to run over eleven languages.") },
            ),
            exercise(
              "Give the same abbreviation two different followers",
              ["Section 7 gave the rules the same abbreviation twice with different writing after it. Put the three pairs below to the Moses rules, and for each text print the pieces and whether the word in question came back with its stop still attached.", "Each pair should split, one kept and one cut, and in every pair the abbreviation itself is identical in both texts. Count how many of the six stops were kept, and notice which clause of section 6 is responsible for each of the six answers."],
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
              { hints: ["The texts of a split are a tuple of strings, so whether the abbreviation kept its stop is whether the word with the stop on it is in that tuple.", "A stop that came off shows up as the bare word followed by a piece that is a full stop and nothing else.", "A true answer counts as one when it is added to a number, so the tally of kept stops can be a running sum of the test."], check: numberCheck("How many of the six stops do the rules keep?", 3, 0.0, "Three are kept and all three by what follows the word. No. keeps its stop because a figure follows an entry of the figures list, and approx. and al. keep theirs because the next word begins with a lowercase letter. The other three are the same abbreviations in front of a capital or a figure, so the answer turned on writing that has nothing to do with the abbreviation, which is section 7’s warning about a clause that reads the next word.") },
            ),
            exercise(
              "Count what the rules cost over the minutes",
              ["Part 5 counted the eighteen minuted sentences under each rule. Count them under splitting on spaces, under the Moses rules, and under the Moses rules with the switch that cuts a compound at its hyphen. For each, print how many pieces the corpus became and how many different pieces there were.", "The first two rows should be 192 and 137 against 228 and 136, and the third should have the 240 pieces section 17 quotes. The page does not say what the hyphen switch does to the count of different pieces, so read that off and see whether cutting the compounds made the vocabulary smaller here."],
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
              { hints: ["Corpus.of takes the list of sentences, and its word_counts takes a rule and answers the count of every distinct piece the rule produced over the whole corpus.", "The counts know total, which is every piece counted with its repeats, and n_words, which is how many different pieces there were."], check: numberCheck("How many different pieces do the minutes give with every compound cut at its hyphen?", 138, 0.0, "Cutting the compounds takes three entries away, low-cost, re-analysis and well-known, and opens five, which are low, re, well, known and the marker that stands for the hyphen, since cost and analysis already had rows. So 136 becomes 138 and the switch makes the vocabulary larger on eighteen sentences, for the reason section 20 gives about the rules as a whole. The saving needs the halves to turn up elsewhere often enough, and at this size they do not.") },
            ),
            exercise(
              "Switch the rewriting on and undo it",
              ["Section 17 says the eight named characters can be put back because nothing else produces those names. Split each of the eighteen minuted sentences with the rewriting switched on, count the pieces whose text is no longer the stretch of the sentence their span names, then join the pieces with nothing between them, put the eight characters back, and compare with the sentence stripped of its spacing.", "Every one of the eighteen should come back. The page counts three rewritten pieces on its quoted sentence and does not count them over the minutes, so read off how many pieces of the whole corpus the switch rewrote.", "The table of names is not exported from the top of the library, so it is imported here from the module that holds the rules."],
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
              { hints: ["UNESCAPES is a dictionary from each name, such as the one for a quotation mark, to the character it stands for, and the pattern built above matches any one of the eight names.", "A rewritten piece still carries the span of the writing it replaced, so the test for one is whether its text differs from the sentence sliced from start to end.", "The pattern’s sub takes a function that is handed each match, and the matched name is found.group(0), which is the key to look up. Splitting a sentence with no argument and joining with nothing strips its spacing."], check: numberCheck("How many pieces of the eighteen sentences does the switch rewrite?", 8, 0.0, "Eight pieces are rewritten, the four quotation marks of the tenth sentence and the four pieces that begin with an apostrophe, which come from didn’t, Andrew’s, It’s and committee’s. All eighteen sentences come back once the names are replaced, because each name stands for exactly one character and nothing else in the writing produces it. That is the difference from the annotation rules’ quotation marks, whose rewritten spelling a typist could also have typed.") },
            ),
          ],
        },
      ]}
    />
  );
}
