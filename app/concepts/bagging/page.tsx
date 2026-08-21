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
    "One deep tree changes when its sample changes. Resample the data many times, grow a tree on each, and aggregate, so the part of the variation the trees do not share averages away.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function BaggingPage() {
  return (
    <ConceptPage
      title="Bagging"
      tagline="Grow many deep trees, each on its own resample of the data, and aggregate what they say."
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
      history={
        <>
          <p>
            Leo Breiman returned to Berkeley in 1980 after thirteen years as
            a consultant, and the trees he had helped build in that time had
            a defect he was still describing in 1996, in a paper titled
            &ldquo;Heuristics of instability and stabilization in model
            selection&rdquo;. A deep tree is unstable. Change a handful of the
            people it trains on and its first question can change, and with
            it every question below, so two trees grown on nearly the same
            data can disagree about whole regions of the plane, which is
            where the trees page ended, on a deep tree changing its mind when
            one person in its crowd changed. The tool that made instability
            usable came from Bradley Efron at Stanford, whose 1979 paper
            introduced the bootstrap, drawing new samples from the one sample
            we have, with replacement, as a stand-in for the fresh samples
            from the population that we do not have. Breiman&rsquo;s idea, in
            a 1994 technical report published as &ldquo;Bagging
            Predictors&rdquo; in 1996, was that if small changes in the data
            produce meaningfully different trees, then many bootstrap
            resamples produce a whole committee of different trees, and the
            part of what they say that they do not share can be averaged
            away.
          </p>
          <p>
            He tested it on the benchmark sets of the day and reported that
            it helped where he expected, with trees, and did close to nothing
            for a nearest-neighbour rule, which barely changes when a few of
            its rows are resampled. That is worth carrying through the page,
            since it is easy to read bagging as a general improvement and it
            is an improvement for unstable methods only. The name is a
            contraction of bootstrap aggregating, and the two halves of it
            are the two halves of this page. Breiman also noticed, in a
            technical report the same year, that each resample leaves about a
            third of the people out and those people give every tree a free
            test set, which is the out-of-bag score this page builds and the
            random forests page takes as evidence. The difficulty he faced
            runs under the whole method. The ideal is averaging over many
            independent samples of the population, and there is only ever
            the one sample, so the resamples are a substitute whose members
            all draw from the same people, and whatever error those people
            induce in every tree survives the vote.
          </p>
        </>
      }
      playground={<CommitteePlayground kind="bagging" />}
      sections={[
        {
          title: "Part 1. The Instability of One Tree",
          defaultOpen: true,
          content: (
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
          ),
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
                  and eight people not in it at all.
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
                  gallery in section 9 sizes each person by how many times a
                  member drew them, which is the sample as the tree saw it.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Why About a Third Are Omitted",
          content: (
            <>
              <SubSection title="7. Why approximately 36.8 percent are omitted">
                <p>
                  Take one person in a crowd of n. On any single draw they are
                  picked with probability 1/n and missed with probability 1 −
                  1/n. The draws are independent, because the picked person
                  is put back each time, so the chance of being missed by all
                  n draws is that probability multiplied out.
                </p>
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

              <SubSection title="8. Expected distinct observations">
                <Equation>{"expected omitted  = n (1 − 1/n)ⁿ = 25 × 0.360 ≈ 9.0\nexpected distinct = 25 − 9.0 ≈ 16.0"}</Equation>
                <p>
                  A bootstrap sample of twenty-five typically holds around
                  sixteen distinct people and omits around nine. Across the
                  twenty-five members of the committee the actual omitted
                  counts run from 7 to 12, and the histogram in section 9
                  shows them scattered around the expected 9. A person who
                  appears twice still counts once as distinct.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Building the Bagged Ensemble",
          content: (
            <>
              <SubSection title="9. One bootstrap sample, one tree">
                <p>
                  For each member, draw a bootstrap sample, grow one ordinary
                  deep tree on it, and keep the tree. Repeat for the next
                  member with a fresh sample. The tree-growing algorithm is
                  the trees page&rsquo;s, unchanged. All of the diversity comes
                  from the samples.
                </p>
                <BootstrapGallery />
              </SubSection>

              <SubSection title="10. Different samples, different trees">
                <p>
                  Slide through the members. Their root questions differ, in
                  feature and in threshold, their depths run from three to
                  five, and their maps carve the tangled middle differently.
                  Twenty of the twenty-five root on height and five on weight,
                  and seven of the twenty-five ask the very same first
                  question, height below 147.5. Bootstrap variation makes
                  different trees learn different questions and regions, and
                  section 27 is about how different they manage to be.
                </p>
              </SubSection>

              <SubSection title="11. Aggregating classification votes">
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
                  the one this library uses, which matters for ties.
                </p>
              </SubSection>

              <SubSection title="12. Averaging regression predictions">
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
                    other deterministic rule, or reports the tie. This library
                    averages the members&rsquo; probability matrices and takes
                    the largest, with the earlier class winning an exact tie.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Watching the Committee Form",
          content: (
            <>
              <SubSection title="13. Watching the committee form">
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

              <SubSection title="14. Vote strength versus predicted class">
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
                  Out-of-bag evaluation reuses the training data efficiently,
                  and it obeys the same rules as every other evaluation. It
                  stops being untouched evidence when hyperparameters are
                  chosen by it repeatedly, since it is then part of the
                  selection and no longer a judge of it. It leaks when features
                  were selected or preprocessing was fitted on the whole crowd,
                  because the judges then know something about the person from
                  a step upstream of the bootstrap. It misleads when the
                  observations are dependent, ordered in time, or grouped, so
                  that ordinary resampling breaks a structure the data has.
                  And it is unstable when the committee is too small to cover
                  everyone well.
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
                  from different samples. The scrubber in section 13 shows the
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
                  Read the changed-cells readout in section 13 as the members
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
                  section 9 shows where the floor comes from. Twenty of the
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
                It helps most when the base learner is sensitive to its
                training data, can reach low bias, and produces meaningfully
                different fits from different resamples, which is a
                description of a deep tree and of little else on this site. A
                learner that is already stable, a straight line say, gives
                nearly the same fit on every resample, and a committee of
                nearly identical members gains nothing from the vote. Bagging
                is a general method whose canonical case is the one that made
                it worth inventing.
              </p>
            </SubSection>
          ),
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
                  A rare class is absent from a bootstrap sample about
                  eighty-seven percent of the time when it has two people in
                  thirty, and a member that inferred its own class count from
                  its sample either refused the gap or handed back a
                  probability matrix one column short. The committee now
                  tells every member how many classes exist before it fits.
                  And handing every member the committee&rsquo;s one seed made
                  every member draw the same feature restriction at every
                  node, which reproduced plain bagging exactly while looking
                  like a forest. Each member&rsquo;s seed is offset by its
                  position now, and a test reads which feature each member
                  rooted on.
                </p>
              </WhyThisWorks>
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
      ]}
    />
  );
}
