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
    "One score per class, then two ways to turn the scores into an answer. Softmax shares one unit of probability out, and one-vs-rest asks each class its own question and owes the others nothing.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MulticlassClassificationPage() {
  return (
    <ConceptPage
      title="More Than Two Classes"
      tagline="One score per class, and two ways of turning the scores into an answer."
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
      history={
        <>
          <p>
            The dataset everybody learns on has three classes, and it is worth
            knowing where it came from. Edgar Anderson, a botanist, measured
            the sepals and petals of three species of iris on the Gaspé
            Peninsula in Quebec, fifty plants of each, and Ronald Fisher used
            his measurements in the 1936 paper &ldquo;The use of multiple
            measurements in taxonomic problems&rdquo; to ask whether one
            weighted sum of the four lengths could tell the species apart. It
            could for two of the three, and the remaining pair overlap however
            the sum is weighted. Fisher&rsquo;s method was a discriminant
            rather than a probability model, and for decades the standard
            move with more than two classes was to reduce the problem rather
            than solve it, fit one yes-or-no model per class and let them
            argue. That reduction is what this page calls one-vs-rest, and it
            is still competitive. Ryan Rifkin and Aldebaro Klautau published
            &ldquo;In Defense of One-Vs-All Classification&rdquo; in 2004, and
            their whole argument was that the simple reduction, done
            carefully, matches the more elaborate schemes proposed to replace
            it. What it cannot do is hand back one unit of probability shared
            among the classes, since three separately fitted models have no
            reason to sum to one, and that is the difficulty this page&rsquo;s
            children, teenagers and adults raise.
          </p>
          <p>
            The route that does sum to one came from economics. Daniel
            McFadden, at Berkeley in the early 1970s, was forecasting how
            commuters in the San Francisco Bay Area would choose between car,
            bus and a rail system that had not yet opened, and he needed a
            model in which the alternatives competed for one traveller&rsquo;s
            decision, so that making the bus more attractive necessarily took
            share from the car. His conditional logit, published in 1974,
            gives each alternative a score and turns the scores into shares
            by exponentiating each and dividing by the total, which is exactly
            the squash on this page, and the work won him the Nobel prize in
            economics in 2000. When neural networks needed the same
            competition among their output units, John Bridle, working on
            speech recognition at the Royal Signals and Radar Establishment in
            Malvern, described it in a 1989 paper and gave it the name
            everyone now uses, the softmax, because it is a smoothed version
            of picking the largest score. The two routes fit the same kind of
            score per class and differ in whether the scores are made to
            argue afterwards or made to compete from the start, and this page
            fits both to the same crowd so we can see where they part.
          </p>
        </>
      }
      playground={<MulticlassPlayground />}
      sections={[
        {
          title: "Part 1. Define the Type of Classification",
          defaultOpen: true,
          content: (
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
          ),
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
                <p>
                  Exponentiating a score of a thousand overflows a floating
                  point number, so a direct calculation divides infinity by
                  infinity. Section 9 is the way out. Subtract the largest
                  score from every score first, which changes no probability,
                  and the largest exponent becomes e⁰ = 1 with every other one
                  smaller.
                </p>
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
                <p>
                  Unable to use the feature, the fit sets its slope to zero and
                  falls back to one constant probability for everyone, and the
                  constant it chooses is the one that makes the three outcomes
                  most likely. One yes in three people makes that q = 1/3, and
                  the intercept that produces it is ln(1/2) = −0.6931. Both
                  numbers are in the fit itself, which converged in 49
                  passes by discovering it should ignore its inputs.
                </p>
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
      ]}
    />
  );
}
