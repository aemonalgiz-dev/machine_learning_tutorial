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
import { ExceptionEntryTable } from "@/components/widgets/ExceptionEntryTable";
import { MosesCostPanel } from "@/components/widgets/MosesCostPanel";
import { MosesPlayground } from "@/components/widgets/MosesPlayground";
import { PrefixListPanel } from "@/components/widgets/PrefixListPanel";
import { RoundTripPanel } from "@/components/widgets/RoundTripPanel";
import { StopProbePanel } from "@/components/widgets/StopProbePanel";

export const metadata: Metadata = {
  title: "Moses Rules · oop_ml",
  description:
    "The rule list of the statistical machine translation era, written so the pieces could be put back into readable text, with a named list of the abbreviations it must not cut.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MosesRulesPage() {
  return (
    <ConceptPage
      title="Moses Rules"
      tagline="A rule list written for machine translation, so every piece stays a stretch of the writing it came from and an abbreviation it must not cut is named on a list."
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
      history={
        <>
          <p>
            The idea that a translation could be estimated from counts rather
            than written down as grammar came out of the Candide project at IBM
            in the late nineteen eighties, and Peter Brown, Stephen Della
            Pietra, Vincent Della Pietra and Robert Mercer set it out in{" "}
            <em>
              The Mathematics of Statistical Machine Translation: Parameter
              Estimation
            </em>{" "}
            in <em>Computational Linguistics</em> in 1993. Their evidence was
            the Canadian parliamentary proceedings, printed in English and
            French, and what the method learns about a word is a row of counts
            over the words it was seen opposite. That is the fact everything on
            this page follows from. A row is keyed on a run of characters, so{" "}
            <span className="font-mono">Washington</span>,{" "}
            <span className="font-mono">Washington.</span> and{" "}
            <span className="font-mono">Washington,</span> are three separate
            rows with the evidence for one word divided between them.
          </p>
          <p>
            Philipp Koehn, Franz Josef Och and Daniel Marcu moved the unit from
            the word to the contiguous phrase in{" "}
            <em>Statistical Phrase-Based Translation</em> at the 2003 meeting of
            the North American chapter of the Association for Computational
            Linguistics, which made the table larger and the vocabulary problem
            worse. Koehn then assembled <em>Europarl</em>, described at the
            Machine Translation Summit in 2005, eleven languages of European
            Parliament proceedings aligned sentence by sentence, and a great
            deal of the field&rsquo;s work for the next decade was run on it.
            The toolkit that read it was Moses, presented by Koehn, Hieu Hoang,
            Alexandra Birch, Chris Callison-Burch, Marcello Federico and their
            colleagues at the 2007 meeting of the Association for Computational
            Linguistics. It shipped a short Perl script that cut the text into
            words, a file of abbreviations per language that the script must not
            cut, and, unusually, a second script that put the words back
            together.
          </p>
          <p>
            That second script is the whole difference from the annotation rules
            of the previous page. A treebank is read by a linguist and a parser,
            and neither of them ever needs the original paragraph back. A
            translation system is read by a person who wanted a sentence, so the
            pipeline runs in both directions, and any rule that makes a piece
            unlike the writing it came from has to be undoable or it cannot be
            used. The page answers five questions in order. What does having to
            put the text back forbid, that annotating it does not? Where do these
            rules and the annotation rules actually differ, given that on our
            running sentence they give the same number of pieces? How can a full
            stop be assigned to an abbreviation or to a sentence, and why does
            that clause need a list where nothing else here does? What is the
            general shape of a rule that applies everywhere with a named list of
            places it must not, and what does a list buy that another rule
            cannot? And where does the method stop being defined, so that
            following it is agreement about a data file rather than a fact about
            English?
          </p>
        </>
      }
      playground={<MosesPlayground />}
      sections={[
        {
          title: "Part 1. Rules Written for a Translation System",
          defaultOpen: true,
          content: (
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
          ),
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
                  243 because it also cuts every compound at its hyphen. On the
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
                <InAModel>
                  <p>
                    The argument only pays at corpus scale, and the reason is
                    arithmetic rather than linguistics. The rows a mark opens are
                    bounded, since there are a few dozen marks and each of them
                    is one row however often it turns up. The rows a mark costs
                    are not bounded, because every common noun in the language
                    eventually appears with a comma after it, with a stop after
                    it, and inside a pair of brackets. Of the 137 entries these
                    eighteen sentences give the crude rule, only 5 are a word
                    that reached a second spelling, so the fixed cost of
                    separating the marks is still the larger of the two here. The
                    corpus of proceedings these rules were written for holds
                    millions of sentences, and the fixed cost does not grow with
                    any of them.
                  </p>
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
                <p>
                  So the method is a rule and a table, and what the method does
                  to a text is not determined until somebody has written the
                  table down. That has three consequences worth separating. The
                  answer for a given text depends on which file was loaded, so
                  two callers running the same rules on the same sentence can get
                  different pieces without either being unfaithful. The table is
                  per language, so a language nobody has written a file for is
                  not badly handled, it is outside what the method says. And a
                  table is finite while the abbreviations of a language are open,
                  so there is always a next word, and no amount of adding entries
                  changes that.
                </p>
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
      ]}
    />
  );
}
