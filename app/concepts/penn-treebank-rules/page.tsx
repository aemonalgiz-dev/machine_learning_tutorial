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
import { ContractionTable } from "@/components/widgets/ContractionTable";
import { FullStopPanel } from "@/components/widgets/FullStopPanel";
import { RewritingCensus } from "@/components/widgets/RewritingCensus";
import { TreebankCostPanel } from "@/components/widgets/TreebankCostPanel";
import { TreebankPlayground } from "@/components/widgets/TreebankPlayground";

export const metadata: Metadata = {
  title: "Penn Treebank Rules · Perceptron Lab",
  description:
    "Penn Treebank tokenization applies consistent rules to English contractions and punctuation. Those conventions let text be divided into pieces that match the assumptions used in annotated datasets.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PennTreebankRulesPage() {
  return (
    <ConceptPage
      lessonId="penn-treebank-rules"
      intuition={lessonIntuitions["penn-treebank-rules"]}
      technicalStart="Part 2. The Contraction, Cut Where the Grammar Wants It"
      openingTitle="A Written Word Can Contain More Than One Grammatical Piece"
      playgroundTitle="Separate contractions and punctuation with explicit rules"
      playgroundIntro="Compare contractions and punctuation before and after tokenization. Check both the output spelling and the span pointing back into the source."
      title="Penn Treebank Rules"
      tagline={"Penn Treebank tokenization applies consistent rules to English contractions and punctuation. Those conventions let text be divided into pieces that match the assumptions used in annotated datasets."}
      prerequisites={
        <>
          The{" "}
          <Link href="/concepts/splitting-on-spaces" className={link}>
            splitting on spaces
          </Link>{" "}
          page, which introduces the sentence and the six-sentence notebook all
          three of these pages count over, and the{" "}
          <Link href="/concepts/unicode-word-boundaries" className={link}>
            Unicode word boundaries
          </Link>{" "}
          page, which is a second answer to the same question and is the rule
          this one is measured against throughout. Nothing else. There is no
          model here and nothing is fitted, so no corpus is needed to make the
          rules work, only to count what they do.
        </>
      }

      playground={<TreebankPlayground />}
      sections={[
        {
          title: "Part 1. Rules Written for an Annotator",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The pieces had to be the pieces a grammar talks about">
                <p>
                  Spaces help us separate ordinary word-like units, and Unicode boundary rules describe breaks between character classes. An English grammar annotator needs a more specific decision: which units should receive separate grammatical labels?
                </p>
                <p>
                  The answer can differ from a whitespace split. A contraction can have a verb part and a negative part even though the writer placed no space between them. That is the reason for examining the Penn Treebank conventions next.
                </p>
                <p>
                  Now imagine annotating an English sentence with parts of speech and grammatical structure. What should count as one unit for that work? Some contractions need to be separated even though they contain no space. The Penn Treebank conventions answer that annotation question. Let&apos;s apply them to our familiar sentence and inspect the resulting units.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  Read it as an annotator. The stop after{" "}
                  <span className="font-mono">Dr</span>  belongs to the
                  abbreviation and is part of the word being labeled, while the
                  stop at the end belongs to the sentence and is a separate thing
                  that has its own tag. And{" "}
                  <span className="font-mono">didn&apos;t</span> has to be two
                  rows under these conventions. That gives the verb and the
                  negation separate part-of-speech tags, meaning grammatical
                  labels for the roles those units play. It lets an annotator
                  describe the verb and the negative element independently.
                  Other annotation schemes could make a different choice; the
                  spaces alone do not decide which convention we should use.
                </p>
                <KeepInMind>
                  These rules were asked which units the annotation would have a
                  row for, which is a narrower question than where the words are
                  and has an answer only once the language and the grammar being
                  used to describe it are fixed. Every clause below follows from
                  it.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Follow each contraction and punctuation cut in the Alvarez sentence" id="2-the-running-sentence-cut-with-every-span">
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
                      "did            [12, 15)\n" +
                      "n't            [15, 18)\n" +
                      "expect         [19, 25)\n" +
                      "the            [26, 29)\n" +
                      "low-cost       [30, 38)\n" +
                      "re-analysis    [39, 50)\n" +
                      ".              [50, 51)"}
                  </Equation>
                  <p>
                    Four things happened. The contraction was cut into two, at a
                    position where there is no space and no mark either. The
                    final stop came off and became a piece of its own. The stop
                    after <span className="font-mono">Dr</span> did not, so the
                    abbreviation survived whole. And both hyphenated compounds
                    were left exactly as they were written.
                  </p>
                </WorkedExample>
                <p>For each span, slicing the original sentence between its recorded positions returns the displayed piece exactly. Part 4 introduces quote normalization, where a returned piece can differ from the source characters at its span. Positions can still locate the source, but reconstructing the original text then requires retaining the normalization information.</p>
                <KeepInMind>
                  {"The result contains nine pieces whose source spans cover 45 of 51 characters. The excluded six characters are spaces. This retains every non-whitespace source character in the running example, but the piece strings alone do not preserve its layout."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The same sentence under the two rules it is measured against">
                <p>
                  The three rules give 7, 9 and 9 pieces on that sentence, and
                  the two nines are not the same nine. Reading them together is
                  the quickest way to see what each rule thinks a word is.
                </p>
                <NumberTable
                  headings={["rule", "pieces", "what it did to the sentence"]}
                  rows={[
                    [
                      "every run of spaces",
                      "7",
                      "kept every mark attached to the word beside it",
                    ],
                    [
                      "every boundary the standard finds",
                      "9",
                      "dropped both stops, split both compounds, kept the contraction",
                    ],
                    [
                      "the treebank rules",
                      "9",
                      "kept both compounds and the abbreviation, split the contraction, kept the final stop as a piece",
                    ],
                  ]}
                  caption="Three answers to one sentence. The middle and the last agree on the count and share only three of the nine pieces, which are Alvarez, expect and the."
                />
                <p>
                  These conventions differ in both directions. Unicode word-only boundaries split <span className="font-mono">low-cost</span>, while this Treebank convention keeps it whole. The Treebank rule splits <span className="font-mono">didn&apos;t</span> before the negative ending; the Unicode rule keeps the apostrophe context joined. These choices match different definitions of the units the next stage expects.
                </p>
                <KeepInMind>
                  Both a hyphen and an apostrophe stand between two letters, and
                  the two rules disagree about each of them in opposite
                  directions. What settles either question is a claim about
                  English grammar, which is why the writing on its own cannot
                  decide it and why the sentence comes back as nine pieces twice
                  over with only three of them the same.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. What the rules read, and what they do not">
                <p>
                  This implementation scans each non-space run using the rules below. We will follow which test applies at each position, since the order and the exception lists determine the output.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what is consulted to answer it"
                  rows={[
                    {
                      expression: "is this character a piece on its own",
                      reason:
                        "a fixed set of characters and two-character runs, plus the position of the character after it for a comma and a colon, plus the position of the end of the text for a full stop.",
                    },
                    {
                      expression: "does this run end in a clitic",
                      reason:
                        "a list of eight endings, tried against the last few characters, in either case.",
                    },
                    {
                      expression: "is this run one of the fixed forms",
                      reason:
                        "a list of ten whole words, each with a place inside it where the cut goes.",
                    },
                  ]}
                />
                <p>
                  {"The rule uses fixed lists and nearby character tests rather than fitted parameters or word frequencies. This scanner walks the text, then checks suffixes and fixed-form patterns. The work also depends on the lengths of the runs it scans; it is not one fixed-cost action for an arbitrarily long run."}
                </p>
                <KeepInMind>

                  This implementation combines two small word lists with rules that inspect nearby characters. One list contains eight endings and the other ten whole forms. There are no fitted parameters to load. Its behavior comes from those written rules, which also means that an unhandled form needs a new rule or a different method.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Contraction, Cut Where the Grammar Wants It",
          content: (
            <>
              <SubSection title="5. One word on the page, two words in the syntax">
                <p>
                  This is the clause that has no equivalent in either earlier
                  rule, and it is the one that most clearly comes from the
                  annotation rather than from the writing. There is no space
                  inside <span className="font-mono">didn&apos;t</span> and no
                  mark that either earlier rule treats as a separator, and the
                  rules cut it anyway, into{" "}
                  <span className="font-mono">did</span> and{" "}
                  <span className="font-mono">n&apos;t</span>.
                </p>
                <p>

                  The reason is that an annotator labeling that sentence has to
                  write down two facts, that there is a past tense auxiliary verb
                  and that it is negated. Those are two tags, so they need two
                  rows. The negation is written{" "}
                  <span className="font-mono">n&apos;t</span> and it is one
                  morpheme, so the cut goes in front of the n rather than in
                  front of the apostrophe, and the same treatment covers eight
                  endings in all.
                </p>
                <WorkedExample title="The eight endings, and what a host keeps">
                  <Equation>
                    {"It's        ->  It    's\n" +
                      "they're     ->  they  're\n" +
                      "we've       ->  we    've\n" +
                      "I'll        ->  I     'll\n" +
                      "he'd        ->  he    'd\n" +
                      "I'm         ->  I     'm\n" +
                      "isn't       ->  is    n't\n" +
                      "the dogs'   ->  the   dogs   '"}
                  </Equation>
                  <p>
                    The last row is the possessive, where the apostrophe has
                    nothing after it and still comes off, because a possessive
                    marker is its own thing to a grammar whether or not an s
                    follows it. What all eight share is that the ending is taken
                    only when something is left in front of it, so a text that is
                    nothing but <span className="font-mono">&apos;s</span> comes
                    back as one piece.
                  </p>
                </WorkedExample>
                <p>
                  Over the six sentences this section shares, exactly one piece
                  comes from this clause, since the notebook holds one
                  contraction. Over the wider corpus further down the page, 26 of
                  its 266 pieces are one of these endings or one half of a fixed
                  form, which is an upper bound rather than a count, because four
                  of the spellings a fixed form produces are ordinary English
                  words that also turn up on their own.
                </p>
                <KeepInMind>
                  The cut goes where the grammar wants a row, which is a
                  different place from where the writing offers a seam, and every
                  odd-looking answer in the next section comes from that
                  difference.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The hosts English spells irregularly">
                <p>Keeping <span className="font-mono">n&apos;t</span> as the negation piece leaves the ordinary verb spelling in many contractions. In <span className="font-mono">can&apos;t</span>, <span className="font-mono">won&apos;t</span> and <span className="font-mono">shan&apos;t</span>, it instead leaves <span className="font-mono">ca</span>, <span className="font-mono">wo</span> and <span className="font-mono">sha</span>. Those are literal remaining spans rather than normalized full verb forms.</p>
                <Equation>
                  {"did  n't        the host is a word\n" +
                    "is   n't        the host is a word\n" +
                    "ca   n't        the host is what remains of can\n" +
                    "wo   n't        the host is what remains of will\n" +
                    "sha  n't        the host is what remains of shall"}
                </Equation>
                <p>These contractions do not divide into literal, nonoverlapping pieces spelling both full verb and negation. The Treebank convention keeps <span className="font-mono">n&apos;t</span> fixed and assigns the remaining letters to the host. That is why <span className="font-mono">can&apos;t</span> becomes <span className="font-mono">ca</span> and <span className="font-mono">n&apos;t</span>.</p>
                <WhyThisWorks title="Why the alternative is worse than it sounds">
                  <p>Returning <span className="font-mono">can</span> instead of <span className="font-mono">ca</span> would normalize the host spelling rather than simply cut it. A token could still carry an offset to the original span, as the quote-rewriting example already does.</p>
<p>Exact recovery would then need enough information to reverse that normalization. A lookup table could record word-specific choices; a rule or model could also supply them. The important distinction is between locating the source and claiming the token text is an unchanged source slice.</p>
                </WhyThisWorks>
                <KeepInMind>
                  {"In these three contractions, the remaining hosts are ca, wo and sha. This convention preserves their literal spans while keeping the negative ending spelled the same way. It is not a claim that these are the only nonword forms English can produce."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The fixed list, and the forms that are not on it">
                <p>
                  The form <span className="font-mono">cannot</span> has no punctuation cue at its internal token boundary. This implementation names ten fixed forms and records their cuts. Other character-based rules or learned models could recognize such patterns too; whitespace alone does not find this one.
                </p>
                <ContractionTable />
                <p>
                  The first nine rows are the rules working. The last six are the
                  ones to read carefully, because in every one of them the answer
                  is a single piece and nothing anywhere reports that a list was
                  consulted and came up empty. The same apostrophe that gets{" "}
                  <span className="font-mono">didn&apos;t</span> cut in two
                  leaves <span className="font-mono">y&apos;all</span> whole,
                  and the curved apostrophe that a word processor inserts by
                  default leaves the very same contraction whole as well.
                </p>
                <InAModel>
                  <p>
                    The displayed French article example, <span className="font-mono">l&apos;analyse</span>, needs a different clitic convention from the English ending in <span className="font-mono">it&apos;s</span>. The listed suffix rule does not separate the prefixed article. French and Italian also have other clitic patterns; this English-oriented list is not a general account of either language. A returned piece list does not identify the language or certify that its linguistic units are suitable.
                  </p>
                </InAModel>
                <KeepInMind>
                  The clause is ten named forms and eight endings, reached
                  through a single apostrophe out of the several a keyboard can
                  produce. Anything outside that comes back whole, and a piece
                  that was never examined and a piece that was examined and left
                  alone are the same answer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Punctuation, Taken Off the Word It Touches",
          content: (
            <>
              <SubSection title="8. Every mark becomes a piece of its own">
                <p>
                  The failure that the splitting on spaces page measures is that
                  a mark of punctuation is not white space, so a run of non-space
                  characters carries it along and{" "}
                  <span className="font-mono">away.</span> becomes a different
                  entry from <span className="font-mono">away</span>. These rules
                  repair it the direct way, by naming the characters that are a
                  piece on their own wherever they stand.
                </p>
                <Equation>
                  {"; @ # $ % & ? !        a piece on its own, always\n" +
                    "( ) [ ] { } < >        a piece on its own, always\n" +
                    "\" and a pair of '      a piece on its own, and rewritten\n" +
                    "-- and ...             a piece on its own, taken whole\n" +
                    ", and :                a piece on its own, unless a digit follows\n" +
                    ".                      a piece on its own, only at the end"}
                </Equation>
                <p>
                  Characters in the first two listed sets are separated regardless of their surroundings. Thus <span className="font-mono">a@b.com</span> and <span className="font-mono">AT&amp;T</span> each become three pieces. The split follows the convention; whether an application wants the address or company name preserved is a separate requirement.
                </p>
                <KeepInMind>
                  Separating a mark from the word beside it is the whole of the
                  repair, and it is done by naming characters rather than by
                  asking what they are doing. Section 20 measures where that
                  costs more than it buys.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Except when a digit follows it">
                <p>
                  A comma and a colon are the two marks that do a second job
                  inside a number, and the rules keep them there with a condition
                  a single character wide. A comma is separated unless the very
                  next character is a digit.
                </p>
                <Equation>
                  {"1,000     ->  1,000        a digit follows the comma\n" +
                    "3:30      ->  3:30         a digit follows the colon\n" +
                    "yes, no   ->  yes  ,  no   a space follows the comma\n" +
                    "note: yes ->  note : yes   a space follows the colon"}
                </Equation>
                <p>
                  It is a cheap rule and it is not the rule anybody would write
                  from the definition. What a person means is that the comma is
                  inside a number, and what the rules test is that a digit comes
                  next, which is neither necessary nor sufficient in general. It
                  happens to be right on every number in the corpus below, and it
                  is right for the reason that English writes thousands groups
                  with no space around the comma.
                </p>
                <p>

                  The same shape of condition, one character of context, is what
                  the boundary rules use for their own version of this case,
                  though they reach it from the other side by putting the comma
                  in a class that joins two digits. Two different methods arrive
                  at the same behavior on{" "}
                  <span className="font-mono">1,000</span>, and they disagree on{" "}
                  <span className="font-mono">3:30</span>, which these rules keep
                  whole and the standard cuts into two.
                </p>
                <KeepInMind>
                  {"The rule uses the following digit as a short test for retaining a comma or colon. It agrees with the shown numeric examples. That agreement does not guarantee that it identifies every number or punctuation role correctly."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The full stop, and the sentence the rules assume they were handed">
                <p>
                  In <span className="font-mono">Dr.</span>, this annotation convention retains the period with the abbreviation. A sentence-ending period is a separate token in the running example. The character alone does not state its role, so the rule needs context or a convention for making that distinction.
                </p>
                <p>
                  {"The final-period rule is designed for sentence-separated input. It separates the last eligible period and leaves other periods attached. An internal period might belong to an abbreviation, decimal, identifier or an earlier sentence; the rule does not determine which role it has."}
                </p>
                <Equation>
                  {"the last character of the text,\n" +
                    "ignoring trailing spaces, closing brackets and closing quotes,\n" +
                    "and not itself preceded by another stop\n" +
                    "        is  a piece of its own\n" +
                    "every other stop  stays where it is"}
                </Equation>
                <p>
                  {"The assumption works for both periods in the Dr. Alvarez example. It does not prove that every one-sentence input will be handled as desired. The following probes show what happens when an earlier sentence end or a sentence-final abbreviation needs different treatment."}
                </p>
                <KeepInMind>
                  {"The rule uses position as a cue. Sentence-separated input fits its intended use, while abbreviation endings and multiple sentences expose choices it cannot resolve on that cue alone."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What happens when the text is more than one sentence">
                <p>
                  The first failure is the one anybody meets on their first
                  paragraph. Give the rules two sentences in one string and the
                  first sentence&rsquo;s stop is not the last character of the
                  text, so it is read as an abbreviation&rsquo;s and stays
                  attached.
                </p>
                <FullStopPanel />
                <p>
                  The measurement underneath the probes is the useful one. Our
                  six sentences give 72 pieces when they arrive one at a time and
                  67 when they arrive joined, and the five pieces that went
                  missing are five full stops that stayed stuck to the word in
                  front of them. Six stops came back on their own in the first
                  case and one in the second, and the corpus grew five entries
                  that are a word with a stop on it, including{" "}
                  <span className="font-mono">re-analysis.</span> sitting beside
                  the <span className="font-mono">re-analysis</span> that is
                  already there.
                </p>
                <p>
                  Notice which of the six pieces in the amber list is legitimate.
                  Only <span className="font-mono">Dr.</span> is an abbreviation;
                  the other five are sentences whose own punctuation was
                  swallowed. The rules cannot tell the difference and neither can
                  their output, since the two cases produce the same shape of
                  piece.
                </p>
                <KeepInMind>
                  {"Separate sentence inputs give 72 pieces; their joined text gives 67. Five sentence-ending periods stay attached in the joined case. If those boundaries matter to the application, preserve or determine them before applying this sentence-oriented rule."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The abbreviation that ends a sentence">
                <p>
                  {"At a sentence-final abbreviation, the last period has two roles. This rule separates it as a punctuation token, so the abbreviation token no longer contains it. That is the chosen token convention; separate annotations can retain both roles."}
                </p>
                <WorkedExample title="One character, two jobs, and no division that gives it to both">
                  <Equation>
                    {"She consulted Dr.\n" +
                      "        ->  She    consulted    Dr    .\n\n" +
                      "The analysis was run by Alvarez et al.\n" +
                      "        ->  The  analysis  was  run  by  Alvarez  et  al  ."}
                  </Equation>
                  <p>
                    Both come back with the abbreviation stripped, so{" "}
                    <span className="font-mono">Dr</span> here and{" "}
                    <span className="font-mono">Dr.</span> in the running
                    sentence are two different entries in any table built over
                    the two, for a difference in the writing that a reader would
                    not call a difference at all.
                  </p>
                </WorkedExample>
                <p>
                  {"An abbreviation list can help recognize the form, but token attachment and sentence annotation remain separate choices. One period can be a separate token, belong to an abbreviation token, and still carry a sentence-end annotation in another layer. The output format determines how those facts are represented."}
                </p>
                <KeepInMind>
                  {"The final-period heuristic has limitations on both joined sentences and sentence-final abbreviations. A tailored boundary procedure and explicit annotation policy can address them. The source character itself need not be lost."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "These rules split didn't before the n rather than at its straight apostrophe. Why there?",
              [
                "Under this annotation convention, n't is a separate negation unit, so its piece starts before n.",
                "Because an apostrophe is punctuation and always comes off as a piece of its own",
                "Because the apostrophe stands between two letters and is therefore glue",
                "Because the verb did happens to be three characters long",
              ],
              0,
              "The Treebank convention gives the auxiliary and negation separate annotation units. It treats n't as the negation piece, leaving did as the host. A Unicode word-boundary rule instead keeps this contraction together. These are different segmentation conventions for different tasks, not competing claims that the apostrophe has one universal boundary.",
            ),
            trueFalse(
              "The rules cut can't into ca and n't. The host ca is the literal source span left by keeping n't as the negation piece, rather than a replacement spelling read from a dictionary.",
              true,
              "The contraction cannot be divided into literal, nonoverlapping source slices spelling both can and n't. This rule keeps n't fixed and returns ca for the remaining span. Returning can would be a normalization rather than a literal cut. An offset could still point to its source, as rewritten quotation marks do elsewhere, but recovering the original would require enough information to reverse that rewrite.",
            ),
            choice(
              "The six sentences are handed to the rules joined into one string rather than one at a time. What happens?",
              [
                "72 pieces become 67, because five full stops stay attached to the word in front of them",
                "Nothing changes, since the rules work one run of non-space characters at a time",
                "72 pieces become 77, because the joins create new boundaries",
                "The rules refuse the input, because they state that the text must be one sentence",
              ],
              0,
              "This rule detaches a period at the end of its sentence-sized input. Earlier periods in a joined paragraph can remain attached; the tokenizer has not inferred that they are abbreviations. Splitting the notebook sentence by sentence yields six detached periods, while the joined input yields one. Sentence-boundary detection is a separate preceding step.",
            ),
            several(
              "Which of these follow from the table naming the characters that are a piece on their own?",
              [
                "a@b.com comes back as three pieces",
                "AT&T comes back as three pieces",
                "3:30 is cut in two, as the boundary rules cut it",
                "The comma in 1,000 is separated, since a comma is one of the marks the table names",
              ],
              [0, 1],
              "Some punctuation is separated unconditionally; comma and colon use a local next-character condition. That preserves the displayed numeric groups but can also keep punctuation in contexts that are not numbers. The rule is an operational approximation tailored to a corpus convention, not a guarantee of correct linguistic analysis on every newspaper sentence.",
            ),
            trueFalse(
              "A list of abbreviations would repair both of the full stop failures.",
              false,
              "An abbreviation list can help identify a familiar abbreviation, but it does not by itself resolve every sentence boundary. At a sentence-final abbreviation, one period can have both roles. A tokenizer returning nonoverlapping literal pieces cannot give that one source character to two different pieces without changing its output policy.",
            ),
        ],
        },
        {
          title: "Part 4. A Piece That Is Not the Text It Came From",
          content: (
            <>
              <SubSection title="13. The quotation mark, rewritten into two characters">
                <p>
                  Here the rule changes the text representation as well as separating a token. It replaces a quotation mark with another spelling. That means reconstruction needs to account for rewriting, not only for where boundaries were inserted.
                </p>
                <Equation>
                  {"an opening \"    becomes  two backquotes\n" +
                    "a closing \"    becomes  two apostrophes"}
                </Equation>
                <p>
                  The purpose is to record a distinction the writing was already
                  making and the character was not. A reader of{" "}
                  <span className="font-mono">
                    she said &ldquo;wait&rdquo;
                  </span>{" "}
                  can see which mark opens and which closes; the plain typewriter
                  quotation mark is the same character both times, so a parser
                  reading the corpus would have to work it out again. The rules
                  work it out once, from whether the mark begins the text or
                  follows a space or an opening bracket, and write the answer
                  into the piece.
                </p>
                <p>
                  {"Treebank-style output uses two backquotes for an opening quote and two apostrophes for a closing quote. These ASCII spellings make direction explicit in the token strings. A consumer expecting the original quotation character must account for that rewriting."}
                </p>
                <KeepInMind>
                  A decision the writing left implicit is made explicit and
                  written down, which is exactly what annotation is for. The cost
                  is that the piece is now an assertion about the text rather than
                  a copy of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The bracket, and the file format that forced it">
                <p>
                  There is a second rewriting, switched off by default and on in
                  the treebank itself, and its reason is worth telling because it
                  is not linguistic at all. A parsed sentence in the corpus is
                  written as a tree, and a tree is written with round brackets
                  around each group. A round bracket that is part of the sentence
                  therefore cannot be left as a round bracket, or anything reading
                  the file cannot tell the two apart.
                </p>
                <NumberTable
                  headings={["in the writing", "in the corpus", "the span it keeps"]}
                  rows={[
                    ["(", "-LRB-", "one character"],
                    [")", "-RRB-", "one character"],
                    ["[", "-LSB-", "one character"],
                    ["]", "-RSB-", "one character"],
                    ["{", "-LCB-", "one character"],
                    ["}", "-RCB-", "one character"],
                    ["< and >", "unchanged", "one character"],
                  ]}
                  caption="The optional mapping names six round, square and curly bracket characters. The two angle brackets stay unchanged."
                />
                <p>
                  {"The optional mapping names round, square and curly brackets. Angle brackets remain unchanged in this implementation. These are representation conventions for the corpus format, rather than a claim that six kinds are grammatical words or that every bracket must be rewritten."}
                </p>
                <KeepInMind>
                  {"The bracket names separate corpus representation from source spelling. Turning the option on changes token strings and keeps the source spans. Turning it off leaves the separated bracket characters unchanged."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The span still names one character">
                <p>
                  Both rewritings raise the same question, which is what a piece
                  is now supposed to be. A piece has two halves, the text it holds
                  and the stretch of source it came from, and until this point
                  those two have agreed. They no longer do, and the pieces keep
                  both rather than choosing.
                </p>
                <RewritingCensus />
                <p>

                  Read the third line of the two amber boxes. Each of them holds
                  two characters and points at a stretch of the sentence that is
                  one character wide, so the length of a piece and the length of
                  what it stands for have come apart. The span says where the
                  piece came from, and the text says what it became, and a rule
                  that normalizes anything at all has to be allowed to say two
                  different things there.
                </p>
                <WhyThisWorks title="Why the published form cannot say this at all">
                  <>
<p>
                  {"A substitution pipeline that only returns its final strings does not automatically retain source offsets. Replacing one quote with two characters also shifts later positions in the rewritten string. An implementation can track those transformations or scan the source while emitting pieces, as this SDK does."}
                </p>
                  <p>
                  {"Source highlighting and alignment need that provenance. Searching for each output string can fail when it was rewritten or appears more than once. Tracking the source span during tokenization avoids relying on that search."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"A piece can contain an analysis spelling alongside its original source span. Reconstruction must then account for both omitted whitespace and rewritten characters. Their causes and remedies are different."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Counting the rewriting over a corpus">
                <p>
                  In the selected 22-sentence panel, 14 of the 266 pieces differ from the source text covered by their spans. The sentences were chosen to exercise the rules, so this is an inspectable example count rather than an estimate of how often ordinary English text is rewritten. Each difference matters if another stage assumes that a token is an unchanged slice of its source.
                </p>
                <NumberTable
                  headings={["over 22 sentences", "count", "share of 266 pieces"]}
                  rows={[
                    ["pieces that are not their source", "14", "5.3%"],
                    ["the same, with the bracket spellings on", "22", "8.3%"],
                    ["pieces holding no letter and no digit", "86", "32.3%"],
                  ]}
                  caption="Every one of the 14 is a quotation mark, seven opening and seven closing, and the corpus closes every quotation it opens."
                />
                <p>
                  {"Fourteen rewritten pieces are about five percent of this selected panel. A downstream stage that assumes unchanged source slices will mishandle those cases. The normalized pieces can still be searched by their output spellings, while a query for the original straight quotation character needs the mapping or source."}
                </p>
                <KeepInMind>
                  {"The panel has 14 rewritten pieces out of 266, or 22 with bracket naming enabled. The count tells us how many instances need that mapping here; it is not a benchmark of reconstruction cost or a reason to ignore the changed spelling."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What It Costs",
          content: (
            <>
              <SubSection title="17. More pieces than either rule it is measured against">
                <p>
                  {"These rules return more pieces than either comparison rule on both supplied corpora. A consumer processing one position per piece receives a longer sequence. Dense attention compares position pairs within a sequence, but its cost is only one part of a model’s runtime."}
                </p>
                <TreebankCostPanel />
                <p>
                  {"The six-sentence notebook gives 72 Treebank pieces, 63 whitespace pieces and 69 word-only Unicode pieces. The wider panel gives 266, 155 and 159. It contains 22 selected sentences exercising quotations, money, percentages, brackets and other rules. Its roughly 72 percent length increase is a property of that test panel, not an estimate for ordinary newspaper prose."}
                </p>
                <InAModel>
                  <p>
                  The observed sequence is 72 per cent longer for this corpus under these rules. That changes how many units a later stage initially receives. A subsequent subword procedure may split those units further, depending on its vocabulary and allowed boundaries; we cannot assume that the same percentage describes its final sequence or the model&apos;s performance.
                </p>
                </InAModel>
                <KeepInMind>
                  {"The selected 22 sentences yield 266 pieces rather than 155. Separate punctuation accounts for many of the returned pieces. It can let a lexical form use the same entry across punctuation contexts, though other distinctions such as capitalization can still create separate entries."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. A third of the pieces hold no letter and no digit">
                <p>
                  Reading that difference by what the extra pieces are made of
                  shows where it went. Of the 266 pieces from those 22
                  sentences, 86 hold no letter and no digit anywhere in them, so
                  roughly one piece in three is a mark of punctuation standing on
                  its own.
                </p>
                <p>
                  Whether separate punctuation tokens help depends on the task. Treebank annotation needs a place to attach punctuation&apos;s grammatical label. A fixed-width word-context window then includes those punctuation positions too, reducing how many surrounding words it reaches. Punctuation can still carry useful information; we should test the convention against the intended task.
                </p>
                <p>
                  {"At most 26 of the 266 returned pieces have spellings associated with the contraction and clitic clauses. Some spellings also occur independently, so this is an upper-bound census rather than an exact count of rule applications. The total output exceeds whitespace splitting by 111 pieces. Neither the 26-form count nor the 86 punctuation count directly measures how many extra pieces each rule added; some corresponding text was already a whitespace piece."}
                </p>
                <KeepInMind>
                  {"There are 86 punctuation-only pieces and at most 26 pieces matching the selected contraction or clitic spellings in this panel. Those describe the output composition. To attribute the extra sequence length to individual rules, compare their actual before-and-after splits."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Nothing is dropped, which the boundary rules cannot say">
                <p>
                  There is one column of that table where these rules are ahead
                  and it is easy to miss, because the number is identical to the
                  space rule&rsquo;s. Over the six sentences the treebank rules
                  and the space rule both keep 318 of the 375 characters, and the
                  boundary rules keep 303.
                </p>
                <NumberTable
                  headings={[
                    "measured over the six sentences",
                    "the treebank rules",
                    "at every run of spaces",
                    "at every boundary",
                  ]}
                  rows={[
                    ["characters inside a piece, of 375", "318", "318", "303"],
                    ["share of the writing kept", "84.8%", "84.8%", "80.8%"],
                    ["characters that are not spacing", "318", "318", "318"],
                  ]}
                  caption="The first and third rows agree for two of the three rules, which is the whole claim. What is missing from all three is the spacing."
                />
                <p>
                  {"The spans cover all 318 non-whitespace characters in the six-sentence notebook. The word-only Unicode filter covers 303 because it omits some punctuation segments. This is a difference in source coverage, not a guarantee of exact detokenization: whitespace and any rewriting still need their own records."}
                </p>
                <KeepInMind>
                  {"In this notebook, the Treebank spans cover everything except whitespace. Other examples rewrite quotes, and the bracket option can rewrite bracket tokens. Keep source coverage and output spelling as separate checks."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Where the cruder rule is the better one">
                <p>
                  Pointed at writing that is not newspaper prose, these rules come
                  apart in ways that splitting on spaces does not, and the panel
                  in the playground has the cases. An address is separated at the
                  character that makes it an address, so{" "}
                  <span className="font-mono">a@b.com</span> becomes three pieces
                  where the space rule gives one. A company name written with an
                  ampersand becomes three. A percentage becomes two.
                </p>
                <p>
                  {"The same punctuation characters can participate in an address, company name or numeric expression inside prose. A rule can correctly apply its listed split while giving an application units it does not want. The application must decide whether these spans should stay whole."}
                </p>
                <p>
                  The file name <span className="font-mono">re-analysis_2019.csv</span> remains whole here and becomes three pieces under the word-only Unicode rule. The difference follows from the hyphen and period handling. Which result fits depends on whether the application wants the full identifier or searchable components.
                </p>
                <KeepInMind>
                  {"The examples compare different requirements: preserving an address, a file name or separate annotation tokens. Protecting selected spans or using a tailored tokenizer are possible responses. No single output convention is best for every identifier task."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Rules Stop Being Defined",
          content: (
            <>
              <SubSection title="21. A definition of a word in one corpus">
                <p>
                  {"The convention was chosen for a particular annotated corpus and language. Its clauses still produce defined outputs on other text. The separate question is whether those outputs supply the units another application needs."}
                </p>
                <p>
                  This Treebank convention retains <span className="font-mono">low-cost</span> as one token, while the Unicode word-only result splits it. The annotation scheme determines which units receive tags. Another task can adopt different units and test its tokenizer against that stated convention.
                </p>
                <p>
                  {"Compatible tokenization helps a model receive the kinds of units its training pipeline used. Record the rule and options alongside that model. Agreement is useful, but it does not remove the need to check that the chosen convention suits the application."}
                </p>
                <KeepInMind>
                  There is no fact of the matter about{" "}
                  <span className="font-mono">low-cost</span>, for which the treebank supplies a particular convention. These rules implement that convention; they do not settle every possible interpretation of the text.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The list is finite, and the silence is the failure">
                <p>
                  {"The scanner includes ten fixed forms and eight endings. These handle the named cases, not every contraction or clitic in English. Their spellings are part of the contract, including the distinction between a straight and a curved apostrophe."}
                </p>
                <p>
                  {"A matched form is split according to the list; an unhandled form may remain whole. The returned list does not include a diagnostic explaining which tests were tried. In the probe panel, six of fifteen forms remain outside the intended cuts. Inspecting those outputs or adding validation can expose the coverage gap."}
                </p>
                <p>
                  {"Adding an entry repairs that entry’s case, but does not establish coverage of all future text. A learned model can infer other boundaries, while also making mistakes of its own. Tests, explicit domain limits and diagnostics are other ways to manage the list’s coverage."}
                </p>
                <KeepInMind>
                  {"The finite list handles its named forms. An unchanged output is not proof that a form was linguistically checked and approved. Make that coverage limit clear to callers."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. One era's typing, and one language's apostrophe">
                <p>
                  {"Several clauses depend on the input punctuation spelling. Straight apostrophes, curly apostrophes and directional quotation marks can all occur in text, so compatibility needs to be tested on the actual input rather than inferred from its date."}
                </p>
                <>
<p>
                  {"This rule recognizes the straight apostrophe in its listed clitics. Typing the same contraction with a curved apostrophe can leave it whole. Its quote rewriting likewise handles specified characters, rather than every directional quotation mark. Test the actual code points when preparing compatible input."}
                </p>
                <p>
                  {"The final-period rule also expects sentence-oriented input. A pipeline can supply that deliberately; an arbitrary input string may contain several sentences. The tokenizer does not detect or validate that distinction for the caller."}
                </p>
</>
                <p>
                  {"The reference substitution pipeline and this source-preserving scanner express the rules differently. Unusual runs such as doubled commas or backquotes need explicit comparison tests if exact compatibility matters. A deterministic pipeline has a definite result under its engine and order; a reimplementation should not assume every edge case matches automatically."}
                </p>
                <KeepInMind>
                  {"If incoming text uses punctuation these rules do not handle, choose a policy: normalize with a retained source mapping, add handling, or use another tokenizer. Normalization is a preprocessing choice with its own reconstruction consequences."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The pieces alone cannot be pasted back into the source">
                <p>
                  Rewriting a quotation mark changes the relationship between a piece and the original text. A token can now be an analysis form rather than an unchanged source substring. That is useful for a consistent annotation convention, but an application returning the original writing must keep enough additional information to recover the transformation.
                </p>
                <Equation>
                  {"the pieces joined with one space each\n" +
                    "        ``  Dr.  Alvarez  did  n't  ...  ,  ''  she  wrote  .\n\n" +
                    "the source\n" +
                    "        \"Dr. Alvarez didn't expect the low-cost re-analysis,\" she wrote."}
                </Equation>
                <p>
                  Spacing and rewritten quotation marks create different reconstruction questions. Detokenization rules can propose conventional spacing, but that does not establish the original layout. Normalized quotation pieces can also correspond to different source characters. Keeping the original text with the spans preserves both distinctions; the token strings alone do not guarantee an exact round trip.
                </p>
                <p>
                  Later schemes make different choices about this trade-off. Some retain separators in the piece sequence; others rely on the original text or a record of transformations. Calling a scheme reversible requires stating which input distinctions it preserves, rather than assuming that a plausible reconstructed sentence is the exact original.
                </p>
                <KeepInMind>
                  {"Compare each piece’s text with the source slice named by its span to detect rewriting. If the application must reproduce the original, retain the source or enough separators and transformation records. A plausible detokenized sentence is not proof of an exact round trip."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Which punctuation decisions belong to the annotation convention?" id="25-what-is-left-undecided-gathered">
                <p>These cuts reproduce an annotation convention. When another application wants contractions or punctuation grouped differently, the disagreement belongs to the convention rather than to a numerical fitting error.</p>
                <DerivationTable
                  expressionHeading="Punctuation or annotation choice"
                  reasonHeading="How the convention treats it"
                  rows={[
                    {
                      expression: "a full stop ending an abbreviation",
                      reason:
                        "The final-period rule separates a sentence-final abbreviation’s period. An abbreviation list could support another convention, while a separate sentence annotation can retain its second role. This implementation uses position rather than such an annotation.",
                    },
                    {
                      expression: "where the sentences are",
                      reason:
                        "Sentence boundaries are not found by this tokenizer. The six sentences yield 72 pieces separately and 67 joined, with five earlier periods remaining attached. Sentence-separated input suits the heuristic, but does not guarantee every final abbreviation is treated as desired.",
                    },
                    {
                      expression: "a hyphen joining two words",
                      reason:
                        "not settled by the writing. These rules keep the compound whole and the standard's rules cut it, and what chose between them was a decision about how many tags a compound modifier gets. Over six sentences that single choice puts three entries in one rule's table that the other does not hold, and four in the other's.",
                    },
                    {
                      expression: "a contraction nobody listed",
                      reason:
                        "An unhandled form may remain whole, with no rule-coverage diagnostic in the returned pieces. Ten fixed forms and eight endings are listed, and six of fifteen probes fall outside the intended cuts. Extending the list fixes particular cases without proving coverage of every future input.",
                    },
                    {
                      expression: "a language other than English",
                      reason:
                        "outside what the clauses can express, rather than handled badly. The clitic clause reads endings and French and Italian attach theirs at the front, so those come back whole, and nothing in the rules knows which language it is reading or reports that the question came up.",
                    },
                    {
                      expression: "which apostrophe and which quotation mark",
                      reason:
                        "fixed to the characters a keyboard produced in the late nineteen eighties. Any normalizing of the modern curved marks happens before the rules and is not part of them, and two callers who normalize differently get different pieces from the same writing.",
                    },
                    {
                      expression: "a piece that is not its source",
                      reason:
                        "A piece may use a normalized spelling while its span still locates the source. Of 266 pieces in the selected 22 sentences, 14 are rewritten quotes. Enabling bracket naming raises the total to 22, including bracket rewrites.",
                    },
                    {
                      expression: "putting the text back together",
                      reason:
                        "impossible from the pieces alone, and exact from the pieces, their spans and the original. The spacing is gone as it is under every rule here, and a rewritten mark is gone in a stronger sense, since two apostrophes in the output may have been a quotation mark or may have been two apostrophes.",
                    },
                    {
                      expression: "writing that is not prose",
                      reason:
                        "outside what the rules were written for. An address is cut at the character that makes it an address and a percentage becomes two pieces, while a file name that the standard's rules cut into three survives whole here. The decision that has to be made is whether such spans are protected before any rule sees them.",
                    },
                    {
                      expression: "a case the published rules never anticipated",
                      reason:
                        "The substitution pipeline has an output determined by its order, patterns and engine. A source-preserving reimplementation may differ on unusual runs, so compare those cases when exact compatibility is required.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Check the convention against the text being processed and the units the next stage expects. Returned pieces may be normalized analysis forms, so keep their source relationship explicit when display or reconstruction matters."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "Why is an opening quotation mark in treebank text two backquotes and a closing one two apostrophes?",
              [
                "To record whether the mark opens or closes, which the plain typewriter character does not say",
                "Because the storage format reserved the quotation mark for its own use",
                "Because the corpus was typed on machines that had no quotation mark at all",
                "To keep every piece exactly one character wide",
              ],
              0,
              "The Treebank convention writes opening and closing quotes differently even when the source used the same straight quotation-mark character. These rules infer a role from local context and emit the corresponding two-character spelling. That records a formatting decision in the token text, so spelling and original source slice need not match.",
            ),
            trueFalse(
              "The bracket rewriting gives a name to all eight brackets.",
              false,
              "This implementation offers named replacements for round, square and curly brackets, leaving angle brackets unchanged. Parenthesis-based tree storage gives a reason to distinguish text brackets from structural notation. The exact replacement set is still a corpus/API convention; it is not a claim that other bracket characters never occur in source text.",
            ),
            several(
              "These rules give 266 pieces on the 22 sentences where splitting on spaces gives 155. Which of these does the page measure over those 266 pieces?",
              [
                "86 of them hold no letter and no digit anywhere in them",
                "At most 26 of them come from the contraction and clitic clauses",
                "Most of the extra length comes from separating the marks",
                "14 of them are not the slice their span covers, and every one of the 14 is a quotation mark",
                "The contraction clause is the largest single contributor, because it carries the most linguistics",
              ],
              [0, 1, 2, 3],
              "Roughly one piece in three is a mark of punctuation standing on its own, which is 86 against at most 26 from the clause that looks most like a claim about language, so the clause responsible for most of the 111 extra pieces is the one that separates the marks, and the contraction clause being the largest contributor is the reading the measurement refuses. The 14 rewritten pieces are seven opening and seven closing quotation marks, 22 once the bracket spellings are switched on, and the small share says how much work reassembling the text is rather than whether it can be skipped.",
            ),
            trueFalse(
              "Over the six sentences these rules keep 318 of the 375 characters, which is every character that is not a space.",
              true,
              "The space rule keeps the same 318 and the boundary rules keep 303, because they found the marks correctly and then discarded them as not being words. Here a hyphen, a comma and a full stop all survive as pieces, so what a caller has is a division of the writing rather than a selection from it, and the two rewritten quotation marks are the only characters that come back as something else.",
            ),
            several(
              "Which of these does Part 6 say about where the rules stop being defined?",
              [
                "They are exact only relative to the linguistic analysis the treebank used, since nothing in the writing decides whether low-cost is one unit or two",
                "A form that is not on the list comes back whole, which is the same answer a form examined and left alone gives",
                "The same contraction typed with the curved apostrophe a word processor inserts is cut exactly as the straight one is",
                "The original text can be pasted back together from the pieces alone, since every piece carries its span",
              ],
              [0, 1],
              "These rules implement a particular annotation convention. A probe left whole may match a keep rule or may simply have no splitting rule, as with several supplied contractions and the curved apostrophe. Token spellings alone also omit source spacing and can be ambiguous after quote rewriting. Spans identify locations; retaining the original source supplies the omitted and rewritten characters for exact reconstruction.",
            ),
        ],
        },
        {
          title: "Practice. Putting the Rules to the Running Sentence",
          practice: [
            exercise(
              "Cut the sentence about Dr. Alvarez, and check that every span is honest",
              [
  "Split the supplied bare and quoted Dr. Alvarez sentences with PennTreebankPreTokenizer. Print every bare-sentence piece beside its half-open span and corresponding source slice.",
  "Count pieces in each result. In the quoted result, print pieces whose spelling differs from their source slice and count those rewrites. Use the default bracket setting.",
  "A span identifies where a piece came from. A rule may still rewrite its spelling, as the quotation-mark convention demonstrates."
],
              `from oop_ml import PennTreebankPreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
quoted = '"Dr. Alvarez didn\\'t expect the low-cost re-analysis," she wrote.'
rules = PennTreebankPreTokenizer()

# Split the sentence and print each piece with its span and the slice of the
# sentence between the two offsets, then the number of pieces. Then split
# the quoted sentence, print each piece whose text is not its slice, and
# print how many pieces there are and how many of them were rewritten.`,
              `from oop_ml import PennTreebankPreTokenizer

sentence = "Dr. Alvarez didn't expect the low-cost re-analysis."
quoted = '"Dr. Alvarez didn\\'t expect the low-cost re-analysis," she wrote.'
rules = PennTreebankPreTokenizer()

words = rules.split(sentence)
for word in words:
    print(f"[{word.start:2d}, {word.end:2d})  {word.text:12s}  slice {sentence[word.start:word.end]}")
print(f"{words.n_words} pieces, every one its own slice")

rewritten = 0
quoted_words = rules.split(quoted)
for word in quoted_words:
    source = quoted[word.start:word.end]
    if source != word.text:
        rewritten += 1
        print(f"[{word.start:2d}, {word.end:2d})  {word.text}  stands for  {source}")
print(f"{quoted_words.n_words} pieces in the quoted sentence, {rewritten} of them rewritten")`,
              `[ 0,  3)  Dr.           slice Dr.
[ 4, 11)  Alvarez       slice Alvarez
[12, 15)  did           slice did
[15, 18)  n't           slice n't
[19, 25)  expect        slice expect
[26, 29)  the           slice the
[30, 38)  low-cost      slice low-cost
[39, 50)  re-analysis   slice re-analysis
[50, 51)  .             slice .
9 pieces, every one its own slice
[ 0,  1)  \`\`  stands for  "
[52, 53)  ''  stands for  "
14 pieces in the quoted sentence, 2 of them rewritten`,
              {
question: "Does a token’s spelling always equal the source slice its span identifies?",
 hints: [
  "For each piece compare piece.text with source[piece.start:piece.end].",
  "The rewritten opening and closing quote spellings each contain two characters while pointing to one source character. Count rewritten pieces separately from their lengths."
], check: numberCheck("How many pieces does the quoted sentence give?", 14, 0.0, "The quoted sentence produces fourteen pieces, including two rewritten quotation marks. Their spans remain source locations even though the token spellings differ.") },
            ),
            exercise(
              "Hand the six sentences over one at a time, then joined",
              [
  "Split each of the six supplied sentences separately, then split one string formed by joining them with a single space.",
  "For each approach, print the total piece count, the number of pieces equal to a period, and the list of longer pieces ending in a period.",
  "This Treebank rule expects a sentence-sized input. Joining sentences changes which period it treats as final, even though their words remain unchanged."
],
              `from oop_ml import PennTreebankPreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rules = PennTreebankPreTokenizer()

# Split each sentence on its own and gather every piece's text into one
# list, then split the six joined by single spaces into a second list. For
# each list print the number of pieces, the number that are exactly a full
# stop, and the pieces that end in a full stop but are more than one.`,
              `from oop_ml import PennTreebankPreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
rules = PennTreebankPreTokenizer()

separately = [text for sentence in notebook for text in rules.split(sentence).texts]
together = list(rules.split(" ".join(notebook)).texts)

for name, pieces in [("one at a time", separately), ("joined", together)]:
    lone_stops = sum(piece == "." for piece in pieces)
    attached = [piece for piece in pieces if piece.endswith(".") and piece != "."]
    print(f"{name}: {len(pieces)} pieces, {lone_stops} of them a lone full stop")
    print(f"  still wearing a stop: {attached}")`,
              `one at a time: 72 pieces, 6 of them a lone full stop
  still wearing a stop: ['Dr.']
joined: 67 pieces, 1 of them a lone full stop
  still wearing a stop: ['Dr.', 're-analysis.', 'room.', 'arrived.', 'afternoon.', 'expected.']`,
              {
question: "What happens when a sentence-oriented rule receives several sentences at once?",
 hints: [
  "Collect all split(text).texts for the separate-sentence report.",
  "For the joined report, call split on \" \".join(sentences) once.",
  "A detached period equals \".\". An attached period ends a longer piece, so test that the spelling ends with \".\" and is not just \".\"."
], check: numberCheck("How many pieces do the six sentences give when they arrive joined into one string?", 67, 0.0, "The joined input gives 67 pieces. Several stops remain attached to preceding words because the rule sees one input whose final stop is at the very end.") },
            ),
            exercise(
              "Put the fifteen contraction probes to the rules",
              [
  "Apply the Treebank rules to every supplied probe and print its pieces. Include all fifteen probes, keeping their order and exact apostrophe characters.",
  "Count a probe as cut when the result has more pieces than Python’s whitespace split of that probe. Finish with the cut and uncut totals.",
  "Print each source with ascii so a curved apostrophe remains distinguishable from the straight one. Returning a whole piece does not explain whether it was deliberately kept or absent from the rule list."
],
              `from oop_ml import PennTreebankPreTokenizer

probes = [
    "didn't", "can't", "won't", "shan't", "the dogs' bowls", "cannot", "gonna",
    "'twas the night", '"It\\'s fine,"',
    "didn\\u2019t", "l'analyse", "dell'analisi", "gotcha", "y'all", "o'clock",
]
rules = PennTreebankPreTokenizer()

# For each probe, split it and print the probe beside the pieces, both
# through ascii so the curved apostrophe shows as its code point. A probe
# is cut when it gives more pieces than its number of space-separated runs.
# Count the probes that were cut and the probes that came back whole, and
# print both counts.`,
              `from oop_ml import PennTreebankPreTokenizer

probes = [
    "didn't", "can't", "won't", "shan't", "the dogs' bowls", "cannot", "gonna",
    "'twas the night", '"It\\'s fine,"',
    "didn\\u2019t", "l'analyse", "dell'analisi", "gotcha", "y'all", "o'clock",
]
rules = PennTreebankPreTokenizer()

cut = 0
for probe in probes:
    pieces = list(rules.split(probe).texts)
    was_cut = len(pieces) > len(probe.split())
    cut += was_cut
    print(f"{ascii(probe):20s} -> {ascii(pieces)}")
print(f"{cut} cut, {len(probes) - cut} returned whole")`,
              `"didn't"             -> ['did', "n't"]
"can't"              -> ['ca', "n't"]
"won't"              -> ['wo', "n't"]
"shan't"             -> ['sha', "n't"]
"the dogs' bowls"    -> ['the', 'dogs', "'", 'bowls']
'cannot'             -> ['can', 'not']
'gonna'              -> ['gon', 'na']
"'twas the night"    -> ["'t", 'was', 'the', 'night']
'"It\\'s fine,"'      -> ['\`\`', 'It', "'s", 'fine', ',', "''"]
'didn\\u2019t'        -> ['didn\\u2019t']
"l'analyse"          -> ["l'analyse"]
"dell'analisi"       -> ["dell'analisi"]
'gotcha'             -> ['gotcha']
"y'all"              -> ["y'all"]
"o'clock"            -> ["o'clock"]
9 cut, 6 returned whole`,
              {
question: "Which typed contractions do these English rules recognize?",
 hints: [
  "Compare split(probe).n_words with len(probe.split()). Multiword probes need this baseline.",
  "ascii(probe) escapes non-ASCII characters, making the curved apostrophe visible.",
  "Keep the literal spelling of every supplied probe. Normalizing the apostrophe would change the experiment."
], check: numberCheck("How many of the fifteen probes come back whole?", 6, 0.0, "Six probes return whole. These rules have specific spellings and suffixes, so a familiar contraction typed with a different apostrophe can miss those branches.") },
            ),
            exercise(
              "Count the three rules over the six sentences",
              [
  "Compare the Treebank, whitespace and Unicode word-boundary rules on the same six supplied sentences.",
  "For each rule print total piece occurrences, distinct spellings and the number of source characters covered by returned spans out of the corpus’s full character count.",
  "Count covered source characters from spans, not token-spelling lengths. A rule may rewrite a spelling or omit punctuation, so those are separate measurements."
],
              `from oop_ml import Corpus, PennTreebankPreTokenizer, UnicodeWordPreTokenizer, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
corpus = Corpus.of(notebook)
rules = {
    "the treebank rules": PennTreebankPreTokenizer(),
    "every run of spaces": WhitespacePreTokenizer(),
    "every boundary": UnicodeWordPreTokenizer(),
}
characters = sum(len(text) for text in notebook)

# For each rule, count the corpus's words, and print the total pieces, the
# number of distinct entries, and how many of the characters lie inside a
# piece, summing end minus start over every piece of every sentence.`,
              `from oop_ml import Corpus, PennTreebankPreTokenizer, UnicodeWordPreTokenizer, WhitespacePreTokenizer

notebook = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The re-analysis used the low-cost sensors from the store room.",
    "Alvarez had run the first analysis in 2019, before the sensors arrived.",
    "Her notes say the low-cost readings drifted every afternoon.",
    "The drift was small, though it was larger than the effect she expected.",
    "She re-ran the analysis twice and the drift did not go away.",
]
corpus = Corpus.of(notebook)
rules = {
    "the treebank rules": PennTreebankPreTokenizer(),
    "every run of spaces": WhitespacePreTokenizer(),
    "every boundary": UnicodeWordPreTokenizer(),
}
characters = sum(len(text) for text in notebook)

for name, rule in rules.items():
    counts = list(corpus.word_counts(rule))
    kept = sum(word.end - word.start for text in notebook for word in rule.split(text))
    print(f"{name}: {sum(count.count for count in counts)} pieces, {len(counts)} entries, {kept} of {characters} characters kept")`,
              `the treebank rules: 72 pieces, 48 entries, 318 of 375 characters kept
every run of spaces: 63 pieces, 47 entries, 318 of 375 characters kept
every boundary: 69 pieces, 47 entries, 303 of 375 characters kept`,
              {
question: "How do splitting conventions change both token counts and vocabulary size?",
 hints: [
  "Use Corpus.of(sentences).word_counts(rule) for occurrence and distinct-spelling counts.",
  "Sum piece.end - piece.start over every result for source coverage. Keep the full source lengths as the denominator."
], check: numberCheck("How many distinct entries do the treebank rules produce over the six sentences?", 48, 0.0, "The Treebank rules produce 48 distinct spellings. They separate punctuation and contractions differently from the other rules, so equal vocabulary size or character coverage would not imply equal pieces.") },
            ),
          ],
        },
      ]}
    />
  );
}
