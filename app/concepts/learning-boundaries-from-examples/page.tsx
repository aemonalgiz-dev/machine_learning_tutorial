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
import { AnnotationReach } from "@/components/widgets/AnnotationReach";
import { GapStrip } from "@/components/widgets/GapStrip";
import { GapVotes } from "@/components/widgets/GapVotes";
import { MethodRace } from "@/components/widgets/MethodRace";
import { PerceptronWalk } from "@/components/widgets/PerceptronWalk";
import { PointwisePlayground } from "@/components/widgets/PointwisePlayground";
import { WindowReach } from "@/components/widgets/WindowReach";



export const metadata: Metadata = {
  title: "Learning Boundaries From Examples · Perceptron Lab",
  description: "Annotated boundaries provide examples of where text should be split. A supervised model uses surrounding character information to learn decisions that can be applied to new sequences.",
};

export default function LearningBoundariesFromExamplesPage() {
  return (
    <ConceptPage
      lessonId="learning-boundaries-from-examples"
      intuition={lessonIntuitions["learning-boundaries-from-examples"]}
      technicalStart="Part 2. What a Gap Is Asked"
      openingTitle="Ask Each Gap Whether a Word Ends Here"
      playgroundTitle="Let labeled gaps teach the splitting rule"
      playgroundIntro="Select a gap and examine the neighboring characters used to classify it. Compare individual boundary decisions with the resulting complete segmentation."
      title="Learning Boundaries From Examples"
      tagline={"Annotated boundaries provide examples of where text should be split. A supervised model uses surrounding character information to learn decisions that can be applied to new sequences."}
      prerequisites={
        <>
          The page on segmenting with a hidden model, since this one is the
          answer to a question that page leaves open, and it is compared against
          that method throughout. Nothing here needs a word list. The arithmetic
          is adding numbers up and comparing the total against zero, and the
          learning is a rule that adds one to a weight when it gets an answer
          wrong.
        </>
      }

      playground={<PointwisePlayground />}
      sections={[
        {
          title: "Part 1. One Answer That Cannot Be Taken Apart",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What scoring a whole sentence at once buys, and where it leaves you">
                <p>
                  The hidden-state model chooses a whole sequence of character roles. Its transition rules can keep those roles consistent, and an early decision can be judged by what must follow it. Here we will try a different approach: predict each boundary from its nearby characters. That makes individual decisions easier to inspect, but we give up the same kind of joint sequence constraint.
                </p>
                <>
<p>
                  Now ask a narrow question of such an answer. The sentence we carry through this section is Dr. Alvarez didn&rsquo;t expect the low-cost re-analysis, and with its spaces taken out it is forty-five characters with forty-four gaps between them. Point at the gap between the full stop of Dr. and the A of Alvarez and ask what decided it.
                </p>
                <p>
                  The decoder chose a complete sequence of character roles. We
                  can inspect its transition and character scores, or compare it
                  with a competing sequence that treats this gap differently.
                  The explanation involves those linked decisions; it is not a
                  separately learned yes-or-no score attached only to this gap.
                </p>
                <p>
                  A decoder can be extended to require a boundary at a chosen
                  gap, then find the best complete sequence satisfying that
                  requirement. Our SDK example does not expose that constrained
                  operation. Here we will instead train a model whose ordinary
                  output already contains a separate decision for every gap.
                </p>
</>
                <p>
                  The sequence model also shares its learned counts across
                  positions. Changing a transition or character score to repair
                  one sentence can affect many other boundaries. The gap
                  classifier shares weights too, but lets us inspect which local
                  features contributed to one particular decision. That is the
                  distinction we will investigate, including its costs.
                </p>
                <KeepInMind>
                  Joint decoding checks a complete sequence against the model&apos;s
                  transition rules. Independent gap decisions are easier to
                  inspect locally, but this classifier does not check how all
                  those decisions fit together. Neither arrangement guarantees
                  the boundaries a reader intended.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. One question at every gap, answered on its own">
                <p>

                  Between any two neighboring characters of a text there either
                  is a word boundary or there is not. That is a question with two
                  answers, it has one at every gap of every text, and nothing in
                  it mentions any other gap. So take it as the whole method. Ask
                  it forty-four times of our sentence, cut wherever the answer is
                  yes, and read off the pieces.
                </p>
                <Equation>
                  {"a text of n characters   →   n − 1 questions, each answered on its own"}
                </Equation>
                <p>
                  Here is that done, on eight short sentences somebody has marked
                  up by hand. Each bar is one gap, drawn upward when the answer
                  was to cut and downward when it was to keep going, and the
                  height is how strongly. Nothing joins the bars, because nothing
                  in the calculation joins them.
                </p>
                <GapStrip scenarioKeys={["sentence"]} showSentences />
                <p>
                  The model agrees with our reference at forty-one of the forty-four gaps. The three disagreements, shown in red, are inside the surname. Each gap was classified independently of the others. We can therefore examine the local evidence and score for a particular mistaken boundary, while remembering that the classifier does not check whether all those decisions form a plausible segmentation together.
                </p>
                <KeepInMind>
                  One question per gap, answered from the characters around that
                  gap, and the cut is whatever the answers say. The rest of the
                  page is what a gap is asked, how the answers are learned, and
                  what the independence costs.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A corpus that can be marked one gap at a time">
                <p>
                  Imagine asking someone to annotate boundaries and allowing them to leave uncertain cases unmarked. A compound noun may have more than one reasonable treatment under different conventions. A boundary classifier can learn from the gaps the annotator did label without requiring a complete segmentation for every sentence. That is a practical reason to investigate this arrangement, separate from its accuracy.
                </p>
                <p>

                  The gap learner can use each marked gap as one training example. The SDK’s supervised character-role counter needs enough adjacent boundary labels to decide a character’s role, such as beginning or ending a word. A missing gap label can therefore make both neighboring character roles unavailable to that counting procedure.
                </p>
                <p>
                  Other sequence-training methods can use partially observed labels. We are comparing the two procedures in this experiment, rather than proving a limit of all sequence models. The widget uses two hundred generated sentences with a chosen share of boundary labels retained.
                </p>
                <AnnotationReach />
                <p>
                  {"The experiment retains each gap label independently. With two fifths retained, the gap learner can use 39.49% of its original examples, while the role counter can use 19.61% of its character labels. At a fifth retained, the shares are 20.41% and 7.79%. The character counter usually needs labels on both sides of a character, so missing labels affect it more often."}
                </p>
                <WhyThisWorks title="Why the second share is not simply the first one squared">
                  <p>
                    A gap is usable when the annotator marked it, which here
                    happens two times in five. A character in the middle of a
                    sentence has a gap on each side and needs both of them
                    marked. A character at either end of a sentence has only
                    one gap and needs only that one.
                  </p>
                  <Equation>
                    {"a gap, usable                         0.4\n" +
                      "a character inside a sentence         0.4 × 0.4  =  0.16\n" +
                      "a character at the end of a sentence  0.4\n" +
                      "\n" +
                      "(1,461 × 0.16 + 400 × 0.4) / 1,861  ≈  0.21"}
                  </Equation>
                  <p>
                    The two hundred sentences hold 1,861 characters, and 400 of
                    them stand at one end or the other, so about 21% of the
                    places are expected to survive where 40% of the gaps do.
                    The 19.61% and the 39.49% above are one drawing of the
                    marks counted, which is why they sit near those figures
                    and not on them. A language with longer sentences has
                    fewer end characters for its length, and its share falls
                    closer to the 16%.
                  </p>
                </WhyThisWorks>
                <InAModel>
                  <p>
                  {"The SDK fit method accepts fully segmented sentences. This widget counts the examples a partially annotated corpus would supply; it does not train either model on partial annotations. A separate input interface could supply each known gap label to the same local update rule."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"Independent gap examples make partial annotation useful. In this experiment, a larger share of gap examples survives than character-role labels. Those percentages measure available supervision, rather than a doubling of accuracy or annotation value."}
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What a Gap Is Asked",
          content: (
            <>
              <SubSection title="4. The characters either side, and how far to look">
                <p>
                  {"Start with the characters immediately before and after a possible boundary. Number the character before it as offset minus one and the character after it as offset zero. Then choose how many characters to inspect on either side. That distance is the context window, called the reach here."}
                </p>
                <Equation>
                  {"… c[−3] c[−2] c[−1] | c[0] c[1] c[2] …   with the gap at the bar"}
                </Equation>
                <p>

                  Within the reach, each single character is one thing the gap is
                  asked about, and each neighboring pair of them is another. The
                  pairs matter because a boundary is often a fact about a
                  juxtaposition rather than about either character alone. In our
                  sentence a punctuation mark sits immediately to the left of four
                  gaps, one of which is a boundary and three of which are not, so a
                  question about punctuation on its own is being asked to answer
                  two different things at once, where a question about which
                  characters sit either side of the gap is not.
                </p>
                <WorkedExample>
                  <p>
                  {"With a reach of one, the gap between a and b has seven features. One is a constant that is present at every gap, allowing the model to learn a baseline preference. The others identify the left and right characters, their categories, the character pair and its category pair. We will count those features in section 6."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  A gap sees a fixed window of characters and nothing else, so two
                  gaps whose windows read the same characters are answered
                  identically whatever the rest of the two texts say. That is what
                  makes a single decision reproducible, and the eighteenth section
                  measures what it costs.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. What kind of character, as well as which one">
                <p>
                  {"An exact character feature has no learned weight when that character and offset never appeared during fitting. A broader feature can still help: is this a letter, a digit or a punctuation mark? This implementation uses seven categories: Han, hiragana, katakana, other letters, numbers, punctuation and everything else. They are design choices, rather than a complete description of writing systems."}
                </p>
                <>
<p>
                  {"Category features share weights across characters. A learned preference for separating a letter from a Han character can apply to a new letter at that offset. It still needs relevant training evidence: an unfamiliar category combination can also have zero weight."}
                </p>
                <p>
                  Counted over every gap of two hundred held-out sentences of a generated language, 31,566 questions in all, the ones naming particular characters carry a weight 79.33% of the time and the ones naming kinds carry one every time.
                </p>
</>
                <p>
                  Our sentence shows why both character identity and character category can help. The full stop after Dr. is followed by a boundary, while the apostrophe in didn&apos;t and the hyphen in low-cost are internal. Broad categories such as letter and punctuation cannot separate all those decisions. Exact character features help with familiar patterns; category features can still apply when a new name contains unfamiliar combinations.
                </p>
                <GapStrip scenarioKeys={["unfamiliar", "chen"]} showSentences />
                <p>
                  Those two texts are read by a fit that has met eight sentences
                  in which a foreign name keeps its own script. Ortiz is a name
                  those sentences never held and the three characters after it
                  never appeared in them at all, and the answer is still right,
                  while the whole-sequence method taught the identical eight
                  sentences answers Ortiz漢 and 字文 and gets neither of them.
                </p>
                <KeepInMind>
                  {"In the reported held-out sample, character-identity features have zero weight 20.67% of the time, while every category feature has a nonzero weight. In the four displayed gaps, exact character features supply most of the evidence after Dr.; category features contribute the same subtotal before the apostrophe and hyphen. These are properties of the fitted examples."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. How many questions one gap answers">
                <p>
                  {"A wider window introduces more features at each gap. At reach w there are 2w character positions, each supplying an identity feature and a category feature. The 2w minus one adjacent pairs supply two more features each. Add the constant feature. The equation below counts the total; the number of distinct stored features and the training evidence they need are separate costs."}
                </p>
                <Equation>
                  {"questions at a gap  =  1 + 2 × 2w + 2 × (2w − 1)  =  8w − 1"}
                </Equation>
                <NumberTable
                  headings={[
                    "reach",
                    "offsets read",
                    "pairs read",
                    "questions at a gap in the middle of a run",
                  ]}
                  rows={[
                    ["1", "2", "1", "7"],
                    ["2", "4", "3", "15"],
                    ["3", "6", "5", "23"],
                    ["4", "8", "7", "31"],
                  ]}
                  caption="Counted by listing the questions of one gap at each reach rather than by evaluating the formula. A gap near either end of a run asks fewer, since an offset that falls off the end contributes nothing at all."
                />
                <p>
                  {"This page uses a reach of three, giving twenty-three active features at an interior gap. That per-gap count stays fixed as the text or training corpus grows. The number of gaps to score still grows with text length, and the stored feature vocabulary can grow with training data."}
                </p>
                <KeepInMind>
                  {"Each extra position of reach adds eight active features at an interior gap. Within this design, widening the window is how we expose more distant characters. A different feature design could supply distant information another way."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Learning the Answers From Marked Gaps",
          content: (
            <>
              <SubSection title="7. A score that is a sum of weights">
                <p>
                  {"Give each active feature a weight and add those weights to obtain the gap score. A positive score means cut; zero or a negative score means continue the word. We can inspect every term in this local sum. The sequence model also has inspectable score terms, but its final boundary depends on comparing complete paths."}
                </p>
                <Equation>
                  {"score at a gap  =  Σ over the questions this gap asks of  weight(question)"}
                </Equation>
                <p>
                  {"A feature that was never updated has weight zero. The constant feature is the bias: its learned weight shifts the score at every gap. This implementation uses zero as its decision threshold. That convention and the learned bias are separate parts of the rule."}
                </p>
                <WorkedExample>
                  <p>
                  {"Take the two characters a and b as separate labeled words, with a reach of one. All weights start at zero. Training requires the score to have the label’s strict sign, so this tie triggers an update. Adding one to each of the seven active weights produces a score of 7.0 and a cut. If the supplied word is ab instead, the update subtracts one from each weight; the score becomes −7.0 and prediction keeps the characters together."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  The whole of reading a text is adding numbers up and comparing
                  the total against zero. Everything after this section is about
                  where the numbers being added come from, and nothing after it
                  changes what is done with them.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Correcting only the gaps it gets wrong">
                <p>
                  {"Visit each labeled gap and calculate its current score. Leave its weights alone only when the score is strictly positive for a cut or strictly negative for a continuation. Otherwise add the label to every active feature weight: plus one for a cut, minus one for a continuation. This is the perceptron update used here."}
                </p>
                <Equation>
                  {"on a mistake:  weight(question)  ←  weight(question) + label,  with label = +1 to cut and −1 to join"}
                </Equation>
                <p>
                  {"Training updates a score of zero for either label. Prediction resolves that same tie by keeping the characters together. This is an implemented convention; neither joining nor cutting is always the safer error. The eight training sentences contain 189 gaps, including 34 boundaries. The display follows the corrections over twenty passes."}
                </p>
                <PerceptronWalk showSentences />
                <p>
                  {"The first pass makes forty-five corrections. The next passes make ten, five, nine, seven and three, followed by no corrections from the seventh pass onward. The working weights then give every training gap a score with the required sign. The returned model averages earlier weight states too, so its predictions need their own check. Neither result establishes held-out accuracy."}
                </p>
                <KeepInMind>
                  {"A correction-free pass checks the current working weights on the labeled gaps. The averaged model returned by fitting can differ from those weights, and new text can differ from the training text. Evaluate the actual returned model on the data relevant to its use."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The average of every set of weights, not the last one">
                <p>
                  {"The final weights can depend strongly on which examples arrived last. Averaging offers another choice: retain the contribution of earlier weight states rather than returning only the last state. This reduces reliance on one point in the update sequence."}
                </p>
                <p>
                  {"For each weight, take its mean over the training steps, counting an unchanged value for every step it remains in use. Averaged perceptrons are used to improve generalization and reduce sensitivity to the final update. That is a reason to test averaging, rather than a guarantee that every dataset will improve."}
                </p>
                <Equation>
                  {"averaged weight  =  ( Σ over steps of the weight at that step ) / number of steps"}
                </Equation>
                <WorkedExample title="A walk of two steps, averaged">
                  <p>
                  {"Consider the sentence abc labeled as the words ab and c. Use a reach of one and visit the first gap before the second during a single pass. Each gap has seven features. Four are shared: the constant feature and three category features, because all three characters are letters."}
                </p>
                  <NumberTable
                    headings={[
                      "weight of",
                      "after step 1",
                      "after step 2",
                      "averaged",
                    ]}
                    rows={[
                      ["the four questions both gaps ask", "−1", "0", "−0.5"],
                      ["the three naming a and b", "−1", "−1", "−1"],
                      ["the three naming b and c", "0", "+1", "+0.5"],
                    ]}
                    caption="Step 1 meets a score of zero at the gap marked as a join and subtracts one from its seven weights. Step 2 scores the other gap at −4 from the four shared weights, which is wrong for a gap marked as a cut, and adds one to its seven."
                  />
                  <p>
                  {"The four shared weights finish at zero, but their average retains the earlier negative state. The other feature groups retain different histories. With the averaged weights, the two scores are −5.0 and −0.5. Prediction returns abc as one piece, so the second gap remains wrong after this single pass."}
                </p>
                </WorkedExample>
                <WhyThisWorks title="Average the weights without storing every intermediate model">
                  <p>
                  {"We can calculate the mean without keeping a model copy after every step. When a weight changes, record how many steps it held its old value and add that contribution to a running total. Each updated feature needs a total and the step of its last change, alongside its current weight. A final contribution accounts for the steps since its last change."}
                </p>
                  <p>
                  {"Unit updates keep the working weights at integer values. Averaging those values can produce fractions. A half-valued result can arise when two integer states occupy equal shares of the steps; other histories can produce the same mean."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  The answer is a mean over the whole walk rather than the state
                  the walk finished in, which is why the weights are fractions
                  even though every correction adds or subtracts exactly one.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The order the corrections arrive in">
                <p>
                  {"A correction changes shared feature weights, which can change later gap decisions. Different example orders can therefore produce different weights and segmentations. A fixed seed makes the SDK’s shuffled order reproducible; it does not establish which order predicts best."}
                </p>
                <p>
                  {"Eight training orders produce five different readings of the forty-five-character probe, and none matches the supplied reference segmentation. Each run reaches a correction-free pass within seven passes. That describes the working update states, while the displayed probe uses the returned averaged weights. The probe errors concentrate around the unfamiliar surname."}
                </p>
                <InAModel>
                  <p>
                  {"Record the seed and training data when reporting a segmentation. Fixing the order makes a run reproducible; evaluating the result checks whether it is useful. Averaging does not eliminate the variation between these eight small-corpus runs."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"Many weight settings can classify the same training gaps correctly and disagree on new gaps. Small training sets can leave those differences visible. Neither a reproducible seed nor a correction-free pass substitutes for checking the returned model on new text."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "The whole-sequence method has one dedicated weight for each individual gap, so changing that weight repairs only that gap.",
              false,
              "The sequence model shares transition and character scores across positions. We can inspect those contributions and compare alternative paths, but there is no dedicated parameter belonging only to this gap. Changing a shared score can affect other decisions too. A constrained decoder could require a chosen boundary without claiming that it had learned a new local weight.",
            ),
            choice(
              "In this SDK experiment, an annotator leaves uncertain gaps unmarked. Why does the supervised character-role counter lose more usable labels than the independent gap learner?",
              [
                "The place a character occupies is known only once the gaps on both sides of it are settled, so one unmarked gap spoils two characters",
                "The whole-sequence learner needs every sentence marked all the way through or it cannot be run at all",
                "The gap learner can guess the missing marks from the gaps around them",
                "Unmarked gaps are counted as joins, which biases the whole-sequence learner towards long words",
              ],
              0,
              "A marked gap is one usable instance to a gap-at-a-time learner and needs no neighbor. A method working in places inside a word needs two settled gaps per character, so it loses roughly twice as much. Counted on two hundred sentences with two fifths of the gaps marked, the gap learner keeps 39.49 percent of its material and the sequence learner 19.61 percent of its own.",
            ),
            choice(
              "Every weight starts at zero, so the first marked gap the walk meets scores exactly zero. What does the learning rule do with it?",
              [
                "Counts it as a mistake and moves every weight that gap asked about by one, up for a cut and down for a join",
                "Leaves the weights alone, since a score of zero is not a cut",
                "Moves only the weight of the constant question every gap asks",
                "Skips the gap until some other gap has moved its weights",
              ],
              0,
              "During training, this perceptron updates when the signed margin is zero or negative. That includes a zero score even when the prediction-time tie rule would happen to match the label. Prediction uses a separate convention: cut only for a score above zero. The single marked example produces the displayed score of 7.0 after its first correction.",
            ),
            trueFalse(
              "Counted over the held-out sentences, a question naming a particular character carried no weight about one time in five, while a question naming a kind carried one every time.",
              true,
              "Character-specific features can be absent or have zero learned weight on new text. Broader character-type features reuse evidence across different letters and marks; they had nonzero weights throughout this reported held-out sample. That is useful coverage in this experiment, not a guarantee for every new name. A zero weight alone does not prove a feature was never observed, because updates can also cancel.",
            ),
            several(
              "Eight orders of the same eight marked-up sentences were run. Which of these hold?",
              [
                "They give five different readings of the same forty-five characters",
                "All eight are equally right about the 189 gaps they were shown",
                "One of the eight reproduces the reading a person gives",
                "Averaging the weights removes the spread on these eight sentences",
              ],
              [0, 1],
              "The same labeled examples can lead to different weights when their training order changes. These runs reach a correction-free training pass yet produce different probe segmentations, and none matches the supplied reader segmentation. The difficult gaps occur around the unfamiliar surname. Averaging can reduce order sensitivity, but its returned weights still need their own training and held-out checks.",
            ),
        ],
        },
        {
          title: "Part 4. Our Own Sentence, Gap by Gap",
          content: (
            <>
              <SubSection title="11. Forty-four gaps and three of them wrong">
                <p>
                  {"The probe sentence contains an abbreviation, a contraction, a hyphenated compound and a prefix. The eight training sentences include related patterns. Four reference words are absent as complete training entries: Alvarez, expect, low-cost and re-analysis with its period. This tests specific unfamiliar combinations, rather than independent evidence that the overall experiment is unbiased."}
                </p>
                <GapStrip scenarioKeys={["sentence"]} />
                <p>
                  Three of the forty-four gap decisions disagree with the intended reading, all within the surname. The model cuts after v and after a, then misses the boundary after z, producing Alv, a and rezdidn&apos;t in that region. The example lets us trace each local error while also seeing the correctly recovered words. It does not turn a few successful unfamiliar words into a general segmentation-accuracy claim.
                </p>
                <p>
                  {"The whole-sequence model fitted to the same eight sentences recovers Alvarez whole, where the local model fails. It splits the reference words didn’t and expect, which the local model recovers. Section 16 compares their scoring rules; this single contrast cannot identify one cause for every difference."}
                </p>
                <KeepInMind>
                  Any method&rsquo;s answer can be set beside a reader&rsquo;s gap
                  by gap, so forty-one of forty-four is not itself what is new
                  here. What is new is that each of those forty-four was separately
                  produced, so a wrong one can be traced to the questions that
                  produced it, which is the next section.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. One gap opened up">
                <p>
                  A score that is a sum can be listed. Pick a gap, write down
                  every question it asked and the weight that question carries,
                  and the list adds to the number that decided it. Nothing is
                  approximated and nothing is attributed, since the sum is what
                  the calculation actually did.
                </p>
                <GapVotes
                  gapKeys={["full-stop", "apostrophe", "hyphen", "script"]}
                />
                <>
<p>
                  {"The gap after Dr. scores +7.1283. In its character-identity features, the nonzero evidence comes from before the gap; the following identities contribute zero. Some of those features could not have been updated because the training sentences contain neither capital A nor v. Category features and the bias still contribute separately."}
                </p>
                <p>
                  {"The largest single contribution is +3.6304 from the immediately preceding period. The category features sum to −0.3188 here. That is a small subtotal compared with this gap’s character-identity evidence, rather than a universally negligible contribution."}
                </p>
</>
                <>
<p>

                  Now the second and third, which are a letter followed by a punctuation mark inside didn&rsquo;t and inside low-cost. Both are kept together, at −17.5093 and −19.7016, and in both the questions about kinds contribute −12.0563, the same figure to the last digit, since those two gaps ask exactly the same questions about kinds. That is the generalization working, and it is also why the offsets have to be kept apart, since the full stop of Dr. carries its punctuation on the other side of the gap, asks a different set of questions about kinds, and gets −0.3188 out of them rather than −12.0563.
                </p>
                <p>
                  The fourth gap is the opposite case, a change of script where only one of the eleven questions about which characters these are carries any weight, and the cut is made at +0.0367.
                </p>
</>
                <WorkedExample title="The four gaps, each added up by kind of question">
                  <p>
                  {"An interior gap has twenty-three active features at this reach. We can group them into the constant bias, eleven character-identity features and eleven category features. Adding those group totals reproduces the score."}
                </p>
                  <NumberTable
                    headings={[
                      "the gap",
                      "being a gap at all",
                      "which characters",
                      "what kinds",
                      "score",
                    ]}
                    rows={[
                      ["after the full stop of Dr.", "−3.0455", "+10.4926", "−0.3188", "+7.1283"],
                      ["before the apostrophe of didn’t", "−3.0455", "−2.4074", "−12.0563", "−17.5093"],
                      ["before the hyphen of low-cost", "−3.0455", "−4.5997", "−12.0563", "−19.7016"],
                      ["the change of script", "−1.0683", "+1.0000", "+0.1050", "+0.0367"],
                    ]}
                    caption="Each row adds across to its score, to within the rounding of the figures shown. The last row comes from the fit on the eight sentences that mix two scripts, which is why its first column differs."
                  />
                  <p>
                  {"Within one fitted model, the bias column has the same value at every gap. Its negative value favors continuation before the other evidence is added; this training set has 155 nonboundary gaps among 189. That imbalance helps motivate a bias, but does not by itself determine its exact learned weight. The remaining columns show how identity and category evidence alter the baseline."}
                </p>
                </WorkedExample>
                <WhyThisWorks title="What a score contribution can and cannot explain">
                  <p>
                    These contributions explain how this fitted model obtained its score. They do not establish a linguistic cause for the boundary. A different order of training corrections can produce different weights, as section 10 showed, so read the display as an account of this calculation rather than a general rule about English.
                  </p>
                  <p>
                  {"A wrong score also suggests what to investigate. Additional labeled contexts can update the features that appear there. Those weights are shared with other gaps, so an update may repair one decision and change others. Test the resulting model rather than assuming the new annotation repairs only the selected boundary."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  This list describes the local score used for one gap. A sequence
                  model can expose score contributions too, but its boundary
                  belongs to the winning complete path. Keep local feature
                  contributions separate from why one entire path beat another.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. The gaps nobody is asked about">
                <p>
                  A text handed to a segmenter is not always one unbroken run.
                  Chinese quoting an English name, Japanese with line breaks in
                  it, two sentences with a space between them, all contain
                  whitespace, and whitespace is already a boundary. A gap that
                  spans a space is therefore never asked about at all, and the
                  runs on either side of it are answered separately.
                </p>
                <GapStrip scenarioKeys={["spaced"]} />
                <p>
                  {"The eight-character example has two four-character runs separated by a space. There are six within-run gaps to score. The scanner forces a boundary at the space; that is a policy that suits this example, not an error-free linguistic inference for every application. Returned spans keep their offsets in the original text, so the third word starts at position five."}
                </p>
                <p>
                  There is a mild consequence for the reach. A gap near the start
                  of a run has fewer characters behind it than the reach asks for,
                  and the questions about those offsets simply do not arise rather
                  than being answered with anything. So the first gap of a run
                  answers fewer questions than a gap in the middle, which is why
                  the sixth section&rsquo;s count is stated for a gap in the
                  middle.
                </p>
                <KeepInMind>
                  Whitespace ends a run and no question reaches across it, so a
                  method for a script written without spaces still behaves
                  sensibly on text that has some. The offsets a piece reports are
                  in the text as it was handed over, not in the run it came from.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Set Against the Whole-Sequence Method",
          content: (
            <>
              <SubSection title="14. Where each of them wins, on the same marked sentences">
                <p>
                  {"Fit both procedures to the same labeled sentences and score them on the same two hundred held-out sentences. A reference word counts as recovered when both boundaries match. This controls the training and evaluation inputs for this comparison, though other comparisons could reasonably study different data budgets. The two generated tasks use a seventy-word character vocabulary and ordinary English words with spaces removed."}
                </p>
                <MethodRace languageKeys={["characters", "letters"]} />
                <p>
                  On the character language the whole-sequence method is ahead
                  for a long time. At thirty sentences it scores 0.8659 against
                  0.7974, and the lead does not turn over until somewhere between
                  eighty and a hundred and sixty sentences, after which it turns
                  over decisively, 0.9650 against 0.9178 at a hundred and sixty
                  and 0.9799 against 0.9223 at three hundred and twenty.
                </p>
                <>
<p>
                  {"On the generated English-word task, the gap model overtakes the sequence model by twenty training sentences. It reaches 0.9057 at 1,280 sentences. The sequence model’s reported peak is 0.6087, followed by 0.5186 at the largest training size. These curves concern this constructed task."}
                </p>
                <p>
                  {"One plausible explanation is the information supplied to each model. The hidden-state model scores individual character emissions and adjacent roles. The gap model reads a six-character window, including five neighboring pairs, so it can use local combinations directly. The displayed curves measure performance; they do not isolate every cause of the difference."}
                </p>
</>
                <InAModel>
                  <p>The scores 0.9057 and 0.5186 show a substantial difference on this constructed alphabet. The methods make different assumptions: the hidden-state model links individual character roles, while the local predictor uses windows of neighboring characters. Where a single character carries little boundary information, those windows can provide evidence the individual-character model lacks. This result depends on the constructed writing system.</p>
                </InAModel>
                <KeepInMind>
                  {"The generated character task favors the sequence model at smaller training sizes; the gap model later overtakes it. On the English-word task, the gap model leads from twenty sentences onward. Neither curve establishes a general winner for every alphabet or character-based writing system."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where it is plainly the worse of the two">
                <p>Two comparisons here favor the sequence model.</p>
                <p>At thirty training sentences in the generated character language, unfamiliar-word recall is 0.2640 for the gap model and 0.6560 for the sequence model. The gap model remains behind on that group through forty sentences.</p>
<p>At eighty sentences, only nineteen unfamiliar words remain in the held-out sample. Recovering six rather than five of them gives little evidence for a general ranking. Keep that shrinking evaluation group beside the recall figures when comparing the curves.</p>
                <p>The second comparison uses a small corpus whose words are all two characters long. Its state transitions encourage the sequence model’s two-character reading on this probe. That is a learned preference, not a hard length rule. The independent gap model has no joint constraint requiring every output word to have two characters.</p>
                <GapStrip scenarioKeys={["paired", "surname"]} showSentences />
                <p>
                  Handed 生命起源, which is two of the three words those sentences
                  contain, the gap method answers one four-character piece and the
                  whole-sequence method answers the two words. On the surname text
                  underneath it, the ranking reverses again, with five pieces
                  against seven where a reader answers four, so neither of these is
                  a general result about either method.
                </p>
                <KeepInMind>
                  {"The local model has no transition state that tracks a sequence of word roles. On the two-character-word probe, it returns 生命起源 as one piece. This illustrates a failed prediction after limited training, rather than proving that local character features could never learn the needed cuts."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Comparing Local Decisions with a Sequence Objective" id="16-an-answer-that-maximises-nothing">
                <p>
                  {"The sequence decoder maximizes its total path score. No alternative path has a larger score, though ties can exist. The local method chooses each cut from its own score. Those choices can be described as maximizing a sum of independent local preferences; they do not optimize the sequence model’s transition-and-emission score."}
                </p>
                <p>
                  That is checkable rather than merely arguable. Take the reading
                  the gap method gives our sentence and score it with the
                  whole-sequence method&rsquo;s own tables, learned from the same
                  eight sentences.
                </p>
                <NumberTable
                  headings={[
                    "reading",
                    "pieces",
                    "what the whole-sequence score makes of it",
                  ]}
                  rows={[
                    ["one answer per gap", "8", "−155.7756"],
                    ["the best whole sequence", "9", "−151.0253"],
                    ["what a reader answers", "7", "−153.9847"],
                  ]}
                  caption="All three readings of the same forty-five characters, scored by the same tables. The middle row is the largest by construction, since it is what that method returns; the top row is a reading it considered and rejected, and the bottom row is the right answer, which it also rejected."
                />
                <p>
                  {"The reference reading scores below the sequence decoder’s chosen reading. Maximizing that fitted score therefore does not guarantee the intended segmentation. The local reading scores 4.7503 below the sequence optimum under these same tables. That is a difference under the HMM’s score, not an absence of any objective for local decisions."}
                </p>
                <Equation>
                  {"the best whole sequence, less one answer per gap   −151.0253 − (−155.7756)  =  4.7503\n" +
                    "the best whole sequence, less what a reader answers  −151.0253 − (−153.9847)  =  2.9594"}
                </Equation>
                <p>
                  Both differences are in the units of that score, which are
                  logarithms of probabilities, so a larger difference marks a
                  reading the tables find less likely. The reader&rsquo;s reading sits
                  between the other two, nearer the maximum than the gap
                  method&rsquo;s answer is and still short of it.
                </p>
                <p>
                  {"The local model cuts out the single letter a within Alvarez. Each decision uses overlapping character windows, but neither uses the other predicted cut or a joint word-length constraint. A sequence model can also produce odd word lengths, as section 20 checks."}
                </p>
                <KeepInMind>
                  {"Independent decisions do not maximize the HMM path score. On this probe, the local output lies 4.7503 below its optimum, while the reference reading also lies below that optimum. Compare segmentation errors as well as fitted scores when judging the models."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. How the context window changes training and prediction work" id="17-what-it-costs">
                <p>
                  {"With fixed reach w, the local scorer adds at most 8w minus one feature weights per gap. The sequence decoder has a bounded set of role transitions to inspect at each character. Both scale linearly with text length for these fixed model designs. Their actual runtimes also include feature construction, dictionary lookup and implementation overhead; counts of additions and comparisons are not interchangeable timing measurements."}
                </p>
                <p>
                  {"The eight training sentences expose 631 distinct features on 189 gaps. Shared features let examples inform multiple predictions, but the larger parameter space can also leave many settings plausible. The generated character task needs a hundred and sixty training sentences, or 1,361 gaps, before the local model overtakes the sequence model. The table shows that data requirement for this experiment."}
                </p>
                <NumberTable
                  headings={[
                    "marked-up sentences",
                    "marked gaps",
                    "weights learned",
                    "one answer per gap",
                    "the best whole sequence",
                  ]}
                  rows={[
                    ["10", "89", "487", "0.6244", "0.7811"],
                    ["30", "265", "1,048", "0.7974", "0.8659"],
                    ["80", "690", "1,686", "0.8795", "0.9060"],
                    ["160", "1,361", "2,314", "0.9650", "0.9178"],
                    ["320", "2,675", "2,996", "0.9799", "0.9223"],
                  ]}
                  caption="The generated character task, with identical training and held-out sentences for both methods. The feature count is the distinct feature set observed during fitting. It increases across these samples; repeated examples need not introduce any new features."
                />
                <p>
                  {"This experiment presents two separate questions. How many labeled examples are needed to reach a useful evaluation score? Which labels can the training procedure use? The character-task curve and partial-annotation count address those questions differently; the practical choice depends on the data and annotation process."}
                </p>
                <KeepInMind>
                  {"The sequence model leads at thirty sentences and 265 gaps; the local model overtakes it at a hundred and sixty sentences and 1,361 gaps. That is roughly five times the labeled gaps in this task. Distinct stored features increase across the displayed training sizes, but need not grow on every added sentence."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Evidence Beyond the Window and Decisions Beyond the Labels" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="18. A dependency wider than the window">
                <p>
                  A gap reads offsets minus w to w minus one and nothing else, so
                  a character further away than that is not part of the question
                  being asked. This is not a matter of the evidence being weak or
                  the corpus being small. The quantity simply has no place in the
                  question, and more text cannot supply one.
                </p>
                <p>
                  That can be measured rather than asserted, by building a
                  language in which the boundary between two characters is decided
                  by a character a known distance away and nothing else. Every run
                  is either p followed by some padding and then ab and cd as two
                  words, or q followed by the same padding and then abcd as one
                  word. Everything between the deciding character and the gap is
                  identical in the two cases, so the gap can only be settled by
                  reading that far back.
                </p>
                <WindowReach />
                <DerivationTable
                  expressionHeading="the deciding character sits at"
                  reasonHeading="what each reach can do with it"
                  rows={[
                    {
                      expression: "offset −3",
                      reason:
                        "reaches of 1 and 2 answer one of the two texts and get the other wrong; a reach of 3 answers both. Three is the first reach whose window contains that offset.",
                    },
                    {
                      expression: "offset −4",
                      reason:
                        "a reach of 3 now fails, and 4 answers both. Nothing has changed about the language except how far away the evidence sits.",
                    },
                    {
                      expression: "offset −5",
                      reason:
                        "reaches up to 4 fail and 5 answers both, so the smallest reach that works is exactly the distance to the deciding character every time.",
                    },
                    {
                      expression: "offset −6",
                      reason:
                        "no reach up to 5 answers both texts. The evidence is outside every window tried, and the two runs are, to the question being asked, the same run.",
                    },
                  ]}
                />
                <p>
                  The context reach is a design choice as well as a tuning parameter. It determines which nearby dependencies the features can represent; information outside that reach is not supplied to this classifier. Widening it adds eight feature questions per gap in this implementation, increasing the evidence needed to estimate their usefulness. The accuracy and cost trade-off still needs to be measured on representative data.
                </p>
                <KeepInMind>
                  {"Any fixed window excludes characters beyond its reach. A task that genuinely requires one of those characters cannot be settled from identical local windows alone. Whether that restriction matters depends on the boundary rule and the available local clues."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The features are a design decision, not a learned one">
                <p>

                  Every question a gap is asked was chosen by a person. Somebody
                  decided that single characters and neighboring pairs are asked
                  about and that triples are not, that seven kinds of character
                  are told apart and not seventy, and that the offsets are treated
                  separately rather than as a bag. Those choices fix what the
                  method can express, and the learning then only settles how much
                  each of the chosen questions counts.
                </p>
                <p>
                  {"A selected feature set can also omit useful combinations inside the window. Some decisions depend on an interaction that cannot be written as an additive combination of the supplied identity and pair features. Merely involving three characters is not sufficient to prove failure: their existing features may already distinguish the relevant cases."}
                </p>
                <p>
                  {"We can add features by hand, then measure whether the added detail improves held-out decisions. A neural model offers another approach: learn intermediate representations instead of listing every feature combination explicitly. It still has design constraints, including its input window and architecture; learned representations do not remove all limits."}
                </p>
                <KeepInMind>
                  {"Training chooses weights for the supplied features. If two cases need different decisions but have identical feature vectors, more labels alone cannot separate them. Changing the representation or supplying additional context is then necessary."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Independence is false about language">
                <p>
                  The classifier makes each gap decision independently. It cannot use another predicted boundary as evidence or enforce consistency across a whole word. Boundaries describe parts of the same segmentation, so that restriction can matter. The examples below test cases whose required relationship falls outside the local decision rule.
                </p>
                <p>Independent gap predictions can produce a segmentation for any pattern of cuts. A whole-sequence model may assign that segmentation a poor score, but this does not necessarily put it outside the model’s supported paths.</p>
                <p>The controlled check trains on four sentences containing only two-character words, then tests all 1,296 four-character strings from that alphabet. It lets us compare which cuts the methods choose without assuming that local decisions must create an impossible word sequence.</p>
                <NumberTable
                  headings={[
                    "method",
                    "texts answered with a piece of odd length",
                    "out of",
                  ]}
                  rows={[
                    ["one answer per gap", "32", "1,296"],
                    ["the best whole sequence", "45", "1,296"],
                  ]}
                  caption="Both methods were trained on two-character words. Each sometimes returns an odd-length piece on these probes, with forty-five such texts for the sequence model and thirty-two for the local model. Joint decoding alone therefore does not enforce the training corpus’s word lengths."
                />
                <p>
                  {"The sequence model’s role transitions constrain valid paths, but permit word lengths it never saw. Smoothing can give such paths positive probability. The local model has no coupled role-path constraint at all. Those are different mechanisms, and both can still yield an unwanted word length."}
                </p>
                <InAModel>
                  <p>
                  In the two-character-word experiment, independent boundary decisions produce an unsupported word length thirty-two times. The hidden-state method can produce that kind of error too. Its transition constraints enforce compatible role sequences, rather than every word-length property of the language. The counted example therefore supports a narrower comparison than claiming that joint decoding makes such errors impossible.
                </p>
                </InAModel>
                <KeepInMind>
                  {"Local predictions cannot directly condition on one another’s chosen boundaries. If the task requires coordinating those decisions beyond what the character features encode, this design needs additional state, features or joint decoding. Independence alone does not make every returned segmentation contradictory."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Limits of local features and the annotation standard" id="21-where-the-method-has-nothing-to-say">
                <p>A gap classifier cannot use a character outside its feature window or learn a boundary convention that the labels do not express. Separate those restrictions from choices about the training order, features and interpretation of the final score.</p>
                <DerivationTable
                  expressionHeading="Gap or training example"
                  reasonHeading="What the boundary classifier can decide"
                  rows={[
                    {
                      expression: "a gap scoring exactly zero",
                      reason:
                        "Training updates at zero because it requires a strict signed margin. Prediction resolves zero as no cut in this implementation. Cutting or abstaining would be alternative policies whose consequences need evaluation.",
                    },
                    {
                      expression: "a run of one character",
                      reason:
                        "There is no internal gap to score. The nonempty run returns as one piece under the scanner’s policy; whitespace-only or empty text has no such run.",
                    },
                    {
                      expression: "a question the marked gaps never raised",
                      reason:
                        "carries no weight, so it contributes nothing rather than contributing an estimate. At a change of script into unfamiliar characters, one of the eleven questions about which characters these are carried any weight at all, and the gap was decided at +0.0367.",
                    },
                    {
                      expression: "the order the marked gaps are visited in",
                      reason:
                        "The SDK shuffles examples using a configurable seed. Eight seeds here produce five probe readings. Their working weights reach correction-free training passes; their returned averaged weights are a separate object.",
                    },
                    {
                      expression: "evidence outside the window",
                      reason:
                        "not weakly represented but unrepresentable. The smallest reach that answers a language whose boundary depends on a character k back is exactly k, and at a distance of six no reach up to five answers it at all.",
                    },
                    {
                      expression: "a dependency between two gaps",
                      reason:
                        "has nowhere to be recorded, since every question a gap asks reads characters and never another gap’s answer. The consequence is not contradiction, which both methods produce, but that a fact needing two gaps to state cannot be stated.",
                    },
                    {
                      expression: "which questions a gap is asked",
                      reason:
                        "The feature design is supplied before fitting. These eight sentences expose 631 distinct features on 189 gaps. More labels can improve their estimated weights but cannot distinguish cases whose supplied feature vectors are identical.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "Correctness needs a stated segmentation convention and reference labels. Here the HMM ranks its own nine-piece answer at −151.0253 above the reference’s seven-piece answer at −153.9847. Its likelihood score and reference accuracy measure different things.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Choose and document the zero-score policy, shuffled training order and feature design. They are configurable parts of a segmenter and can change its output. The representational limits then tell us which failures may require a different design rather than more examples of the same kind."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "The gap inside didn’t scores minus 17.5093 and the gap inside low-cost scores minus 19.7016, yet the questions about kinds contribute minus 12.0563 to both, to the last digit. Why?",
              [
                "The two gaps ask exactly the same questions about kinds, a letter on one side and a punctuation mark on the other, at the same offsets",
                "The weights for kinds are shared across every gap in the sentence",
                "Both gaps happen to sit inside words the eight marked-up sentences contained",
                "The learning rule clamps the contribution from kinds once a gap is answered correctly",
              ],
              0,
              "Kinds are coarse on purpose, so an apostrophe and a hyphen raise the identical questions and get the identical number. That is the generalization working. It is also why the offsets are kept apart, since the full stop of Dr. carries its punctuation on the other side of the gap and gets minus 0.3188 from kinds rather than minus 12.0563.",
            ),
            trueFalse(
              "On the English words with the spaces taken out, the whole-sequence method finishes below its own best score while the gap method is still climbing.",
              true,
              "In the generated alphabetic-word experiment, the wider local-feature model improves with more training text while the role-conditioned model does not follow the same curve. The gap learner reads nearby character identities, types and pairs together. That richer local context helps on these data, but the comparison does not establish the same learning curves for every alphabetic language.",
            ),
            choice(
              "On the character language at thirty sentences, recall was split by whether the word had been seen before. Which way did the split go?",
              [
                "The gap method recovered more of the unfamiliar words, 0.6560 against 0.2640",
                "The whole-sequence method recovered more of the unfamiliar words, 0.6560 against 0.2640",
                "The two methods recovered unfamiliar words at about the same rate",
                "Neither method recovered any unfamiliar word at that corpus size",
              ],
              1,
              "The whole-sequence method recovers two and a half times as many, and the gap method is behind on unfamiliar words at every size up to forty sentences, after which too few of them remain to rank the two. That is worth stating plainly, because reaching words the corpus never held is the very thing the previous page’s method was built for.",
            ),
            choice(
              "What does answering every gap independently cost, as the page measures it?",
              [
                "It does not optimize the whole-sequence model’s score; on the sentence about Dr. Alvarez it scores 4.7503 below that model’s best path",
                "It returns segmentations the whole-sequence method is incapable of returning",
                "It answers with a piece of a length its corpus never showed more often than the whole-sequence method does",
                "Its cost of reading a text grows with the amount of marked-up text behind the weights",
              ],
              0,
              "Independent gap decisions always produce some segmentation, but this model has no joint score that can require several distant cuts to agree. The reported odd-length pieces illustrate that limitation on this constructed language. The whole-sequence model also makes such errors, so adding a sequence decoder alone does not guarantee the needed word-length constraint. Runtime and modeling capability are separate comparisons.",
            ),
            several(
              "Which of these are decisions nothing in the method makes for you, rather than limits of what it can express?",
              [
                "What to do with a score of exactly zero",
                "What order to visit the marked gaps in",
                "Which questions a gap is asked",
                "That a dependency wider than the reach has nowhere to be written down",
              ],
              [0, 1, 2],
              "The feature window, update order and zero-score policy are explicit design choices. With a fixed feature set, two gaps that have identical visible features must receive the same score even if distant context calls for different labels. More examples can improve estimates of those features, but cannot add an input the model never receives.",
            ),
        ],
        },
        {
          title: "Practice. Scoring Gaps and Opening Them Up",
          practice: [
            exercise(
              "Read our sentence gap by gap",
              [
  "The supplied training sentences mark word boundaries. Train the gap classifier, remove spaces from the Dr. Alvarez probe and compare its proposed cuts with the supplied reader segmentation.",
  "Use window=3, epochs=20 and random_seed=0. Print the model’s segmentation, then the total gap count and number of disagreements. For each disagreement print the adjacent characters and score to four decimal places.",
  "A gap score above zero means cut. The starter constructs the reader’s boundary positions; use those positions as the comparison rather than judging the output by its appearance."
],
              `from oop_ml import PointwiseSegmenter

corpus = [
    ["Dr.", "Sato", "read", "the", "re-print."],
    ["Mr.", "Okonkwo", "didn't", "read", "it."],
    ["the", "high-cost", "test", "didn't", "run."],
    ["Dr.", "Chen", "wrote", "a", "re-run."],
    ["we", "can't", "trust", "the", "low-yield", "re-count."],
    ["Ms.", "Watson", "read", "the", "report."],
    ["the", "test", "didn't", "need", "a", "re-print."],
    ["Dr.", "Sato", "wrote", "the", "report."],
]
text = "Dr.Alvarezdidn'texpectthelow-costre-analysis."
reader = ["Dr.", "Alvarez", "didn't", "expect", "the", "low-cost", "re-analysis."]

boundaries = set()
position = 0
for word in reader[:-1]:
    position += len(word)
    boundaries.add(position - 1)

# Fit a PointwiseSegmenter with window=3, epochs=20 and random_seed=0 on
# the corpus. Print the pieces it splits the text into. Ask it for the
# gap scores, and print how many gaps there are and how many have a sign
# that disagrees with the reader's boundaries, then each such gap.`,
              `from oop_ml import PointwiseSegmenter

corpus = [
    ["Dr.", "Sato", "read", "the", "re-print."],
    ["Mr.", "Okonkwo", "didn't", "read", "it."],
    ["the", "high-cost", "test", "didn't", "run."],
    ["Dr.", "Chen", "wrote", "a", "re-run."],
    ["we", "can't", "trust", "the", "low-yield", "re-count."],
    ["Ms.", "Watson", "read", "the", "report."],
    ["the", "test", "didn't", "need", "a", "re-print."],
    ["Dr.", "Sato", "wrote", "the", "report."],
]
text = "Dr.Alvarezdidn'texpectthelow-costre-analysis."
reader = ["Dr.", "Alvarez", "didn't", "expect", "the", "low-cost", "re-analysis."]

boundaries = set()
position = 0
for word in reader[:-1]:
    position += len(word)
    boundaries.add(position - 1)

model = PointwiseSegmenter(window=3, epochs=20, random_seed=0).fit(corpus)
print(" | ".join(model.split(text).texts))

scores = model.gap_scores(text)
wrong = [gap for gap, score in enumerate(scores) if (score > 0) != (gap in boundaries)]
print(f"{len(scores)} gaps, {len(wrong)} against the reader")
for gap in wrong:
    print(f"between {text[gap]} and {text[gap + 1]}: {scores[gap]:+.4f}")`,
              `Dr. | Alv | a | rezdidn't | expect | the | low-cost | re-analysis.
44 gaps, 3 against the reader
between v and a: +4.3098
between a and r: +7.3693
between z and d: -1.3466`,
              {
question: "Where does a learned boundary rule cut a new surname incorrectly?",
 hints: [
  "fit takes a list of sentences, each represented as a list of words.",
  "gap_scores(text) returns one score between each adjacent character pair. Gap g lies after character g.",
  "A disagreement occurs when score > 0 differs from membership in the reader’s boundary set. A surname absent from training can expose errors despite correct training boundaries."
], check: numberCheck("What score does the gap between the z and the d get, to four places?", -1.3466, 5e-05, "The z/d gap scores -1.3466, so the model keeps those letters together despite the supplied boundary. The other two errors insert cuts inside the surname; the sign determines each decision.") },
            ),
            exercise(
              "Open up the gap after the full stop",
              [
  "Inspect one decision instead of treating its score as an unexplained number. With the same fitted model, examine gap 2 between the period and A in the text with spaces removed.",
  "List that gap’s features with gap_features at window=3 and look up each averaged weight. Print the five features with the largest absolute weights. Then print the feature count and separate totals for character features, character-type features, the bias and all features.",
  "Print the model’s own gap score beside your total. Character features begin with c, type features with t, and bias is the constant feature. The internal helper is imported explicitly in the starter."
],
              `from oop_ml import PointwiseSegmenter
from oop_ml.core.natural_language_processing.tokenization.segmentation.pointwise import gap_features

corpus = [
    ["Dr.", "Sato", "read", "the", "re-print."],
    ["Mr.", "Okonkwo", "didn't", "read", "it."],
    ["the", "high-cost", "test", "didn't", "run."],
    ["Dr.", "Chen", "wrote", "a", "re-run."],
    ["we", "can't", "trust", "the", "low-yield", "re-count."],
    ["Ms.", "Watson", "read", "the", "report."],
    ["the", "test", "didn't", "need", "a", "re-print."],
    ["Dr.", "Sato", "wrote", "the", "report."],
]
text = "Dr.Alvarezdidn'texpectthelow-costre-analysis."
model = PointwiseSegmenter(window=3, epochs=20, random_seed=0).fit(corpus)
questions = gap_features(text, 2, 3)

# Look up the weight of every question with weight_of. Print the five
# largest by size, each beside its question. Then print the number of
# questions, the sum over those starting "c[", the sum over those starting
# "t[", the weight of "bias", the total, and the model&apos;s own score at gap 2.`,
              `from oop_ml import PointwiseSegmenter
from oop_ml.core.natural_language_processing.tokenization.segmentation.pointwise import gap_features

corpus = [
    ["Dr.", "Sato", "read", "the", "re-print."],
    ["Mr.", "Okonkwo", "didn't", "read", "it."],
    ["the", "high-cost", "test", "didn't", "run."],
    ["Dr.", "Chen", "wrote", "a", "re-run."],
    ["we", "can't", "trust", "the", "low-yield", "re-count."],
    ["Ms.", "Watson", "read", "the", "report."],
    ["the", "test", "didn't", "need", "a", "re-print."],
    ["Dr.", "Sato", "wrote", "the", "report."],
]
text = "Dr.Alvarezdidn'texpectthelow-costre-analysis."
model = PointwiseSegmenter(window=3, epochs=20, random_seed=0).fit(corpus)
questions = gap_features(text, 2, 3)

weights = {question: model.weight_of(question) for question in questions}
for question in sorted(weights, key=lambda name: -abs(weights[name]))[:5]:
    print(f"{weights[question]:+.4f}  {question}")

which = sum(weight for question, weight in weights.items() if question.startswith("c["))
kinds = sum(weight for question, weight in weights.items() if question.startswith("t["))
print(f"{len(questions)} questions")
print(f"which characters {which:+.4f}")
print(f"what kinds {kinds:+.4f}")
print(f"being a gap at all {weights['bias']:+.4f}")
print(f"total {sum(weights.values()):+.4f}")
print(f"the score the segmenter reports {model.gap_scores(text)[2]:+.4f}")`,
              `+3.6304  c[-1]=.
-3.0455  bias
+2.6780  c[-3]=D
+2.6780  c[-3..-2]=Dr
+2.6780  c[-2..-1]=r.
23 questions
which characters +10.4926
what kinds -0.3188
being a gap at all -3.0455
total +7.1283
the score the segmenter reports +7.1283`,
              {
question: "Which learned features cause the cut after Dr.?",
 hints: [
  "gap_features(text, 2, 3) supplies the names whose weights participate in this decision.",
  "Sort by abs(weight), not by signed weight, so a strong negative contribution remains visible.",
  "Sum each named group and compare the complete sum with gap_scores(text)[2]. The displayed four-decimal figures are rounded from the underlying weights."
], check: numberCheck("What do the twenty-three weights at that gap add up to, to four places?", 7.1283, 5e-05, "The feature contributions total 7.1283 to four decimal places, matching the model’s positive boundary score. The largest individual contribution is the feature identifying the adjacent period. This explains the current calculation, rather than proving that punctuation alone determines every such decision.") },
            ),
            exercise(
              "Run the same eight sentences in eight orders",
              [
  "Keep the eight marked training sentences fixed and vary only the order used to visit their examples. Fit models with seeds 0 through 7, window=3 and epochs=20.",
  "For each fit print the total training corrections, the probe’s piece count and whether its segmentation equals the supplied reader segmentation. Finish by counting distinct probe segmentations across all eight fits.",
  "Use the recorded update counts to inspect training behavior separately from the held-out probe. A run making no further corrections has settled on the training examples, not proved a rule for every new name."
],
              `from oop_ml import PointwiseSegmenter

corpus = [
    ["Dr.", "Sato", "read", "the", "re-print."],
    ["Mr.", "Okonkwo", "didn't", "read", "it."],
    ["the", "high-cost", "test", "didn't", "run."],
    ["Dr.", "Chen", "wrote", "a", "re-run."],
    ["we", "can't", "trust", "the", "low-yield", "re-count."],
    ["Ms.", "Watson", "read", "the", "report."],
    ["the", "test", "didn't", "need", "a", "re-print."],
    ["Dr.", "Sato", "wrote", "the", "report."],
]
text = "Dr.Alvarezdidn'texpectthelow-costre-analysis."
reader = ("Dr.", "Alvarez", "didn't", "expect", "the", "low-cost", "re-analysis.")

# For each seed from 0 to 7, fit a segmenter with window=3 and epochs=20,
# and split the text. Print the seed, the sum of n_updates_by_epoch, the
# number of pieces and whether the texts equal the reader's. Collect the
# readings in a set and print how many different ones there are.`,
              `from oop_ml import PointwiseSegmenter

corpus = [
    ["Dr.", "Sato", "read", "the", "re-print."],
    ["Mr.", "Okonkwo", "didn't", "read", "it."],
    ["the", "high-cost", "test", "didn't", "run."],
    ["Dr.", "Chen", "wrote", "a", "re-run."],
    ["we", "can't", "trust", "the", "low-yield", "re-count."],
    ["Ms.", "Watson", "read", "the", "report."],
    ["the", "test", "didn't", "need", "a", "re-print."],
    ["Dr.", "Sato", "wrote", "the", "report."],
]
text = "Dr.Alvarezdidn'texpectthelow-costre-analysis."
reader = ("Dr.", "Alvarez", "didn't", "expect", "the", "low-cost", "re-analysis.")

readings = set()
for seed in range(8):
    model = PointwiseSegmenter(window=3, epochs=20, random_seed=seed).fit(corpus)
    reading = model.split(text).texts
    readings.add(reading)
    corrections = sum(model.n_updates_by_epoch)
    print(f"order {seed}: {corrections} corrections, {len(reading)} pieces, the reader's {reading == reader}")

print(f"{len(readings)} different readings")`,
              `order 0: 79 corrections, 8 pieces, the reader's False
order 1: 79 corrections, 6 pieces, the reader's False
order 2: 78 corrections, 8 pieces, the reader's False
order 3: 58 corrections, 6 pieces, the reader's False
order 4: 67 corrections, 8 pieces, the reader's False
order 5: 76 corrections, 8 pieces, the reader's False
order 6: 68 corrections, 7 pieces, the reader's False
order 7: 62 corrections, 6 pieces, the reader's False
5 different readings`,
              {
question: "Can different training orders agree on known gaps but disagree on a new sentence?",
 hints: [
  "n_updates_by_epoch records each pass’s corrections. Sum it for the printed total.",
  "The texts returned by split can be kept as tuples. Compare them with the reader’s tuple and add them to a set to count distinct readings."
], check: numberCheck("How many different readings of the sentence do the eight orders give?", 5, 0.0, "The eight fits produce five distinct probe segmentations. The changed visiting order affects learned weights even though later passes stop making corrections on the training data.") },
            ),
            exercise(
              "Watch a weight become a half",
              [
  "Train once on the single marked sentence [\"ab\", \"c\"] with window=1, epochs=1 and random_seed=0. This tiny run lets us inspect the effect of averaging weights across successive training states.",
  "For each gap of abc, print every feature’s averaged weight. Then print the two gap scores, the selected segmentation and the number of training corrections.",
  "The first gap should stay inside ab, while the second should separate c. Compare those intended labels with the decisions made by the averaged weights after only one pass."
],
              `from oop_ml import PointwiseSegmenter
from oop_ml.core.natural_language_processing.tokenization.segmentation.pointwise import gap_features

model = PointwiseSegmenter(window=1, epochs=1, random_seed=0).fit([["ab", "c"]])

# For gap 0 and gap 1 of the text "abc", print each question the gap asks
# at a reach of one beside its averaged weight. Then print the two gap
# scores, the pieces the text is split into, and the number of
# corrections the single pass made.`,
              `from oop_ml import PointwiseSegmenter
from oop_ml.core.natural_language_processing.tokenization.segmentation.pointwise import gap_features

model = PointwiseSegmenter(window=1, epochs=1, random_seed=0).fit([["ab", "c"]])

for gap in (0, 1):
    print(f"gap {gap}")
    for question in gap_features("abc", gap, 1):
        print(f"  {model.weight_of(question):+.1f}  {question}")

scores = model.gap_scores("abc")
print(f"scores {scores[0]:+.1f} and {scores[1]:+.1f}")
print(" | ".join(model.split("abc").texts))
print(f"corrections in the pass: {model.n_updates_by_epoch[0]}")`,
              `gap 0
  -0.5  bias
  -1.0  c[-1]=a
  -0.5  t[-1]=letter
  -1.0  c[0]=b
  -0.5  t[0]=letter
  -1.0  c[-1..0]=ab
  -0.5  t[-1..0]=letter,letter
gap 1
  -0.5  bias
  +0.5  c[-1]=b
  -0.5  t[-1]=letter
  +0.5  c[0]=c
  -0.5  t[0]=letter
  +0.5  c[-1..0]=bc
  -0.5  t[-1..0]=letter,letter
scores -5.0 and -0.5
abc
corrections in the pass: 2`,
              {
question: "Why can unit weight updates produce a fractional averaged weight?",
 hints: [
  "The corpus is a list containing one list of two word strings.",
  "gap_features gives each gap’s feature names, and weight_of retrieves its averaged weight. bias appears at every gap.",
  "The bias is decreased at one correction and increased at the next. Its average records both states, rather than only its final value."
], check: numberCheck("What is the averaged weight of the constant question every gap asks?", -0.5, 0.0, "The averaged bias is -0.5 even though every correction uses a whole-unit update. Averaging retains the sequence of weight states. One pass still leaves the second gap incorrectly uncut.") },
            ),
          ],
        },
      ]}
    />
  );
}
