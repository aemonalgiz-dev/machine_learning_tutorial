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
import { ImpossibleSeparation } from "@/components/widgets/ImpossibleSeparation";
import { MulticlassPlayground } from "@/components/widgets/MulticlassPlayground";
import { MulticlassVersusMultilabel } from "@/components/widgets/MulticlassVersusMultilabel";
import { RegionsSideBySide } from "@/components/widgets/RegionsSideBySide";
import { RouteComparison } from "@/components/widgets/RouteComparison";
import { RowSumChart } from "@/components/widgets/RowSumChart";
import { ScoreSurfaces } from "@/components/widgets/ScoreSurfaces";
import { SeparationSweep } from "@/components/widgets/SeparationSweep";
import { SoftmaxAssembly } from "@/components/widgets/SoftmaxAssembly";
import { TwoClassCollapse } from "@/components/widgets/TwoClassCollapse";

export const metadata: Metadata = {
  title: "More Than Two Classes · oop_ml",
  description:
    "Compare ways to assign one of several categories, and see how their scores become predictions.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MulticlassClassificationPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["multiclass-classification"]}
      technicalStart="Part 3. Softmax"
      openingTitle="More Than Two Possible Answers"
      playgroundIntro="Choose a point and compare the scores for every class. Check which class wins and whether the displayed probabilities are constrained to add to one."
      title="More Than Two Classes"
      tagline="Compare ways to assign one of several categories, and see how their scores become predictions."
      prerequisites={
        <>
          Both routes are built out of the{" "}
          <Link href="/concepts/logistic-regression" className={linkClass}>
            logistic regression
          </Link>{" "}
          page&rsquo;s model, one fitted once with a wider squash and one fitted
          several times over, and the score each class gets is the{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={linkClass}>
            multiple regression
          </Link>{" "}
          page&rsquo;s dot product.
        </>
      }

      playground={<MulticlassPlayground />}
      sections={[
        {
          title: "Part 1. Define the Type of Classification",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. From two classes to three">
                <p>
                  The logistic page had one observation, one positive class,
                  one negative class, and one estimated probability. The
                  probability of the negative class was one minus that number,
                  because the two outcomes were the only two there were.
                </p>
                <Equation>{"P(class 0 | x) + P(class 1 | x) = 1"}</Equation>
                <p>
                  The crowd in the box above has three colours, children,
                  teenagers and adults. Every person is exactly one of the
                  three, nobody is two at once, and the three cover everyone in
                  the dataset. For one person the model should now say
                  something like
                </p>
                <NumberTable
                  headings={["class", "probability"]}
                  rows={[
                    ["child", "0.10"],
                    ["teenager", "0.75"],
                    ["adult", "0.15"],
                    ["total", "1.00"],
                  ]}
                />
                <p>
                  One unit of probability, divided among mutually exclusive
                  classes. That is what a multiclass probability model
                  produces, and increasing one class&rsquo;s share has to come
                  out of the others.
                </p>
              </SubSection>

              <SubSection title="2. Multiclass versus multilabel classification">
                <p>
                  Now a different question about the same people. Do they
                  enjoy sports, do they enjoy music, do they enjoy reading. A
                  person may enjoy none, one, several or all three, and the
                  three probabilities do not need to total anything, because
                  each answers a separate question.
                </p>
                <MulticlassVersusMultilabel />
                <p>
                  Multiclass classification chooses among alternatives, and
                  its output is one distribution. Multilabel classification
                  answers several independent yes-or-no questions, and its
                  output is several separate probabilities with their own
                  thresholds. The rest of this page is about the first
                  problem. The second appears again in section 24, because one
                  of the two routes to the first problem is built from the
                  tools of the second, and that is where the two get confused.
                </p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Score Per Class",
          content: (
            <>
              <SubSection title="3. One linear score per class">
                <p>
                  Binary logistic regression computed one linear score. With K
                  classes, give every class a score of its own from the same
                  inputs.
                </p>
                <Equation>{"z_k = w_k · x + b_k\n\nz_child = w_child · x + b_child\nz_teen  = w_teen · x + b_teen\nz_adult = w_adult · x + b_adult"}</Equation>
                <p>
                  Each class has its own weights and its own intercept. All
                  three scores are computed from the same height and weight.
                  They are unrestricted numbers, and they are not yet
                  probabilities. What a multiclass linear model does is give
                  every class its own opinion of the same observation, and the
                  rest is deciding what to do with three opinions.
                </p>
                <WorkedExample title="The fitted softmax scores for the three worked people, standardised">
                  <NumberTable
                    headings={["class", "intercept", "weight on height", "weight on weight"]}
                    rows={[
                      ["child", "0", "0", "0"],
                      ["teenager", "3.960", "3.403", "3.403"],
                      ["adult", "−0.792", "7.296", "7.296"],
                    ]}
                    caption="The child row is all zeros because softmax holds one class as a reference, which section 26 explains. Both weights match because the three people lie on a line."
                  />
                </WorkedExample>
              </SubSection>

              <SubSection title="4. Class scores and decision regions">
                <p>
                  With two input features each class score is a flat plane
                  over the feature plane, and the predicted class at any point
                  is whichever plane is highest there.
                </p>
                <ScoreSurfaces />
                <p>
                  Two classes tie where their planes cross, and two planes
                  cross along a straight line.
                </p>
                <Equation>{"z_j = z_k\n(w_j − w_k) · x + (b_j − b_k) = 0"}</Equation>
                <p>
                  So the boundary between any two classes is linear, and the
                  map on the right is feature space divided by which class has
                  the largest score. Everything in the next two Parts is about
                  what to do with the three heights of the planes at a point,
                  and none of it moves the boundaries the argmax already drew.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Softmax",
          content: (
            <>
              <SubSection title="5. What softmax must produce">
                <p>
                  Three unrestricted scores need to become probabilities that
                  stay between zero and one, sum to one, keep whichever score
                  was largest as the largest probability, rise when their own
                  score rises, and fall when another class&rsquo;s score
                  rises. Those are the requirements. Softmax is the function
                  that meets them, and it is easier to trust once the
                  requirements are on the table first.
                </p>
              </SubSection>

              <SubSection title="6. Building softmax">
                <p>
                  For each class, take the score, exponentiate it so the result
                  is positive, add up all the exponentiated scores, and divide
                  each one by that shared total.
                </p>
                <Equation>{"P(y = k | x) = e^(z_k) / Σⱼ e^(z_j)"}</Equation>
                <SoftmaxAssembly />
                <p>
                  Every probability is one class&rsquo;s exponentiated score as
                  a share of the total across all of them. That shared
                  denominator is the whole design.
                </p>
              </SubSection>

              <SubSection title="7. A complete softmax calculation">
                <WorkedExample title="Scores (1, 2, 0)">
                  <NumberTable
                    headings={["class", "z", "e^z", "÷ 11.107", "probability"]}
                    rows={[
                      ["1", "1", "2.718", "2.718 / 11.107", "0.245"],
                      ["2", "2", "7.389", "7.389 / 11.107", "0.665"],
                      ["3", "0", "1.000", "1.000 / 11.107", "0.090"],
                      ["total", "", "11.107", "", "1.000"],
                    ]}
                  />
                </WorkedExample>
                <p>
                  Class 2 had the largest score and has the largest
                  probability. Class 3 had the smallest and has the smallest.
                  Softmax preserves the ordering of the scores and turns their
                  gaps into relative shares, and the fitted middle person in
                  section 16 is the same arithmetic on less tidy numbers.
                </p>
              </SubSection>

              <SubSection title="8. How the classes compete">
                <p>
                  In the assembly line above, hold two scores where they are
                  and raise the third. Its probability rises, both of the
                  others fall, and the total stays at one. Nothing was done to
                  the other two scores. Their probabilities fell because the
                  shared total grew, and that is what competition means here.
                  Every class&rsquo;s probability is divided by the same
                  denominator, so no class can gain without the others losing.
                </p>
              </SubSection>

              <SubSection title="9. Why only score differences matter">
                <p>Add the same constant c to every score.</p>
                <Equation>{"softmax(z₁ + c, z₂ + c, z₃ + c) = softmax(z₁, z₂, z₃)"}</Equation>
                <p>
                  The shift slider in section 6 does exactly this, and the
                  probabilities do not move, because e^(z + c) is e^z times
                  e^c and the e^c cancels top and bottom. Softmax reads the
                  differences between scores. The absolute level is invisible
                  to it, and only relative evidence matters, which is the fact
                  section 26 turns into a design decision.
                </p>
              </SubSection>

              <SubSection title="10. Numerically stable softmax">
                <>
                  <p>
                    Exponentiating a score of one thousand overflows an ordinary
                    floating-point number. A direct softmax calculation can then try to
                    divide infinity by infinity. Subtracting the largest score before
                    exponentiation preserves all the probabilities.
                  </p>
                  <Equation>{"largest shifted score = largest score − largest score = 0\nlargest exponential = e⁰ = 1"}</Equation>
                  <p>
                    Every other exponential is at most one. Section 9 explains why this
                    common shift leaves softmax unchanged.
                  </p>
                </>
                <Equation>{"softmax(z)_k = e^(z_k − m) / Σⱼ e^(z_j − m)          m = max(z)"}</Equation>
                <WorkedExample title="Scores (1000, 1001, 999)">
                  <NumberTable
                    headings={["", "class 1", "class 2", "class 3"]}
                    rows={[
                      ["direct e^z", "overflow", "overflow", "overflow"],
                      ["z − 1001", "−1", "0", "−2"],
                      ["e^(z − 1001)", "0.368", "1.000", "0.135"],
                      ["probability", "0.245", "0.665", "0.090"],
                    ]}
                    caption="The same three probabilities as section 7, because (1000, 1001, 999) and (1, 2, 0) have the same differences. Press the button in section 6 to watch the direct route fail."
                  />
                </WorkedExample>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "Asking whether each person enjoys sports, whether they enjoy music and whether they enjoy reading is a multiclass problem, because there are three answers.",
              false,
              "Those are three independent yes-or-no questions, and a person may enjoy none, one, several or all three. There is no one unit of probability for them to be shares of, so the three outputs need not total anything. Multiclass classification chooses among mutually exclusive alternatives and produces one distribution.",
            ),
            choice(
              "With two input features, each class score is a flat plane over the feature plane. What is the boundary between two of the classes?",
              [
                "A straight line, where the two planes cross",
                "A curve, because the scores are exponentiated before they are compared",
                "A region rather than a boundary, since three planes meet",
                "Whatever shape softmax gives it, which depends on the fitted weights",
              ],
              0,
              "Two classes tie where their scores are equal, which rearranges to a linear equation in the inputs. Two planes cross along a straight line. Softmax comes later and does not move the boundaries the largest score already drew.",
            ),
            trueFalse(
              "Adding the same constant to all three scores leaves every softmax probability unchanged.",
              true,
              "Exponentiating a shifted score gives the original exponential times a shared factor, and that factor cancels between the top and the bottom. Softmax reads only the differences between scores. That is also what makes subtracting the largest score a safe repair when an exponential would otherwise overflow.",
            ),
            several(
              "Which of these are requirements that softmax was chosen to meet?",
              [
                "The probabilities stay between zero and one and sum to one",
                "Whichever score was largest keeps the largest probability",
                "A class’s probability falls when another class’s score rises",
                "A class’s probability depends only on its own score",
              ],
              [0, 1, 2],
              "A probability that depended only on its own score is exactly what softmax refuses. Every class is divided by the same total, so raising one score lowers the others without anything being done to their scores. That shared denominator is the whole design, and it is what competition means here.",
            ),
            choice(
              "Scores of (1, 2, 0) give softmax probabilities of 0.245, 0.665 and 0.090. What does the stable calculation return for scores of (1000, 1001, 999)?",
              [
                "The same 0.245, 0.665 and 0.090, because the two sets of scores have the same differences",
                "Close to 0, 1 and 0, because scores that large leave the middle class certain",
                "Nothing usable, because every exponential overflows whichever route is taken",
                "One third each, because scores that close together are indistinguishable at that size",
              ],
              0,
              "Subtracting the largest score, 1001, leaves −1, 0 and −2, whose exponentials are 0.368, 1.000 and 0.135, and those divide out to the same three probabilities. Only the direct route overflows. The size of the scores is invisible to softmax, so a gap of one counts for the same at a thousand as it does at one.",
            ),
        ],
        },
        {
          title: "Part 4. One-vs-Rest",
          content: (
            <>
              <SubSection title="11. Constructing one-vs-rest problems">
                <p>
                  The other route builds nothing new. It takes the one
                  multiclass label column and expands it into three binary
                  columns.
                </p>
                <NumberTable
                  headings={["person", "label", "child?", "teenager?", "adult?"]}
                  rows={[
                    ["120 cm, 25 kg", "child", "1", "0", "0"],
                    ["150 cm, 50 kg", "teenager", "0", "1", "0"],
                    ["180 cm, 75 kg", "adult", "0", "0", "1"],
                  ]}
                />
                <p>
                  Each column is a binary problem of its own. The child
                  classifier sees one child and two others, the teenager
                  classifier one teenager and two others, and so on. A
                  balanced three-class crowd becomes three unbalanced binary
                  ones, and every class&rsquo;s negative group is different.
                </p>
              </SubSection>

              <SubSection title="12. Fitting the binary models independently">
                <p>
                  Each column gets the logistic page&rsquo;s model, fitted on
                  its own.
                </p>
                <Equation>{"q_k = σ(w_k · x + b_k)"}</Equation>
                <p>
                  Fitted separately. Each compares one class with a different
                  combined rest. No shared denominator connects the three
                  outputs, and no classifier knows what the other two assigned.
                  That independence is the whole of the route, and it is what
                  the next section&rsquo;s totals reveal.
                </p>
              </SubSection>

              <SubSection title="13. Why their outputs need not sum to one">
                <NumberTable
                  headings={["three one-vs-rest outputs", "total"]}
                  rows={[
                    ["(0.8, 0.7, 0.1)", "1.6"],
                    ["(0.2, 0.2, 0.1)", "0.5"],
                    ["(0.7, 0.2, 0.1)", "1.0"],
                  ]}
                  caption="Each number answers a different binary question. No equation forces their sum to one, and a total of one can happen by accident without meaning anything."
                />
                <p>
                  The chart below is every person&rsquo;s row total under both
                  routes on the worked people. Softmax is a flat line at one.
                  One-vs-rest is not a line at all.
                </p>
                <RowSumChart />
                <p>
                  Independent class-versus-rest estimates do not form one
                  multiclass distribution, and dividing them by their total to
                  make them sum to one does not make them one either. It
                  rescales three answers to three different questions, and
                  the result is calibrated to nothing.
                </p>
              </SubSection>

              <SubSection title="14. Producing a multiclass decision">
                <p>
                  One-vs-rest still has to name one class, and the usual rule
                  is to take the largest binary output.
                </p>
                <Equation>{"predicted class = argmaxₖ q_k"}</Equation>
                <p>
                  That produces one class even though the three outputs were
                  fitted with no reference to each other. Two cautions come
                  with it. The largest output need not be a fair comparison,
                  since three separately fitted models can be calibrated
                  differently, and a 0.4 from one classifier is not
                  necessarily more evidence than a 0.35 from another. And the
                  ranking can differ from softmax&rsquo;s. Both routes produce
                  one predicted class, and they arrive at the comparison
                  differently.
                </p>
                <RouteComparison />
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Work the Three-Person Example",
          content: (
            <>
              <SubSection title="15. Standardising the three-person example">
                <p>
                  The three worked people are the child at 120 cm and 25 kg,
                  the teenager at 150 and 50, and the adult at 180 and 75. The
                  features are standardised before either route fits, and the
                  standardised values are worth seeing.
                </p>
                <NumberTable
                  headings={["person", "height", "weight", "standardised height", "standardised weight"]}
                  rows={[
                    ["child", "120", "25", "−1.2247", "−1.2247"],
                    ["teenager", "150", "50", "0", "0"],
                    ["adult", "180", "75", "1.2247", "1.2247"],
                  ]}
                />
                <p>
                  The middle person becomes zero in both features, so their
                  score under every class is that class&rsquo;s intercept and
                  nothing else. Standardisation changed the numbers, not who
                  anybody is, and it is the reason the arithmetic in the next
                  two sections is clean enough to do by hand. The widget in
                  section 14 shows the raw and standardised coordinates side
                  by side for whichever person is picked.
                </p>
              </SubSection>

              <SubSection title="16. The middle person under softmax">
                <WorkedExample>
                  <NumberTable
                    headings={["class", "z, the intercept", "e^z", "÷ 53.92", "probability"]}
                    rows={[
                      ["child", "0.0000", "1.00", "1.00 / 53.92", "0.0185"],
                      ["teenager", "3.9602", "52.47", "52.47 / 53.92", "0.9731"],
                      ["adult", "−0.7918", "0.45", "0.45 / 53.92", "0.0084"],
                      ["total", "", "53.92", "", "1.0000"],
                    ]}
                  />
                </WorkedExample>
                <p>
                  A distribution dominated by the teenager class, with
                  the child given more than the adult because the child
                  intercept, pinned at zero, sits above the adult&rsquo;s
                  −0.79. Pick the teenager in section 14 and the left column
                  is this table, to the digit.
                </p>
              </SubSection>

              <SubSection title="17. The middle person under one-vs-rest">
                <WorkedExample>
                  <NumberTable
                    headings={["classifier", "output q"]}
                    rows={[
                      ["child versus the rest", "0.0101"],
                      ["teenager versus the rest", "0.3333"],
                      ["adult versus the rest", "0.0101"],
                      ["total", "0.3535"],
                    ]}
                    caption="The two people at the ends each total 1.3293. One person's answers add to about a third and another's to about four thirds, from the same three fits."
                  />
                </WorkedExample>
                <p>
                  The total is unconstrained, the largest output still belongs
                  to the teenager classifier, and both routes call this person
                  a teenager. The numbers do not carry the same meaning.
                  Softmax&rsquo;s 0.9731 is a share of one unit. One-vs-rest&rsquo;s
                  0.3333 is one classifier&rsquo;s answer to one question, and
                  the next Part is why that answer is exactly a third.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Why the Middle One-vs-Rest Model Returns One-Third",
          content: (
            <>
              <SubSection title="18. Why the teenager classifier returns one-third">
                <p>
                  The teenager-versus-rest classifier has to call the middle
                  person yes and both ends no, and the three people lie on one
                  line. A linear boundary splits that line into a left and a
                  right, so wherever it goes, the middle shares a side with one
                  of the ends.
                </p>
                <ImpossibleSeparation />
                <>
                  <p>
                    The model cannot isolate the middle person with a single straight
                    boundary. In this symmetric example, its optimum ignores the feature
                    and predicts the same probability for everyone. One of the three
                    outcomes is yes.
                  </p>
                  <Equation>{"constant probability q = 1/3\nintercept = ln(q / (1 − q))\n          = ln((1/3) / (2/3))\n          = ln(1/2) ≈ −0.6931"}</Equation>
                  <p>
                    The fit reaches that probability and intercept after 49 passes.
                  </p>
                </>
                <WhyThisWorks title="Why a third">
                  <DerivationTable
                    rows={[
                      { expression: "L(q) = q (1 − q)²", reason: "one yes given q, two nos given 1 − q" },
                      { expression: "ln L = ln q + 2 ln(1 − q)", reason: "logarithm" },
                      { expression: "1/q − 2/(1 − q) = 0", reason: "set the derivative to zero" },
                      { expression: "1 − q = 2q,  so q = 1/3", reason: "the observed positive rate" },
                      { expression: "b = ln( (1/3) / (2/3) ) = ln(1/2) ≈ −0.6931", reason: "the intercept whose sigmoid is a third" },
                    ]}
                  />
                </WhyThisWorks>
                <KeepInMind>
                  <p>
                    This is a fact about these three people, not about
                    one-vs-rest. The zero slope comes from the exact symmetry
                    of the three positions, which leaves no direction in which
                    the feature helps at all. A different sample, even a
                    slightly asymmetric one, gives the fit a nonzero slope
                    however weak the relationship, and one-vs-rest does not in
                    general switch off features it cannot use well. A score of
                    exactly one third among three classes is worth recognising
                    as a base rate. It is not a general property of an
                    imperfect classifier.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            trueFalse(
              "Under one-vs-rest every class’s binary problem has a different negative group, and a balanced three-class crowd becomes three unbalanced binary problems.",
              true,
              "The child classifier sees one child and two others, the teenager classifier one teenager and two others, and so on. Each fit therefore compares one class with a different combined rest, which is the first reason the three outputs have no shared total to add up to.",
            ),
            trueFalse(
              "Dividing the three one-vs-rest outputs by their total turns them into a multiclass distribution.",
              false,
              "It rescales three answers to three different questions, each fitted against a different combined rest, and the result is calibrated to nothing. Forcing numbers to sum to one is not the same as their being one distribution.",
            ),
            choice(
              "The middle person’s one-vs-rest outputs total 0.3535, and each person at the ends totals 1.3293. What does that show?",
              [
                "The three outputs answer separate questions, so nothing constrains the row total",
                "One of the three fits failed and should be refitted",
                "The three people are an unbalanced sample and the classifiers need reweighting",
                "The teenager classifier is miscalibrated and the other two are fine",
              ],
              0,
              "No shared denominator connects the three fits, and no classifier knows what the other two assigned. From the same three fits one person’s answers add to about a third and another’s to about four thirds. Nothing failed and nothing needs reweighting, since there is one person of each class. Softmax on the same people is a flat line at one by construction.",
            ),
            choice(
              "Why does the teenager-versus-rest classifier answer exactly one third for everybody?",
              [
                "The three people lie on one line, so no straight boundary isolates the middle one, and the optimum ignores the feature and predicts the base rate",
                "A sigmoid cannot return more than a third when two of the three labels are negative",
                "One third is what any imperfect binary classifier settles on",
                "The fit was stopped after 49 passes, before it could do better",
              ],
              0,
              "A linear boundary splits the line into a left and a right, so the middle person always shares a side with one of the ends. With the feature of no help the best constant is the share of yes answers, one in three, whose intercept is about −0.6931. The 49 passes are how long it took to reach that optimum, not a cap it ran into.",
            ),
            several(
              "The middle person gets 0.9731 from softmax and 0.3333 from the teenager-versus-rest classifier. Which of these hold?",
              [
                "Both routes call this person a teenager",
                "The 0.9731 is a share of one unit of probability divided among the three classes",
                "The 0.3333 is the same kind of number as the 0.9731, only smaller",
                "The middle person’s three one-vs-rest outputs total one",
              ],
              [0, 1],
              "The largest one-vs-rest output still belongs to the teenager classifier, at 0.3333 against 0.0101 from each of the other two, so the call is the same. The numbers do not carry the same meaning. The 0.3333 is one classifier’s answer to one yes-or-no question, and the three answers total 0.3535 rather than one.",
            ),
        ],
        },
        {
          title: "Part 7. Comparing the Routes",
          content: (
            <>
              <SubSection title="19. Same accuracy, different models">
                <p>
                  On the crowd both routes score an accuracy of 1.000. What
                  that establishes is that both chose the correct largest class
                  for every training person. What it does not establish is
                  that their probabilities are equally good, that their
                  decision regions are the same, that their calibration is
                  equal, that they would agree on new people, or that either
                  optimisation converged.
                </p>
                <RegionsSideBySide />
                <p>
                  The two maps disagree on 88 of the 676 cells, and the probe
                  finds points where the numbers differ a great deal even when
                  the call is the same. Equal training accuracy hides
                  substantial differences between two classifiers, and it
                  hides them exactly where new observations arrive, between
                  the training points.
                </p>
              </SubSection>

              <SubSection title="20. Multiclass log loss">
                <p>
                  For softmax the loss for one observation is minus the log of
                  the probability given to the correct class, and the whole
                  loss is the mean of that.
                </p>
                <Equation>{"lossᵢ = −ln P(yᵢ | xᵢ)          loss = −(1/n) Σᵢ ln P(yᵢ | xᵢ)"}</Equation>
                <WorkedExample title="On the three worked people">
                  <NumberTable
                    headings={["route", "probability or output for each person's own class", "loss"]}
                    rows={[
                      ["softmax", "0.9876, 0.9731, 0.9917", "0.016, the mean of −ln of those"],
                      ["one-vs-rest", "0.996, 0.3333, 0.996", "0.215, the mean binary log loss across the three fits"],
                    ]}
                  />
                </WorkedExample>
                <p>
                  The softmax figure is three terms, one per person, because
                  each person contributes only the probability given to their
                  own class.
                </p>
                <Equation>{"−ln 0.9876 ≈ 0.0125\n−ln 0.9731 ≈ 0.0273\n−ln 0.9917 ≈ 0.0083\n\nloss = (0.0125 + 0.0273 + 0.0083) / 3 ≈ 0.016"}</Equation>
                <p>
                  The one-vs-rest figure is nine terms, because each of the
                  three classifiers answers for all three people. A classifier
                  is charged −ln q for a person it should have said yes to and
                  −ln(1 − q) for a person it should have said no to.
                </p>
                <NumberTable
                  headings={["classifier", "child", "teenager", "adult", "mean of the three"]}
                  rows={[
                    ["child versus the rest", "0.0040", "0.0101", "0.0000", "0.0047"],
                    ["teenager versus the rest", "0.4055", "1.0986", "0.4055", "0.6365"],
                    ["adult versus the rest", "0.0000", "0.0101", "0.0040", "0.0047"],
                    ["mean across the three fits", "", "", "", "0.2153"],
                  ]}
                  caption="Each cell is what one classifier is charged for one person. The teenager classifier answers a third to everyone, which costs −ln(1/3) on the teenager and −ln(2/3) on each of the other two."
                />
                <p>
                  Nearly all of the 0.215 is the teenager classifier. The
                  other two fits are charged 0.0047 each, because each of them
                  can separate its one person from the other two and does.
                </p>
                <p>
                  The two losses are different objectives and the numbers
                  should not be compared as if one probability model were
                  being scored twice. Softmax is fitted to the multiclass loss.
                  One-vs-rest is fitted to three binary losses independently,
                  and its figure is the average of those. What both show is
                  that accuracy checks only the winning class, while log loss
                  looks at how the probability was distributed, and on the
                  middle person the third the teenager classifier answered is
                  a poor probability for a right answer.
                </p>
              </SubSection>

              <SubSection title="21. Normalization versus calibration">
                <p>
                  Softmax outputs are a distribution. They can still be
                  overconfident or underconfident, and summing to one says
                  nothing about whether a 0.97 turns out to be right 97
                  percent of the time. One-vs-rest outputs may each be
                  reasonably calibrated as binary probabilities and remain
                  incoherent as a multiclass distribution, since three
                  classifiers can all be right that their class is unlikely.
                  Summing to one is necessary for a multiclass probability
                  distribution and is not sufficient for a trustworthy one.
                  Judging calibration takes data the model never saw, and
                  belongs to the{" "}
                  <Link href="/concepts/judging-a-classifier" className={linkClass}>
                    judging page
                  </Link>
                  .
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. When to Use Each Method",
          content: (
            <>
              <SubSection title="22. When softmax fits the question">
                <p>
                  Softmax is the natural choice when exactly one class is
                  correct, the classes form one shared set of alternatives, a
                  coherent distribution is required, and the classes should be
                  trained against each other. One species among several. One
                  digit from zero to nine. One way of getting to work from a
                  fixed list, which was McFadden&rsquo;s problem.
                </p>
              </SubSection>

              <SubSection title="23. When one-vs-rest is useful">
                <p>
                  One-vs-rest is useful when a strong binary classifier is
                  already to hand, when classes can be trained separately or
                  in parallel, when new classes may need adding without
                  refitting the rest, or when only a ranking or a final call
                  is needed and jointly normalised probabilities are not. Its
                  cost depends on the solver and the base model and is not
                  automatically lower than one softmax fit. Its scores may need
                  calibrating before they can be compared. And its performance
                  has to be measured rather than assumed, which is section 19.
                </p>
              </SubSection>

              <SubSection title="24. Multilabel classification as a separate problem">
                <p>
                  Independent sigmoid outputs are the natural model when
                  several labels can be correct at once, which is section
                  2&rsquo;s second panel.
                </p>
                <Equation>{"P(y_k = 1 | x) = σ(w_k · x + b_k)"}</Equation>
                <p>
                  Each label gets its own threshold, several can be on at
                  once, and the outputs need not sum to one because there is no
                  one thing they are shares of. That is a multilabel problem
                  and one-vs-rest&rsquo;s machinery fits it naturally, which is
                  a different statement from saying one-vs-rest is the right
                  multiclass method whenever examples might have several
                  labels. If they might, the problem was multilabel all along.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Deriving Softmax",
          content: (
            <>
              <SubSection title="25. Two-class softmax and the sigmoid">
                <p>
                  Write out softmax for two classes and divide the top and the
                  bottom by e^(z₀).
                </p>
                <DerivationTable
                  rows={[
                    { expression: "P(class 0) = e^(z₀) / (e^(z₀) + e^(z₁))", reason: "two-class softmax" },
                    { expression: "= 1 / (1 + e^(z₁ − z₀))", reason: "divide through by e^(z₀)" },
                    { expression: "= σ(z₀ − z₁)", reason: "the logistic page's sigmoid, of the difference" },
                  ]}
                />
                <TwoClassCollapse />
                <p>
                  Only the difference between the two scores matters, so
                  binary logistic regression needs one score and not two, and
                  multiclass softmax is the same competition extended to more
                  classes. Two-class softmax and binary logistic regression are
                  one relationship in two parameterisations.
                </p>
              </SubSection>

              <SubSection title="26. Softmax identifiability">
                <p>
                  Section 9 showed that adding a constant to every score
                  changes nothing. Turned around, that means many different
                  parameter sets produce the same probabilities, and a fit
                  looking for the best parameters has infinitely many equally
                  good answers. The probabilities are identified. The raw
                  parameters are not.
                </p>
                <p>
                  The usual repairs are to pick one reference class and fix its
                  coefficients at zero, to constrain the class parameters to
                  sum to zero, or to add a penalty that prefers one finite
                  parameterisation among the equals. The fit on this page takes
                  the first. That is why the child row of section 3&rsquo;s table is
                  all zeros, and why pinning it there loses nothing. It is a
                  choice about naming, not about the model.
                </p>
              </SubSection>

              <SubSection title="27. The softmax gradient">
                <p>
                  For a one-hot target y with a one in the observed class and a
                  predicted probability vector p, the derivative of one
                  observation&rsquo;s loss with respect to each class&rsquo;s
                  score is the gap.
                </p>
                <Equation>{"∂lossᵢ/∂zᵢₖ = pᵢₖ − yᵢₖ\n∂loss/∂w_k = Σᵢ (pᵢₖ − yᵢₖ) xᵢ"}</Equation>
                <WorkedExample title="The middle person at the fitted softmax">
                  <NumberTable
                    headings={["class", "target y", "predicted p", "p − y"]}
                    rows={[
                      ["child", "0", "0.0185", "+0.0185"],
                      ["teenager", "1", "0.9731", "−0.0269"],
                      ["adult", "0", "0.0084", "+0.0084"],
                    ]}
                    caption="The three gaps sum to zero, as they must for a distribution against a one-hot target. Each is that class's share of this person's push on the fit."
                  />
                </WorkedExample>
                <p>
                  This is the logistic page&rsquo;s gradient with one more
                  index. An observed indicator, minus the predicted
                  probability, weighted by the inputs. Softmax fitting adjusts
                  every class&rsquo;s score by the gap between what it
                  predicted for that class and whether the class was the
                  observed one.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. Separation and Convergence",
          content: (
            <>
              <SubSection title="28. Multiclass separation">
                <p>
                  The three worked people are perfectly separated, and the
                  logistic page&rsquo;s separation problem arrives with them.
                  The dashboard below is the softmax ascent recorded pass by
                  pass.
                </p>
                <SeparationSweep />
                <p>
                  Accuracy is perfect from pass 2. The size of the coefficients
                  is 2.3 at pass 10, 7.1 at pass 100 and 11.4 at pass 500, and
                  it is still growing. The loss is 0.43, then 0.08, then 0.016,
                  still falling. The probability each person&rsquo;s own class
                  receives climbs toward one and never arrives, and the run
                  is reported as not converged, because no finite set of
                  coefficients reaches the maximum. Perfect multiclass
                  classification and an unbounded likelihood problem sit
                  together comfortably.
                </p>
                <p>
                  One-vs-rest on the same people is a mixture. The teenager
                  classifier converged in 49 passes, at the third from section
                  18, because it could not separate anything. The child and
                  adult classifiers each see one person separable from two and
                  ran out of passes with their coefficients still growing. A
                  one-vs-rest model can contain convergent and nonconvergent
                  binary fits at once, which the panel on the right reports
                  one fit at a time.
                </p>
              </SubSection>

              <SubSection title="29. Regularizing the fit">
                <p>
                  The repair is the{" "}
                  <Link href="/concepts/ridge-lasso" className={linkClass}>
                    ridge page
                  </Link>
                  &rsquo;s, for both routes. Penalise the size of the
                  coefficients and extreme scores carry a cost, so the ascent
                  settles at a finite point with probabilities short of zero
                  and one. Regularised softmax has a finite maximum on
                  separated data, and so does each regularised binary fit.
                </p>
                <InAModel>
                  <p>
                    Neither multiclass model here carries a penalty yet, so
                    the four-way comparison of regularised and
                    unregularised fits under both routes is not built here.
                    What is built is the pass cap and the honest verdict per
                    fit, which is the minimum a separated fit should report.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 to 10",
          quiz: [
            trueFalse(
              "Both routes score an accuracy of 1.000 on the crowd, so their decision regions agree.",
              false,
              "Equal training accuracy establishes only that both chose the correct largest class for every training person. The two maps disagree on 88 of the 676 cells, and they disagree between the training points, which is exactly where new observations arrive.",
            ),
            choice(
              "Softmax reports a loss of 0.016 on the three worked people and one-vs-rest reports 0.215. What follows?",
              [
                "Little, because the two figures are different objectives",
                "Softmax is roughly thirteen times the better probability model",
                "One-vs-rest is underfitted and needs more passes",
                "The comparison is fair, since both numbers are log losses",
              ],
              0,
              "Softmax is fitted to the multiclass loss, three terms that average to 0.016. One-vs-rest is fitted to three binary losses independently, nine terms in all, and nearly all of its 0.215 is the teenager classifier’s 0.6365. The numbers should not be compared as if one probability model were being scored twice.",
            ),
            several(
              "Which of these hold for the fits on the three worked people?",
              [
                "Under softmax, accuracy is perfect from pass 2",
                "The size of the softmax coefficients is still growing at pass 500",
                "The softmax run is reported as not converged",
                "The teenager-versus-rest fit converged while the child and adult fits ran out of passes",
              ],
              [0, 1, 2, 3],
              "All four hold. The coefficient size is 2.3 at pass 10, 7.1 at pass 100 and 11.4 at pass 500, and on perfectly separated data no finite set of coefficients reaches the maximum, so the softmax run is honestly reported as not converged while classifying every person correctly. One-vs-rest is a mixture. The teenager classifier settled in 49 passes because it could separate nothing, and the other two each see one person separable from two.",
            ),
            choice(
              "Why is the child row of the fitted coefficient table all zeros?",
              [
                "Adding a constant to every score changes nothing, so one class is pinned to pick a single parameterisation",
                "The child class carries no information, and its weights fitted to zero on their own",
                "Softmax pins whichever class is smallest",
                "The child class was dropped before fitting and is recovered from the other two",
              ],
              0,
              "Because a shared shift leaves the probabilities alone, many different parameter sets produce the same answers and the fit has infinitely many equally good ones. The probabilities are identified and the raw parameters are not. Fixing one reference class at zero is one of the usual repairs, and it is a choice about naming rather than about the model.",
            ),
            trueFalse(
              "Softmax outputs can sum to one and still be overconfident, so a 0.97 from the model need not turn out to be right 97 percent of the time.",
              true,
              "Summing to one is necessary for a multiclass probability distribution and is not sufficient for a trustworthy one. The sum is guaranteed by the shared denominator whatever the scores are, so it says nothing about whether the scores were right. Judging that takes data the model never saw.",
            ),
        ],
        },
        {
          title: "Part 11. Type and Interface Design",
          content: (
            <SubSection title="30. Encoding output guarantees in types">
              <p>
                Everything above comes down to two guarantees a model can
                make about a table of class scores, and the two are kept
                apart by the kind of answer a fit returns rather than by
                prose.
              </p>
              <NumberTable
                headings={["guarantee", "what a caller may assume", "returned by"]}
                rows={[
                  ["normalised distribution", "every value in [0, 1], every row sums to one, one joint distribution over exclusive classes", "softmax"],
                  ["independent class scores", "every value in [0, 1], rows need not sum to one, no joint distribution", "one-vs-rest"],
                ]}
              />
              <p>
                The stronger guarantee is what expected-cost calculations over
                the classes need, and sampling one class, and multiclass log
                loss, and reporting a probability breakdown, and entropy. The
                weaker one is enough for ranking the classes, taking the top
                one, or retrieving the top few. Thresholding depends on what
                the threshold is meant to mean, and does not automatically need
                a normalised distribution.
              </p>
              <p>
                That distinction found a real bug. The one-vs-rest
                specification said in prose that its rows deliberately do not
                sum to one, and went on returning the type that promises they
                do. The prose was right and unenforced, which is the state a
                type exists to replace. Now a caller who needs a distribution
                and is handed independent scores finds out when the types
                disagree, and not when a downstream sum comes out at 1.33.
              </p>
            </SubSection>
          ),
        },
        {
          title: "Practice. Fitting Both Routes to the Three People",
          practice: [
            exercise(
              "Share one unit of probability among the three people",
              ["Fit the softmax route to the three worked people of Part 5 and print the three probabilities it gives each of them, with the row total. The heights and weights are standardised first, as they are on the page, and the walk is given the same 500 passes.", "Part 5 gives the middle person 0.0185, 0.9731 and 0.0084. The fit should reproduce that row, every total should be one, and the name of the type that comes back says which of Part 11’s two guarantees it carries."],
              `from oop_ml import Feature, MultinomialLogisticRegression, Standardizer

heights = Feature("height", [120, 150, 180])
weights = Feature("weight", [25, 50, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
names = ["child", "teenager", "adult"]

standardised = Standardizer().fit([heights, weights]).transform([heights, weights])
model = MultinomialLogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6)
# Fit the model to the standardised columns and the labels, then ask it for
# the probabilities of the same three people. Print the name of the type that
# comes back, each person's three probabilities with their total, the
# teenager class's intercept, and the middle person's teenager probability.`,
              `from oop_ml import Feature, MultinomialLogisticRegression, Standardizer

heights = Feature("height", [120, 150, 180])
weights = Feature("weight", [25, 50, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
names = ["child", "teenager", "adult"]

standardised = Standardizer().fit([heights, weights]).transform([heights, weights])
model = MultinomialLogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6)
model.fit(standardised, labels)

probabilities = model.predict_probabilities(standardised)
print(type(probabilities).__name__)
for name, row in zip(names, probabilities.values):
    shares = ", ".join(f"{share:.4f}" for share in row)
    print(f"{name}: {shares}  total {sum(row):.4f}")

print(f"teenager class intercept {model.intercepts[1]:.4f}")
print(f"middle person, teenager probability {probabilities.values[1][1]:.4f}")`,
              `ProbabilityMatrix
child: 0.9876, 0.0124, 0.0000  total 1.0000
teenager: 0.0185, 0.9731, 0.0084  total 1.0000
adult: 0.0000, 0.0083, 0.9917  total 1.0000
teenager class intercept 3.9602
middle person, teenager probability 0.9731`,
              { hints: ["fit takes the list of standardised features and the label feature. predict_probabilities takes the same list of features and answers one row per person and one column per class.", "What comes back is an object rather than a bare array. Its values property is the table, so values[1] is the middle person’s row and values[1][1] is that person’s teenager probability.", "The intercepts are on the fitted model as intercepts, one per class in label order, so the teenager’s is intercepts[1]."], check: numberCheck("What probability does the fit give the middle person for the teenager class, to four places?", 0.9731, 0.0005, "The middle person standardises to zero in both features, so each class’s score is its intercept alone. Those are 0, 3.9602 and −0.7918, and the teenager’s exponential, 52.47, divided by the shared total of 53.92 is 0.9731. It is a share of one unit, which is why the row beside it totals one.") },
            ),
            exercise(
              "Three separate fits, and what their answers add up to",
              ["Fit the one-vs-rest route to the same three people, with a LogisticRegression given the same 500 passes as the binary model. Print each person’s three outputs with the row total, and then how many passes each of the three binary fits ran and whether it converged.", "Part 5 puts the middle person’s total at 0.3535 and each end at 1.3293, and Part 10 says the three fits do not finish alike. Both should show here, along with a type whose name promises less than the softmax route’s did."],
              `from oop_ml import Feature, LogisticRegression, OneVsRestClassifier, Standardizer

heights = Feature("height", [120, 150, 180])
weights = Feature("weight", [25, 50, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
names = ["child", "teenager", "adult"]

standardised = Standardizer().fit([heights, weights]).transform([heights, weights])
binary = LogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6)
# Build a OneVsRestClassifier around the binary model and fit it. Print the
# name of the type predict_probabilities answers with, each person's three
# outputs with their total, each binary fit's passes and whether it
# converged, and the middle person's total.`,
              `from oop_ml import Feature, LogisticRegression, OneVsRestClassifier, Standardizer

heights = Feature("height", [120, 150, 180])
weights = Feature("weight", [25, 50, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
names = ["child", "teenager", "adult"]

standardised = Standardizer().fit([heights, weights]).transform([heights, weights])
binary = LogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6)
model = OneVsRestClassifier(binary_model=binary).fit(standardised, labels)

scores = model.predict_probabilities(standardised)
print(type(scores).__name__)
for name, row in zip(names, scores.values):
    outputs = ", ".join(f"{output:.4f}" for output in row)
    print(f"{name}: {outputs}  total {sum(row):.4f}")

for class_index, name in enumerate(names):
    fit = model.model_for(class_index)
    print(f"{name} versus the rest: {fit.epochs_run} passes, converged {fit.converged}")

print(f"middle person total {sum(scores.values[1]):.4f}")`,
              `ClassScores
child: 0.9960, 0.3333, 0.0000  total 1.3293
teenager: 0.0101, 0.3333, 0.0101  total 0.3535
adult: 0.0000, 0.3333, 0.9960  total 1.3293
child versus the rest: 500 passes, converged False
teenager versus the rest: 49 passes, converged True
adult versus the rest: 500 passes, converged False
middle person total 0.3535`,
              { hints: ["The wrapper takes its binary model at construction, as binary_model, and copies it once per class when it fits. Nothing else changes from the softmax problem.", "model_for takes a class index and answers that class’s own fitted LogisticRegression, which carries epochs_run and converged like any other fit of that model.", "The row total is the plain sum of a row of values. Nothing in the library computes it for you, because nothing in this route promises what it will be."], check: numberCheck("What do the middle person’s three one-vs-rest outputs total, to four places?", 0.3535, 0.0005, "The teenager classifier cannot isolate the middle of three people on a line, so it answers its base rate of a third. The child and adult classifiers each answer 0.0101 for somebody who is not theirs. The total is 0.3333 and two lots of 0.0101, and no equation was ever going to make it one.") },
            ),
            exercise(
              "Give the separated fit ten times the passes",
              ["Part 10 says the softmax coefficients on the three people are still growing at pass 500, where their size is 11.4. Fit the same model twice, once with 500 passes and once with 5000, and print for each whether it converged, the size of its coefficients and the probability the middle person gets for the teenager class.", "The size the page quotes is the square root of the sum of the squared weights on height and weight across the three classes, leaving the intercepts out. If the likelihood had a maximum, ten times the passes would find it and stop."],
              `from oop_ml import Feature, MultinomialLogisticRegression, Standardizer

heights = Feature("height", [120, 150, 180])
weights = Feature("weight", [25, 50, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
standardised = Standardizer().fit([heights, weights]).transform([heights, weights])

for passes in [500, 5000]:
    model = MultinomialLogisticRegression(learning_rate=1.0, max_epochs=passes, tolerance=1e-6)
    model.fit(standardised, labels)
    # Add up the squared height and weight coefficients of every class, take
    # the square root, and print it beside model.converged and the middle
    # person's teenager probability.

# Print the size after 5000 passes on a line of its own, to four places.`,
              `from oop_ml import Feature, MultinomialLogisticRegression, Standardizer

heights = Feature("height", [120, 150, 180])
weights = Feature("weight", [25, 50, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
standardised = Standardizer().fit([heights, weights]).transform([heights, weights])

for passes in [500, 5000]:
    model = MultinomialLogisticRegression(learning_rate=1.0, max_epochs=passes, tolerance=1e-6)
    model.fit(standardised, labels)

    squares = 0.0
    for class_index in range(model.n_classes):
        coefficients = model.coefficients_for(class_index)
        squares += coefficients["height"] ** 2 + coefficients["weight"] ** 2
    size = squares**0.5

    teenager = model.predict_probabilities(standardised).values[1][1]
    print(f"{passes} passes: converged {model.converged}, size {size:.4f}, teenager {teenager:.4f}")

print(f"size after 5000 passes {size:.4f}")`,
              `500 passes: converged False, size 11.3855, teenager 0.9731
5000 passes: converged False, size 17.4473, teenager 0.9974
size after 5000 passes 17.4473`,
              { hints: ["coefficients_for takes a class index and answers that class’s weights, addressable by feature name, so coefficients[\"height\"] is one number.", "The reference class’s weights are all zero, so including it in the sum changes nothing and saves a special case.", "converged is a property of the fitted model. It reports whether the walk stopped because nothing moved further than the tolerance, which is a different thing from the walk running out of passes."], check: numberCheck("What is the size of the coefficients after 5000 passes, to four places?", 17.4473, 0.0005, "Ten times the passes moved the size from 11.3855 to 17.4473 and the middle person’s probability from 0.9731 to 0.9974, and the walk still reports that it did not converge. The three people are perfectly separated, so every larger set of coefficients scores a little better and there is no finite best to arrive at.") },
            ),
            exercise(
              "Move the middle person off centre",
              ["Part 6 warns that the third is a fact about three evenly spaced people. Keep everyone on the same line but move the teenager to 144 cm and 45 kg, which is closer to the child, and fit the one-vs-rest route again. Print the teenager classifier’s intercept and its weight on height, whether it converged, and its output for each of the three people.", "With the symmetry gone the weight should no longer be zero. Look at which person the teenager classifier now scores highest, and at what its three outputs add up to."],
              `from oop_ml import Feature, LogisticRegression, OneVsRestClassifier, Standardizer

heights = Feature("height", [120, 144, 180])
weights = Feature("weight", [25, 45, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
names = ["child", "teenager", "adult"]

standardised = Standardizer().fit([heights, weights]).transform([heights, weights])
binary = LogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6)
model = OneVsRestClassifier(binary_model=binary).fit(standardised, labels)

# Take the teenager's own binary fit out of the wrapper. Print its intercept,
# its weight on height, its passes and whether it converged, then its output
# for each person, the total of the three, and its output for the child.`,
              `from oop_ml import Feature, LogisticRegression, OneVsRestClassifier, Standardizer

heights = Feature("height", [120, 144, 180])
weights = Feature("weight", [25, 45, 75])
labels = Feature("age_group", [0.0, 1.0, 2.0])
names = ["child", "teenager", "adult"]

standardised = Standardizer().fit([heights, weights]).transform([heights, weights])
binary = LogisticRegression(learning_rate=1.0, max_epochs=500, tolerance=1e-6)
model = OneVsRestClassifier(binary_model=binary).fit(standardised, labels)

teenager_fit = model.model_for(1)
print(f"intercept {teenager_fit.intercept:.4f}")
print(f"weight on height {teenager_fit.coefficients['height']:.4f}")
print(f"{teenager_fit.epochs_run} passes, converged {teenager_fit.converged}")

outputs = [row[1] for row in model.predict_probabilities(standardised).values]
for name, output in zip(names, outputs):
    print(f"teenager classifier on the {name}: {output:.4f}")
print(f"total of the three {sum(outputs):.4f}")
print(f"output for the child {outputs[0]:.4f}")`,
              `intercept -0.7036
weight on height -0.1239
50 passes, converged True
teenager classifier on the child: 0.3960
teenager classifier on the teenager: 0.3400
teenager classifier on the adult: 0.2640
total of the three 1.0000
output for the child 0.3960`,
              { hints: ["model_for(1) is the teenager’s binary fit. Its intercept is a property and its coefficients are addressable by feature name.", "The teenager classifier’s outputs are the middle column of the table predict_probabilities answers, so take entry 1 of every row.", "A fitted intercept makes the average output equal the share of yes answers, here one in three, whatever the weights do. That fixes the total of three outputs and says nothing about how they are spread."], check: numberCheck("What does the teenager classifier answer for the child, to four places?", 0.396, 0.0005, "The weight on height comes out at −0.1239 where the symmetric three gave zero, so the output now falls as height rises and the classifier gives its highest answer, 0.3960, to the child. It still cannot isolate the middle of a line. The three outputs keep a total of one, because the intercept holds their average at the base rate of a third, but they are no longer the same number.") },
            ),
          ],
        },
      ]}
    />
  );
}
