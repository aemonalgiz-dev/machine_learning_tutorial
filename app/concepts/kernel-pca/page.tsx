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
import { ArcFold } from "@/components/widgets/ArcFold";
import { GramRouteTable } from "@/components/widgets/GramRouteTable";
import { KernelPcaPlayground } from "@/components/widgets/KernelPcaPlayground";
import { KernelTable } from "@/components/widgets/KernelTable";
import { LiftedCentring } from "@/components/widgets/LiftedCentring";
import { ReachSweep } from "@/components/widgets/ReachSweep";
import { RowCoefficients } from "@/components/widgets/RowCoefficients";
import { ShareLadder } from "@/components/widgets/ShareLadder";

export const metadata: Metadata = {
  title: "Kernel Principal Components · oop_ml",
  description:
    "Apply PCA through a kernel to describe variation in a transformed feature space.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelPcaPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["kernel-pca"]}
      technicalStart="Part 2. PCA Written With Inner Products"
      openingTitle="When the Pattern Follows a Curve"
      playgroundIntro="Compare ordinary PCA with the kernel projection. Keep track of which plot uses the original coordinates and which uses the new components."
      title="Kernel Principal Components"
      tagline="Apply PCA through a kernel to describe variation in a transformed feature space."
      prerequisites={
        <>
          This page is{" "}
          <Link href="/concepts/pca" className={link}>
            principal component analysis
          </Link>{" "}
          run through{" "}
          <Link href="/concepts/kernel-trick" className={link}>
            the kernel trick
          </Link>
          . The first owns the eigenvector route and the measured four this
          page reuses; the second owns the trick itself, the lifted space and
          the radial kernel&rsquo;s reach. Read both first, since this page
          borrows the eigenvalue from one and the swap from the other and
          adds one step of its own, centring a cloud it cannot see.
        </>
      }

      playground={<KernelPcaPlayground />}
      sections={[
        {
          title: "Part 1. A Pattern No Straight Axis Follows",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The ring, and what a rotation cannot do">
                <>
<p>
                  Thirty-six people, measured by height and weight. Twelve of them are of about one build, all within ten or so units of a hundred and sixty centimetres and sixty kilograms, and the other twenty-four differ from that build by about thirty units, each in a different direction, so on the plane they form a ring around the twelve.
                </p>
                <p>
                  The fact that separates the two groups is how far from the typical build someone is, and no straight line through the cloud carries it. Tick the ordinary PCA box in the playground and the right panel shows the ring turned a little, with the twelve still inside the twenty-four.
                </p>
</>
                <>
<p>
                  The numbers say why. Ordinary PCA gives the ring shares of 0.516 and 0.484, because a round cloud spreads almost evenly in every direction, and along its first axis the inner twelve overlap the outer twenty-four by 40.2 units, since an outer person on the left and an outer person on the right sit at opposite ends of any straight axis with the inner twelve between them.
                </p>
                <p>
                  Untick the box, with the radial kernel and gamma at 0.005, and every inner person sits to one side of every outer person along the first kernel direction, with a clear stretch of 0.634 between the nearest pair. The thirty-six are the same people; the direction was found in a different space, and the next three Parts build it.
                </p>
</>
                <KeepInMind>
                  A straight axis through a ring cannot put the inside on
                  one side and the outside on the other, and PCA can only
                  choose straight axes. How far someone is from the typical
                  build is a direction of a different kind.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The arc, carried over">
                <>
<p>
                  The PCA page ended on twelve people along a curve and showed that a straight axis is a poor summary of them, with a first component claiming 68 percent of the variance and a reconstruction error of 3,316 from one number per person. It is worth being exact about what that axis did and did not do, because this page will measure the kernel&rsquo;s answer against it.
                </p>
                <p>
                  The curve rises at both ends and dips in the middle, and nearly all of its spread runs along height, so the first component runs nearly along height too.
                </p>
</>
                <>
<p>
                  Read the twelve by height and their first coordinates fall from 39.1 to &minus;40.9 without once turning back; the axis orders the people along the curve perfectly well. What it loses is the curve itself, the 301.5 of variance out of 942.9 that runs across the axis, which is why a person rebuilt from one coordinate lands on the line and the two ends of the arc rise off it.
                </p>
                <p>
                  So ordinary PCA orders the arc and loses its shape. Whether the kernel describes it better is a question this page answers by measurement, in section 17, and the answer is less tidy than the textbook picture.
                </p>
</>
                <KeepInMind>
                  On the arc, ordinary PCA already reads the people in order
                  along the curve. Its failure is that one straight coordinate
                  cannot say how far off the straight line each person sits.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a curved direction would be">
                <p>
                  A straight direction gives every person a score that is a
                  weighted sum of their height and weight. A curved direction
                  gives them a score that is some other function of the
                  pair, the distance from the typical build for the ring, the
                  position along the curve for the arc. The kernel trick
                  page&rsquo;s way to get one is to lift every person into a
                  larger space of made-up features, squares and products and
                  beyond, and choose a straight direction there; a straight
                  direction in the lifted space is a curved one on the plane.
                </p>
                <Equation>{"score(x) = w · φ(x)"}</Equation>
                <p>
                  PCA in the lifted space would then find the straight
                  direction of most spread among the lifted people, which is
                  the curved direction of most spread among the people as
                  measured. The obstacle is the one that page counted. The
                  lifted space of the radial kernel has no finite number of
                  features, so the covariance matrix PCA decomposes cannot be
                  written down at any size, and the method looks closed off
                  before it starts.
                </p>
                <KeepInMind>
                  A curved direction on the plane is a straight direction in
                  a lifted space. PCA there would find it, if PCA could be
                  run without writing the lifted features out, which is what
                  the next Part arranges.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. PCA Written With Inner Products",
          content: (
            <>
              <SubSection title="4. Every direction is a recipe over the people">
                <p>
                  Take the PCA page&rsquo;s measured four, centred, with
                  deviations (10, 10), (&minus;10, &minus;10), (5, &minus;5)
                  and (&minus;5, 5). Their first component was the direction
                  (0.707, 0.707). Here is the observation the whole method
                  rests on. That direction can be written as a weighted sum
                  of the four deviations themselves, since any direction
                  through the middle of a centred cloud lies in the space the
                  deviations span.
                </p>
                <Equation>{"u = Σᵢ aᵢ dᵢ\n(0.707, 0.707) = 0.0354 · (10, 10) − 0.0354 · (−10, −10) + 0 · (5, −5) + 0 · (−5, 5)"}</Equation>
                <p>
                  Once a direction is a recipe over the people, a
                  person&rsquo;s score along it is a sum of dot products
                  between people, and the direction&rsquo;s own coordinates
                  never appear.
                </p>
                <Equation>{"score of person j = dⱼ · u = Σᵢ aᵢ (dⱼ · dᵢ)"}</Equation>
                <WorkedExample title="Person 1 on the measured four">
                  <>
                    <p>
                      The new person’s centred dot products with the four training
                      people are 200, −200, 0 and 0. Weight those similarities by the
                      component coefficients to get the coordinate.
                    </p>
                    <Equation>{"coordinate ≈ 0.0354 × 200 + (−0.0354) × (−200) ≈ 14.14"}</Equation>
                    <p>
                      The coefficients shown are rounded. Using the full values gives
                      the same coordinate as ordinary PCA’s projection of (10, 10) onto
                      its first unit direction.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  If a direction is written as weights on the people, every
                  score needs only dot products between people. The
                  direction&rsquo;s coordinates in feature space are never
                  consulted, which is what will let feature space be
                  anything at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The Gram matrix">
                <p>
                  So write down every dot product between people once, in an
                  n by n table with person i down the rows and person j
                  across the columns. That table is the Gram matrix, and
                  after this Part it is the only thing the fit reads. For
                  the measured four, centred, it is two blocks and nothing
                  else, because persons 1 and 2 lie along one diagonal and
                  persons 3 and 4 along the other, and the two diagonals are
                  perpendicular.
                </p>
                <Equation>{"K_c =  200  −200     0     0\n      −200   200     0     0\n         0     0    50   −50\n         0     0   −50    50"}</Equation>
                <GramRouteTable cloud="four" panels={["matrices"]} />
                <KeepInMind>
                  The Gram matrix holds one number per pair of people, the
                  dot product of their deviations. It has as many rows as
                  there are people, however many features they were measured
                  on.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Same eigenvalues by two routes">
                <>
<p>
                  The PCA page decomposed the scatter matrix, which is two by two for two features. Decompose the four by four Gram matrix instead and the non-zero eigenvalues come out the same, 400 and 100, and the eigenvector for 400 is one on person 1, minus one on person 2 and zero elsewhere, which is the recipe of section 4 before its scaling.
                </p>
                <p>
                  The two routes reach the same variances, the same shares and the same coordinates, and the extra eigenvalues the larger matrix has are zero, because four people on a plane spread along two directions and no more.
                </p>
</>
                <GramRouteTable cloud="four" panels={["eigenvalues", "coordinates"]} />
                <p>
                  The same holds on the arc, where the scatter matrix is
                  [7054.7, 67.3; 67.3, 3317.7] and its eigenvalues are
                  7055.88 and 3316.45, the twelve by twelve Gram matrix
                  gives 7055.88 and 3316.45 and then ten eigenvalues no
                  larger than 4e&minus;12, and the twelve people&rsquo;s
                  coordinates by the two routes agree to 1.35e&minus;13 once
                  each column&rsquo;s sign is dropped.
                </p>
                <GramRouteTable cloud="arc" panels={["eigenvalues"]} />
                <WhyThisWorks title="Why the two matrices share their eigenvalues">
                  <p>
                    Write the centred people as the rows of X, so the scatter
                    matrix is X&prime;X and the Gram matrix is XX&prime;.
                    Take an eigenpair of the Gram matrix and multiply both
                    sides by X&prime; on the left.
                  </p>
                  <DerivationTable
                    expressionHeading="step"
                    reasonHeading="why"
                    rows={[
                      { expression: "X X′ u = λ u", reason: "u is an eigenvector of the Gram matrix with eigenvalue λ" },
                      { expression: "X′ (X X′ u) = X′ (λ u)", reason: "multiply both sides by X′" },
                      { expression: "(X′X) (X′u) = λ (X′u)", reason: "regroup; X′u is an eigenvector of the scatter matrix with the same λ" },
                    ]}
                  />
                  <p>
                    So every non-zero eigenvalue of one is an eigenvalue of
                    the other, and the scatter matrix&rsquo;s eigenvector is
                    X&prime;u, the recipe u applied to the people, which is
                    section 4&rsquo;s sum with u as the weights.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The eigenvector route through the covariance matrix and
                  the route through the Gram matrix find the same directions
                  and the same variances. One is p by p and the other n by
                  n, and only the second can be built when p is unwritable.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. One eigenvalue, two scales">
                <>
                  <p>
                    A raw Gram eigenvalue and a sample variance differ by the sample
                    covariance divisor. There are four people in this example.
                  </p>
                  <Equation>{"sample variance = raw eigenvalue / (n − 1)\n                = 400 / (4 − 1)\n                ≈ 133.33"}</Equation>
                  <p>
                    This is the variance reported by the ordinary PCA playground. The
                    normalization of component coefficients still uses the raw
                    eigenvalue.
                  </p>
                </>
                <Equation>{"variance along the direction = λ / (n − 1) = 400 / 3 = 133.33"}</Equation>
                <p>
                  The second scale is the direction&rsquo;s own length. The
                  eigenvector u has unit length, but the direction it names,
                  X&prime;u, has length &radic;&lambda;, which on the four is
                  20. A person&rsquo;s coordinate has to be measured along a
                  unit direction, so the recipe is u divided by the square
                  root of the raw eigenvalue, and that is where section
                  4&rsquo;s 0.0354 came from.
                </p>
                <Equation>{"a = u / √λ = (1, −1, 0, 0) / √2 / √400 = (0.0354, −0.0354, 0, 0)"}</Equation>
                <GramRouteTable cloud="four" panels={["scales"]} />
                <WorkedExample title="Two checks that both scales were used">
                  <>
                    <p>
                      Check both the normalization and the resulting coordinate. The raw
                      Gram-matrix eigenvalue is 400.
                    </p>
                    <Equation>{"squared coefficient length ≈ 0.0354² + 0.0354² ≈ 0.0025\nreciprocal eigenvalue = 1 / 400 = 0.0025\nperson 1 coordinate ≈ 200 × 0.0354 + 200 × 0.0354 ≈ 14.14"}</Equation>
                    <p>
                      The coefficients shown are rounded. Dividing by the square root of
                      the sample variance instead of the raw eigenvalue’s square root
                      would make every coordinate too large by the square root of three.
                      Omitting the normalization would put person 1 at about 282.8.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  Report the eigenvalue over n &minus; 1 as the variance and
                  normalise the eigenvector by the square root of the raw
                  eigenvalue. Confusing the two leaves every coordinate off
                  by &radic;(n &minus; 1), and the shares never notice,
                  because a share is a ratio and the factor cancels.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Centring a Cloud You Cannot See",
          content: (
            <>
              <SubSection title="8. What the uncentred table sees">
                <>
<p>
                  Everything in Part 2 used deviations from the mean. Build the Gram matrix from the people as measured instead, with person 1 at (180, 78) rather than (10, 10), and every entry is enormous, 38,484 for person 1 with themselves, 33,324 with person 2, because the whole cloud lies far from the origin and every dot product mostly measures that.
                </p>
                <p>
                  The largest eigenvalue of the uncentred table is 134,449.5, and it takes 0.9989 of the table&rsquo;s trace. Its eigenvector is nearly the same weight on everyone, (&minus;0.53, &minus;0.46, &minus;0.51, &minus;0.49), which is the direction from the origin to the mean and describes no spread among the four at all.
                </p>
</>
                <LiftedCentring />
                <p>
                  The PCA page could show this by drawing the cloud and the
                  origin on one picture, and section 4 there did. Here there
                  is no picture to draw, because the points that need
                  centring are the lifted ones, and the uncentred
                  table&rsquo;s first direction would be reported as a fit
                  with a share of 0.9989 and nothing to warn anyone. On the
                  arc the same share is 0.9896.
                </p>
                <KeepInMind>
                  Without centring, the first direction points at the mean
                  and its share is close to one. The fit runs to completion
                  and reports a direction that says only where the cloud is.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Centring the table instead of the people">
                <p>
                  The lifted people cannot be shifted, since they cannot be
                  written down, but their table can be corrected on their
                  behalf. Write m for the mean of the n lifted people and
                  expand the dot product of two centred ones.
                </p>
                <Equation>{"(φ(a) − m) · (φ(b) − m)\n  = K(a, b) − (1/n) Σₖ K(a, xₖ) − (1/n) Σₖ K(xₖ, b) + (1/n²) Σₖ Σₗ K(xₖ, xₗ)"}</Equation>
                <p>
                  Each term is a kernel value or an average of kernel values,
                  so the centred entry is computable from the uncentred
                  table alone. Read across every pair at once and the four
                  terms are four matrices, where 1&#8345; is the n by n
                  matrix filled with 1/n.
                </p>
                <Equation>{"K_c = K − 1ₙK − K1ₙ + 1ₙK1ₙ"}</Equation>
                <WhyThisWorks title="Why the last term is added back">
                  <p>
                    Subtracting a row average removes the piece of every
                    entry that belongs to a, and subtracting a column
                    average removes the piece that belongs to b, and the
                    piece that belongs to the mean alone, m &middot; m, has
                    then been removed twice. The double average puts it back
                    once. It is the inclusion and exclusion of an expansion
                    rather than a formula to memorise, and on the measured
                    four it turns the table of 38,484s back into the two
                    blocks of section 5 exactly.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The Gram matrix of the centred lifted people can be built
                  from the Gram matrix of the uncentred ones, and that
                  identity is what makes this method possible. Skip it and
                  the first direction is the mean.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. A new person is centred against the fit">
                <>
<p>
                  A person who was not in the fit gets a row of kernel values against the n training people, and that row has to be shifted by the mean the fit learned rather than by anything of its own, exactly as the PCA page subtracted the training mean from a new observation. The same identity does it, with the query row&rsquo;s own average and the training table&rsquo;s averages in the four terms, and it is exact rather than approximate.
                </p>
                <p>
                  Send person 1 of the measured four back through as if new and their centred row comes out 200, &minus;200, 0, 0, the first row of section 5&rsquo;s table.
                </p>
</>
                <Equation>{"centred query row = k − 1_q K − k 1ₙ + 1_q K 1ₙ"}</Equation>
                <InAModel title="The leak the fit makes unwriteable">
                  <p>
                    Centring a query row against itself would be the same
                    leak as re-standardising held-out data, in a space where
                    nothing would look wrong. Here it cannot happen by
                    accident, because the centring identity is defined only
                    for a square table and a row of one person against
                    twelve is 1 by 12; asking for it is refused with the
                    shape named.
                  </p>
                </InAModel>
                <KeepInMind>
                  New rows are centred against the training table, never
                  against themselves, and the training table travels with
                  the fit for that reason.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "No rotation of the axes can put the ring’s inner twelve on one side of the outer twenty-four, so ordinary PCA leaves the two groups overlapping along its first axis.",
              true,
              "An outer person on the left and an outer person on the right sit at opposite ends of any straight axis with the inner twelve between them, and PCA can only choose straight axes. Measured, the ring’s ordinary shares are 0.516 and 0.484, a round cloud spreading almost evenly, and the groups overlap by 40.2 units along the first axis. The radial kernel at a gamma of 0.005 puts every inner person on one side instead, with a clear stretch of 0.634 between the nearest pair, because its direction was found in a different space.",
            ),
            choice(
              "What is the observation the whole method rests on?",
              [
                "Any direction through the middle of a centred cloud is a weighted sum of the deviations, so a score needs only dot products between people",
                "The covariance matrix of the lifted people can be written down for the radial kernel after all",
                "A curved direction on the plane stays curved in the lifted space",
                "The Gram matrix has one row for each feature the people were measured on",
              ],
              0,
              "Once a direction is a recipe over the people, the direction’s own coordinates never appear, which is what lets feature space be anything at all. The radial kernel’s lifted space has no finite number of features, so its covariance matrix cannot be written down at any size, and the Gram matrix has one row per person however many features there were.",
            ),
            trueFalse(
              "Decomposing the four by four Gram matrix rather than the two by two scatter matrix gives different variances, since the two matrices are different sizes.",
              false,
              "The non-zero eigenvalues come out the same, 400 and 100, and the extra eigenvalues the larger matrix has are zero, because four people on a plane spread along two directions and no more. On the arc the twelve by twelve table gives 7055.88 and 3316.45 and then ten eigenvalues no larger than 4e−12, and the coordinates by the two routes agree to 1.35e−13.",
            ),
            choice(
              "The raw Gram eigenvalue on the measured four is 400. Which number is the variance along the direction, and which normalises the eigenvector?",
              [
                "The variance is 400 over three, and the eigenvector is divided by the square root of 400",
                "The variance is 400, and the eigenvector is divided by the square root of 400 over three",
                "Both are 400 over three",
                "Both are 400",
              ],
              0,
              "A sample variance carries the n − 1 divisor, while the direction the recipe names has length equal to the square root of the raw eigenvalue, which on the four is 20. Confusing the two leaves every coordinate off by the square root of n − 1, and the shares never notice, because a share is a ratio and the factor cancels.",
            ),
            several(
              "Which of these hold about centring the table?",
              [
                "Skipping it leaves a fit that runs to completion and reports a first direction pointing at the mean, with a share of 0.9989 on the measured four",
                "The centred table can be built from the uncentred one alone, since every term of the expansion is a kernel value or an average of kernel values",
                "The double average is added back because subtracting the row average and the column average removed the mean’s own piece twice",
                "The lifted people are shifted to their mean before the table is built",
              ],
              [0, 1, 2],
              "The lifted people cannot be written down, so they cannot be shifted; their table is corrected on their behalf, and on the measured four the identity turns the table of 38,484s back into the two blocks of section 5 exactly. Skip it and nothing raises. The uncentred table’s largest eigenvalue is 134,449.5, its eigenvector is nearly the same weight on everyone, which is the direction from the origin to the mean and describes no spread among the four at all, and on the arc the same share is 0.9896.",
            ),
        ],
        },
        {
          title: "Part 4. Swap the Table for a Kernel",
          content: (
            <>
              <SubSection title="11. The swap">
                <p>
                  Part 2 ended with a fit that reads one table of dot
                  products and nothing else. The kernel trick page&rsquo;s
                  claim is that a kernel answers what the dot product of two
                  lifted people would have been, without lifting them. Put
                  the two together and the whole method is one substitution.
                  Fill the table with kernel values instead of dot products,
                  centre it by section 9, and decompose it by section 6.
                </p>
                <Equation>{"K_ij = k(xᵢ, xⱼ)          linear:  a · b          radial:  exp(−γ ‖a − b‖²)"}</Equation>
                <p>
                  With the linear kernel the table is the Gram matrix and
                  every number in Part 2 comes back unchanged, which is the
                  control that says the machinery is right. With the radial
                  kernel each entry is a similarity, one for a person with
                  themselves and falling toward zero as two people separate,
                  at a rate gamma sets. Here is the arc&rsquo;s table under
                  it at a gamma of 0.002, with the people read by height so
                  that the bright band down the diagonal is the curve, one
                  neighbour at a time.
                </p>
                <KernelTable />
                <p>
                  The person at (120, 80), the short heavy end of the arc,
                  scores 1 with themselves, 0.460 with their neighbour at
                  (128, 62), 0.088 with the next, 0.002 with the fifth
                  person along, and below 0.001 with everyone past them. The person at (160,
                  33), the bottom of the dip, scores 0.873 with each of their
                  two neighbours and 0.969 with the twelfth person at (156,
                  33), who sits four centimetres away. Under this kernel the
                  fit reads who is near whom, and a person&rsquo;s height and
                  weight enter only through those distances.
                </p>
                <KeepInMind>
                  Kernel PCA is PCA on a table of kernel values. Nothing in
                  the decomposition changes, and the linear kernel reproduces
                  ordinary PCA to the last bit.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What a component is now">
                <>
<p>
                  The PCA page&rsquo;s first component was a statement about features, this direction leans on height by 0.71 and on weight by 0.71. Nothing of that kind exists here. The direction lives in the lifted space, whose coordinates have no names and, for the radial kernel, no finite count, so the only description a kernel component has is the recipe of section 4, one coefficient per training person.
                </p>
                <p>
                  On the ring at a gamma of 0.005 the first direction gives every one of the inner twelve a coefficient between 0.100 and 0.130 and every one of the outer twenty-four a coefficient between &minus;0.068 and &minus;0.048.
                </p>
</>
                <RowCoefficients />
                <>
                  <p>
                    The coefficients describe a direction by the training people that
                    contribute to it. With thirty-six people, convert its raw eigenvalue
                    into a sample variance using a divisor of thirty-five.
                  </p>
                  <Equation>{"sample variance ≈ 4.292 / 35 ≈ 0.123\nsquared coefficient length ≈ 1 / 4.292 ≈ 0.233"}</Equation>
                  <p>
                    These are two different uses of the eigenvalue. Neither is an
                    ordinary loading on an original input feature.
                  </p>
                </>
                <KeepInMind>
                  A kernel component is one weight per training person. It
                  can say which people it is made of, and there is no reading
                  of it in height and weight, because the direction has no
                  coordinates there.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Placing a person along it">
                <p>
                  A person&rsquo;s coordinate is section 4&rsquo;s sum with
                  the centred kernel row in place of the dot products. On the
                  ring, person 1 at (169.7, 60.3) has a raw kernel row
                  beginning 1, 0.864, 0.570 against the inner people and
                  ending in values near 0.0003 against the far side of the
                  outer ring, and after centring against the table that row
                  summed against the first direction&rsquo;s coefficients
                  gives 0.513.
                </p>
                <Equation>{"coordinate of x = Σᵢ aᵢ · K_c(x, xᵢ)"}</Equation>
                <InAModel title="Where the thirty-six land">
                  <p>
                    Along the first direction the inner twelve land between
                    0.429 and 0.560 and the outer twenty-four between
                    &minus;0.291 and &minus;0.205, so the nearest pair across
                    the two groups are 0.634 apart and nobody is on the wrong
                    side. The playground&rsquo;s right panel is exactly this
                    sum for every person, and dragging one inner person out
                    to the ring moves them across it.
                  </p>
                </InAModel>
                <KeepInMind>
                  A coordinate is a person&rsquo;s centred kernel row against
                  the coefficients. The lifted direction is never formed;
                  the coefficients and the training people stand in for it.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Perpendicular, and not unit length">
                <>
<p>
                  Two things are often said about these coefficient vectors, and one of them did not survive being measured. The first is that the directions are ordered by the variance along them, largest first, which is true and is checked at construction. The second is that the coefficient vectors of different components are not perpendicular to one another in the ordinary sense, only in the sense the kernel induces.
                </p>
                <p>
                  I measured it and found otherwise. On the ring the largest dot product between two directions&rsquo; coefficients is 2.7e&minus;18, and on the arc it is 2.1e&minus;17, which is zero to rounding, as it has to be, since they are eigenvectors of one symmetric table and were only scaled afterwards.
                </p>
</>
                <Equation>{"aᵢ · aⱼ = 0  for i ≠ j          aᵢ′ K_c aⱼ = 1 if i = j, else 0"}</Equation>
                <p>
                  What they are not is unit length. The scaling of section 7
                  leaves each with squared length one over its raw
                  eigenvalue, 0.0025 and 0.01 on the measured four, and the
                  thing that does come out as the identity is the coefficient
                  matrix with the centred table in the middle, to
                  7.8e&minus;16 on the ring. That second identity is the
                  statement that the lifted directions have unit length,
                  which is the fact the scaling was for.
                </p>
                <KeepInMind>
                  The coefficient vectors come out perpendicular in the
                  ordinary sense, with squared lengths of one over the raw
                  eigenvalue rather than one, and the identity the scaling
                  was for is the one with the centred table in the middle.
                  The claim that they are not perpendicular did not hold in
                  the numbers.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Reading the Rearranged Cloud",
          content: (
            <>
              <SubSection title="15. The ring comes apart">
                <>
<p>
                  Return to the playground with the ring, the radial kernel and gamma at 0.005. The first two directions have shares of 0.137 and 0.111 of a total lifted variance of 0.898, which is a small fraction against ordinary PCA&rsquo;s 0.516 and 0.484, and along the first of them the two groups are 0.634 apart where ordinary PCA had them overlapping by 40.2.
                </p>
                <p>
                  Both readings are correct and they are answering different questions. The radial kernel spreads the thirty-six along thirty-five directions with any spread at all, one fewer than the count of people, so no two of them can hold most of it, and the first still happens to be the one the ring is arranged around.
                </p>
</>
                <p>
                  Why that one? Under this kernel the inner twelve all score
                  high with one another, since they are all within about
                  twenty units, while each outer person scores near zero
                  with the far side of the ring and only modestly with their
                  neighbours. In the lifted space the twelve are one tight
                  bunch and the twenty-four are spread thin around it, and
                  the direction from the bunch to the rest is the direction
                  of most spread. The coefficients of section 12 are that
                  direction written out.
                </p>
                <KeepInMind>
                  A small share can carry the fact that matters. The kernel
                  spreads the lifted variance over nearly as many directions
                  as there are people, and the first direction&rsquo;s job is
                  to be the largest, whatever its share.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Sweeping the reach">
                <>
<p>
                  Gamma is the radial kernel&rsquo;s one setting, and the kernel trick page read it as a reach, one over its square root being roughly the distance at which two people stop scoring as alike. Sweep it across the ring and the split holds from a gamma of 0.003, a reach of about eighteen units, to 0.017, a reach of under eight, with the widest gap of 0.645 at 0.004.
                </p>
                <p>
                  At 0.002 the reach is twenty-two units, which is wider than the inner group itself, so an inner person and the nearest outer people score much alike, and the groups overlap by 0.966; at 0.02 the reach is seven units, every person resembles little more than their nearest neighbours, and they overlap again by 0.249.
                </p>
</>
                <ReachSweep />
                <>
<p>
                  The lines say what the bars cannot. The total lifted variance climbs from 0.292 at the widest reach to 0.998 at the sharpest, because a person who resembles nobody has a whole unit of spread to themselves, and the first share falls from 0.428 to 0.037 over the same sweep as that spread is dealt out one person at a time.
                </p>
                <p>
                  Neither line turns at the edges of the band where the split holds. The ideal case, a tighter eight inside a wider sixteen, holds its split from 0.0015 all the way to 0.1, with a widest gap of 0.981, because its eight are within about four units of one another and its sixteen about thirty-two units out, so there is a wide range of reaches that scores the eight alike and the sixteen unalike.
                </p>
</>
                <KeepInMind>
                  Too wide a reach scores everyone alike, so the kernel is
                  little more than a rotation, and too sharp a reach scores
                  each person alike only to themselves. The band between
                  them is a property of the data, and no number inside the
                  fit marks its edges.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The arc folds rather than unrolls">
                <>
<p>
                  The textbook picture for a curved pattern is that the kernel unrolls it, so that the first kernel direction reads position along the curve and the curve is gone. I measured it on the arc and that is not what happens. At a gamma of 0.002 the first kernel coordinates of the twelve, read by height, run &minus;0.49, &minus;0.44, &minus;0.07, 0.35, 0.58, 0.61, 0.58, 0.40, 0.05, &minus;0.37, &minus;0.63, &minus;0.57.
                </p>
                <p>
                  Both ends of the arc land on the same side and the middle on the other. The axis turns back five times where ordinary PCA&rsquo;s turned back not at all.
                </p>
</>
                <ArcFold />
                <>
<p>
                  The second direction runs &minus;0.36, &minus;0.63, &minus;0.66, &minus;0.45, &minus;0.15, 0.00, 0.14, 0.40, 0.59, 0.60, 0.40, 0.12, rising along the curve and turning down at each end, and the two together place the twelve on a curve again in the kernel plane. What the first direction found is the largest spread in the lifted space, and on a curve whose two ends are far from everything else, that is the ends against the middle.
                </p>
                <p>
                  Widen the reach and the fold loosens, one reversal at 0.0003 and two at 0.0005, but that is the kernel approaching a rotation, with shares of 0.526 and 0.370 against ordinary PCA&rsquo;s 0.680 and 0.320. Nothing in this fit straightens the arc. A method that does, one that reads distances along the curve rather than across it, is a different method and is not on this site.
                </p>
</>
                <KeepInMind>
                  The radial kernel found the arc&rsquo;s largest lifted
                  spread, which is its ends against its middle, and drew the
                  curve again. The claim that it unrolls the curve did not
                  hold here, and the reversal count is how to check it on
                  any other curve.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The squared kernel keeps the ring nested">
                <p>
                  The squared kernel is worth one measurement of its own,
                  because its lifted space contains the very feature the ring
                  is arranged around. The kernel trick page expanded it by
                  hand, and among its made-up columns are height squared and
                  weight squared, whose sum is the squared distance from the
                  origin, close to what separates the two groups. Yet at a
                  gamma of 0.005 the squared kernel&rsquo;s first two shares
                  are 0.652 and 0.347 and along the first direction the
                  groups overlap by 63.5.
                </p>
                <NumberTable
                  headings={["direction", "share", "inner and outer along it"]}
                  rows={[
                    ["first", "0.652", "overlap"],
                    ["second", "0.347", "overlap"],
                    ["third", "0.002", "overlap"],
                    ["fourth", "0.000", "overlap"],
                    ["fifth", "0.000", "come apart"],
                  ]}
                  caption="The ring under the squared kernel at a gamma of 0.005. The fifth direction, with a share below 0.00001, is the first that puts the inner twelve on one side of the outer twenty-four."
                />
                <p>
                  The radius is in the space and the method did not choose
                  it, because the largest spreads in that space are the outer
                  ring&rsquo;s swing in height squared and in weight squared,
                  which are enormous in raw units, and the direction that
                  separates the groups is the fifth on the list with a share
                  too small to print. The method finds the largest spread,
                  and the largest spread is not always the useful one, which
                  the PCA page said of ordinary components and which the
                  kernel does not repair.
                </p>
                <KeepInMind>
                  A kernel whose lifted space contains the right feature
                  does not guarantee that the first direction is that
                  feature. The direction of most spread is what the method
                  finds, in the lifted space as on the plane.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            trueFalse(
              "A kernel component has no reading as a loading on height and on weight; the only description it has is one coefficient per training person.",
              true,
              "Ordinary PCA’s first component leaned on height by 0.71 and on weight by 0.71, a statement about features. A kernel direction lives in the lifted space, whose coordinates have no names and, for the radial kernel, no finite count, so what is left is the recipe of section 4, which on the ring gives every inner person a coefficient between 0.100 and 0.130 and every outer person one between −0.068 and −0.048. That says which people the direction is made of and nothing about height or weight.",
            ),
            trueFalse(
              "The coefficient vectors of two different kernel components come out perpendicular in the ordinary sense.",
              true,
              "This is the claim that did not survive being measured the way it is usually stated. The largest dot product between two directions’ coefficients is 2.7e−18 on the ring and 2.1e−17 on the arc, which is zero to rounding, as it has to be since they are eigenvectors of one symmetric table and were only scaled afterwards. What they are not is unit length, each having squared length one over its raw eigenvalue.",
            ),
            choice(
              "On the ring at a gamma of 0.005 the first two shares are 0.137 and 0.111, against ordinary PCA’s 0.516 and 0.484. What follows?",
              [
                "The kernel spreads the thirty-six along thirty-five directions, so no two can hold most of the total, and the first still happens to be the one the ring is arranged around",
                "The kernel fit is the worse of the two, since it accounts for less of the variance",
                "The two sets of shares are not comparable, being computed on different people",
                "A share under a fifth means the direction is noise",
              ],
              0,
              "A small share can carry the fact that matters. Along that first direction the inner twelve land between 0.429 and 0.560 and the outer twenty-four between −0.291 and −0.205, so the two groups are 0.634 apart where ordinary PCA had them overlapping by 40.2.",
            ),
            choice(
              "What did measuring the arc at a gamma of 0.002 say about the claim that the kernel unrolls a curve?",
              [
                "It did not hold, since both ends of the arc land on one side and the middle on the other, and the axis turns back five times",
                "It held, since the first coordinates run in order along the curve",
                "It held for the first direction and failed for the second",
                "The arc cannot be fitted at that gamma",
              ],
              0,
              "Ordinary PCA’s first coordinates fall from 39.1 to −40.9 without once turning back, so it is the kernel that folds here and not the straight axis. The kernel finds the largest spread in the lifted space, and on a curve whose two ends are far from everything else that spread is the ends against the middle. The reversal count is how to check it on any other curve.",
            ),
            trueFalse(
              "The squared kernel’s lifted space contains height squared and weight squared, whose sum is close to what separates the ring, so its first direction separates the two groups.",
              false,
              "At a gamma of 0.005 its first two shares are 0.652 and 0.347 and the groups overlap by 63.5 along the first direction. The largest spreads in that space are the outer ring’s swing in height squared and in weight squared, which are enormous in raw units, and the direction that separates the groups is fifth on the list with a share too small to print. The method finds the largest spread, not the useful one.",
            ),
        ],
        },
        {
          title: "Part 6. No Way Back, and What to Choose",
          content: (
            <>
              <SubSection title="19. Why there is no reconstruction">
                <>
<p>
                  The PCA page rebuilt every person from one coordinate, by scaling the retained direction and adding the mean back, and landed among heights and weights because the direction was made of heights and weights. This fit offers no such step, and the omission is a decision. A kernel coordinate is a position along a direction in the lifted space, so scaling the direction by the coordinate rebuilds a lifted point, and going back means finding the person on the plane whose lift that is.
                </p>
                <p>
                  For the radial kernel there usually is none. The lifted space has no finite number of dimensions and the plane maps onto a thin curved sheet inside it, so a point rebuilt from two coordinates almost never lies on the sheet, and the question has no answer to approximate.
                </p>
</>
                <p>
                  What a fit can say instead is how much of each
                  person&rsquo;s distance from the lifted mean the kept
                  directions carry, which is the analogue of the PCA
                  page&rsquo;s stubs. Every person&rsquo;s squared lifted
                  deviation is the diagonal of the centred table, and the
                  kept part is the sum of their squared coordinates.
                </p>
                <Equation>{"kept share of person i = Σⱼ zᵢⱼ² / K_c(xᵢ, xᵢ)"}</Equation>
                <ShareLadder />
                <p>
                  On the ring with two directions kept, the fit holds 0.248
                  of the total, and per person it holds between 0.057 and
                  0.537, more for the inner twelve than for the outer
                  twenty-four, because the first direction is largely about
                  them. The linear kernel is the one case where a way back
                  would exist, and the fit does not offer one there either,
                  since a method that answers exactly for one kernel and not
                  at all for the rest is worse than one that refuses, and the
                  exact case is the PCA page.
                </p>
                <KeepInMind>
                  There is no inverse transform because the pre-image
                  problem has no closed-form solution for a radial kernel.
                  What the fit keeps is one coefficient per training person
                  and the training table a new person&rsquo;s row is centred
                  against, and nothing that claims to be a height or a
                  weight.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Choosing gamma">
                <>
<p>
                  Nothing inside the fit chooses gamma. The total lifted variance and the top shares move monotonically across the whole sweep of section 16 and say nothing about where the ring comes apart, and the fit reports no error to minimise since there is no reconstruction. The usual rule of thumb is to set gamma to one over the median squared distance between pairs of people, and on the ring that median is 1051.5, so the rule gives 0.00095.
                </p>
                <p>
                  I measured it, and at that reach the groups overlap by 0.992; the split needs a gamma at least three times larger. On the ideal case the rule gives 0.00088 and the split begins at 0.0015, so the rule falls short there too, by less.
                </p>
</>
                <InAModel title="What chooses it, then">
                  <p>
                    A downstream use. If the coordinates feed a classifier,
                    its held-out score across a sweep chooses gamma the way
                    the kernel trick page chose it for the support vector
                    classifier; if they feed a picture, the picture does. The
                    band on the ring, 0.003 to 0.017, is a fact about the
                    ring, and a reach set from the median distance of a
                    different pattern would miss it.
                  </p>
                </InAModel>
                <KeepInMind>
                  Gamma is chosen from outside the fit, by what the
                  coordinates are for. The median-distance rule gave 0.00095
                  on the ring and the split needed 0.003, so it is a starting
                  point for a sweep.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Choosing how many">
                <p>
                  Ordinary PCA on two features has two directions to keep or
                  drop. Here the ceiling is the number of people, less one
                  for centring, and on the ring the radial kernel at 0.005
                  finds spread along thirty-five directions. Their cumulative
                  shares climb slowly, five directions to pass half the
                  total, thirteen to pass nine tenths, all thirty-five to
                  reach the whole of it. The PCA page&rsquo;s rule of thumb,
                  keep enough for 95 percent, would keep sixteen or more, and
                  the ring came apart along the first one alone.
                </p>
                <p>
                  So the cumulative share is the wrong yardstick when the
                  coordinates are for separating groups, and it is the right
                  one when they are for holding as much of each
                  person&rsquo;s lifted deviation as possible, which the
                  ladder in section 19 shows climbing with the count. The two
                  purposes want different counts from the same fit, as they
                  did on the PCA page, and the count is a choice made by
                  naming the purpose.
                </p>
                <KeepInMind>
                  The count of kernel components is bounded by the number of
                  people, and the running share climbs slowly under a sharp
                  kernel. Keep one or two for a picture or a separation and
                  many for a faithful lifted description, and say which.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Units are part of the kernel">
                <p>
                  The radial kernel measures distance, and the distance here
                  mixes centimetres with kilograms, so a gamma is a number
                  in those mixed units. Write height in metres instead of
                  centimetres and refit the arc at the same gamma of 0.002,
                  and the first share is 0.680 where centimetres gave 0.315.
                  The heights have shrunk to a hundredth, so the distances
                  are almost entirely weight now, and with the first share
                  back at ordinary PCA&rsquo;s 0.680 the kernel&rsquo;s answer
                  has the shape of a rotation again.
                </p>
                <p>
                  The kernel trick page&rsquo;s remedy holds here. Standardise
                  the features first, so a unit of distance means one
                  standard deviation in either, and then choose gamma. This
                  page keeps raw units because the ring and the arc were
                  drawn with their two spreads already comparable, thirty
                  units either way on the ring and eighty against forty-seven
                  on the arc, and the choice is stated rather than hidden.
                </p>
                <KeepInMind>
                  A gamma tuned on one set of units is a different kernel on
                  another. Standardise before a radial kernel unless the
                  features already share a scale, and say which was done.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="23. What a complete implementation must specify">
                <p>
                  A complete implementation states the kernel and its
                  parameters in full, that the table is centred by the
                  identity of section 9 and new rows by section 10&rsquo;s,
                  how many directions are kept and that the ceiling is the
                  row count, that eigenvalues are reported over n &minus; 1
                  as variances while the eigenvectors are normalised by the
                  square root of the raw eigenvalue, that the total variance
                  is summed before any truncation, the threshold below which
                  an eigenvalue is treated as the zero that centring created
                  rather than divided by, that a negative eigenvalue is
                  clamped rather than refused, the order of the directions,
                  that a sign is the solver&rsquo;s, that there is no inverse
                  transform, and that the training rows and the training
                  table are part of the fitted state.
                </p>
                <KeepInMind>
                  Two of those are the ones that go wrong quietly, the two
                  scales of one eigenvalue and the centring of a new row,
                  because both produce a fit that runs and separates the
                  data and is wrong by a factor nobody can see.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The edges, each one probed">
                <p>
                  Every row below was run through this
                  page&rsquo;s own endpoints, and the behaviour recorded is
                  what came back rather than what the documentation
                  promises. Where a number appears it was read from the
                  probe.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no features, or an empty column", reason: "refused at the boundary, by the same guard every feature here passes through." },
                    { expression: "one person", reason: "refused; a decomposition needs at least two rows, and the endpoints refuse a single point a layer earlier." },
                    { expression: "two people", reason: "accepted, and fits with one direction, since two centred rows span one." },
                    { expression: "three identical people", reason: "refused, because the centred table is all zeros and there is no direction with any spread to keep; the refusal names the missing component." },
                    { expression: "a constant column", reason: "accepted; four people with one weight fit under the radial kernel with three directions, and the column contributes nothing to any distance." },
                    { expression: "a non-finite value", reason: "refused at the boundary; the endpoints refuse it earlier still, since a NaN cannot be written as JSON." },
                    { expression: "five directions asked of four people", reason: "refused at the fit, with both counts named, since the table has only four rows." },
                    { expression: "four directions asked of four people on a plane", reason: "accepted, and two come back; the other two eigenvalues are the zeros centring and a plane leave behind, and asking past the rank is answered with what exists rather than refused." },
                    { expression: "twelve directions asked of the twelve on the arc", reason: "accepted, and eleven come back, one fewer than the people, because centring removes one." },
                    { expression: "zero directions, a gamma of zero, or a negative polynomial constant", reason: "refused at construction, before any data is seen; at a gamma of zero every pair scores one and there is nothing to fit." },
                    { expression: "transform before fit", reason: "refused as not fitted, in a sentence rather than as an attribute error." },
                    { expression: "transform with a feature missing, or under another name", reason: "refused; a kernel pairs rows over exactly the fitted features. The same features in another order are matched by name and accepted, and the coordinates agree to 0.0." },
                    { expression: "a polynomial kernel of degree 200 on raw units", reason: "the powers overflow and the table is refused for holding a non-finite value, naming unscaled features as the usual cause; the endpoints fix the degree at two." },
                    { expression: "a sigmoid kernel that is not a kernel", reason: "accepted, and quietly. On the arc at a gamma of 0.0001 the centred table has five negative eigenvalues, the most negative at −0.0365 against a largest of 0.0140, and the fit clamps them to zero and reports a first share of 0.9989. Documented rather than defended." },
                    { expression: "two strangers far from everyone", reason: "accepted, and both land at the same spot, (−0.2291, −0.0433) on the arc's fit, 0.0 apart, because a raw kernel row of zeros centres to minus the mean row whoever the stranger is." },
                    { expression: "centring a query row against itself", reason: "refused, since the identity needs a square table and a query row is 1 by n; the leak of section 10 cannot be written." },
                    { expression: "height in metres at the same gamma", reason: "accepted, and the first share moves from 0.315 to 0.680; nothing raises, and section 22 is the only witness." },
                  ]}
                />
                <>
<p>
                  The sigmoid row and the strangers row deserve the most care, because both are quiet. A negative eigenvalue means the table did not come from any lifted space at all, and the fit discards that spread and reports a share near one as if it had found something; kernel ridge on this site refuses the same table through its solve, and this fit does not.
                </p>
                <p>
                  And a person the kernel scores at zero against everyone is placed at one fixed spot, whoever they are, which is the right arithmetic and a useless answer, and the only sign of it is that every stranger lands there.
                </p>
</>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            choice(
              "Why does this fit offer no way back from a coordinate to a height and a weight?",
              [
                "The plane maps onto a thin curved sheet inside the lifted space, so a point rebuilt from two coordinates almost never lies on the sheet and the question has no answer to approximate",
                "The coordinates cannot be inverted because the coefficient vectors are not unit length",
                "The centring identity cannot be undone once it has been applied",
                "It could be offered for every kernel and has simply not been written",
              ],
              0,
              "The linear kernel is the one case where a way back would exist, and the fit declines there too, since a method that answers exactly for one kernel and not at all for the rest is worse than one that refuses. What it reports instead is how much of each person’s lifted deviation the kept directions carry, which on the ring with two kept is 0.248 of the total and between 0.057 and 0.537 per person.",
            ),
            trueFalse(
              "Setting gamma to one over the median squared distance between pairs gives a reach that separates the ring.",
              false,
              "The median on the ring is 1051.5, so the rule gives 0.00095, and at that reach the groups overlap by 0.992. The split needs a gamma at least three times larger, and on the ideal case the rule gives 0.00088 where the split begins at 0.0015. It is a starting point for a sweep rather than an answer, and nothing inside the fit chooses gamma at all.",
            ),
            trueFalse(
              "Keeping enough directions for 95 percent of the total is the wrong yardstick when the coordinates are for separating groups.",
              true,
              "On the ring at a gamma of 0.005 that rule would keep sixteen or more, and the ring came apart along the first direction alone. It is the right yardstick when the coordinates are for holding as much of each person’s lifted deviation as possible, so the two purposes want different counts from the same fit and the count is a choice made by naming the purpose.",
            ),
            several(
              "Which of these does the fit do quietly rather than refuse?",
              [
                "Discard the spread of a negative eigenvalue and report a share near one as if it had found something",
                "Place a person the kernel scores at zero against everyone at one fixed spot, whoever they are",
                "Centre a query row against itself without raising anything",
                "Refuse an uncentred table before decomposing it",
              ],
              [0, 1],
              "A negative eigenvalue means the table did not come from any lifted space at all, and kernel ridge on this site refuses the same table through its solve where this fit does not. A stranger’s placement is the right arithmetic and a useless answer, and the only sign is that every stranger lands there. Centring a query row against itself cannot happen by accident, since the identity is defined only for a square table and a row of one person against twelve is refused with its shape named, and an uncentred table is not refused either.",
            ),
            trueFalse(
              "Writing the arc’s heights in metres rather than centimetres and refitting at the same gamma of 0.002 leaves the kernel’s answer unchanged, since the centring undoes any rescaling.",
              false,
              "The radial kernel measures distance, and the distance mixes the two units, so a gamma is a number in those mixed units and centring does nothing about it. With the heights shrunk to a hundredth the distances are almost entirely weight, and the first share comes out at 0.680 where centimetres gave 0.315, which is ordinary PCA’s 0.680 again, the shape of a rotation. Nothing raises, and standardising the features before choosing gamma is the remedy.",
            ),
        ],
        },
        {
          title: "Practice. Decomposing the Ring and the Arc With the Library",
          practice: [
            exercise(
              "Run PCA through the Gram matrix on the measured four",
              ["Part 2 decomposed the four by four Gram matrix of the measured four and found the same eigenvalues as the scatter matrix, 400 and 100, with the recipe for the first direction scaled to 0.0354 on persons 1 and 2 and zero on the rest, and person 1 landing at 14.14. Fit the library’s kernel decomposition under the linear kernel and read those numbers off it, then fit ordinary PCA beside it as the control.", "The library reports each direction’s variance, which is the raw eigenvalue over n − 1, so multiplying back by three recovers 400 and 100. A sign on any direction is the solver’s choice, so the coefficients may come back negated and the coordinate is read with its sign dropped. Then ask for five directions from four people, which Part 7 says is refused with both counts named."],
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, LinearKernel, MLLibError, PrincipalComponentAnalysis

heights = [180, 160, 175, 165]
weights = [78, 58, 63, 73]
people = [Feature("height", heights), Feature("weight", weights)]

# Fit the kernel decomposition under the linear kernel. For each component
# print its variance, the raw Gram eigenvalue that variance implies, and its
# row coefficients. Print how far person 1 lands along the first direction,
# sign dropped, then ordinary PCA's variances on the same four. Finally ask
# for five directions from the four people and print the refusal.`,
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, LinearKernel, MLLibError, PrincipalComponentAnalysis

heights = [180, 160, 175, 165]
weights = [78, 58, 63, 73]
people = [Feature("height", heights), Feature("weight", weights)]

model = KernelPrincipalComponentAnalysis(kernel=LinearKernel()).fit(people)
for component in model.components:
    raw = component.variance * (len(heights) - 1)
    coefficients = [round(float(value), 4) for value in component.row_coefficients]
    print(f"{component.name}: variance {component.variance:.2f}, raw eigenvalue {raw:.1f}, coefficients {coefficients}")

first = model.transform(people)[0]
print(f"person 1 along the first direction, sign dropped {abs(float(first.values[0])):.4f}")

ordinary = PrincipalComponentAnalysis().fit(people)
print(f"ordinary PCA variances {[round(float(component.variance), 2) for component in ordinary.components]}")

try:
    KernelPrincipalComponentAnalysis(n_components=5).fit(people)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,
              `kernel_component_1: variance 133.33, raw eigenvalue 400.0, coefficients [-0.0354, 0.0354, 0.0, 0.0]
kernel_component_2: variance 33.33, raw eigenvalue 100.0, coefficients [0.0, 0.0, -0.0707, 0.0707]
person 1 along the first direction, sign dropped 14.1421
ordinary PCA variances [133.33, 33.33]
InvalidValuesError: cannot keep 5 components from 4 rows`,
              { hints: ["KernelPrincipalComponentAnalysis takes a kernel and, optionally, n_components; left unset it keeps every direction with any spread. fit takes the list of Features and nothing else, since there is no target.", "The fitted components can be iterated, and each one has a name, a variance and row_coefficients, one weight per training person. PrincipalComponentAnalysis has components with a variance each in the same way.", "transform answers a list of Features, one per kept direction, named kernel_component_1 upward, and each holds one coordinate per person in the order given.", "Asking for more directions than there are rows is refused from fit with one of the library’s own errors, so catching MLLibError catches it."], check: numberCheck("What variance does the first kernel direction report on the measured four?", 133.33, 0.01, "The raw Gram eigenvalue is 400 and there are four people, so the sample variance is 400 over 3, which is the number ordinary PCA reports for the same direction. The coefficients are normalised by the square root of the raw 400 rather than of 133.33, which is why they come out at 0.0354 in size and why person 1 lands 14.14 from the centre, where ordinary PCA’s projection of (10, 10) onto (0.707, 0.707) also lands.") },
            ),
            exercise(
              "Take the ring apart along the first kernel direction",
              ["Part 5 returns to the ring with the radial kernel at a gamma of 0.005 and finds shares of 0.137 and 0.111 of a total lifted variance of 0.898, with the inner twelve landing between 0.429 and 0.560 along the first direction and the outer twenty-four between −0.291 and −0.205, a clear stretch of 0.634 between the nearest pair. Fit it, read the coordinates, and measure the stretch yourself.", "The first twelve people in the data are the inner group and the rest the ring. The gap is the smaller group’s nearest edge against the other’s, taken whichever way round the solver signed the direction, so it comes out positive when the groups are apart and negative by the amount they overlap. Ordinary PCA on the same thirty-six should give shares of 0.516 and 0.484 and an overlap of 40.2."],
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

heights = [169.7, 167.2, 164.8, 160.6, 155.7, 150.1, 150.1, 151.1, 155.5, 159.9, 164.1, 168.5,
           190.0, 190.1, 185.6, 181.2, 172.3, 166.3, 159.4, 150.3, 145.8, 140.2, 132.5, 131.4,
           129.8, 130.6, 133.5, 140.9, 145.6, 152.5, 160.0, 166.3, 173.5, 179.6, 186.9, 188.0]
weights = [60.3, 65.1, 69.7, 69.2, 68.4, 64.6, 61.2, 53.9, 50.7, 49.4, 52.0, 54.5,
           58.8, 67.8, 74.8, 81.6, 85.9, 89.0, 89.5, 87.3, 87.5, 82.1, 75.2, 70.0,
           62.2, 52.1, 44.9, 38.2, 33.9, 31.8, 30.3, 31.9, 31.7, 38.4, 45.6, 51.0]
ring = [Feature("height", heights), Feature("weight", weights)]

# Fit the radial kernel at gamma 0.005 keeping two directions, and print the
# two shares and the total lifted variance. Read every person's first
# coordinate, print the range of the inner twelve and of the outer
# twenty-four, and print the gap between the groups, which is negative if
# they overlap. Then do the same for ordinary PCA's first axis.`,
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

heights = [169.7, 167.2, 164.8, 160.6, 155.7, 150.1, 150.1, 151.1, 155.5, 159.9, 164.1, 168.5,
           190.0, 190.1, 185.6, 181.2, 172.3, 166.3, 159.4, 150.3, 145.8, 140.2, 132.5, 131.4,
           129.8, 130.6, 133.5, 140.9, 145.6, 152.5, 160.0, 166.3, 173.5, 179.6, 186.9, 188.0]
weights = [60.3, 65.1, 69.7, 69.2, 68.4, 64.6, 61.2, 53.9, 50.7, 49.4, 52.0, 54.5,
           58.8, 67.8, 74.8, 81.6, 85.9, 89.0, 89.5, 87.3, 87.5, 82.1, 75.2, 70.0,
           62.2, 52.1, 44.9, 38.2, 33.9, 31.8, 30.3, 31.9, 31.7, 38.4, 45.6, 51.0]
ring = [Feature("height", heights), Feature("weight", weights)]

model = KernelPrincipalComponentAnalysis(kernel=RadialBasisKernel(gamma=0.005), n_components=2).fit(ring)
shares = [round(float(share), 3) for share in model.components.variance_shares]
print(f"kernel shares {shares} of a total lifted variance of {model.components.total_variance:.3f}")

first = [float(value) for value in model.transform(ring)[0].values]
inner, outer = first[:12], first[12:]
gap = max(min(inner) - max(outer), min(outer) - max(inner))
print(f"inner twelve from {min(inner):.3f} to {max(inner):.3f}, outer twenty-four from {min(outer):.3f} to {max(outer):.3f}")
print(f"gap between the groups along the first direction {gap:.3f}")

ordinary = PrincipalComponentAnalysis().fit(ring)
plain = [float(value) for value in ordinary.transform(ring)[0].values]
overlap = max(min(plain[:12]) - max(plain[12:]), min(plain[12:]) - max(plain[:12]))
print(f"ordinary shares {[round(float(share), 3) for share in ordinary.components.variance_shares]}, gap {overlap:.1f}")`,
              `kernel shares [0.137, 0.111] of a total lifted variance of 0.898
inner twelve from 0.429 to 0.560, outer twenty-four from -0.291 to -0.205
gap between the groups along the first direction 0.634
ordinary shares [0.516, 0.484], gap -40.2`,
              { hints: ["RadialBasisKernel takes gamma, and n_components=2 keeps the first two directions. The fitted components have variance_shares and total_variance.", "transform answers one Feature per kept direction, so the first direction’s coordinates are the values of the first one, in the order the people were given, which puts the inner twelve first.", "A sign on a direction is the solver’s choice, so take the gap as the larger of the two differences, the inner minimum less the outer maximum and the outer minimum less the inner maximum. One of them is the stretch between the groups and the other is far negative."], check: numberCheck("How wide is the empty stretch between the inner twelve and the outer twenty-four along the first kernel direction?", 0.634, 0.001, "The inner twelve land between 0.429 and 0.560 and the outer twenty-four between −0.291 and −0.205, so the nearest pair across the groups are 0.634 apart and nobody is on the wrong side. Ordinary PCA, which can only rotate the plane, leaves the groups overlapping by 40.2 along its first axis. The kernel’s shares of 0.137 and 0.111 are small because the lifted variance is spread over thirty-five directions, and the first still carries the fact the ring is arranged around.") },
            ),
            exercise(
              "Sweep the reach and find the band where the ring comes apart",
              ["Part 5 sweeps gamma across the ring and reports that the split holds from 0.003 to 0.017, with the widest gap of 0.645 at 0.004, an overlap of 0.966 at 0.002 and of 0.249 at 0.02, while the total lifted variance climbs and the first share falls across the whole sweep. Refit at seven gammas and print the reach, the first share, the total and the gap at each.", "The page quotes the gap only at the band’s edges and its widest point. What the gap does inside the band, at 0.003, 0.01 and 0.017, is yours to read."],
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, RadialBasisKernel

heights = [169.7, 167.2, 164.8, 160.6, 155.7, 150.1, 150.1, 151.1, 155.5, 159.9, 164.1, 168.5,
           190.0, 190.1, 185.6, 181.2, 172.3, 166.3, 159.4, 150.3, 145.8, 140.2, 132.5, 131.4,
           129.8, 130.6, 133.5, 140.9, 145.6, 152.5, 160.0, 166.3, 173.5, 179.6, 186.9, 188.0]
weights = [60.3, 65.1, 69.7, 69.2, 68.4, 64.6, 61.2, 53.9, 50.7, 49.4, 52.0, 54.5,
           58.8, 67.8, 74.8, 81.6, 85.9, 89.0, 89.5, 87.3, 87.5, 82.1, 75.2, 70.0,
           62.2, 52.1, 44.9, 38.2, 33.9, 31.8, 30.3, 31.9, 31.7, 38.4, 45.6, 51.0]
ring = [Feature("height", heights), Feature("weight", weights)]

for gamma in (0.002, 0.003, 0.004, 0.005, 0.01, 0.017, 0.02):
    # Fit the radial kernel at this gamma keeping two directions, and print
    # the reach (one over the square root of gamma), the first share, the
    # total lifted variance, and the gap between the inner twelve and the
    # outer twenty-four along the first direction.
    pass`,
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, RadialBasisKernel

heights = [169.7, 167.2, 164.8, 160.6, 155.7, 150.1, 150.1, 151.1, 155.5, 159.9, 164.1, 168.5,
           190.0, 190.1, 185.6, 181.2, 172.3, 166.3, 159.4, 150.3, 145.8, 140.2, 132.5, 131.4,
           129.8, 130.6, 133.5, 140.9, 145.6, 152.5, 160.0, 166.3, 173.5, 179.6, 186.9, 188.0]
weights = [60.3, 65.1, 69.7, 69.2, 68.4, 64.6, 61.2, 53.9, 50.7, 49.4, 52.0, 54.5,
           58.8, 67.8, 74.8, 81.6, 85.9, 89.0, 89.5, 87.3, 87.5, 82.1, 75.2, 70.0,
           62.2, 52.1, 44.9, 38.2, 33.9, 31.8, 30.3, 31.9, 31.7, 38.4, 45.6, 51.0]
ring = [Feature("height", heights), Feature("weight", weights)]

for gamma in (0.002, 0.003, 0.004, 0.005, 0.01, 0.017, 0.02):
    kernel = RadialBasisKernel(gamma=gamma)
    model = KernelPrincipalComponentAnalysis(kernel=kernel, n_components=2).fit(ring)
    first = [float(value) for value in model.transform(ring)[0].values]
    gap = max(min(first[:12]) - max(first[12:]), min(first[12:]) - max(first[:12]))
    share = float(model.components.variance_shares[0])
    total = model.components.total_variance
    print(f"gamma {gamma}: reach {gamma ** -0.5:.1f}, first share {share:.3f}, total {total:.3f}, gap {gap:.3f}")`,
              `gamma 0.002: reach 22.4, first share 0.205, total 0.761, gap -0.966
gamma 0.003: reach 18.3, first share 0.159, total 0.833, gap 0.519
gamma 0.004: reach 15.8, first share 0.148, total 0.873, gap 0.645
gamma 0.005: reach 14.1, first share 0.137, total 0.898, gap 0.634
gamma 0.01: reach 10.0, first share 0.097, total 0.948, gap 0.477
gamma 0.017: reach 7.7, first share 0.072, total 0.969, gap 0.091
gamma 0.02: reach 7.1, first share 0.067, total 0.974, gap -0.249`,
              { hints: ["Each gamma needs its own RadialBasisKernel and its own fit, since both the kernel and the directions change with it.", "The gap is the same calculation as the previous problem, the larger of the inner minimum less the outer maximum and the outer minimum less the inner maximum, read off the first transformed Feature.", "The reach is a number the page derives rather than the library, one over the square root of gamma, which in Python is gamma to the power of minus a half."], check: numberCheck("What is the gap between the two groups at a gamma of 0.01?", 0.477, 0.001, "At 0.01 the reach is ten units, inside the band from 0.003 to 0.017 where the split holds, and the gap has already fallen from its widest of 0.645 at 0.004 toward the 0.091 at 0.017, past which the groups overlap again. A sharper reach scores each person alike only to their nearest neighbours, which is why the total lifted variance keeps climbing toward one and the first share keeps falling, and neither of those lines turns at the band’s edges.") },
            ),
            exercise(
              "Count how often the arc folds",
              ["Part 5 measured the arc at a gamma of 0.002 and found that the first kernel coordinates, read by height, run −0.49, −0.44, −0.07, 0.35, 0.58, 0.61, 0.58, 0.40, 0.05, −0.37, −0.63, −0.57, turning back five times where ordinary PCA’s run from 39.1 to −40.9 without turning once. Fit both on the twelve and count the reversals yourself.", "The twelfth person in the data sits at 156 centimetres, so the people have to be ordered by height before the coordinates are read along the curve. A sign is the solver’s choice, and the count comes out the same either way up. The kernel’s second share is a number the page does not print."],
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

heights = [120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 156]
weights = [80, 62, 49, 40, 35, 33, 35, 40, 49, 62, 80, 33]
arc = [Feature("height", heights), Feature("weight", weights)]
by_height = sorted(range(12), key=lambda person: heights[person])

kernel = KernelPrincipalComponentAnalysis(kernel=RadialBasisKernel(gamma=0.002), n_components=2)
for label, model in (("kernel", kernel), ("ordinary", PrincipalComponentAnalysis())):
    # Fit, read every person's first coordinate, and order the coordinates
    # by height. Count how many times the ordered list turns back, which is
    # the smaller of the number of falls and the number of rises between
    # neighbours. Print the ordered list, the shares and the count.
    pass`,
              `from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

heights = [120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 156]
weights = [80, 62, 49, 40, 35, 33, 35, 40, 49, 62, 80, 33]
arc = [Feature("height", heights), Feature("weight", weights)]
by_height = sorted(range(12), key=lambda person: heights[person])

kernel = KernelPrincipalComponentAnalysis(kernel=RadialBasisKernel(gamma=0.002), n_components=2)
for label, model in (("kernel", kernel), ("ordinary", PrincipalComponentAnalysis())):
    first = [float(value) for value in model.fit(arc).transform(arc)[0].values]
    ordered = [first[person] for person in by_height]
    steps = [later - earlier for earlier, later in zip(ordered, ordered[1:])]
    reversals = min(sum(step < 0 for step in steps), sum(step > 0 for step in steps))
    shares = [round(float(share), 3) for share in model.components.variance_shares]
    print(f"{label} first coordinate by height {[round(value, 2) for value in ordered]}")
    print(f"{label} shares {shares}, reversals {reversals}")`,
              `kernel first coordinate by height [-0.49, -0.44, -0.07, 0.35, 0.58, 0.61, 0.58, 0.4, 0.05, -0.37, -0.63, -0.57]
kernel shares [0.315, 0.27], reversals 5
ordinary first coordinate by height [39.12, 31.44, 23.68, 15.84, 7.93, 3.97, -0.03, -8.06, -16.15, -24.31, -32.55, -40.87]
ordinary shares [0.68, 0.32], reversals 0`,
              { hints: ["Both models fit on the same list of two Features and both answer transform as a list of Features, so the first direction’s coordinates are the values of the first one for either model.", "by_height holds the positions of the people from shortest to tallest, so indexing the coordinates by it gives the list the page reads.", "A reversal count is the smaller of the number of negative steps and the number of positive steps between neighbours in the ordered list. A list that only falls has no positive steps and counts zero."], check: numberCheck("How many times does the first kernel coordinate turn back when the twelve are read by height?", 5, 0.5, "Both ends of the arc land on one side and the middle on the other, so the coordinate rises and falls five times where ordinary PCA’s falls from 39.1 to −40.9 without turning once. The kernel found the largest spread in the lifted space, which on a curve whose ends are far from everything else is the ends against the middle, and it drew the curve again rather than unrolling it.") },
            ),
          ],
        },
      ]}
    />
  );
}
