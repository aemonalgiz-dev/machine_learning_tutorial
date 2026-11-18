import { pageMetadata } from "@/lib/seo";
import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
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
import { ManyReadings } from "@/components/widgets/ManyReadings";
import { MorphologyPlayground } from "@/components/widgets/MorphologyPlayground";
import { TheMachine } from "@/components/widgets/TheMachine";
import { WalkThroughAWord } from "@/components/widgets/WalkThroughAWord";
import { WhatItCanRead } from "@/components/widgets/WhatItCanRead";
import { WordsAnalysed, WordsNotRead } from "@/components/widgets/WordsAnalysed";
import { WrittenAgainstLearned } from "@/components/widgets/WrittenAgainstLearned";

export const metadata: Metadata = pageMetadata("/concepts/finite-state-morphology", {
  title: "Finite-State Morphology · Perceptron Lab",
  description:
    "A word form can be described through its components and the spelling rules that connect them. Finite-state methods represent those relationships so word forms can be analyzed or generated.",
});

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function FiniteStateMorphologyPage() {
  return (
    <ConceptPage
      lessonId="finite-state-morphology"
      intuition={lessonIntuitions["finite-state-morphology"]}
      technicalStart="Part 2. A Grammar Is a Machine"
      openingTitle="Write Down How the Word Is Built"
      playgroundTitle="Which paths can read this word?"
      playgroundIntro="Trace a word through the allowed stems and endings. Compare a recognized form, an unfamiliar form, and a form with more than one possible analysis."
      title="Finite-State Morphology"
      tagline={"A word form can be described through its components and the spelling rules that connect them. Finite-state methods represent those relationships so word forms can be analyzed or generated."}
      prerequisites={
        <>
          {"Earlier tokenizers learned pieces from corpus statistics. Here we supply stems, endings and allowed combinations explicitly. This teaching analyzer uses an unweighted grammar and has no fitting stage. Finite-state methods more broadly can also be weighted or learned; those extensions are outside the example."}</>
      }

      playground={<MorphologyPlayground />}
      sections={[
        {
          title: "Part 1. Where the Pieces Have Come From Until Now",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Every piece so far was found by counting">
                <>
<p>

                  In walked and walking, we can recognize walk as the part shared by both forms. The endings tell us different things about how the verb is used. Suppose we want our pieces to preserve those grammatical roles rather than simply shorten a sequence.
                </p>
                <p>
                  The earlier vocabulary methods count patterns in text. Byte pair encoding joins frequent adjacent symbols; the unigram model removes candidates that contribute little to its scoring objective. Those procedures can discover useful recurring pieces, but they were not given the grammatical roles we just described.
                </p>
                <p>
                  Those data-driven methods arrive at a vocabulary by measuring a corpus, so their choices depend on the writing that corpus contains. Here we will supply explicit rules instead. That trades the work of learning boundaries from counts for the work of deciding and maintaining a grammar.
                </p>
</>
                <p>
                  These objectives let a method learn pieces without someone supplying a linguistic analysis of every word. Their decisions follow corpus statistics, however. They do not explicitly encode the grammatical fact that{" "}
                  <span className="font-mono">re</span> is a prefix, that{" "}
                  <span className="font-mono">ed</span> makes a past tense, or
                  that <span className="font-mono">bake</span> and{" "}
                  <span className="font-mono">bak</span> are the same word
                  spelled two ways, and if the counts put a boundary in the
                  middle of a suffix then the middle of a suffix is where the
                  boundary is.
                </p>
                <KeepInMind>
                  {"A learned vocabulary depends on its corpus, candidate construction and training settings. It can combine familiar pieces in words absent from training, but it does not automatically label their grammatical roles. The explicit grammar below supplies those labels."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Where the counts put the cut">
                <p>
                  The vocabulary comparison uses every one of the larger grammar&apos;s 1,074 accepted forms exactly once. The fitted vocabulary has 178 pieces, matching the grammar&apos;s count of written lines as an explicit experiment setting. Both see this complete set of accepted forms. The comparison measures their resulting representations; one vocabulary entry and one grammar line are different objects, so equal counts do not establish equal model capacity.
                </p>
                <p>The two methods agree on three of the six tested words. On recovers and bakes, the count-based splits are recov plus ers and bak plus es. Frequent letter sequences do not necessarily coincide with the stem boundaries.</p>
                <p>For measured, the count-based split is measure plus d. The supplied grammar instead represents measur plus ed and applies its spelling convention. Comparing these outputs lets us distinguish a statistical segmentation from the analysis specified by this grammar.</p>
                <p>
                  {"Changing the learned vocabulary budget changes these examples’ segmentations. At 178 pieces, measured is measure plus d; at 356 it is a single entry, while unnamed changes from three pieces to two. We leave the written grammar unchanged during that comparison, so its analysis stays fixed. Editing the grammar itself could change its result too."}
                </p>
                <WrittenAgainstLearned />
                <p>
                  The widget above is used again in section 15 for the numbers
                  down its left-hand side. For now the column worth looking at is
                  the right-hand one, which does not change when the button
                  changes.
                </p>
                <KeepInMind>
                  {"A statistical segmentation depends on its fitted vocabulary and objective. Changing the budget can change a word’s boundaries, although it need not change every word. The supplied grammar answers a different question by explicitly specifying allowable analyses."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The other way to get the pieces">
                <p>
                  We can also supply linguistic knowledge directly. Someone writes a lexicon of stems and endings, together with rules for which combinations are allowed. The analyzer then searches for a permitted sequence that spells the observed word. Its result can identify the pieces and their grammatical roles. We will build a small grammar so we can inspect exactly which analyses it permits.
                </p>
                <p>
                  Our sentence has a word of exactly this shape.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  A reader who knows English sees{" "}
                  <span className="font-mono">re-analysis</span> as{" "}
                  <span className="font-mono">re</span> in front of{" "}
                  <span className="font-mono">analysis</span>, and would interpret the prefix as again. A written rule can apply that analysis even when this particular word was absent from a corpus. Let&apos;s see how to express the rule and which words it allows the analyzer to read.
                </p>
                <KeepInMind>
                  {"This example puts linguistic choices into a written lexicon and continuation rules. Building and maintaining those choices takes work for the language and application. The compiler or traversal machinery can be reused, and other systems can also learn or share parts of a grammar."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Grammar Is a Machine",
          content: (
            <>
              <SubSection title="4. States, and steps that read something">
                <p>
                  {"To describe a word, we need both its possible pieces and their permitted order. A finite-state analyzer records that ordering with a finite set of states and labeled transitions. A state summarizes which transitions may follow; the search also tracks how many input characters it has consumed."}
                </p>
                <p>
                  {"A transition connects one state to another and carries a surface spelling and an analysis label. In this API every surface spelling is nonempty, so taking a transition consumes at least one input character."}
                </p>
                <Equation>
                  {"a step  =  ( state,  spelling,  label,  next state )"}
                </Equation>
                <p>
                  {"This analyzer has a designated start and a special end continuation. A successful path begins at the start, consumes the complete word and reaches that end continuation. General finite-state models can instead have several accepting states, including states with outgoing transitions."}
                </p>
                <Equation>
                  {
                    "a reading  =  steps s₁ … sₖ  with  spelling(s₁) + … + spelling(sₖ) = the word"
                  }
                </Equation>
                <WhyThisWorks title="Why consuming a character on every step makes the search finish">
                  <>
<p>
                  {"Every transition here consumes at least one character, so a path through a fixed word has at most as many transitions as the word has characters. Even a grammar cycle must therefore advance through the input. An implementation allowing empty-input transitions needs to handle their cycles explicitly, for example during closure or traversal; it does not necessarily have to remove all of them first."}
                </p>
                  <p>
                  {"This restriction simplifies termination. It also changes how a zero ending is represented, which section 8 examines. The traversal still has to check transitions and input positions; termination does not make that work free."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"States restrict which kinds of continuation can follow a stem. For example, the noun-ending state can admit a plural label, while the verb-ending state admits its configured verb forms. In a one-state grammar, all loops at that state are available after one another, so it cannot express that distinction without another mechanism."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The whole grammar, written out">
                <p>The complete teaching grammar has sixteen lines and five states. It contains three verbs, one of which can also be a noun, together with their permitted endings. Keeping this small grammar visible lets us trace every accepted form before considering larger lexicons.</p>
                <TheMachine grammarKey="small" />
                <p>
                  Read one line of the table as a sentence. Standing in the start
                  state, read the characters{" "}
                  <span className="font-mono">walk</span>, call them the verb
                  walk, and go to the verb ending state. Standing in the verb
                  ending state, read <span className="font-mono">ed</span>, call
                  it a past tense, and the word ends here. That is two steps and
                  it is the whole of reading{" "}
                  <span className="font-mono">walked</span>.
                </p>
                <p>
                  Two things in the table are worth noticing now because they are
                  the subjects of sections 8 and 13. Every stem appears twice,
                  once going to an ending and once going straight to the end. And{" "}
                  <span className="font-mono">bake</span> appears a third time
                  spelled <span className="font-mono">bak</span>, going to a state
                  of its own.
                </p>
                <KeepInMind>
                  Sixteen lines accept exactly twelve words. That is a small
                  number, and section 14 is about how fast it stops being small
                  when the same three columns hold a real stem list.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Walking a word through it">
                <p>
                  Now take <span className="font-mono">walked</span> and walk it.
                  The machine begins in the start state at the first character.
                  It looks for a line whose spelling begins there, finds{" "}
                  <span className="font-mono">walk</span>, takes it, and is now in
                  the verb ending state at the fifth character. It looks again,
                  finds <span className="font-mono">ed</span>, takes it, and that
                  line says the word ends here, which it does.
                </p>
                <p>
                  The widget below shows that as two rows. The first is each
                  character of the word with the state it was read in written
                  underneath, so the machine stops being an abstraction and
                  becomes something running along the word. The first four
                  characters are read in the start state and the last two in the
                  verb ending state, and the place where the label changes is the
                  place the word divides.
                </p>
                <WalkThroughAWord word="walked" />
                <WorkedExample>
                  <p>
                    Five lines are tried to read{" "}
                    <span className="font-mono">walked</span> and two of them
                    lead anywhere. The three that do not are the other lines
                    whose spelling is also{" "}
                    <span className="font-mono">walk</span>, since the start
                    state holds four of those, one going to the verb ending, one
                    going to the noun ending, and two saying the word could end
                    after the stem. All three of those are perfectly good steps
                    and none of them can be completed, because there is an{" "}
                    <span className="font-mono">ed</span> still to account for
                    and neither the noun ending nor the end of the word can
                    account for it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  {"This traversal tries matching transitions and keeps the paths that consume the whole word. An apparently valid stem transition can still lead to a dead end when the remaining letters do not match any permitted continuation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The search backs out of dead ends">
                <p>
                  Press <span className="font-mono">bakes</span> in the widget
                  above and the search does something more interesting. Four lines
                  are tried. The first takes{" "}
                  <span className="font-mono">bake</span> into the state of
                  endings beginning with a consonant, finds{" "}
                  <span className="font-mono">s</span> there, and finishes. The
                  second takes <span className="font-mono">bake</span> as a whole
                  word and cannot, since there is an{" "}
                  <span className="font-mono">s</span> left. The third takes{" "}
                  <span className="font-mono">bak</span> into the state of endings
                  beginning with a vowel, and nothing in that state spells{" "}
                  <span className="font-mono">es</span>, so the search backs out.
                </p>
                <p>
                  {"The bak branch matches the beginning but cannot complete bakes under the endings available from that state. Rejecting that branch adds a little work in this small example. With many alternatives, the number of possible analyses can become much larger."}
                </p>
                <InAModel>
                  <p>
                  {"Production finite-state analyzers often compile lexicons and spelling rules into optimized transducers. That can avoid repeatedly scanning the source grammar lines, but finding all analyses can still involve alternative paths and output-dependent work. This lesson walks the explicit transitions to make those choices visible. Compilation improves the representation; it does not guarantee a unique analysis or eliminate every form of search."}
                </p>
                </InAModel>
                <KeepInMind>
                  Every line the search tries and abandons is a reading the
                  grammar allows locally and forbids as a whole. There is no
                  probability involved in the abandonment and no threshold; the
                  path simply does not reach the end of the word.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why a bare stem is written twice">
                <p>
                  {"The printed grammar gives walk a transition to the verb endings and another directly to the end. These encode two accepted forms: continuing with a visible ending or finishing after the stem. The duplication comes from this API’s nonempty-transition convention."}
                </p>
                <p>
                  {"Some present-tense uses of a regular English verb have no visible ending. A grammar supporting empty-surface transitions could represent a separate zero ending. This API instead uses a consuming stem transition that can finish the word. Empty-surface transitions are valid in more general analyzers, provided the implementation handles their cycles appropriately."}
                </p>
                <WhyThisWorks title="Two ways to let a word end after its stem">
                  <p>
                  {"Both constructions can allow a bare stem to finish a word. This example duplicates the stem transition because every transition must consume a character. Its chosen label is just the verb stem, but that is a grammar choice: a consuming stem transition could also carry a present-tense label. An empty-surface transition is useful for expressing a separate zero ending; it is not the only way to attach that information."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"A grammatical feature need not correspond to extra written characters. This API can attach it to a transition that consumes the stem. Representing a separate zero-surface morpheme would require an interface that supports empty-surface transitions."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What a grammar accepts is a list you could print">
                <p>
                  {"The three main teaching grammars are acyclic, so their complete accepted word sets are finite. We can enumerate them by following every start-to-end path without supplying a word first. The small grammar accepts twelve distinct spellings. A grammar with consuming cycles can accept infinitely many words while still terminating on each fixed input."}
                </p>
                <p>
                  {"Enumerating the small grammar produces fourteen paths but twelve distinct words. Walk and walks each have two analyses. Section 20 examines how different paths can spell the same surface word."}
                </p>
                <NumberTable
                  headings={["grammar", "states", "lines", "words accepted", "readings"]}
                  rows={[
                    ["three verbs and their endings", "5", "16", "12", "14"],
                    ["the same, before the spelling change", "3", "12", "12", "14"],
                    ["thirty-six verbs, forty nouns, three prefixes", "6", "178", "1074", "1184"],
                  ]}
                  caption="Every path from the start state to the end, counted for the three grammars this page uses. Two of the small grammar’s twelve words have two readings each, and 108 of the larger grammar’s have more than one."
                />
                <KeepInMind>
                  {"Shared stems and endings can describe many word forms without listing every whole form. These finite teaching grammars make that reuse easy to count. A grammar’s value also includes the analyses it supplies, not only compression of a word list."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. An Analysis Says What Each Piece Is",
          content: (
            <>
              <SubSection title="10. The labels are the answer">
                <p>
                  A segmentation identifies where the pieces fall. This grammar also supplies labels for the lexical and grammatical choices along a valid path. Those labels make an analysis available alongside the surface division. They are information encoded in the grammar, so we should distinguish the usefulness of the returned labels from the work required to specify and maintain them.
                </p>
                <p>
                  {"For walked, a tokenizer may return walk followed by ed. This grammar also labels walk as a verb stem and ed as past tense. An application requiring morphological features can use those labels; other tasks may need only token IDs or surface pieces."}
                </p>
                <Equation>{"walked   →   walk+V +PAST"}</Equation>
                <p>
                  {"The displayed notation attaches a part-of-speech label to the stem and adds features such as +PAST. In this SDK, the Analysis object retains its transition sequence and exposes a joined tag string for display and sorting. Other analyzers can expose structured results as well."}
                </p>
                <KeepInMind>
                  {"Here the grammar author supplies each analysis label alongside its surface spelling. The analyzer returns those labels; it does not infer them from the letters alone. Learning comparable labels would require an additional model, annotation scheme or other linguistic evidence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Several words read">
                <p>
                  Four words, read by the grammars on this page, with what every
                  piece was identified as underneath it. The last of them,{" "}
                  <span className="font-mono">reopeners</span>, is read by the
                  larger grammar of Part 4 and not by the small one, because the
                  small one has no prefixes in it.
                </p>
                <WordsAnalysed />
                <p>
                  {"Reopeners has four pieces in this grammar: a prefix meaning again, a verb stem, an agent-forming ending and a plural ending. The rules combine to analyze the form without requiring it to be listed as a whole word. Its presence or absence in a particular corpus is not part of this test."}
                </p>
                <KeepInMind>
                  {"Existing stems and continuation rules can accept a combination that was not separately listed. That is how the larger grammar generates 1,074 distinct forms from its 178 source contributions. Whether every generated analysis is appropriate English still requires evaluation; permitted by the grammar does not automatically mean linguistically correct."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Cutting a word by its reading, and which reading is taken">
                <p>
                  {"The analysis API returns all paths found. This SDK’s tokenizer interface additionally selects one path to turn into surface pieces. When several analyses are available, that interface needs a selection policy. Another consumer could preserve the alternatives instead."}
                </p>
                <p>
                  So a rule is imported from outside. The reading with the fewest
                  pieces wins; if several tie, the one whose label string sorts
                  first wins; if several still tie, the one whose pieces sort
                  first wins. On <span className="font-mono">walks</span>, both
                  readings have two pieces, and{" "}
                  <span className="font-mono">walk+N +PL</span> sorts before{" "}
                  <span className="font-mono">walk+V +3SG</span> because the
                  letter N comes before V, so the plural noun is what is handed
                  on.
                </p>
                <WorkedExample>
                  <p>
                  {"This ordering is a deterministic fallback, not a linguistic ranking. The isolated grammar supplies no frequency or sentence context that would prefer the noun or verb interpretation. Documenting the policy makes the selected segmentation repeatable without treating alphabetic order as evidence of the intended meaning."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  {"Returning all analyses preserves the grammar’s ambiguity. Selecting one can simplify an interface, but the consumer should know which policy made that choice. Both outputs can be useful for different tasks."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Spelling changes have to be written out">
                <p>
                  {"For the regular silent-e verb bake, simply appending ed produces bakeed rather than baked. A stem list and ending list need a spelling rule or alternate stem form to connect the lexical analysis with the written result. Other verbs may need different rules or irregular entries."}
                </p>
                <p>The smaller grammar without the spelling rule has three states and twelve lines. It accepts bakeed as bake plus its past-tense ending and rejects baked. With the spelling rule, the grammar has five states and sixteen lines and reverses those results. The added states express the written change; a stem-and-ending list alone did not.</p>
                <NumberTable
                  headings={["word", "before the repair", "after the repair"]}
                  rows={[
                    ["baked", "no reading at all", "bake+V +PAST, cut as bak and ed"],
                    ["bakeed", "bake+V +PAST", "no reading at all"],
                    ["bakes", "bake+V +3SG", "bake+V +3SG, unchanged"],
                    ["walked", "walk+V +PAST", "walk+V +PAST, unchanged"],
                  ]}
                  caption="The same four words under the two versions of the small grammar. The repair reverses the first two rows and leaves the regular stems exactly as they were."
                />
                <p>
                  The repair is four lines. A second spelling of the stem,{" "}
                  <span className="font-mono">bak</span>, labeled as the verb
                  bake, going to a new state holding only the endings that begin
                  with a vowel; and the full stem redirected to a state holding
                  only the endings that begin with a consonant. What comes back is
                  still <span className="font-mono">bake+V +PAST</span>, so the
                  analysis is right even though the piece on the page is{" "}
                  <span className="font-mono">bak</span>.
                </p>
                <InAModel>
                  <p>
                  {"Koskenniemi's two-level rules, and later rule compilers, allow spelling changes to be stated as constraints rather than listed one word at a time. For the pattern illustrated here, a rule can describe when a stem-final e disappears before an ending. Compiling and composing those rules with the lexicon can produce the required surface paths."}
                </p>
                <p>
                  {"This teaching implementation has no spelling-rule compiler. It lists the alternate stem spelling explicitly, so the bak transition appears because the grammar includes it. The resulting analyses can agree with a compiled-rule grammar, but maintaining many spelling alternations requires more repeated entries."}
                </p>
                </InAModel>
                <KeepInMind>
                  The pieces a grammar cuts a word into are the characters
                  actually on the page, so a spelling change makes the pieces and
                  the morphemes stop matching one to one. What comes back for
                  baked is still the verb bake in the past tense even though no
                  four characters of it spell bake, and that holds only because
                  the label was written beside the spelling rather than read off
                  it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "A vocabulary of 178 pieces was fitted on a corpus holding every one of the grammar’s 1,074 words exactly once. How did it cut recovers and bakes?",
              [
                "As recov and ers, and bak and es, both a character to the left of where the word is jointed",
                "As recover and s, and bake and s, which is what the grammar says",
                "It held both whole, since nothing in that corpus was rare",
                "It refused both, since neither occurs often enough to earn a piece",
              ],
              0,
              "The endings ers and es are frequent in written words, and the counts have no opinion about which characters belong to the stem. The word measured misses in the other direction, coming back as measure and d where the grammar says measur and ed, because the stem drops its final e.",
            ),
            trueFalse(
              "A learned boundary moves when the budget moves, where a written grammar answers the same thing at every size.",
              true,
              "Changing the learned vocabulary budget can change its pieces: measured is split at 178 rows but becomes one entry at 356. An unchanged written grammar has no vocabulary-size control, so those same budget changes do not alter its analyses. Editing its lexicon or continuation rules can still change them. The comparison concerns where the decisions come from.",
            ),
            choice(
              "Why does every step of this machine have to read at least one character?",
              [
                "So that each label can be read off the spelling it sits beside",
                "So the search finishes, since every step moves strictly to the right and no run of steps can be longer than the word",
                "So that a word can be read in a single pass rather than by searching",
                "So that no state can be reached from itself",
              ],
              1,
              "Every transition in this teaching analyzer consumes at least one character, so any path through a finite input has bounded length. General finite-state tools can also support transitions that consume nothing, but cycles through such transitions need additional handling. This implementation instead represents a bare form with a stem entry that can end directly. Analysis labels can be attached to that consuming entry; the restriction is on a separate empty-surface transition.",
            ),
            choice(
              "bake plus ed is bakeed, and English writes baked. How does the grammar on this page handle that?",
              [
                "By compiling a rule saying a stem-final e disappears before a vowel-initial ending and composing it onto the lexicon",
                "By a second spelling of the stem, bak, labeled as the verb bake, leading to a state holding only the vowel-initial endings",
                "By respelling the ending as d after a stem that ends in e",
                "By handing the word on whole, since no path spells it",
              ],
              1,
              "The repaired grammar keeps bake before s and uses the surface spelling bak before ed or ing, while preserving the underlying bake+V label. Four added lines take the small grammar from three states and twelve entries to five states and sixteen. A fuller rule system can express the spelling alternation separately; this teaching analyzer writes out the relevant paths explicitly.",
            ),
            choice(
              "The word walks has two readings and both have two pieces. Which is handed on to a tokenizer, and why?",
              [
                "walk+V +3SG, since the verb reading is the commoner one",
                "walk+N +PL, because the two tie on piece count and the label string beginning with N sorts first",
                "Whichever line of the grammar happened to be tried first",
                "Both, since an analyzer reports every reading it finds",
              ],
              1,
              "Nothing in the grammar chooses, so the rule is imported from outside. It is arbitrary, since there is no sense in which the plural noun is the better reading of walks in isolation, and it is written down because the alternative depends on line order, where reordering two lines that say the same thing would change what a word is cut into.",
            ),
        ],
        },
        {
          title: "Part 4. What a Hundred and Seventy-Eight Lines Buy",
          content: (
            <>
              <SubSection title="14. Lines against forms">
                <p>
                  The larger grammar contains twenty-four regular-stem verbs, twelve verbs with the final-e rule, forty nouns, three prefixes and the permitted endings. Thirteen entries can act as both noun and verb. Its 178 lines across 6 states provide a larger, explicit case for examining coverage and ambiguity; those counts describe this constructed grammar rather than the size required for English generally.
                </p>
                <p>
                  {"The larger grammar accepts 1,074 spellings through 1,184 paths. Shared continuations let one ending combine with many permitted stems, so accepted forms can grow faster than the number of source entries. These exact counts depend on the lexical lists and continuation choices in this constructed grammar."}
                </p>
                <Equation>
                  {"178 lines,  6 states   →   1074 words,  1184 readings"}
                </Equation>
                <p>
                  The description counted 178 contributions, while the constructed machine contains 342 transitions. Some stems appear in two states because a prefix needs a route into the stem list. A compiler can generate that repetition from a lexicon written once. Allowing an empty-input transition would provide another construction; the rule used in section 4 produces the explicit copies here.
                </p>
                <KeepInMind>
                  {"For these examples, sharing stems and continuations reduces repetition compared with listing each whole form separately. The maintenance benefit depends on how many combinations genuinely share a rule and how many exceptions need separate entries. Source-line counts alone do not measure the total work or storage."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The same budget spent on counting">
                <p>
                  The larger grammar uses 178 written lines. Comparing it with a vocabulary of 178 pieces on its own accepted language gives a controlled example, but the two inventories encode different kinds of information. We need to inspect what they return and which distinctions they retain, instead of treating the matching counts as a complete measure of cost.
                </p>
                <p>
                  {"The grammar uses a mean of 2.648 surface pieces per accepted word, with a maximum of four. The 178-piece learned vocabulary uses a mean of 2.943 and stores none of the words whole. The grammar’s pieces additionally carry its supplied analysis labels. These measurements compare this accepted word set; whether the sequence-length difference matters depends on the downstream task."}
                </p>
                <WrittenAgainstLearned />
                <p>
                  The numbers to read this time are the four along the top,
                  which describe the grammar, against the two underneath the
                  buttons, which describe whichever learned vocabulary is
                  selected.
                </p>
                <KeepInMind>
                  {"The grammar produces 0.295 fewer pieces per word on average in this comparison, and also supplies analysis labels. Those are separate results, not a price paid for each label. The manually specified grammar and the learned vocabulary also have different construction costs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where counting wins">
                <p>
                  {"At a 356-entry budget, the learned vocabulary averages 2.071 pieces and holds 37 words whole, fewer pieces than this grammar’s 2.648. The grammar keeps its configured morphological divisions. Finite-state representations can also combine transitions or package an analysis with a whole form, but that would change this tokenizer’s reported segmentation."}
                </p>
                <p>
                  If the goal is simply a shorter token sequence, a learned vocabulary can store frequent whole forms. A morphological grammar has a different job: its divisions express the analysis we wrote into it. Changing those divisions merely to shorten the sequence would change what it says about the language. We should choose the representation according to the task.
                </p>
                <NumberTable
                  headings={["method", "size", "pieces per word", "words held whole"]}
                  rows={[["written grammar","178 lines","2.648","n/a; pieces follow the configured grammar transitions"],["learned by counting","178 pieces","2.943","0 of 1074"],["learned by counting","356 pieces","2.071","37 of 1074"]]}
                  caption="Measured on the grammar’s 1,074 accepted words, which also fit the learned vocabularies. At 178 learned entries, the grammar gives slightly fewer pieces; at 356, the learned vocabulary gives fewer. Source lines and vocabulary entries remain different size measures."
                />
                <KeepInMind>
                  {"The larger learned vocabulary yields shorter sequences in this experiment. That does not establish a winner for every budget or grammar. Compare sequence length with the required analyses, coverage and maintenance effort when deciding which representation suits the application."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Two Ways It Fails",
          content: (
            <>
              <SubSection title="17. A word outside the grammar produces nothing at all">
                <p>
                  {"The larger grammar finds no path spelling busiest, so the analysis API returns an empty list. This SDK’s segmentation interface passes the unrecognized word through whole. Other applications could report missing coverage or choose a different fallback."}
                </p>
                <WordsNotRead />
                <p>
                  {"An empty analysis is easy to detect, but it is not unique to finite-state methods. A learned tokenizer may have character or byte fallback, an unknown-token policy, or an error for uncovered input. This grammar returns an empty analysis list when no permitted path spells the word. Productive rules can also analyze unfamiliar combinations, so a word need not have appeared as a whole in the lexicon."}
                </p>
                <p>
                  {"An application can use the empty analysis as a signal to apply a fallback, report missing coverage or request a grammar update. If fallback produces unlabeled pieces, downstream code should distinguish them from analyzed morphemes. Returning a rough segmentation may keep processing moving, but it does not provide the grammatical analysis that was missing."}
                </p>
                <KeepInMind>
                  {"An empty analysis flags that this grammar has no permitted path for the word. It does not count every linguistic error: a nonempty result can still contain wrong or missing analyses. Learned tokenizers can also report unknown pieces or other coverage limits. Compare those diagnostics according to the output each method promises."}
                </KeepInMind>
              </SubSection>

              <SubSection title="18. How much of our sentence it reads">
                <p>
                  Our sentence has seven words in it by the simplest reckoning,
                  and the grammar reads one of them. That one is{" "}
                  <span className="font-mono">expect</span>, and it reads it
                  correctly, as the verb expect with nothing after it.
                </p>
                <WhatItCanRead showParagraph={false} />
                <p>
                  {"English annotation rules split the sentence into nine units rather than seven whitespace-separated words, separating the contraction and final stop. This grammar still analyzes only expect. Its small lexicon lacks the needed entries or paths for the name, abbreviation, function words and analysis, so changing boundaries alone does not supply the missing linguistic coverage."}
                </p>
                <p>
                  {"Removing punctuation, lowercasing and separating the hyphenated form gives nine units of which two are analyzed, because cost is in the noun list. This combined preprocessing policy changes the coverage calculation. Record it before comparing coverage figures."}
                </p>
                <KeepInMind>
                  {"This word-level analyzer depends on a separate procedure to find the words it receives. Punctuation, capitalization and contractions can therefore affect its coverage. That preprocessing remains part of the application’s responsibility even though it is outside the grammar traversal."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. How much of ordinary prose it reads, and what fifty lines buy">
                <p>
                  {"The displayed ordinary-English paragraph contains 76 word occurrences and 57 distinct words. This grammar accepts 7 of each, corresponding to the reported 9.2 percent occurrence coverage and 12.3 percent distinct-word coverage. The result shows the boundary of this small lexicon on that paragraph, rather than measuring the potential coverage of finite-state analysis in general."}
                </p>
                <Equation>
                  {"coverage  =  words the grammar reads  ÷  words in the text"}
                </Equation>
                <p>
                  {"The grammar currently omits common function words such as the, and and of. They may have no further surface division in this analysis, but they can still receive useful grammatical labels. The next check adds fifty whole-form entries for such words and measures the resulting coverage."}
                </p>
                <WhatItCanRead showSentence={false} />
                <p>
                  {"Adding those fifty entries raises occurrence coverage from 9.2% to 60.5% and distinct-word coverage from 12.3% to 47.4% on this paragraph. Frequent function words account for much of the gain. Thirty distinct words remain uncovered, including busiest, thinned, gone and stallholder. New entries, shared spelling rules or irregular analyses may cover them in different ways."}
                </p>
                <KeepInMind>
                  {"A written grammar needs an update process, but a shared rule can cover many additional forms at once. Learned tokenizers also need a defined coverage policy; fitting does not guarantee every future character or word is representable. Character or byte fallback can help without supplying the grammatical analysis this application asks for."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A word it reads more than one way">
                <p>
                  {"For recovers, the larger grammar returns three paths: recover as a verb with a third-person singular ending, re plus cover as a verb with that ending, and re plus cover as a noun with a plural ending. These are the analyses encoded by this grammar; their linguistic plausibility and intended use need separate evidence."}
                </p>
                <ManyReadings />
                <p>
                  {"Recovers has seven characters, which do not by themselves identify the intended reading. Adding entries can introduce alternatives, while changing rules can also remove incorrect ones. In this grammar, 108 of the 1,074 accepted forms have multiple analyses, or 10.1%. That measures its ambiguity, not proof that every returned reading is correct English."}
                </p>
                <p>
                  How fast it can grow is easiest to see on a grammar of four
                  lines, a piece of one character and a piece of two, each of
                  which may be followed by another. A word of six characters has
                  13 readings, of ten has 89, and of twelve has 233. The counts
                  are the Fibonacci numbers, for the reason the widget gives.
                </p>
                <Equation>
                  {"readings(n)  =  readings(n − 1) + readings(n − 2)"}
                </Equation>
                <KeepInMind>
                  {"The three paths show ambiguity under this grammar. Sentence context could help choose among plausible alternatives, and reference analyses could reveal overgeneration. The word-level traversal itself does neither."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            trueFalse(
              "In this constructed grammar, sharing stems and continuation entries lets 178 source contributions license 1,074 distinct spellings. Can the number of accepted forms grow faster than the entry count?",
              true,
              "The supplied grammar has 1,074 accepted spellings and 1,184 analysis paths from 178 source contributions. Shared continuations reuse entries across permitted combinations. The compiled machine has 342 transitions because one stem set is copied for prefix paths. These counts depend on this grammar’s lexical lists and compatibility rules; they are not a guarantee about every language or grammar.",
            ),
            choice(
              "At 178 pieces each, the grammar reads the 1,074 words in a mean of 2.648 pieces and the learned vocabulary in 2.943. What happens at 356 learned pieces?",
              [
                "The learned mean falls to 2.071, which is shorter than the grammar’s 2.648",
                "The learned mean barely moves, since the words are already short",
                "The grammar’s mean falls too, since it has more pieces available",
                "The learned vocabulary begins holding every one of the words whole",
              ],
              0,
              "At356 learned entries, the statistical vocabulary stores 37 of these words whole and shortens its sequences. The written grammar's analyses remain fixed because its rules did not change. Its surface pieces are not always one-to-one with morphemes, as baked shows. Compare grammatical labels and coverage as well as token count when deciding which representation serves the task.",
            ),
            choice(
              "The larger grammar is handed busiest. What comes back?",
              [
                "A cut with one piece marked unknown",
                "The nearest word the grammar does hold",
                "Nothing, since no path through the grammar spells those seven characters",
                "The seven characters one at a time",
              ],
              2,
              "No accepting path covers busiest, so analyze returns no readings. Under this tokenizer's fallback policy, segment passes the original word through as one piece. Those are different results: unchanged text is not a successful grammatical analysis. A learned tokenizer's own fallback or rejection policy also needs to be stated before comparing coverage.",
            ),
            several(
              "On a paragraph of seventy-six words, fifty of the commonest English words were added as lines. What did that buy?",
              [
                "Coverage by occurrence went from 9.2% to 60.5%",
                "Coverage by distinct word went from 12.3% to 47.4%",
                "Those fifty lines bought more on this text than the 178 lines that say something did",
                "They added structure as well, since the commonest words carry the most morphology",
              ],
              [0, 1, 2],
              "The fifty added words are explicit lexical entries. They improve coverage of this paragraph without extending the productive stem-and-ending rules. Thirty word occurrences remain unanalyzed. Some may need a stem entry, a spelling rule or an irregular-form entry; several can be handled by one appropriate rule, so the remaining word count is not automatically a required line count.",
            ),
            trueFalse(
              "The three readings of recovers are a defect that more lines would fix.",
              false,
              "Several analyses can share a spelling, and adding lexical paths can increase that ambiguity rather than select the intended reading. In the larger grammar,108 of 1,074 accepted spellings have multiple analyses, including three paths for recovers. Choosing a reading for a particular sentence needs contextual evidence or a declared selection policy, not merely additional paths.",
            ),
        ],
        },
        {
          title: "Part 6. Who Decides Which Analyses Belong in the Grammar?" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="21. Evaluating a Written Grammar" id="21-there-is-no-fact-the-grammar-can-be-checked-against">
                <p>
                  Each earlier learner has a stated objective, such as a merge count or description cost. Reproducing its result also requires the same tie rules, initialization and optimization procedure where applicable. Different legitimate choices can produce different vocabularies on the same corpus. For a hand-written grammar, reproducibility likewise needs the actual lexical entries and rules rather than a description of the intended language alone.
                </p>
                <p>
                  {"This analyzer has no fitted probability model: it returns analyses licensed by the supplied rules. The rules embody a linguistic annotation scheme that people may disagree about. Once a scheme and reference examples are chosen, we can test returned analyses for correctness, omissions and extra candidates."}
                </p>
                <p>
                  {"There is no optimization loop in this traversal, but grammar development can still use measurable objectives such as analysis accuracy, coverage and runtime. Raw-text coverage alone is insufficient: adding whole forms can raise it without providing the intended morphological distinctions."}
                </p>
                <KeepInMind>
                  {"Rerunning either method checks reproducibility, not whether its output suits the task. A written grammar can be evaluated automatically against labeled reference analyses, with linguistic review helping define and inspect those references. Coverage tests supply a different, narrower measure."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Outside the grammar is not the same as wrong about">
                <p>
                  {"For every nonempty input word, this API has a defined response: a list of permitted analyses, possibly empty. The recognized language is the set for which that list is nonempty. An unrecognized word is therefore outside the grammar’s coverage, not outside the analysis function’s input domain."}
                </p>
                <p>
                  {"An empty analysis can still be evaluated. Against labeled examples we can measure whether the expected analysis was returned, count missing analyses and inspect incorrect additional ones. Coverage on raw text answers a different question: how often does the grammar return any analysis? For busiest this grammar returns none, so the application needs a declared fallback or missing-coverage policy."}
                </p>
                <p>

                  We also need a policy for words the grammar cannot analyze. We could stop and extend the grammar, or pass the word to a fallback method. With a fallback, later code must handle both labeled morphological pieces and pieces without that analysis. Neither choice makes the unrecognized word disappear from the problem.
                </p>
                <KeepInMind>
                  No permitted path spells busiest under this grammar. The analyzer therefore has no candidate to score, rather than a low-scoring candidate it rejected. To handle the word, we need to extend the grammar or apply the declared fallback.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. How Ambiguity Grows" id="23-ambiguity-has-no-bound-the-method-can-supply">
                <p>
                  {"When several paths spell the word, the traversal returns them all under this grammar. That is exhaustive relative to its rules, but does not establish that the grammar includes every valid linguistic analysis or excludes every invalid one. The unweighted paths also do not rank which reading the sentence intends."}
                </p>
                <>
<p>
                  {"A consumer requiring one analysis needs a selection policy. The alphabetical tie rule here provides repeatability, not contextual evidence. More generally, a fixed grammar and a finite word give a finite analysis set in this API, but that set can become very large."}
                </p>
                <p>
                  {"The number of paths depends on both the grammar and the input length. With nonempty transitions, each path consumes at least one character per step. Branching can still make the total grow exponentially, as the repeating four-line grammar’s 233 paths on twelve characters demonstrate."}
                </p>
</>
                <p>
                  {"A context model can rank plausible analyses. It may use learned probabilities, hand-written context rules or a combination. Keeping morphological candidates and contextual disambiguation separate lets the application use evidence beyond the isolated word, rather than assuming more lexicon entries will choose the intended reading."}
                </p>
                <KeepInMind>
                  {"This word-level grammar describes permitted analyses. Choosing the intended one can require sentence context or another source of evidence. Adding that evidence is a separate part of the application."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Maintaining Grammar Coverage" id="24-a-language-moves-and-a-grammar-does-not">
                <p>
                  {"A grammar encodes decisions about a language and requires maintenance as the application or language changes. The practical question is how much of its lexicon, rules and infrastructure can be reused, and which missing patterns require new linguistic work."}
                </p>
                <p>
                  {"The 178 source contributions here describe a small English grammar. Another language needs its own lexical and morphological analysis, although compiler infrastructure and some design patterns may be reused. Learned methods also need suitable data and evaluation for a new language; retraining is not guaranteed to be an afternoon's work."}
                </p>

                <p>

                  A grammar&apos;s coverage can become outdated as new stems or uses appear. Existing rules may still analyze new combinations they already permit, so unfamiliar writing does not always require a new rule. Missing lexical entries and genuinely new patterns do require an update policy. A learned vocabulary has its own coverage and refitting limits; neither approach stays current merely because it previously accepted the examples.
                </p>
                <KeepInMind>
                  {"Explicit grammar work can provide analyses with inspectable labels and reusable rules. Its maintenance cost should be weighed against the coverage and accuracy required by the application. Learned methods shift part of that work toward data collection and evaluation rather than removing it."}
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Unknown stems, competing analyses and grammar choices" id="25-where-the-method-has-nothing-to-say">
                <p>The search can only find analyses that the grammar describes. An unknown stem, several valid analyses and a grammar with no accepting path are different situations. We need to decide how each should be reported to the person using the analyser.</p>
                <DerivationTable
                  expressionHeading="Word or grammar condition"
                  reasonHeading="Which analyses remain possible"
                  rows={[{"expression":"a word no path spells","reason":"The API returns an empty analysis list, a defined result indicating missing coverage. On the paragraph, this occurs for 69 of 76 occurrences before adding function words and 30 of 76 afterward. The application can report missing coverage, extend the grammar or apply a declared fallback."},{"expression":"a word several paths spell","reason":"The analyzer returns all permitted paths without a probabilistic ranking. That reports ambiguity under the supplied rules, not a guarantee of complete or correct linguistic analysis. Here 108 of 1,074 forms have multiple paths, and recovers has three."},{"expression":"which of several readings to hand on","reason":"The tokenizer interface chooses fewest pieces, then alphabetical tag string, then alphabetical pieces. On walks that selects the noun reading because N precedes V. This provides a deterministic choice; another consumer can preserve all analyses or use a context-based ranking."},{"expression":"whether the grammar is correct","reason":"The grammar procedure does not decide the linguistic annotation scheme. Once that scheme and labeled examples are specified, its returned analyses can be evaluated for accuracy and missing coverage. Raw-text coverage alone is insufficient: listing whole words can raise coverage without supplying the intended morphological features."},{"expression":"a spelling change between a stem and an ending","reason":"This SDK represents spelling alternations through explicit surface variants, such as bak labeled as bake. More complete systems can compile general spelling rules and compose them with a lexicon. Both strategies require correct rules and evaluation; neither universally guarantees better readability."},{"expression":"a piece that is spelled with nothing","reason":"A separate empty-surface morpheme is not represented by this API because every transition consumes a character. A stem transition can still carry the desired grammatical feature label. Allowing empty-input transitions would express a separate zero ending, but the traversal would then need appropriate handling of cycles."},{"expression":"what counts as a word before the grammar is reached","reason":"Preprocessing determines which units the grammar receives. The sentence has seven whitespace units or nine under the English annotation rules, each with one analyzable unit. The combined punctuation, lowercase and hyphen-splitting policy gives nine units with two analyzable. Record the policy alongside coverage."},{"expression":"a word that entered the language yesterday","reason":"An unfamiliar word can be accepted if existing stems and productive rules describe it. If no path matches, the API returns the same empty analysis list as for other uncovered forms. Monitoring coverage over new text can reveal changes, but diagnosing and repairing a missing linguistic pattern requires additional evidence or grammar work."}]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely what an
                  empty answer means downstream, how a tie between readings is
                  settled, whether spelling changes are written out or compiled,
                  and what counts as a word in the first place. Each has a
                  defensible answer on more than one side and each changes what
                  comes back, so each belongs in whatever describes an analyser
                  rather than being left to whoever writes one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 6",
          quiz: [
            trueFalse(
              "Two competent people writing a grammar for English converge on the same one, as two people running byte pair encoding on one corpus do.",
              false,
              "This analyzer follows supplied lexicons and continuation rules rather than learning one inventory from a fixed statistical objective. Different grammars can encode different analyses of the same spelling. Those decisions can be assessed against linguistic requirements and labeled test examples; the procedure itself does not force two authors to write identical grammars.",
            ),
            choice(
              "Why does this grammar return no analysis for busiest?",
              [
                "Because every reading is scored and this word scores zero",
                "No permitted path consumes the complete word and reaches an accepting state",
                "Because the word is too rare for a score to mean anything",
                "Because the pipeline stops before the grammar is reached",
              ],
              1,
              "The supplied paths do not accept the complete surface form busiest. The API therefore returns an empty set of analyses, rather than a numerical score. We can still measure this failure as part of coverage and compare the analyzer against expected analyses. The lack of a trained likelihood does not make the system impossible to evaluate.",
            ),
            choice(
              "Where a word has several readings, what does the page say the answer is?",
              [
                "More lines, until the grammar can tell them apart",
                "A better tie rule, derived from the grammar itself",
                "Contextual evidence, supplied by a learned model, hand-written context rules or a combination",
                "Reporting whichever reading is found first",
              ],
              2,
              "The isolated spelling does not select its intended sentence-level reading. A consumer can rank the licensed analyses using a learned context model or explicit context rules, or retain several alternatives. Adding lexical paths alone does not supply that selection policy.",
            ),
            several(
              "Which maintenance or assessment work is needed for this hand-authored grammar?",
              [
                "Language-specific entries and rules need appropriate review before adapting them to another language",
                "Unsupported stems or patterns need added entries or rules; the grammar does not learn them from corpus counts",
                "Coverage on newly collected text needs monitoring even when the existing examples still pass",
                "Grammatical correctness needs suitable labeled examples or linguistic review in addition to coverage counts",
              ],
              [0, 1, 2, 3],
              "The grammar needs language-appropriate knowledge, an update process for unsupported forms and evaluation against intended analyses. Existing productive rules may accept unfamiliar combinations, so a new word does not automatically require a new entry. The fifty added entries increased this paragraph's coverage from 9.2 to 60.5 percent. Labeled examples can make future checks repeatable, while linguistic review helps establish whether the expected analyses are appropriate.",
            ),
            trueFalse(
              "A grammar can gain coverage on a text by listing words while getting worse at describing how the language works.",
              true,
              "Adding whole-word entries can raise coverage without adding a useful account of their internal structure. In this paragraph, fifty entries raise coverage from 9.2 to 60.5 percent. Coverage and analysis quality are different measurements: expected analyses can be tested directly, and linguistic review can assess the distinctions those labels represent. The absence of a fitted scalar objective does not make these checks unmeasurable.",
            ),
        ],
        },
        {
          title: "Practice. Writing a Grammar and Reading Words With the Library",
          practice: [
            exercise(
              "Write the dropped e into the grammar",
              [
  "The starter’s grammar simply attaches endings to bake. It consequently recognizes bakeed and misses baked. Repair the spelling paths while preserving bakes and walked.",
  "Keep a bake stem path that can take s. Add a bak spelling labeled bake+V that can take ed or ing. Give those two sets of endings separate states, and include every state referenced by a path.",
  "For the original and repaired grammars, print state and entry counts, then analyze baked, bakeed, bakes and walked in that order. Print the analysis tags or no reading, followed by the segmentation. An unrecognized word remains one whole piece."
],
              `from oop_ml import FiniteStateAnalyzer, Lexicon, LexiconEntry
from oop_ml.core.natural_language_processing.tokenization.morphology.finite_state import END

verb_endings = Lexicon("verb ending", [
    LexiconEntry("s", "+3SG", END),
    LexiconEntry("ed", "+PAST", END),
    LexiconEntry("ing", "+PROG", END),
])
noun_endings = Lexicon("noun ending", [LexiconEntry("s", "+PL", END)])
regular = [
    LexiconEntry("walk", "walk+V", "verb ending"),
    LexiconEntry("walk", "walk+V", END),
    LexiconEntry("talk", "talk+V", "verb ending"),
    LexiconEntry("talk", "talk+V", END),
    LexiconEntry("walk", "walk+N", "noun ending"),
    LexiconEntry("walk", "walk+N", END),
]
bake_before = [
    LexiconEntry("bake", "bake+V", "verb ending"),
    LexiconEntry("bake", "bake+V", END),
]
before = FiniteStateAnalyzer(
    root="word",
    lexicons=(Lexicon("word", regular + bake_before), verb_endings, noun_endings),
)

# Build a second grammar, after, from the same regular lines. Give bake three
# lines of its own, the full stem leading to a state that holds only s, the
# full stem ending the word, and the spelling bak leading to a state that
# holds only ed and ing. Both spellings carry the label bake+V.

# For before and for after, print the number of states and of lines, then
# for baked, bakeed, bakes and walked the labels of every reading, or
# "no reading", and the pieces the word is cut into.`,
              `from oop_ml import FiniteStateAnalyzer, Lexicon, LexiconEntry
from oop_ml.core.natural_language_processing.tokenization.morphology.finite_state import END

verb_endings = Lexicon("verb ending", [
    LexiconEntry("s", "+3SG", END),
    LexiconEntry("ed", "+PAST", END),
    LexiconEntry("ing", "+PROG", END),
])
noun_endings = Lexicon("noun ending", [LexiconEntry("s", "+PL", END)])
regular = [
    LexiconEntry("walk", "walk+V", "verb ending"),
    LexiconEntry("walk", "walk+V", END),
    LexiconEntry("talk", "talk+V", "verb ending"),
    LexiconEntry("talk", "talk+V", END),
    LexiconEntry("walk", "walk+N", "noun ending"),
    LexiconEntry("walk", "walk+N", END),
]
bake_before = [
    LexiconEntry("bake", "bake+V", "verb ending"),
    LexiconEntry("bake", "bake+V", END),
]
before = FiniteStateAnalyzer(
    root="word",
    lexicons=(Lexicon("word", regular + bake_before), verb_endings, noun_endings),
)

bake_after = [
    LexiconEntry("bake", "bake+V", "ending that starts with a consonant"),
    LexiconEntry("bake", "bake+V", END),
    LexiconEntry("bak", "bake+V", "ending that starts with a vowel"),
]
consonant = Lexicon("ending that starts with a consonant", [LexiconEntry("s", "+3SG", END)])
vowel = Lexicon("ending that starts with a vowel", [
    LexiconEntry("ed", "+PAST", END),
    LexiconEntry("ing", "+PROG", END),
])
after = FiniteStateAnalyzer(
    root="word",
    lexicons=(Lexicon("word", regular + bake_after), verb_endings, noun_endings, consonant, vowel),
)

for label, grammar in [("before", before), ("after", after)]:
    lines = sum(lexicon.n_entries for lexicon in grammar.lexicons)
    print(f"{label}: {grammar.n_lexicons} states, {lines} lines")
    for word in ["baked", "bakeed", "bakes", "walked"]:
        labels = [reading.tags for reading in grammar.analyse(word)]
        cut = " ".join(grammar.segment(word).texts)
        print(f"  {word}: {', '.join(labels) or 'no reading'} | cut {cut}")`,
              `before: 3 states, 12 lines
  baked: no reading | cut baked
  bakeed: bake+V +PAST | cut bake ed
  bakes: bake+V +3SG | cut bake s
  walked: walk+V +PAST | cut walk ed
after: 5 states, 16 lines
  baked: bake+V +PAST | cut bak ed
  bakeed: no reading | cut bakeed
  bakes: bake+V +3SG | cut bake s
  walked: walk+V +PAST | cut walk ed`,
              {
question: "Can the grammar accept baked without also accepting bakeed?",
 hints: [
  "A LexiconEntry contains its consumed spelling, analysis label and next-state name. END allows a path to finish.",
  "Use separate continuation lexicons for s and for ed/ing. The original full stem and shortened spelling must point to the appropriate one.",
  "analyze returns the possible labeled readings; segment returns the selected pieces. A failed analysis and an unchanged segmentation are different observations."
] },
            ),
            exercise(
              "Count the readings, then make talk a noun",
              [
  "The grammar already treats walk as both a verb and a noun. Add the same noun possibility for talk, which currently has only its verb paths.",
  "Before and after the addition, analyze each of the twelve supplied words. Print the total number of readings and the words with more than one reading. Add both noun paths for talk: one ending the bare word and one continuing to the plural ending.",
  "Finally print the selected reading of talks. Distinguish the number of possible analyses from the number of distinct accepted spellings."
],
              `from oop_ml import FiniteStateAnalyzer, Lexicon, LexiconEntry
from oop_ml.core.natural_language_processing.tokenization.morphology.finite_state import END

endings = (
    Lexicon("verb ending", [
        LexiconEntry("s", "+3SG", END),
        LexiconEntry("ed", "+PAST", END),
        LexiconEntry("ing", "+PROG", END),
    ]),
    Lexicon("noun ending", [LexiconEntry("s", "+PL", END)]),
    Lexicon("ending that starts with a consonant", [LexiconEntry("s", "+3SG", END)]),
    Lexicon("ending that starts with a vowel", [
        LexiconEntry("ed", "+PAST", END),
        LexiconEntry("ing", "+PROG", END),
    ]),
)
stems = [
    LexiconEntry("walk", "walk+V", "verb ending"),
    LexiconEntry("walk", "walk+V", END),
    LexiconEntry("talk", "talk+V", "verb ending"),
    LexiconEntry("talk", "talk+V", END),
    LexiconEntry("bake", "bake+V", "ending that starts with a consonant"),
    LexiconEntry("bake", "bake+V", END),
    LexiconEntry("bak", "bake+V", "ending that starts with a vowel"),
    LexiconEntry("walk", "walk+N", "noun ending"),
    LexiconEntry("walk", "walk+N", END),
]
accepted = [
    "walk", "walks", "walked", "walking",
    "talk", "talks", "talked", "talking",
    "bake", "bakes", "baked", "baking",
]

grammar = FiniteStateAnalyzer(root="word", lexicons=(Lexicon("word", stems), *endings))
# Print the total number of readings over the twelve accepted words and the
# words that have more than one.

# Write the two lines that make talk a noun, labelled talk+N, build a second
# grammar from stems plus those two, and print the same two things for it.
# Then print the labels of the reading of talks that is handed on.`,
              `from oop_ml import FiniteStateAnalyzer, Lexicon, LexiconEntry
from oop_ml.core.natural_language_processing.tokenization.morphology.finite_state import END

endings = (
    Lexicon("verb ending", [
        LexiconEntry("s", "+3SG", END),
        LexiconEntry("ed", "+PAST", END),
        LexiconEntry("ing", "+PROG", END),
    ]),
    Lexicon("noun ending", [LexiconEntry("s", "+PL", END)]),
    Lexicon("ending that starts with a consonant", [LexiconEntry("s", "+3SG", END)]),
    Lexicon("ending that starts with a vowel", [
        LexiconEntry("ed", "+PAST", END),
        LexiconEntry("ing", "+PROG", END),
    ]),
)
stems = [
    LexiconEntry("walk", "walk+V", "verb ending"),
    LexiconEntry("walk", "walk+V", END),
    LexiconEntry("talk", "talk+V", "verb ending"),
    LexiconEntry("talk", "talk+V", END),
    LexiconEntry("bake", "bake+V", "ending that starts with a consonant"),
    LexiconEntry("bake", "bake+V", END),
    LexiconEntry("bak", "bake+V", "ending that starts with a vowel"),
    LexiconEntry("walk", "walk+N", "noun ending"),
    LexiconEntry("walk", "walk+N", END),
]
accepted = [
    "walk", "walks", "walked", "walking",
    "talk", "talks", "talked", "talking",
    "bake", "bakes", "baked", "baking",
]

talk_as_a_noun = [
    LexiconEntry("talk", "talk+N", "noun ending"),
    LexiconEntry("talk", "talk+N", END),
]

for label, lines in [("as printed", stems), ("with talk a noun", stems + talk_as_a_noun)]:
    grammar = FiniteStateAnalyzer(root="word", lexicons=(Lexicon("word", lines), *endings))
    counts = {word: grammar.analyse(word).n_analyses for word in accepted}
    twice = [word for word, count in counts.items() if count > 1]
    print(f"{label}: {sum(counts.values())} readings of {len(accepted)} words")
    print(f"  more than one reading: {' '.join(twice)}")

print(f"talks is handed on as {grammar.analyse('talks').shortest.tags}")`,
              `as printed: 14 readings of 12 words
  more than one reading: walk walks
with talk a noun: 16 readings of 12 words
  more than one reading: walk walks talk talks
talks is handed on as talk+N +PL`,
              {
question: "Can the same spelling gain a second grammatical reading without adding a new word?",
 hints: [
  "Sum each result’s n_analyses over the supplied words. Keep the per-word counts to identify ambiguity.",
  "Use walk’s two noun entries as the model for talk, changing both spelling and stem label.",
  "The library selects among equally short analyses with its deterministic label ordering. That selection does not resolve the meaning in a sentence."
], check: numberCheck("How many readings do the twelve words have once talk is a noun as well?", 16, 0, "The twelve spellings now have 16 readings. Talk and talks each gained a noun analysis, while the set of accepted spellings stayed the same.") },
            ),
            exercise(
              "Grow the readings on a grammar of four lines",
              [
  "A grammar can have very few entries and still permit many readings. Build one state that accepts either a or aa, with each piece allowed either to end the word or to return to that state.",
  "Analyze strings containing 5, 6, 10, 12 and 15 copies of a. For each, print its length, the number of analyses and the pieces of the selected shortest analysis.",
  "Every transition must consume a character. This makes the set of readings finite for each supplied word even though the state has a loop."
],
              `from oop_ml import FiniteStateAnalyzer, Lexicon, LexiconEntry
from oop_ml.core.natural_language_processing.tokenization.morphology.finite_state import END

# Build an analyser whose one state, word, holds four lines. The spelling a,
# labelled one, leads back to word, and also ends the word. The spelling aa,
# labelled two, does the same.

for length in [5, 6, 10, 12, 15]:
    # Read a word of this many a's. Print its length, how many readings it
    # has, and the pieces of the reading that is handed on.
    ...`,
              `from oop_ml import FiniteStateAnalyzer, Lexicon, LexiconEntry
from oop_ml.core.natural_language_processing.tokenization.morphology.finite_state import END

grammar = FiniteStateAnalyzer(
    root="word",
    lexicons=(
        Lexicon("word", [
            LexiconEntry("a", "one", "word"),
            LexiconEntry("a", "one", END),
            LexiconEntry("aa", "two", "word"),
            LexiconEntry("aa", "two", END),
        ]),
    ),
)

for length in [5, 6, 10, 12, 15]:
    readings = grammar.analyse("a" * length)
    handed_on = " ".join(readings.shortest.morphs)
    print(f"{length} characters: {readings.n_analyses} readings, handed on as {handed_on}")`,
              `5 characters: 8 readings, handed on as a aa aa
6 characters: 13 readings, handed on as aa aa aa
10 characters: 89 readings, handed on as aa aa aa aa aa
12 characters: 233 readings, handed on as aa aa aa aa aa aa
15 characters: 987 readings, handed on as a aa aa aa aa aa aa aa`,
              {
question: "How many segmentations can a tiny looping grammar produce?",
 hints: [
  "Each of the two spellings needs a finishing entry and a continuing entry, giving four entries in one Lexicon.",
  "Pass the single lexicon as a one-element tuple. Its continuing entries can name that same state.",
  "Read n_analyses for the full count and shortest.morphs for the selected cut. An arbitrary deterministic tie rule can choose between cuts with equal length."
], check: numberCheck("How many readings does a word of fifteen characters have?", 987, 0, "The fifteen-character word has 987 readings. Only a few entries are needed because the loop reuses them at successive positions; the chosen shortest reading represents one of those possibilities.") },
            ),
          ],
        },
      ]}
    />
  );
}
