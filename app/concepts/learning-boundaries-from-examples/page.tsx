import type { Metadata } from "next";
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
import { AnnotationReach } from "@/components/widgets/AnnotationReach";
import { GapStrip } from "@/components/widgets/GapStrip";
import { GapVotes } from "@/components/widgets/GapVotes";
import { MethodRace } from "@/components/widgets/MethodRace";
import { PerceptronWalk } from "@/components/widgets/PerceptronWalk";
import { PointwisePlayground } from "@/components/widgets/PointwisePlayground";
import { WindowReach } from "@/components/widgets/WindowReach";

const TAGLINE =
  "Pointwise segmentation asks one yes-or-no question at every gap between two characters and answers it from the characters around it, with no dictionary and no model of the sentence as a whole. What a gap is asked, how the answers are learned from marked-up text, and what independence costs.";

export const metadata: Metadata = {
  title: "Learning Boundaries From Examples · oop_ml",
  description: TAGLINE,
};

export default function LearningBoundariesFromExamplesPage() {
  return (
    <ConceptPage
      title="Learning Boundaries From Examples"
      tagline={TAGLINE}
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
      history={
        <>
          <p>
            Graham Neubig, Yosuke Nakata and Shinsuke Mori published Pointwise
            Prediction for Robust, Adaptable Japanese Morphological Analysis at
            the Association for Computational Linguistics meeting in Portland in
            2011, and the system it describes is KyTea, the Kyoto Text Analysis
            Toolkit. The problem they had was not accuracy on newspaper
            Japanese, which was already good. It was that a working analyser
            moved to medical records, or to patents, or to conversation, and got
            worse, and that fixing it meant somebody sitting down and cutting up
            enough text in the new domain to retrain the whole thing. Their
            observation was that a sequence model over a sentence cannot be
            taught anything by a sentence somebody has only partly marked up,
            because the label it needs for a character is the character&rsquo;s
            place inside its word, and that is settled only once the boundaries
            on both sides of the character are known. An annotator who is sure
            about one boundary and unsure about the next has produced nothing a
            sequence model can count.
          </p>
          <p>
            So they moved the question. Instead of asking what place each
            character occupies in its word, ask of each gap between two adjacent
            characters whether a boundary sits there, and answer that question
            with a linear classifier reading only the few characters around the
            gap. Now one marked gap is one training example and needs no other,
            an annotator can work through a corpus marking whatever they are
            confident about, and a model can be pointed at whichever gaps it is
            currently least sure of. That is the argument the paper makes and it
            is the reason the tool exists, rather than a claim that independent
            decisions read text better than joint ones.
          </p>
          <p>
            The classifier they reached for was already old. Frank Rosenblatt
            built the perceptron at the Cornell Aeronautical Laboratory and
            described it in the Psychological Review in 1958, as a rule that
            walks through examples and nudges its weights whenever it gets one
            wrong. Yoav Freund and Robert Schapire showed in Machine Learning in
            1999 that answering with the average of every set of weights the walk
            passed through generalises far better than answering with the last
            one, for very nearly the same cost, and Michael Collins brought that
            averaged form into language processing at the Empirical Methods
            conference in 2002. Everything in this page&rsquo;s learner is those
            two pieces put together, and the modern descendants of the idea
            replace the linear classifier with a neural one while leaving the
            shape of the question alone.
          </p>
          <p>
            This page asks six questions in order. What does the previous
            method buy by scoring a whole sentence, and what does that cost
            when you want to look at a single decision? What is a gap actually
            asked, and why does the kind of character matter as much as which
            character it is? How are the answers learned from marked-up text,
            and what does the order of the learning decide? What did a
            particular gap decide, and what pushed it that way? Is this method
            better or worse than the one it is set against, measured on the
            same sentences? And where does independence stop being an
            approximation and start being false?
          </p>
        </>
      }
      playground={<PointwisePlayground />}
      sections={[
        {
          title: "Part 1. One Answer That Cannot Be Taken Apart",
          defaultOpen: true,
          content: (
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
                <p>
                  Now ask a narrow question of such an answer. The sentence we
                  carry through this section is Dr. Alvarez didn&rsquo;t expect
                  the low-cost re-analysis, and with its spaces taken out it is
                  forty-five characters with forty-four gaps between them. Point
                  at the gap between the full stop of Dr. and the A of Alvarez
                  and ask what decided it. There is no answer, and the reason is
                  structural rather than a shortcoming of any implementation.
                  The score being maximised is a sum over the whole run, so the
                  boundary at that gap was settled by a comparison between two
                  complete readings of forty-five characters, one of which cut
                  there and one of which did not, and the difference between
                  those two totals includes terms drawn from every character in
                  the sentence. Changing the answer at that gap alone is not
                  something the method can be asked to do.
                </p>
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
          ),
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
                <p>
                  What that buys is a rule learned once instead of once per pair.
                  A boundary between a run of one script and a run of another is
                  a single thing to learn, rather than something that must be
                  learned separately for every one of the thousands of character
                  pairs that could sit astride it. And it never goes silent.
                  Counted over every gap of two hundred held-out sentences of a
                  generated language, 31,566 questions in all, the ones naming
                  particular characters carry a weight 79.33% of the time and the
                  ones naming kinds carry one every time.
                </p>
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
                <p>
                  The first of those is the gap between the full stop of Dr. and
                  the A of Alvarez, and it comes to +7.1283. Every question about
                  the characters after the gap carries a weight of zero, so the
                  whole of the positive case is made from behind it, and two of
                  those questions could never have carried a weight at all, since
                  those eight sentences contain no capital A and no v anywhere.
                  The single largest contribution is +3.6304, for the full stop
                  sitting immediately to the left, and the questions about kinds
                  contribute −0.3188 between them, which is to say almost nothing.
                </p>
                <p>
                  Now the second and third, which are a letter followed by a
                  punctuation mark inside didn&rsquo;t and inside low-cost. Both
                  are kept together, at −17.5093 and −19.7016, and in both the
                  questions about kinds contribute −12.0563, the same figure to
                  the last digit, since those two gaps ask exactly the same
                  questions about kinds. That is the generalisation working, and it
                  is also why the offsets have to be kept apart, since the full stop
                  of Dr. carries its punctuation on the other side of the gap, asks
                  a different set of questions about kinds, and gets −0.3188 out of
                  them rather than −12.0563. The fourth gap is the opposite case, a
                  change of script where only one of the eleven questions about
                  which characters these are carries any weight, and the cut is
                  made at +0.0367.
                </p>
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
                <p>
                  On the English words the picture is not the same picture shifted
                  along, it is a different picture. The gap method passes the
                  other one by twenty sentences and then keeps climbing, reaching
                  0.9057 at 1,280 sentences, while the whole-sequence method peaks
                  at 0.6087 and then falls back to 0.5186 as more text is added.
                  The previous page measured why that happens to it, which is that
                  a single letter of an alphabet says very little about where in
                  its word it sits and says less as the vocabulary widens. A gap
                  method never asks a character where it sits; it asks a window of
                  six characters and five pairs whether a boundary is between the
                  middle two, and that question keeps its answer.
                </p>
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
                  words at every size where any remain.
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
      ]}
    />
  );
}
