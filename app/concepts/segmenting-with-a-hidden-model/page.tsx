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
import { CorpusSizeCurve } from "@/components/widgets/CorpusSizeCurve";
import { HiddenModelPlayground } from "@/components/widgets/HiddenModelPlayground";
import { LearnedTables } from "@/components/widgets/LearnedTables";
import { SmoothingDial } from "@/components/widgets/SmoothingDial";
import { TagTrellis } from "@/components/widgets/TagTrellis";
import { ThreeMethodsOneCorpus } from "@/components/widgets/ThreeMethodsOneCorpus";
import { TwinLanguages } from "@/components/widgets/TwinLanguages";



export const metadata: Metadata = pageMetadata("/concepts/segmenting-with-a-hidden-model", {
  title: "Segmenting With a Hidden Model · Perceptron Lab",
  description: "Hidden states can describe which characters begin or end a word even when those labels are unobserved. A probabilistic model compares possible state sequences to infer likely word boundaries.",
});

export default function SegmentingWithAHiddenModelPage() {
  return (
    <ConceptPage
      lessonId="segmenting-with-a-hidden-model"
      intuition={lessonIntuitions["segmenting-with-a-hidden-model"]}
      technicalStart="Part 2. Four Places, and Why Four Are Enough"
      openingTitle="A Word the Dictionary Has Never Seen"
      playgroundTitle="Choose the most likely sequence of boundary states"
      playgroundIntro="Compare the character observations with their proposed position labels. Follow the complete label sequence and check how it determines the word boundaries."
      title="Segmenting With a Hidden Model"
      tagline={"Hidden states can describe which characters begin or end a word even when those labels are unobserved. A probabilistic model compares possible state sequences to infer likely word boundaries."}
      prerequisites={
        <>
          The two dictionary pages of this section, since this one is the repair
          for the failure both of them share. Nothing here needs a word list at
          all, and what it needs instead is sentences somebody has already cut up
          into words. The arithmetic is counting, division, and adding
          logarithms, and the search is the one the word lattice page derived,
          run over places in a word rather than words in a sentence.
        </>
      }

      playground={<HiddenModelPlayground />}
      sections={[
        {
          title: "Part 1. The Word No List Can Reach",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What both dictionary methods have in common">
                <p>

                  Both dictionary methods are limited by their entries. Even a better path score cannot select a word the candidate list never included. Could we learn where words begin and end from examples instead? We will use sentences with labeled boundaries to learn a model over character positions.
                </p>
                <p>

                  The controlled comparison gives all three methods the same three labeled sentences. They contain six word occurrences and three distinct words. The dictionary methods use the counted words, while the hidden-state model learns from the characters and their word-role labels. The test then presents six characters forming three words absent from those sentences, so we can inspect what each representation permits it to recognize.
                </p>
                <ThreeMethodsOneCorpus show="novel" />
                <p>Both dictionary methods return six single characters because none of the complete test words is in their word lists. The hidden-state model returns the intended three two-character words.</p>
                <p>In the training sentences, a, c and e always began words, while b, d and f always ended them. The test combines these familiar character roles into unseen words such as ad. The model can reuse the role information even though it never stored ad as a dictionary entry. This success depends on the deliberately simple training pattern.</p>
                <KeepInMind>
                  {"A bare dictionary search cannot return an unavailable multi-character entry as one word. The character-role model changes what can be represented: it can propose boundaries for new combinations of familiar characters. Its learned scores still decide which proposal wins."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Asking the character instead of the stretch">
                <p>
                  {"Instead of matching a whole substring against a list, assign each character a role such as beginning or ending a word. The role describes its position in a proposed segmentation. It can be predicted for an unlisted word, though the prediction need not be correct."}
                </p>
                <p>
                  {"The supplied dictionary lacks Alvarez and splits the illustrated five-character Chinese transliteration into separate pieces. A dictionary could contain that name. Here it gives us a controlled missing-word example: the character model can represent the name as one word without adding it to a list, while still needing evidence to choose that boundary pattern."}
                </p>
                <p>
                  {"For this comparison, the dictionary frequencies and character-role model are built from the same segmented sentences. That keeps their training evidence controlled. Dictionaries can also be compiled or counted in other ways, so this experiment does not claim every dictionary needs exactly this supervision."}
                </p>
                <KeepInMind>
                  {"The model scores character roles rather than requiring a whole-word entry. The labels are supplied during this training procedure and hidden when we segment new text. “Hidden” therefore does not mean this example learns its training boundaries without labels."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Four Places, and Why Four Are Enough",
          content: (
            <>
              <SubSection title="3. Where a character sits in its word">
                <p>
                  Consider where a character sits within its word. In a multi-character word it can begin the word, lie in the middle, or end it. A one-character word needs its own label because the character both begins and ends that word. These give us four states with which to describe a segmentation.
                </p>
                <Equation>
                  {"a word of one character      →   S"}
                </Equation>
                <Equation>
                  {"a word of k characters, k ≥ 2   →   B  M … M  E,  with k − 2 middles"}
                </Equation>
                <p>
                  The letters are the usual shorthand and they stand for begins,
                  middle, ends and single. Read a whole sentence this way and you
                  get one letter per character. The six characters that mean
                  either research into the origin of life or a graduate
                  student&rsquo;s fate and origin are B E B E B E under the first
                  reading, since it is three two-character words, and B M E S B E
                  under the second, since it is a three-character word, then a
                  one-character word, then a two-character word.
                </p>
                <WorkedExample>
                  <p>
                    Going the other way is a rule with no choices in it. Walk the
                    letters from the left, keep collecting characters, and finish
                    a word whenever the letter is E or S. B E B E B E gives back
                    the three two-character words and B M E S B E gives back the
                    three of the other reading, and nothing had to be looked up
                    or scored, since the letters already say where the boundaries
                    are.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A cut of a text and a run of these four letters over its
                  characters are the same object described twice. Choosing the
                  letters is therefore choosing the cut, and the whole method is
                  a way of choosing the letters.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Every cut is one run of places, and every run is one cut">
                <p>

                  That correspondence deserves to be checked rather than
                  believed, because everything after it depends on the letters
                  being able to say whatever a cut can say. Between any two
                  neighboring characters there either is a boundary or there is
                  not, so a run of n characters admits two to the power of n
                  minus one cuts. Count the runs of letters instead, allowing
                  only those that describe some cutting, and the count comes out
                  the same.
                </p>
                <Equation>
                  {"runs of places over n characters  =  2^(n − 1)  =  ways to cut n characters"}
                </Equation>
                <NumberTable
                  headings={[
                    "characters",
                    "runs of four letters in all",
                    "runs that describe a cut",
                    "ways to cut",
                  ]}
                  rows={[
                    ["1", "4", "1", "1"],
                    ["2", "16", "2", "2"],
                    ["3", "64", "4", "4"],
                    ["6", "4,096", "32", "32"],
                    ["10", "1,048,576", "512", "512"],
                  ]}
                  caption="Counted by trying every run of four letters of each length and keeping the ones that describe a cutting, which is the check written from the definition rather than from the recurrence. Most runs of letters describe nothing; the ones that survive are in step with the cuts exactly."
                />
                <>
<p>
                  The state representation can express boundary patterns beyond a fixed dictionary. On the twenty-eight-character example, the word lattice allowed 2,592 of the 134,217,728 possible patterns. The character-role representation can describe all 134,217,728 before their scores are considered, including many segmentations we would reject linguistically. Representation coverage alone does not choose a good reading.
                </p>
                <p>
                  That is the same fact as section 1 seen from the other side, since a word nobody listed sits on some cut of the characters that spell it, and every cut is reachable here.
                </p>
</>
                <KeepInMind>
                  Every cut has exactly one run of letters and every admissible
                  run of letters has exactly one cut, so working in letters keeps
                  every cut available and admits nothing that is not a cut. That
                  is what makes it safe to spend the rest of the page choosing
                  letters.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Half the steps from one place to the next cannot happen">
                <p>

                  A character labeled Begin or Inside leaves its word open, so the next role must be Inside or End. A character labeled End or Single closes a word, so the next role must be Begin or Single. These conventions rule out eight of the sixteen role pairs before estimating any probabilities. They encode valid role sequences, rather than learning every transition from an observed count.
                </p>
                <DerivationTable
                  expressionHeading="after this place"
                  reasonHeading="only these may follow, and why"
                  rows={[
                    {
                      expression: "B, a character that begins a word",
                      reason:
                        "M or E, since the word it opened has to be finished. B then B would mean a word beginning inside another word.",
                    },
                    {
                      expression: "M, a character inside a word",
                      reason:
                        "M or E, for the same reason. A word open in the middle is still open.",
                    },
                    {
                      expression: "E, a character that ends a word",
                      reason:
                        "B or S, since the word has closed and whatever comes next starts a new one.",
                    },
                    {
                      expression: "S, a character that was a word alone",
                      reason:
                        "B or S, for the same reason. Nothing is open, so nothing can continue.",
                    },
                    {
                      expression: "the first character of a run",
                      reason:
                        "B or S, since there is no open word behind it to be the middle or the end of.",
                    },
                    {
                      expression: "the last character of a run",
                      reason:
                        "E or S, since a word left open at the end of the text is not a cutting of anything.",
                    },
                  ]}
                />
                <p>
                  {"The decoder excludes the eight illegal role transitions. Smoothing applies only to the remaining transitions. This preserves the correspondence between an admissible role sequence and a segmentation; it is a structural rule rather than a low learned probability."}
                </p>
                <KeepInMind>
                  {"The state design fixes which transitions are legal. Fitting estimates the probabilities of the allowed ones. Keeping those decisions separate lets us inspect what came from the representation and what came from the examples."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "What question does this method ask in place of the question a word list answers?",
              [
                "Of one character, where in its word it happens to sit",
                "Of a stretch of characters, which word it is, scored more carefully",
                "Of a stretch of characters, how often the corpus contained it",
                "Of each gap between characters, whether some entry of the list permits a boundary there",
              ],
              0,
              "The model assigns each character a boundary role, then turns the role sequence into words. That lets it propose multi-character pieces absent from a word dictionary. It still needs learned probabilities and permitted transition rules, so being able to label every position does not guarantee the resulting words are correct.",
            ),
            trueFalse(
              "In this comparison, the word dictionary and boundary-state model are built from the same sentences already divided into words.",
              true,
              "The experiment uses one labeled corpus to provide both word entries and state-count evidence. That controls the training information when comparing methods. A dictionary can also be curated or obtained elsewhere; this comparison deliberately avoids giving one method extra labeled text.",
            ),
            choice(
              "On twenty-eight characters of ordinary English a word lattice held 2,592 readings out of 134,217,728. How many does a run of the four letters reach?",
              [
                "All 134,217,728, including every cut no dictionary would allow",
                "The same 2,592, since the letters are only another way of writing a lattice",
                "Four per character, so 112",
                "Two per character, so 56",
              ],
              0,
              "Every cut has exactly one run of letters and every admissible run of letters has exactly one cut, and both counts come to two to the power of n minus one. That is the same fact as the unlistable word seen from the other side, since a word nobody listed sits on some cut of the characters that spell it.",
            ),
            several(
              "Eight of the sixteen pairs of places are ruled out before any text is looked at. Which of these follow?",
              [
                "A place has two possible successors rather than four",
                "The search cannot answer something like B B, which is a run that cannot be cut into words at all",
                "The counting decides which of the remaining eight steps are common and never gets a say in whether the other eight are possible",
                "The eight are learned from the corpus and smoothed down toward zero",
              ],
              [0, 1, 2],
              "The boundary-role convention permits only eight state transitions. Smoothing adds to all permitted outcomes, including those already observed, while forbidden transitions remain impossible. Those constraints ensure a valid state sequence can be read as a segmentation. They are structural assumptions supplied before fitting, rather than facts the model discovers from the corpus.",
            ),
            trueFalse(
              "Turning a run of the four letters back into words needs the pieces looked up somewhere.",
              false,
              "Going that way is a rule with no choices in it. Walk the letters from the left, keep collecting characters, and finish a word whenever the letter is E or S, so B E B E B E gives back three two-character words and B M E S B E gives back a three, a one and a two. The letters already say where the boundaries are.",
            ),
        ],
        },
        {
          title: "Part 3. What Is Counted, and What Is Added To It",
          content: (
            <>
              <SubSection title="6. Three tables, and all of them are counts">
                <p>
                  {"The segmented examples provide a role for every character. We count legal starting roles, adjacent role pairs and characters emitted in each role. Dividing the smoothed counts by their row totals then estimates the model’s probability tables."}
                </p>
                <p>
                  Two sentences over three characters are small enough to read
                  every number of. The first is the two-character word ab
                  followed by the one-character word c, so its letters are B E S.
                  The second is the single three-character word abc, so its
                  letters are B M E.
                </p>
                <LearnedTables corpusKeys={["two sentences", "five sentences"]} />
                <>
<p>
                  Read the middle table across. Both sentences started with a character that begins a word, so of the two starts, two were B and none was S. After a B there was one M and one E. After the only M there was one E and no further M. After the only E there was one S and no B.
                </p>
                <p>
                  And after S there was nothing at all, since the one S in the corpus was the last character of its sentence. That last row is the interesting one, and the next section is about it.
                </p>
</>
                <KeepInMind>
                  {"This is supervised parameter fitting by counting and normalization. It needs no iterative gradient optimizer or convergence loop. With the same data, smoothing, role convention and implementation, the fitted tables are reproducible."}
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A count of zero would end the search before it started">
                <p>
                  A path score multiplies emission and transition probabilities. One zero makes the entire product zero, excluding every path that uses it. With a small corpus, a permitted event may have zero count simply because it was never observed. We therefore add a smoothing amount to allowed outcomes before normalizing the counts. Transitions forbidden by the state design remain forbidden.
                </p>
                <Equation>{"P(next role | current role) = (observed pair count + a) / (observed outgoing-transition total + 2a)"}</Equation>
                <p>
                  {"Each role has two legal successors. The denominator counts the observed transitions leaving that role, then adds smoothing for those two outcomes. A role occurring only at a sentence end contributes no outgoing transition. Forbidden pairs receive no probability mass."}
                </p>
                <WorkedExample>
                  <>
                    <p>
                      Add one to every legal outcome before normalizing. In the
                      two-sentence example, both sentences start in B, and neither
                      starts in S. There are two legal start states.
                    </p>
                    <Equation>{"P(start B) = (2 + 1) / (2 + 2) = 3/4\nP(start S) = (0 + 1) / (2 + 2) = 1/4"}</Equation>
                    <p>
                      A B is followed once by M and once by E, so those alternatives
                      remain equally likely. M has been followed by E once and by M zero
                      times.
                    </p>
                    <Equation>{"P(M | B) = P(E | B) = (1 + 1) / (2 + 2) = 1/2\nP(M | M) = (0 + 1) / (1 + 2) = 1/3\nP(E | M) = (1 + 1) / (1 + 2) = 2/3"}</Equation>
                    <p>
                      The same counting rule gives E a one-third probability of
                      transitioning to B and a two-thirds probability of transitioning
                      to S.
                    </p>
                  </>
                  <p>
                  {"No transition follows S in this corpus. Without smoothing, its outgoing row cannot be normalized from the zero counts. With add-one smoothing, its two allowed successors each receive one half. That is the chosen symmetric estimate, rather than an absence of any model prediction."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  Smoothing here makes an estimate exist at all for the outcomes
                  a small corpus did not happen to show, rather than refining one
                  that was already there, and the ninth section measures what it
                  decides while it is doing that.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The spare slot, so an unfamiliar character still costs something">
                <p>
                  {"Emission rows need a policy for characters absent from the observed alphabet. This model reserves an unknown slot alongside the known characters and normalizes over those slots for each role. A new character uses that slot rather than receiving a zero probability or a new fitted row."}
                </p>
                <Equation>
                  {"P(character | place)  =  (count of that pair + a) / (count of the place + a × (alphabet + 1))"}
                </Equation>
                <>
                  <p>
                    The observed alphabet contains a, b and c. Add an unknown-character
                    slot, giving four possible emissions. State B emitted a twice and no
                    other character.
                  </p>
                  <Equation>{"P(a | B) = (2 + 1) / (2 + 4) = 1/2\nP(b | B) = P(c | B) = P(unknown | B) = (0 + 1) / (2 + 4) = 1/6"}</Equation>
                  <p>
                    State S emitted c once. Apply the same rule with its own counts.
                  </p>
                  <Equation>{"P(c | S) = (1 + 1) / (1 + 4) = 2/5\nP(a | S) = P(b | S) = P(unknown | S) = (0 + 1) / (1 + 4) = 1/5"}</Equation>
                </>
                <p>
                  {"Within one role, an observed character with zero emissions in that role gets the same smoothed value as the unknown slot. Other roles may have seen that character and assign it a different value. An entirely unseen character uses the unknown value in every role, which need not be the same value across roles."}
                </p>
                <KeepInMind>
                  Every row of the character table sums to one over the alphabet
                  and the spare slot together. The share sitting in that spare
                  slot is the whole of what the model has to say about a character
                  it has never met, and it says it four times, once per place.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the helping decides, on a corpus that disagrees with itself">
                <p>
                  {"The four training sentences use the research prefix in different word groupings: the two-character entry appears twice, while the three-character entry appears once. Those contexts need not be contradictory annotations. The sweep tests how smoothing changes the model’s reading of the selected five-character sentence. “Majority” and “minority” in the displayed control refer to those prefix-entry counts."}
                </p>
                <SmoothingDial />
                <>
<p>
                  At the usual value of one, and at a half, and at a quarter, the model answers the majority reading and therefore fails to reproduce a sentence it was itself trained on. Below about 0.238 it answers the minority reading and the training sentence comes back as written. The middle figure in the widget is what moves.
                </p>
                <p>
                  {"In this corpus, M emitted 究 once and no other character. At smoothing two, its probability for 究 is 0.1429; at one hundredth, it is 0.9182. A larger smoothing amount spreads more weight across the other emission slots. A smaller amount gives that single observation more influence, without proving it predicts the intended boundary better."}
                </p>
</>
                <InAModel>
                  <p>
                  {"The same corpus supports different decoded boundaries under different smoothing values. Reproducing one training example is not, by itself, a generalization test. Choose smoothing using evidence appropriate to the task, such as held-out segmented text, and record the value with the result."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"In this four-sentence example, the preferred reading changes near smoothing 0.238. That threshold follows from the fitted probabilities for these counts; it is not a universal constant or a failure of the method to define an answer."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Finding the Best Run of Places",
          content: (
            <>
              <SubSection title="10. What a whole run of places is worth">
                <>
<p>
                  {"To score proposed roles for this observed text, multiply the first role’s start probability by its character-emission probability. For each later character, multiply the transition probability from the previous role and the emission probability under the new role. This is a joint model weight for the roles and observations, not an independently calibrated probability that the word boundaries are correct."}
                </p>
                <p>
                  {"Logarithms turn the positive path-factor product into a sum and help avoid numerical underflow on long or low-probability sequences. The sequence length at which a direct product underflows depends on the probabilities and number format."}
                </p>
</>
                <Equation>
                  {"score  =  log P(t₁) + log P(c₁ | t₁) + Σ over i ≥ 2 of [ log P(tᵢ | tᵢ₋₁) + log P(cᵢ | tᵢ) ]"}
                </Equation>
                <p>
                  {"The score adds an emission term per character and a transition term per adjacent role pair. There is no explicit parameter for the identities of two neighboring characters together. Inference still couples positions through the hidden-role sequence, so the model can capture some observation dependencies indirectly."}
                </p>
                <KeepInMind>
                  {"The tables give a local score to each proposed role and transition. The full decoder combines those terms across the text. This limits which patterns the model can distinguish, while still allowing surrounding observations to influence the selected role sequence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The same recurrence as the lattice, one level down">
                <>
<p>
                  {"The number of admissible role sequences grows rapidly with length. We can avoid scoring them separately by keeping the best score for each role at each character. A best prefix reaching one role can be reused because the next transition depends on that role, not the full earlier path."}
                </p>
                <p>
                  Otherwise a better head could be swapped in, leaving the tail untouched and raising the total, which contradicts the run having been best.
                </p>
</>
                <Equation>
                  {"best(i, t)  =  log P(cᵢ | t)  +  max over places s that may precede t of [ best(i − 1, s) + log P(t | s) ]"}
                </Equation>
                <p>
                  So carry four numbers rather than one, since a tail depends on
                  which place the head finished in, and there are four places it
                  could have finished in. At every character work out, for each of
                  the four, the best way of arriving there and which place it came
                  from; at the end take the better of the two places a text may
                  finish in and walk the record backwards. The grid below is that
                  calculation with nothing hidden.
                </p>
                <TagTrellis
                  scenarioKeys={["research", "student", "two-sentence"]}
                />
                <>
<p>
                  Only two of the four starting-state cells are populated because a text may begin with a new word or a single-character word, rather than in the middle or at the end of an unfinished one. Later cells compare allowed predecessor paths. Missing entries here can therefore express a structural prohibition, which differs from a low probability caused by limited observations.
                </p>
                <p>
                  {"Each filled cell stores the best prefix score ending in that role at that character. Backtracking from the best allowed final role selects the displayed line. It need not choose the highest cell independently in every column. For this example, the selected roles are B E B E B E, giving three two-character words."}
                </p>
</>
                <WhyThisWorks title="The same path search, with states in place of dictionary words">
                  <>
<p>
                    The earlier word-lattice search stored a best path value at each text position. Here we need a best value for each possible character role as well, so the table has four entries per character. The dynamic-programming idea is similar, but its state must retain the role needed to score the next transition.
                  </p>
                  <p>
                  {"Both searches use dynamic programming, related to Bellman’s principle of optimality and Viterbi decoding. The word lattice stores boundary values; this model stores a value for each boundary role at a character position. Those different states determine which dependencies each recurrence can retain."}
                </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"Keep a best prefix score for each of the four roles, along with the preceding role that produced it. Those records are enough to reconstruct one full best path because the next transition depends on the current role rather than the entire earlier sequence."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The number of state comparisons per character" id="12-what-it-costs-which-is-the-same-for-every-text">
                <p>
                  {"There are at most eight allowed predecessor-transition candidates at each new character and two possible starting-role scores. The formula below counts that dense candidate budget for a nonempty run. The SDK skips unreachable predecessors, so it is not an instrumented count of primitive comparisons actually executed."}
                </p>
                <Equation>{"dense candidate-score budget for nonempty run = 8 × (n − 1) + 2"}</Equation>
                <NumberTable
                  headings={[
                    "text",
                    "characters",
                    "runs of places over them",
                    "dense candidate-score budget",
                  ]}
                  rows={[
                    ["研究生命起源", "6", "32", "42"],
                    ["阿尔瓦雷斯研究生命起源", "11", "1,024", "82"],
                    ["our sentence, spaces removed", "45", "17,592,186,044,416", "354"],
                  ]}
                  caption="The admissible-path count follows the four-state boundary grammar. The displayed work budget allows four roles with up to two predecessor transitions per later character plus two starts. Actual code skips unreachable predecessors; the budget is not a measured runtime."
                />
                <p>
                  {"The state count stays four as the corpus grows, so the decoding transition budget does not scale with dictionary word length. Training and storage still depend on the observed characters and counts. This small state space is useful, but it does not make runtime optimization or memory costs irrelevant."}
                </p>
                <KeepInMind>
                  {"The dense candidate budget is linear in nonempty run length. Equal-length runs have the same stated upper bound, while actual execution can differ when states are unreachable or lookups differ. A larger training corpus can change stored emissions even though it does not add states."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "Why is a fixed amount added to every outcome that could have happened?",
              [
                "A run of letters is scored as a product, so one zero makes the whole product zero and a reading would be ruled out by an accident of what the corpus held",
                "To make each row of each table sum to one",
                "To keep the counts from growing without bound as the corpus grows",
                "To refine the estimates that the counting had already produced",
              ],
              0,
              "Without smoothing, an unobserved allowed event receives zero probability and rules out every path containing it. Smoothing gives those events nonzero estimates. It expresses a modeling choice about missing evidence; it does not establish how often they actually occur.",
            ),
            choice(
              "The word lattice kept one number per position. Why does this search keep four per character?",
              [
                "A tail depends on which place the head finished in, and there are four places it could have finished in",
                "Each place can be followed by four others, so four candidates have to be compared at every character",
                "The start table and the three learned tables contribute one number each",
                "Four is how many characters the longest word of the corpus has",
              ],
              0,
              "A place summarizes everything about the head of a reading that the tail is allowed to care about, so the best way of arriving at each of the four places has to be carried separately, together with the place it came from, and at the end the better of the two places a text may finish in is taken and the record walked backwards. Each place is reached from at most two others, not four, which is the refusal of the fifth section at work. The lattice needed one number because its state was a position; here the state is a place, and a place is available at every character of every text.",
            ),
            choice(
              "Nothing at all followed the single S in the two-sentence corpus. What does the fitted model say about what follows an S?",
              [
                "One half each for the two admissible successors, which is the model reporting that it has never seen what follows a one-character word",
                "Zero for both, so any reading using that step is impossible",
                "One quarter each across all four places, since nothing was observed to narrow it",
                "The same shares as the row for E, since both of them close a word",
              ],
              0,
              "No observed transition leaves S in this corpus. Add-one smoothing gives equal weight to its two permitted successors, producing one half each. That is the estimator’s symmetric prior convention when evidence is absent, not a measured claim that the two successors truly occur equally often.",
            ),
            several(
              "The four training sentences use a shared character prefix with different word groupings. Which changes does the supplied smoothing sweep show as the amount decreases from two to a hundredth?",
              [
                "At one, at a half and at a quarter the model answers the majority reading, so it fails to reproduce a sentence it was itself trained on",
                "Below about 0.238 it answers the minority reading and the training sentence comes back as written",
                "The share of the place inside a word producing the second character rises from 0.1429 at a helping of two to 0.9182 at a hundredth",
                "Smoothing is a configuration choice. A fixed smoothing contribution becomes smaller relative to growing observed-event counts, while rare or unseen events may remain sensitive.",
              ],
              [0, 1, 2, 3],
              "Changing smoothing changes how strongly this small model relies on sparse observed counts. The best path switches at the tested setting even though the labeled corpus is unchanged. A lower value is not automatically memorization, and reproducing a training sentence is not a general accuracy test. Choose the setting with representative validation data and report it alongside the result.",
            ),
            trueFalse(
              "For equal-length inputs, this decoder considers the same allowed-state transitions regardless of how many sentences were used to fit its tables.",
              true,
              "The dynamic program has four possible states per character and at most two permitted predecessors for each. Its state-comparison count therefore grows linearly with input length, with a fixed state-space factor. A larger training corpus can change the probabilities and stored character alphabet, but does not add more boundary states. This is an operation-count statement, not a guarantee of identical wall-clock time.",
            ),
        ],
        },
        {
          title: "Part 5. What the Places Buy and What They Cost",
          content: (
            <>
              <SubSection title="13. Reading a word the sentences never held">
                <p>
                  Back to the six characters of the first section, now with the
                  search visible. The three sentences the model was fitted on
                  contain three words and none of them appears in the text at all,
                  so a word list has nothing to match and every candidate on the
                  previous page&rsquo;s lattice is a single character.
                </p>
                <TagTrellis scenarioKeys={["novel", "name"]} />
                <>
<p>
                  What decides is the character table. In those three sentences a, c and e only ever produced under the place that begins a word, and b, d and f only under the place that ends one, so at the first character the cell for begins carries a much larger number than the cell for alone, and at the second the cell for ends carries a much larger number than the cell for begins.
                </p>
                <p>
                  The run that wins alternates, and reading it off gives three words that were never in the corpus and are the right three.
                </p>
</>
                <>
<p>
                  Our surname example shows the remaining difficulty. The corpus has never seen its five characters. Dictionary matching returns eight pieces, including five single characters. The hidden-state method returns seven after joining the first two surname characters, but still differs from the four-word reference. Its representation permits that reference in principle; the learned scores and unknown-character treatment do not select it here.
                </p>
                <p>
                  The nineteenth section is about why that particular wrong answer, and it turns out to have nothing to do with the name.
                </p>
</>
                <KeepInMind>
                  {"Character-role patterns let this model join new combinations of observed characters in the controlled example. On entirely unseen characters, it still uses learned role priors, transitions and unknown emissions. Those may happen to give suitable boundaries, but they provide no evidence specific to the new character identities."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. How much tagged text the trade needs">
                <>
<p>
                  Two- to five-sentence examples let us inspect the mechanism, but they are too small to assess performance broadly. We will also use a seeded synthetic language with seventy words drawn from forty characters. Its frequency distribution gives a few words many occurrences and leaves a longer tail of less frequent words, providing a larger controlled comparison.
                </p>
                <p>
                  Both methods are fitted on the first two sentences of one corpus, then the first five, and so on, and both are scored on the same two hundred held-out sentences, a word counting as found only when both its ends land where the sentence put them.
                </p>
</>
                <CorpusSizeCurve corpusKeys={["characters"]} />
                <p>
                  {"In the synthetic character language, the curves cross between thirty and forty training sentences. At thirty, the role model scores 0.8659 against 0.8501; at forty, the dictionary scores 0.9019 against 0.8792. By 160 sentences, the dictionary has seen every word in this 70-word construction and scores 1.0000, while the role model is at 0.9178. These are outcomes of this controlled vocabulary and held-out set."}
                </p>
                <>
<p>
                  {"The familiar/unfamiliar split helps interpret this construction. At thirty training sentences the dictionary’s familiar-word recall is 0.9983, while the role model recalls 0.6560 of unfamiliar words. From ten sentences onward, dictionary recall on unfamiliar multi-character words is 0.0000. The role model’s unfamiliar recall later falls to 0.2632 at eighty sentences, so the earlier approximate 0.42-to-0.66 range does not describe the full curve. Coverage and the composition of the remaining unfamiliar set both change."}
                </p>
                <p>
                  {"Open-ended text can keep introducing words outside a fitted dictionary. That motivates unknown-word handling, but it does not guarantee that this role model will outperform the dictionary at every corpus size. Test both coverage and boundary accuracy on representative text."}
                </p>
</>
                <KeepInMind>
                  {"The role model is ahead at thirty sentences in this synthetic setting, and the dictionary overtakes it as coverage improves. The share of unseen words helps explain this experiment. It is not a rule that every language with new words must keep the role model ahead."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. It is the worse of the two on the words it was shown">
                <p>
                  {"A dictionary stores familiar word forms, but a search can still choose other entries around them. This role model stores character and transition statistics rather than a lookup for each full word. On the measured settings, its familiar-word recall is lower than the dictionary’s. Neither representation guarantees perfect recovery of every training word in context."}
                </p>
                <NumberTable
                  headings={[
                    "tagged sentences",
                    "places, on words it was shown",
                    "list, on words it was shown",
                    "places, on words it was not",
                    "list, on words it was not",
                  ]}
                  rows={[
                    ["10", "0.9075", "0.9970", "0.4843", "0.0000"],
                    ["30", "0.9117", "0.9983", "0.6560", "0.0000"],
                    ["80", "0.9277", "1.0000", "0.2632", "0.0000"],
                    ["320", "0.9327", "1.0000", "no new words left", "no new words left"],
                  ]}
                  caption="Recall on the same two hundred held-out generated sentences, split by whether each reference word appeared in training. The first pair compares familiar-word recovery; the second compares unfamiliar-word recovery. These are measured properties of the tested procedures."
                />
                <p>
                  {"The early rows show useful unfamiliar-word recall alongside a smaller familiar-word recall than the dictionary. Which matters more depends on the input’s word coverage and the task’s errors. The combined procedure in section 17 tests one way to use both sources of evidence."}
                </p>
                <KeepInMind>
                  {"The measurements show a tradeoff on these data: lower recall on familiar words accompanies better recall on some unseen words. That is evidence about these two fitted procedures, not a theorem that every model capable of generalization must lose the same familiar words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A writing system where a character says less">
                <p>
                  {"The next control uses sequences generated from the 810 English words, with their spaces removed. Compare how informative a character is about its role under that construction with the earlier forty-character synthetic vocabulary. This is a comparison of datasets, not a test of every alphabetic or Chinese writing system."}
                </p>
                <CorpusSizeCurve corpusKeys={["letters"]} />
                <>
<p>
                  {"In the English-word construction, the role label has 1.5590 bits of uncertainty and knowing the character removes 0.4869 bits. The earlier character construction has 1.7518 bits, of which character identity removes 0.9207. These summarize the supplied character-role distributions. They do not by themselves determine the decoder’s attainable accuracy, because role transitions and sequence context also contribute."}
                </p>
                <p>
                  {"On this English-word experiment, the reported score reaches 0.6087 and later falls to 0.5186 as training size grows. The character-language experiment rises past 0.92. Those curves do not isolate character inventory size as the sole cause, and they do not prove that all letters eventually occur in every role."}
                </p>
</>
                <p>
                  {"On the running sentence without spaces, a model fitted on 1,280 generated English sentences returns thirteen pieces rather than the seven-unit reference. Only Dr. matches a complete reference unit in that result; the dictionary returns twenty-four pieces and matches expect and the. These are exact-span outcomes for this probe. The information statistic above does not, by itself, explain each individual error."}
                </p>
                <InAModel>
                  <p>
                  {"Character-role association is one diagnostic to inspect before fitting, but it cannot replace a held-out segmentation test. Small alphabets do not put an input outside an HMM’s mathematical domain. Whether the four-state model is useful depends on the observed patterns, transitions and task."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"The character construction has roughly twice the reported character-role information of the English-word construction, alongside scores above roughly 0.92 versus a peak near 0.61. Those are two observed properties, not proof that one statistic sets the ceiling. The opposite training-size trends here do not establish that more labeled text generally harms alphabetic-language segmentation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Running the two of them together">
                <p>
                  {"The hybrid first finds a dictionary path, then sends runs of unlisted single-character pieces to the fitted role model. The SDK supports that option. Errors made entirely from other listed words may trigger no handoff, so the combination does not automatically repair every dictionary mistake."}
                </p>
                <CorpusSizeCurve corpusKeys={["characters", "letters"]} />
                <p>
                  {"In both generated experiments and at the measured training sizes, the hybrid curve is at least as high as the two individual curves. At thirty character-language sentences it scores 0.9262 against 0.8659 for the better individual method; at eighty English sentences it scores 0.7781 against 0.6065. These are measured comparisons of the supplied hybrid policy, not a guarantee for every input or model."}
                </p>
                <p>
                  The combined method leaves this surname result unchanged. No dictionary entry covers its five characters, so that whole span goes to the hidden-state fallback. The fallback returns the same four pieces as it did alone. Combining the methods cannot improve a span where it simply delegates to the same unchanged procedure.
                </p>
                <KeepInMind>
                  {"The hybrid improves the measured curves by combining dictionary coverage with a fallback model on selected spans. Its error patterns can still overlap or interact. The dictionary path does not identify every wrong boundary, so the combination is not guaranteed to dominate both methods on arbitrary data."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Character Independence and the Boundaries We Chose to Label" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="18. One character at a time, so two languages can leave the same counts">
                <p>
                  {"The emission table scores one character identity at a time, conditioned on its role. It has no direct parameter for a particular neighboring character pair. Different word-pair distributions can therefore share the same fitted statistics. The example below constructs that situation while retaining the model’s transition information."}
                </p>
                <p>
                  Here is what that costs, arranged so it can be checked rather
                  than argued. Two languages over the same four characters, one
                  making its words by joining the first character to the second and
                  the other by crossing them over. Every count either language
                  leaves behind is the same count, so the two fits are the same
                  fit.
                </p>
                <TwinLanguages />
                <p>
                  {"The two supplied corpora produce 36 equal fitted values. Under those statistics, the model cannot distinguish their different word pairings and can return a word absent from its training corpus. Repeating the same balanced examples will not change that equality. Other training distributions could produce different counts, so this is not a claim about every possible larger sample."}
                </p>
                <KeepInMind>
                  {"When two datasets yield the same initial, transition and emission tables, this model assigns the same scores to a given observed string. To distinguish the illustrated pairings, use additional evidence or a model with suitable context features. The next lesson adds such features."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Characters it has never seen decide nothing at all">
                <p>{"Every unseen character uses the same vector of emission values across the four roles. Those values can differ by role, so they do not cancel when comparing role paths. Initial-role and transition probabilities contribute too. In the five-sentence reference fit, we can see the unequal values directly from the counts below. The model therefore ignores which unknown characters were supplied, while still using a role-dependent score."}</p>
                <Equation>{"Five-sentence reference fit, smoothing a = 1\nknown alphabet = 10, emission slots = 11\nrole counts: B = 10, M = 0, E = 10, S = 4\n\nP(unknown | B) = P(unknown | E) = 1 / 21\nP(unknown | M) = 1 / 11\nP(unknown | S) = 1 / 15"}</Equation>
                <p>
                  The widget above lists what that looks like for each length. A
                  run of five characters no corpus of those five Chinese sentences
                  ever held comes back as B E S S S, four pieces, and it comes back
                  as that for a transliterated surname, for five Latin capitals and
                  for five pictograms alike. That is the wrong answer the
                  thirteenth section left hanging, and it was never an answer about
                  the surname.
                </p>
                <>
<p>

                  Unknown-character handling is a policy we must choose. Here each role has its reserved unknown probability. We could estimate different behavior for character categories, or reject an unknown span and leave it for another method. Those choices change path scores, so the implementation needs to document which one it uses.
                </p>
                <p>
                  {"The supplied model returns a definite segmentation for an unknown run, though it has no identity-specific emission evidence for those characters. A category-aware fallback would need its own evidence or assumptions; a rejection policy would expose the unsupported span. Evaluate those choices rather than interpreting the returned path as calibrated confidence."}
                </p>
</>
                <KeepInMind>
                  {"All unseen characters use the same emission vector in this fitted model. That makes their identities interchangeable during decoding, but the vector can favor some roles over others. Initial-role probabilities and transitions also contribute. The shown five-character runs return four pieces under this particular fit."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What has to be decided before any counting begins">
                <>
<p>
                  {"The supervised fit needs segmented examples under a stated annotation convention. Such conventions can differ between corpora. That is a reason to document the target and compare consistently, not a reason to treat every boundary choice as an untestable opinion."}
                </p>
                <p>
                  {"A predicted boundary can follow one annotation convention and differ from another. State the target convention before interpreting that difference as a model error. The fit can still make mistakes under its own training convention."}
                </p>
</>
                <p>
                  {"The same four-sentence corpus changes its selected reading as smoothing moves from 1.0, 0.5 or 0.25 to 0.23 and below, with a switch near 0.238. The fitting procedure defines each result, while validation data can help choose the setting. A fixed smoothing contribution shrinks relative to frequently observed events, but rare or unseen events can remain sensitive."}
                </p>
                <WhyThisWorks title="Separating the definition of a boundary from the data used to learn it">
                  <p>
                    The annotation convention defines the segmentation we want to learn. More examples do not decide which convention we should have chosen. Smoothing is an estimation choice: with enough representative observations for an event, a fixed smoothing contribution becomes small relative to its count. On four sentences, both choices can strongly affect the answer, so one small result cannot cleanly separate their effects.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"Record the training source, boundary convention, smoothing and unknown-character policy with the model. A returned segmentation does not by itself describe those inputs, even though they can change the result."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Unseen characters, illegal paths and annotation choices" id="21-where-the-method-has-nothing-to-say">
                <p>The hidden-state model can only score legal paths built from its defined states and observations. Unknown characters, impossible transitions and competing boundary conventions need to be considered separately.</p>
                <DerivationTable
                  expressionHeading="Character or state-transition evidence"
                  reasonHeading="Which segmentation paths can be scored"
                  rows={[
                    {
                      expression: "a step that no cutting can contain",
                      reason:
                        "not an outcome, so it takes no count, no helping and no share. Eight of the sixteen pairs are in this position, fixed by what a word is rather than by what was counted, and letting one of them through would produce a run of letters no cut corresponds to.",
                    },
                    {
                      expression: "an outcome the corpus never showed",
                      reason:
                        "With a positive row total, an unobserved event has a defined zero-frequency estimate. A completely unobserved row cannot be normalized without a convention. Smoothing adds mass to allowed outcomes; the five-character example changes reading between the shown settings 1.0 and 0.1, near 0.238.",
                    },
                    {
                      expression: "a character the corpus never contained",
                      reason:
                        "Every unseen character uses the same role-specific unknown-emission vector. Its components can differ across roles, so they do not cancel from role-path comparisons. Identity does not distinguish all-unknown runs of equal length under this fit; the shown five-character runs return four pieces.",
                    },
                    {
                      expression: "two languages that agree character by character",
                      reason:
                        "indistinguishable, and that is a fact about the model rather than about the corpus. Thirty-six numbers, thirty-six equal, so a fit taught one of them reads the other’s words with the same confidence as its own.",
                    },
                    {
                      expression: "a boundary whose evidence is a pair of characters",
                      reason:
                        "There is no explicit feature for a particular neighboring character pair. Hidden-role transitions can still encode some sequence dependencies. The two constructed corpora share all fitted tables, so this model cannot distinguish their pairings from those statistics alone.",
                    },
                    {
                      expression: "where the training sentences were cut",
                      reason:
                        "The supervised examples supply word boundaries under a stated convention. People or another procedure can provide them. Compare training and evaluation conventions explicitly; differences do not make meaningful boundary evaluation impossible.",
                    },
                    {
                      expression: "a word the corpus did contain",
                      reason:
                        "A familiar word is not guaranteed to be selected by either procedure in every context. In the shown thirty-sentence fit, familiar-word recall is 0.9117 for the role model and 0.9983 for the dictionary method. These observations do not prove that no other setting can improve both familiar and unfamiliar results.",
                    },
                    {
                      expression: "a writing system with few characters",
                      reason:
                        "Small alphabets remain valid input. The two generated datasets give different character-role information values: 0.9207 of 1.7518 bits and 0.4869 of 1.5590 bits. The English-word experiment peaks at 0.6087 and later declines, but that does not define a universal limitation of alphabetic-language HMMs.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "The generated examples have known construction boundaries, making the comparisons inspectable. Real-data accuracy is also meaningful when the annotation convention and evaluation sample are stated. These synthetic curves do not establish a general Chinese or English segmentation score.",
                    },
                  ]}
                />
                <KeepInMind>
                  Three of these are decisions rather than limits, namely how much
                  to add to the counts, what an unfamiliar character is worth to
                  each place, and whose cutting of the training text to learn. Each
                  has a defensible answer on more than one side and each changes
                  what comes back, so each belongs in whatever describes a
                  segmenter rather than being left to whoever writes one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            several(
              "Seventy words spelled out of forty characters, both methods fitted on the same sentences and scored on the same two hundred held-out ones. Which of these did that measurement report?",
              [
                "The curves cross between thirty and forty sentences, with the places ahead at thirty by 0.8659 against 0.8501",
                "Against the words the training sentences contained, the places beat the list at every size measured",
                "Against words the training sentences did not contain, the list is at 0.0000 from ten sentences on where the places are between 0.42 and 0.66",
                "The crossing is a fact about sentence counts, so any language crosses at about the same size",
              ],
              [0, 2],
              "The places are worse than the list on exactly the words the corpus contained, at every size and on both languages, because a table of four places holds a habit that the characters on either side can talk it out of, where a list holds the word. By a hundred and sixty sentences the list has seen every word of a seventy-word language and scores exactly 1.0000 while the places have flattened out at 0.9178. The quantity that actually moved was the share of held-out words that are new, and the crossing sits where that falls below about a tenth, so it is a crossing at all only because a language of seventy words runs out of new words, and a real vocabulary does not.",
            ),
            choice(
              "Why does this role-conditioned model perform better on the generated character language than on the generated alphabetic-word language?",
              [
                "How much a single character tells you about where it sits, which is 0.9207 bits removed on the character language against 0.4869 on the English words",
                "That the language is written without spaces, so no word list can be built from it",
                "That its words are shorter, so there are fewer runs of letters to search",
                "That corpora of it are smaller, so a word list has too few entries to compete",
              ],
              0,
              "In this experiment, the alphabetic-word model peaks at 0.6087 and later falls to 0.5186 as the corpus grows. The character-language model rises above 0.92. The role-conditioned character statistics differ between these constructions, which helps explain the result. It does not establish the same trend for every alphabetic language or every segmentation model.",
            ),
            trueFalse(
              "The dictionary-plus-model combination correctly returns the entire unfamiliar surname as one word in this example.",
              false,
              "The dictionary alone splits the surname into five characters. Both the model and the combined method join only the first two, leaving four surname pieces. The combination has changed the dictionary’s output, but it has not recovered the intended whole name. The broader synthetic evaluation is a separate result and does not repair this individual example.",
            ),
            trueFalse(
              "The two supplied paired and crossed corpora produce identical initial, transition and emission tables. Under those fitted parameters, the decoder gives the same scores to the same input even though the training words use different character pairings.",
              true,
              "The supplied corpora give thirty-six equal fitted values. The model therefore scores any given input identically under those two fits. Repeating those same balanced examples cannot teach the missing pairing distinction. Different frequency patterns could change the fitted tables, and adding direct context features changes what evidence the model can retain. Equal model weights are not a calibrated confidence claim.",
            ),
            choice(
              "Under the five-sentence reference fit, five entirely unseen characters decode as B E S S S, giving four pieces. Why does changing those unseen character identities leave the result unchanged?",
              [
                "Every unseen character uses the same role-specific emission vector. Their identities therefore do not distinguish these inputs; initial-role, transition and unknown-emission weights select BESSS for this length.",
                "Five characters is too short for the search to use more than two of its places",
                "The model refuses the stretch and falls back to a fixed cut",
                "Those particular characters happen to carry those habits in the corpus",
              ],
              0,
              "All five unseen characters use the same unknown-emission entry within each state. Their individual identities therefore cannot influence the result. The learned transition probabilities and state-specific unknown-emission probabilities favor BESSS here. Another fallback policy or richer character features could distinguish inputs that this shared unknown slot treats alike.",
            ),
        ],
        },
        {
          title: "Practice. Tagging the Places With the Library",
          practice: [
            exercise(
              "Read the three tables off two sentences",
              [
  "Fit the supplied two-sentence labeled corpus: [\"ab\", \"c\"] and [\"abc\"]. Use the model’s default add-one smoothing.",
  "Print its alphabet, allowed start probabilities and every allowed transition probability. Then print a, c and unseen z’s emission probabilities for the beginning and single-character states.",
  "B begins a multi-character word, M is inside one, E ends one and S is a one-character word. The API stores log probabilities; convert them to ordinary probabilities for the four-decimal report. Omit forbidden transitions."
],
              `import math
from oop_ml import BoundaryTag, HiddenMarkovSegmenter

model = HiddenMarkovSegmenter(smoothing=1.0).fit([["ab", "c"], ["abc"]])
print(f"alphabet {model.alphabet}, {model.n_characters} characters plus one spare slot")

# Print the share of each admissible start place, then every step share the model
# allows, then for a, c and z the share under the place that begins a word and
# under the place that is a word on its own.`,
              `import math
from oop_ml import BoundaryTag, HiddenMarkovSegmenter

model = HiddenMarkovSegmenter(smoothing=1.0).fit([["ab", "c"], ["abc"]])
print(f"alphabet {model.alphabet}, {model.n_characters} characters plus one spare slot")

for tag in (BoundaryTag.BEGIN, BoundaryTag.SINGLE):
    print(f"P(start {tag.value}) = {math.exp(model.initial_log_probability(tag)):.4f}")

for previous in BoundaryTag:
    for following in BoundaryTag:
        log_share = model.transition_log_probability(previous, following)
        if log_share > -math.inf:
            print(f"P({following.value} | {previous.value}) = {math.exp(log_share):.4f}")

for character in ("a", "c", "z"):
    begins = math.exp(model.emission_log_probability(BoundaryTag.BEGIN, character))
    alone = math.exp(model.emission_log_probability(BoundaryTag.SINGLE, character))
    print(f"P({character} | B) = {begins:.4f}, P({character} | S) = {alone:.4f}")`,
              `alphabet ('a', 'b', 'c'), 3 characters plus one spare slot
P(start B) = 0.7500
P(start S) = 0.2500
P(M | B) = 0.5000
P(E | B) = 0.5000
P(M | M) = 0.3333
P(E | M) = 0.6667
P(B | E) = 0.3333
P(S | E) = 0.6667
P(B | S) = 0.5000
P(S | S) = 0.5000
P(a | B) = 0.5000, P(a | S) = 0.2000
P(c | B) = 0.1667, P(c | S) = 0.4000
P(z | B) = 0.1667, P(z | S) = 0.2000`,
              {
question: "Which small count tables determine the hidden boundary model’s probabilities?",
 hints: [
  "Keep each sentence as a list of word strings. Passing a bare string would supply the wrong training structure.",
  "Iterate BoundaryTag for the states. math.exp converts initial_log_probability, transition_log_probability and emission_log_probability to probabilities.",
  "Forbidden transitions have log probability -math.inf. They remain forbidden rather than receiving an added count."
], check: numberCheck("What share does the model give to a word ending straight after a middle character, P(E | M)?", 0.6667, 0.0005, "The M-to-E probability is about 0.6667. One observed ending and the permitted-transition smoothing determine that value; forbidden transitions are outside the smoothing choices.") },
            ),
            exercise(
              "Find three words the sentences never held",
              [
  "Fit the supplied labeled corpus containing ab/cd, ab/ef and cd/ef. Build a word dictionary from those same sentences, then segment adcfeb with the boundary model and the dictionary-only lattice.",
  "Print the model’s state sequence, both segmentations and a’s emission probability under all four states to four decimal places.",
  "The dictionary can only match listed words or its single-character fallback. The state model instead scores character positions, so it can propose a word never listed as a unit."
],
              `import math
from oop_ml import BoundaryTag, DictionaryLatticeSegmenter, HiddenMarkovSegmenter, WordDictionary

sentences = [["ab", "cd"], ["ab", "ef"], ["cd", "ef"]]
text = "adcfeb"

tagger = HiddenMarkovSegmenter().fit(sentences)
lattice = DictionaryLatticeSegmenter(dictionary=WordDictionary.from_segmented_corpus(sentences))

# Print the places the tagger assigns to the text as one string of letters, the
# words the tagger answers, the words the word list answers, and the share of
# a under each of the four places.`,
              `import math
from oop_ml import BoundaryTag, DictionaryLatticeSegmenter, HiddenMarkovSegmenter, WordDictionary

sentences = [["ab", "cd"], ["ab", "ef"], ["cd", "ef"]]
text = "adcfeb"

tagger = HiddenMarkovSegmenter().fit(sentences)
lattice = DictionaryLatticeSegmenter(dictionary=WordDictionary.from_segmented_corpus(sentences))

places = "".join(tag.value for tag in tagger.tags_of(text))
print(f"places {places}")
print(f"tagger: {' | '.join(tagger.split(text).texts)}")
print(f"word list: {' | '.join(lattice.split(text).texts)}")
for tag in BoundaryTag:
    share = math.exp(tagger.emission_log_probability(tag, "a"))
    print(f"P(a | {tag.value}) = {share:.4f}")`,
              `places BEBEBE
tagger: ad | cf | eb
word list: a | d | c | f | e | b
P(a | B) = 0.2308
P(a | M) = 0.1429
P(a | E) = 0.0769
P(a | S) = 0.1429`,
              {
question: "Can a boundary-state model form words absent from its training dictionary?",
 hints: [
  "tags_of(text) returns one BoundaryTag per character. Join each tag.value for the displayed sequence.",
  "Use WordDictionary.from_segmented_corpus for a dictionary drawn from the same labels.",
  "Compare a’s probability under B, the beginning state, and E, the ending state. Their differing counts help choose its role in a new sequence."
], check: numberCheck("What share does the place that begins a word give to the character a?", 0.2308, 0.0005, "The beginning state assigns a probability of about 0.2308 to a. Its different distribution from the ending state helps score unfamiliar character combinations without requiring those words in a dictionary.") },
            ),
            exercise(
              "Walk the helping down on a corpus that contradicts itself",
              [
  "The supplied labeled corpus contains conflicting ways to group the same opening characters. Fit it at each of the seven smoothing values supplied in the starter.",
  "For each fit print the segmentation of 研究生很多, whether it equals the supplied training reading, and the emission probability of 究 under M, the within-word state.",
  "Smoothing adds a positive amount to possible outcomes before normalizing their counts. Keep the data fixed so the report isolates that amount’s effect on a sparsely observed state."
],
              `import math
from oop_ml import BoundaryTag, HiddenMarkovSegmenter

sentences = [["研究", "生命", "起源"], ["研究生", "很", "多"], ["生命", "很", "好"], ["起源", "研究"]]
text = "研究生很多"

for smoothing in (2.0, 1.0, 0.5, 0.25, 0.23, 0.1, 0.01):
    # Fit a model with this smoothing, split the text, say whether the words are
    # the training sentence as written, and print the share of 究 under the
    # place inside a word.
    pass`,
              `import math
from oop_ml import BoundaryTag, HiddenMarkovSegmenter

sentences = [["研究", "生命", "起源"], ["研究生", "很", "多"], ["生命", "很", "好"], ["起源", "研究"]]
text = "研究生很多"

for smoothing in (2.0, 1.0, 0.5, 0.25, 0.23, 0.1, 0.01):
    model = HiddenMarkovSegmenter(smoothing=smoothing).fit(sentences)
    words = model.split(text).texts
    verdict = "as written" if list(words) == ["研究生", "很", "多"] else "majority reading"
    inside = math.exp(model.emission_log_probability(BoundaryTag.MIDDLE, "究"))
    print(f"helping {smoothing}: {' | '.join(words)} ({verdict}), P(究 | M) = {inside:.4f}")`,
              `helping 2.0: 研究 | 生 | 很 | 多 (majority reading), P(究 | M) = 0.1429
helping 1.0: 研究 | 生 | 很 | 多 (majority reading), P(究 | M) = 0.1818
helping 0.5: 研究 | 生 | 很 | 多 (majority reading), P(究 | M) = 0.2500
helping 0.25: 研究 | 生 | 很 | 多 (majority reading), P(究 | M) = 0.3571
helping 0.23: 研究生 | 很 | 多 (as written), P(究 | M) = 0.3727
helping 0.1: 研究生 | 很 | 多 (as written), P(究 | M) = 0.5500
helping 0.01: 研究生 | 很 | 多 (as written), P(究 | M) = 0.9182`,
              {
question: "How strongly can smoothing change an ambiguous boundary decision?",
 hints: [
  "Construct a fresh model with the current smoothing value, then fit the same corpus.",
  "Compare the returned texts with the supplied reference as lists. Convert the M emission’s log probability with math.exp.",
  "The M state has very little training evidence here. Added counts can therefore materially change its distribution."
], check: numberCheck("What share does the place inside a word give to 究 at the usual helping of one?", 0.1818, 0.0005, "At smoothing 1.0, state M assigns 究 emission probability about 0.1818. The sweep also changes which complete role path has the largest score. An emission probability is a model parameter, rather than a displayed confidence in the whole segmentation.") },
            ),
            exercise(
              "Hand the stretch nothing covered to the places",
              [
  "Fit the boundary model on the supplied five labeled sentences and build a dictionary from those same sentences. Read 阿尔瓦雷斯研究生命起源 with the dictionary alone, the model alone and the dictionary with unknown_segmenter set to the fitted model.",
  "Print each segmentation and piece count. Then print the state sequence assigned to the five-character surname alone.",
  "The combined method hands an uncovered run to the model; it does not replace every dictionary decision. Compare that restricted delegation with the model-only result."
],
              `from oop_ml import DictionaryLatticeSegmenter, HiddenMarkovSegmenter, WordDictionary

sentences = [
    ["研究", "生命", "起源"], ["学生", "很", "多"], ["生命", "很", "好"],
    ["起源", "研究"], ["学生", "研究", "生命"],
]
text = "阿尔瓦雷斯研究生命起源"

dictionary = WordDictionary.from_segmented_corpus(sentences)
tagger = HiddenMarkovSegmenter().fit(sentences)
# Build a lattice segmenter over the dictionary alone and one that hands unknown
# stretches to the tagger, print what each of the three answers with its piece
# count, and print the places the tagger gives the five-character surname alone.`,
              `from oop_ml import DictionaryLatticeSegmenter, HiddenMarkovSegmenter, WordDictionary

sentences = [
    ["研究", "生命", "起源"], ["学生", "很", "多"], ["生命", "很", "好"],
    ["起源", "研究"], ["学生", "研究", "生命"],
]
text = "阿尔瓦雷斯研究生命起源"

dictionary = WordDictionary.from_segmented_corpus(sentences)
tagger = HiddenMarkovSegmenter().fit(sentences)
lattice = DictionaryLatticeSegmenter(dictionary=dictionary)
together = DictionaryLatticeSegmenter(dictionary=dictionary, unknown_segmenter=tagger)

for label, segmenter in (("word list", lattice), ("places", tagger), ("both", together)):
    pieces = segmenter.split(text)
    print(f"{label}: {' | '.join(pieces.texts)} ({pieces.n_words} pieces)")

places = "".join(tag.value for tag in tagger.tags_of("阿尔瓦雷斯"))
print(f"the surname alone is tagged {places}")`,
              `word list: 阿 | 尔 | 瓦 | 雷 | 斯 | 研究 | 生命 | 起源 (8 pieces)
places: 阿尔 | 瓦 | 雷 | 斯 | 研究 | 生命 | 起源 (7 pieces)
both: 阿尔 | 瓦 | 雷 | 斯 | 研究 | 生命 | 起源 (7 pieces)
the surname alone is tagged BESSS`,
              {
question: "Can a dictionary delegate only its uncovered stretches to a learned segmenter?",
 hints: [
  "Pass the already fitted model as unknown_segmenter to DictionaryLatticeSegmenter.",
  "All three results expose texts and n_words, so compare the same measurements.",
  "The surname’s characters are absent from the training alphabet. Their fallback scores leave transition preferences to decide much of its state sequence."
], check: numberCheck("How many pieces does the combination answer for the eleven characters?", 7, 0.5, "The combined result has seven pieces. Its learned fallback joins the first two surname characters, but this output alone does not establish that the name was analyzed correctly.") },
            ),
          ],
        },
      ]}
    />
  );
}
