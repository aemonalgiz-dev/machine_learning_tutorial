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
import { MangledWritingPanel } from "@/components/widgets/MangledWritingPanel";
import { SpaceSplitExplorer } from "@/components/widgets/SpaceSplitExplorer";
import { SpanRepairPanel } from "@/components/widgets/SpanRepairPanel";
import { SplitCostPanel } from "@/components/widgets/SplitCostPanel";
import { WhitespaceKindsTable } from "@/components/widgets/WhitespaceKindsTable";

export const metadata: Metadata = {
  title: "Splitting on Spaces · oop_ml",
  description:
    "Split text at whitespace and inspect which words, punctuation, and positions the rule preserves.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SplittingOnSpacesPage() {
  return (
    <ConceptPage
      lessonId="splitting-on-spaces"
      intuition={lessonIntuitions["splitting-on-spaces"]}
      technicalStart="Part 2. A Piece, and the Place It Came From"
      openingTitle="The Simplest Word Rule Already Makes a Choice"
      playgroundIntro="Inspect the extracted pieces and their source spans. Try punctuation beside a word and repeated whitespace, then compare the pieces with the original text."
      title="Splitting on Spaces"
      tagline="Split text at whitespace and inspect which words, punctuation, and positions the rule preserves."
      prerequisites={
        <>
          The{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          page, which sets out the vocabulary a piece of text is looked up in and
          the two promises it makes. This page is about the step before that
          lookup, which is deciding what the pieces are in the first place, and
          it takes the simplest answer anyone has proposed. The four pages after
          it each repair one of the failures measured here.
        </>
      }

      playground={<SpaceSplitExplorer />}
      sections={[
        {
          title: "Part 1. The Rule, and Why It Comes First",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Where the words are, before anything else can be decided">
                <p>
                  We carry one sentence through this page, the same one the rest
                  of this section carries, because it is short enough to check by
                  hand and awkward in four separate places.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  To a machine that is 51 characters in a row, and nothing in
                  those 51 characters is marked as a beginning or an end.
                  Anything that wants to count words, look words up, or learn
                  something about a word has to be told where one word stops and
                  the next starts, and there is no way to read that off the text
                  without a rule that somebody wrote. The question comes before
                  every other question about text, and it is asked once, before
                  any model exists.
                </p>
                <>
<p>
                  It is worth separating that question from the one it is usually confused with. Deciding where the words are is a claim about the writing system, since English puts gaps between its words and Chinese does not. Deciding what a model&rsquo;s units are is a claim about a corpus, since a vocabulary of forty thousand entries has to spell every text it will ever meet out of pieces it has already seen.
                </p>
                <p>
                  This page is entirely about the first, and the rule it describes is the shortest of the answers these pages cover, which is why it comes before the rest of them.
                </p>
</>
                <KeepInMind>
                  Nothing in a run of characters says where a word begins. Every
                  answer to that question, including the one on this page, is a
                  rule somebody chose, and choosing it is the first thing that
                  happens to a text.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Every run of characters that is not a space">
                <p>
                  The rule is one sentence long. Take every maximal run of
                  characters that are not white space, and each one is a word.
                  Nothing else is looked at, there are no exceptions, and there
                  is nothing to configure.
                </p>
                <Equation>
                  {"a word  =  a maximal run of characters, none of which is white space\n" +
                    "the words  =  every such run, in the order they appear"}
                </Equation>
                <p>
                  The word <em>maximal</em> is carrying the weight. A rule that
                  cut at each space and kept whatever fell between two cuts would
                  produce an empty word wherever two spaces met, and an empty
                  word is not a word of anything. Taking the runs instead means
                  the spacing is skipped over rather than divided at, so a single
                  space, a double space and a line break all do the same thing to
                  the answer.
                </p>
                <WhyThisWorks title="Why the runs and the gaps are the same statement">
                  <>
<p>
                    Every character of a text is either white space or it is not, so the text is a sequence of stretches of one kind alternating with stretches of the other. Naming the runs of one kind names the runs of the other kind by omission, and the two descriptions carry the same information. That is why the rule needs no notion of a separator at all.
                  </p>
                  <p>
                    It never asks how many spaces there were, only whether the character it is looking at is one, and section 7 is where the consequence of never asking turns up.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  One rule, no exceptions and no settings, which is why the
                  answer it gives depends on the text alone. Each of the four
                  rules after this one keeps the same skeleton and adds a list of
                  cases to it, and the list is where their disagreements live.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The running sentence, cut">
                <p>
                  Put the sentence to the rule and seven pieces come out. The
                  playground above is doing exactly this, and it is worth reading
                  the seven before going any further, because every difficulty on
                  the rest of the page is already visible in them.
                </p>
                <WorkedExample title="Seven pieces, and where each came from">
                  <Equation>
                    {"Dr.            [0, 3)\n" +
                      "Alvarez        [4, 11)\n" +
                      "didn't         [12, 18)\n" +
                      "expect         [19, 25)\n" +
                      "the            [26, 29)\n" +
                      "low-cost       [30, 38)\n" +
                      "re-analysis.   [39, 51)"}
                  </Equation>
                  <p>
                    The full stop after <span className="font-mono">Dr</span>{" "}
                    stayed on the front piece, the apostrophe in{" "}
                    <span className="font-mono">didn&rsquo;t</span> was left
                    where it was, the hyphen in{" "}
                    <span className="font-mono">low-cost</span> joined two words
                    into one piece, and the full stop that ends the sentence
                    rode along on the last piece. Not one of those was a
                    decision. The rule saw a run of characters that were not
                    white space in each case. Each of those four places is one
                    that a later rule on these pages treats differently, and
                    section 12 counts what the difference comes to over six
                    sentences.
                  </p>
                </WorkedExample>
                <p>
                  The seven pieces hold 45 of the sentence&rsquo;s 51 characters
                  between them, which is 88.2 per cent of it. The six characters
                  that are in no piece at all are the six spaces, and that is
                  true of every text rather than of this one, since the gaps
                  between the runs are by construction made of exactly the
                  characters the runs exclude.
                </p>
                <KeepInMind>
                  Seven pieces, 45 of 51 characters kept, and the four hardest
                  things in the sentence all handled by doing nothing to them.
                  Whether doing nothing was right is the subject of Part 3.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What counts as a space, which is more than the space bar">
                <p>
                  The rule says white space rather than space, and the difference
                  is not decoration. A great many characters are white space, and
                  a rule that recognised only the one on the space bar would join
                  two words across a no-break space, which no reader would, and
                  would run a whole line of Japanese together at an ideographic
                  space. I put ten characters between the letters a and b one at
                  a time and counted the pieces that came back.
                </p>
                <WhitespaceKindsTable />
                <p>
                  Seven of the ten end a word and three do not, and the three are
                  the interesting ones. A hyphen is expected there, since a
                  hyphen is visibly a mark rather than a gap. The other two are
                  not. The character called the zero width space, which exists
                  to offer a line-breaking opportunity inside a long word, is
                  not white space at all by the test the rule applies, so the
                  letters either side of it stay in one piece; the soft hyphen
                  behaves the same way. The rule asks whether a character{" "}
                  <em>is</em> white space and never what it is called, and for
                  those two the name and the answer point in different
                  directions.
                </p>
                <KeepInMind>
                  Recognising the whole family of white space rather than the
                  space alone is a real and unglamorous piece of correctness. It
                  also means the rule&rsquo;s answer on a text can turn on a
                  character nobody can see, which is a thing to remember when a
                  piece comes out longer than it should.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Piece, and the Place It Came From",
          content: (
            <>
              <SubSection title="5. A piece is the letters and the position together">
                <p>
                  A rule of this kind could report a list of strings and stop
                  there, and a great many implementations do. That throws
                  something away that the rule knew a moment earlier, which is
                  where in the text each piece was standing. A piece is
                  therefore the characters together with the half-open span they
                  occupied, the offset it starts at and the offset one past where
                  it stops.
                </p>
                <Equation>
                  {"a piece  =  ( the characters ,  [ start ,  end ) )\n" +
                    "length   =  end − start"}
                </Equation>
                <p>
                  Half-open because it makes the arithmetic come out. The length
                  of a piece is the difference of its two offsets with no
                  correction, an empty stretch is a span whose two offsets agree,
                  and one piece ending where the next begins is the same number
                  written once rather than two numbers that must be kept a step
                  apart. It is the convention every slice of a sequence uses, for
                  the same reasons.
                </p>
                <p>
                  Three things downstream need the position and cannot recover
                  it. Anything that draws the reader&rsquo;s text with a piece
                  highlighted has to know which characters to highlight. Anything
                  comparing two rules on one sentence has to line their answers
                  up, and only the offsets do that, since the strings themselves
                  differ. And a rule for a script that writes no spaces has
                  nothing to report except the boundaries it chose, so for those
                  rules the span is the whole of what they have to say.
                </p>
                <KeepInMind>
                  For this rule the characters of a piece are always exactly the
                  slice its span names, since it cuts and never rewrites. Rules
                  later in this section do rewrite, turning one quotation mark
                  into two characters or escaping an ampersand, and for those the
                  span says where a piece came from while the characters say what
                  it became.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The pieces cover the writing and leave the spacing out">
                <p>
                  Adding the spans up says how much of a text survived into the
                  pieces. On the running sentence the answer is 45 characters of
                  51, and the six that are missing are the six spaces. On writing
                  that contains no spaces the answer is everything, and on writing
                  that is nothing but spaces the answer is nothing.
                </p>
                <NumberTable
                  headings={[
                    "text",
                    "characters",
                    "pieces",
                    "characters inside a piece",
                  ]}
                  rows={[
                    ["the running sentence", "51", "7", "45"],
                    ["the same sentence, spaced differently", "52", "7", "45"],
                    ["nine characters of Chinese", "9", "1", "9"],
                    ["three spaces", "3", "0", "0"],
                  ]}
                  caption="The second row is the running sentence with one doubled space and one line break, which is section 7, and the third and fourth are section 16 and section 17 arriving early."
                />
                <>
<p>
                  The share kept has to be read carefully, since it says how much of the writing was spacing and says nothing about whether the answer was any good. It is 88.2 per cent on this sentence because English spends roughly a seventh of its characters on spaces, and it is exactly one on the Chinese line because that script spends none, which is section 11.
                </p>
                <p>
                  The fourth row is the reverse case, a text where the rule keeps none of the writing at all and is entirely correct to, since three spaces hold no run of anything else.
                </p>
</>
                <KeepInMind>
                  Everything the pieces do not cover is white space, always, by
                  the shape of the rule. That is the one thing lost at the cut,
                  and section 7 is about what it costs and where it can be got
                  back from.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Gluing the pieces back">
                <p>
                  The sharpest test of any cutting rule is to cut a text and put
                  it back together immediately, with nothing in between, and
                  compare what comes out against what went in character for
                  character. Anything the rule discarded shows up as a difference
                  and nothing else does. Something has to do the gluing, and
                  anything holding the pieces alone has only one option, which is
                  a single space between each pair.
                </p>
                <SpanRepairPanel />
                <>
<p>
                  On the running sentence a single space is right in all six places, so the sentence comes back exactly and the rule looks lossless. On the same sentence with one doubled space and one line break it is right in four places out of six, and the text that comes back is the first one, which is not the text that went in.
                </p>
                <p>
                  Both texts give the identical seven pieces, so nothing a model reads could tell them apart, and no amount of training recovers the difference, since it was thrown away before the model was reached.
                </p>
</>
                <p>
                  The spans are where it can be got back. Putting each piece back
                  at the offsets it came from, and taking the source between one
                  piece and the next, reproduces both texts exactly, because the
                  offsets never stopped describing the original. That works only
                  while the original text is still in hand, which is a real
                  limitation, though it is the difference between a loss that can
                  be repaired at the boundary and one that cannot be repaired at
                  all.
                </p>
                <KeepInMind>
                  A single space between the pieces is a guess made once and
                  applied everywhere, and it is right exactly when the text was
                  singly spaced. That is why a rule of this kind should be
                  described as discarding the spacing rather than as lossless,
                  even where a test on ordinary prose comes back exact.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A rule that cut at each space and kept whatever fell between two cuts would agree with this one on the running sentence and part company with it wherever two spaces meet.",
              true,
              "The running sentence is singly spaced, so the two rules give the same seven pieces there. Where two spaces meet, cutting at each one leaves an empty word between them, and an empty word is not a word of anything. Taking maximal runs instead skips the spacing rather than dividing at it, which is why the word maximal is carrying the weight, and why a single space, a double space and a line break all do the same thing to the answer.",
            ),
            choice(
              "The seven pieces hold 45 of the sentence’s 51 characters. What are the six characters that no piece holds?",
              [
                "The six spaces",
                "The two full stops, the apostrophe, the two hyphens and one space",
                "The six characters of the abbreviation and the compound",
                "The six characters the rule rewrote on the way out",
              ],
              0,
              "Everything the pieces do not cover is white space, by the shape of the rule, since the gaps between the runs are made of exactly the characters the runs exclude. That is true of every text rather than of this one, which is why the share kept says how much of the writing was spacing and nothing about whether the answer was any good.",
            ),
            several(
              "Ten characters were put between the letters a and b one at a time. Which of these left the two letters in a single piece?",
              [
                "A hyphen",
                "The zero width space",
                "The soft hyphen",
                "A no-break space",
                "An ideographic space",
              ],
              [0, 1, 2],
              "Seven of the ten end a word and three do not. The hyphen is expected there, since a hyphen is visibly a mark rather than a gap, and the other two are the surprise, because the rule asks whether a character is white space and never what it is called. The no-break space and the ideographic space are white space by that test, which is why recognising the whole family rather than the space alone is a real piece of correctness.",
            ),
            trueFalse(
              "Cutting the running sentence and gluing the pieces straight back with a single space between each pair returns it exactly, so the rule is lossless.",
              false,
              "It does come back exactly, because a single space is right in all six places on that sentence. Put in one doubled space and one line break and the glue is right in four places of six, and the text that comes back is the first sentence rather than the second. Both texts give the identical seven pieces, so a rule of this kind discards the spacing even where a test on ordinary prose comes back exact.",
            ),
            choice(
              "Why is a piece’s span half-open rather than the offset of its first character and the offset of its last?",
              [
                "The length is then the difference of the two offsets with no correction, and one piece ending where the next begins is one number rather than two kept a step apart",
                "It lets a piece be stored without keeping its characters",
                "It marks which of the stretches between the pieces were white space",
                "It allows the rule to rewrite a character and still say where the piece came from",
              ],
              0,
              "Half-open is the convention every slice of a sequence uses, and for the same reasons. An empty stretch also comes out as a span whose two offsets agree. Letting a rule rewrite a character and still say where the piece came from is something the spans do allow, but it belongs to the rules later in the section that rewrite, where this one only ever cuts.",
            ),
        ],
        },
        {
          title: "Part 3. The Kinds of Writing It Mangles",
          content: (
            <>
              <SubSection title="8. Punctuation rides on the word in front of it">
                <p>
                  A full stop, a comma, a quotation mark and a bracket are not
                  white space, so a run that contains one carries it along. The
                  first three rows below are that, and they are the failure the
                  next four pages of this section exist to repair.
                </p>
                <MangledWritingPanel />
                <p>
                  Read the first row and the piece is{" "}
                  <span className="font-mono">away.</span>, which is not a word
                  anybody would write in a dictionary. Read the second and the
                  piece is <span className="font-mono">small,</span>. The third
                  is worse, since a quotation mark on each side gives{" "}
                  <span className="font-mono">&quot;low-cost&quot;</span> as one
                  piece, and a bracket on each side gives{" "}
                  <span className="font-mono">(twice)</span>, so a word wrapped
                  in marks is a piece that shares no characters at either end
                  with the bare word it contains.
                </p>
                <InAModel>
                  <p>
                    Every distinct piece a corpus produces is an entry in a table
                    with a row of learned parameters behind it, so a word that
                    turns up bare in one place and with a comma in another has
                    two rows, each learned from half the occurrences it should
                    have had, and nothing later connects them. Six sentences give
                    one instance of that, which section 12 names. Over ordinary
                    prose it lands hardest on the commonest words, since those
                    are the ones that reach the end of a clause often enough to
                    accumulate several spellings.
                  </p>
                </InAModel>
                <KeepInMind>
                  A mark of punctuation is a character like any other to this
                  rule, so it joins whichever run it is touching. Every rule on
                  the pages after this one starts by separating those marks, and
                  each pays for the separation in a different way.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The stop that ends an abbreviation looks like the stop that ends a sentence">
                <p>
                  The fourth row above is the same behaviour and a much harder
                  problem. <span className="font-mono">Dr.</span> ends in a full
                  stop that belongs to the word, so keeping it is correct, and{" "}
                  <span className="font-mono">re-analysis.</span> ends in a full
                  stop that belongs to the sentence, so keeping it is wrong. The
                  rule does the same thing to both, and it does the same thing
                  for the same reason.
                </p>
                <p>
                  Over the six sentences this page measures, seven of the 47
                  entries end in a full stop, and one of the seven is an
                  abbreviation while six are the ends of sentences. Nothing in
                  the seven runs of characters distinguishes them. The
                  information that would is a fact about English usage rather
                  than about the characters, which is why the rules that get this
                  right carry a list of abbreviations and why every such list is
                  a list for one language.
                </p>
                <WhyThisWorks title="Why this case has no clean answer at all">
                  <>
<p>
                    Consider a sentence ending in an abbreviation, which in English is written with one full stop rather than two. That single character is doing both jobs at once, closing the abbreviation and closing the sentence, so there is no division of the text that assigns it correctly to one and not the other. A rule can keep it, and lose the sentence boundary, or cut it away, and lose the abbreviation.
                  </p>
                  <p>
                    Neither answer is a repair, and any rule that claims to have solved this has chosen one of the two losses and not said so.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  Six of the seven full stops here are noise on the end of a word
                  and one of them is part of it. The rule cannot separate them,
                  and no rule that reads only the characters can, since what
                  separates them is knowledge of a particular language.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The apostrophe and the hyphen, left alone">
                <p>
                  The fifth and sixth rows are different in kind, and calling
                  them failures takes an argument rather than an example.{" "}
                  <span className="font-mono">didn&rsquo;t</span> comes out
                  whole, and <span className="font-mono">low-cost</span> comes
                  out whole, and for a good many purposes those are the answers
                  wanted.
                </p>
                <p>
                  They are failures against a particular convention. The
                  annotation rules a generation of English research was built on
                  cut a contraction into the verb and the negation, so that the
                  negation is one unit wherever it appears, and the Unicode word
                  boundary rules break a hyphenated compound into its halves. Put
                  the running sentence to that second rule and it comes back as
                  nine pieces rather than seven, with{" "}
                  <span className="font-mono">low</span> and{" "}
                  <span className="font-mono">cost</span> separate and{" "}
                  <span className="font-mono">re</span> and{" "}
                  <span className="font-mono">analysis</span> separate. Whether
                  seven or nine is right is a question about what a word is, and
                  section 15 is where that question is faced rather than answered.
                </p>
                <KeepInMind>
                  Leaving the apostrophe and the hyphen alone is a position, and
                  the rule takes it by never having considered the question. The
                  distinction that matters is between a rule that chose this
                  answer and a rule that cannot give any other, and this one is
                  the second.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. A script that puts nothing between its words">
                <p>
                  The last row is the one that is not English, and it is the
                  worst case the rule has. Nine characters of Chinese contain no
                  white space anywhere, so there is exactly one maximal run and
                  the answer is one piece holding the whole line. A reader of
                  Chinese sees several words there. The rule sees one.
                </p>
                <p>
                  What makes this the worst case rather than merely a bad one is
                  that every reading a caller could take is reassuring. The
                  pieces cover 9 characters of 9, so the share of the writing
                  kept is exactly one, which is higher than the 88.2 per cent the
                  English sentence scored. Gluing the single piece back gives the
                  line character for character, so the round trip is exact. On
                  both of the measures Part 2 built, the answer here is better
                  than the answer on the sentence the rule was designed for.
                </p>
                <KeepInMind>
                  On a script with no spaces the rule returns the whole text as
                  one word and reports perfect coverage and an exact round trip
                  while doing it. Both of the numbers Part 2 built go up when the
                  answer gets worse, which is why neither of them can be quoted
                  on its own, and section 16 is where that failure is taken apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the mangling costs, counted">
                <p>
                  The costs so far have been shown one piece at a time, which
                  says nothing about how often they arise. The corpus here is six
                  sentences from the same notebook the rest of this section
                  shares, 375 characters in all, and I read all six under this
                  rule and under the Unicode word boundary rules, which are the
                  first repair the next page describes.
                </p>
                <SplitCostPanel />
                <p>
                  Nine of the 47 entries carry a mark of punctuation at one end
                  or the other. Taking those marks off would leave 46 distinct
                  entries rather than 47, so exactly one entry is a word the list
                  already holds wearing a full stop, which is{" "}
                  <span className="font-mono">re-analysis.</span> against{" "}
                  <span className="font-mono">re-analysis</span>. That is a small
                  number on six sentences and it is small for a reason worth
                  knowing. A duplicate needs the same word to appear both at the
                  end of a clause and inside one, and six sentences give most
                  words only one chance.
                </p>
                <p>
                  The most surprising thing in that table is that both rules
                  arrive at 47 entries. It is a coincidence of this corpus rather
                  than a result, and the lists underneath show why. Only 35 of
                  the entries are held by both, so the two rules disagree about
                  12 of them in each direction, and they disagree in opposite
                  ways. This rule spends its twelve on words wearing punctuation
                  and on compounds kept whole; the other spends its twelve on the
                  bare forms of those same words and on the halves of the
                  compounds.
                </p>
                <KeepInMind>
                  A single corpus can put two quite different rules at the same
                  table size and say nothing about either. The count of entries
                  is worth reading only beside what the entries are, which on six
                  sentences means reading all 47.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What It Gets Right",
          content: (
            <>
              <SubSection title="13. It is exact, and there is nothing to fit first">
                <p>
                  Five sections of failures make it easy to forget that this rule
                  is used deliberately, underneath most of the methods that
                  criticise it, including the subword learners at the end of this
                  section. It is worth saying what it has that they do not,
                  since those properties are why it is still where a pipeline
                  starts.
                </p>
                <>
<p>
                  It reads no corpus, so there is no fitting step and no data to gather, and the answer it gives today is the answer it gave last year. It has no settings, so two people applying it to one sentence get the same seven pieces and cannot have configured it differently. It carries no list of exceptions, so it cannot be out of date, and it makes no claim about any particular language, so it cannot be wrong about a language it has never seen in the way that a list of English abbreviations is wrong about German.
                </p>
                <p>
                  And it never rewrites a character, so every piece is exactly the slice of the source its span names, and the writing can be recovered from the pieces and their offsets.
                </p>
</>
                <InAModel>
                  <p>
                    That last property is why it is the usual first step in front
                    of a learned scheme. A learner that counts words and cuts them
                    into pieces needs its input words to be a deterministic
                    function of the corpus, since anything else makes the learned
                    vocabulary depend on a version of a rule list rather than on
                    the text. The rule on this page satisfies that with nothing
                    to arrange, which is why it survives as the front half of
                    methods whose whole purpose is to improve on it.
                  </p>
                </InAModel>
                <KeepInMind>
                  Nothing to fit, nothing to configure, no exceptions to keep up
                  to date and no character rewritten. The rules on the next four
                  pages each give up at least one of those, and the rule on the
                  page after this one gives up the last of them by returning the
                  running sentence with four of its characters missing.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Where it beats the rule that repairs it">
                <p>
                  The comparison in section 12 also runs the other way, and it is
                  more interesting in that direction, because the repair is
                  usually described as strictly better. On the same six sentences
                  the boundary rules give 69 pieces where this one gives 63, so a
                  model reading that corpus would read about a tenth more
                  positions, and the cost of reading text grows at least in step
                  with the number of positions.
                </p>
                <>
<p>
                  The sharper difference is what happens to the characters. On the running sentence the boundary rules keep 41 of the 51 characters, against 45 here. The ten they leave behind are the six spaces and, unlike this rule, both hyphens and both full stops, since a mark that is not part of a word is not returned as one.
                </p>
                <p>
                  Gluing their nine pieces back with single spaces gives a line with the abbreviation&rsquo;s stop gone, the compound split in two and the sentence&rsquo;s own full stop missing, so the loss is not confined to the spacing the way it is here.
                </p>
</>
                <KeepInMind>
                  The obvious repair to this rule buys a table with no attached
                  punctuation in it, splits the compounds while it is there, and
                  pays with a tenth more pieces over the corpus and four more
                  characters of a 51-character sentence that no piece holds.
                  Which of the two suits a job depends on whether the marks or
                  the length matter more to it, and the next page is where that
                  rule is described on its own terms.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Rule Stops Being Defined",
          content: (
            <>
              <SubSection title="15. A word is a convention, and this rule commits to one of them">
                <p>
                  It is tempting to read Part 3 as a list of mistakes, and it is
                  not quite that. A mistake needs a correct answer to be measured
                  against, and the question of where the words are does not have
                  one, because a word is a unit somebody defined rather than a
                  thing in the text.
                </p>
                <p>
                  Take <span className="font-mono">low-cost</span>. A dictionary
                  lists it as one headword. A search index that must match a
                  query for <em>cost</em> wants two. A typesetter breaking a line
                  wants two with a joint between them. All three are right about
                  their own purpose, and there is no fourth authority they could
                  appeal to, since the writing itself records only that somebody
                  typed a hyphen. The measurement in section 12 says the same
                  thing arithmetically. Two careful rules put 35 entries in the
                  same place and 12 in different places, and nothing decides the
                  12 except which convention was adopted first.
                </p>
                <p>
                  The honest description of this rule, then, is that it takes one
                  convention, that a word is whatever a writer separated with a
                  gap, and applies it to everything without exception. That
                  convention is defensible and it has one property none of the
                  others has, since a reader can check the rule&rsquo;s answer
                  against the page in front of them by looking at where the gaps
                  are, without knowing the language or consulting a list.
                </p>
                <KeepInMind>
                  Correctness is the wrong question to put to a rule here, since
                  the writing does not settle it. What a rule can be held to is
                  whether it says which convention it took, and this one takes
                  the convention that a gap in the writing is the boundary.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Whitespace is a property of a writing system, not of language">
                <p>
                  The rule makes one assumption and never states it, which is
                  that the writing in front of it separates its words with gaps.
                  That assumption is true of English and of most European
                  writing, and it is false of Chinese, Japanese, Thai, Khmer,
                  Lao and Burmese, which put nothing between one word and the
                  next. It was also false of the Greek and Latin the alphabet
                  arrived in, as the opening of this page describes, so it is a
                  fact about a habit that spread rather than about writing.
                </p>
                <p>
                  What follows is a statement about the method rather than about
                  any particular text. Where the assumption holds the rule&rsquo;s
                  answer is determined by the writing, and where it fails the
                  rule&rsquo;s answer is determined by nothing at all, since a
                  text with no white space in it has exactly one maximal run
                  however many words a reader finds there. The question the rule
                  is asked and the question it answers come apart completely, and
                  the answer it gives, one piece per unspaced stretch, is
                  arithmetically correct and useless.
                </p>
                <p>
                  There is no repair available inside the rule. Finding the words
                  in a script that writes none requires either a list of the
                  words of that language or a model trained on text somebody has
                  already cut up, and both of those are information from outside
                  the text. That is what the next section of this site is, and
                  the four methods in it differ mainly in where that outside
                  information comes from.
                </p>
                <KeepInMind>
                  The rule assumes a property of the writing system, never checks
                  it, and cannot check it, since a text with no gaps is
                  indistinguishable from a text that is one long word. The
                  assumption is the whole of what the rule knows, and it is not
                  written down anywhere in the answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Every failure it has is silent">
                <p>
                  Put those together and one property covers all of them. This
                  rule is total. Every text has an answer, the answer is always a
                  list of runs, and there is no input on which the rule can
                  decline to say anything, so nothing that goes wrong announces
                  itself. The table gathers the cases where the answer is
                  something other than what a caller wanted, with what the rule
                  actually determines in each.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "a text of nothing but spaces",
                      reason:
                        "defined, and the answer is no words at all, which is correct rather than degenerate. Three spaces hold no run of anything else. A caller expecting at least one word per text has to check the count, since the empty answer is indistinguishable from a successful one.",
                    },
                    {
                      expression: "a text with no spaces in it",
                      reason:
                        "defined and useless, and the two are not in tension. One maximal run means one piece, and every quality a caller can measure comes back at its best, with all 9 characters of the Chinese line inside a piece and an exact round trip.",
                    },
                    {
                      expression: "where a word begins inside a run",
                      reason:
                        "outside what the rule can say. It asks one question of one character at a time, whether that character is white space, so nothing about which characters are letters, or which language they belong to, can enter the answer at all.",
                    },
                    {
                      expression: "a mark of punctuation touching a word",
                      reason:
                        "decided by doing nothing, and the decision is not free. Keeping the mark makes a word and the same word with a mark two unrelated pieces, 9 of the 47 entries here carrying one. Every alternative is paid for elsewhere, and the rule measured against it here, which drops the marks rather than keeping them, leaves 10 of the running sentence’s 51 characters in no piece at all and takes the six sentences from 63 pieces to 69.",
                    },
                    {
                      expression: "a full stop that ends an abbreviation",
                      reason:
                        "not decidable from the characters, and at the end of a sentence not decidable at all, since one character is closing both the word and the sentence and no cut assigns it to both. Any rule claiming to handle this has chosen which of the two losses to take.",
                    },
                    {
                      expression: "a hyphen joining two words",
                      reason:
                        "not settled by the writing. A dictionary wants one unit, a search index wants two, and the text records only that a hyphen was typed. A rule can be judged on whether it states its choice, never on whether the choice is right.",
                    },
                    {
                      expression: "the glue that puts the pieces back",
                      reason:
                        "undefined by the rule, which cuts and records nothing about what it cut at. One space between each pair is a guess, exact where the text was singly spaced and wrong everywhere else, and the spans are the only place the discarded spacing survives.",
                    },
                    {
                      expression: "a character named for a space",
                      reason:
                        "decided by what the character is rather than what it is called. One of the ten probed here has the word space in its name and ends no word, and a soft hyphen, whose whole job is to offer a break, ends none either, so a piece can come back joined at a character nobody can see.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying past this page. The rule cannot
                  refuse, so a wrong answer and a right one look identical from
                  the outside and only the pieces themselves say which arrived.
                  And the assumption it rests on, that words are separated by
                  gaps, is the one thing it never reports on, so it is the reader
                  who has to know whether the writing satisfies it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            trueFalse(
              "On the line of Chinese the rule scores better on both of the measures Part 2 built than it does on the English sentence.",
              true,
              "The single piece covers 9 characters of 9, so the share of the writing kept is exactly one against the sentence’s 88.2 per cent, and gluing one piece back reproduces the line character for character. That is what makes it the worst case rather than merely a bad one, since both numbers go up as the answer gets worse and neither can be quoted on its own.",
            ),
            choice(
              "Both rules produce 47 entries on the six sentences. What does that agreement establish?",
              [
                "Nothing about either rule, since only 35 of the entries are held by both",
                "That the two rules make the same cuts on this corpus",
                "That the corpus holds no punctuation for them to disagree about",
                "That the boundary rules are a strict improvement here",
              ],
              0,
              "The two disagree about 12 entries in each direction, and in opposite ways. This rule spends its twelve on words wearing punctuation and on compounds kept whole, and the other spends its twelve on the bare forms and on the halves of those compounds. A count of entries is worth reading only beside what the entries are.",
            ),
            choice(
              "Seven of the 47 entries end in a full stop, one an abbreviation and six the ends of sentences. What tells the two apart?",
              [
                "Nothing in the runs of characters, since what separates them is knowledge of a particular language",
                "The abbreviation keeps its full stop where the sentence ends lose theirs",
                "The abbreviation is the only one of the seven that also carries a hyphen",
                "The sentence ends are the ones followed by white space",
              ],
              0,
              "The rule does the same thing to both and does it for the same reason, which is that a full stop is a character like any other and joins whichever run it is touching. The information that would separate them is a fact about English usage, which is why the rules that get this right carry a list of abbreviations and why every such list is a list for one language.",
            ),
            several(
              "Which of these are true of this rule?",
              [
                "It reads no corpus, so there is no fitting step and the answer it gives today is the answer it gave last year",
                "It never rewrites a character, so every piece is exactly the slice of the source its span names",
                "It checks that the writing in front of it separates its words with gaps before it answers",
                "It declines to answer on writing that puts no gaps between its words",
              ],
              [0, 1],
              "Reading no corpus and rewriting nothing are two of the four properties Part 4 names, and they are why the rule survives as the front half of methods whose whole purpose is to improve on it, since a learner that counts words needs its input words to be a deterministic function of the corpus. The other two describe a rule that does not exist. Part 5 says the assumption that words are separated by gaps is the one thing the rule never reports on and cannot check, since a text with no gaps is indistinguishable from a text that is one long word, and the rule is total, so every text has an answer and nothing that goes wrong announces itself.",
            ),
            trueFalse(
              "Over the six sentences the boundary rules return fewer pieces than this rule, because a mark of punctuation is not returned as a word.",
              false,
              "They return more. On that corpus the boundary rules give 69 pieces where this one gives 63, so a model reading it would read about a tenth more positions, and the cost of reading text grows at least in step with the number of positions. Separating the marks and splitting the compounds adds positions faster than dropping the marks removes them.",
            ),
        ],
        },
        {
          title: "Practice. Putting the Rule to the Running Sentence",
          practice: [
            exercise(
              "Cut the running sentence and read the spans",
              ["Put the sentence Part 1 carries to the library’s whitespace rule, print each piece beside the half-open span it came from, and then add the spans up to find how much of the sentence the pieces hold.", "Part 1 arrived at seven pieces and Part 2 at 45 of the 51 characters inside a piece. Both should come straight out of the spans, and the share kept, to one decimal place, should be the 88.2 per cent the page quotes."],
              `from oop_ml import WhitespacePreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."

rule = WhitespacePreTokenizer()
# Split the sentence, print each piece with its start and end offsets,
# then print the number of pieces, how many of the sentence's characters
# lie inside a piece, and that count as a percentage of the sentence.`,
              `from oop_ml import WhitespacePreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."

rule = WhitespacePreTokenizer()
words = rule.split(sentence)

for word in words:
    print(f"[{word.start:2d}, {word.end:2d})  {word.text}")

covered = sum(word.end - word.start for word in words)
print(f"{words.n_words} pieces")
print(f"{covered} of {len(sentence)} characters inside a piece")
print(f"share kept {100 * covered / len(sentence):.1f} per cent")`,
              `[ 0,  3)  Dr.
[ 4, 11)  Alvarez
[12, 18)  didn't
[19, 25)  expect
[26, 29)  the
[30, 38)  low-cost
[39, 51)  re-analysis.
7 pieces
45 of 51 characters inside a piece
share kept 88.2 per cent`,
              { hints: ["The rule takes no settings, so it is constructed with nothing and the text goes to split, which answers a collection of words.", "Iterating over that collection gives one word at a time, and each word carries text, start and end. The collection itself knows n_words.", "The span is half-open, so the length of a piece is end minus start with no correction, and summing those lengths is the count of characters inside a piece."], check: numberCheck("What share of the sentence’s characters do the pieces hold, in per cent to one place?", 88.2, 0.05, "The seven spans add up to 45 characters of the 51, and 45 over 51 is 88.2 per cent. The six characters outside every piece are the six spaces, which is true of any text under this rule, since the gaps between the runs are made of exactly the characters the runs exclude.") },
            ),
            exercise(
              "Put ten characters between two letters",
              ["Section 4 put ten characters between the letters a and b one at a time and counted the pieces that came back. Do the same, building each character from its code point so that the invisible ones are written down unambiguously, and count how many of the ten end a word.", "Seven should end a word and three should not. Watch which three, since one of them has the word space in its name and another exists only to offer a line break."],
              `from oop_ml import WhitespacePreTokenizer

candidates = {
    "space": 0x0020,
    "character tabulation": 0x0009,
    "line feed": 0x000A,
    "no-break space": 0x00A0,
    "thin space": 0x2009,
    "ideographic space": 0x3000,
    "paragraph separator": 0x2029,
    "zero width space": 0x200B,
    "soft hyphen": 0x00AD,
    "hyphen-minus": 0x002D,
}
rule = WhitespacePreTokenizer()
# For each candidate, split the letter a, the character, and the letter b,
# print the code point, the name and how many pieces came back, and
# finally print how many of the ten candidates ended a word.`,
              `from oop_ml import WhitespacePreTokenizer

candidates = {
    "space": 0x0020,
    "character tabulation": 0x0009,
    "line feed": 0x000A,
    "no-break space": 0x00A0,
    "thin space": 0x2009,
    "ideographic space": 0x3000,
    "paragraph separator": 0x2029,
    "zero width space": 0x200B,
    "soft hyphen": 0x00AD,
    "hyphen-minus": 0x002D,
}
rule = WhitespacePreTokenizer()

ending = 0
for name, code in candidates.items():
    n_pieces = rule.split(f"a{chr(code)}b").n_words
    ending += n_pieces > 1
    print(f"U+{code:04X}  {name:22s}  {n_pieces}")
print(f"{ending} of {len(candidates)} end a word")`,
              `U+0020  space                   2
U+0009  character tabulation    2
U+000A  line feed               2
U+00A0  no-break space          2
U+2009  thin space              2
U+3000  ideographic space       2
U+2029  paragraph separator     2
U+200B  zero width space        1
U+00AD  soft hyphen             1
U+002D  hyphen-minus            1
7 of 10 end a word`,
              { hints: ["chr turns a code point into the character itself, so the probe text for each row is the letter a, chr of the code, and the letter b.", "A character ends a word exactly when the probe comes back as two pieces rather than one, so the test is whether n_words is greater than one.", "Format the code point with a width of four in upper-case hexadecimal, which is how a character table writes it, and the rows will line up."], check: numberCheck("How many of the ten characters end a word?", 7, 0.0, "Seven of the ten are white space by the test the rule applies and three are not. The hyphen is expected there, since it is visibly a mark, and the zero width space and the soft hyphen are the surprise, because the rule asks whether a character is white space and never what it is called or what it is for.") },
            ),
            exercise(
              "Glue the pieces with spaces, then rebuild them from the spans",
              ["Take the running sentence with one doubled space and one line break, which is the second text of section 7. Cut it, glue the pieces back with a single space between each pair, and compare the result with the text that went in. Then put each piece back at its own offsets, taking the source between one piece and the next, and compare again.", "The pieces should be the same seven as the singly spaced sentence gives, the glue should fail and the spans should succeed. Count how many of the six gaps between the pieces are a single space, which is the number of places where the guess happens to be right."],
              `from oop_ml import WhitespacePreTokenizer

text = "Dr.  Alvarez didn't expect\\nthe low-cost re-analysis."
words = WhitespacePreTokenizer().split(text)
pieces = list(words)

# Glue the texts of the pieces with one space between each pair and print
# whether that equals the text. Collect the gap between each piece and the
# next, and print how many of those gaps are a single space. Then rebuild
# the text from the spans, taking the source between the pieces, and print
# whether that equals the text.`,
              `from oop_ml import WhitespacePreTokenizer

text = "Dr.  Alvarez didn't expect\\nthe low-cost re-analysis."
words = WhitespacePreTokenizer().split(text)
pieces = list(words)

glued = " ".join(words.texts)
print(f"{words.n_words} pieces")
print(f"glued with one space each, exact: {glued == text}")

gaps = [text[before.end:after.start] for before, after in zip(pieces, pieces[1:])]
print(f"gaps that are one space: {sum(gap == ' ' for gap in gaps)} of {len(gaps)}")

rebuilt = ""
previous = 0
for piece in pieces:
    rebuilt += text[previous:piece.start] + piece.text
    previous = piece.end
rebuilt += text[previous:]
print(f"rebuilt from the spans, exact: {rebuilt == text}")`,
              `7 pieces
glued with one space each, exact: False
gaps that are one space: 4 of 6
rebuilt from the spans, exact: True`,
              { hints: ["The collection of words has a texts property holding the strings alone, which is exactly what something holding the pieces without their spans would have, so the glue is one join over it.", "The gap between two neighbouring pieces is the slice of the text from the first one’s end to the next one’s start, and zip over the pieces and the pieces shifted by one pairs each with its neighbour.", "To rebuild, walk the pieces keeping the offset where the last one ended, and append the source between that offset and the next start before appending the piece. Whatever follows the last piece goes on at the end."], check: numberCheck("How many of the six gaps between the pieces are a single space?", 4, 0.0, "Four of the six are a single space, so the guess is right in four places and wrong at the doubled space and the line break, and the glued text is the singly spaced sentence rather than the one that went in. The seven pieces are identical to the ones the singly spaced sentence gives, so nothing a model reads could tell the two texts apart, and only the spans, which still say where each piece stood, give the second text back.") },
            ),
            exercise(
              "Count the table over the six sentences",
              ["Section 12 read six sentences under this rule and under the Unicode word boundary rules and found that both arrive at 47 entries. Build the same corpus, count the entries and the pieces each rule produces, and count how many entries the two rules hold in common.", "Then look up one word the page talks about. Section 8 says a word that turns up bare in one place and wearing a mark in another has two rows, each learned from half the occurrences it should have had. Count how many times analysis is an entry under each rule, which the page does not print."],
              `from oop_ml import Corpus, UnicodeWordPreTokenizer, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
corpus = Corpus.of(notebook)
rules = {"on spaces": WhitespacePreTokenizer(), "on word boundaries": UnicodeWordPreTokenizer()}

# For each rule, count the corpus's words, and print how many distinct
# entries and how many pieces in all it produced. Print how many entries
# the two rules share, then how many times analysis is counted under each.`,
              `from oop_ml import Corpus, UnicodeWordPreTokenizer, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
corpus = Corpus.of(notebook)
rules = {"on spaces": WhitespacePreTokenizer(), "on word boundaries": UnicodeWordPreTokenizer()}

tables = {}
for name, rule in rules.items():
    tables[name] = {count.word: count.count for count in corpus.word_counts(rule)}
    print(f"{name}: {len(tables[name])} entries, {sum(tables[name].values())} pieces")

shared = tables["on spaces"].keys() & tables["on word boundaries"].keys()
print(f"entries held by both rules: {len(shared)}")

for name, table in tables.items():
    print(f"analysis {name}: counted {table.get('analysis', 0)} times")`,
              `on spaces: 47 entries, 63 pieces
on word boundaries: 47 entries, 69 pieces
entries held by both rules: 35
analysis on spaces: counted 2 times
analysis on word boundaries: counted 4 times`,
              { hints: ["Corpus.of takes the list of sentences, and word_counts takes the rule and answers one count per distinct entry, each carrying word and count.", "The sum of the counts is the number of pieces the six sentences produced in all, and the number of counts is the number of distinct entries.", "Turning each rule’s counts into a dictionary from word to count makes the shared entries the intersection of the two key sets, and a word’s count a lookup."], check: numberCheck("How many times is analysis counted as an entry under the word boundary rules?", 4, 0.0, "The six sentences use the word four times, twice bare and twice inside re-analysis. The boundary rules split the hyphenated compound, so all four reach one entry, while this rule counts two for the bare word and keeps the other two apart as re-analysis and re-analysis., the one entry section 12 names as a word the list already holds wearing a full stop. That is section 8’s two rows, each learned from a share of the occurrences the word actually had.") },
            ),
          ],
        },
      ]}
    />
  );
}
