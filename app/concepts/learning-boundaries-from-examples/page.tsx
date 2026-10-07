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
  title: "Learning Boundaries From Examples · oop_ml",
  description: "Learn boundary decisions from local character features in labelled examples.",
};

export default function LearningBoundariesFromExamplesPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["learning-boundaries-from-examples"]}
      technicalStart="Part 2. What a Gap Is Asked"
      openingTitle="Ask Each Gap Whether a Word Ends Here"
      playgroundIntro="Select a gap and examine the neighbouring characters used to classify it. Compare individual boundary decisions with the resulting complete segmentation."
      title="Learning Boundaries From Examples"
      tagline="Learn boundary decisions from local character features in labelled examples."
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
                  The previous page gave every character of a text one of four
                  places in its word, and chose the whole run of places at once
                  by adding up a score along it and taking the largest total.
                  That is a real advantage and it is worth naming before we give
                  it up. A word cannot be left half open, a boundary in one spot
                  can be paid for by what it forces two characters later, and
                  the answer that comes back is the best reading of the sentence
                  under one account of what sentences look like.
                </p>
                <>
<p>
                  Now ask a narrow question of such an answer. The sentence we carry through this section is Dr. Alvarez didn&rsquo;t expect the low-cost re-analysis, and with its spaces taken out it is forty-five characters with forty-four gaps between them. Point at the gap between the full stop of Dr. and the A of Alvarez and ask what decided it.
                </p>
                <p>
                  There is no answer, and the reason is structural rather than a shortcoming of any implementation. The score being maximised is a sum over the whole run, so the boundary at that gap was settled by a comparison between two complete readings of forty-five characters, one of which cut there and one of which did not, and the difference between those two totals includes terms drawn from every character in the sentence.
                </p>
                <p>
                  Changing the answer at that gap alone is not something the method can be asked to do.
                </p>
</>
                <p>
                  The same holds for correcting it. If a reader sees one gap
                  answered wrongly there is no weight to reach for, because the
                  quantity that decided it was assembled out of counts about
                  places and steps that every other gap in the sentence also
                  leaned on. And the annotation has the same shape from the other
                  direction, which is the third section.
                </p>
                <KeepInMind>
                  Scoring a whole sentence buys consistency and costs
                  addressability. Nothing on this page recovers the consistency;
                  what changes is that a single decision becomes a thing you can
                  look at, correct and count.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. One question at every gap, answered on its own">
                <p>
                  Between any two neighbouring characters of a text there either
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
                  Forty-one of the forty-four gaps agree with the reading a
                  person gives, and the three that do not are the three drawn in
                  red, all of them inside the surname. What matters for now is
                  not the score but the shape of the answer, since every one of
                  those bars was arrived at without consulting any other bar, and
                  the three wrong ones can be pointed at individually in a way
                  the previous method offers no vocabulary for.
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
                  This is the argument the method was invented for, and it is
                  about who has to do the work rather than about accuracy.
                  Imagine somebody going through text marking boundaries and
                  stopping wherever they are unsure. Whether a compound noun is
                  one word or two is genuinely arguable, so a careful annotator
                  leaves such gaps alone and marks the ones they are certain of.
                </p>
                <p>
                  To a gap-at-a-time learner that corpus is simply fewer
                  examples, since a marked gap is one instance and needs no
                  neighbour. To a method that works in places inside a word it is
                  much worse than that, because the place a character occupies is
                  known only when the gaps on both sides of it have been settled,
                  so an unmarked gap spoils the two characters it sits between.
                  Two hundred sentences of a generated language, with a share of
                  the gaps marked at random, say how much worse.
                </p>
                <AnnotationReach />
                <p>
                  With two fifths of the gaps marked, the gap learner keeps
                  39.49% of its training material and the sequence learner keeps
                  19.61% of its own, a little over half as much, which is what
                  you would expect from needing two independent events rather
                  than one. At a fifth marked it is 20.41% against 7.79%, so the
                  gap between them widens as the annotation gets sparser.
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
                    The implementation this page runs on is handed sentences that
                    are marked all the way through, because that is the form
                    every other segmenter in the family reads, and the numbers
                    above are counted rather than fitted. Nothing in the learning
                    rule would change for a partly marked corpus, since it never
                    looks at more than one gap at a time, and that is precisely
                    the claim the method rests on.
                  </p>
                </InAModel>
                <KeepInMind>
                  The reason to give up the whole-sequence answer is what can be
                  learned from, not what can be read. A corpus somebody marked in
                  part is worth roughly twice as much to a method that asks one
                  gap at a time.
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
                  A gap has to be answered from something, and the only thing
                  available is the text around it. Number the characters so that
                  the one immediately before the gap is at offset minus one and
                  the one immediately after is at offset zero, and then decide how
                  far to look in each direction. That distance is the one number
                  the whole design turns on, and we will call it the reach.
                </p>
                <Equation>
                  {"… c[−3] c[−2] c[−1] | c[0] c[1] c[2] …   with the gap at the bar"}
                </Equation>
                <p>
                  Within the reach, each single character is one thing the gap is
                  asked about, and each neighbouring pair of them is another. The
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
                    At a reach of one, the gap in the two characters a and b is
                    asked seven things. Whether it is a gap at all, which
                    contributes the same number everywhere. Which character sits
                    on the left, and which on the right. What kind each of those
                    is. Which pair they make, and what pair of kinds that is. Seven
                    questions, and the next two sections are about the kinds and
                    about where seven comes from.
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
                  Asking which character sits at an offset is exact and it is
                  useless the first time an unfamiliar character turns up. So each
                  offset is asked a second, coarser question, which is what kind
                  of character that is. Seven kinds are enough for this purpose,
                  namely a Han character, a hiragana, a katakana, any other
                  letter, a digit, a punctuation mark, and everything else.
                </p>
                <>
