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
  title: "More Than Two Classes · Perceptron Lab",
  description:
    "Some predictions have several possible categories. Comparing a score for each category requires a consistent decision rule and a clear distinction between scores and probabilities.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MulticlassClassificationPage() {
  return (
    <ConceptPage
      lessonId="multiclass-classification"
      intuition={lessonIntuitions["multiclass-classification"]}
      technicalStart="Part 3. Softmax"
      openingTitle="More Than Two Possible Answers"
      playgroundTitle="Make the class scores compete for probability"
      playgroundIntro="Choose a point and compare the scores for every class. Check which class wins and whether the displayed probabilities are constrained to add to one."
      title="More Than Two Classes"
      tagline={"Some predictions have several possible categories. Comparing a score for each category requires a consistent decision rule and a clear distinction between scores and probabilities."}
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
                  Logistic regression gave each observation a probability for one of two possible outcomes. Once we knew that probability, the remaining probability belonged to the other outcome. How should we arrange the answer when there are more than two classes?
                </p>
                <Equation>{"P(class 0 | x) + P(class 1 | x) = 1"}</Equation>
                <p>

                  The crowd in the box above has three colors, children,
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
                <p>For mutually exclusive and exhaustive classes, the probabilities share a total of one. Giving more probability to one class leaves less for the others. That shared constraint is useful when the required answer is exactly one category.</p>
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
                <p>A multiclass prediction chooses one category from a set of alternatives. A multilabel prediction can assign several labels to the same observation. Separate binary outputs can answer those label questions without requiring their probabilities to sum to one. The labels themselves may still be related. Section 24 returns to that distinction after we compare approaches to the single-category problem.</p>
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
                <p>Each class has its own weights and intercept, applied to the same height and weight. These produce three scores indicating how the linear model ranks the possible classes for this observation. A score can have any real value. We need another operation before treating those values as probabilities.</p>
                <WorkedExample title="Fitted softmax scores for three standardized input profiles">
                  <NumberTable
                    headings={["class", "intercept", "weight on height", "weight on weight"]}
                    rows={[
                      ["child", "0", "0", "0"],
                      ["teenager", "3.960", "3.403", "3.403"],
                      ["adult", "−0.792", "7.296", "7.296"],
                    ]}
                    caption="This implementation fixes the child class as its reference. The two standardized inputs are identical on these three profiles; the symmetric fitting procedure gives matching weights, rather than identifying separate height and weight effects."
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
                <p>For a fixed set of linear class scores, a nondegenerate pairwise tie lies on a straight line. Only portions where those classes also beat the others form actual decision boundaries. Softmax preserves the score ordering. Fitting separate one-vs-rest classifiers can produce different scores and therefore different boundaries.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Softmax",
          content: (
            <>
              <SubSection title="5. What softmax must produce">
                <p>We want the outputs to be positive, sum to one and preserve the ordering of the class scores. Increasing one score while holding the others fixed should increase its share. Softmax provides one way to obtain these properties. They motivate the construction, but do not uniquely determine it.</p>
              </SubSection>

              <SubSection title="6. Building softmax">
                <p>
                  For each class, take the score, exponentiate it so the result
                  is positive, add up all the exponentiated scores, and divide
                  each one by that shared total.
                </p>
                <Equation>{"P(y = k | x) = e^(z_k) / Σⱼ e^(z_j)"}</Equation>
                <SoftmaxAssembly />
                <p>Dividing by the shared total makes each output a proportion of the same quantity. This is why the probabilities sum to one and why increasing one score affects the other probabilities too.</p>
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
                  Hold two scores fixed and raise the third in the display above. Its probability rises while the others fall, even though their scores haven&apos;t changed. The denominator is shared: increasing one exponential also increases the total used to normalize every class. The probabilities must still add to one.
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
              "These are separate binary labels: one person can enjoy several activities at once. Their probabilities do not have to sum to one, and the activities may be statistically related. A multiclass task instead assigns one mutually exclusive class per observation. Softmax is one way to represent a distribution over those classes.",
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
              "Each exponentiated score is divided by the sum across all classes. Raising another class's score increases that common denominator, reducing this class's probability when its own score is fixed. The probabilities are therefore coupled rather than calculated from each score in isolation.",
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
              "Subtract the largest score before exponentiating:\n\n```math\n(1000, 1001, 999) − 1001 = (−1, 0, −2)\nexp(scores) ≈ (0.368, 1.000, 0.135)\n```\n\nNormalizing those exponentials gives the same probabilities as for scores (1, 2, 0). The shared shift cancels in the ratio and avoids the large positive exponentials that would overflow.",
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
                <p>Each binary model is fitted separately against its own combined rest category. No shared normalization forces their outputs to add to one. The totals in the next display show the practical consequence of that separate fitting.</p>
              </SubSection>

              <SubSection title="13. Why their outputs need not sum to one">
                <NumberTable
                  headings={["three one-vs-rest outputs", "total"]}
                  rows={[
                    ["(0.8, 0.7, 0.1)", "1.6"],
                    ["(0.2, 0.2, 0.1)", "0.5"],
                    ["(0.7, 0.2, 0.1)", "1.0"],
                  ]}
                  caption="Each number answers a different binary question. A total of one is possible, but that alone does not establish coherent or calibrated multiclass probabilities."
                />
                <p>
                  The chart below is every person&rsquo;s row total under both
                  routes on the worked people. Softmax is a flat line at one.
                  One-vs-rest is not a line at all.
                </p>
                <RowSumChart />
                <p>Dividing the binary estimates by their total does produce non-negative values that sum to one, provided that total is positive. It does not establish that the values are calibrated multiclass probabilities. The binary models were fitted to separate objectives; a final rescaling cannot by itself verify their agreement with observed class frequencies.</p>
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
              <SubSection title="15. Standardizing the three-person example" id="15-standardising-the-three-person-example">
                <p>

                  The three worked people are the child at 120 cm and 25 kg,
                  the teenager at 150 and 50, and the adult at 180 and 75. The
                  features are standardized before either route fits, and the
                  standardized values are worth seeing.
                </p>
                <NumberTable
                  headings={["person", "height", "weight", "standardized height", "standardized weight"]}
                  rows={[
                    ["child", "120", "25", "−1.2247", "−1.2247"],
                    ["teenager", "150", "50", "0", "0"],
                    ["adult", "180", "75", "1.2247", "1.2247"],
                  ]}
                />
                <p>

                  The middle person becomes zero in both features, so their
                  score under every class is that class&rsquo;s intercept and
                  nothing else. Standardization changed the numbers, not who
                  anybody is, and it is the reason the arithmetic in the next
                  two sections is clean enough to do by hand. The widget in
                  section 14 shows the raw and standardized coordinates side
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
                  <p>The constant prediction follows from the symmetry of these three labeled positions. Here a linear score cannot improve the likelihood by favoring either end. Changing the arrangement or labels can produce a nonzero slope, but asymmetry alone does not guarantee one. The one-third value is the positive-class base rate in this example, rather than a general output of one-vs-rest.</p>
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
              "Dividing these positive one-vs-rest outputs by their total guarantees calibrated probabilities for the mutually exclusive classes.",
              false,
              "Normalization makes nonnegative outputs sum to one when their total is positive, so it does form a numerical distribution. It does not make the separately fitted binary models a jointly trained softmax model or guarantee calibration. Some implementations use this normalization; evaluate the resulting probabilities with an appropriate common scoring rule and held-out data.",
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
              "Each binary classifier has its own objective, so the wrapper does not impose a shared row total. The three outputs for the middle person sum to 0.3535, while the endpoint totals are 1.3293. Those totals alone do not diagnose a failed fit or a need for reweighting. The softmax outputs sum to one by their shared formula, which is a separate property from calibration or convergence.",
            ),
            choice(
              "For the symmetric three-person example, why does the teenager-versus-rest classifier give everyone approximately one third?",
              [
                "The three people lie on one line, so no straight boundary isolates the middle one, and the optimum ignores the feature and predicts the base rate",
                "A sigmoid cannot return more than a third when two of the three labels are negative",
                "One third is what any imperfect binary classifier settles on",
                "The fit was stopped after 49 passes, before it could do better",
              ],
              0,
              "The teenager lies at the centered midpoint, with the two negative examples placed symmetrically on either side. A nonzero linear slope raises the score at one negative endpoint while lowering it at the other, so the logistic-loss optimum has zero slope and predicts the positive base rate. Moving the teenager away from the midpoint changes that symmetry and can produce nonconstant scores, as the later exercise shows, but a straight boundary still cannot isolate the middle point.",
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
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "class | z, the intercept | e^z | ÷ 53.92 | probability\nchild | 0.0000 | 1.00 | 1.00 / 53.92 | 0.0185\nteenager | 3.9602 | 52.47 | 52.47 / 53.92 | 0.9731\nadult | −0.7918 | 0.45 | 0.45 / 53.92 | 0.0084\ntotal |  | 53.92 |  | 1.0000\n\nclassifier | output q\nchild versus the rest | 0.0101\nteenager versus the rest | 0.3333\nadult versus the rest | 0.0101\ntotal | 0.3535"
              },
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
                  optimization converged.
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
                <p>A softmax model is trained to assign high probability to the supplied correct class. Its loss for one observation is the negative logarithm of that probability. Confidently assigning little probability to the correct class is heavily penalized. Average the observation losses to obtain the training objective.</p>
                <Equation>{"lossᵢ = −ln P(yᵢ | xᵢ)          loss = −(1/n) Σᵢ ln P(yᵢ | xᵢ)"}</Equation>
                <WorkedExample title="Compare cross-entropy for the same three people">
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
                <p>These are different loss functions: softmax contributes one correct-class term per observation, while the one-vs-rest figure averages three binary objectives. Do not compare their numerical sizes as though the same objective were evaluated twice. Both depend on more than the winning label. The teenager’s low binary probability incurs a substantial loss even though it is the largest output for that person.</p>
              </SubSection>

              <SubSection title="21. Normalization versus calibration">
                <p>Softmax outputs sum to one, but that does not establish calibration: observations assigned probability 0.97 need not be correct 97 percent of the time. Separately fitted binary estimates do not enforce a shared row total. Even acceptable calibration summaries for the individual binary models do not impose that pointwise constraint. Check calibration on excluded observations, as the <Link href="/concepts/judging-a-classifier" className={linkClass}>classifier evaluation page</Link>{" "}explains.</p>
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
                <p>One-vs-rest can reuse a suitable binary classifier and fit the class problems separately or in parallel. It can be useful when the final decision or ranking matters more than a jointly normalized distribution. Adding classes changes what belongs to each existing classifier’s rest category, so those models may need refitting too. Compare accuracy, calibration and computational cost for the actual task.</p>
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
                  one relationship in two parameterizations.
                </p>
              </SubSection>

              <SubSection title="26. Softmax identifiability">
                <p>Adding the same value to every class score leaves the probabilities unchanged. Different coefficient sets can therefore represent the same predictions. We need a convention that removes this redundancy if we want a unique parameter description.</p>
                <p>One option is to select a reference class and fix its coefficients to zero. Another constrains the class parameters to sum to zero. This implementation uses the reference-class option, explaining the all-zero child row. It removes the shared-score redundancy without changing the probability distributions the unpenalized model can represent. A coefficient penalty can also select among some equivalent parameterizations, depending on which parameters it penalizes.</p>
              </SubSection>

              <SubSection title="27. The softmax gradient">
                <p>A one-hot target places one in the observed class position and zero in the other positions. For one observation, differentiating the negative log probability gives predicted probability minus that indicator. The second line below sums those contributions over observations. For the mean loss defined earlier, divide that summed gradient by the observation count.</p>
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
                <p>The negative-log-loss gradient uses predicted probability minus the observed indicator, multiplied by the input. Subtracting that gradient increases the observed class score relative to the others. Maximizing log likelihood uses the opposite sign, observed indicator minus predicted probability.</p>
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
                <p>Training accuracy is perfect from pass two. Coefficient magnitude grows from 2.3 at pass ten to 7.1 at pass one hundred and 11.4 at pass five hundred. Loss falls from 0.43 to 0.08 to 0.016. On these separated observations, the likelihood approaches its upper bound as some parameters grow without bound; no finite parameter vector attains that bound. The run is reported as not converged.</p>
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
                <p>A positive squared-coefficient penalty can give separated-data fits a finite optimum when all classes are represented and the necessary parameters are penalized or identified. It adds a cost to increasing score magnitudes indefinitely. The <Link href="/concepts/ridge-lasso" className={linkClass}>ridge page</Link>{" "}explains the penalty. Reaching that optimum still depends on the solver and stopping criteria.</p>
                <InAModel>
                  <p>The two multiclass implementations here do not include a regularization penalty. Their diagnostics report the iteration cap and stopping reason. As in binary logistic regression, a stopped run on separable data should not be reported as a finite optimum without supporting convergence evidence.</p>
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
              "An accuracy of 1.000 tells us both routes classify the observed training people correctly. It does not determine their predictions between or beyond those observations. Different decision boundaries can therefore have identical training accuracy.",
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
              {
                "description": "Softmax loss: one multiclass negative log-probability for each of 3 people, averaged.\nOne-vs-rest loss: 3 separate binary losses for each of those 3 people, averaged over 9 terms.\nThe reported 0.016 and 0.215 are these different training objectives, rather than both models scored with one common evaluation rule."
              },
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
              "Training accuracy can reach one before the probability objective stops improving. On these separable observations, growing softmax coefficients keep increasing the correct-class probabilities without reaching a finite unregularized likelihood maximum. The budget ends with converged=False. The symmetric teenager-versus-rest fit has a finite constant-probability optimum and meets its stopping criterion in 49 passes; the separable endpoint classifiers exhaust their budgets.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Three separable training people:\nSoftmax training accuracy becomes 1.000 at pass 2.\nSoftmax coefficient length: pass 10 = 2.3; pass 100 = 7.1; pass 500 = 11.4.\nSoftmax result after pass 500: converged = false.\n\nOne-vs-rest result:\nteenager fit converges at pass 49; child and adult fits exhaust the pass budget."
              },
            ),
            choice(
              "Why is the child row of the fitted coefficient table all zeros?",
              [
                "Adding a constant to every score changes nothing, so one class is pinned to pick a single parameterization",
                "The child class carries no information, and its weights fitted to zero on their own",
                "Softmax pins whichever class is smallest",
                "The child class was dropped before fitting and is recovered from the other two",
              ],
              0,
              "Adding the same affine score function to every class leaves every softmax probability unchanged, since its exponential factor cancels. Coefficients therefore have a shared redundancy. This implementation fixes the child reference class's coefficients and intercept to zero, selecting one parameterization without changing the possible class probabilities.",
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
              <p>A score table can support ranking without supporting probability calculations. The returned type distinguishes those guarantees so a caller can tell which operations the output permits.</p>
              <NumberTable
                headings={["guarantee", "what a caller may assume", "returned by"]}
                rows={[
                  ["normalized distribution", "every value in [0, 1], every row sums to one, one joint distribution over exclusive classes", "softmax"],
                  ["independent class scores", "every value in [0, 1], rows need not sum to one, no joint distribution", "one-vs-rest"],
                ]}
              />
              <p>Expected costs, entropy and sampling a class require a probability distribution over the alternatives. Selecting the highest-scoring class only requires comparable scores. A threshold needs interpretation too: a probability threshold makes a stronger claim than an arbitrary score cutoff.</p>
              <p>The return contract should reflect the actual guarantee. Giving one-vs-rest outputs a normalized-distribution type would promise a property those rows need not satisfy. Distinct score and distribution types let callers check that requirement before using operations such as entropy or sampling a class.</p>
            </SubSection>
          ),
        },
        {
          title: "Practice. Fitting Both Routes to the Three People",
          practice: [
            exercise(
              "Share one unit of probability among the three people",
              [
  "Standardize the supplied three people’s height/weight features, then fit the stated softmax model for at most five hundred passes.",
  "Print result type, every class-probability row and row total, the teenager intercept and its probability for the middle person. Preserve class order child, teenager, adult."
],
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
              { hints: [
  "Inspect the result’s probability matrix rather than independent binary outputs.",
  "The middle person has centered feature values, so intercepts explain its relative class scores."
], check: numberCheck("What probability does the fit give the middle person for the teenager class, to four places?", 0.9731, 0.0005, "The middle person’s teenager probability is 0.9731. Softmax normalizes all class scores together, making this entry part of a row summing to one."), question: "How does softmax divide one unit of probability among three classes?" },
            ),
            exercise(
              "Three separate fits, and what their answers add up to",
              [
  "Fit the supplied one-vs-rest model to the same standardized three people using five-hundred-pass binary LogisticRegression settings.",
  "Print result type, each person’s three scores and their total, plus passes and convergence status for each binary fit. Keep the independent outputs without renormalizing them."
],
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
              { hints: [
  "Each binary fit asks whether its class beats the rest; the fits do not share a softmax denominator.",
  "Read each classifier’s own training status, not only the wrapper’s returned score table."
], check: numberCheck("What do the middle person’s three one-vs-rest outputs total, to four places?", 0.3535, 0.0005, "The three independent outputs total 0.3535 for the middle person. Their separate binary objectives impose no per-person sum-to-one condition."), question: "Do three independent binary probabilities form a probability distribution over classes?" },
            ),
            exercise(
              "Give the separated fit ten times the passes",
              [
  "Fit the same unregularized softmax model with maximum passes five hundred and five thousand.",
  "For each print convergence status, the norm of feature coefficients excluding intercepts, and the middle person’s teenager probability. A larger iteration limit is an observation to compare, not proof of convergence."
],
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
              { hints: [
  "Keep the data and all other settings fixed.",
  "Compare probability improvement with continued coefficient growth. Perfect separation can make a finite maximum-likelihood optimum unavailable."
], check: numberCheck("What is the size of the coefficients after 5000 passes, to four places?", 17.4473, 0.0005, "The feature-coefficient norm reaches 17.4473 without convergence. On separated data, further unregularized likelihood improvement can accompany growing coefficients."), question: "Will more iterations produce a finite optimum on perfectly separated classes?" },
            ),
            exercise(
              "Move the middle person off centre",
              [
  "Move the supplied teenager to height 144 cm and weight 45 kg while retaining the three people on their line. Refit the stated one-vs-rest model.",
  "Inspect the teenager classifier: print intercept, height coefficient, pass/convergence status and its output for each person, followed by their total and the child’s output."
],
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
              { hints: [
  "This comparison changes geometric symmetry without giving the linear classifier a curved decision region.",
  "Compare which person receives the highest teenager score, rather than interpreting a nonzero fitted weight as successful isolation."
], check: numberCheck("What does the teenager classifier answer for the child, to four places?", 0.396, 0.0005, "The teenager classifier gives the child 0.3960, its largest output here. Breaking the symmetry changes its coefficients without giving a straight boundary the ability to isolate the middle point."), question: "Can a one-vs-rest straight boundary isolate the middle of three collinear people?" },
            ),
          ],
        },
      ]}
    />
  );
}
