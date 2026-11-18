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
import { AveragingNoise } from "@/components/widgets/AveragingNoise";
import { BiasVersusVariance } from "@/components/widgets/BiasVersusVariance";
import { BootstrapGallery } from "@/components/widgets/BootstrapGallery";
import { BootstrapMachine } from "@/components/widgets/BootstrapMachine";
import { CommitteePlayground } from "@/components/widgets/CommitteePlayground";
import { CommitteeScrubber } from "@/components/widgets/CommitteeScrubber";
import { CorrelationCeiling } from "@/components/widgets/CorrelationCeiling";
import { LeaveOutChart } from "@/components/widgets/LeaveOutChart";
import { OobGrid } from "@/components/widgets/OobGrid";
import { TreeStability } from "@/components/widgets/TreeStability";

export const metadata: Metadata = pageMetadata("/concepts/bagging", {
  title: "Bagging · Perceptron Lab",
  description:
    "Small changes to training data can produce different fitted models. Bagging fits models on resampled observations and combines their predictions, reducing the influence of variation in any one fit.",
});

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function BaggingPage() {
  return (
    <ConceptPage
      lessonId="bagging"
      intuition={lessonIntuitions["bagging"]}
      technicalStart="Part 3. Building the Bagged Ensemble"
      openingTitle="When One Tree Changes Its Mind"
      playgroundTitle="What changes when the models see different samples?"
      playgroundIntro="Compare one tree's answer with the combined answer. As more trees join, watch whether their disagreements cancel or persist."
      title="Bagging"
      tagline={"Small changes to training data can produce different fitted models. Bagging fits models on resampled observations and combines their predictions, reducing the influence of variation in any one fit."}
      prerequisites={
        <>
          This page picks up where{" "}
          <Link href="/concepts/decision-trees" className={linkClass}>
            decision trees
          </Link>{" "}
          ended, a deep tree changing when its crowd changes, and the sampling
          picture from the{" "}
          <Link href="/primers/statistics" className={linkClass}>
            statistics primer
          </Link>{" "}
          does real work here.
        </>
      }

      playground={<CommitteePlayground kind="bagging" />}
      sections={[
        {
          title: "Part 1. The Instability of One Tree",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. One deep tree">
                <p>
                  Set the member slider to one. We now have a fully grown tree trained on a resample of the tangled crowd: twenty-five people with deliberately noisy labels in the middle. Its training accuracy is 0.920. The rectangular regions show how closely it follows the particular people it received. Keep this single-tree result in mind as we add more members.
                </p>
              </SubSection>

              <SubSection title="2. Small data changes, different trees">
                <p>
                  Now change the crowd slightly and grow the tree again. The
                  widget below relabels one person, or grows a tree on each of
                  five random four-fifths of the crowd.
                </p>
                <TreeStability />
                <p>Changing one label moved the first split from height to weight. Every later split now starts from different groups. The five resampled datasets also produced five different first thresholds. Small changes in the training examples have produced substantial changes in the fitted trees. Bagging asks whether combining such trees can give a more stable prediction.</p>
              </SubSection>

              <SubSection title="3. Instability as variance">
                <p>The model changes when the training sample changes. If those changes produce substantially different predictions for the same new observations, we describe the learner as having high variance. Here we want to reduce that sensitivity by combining trees fitted to different samples. The prediction problem and the tree-growing procedure stay the same.</p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Creating Many Training Sets from One",
          content: (
            <>
              <SubSection title="4. Sampling with replacement">
                <p>
                  There is one crowd of twenty-five. To make one bootstrap
                  sample, draw one person from it, put them back, draw again,
                  and keep going until twenty-five draws have been made. The
                  phrase that matters is with replacement. A person drawn once
                  stays in the pool and can be drawn again.
                </p>
                <BootstrapMachine />
                <p>
                  The machine replays the actual draws the first member of
                  the committee made. Draw all twenty-five and the sample has
                  twenty-five rows, some people in it twice or three times,
                  and seven people not in it at all.
                </p>
              </SubSection>

              <SubSection title="5. Bootstrap samples">
                <p>
                  Untick the replacement box in the machine and draw again.
                  Without replacement a drawn card stays out, so twenty-five
                  draws reproduce the crowd exactly, every person once. With
                  replacement the same twenty-five draws produce a varied
                  training set of the same size. Replacement is the whole
                  difference, and it is what lets one dataset generate many
                  meaningfully different samples.
                </p>
                <p>A bootstrap sample contains only people who were already in the dataset. Sampling changes how often each person contributes; it does not supply new measurements or recover parts of the population we failed to observe. We use the available sample as an estimate of that population, with the limitations that entails.</p>
              </SubSection>

              <SubSection title="6. Duplicates and omissions">
                <p>
                  A bootstrap sample of size n contains n draws and generally
                  fewer than n distinct people. The ones drawn twice or three
                  times influence the tree grown on the sample that many times
                  over, and the ones never drawn influence it not at all. The
                  gallery in section 7 sizes each person by how many times a
                  member drew them, which is the sample as the tree saw it.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Building the Bagged Ensemble",
          content: (
            <>
              <SubSection title="7. One bootstrap sample, one tree">
                <p>
                  For each member, draw a bootstrap sample, grow one ordinary
                  deep tree on it, and keep the tree. Repeat for the next
                  member with a fresh sample. The tree-growing algorithm is
                  the trees page&rsquo;s, unchanged. All of the diversity comes
                  from the samples.
                </p>
                <BootstrapGallery />
              </SubSection>

              <SubSection title="8. Different samples, different trees">
                <p>
                  Slide through the members. Their root questions differ, in
                  feature and in threshold, their depths run from three to
                  seven, and their maps carve the tangled middle differently.
                  Twenty of the twenty-five root on height and five on weight,
                  and seven of the twenty-five ask the very same first
                  question, height below 147.5. Bootstrap variation makes
                  different trees learn different questions and regions, and
                  section 27 is about how different they manage to be.
                </p>
              </SubSection>

              <SubSection title="9. Aggregating classification votes">
                <p>
                  To classify one person, ask every tree and count.
                </p>
                <WorkedExample title="Five trees on one person">
                  <NumberTable
                    headings={["tree", "1", "2", "3", "4", "5"]}
                    rows={[["says", "child", "adult", "child", "child", "adult"]]}
                    caption="Three votes for child, two for adult. The committee says child."
                  />
                  <Equation>{"ŷ = mode(ŷ₁, ŷ₂, …, ŷ_B)"}</Equation>
                </WorkedExample>
                <p>
                  B is the number of members. A bagged classifier predicts by
                  aggregating its members&rsquo; decisions, and voting is one
                  way to aggregate. Averaging the members&rsquo; class
                  probabilities and taking the largest is another, and it is
                  the one used here, which matters for ties.
                </p>
              </SubSection>

              <SubSection title="10. Averaging regression predictions">
                <Equation>{"ŷ_bagged = (1/B) Σ_β ŷ_β"}</Equation>
                <p>
                  When the members predict numbers the aggregate is their
                  mean. Classification votes or averages probabilities,
                  regression averages predictions, and both are the same act
                  of pooling B answers into one.
                </p>
                <KeepInMind>
                  <p>
                    Votes can tie. With two classes an odd committee cannot
                    tie on a hard vote, but with three or more classes it can,
                    and an even committee can always. An implementation has
                    to say what happens then, whether it averages
                    probabilities, prefers a fixed class order, applies some
                    other deterministic rule, or reports the tie. Every
                    committee on this page averages the members&rsquo;
                    probabilities and takes the largest, with the earlier class
                    winning an exact tie.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "Relabeling a single person was enough to move the tree’s root question from height to weight.",
              true,
              "The underlying problem did not change at all, and the sample changed a little. Once the root changes, everything under it is decided in different halves, which is why five samples of the same crowd put their root cuts in five different places. A learner that swings like that from one plausible sample to the next has high variance.",
            ),
            choice(
              "What does drawing with replacement buy that drawing without it does not?",
              [
                "People the crowd did not contain, which widens what the trees can learn",
                "Training sets that differ from one another while keeping the same size",
                "A smaller training set per member, so each tree is quicker to grow",
                "A guarantee that every person turns up in some sample",
              ],
              1,
              "Drawing twenty-five observations without replacement from twenty-five available rows selects each row once. Drawing with replacement keeps twenty-five sampled rows but allows repeats and omissions, so different samples give observations different training weights. It does not create new source observations.",
            ),
            trueFalse(
              "A person drawn three times into a bootstrap sample influences the tree grown on it three times over, and a person never drawn influences it not at all.",
              true,
              "A sample of twenty-five holds twenty-five draws and generally fewer than twenty-five distinct people. The one the machine replays has some people in it twice or three times and seven not in it at all, and the gallery sizes each person by how many times a member drew them, which is the sample exactly as that tree saw it. The bootstrap invents nobody and rearranges influence instead.",
            ),
            choice(
              "Where does all the diversity between the members come from?",
              [
                "A different tree-growing algorithm for each member",
                "A random restriction on which features each split may consider",
                "The bootstrap samples, since the growing algorithm is unchanged",
                "A depth chosen in advance and varied from member to member",
              ],
              2,
              "The tree-growing algorithm is the trees page’s, untouched, and the samples are the only thing that differs. Restricting which features a split may consider is the random forest’s addition rather than bagging’s. The depths here run from three to seven because the samples made them, not because anyone set them.",
            ),
            trueFalse(
              "Every committee on this page settles a tie by taking a hard majority vote of its members’ decisions.",
              false,
              "They average the members’ class probabilities and take the largest, with the earlier class winning an exact tie. Voting is one way to aggregate and averaging probabilities is another, and which one is used matters precisely when the members are split, since with three or more classes an odd committee can tie and an even one always can.",
            ),
        ],
        },
        {
          title: "Part 4. Watching the Committee Form",
          content: (
            <>
              <SubSection title="11. Watching the committee form">
                <p>
                  At one member the ensemble is that member, one tree on one
                  sample, and no averaging has happened. Add members and every
                  cell of the plane gains a vote.
                </p>
                <CommitteeScrubber />
                <p>The map changes substantially as the first members arrive: twenty-four cells change between three and four members. After twenty, many additions change no displayed cells. Training accuracy reaches 1.000 by eight members and stays near it, while out-of-bag accuracy is around 0.64. This difference warns against using the training score alone to judge predictions for unseen observations.</p>
              </SubSection>

              <SubSection title="12. Vote strength versus predicted class">
                <p>The agreement map distinguishes a narrow hard-vote majority from near unanimity. Pale cells indicate close votes; darker cells indicate stronger agreement. Move the probe between the tangled middle and the outer regions. This display summarizes member labels; the fitted classifier’s probability-averaging rule is described in section 9.</p>
                <p>The predicted class and the fraction of members supporting it answer different questions. An agreement share of 0.98 means ninety-eight percent of the member predictions agree, when that fraction is available at the chosen member count. It does not establish that ninety-eight percent of similar observations have that class. Calibration requires separate evaluation on observations not used to fit or select the model.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Why About a Third Are Omitted",
          content: (
            <>
              <SubSection title="13. Why approximately 36.8 percent are omitted">
                <>
                  <p>
                    Choose one person from a crowd of n. Sampling with replacement gives
                    them the same chance of selection on every draw.
                  </p>
                  <Equation>{"P(selected on one draw) = 1/n\nP(omitted on one draw) = 1 − 1/n"}</Equation>
                  <p>
                    Because the draws are independent, multiply the omission probability
                    once for each draw to find the chance of never selecting that
                    person.
                  </p>
                </>
                <Equation>{"P(left out) = (1 − 1/n)ⁿ\n\nn = 25:   (24/25)²⁵ ≈ 0.360\nn → ∞:    (1 − 1/n)ⁿ → 1/e ≈ 0.368"}</Equation>
                <LeaveOutChart />
                <p>The omitted proportion approaches about 36.8 percent as the sample size grows. For twenty-five observations it is about 36.0 percent, as the calculation shows. These are expected proportions over repeated bootstrap draws; an individual sample can omit more or fewer observations.</p>
              </SubSection>

              <SubSection title="14. Expected distinct observations">
                <Equation>{"expected omitted  = n (1 − 1/n)ⁿ = 25 × 0.360 ≈ 9.0\nexpected distinct = 25 − 9.0 ≈ 16.0"}</Equation>
                <p>
                  A bootstrap sample of twenty-five typically holds around
                  sixteen distinct people and omits around nine. Across the
                  twenty-five members of the committee the actual omitted
                  counts run from 7 to 12, and the histogram in section 7
                  shows them scattered around the expected 9. A person who
                  appears twice still counts once as distinct.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Why Aggregation Helps",
          content: (
            <>
              <SubSection title="15. Why averaging reduces variance">
                <p>
                  Start with numbers rather than trees. Suppose B members each
                  estimate one quantity, each with variance σ² and with errors
                  independent of each other.
                </p>
                <Equation>{"m̄ = (1/B) Σ_β m_β\nVar(m̄) = σ² / B"}</Equation>
                <AveragingNoise />
                <p>

                  Four independent members cut the variance to a quarter, a
                  hundred to a hundredth, and the spread of the average falls
                  as one over the square root of B. Each new estimate scatters
                  as widely as the first. Their average does not, because
                  positive and negative errors partly cancel, and that canceling
                  is all that averaging does.
                </p>
              </SubSection>

              <SubSection title="16. Classification votes as averages">
                <p>
                  A vote is a number in disguise. For one class, write each
                  tree&rsquo;s vote as one if the tree predicted that class
                  and zero if not.
                </p>
                <Equation>{"v̄ = (1/B) Σ_β v_β   =   the share of trees voting for the class"}</Equation>
                <p>
                  The mean vote is the share, and the committee picks the
                  class with the largest share. Majority voting is averaging
                  zero-and-one indicators and selecting the largest average,
                  so section 15 applies to it, with one large caveat, which is
                  the next section.
                </p>
              </SubSection>

              <SubSection title="17. Correlated member errors">
                <p>Bagged trees share the same original dataset and can contain many of the same observations. Strong predictors may also lead them to similar splits. Their prediction errors can therefore be correlated. Under the simplifying assumptions of common variance σ² and common pairwise error correlation ρ, the variance of their average is</p>
                <Equation>{"Var(ensemble mean) = ρσ² + (1 − ρ)σ² / B"}</Equation>
                <p>The formula separates variation into two contributions. Increasing B reduces the contribution from variation that the members do not share. The shared contribution remains, because averaging predictions that make the same mistake does not cancel that mistake.</p>
              </SubSection>

              <SubSection title="18. The correlation ceiling">
                <CorrelationCeiling />
                <p>With correlation near zero, the variance falls approximately as σ²/B. With ρ = 0.6, it approaches sixty percent of a single member’s variance as B grows, while remaining above that limit for any finite B under this formula. Increasing the member count reduces only the part that is not shared. Random forests try to reduce shared errors by varying candidate features.</p>
                <KeepInMind>
                  <p>This calculation describes numeric outputs with equal variances, a common pairwise correlation, and equal weights in the average. Real tree committees need not satisfy those simplifying assumptions, and taking a final majority label is an additional operation. The formula helps explain why shared errors limit the benefit of averaging; it does not predict the exact score of these committees.</p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "A cell on the agreement map shows a vote share of 0.98. What does that number say?",
              [
                "About ninety-eight percent of the members agreed on that cell; the corresponding count depends on the ensemble size",
                "People in that cell are adults ninety-eight percent of the time",
                "The committee scored 0.98 on the people in that cell",
                "The cell sits in the tangled middle, where the vote is close",
              ],
              0,
              "The map reports agreement among member predictions. A share of 0.98 indicates near-unanimity, not a measured 0.98 rate among unseen people in that region. The exact count depends on the selected member count. Evaluate probability calibration separately if the output is to be interpreted as a class probability.",
            ),
            choice(
              "About what share of a crowd is left out of a typical bootstrap sample?",
              ["About 25 percent", "About 36.8 percent", "About 50 percent", "About 63.2 percent"],
              1,
              "For n equally likely observations and n independent draws with replacement, a particular observation is omitted with probability:\n\n```math\nP(omitted) = (1 − 1/n)ⁿ → 1/e ≈ 36.8% as n grows\n```\n\nAt n=25 the expected omitted count is about 9.01, or about 36 percent. Individual samples vary; these twenty-five samples omit between seven and twelve people.",
            ),
            trueFalse(
              "For B independent estimates with equal finite variance, their mean's standard deviation falls in proportion to 1/B.",
              false,
              "Under those assumptions, variance of the mean is the single-estimate variance divided by B. Standard deviation is its square root:\n\n```math\nVar(mean) = σ² / B\nSD(mean) = σ / √B\n```\n\nCorrelated estimates do not receive that full reduction.",
            ),
            trueFalse(
              "A class vote share is the average of zero-or-one class votes, so variance reasoning can be applied to that share before selecting the winning class.",
              true,
              "For one class, we can write each tree's vote as one when it selects that class and zero otherwise. Averaging those indicators gives the share of votes, and the largest share wins. When we reason about how much averaging helps, we must also account for agreement between the trees. Bagged trees are not independent, so their shared mistakes can remain in the combined prediction.",
            ),
            choice(
              "The variance of the ensemble mean is ρσ² + (1 − ρ)σ² / B. Which part does growing B never touch?",
              ["The first term", "The second term", "Both", "Neither"],
              0,
              "With equal member variances and a common pairwise correlation, the shared term ρσ² does not decrease with B. The remaining term approaches zero as more members are added. At ρ=0.6, the limiting variance is sixty percent of a single member's variance; a finite ensemble approaches that limit rather than reaching it exactly. Actual trees need not satisfy the equal-variance/common-correlation assumptions, but the formula explains why correlated predictions limit averaging gains.",
            ),
        ],
        },
        {
          title: "Part 7. Out-of-Bag Evaluation",
          content: (
            <>
              <SubSection title="19. One observation's out-of-bag trees">
                <p>For each person, identify the trees whose bootstrap samples omitted them. Those trees can supply an out-of-bag prediction because they did not train on that observation. With a finite committee, some people may have no such tree; the grid shows the actual coverage.</p>
                <OobGrid />
                <p>
                  Click a row. The filled cells are the trees that drew that
                  person, and the empty cells, lit green, are the trees that
                  did not. Only the green trees may judge that person out of
                  bag, because to every other tree they are a training
                  example.
                </p>
              </SubSection>

              <SubSection title="20. Constructing an out-of-bag prediction">
                <p>
                  For person i, find the trees that omitted i, ask each for a
                  prediction, aggregate only those, and compare with i&rsquo;s
                  known label.
                </p>
                <Equation>{"OOB prediction for i = aggregate over trees β with i ∉ sample β"}</Equation>
                <p>The panel compares the full committee with the trees that omitted this person. The full committee includes trees trained on the person, so its result benefits from having seen that example. The out-of-bag prediction excludes those trees and estimates how the method handles an unseen observation. On this crowd the predictions differ for eight of the twenty-five people, all in the tangled middle.</p>
              </SubSection>

              <SubSection title="21. Calculating the out-of-bag score">
                <Equation>{"OOB accuracy = correct OOB predictions / people with at least one judge"}</Equation>
                <p>Aggregate the eligible predictions for each covered observation, then compare them with its label. Different observations use different subsets of trees. For the full committee here, out-of-bag accuracy is 0.64 and training accuracy is 0.96. That gap is evidence about this fitted procedure on this sample, with uncertainty and the evaluation limits discussed below.</p>
              </SubSection>

              <SubSection title="22. OOB coverage and stability">
                <p>
                  With one member, only the people that member omitted have a
                  judge, seven of the twenty-five here, and the score is seven
                  verdicts. Coverage reaches all twenty-five at seven members.
                  Even then, a person&rsquo;s judges number between three and
                  thirteen on this committee, so an out-of-bag verdict can rest
                  on three votes.
                </p>
                <NumberTable
                  headings={["members", "people with a judge", "out-of-bag score"]}
                  rows={[
                    ["1", "7 of 25", "0.714, on seven people"],
                    ["3", "16 of 25", "0.750"],
                    ["7", "25 of 25", "0.600"],
                    ["13", "25 of 25", "0.640"],
                    ["25", "25 of 25", "0.640"],
                  ]}
                  caption="Early scores use fewer covered observations and fewer out-of-bag members. More coverage can improve stability, while sampling uncertainty and selection effects remain."
                />
              </SubSection>

              <SubSection title="23. Limits of out-of-bag evaluation">
                <p>An out-of-bag score is still an evaluation score, with the same limits as other estimates. Repeatedly choosing settings by that score makes it part of model selection. Preprocessing fitted on the entire dataset can also expose information about an omitted observation before any tree is grown. Keeping the observation out of a tree is insufficient if earlier preparation already used it.</p>
                <p>Ordinary row-by-row resampling also assumes the rows can be treated as exchangeable. Time order, repeated measurements of one person, or groups of related observations may require a different evaluation design. With too few trees, out-of-bag coverage can also be incomplete or unstable.</p>
                <InAModel>
                  <p>For a final performance estimate, reserve observations that were excluded from fitting, preprocessing and model selection. Out-of-bag evaluation is useful internally, but repeated selection by that score can make it optimistic. The <Link href="/concepts/held-out-evaluation" className={linkClass}>evaluation page</Link>{" "}compares these roles.</p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. What Bagging Can and Cannot Fix",
          content: (
            <>
              <SubSection title="24. Problems bagging helps">
                <p>
                  Bagging is at its best when the base learner can express the
                  pattern and estimates it unstably. A deep tree can draw any
                  rectangle the tangled crowd needs, and draws different ones
                  from different samples. The scrubber in section 11 shows the
                  individual members disagreeing in the middle and the vote
                  settling on the stable regions, which is variance being
                  averaged away.
                </p>
              </SubSection>

              <SubSection title="25. Problems bagging does not repair">
                <p>
                  Now bag members that cannot express the pattern. The right
                  committee below is twenty-five stumps, trees allowed one
                  question each.
                </p>
                <BiasVersusVariance />
                <p>The twenty-five bagged stumps score 0.72 on this training dataset, compared with 0.80 for the single fitted stump. That result is specific to this resampling and ensemble size; adding members does not guarantee the score stays at 0.72. Combining stumps can create several breakpoints, although an additive collection can still miss interactions a deeper tree can express. Evaluate the aggregate rule rather than treating its capacity as identical to one member’s.</p>
                <p>Resampling cannot supply a missing feature or correct a label merely by repeating it. A biased sample can remain biased across its resamples, and leakage in the preparation can affect every tree. Bagging addresses sensitivity to the training sample; the quality of the data and evaluation still need their own checks.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Why Bagging Plateaus",
          content: (
            <>
              <SubSection title="26. Why improvement plateaus">
                <p>In this finite sweep, early additions change many displayed predictions. Later additions often change none, although near ties can still flip. Further trees increase fitting and prediction cost while making the average less sensitive to any one member. The observed plateau does not guarantee that every later addition leaves accuracy unchanged.</p>
              </SubSection>

              <SubSection title="27. Similar root questions">
                <p>Twenty of the twenty-five members choose height at the root, and seven choose the identical height threshold of 147.5. This shows how similar structures can persist across bootstrap samples. Similar roots can contribute to similar predictions, but root counts alone do not measure error correlation. The diversity measurements compare the actual predictions.</p>
              </SubSection>

              <SubSection title="28. From bagging to random forests">
                <p>Bagging varies which observations each tree sees. A <Link href="/concepts/random-forests" className={linkClass}>random forest</Link> also samples candidate features at each split. With height unavailable, a node can select a weight split or stop if no eligible improvement exists. Feature sampling can reduce shared prediction errors, but may also weaken individual trees; neither effect is guaranteed on every dataset. The forest lesson measures that tradeoff.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. Bagging Beyond Trees",
          content: (
            <SubSection title="29. Bagging beyond trees">
              <p>
                Nothing in the recipe mentions a tree. Draw B bootstrap
                samples, fit one model to each, aggregate their predictions.
                Any learner that can be fitted to a sample can be a member,
                and the aggregate is a vote or an average of probabilities
                for a classifier and a mean for a regressor, as section 10
                said.
              </p>
              <p>Bagging can be applied to many kinds of fitted model. Its benefit depends on how much their predictions change across samples and how differently the members make errors. In our deep-tree example, one relabeled person can change the first question, and different resamples produce different fitted boundaries. Averaging those changing predictions has something useful to work on.</p>
              <p>That does not make low bias or instability a requirement for running the algorithm. They help explain why deep trees are a common choice and why bagging a stable or severely limited model can offer less improvement. Training accuracy alone cannot establish low bias on the wider population.</p>
              <p>A learner whose predictions change little across resamples gives averaging less variation to reduce. A well-determined straight-line fit can behave this way. In the simplified formula from section 17, correlation ρ near one leaves the shared term ρσ² close to the variance of an individual member. Adding members then removes little of that variance.</p>
              <KeepInMind>
                <p>The bagged stumps score 0.72 in this comparison. Their varying thresholds can form a more detailed aggregate rule than one stump, but averaging one-feature stump responses still cannot represent every interaction available to a deeper tree. That capacity limit is distinct from the observed score on this sample.</p>
              <p>Our members are grown deep so each can represent those interactions, while aggregation reduces some of their sample sensitivity. Depth and pruning still remain choices to evaluate. A forest does not make overfitting impossible or remove every reason to restrict its members.</p>
              </KeepInMind>
            </SubSection>
          ),
        },
        {
          title: "Questions on Parts 7 to 10",
          quiz: [
            choice(
              "Which members are allowed to judge person i out of bag?",
              [
                "Every member, since the aggregate is what is being evaluated",
                "Only the members whose bootstrap sample omitted i",
                "Only the members that drew i exactly once",
                "A fixed third of the members, chosen in advance",
              ],
              1,
              "To every other member that person is a training example, and a deep tree remembers its own sample. The difference is measurable here, since the whole committee’s verdict and the judges’ verdict differ for eight of the twenty-five people, and the out-of-bag score reads 0.64 against a training score of 0.96.",
            ),
            several(
              "In which of these cases does the out-of-bag score stop being untouched evidence?",
              [
                "Hyperparameters are chosen by it repeatedly",
                "Features were selected or preprocessing was fitted on the whole crowd",
                "The observations are dependent, ordered in time, or grouped",
                "The committee is large enough that every person has many judges",
              ],
              [0, 1, 2],
              "Repeatedly choosing settings from out-of-bag results makes them validation evidence used in selection. Upstream feature selection or learned preprocessing on all rows can also expose information from an omitted observation. For grouped or time-dependent data, ordinary row-wise bootstrap omission may fail to represent the intended unseen group or future period. More contributing trees improve coverage and reduce estimate noise, but do not fix those evaluation mismatches.",
            ),
            trueFalse(
              "Bagging twenty-five stumps lifts the training score above what one stump reaches.",
              false,
              "In this seeded comparison, the bagged stumps score 0.72 on training data while the single stump scores 0.80. Their out-of-bag score is 0.68, slightly above the deep ensemble's 0.64. Combining stumps can produce a rule more complex than one stump, but that does not guarantee higher training accuracy or remove every shared limitation. Bagging mainly aims to reduce sensitivity to resampling; assess the combined predictions rather than assuming it improves every score.",
            ),
            choice(
              "Why does this committee stop improving after about twenty members?",
              [
                "The bootstrap runs out of distinct samples to draw",
                "The trees start alike because the strong feature wins most of the roots, so their errors stay correlated",
                "Later members are grown on smaller samples",
                "The training score has reached 1.000, so nothing further can be learned",
              ],
              1,
              "Twenty of the twenty-five members root on height and five on weight, and seven ask exactly the same first question. Bootstrap resampling creates diversity and a strong predictor can keep the trees correlated regardless, which is the floor the two-term variance formula names. The random forest lowers it by sometimes taking height off the table, at the cost of weakening each tree.",
            ),
            trueFalse(
              "A learner that gives nearly the same fit on every resample gains almost nothing from being bagged.",
              true,
              "If resampling produces almost identical predictions, averaging those predictions changes little. In the equal-variance model this corresponds to correlation near one, leaving little variance to reduce by adding members. A more data-sensitive base learner may provide more varied predictions and more opportunity for bagging to help, although held-out performance remains the practical test.",
            ),
        ],
        },
        {
          title: "Part 11. Keeping the Sampling and Voting Rules Reproducible" , id: "part-11-implementation-and-failure-contracts",
          content: (
            <SubSection title="30. Record the draws, base models and voting rule" id="30-implementation-and-failure-contracts">
              <p>Suppose we fit the same training data twice and obtain different votes. To explain the difference, we need to know how each training sample was drawn, which model fitted it, and how the predictions were combined. The choices below make that comparison possible.</p>
              <NumberTable
                headings={["setting or case", "what has to be decided"]}
                rows={[
                  ["number of members B", "a field, one per committee"],
                  ["sample size and replacement", "n draws with replacement, so a member sees fewer than n distinct rows"],
                  ["seeding", "one seed per committee, offset by position for each member, so a refit reproduces the same trees"],
                  ["aggregation", "averaged class probabilities, largest wins, earlier class on an exact tie"],
                  ["a class absent from one member's sample", "the member is told the full class count so its probability columns still line up"],
                  ["a person with no out-of-bag judge", "reported as uncovered rather than scored"],
                  ["one class in the crowd", "refused, in words"],
                  ["a member that fails to fit", "the whole fit fails; no partial committee is kept"],
                  ["out-of-bag scoring", "computed against the training rows the committee keeps for the purpose"],
                ]}
              />
              <WhyThisWorks title="Class Coverage and Member Randomness">
                <p>A rare class may be absent from a bootstrap sample. If two of thirty observations carry that class, the probability of omitting both is about 0.126. Across twenty-five independent member samples, the probability that at least one member misses it is about 0.966.</p>
                <Equation>
                  {"P(both missed by one sample) = (1 − 2/30)³⁰ ≈ 0.126\nP(some member of 25 misses the class) = 1 − (1 − 0.126)²⁵ ≈ 0.966"}
                </Equation>
                <p>Probability columns must refer to the same classes in every member. The ensemble supplies the complete class count before fitting each sample, including when a sample omits a class. It can then align and average the returned columns consistently.</p>
                <p>Members also need separate random streams for feature sampling. Reusing an identical stream can create matching restrictions and reduce the intended diversity. This implementation derives member seeds from the ensemble seed and member position, making repeated fits reproducible while allowing different member choices.</p>
              </WhyThisWorks>
              <p>An out-of-bag prediction needs at least one tree whose sample omitted that person. If none did, the estimate marks the row uncovered and leaves its prediction empty. Substituting zero would invent a prediction and could distort the resulting score.</p>
<p>With five trees, five of these twenty-five people are uncovered, so the score uses only twenty. Coverage reaches all twenty-five by seven trees in this run. This implementation also rejects a single-class target before resampling; that is its classification contract, rather than a general impossibility of predicting a constant class.</p>
              <DerivationTable
                rows={[
                  { expression: "(1 − 1/n)ⁿ", reason: "one person missed by every one of n independent draws" },
                  { expression: "→ 1/e ≈ 0.368", reason: "the large-sample limit; for n = 25 the omission probability is approximately 0.360" },
                  { expression: "ρσ² + (1 − ρ)σ²/B", reason: "the committee's variance, a floor plus a part that B removes" },
                ]}
              />
            </SubSection>
          ),
        },
        {
          title: "Practice. Growing the Committee With the Library",
          practice: [
            exercise("Grow the committee of twenty-five and read its two scores",["Fit BaggingClassifier with n_members=25 and random_seed=7 to the twenty-five labeled people below. Its default base model is an unrestricted decision tree. Print training accuracy and out-of-bag accuracy, then count how many fitted trees split first on height and how many on weight.", "Keep the supplied row order and seed while comparing your results with the lesson. The seed makes this implementation's resampling repeatable; it does not guarantee identical results across different random generators or tree implementations."],`from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7)
# Fit the committee, print its training score and its out-of-bag score to
# three places, then count how many members root on height and on weight.`,`from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7)
committee.fit([heights, weights], is_adult)

print(f"training score {committee.score([heights, weights], is_adult):.3f}")
print(f"out-of-bag score {committee.out_of_bag_score():.3f}")

roots = [member.root.split.feature_name for member in committee.members]
print(f"members rooting on height {roots.count('height')}")
print(f"members rooting on weight {roots.count('weight')}")`,`training score 0.960
out-of-bag score 0.640
members rooting on height 20
members rooting on weight 5`,{...{ hints: ["Pass the member count and seed to BaggingClassifier, then call fit with the input Feature list and target Feature.", "score receives the training features and target. out_of_bag_score() uses the stored training rows and bootstrap membership records, so it takes no new data argument.", "The fitted members are a tuple on the committee, and each one is an ordinary tree, so its root is a node holding a split, and the split knows the name of the feature it asks about."], check: numberCheck("What out-of-bag score does the committee report?", 0.64, 0.0005, "The out-of-bag score uses only predictions from members whose resamples omitted that person. Its gap from the training score shows why performance on rows used for fitting is a different measurement.") },question:"How does the fitted committee score on training rows and on people its members left out?"}),
            exercise("Count who each member left out",["Every sample contains twenty-five draws with replacement from the twenty-five training people. Repeats mean some people are selected more than once and others are absent. For each member, count the distinct selected people and those omitted.","Print the first sample's draws, distinct-person count and omitted count. Then print the minimum, maximum and mean omitted counts across the committee, beside the theoretical expected omitted count computed from the sample size. Do not treat that expectation as a requirement for each sample."],`from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
# Print the first sample's draw count, distinct people and omitted count, then
# the smallest, largest and mean omitted count over all twenty-five members,
# and the expected omitted count from the formula in section 14.`,`from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)

first = committee.samples[0]
print(f"first member: {len(first)} draws, {int(first.in_bag.sum())} distinct people, {first.out_of_bag.size} omitted")

omitted = [sample.out_of_bag.size for sample in committee.samples]
print(f"omitted per member, smallest {min(omitted)} and largest {max(omitted)}")
print(f"mean omitted {sum(omitted) / len(omitted):.2f}")
print(f"expected omitted {25 * (1 - 1 / 25) ** 25:.2f}")`,`first member: 25 draws, 18 distinct people, 7 omitted
omitted per member, smallest 7 and largest 12
mean omitted 8.76
expected omitted 9.01`,{...{ hints: ["samples on a fitted committee is a tuple with one bootstrap sample per member, in member order, so the first member’s is at position zero.", "A sample knows the positions it drew, with repeats, and can report in_bag, one true or false per person, and out_of_bag, the positions it never drew. The length of the sample is the number of draws.", "Summing in_bag counts the distinct people, since a person drawn three times is still one true, and the size of out_of_bag is the omitted count."], check: numberCheck("What is the mean omitted count across the twenty-five members, to two places?", 8.76, 0.005, "The expected omitted count describes an average over random draws, not a requirement for each member. This seeded committee has its own realized range and mean.") },question:"How many people did each bootstrap sample leave out?"}),
            exercise("Judge every person out of bag",["Call out_of_bag_estimate() on the fitted ensemble. For each training person, this estimate combines only trees whose bootstrap sample omitted that person. Compare these predictions with predict() from the full ensemble.", "Print the covered and uncovered person counts, the minimum, maximum and mean contributing-tree counts, and the number of predictions that differ from the full ensemble. Compare mean_judges with the previous exercise's mean omitted count. These means agree here because there are twenty-five people and twenty-five trees."],`from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
estimate = committee.out_of_bag_estimate()
# Print how many people are covered and uncovered, the fewest and most
# judges any person has, the mean number of judges, and how many people's
# out-of-bag verdict differs from the whole committee's verdict.`,`from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
estimate = committee.out_of_bag_estimate()

print(f"people with a judge {estimate.n_covered}, without {estimate.n_uncovered}")
print(f"judges per person, fewest {int(estimate.judges.min())} and most {int(estimate.judges.max())}")
print(f"mean judges {estimate.mean_judges:.2f}")

whole = committee.predict([heights, weights])
differ = sum(1 for own, judged in zip(whole, estimate.predictions) if own != judged)
print(f"people whose two verdicts differ {differ}")`,`people with a judge 25, without 0
judges per person, fewest 3 and most 13
mean judges 8.76
people whose two verdicts differ 8`,{...{ hints: ["The estimate stores coverage and contribution counts alongside its predictions. Read n_covered, n_uncovered, judges and mean_judges from that object.", "judges is one count per person, so its smallest and largest entries are the fewest and most judges anyone has.", "predict on the fitted committee gives the whole committee’s verdict for every person, and the estimate’s predictions give the judges’ verdict in the same order, so zipping the two and counting the disagreements is the whole comparison."], check: numberCheck("For how many people does the out-of-bag prediction differ from the full ensemble prediction?", 8, 0.5, "The full committee includes members trained on each person; the out-of-bag prediction excludes those members. Their disagreements expose mistakes concealed by training accuracy. Every member-person omission is also one available out-of-bag vote.") },question:"How do out-of-bag predictions differ from predictions using every fitted tree?"}),
            exercise("Bag stumps and watch the bias stay",["Fit one DecisionTreeClassifier(max_depth=1) to the training people. Then fit BaggingClassifier with twenty-five copies of that one-split base model under seed 7. Compare these with the existing twenty-five-tree unrestricted ensemble.", "Print the training scores for a single stump, the bagged stumps and the bagged deep trees. Then print the out-of-bag scores for both ensembles. Compare the stump ensemble's out-of-bag result with the deep trees' reported 0.64."],`from oop_ml import BaggingClassifier, DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

deep = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
# Fit one stump on the whole crowd, and a committee of twenty-five bagged
# stumps under seed 7, then print the three training scores and the two
# out-of-bag scores to two places.`,`from oop_ml import BaggingClassifier, DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

deep = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
one_stump = DecisionTreeClassifier(max_depth=1).fit([heights, weights], is_adult)
stumps = BaggingClassifier(
    n_members=25, random_seed=7, base_model=DecisionTreeClassifier(max_depth=1)
).fit([heights, weights], is_adult)

print(f"one stump, training score {one_stump.score([heights, weights], is_adult):.2f}")
print(f"bagged stumps, training score {stumps.score([heights, weights], is_adult):.2f}")
print(f"bagged deep trees, training score {deep.score([heights, weights], is_adult):.2f}")
print(f"out of bag, stumps {stumps.out_of_bag_score():.2f} against deep trees {deep.out_of_bag_score():.2f}")`,`one stump, training score 0.80
bagged stumps, training score 0.72
bagged deep trees, training score 0.96
out of bag, stumps 0.68 against deep trees 0.64`,{...{ hints: ["A stump is a decision tree whose max_depth is 1, and a tree constructed that way is a model like any other, so it can be fitted on the crowd by itself.", "The bagging frame takes a base_model, the prototype every member is a copy of. Its default is an unpruned tree, and a stump handed in its place makes every member a stump.", "Both committees are fitted and scored exactly as the deep one was. Nothing about the frame changes when the member does."], check: numberCheck("What out-of-bag score do the bagged stumps report, to two places?", 0.68, 0.005, "The stump committee remains restricted by its one-question members. Its out-of-bag result on this sample is slightly above the deep-tree committee's, illustrating that extra training flexibility need not improve predictions for unseen rows.") },question:"Can averaging one-question trees repair a rule that is too restrictive?"}),
          ],
        },
      ]}
    />
  );
}
