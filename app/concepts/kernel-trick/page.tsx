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
import { AbsorbedInterceptTable } from "@/components/widgets/AbsorbedInterceptTable";
import { ClinicGramMatrix } from "@/components/widgets/ClinicGramMatrix";
import { GammaSweepChart } from "@/components/widgets/GammaSweepChart";
import { KernelIdentityCheck } from "@/components/widgets/KernelIdentityCheck";
import { KernelLiftPlayground } from "@/components/widgets/KernelLiftPlayground";
import { KernelPlayground } from "@/components/widgets/KernelPlayground";
import { KernelSimilarityChart } from "@/components/widgets/KernelSimilarityChart";
import { MarginView } from "@/components/widgets/MarginView";
import { SupportVectorRefit } from "@/components/widgets/SupportVectorRefit";

export const metadata: Metadata = {
  title: "The Kernel Trick · oop_ml",
  description:
    "Swap the dot product for a function that computes it in a much larger space, and a straight-line classifier draws curved boundaries without ever building that space.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelTrickPage() {
  return (
    <ConceptPage
      title="The Kernel Trick"
      tagline="Draw a straight boundary in a space you never build, and watch it curve in the one you can see."
      prerequisites={
        <>
          The{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s dot product carries this whole page, and{" "}
          <Link href="/concepts/multiple-polynomial-regression" className={link}>
            multiple and polynomial regression
          </Link>
          &rsquo;s manufactured features are the thing it makes unnecessary.
          The{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic regression page
          </Link>{" "}
          drew the first straight boundary between two classes, and this page
          asks which straight boundary, and then what to do when none will
          serve.
        </>
      }
      history={
        <>
          <p>
            In the early 1960s Frank Rosenblatt&rsquo;s perceptron could learn
            to separate two classes only when a straight boundary existed
            between them, and most of the problems people wanted solved, the
            handwritten characters and the spoken sounds, were not like that.
            Mark Aizerman, Emmanuil Braverman and Lev Rozonoer, working in
            Moscow on pattern recognition, published &ldquo;Theoretical
            foundations of the potential function method in pattern
            recognition learning&rdquo; in 1964. Their idea was to place a
            potential around each training example, a function high near the
            example and falling away from it, and to classify a new point by
            summing the potentials that reached it. They noticed that the
            procedure never needed the coordinates of a point, only a function
            of two points, and that such a function could stand in for an
            inner product in a space of far more dimensions than the one the
            data was measured in. The observation was correct and it sat
            largely unused for nearly thirty years.
          </p>
          <p>
            In the same years Vladimir Vapnik and Alexey Chervonenkis, also in
            Moscow, were working on a different question. Given a straight
            boundary that separates the training data, which one should be
            chosen, and what could be said about how it would fare on data not
            yet seen? Their answer was the boundary leaving the widest empty
            corridor between the classes, and a theory of when a boundary
            learned from a sample would hold on the population it was drawn
            from. The difficulty they could
            not get around was the same one Rosenblatt had faced, that the
            theory only covered straight boundaries, and adding columns by
            hand to let a straight boundary bend soon produced more columns
            than could be stored. In 1992, at AT&amp;T Bell Laboratories,
            Bernhard Boser, Isabelle Guyon and Vapnik published &ldquo;A
            training algorithm for optimal margin classifiers&rdquo; and
            joined the two ideas. Written in its dual form the widest-corridor
            problem touches its data only through inner products, so
            Aizerman&rsquo;s substitution could be made without changing
            anything else, and they tested it on handwritten digits. Corinna
            Cortes and Vapnik added the soft margin, the capacity this page
            calls C, in &ldquo;Support-vector networks&rdquo; in 1995, and the
            combination held the field for more than a decade. The condition
            that says which functions may be substituted is older than any of
            this, from James Mercer&rsquo;s 1909 paper on integral equations,
            which is why it carries his name.
          </p>
          <p>
            The page asks six questions in order. Why can no straight line
            separate the clinic? What does lifting the data into a bigger
            space by hand do, and what does it cost? What does the classifier
            actually read from its data? What is a kernel, and what must a
            function satisfy to be one? What is the radial kernel and what is
            its reach? And what does the support vector classifier do with a
            kernel, and where does it fail?
          </p>
        </>
      }
      playground={<KernelPlayground />}
      sections={[
        {
          title: "Part 1. A Boundary No Straight Line Can Draw",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The clinic, and what a straight cut gives up">
                <p>
                  Twenty-four patients are placed by temperature and heart
                  rate. The ten healthy ones sit where healthy vitals sit, in
                  a band of ordinary readings, and the fourteen unwell
                  surround them on every side, feverish and racing in one
                  corner, hypothermic and slow in another. Whatever direction
                  a straight boundary runs, unwell patients stand on both
                  sides of it, so a straight cut has to give a whole flank
                  away. Press the linear button above and watch it do exactly
                  that.
                </p>
                <p>
                  The straight boundary gets 17 of the 24 patients right, an
                  accuracy of 0.708, and on a second clinic drawn the same
                  way it scores 0.714. Calling everyone unwell would already
                  score 0.583, so the line is buying very little. The fit
                  also reports 20 of the 24 patients as support vectors, 19
                  of them at the cap, which is the classifier saying it could
                  not satisfy most of its constraints and had to charge for
                  the violations. Those words are defined in Part 3 and Part
                  6, and for now the number to carry forward is 0.708, the
                  best any straight boundary manages here.
                </p>
                <KeepInMind>
                  The problem is the geometry of the clinic. The healthy are
                  surrounded, so no line separates them, and the best any
                  straight boundary can do is choose which flank to give up,
                  whichever classifier is asked to draw it.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Where a straight cut is enough">
                <p>
                  The ideal case button loads a clinic where everyone unwell
                  runs a fever. The healthy ten are unchanged and the eight
                  unwell all sit to the right of them, so a straight line
                  separates the two groups cleanly. Under all three kernels
                  the classifier scores 1.000 on it, and the linear fit keeps
                  only 2 of the 18 patients as support vectors.
                </p>
                <p>
                  Where the data separates cleanly the kernel buys nothing,
                  and it is worth pressing the buttons on this clinic to see
                  that. The radial kernel keeps 7 patients where the linear
                  one keeps 2, which is the price of a shape the data did not
                  need. Everything that follows is about the first clinic,
                  and this second one is kept as the control.
                </p>
                <KeepInMind>
                  A kernel is a modelling choice, and the right choice on
                  linearly separable data is no kernel at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. A straight boundary is a dot product">
                <p>
                  Before lifting anything, look at what a straight boundary
                  is made of. A patient is a vector of two standardized
                  numbers, and a linear classifier scores them by a weighted
                  sum of those numbers plus an offset, then reads the sign.
                  On the linear algebra primer&rsquo;s terms the weighted sum
                  is a dot product between the patient and a weight vector,
                  and the boundary is the line where the score is zero.
                </p>
                <Equation>{"score(x) = w · x + b\npredict healthy when score(x) ≥ 0"}</Equation>
                <p>
                  Everything the classifier knows about a patient enters
                  through that one product, and every straight boundary is
                  some choice of w and b. The trick that follows never
                  touches this formula. It changes what the dot product is
                  taken between, and it does that by changing the space the
                  patient lives in.
                </p>
                <KeepInMind>
                  A linear classifier reads a patient only through a dot
                  product with its weight vector, which is the fact the rest
                  of the page leans on.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Lifting the Clinic by Hand",
          content: (
            <>
              <SubSection title="4. Manufacturing the curved columns">
                <p>
                  The polynomial page taught one way to make a straight
                  method bend, which is to manufacture the curved columns by
                  hand and fit the same straight method on more of them. Do
                  that here. From a patient&rsquo;s two standardized vitals
                  x and y, build three new columns, the two squares and the
                  cross term, with a root two on the cross term whose reason
                  arrives in section 11.
                </p>
                <Equation>{"φ(x, y) = (x²,  √2·xy,  y²)"}</Equation>
                <p>
                  The clinic is now twenty-four points in a three-dimensional
                  room, and the room is small enough to stand in. Below,
                  every patient has been carried through that map, and the
                  picture from the top of the page comes apart. Down in two
                  dimensions the unwell surrounded the healthy; up here they
                  do not, since squaring folds both directions of every
                  extreme, hypothermic and feverish alike, toward the same
                  large corner, and the healthy band gathers near the origin
                  beneath them.
                </p>
                <KernelLiftPlayground />
                <p>
                  The green wireframe is a flat plane, the boundary the same
                  classifier drew on the three lifted columns using nothing
                  but the ordinary dot product, and it separates the two
                  classes at an accuracy of 1.000 with 8 of the 24 patients
                  as support vectors. Drag the room until the plane is
                  edge-on and the separation is plain. A straight cut in the
                  lifted room is a curved fence in the measured plane, and
                  that fence is the closed shape the squared button drew at
                  the top of the page.
                </p>
                <KeepInMind>
                  Lifting the data through a fixed map and fitting a straight
                  boundary up there is a complete method on its own, and for
                  two features at degree two it is cheap enough that nothing
                  more is needed.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Counting what the lift costs">
                <p>
                  Two features at degree two lifted to three columns, or six
                  if the constant and the two plain features ride along. The
                  count grows quickly with both the number of features and
                  the degree, because the lifted columns are every product of
                  up to that many features. The table counts them for a few
                  cases, computed as the binomial coefficient the products
                  amount to.
                </p>
                <NumberTable
                  headings={["features", "degree", "columns, with lower terms", "columns, top degree only"]}
                  rows={[
                    ["2", "2", "6", "3"],
                    ["2", "3", "10", "4"],
                    ["10", "3", "286", "220"],
                    ["100", "2", "5,151", "5,050"],
                    ["20", "5", "53,130", "42,504"],
                    ["20", "10", "30,045,015", "20,030,010"],
                  ]}
                  caption="Each count is C(p + d, d) for p features at degree d, and C(p + d − 1, d) without the lower terms."
                />
                <p>
                  A hundred features at degree two is five thousand columns
                  and still fits in memory. Twenty features at degree ten is
                  thirty million columns per patient, and the manufactured
                  matrix stops fitting long before the arithmetic runs out.
                  Most of those columns would end up with coefficients near
                  zero, which makes building them a poor bargain even when
                  it is possible. That is the cost the trick removes, and
                  the next section shows what it removes it with.
                </p>
                <KeepInMind>
                  Manufacturing the lifted columns is exact and it scales
                  as a binomial coefficient, so it is fine at two features
                  and impossible at twenty features and degree ten.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The plane and the fence are the same fit">
                <p>
                  Fit the classifier twice on the clinic. Once on the three
                  lifted columns under the ordinary dot product, which is the
                  plane drawn above, and once on the two raw columns under a
                  kernel that returns the square of their dot product, which
                  is the route Part 4 explains. The two fits agree to
                  rounding. Their twenty-four multipliers differ by at most
                  5.3 × 10⁻¹⁶ and their decision values across a lattice of
                  the whole standardized plane differ by at most 9.8 × 10⁻¹⁵,
                  which is the rounding from adding three products in a
                  different order.
                </p>
                <InAModel title="On the clinic">
                  <p>
                    Both routes reach an accuracy of 1.000, both keep the
                    same 8 support vectors, and both take 966 steps of the
                    same ascent to get there. The classifier could not tell
                    which route it was on, because at every step it asked
                    for a number and got the same number.
                  </p>
                </InAModel>
                <KeepInMind>
                  The kernel route is the lifted route with the columns never
                  written down, and on the clinic the two agree to the last
                  bits.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What the Classifier Reads",
          content: (
            <>
              <SubSection title="7. The widest corridor">
                <p>
                  When the classes separate there are infinitely many
                  straight boundaries between them, and the logistic
                  regression page settled on one by minimising its loss,
                  which keeps pushing every patient away from the boundary
                  forever. The support vector classifier asks a sharper
                  question. Of all the boundaries that separate the classes,
                  which one leaves the widest empty corridor around itself?
                  That corridor is the margin, and the widget draws it on the
                  fever-only clinic, where a straight line works and the
                  corridor can be drawn.
                </p>
                <MarginView initialCapacity={10} />
                <p>
                  Require every patient to sit on the correct side of the
                  boundary by a score of at least one, and the corridor
                  between the two dashed edges has a width that depends only
                  on the weight vector.
                </p>
                <Equation>{"yᵢ (w · xᵢ + b) ≥ 1      for every patient i,  with yᵢ = ±1\nwidth of the corridor = 2 / ‖w‖"}</Equation>
                <p>
                  Making the corridor as wide as possible is the same as
                  making w as short as possible under those constraints. At
                  a capacity of 10 the fitted weights are (−1.242, −0.811)
                  and the offset −0.134, in standardized units, so the
                  corridor is 1.348 wide. Two patients touch its edges, one
                  healthy and one feverish, with decision values of exactly
                  +1.000 and −1.000, and they are ringed in green. The other
                  sixteen sit outside the corridor and could be moved a long
                  way without the boundary noticing.
                </p>
                <KeepInMind>
                  The margin is a claim about generalisation. A boundary
                  squeezed against the training patients has no room to be
                  wrong; one in the middle of a wide gap can be moved a long
                  way before it starts making mistakes.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Turning the corridor into multipliers">
                <p>
                  The constrained problem in section 7 has a standard
                  rearrangement, and the rearrangement is where the trick
                  gets in. Attach a multiplier αᵢ to each patient&rsquo;s
                  constraint, take the derivative with respect to w, and w
                  turns out to be a weighted sum of the patients themselves.
                  Substitute that back and w disappears, leaving a problem in
                  the multipliers alone.
                </p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "minimise ½ ‖w‖²  subject to  yᵢ(w · xᵢ + b) ≥ 1", reason: "the widest corridor, written as the shortest w" },
                    { expression: "L = ½ ‖w‖² − Σᵢ αᵢ [ yᵢ(w · xᵢ + b) − 1 ],  αᵢ ≥ 0", reason: "one multiplier per constraint, and a multiplier may only pull, never push" },
                    { expression: "∂L/∂w = 0  ⇒  w = Σᵢ αᵢ yᵢ xᵢ", reason: "the weight vector is a weighted sum of the patients" },
                    { expression: "∂L/∂b = 0  ⇒  Σᵢ αᵢ yᵢ = 0", reason: "the offset's own condition, which section 20 returns to" },
                    { expression: "maximise  Σᵢ αᵢ − ½ Σᵢ Σⱼ αᵢ αⱼ yᵢ yⱼ (xᵢ · xⱼ)", reason: "substitute w back; every appearance of a patient is now inside a dot product with another patient" },
                    { expression: "subject to  0 ≤ αᵢ ≤ C", reason: "the cap C is the soft margin's price, added in section 19" },
                  ]}
                />
                <p>
                  Read the fifth row again. The patients appear in it only as
                  xᵢ · xⱼ, a dot product between two of them, and never as a
                  lone coordinate. Nothing in the objective needs to know a
                  temperature or a heart rate; it needs a table of
                  twenty-four by twenty-four numbers, one per pair. That is
                  the whole structural fact, and it is a fact about this
                  particular rearrangement rather than about classifiers in
                  general.
                </p>
                <KeepInMind>
                  In its dual form the widest-corridor problem reads its
                  data only through dot products between pairs of training
                  patients.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Predicting reads dot products too">
                <p>
                  A new patient is scored by the same substitution. The
                  weight vector is a weighted sum of the training patients,
                  so the score of a new one is a weighted sum of dot products
                  with them, and again no coordinate of anyone appears on its
                  own.
                </p>
                <Equation>{"score(x) = w · x + b = Σᵢ αᵢ yᵢ (xᵢ · x) + b"}</Equation>
                <p>
                  Most of the αᵢ are zero, since at the optimum a multiplier
                  is non-zero only for a patient on or inside the corridor,
                  so the sum runs over the support vectors and nobody else.
                  On the fever-only clinic at a capacity of 10 that is two
                  patients out of eighteen. The classifier&rsquo;s fitted
                  self is those two patients, their two multipliers and their
                  two labels, and it needs nothing else to score anyone.
                </p>
                <KeepInMind>
                  Fitting and predicting both consume the data only as dot
                  products, so if some function can hand the classifier what
                  those products would have been in another space, the
                  classifier runs in that space without knowing it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Kernel",
          content: (
            <>
              <SubSection title="10. A function that answers for the lift">
                <p>
                  Suppose we intended to lift the clinic through the map in
                  section 4 and run the classifier up there. Every dot
                  product would become a dot product between two lifted
                  patients, φ(a) · φ(b). If some function k could hand us
                  that number straight from the original a and b, we could
                  feed its answers to the machinery and never build φ at
                  all.
                </p>
                <Equation>{"k(a, b) = φ(a) · φ(b)"}</Equation>
                <p>
                  Such a function is called a kernel. For the map in section
                  4 there is one, and it is the dot product squared. Take
                  two small vectors and compute both routes.
                </p>
                <KernelIdentityCheck />
                <WorkedExample title="On a = (1, 2) and b = (3, 4)">
                  <p>
                    The short route first. The dot product is 1 × 3 + 2 × 4,
                    which is 11, and its square is 121. Now the long route.
                    The lift sends a to (1, 2√2, 4) and b to (9, 12√2, 16),
                    and the dot product of those is 9 plus 2√2 times 12√2
                    plus 64. The middle term is 48, so the total is 121.
                  </p>
                  <Equation>{"φ(a) · φ(b) = 9 + 48 + 64 = 121\n(a · b)²    = 11²         = 121"}</Equation>
                </WorkedExample>
                <p>
                  Both routes give 121, and the widget will give the same
                  agreement on any pair you type, since the identity is
                  algebraic and holds for every pair. The
                  short route never formed a three-dimensional vector, and
                  it would not have formed a thirty-million-dimensional one
                  either.
                </p>
                <KeepInMind>
                  A kernel is a function of two original points that returns
                  what their dot product would have been after a lift. The
                  answer is exact to the last bit, since it is the same
                  arithmetic in a different order.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Why the identity holds for every pair">
                <p>
                  The check in section 10 was one pair of numbers. The
                  identity holds in general by nothing more than expanding a
                  square, and the expansion also explains the root two.
                </p>
                <WhyThisWorks>
                  <Equation>{"(a · b)² = (a₁b₁ + a₂b₂)²\n         = a₁²b₁² + 2·a₁a₂·b₁b₂ + a₂²b₂²"}</Equation>
                  <p>
                    Read the right side as a dot product by splitting each
                    term between an a-part and a b-part. The outer terms
                    split cleanly into a₁² times b₁² and a₂² times b₂². The
                    middle term&rsquo;s 2 has to be shared out as √2 times
                    √2, one factor to each side, which is the only reason the
                    lift carries a root two on its cross term.
                  </p>
                  <Equation>{"(a · b)² = (a₁², √2·a₁a₂, a₂²) · (b₁², √2·b₁b₂, b₂²) = φ(a) · φ(b)"}</Equation>
                  <p>
                    The same expansion runs for any number of features and
                    any power, only with more terms to share out, and adding
                    a constant before squaring admits the lower-order terms,
                    which is why the squared button at the top of the page
                    lifts to six columns rather than three.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The squared kernel is the dot product in the space of
                  squares and cross terms, for every pair of points, because
                  the square expands that way.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The Gram matrix, the classifier's whole view">
                <p>
                  Section 8 said the classifier needs one table, a kernel
                  value for every pair of training patients. That table is
                  the Gram matrix, twenty-four rows and twenty-four columns
                  on the clinic, and once it exists the temperatures and
                  heart rates are not consulted again during the fit. The
                  widget draws it under each kernel, with the ten healthy
                  patients first.
                </p>
                <ClinicGramMatrix />
                <p>
                  Under the radial kernel the diagonal is exactly one, since
                  every patient is at distance zero from themselves, and the
                  block of healthy patients in the top left is bright because
                  they are close to one another. Under the linear kernel the
                  entries are plain dot products of standardized vitals and
                  run negative as well as positive. The strip beneath the
                  table is its eigenvalues, and under the three kernels that
                  are kernels the smallest is never below zero, to rounding.
                  The largest is 30.647 for the linear kernel and 9.074 for
                  the radial one.
                </p>
                <KeepInMind>
                  The Gram matrix is everything the fit reads. Its
                  properties are properties of the data as the kernel sees
                  it, which is why they are worth checking.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What makes a function a kernel">
                <p>
                  Not every function of two points stands in for a dot
                  product. The condition, from Mercer, is that the function
                  is symmetric and that every Gram matrix it produces, on any
                  finite set of points, is positive semi-definite, meaning
                  none of its eigenvalues is negative. Exactly then a lift φ
                  exists with k(a, b) equal to φ(a) · φ(b), and the
                  classifier may reason as though the lifted space were
                  real.
                </p>
                <Equation>{"k(a, b) = k(b, a)      and      every eigenvalue of K ≥ 0"}</Equation>
                <p>
                  The fourth button on the widget is a hyperbolic tangent of
                  the shifted dot product, a function that is used in
                  practice and is not always a kernel. With its constant at
                  −1 the clinic&rsquo;s table is still symmetric, and 13 of
                  its 24 eigenvalues are negative, the smallest at −13.371.
                  No lift produces that table, so an optimisation built on it
                  is no longer climbing a hill with a top. Two things in the
                  models on this page meet that matrix and they respond
                  differently.
                </p>
                <InAModel title="Two responses to the same bad table">
                  <p>
                    Kernel ridge regression solves a linear system by a
                    Cholesky factorisation, which fails exactly when the
                    matrix is not positive definite, so it refuses the
                    sigmoid table and its message names Mercer&rsquo;s
                    condition. The support vector classifier climbs its
                    objective by projected gradient ascent, whose only guard
                    is that the multipliers stay inside a box, so it runs on
                    the same table without complaint, reports an accuracy of
                    0.792 with 18 of 24 patients kept, and has not maximised
                    anything. The refusal is the stronger contract, and on
                    this site it belongs to the ridge solver because a
                    Cholesky factorisation cannot proceed on such a matrix,
                    while nothing in a clipped ascent step has an occasion to
                    notice.
                  </p>
                </InAModel>
                <KeepInMind>
                  Mercer&rsquo;s condition is a condition. A function that
                  fails it produces a table with negative eigenvalues, and
                  whether that is refused or quietly computed on depends on
                  which solver meets it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Radial Kernel",
          content: (
            <>
              <SubSection title="14. Similarity that fades with distance">
                <p>
                  The radial kernel does not multiply two patients at all.
                  It measures the distance between them and turns it into a
                  bump, one at distance zero and falling toward zero as the
                  pair separate, with a single number gamma setting how fast
                  the fall happens.
                </p>
                <Equation>{"k(a, b) = exp(−γ ‖a − b‖²)"}</Equation>
                <p>
                  What that changes is what near means, and it is drawable.
                  Below, one point sweeps along a line while a reference
                  stands at 1.5, and each kernel reports how alike the pair
                  is. The dot product grows without bound and never forgets
                  anyone, the squared kernel doubles down on that, and the
                  two radial curves are bumps that vanish away from the
                  reference.
                </p>
                <KernelSimilarityChart />
                <p>
                  Two units from the reference the linear kernel reads −0.75
                  and is still changing, while the radial kernel at a gamma
                  of 0.5 reads 0.135 and at a gamma of 2 reads 0.0003, which
                  is as good as forgotten. That vanishing is why a radial
                  fit&rsquo;s answer at a point is decided by the patients
                  near it, the k-nearest neighbours page&rsquo;s instinct
                  reborn as a similarity, though with every neighbour
                  weighted by the bump rather than counted.
                </p>
                <KeepInMind>
                  The radial kernel depends only on the distance between two
                  points, so it assumes nothing about direction, and gamma is
                  the one number it has to be given.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. A lift with no end">
                <p>
                  The squared kernel lifts to three columns and the radial
                  kernel lifts to infinitely many. The count is literal, and
                  it follows from the exponential being an endless sum of
                  powers.
                </p>
                <WhyThisWorks>
                  <Equation>{"exp(−γ‖a − b‖²) = exp(−γ‖a‖²) · exp(−γ‖b‖²) · exp(2γ a · b)\n\nexp(2γ a · b) = Σₖ (2γ)ᵏ (a · b)ᵏ / k!"}</Equation>
                  <p>
                    Expand the squared distance as ‖a‖² − 2 a · b + ‖b‖²
                    and the exponential splits into three factors. The first
                    two depend on one point each and only rescale it. The
                    third is an exponential of a dot product, and its series
                    has a term in (a · b)ᵏ for every k, each of which is a
                    polynomial kernel of degree k with its own lifted
                    columns. Stacking all of them gives a lift with columns
                    of every degree and no last one.
                  </p>
                </WhyThisWorks>
                <p>
                  No amount of memory would let those columns be built, so
                  here there is no long route to save over, and the trick is
                  the only way to take the product at all. Kernel PCA cannot
                  map a point back from
                  that space for the same reason, which its own page says.
                </p>
                <KeepInMind>
                  The radial kernel&rsquo;s implied space has infinitely many
                  dimensions, and that is the sharpest form of the argument
                  for computing the product without the columns.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Gamma is the reach, measured on the clinic">
                <p>
                  Gamma is a hyperparameter and it has to be chosen. Small
                  gamma makes the bump wide, so every patient looks like
                  every other and the boundary cannot find a shape; large
                  gamma makes the bump narrow, so each patient is similar
                  only to themselves and the fit draws an island around
                  every one. Neither failure shows on the training accuracy,
                  so the sweep below scores every fit on a second clinic of
                  21 patients drawn by the same recipe that the fit never
                  saw.
                </p>
                <GammaSweepChart />
                <p>
                  At a gamma of 0.01 the fit scores 0.583 on the clinic and
                  0.571 held out, which are exactly the shares of unwell
                  patients in each, so it has called everyone unwell. At 0.3
                  it first reaches 1.000 on the clinic and 0.810 held out. At
                  a gamma of 1 the held-out score peaks at 0.952 with 16 of
                  the 24 patients kept as support vectors, and the plateau
                  is broad, since gammas of 0.5, 1 and 2 all score the same
                  0.952 with 15, 16 and 17 patients kept. From there the
                  training accuracy stays at 1.000 while
                  the held-out score falls, to 0.857 at 10, 0.762 at 30,
                  0.667 at 100 and 0.571 at 1000, and the count of support
                  vectors rises to all 24. A fit that keeps every training
                  row is a fit that has memorised them, and at a gamma of
                  1000 it is once again worth exactly the all-unwell guess on
                  anyone new.
                </p>
                <KeepInMind>
                  Training accuracy cannot choose gamma, because it reads
                  1.000 from a gamma of 0.3 upward. The held-out score and
                  the support vector count can, and they agree.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Units are part of the kernel">
                <p>
                  Every kernel here is built from dot products or distances,
                  and both inherit the units of the data. A heart rate
                  ranges over a hundred beats while a temperature ranges over
                  five degrees, so in raw units the distance between two
                  patients is almost entirely heart rate, and the radial
                  bump at a gamma of 1 is narrower than the gap between any
                  two patients. Every fit on this page standardizes both
                  vitals first, the k-nearest neighbours page&rsquo;s scaling
                  discipline applied to a similarity.
                </p>
                <InAModel title="The clinic in raw units">
                  <p>
                    I fitted the radial kernel at a gamma of 1 on the raw
                    temperatures and heart rates once, to see. It scores
                    1.000 on the clinic, keeps all 24 patients as support
                    vectors and scores 0.714 held out, which is the
                    memorising regime of section 16 reached by a change of
                    units rather than a change of gamma. The linear kernel
                    on the same raw numbers runs to its 50,000-step ceiling
                    without converging and scores 0.417, worse than calling
                    everyone unwell, with ten patients at the cap, because
                    the dot products are thousands of times larger than the
                    step was chosen for.
                  </p>
                </InAModel>
                <KeepInMind>
                  Standardizing decides what the kernel measures. A gamma
                  chosen for standardized data is a different gamma in raw
                  units, and a kernel fitted on raw vitals is a kernel fitted
                  on heart rate.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Support Vector Classifier",
          content: (
            <>
              <SubSection title="18. The support vectors are the model">
                <p>
                  Section 9 said the fitted classifier is its support vectors
                  and nothing else, and that is a claim that can be tested by
                  deletion. Fit the radial kernel on the clinic, keep only
                  the patients the fit reported as support vectors, refit on
                  those, and compare the two boundaries everywhere.
                </p>
                <SupportVectorRefit />
                <p>
                  The full fit keeps 16 of the 24 patients. Refitting on
                  those 16 alone gives decision values within 2.7 × 10⁻⁶ of
                  the original across the whole plane, which is the size
                  of the solver&rsquo;s stopping tolerance. Removing one patient the fit did not depend
                  on, the second healthy patient, moves the boundary by
                  2.6 × 10⁻⁸. Removing one support vector instead, the first
                  healthy patient, moves it by 0.340, since the corridor was
                  resting on them.
                </p>
                <KeepInMind>
                  Delete every non-support patient and refit, and the
                  boundary does not move. That is the sense in which the
                  support vectors are the model, and it is why this
                  classifier can be smaller than its training data where
                  kernel ridge, which keeps every row, cannot.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Capacity, the price of a violation">
                <p>
                  Real classes overlap, and then no boundary satisfies every
                  constraint in section 7. The soft margin allows a patient
                  inside the corridor or on the wrong side and charges for
                  it, with the capacity C setting the price. In the dual the
                  price appears as a cap, no multiplier may exceed C, so no
                  single patient can pull on the boundary harder than that.
                  A patient whose multiplier sits at the cap is one the
                  margin gave up on.
                </p>
                <p>
                  Go back to the widget in section 7 and press the
                  capacities in turn. At 0.1 the corridor is 2.538 wide, 9 of
                  the 18 patients are support vectors and 7 of those are at
                  the cap, sitting inside a corridor too wide to keep them
                  out. At 1 the corridor narrows to 1.503 with 2 support
                  vectors, one at the cap. At 10 and at 100 it is 1.348 wide
                  with the same 2 support vectors and none at the cap, which
                  is the hard margin the data admits.
                </p>
                <NumberTable
                  headings={["capacity", "support vectors, clinic", "at the cap", "held-out accuracy"]}
                  rows={[
                    ["0.01", "24 of 24", "24", "0.905"],
                    ["0.1", "24 of 24", "24", "0.905"],
                    ["1", "16 of 24", "4", "0.952"],
                    ["10", "12 of 24", "0", "0.952"],
                    ["100", "12 of 24", "0", "0.952"],
                  ]}
                  caption="The radial kernel at a gamma of 1 on the surrounded clinic, scored on the second clinic of section 16. Below a capacity of 1 every multiplier hits the cap and the fit is a smoothed vote."
                />
                <KeepInMind>
                  Small C buys a wide corridor by tolerating mistakes, more
                  bias and less variance; large C insists on separating the
                  training data and will bend the boundary to do it. At a
                  large C with a large gamma the classifier fits any labelling
                  at all, including a random one.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The offset rides inside the kernel">
                <p>
                  The derivation in section 8 produced a side condition, that
                  the multipliers weighted by their labels sum to zero, and it
                  comes from the offset b having no penalty of its own. The
                  standard solver, sequential minimal optimisation, exists
                  largely to respect that condition while updating
                  multipliers in pairs. This implementation drops the
                  condition instead, by adding one to every kernel value,
                  which is the same as appending a column of ones to every
                  patient and letting the offset be that column&rsquo;s
                  weight.
                </p>
                <Equation>{"k(a, b) + 1 = φ(a) · φ(b) + 1 · 1 = (φ(a), 1) · (φ(b), 1)"}</Equation>
                <p>
                  The cost is that the absorbed offset is a weight like any
                  other, so the margin objective shrinks it, where a separate
                  offset would be free. At a small capacity that holds the
                  boundary nearer the origin of the lifted space than the
                  data alone would put it, and raising the capacity releases
                  it. A four-reading fixture shows the movement.
                </p>
                <AbsorbedInterceptTable />
                <p>
                  Four readings at 1, 2, 3 and 4 with the first two labelled
                  0 and the last two labelled 1 have their widest corridor
                  between 2 and 3, crossing at 2.5. At a capacity of 0.1 the
                  fitted boundary crosses at 0.136, at 1 it crosses at
                  1.875, at 10 at 2.231, and at 100 it reaches 2.500. The
                  same effect is why the fever-only fit in section 19 kept
                  one support vector at the cap at a capacity of 1, with a
                  decision value of −0.795 rather than −1, on data a hard
                  margin separates.
                </p>
                <KeepInMind>
                  Absorbing the offset into the kernel is what lets this
                  classifier be solved without a pairwise solver, and the
                  price is a boundary that a small capacity pulls toward the
                  origin; on the four readings a capacity of 100 moved the
                  crossing to 2.500, which is where the widest corridor puts
                  it.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What a decision value is, and is not">
                <p>
                  The number the classifier produces for a patient is the
                  sum in section 9, a signed distance from the boundary in
                  the units of the implied space. Its sign is the prediction,
                  its size says how far inside a class the patient sits, and
                  the corridor&rsquo;s edges are at plus and minus one. On
                  the clinic under the radial kernel at a capacity of 1, the
                  support vectors on the edges read exactly +1.000 or −1.000,
                  and one unwell patient at the cap, hypothermic at 35.8
                  degrees with a heart rate of 58, reads −0.396, inside the
                  corridor but on the correct side.
                </p>
                <p>
                  A classifier on this site is also asked for a probability,
                  and this one has none to give. A margin objective produces
                  no likelihood. What the method returns instead is the
                  decision value squashed through a logistic so it lands
                  between zero and one, which keeps the ranking of patients
                  and nothing more.
                </p>
                <Equation>{"squashed(x) = 1 / (1 + exp(−score(x)))"}</Equation>
                <NumberTable
                  headings={["patient", "decision value", "squashed"]}
                  rows={[
                    ["a support vector on the healthy edge", "+1.000", "0.731"],
                    ["the healthy patient furthest inside", "+1.346", "0.794"],
                    ["the capped unwell patient", "−0.396", "0.402"],
                    ["a support vector on the unwell edge", "−1.000", "0.269"],
                  ]}
                  caption="The clinic under the radial kernel at a gamma of 1 and a capacity of 1, a fit that scores 1.000."
                />
                <p>
                  The fit is perfect on these patients and the most
                  confident it will call any of them healthy is 0.794. That
                  number is a decision value of 1.346 passed through a curve
                  chosen for its range, and nothing in the fit connects it to
                  how often such a patient turns out to be healthy. The
                  honest route to a probability is Platt
                  scaling, a one-dimensional logistic regression fitted to
                  the decision values on held-out patients, and it is a
                  separate model, kept outside this one on purpose.
                </p>
                <KeepInMind>
                  A decision value is a distance and its squashed form is a
                  ranking. Neither is a probability, and a threshold of 0.5
                  on the squashed value is only the sign of the distance.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. How this one climbs, and what it costs">
                <p>
                  The dual in section 8 is a concave quadratic in the
                  multipliers with box constraints, and this implementation
                  climbs it by the plainest correct method. Start every
                  multiplier at zero, step along the gradient, clip each
                  multiplier back into the box between zero and C, and stop
                  when no multiplier moved by more than a tolerance. The
                  step is added rather than subtracted, since this is the
                  one solver on the site that maximises.
                </p>
                <Equation>{"α ← clip( α + η (1 − Q α),  0,  C )      where  Qᵢⱼ = yᵢ yⱼ k(xᵢ, xⱼ)"}</Equation>
                <p>
                  It is correct and it is slow, and the step size matters
                  more than it looks. I first ran every fit on this page at
                  the default step of 0.001 and ceiling of
                  1,000 steps, and every fit stopped at the ceiling with
                  every multiplier still moving, so all 24 patients reported
                  as support vectors under the linear and radial kernels, 16
                  under the squared one, and the story in section 18 could
                  not be told. The fits here use a step of 0.02,
                  shrinking with the row count since the largest eigenvalue
                  of Q grows with it, and a ceiling of 50,000. Under those
                  settings the clinic converges in 226 steps under the linear
                  kernel, 812 under the squared one and 5,768 under the
                  radial one, and the playground reports the count.
                </p>
                <KeepInMind>
                  Projected gradient ascent reaches the right answer given
                  enough steps at a small enough step size, and a fit stopped
                  at its ceiling reports every row as a support vector. The
                  standard solver is sequential minimal optimisation, and
                  swapping it in would be an optimisation rather than a
                  different model.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. The Same Swap Everywhere",
          content: (
            <>
              <SubSection title="23. Kernel ridge and kernel PCA">
                <p>
                  Nothing in the trick cared that the machine was a
                  classifier. It asked only that the data appear through dot
                  products, and two other methods on this site can be
                  rearranged to qualify.{" "}
                  <Link href="/concepts/kernel-ridge" className={link}>
                    Kernel ridge
                  </Link>{" "}
                  is ridge regression in its dual form with the same
                  substitution, drawing curves through data without one
                  manufactured column, and{" "}
                  <Link href="/concepts/kernel-pca" className={link}>
                    kernel PCA
                  </Link>{" "}
                  finds directions of spread in the lifted space, which lets
                  it describe clouds that bend. Each of those pages carries
                  its own control, the linear kernel reproducing the
                  unkernelised method exactly.
                </p>
                <p>
                  One difference between them and this page is worth
                  carrying away. Kernel ridge&rsquo;s dual weights are all
                  non-zero, so it keeps every training row forever; the
                  support vector classifier kept 16 of 24 on the clinic and 2
                  of 18 on the fever-only clinic. The margin objective is
                  what makes the difference, since it is the constraints
                  being inactive for most patients that sets most multipliers
                  to zero.
                </p>
                <KeepInMind>
                  One swap serves a family of methods. What the margin adds
                  on top of the swap is a fitted model that can be smaller
                  than its training data.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. What a kernel model gives up">
                <p>
                  A kernelised model lives in a space nobody can visit. There
                  is nothing like the decision tree page&rsquo;s printed
                  questions to read, and no coefficient per feature to
                  report, since under the radial kernel there is no finite
                  list of features to have coefficients on. What can be
                  reported is which training patients the boundary rests on
                  and how hard each pulls, which is what the green rings at
                  the top of the page are.
                </p>
                <p>
                  The choice of kernel and its gamma is a modelling choice
                  and has to be judged the way every such choice on this
                  site is judged, on{" "}
                  <Link href="/concepts/held-out-evaluation" className={link}>
                    data the fit never saw
                  </Link>
                  . Section 16 is that judgement made once, and the
                  squared kernel deserves the same treatment. It scores
                  1.000 on the clinic and 0.762 on the second clinic, well
                  short of the radial kernel&rsquo;s 0.952, because the
                  shape it can draw is a single conic and the healthy band
                  is not quite one.
                </p>
                <KeepInMind>
                  A kernel model trades a readable weight vector for a
                  boundary of almost any shape, and the shape it drew is
                  only as good as its held-out score says.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="25. What a complete implementation must specify">
                <p>
                  A complete implementation states which kernels it offers
                  and every parameter each takes, whether and how it scales
                  the inputs, the capacity, how the offset is handled and
                  whether the dual&rsquo;s side condition is kept or
                  absorbed, which solver climbs the dual and its step,
                  ceiling and tolerance, the threshold above which a
                  multiplier counts as a support vector, the encoding of the
                  labels, what the decision value is measured in, and
                  whether anything it calls a probability has been
                  calibrated. Here the kernels are the linear, polynomial,
                  radial and sigmoid; the inputs are standardized; the offset
                  is absorbed by adding one to every kernel value; the
                  solver is projected gradient ascent; a multiplier above
                  10⁻⁸ counts as a support vector; the labels are 0 and 1
                  outside and −1 and +1 inside; and the squashed value is
                  not calibrated.
                </p>
              </SubSection>

              <SubSection title="26. The edges, each one probed">
                <p>
                  Every row below was run, most of them through this
                  page&rsquo;s own endpoints, and the behaviour recorded is
                  what came back.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no features, or an empty column", reason: "refused at the boundary, by the same guard every feature here passes through." },
                    { expression: "one patient", reason: "refused, since one patient is one class and a boundary needs both; the page's endpoints refuse a single point a layer earlier." },
                    { expression: "two patients, one of each class", reason: "accepted and fits, standardized, at an accuracy of 1.000 with both as support vectors." },
                    { expression: "one class", reason: "refused; there is nothing to separate." },
                    { expression: "three classes, or a label of 0.5", reason: "refused before the sign encoding, because folding every class above zero into +1 would silently learn the wrong question." },
                    { expression: "a constant column", reason: "refused by the standardizer, whose division by a zero spread has no answer; fitted raw and unstandardized, it is accepted and the column contributes nothing." },
                    { expression: "a non-finite value", reason: "refused at the boundary; the endpoints refuse it earlier still, since a NaN cannot be written as JSON." },
                    { expression: "more than 100 patients", reason: "refused by the endpoints with the limit named, before any fit." },
                    { expression: "predicting before fitting, or reading the support vectors", reason: "refused as not fitted, in a sentence rather than as an attribute error." },
                    { expression: "predicting with a feature missing, or under another name", reason: "refused; a kernel pairs rows over exactly the fitted features. The same features in another order are matched by name and accepted." },
                    { expression: "gamma of 0, capacity of 0, degree of 0, or a negative polynomial constant", reason: "refused at construction, since each makes the kernel or the objective degenerate; at a gamma of 0 every pair has kernel value 1 and there is nothing to fit." },
                    { expression: "a polynomial kernel of degree 200 on raw vitals", reason: "the powers overflow to infinity and the Gram matrix is refused for holding a non-finite value, naming unscaled features as the usual cause; the endpoints cap the degree at 6." },
                    { expression: "a sigmoid kernel that is not a kernel", reason: "the Gram matrix has negative eigenvalues; kernel ridge refuses it through its Cholesky solve and this classifier runs on it and reports a fit. Documented rather than defended, in section 13." },
                    { expression: "a gamma too large", reason: "accepted, and the fit memorises: 1.000 on the clinic, all 24 patients kept, and 0.571 held out at a gamma of 1000, which is the all-unwell guess. Nothing raises; the held-out score and the support vector count are the only witnesses." },
                    { expression: "the ascent stopped by its ceiling", reason: "accepted, and the model reports the step count so a caller can see it; at the default step and ceiling the clinic stops at 1,000 steps under every kernel, and under the radial one every row reads as a support vector." },
                    { expression: "the squashed decision value read as a probability", reason: "accepted by the type system and wrong; a perfect fit on the clinic never squashes above 0.794." },
                  ]}
                />
                <p>
                  The sigmoid row and the gamma row are the two that deserve
                  the most care, because both are quiet. A negative
                  eigenvalue and a memorising fit each produce a model that
                  fits and reports a plausible number. The solver that
                  refuses the first is not the
                  one this page uses, and nothing refuses the second, which
                  is why the sweep in section 16 scores every fit on
                  patients it never saw.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
