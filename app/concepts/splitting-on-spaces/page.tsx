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
import { MangledWritingPanel } from "@/components/widgets/MangledWritingPanel";
import { SpaceSplitExplorer } from "@/components/widgets/SpaceSplitExplorer";
import { SpanRepairPanel } from "@/components/widgets/SpanRepairPanel";
import { SplitCostPanel } from "@/components/widgets/SplitCostPanel";
import { WhitespaceKindsTable } from "@/components/widgets/WhitespaceKindsTable";

export const metadata: Metadata = pageMetadata("/concepts/splitting-on-spaces", {
  title: "Splitting on Spaces · Perceptron Lab",
  description:
    "Splitting text at spaces gives a simple rule for identifying pieces. Punctuation and repeated whitespace expose its limits, as do writing systems that do not use spaces to mark word boundaries.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SplittingOnSpacesPage() {
  return (
    <ConceptPage
      lessonId="splitting-on-spaces"
      intuition={lessonIntuitions["splitting-on-spaces"]}
      technicalStart="Part 2. A Piece, and the Place It Came From"
      openingTitle="The Simplest Word Rule Already Makes a Choice"
      playgroundTitle="What counts as a piece when spaces are the rule?"
      playgroundIntro="Inspect the extracted pieces and their source spans. Try punctuation beside a word and repeated whitespace, then compare the pieces with the original text."
      title="Splitting on Spaces"
      tagline={"Splitting text at spaces gives a simple rule for identifying pieces. Punctuation and repeated whitespace expose its limits, as do writing systems that do not use spaces to mark word boundaries."}
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
                  We will keep the same sentence visible as the rules change. Its abbreviation and contraction give us concrete decisions to inspect, while the hyphenated expressions let us see whether a rule preserves a whole written form or separates it into smaller pieces.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  The program receives 51 characters. Spaces and punctuation give us possible clues, but we still need a rule that decides which characters belong together. If we want word counts or vocabulary lookups, those decisions will affect every result that follows. Let&apos;s begin with the simplest rule we can inspect: split at white space.
                </p>
                <>
<p>
                  Finding word boundaries and choosing a model&apos;s token vocabulary are related decisions, but they need not have the same answer. A representation might use words, word parts or bytes. Here we will first inspect the boundaries supplied by whitespace. Later lessons will examine how a vocabulary represents the resulting text, including unfamiliar pieces.
                </p>
                <p>
                  This page is entirely about the first, and the rule it describes is the shortest of the answers these pages cover, which is why it comes before the rest of them.
                </p>
</>
                <KeepInMind>
                  {"Spaces are useful clues to boundaries, but they do not define every word for every task. This rule makes one explicit choice: return each uninterrupted run of non-whitespace characters. We can then compare that choice with alternatives."}
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
                  {"A text alternates between whitespace and non-whitespace stretches. This rule returns the non-whitespace stretches with their positions. Given the original length, those positions identify where gaps occurred; the returned strings alone do not preserve the gap lengths or characters."}
                </p>
                  <p>
                    It never asks how many spaces there were, only whether the character it is looking at is one, and section 7 is where the consequence of never asking turns up.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"The rule depends on the text and Python’s definition of whitespace. It has no abbreviation or punctuation exceptions. Later rules inspect additional character properties or language conventions, so we can see what changes those choices introduce."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Separate the Alvarez sentence wherever spaces occur" id="3-the-running-sentence-cut">
                <p>
                  The whitespace rule returns seven pieces. Compare them with the original sentence in the playground. In particular, look at what happens to the abbreviation, contraction and hyphenated forms. Those examples will help us decide what this rule has and has not resolved.
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
                    rode along on the last piece. The rule applied no separate punctuation or contraction exception. The rule saw a run of characters that were not
                    white space in each case. Each of those four places is one
                    that a later rule on these pages treats differently, and
                    section 12 counts what the difference comes to over six
                    sentences.
                  </p>
                </WorkedExample>
                <p>
                  {"The seven pieces contain 45 of the sentence’s 51 characters, or 88.2 percent. The six excluded characters are spaces. In general, this rule excludes exactly the characters classified as whitespace, which can also include tabs and line breaks."}
                </p>
                <KeepInMind>
                  Seven pieces, 45 of 51 characters kept, and the four hardest
                  things in the sentence all handled by doing nothing to them.
                  Whether doing nothing was right is the subject of Part 3.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What counts as a space, which is more than the space bar">
                <p>
                  Whitespace includes more than the character produced by the space bar. A no-break space or an ideographic space can also separate text, so a rule restricted to the ordinary space would behave differently. The panel places ten candidate characters between a and b to show which ones this implementation treats as a separator. This makes its actual coverage visible rather than inferring it from the rule&apos;s name.
                </p>
                <WhitespaceKindsTable />
                <p>Seven probes separate the two letters. The hyphen-minus, zero width space and soft hyphen stay inside one piece. Python’s whitespace test does not classify those three as separators, regardless of their names or their effect on line layout.</p>
<p>The zero width space can mark a line-breaking opportunity without splitting this tokenizer’s run. A soft hyphen behaves similarly here. The code-point test, rather than a visual gap or a character’s name, determines this rule’s output.</p>
                <KeepInMind>
                  {"The exact whitespace definition matters. A character can affect line layout without ending a run under this rule. When a piece is unexpectedly joined, inspect its code points and the separator test rather than relying on visible gaps or names."}
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
                  {"A half-open span includes its start and excludes its end. Its length is the difference between the offsets; an empty span has equal offsets. Adjacent spans can share the same boundary number. Python slicing uses this convention, so a span can be applied directly to the original string."}
                </p>
                <p>
                  {"Offsets let us highlight the original text and compare where two rules placed their boundaries. Searching for the returned string can be ambiguous when it occurs more than once, and rewriting can make it differ from the source. For unspaced text, the offsets also show which internal boundaries a segmentation method chose."}
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
                  pieces. On the sentence about Dr. Alvarez the answer is 45 characters of
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
                    ["the sentence about Dr. Alvarez", "51", "7", "45"],
                    ["the same sentence, spaced differently", "52", "7", "45"],
                    ["nine characters of Chinese", "9", "1", "9"],
                    ["three spaces", "3", "0", "0"],
                  ]}
                  caption="The second row is the sentence about Dr. Alvarez with one doubled space and one line break, which is section 7, and the third and fourth are section 16 and section 17 arriving early."
                />
                <>
<p>
                  {"Coverage records how many source characters occur inside returned spans. It does not judge whether the chosen boundaries suit the task. This sentence has 88.2 percent coverage because six spaces are excluded. The shown Chinese line has full coverage because it contains no whitespace. Neither result is a language-wide rate."}
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
                  {"Split the text, join the pieces and compare with the source. A conventional join inserts one ordinary space between pieces. That is a policy, not the only possible one, and the strings alone cannot determine which original separators to restore."}
                </p>
                <SpanRepairPanel />
                <>
<p>
                  On the sentence about Dr. Alvarez a single space is right in all six places, so the sentence comes back exactly and the rule looks lossless. On the same sentence with one doubled space and one line break it is right in four places out of six, and the text that comes back is the first one, which is not the text that went in.
                </p>
                <p>
                  {"Both inputs produce identical piece strings. A model receiving only those strings or their token IDs cannot uniquely determine which spacing pattern was supplied. Keeping separate provenance changes what information is available."}
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
                  {"A single-space join reproduces inputs whose separators were exactly one ordinary space and which had no discarded leading or trailing whitespace. Its success on one sentence does not make the splitting rule lossless on other inputs."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A rule that cut at each space and kept whatever fell between two cuts would agree with this one on the sentence about Dr. Alvarez and part company with it wherever two spaces meet.",
              true,
              "Splitting at each literal space can produce an empty string between adjacent spaces. This tokenizer instead finds complete non-whitespace runs and omits the separators, so it returns no empty piece for that gap. The two methods agree on the singly spaced sentence but differ on repeated spaces; tabs and line breaks also separate runs here.",
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
              "Seven of the ten end a word and three do not. The hyphen is expected there, since a hyphen is visibly a mark rather than a gap, and the other two are the surprise, because the rule asks whether a character is white space and never what it is called. The no-break space and the ideographic space are white space by that test, which is why recognizing the whole family rather than the space alone is a real piece of correctness.",
            ),
            trueFalse(
              "Cutting the sentence about Dr. Alvarez and gluing the pieces straight back with a single space between each pair returns it exactly, so the rule is lossless.",
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
              "The start offset is included and the end offset is excluded, matching Python’s slicing convention. Their difference gives the span length, adjacent spans can meet at the same boundary, and an empty span uses equal offsets. The offsets locate source positions; they do not by themselves preserve omitted separators or undo rewritten text.",
            ),
        ],
        },
        {
          title: "Part 3. The Kinds of Writing It Mangles",
          content: (
            <>
              <SubSection title="8. Punctuation rides on the word in front of it">
                <p>
                  {"Punctuation is not whitespace. A period, comma, quotation mark or bracket therefore stays in the same run as adjacent letters. The first rows below show the resulting pieces. Separating those marks is useful for some vocabulary and word-count tasks, so later rules make that choice explicit."}
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
                  When cat and cat, become different vocabulary entries, the model receives separate IDs and learns separate rows for them. Their evidence is divided between those entries rather than pooled automatically. A model may still learn a relationship from context, so separate IDs do not make that relationship impossible. The six-sentence example shows the bookkeeping consequence of leaving punctuation attached; it does not measure the effect on a trained model.
                </p>
                </InAModel>
                <KeepInMind>
                  {"This rule leaves punctuation attached wherever it occurs within a non-whitespace run. Other rules can separate or retain marks according to a different convention. Compare both their output boundaries and the source characters they preserve."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The stop that ends an abbreviation looks like the stop that ends a sentence">
                <p>

                  The fourth row above is the same behavior and a much harder
                  problem. <span className="font-mono">Dr.</span> ends in a full
                  stop that belongs to the word, so keeping it is correct, and{" "}
                  <span className="font-mono">re-analysis.</span> ends in a full
                  stop that belongs to the sentence, so keeping it is wrong. The
                  rule does the same thing to both, and it does the same thing
                  for the same reason.
                </p>
                <p>
                  {"Seven of the 47 vocabulary entries end in a period: one is an abbreviation and six occur at sentence ends. A whitespace-only test does not inspect that distinction. Other methods use character context, abbreviation conventions or learned examples; an explicit language-specific list is one approach, not the only one."}
                </p>
                <WhyThisWorks title="Why this case has no clean answer at all">
                  <>
<p>
                  {"At the end of an English sentence, one period can mark both an abbreviation and the sentence boundary. A nonoverlapping token split must choose where to attach that character. Separate sentence-boundary metadata can record its second role without duplicating or discarding it."}
                </p>
                  <p>
                  {"Token boundaries and sentence boundaries answer different questions. Keep both annotations when the application needs both, rather than expecting one division into pieces to express every role."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"A whitespace-only rule treats all seven period-ending pieces alike. To distinguish abbreviation use from sentence-ending use, add evidence or annotations beyond the whitespace test. A period can have both roles in the same location."}
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
                  the sentence about Dr. Alvarez to that second rule and it comes back as
                  nine pieces rather than seven, with{" "}
                  <span className="font-mono">low</span> and{" "}
                  <span className="font-mono">cost</span> separate and{" "}
                  <span className="font-mono">re</span> and{" "}
                  <span className="font-mono">analysis</span> separate. Whether
                  seven or nine is right is a question about what a word is, and
                  section 15 is where that question is faced rather than answered.
                </p>
                <KeepInMind>
                  {"Leaving apostrophes and hyphens inside pieces is a clear convention. It may suit one task and conflict with another task’s annotation rules. Whitespace splitting cannot make finer choices without additional logic."}
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
                  {"The Chinese line has full character coverage and an exact round trip. Those measures show that the source was retained, but they do not show that the line was divided into the words a reader expects. The whitespace rule returns one piece because it has no internal separator to use."}
                </p>
                <KeepInMind>
                  {"On this unspaced line, full coverage and exact reconstruction coexist with an inadequate word split. Evaluate boundaries against the intended word task as well as checking what text survived."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What the mangling costs, counted">
                <p>
                  {"The corpus contains six sentences and 375 characters. Comparing whitespace splitting with Unicode word boundaries shows how often their choices differ in this sample. The playground lists both outputs so the count can be checked against the pieces themselves."}
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
                  {"Both rules produce 47 distinct entries here, although only 35 entries are shared. Equal vocabulary sizes therefore do not imply identical pieces. Inspect the actual entries alongside their count."}
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
                  Despite these limitations, whitespace splitting can be a useful first step when the input and task suit it. Some of the subword implementations in these lessons use it to restrict where pieces are learned. The following comparison explains the practical properties we gain from such a small rule.
                </p>
                <>
<p>
                  {"Whitespace splitting needs no fitting corpus or per-instance settings. Under the same implementation and Unicode whitespace definition, the same text produces the same runs. That makes it an easy baseline to reproduce. It does not guarantee those runs match the words a particular task expects."}
                </p>
                <p>
                  {"Each returned piece is exactly its source slice because this rule does not rewrite its contents. The spans locate those slices. Exact recovery of discarded whitespace still requires the original source or an additional separator record."}
                </p>
</>
                <InAModel>
                  <p>
                  {"Some learned subword implementations use this rule first because it supplies simple, reproducible spans without fitting another model. Other pipelines use different preprocessing or deliberate randomization. Keep that preprocessing choice fixed or recorded when comparing fitted vocabularies."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The rule needs no fitted vocabulary or exception list and preserves every non-whitespace character inside its pieces. A later rule can change coverage by excluding standalone punctuation even if it never rewrites a returned piece. Distinguish missing source characters from rewritten ones."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Where it beats the rule that repairs it">
                <p>
                  {"Unicode word boundaries give 69 pieces on these six sentences, compared with 63 from whitespace splitting. That means more positions for a model consuming the pieces individually. The runtime effect depends on what the model does with them. Separating punctuation or compounds can still be worthwhile for the task."}
                </p>
                <>
<p>
                  The sharper difference is what happens to the characters. On the sentence about Dr. Alvarez the boundary rules keep 41 of the 51 characters, against 45 here. The ten they leave behind are the six spaces and, unlike this rule, both hyphens and both full stops, since a mark that is not part of a word is not returned as one.
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
          title: "Part 5. Text Whose Words Are Not Separated by Spaces", id: "part-5-where-the-rule-stops-being-defined",
          content: (
            <>
              <SubSection title="15. A word is a convention, and this rule commits to one of them">
                <p>
                  {"A boundary choice needs a target convention. A dictionary headword, search term and annotated grammar token can divide the same writing differently. Once a task states its convention, we can test whether a rule follows it."}
                </p>
                <p>
                  {"For a form such as low-cost, a dictionary may retain one entry while a search application also indexes cost separately. A layout system may need the hyphen as a break opportunity. Those are different requirements. The counts above show that two tokenization conventions can overlap on many entries and still disagree on others."}
                </p>
                <p>Whitespace splitting treats each uninterrupted run of non-whitespace characters as a piece. That convention is easy to inspect directly in the writing. It does not decide whether punctuation belongs to a word, or whether a language’s words require boundaries absent from the text. Those are the reasons for comparing other rules.</p>
                <KeepInMind>
                  {"Judge the rule against its stated purpose. Whitespace splitting follows its run definition exactly, while a word-segmentation task may require additional boundaries inside those runs. State the convention so the comparison is meaningful."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Whitespace is a property of a writing system, not of language">
                <p>
                  {"Many writing systems do not routinely place spaces at every word boundary. Chinese and Japanese text, and writing in languages such as Thai or Khmer, need other cues for word segmentation. Spaces may still appear for different purposes. A rule based only on whitespace cannot recover boundaries that the spacing does not mark."}
                </p>
                <p>
                  {"On a text with no whitespace, this rule has a fully determined answer: one maximal run. That may retain the text exactly while failing a caller’s request for word boundaries. Other applications may intentionally want the uninterrupted run, so usefulness depends on the requested operation."}
                </p>
                <p>

                  A whitespace-only rule has no additional clue for dividing a run with no useful spaces. The following methods supply other evidence, including dictionary entries and boundaries learned from labeled text. They change what the decision is based on, rather than repairing the missing evidence by applying the same split again.
                </p>
                <KeepInMind>
                  {"A long run can be one word or contain several words with no spaces between them. The whitespace test alone cannot distinguish those cases. If the application needs that distinction, use additional language or task evidence rather than treating successful splitting as proof of correct word segmentation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Every failure it has is silent">
                <p>
                  {"For every string, the rule returns the runs matching its definition, including an empty list when none exist. It does not emit a warning when those runs differ from the caller’s intended words. The table shows cases the surrounding application may need to handle."}
                </p>
                <DerivationTable
                  expressionHeading="Text or separator condition"
                  reasonHeading="What a whitespace split preserves"
                  rows={[
                    {
                      expression: "a text of nothing but spaces",
                      reason:
                        "The result is an empty list because there is no non-whitespace run. This is a successful result under the rule. A caller requiring at least one piece must check that separate condition.",
                    },
                    {
                      expression: "a text with no spaces in it",
                      reason:
                        "The result is one piece covering the full text. The nine-character Chinese example is retained exactly, but the rule supplies no internal word boundaries. Whether that is useful depends on the task.",
                    },
                    {
                      expression: "where a word begins inside a run",
                      reason:
                        "outside what the rule can say. It asks one question of one character at a time, whether that character is white space, so nothing about which characters are letters, or which language they belong to, can enter the answer at all.",
                    },
                    {
                      expression: "a mark of punctuation touching a word",
                      reason:
                        "Punctuation stays inside a run. Nine of the 47 entries carry a mark. Separate vocabulary entries can divide occurrence evidence, though a model may learn relationships between them. The compared word-only rule drops punctuation, leaves 10 of 51 source characters outside pieces, and produces 69 rather than 63 pieces across the six sentences.",
                    },
                    {
                      expression: "a full stop that ends an abbreviation",
                      reason:
                        "The whitespace test does not identify the period’s role. Character context, known abbreviations or a learned model can provide evidence. A separate sentence-boundary annotation can record a period that also belongs to an abbreviation.",
                    },
                    {
                      expression: "a hyphen joining two words",
                      reason:
                        "The text records a hyphen; the desired treatment depends on the task. A dictionary, search index or annotated corpus may adopt different conventions. Once the target convention is stated, test whether the rule follows it.",
                    },
                    {
                      expression: "the glue that puts the pieces back",
                      reason:
                        "The splitter does not define a join operation. Single-space joining is one policy, while exact restoration needs retained separators or the source plus spans. Positions alone do not reveal whether a discarded separator was a tab, line break or space.",
                    },
                    {
                      expression: "a character named for a space",
                      reason:
                        "decided by what the character is rather than what it is called. One of the ten probed here has the word space in its name and ends no word, and a soft hyphen, whose whole job is to offer a break, ends none either, so a piece can come back joined at a character nobody can see.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"A successful split confirms the whitespace rule ran; it does not confirm that its pieces match the intended words. Check that task separately, especially for unspaced text. Returned spans and a retained source make the rule’s behavior easy to inspect."}
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
              "The Chinese probe has no characters this rule recognizes as whitespace, so it becomes one piece covering the whole string and can be joined back exactly. Those measurements check coverage and reconstruction, not whether useful word boundaries were found. A perfect result on both therefore does not establish that the rule suits the intended segmentation task.",
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
              "Seven of the 47 entries end in a period: one abbreviation and six sentence endings. Does this whitespace rule distinguish their roles?",
              [
                "No. This rule tests whitespace and does not classify a period’s linguistic role.",
                "The abbreviation keeps its period while sentence endings lose theirs.",
                "The abbreviation is the only one of the seven that also carries a hyphen",
                "The sentence ends are the ones followed by white space",
              ],
              0,
              "It does not inspect the period’s role. The mark stays attached to whichever non-whitespace run contains it. Distinguishing an abbreviation from a sentence ending needs additional linguistic rules or context; an abbreviation list is one possible approach, rather than a requirement of every method.",
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
              "The rule needs no fitted corpus and does not rewrite the characters inside a run. Its output is repeatable for the same input, which is useful when later methods count those pieces. It still assumes whitespace boundaries are useful for the task. A gap-free sentence receives one piece without an error, so the caller must evaluate whether that result is appropriate.",
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
              "Cut the sentence about Dr. Alvarez and read the spans",
              [
  "Split the supplied Dr. Alvarez sentence with WhitespacePreTokenizer. Print every piece beside its zero-based, half-open start/end span.",
  "Print the piece count, total source characters covered by the spans out of the sentence length, and covered percentage to one decimal place.",
  "A span covers one non-whitespace run. This measurement tells us which source positions reached a piece; it does not decide whether attached punctuation is a useful part of a token."
],
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
              {
question: "What do the spans reveal about what whitespace splitting keeps?",
 hints: [
  "split returns iterable pieces with text, start and end.",
  "The length of a half-open span is end - start. Add those lengths before taking the percentage."
], check: numberCheck("What percentage of the sentence’s characters lies inside a piece, to one decimal place?", 88.2, 0.05, "The pieces cover 88.2 percent of this sentence. The uncovered positions are the spaces between its seven non-whitespace runs.") },
            ),
            exercise(
              "Put ten characters between two letters",
              [
  "For each of the ten supplied code points, build a probe containing a, that character and b. Split it with WhitespacePreTokenizer.",
  "Print the code point in four-digit uppercase hexadecimal, its supplied label and the piece count. Finish with the number of probes split into more than one piece.",
  "Build invisible characters with chr(code). Their names alone do not determine whether Python’s whitespace test recognizes them."
],
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
              {
question: "Does every character called a space separate this tokenizer’s pieces?",
 hints: [
  "Construct one three-character probe per code point.",
  "n_words > 1 detects separation here. Keep the code-point label beside each result so invisible separators are not confused."
], check: numberCheck("How many of the ten characters end a word?", 7, 0.0, "Seven of the ten separate the letters. The zero width space and soft hyphen remain within a run under this whitespace rule, despite what their names might suggest.") },
            ),
            exercise(
              "Glue the pieces with spaces, then rebuild them from the spans",
              [
  "Split the supplied respaced Dr. Alvarez sentence. Reconstruct it once by joining token spellings with one space and once by placing pieces back with the original source gaps identified by their spans.",
  "Print the piece count, whether the simple join is exact, how many inter-piece gaps are exactly one ordinary space, and whether the span-and-source reconstruction is exact.",
  "The second procedure still has the original source available. Spans locate its gaps but do not themselves store what characters those gaps contained."
],
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
              {
question: "Are token spellings alone enough to restore doubled spaces and line breaks?",
 hints: [
  "The simple reconstruction is \" \".join(words.texts).",
  "Between adjacent pieces, the original gap is source[left.end:right.start]. Compare that string with \" \".",
  "For the second reconstruction retain source text before, between and after pieces using their offsets, rather than guessing a separator."
], check: numberCheck("How many of the six gaps between the pieces are a single space?", 4, 0.0, "Four gaps are ordinary single spaces. The other two explain the failed simple join. Exact reconstruction here relies on reading the original gaps from the retained source.") },
            ),
            exercise(
              "Count the table over the six sentences",
              [
  "Count the supplied six-sentence notebook with whitespace splitting and Unicode word-boundary splitting. Print distinct entries and total pieces for both, then their shared distinct-entry count.",
  "Print the count of the exact entry analysis under each rule. The boundary rule can expose analysis inside a hyphenated compound, while whitespace splitting retains the compound spelling.",
  "Keep entry counts distinct from a claim about word meaning. Splitting a compound is an operational convention, not proof that every component has the same use."
],
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
              {
question: "How can two equal-sized vocabularies count a word differently?",
 hints: [
  "Convert each word_counts result into a word-to-count mapping.",
  "Intersect the key sets to count shared spellings, then look up analysis in each mapping."
], check: numberCheck("How many times is analysis counted as an entry under the word boundary rules?", 4, 0.0, "The boundary rule counts analysis four times in this notebook. Its cuts expose the component inside the two re-analysis occurrences, which whitespace splitting keeps in compound entries.") },
            ),
          ],
        },
      ]}
    />
  );
}
