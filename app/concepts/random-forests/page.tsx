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
import { BoundaryDisagreement } from "@/components/widgets/BoundaryDisagreement";
import { CommitteeScrubber } from "@/components/widgets/CommitteeScrubber";
import { DivergingGrowth } from "@/components/widgets/DivergingGrowth";
import { DiversityDashboard } from "@/components/widgets/DiversityDashboard";
import { FeatureLottery } from "@/components/widgets/FeatureLottery";
import { SameSampleTrees } from "@/components/widgets/SameSampleTrees";
import { SeedComparison } from "@/components/widgets/SeedComparison";
import { SplitCompetition } from "@/components/widgets/SplitCompetition";
import { StrengthCorrelationSweep } from "@/components/widgets/StrengthCorrelationSweep";
import { TradeCalculator } from "@/components/widgets/TradeCalculator";
import { VarianceFloorChart } from "@/components/widgets/VarianceFloorChart";

export const metadata: Metadata = {
  title: "Random Forests · oop_ml",
  description:
    "The bagged committee with disagreement built in. Each split is offered a random subset of the features, and the page follows what that one rule costs and buys.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RandomForestsPage() {
  return (
    <ConceptPage
      title="Random Forests"
      tagline="The bagged committee with disagreement built in, one random subset of features per question."
      prerequisites={
        <>
          This page changes one rule of{" "}
          <Link href="/concepts/bagging" className={link}>
            bagging
          </Link>
          , so read that page first, including its closing count of how alike
          the bagged trees turned out to be. The out-of-bag score is used
          here as evidence and not explained again; the{" "}
          <Link href="/concepts/bagging" className={link}>
            bagging page
          </Link>{" "}
          covers how it is built and what it can and cannot say.
        </>
      }
      history={
        <>
          <p>
            Bagging ended on its own limit. The committee cancels the errors
            its members make privately, though members grown on resamples of
            the same crowd still think largely alike, and 20 of the 25 bagged
            trees on the tangled crowd opened with a question about height.
            Two groups working on handwriting reached the fix first. Tin Kam
            Ho at AT&amp;T Bell Laboratories published &ldquo;Random Decision
            Forests&rdquo; in 1995, training each tree of a committee on a
            random subset of the pixel features of handwritten digits, so that
            no two trees read the same coordinates and their errors were less
            alike. Yali Amit and Donald Geman, in a 1997 paper on recognising
            shapes with randomised trees, moved the randomness inside the
            tree, drawing a fresh random subset of features at every split
            rather than once per tree. Leo Breiman cited both when he folded
            the idea into the bagged committee in &ldquo;Random Forests&rdquo;
            in 2001, hiding features from each split, and he called the
            result a random forest.
          </p>
          <p>
            What his paper added beyond the recipe was a bound on the
            forest&rsquo;s error in terms of two numbers, the strength of the
            individual trees and the correlation between them, and the bound
            falls as the trees get stronger and as they get less alike. The
            change to bagging is one sentence. At every split of every tree,
            instead of letting the search consider every feature, offer it a
            random subset and make it choose from that, and everything else,
            the resamples, the deep trees, the vote, the out-of-bag score,
            carries over unchanged. The whole page is about the trade that
            sentence sets up and that Breiman&rsquo;s bound names. Restricting
            the features makes the trees less alike, and it can make each
            tree worse, and the forest improves on bagging only when the
            first effect is worth more than the second. On this page&rsquo;s
            crowd there are only two features to hide, so the restriction is
            as severe as it can be, and the page measures which way the trade
            went rather than assuming it.
          </p>
        </>
      }
      playground={<CommitteeScrubber maxFeatures={1} />}
      sections={[
        {
          title: "Part 1. The Limit Bagging Leaves Behind",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The similarity left behind by bagging">
                <p>
                  Here is where the bagging page left the tangled crowd. The
                  resamples gave the trees different people to learn from,
                  the fitted trees became more varied than one tree refitted
                  on nudged data, and the vote steadied the map. But 20 of
                  the 25 trees still opened with a question about height, and
                  across every pair of members the two agreed on 72.4 percent
                  of the people neither had seen. The committee is more
                  varied than one tree and still largely of one mind.
                </p>
                <NumberTable
                  headings={["the bagged committee, 25 trees", "reading"]}
                  rows={[
                    ["trees opening on height, on weight", "20, 5"],
                    ["pairwise prediction agreement, out of bag", "0.724"],
                    ["training accuracy", "0.960"],
                    ["out-of-bag accuracy", "0.640"],
                  ]}
                  caption="The census and agreement are read from the same fitted committee, seed 7, the one the bagging page ended on."
                />
                <KeepInMind>
                  Bootstrap resampling creates diversity, and bagged trees
                  can still remain strongly related. That is the gap this
                  page is about, not a failure of bagging.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why strong features dominate">
                <p>
                  The reason is not mysterious. At the root of any of these
                  trees two candidates compete, the best question height can
                  ask and the best question weight can ask, and the tree
                  takes whichever earns the larger impurity reduction on the
                  rows it was given. Change the rows and both gains change.
                  Whether the winner changes depends on how far apart they
                  were.
                </p>
                <SplitCompetition />
                <p>
                  Eight resamples, eight different boards, and height takes
                  the root on five of them, usually at the same threshold of
                  147.5 centimetres. On the full committee it is 20 of 25.
                  The samples vary the rows, and a feature that is
                  consistently the strongest keeps winning anyway, so
                  resampling alone cannot stop most trees from asking the
                  same first question.
                </p>
              </SubSection>

              <SubSection title="3. Structural similarity versus error correlation">
                <p>
                  Before changing anything it is worth separating three
                  ideas that the word similar runs together, because the
                  forest is judged on the third and the census only shows the
                  first.
                </p>
                <DerivationTable
                  expressionHeading="the idea"
                  reasonHeading="what it measures"
                  rows={[
                    { expression: "structural similarity", reason: "the trees ask similar questions, the same features at similar thresholds. The root census is a count of this." },
                    { expression: "prediction agreement", reason: "the trees give the same answer at the same input, whether or not it is right. Measured from the predictions." },
                    { expression: "error correlation", reason: "the trees tend to be wrong on the same people. Measured from the predictions and the truth together." },
                  ]}
                />
                <p>
                  These are related and not the same. Two trees can open on
                  different features and still draw nearly the same map,
                  because the second question repairs what the first one
                  missed. Two trees can open on the same feature at
                  different thresholds and diverge from there. On the bagged
                  committee the three numbers are 20 of 25 roots on height,
                  an agreement of 0.724, and an error correlation of 0.463,
                  each measured over every pair of members on the people
                  both members had left out.
                </p>
                <KeepInMind>
                  Different-looking trees are useful only when their
                  prediction errors also become less shared. Every claim on
                  this page about diversity is checked against the
                  predictions, not the shape of the trees.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The One Rule Random Forests Change",
          content: (
            <>
              <SubSection title="4. How an ordinary tree chooses a split">
                <p>
                  At one node an ordinary tree lays out every feature it has,
                  generates the candidate thresholds for each, scores every
                  candidate by the impurity it would remove, and takes the
                  best of the whole board. On the tangled crowd the root
                  board has two rows.
                </p>
                <NumberTable
                  headings={["feature", "its best question", "gain"]}
                  rows={[
                    ["height", "height < 147.5", "0.1881"],
                    ["weight", "weight < 41.5", "0.1030"],
                  ]}
                  caption="The full candidate board at the root of the tangled crowd, scored by the same split search the decision-tree page walked through."
                />
                <p>
                  The ordinary tree sees both rows and picks height, and it
                  would pick height at this node every time, because the
                  board does not change when nothing about the rows changes.
                </p>
              </SubSection>

              <SubSection title="5. The random feature lottery">
                <p>
                  The forest adds one step before the search. Draw a random
                  subset of the features, hide the rest, and search only the
                  subset. The tree still chooses the best available split by
                  exactly the same scoring; what changed is which splits were
                  available to choose from.
                </p>
                <FeatureLottery />
                <p>
                  With one feature offered per split, half the draws offer
                  weight alone, and at those nodes the tree settles for the
                  weaker question with the stronger one sitting hidden on
                  the board. The draws made inside a grown tree are not
                  recorded anywhere, so the draws above replay the
                  rule from a seeded generator rather than recount a
                  particular tree. What they show is the rule itself.
                </p>
                <KeepInMind>
                  A random forest still chooses the best available split.
                  Randomness changes what is available, not how the choice
                  is made.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A new feature subset at every node">
                <p>
                  The subset is redrawn at every split, not chosen once for
                  the tree. The root gets a draw, then the left child gets
                  its own, then the right child, and so on down every branch
                  that is still eligible to split. A tree denied height at
                  the root can be offered it one level down and take it
                  there, and a tree that opened on height can be denied it
                  at the very next node.
                </p>
                <WorkedExample title="One forest tree on the tangled crowd">
                  <p>
                    Offered one feature per split under lottery seed 2, the
                    tree opens with weight less than 41.5, the question the
                    ordinary tree ranked second, and then makes eight more
                    splits under fresh draws, finishing at depth 6 with 10
                    leaves and a training accuracy of 0.88. Under seed 1 the
                    first draw happens to offer height, the tree opens
                    exactly as the ordinary one does, and reaches a training
                    accuracy of 1.0 in 8 splits. Both trees are grown and
                    stepped through in section 11.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Each node receives its own random set of candidate
                  features, so the randomness compounds through the tree
                  rather than being decided once at the top.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The max_features setting">
                <p>
                  Write p for the number of features and m for how many each
                  split is offered. The setting goes by max_features in most
                  implementations and mtry in the original one.
                </p>
                <DerivationTable
                  expressionHeading="setting"
                  reasonHeading="what it means"
                  rows={[
                    { expression: "m = p", reason: "every split sees every feature. This is ordinary bagging, exactly." },
                    { expression: "smaller m", reason: "more restriction at every split, and more chance the strongest question is withheld." },
                    { expression: "m = 1", reason: "every split receives a single feature chosen at random and has no comparison to make at all." },
                  ]}
                />
                <p>
                  On the tangled crowd p is 2, so the only forest possible is
                  m = 1, and each feature is offered at any given split with
                  probability one half. The committee at the top of the page
                  is that forest, the bagging page&rsquo;s scrubber with the
                  lottery switched on, refitted at every size from one
                  member to twenty-five.
                </p>
                <KeepInMind>
                  The feature-subset size controls how much choice each tree
                  node retains. It is the one setting that makes a forest a
                  forest.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. How Random Features Create Diversity",
          content: (
            <>
              <SubSection title="8. Same bootstrap sample, different feature permissions">
                <p>
                  The cleanest way to see what the lottery does is to take
                  the bootstrap out of the picture. Hold one resample fixed,
                  grow several trees on exactly those rows, and vary only the
                  seed of the feature lottery. Whatever differs between the
                  trees was caused by the permissions and by nothing else.
                </p>
                <SameSampleTrees />
                <p>
                  The shared sample holds 18 distinct people and omits 7. A
                  tree offered both features roots on height. Under lottery
                  seed 1 the forest tree also roots on height, at 147.5, and
                  finishes at depth 4 with 7 leaves; under seeds 2, 3 and 4
                  it roots on weight less than 41.5 and grows deeper. The
                  first two trees agree on 88 percent of the crowd, 22 of the
                  25 people, from identical training rows.
                </p>
                <KeepInMind>
                  Random feature selection can produce different trees even
                  when their training observations are identical.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Bagging and random forests under controlled conditions">
                <p>
                  Now the whole comparison, with everything held fixed that
                  can be. Same crowd, same seed, so the same 25 bootstrap
                  samples in the same order, same tree settings. Bagging
                  offers every split both features; the forest offers one.
                </p>
                <DiversityDashboard />
                <p>
                  Read the two columns against each other. The roots spread
                  from 20 and 5 to 8 and 17, which is structural diversity
                  and the easy part. The prediction agreement barely moves,
                  0.724 against 0.731, and the error correlation goes the
                  wrong way, 0.463 against 0.517. The members got weaker,
                  from a mean out-of-bag strength of 0.641 to 0.572, and the
                  committee&rsquo;s own out-of-bag score fell from 0.64 to
                  0.52. On this crowd, under this seed, the lottery
                  rearranged the trees without making their mistakes less
                  shared, and paid for it in strength.
                </p>
                <KeepInMind>
                  The difference between bagging and a random forest is the
                  additional feature lottery during tree growth, and nothing
                  else. Whatever the dashboard shows is that lottery&rsquo;s
                  doing.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Reading the root-feature census">
                <p>
                  The census is the most visible readout and the easiest to
                  over-read. It shows how often each feature was chosen at
                  the root, whether one feature dominated the first
                  question, and whether the restriction forced alternative
                  openings. It does not show whether the trees make
                  different predictions, whether their errors are less
                  correlated, or whether the committee is more accurate. The
                  dashboard above is the case in point, since the census
                  changed a great deal and the agreement hardly changed at
                  all.
                </p>
                <WhyThisWorks title="Why a spread census can leave the predictions alone">
                  <p>
                    A tree that was denied height at the root is not denied
                    it forever. It opens on weight, then gets fresh draws at
                    both children, and wherever height is offered next it
                    takes the same 147.5 threshold the ordinary tree would
                    have taken first. Two questions in a different order
                    often carve the same regions, so a different root can be
                    a cosmetic difference by the time the leaves are reached.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The root census shows one source of tree diversity.
                  Predictive diversity has to be measured from the
                  trees&rsquo; outputs.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. How early split differences compound">
                <p>
                  When a different root does matter, it matters because of
                  what follows it. The first split decides which people reach
                  each child, and every later node searches only the rows it
                  was sent, so a different first question changes every
                  board below it. The two trees here are the seed 1 and seed
                  2 trees from section 6, grown on the whole crowd with one
                  feature per split, stepped in lockstep.
                </p>
                <DivergingGrowth seeds={[1, 2]} />
                <p>
                  Tree A opens on height and finishes at 8 splits and 9
                  leaves. Tree B opens on weight and needs 9 splits and 10
                  leaves to reach a worse fit. The strongly coloured cells
                  are where the two partitions disagree at each step, and
                  they appear from the first split and never fully close.
                </p>
                <KeepInMind>
                  A different early split changes the smaller datasets seen
                  by every descendant node, so tree structures can diverge
                  quickly from one different decision.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Strength-Correlation Trade",
          content: (
            <>
              <SubSection title="12. Individual-tree strength">
                <p>
                  Strength needs a working definition rather than a mood. A
                  tree is stronger when it predicts better on people it did
                  not fit, and every member has such people ready made, the
                  ones its own resample omitted. The member strengths on the
                  dashboard are each tree&rsquo;s accuracy on its own
                  out-of-bag rows.
                </p>
                <NumberTable
                  headings={["25 members, seed 7", "bagging", "random forest"]}
                  rows={[
                    ["mean member strength", "0.641", "0.572"],
                    ["weakest member", "0.43", "0.33"],
                    ["strongest member", "0.88", "0.75"],
                  ]}
                  caption="Each member scored on the rows its own sample omitted, between 7 and 12 people per member."
                />
                <p>
                  Restriction may weaken a tree for three reasons. Its
                  strongest feature may be unavailable at a node, it may take
                  a weaker split there, and it may need more questions to
                  recover a pattern one question would have captured. It is
                  not guaranteed to weaken a tree, since an alternative
                  feature can sometimes generalise better than the one the
                  training rows preferred, which is why the number is
                  measured. Here it fell by 0.07.
                </p>
              </SubSection>

              <SubSection title="13. Prediction agreement and error correlation">
                <p>
                  Take any two members and the people both of them left out.
                  Each person lands in one of four cells, both trees right,
                  only the first right, only the second right, both wrong.
                  Agreement is the share in the two cells where the trees
                  said the same thing, and error correlation is the ordinary
                  correlation between the two columns of right-or-wrong
                  indicators, which is high when the both-wrong cell is
                  fuller than the two trees&rsquo; separate error rates would
                  predict.
                </p>
                <DerivationTable
                  expressionHeading="quantity"
                  reasonHeading="from the four cells"
                  rows={[
                    { expression: "prediction agreement", reason: "the share of shared people on whom the two trees give the same answer, right or wrong." },
                    { expression: "joint error count", reason: "the both-wrong cell on its own." },
                    { expression: "error correlation", reason: "the correlation of the two wrong-or-not indicators over the shared people, undefined for a pair with no shared people or with a tree that was never wrong on them." },
                  ]}
                />
                <p>
                  The dashboard averages both over every pair that has a
                  defined value. On this crowd the forest&rsquo;s error
                  correlation is 0.517 against bagging&rsquo;s 0.463, so the
                  lottery did not buy the thing it was meant to buy.
                </p>
                <KeepInMind>
                  The committee benefits most when individual mistakes are
                  not consistently shared. A vote can only cancel a mistake
                  that some members did not make.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The strength-correlation trade">
                <p>
                  So the forest is a bet, made with open eyes. It accepts a
                  possible loss of individual strength in exchange for a
                  possible drop in correlation, and the committee improves
                  only if the second is worth more than the first.
                </p>
                <DerivationTable
                  expressionHeading="the trade succeeds when"
                  reasonHeading="and fails when"
                  rows={[
                    { expression: "the alternative features still carry useful signal", reason: "the withheld feature is much stronger than anything left on the board" },
                    { expression: "restriction produces meaningfully different errors", reason: "the trees get weaker without their errors becoming less shared" },
                    { expression: "the vote cancels enough of those differing errors", reason: "the remaining features carry little information at all" },
                  ]}
                />
                <KeepInMind>
                  Random forests improve on bagging only when the added
                  diversity compensates for any loss of individual-tree
                  quality. Neither half of that sentence is automatic.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Measuring the trade">
                <p>
                  On two features the sweep over m has two points, and they
                  are the two columns of the dashboard. Everything the trade
                  involves is in one table.
                </p>
                <NumberTable
                  headings={["m", "mean member strength", "error correlation", "committee out of bag", "roots on height"]}
                  rows={[
                    ["1", "0.572", "0.517", "0.52", "8 of 25"],
                    ["2, which is bagging", "0.641", "0.463", "0.64", "20 of 25"],
                  ]}
                  caption="The tangled crowd, 25 members, seed 7. The out-of-bag score is the only column that says whether the trade paid."
                />
                <p>
                  Section 19 runs the same sweep on data with six features,
                  where m has room to move and the answer changes with the
                  data.
                </p>
                <KeepInMind>
                  The useful feature-subset size balances member quality with
                  diversity, and where the balance lands is read off the
                  evaluation, not off the census.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Two-Feature Teaching Example",
          content: (
            <>
              <SubSection title="16. Why two features make the restriction severe">
                <p>
                  With height and weight only, m = 1 is the harshest
                  restriction the rule can impose. Every node loses half of
                  everything it has, and the two halves are not equal. At the
                  root of the whole crowd the best height question earns
                  0.188 and the best weight question 0.103, so a node offered
                  weight alone cannot compare it with anything and takes a
                  question worth just over half as much. Section 5&rsquo;s
                  lottery counts how often the strongest feature was denied,
                  and at m = 1 it was withheld in 8 of the 12 draws shown,
                  about what a coin should manage.
                </p>
                <KeepInMind>
                  A one-feature subset is a particularly strong restriction
                  when the complete dataset contains only two features. The
                  forest earns its reputation on data with many features,
                  where withholding one leaves plenty on the board.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Reading the teaching example">
                <p>
                  The census and the scores are both worth reading for what
                  they support and no further.
                </p>
                <NumberTable
                  headings={["seed 7, 25 members", "bagging", "random forest"]}
                  rows={[
                    ["trees opening on height", "20 of 25", "8 of 25"],
                    ["trees opening on weight", "5 of 25", "17 of 25"],
                    ["out-of-bag accuracy", "0.64", "0.52"],
                  ]}
                />
                <p>
                  The forest&rsquo;s roots are more evenly spread across the
                  two features, and that much is directly supported. The
                  particular 8 to 17 split is random variation under this
                  run, not a finding that weight became the better predictor,
                  since height was denied at half the roots by the coin
                  rather than by the data. And under this dataset, this
                  configuration, 25 trees and this random draw, the forest
                  scored worse. The restriction appears to have cost more
                  strength than it recovered through lower correlation, and
                  section 13 showed the correlation did not fall at all.
                  What this one result does not establish is that bagging is
                  generally better on two-feature problems, and 25 trees is
                  few enough that a different seed could tell a different
                  story. So run the seeds.
                </p>
              </SubSection>

              <SubSection title="18. Repeating the comparison across seeds">
                <SeedComparison />
                <p>
                  Across eight seeds the forest beats bagging on one, seed 1,
                  where bagging happened to draw a poor set of samples, and
                  the mean difference is 0.06 in bagging&rsquo;s favour. The
                  census, meanwhile, is steady in a way the one run could not
                  show. Bagging opens on height in 16 to 23 of 25 trees at
                  every seed, and the forest in 7 to 9, which is the coin
                  doing what a coin does. The one run was a fair sample of
                  the procedure after all, and it took eight runs to know
                  that.
                </p>
                <KeepInMind>
                  One forest&rsquo;s census is a random outcome. Repeated
                  runs reveal the behaviour of the procedure, and the
                  teaching example shows that added randomness can hurt, not
                  that random forests fail on small feature sets in general.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Why Alternative Features Can Help the Forest",
          content: (
            <>
              <SubSection title="19. Sparse versus shared signal">
                <p>
                  Now give the rule room. Two simulated worlds share the same
                  120 people and the same six measurements, and differ only
                  in where the signal that decides the label lives. In the
                  sparse world one feature carries all of it and the other
                  five are noise, so withholding that feature leaves a node
                  with nothing worth asking. In the shared world all six
                  features carry an equal part of it, so whichever features
                  a node is offered, something useful is on the board.
                </p>
                <StrengthCorrelationSweep />
                <p>
                  The same restriction does two different things. In the
                  sparse world the members lose strength fast as m falls,
                  from 0.932 at m = 6 to 0.757 at m = 1, because a node
                  offered only noise columns asks a useless question. Their
                  errors become far less shared at the same time, the
                  correlation falling from 0.694 to 0.141, and the two
                  effects cancel almost exactly, so the committee&rsquo;s
                  score sits between 0.933 and 0.95 at every m and the
                  restriction is close to free. In the shared world no
                  feature is much better than another, so restriction costs
                  almost no strength, 0.68 to 0.69 at every m, while the
                  correlation still falls, 0.205 to 0.117, and the committee
                  gains, from 0.75 at m = 6 to 0.80 at m = 1 and 0.817 at
                  m = 2.
                </p>
                <p>
                  Put the three measured cases side by side. On the tangled
                  crowd the restriction cost 0.12. In the sparse world it
                  cost nothing to speak of. In the shared world it gained
                  0.05 to 0.07. A fourth arrangement, three noisy copies of
                  one feature beside three noise columns, was measured at 25
                  members and lost 0.06 at m = 1, which is the world the
                  phrase redundant features usually brings to mind, and at
                  a committee size section 18 has already shown to be
                  unstable. What decided each case was whether a node denied
                  its best feature was offered something nearly as good.
                </p>
                <KeepInMind>
                  The same amount of feature randomness can help when the
                  signal is spread across several features and can hurt when
                  it is concentrated in one, and which happens is a property
                  of the data, measured rather than assumed. Fewer offered
                  features does not automatically mean lower correlation,
                  and more randomness is not automatically better.
                </KeepInMind>
                <p>
                  Nor does a large feature count guarantee useful
                  alternatives. Hundreds of mostly irrelevant columns make a
                  small subset weak in the way the sparse world is weak, only
                  more so. What the right m depends on is the number of
                  features, how many of them carry signal, how much they
                  overlap, the sample size, the tree settings and the task,
                  which is a list to evaluate over rather than a rule to
                  remember. Random forests benefit from useful alternative
                  features, not from a long feature list as such.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Visualising the Committee's Decision",
          content: (
            <>
              <SubSection title="20. Final class versus vote agreement">
                <p>
                  At every location each tree predicts a class, the votes are
                  counted, and the larger count is the answer. The winning
                  share is a separate number, and the scrubber at the top of
                  the page draws the two apart, the majority on the left and
                  how firmly the members agree on the right. Two cells can be
                  painted the same class with the forest nearly unanimous in
                  one and split 13 to 12 in the other, and the left map
                  cannot tell them apart.
                </p>
                <KeepInMind>
                  A forest&rsquo;s vote fraction measures committee
                  agreement. It is not automatically a calibrated
                  probability, and a 60 percent vote is not a claim that six
                  in ten such people are adults.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Comparing committee boundaries">
                <p>
                  The lottery changes individual trees, and through them the
                  committee&rsquo;s final regions. The map below is blank
                  wherever bagging and the forest agree and coloured only
                  where they do not, in the forest&rsquo;s colour, with the
                  probe reporting each committee&rsquo;s vote as a count of
                  members.
                </p>
                <BoundaryDisagreement />
                <KeepInMind>
                  The feature lottery changes not only individual trees but
                  the committee&rsquo;s decision regions, and most of the
                  change lands where the votes were already close.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Deriving the Variance Trade",
          content: (
            <>
              <SubSection title="22. The correlation-variance formula">
                <p>
                  The bagging page&rsquo;s formula is the right instrument
                  for thinking about this trade, with its assumptions stated.
                  Take B numeric predictions with a common variance σ², a
                  common pairwise correlation ρ, and equal weights in the
                  average. Then
                </p>
                <Equation>{"Var(committee) = ρσ² + (1 − ρ)·σ²/B"}</Equation>
                <KeepInMind>
                  This is a simplified explanatory model. For classification
                  it can be connected to averaged zero-and-one vote
                  indicators, and it is not an exact formula for the error of
                  a majority vote. It is used here to say which way things
                  push, not to predict a score.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The large-ensemble variance floor">
                <p>
                  Let B grow without bound and the second term vanishes,
                  leaving ρσ². More trees shrink the part of the variance
                  the members do not share and leave the part they do
                  untouched, so a committee approaches a floor set by its
                  correlation rather than approaching zero. Lowering ρ lowers
                  the floor, which is the one lever the forest is pulling.
                </p>
                <VarianceFloorChart />
                <KeepInMind>
                  Increasing the number of trees approaches a
                  correlation-dependent floor rather than eliminating the
                  committee&rsquo;s variance.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. How feature restriction changes σ² and ρ">
                <p>
                  Restriction reaches into both symbols at once. A member
                  denied its best question fits its resample worse and less
                  stably, which raises σ². Members denied it at different
                  moments stop opening the same way and can make less similar
                  predictions, which lowers ρ. The committee benefits only if
                  the combined result is lower, and at any finite B both
                  terms are in play, so it is not enough to ask whether ρσ²
                  fell.
                </p>
                <KeepInMind>
                  Feature randomness changes both the individual variation
                  and the shared variation. Its net value depends on their
                  combination, and section 9 is what that combination looked
                  like on one crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A numerical strength-correlation example">
                <p>
                  Two hypothetical committees of 25. Bagging has σ² = 1.0 and
                  ρ = 0.5, so its variance is 0.5 + 0.5 / 25 = 0.52. A forest
                  whose members are noisier, σ² = 1.2, but far less
                  correlated, ρ = 0.25, sits at 0.3 + 0.9 / 25 = 0.336, and
                  the trade paid. Now let σ² rise to 1.6 while ρ only slips
                  to 0.45. That forest sits at 0.72 + 0.88 / 25 = 0.755,
                  worse than bagging, because the fall in ρ was too small to
                  pay for the rise in σ². The calculator lets you find the
                  crossing yourself.
                </p>
                <TradeCalculator />
                <KeepInMind>
                  Lower correlation is valuable only relative to the
                  accompanying change in member variance.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Choosing the Feature Subset",
          content: (
            <>
              <SubSection title="26. Choosing max_features">
                <p>
                  Treat m as a model setting like any other. Small m means
                  more restriction, potentially more diversity and
                  potentially weaker splits. Large m means a stronger choice
                  at each node, potentially more similar trees, and at m = p
                  it is bagging. The conventional defaults, the square root
                  of p for classification and a third of p for regression,
                  are starting points that a dataset is under no obligation
                  to respect.
                </p>
                <p>
                  Since out-of-bag evaluation is taught elsewhere, the
                  procedure is short. Fit forests at several candidate values
                  of m, compare their out-of-bag scores, look at how much
                  those scores move across seeds before trusting a small
                  difference, and choose by the evaluation procedure the{" "}
                  <Link href="/concepts/grid-search" className={link}>
                    search page
                  </Link>{" "}
                  lays out. Section 19 is that sweep on two worlds, and
                  section 18 is the seed check on one crowd.
                </p>
                <KeepInMind>
                  max_features controls the strength-diversity trade rather
                  than the size of the model, and the feature-subset size
                  should be selected from evaluation evidence rather than a
                  universal rule.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Other forest settings">
                <p>
                  The lottery defines the forest, and it is not the only
                  setting that decides how the forest behaves. The number of
                  trees, the maximum depth, the minimum rows to split and to
                  leave, the size of the bootstrap sample and whether
                  bootstrapping is on at all, any class weighting, the split
                  criterion and the random seed all carry over from bagging
                  and from the tree, and a forest inherits every one of their
                  consequences. Some implementations allow the bootstrap to
                  be switched off, leaving the feature lottery as the only
                  source of randomness.
                </p>
                <KeepInMind>
                  Random feature selection defines the forest, while the
                  base-tree and committee settings determine how that forest
                  behaves.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. Feature Importance",
          content: (
            <>
              <SubSection title="28. Impurity-based feature importance">
                <p>
                  A fitted forest can be asked three different questions
                  about a feature. Which features were used often, which
                  produced large impurity reductions, and which most affect
                  predictive performance. These can produce different
                  rankings, and the{" "}
                  <Link href="/concepts/feature-importance" className={link}>
                    feature-importance page
                  </Link>{" "}
                  measures where they part. The first measure adds up, over
                  every split in every tree, the weighted impurity reduction
                  the feature produced, and normalises the totals to shares.
                </p>
                <InAModel title="On the seed 7 forest">
                  <p>
                    Impurity importance gives height 0.527 and weight 0.473,
                    nearly even, because the lottery made the trees spend
                    roughly equal impurity reductions on both. On the
                    bagged committee from the same seed the same measure
                    gives height 0.711 and weight 0.289. The data did not
                    change between the two; the lottery did, and the
                    forest&rsquo;s figure describes how this forest used its
                    features, which the lottery decided as much as the data
                    did.
                  </p>
                </InAModel>
                <KeepInMind>
                  Impurity importance can favour continuous features and
                  features with many candidate thresholds, and correlated
                  features can divide or obscure one another&rsquo;s share.
                  It summarises how the fitted forest used a feature, not
                  how causally important the feature is.
                </KeepInMind>
              </SubSection>

              <SubSection title="29. Permutation importance">
                <p>
                  The third question is answered by breaking a feature and
                  watching what happens. Measure the baseline score, shuffle
                  one feature&rsquo;s column so it keeps its distribution and
                  loses its relationship with the label, measure again, and
                  read the drop as reliance on that feature. It should be
                  computed on evaluation rows, and the out-of-bag rows serve
                  when an implementation supports it.
                </p>
                <InAModel title="On the same forest">
                  <p>
                    Permutation importance gives height 0.64 and weight 0.36
                    over five shuffles. Shuffling height costs the forest
                    more than shuffling weight, which is the same ordering
                    the root board in section 4 gave and a stronger lean than
                    the impurity measure reported.
                  </p>
                </InAModel>
                <KeepInMind>
                  Correlated features can substitute for one another, so
                  permuting one may show little loss even when the group
                  matters, and no importance measure establishes causation.
                  Permutation importance estimates how much predictive
                  performance depends on a feature under one particular
                  evaluation procedure.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 11. Limitations",
          content: (
            <>
              <SubSection title="30. Limits of forest interpretability">
                <p>
                  One tree can sometimes be read as a flowchart, and the
                  decision-tree page reads one. A forest of hundreds of trees
                  holds thousands of branches, and a single person takes a
                  different path through every tree, so the committee is not
                  readable as one compact set of rules. The trees in section
                  8 are four readable flowcharts; the committee in section 9
                  is 25 of them voting, and the map is the only summary of it
                  that fits on a page.
                </p>
                <KeepInMind>
                  Random forests trade much of a single tree&rsquo;s direct
                  readability for stability and predictive power.
                </KeepInMind>
              </SubSection>

              <SubSection title="31. Predictions outside familiar data">
                <p>
                  A forest does not repair data problems. Biased sampling,
                  wrong labels, leakage, missing predictive information, a
                  shift in the population between fitting and use, an
                  inappropriate target, unequal costs of the two mistakes and
                  poorly calibrated vote shares all pass straight through the
                  vote, since every member learned from the same flawed rows.
                </p>
                <p>
                  Far from the data, the forest keeps answering. A regression
                  forest assembles its answer from training targets in the
                  leaves, so it cannot follow a trend past the range it saw
                  the way a line can. A classification forest lets the
                  outermost regions of every tree extend to infinity, so a
                  query far outside the crowd inherits whichever leaf its
                  ray ends in.
                </p>
                <InAModel title="Three queries the crowd never covered">
                  <p>
                    Asked about someone 250 centimetres tall weighing 30
                    kilograms, the seed 7 forest returns an adult share of
                    0.493, a near tie assembled from leaves that were about
                    small children and tall adults. At 100 centimetres and
                    120 kilograms it returns 0.465. At 300 centimetres and
                    200 kilograms it is unanimous, 1.0, and no less far from
                    anything it saw. The existence of an answer says nothing
                    about its reliability, and the vote share does not know
                    how far away the query is.
                  </p>
                </InAModel>
                <KeepInMind>
                  A forest still returns a prediction outside familiar data,
                  and the existence of a prediction does not establish that
                  it is reliable. Distance from the training support is a
                  separate check the forest will not make for you.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 12. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="32. What a forest must specify and refuse">
                <p>
                  A complete implementation states its configuration in
                  full. The number of trees, whether bootstrapping is on and
                  how large a sample is, the number or fraction of features
                  per split and how they are drawn, the base tree&rsquo;s
                  depth and minimum split and leaf sizes, the split
                  criterion, whether the vote is hard or averages
                  probabilities, how ties break, any class weighting, how the
                  seed is shared among members, whether members fit in
                  parallel, and whether out-of-bag evaluation is offered.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "empty data", reason: "refused before any member is grown, by the same guard every model here shares." },
                    { expression: "one row, or one class only", reason: "refused by name, since there is nothing to discriminate between; one row is one class." },
                    { expression: "max_features below one", reason: "refused at construction, before any data is seen." },
                    { expression: "max_features above the feature count", reason: "accepted, and every split is offered every feature, which is bagging." },
                    { expression: "a node whose offered features admit no valid split", reason: "the node becomes a leaf; a withheld feature is not searched for." },
                    { expression: "a bootstrap sample missing a class", reason: "the committee states the class width to every member, so a member that saw one class still votes over both." },
                    { expression: "vote ties", reason: "settled by one stated rule, the same rule the bagging page uses." },
                    { expression: "a fixed seed", reason: "reproduces the samples, the lotteries and the committee exactly; each member's lottery is seeded from the committee's seed and its position." },
                  ]}
                />
                <p>
                  Several of those were measured on this crowd. A
                  single-class target is refused with a named
                  error, max_features of zero is refused when the forest is
                  constructed, and asking for three features of two is
                  accepted and offers both, which is the bagging column of
                  the dashboard by another route.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