<p>
                  What that buys is a rule learned once instead of once per pair. A boundary between a run of one script and a run of another is a single thing to learn, rather than something that must be learned separately for every one of the thousands of character pairs that could sit astride it. And it never goes silent.
                </p>
                <p>
                  Counted over every gap of two hundred held-out sentences of a generated language, 31,566 questions in all, the ones naming particular characters carry a weight 79.33% of the time and the ones naming kinds carry one every time.
                </p>
</>
                <p>
                  Our own sentence needs both halves, and it is worth being exact
                  about which does what. The full stop that ends Dr. is followed
                  by a boundary; the apostrophe inside didn&rsquo;t and the hyphen
                  inside low-cost are not. All three are a letter next to a
                  punctuation mark, so the kinds alone cannot separate them, and
                  which character it is has to settle it. Meanwhile in a name
                  nobody has written down, the kinds are all there is.
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
                  A question about which character it is carries no weight 20.67%
                  of the time on unfamiliar text and settles the full stop of Dr.
                  almost on its own; a question about what kind it is always
                  carries one and gave the apostrophe and the hyphen the identical
                  figure. Both are asked at every offset and a gap is answered by
                  whatever the two of them add up to.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. How many questions one gap answers">
                <p>
                  Count them, since the number is exact and it is the only cost a
                  wider reach carries. A reach of w covers 2w offsets, minus w to
                  w minus one, and each of those contributes a question about the
                  character and a question about its kind. The neighbouring pairs
                  inside that stretch number 2w minus one, and each contributes
                  the same two. One more for the fact of being a gap at all.
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
                  Three is the reach used everywhere on this page, so a gap in
                  the middle of a run answers twenty-three questions. That is
                  small, it does not grow with the length of the text, and it does
                  not grow with the amount of marked-up text the answers were
                  learned from, which is what makes the cost of reading a text
                  the dull half of this method.
                </p>
                <KeepInMind>
                  Eight times the reach, less one. Widening the reach is linear
                  in questions asked and, as the eighteenth section shows, is the
                  only thing that lets a gap see evidence sitting further away.
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
                  Each of the questions at a gap gets a number, and the answer at
                  that gap is the sum of the numbers of the questions it asked.
                  Positive means cut and anything else means keep going. That is
                  the whole scoring rule, and its plainness is the property the
                  eleventh section trades on, since a sum can be listed term by
                  term where a maximum over readings cannot.
                </p>
                <Equation>
                  {"score at a gap  =  Σ over the questions this gap asks of  weight(question)"}
                </Equation>
                <p>
                  A question the marked-up sentences never raised has a weight of
                  zero and therefore contributes nothing, which is the right
                  behaviour and not a special case. There is no threshold to
                  choose either, because the constant question every gap asks can
                  absorb any base rate on its own.
                </p>
                <WorkedExample>
                  <p>
                    Take one sentence of two characters, a and b, marked as two
                    words, and a reach of one. Every weight starts at zero, so the
                    gap scores zero, which is right for neither answer and counts
                    as a mistake. Add one to each of the seven weights the gap
                    asked about. Now that same gap scores exactly 7.0 and the text
                    comes back as a and b. Mark the sentence as the single word ab
                    instead and every weight becomes minus one, the gap scores
                    −7.0, and the text comes back whole.
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
                  Walk through the marked gaps one at a time. Score the gap with
                  the weights as they currently stand. If the sign agrees with
                  what the annotator marked, change nothing at all and move on. If
                  it does not, add one to every weight the gap asked about when
                  the annotator said cut, and subtract one when they said keep
                  going. That is the whole learning rule, and it is worth noticing
                  that it never looks at a gap it is already right about.
                </p>
                <Equation>
                  {"on a mistake:  weight(question)  ←  weight(question) + label,  with label = +1 to cut and −1 to join"}
                </Equation>
                <p>
                  A score of exactly zero counts as a mistake while learning,
                  since zero is right for neither answer, and at reading time it
                  is not a cut, because leaving text whole is the more
                  conservative of the two errors. Our eight marked-up sentences
                  hold 189 gaps between them, 34 of which carry a boundary, and
                  here is what the corrections do over twenty passes.
                </p>
                <PerceptronWalk showSentences />
                <p>
                  Forty-five corrections on the first pass, then ten, five, nine,
                  seven, three, and from the seventh pass onwards none at all,
                  which means every one of the 189 gaps is now answered the way
                  the annotator marked it. That is a stopping condition rather
                  than a convergence in any deeper sense, and the ninth and tenth
                  sections are about the two things it does not settle.
                </p>
                <KeepInMind>
                  The rule only ever repairs what it is currently wrong about, so
                  it stops as soon as it is right about everything it was shown.
                  Being right about the marked gaps is not the same as being right
                  about a gap it has not been shown, which is what the fourteenth
                  section measures.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. The average of every set of weights, not the last one">
                <p>
                  There is a repair worth making before the weights are used, and
                  it costs almost nothing. The walk of the previous section passes
                  through one set of weights after every correction, and the last
                  of those has no special claim on being the best. It is simply
                  the one that happened to be current when the passes ran out, and
                  it carries the full imprint of whatever gap was corrected most
                  recently.
                </p>
                <p>
                  So answer with the mean of every set of weights the walk passed
                  through, counting each one once for every step it survived. That
                  is the averaged form Freund and Schapire analysed, and it
                  generalises considerably better than the final set on data the
                  walk has not seen.
                </p>
                <Equation>
                  {"averaged weight  =  ( Σ over steps of the weight at that step ) / number of steps"}
                </Equation>
                <WorkedExample title="A walk of two steps, averaged">
                  <p>
                    Take one sentence of three characters, a, b and c, marked
                    as the two words ab and c, with a reach of one and a single
                    pass that visits the first gap first. The two gaps ask
                    seven questions each, and four of the seven are the same
                    four at both, namely whether this is a gap at all and the
                    three about kinds, since every character here is a letter.
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
                    The four shared weights finish the walk at zero, as though
                    nothing had been learned about them, and the average
                    remembers that they spent half the walk at minus one. That
                    is where a weight of one half comes from. It also shows
                    what one pass is worth, since the averaged weights score
                    the two gaps at −5.0 and −0.5 and the text comes back as
                    the single piece abc, with the second gap still wrong.
                  </p>
                </WorkedExample>
                <WhyThisWorks>
                  <p>
                    Written that way it looks expensive, since it seems to need
                    every set of weights kept. It does not. A weight only changes
                    on a correction, so between two corrections it contributes its
                    own value once per step, and the running total can be charged
                    that whole stretch at the moment it next changes. Each weight
                    therefore needs one extra number recording when it last moved,
                    and nothing at all is stored per step. That is why the
                    averaged form is used rather than merely admired.
                  </p>
                  <p>
                    It also explains the fractions in the twelfth section. Every
                    correction adds or subtracts exactly one, so whole numbers are
                    what the weights would be if the answer were the state the
                    walk finished in, and a weight of one half belongs to a
                    question that spent half the walk at one value and half at
                    another.
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
                  The rule repairs the gap it is currently looking at, so which
                  gap it looks at first changes which weights move first, which
                  changes what it is wrong about next. Two runs over the same
                  marked-up sentences in two different orders therefore end up
                  with different weights, and the widget in the eighth section
                  shows what that is worth on our own sentence.
                </p>
                <p>
                  Eight orders over the same eight sentences give five different
                  readings of the same forty-five characters, and none of the
                  eight reproduces the reading a person gives. Every one of them
                  runs out of corrections within seven passes, so all eight are
                  equally right about the 189 gaps they were shown and disagree
                  only about the gaps they were not. The disagreement is
                  concentrated in the surname, which is the one stretch of the
                  sentence made of characters those sentences never carried.
                </p>
                <InAModel>
                  <p>
                    That is worth stating flatly rather than as a caveat. A
                    segmentation quoted from this method is a segmentation from
                    one order of one corpus, and the order is a free choice that
                    nothing in the method makes for you. Fixing it makes two runs
                    agree with each other; it does not make either of them the
                    right one. The averaging of the ninth section reduces the
                    spread and, on eight sentences, does not remove it.
                  </p>
                </InAModel>
                <KeepInMind>
                  Being right about every marked gap does not pin the weights
                  down, because many different sets of weights are right about the
                  same gaps and they disagree about the gaps nobody marked. On a
                  small corpus that disagreement is visible in the answer.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "When the whole-sequence method answers one gap wrongly, a reader can point at the weight that decided that gap and change it.",
              false,
              "There is no such weight. The score being maximised is a sum over the whole run, so a single boundary was settled by comparing two complete readings of forty-five characters, and the difference between those totals draws on every character in the sentence. Scoring a whole sentence buys consistency and costs addressability.",
            ),
            choice(
              "An annotator marks only the gaps they are certain of and leaves the arguable ones alone. Why does that corpus cost the whole-sequence learner more than the gap learner?",
              [
                "The place a character occupies is known only once the gaps on both sides of it are settled, so one unmarked gap spoils two characters",
                "The whole-sequence learner needs every sentence marked all the way through or it cannot be run at all",
                "The gap learner can guess the missing marks from the gaps around them",
                "Unmarked gaps are counted as joins, which biases the whole-sequence learner towards long words",
              ],
              0,
              "A marked gap is one usable instance to a gap-at-a-time learner and needs no neighbour. A method working in places inside a word needs two settled gaps per character, so it loses roughly twice as much. Counted on two hundred sentences with two fifths of the gaps marked, the gap learner keeps 39.49 percent of its material and the sequence learner 19.61 percent of its own.",
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
              "Zero is right for neither answer, so it counts as a mistake while learning, and a gap already answered correctly is never touched. On two characters marked as two words, at a reach of one, that single correction adds one to seven weights and the same gap then scores exactly 7.0. Reading is the other way round, where a score of zero is not a cut, because leaving text whole is the more conservative of the two errors.",
            ),
            trueFalse(
              "Counted over the held-out sentences, a question naming a particular character carried no weight about one time in five, while a question naming a kind carried one every time.",
              true,
              "Over 31,566 questions the ones naming particular characters carried a weight 79.33 percent of the time, which leaves 20.67 percent silent, and the ones naming kinds were never silent. That is why both are asked at every offset. Naming the character is exact, and it is what settles the full stop of Dr. almost on its own. Naming the kind is what still answers in a name nobody has written down, where the kinds are all there is.",
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
              "Each run stops as soon as it is right about everything it was shown, so all eight are right about the same 189 gaps and disagree only about the gaps nobody marked. None of the eight matches a reader, and the disagreement sits in the surname, the one stretch made of characters those sentences never carried. Averaging reduces the spread here and does not remove it.",
            ),
        ],
        },
        {
          title: "Part 4. Our Own Sentence, Gap by Gap",
          content: (
            <>
              <SubSection title="11. Forty-four gaps and three of them wrong">
                <p>
                  Now the whole thing on our own sentence, with the marked-up
                  sentences chosen so that the exercise is not rigged. Eight
                  sentences carry the shapes the sentence needs, which are an
                  abbreviation whose full stop ends it, a contraction, a
                  hyphenated compound and a prefix. Four of the seven words a
                  reader answers with are absent from those eight sentences
                  altogether, namely Alvarez, expect, low-cost and re-analysis
                  with its full stop.
                </p>
                <GapStrip scenarioKeys={["sentence"]} />
                <p>
                  Three of the forty-four gaps come out against the reading a
                  person gives, and all three are inside the surname. The method
                  cuts after the v and after the a, leaving a single letter
                  standing as a word of its own, and then fails to cut between the
                  z and the d that begins didn&rsquo;t, so what comes back is Alv,
                  then a, then rezdidn&rsquo;t. Everywhere else it is right, and
                  three of the four words the sentences never held come back
                  exactly, which is the thing to take from the widget.
                </p>
                <p>
                  Set against it is the whole-sequence method taught the identical
                  eight sentences. It recovers Alvarez whole, which is precisely
                  where this method fails, and it loses didn&rsquo;t and expect,
                  which is precisely where this method succeeds. The sixteenth
                  section comes back to the surname, where the difference between
                  the two is a consequence of how each answer is put together
                  rather than an accident.
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
                  The first of those is the gap between the full stop of Dr. and the A of Alvarez, and it comes to +7.1283. Every question about the characters after the gap carries a weight of zero, so the whole of the positive case is made from behind it, and two of those questions could never have carried a weight at all, since those eight sentences contain no capital A and no v anywhere.
                </p>
                <p>
                  The single largest contribution is +3.6304, for the full stop sitting immediately to the left, and the questions about kinds contribute −0.3188 between them, which is to say almost nothing.
                </p>
</>
                <>
<p>
                  Now the second and third, which are a letter followed by a punctuation mark inside didn&rsquo;t and inside low-cost. Both are kept together, at −17.5093 and −19.7016, and in both the questions about kinds contribute −12.0563, the same figure to the last digit, since those two gaps ask exactly the same questions about kinds. That is the generalisation working, and it is also why the offsets have to be kept apart, since the full stop of Dr. carries its punctuation on the other side of the gap, asks a different set of questions about kinds, and gets −0.3188 out of them rather than −12.0563.
                </p>
                <p>
                  The fourth gap is the opposite case, a change of script where only one of the eleven questions about which characters these are carries any weight, and the cut is made at +0.0367.
                </p>
</>
                <WorkedExample title="The four gaps, each added up by kind of question">
                  <p>
                    A gap in the middle of a run asks twenty-three questions at
                    this reach. One is whether it is a gap at all, eleven name
                    particular characters and eleven name kinds, and the score
                    is the three subtotals added together.
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
                    Read down the columns. The first is the same number for
                    every gap of one fit, and it is negative because most gaps
                    are not boundaries, 155 of the 189 marked ones here. The
                    third is what the two punctuation marks inside a word have
                    in common. The second is the only place the full stop of
                    Dr. gets its cut from, and it is also the only column that
                    tells the apostrophe from the hyphen.
                  </p>
                </WorkedExample>
                <WhyThisWorks>
                  <p>
                    It is worth being exact about what this is and is not. This is
                    a decomposition of the score, so it says what the arithmetic
                    did. It does not say what caused the boundary in the language,
                    and a different order of the corrections produces a different
                    set of weights, as the tenth section showed. Reading it as
                    evidence about English rather than about this fit would be
                    reading it for more than it holds.
                  </p>
                  <p>
                    What it does support is a repair. A gap answered wrongly names
                    the questions that got it wrong, and marking more text in which
                    those questions arise moves exactly those weights. That is a
                    loop an annotator can be put in, and it is the second half of
                    the argument the method was invented for.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The whole justification of this method over the previous one, on
                  a single decision, is this list. A maximum over readings has no
                  such list, because the quantity that decided one gap is a
                  difference between two totals over the whole sentence.
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
                  Eight characters here with a space in the middle, so there are
                  two runs of four and six gaps rather than seven. The boundary at
                  the space is free, in the sense that it costs no question and
                  cannot be got wrong, and the six that remain are all answered
                  correctly. The other thing being kept is that the pieces coming
                  back report where they sit in the original text rather than in
                  their own run, so the third word starts at position five rather
                  than at zero.
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
                  The comparison has to be made on the same evidence or it says
                  nothing, so both methods are handed the identical marked-up
                  sentences at every size, and both are scored on the same two
                  hundred held-out sentences, with a word counting as recovered
                  only when both of its ends land where the sentence put them.
                  Two generated languages are used, one of seventy words spelled
                  out of forty characters and one of ordinary English words with
                  the spaces taken out.
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
                  On the English words the picture is not the same picture shifted along, it is a different picture. The gap method passes the other one by twenty sentences and then keeps climbing, reaching 0.9057 at 1,280 sentences, while the whole-sequence method peaks at 0.6087 and then falls back to 0.5186 as more text is added.
                </p>
                <p>
                  The previous page measured why that happens to it, which is that a single letter of an alphabet says very little about where in its word it sits and says less as the vocabulary widens. A gap method never asks a character where it sits; it asks a window of six characters and five pairs whether a boundary is between the middle two, and that question keeps its answer.
                </p>
</>
                <InAModel>
                  <p>
                    I went into this expecting the two methods to be close on the
                    alphabet, and 0.9057 against 0.5186 is not close. The honest
                    reading is that these two are not variants of one approach
                    with a knob between them. One of them is built on a claim
                    about individual characters and the other on a claim about
                    windows of them, and on a writing system where an individual
                    character carries little the first claim fails while the
                    second does not.
                  </p>
                </InAModel>
                <KeepInMind>
                  On a large character set the whole-sequence method wins until
                  there is a good deal of marked-up text; on an alphabet the gap
                  method wins throughout and by a wide margin. Neither of those is
                  a fact about which method is better in general.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where it is plainly the worse of the two">
                <p>
                  Two places, and both are worth stating without softening.
                </p>
                <p>
                  The first is words the marked-up sentences never held, which is
                  the very thing the previous page&rsquo;s method was built to
                  reach. Splitting the same recall by whether the word had been
                  seen, on the character language at thirty sentences, the gap
                  method recovers 0.2640 of the unfamiliar words and the
                  whole-sequence method recovers 0.6560 of them, two and a half
                  times as many. The table under the widget above carries that
                  split at every size, and the gap method is behind on unfamiliar
                  words at every size up to forty sentences. At eighty only
                  nineteen unfamiliar words are left among the held-out
                  sentences, and the gap method recovers six of them to the
                  other method&rsquo;s five, which is too few to rank the two
                  on.
                </p>
                <p>
                  The second is small corpora of a script whose characters are
                  strongly positional. Four sentences whose every word is exactly
                  two characters long are enough to teach the whole-sequence
                  method that words come in twos, since that fact lives directly
                  in its table of steps from one place to the next. The gap method
                  has nowhere to put it.
                </p>
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
                  The same independence that lets the full stop of Dr. be traced
                  to a weight of +3.6304 is what leaves four sentences of
                  two-character words with nowhere to record that words come in
                  twos, and 生命起源 then comes back as a single piece. No setting
                  keeps the first of those without the second.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. An answer that maximises nothing">
                <p>
                  Here is the cost of independence stated exactly. The
                  whole-sequence method returns the reading with the largest total
                  score, so its answer is the best reading under one account of
                  the sentence, and changing any single boundary in it lowers that
                  total. An answer assembled out of independent decisions has no
                  such property, because there is no quantity anywhere in the
                  method that mentions the whole run.
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
                  Read the bottom row before the top one. The reading a person
                  gives scores lower than the reading the whole-sequence method
                  chose, so being the maximum of that score is not the same as
                  being right, and the consistency the method buys is consistency
                  with its own account of sentences rather than with the language.
                  The top row then says what independence costs in those terms, a
                  gap of 4.7503 between an answer that maximises that score and
                  one that maximises nothing.
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
                  What that looks like in the answer is the single letter a
                  standing as a word inside a surname. Cutting after the v is
                  defensible on its own and cutting after the a is defensible on
                  its own, and nothing in the method ever puts the two decisions
                  in the same sentence. It is tempting to say the whole-sequence
                  method could not have produced such a thing, and that is not
                  true, which is the subject of the twentieth section.
                </p>
                <KeepInMind>
                  The answer is a set of decisions rather than the maximum of
                  anything, so there is no reading of it as best under any account
                  of what sentences look like. On our own sentence that costs
                  4.7503 by the other method&rsquo;s own score, and it costs the
                  surname.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What it costs">
                <p>
                  Two costs, and the honest one is not the time. Reading a text is
                  8w minus 1 additions per gap at a reach of w, so twenty-three
                  per gap at the reach used here, against the whole-sequence
                  method&rsquo;s eight comparisons per character. Both are linear
                  in the length of the text and neither grows with the amount of
                  marked-up text behind them, so on a sentence of forty-five
                  characters the difference is a few hundred additions and is not
                  a consideration.
                </p>
                <p>
                  The cost that matters is marked gaps. Our eight sentences hold
                  189 of them and produce 631 weights, so there are more weights
                  than examples, which is the ordinary situation for this kind of
                  model and is the reason the tenth section&rsquo;s eight orders
                  disagree. On the generated character language, the gap method
                  needs a hundred and sixty sentences, 1,361 marked gaps, before
                  it passes a whole-sequence method that was already ahead at
                  thirty sentences and 265 gaps.
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
                  caption="The character language, both methods on the same sentences, scored on the same two hundred held-out ones. The count of weights is what the marked gaps raised between them, so it grows with the corpus and never stops growing."
                />
                <p>
                  Set that beside the third section and the trade is visible from
                  both ends. This method needs more marked gaps than the other one
                  to reach the same score, and it can be handed marked gaps that
                  the other one cannot use at all. Which of those dominates is a
                  question about how the annotation was produced rather than about
                  either method.
                </p>
                <KeepInMind>
                  The price is paid in marked gaps rather than in time, and it is
                  roughly five times as many of them on the character language for
                  the lead to change hands. The number of weights grows with the
                  corpus without limit, since a new pair of characters raises new
                  questions.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
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
                  So the reach is not a tuning parameter in the usual sense of
                  trading accuracy against cost. It is a statement about which
                  dependencies can be written down at all, made before any text is
                  read, and a dependency outside it is invisible rather than
                  poorly estimated. Widening the reach is not free either, since
                  each step raises eight more questions per gap and every one of
                  them needs marked gaps to answer.
                </p>
                <KeepInMind>
                  Whatever the reach, some real dependency is wider than it, and
                  for that dependency the method has no representation rather than
                  a weak one. A long-range agreement in a sentence is the ordinary
                  example and it is entirely out of reach here.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The features are a design decision, not a learned one">
                <p>
                  Every question a gap is asked was chosen by a person. Somebody
                  decided that single characters and neighbouring pairs are asked
                  about and that triples are not, that seven kinds of character
                  are told apart and not seventy, and that the offsets are treated
                  separately rather than as a bag. Those choices fix what the
                  method can express, and the learning then only settles how much
                  each of the chosen questions counts.
                </p>
                <p>
                  What follows is a ceiling that no amount of text raises. A
                  boundary whose evidence is a triple of characters, or a
                  distinction the seven kinds do not draw, has no question to
                  attach itself to, so the weights cannot represent it however
                  many marked gaps arrive. It is the same shape of limit as the
                  window and it is easier to miss, because widening the questions
                  is a change to the design where widening the reach is a change
                  to a number.
                </p>
                <p>
                  Two things follow that are worth separating. Adding questions
                  widens what can be represented and at the same time thins the
                  evidence behind each one, since every new question needs marked
                  gaps to settle it and our eight sentences already raise 631 of
                  them on 189 gaps. And a ceiling set by hand is one that can be
                  raised by hand, which is exactly what the neural descendants of
                  this idea do, replacing the chosen questions with a function
                  that learns what to read.
                </p>
                <KeepInMind>
                  The set of questions is the model. Its ceiling was fixed by
                  whoever wrote the list, and no quantity of marked-up text moves
                  it, which makes it the one part of this method that cannot be
                  improved by annotating more.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Independence is false about language">
                <p>
                  The assumption underneath every answer on this page is that the
                  boundary at one gap can be settled without knowing the boundary
                  at any other. That assumption is false, and it is worth saying
                  as a fact rather than as a caveat. The gaps of a text are the
                  boundaries of the same words, so the answer at one gap and the
                  answer at the next describe two ends of one object.
                </p>
                <p>
                  What is tempting here is to conclude that the answers can
                  therefore contradict each other in ways a whole-sequence method
                  could not produce, and that turns out to be wrong. Any set of
                  cuts is a segmentation, so there is no arrangement of
                  independent answers that the other method is incapable of
                  returning. I checked it on the case where the argument should be
                  strongest, four marked-up sentences whose every word is exactly
                  two characters long, over all 1,296 four-character texts
                  spellable from their alphabet.
                </p>
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
                  caption="A corpus in which every word is two characters long, so a piece of odd length is a word shape the corpus never showed. The whole-sequence method produces one more often, not less, which is the opposite of what the argument from independence predicts."
                />
                <p>
                  So the difference is not that one method forbids incoherent
                  answers. Both produce them, and here the one with a model of the
                  sentence produces them more often, since it has never seen a
                  one-character word either and what decides those cases for it is
                  the amount added to every count it never saw. The real difference
                  is the one the sixteenth section measured, which is that only one
                  of the two answers is the maximum of anything, and the practical
                  consequence, which the fifteenth section already showed, is that
                  a fact about word shapes has nowhere to be recorded here.
                </p>
                <InAModel>
                  <p>
                    I had this section written the other way round before I
                    counted, with the corpus of two-character words as the case
                    where independent answers invent a word length the language
                    does not have. They do, thirty-two times, and so does the
                    method that supposedly cannot. The claim that survives is
                    narrower than the one I set out to make and it is the one the
                    numbers support.
                  </p>
                </InAModel>
                <KeepInMind>
                  Independence is false, and what it costs is not that the answers
                  contradict one another. It is that a dependency between two gaps
                  has nowhere to live, so the method cannot be told a fact it
                  would need two gaps to state.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs and questions on
                  which the method stops being defined rather than becoming
                  approximate, with what has to be decided in each case and what
                  turns on the decision. The decisions are the ones worth a
                  reader&rsquo;s attention, since nothing in the method makes them
                  and each of them changes what comes back.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a gap scoring exactly zero",
                      reason:
                        "right for neither answer, so something has to be decided. Counting it as a mistake while learning and as no cut while reading is one choice, and the other choices are to cut, which makes an unfamiliar text fall apart, or to refuse and leave the gap for something else. Nothing in the arithmetic prefers any of the three.",
                    },
                    {
                      expression: "a run of one character",
                      reason:
                        "has no gap, so there is no question and no answer. The run is one word by default rather than by decision, and that is the only case in which this method returns something without having been asked anything.",
                    },
                    {
                      expression: "a question the marked gaps never raised",
                      reason:
                        "carries no weight, so it contributes nothing rather than contributing an estimate. At a change of script into unfamiliar characters, one of the eleven questions about which characters these are carried any weight at all, and the gap was decided at +0.0367.",
                    },
                    {
                      expression: "the order the marked gaps are visited in",
                      reason:
                        "undetermined by the method and it changes the answer. Eight orders over the same eight sentences give five different readings of the same forty-five characters, all of them right about every one of the 189 gaps they were shown.",
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
                        "assumed answered, and answered by a person. That list fixes the ceiling, and no quantity of marked-up text raises it; more text can only settle the questions already on the list, of which our eight sentences raise 631 on 189 gaps.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "outside the method, as it was on the dictionary pages and the hidden-model one. Even the whole-sequence score disagrees with a reader here, ranking its own nine-piece answer at −151.0253 above the reader’s seven-piece one at −153.9847, so an accuracy figure is always a figure against one person’s cutting.",
                    },
                  ]}
                />
                <KeepInMind>
                  Three of these are decisions rather than limits, namely what to
                  do with a score of zero, what order to visit the marked gaps in,
                  and which questions a gap is asked. Each has a defensible answer
                  on more than one side and each changes what comes back, so each
                  belongs in whatever describes a segmenter rather than being left
                  to whoever writes one.
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
              "Kinds are coarse on purpose, so an apostrophe and a hyphen raise the identical questions and get the identical number. That is the generalisation working. It is also why the offsets are kept apart, since the full stop of Dr. carries its punctuation on the other side of the gap and gets minus 0.3188 from kinds rather than minus 12.0563.",
            ),
            trueFalse(
              "On the English words with the spaces taken out, the whole-sequence method finishes below its own best score while the gap method is still climbing.",
              true,
              "The whole-sequence method peaks at 0.6087 and falls back to 0.5186 as more text is added, where the gap method reaches 0.9057 at 1,280 sentences. A single letter of an alphabet says little about where in its word it sits and says less as the vocabulary widens. The gap method never asks a character where it sits. It asks a window of six characters and five pairs whether a boundary lies between the middle two, and that question keeps its answer.",
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
                "The answer is the maximum of nothing, and on the running sentence it scores 4.7503 below the best whole sequence by that method’s own tables",
                "It returns segmentations the whole-sequence method is incapable of returning",
                "It answers with a piece of a length its corpus never showed more often than the whole-sequence method does",
                "Its cost of reading a text grows with the amount of marked-up text behind the weights",
              ],
              0,
              "Any set of cuts is a segmentation, so no arrangement of independent answers is beyond the other method. Over all 1,296 four-character texts from a corpus of two-character words, the gap method answered with a piece of odd length 32 times and the whole-sequence method 45 times. Reading a text costs twenty-three additions a gap however much text was marked up, which is not a consideration. What is lost is that no quantity in the method mentions the whole run, so a fact needing two gaps to state has nowhere to be recorded.",
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
              "The score of exactly zero, the order the gaps are visited in and the questions a gap is asked each have a defensible answer on more than one side, and each changes what comes back, so each belongs in whatever describes a segmenter. A dependency wider than the reach is not a choice at all. A character outside the reach has no place in the question being asked, so the dependency is invisible rather than poorly estimated, and more text cannot supply one.",
            ),
        ],
        },
        {
          title: "Practice. Scoring Gaps and Opening Them Up",
          practice: [
            exercise(
              "Read our sentence gap by gap",
              ["Fit the library’s gap segmenter on the eight marked-up sentences of Part 4, with a reach of three, twenty passes and the seed 0, which is the order the page’s widgets use. Segment the running sentence with its spaces taken out, then ask for the score at every gap and compare each sign with the reading a person gives.", "Section 11 arrived at forty-four gaps with three of them wrong, all inside the surname. Print each wrong gap with the two characters either side of it and its score to four places. The page names the three and does not print their scores, so read off how close each one was."],
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
              { hints: ["The segmenter takes window, epochs and random_seed when it is constructed and the list of marked-up sentences when it is fitted, each sentence a list of its words.", "gap_scores takes the text and answers one score per gap, in order, where gap number g lies between the characters at positions g and g + 1. A positive score is a cut.", "The loop above the comment has already turned the reader’s words into the set of gaps that carry a boundary, so a gap is wrong when its score being positive disagrees with its being in that set."], check: numberCheck("What score does the gap between the z and the d get, to four places?", -1.3466, 5e-05, "That gap should have been a cut and falls 1.3466 short of one, which makes it the closest call of the forty-four. The questions naming the z carry no weight, since the eight sentences hold no z. The characters after the gap begin a word those sentences hold three times and vote to cut, while the letters two and three places back, the kinds and the constant question all vote to keep going, since most gaps between two letters are not boundaries. The two gaps cut in error score +4.3098 and +7.3693, each defensible alone, which is section 16’s single letter standing as a word.") },
            ),
            exercise(
              "Open up the gap after the full stop",
              ["Section 12 lists every question the gap between the full stop of Dr. and the A of Alvarez asked, with the weight each one carries. Build that list. Fit the same segmenter as before, ask for the questions of gap number 2 at a reach of three, look up the weight of each, and print the five that count for most. Then add the weights up three ways, over the questions naming characters, over the ones naming kinds, and over all of them.", "The total should be the +7.1283 of section 12 and should equal the score the segmenter itself reports for that gap, with the largest single weight the +3.6304 of the full stop sitting immediately to the left. A question naming a character begins with c and one naming a kind begins with t.", "The function that lists a gap’s questions is not exported from the top of the library, so it is imported here from the module that holds the segmenter."],
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
# "t[", the weight of "bias", the total, and the model's own score at gap 2.`,
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
              { hints: ["gap_features takes the run of text, the number of the gap and the reach, and answers the names of the questions that gap asks. weight_of takes one of those names and answers its averaged weight, zero for a question the marked gaps never raised.", "A dictionary from each question to its weight makes both the ranking and the three sums short. Sorting the names by the size of their weight, largest first, puts the questions that count for most at the front.", "The score at a gap is the sum of the weights of the questions it asked and nothing else, so the total of the dictionary’s values and the third entry of gap_scores are the same number reached twice."], check: numberCheck("What do the twenty-three weights at that gap add up to, to four places?", 7.1283, 5e-05, "The eleven questions naming characters come to +10.4926, the eleven naming kinds to −0.3188 and the constant question to −3.0455, and those add to +7.1283, which is exactly what the segmenter reports. Nothing is approximated, because the sum is what the calculation did. Four of the five largest weights read characters behind the gap, the full stop immediately to the left carrying the largest, and the fifth is the constant question pulling the other way. The questions about the characters after the gap carry no weight, and two of them never could, since the eight sentences hold no capital A and no v.") },
            ),
            exercise(
              "Run the same eight sentences in eight orders",
              ["Section 10 says the order the marked gaps are visited in changes the answer. The seed decides that order, so fit the segmenter eight times on the same eight sentences with the seeds 0 to 7 and segment the running sentence with each. Print how many corrections each run made in all, how many pieces it cut the sentence into, and whether its reading is the one a person gives.", "Every run should stop correcting well before its twenty passes are up, so all eight are right about every marked gap, and still they should not agree. Count the different readings among the eight."],
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
              { hints: ["A fitted segmenter keeps n_updates_by_epoch, the number of corrections it made on each pass, so their sum is the corrections of the whole run and a run of zeros at the end means it had stopped.", "The texts of a split are a tuple, which can be compared with the reader’s tuple and can be put in a set, and a set keeps one copy of each different reading."], check: numberCheck("How many different readings of the sentence do the eight orders give?", 5, 0.0, "Eight orders give five readings and none of them is the reader’s. The runs make between 58 and 79 corrections and then stop, so each is right about all 189 marked gaps, and being right about those does not pin the weights down, since the eight sentences raise 631 questions on 189 gaps. The runs disagree where nobody marked anything, which here is the surname. A segmentation quoted from this method is a segmentation from one order of one corpus.") },
            ),
            exercise(
              "Watch a weight become a half",
              ["Section 9 walks two steps by hand. Run that walk. Fit the segmenter on the single sentence whose words are ab and c, with a reach of one, one pass and the seed 0, which visits the first gap first. Print the averaged weight of every question each of the two gaps asks, then the scores of the two gaps and the pieces the text abc comes back as.", "Every correction adds or subtracts exactly one, so any weight that is not a whole number is the averaging at work. The four questions the two gaps share should come out at a half below zero, and the text should come back whole, with the second gap still answered wrongly after one pass.", "The function that lists a gap’s questions is not exported from the top of the library, so it is imported here from the module that holds the segmenter."],
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
              { hints: ["A sentence is a list of its words, and the corpus is a list of sentences, so one sentence of two words is a list holding one list of two strings.", "gap_features with the text, the gap’s number and a reach of one answers the seven questions of that gap, and weight_of answers the averaged weight of each.", "The question named bias is the constant one every gap asks. It went to minus one at the first step and back to zero at the second, so look at what the average of those two states is."], check: numberCheck("What is the averaged weight of the constant question every gap asks?", -0.5, 0.0, "The constant question was moved to minus one by the first correction and back to zero by the second, and the average of those two states is minus a half. The walk finished with that weight at zero, as though nothing had been learned about it, which is the imprint of the most recent correction that section 9 says the final set of weights carries. The averaged weights score the gaps at −5.0 and −0.5, so the text comes back whole and one pass was not enough to get the second gap right.") },
            ),
          ],
        },
      ]}
    />
  );
}
