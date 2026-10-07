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
  title: "Penn Treebank Rules · oop_ml",
  description:
    "Separate contractions and punctuation using rules designed for annotated English text.",
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
      playgroundIntro="Compare contractions and punctuation before and after tokenisation. Check both the output spelling and the span pointing back into the source."
      title="Penn Treebank Rules"
      tagline="Separate contractions and punctuation using rules designed for annotated English text."
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
                  Both rules on the two pages before this one were answering a
                  question about writing. Splitting on spaces asks where the gaps
                  are, and the boundary rules ask, at each position between two
                  characters, whether a word is allowed to end there. Neither
                  asks anything about English, and that is a strength when the
                  text might be in Thai.
                </p>
                <p>
                  These rules were written by somebody with a different problem.
                  A person was about to sit down and mark, for every unit in a
                  sentence, what part of speech it was and which units it grouped
                  with. That person needs one row per thing the grammar has a
                  name for. We carry the same sentence the other two pages carry,
                  because it already breaks in three separate places.
                </p>
                <Equation>
                  {"Dr. Alvarez didn't expect the low-cost re-analysis."}
                </Equation>
                <p>
                  Read it as an annotator. The stop after{" "}
                  <span className="font-mono">Dr</span> belongs to the
                  abbreviation and is part of the word being labelled, while the
                  stop at the end belongs to the sentence and is a separate thing
                  that has its own tag. And{" "}
                  <span className="font-mono">didn&rsquo;t</span> has to be two
                  rows, since the verb takes one tag and the negation takes
                  another, and a parser that saw them fused would have to learn a
                  separate tag for every verb in English with a negation stuck to
                  it. None of that is visible in the spaces, and none of it is
                  visible in the characters either.
                </p>
                <KeepInMind>
                  These rules were asked which units the annotation would have a
                  row for, which is a narrower question than where the words are
                  and has an answer only once the language and the grammar being
                  used to describe it are fixed. Every clause below follows from
                  it.
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
                <p>
                  Every one of those spans is honest, in the sense that reading
                  the sentence between the two numbers gives back the piece
                  printed beside them, character for character. That is worth
                  saying out loud now because it stops being true in Part 4, and
                  the sentence that breaks it is this same sentence inside a pair
                  of quotation marks.
                </p>
                <KeepInMind>
                  Nine pieces from a sentence of 51 characters, and 45 of those
                  characters ended up inside a piece. The other six are the six
                  spaces, which means nothing in the writing was thrown away.
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
                  The disagreements run in both directions, which is what makes
                  them informative. The boundary rules split{" "}
                  <span className="font-mono">low-cost</span> into two and these
                  rules do not, since a hyphenated compound is one thing to a
                  grammar and gets one tag. These rules split{" "}
                  <span className="font-mono">didn&rsquo;t</span> into two and
                  the boundary rules do not, since an apostrophe between two
                  letters is glue in the standard&rsquo;s table and a
                  morpheme boundary to a linguist. Neither rule is reading the
                  other&rsquo;s question wrongly.
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
                  It is worth being exact about how little there is here, because
                  the rest of the page turns on it. The whole method is one pass
                  over each run of non-space characters, asking three kinds of
                  question.
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
                  There is no dictionary of English, no list of abbreviations, no
                  frequency count and nothing that was learned from a corpus. The
                  cost is one pass over the text and a fixed amount of work per
                  run of characters, which is what the rest of this page is
                  spending. Where each of the two earlier rules is a single
                  clause, this is a dozen or so, and every one of them is a
                  repair to a particular way splitting on spaces went wrong on
                  English newspaper prose.
                </p>
                <KeepInMind>
                  Two word lists, one of eight endings and one of ten whole
                  forms, and everything else is a character read in place. That
                  is the whole method, and the reason it still runs on anything
                  is that there is nothing in it to load.
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
                  inside <span className="font-mono">didn&rsquo;t</span> and no
                  mark that either earlier rule treats as a separator, and the
                  rules cut it anyway, into{" "}
                  <span className="font-mono">did</span> and{" "}
                  <span className="font-mono">n&rsquo;t</span>.
                </p>
                <p>
                  The reason is that an annotator labelling that sentence has to
                  write down two facts, that there is a past tense auxiliary verb
                  and that it is negated. Those are two tags, so they need two
                  rows. The negation is written{" "}
                  <span className="font-mono">n&rsquo;t</span> and it is one
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
                    nothing but <span className="font-mono">&rsquo;s</span> comes
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
                <p>
                  If the negation is always{" "}
                  <span className="font-mono">n&rsquo;t</span>, then whatever is
                  left in front of it is whatever is left. For most verbs that is
                  a word. For three of them it is not, and the rules produce a
                  piece that no dictionary of English holds.
                </p>
                <Equation>
                  {"did  n't        the host is a word\n" +
                    "is   n't        the host is a word\n" +
                    "ca   n't        the host is what remains of can\n" +
                    "wo   n't        the host is what remains of will\n" +
                    "sha  n't        the host is what remains of shall"}
                </Equation>
                <p>
                  English spelt those three contractions by changing the verb as
                  well as adding the negation, so there is no division of the
                  characters that gives both morphemes their own letters. The
                  rules take the position that the negation is the fixed part and
                  the host absorbs the irregularity, which is why{" "}
                  <span className="font-mono">can&rsquo;t</span> comes back as{" "}
                  <span className="font-mono">ca</span> and{" "}
                  <span className="font-mono">n&rsquo;t</span>, and the
                  cut was placed there deliberately rather than falling out of
                  the pattern by accident.
                </p>
                <WhyThisWorks title="Why the alternative is worse than it sounds">
                  <p>
                    The obvious repair is to have the rules answer{" "}
                    <span className="font-mono">can</span> instead of{" "}
                    <span className="font-mono">ca</span>, which reads better and
                    costs two things. A piece would no longer stand for a span of
                    the source, so the sentence could not be reassembled from the
                    pieces and their positions, and every use that highlights or
                    aligns text against the original would break. And the repair
                    would need a list, since knowing that{" "}
                    <span className="font-mono">ca</span> is short for{" "}
                    <span className="font-mono">can</span> is a fact about English
                    that no reading of the characters supplies. A one-entry list
                    grows, and the moment the rules carry a vocabulary they carry
                    the whole question of what is in it.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Three pieces in the whole of English are not words, and they
                  are the price of a rule that always cuts the negation off in
                  the same place and never rewrites what it cuts.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The fixed list, and the forms that are not on it">
                <p>
                  Some contractions leave no mark at all.{" "}
                  <span className="font-mono">cannot</span> is two words to a
                  grammar and six letters with nothing between them, so no rule
                  reading the characters can find the join. The treebank rules
                  handle those by naming them, ten forms in all, each with the
                  place inside it where the cut goes.
                </p>
                <ContractionTable />
                <p>
                  The first nine rows are the rules working. The last six are the
                  ones to read carefully, because in every one of them the answer
                  is a single piece and nothing anywhere reports that a list was
                  consulted and came up empty. The same apostrophe that gets{" "}
                  <span className="font-mono">didn&rsquo;t</span> cut in two
                  leaves <span className="font-mono">y&rsquo;all</span> whole,
                  and the curved apostrophe that a word processor inserts by
                  default leaves the very same contraction whole as well.
                </p>
                <InAModel>
                  <p>
                    The two foreign rows are the ones that would bite hardest in
                    practice. French writes{" "}
                    <span className="font-mono">l&rsquo;analyse</span> where these
                    rules would want two units, an article and a noun, and the
                    apostrophe is doing exactly the job it does in{" "}
                    <span className="font-mono">it&rsquo;s</span>. The rules leave
                    it whole because the clause that would cut it lists endings
                    rather than beginnings, and English clitics attach at the end
                    while French ones attach at the front. Nothing in the rules
                    knows which language it is reading, so a French document put
                    through them comes back looking successfully processed.
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
                  The first two lines are worth noticing for what they do not
                  say. There is no condition on them at all, so a mark from that
                  set is separated whatever surrounds it, and{" "}
                  <span className="font-mono">a@b.com</span> comes back as three
                  pieces while <span className="font-mono">AT&amp;T</span> comes
                  back as three as well. On newspaper prose that is right almost
                  every time, since those characters really are punctuation
                  there. On an address it is a piece of writing pulled apart into
                  its punctuation and its letters.
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
                  at the same behaviour on{" "}
                  <span className="font-mono">1,000</span>, and they disagree on{" "}
                  <span className="font-mono">3:30</span>, which these rules keep
                  whole and the standard cuts into two.
                </p>
                <KeepInMind>
                  A mark inside a number is kept by testing the character after
                  it, which is an approximation to the thing meant and is exact on
                  the writing the rules were built for.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The full stop, and the sentence the rules assume they were handed">
                <p>
                  The full stop is the hard one, and it is hard for a reason that
                  no amount of care about characters removes. In{" "}
                  <span className="font-mono">Dr.</span> the stop is part of the
                  word and should stay; at the end of the sentence it is a mark
                  of its own and should come off; and the two are the same
                  character.
                </p>
                <p>
                  The rules settle it without a list of abbreviations, by using a
                  fact about where the text came from. The script ran on one
                  sentence at a time, after somebody or something else had
                  already decided where the sentences were, so a stop that is not
                  the last thing in the text cannot be ending a sentence and must
                  therefore be an abbreviation&rsquo;s.
                </p>
                <Equation>
                  {"the last character of the text,\n" +
                    "ignoring trailing spaces, closing brackets and closing quotes,\n" +
                    "and not itself preceded by another stop\n" +
                    "        is  a piece of its own\n" +
                    "every other stop  stays where it is"}
                </Equation>
                <p>
                  Read that as an assumption rather than as a rule, because it is
                  one. It says the text is exactly one sentence. Where that holds
                  the answer is right on both stops of the running sentence at
                  once, which no rule reading only the characters around each
                  stop could manage. Where it does not hold, nothing raises an
                  objection.
                </p>
                <KeepInMind>
                  A rule about position, standing in for a fact about vocabulary.
                  It is exact when the text handed over is one sentence, and the
                  next two sections are the two ways that can fail.
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
                  72 pieces against 67 on the same writing, decided entirely by
                  whether the sentence boundaries were found before the rules ran.
                  Anything using these rules has to do that first, and the rules
                  neither do it nor ask whether it was done.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The abbreviation that ends a sentence">
                <p>
                  The second failure runs the other way and is the one the rules
                  cannot repair even in principle. A sentence that ends in an
                  abbreviation is written with one stop doing both jobs, so the
                  final-stop rule fires, and the abbreviation loses the stop that
                  belongs to it.
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
                  A list of abbreviations would fix the first failure and not
                  this one. Knowing that{" "}
                  <span className="font-mono">al.</span> is an abbreviation tells
                  us the stop belongs to it; it does not tell us where the
                  sentence&rsquo;s own stop went, because there is not a second
                  one. The two marks were written as one, and no division of the
                  characters into pieces can assign that character to two pieces
                  at once.
                </p>
                <KeepInMind>
                  One of the two full stop failures is a missing list and the
                  other is a case with no correct answer available. The boundary
                  rules meet the same wall from the other direction, which is the
                  clearest sign that it is a property of English writing rather
                  than of either method.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "The rules cut didn’t in front of the n rather than at the apostrophe. Why there?",
              [
                "Because the negation is written n’t and is one morpheme, so that is where the row begins",
                "Because an apostrophe is punctuation and always comes off as a piece of its own",
                "Because the apostrophe stands between two letters and is therefore glue",
                "Because the verb did happens to be three characters long",
              ],
              0,
              "An annotator has to write down two facts, a past tense auxiliary verb and a negation, so two tags need two rows. The negation is spelled n’t, so the cut goes in front of the n, and the same treatment covers eight endings in all. The apostrophe is not being treated as punctuation here at all. The boundary rules read the same apostrophe as glue and keep didn’t whole, while cutting both compounds these rules keep, which is why the two rules’ nine pieces on the running sentence share only three, Alvarez, expect and the.",
            ),
            trueFalse(
              "The rules cut can’t into ca and n’t, and the piece ca was placed there deliberately rather than falling out of the pattern by accident.",
              true,
              "English spelled that contraction by changing the verb as well as adding the negation, so no division of the characters gives both morphemes their own letters, and the rules take the position that the negation is the fixed part and the host absorbs the irregularity. Answering can instead would cost two things. A piece would no longer stand for a span of the source, and the repair would need a list, since knowing that ca is short for can is a fact about English that no reading of the characters supplies. Three pieces in the whole of English are not words, and they are the price of a rule that never rewrites what it cuts.",
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
              "The full stop is settled by position rather than by a list of abbreviations, so a stop that is not the last thing in the text is read as an abbreviation’s and stays put. Six stops came back on their own when the sentences arrived separately and one did when they arrived joined, and nothing raises an objection, which is why sentence boundaries have to be found before these rules run.",
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
              "The first two lines of the table carry no condition at all, so a mark from that set is separated whatever surrounds it, which is right on newspaper prose and pulls an address and a company name apart. The comma and the colon sit on a different line with a condition one character wide, separated unless the very next character is a digit, so 1,000 stays whole and so does 3:30, which the standard cuts into two. The test reads the character after the mark rather than asking whether the mark is inside a number, which is an approximation that happens to be exact on the writing the rules were built for.",
            ),
            trueFalse(
              "A list of abbreviations would repair both of the full stop failures.",
              false,
              "It repairs the first and cannot touch the second. A sentence ending in an abbreviation is written with one stop doing both jobs, so knowing that al. is an abbreviation tells us the stop belongs to it and says nothing about where the sentence’s own stop went, because there is not a second one. No division of the characters can assign one character to two pieces at once.",
            ),
        ],
        },
        {
          title: "Part 4. A Piece That Is Not the Text It Came From",
          content: (
            <>
              <SubSection title="13. The quotation mark, rewritten into two characters">
                <p>
                  Everything so far has been a decision about where to cut. This
                  clause is different in kind, and it is what makes these rules
                  unlike the two before them. A quotation mark is not only
                  separated from the word beside it, it is replaced by something
                  that is not in the text.
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
                  The spelling chosen was the one a typist of the period used for
                  directional quotes on a machine that had no directional quotes,
                  which is why an opening quotation mark in treebank text is two
                  backquotes and a closing one is two apostrophes. That is a
                  convention of a particular decade&rsquo;s typing, and it is the
                  reason a modern reader meeting treebank output for the first
                  time usually thinks something has gone wrong.
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
                  caption="Six of the eight brackets get a name. The angle brackets do not, because the file format never used them, which is the whole of the reason."
                />
                <p>
                  The last row is the tell. If this were a rule about brackets it
                  would cover all of them. It covers exactly the six that the
                  storage format needed escaping, and leaves the two it did not.
                  A choice about how the annotation was written down reached back
                  and changed what a word is, and every parser trained on that
                  corpus has been expecting the escaped spelling ever since.
                </p>
                <KeepInMind>
                  The bracket rewriting came out of how the annotation was
                  stored rather than out of anything about English, and the two
                  brackets the format never needed are left alone, which is the
                  clearest sign on this page that these rules describe one corpus.
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
                  that normalises anything at all has to be allowed to say two
                  different things there.
                </p>
                <WhyThisWorks title="Why the published form cannot say this at all">
                  <>
<p>
                    The rules as published are a sequence of substitutions that insert spaces around the things to be separated, and then a split on white space. That form cannot report a span, because once an opening quotation mark has been replaced by two backquotes nothing records where in the original it stood, and every position after it has moved.
                  </p>
                  <p>
                    Anything that wants to highlight a piece in the source, align two readings of one sentence, or check that no writing was lost has to recover that separately, and the usual recovery is to search the source for each piece in turn, which fails on precisely the pieces that were rewritten.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  A piece is a text and a place, and these rules are the first on
                  this site where those two are allowed to disagree. Everything in
                  Part 6 about not being able to paste the pieces back together
                  comes from this one clause.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Counting the rewriting over a corpus">
                <p>
                  How much of a corpus is affected is a fair question and the
                  answer is small, which is what makes the case interesting rather
                  than alarming. Over the 22 sentences in the panel above, chosen
                  so that every clause on this page is exercised at least once, 14
                  of 266 pieces are not the source their span covers.
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
                  Five per cent sounds like a small enough share to ignore and
                  it is not, because what the rewriting costs does not shrink
                  with it. A corpus where one piece in twenty is not a copy of
                  the writing is a corpus that cannot be reassembled from its
                  pieces, and it is a corpus in which searching the pieces for a
                  quotation mark returns nothing at all, since none of them holds
                  that character any more.
                </p>
                <KeepInMind>
                  14 pieces of 266, all of them quotation marks, and 22 once the
                  brackets are named as well. A caller who wants to reassemble a
                  text has to handle those 14, so the small share tells us how
                  much work the repair is and nothing at all about whether it can
                  be skipped.
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
                  The bill everything downstream pays is length, and these rules
                  are the longest of the three on both corpora. Anything reading
                  the text afterwards pays per piece, and a model that compares
                  every position with every other position pays roughly with the
                  square of the count.
                </p>
                <TreebankCostPanel />
                <p>
                  On the six sentences the three rules give 72, 63 and 69 pieces,
                  and the gap is modest because that notebook has one contraction
                  and few marks in it. On the wider corpus, which is newspaper
                  prose with quotations, money, percentages and brackets in it,
                  the same three rules give 266, 155 and 159. That is 72 per cent
                  more pieces than splitting on spaces produces from identical
                  writing, and every one of them is paid for on every pass over
                  the corpus.
                </p>
                <InAModel>
                  <p>
                    The number that grew is the sequence length, which is the one
                    quantity every method later in this section is reported
                    against. It is also why the count above is worth carrying
                    forward rather than filing away. A method that cuts words into
                    smaller pieces so that a vocabulary of forty thousand can
                    spell anything starts from whatever these rules handed it, so
                    a corpus that is already 72 per cent longer than it needed to
                    be stays that way.
                  </p>
                </InAModel>
                <KeepInMind>
                  266 pieces against 155 on the same 22 sentences. Separating
                  every mark is what most of that difference is, and it buys a
                  table where a word appears once rather than once per mark that
                  happened to follow it.
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
                  Whether that is a cost or a benefit depends entirely on what is
                  reading them. To the annotator it was a benefit and the whole
                  point, since a comma has a part of speech in the treebank and
                  needs a row. To a model counting how often words turn up
                  together it is a third of every window spent on marks that carry
                  almost no information about the sentence around them. The rules
                  make one choice and everything downstream lives with it.
                </p>
                <p>
                  The other component is smaller than it looks. At most 26 of the
                  266 pieces come from the contraction and clitic clauses, and
                  four of the spellings counted there are ordinary words that also
                  appear on their own, so the true figure is lower. Splitting
                  contractions is the clause that carries the most linguistics,
                  and it accounts for at most 26 of the 111 pieces by which these
                  rules exceed splitting on spaces, against 86 from separating
                  the marks.
                </p>
                <KeepInMind>
                  86 pieces of punctuation against at most 26 from a
                  contraction, with the rest ordinary words. Most of the extra
                  length comes from the clause that separates the marks, which is
                  also the clause that looks least like a claim about language.
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
                  318 is exactly the number of characters in those six sentences
                  that are not spaces, so the treebank rules kept every single one
                  of them. That is a real difference from the boundary rules,
                  which found the marks correctly and then discarded them as not
                  being words, and it is what makes these rules usable where the
                  original text has to be handed back. A hyphen, a comma and a
                  full stop all survive as pieces here and none of them survives
                  there.
                </p>
                <KeepInMind>
                  Nothing but the spacing is thrown away, so what a caller has is
                  a division of the writing rather than a selection from it. The
                  two quotation marks of the previous part are the only characters
                  anywhere that come back as something else.
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
                  What those share is that the separated character really is
                  punctuation in prose and really is not punctuation there. The
                  rules were written for a corpus of newspaper articles and they
                  read every text as though it were one, which on an address is
                  the same failure the earlier pages describe from the other
                  direction, an assumption about the writing that the rule never
                  states.
                </p>
                <p>
                  There is a case running the other way that is worth reporting
                  beside it. A file name such as{" "}
                  <span className="font-mono">re-analysis_2019.csv</span> comes
                  back whole from these rules and in three pieces from the
                  boundary rules, because a hyphen is nothing to these rules and a
                  separator to the standard. Neither rule is better at
                  non-prose in general; each is accidentally right about a
                  different kind of it.
                </p>
                <KeepInMind>
                  On an address the cruder rule wins, on a file name this one
                  does, and neither wins for a reason connected to what the text
                  actually is. Anything reading text with identifiers in it should
                  protect those spans before any of these rules see them.
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
                  Everything on this page has been a decision, and every one of
                  those decisions was answerable only because the person making it
                  knew which corpus was being annotated, in which language, under
                  which house style. Take that away and most of the clauses have
                  no content.
                </p>
                <p>
                  The hyphen is the cleanest case. These rules leave{" "}
                  <span className="font-mono">low-cost</span> whole and the
                  standard cuts it in two, and nothing in the writing decides
                  between them. What decided it here is that the annotation gave
                  one tag to a compound modifier, which is a claim about the
                  grammar being used to describe English, and a different
                  descriptive framework would have wanted two rows and got a
                  different rule. The rules are the shadow of a particular
                  linguistic analysis, and they are exact only relative to it.
                </p>
                <p>
                  That is not the criticism it sounds like, because it is the same
                  thing that makes them useful. Everything trained on the treebank
                  agrees about what a unit is, and agreement is what a person
                  actually needs from the part of a pipeline that decides where
                  the words are, since the decision is made identically millions
                  of times and two parts of one system disagreeing about it costs
                  far more than either being slightly odd.
                </p>
                <KeepInMind>
                  There is no fact of the matter about{" "}
                  <span className="font-mono">low-cost</span>, and there is a fact
                  of the matter about what the treebank did with it. The second is
                  what these rules define, and it is worth having.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The list is finite, and the silence is the failure">
                <p>
                  Two of the clauses are lists, ten whole forms and eight endings,
                  and a list is finite in a way a rule about characters is not.
                  The eight endings cover the English clitics as they were spelled
                  in the corpus. The ten forms cover the spoken contractions
                  somebody thought of.
                </p>
                <p>
                  What matters is the shape of the failure rather than its size. A
                  form that is on the list is cut; a form that is not is returned
                  whole; and those two answers are the same answer. A caller
                  receives one piece and has no way to ask whether that is because
                  the text was examined and found not to need cutting or because
                  no clause covers it at all. Six of the fifteen probes in section
                  7 fall into the second case and are indistinguishable from the
                  first.
                </p>
                <p>
                  Adding entries does not change this and cannot. Whatever is on
                  the list, there is a next form, and the writing gives no signal
                  that would let a rule notice it has met one. Any method that
                  decides a boundary by consulting a finite list of forms inherits
                  the same silence, and the only escape is a method that infers
                  the boundary from a corpus rather than from a list, which is
                  what the rest of this section of the site is about.
                </p>
                <KeepInMind>
                  Whatever is on the list there is a next form, and the answer
                  never says whether one was met. That holds of every rule that
                  decides a boundary by consulting named forms, and it is not a
                  complaint about these ten entries.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. One era's typing, and one language's apostrophe">
                <p>
                  Several clauses depend on how the text was typed rather than on
                  what it says, and both of the assumptions they make were true of
                  a corpus keyed in the late nineteen eighties and are false of a
                  good deal of writing now.
                </p>
                <>
<p>
                  The apostrophe is one character to these rules and there are two in common use, since the curved one is what a word processor inserts by default. The same contraction typed the modern way is returned whole. Quotation marks have the same problem twice over, since the rules read the straight typewriter mark and rewrite it into a typewriter convention, and curved quotation marks are neither read nor produced.
                </p>
                <p>
                  And the final-stop clause assumes a step before it that finds the sentences, which was true in a pipeline built around this script and is not true of a string arriving from anywhere else.
                </p>
</>
                <p>
                  There is a subtler one worth naming. The rules as published are
                  a pipeline of substitutions rather than a specification, so on
                  writing they did not anticipate, a doubled comma or a run of
                  three backquotes, the answer falls out of how one
                  substitution&rsquo;s replacement lands in the next
                  one&rsquo;s search. Nobody decided those cases, and two careful
                  readings of the same rules can therefore differ on them without
                  either being unfaithful.
                </p>
                <KeepInMind>
                  A rule that reads a character is a rule about a keyboard, and
                  keyboards changed. Anything putting modern text through these
                  rules should normalise the apostrophes and the quotation marks
                  first, which is a decision the rules do not contain.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The pieces alone cannot be pasted back into the source">
                <p>
                  The rewriting has a consequence that outlived every other
                  choice on this page, and it is the reason later methods gave it
                  up. Once a piece can be something other than the writing it came
                  from, a list of pieces is no longer a division of a text.
                </p>
                <Equation>
                  {"the pieces joined with one space each\n" +
                    "        ``  Dr.  Alvarez  did  n't  ...  ,  ''  she  wrote  .\n\n" +
                    "the source\n" +
                    "        \"Dr. Alvarez didn't expect the low-cost re-analysis,\" she wrote."}
                </Equation>
                <p>
                  Two separate things went wrong there. The spacing is gone, which
                  is true of every rule on these three pages and is recoverable if
                  one knows the language&rsquo;s conventions, and the quotation
                  marks are gone, which is not recoverable at all from the pieces,
                  since two apostrophes might have been a closing quotation mark
                  or might have been two apostrophes. The pieces plus the spans
                  plus the original text do recover everything; the pieces alone
                  recover nothing exactly.
                </p>
                <p>
                  Every method that came afterwards had to give this up in order
                  to be usable for anything that hands the reader back their own
                  text. That is why the methods later in this section are
                  described as reversible or not reversible, and why the ones that
                  keep the space attached to the word after it are keeping it for
                  this reason rather than out of tidiness.
                </p>
                <KeepInMind>
                  The pieces are an annotation of the text rather than a
                  partition of it, and nothing about them shows the difference
                  until somebody tries to put the text back. Anything that will
                  have to hand the reader their own writing should check whether
                  the method it is using can, since these rules cannot and say
                  nothing about it.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. What is left undecided, gathered">
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
                      expression: "a full stop ending an abbreviation",
                      reason:
                        "undecidable at the end of a sentence, with or without a list, because one character is closing both the abbreviation and the sentence and no division of the characters gives it to two pieces. In the middle of a text it is decidable with a list of abbreviations, and these rules carry none, standing a rule about position in its place.",
                    },
                    {
                      expression: "where the sentences are",
                      reason:
                        "assumed, never determined. The final-stop rule is exact only when the text handed over is one sentence, and the six sentences here give 72 pieces separately and 67 joined, with five stops staying attached to the words in front of them. Whoever runs the rules decides this, and the rules do not report which was done.",
                    },
                    {
                      expression: "a hyphen joining two words",
                      reason:
                        "not settled by the writing. These rules keep the compound whole and the standard's rules cut it, and what chose between them was a decision about how many tags a compound modifier gets. Over six sentences that single choice puts three entries in one rule's table that the other does not hold, and four in the other's.",
                    },
                    {
                      expression: "a contraction nobody listed",
                      reason:
                        "returned whole, and indistinguishable from a text the rules examined and left alone. Ten whole forms and eight endings are named; six of the fifteen probes here fall outside them, including the same contraction typed with a curved apostrophe. A list can be extended and cannot be completed.",
                    },
                    {
                      expression: "a language other than English",
                      reason:
                        "outside what the clauses can express, rather than handled badly. The clitic clause reads endings and French and Italian attach theirs at the front, so those come back whole, and nothing in the rules knows which language it is reading or reports that the question came up.",
                    },
                    {
                      expression: "which apostrophe and which quotation mark",
                      reason:
                        "fixed to the characters a keyboard produced in the late nineteen eighties. Any normalising of the modern curved marks happens before the rules and is not part of them, and two callers who normalise differently get different pieces from the same writing.",
                    },
                    {
                      expression: "a piece that is not its source",
                      reason:
                        "allowed, which is what separates this method from the two before it. 14 of 266 pieces over 22 sentences hold a text their span does not cover, 22 once the bracket spellings are switched on, and every one of them is a quotation mark standing for one character.",
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
                        "produced rather than decided. The rules were published as a pipeline of substitutions, so on a doubled comma or a run of three backquotes the answer falls out of how one substitution's replacement meets the next one's search, and two faithful readings can differ there.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying past this page. The rules never
                  refuse, so a text they were not written for comes back looking
                  exactly like a text they were, and only the pieces themselves
                  say which happened. And a piece here is an assertion about the
                  writing rather than a copy of it, which is the property every
                  method after this one had to weigh up and mostly chose to keep.
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
              "A reader can see which mark opens and which closes; the plain typewriter quotation mark is the same character both times, so the rules work it out once, from whether the mark begins the text or follows a space or an opening bracket, and write the answer into the piece. The two-character spelling was what a typist of the period used for directional quotes on a machine that had none.",
            ),
            trueFalse(
              "The bracket rewriting gives a name to all eight brackets.",
              false,
              "It names six and leaves the angle brackets alone, because the file format never used them. A parsed sentence is written as a tree with round brackets around each group, so a round bracket belonging to the sentence had to be spelled differently, and the rule covers exactly what the storage needed escaping. That is the clearest sign on the page that these rules describe one corpus.",
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
              "What chose between keeping low-cost whole and cutting it was how many tags the annotation gave a compound modifier, which is a fact about the treebank rather than about the writing, and agreement about it is what makes the rules useful. A caller handed one piece cannot ask whether a clause looked at it, and six of the fifteen probes fall into that silence, including the curved spelling, which is one era’s typing rather than a contraction the rules know. And the pieces alone recover nothing exactly, since two apostrophes might have been a closing quotation mark or might have been two apostrophes. The pieces, their spans and the original text together recover everything.",
            ),
        ],
        },
        {
          title: "Practice. Putting the Rules to the Running Sentence",
          practice: [
            exercise(
              "Cut the running sentence, and check that every span is honest",
              ["Put the running sentence to the treebank rules and print each piece beside its span and the slice of the sentence that span names. Section 2 says every span is honest, in that the slice gives back the piece character for character. Then do the same for the sentence inside quotation marks, which Part 4 says is where that stops being true.", "Nine pieces for the bare sentence, every one of them its own slice. For the quoted sentence, count the pieces and count how many are not the slice their span names. The two that differ should be two characters wide while pointing at a span one character wide."],
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
              { hints: ["The rules take one setting, for the brackets, and the default leaves it off, so the rules are constructed with nothing and the text goes to split.", "Each word carries text, start and end, and the slice its span names is the text indexed from start to end. For the bare sentence the two are equal in every row.", "A rewritten piece is one whose text differs from that slice. Count those as the loop goes, and read n_words off the collection for the total."], check: numberCheck("How many pieces does the quoted sentence give?", 14, 0.0, "The sentence inside the quotation marks gives the same pieces as before with the final stop replaced by a comma, plus the two quotation marks, she, wrote and the stop that now ends the whole text. Two of the fourteen are the quotation marks, rewritten into two backquotes and two apostrophes while each still points at the one character it came from, which is the first place on the site where a piece’s text and its span disagree.") },
            ),
            exercise(
              "Hand the six sentences over one at a time, then joined",
              ["Section 11 says the final stop rule assumes the text is exactly one sentence. Split the six sentences one at a time and count the pieces, then join them into one string with a space between each pair and count again. In both cases, count the pieces that are exactly a full stop, and list the pieces that are a word with a full stop still attached.", "The page arrives at 72 pieces separately and 67 joined, with six lone stops becoming one. Only Dr. should be on the attached list the first time, and it should have five sentence endings for company the second."],
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
              { hints: ["The collection split answers has a texts property, so one comprehension over the sentences gathers every piece of every sentence in order.", "Joining the six with a single space gives one text, and the rules read it as one sentence, so only the last character of the whole thing counts as a final stop.", "A lone stop is a piece equal to a full stop, and an attached one ends in a full stop without being one."], check: numberCheck("How many pieces do the six sentences give when they arrive joined into one string?", 67, 0.0, "Five pieces went missing, and they are the five full stops that stayed attached to the word in front of them, because a stop that is not the last thing in the text is read as an abbreviation’s. Six lone stops became one, and the joined corpus gained five entries that are a word with a stop on it, including re-analysis. beside the re-analysis that was already there. Only Dr. is an abbreviation, and the rules cannot tell it from the other five.") },
            ),
            exercise(
              "Put the fifteen contraction probes to the rules",
              ["Section 7 puts fifteen short texts to the rules, nine that a clause covers and six that none does. Split each, print what came back, and count how many were cut at all. A text is cut when it gives more pieces than it has runs of non-space characters.", "The first nine should come apart and the last six should come back whole, including the running sentence’s own contraction typed with a curved apostrophe. Nothing in the output of a whole piece says whether a clause looked at it, which is the point."],
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
              { hints: ["Splitting the probe on white space with Python’s own split gives its runs, and the rules cut it when they answer more pieces than that.", "ascii gives a string’s repr with every character outside ASCII written as an escape, so the curved apostrophe prints as its code point and the two spellings of one contraction cannot be confused.", "The curved apostrophe is written by its code point in the list for the same reason, and only the straight one is on the rules’ list of endings."], check: numberCheck("How many of the fifteen probes come back whole?", 6, 0.0, "The clause is ten named forms and eight endings reached through a single straight apostrophe, so the curved spelling, the two foreign articles, two spoken forms nobody added and o’clock all come back as one piece. A form that is not on the list and a form examined and left alone give the same answer, and nothing reports that the list was consulted and came up empty.") },
            ),
            exercise(
              "Count the three rules over the six sentences",
              ["Section 17 gives the three rules 72, 63 and 69 pieces on the six sentences, and section 19 says the treebank rules and the space rule both keep 318 of the 375 characters where the boundary rules keep 303. Count all of that from the library, and add a column the page does not print, how many distinct entries a table built over each rule’s pieces would need.", "The space rule and the boundary rules both come to 47 entries, which the earlier pages measured. The treebank rules should come to a different number, and the second part of the task is to say why."],
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
              { hints: ["Corpus.of takes the list and word_counts takes any of the three rules, answering one count per distinct entry with word and count on each.", "The sum of the counts is the pieces and the number of counts is the entries. The characters kept need the spans, so they come from split rather than from the counts."], check: numberCheck("How many distinct entries do the treebank rules produce over the six sentences?", 48, 0.0, "The space rule’s 47 lose the nine entries that were a word wearing a mark or the contraction, and gain ten, the seven bare words those marks came off, n’t, and the comma and the full stop as entries of their own. re-analysis. collapses into the re-analysis the table already held and didn’t gives did, which was already there too, so the count rises by one rather than by two. Every rule here keeps every character that is not a space, which is why the 318 matches the space rule’s and the boundary rules, which drop the marks, keep 303.") },
            ),
          ],
        },
      ]}
    />
  );
}
