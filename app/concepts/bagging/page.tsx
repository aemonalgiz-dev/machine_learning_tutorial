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

export const metadata: Metadata = {
  title: "Bagging · oop_ml",
  description:
    "Small changes in the training data can produce very different fitted models. Fitting several models to resampled data and combining their answers can make the result less dependent on one particular fit.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function BaggingPage() {
  return (
    <ConceptPage
      lessonId="bagging"
      intuition={lessonIntuitions["bagging"]}
      technicalStart="Part 3. Building the Bagged Ensemble"
      openingTitle="When One Tree Changes Its Mind"
      playgroundIntro="Compare one tree's answer with the combined answer. As more trees join, watch whether their disagreements cancel or persist."
      title="Bagging"
      tagline={"Small changes in the training data can produce very different fitted models. Fitting several models to resampled data and combining their answers can make the result less dependent on one particular fit."}
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
                  Set the slider in the box above to one member. That is one
                  fully grown tree on the trees page&rsquo;s tangled crowd,
                  twenty-five people whose middle was built to be nearly
                  noise. It scores 0.920 on the people it trained on, and the
                  regions show how it got there, rectangles fitted around the
                  particular people it happened to receive. Nothing about
                  bagging yet. This is the baseline.
                </p>
              </SubSection>

              <SubSection title="2. Small data changes, different trees">
                <p>
                  Now change the crowd slightly and grow the tree again. The
                  widget below relabels one person, or grows a tree on each of
                  five random four-fifths of the crowd.
                </p>
                <TreeStability />
                <p>
                  One label moved the root question from height to weight,
                  and once the root changes everything under it is decided in
                  different halves. Five samples of the same crowd put their
                  root cuts in five different places. The underlying problem
                  did not change at all. The sample changed a little, and the
                  tree changed a lot.
                </p>
              </SubSection>

              <SubSection title="3. Instability as variance">
                <p>
                  That sensitivity has a name. A learner whose fitted model
                  swings from one plausible training sample to the next has
                  high variance, in the sense the statistics primer gave the
                  word. The prediction problem is fixed. The sample is one
                  draw from it. A high-variance learner reads too much of the
                  draw into the model, and reads something different from the
                  next draw. Everything on this page is a way of reducing that
                  swing without changing the learner.
                </p>
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
                <p>
                  What the bootstrap does not do is invent anyone. The crowd is
                  the best available stand-in for the population it came from,
                  and drawing from it with replacement is drawing repeatedly
                  from that stand-in. No new people and no new information,
                  only a rearrangement of how much influence the people
                  already there have.
                </p>
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
              "Relabelling a single person was enough to move the tree’s root question from height to weight.",
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
              "Without replacement a drawn card stays out, so twenty-five draws reproduce the crowd exactly, every person once. The bootstrap invents nobody. It only rearranges how much influence the people already there have, and that rearrangement is where every member’s difference comes from.",
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
                <p>
                  The left map changes a great deal in the first few members,
                  24 cells flipping between three and four, and settles as
                  more arrive, with long runs of zero changed cells past
                  twenty. The training score reaches 1.000 by eight members
                  and stays near it. The out-of-bag score, which Part 7
                  explains, lands around 0.64, because the tangled middle is
                  nearly noise and a committee cannot learn what is not there.
                </p>
              </SubSection>

              <SubSection title="12. Vote strength versus predicted class">
                <p>
                  Two cells can both be called adult with fifty-one percent of
                  the members on one and ninety-eight percent on the other.
                  The right map draws that difference, pale where the vote
                  was close and dark where it was nearly unanimous. Move the
                  probe into the tangled middle and the winner is a coin toss
                  with the paint to match. Move it to the corners and the
                  committee is unanimous.
                </p>
                <p>
                  The winning class and the strength of agreement are two
                  outputs, and the second is not a calibrated probability. A
                  vote share of 0.98 means twenty-four or twenty-five trees
                  agreed, and whether people in that cell are adults
                  ninety-eight percent of the time is a separate question,
                  answered only by data the committee never saw.
                </p>
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
                <p>
                  The curve settles onto 1/e almost at once, so about 36.8
                  percent is the figure whatever the crowd&rsquo;s size, and
                  about 63.2 percent of the crowd appears at least once in a
                  typical sample. It is an expected proportion, and no single
                  sample is obliged to hit it.
                </p>
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
                  positive and negative errors partly cancel, and that cancelling
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
                <p>
                  Bagged trees are not independent. They come from one
                  dataset, their samples overlap by about two thirds, the same
                  strong feature dominates most of their roots, and so they
                  tend to learn similar boundaries and make similar mistakes.
                  With a common variance σ² and a common pairwise correlation
                  ρ the variance of the average is
                </p>
                <Equation>{"Var(ensemble mean) = ρσ² + (1 − ρ)σ² / B"}</Equation>
                <p>
                  Two terms. The second is the reducible part, and it goes to
                  zero as B grows. The first is the shared part, and B never
                  touches it. Adding members averages away the variation the
                  members do not share, and cannot average away a mistake they
                  all make together.
                </p>
              </SubSection>

              <SubSection title="18. The correlation ceiling">
                <CorrelationCeiling />
                <p>
                  At ρ near zero the curve falls like σ²/B and keeps falling.
                  At ρ of 0.6 it drops to the floor within a dozen members and
                  then goes flat, with sixty percent of a single member&rsquo;s
                  variance left however many are added. That floor is the
                  reason bagging plateaus, and lowering it is the whole idea of
                  the random forest.
                </p>
                <KeepInMind>
                  <p>
                    The formula assumes numeric member outputs, equal member
                    variances, one common pairwise correlation, and an
                    equal-weight average. A majority vote of trees satisfies
                    none of those exactly. It is a model of the effect that
                    isolates the role of shared error, and it is the right
                    picture to hold, not an exact account of any committee on
                    this page.
                  </p>
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
                "Twenty-four or twenty-five of the trees agreed on that cell",
                "People in that cell are adults ninety-eight percent of the time",
                "The committee scored 0.98 on the people in that cell",
                "The cell sits in the tangled middle, where the vote is close",
              ],
              0,
              "The strength of agreement is the second of the committee’s two outputs, and it is not a calibrated probability. Whether people in that cell are adults ninety-eight percent of the time is a separate question, answered only by data the committee never saw. A close vote is what the tangled middle produces, where the winner is a coin toss with the paint to match, so a share of 0.98 is the opposite case.",
            ),
            choice(
              "About what share of a crowd is left out of a typical bootstrap sample?",
              ["About 25 percent", "About 36.8 percent", "About 50 percent", "About 63.2 percent"],
              1,
              "The chance of never drawing one person is (1 − 1/n)ⁿ, which settles onto 1/e almost at once, so the figure barely depends on the crowd’s size. It is an expected proportion and no single sample is obliged to hit it. Across the twenty-five members here the actual omitted counts run from 7 to 12 against an expected 9.",
            ),
            trueFalse(
              "Averaging B independent estimates of one quantity makes the spread of the average fall as one over B.",
              false,
              "The variance falls as one over B, and the spread is its square root, so the spread falls as one over the square root of B. Four independent members cut the variance to a quarter and a hundred to a hundredth, because positive and negative errors partly cancel, and that cancelling is all averaging does.",
            ),
            trueFalse(
              "A majority vote is a kind of averaging, so the same variance argument applies to it.",
              true,
              "Write each tree’s vote for one class as a one or a zero. The mean of those indicators is the share of trees voting for the class, and the committee picks the class with the largest share. The caveat is not the averaging but the independence, since bagged trees are not independent.",
            ),
            choice(
              "The variance of the ensemble mean is ρσ² + (1 − ρ)σ² / B. Which part does growing B never touch?",
              ["The first term", "The second term", "Both", "Neither"],
              0,
              "The second term is the reducible part and goes to zero as B grows. The first is the shared part, and at a ρ of 0.6 the curve drops to its floor within a dozen members and then goes flat, with sixty percent of a single member’s variance left however many are added. Adding members cannot average away a mistake they all make together. The formula assumes equal member variances and one common correlation, which no committee on this page satisfies exactly, so it is the right picture of the effect rather than an account of any particular vote.",
            ),
        ],
        },
        {
          title: "Part 7. Out-of-Bag Evaluation",
          content: (
            <>
              <SubSection title="19. One observation's out-of-bag trees">
                <p>
                  Every person was left out of about a third of the samples,
                  so for every person there stands a group of members that
                  never trained on them. The grid below is who saw whom.
                </p>
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
                <p>
                  The panel beside the grid gives both verdicts. The whole
                  committee&rsquo;s vote includes trees that trained on the
                  person and so tends to get them right, since a deep tree
                  remembers its own sample. The judges&rsquo; vote is what the
                  committee would say about a stranger. On this crowd the two
                  verdicts differ for eight of the twenty-five people, every
                  one of them in the tangled middle.
                </p>
              </SubSection>

              <SubSection title="21. Calculating the out-of-bag score">
                <Equation>{"OOB accuracy = correct OOB predictions / people with at least one judge"}</Equation>
                <p>
                  Repeat for everyone who has a judge and divide. Different
                  people are judged by different subsets of trees, which is
                  unlike a held-out set where one model is judged by every
                  held-out row, and the score is an estimate assembled from
                  twenty-five partial ones. On the full committee it reads
                  0.64 against a training score of 0.96, and the gap is the
                  truth about this crowd rather than a fault in the method.
                </p>
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
                  caption="The early scores are not better; they are averages of very few verdicts. The score becomes trustworthy as people accumulate judges."
                />
              </SubSection>

              <SubSection title="23. Limits of out-of-bag evaluation">
                <p>
                  Out-of-bag evaluation reuses the training data efficiently, and it obeys the same rules as every other evaluation. It stops being untouched evidence when hyperparameters are chosen by it repeatedly, since it is then part of the selection and no longer a judge of it. It leaks when features were selected or preprocessing was fitted on the whole crowd, because the judges then know something about the person from a step upstream of the bootstrap.
                </p>
                <p>
                  It misleads when the observations are dependent, ordered in time, or grouped, so that ordinary resampling breaks a structure the data has. And it is unstable when the committee is too small to cover everyone well.
                </p>
                <InAModel>
                  <p>
                    For a final report a separate test set that took no part
                    in anything can still be the right instrument, and the{" "}
                    <Link href="/concepts/held-out-evaluation" className={linkClass}>
                      evaluation page
                    </Link>{" "}
                    is where that argument lives. The out-of-bag score is an
                    efficient internal estimate, and this page calls it that
                    rather than free or honest without qualification.
                  </p>
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
                <p>
                  The stumps score 0.72 on the training crowd however many
                  there are, because every one of them cuts the plane once and
                  the crowd needs a second cut. They make the same structural
                  mistake, and voting among members that all lack the same
                  thing does not supply it. Aggregation reduces variance. It
                  does not reduce bias, and it cannot recover structure that
                  every member is too restricted to represent.
                </p>
                <p>
                  Nor does it repair the data. Labels that are wrong in the
                  crowd are wrong in every resample. A feature that is missing
                  is missing from every tree. A crowd sampled badly, a target
                  that does not mean what it should, a leak between training
                  and evaluation, or a shift between the crowd and the people
                  the model will meet, all of these pass through the bootstrap
                  untouched. Bagging reduces model variance and nothing else.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Why Bagging Plateaus",
          content: (
            <>
              <SubSection title="26. Why improvement plateaus">
                <p>
                  Read the changed-cells readout in section 11 as the members
                  are added. Early members change the map by dozens of cells
                  at a time. Past about twenty the count is mostly zero, with
                  the odd flip of eleven cells when a tree breaks a near tie.
                  The training score settled by eight members and the
                  out-of-bag score by about the same. Every further member
                  costs another tree to grow and to consult and buys
                  stability more than accuracy. Additional trees eventually
                  stabilise the ensemble more than they improve it.
                </p>
              </SubSection>

              <SubSection title="27. Similar root questions">
                <p>
                  The reason is section 17&rsquo;s floor, and the gallery in
                  section 7 shows where the floor comes from. Twenty of the
                  twenty-five members root on height and five on weight, and
                  seven ask exactly the same first question. The samples
                  differ, and the strong feature still wins most of the time,
                  so the trees start alike and their errors stay correlated.
                  Bootstrap resampling creates diversity, and a strong
                  predictor can keep the trees correlated regardless.
                </p>
              </SubSection>

              <SubSection title="28. From bagging to random forests">
                <p>
                  Bagging varies which people each tree sees. The{" "}
                  <Link href="/concepts/random-forests" className={linkClass}>
                    random forest
                  </Link>{" "}
                  also varies which features each split is allowed to
                  consider, so that height is sometimes off the table and a
                  tree has to root on weight whether it wanted to or not. A
                  strong feature cannot dominate every split when it is
                  sometimes unavailable, the trees become less alike, ρ
                  falls, and the floor in section 18 drops. That is not free.
                  Restricting the features weakens each individual tree, and
                  the trade is the forest page&rsquo;s subject.
                </p>
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
              <p>
                What the recipe needs from its learner is three things, and
                this page has already shown all three on the deep tree. It
                has to be sensitive to its training data, which is Part 1,
                where one relabelled person moved the root question from
                height to weight. It has to be able to reach low bias, which
                is Part 4, where the committee&rsquo;s training score reaches
                1.000 by eight members because every member can draw whatever
                rectangles its sample asks for. And it has to produce
                meaningfully different fits from different resamples, which
                is the gallery in section 7, where the twenty members that
                root on height do so at ten different thresholds between 144
                and 158, and the five on weight at three. That is a
                description of a deep tree and of little else on this site.
              </p>
              <p>
                A learner that is already stable, a straight line say, gives
                nearly the same fit on every resample, and a committee of
                nearly identical members gains nothing from the vote. Section
                17&rsquo;s formula says why. Members that agree have a
                correlation ρ near one, so the floor ρσ² is nearly the whole
                variance and the part that B removes is nearly nothing.
                Bagging is a general method whose canonical case is the one
                that made it worth inventing.
              </p>
              <KeepInMind>
                <p>
                  The requirements are separate, and the stumps in section 25
                  pass the first while failing the second. The twenty-five
                  stumps ask thirteen different first questions between them,
                  so there is variation to average, and the committee still
                  scores 0.72 because no member can draw the second cut. A
                  learner has to be unstable and capable at once, and the
                  deep tree is the one on this site that is both. That
                  reverses something from the trees page. On a lone tree the
                  stopping rules are the only defence against reading too
                  much into the sample. Inside a committee the averaging has
                  taken that job over, which is why every member here is
                  grown deep and left unpruned.
                </p>
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
              "Choosing by it makes it part of the selection rather than a judge of it, and fitting anything on the whole crowd lets the judges know something about the person from a step upstream of the bootstrap. Ordinary resampling also breaks a structure that dependent or grouped data has. A small committee is the unstable case, so a committee large enough that every person has many judges is the opposite of a problem.",
            ),
            trueFalse(
              "Bagging twenty-five stumps lifts the training score above what one stump reaches.",
              false,
              "The stumps score 0.72 however many there are, because every one of them cuts the plane once and the crowd needs a second cut. They make the same structural mistake, and voting among members that all lack the same thing does not supply it. Aggregation reduces variance, not bias, and it cannot recover structure every member is too restricted to represent.",
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
              "Nothing in the recipe mentions a tree, but the gain depends on the learner. A committee of nearly identical members has nothing for the vote to cancel, which in the two-term formula is a correlation near one and a floor that is nearly the whole variance. Bagging helps most where the base learner is sensitive to its training data, can reach low bias, and produces meaningfully different fits from different resamples, which is the deep tree.",
            ),
        ],
        },
        {
          title: "Part 11. Implementation and Failure Contracts",
          content: (
            <SubSection title="30. Implementation and failure contracts">
              <p>
                A complete implementation states its settings and its edge
                cases, and the ones that matter here are these.
              </p>
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
              <WhyThisWorks title="Two of those were found the hard way">
                <p>
                  A class with two people in a crowd of thirty is missing
                  from a bootstrap sample about one time in eight, because
                  both of them have to dodge every one of the thirty draws,
                  and across a committee of twenty-five the chance that at
                  least one member never sees the class at all is close to
                  certain.
                </p>
                <Equation>
                  {"P(both missed by one sample) = (1 − 2/30)³⁰ ≈ 0.126\nP(some member of 25 misses the class) = 1 − (1 − 0.126)²⁵ ≈ 0.966"}
                </Equation>
                <p>
                  A member that inferred its own class count from its sample
                  either refused the gap or handed back a probability matrix
                  one column short, and a committee cannot average columns
                  that do not line up. The committee now tells every member
                  how many classes exist before it fits.
                </p>
                <p>
                  And handing every member the committee&rsquo;s one seed made every member draw the same feature restriction at every node, which reproduced plain bagging exactly while looking like a forest. Each member&rsquo;s seed is offset by its position now, and a test reads which feature each member rooted on.
                </p>
              </WhyThisWorks>
              <p>
                Two rows of the table are about what the committee refuses
                to pretend. A person no member omitted has no judge, and
                their out-of-bag entry is left empty and counted as
                uncovered rather than filled with a zero, because a zero is
                a number a later average would quietly include. On this
                committee nobody is uncovered, since coverage reached all
                twenty-five at seven members, but at five members five of
                the twenty-five still had no judge, and a score assembled
                then rests on the other twenty. And a crowd holding one
                class is refused before any sample is drawn, since
                twenty-five copies of a tree that can only answer one way
                have nothing to vote on.
              </p>
              <DerivationTable
                rows={[
                  { expression: "(1 − 1/n)ⁿ", reason: "one person missed by every one of n independent draws" },
                  { expression: "→ 1/e ≈ 0.368", reason: "the limit as n grows, reached in practice by n = 25" },
                  { expression: "ρσ² + (1 − ρ)σ²/B", reason: "the committee's variance, a floor plus a part that B removes" },
                ]}
              />
            </SubSection>
          ),
        },
        {
          title: "Practice. Growing the Committee With the Library",
          practice: [
            exercise(
              "Grow the committee of twenty-five and read its two scores",
              ["Fit the page’s committee with the library. The crowd is the tangled crowd of twenty-five, the twenty-five members are deep trees, and the resamples come from seed 7, which is the seed every widget on this page draws from. Read the training score, the out-of-bag score, and which feature each member’s root question asks about.", "Part 7 arrived at 0.96 on the training crowd against 0.64 out of bag, and section 8 counted twenty roots on height and five on weight. All four numbers should come back exactly, since the seed fixes every draw."],
              `from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7)
# Fit the committee, print its training score and its out-of-bag score to
# three places, then count how many members root on height and on weight.`,
              `from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7)
committee.fit([heights, weights], is_adult)

print(f"training score {committee.score([heights, weights], is_adult):.3f}")
print(f"out-of-bag score {committee.out_of_bag_score():.3f}")

roots = [member.root.split.feature_name for member in committee.members]
print(f"members rooting on height {roots.count('height')}")
print(f"members rooting on weight {roots.count('weight')}")`,
              `training score 0.960
out-of-bag score 0.640
members rooting on height 20
members rooting on weight 5`,
              { hints: ["Construction configures and fitting learns. The member count and the seed go to the constructor, and the two features and the target go to fit, features first as a list.", "The training score is score on the same features and target the committee was fitted to. The out-of-bag score needs no data at all, because the committee kept its training rows for exactly this purpose.", "The fitted members are a tuple on the committee, and each one is an ordinary tree, so its root is a node holding a split, and the split knows the name of the feature it asks about."], check: numberCheck("What out-of-bag score does the committee report?", 0.64, 0.0005, "Sixteen of the twenty-five people are called correctly by the members whose samples omitted them, and 16 over 25 is 0.64. The training score of 0.96 is the same committee asked about people most of its members memorised, and the gap between the two is the tangled middle being nearly noise.") },
            ),
            exercise(
              "Count who each member left out",
              ["Section 14 expects a sample of twenty-five to omit about nine people. Ask the fitted committee for its samples and count, for every member, how many of the twenty-five were never drawn.", "The first member’s sample is the one the bootstrap machine replays. Print its draws, its distinct people and its omitted count, then the smallest, largest and mean omitted count across the committee beside the expected 25 × (1 − 1/25)²⁵. The mean is a number the page does not quote."],
              `from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
# Print the first sample's draw count, distinct people and omitted count, then
# the smallest, largest and mean omitted count over all twenty-five members,
# and the expected omitted count from the formula in section 14.`,
              `from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)

first = committee.samples[0]
print(f"first member: {len(first)} draws, {int(first.in_bag.sum())} distinct people, {first.out_of_bag.size} omitted")

omitted = [sample.out_of_bag.size for sample in committee.samples]
print(f"omitted per member, smallest {min(omitted)} and largest {max(omitted)}")
print(f"mean omitted {sum(omitted) / len(omitted):.2f}")
print(f"expected omitted {25 * (1 - 1 / 25) ** 25:.2f}")`,
              `first member: 25 draws, 18 distinct people, 7 omitted
omitted per member, smallest 7 and largest 12
mean omitted 8.76
expected omitted 9.01`,
              { hints: ["samples on a fitted committee is a tuple with one bootstrap sample per member, in member order, so the first member’s is at position zero.", "A sample knows the positions it drew, with repeats, and can report in_bag, one true or false per person, and out_of_bag, the positions it never drew. The length of the sample is the number of draws.", "Summing in_bag counts the distinct people, since a person drawn three times is still one true, and the size of out_of_bag is the omitted count."], check: numberCheck("What is the mean omitted count across the twenty-five members, to two places?", 8.76, 0.005, "Nine is the expectation and no member is obliged to hit it. Across these twenty-five members the counts run from 7 to 12 and average 8.76, a little under the 9.01 that 25 × (24/25)²⁵ predicts, which is the histogram in section 7 summarised in one number.") },
            ),
            exercise(
              "Judge every person out of bag",
              ["Section 22 says a person’s judges number between three and thirteen on this committee, and section 20 says the whole committee’s verdict and the judges’ verdict differ for eight people. Build the out-of-bag estimate and read both claims off it.", "Print how many people have at least one judge, the fewest and most judges anyone has, the mean number of judges, and the number of people whose two verdicts differ. The mean is a number the page does not quote, and it is worth comparing with the mean omitted count from the previous problem."],
              `from oop_ml import BaggingClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

committee = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
estimate = committee.out_of_bag_estimate()
# Print how many people are covered and uncovered, the fewest and most
# judges any person has, the mean number of judges, and how many people's
# out-of-bag verdict differs from the whole committee's verdict.`,
              `from oop_ml import BaggingClassifier, Feature

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
print(f"people whose two verdicts differ {differ}")`,
              `people with a judge 25, without 0
judges per person, fewest 3 and most 13
mean judges 8.76
people whose two verdicts differ 8`,
              { hints: ["out_of_bag_estimate answers an object rather than a bare array, because a prediction means nothing without knowing which people it covers and how many members stood behind it. n_covered, n_uncovered, judges and mean_judges are all properties of it.", "judges is one count per person, so its smallest and largest entries are the fewest and most judges anyone has.", "predict on the fitted committee gives the whole committee’s verdict for every person, and the estimate’s predictions give the judges’ verdict in the same order, so zipping the two and counting the disagreements is the whole comparison."], check: numberCheck("For how many people does the judges’ verdict differ from the whole committee’s?", 8, 0.5, "To every member that drew a person, that person is a training example a deep tree remembers, so the whole committee tends to get them right. The judges never saw them, and on eight people in the tangled middle the two verdicts part company. The mean number of judges, 8.76, is the mean omitted count seen from the other side of the grid, since every omission is one judge for one person.") },
            ),
            exercise(
              "Bag stumps and watch the bias stay",
              ["Section 25 bags twenty-five stumps, trees allowed one question each, and finds they score 0.72 on the training crowd. Build that committee by handing the bagging frame a stump as its base model, and compare it with one stump and with the deep committee.", "Print the training score of a single stump, of the bagged stumps and of the bagged deep trees, then the out-of-bag scores of the two committees. The stumps’ out-of-bag score is a number the page does not quote, and it is worth looking at beside the deep trees’ 0.64."],
              `from oop_ml import BaggingClassifier, DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

deep = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
# Fit one stump on the whole crowd, and a committee of twenty-five bagged
# stumps under seed 7, then print the three training scores and the two
# out-of-bag scores to two places.`,
              `from oop_ml import BaggingClassifier, DecisionTreeClassifier, Feature

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
print(f"out of bag, stumps {stumps.out_of_bag_score():.2f} against deep trees {deep.out_of_bag_score():.2f}")`,
              `one stump, training score 0.80
bagged stumps, training score 0.72
bagged deep trees, training score 0.96
out of bag, stumps 0.68 against deep trees 0.64`,
              { hints: ["A stump is a decision tree whose max_depth is 1, and a tree constructed that way is a model like any other, so it can be fitted on the crowd by itself.", "The bagging frame takes a base_model, the prototype every member is a copy of. Its default is an unpruned tree, and a stump handed in its place makes every member a stump.", "Both committees are fitted and scored exactly as the deep one was. Nothing about the frame changes when the member does."], check: numberCheck("What out-of-bag score do the bagged stumps report, to two places?", 0.68, 0.005, "Twenty-five stumps cannot draw the second cut the crowd needs, so their training score stays at 0.72 while the deep trees reach 0.96. Out of bag the stumps’ 0.68 sits beside the deep committee’s 0.64, because the extra flexibility the deep trees spent on the tangled middle was spent memorising noise, which a stranger never benefits from. Averaging removed the deep trees’ variance and could not touch the stumps’ bias, and on this crowd the two shortfalls come out close.") },
            ),
          ],
        },
      ]}
    />
  );
}
