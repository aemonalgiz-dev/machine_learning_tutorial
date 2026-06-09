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
import { MangledWritingPanel } from "@/components/widgets/MangledWritingPanel";
import { SpaceSplitExplorer } from "@/components/widgets/SpaceSplitExplorer";
import { SpanRepairPanel } from "@/components/widgets/SpanRepairPanel";
import { SplitCostPanel } from "@/components/widgets/SplitCostPanel";
import { WhitespaceKindsTable } from "@/components/widgets/WhitespaceKindsTable";

export const metadata: Metadata = {
  title: "Splitting on Spaces · oop_ml",
  description:
    "Every run of characters that is not white space is a word. The whole rule in one sentence, what it gets right, and the kinds of writing it mangles.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SplittingOnSpacesPage() {
  return (
    <ConceptPage
      title="Splitting on Spaces"
      tagline="Every run of characters that is not white space is one word, and that is the whole rule."
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
      history={
        <>
          <p>
            The space between words is an invention with a date and a place, and
            for most of the history of alphabetic writing it was not there.
            Greek and Latin were written in <em>scriptio continua</em>, letters
            running on with no gaps at all, and a reader recovered the words by
            sounding the text out. Paul Saenger, in{" "}
            <em>Space Between Words: The Origins of Silent Reading</em>{" "}
            (Stanford, 1997), traces systematic word separation to Irish and
            Anglo-Saxon scribes copying Latin in the seventh and eighth
            centuries, who were reading a language they did not speak and so
            could not lean on its sound to find the joints. They put the gaps in
            to make the parsing easier. A rule that cuts at spaces is therefore
            reading a piece of typography a scribe added, and it works on this
            page&rsquo;s sentence only because somebody in the intervening
            twelve hundred years kept the habit.
          </p>
          <p>
            The rule reached computing as a utility rather than as a proposal.
            The Unix word counter has counted whitespace-delimited words since
            the early 1970s, and the definition later written into the POSIX
            standard is a non-empty run of characters delimited by white space,
            which is this rule exactly. The interesting moment came in June 1986,
            when Jon Bentley&rsquo;s Programming Pearls column in{" "}
            <em>Communications of the ACM</em> set Donald Knuth the problem of
            printing the most common words in a file with their counts. Knuth
            answered with a long literate program built around a purpose-made
            data structure, and Doug McIlroy, reviewing it, replied with a
            six-command shell pipeline. The lesson everyone took away was about
            program length. The part that matters here is that McIlroy&rsquo;s
            first command had to say where the words were before anything could
            be counted, and it chose a different rule from the word
            counter&rsquo;s, cutting at every run of characters that were not
            letters rather than at white space. So the two shortest published
            answers to one counting problem, by people who agreed about
            everything else in it, would already have cut{" "}
            <span className="font-mono">didn&rsquo;t</span> in different places.
          </p>
          <p>
            Counting needs the same decision. Henry Kučera and Nelson Francis
            assembled the Brown corpus at Brown University in 1967 so
            that frequencies could be taken from American prose, and a frequency
            is a count of something, so a definition of a word had to be settled
            before the first number existed. Thirty years on, the rule had not
            gone away. When Rico Sennrich, Barry Haddow and Alexandra Birch
            published &ldquo;Neural Machine Translation of Rare Words with
            Subword Units&rdquo; at Edinburgh in 2016 and made whole words stop
            being the unit, their learner still read its corpus as
            whitespace-separated words and cut those into pieces. The method
            that replaced this one is built on top of it.
          </p>
          <p>
            The page answers five questions in order. What is the rule, and what
            counts as a space? What does a piece carry besides its letters, and
            why does that matter to everything downstream? Which kinds of writing
            does the rule mangle, and what does each mangling cost? What does it
            get right that the rules repairing it give up? And where does the
            rule stop being defined, so that the answer it gives is a choice
            somebody made rather than a fact about the text?
          </p>
        </>
      }
      playground={<SpaceSplitExplorer />}
      sections={[
        {
          title: "Part 1. The Rule, and Why It Comes First",
          defaultOpen: true,
          content: (
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
                <p>
                  It is worth separating that question from the one it is usually
                  confused with. Deciding where the words are is a claim about
                  the writing system, since English puts gaps between its words
                  and Chinese does not. Deciding what a model&rsquo;s units are
                  is a claim about a corpus, since a vocabulary of forty thousand
                  entries has to spell every text it will ever meet out of pieces
                  it has already seen. This page is entirely about the first, and
                  the rule it describes is the shortest of the answers these
                  pages cover, which is why it comes before the rest of them.
                </p>
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
                  <p>
                    Every character of a text is either white space or it is not,
                    so the text is a sequence of stretches of one kind alternating
                    with stretches of the other. Naming the runs of one kind names
                    the runs of the other kind by omission, and the two
                    descriptions carry the same information. That is why the rule
                    needs no notion of a separator at all. It never asks how many
                    spaces there were, only whether the character it is looking at
                    is one, and section 7 is where the consequence of never asking
                    turns up.
                  </p>
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
          ),
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
                <p>
                  The share kept has to be read carefully, since it says how
                  much of the writing was spacing and says nothing about whether
                  the answer was any good. It is 88.2 per cent on this sentence
                  because English spends roughly a seventh of its characters on
                  spaces, and it is exactly one on the Chinese line because that
                  script spends none, which is section 11. The fourth row is the
                  reverse case, a text where the rule keeps none of the writing
                  at all and is entirely correct to, since three spaces hold no
                  run of anything else.
                </p>
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
                <p>
                  On the running sentence a single space is right in all six
                  places, so the sentence comes back exactly and the rule looks
                  lossless. On the same sentence with one doubled space and one
                  line break it is right in four places out of six, and the text
                  that comes back is the first one, which is not the text that
                  went in. Both texts give the identical seven pieces, so nothing
                  a model reads could tell them apart, and no amount of training
                  recovers the difference, since it was thrown away before the
                  model was reached.
                </p>
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
                  <p>
                    Consider a sentence ending in an abbreviation, which in
                    English is written with one full stop rather than two. That
                    single character is doing both jobs at once, closing the
                    abbreviation and closing the sentence, so there is no
                    division of the text that assigns it correctly to one and not
                    the other. A rule can keep it, and lose the sentence
                    boundary, or cut it away, and lose the abbreviation. Neither
                    answer is a repair, and any rule that claims to have solved
                    this has chosen one of the two losses and not said so.
                  </p>
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
                <p>
                  It reads no corpus, so there is no fitting step and no data to
                  gather, and the answer it gives today is the answer it gave
                  last year. It has no settings, so two people applying it to one
                  sentence get the same seven pieces and cannot have configured
                  it differently. It carries no list of exceptions, so it cannot
                  be out of date, and it makes no claim about any particular
                  language, so it cannot be wrong about a language it has never
                  seen in the way that a list of English abbreviations is wrong
                  about German. And it never rewrites a character, so every piece
                  is exactly the slice of the source its span names, and the
                  writing can be recovered from the pieces and their offsets.
                </p>
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
                <p>
                  The sharper difference is what happens to the characters. On
                  the running sentence the boundary rules keep 41 of the 51
                  characters, against 45 here. The ten they leave behind are the
                  six spaces and, unlike this rule, both hyphens and both full
                  stops, since a mark that is not part of a word is not returned
                  as one. Gluing their nine pieces back with single spaces gives
                  a line with the abbreviation&rsquo;s stop gone, the compound
                  split in two and the sentence&rsquo;s own full stop missing, so
                  the loss is not confined to the spacing the way it is here.
                </p>
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
      ]}
    />
  );
}
