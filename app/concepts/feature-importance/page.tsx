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
import { ArrangementBars } from "@/components/widgets/ArrangementBars";
import { CreditLedger } from "@/components/widgets/CreditLedger";
import { ImportanceBars } from "@/components/widgets/ImportanceBars";
import { ScrambleLadder } from "@/components/widgets/ScrambleLadder";

export const metadata: Metadata = {
  title: "Which Feature Mattered · oop_ml",
  description:
    "Three questions a fitted model can be asked about a column, two measures that answer different ones, and a column of pure noise that only one of them sees through, and only on a model that works.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FeatureImportancePage() {
  return (
    <ConceptPage
      title="Which Feature Mattered"
      tagline="Three questions one word hides, two measures that answer different ones, and a column of pure noise that only one of them sees through, and only on a model that works."
      prerequisites={
        <>
          The first measure reads the splits of a{" "}
          <Link href="/concepts/decision-trees" className={link}>
            decision tree
          </Link>
          , and the model the two measures disagree about is a{" "}
          <Link href="/concepts/random-forests" className={link}>
            random forest
          </Link>
          , so read those two pages first, and in particular the trees
          page&rsquo;s account of the split search and the gain it scores each
          question by. The crowd that this page steps through is the tangled
          crowd of twenty-five people the bagging and forests pages fit, and
          the forest grown beside it is the seed-7 committee the forests page
          ended on.
        </>
      }
      history={
        <>
          <p>
            The first version of the question was asked by people building
            trees. Leo Breiman, Jerome Friedman, Richard Olshen and Charles
            Stone published <em>Classification and Regression Trees</em> in
            1984, and a tree grown by their method was a flowchart a person
            could read, which raised an obvious complaint. A column that never
            appeared in the flowchart looked as if it had done nothing, even
            when it was nearly as good as the column that did appear and had
            lost every contest by a hair. Their answer was to credit a column
            with the impurity its questions removed wherever it was the chosen
            question and also wherever it was the best stand-in for the
            chosen question, summed over every node, so a column that always
            came second still registered. The modern form of the measure
            drops the stand-ins and keeps the sum, and that is the reading the
            first half of this page builds a split at a time.
          </p>
          <p>
            The second version came with the forest. Breiman&rsquo;s 2001
            paper &ldquo;Random Forests&rdquo; in <em>Machine Learning</em>{" "}
            proposed something of a different character, made possible by the
            rows each tree had left out of its resample. Take one column in
            those rows, scramble it, run the tree again and record how far its
            accuracy falls, then average over the trees. Nothing in that
            recipe reads the tree, so it works for any model that can be
            scored, and it asks about the fitted model&rsquo;s reliance on a
            column rather than about the bookkeeping of its growth. The two
            were treated as interchangeable for some years. In 2007 Carolin
            Strobl, Anne-Laure Boulesteix, Achim Zeileis and Torsten Hothorn
            showed in <em>BMC Bioinformatics</em> that the first measure
            favours columns that hand the split search many places to cut,
            a continuous column over a two-valued one and a column of many
            categories over a column of few, and that drawing the resamples
            with replacement leaves even the scramble reading with a trace of
            the same preference. A 2008 paper by Strobl and colleagues took up
            the other half of the problem, what either measure does when two
            columns carry one signal.
          </p>
          <p>
            This page holds both measures to one crowd of people measured by
            height and weight and to one puzzle built to defeat a tree, and
            answers five questions in order. What is a fitted model actually
            being asked when someone asks which column mattered? How is the
            split reading assembled, and what does its arithmetic favour? What
            does the scramble measure, and on which rows should it be run?
            Where do the two agree and where do they part, and what decides
            which? And what can no importance measure say about a column,
            whatever it reports?
          </p>
        </>
      }
      playground={<ImportanceBars />}
      sections={[
        {
          title: "Part 1. Three Questions One Word Hides",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Three different questions">
                <p>
                  Ask a fitted model which of its columns mattered and it can
                  reasonably answer three different questions. Which columns
                  did it ask about most often? Which columns removed the most
                  impurity when it asked? And which columns would it miss if
                  they were taken away, in the sense that its predictions
                  would get worse? Those sound like one question and they are
                  not, because a column can be asked about at every other node
                  and remove almost nothing, or be asked about once at the
                  root and decide everything, or be leaned on so heavily that
                  scrambling it wrecks the model while another column that
                  removed more impurity in the growing turns out to be
                  replaceable.
                </p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what answers it"
                  rows={[
                    { expression: "used often", reason: "a count of the decision nodes that asked about the column. Cheap, and blind to how much each question was worth." },
                    { expression: "removed the most impurity", reason: "the sum over those nodes of the rows that reached the node times the impurity the question removed, normalised to a share. The split reading, and the first measure on this page." },
                    { expression: "the predictions depend on it", reason: "scramble the column, score the fitted model again, and read the drop as reliance. The scramble reading, and the second measure." },
                  ]}
                />
                <InAModel title="On a crowd of two hundred people, one forest, three answers">
                  <p>
                    This page draws a crowd of two hundred people with heights
                    and weights, where the rule that assigns adult reads
                    height alone and weight follows height only through
                    overall body size, and grows a forest of thirty trees on
                    it, each split offered one of the two columns. Asked which
                    column it used more often, the forest answers weight, 272
                    splits to 240. Asked which removed the most impurity, it
                    answers weight again, 0.521 to 0.479. Asked which its
                    predictions depend on, scored on two hundred people it
                    never saw, it answers height, 0.957 to 0.043, and the
                    third answer is the one that agrees with how the crowd
                    was made.
                  </p>
                </InAModel>
                <ArrangementBars arrangements={["measurements"]} showModelToggle={false} />
                <p>
                  The four rows of bars are the four readings on that forest,
                  and the column with the most bars is not the column with the
                  most credit. Switching the widgets further down to the lone
                  tree shows the same crowd read from a model that memorised
                  it.
                </p>
                <KeepInMind>
                  Importance is a word for at least three questions. Before
                  reading a number, find out which one it answers, because on
                  this forest two of the three name the wrong column.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Two sets of people, and a puzzle">
                <p>
                  Two datasets carry the page. The first is the tangled crowd
                  of twenty-five people that the bagging and forests pages fit,
                  children and adults by height and weight, on which a tree
                  grows eight splits to reach pure leaves, and that is where
                  the split reading is assembled by hand. The second is the
                  larger drawn crowd from the box above, which has two columns
                  added to it that a careful reader should distrust. One is a
                  raffle ticket number, drawn without reference to anything
                  and different for every one of the two hundred people. The
                  other is height read a second time with a little measurement
                  error, correlated with the first reading at 0.996. Weight is
                  correlated with height at 0.898 and the ticket at −0.131,
                  which is what chance looks like on two hundred rows.
                </p>
                <p>
                  Beside those sits the puzzle in the box at the top of the
                  page, built to defeat the trees page&rsquo;s search. Two
                  columns are coin flips, and the class is 1 exactly when the
                  two flips disagree. Ask about either coin alone and both
                  sides of the split come back half and half, no better than
                  the node was before, so no single question helps. A third
                  column is pure noise, drawn without any reference to the
                  class, and with three hundred distinct values it hands the
                  search a threshold between every adjacent pair, and among
                  hundreds of tries one always lines up with a few rows by
                  chance. It is the ticket column&rsquo;s trick in a setting
                  where the real columns cannot defend themselves.
                </p>
                <KeepInMind>
                  The ticket and the noise column are the same idea, a column
                  offering the search many places to cut and nothing to find.
                  The crowd is where that idea meets real columns; the puzzle
                  is where it meets columns that cannot win a single question.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Shares of an explanation, not measurements of the world">
                <p>
                  Whichever question is asked, the answer comes back the
                  same way, as one non-negative number per column that
                  the model was fitted on, scaled so that the numbers sum to
                  one. Every column is included, a column that earned nothing
                  at zero, because a zero is a finding rather than an absence.
                  The scaling is what lets a reader say that a column accounts
                  for a fifth of the explanation without first working out
                  the total, and it is also the sharpest limit on what the
                  numbers mean. They are shares of this fitted model&rsquo;s
                  explanation, so two columns carrying one signal divide a
                  share between them and each looks half as important as
                  either would alone, which is a fact about the fit and not
                  about the columns.
                </p>
                <Equation>{"share(feature) = raw score(feature) / Σ raw score over every feature"}</Equation>
                <p>
                  The raw score is the quantity each measure produces, impurity
                  removed for the first and accuracy lost for the second. A
                  model whose raw scores all come to zero has no shares to
                  report, and rather than divide zero by zero the reading is
                  refused, in words the last Part quotes.
                </p>
                <KeepInMind>
                  A share of 0.52 does not say a column explains half of
                  anything in the world. It says that of what this model did
                  with its columns, by this measure, half was done with this
                  one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Reading the Splits",
          content: (
            <>
              <SubSection title="4. What one question removes">
                <p>
                  Start with the trees page&rsquo;s gain. A node holds some
                  people with some mixture of children and adults, and that
                  mixture has an impurity. Asking a question sends the people
                  to two children, each with its own impurity, and the gain is
                  the parent&rsquo;s impurity minus the two children&rsquo;s
                  impurities weighted by how many people went each way. It is
                  the number the split search maximised when it chose the
                  question, and the tree recorded it at the time.
                </p>
                <Equation>{"gain = I(parent) − (n_left / n)·I(left) − (n_right / n)·I(right)"}</Equation>
                <WorkedExample title="The root of the tangled crowd">
                  <p>
                    Twenty-five people, thirteen adults and twelve children,
                    with a Gini impurity of 0.4992, which is almost as mixed as
                    a node can be. The best question is whether height is
                    under 147.5 centimetres, and it removes 0.1881 of that
                    impurity. Every other question the search considered, on
                    either column at any threshold, removed less.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The gain is a fact about one node. It says nothing yet about
                  the column, because a column that removes a great deal at a
                  node holding three people has done very little for the tree.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Weighting a question by the people it was asked of">
                <p>
                  So the credit a question earns for its column is its gain
                  times the number of people that reached the node. A question
                  asked of every person decides where every person goes; a
                  question asked of three people near a leaf decides where
                  three go, and an unweighted sum of gains would call those
                  equal. The tangled crowd has the clearest case of the
                  difference I have found.
                </p>
                <Equation>{"credit(node) = rows at node × gain at node"}</Equation>
                <WorkedExample title="The largest gain in the tree earns the fourth largest credit">
                  <p>
                    The fourth split asks whether weight is under 56 kilograms
                    of three people at depth two, and it removes 0.4444, the
                    largest gain any question in the tree bought, because it
                    turns a node of two against one into two pure leaves. Its
                    credit is 3 × 0.4444 = 1.333. The root removed 0.1881, less
                    than half as much, of twenty-five people, for a credit of
                    25 × 0.1881 = 4.702. The root question is worth three and
                    a half of the fourth.
                  </p>
                </WorkedExample>
                <WhyThisWorks title="Why the weighting is not a choice">
                  <p>
                    Ask how much impurity the whole tree removed. Write N for
                    the people at the root and n for the people at some node.
                    That node&rsquo;s contribution to the tree&rsquo;s total is
                    its gain scaled by the fraction n / N of people who reached
                    it, so the total is a sum of (n / N) × gain over every
                    decision node. Group the sum by which column each node
                    asked about and divide each group by the whole; the N
                    cancels out of every share, leaving each column&rsquo;s
                    credit as the sum of n × gain over its nodes. The weighting
                    falls out of asking about the tree rather than about the
                    nodes one at a time.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="6. Accumulating credit one split at a time">
                <p>
                  Now walk the tangled crowd&rsquo;s tree and keep a ledger.
                  Each split adds its credit to its column&rsquo;s running
                  total, and at any moment the running shares are the running
                  totals divided by their sum. The slider adds the eight splits
                  in the order the decision-tree page steps through them,
                  breadth first from the root.
                </p>
                <CreditLedger />
                <p>
                  After the root, height holds all 4.702 of the credit and the
                  share is one to nothing. The second split is a weight
                  question asked of nine people, worth 9 × 0.0494 = 0.444, and
                  weight&rsquo;s share is 0.086. The fourth split, the big gain
                  on three people, lifts weight to 0.232 in one step, and that
                  is the closest the two columns come. From there height takes
                  three of the remaining four splits, including two questions
                  at depth four asked of four people each, worth 1.5 apiece,
                  which is more than the three-person split earned. The ledger
                  closes at 9.702 for height and 2.778 for weight, a total of
                  12.48.
                </p>
                <KeepInMind>
                  The split reading is nothing more than this ledger. Every
                  bias it has is a bias in which questions the search chose
                  and how many people it chose them for, because the
                  arithmetic afterwards is a weighted sum.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Normalising, and a column that never won">
                <p>
                  Divide each column&rsquo;s total by the sum and the shares are
                  9.702 / 12.48 = 0.777 for height and 2.778 / 12.48 = 0.223
                  for weight, which is what the model reports for itself. A
                  column that won no split appends nothing to the ledger and
                  would be missing from it entirely, so the full list of
                  columns is supplied separately and a zero is written for
                  any that never appear. On the parity puzzle the lone tree never
                  asks about the first coin, and its share is exactly 0, in the
                  report and not merely absent from it.
                </p>
                <Equation>{"share(feature) = Σ over its nodes of rows × gain  /  Σ over every node of rows × gain"}</Equation>
                <KeepInMind>
                  A zero here means the search never chose the column, at any
                  node, against the alternatives it was offered. It does not
                  mean the column carries no information, and the drawn crowd
                  in Part 6 has a column at zero that predicts the label well
                  on its own.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Averaging across a forest's members">
                <p>
                  A single tree&rsquo;s ledger is as unstable as the tree.
                  Change a few people and the root changes, and a column
                  carrying three quarters of the explanation can fall to
                  nothing. A forest holds twenty-five ledgers, one per member,
                  each grown on its own resample under its own feature draws,
                  and the forest&rsquo;s reading is the average of the
                  members&rsquo; shares. Shares rather than raw totals, because
                  a deeper member removed more impurity in absolute terms
                  without that meaning its columns mattered more.
                </p>
                <NumberTable
                  headings={["the seed-7 committee on the tangled crowd", "height", "weight", "roots on height"]}
                  rows={[
                    ["lone tree, every column at every split", "0.777", "0.223", "1 of 1"],
                    ["forest, one column offered per split, 25 members", "0.527", "0.473", "8 of 25"],
                    ["bagging, both columns at every split, 25 members", "0.711", "0.289", "20 of 25"],
                  ]}
                  caption="The forest and the bagged committee are the random-forests page's own, refitted here. Under the forest the members' height shares run from 0.179 to 1.000, and their mean is the 0.527 reported."
                />
                <p>
                  The forest&rsquo;s figure is close to even because the
                  feature lottery made it so. A member denied height at a node
                  spends that node on weight and the ledger credits weight for
                  it, so the forest&rsquo;s reading describes how these
                  twenty-five trees used their columns, which the lottery
                  decided as much as the crowd did. The bagged committee, with
                  no lottery, leans on height nearly as hard as the lone tree.
                </p>
                <KeepInMind>
                  Averaging steadies the reading. It does not change what the
                  reading is a reading of, and Part 3 shows it cannot correct
                  a bias every member shares.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Why the split reading is free">
                <p>
                  Nothing in Part 2 touched the data again. Every gain and
                  every row count was recorded when the tree was grown, so the
                  reading is one walk of the tree, and for a forest one walk of
                  each member. That is why it is the reading every tree library
                  hands out by default, and why it is worth knowing exactly
                  what it is a reading of before it is handed on.
                </p>
                <KeepInMind>
                  The reading costs one walk of the tree and inherits every
                  preference of the search that grew it, and the next Part is
                  about those preferences.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Where the Split Reading Misleads",
          content: (
            <>
              <SubSection title="10. A column with many places to cut">
                <p>
                  The search compares the best question each column can ask.
                  A coin offers one threshold, so it gets one chance to show a
                  gain. A column with three hundred distinct values offers a
                  threshold between every adjacent pair, so it gets hundreds of
                  chances, and the search keeps the best of them. On the parity
                  puzzle that is decisive, since the coins cannot win a single
                  question, and the lone tree roots on the noise column and
                  asks about it at three of its four nodes, for a share of
                  0.807 on a column that carries nothing.
                </p>
                <p>
                  On the drawn crowd the same trick meets real columns, and I
                  expected the ticket to win a few splits deep in the lone
                  tree. It won none. Height and weight bring the tree to pure
                  leaves in sixteen questions and the ticket is never the best
                  option at any of them, so the bias needs the search to be
                  short of better options before it shows. The forest arranges
                  exactly that, because offering one column per split means a
                  third of its nodes see the ticket alone.
                </p>
                <ArrangementBars arrangements={["with_ticket"]} initialModel="forest" readings={["counts", "impurity"]} />
                <p>
                  Offered the ticket by itself at a node, a member must ask
                  about it, and with two hundred distinct values some threshold
                  always lines up with a few people by chance. The forest asks
                  about the ticket at 196 of its 559 splits, more than it asks
                  about height, and the ledger credits it with 0.107 of the
                  impurity removed. Switch to the lone tree and the ticket
                  drops to zero of sixteen.
                </p>
                <KeepInMind>
                  The preference is for columns offering many candidate
                  thresholds, and it shows wherever the search is short of a
                  better question, which a forest&rsquo;s lottery guarantees
                  at some nodes and a puzzle without single-question structure
                  guarantees at all of them.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Two columns carrying one signal split the credit">
                <p>
                  Read height twice with a little error and the two readings
                  are correlated at 0.996, so at nearly every node the best
                  question on one is almost exactly the best question on the
                  other. Whichever wins by a hair takes the whole credit for
                  that node. Across a tree the credit lands on both, in shares
                  that depend on tie-breaking and on which of the two the
                  lottery happened to offer, and not on anything about the
                  crowd.
                </p>
                <ArrangementBars arrangements={["measurements", "with_twin"]} initialArrangement="with_twin" readings={["impurity"]} />
                <p>
                  With height alone the lone tree credits it 0.897; with the
                  second reading beside it the two split the same work 0.860
                  to 0.101. The forest is the sharper case. Height alone earns
                  0.479 of the forest&rsquo;s impurity; with its twin present
                  the twin leads at 0.510 and height falls to 0.257, and
                  weight, which did not change, moves from 0.521 to 0.233
                  because the twin took the nodes weight used to be offered.
                  The second reading of height is height plus measurement
                  error, so by construction it cannot matter more than the
                  first, and the ledger says it does.
                </p>
                <KeepInMind>
                  Correlated columns divide the split credit between them in
                  proportions the data does not determine. The reading for a
                  group of such columns is the sum of their shares, and the
                  individual shares should not be ranked against each other.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The ledger was written while the model memorised">
                <p>
                  Every entry in the ledger was made during growth, on the
                  rows the model was fitted to, so the reading has no held-out
                  version at all. A tree grown until its leaves are pure has
                  memorised its rows, and the ledger credits whatever columns it
                  memorised them with. On the drawn crowd the lone tree reaches
                  an accuracy of 1.0 on its own rows and 0.845 on rows it never
                  saw, and the ledger cannot tell which of its sixteen
                  questions were the ones that generalise.
                </p>
                <NumberTable
                  headings={["the lone tree fitted on the ticket alone", "reading"]}
                  rows={[
                    ["splits grown, depth reached", "109, 21"],
                    ["accuracy on its rows, held out", "1.000, 0.500"],
                    ["ticket's share of impurity removed", "1.000"],
                  ]}
                  caption="Two hundred people and one column of raffle numbers. The tree separates every person by ticket number and the ledger records every question as productive."
                />
                <p>
                  That is the extreme, and it is the honest one. A tree handed
                  only the ticket grows 109 questions to depth 21, reaches an
                  accuracy of 1.0 on its rows and exactly 0.5 held out, and
                  the split reading hands the ticket all of the credit, as it
                  must, since the ticket removed every unit of impurity the
                  tree removed. The reading describes the growth accurately,
                  and nothing in it says whether the growth generalised, which
                  the held-out 0.5 says on its behalf.
                </p>
                <KeepInMind>
                  The split reading is a fact about training. Held-out
                  accuracy is the number that says whether the training was
                  worth reading about, and the two have to be quoted together.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Averaging steadies the reading without correcting it">
                <p>
                  A forest averages twenty or thirty ledgers, and averaging
                  removes the part of the error that differs from member to
                  member. It cannot remove a bias every member shares, and every
                  member&rsquo;s search prefers columns with many places to cut.
                  On the parity puzzle the forest recovers the two-coin rule,
                  0.993 on its rows and 0.960 held out, and its averaged ledger
                  still hands the noise column 0.519, more than the two real
                  columns combined. On the drawn crowd with all four columns
                  and two offered per split, the ticket keeps 0.043 of the
                  forest&rsquo;s impurity across thirty members, at 77 of the
                  418 splits.
                </p>
                <KeepInMind>
                  A forest&rsquo;s split reading is the same ledger, steadied.
                  A column the search prefers on chance alone is preferred by
                  every member, and the average preserves it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Breaking a Column on Purpose",
          content: (
            <>
              <SubSection title="14. The experiment">
                <p>
                  The second measure never looks inside the model. Score the
                  fitted model once with every column intact. Then, for each
                  column in turn, shuffle that column&rsquo;s values among the
                  people, leaving every other column and every label where it
                  was, and score again. The shuffle keeps the column&rsquo;s
                  values exactly and destroys its pairing with the label, so
                  whatever the score lost is attributable to that pairing and
                  to nothing else, and the loss is the column&rsquo;s raw score.
                </p>
                <Equation>{"drop(feature) = intact score − score with that column shuffled"}</Equation>
                <WorkedExample title="The parity forest, scrambled on its own rows">
                  <p>
                    Intact, the forest scores 0.993 on the three hundred rows
                    it learned. Shuffle the first coin and it falls to 0.538,
                    shuffle the second and it falls to 0.515, shuffle the noise
                    column and it barely moves, to 0.977. The drops are 0.4553,
                    0.4787 and 0.0167, they sum to 0.9507, and dividing gives
                    shares of 0.479, 0.504 and 0.018. Either coin scrambled
                    takes a model that works to a coin toss; the column the
                    ledger credited with half the explanation is worth almost
                    nothing to it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The scramble asks what the fitted model would lose without
                  the column&rsquo;s pairing with the label. It reads
                  reliance, and it reads it from the model&rsquo;s answers
                  rather than from its growth.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Why shuffle rather than replace">
                <p>
                  It would be simpler to overwrite the column with zeros or
                  with fresh noise, and it would measure the wrong thing.
                  Replacing the column changes two things at once, its pairing
                  with the label and its own distribution, and a model that
                  had never seen a height of zero would fail for the second
                  reason as much as the first. Shuffling keeps every value the
                  column had, in the same proportions, and moves only which
                  person has which, so the drop is the pairing&rsquo;s and
                  nothing else&rsquo;s.
                </p>
                <KeepInMind>
                  A permutation preserves the column&rsquo;s distribution
                  exactly. That is the whole reason the drop is attributable.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Repeats, averaged and then clamped">
                <p>
                  One shuffle is one draw from a noisy quantity, and a column
                  that happens to shuffle into nearly its original order will
                  understate itself. The measure here shuffles each column five
                  times from one seeded generator and averages the drops. A
                  drop can come out negative, when the model was slightly
                  better off without the column, and the average is clamped
                  to zero after it is taken rather than each draw before,
                  because the five drops are five estimates of one number and
                  a negative one should be allowed to cancel a positive one.
                  Clamping each draw would push a useless column&rsquo;s score
                  upward.
                </p>
                <Equation>{"drop_j = s − (1 / R) · Σ over R shuffles of s(column j shuffled)\nshare_j = max(0, drop_j) / Σ_k max(0, drop_k)"}</Equation>
                <WorkedExample title="A negative drop on the lone parity tree, held out">
                  <p>
                    The lone tree scores 0.4967 on the rows it never saw.
                    Scramble the second coin and its average score is 0.5047,
                    a drop of −0.0080, which the clamp takes to zero; scramble
                    the noise column and it is 0.4853, a drop of 0.0113. The
                    clamped drops sum to 0.0113, so the noise column&rsquo;s
                    share is exactly 1.0 and the two coins are at exactly
                    zero, on a model that is at chance whichever column is
                    scrambled.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The clamp comes after the average. A share of exactly zero
                  can mean a drop of exactly nothing or a drop below nothing,
                  and the raw drops are the place to tell them apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Which rows to scramble">
                <p>
                  Everything so far scrambled the rows the model learned, and
                  that makes the question a precise one, which columns did the
                  model lean on while it learned. Scrambling rows it never saw
                  asks which columns it leans on when it is being useful, and
                  the two answers part company exactly on the models where the
                  question matters, the ones that memorised. The ladder below
                  is the scramble on the worked draw, both models, and the
                  switch changes which rows are scrambled.
                </p>
                <ScrambleLadder />
                <p>
                  On its own rows the forest gives the noise column 0.018;
                  held out its drop is −0.004 and its share exactly zero, with
                  the coins at 0.510 and 0.490. The lone tree is at chance held
                  out, 0.497, so there is nothing to lose, and its dots stay
                  within 0.012 of the line. Breiman&rsquo;s recipe scrambles each
                  member&rsquo;s own out-of-bag rows, which costs no held-out
                  set at all. The scramble here takes whichever rows it is
                  handed and has no per-member out-of-bag variant, so this
                  page uses held-out rows where the forests
                  page would have used the rows each member left out.
                </p>
                <NumberTable
                  headings={["the drawn crowd's forest, fitted on the ticket alone", "reading"]}
                  rows={[
                    ["accuracy on its rows, out of bag, held out", "0.990, 0.420, 0.505"],
                    ["ticket's share, scrambled on its rows", "1.000"],
                    ["ticket's drop, scrambled held out", "−0.004"],
                    ["ticket's share, scrambled held out", "refused, no column earned anything"],
                  ]}
                  caption="Thirty trees on two hundred raffle numbers. On the rows it memorised the scramble credits the ticket with everything; on rows it never saw no column's scramble lowers the score, and shares are refused rather than reported."
                />
                <KeepInMind>
                  Which rows are scrambled is part of the measurement. A
                  reading taken on the training rows of a model that memorised
                  them reports what it memorised with, and can hand a column
                  of raffle numbers a share of one.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What it costs">
                <p>
                  The split reading is one walk of a tree. The scramble is one
                  scoring pass with everything intact and then one per column
                  per repeat, so on the parity puzzle it is 1 + 3 × 5 = 16
                  scoring passes for each set of rows, and on a wide dataset
                  with many repeats the difference is between free and
                  expensive. That price is why both measures exist and why the
                  cheap one is the default in most tree libraries.
                </p>
                <KeepInMind>
                  The scramble costs a scoring pass per column per repeat and
                  needs rows to scramble, which on the parity puzzle is
                  sixteen passes against the single walk the split reading
                  takes, and Part 3 is what that walk leaves unexamined.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Two Readings Agree and Where They Part",
          content: (
            <>
              <SubSection title="19. A model that does not work, on which they agree">
                <p>
                  It is tempting to read the forest&rsquo;s result as the
                  scramble seeing through a column that fooled the ledger, and
                  to expect it to do the same on any model. The lone parity
                  tree says otherwise. It scores 0.537 on its own rows and
                  0.497 held out, chance either way, because it rooted on noise
                  and never found the two-question structure. Read from its
                  splits, the noise column gets 0.807. Scramble that column and
                  the tree falls from 0.537 to 0.504, most of the little it had
                  above chance, while scrambling the second coin takes it only
                  to 0.523 and scrambling the first changes nothing, so the
                  scramble hands the noise column 0.710. Both readings name the
                  noise column, and both are right. That tree built itself out
                  of noise, and it genuinely relies on it.
                </p>
                <KeepInMind>
                  The scramble measures reliance, which is a fact about the
                  fitted model rather than about the world. It is not a lie
                  detector for columns with many places to cut, and on a model
                  that leans on such a column it reports the lean.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A model that works, on which they part">
                <p>
                  The disagreement needs a model that works, because only a
                  model that found the real structure can be leaning on the
                  coins while its ledger still credits the noise. The parity
                  forest is that model, at 0.993 on its rows and 0.960 held
                  out, and it is exactly there that the ledger, biased by the
                  hundreds of thresholds it was offered in every member, keeps
                  crediting a column the model no longer needs.
                </p>
                <NumberTable
                  headings={["the worked draw", "lone tree", "forest"]}
                  rows={[
                    ["accuracy on its rows, held out", "0.537, 0.497", "0.993, 0.960"],
                    ["noise column by the splits", "0.807", "0.519"],
                    ["noise column by scrambling its rows", "0.710", "0.018"],
                    ["noise column by scrambling held out", "1.000", "0.000"],
                    ["leads by the splits", "noise", "noise"],
                    ["leads by scrambling", "noise", "a coin"],
                  ]}
                  caption="The same three hundred rows, seed 4. The lone tree's held-out share of 1.000 is one clamped drop of 0.0113 divided by itself, on a model at chance."
                />
                <KeepInMind>
                  Where the two measures disagree on a model that works, the
                  column they disagree about is one the search liked and the
                  model does not need, and that is worth more than either
                  reading on its own.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The same story on the crowd">
                <p>
                  The drawn crowd&rsquo;s forest with the ticket among its
                  columns tells the story on people rather than coins. The
                  ledger credits the ticket 0.107 and the scramble on the
                  training rows still gives it 0.084, since thirty memorising
                  trees do lean a little on the raffle numbers they memorised
                  with. Held out, the ticket&rsquo;s drop is −0.012 and its
                  share exactly zero, while height takes all of it.
                </p>
                <ArrangementBars arrangements={["with_ticket"]} initialModel="forest" readings={["impurity", "training", "held_out"]} showModelToggle={false} />
                <p>
                  The three rows of bars are the three readings of one fitted
                  forest, and the ticket&rsquo;s bar shrinks from the first to
                  the second to the third. The first row describes the growth,
                  the second what the forest leans on when it is asked about
                  the very rows it grew on, and the third what it leans on
                  when asked about people it has never seen, which is the only
                  one of the three that agrees with how the crowd was made.
                </p>
                <KeepInMind>
                  A column with credit in the ledger and none held out is the
                  signature of a column the search preferred for its cut
                  points. Both readings are needed to see it.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Correlated columns hide each other from the scramble">
                <p>
                  The scramble has a failure of its own, and it is the mirror
                  of the ledger&rsquo;s. Scramble one of two columns carrying
                  the same signal and the model leans on the other, so the
                  drop is small and both look unimportant, where the ledger at
                  least divided the credit between them. The drawn
                  crowd&rsquo;s second reading of height is the test.
                </p>
                <ArrangementBars arrangements={["measurements", "with_twin"]} initialArrangement="with_twin" initialModel="forest" readings={["held_out"]} showModelToggle={false} />
                <p>
                  With height alone, scrambling it held out costs the forest
                  0.360 of its accuracy. With the second reading beside it,
                  scrambling height costs 0.148 and scrambling the second
                  reading costs 0.184, and the two together, 0.332, come to
                  less than the one column cost by itself, because whichever
                  is scrambled the model still has the other. The shares say
                  the twin matters more than height, 0.540 to 0.434, which is
                  a fact about which of two nearly identical columns the
                  lottery handed the members more often. The lone tree does
                  the opposite thing and is no more informative, since it won
                  five splits on the twin and held out the twin&rsquo;s drop
                  is −0.001, because the tree leans on the first reading
                  wherever it counts.
                </p>
                <KeepInMind>
                  Under the scramble, correlated columns substitute for one
                  another and a group can matter while every member of it
                  reports a small drop. Read the correlations before the
                  shares, and scramble a correlated group together when the
                  question is about the group.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A zero is about this fit">
                <p>
                  Both measures hand out zeros, and every zero on this page is
                  a statement about one fitted model. The lone parity tree
                  gives the first coin exactly zero by both readings because it
                  never asked about it, and the forest fitted to the same rows
                  gives that coin 0.479 on its rows and 0.510 held out. The
                  drawn crowd&rsquo;s lone tree gives the ticket zero because
                  height and weight finished the job first, and its forest,
                  short of options at a third of its nodes, gives the ticket
                  0.107. Weight in that lone tree gets a held-out share of
                  exactly zero, from a drop of −0.030, and the next Part shows
                  what weight can do when nothing better is offered.
                </p>
                <KeepInMind>
                  A zero says this model did not use, or did not need, the
                  column against the alternatives it had. Refit with different
                  alternatives and the zero can become the whole explanation.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Importance Cannot Say",
          content: (
            <>
              <SubSection title="24. Reliance is not causation">
                <p>
                  The drawn crowd&rsquo;s rule assigns adult by height alone,
                  with a little noise, and weight follows height only because
                  both follow overall body size. Fit a model on weight and
                  nothing else and it predicts adulthood usefully, the lone
                  tree at 0.755 held out and the forest at 0.760, and every
                  reading gives weight a share of one, because it is the only
                  column there is. Nothing in that report is wrong, and nothing
                  in it says weight has any role in who is an adult. The model
                  relies on a proxy, and reliance is what the scramble
                  measures.
                </p>
                <ArrangementBars arrangements={["weight_only", "measurements"]} initialArrangement="weight_only" initialModel="forest" readings={["held_out"]} showModelToggle={false} />
                <p>
                  Offer height beside weight and the same forest&rsquo;s
                  held-out share for weight falls to 0.043, from a drop of
                  0.016, which is closer to the rule. Neither number is a
                  finding about what makes a person an adult. The second
                  reading of height in section 22 is the same lesson from the
                  other side, since a column that is height plus measurement
                  error cannot cause anything height does not, and the forest
                  leaned on it more than on height.
                </p>
                <KeepInMind>
                  No importance measure establishes causation. Every number on
                  this page is about what a fitted model did with a column,
                  and a proxy the model can use serves it as well as a cause
                  would.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Importance is not a verdict on the column">
                <p>
                  A third way to ask the question is to refit without the
                  column and see what the held-out accuracy loses, and the
                  drawn crowd&rsquo;s arrangements are those refits. Take the
                  ticket away from the forest and its held-out accuracy moves
                  from 0.870 to 0.880, so the ticket was worth nothing and
                  slightly less than nothing; take it from the lone tree and
                  the accuracy stays at 0.845 exactly, since the tree never
                  used it. That agrees with the scramble held out and
                  disagrees with the ledger, which credited the ticket 0.107.
                </p>
                <NumberTable
                  headings={["held-out accuracy of the forest", "reading"]}
                  rows={[
                    ["height and weight", "0.880"],
                    ["with the ticket", "0.870"],
                    ["with height read twice", "0.875"],
                    ["all four columns, two offered per split", "0.870"],
                    ["weight alone", "0.760"],
                    ["the ticket alone", "0.505"],
                  ]}
                  caption="Thirty trees, seed 0, two hundred people held out in every row. Refitting is the most expensive answer and the one least tied to a particular model's habits."
                />
                <p>
                  The refit also shows the limit of every reading here. Weight
                  scores 0.043 held out beside height and a refit that drops it
                  would lose little, and weight alone still reaches 0.760. A
                  column&rsquo;s share is not its value; it is its value to
                  this model given the other columns it had.
                </p>
                <KeepInMind>
                  None of the three measures is a verdict on the column.
                  Weight scores 0.043 in a model that had height available,
                  and carries a model of its own to 0.760 when height is
                  withheld.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Reading a report of shares">
                <p>
                  So a report of importances should say which question it
                  answered, which model it answered it for, which rows were
                  scrambled if any were, how many repeats under which seed,
                  and how correlated the columns are, because without those
                  the shares are a bar chart with no scale. On this page the
                  same forest reports 0.107 for the ticket by the ledger,
                  0.084 by the scramble on its rows and 0.000 by the scramble
                  held out, and the three are all correct answers to three
                  questions.
                </p>
                <DerivationTable
                  expressionHeading="if the shares are"
                  reasonHeading="then ask"
                  rows={[
                    { expression: "from the splits", reason: "whether a highly ranked column offers many cut points, whether two ranked columns are correlated, and what the model scored held out." },
                    { expression: "from scrambling the training rows", reason: "whether the model memorised, since a memorising model leans on whatever it memorised with." },
                    { expression: "from scrambling held-out rows", reason: "whether correlated columns are hiding each other, and whether a zero is a column the model had a substitute for." },
                    { expression: "from any of the three", reason: "nothing about causation, since a proxy the model can use serves it as well as a cause would, and weight alone reached 0.760." },
                  ]}
                />
                <KeepInMind>
                  Quote the measure, the rows, the model and the held-out
                  score with every share, because without them a reader
                  cannot tell which of this page&rsquo;s three answers for
                  the ticket, 0.107, 0.084 or 0.000, they are looking at.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="27. What a complete implementation states">
                <p>
                  A complete implementation of the split reading states which
                  impurity the gains are measured in, that the credit is rows
                  times gain and not gain alone, whether stand-in splits are
                  counted as the 1984 book counted them, how a forest combines
                  its members, by averaging shares or by summing credits, and
                  that every fitted column appears in the report with a zero
                  where it earned nothing. A complete implementation of the
                  scramble states the score it uses, how many repeats and
                  under what seed, that the column is permuted rather than
                  replaced, that the clamp follows the average, which rows are
                  scrambled and whether out-of-bag rows are used per member,
                  and what happens when no column&rsquo;s scramble lowers the
                  score. Both state that the shares are normalised to sum to
                  one and that the raw quantities are available beside them.
                </p>
              </SubSection>

              <SubSection title="28. The edges, tried rather than remembered">
                <p>
                  Every row below was run before it was written down, and the
                  words in the right column are the refusal&rsquo;s own where
                  the edge was refused.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "a feature of no values", reason: "refused at the boundary, before any model sees it, since a feature must not be empty." },
                    { expression: "one row", reason: "refused by the classifier, because one row holds one class and there is nothing to discriminate between." },
                    { expression: "one class only", reason: "refused for the same reason and in the same words." },
                    { expression: "a non-finite value", reason: "refused at the boundary; a feature must contain only finite values." },
                    { expression: "every column constant, then the split reading", reason: "the tree grows no split and the reading is refused, since no feature earned anything and there are no shares to report." },
                    { expression: "one constant column beside two real ones", reason: "accepted; the constant column wins no split and its share is exactly 0.0." },
                    { expression: "every column constant, then the scramble", reason: "refused with the same words; a model that never consulted a column cannot lose anything by its scramble." },
                    { expression: "a scramble of zero repeats", reason: "refused at construction, before any data is seen, since the repeat count must be at least one." },
                    { expression: "either reading before fit", reason: "refused by name as not yet fitted, from the tree's own guard, before any private state is touched." },
                    { expression: "a scramble with a column renamed", reason: "refused; the fit expected height and weight and was handed stature and weight." },
                    { expression: "a scramble with the columns reordered", reason: "accepted, matched by name, and the shares come back in the order handed." },
                    { expression: "a share asked for by a name the fit never saw", reason: "refused, naming the known features." },
                    { expression: "two columns of one name", reason: "refused at the fit, since feature names must be unique." },
                    { expression: "more features per split than there are features", reason: "accepted; every split is offered every column, which is bagging, and the shares are reported as usual." },
                    { expression: "a committee whose members have no splits to read", reason: "refused; a bagged ridge model cannot report impurity shares and is told to use the scramble instead." },
                    { expression: "a forest member that grew no split", reason: "the refusal underneath speaks about one member; this page checks first and refuses in a sentence about the draw, which four of one hundred and eighty draws needed." },
                    { expression: "a negative drop", reason: "clamped to zero after the average, documented rather than defended, with the raw drop reported beside the share." },
                    { expression: "a border of tie-breaking between correlated columns", reason: "documented rather than defended; which of two near-identical columns takes a node is settled by the split search's tie rule and the lottery, and the shares say so by moving." },
                  ]}
                />
                <p>
                  The refusal worth remembering is the one for a model that
                  never used its columns. A vector of zeros would type-check
                  and sum to nothing, and a reader would take it for an
                  answer; it is refused with a reason instead, and the
                  ticket-only forest in section 17 is that refusal on
                  real rows.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
