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
import { ArcFold } from "@/components/widgets/ArcFold";
import { GramRouteTable } from "@/components/widgets/GramRouteTable";
import { KernelPcaPlayground } from "@/components/widgets/KernelPcaPlayground";
import { KernelTable } from "@/components/widgets/KernelTable";
import { LiftedCentring } from "@/components/widgets/LiftedCentring";
import { ReachSweep } from "@/components/widgets/ReachSweep";
import { RowCoefficients } from "@/components/widgets/RowCoefficients";
import { ShareLadder } from "@/components/widgets/ShareLadder";

export const metadata: Metadata = pageMetadata("/concepts/kernel-pca", {
  title: "Kernel Principal Components · Perceptron Lab",
  description:
    "Useful variation can become easier to represent after a nonlinear transformation. Kernel PCA uses comparisons between examples to find principal directions in that transformed space.",
});

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelPcaPage() {
  return (
    <ConceptPage
      lessonId="kernel-pca"
      intuition={lessonIntuitions["kernel-pca"]}
      technicalStart="Part 2. PCA Written With Inner Products"
      openingTitle="When the Pattern Follows a Curve"
      playgroundTitle="Compare straight and curved representations of the points"
      playgroundIntro="Compare ordinary PCA with the kernel projection. Keep track of which plot uses the original coordinates and which uses the new components."
      title="Kernel Principal Components"
      tagline={"Useful variation can become easier to represent after a nonlinear transformation. Kernel PCA uses comparisons between examples to find principal directions in that transformed space."}
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

          . The PCA lesson explains eigenvectors and supplies the four height and weight measurements we reuse. The kernel lesson explains transformed features and the radial kernel&apos;s reach. We will bring those ideas together here, then work out how to center transformed observations using their kernel comparisons.
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
<p>The plot contains thirty-six height and weight pairs. Twelve lie near 160 centimeters and 60 kilograms. The other twenty-four form a ring around them, about thirty coordinate units from that center. This is a deliberately constructed example so we can investigate a particular limitation of ordinary PCA.</p>
                <p>Distance from the center distinguishes the inner and outer groups. A projection onto one straight axis mixes them: points on opposite sides of the outer ring project to opposite ends, with the inner group between them. Enable ordinary PCA above and inspect that overlap before changing the representation.</p>
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
                  The PCA lesson used twelve people arranged along a curve. Its first linear component accounted for 68 percent of the variance, and reconstruction from one coordinate had an error of 3,316. We will keep those measurements as our comparison when investigating whether a kernel representation helps.
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
                <p>Ordinary PCA assigns a score by combining the original coordinates with fixed weights. In the ring picture, positions on opposite sides receive very different scores even though both belong to the outer ring. A useful alternative score could depend on distance from the middle instead.</p>
              <p>Kernel PCA performs a linear PCA calculation in a different feature representation. A straight projection there can become a nonlinear function of the original height and weight. The kernel supplies inner products in that representation. This does not guarantee that the resulting components discover our intended groups; it gives us a different family of variation to examine.</p>
                <Equation>{"score(x) = w · φ(x)"}</Equation>
                <p>The radial kernel represents comparisons in a feature space with no finite number of coordinates. We cannot build its full covariance matrix as we did for ordinary PCA. We can still ask for directions of greatest spread, provided we express the calculation using comparisons between the observed people instead.</p>
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
                <p>Use the PCA example’s four centered observations: (10, 10), (−10, −10), (5, −5) and (−5, 5). Their first component was (0.707, 0.707). A principal direction with nonzero variance lies in the span of the centered observations, so we can describe it as a weighted sum of those observations. That is the property the following calculation uses.</p>
                <Equation>{"u = Σᵢ aᵢ dᵢ\n(0.707, 0.707) = 0.0354 · (10, 10) − 0.0354 · (−10, −10) + 0 · (5, −5) + 0 · (−5, 5)"}</Equation>
                <p>Projecting onto a weighted sum of observations becomes a weighted sum of inner products with those observations. We can therefore calculate a new person’s coordinate using pairwise comparisons, without writing down the principal direction’s feature coordinates.</p>
                <Equation>{"score of person j = dⱼ · u = Σᵢ aᵢ (dⱼ · dᵢ)"}</Equation>
                <WorkedExample title="Person 1 on the four height and weight measurements">
                  <>
                    <p>

                      The new person’s centered dot products with the four training
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
                  the four height and weight measurements, centered, it is two blocks and nothing
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

                    Write the centered people as the rows of X, so the scatter
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
                  normalize the eigenvector by the square root of the raw
                  eigenvalue. Confusing the two leaves every coordinate off
                  by &radic;(n &minus; 1), and the shares never notice,
                  because a share is a ratio and the factor cancels.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        { id: "part-3-centring-a-cloud-you-cannot-see",
          title: "Part 3. Centering a Cloud You Cannot See",
          content: (
            <>
              <SubSection title="8. What the uncentered table sees" id="8-what-the-uncentred-table-sees">
                <>
<p>
                  Everything in Part 2 used deviations from the mean. Build the Gram matrix from the people as measured instead, with person 1 at (180, 78) rather than (10, 10), and every entry is enormous, 38,484 for person 1 with themselves, 33,324 with person 2, because the whole cloud lies far from the origin and every dot product mostly measures that.
                </p>
                <p>The uncentered table’s largest eigenvalue is 134,449.5, accounting for 0.9989 of its trace. Its observation coefficients are approximately (−0.53, −0.46, −0.51, −0.49). In this example the large offset from the origin dominates the result. The direction can still contain some variation among observations; it is not a measure of centered spread alone.</p>
</>
                <LiftedCentring />
                <p>

                  The PCA page could show this by drawing the cloud and the
                  origin on one picture, and section 4 there did. Here there
                  is no picture to draw, because the points that need
                  centering are the lifted ones, and the uncentered
                  table&rsquo;s first direction would be reported as a fit
                  with a share of 0.9989 and nothing to warn anyone. On the
                  arc the same share is 0.9896.
                </p>
                <KeepInMind>

                  Without centering, the second-moment calculation mixes spread around the mean with the mean’s displacement from the origin. A large displacement can dominate, as it does here. This is different from the centered variance objective of PCA.</KeepInMind>
              </SubSection>

              <SubSection title="9. Centering the table instead of the people" id="9-centring-the-table-instead-of-the-people">
                <p>We also need to center the observations in feature space. Although the kernel does not give us their explicit coordinates, it does give their inner products. Expanding an inner product after subtracting the feature-space mean m lets us express the centered comparison entirely through those available kernel values.</p>
                <Equation>{"(φ(a) − m) · (φ(b) − m)\n  = K(a, b) − (1/n) Σₖ K(a, xₖ) − (1/n) Σₖ K(xₖ, b) + (1/n²) Σₖ Σₗ K(xₖ, xₗ)"}</Equation>
                <p>

                  Each term is a kernel value or an average of kernel values,
                  so the centered entry is computable from the uncentered
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
                    rather than a formula to memorize, and on the four height and weight measurements it turns the table of 38,484s back into the two
                    blocks of section 5 exactly.
                  </p>
                </WhyThisWorks>
                <KeepInMind>

                  The centered feature-space Gram matrix can be computed directly from the uncentered kernel table. This identity removes the feature-space mean without constructing its coordinates. Omitting it changes the objective to an uncentered second-moment calculation.</KeepInMind>
              </SubSection>

              <SubSection title="10. A new person is centered against the fit" id="10-a-new-person-is-centred-against-the-fit">
                <>
<p>A new observation must use the feature-space mean established by the training data. Compute its kernel comparisons with the n training observations, then combine that query row’s average with the stored training averages in the same identity. The query contributes a row of comparisons; it does not establish a new training reference.</p>
                <p>

                  Send person 1 of the four height and weight measurements back through as if new and their centered row comes out 200, &minus;200, 0, 0, the first row of section 5&rsquo;s table.
                </p>
</>
                <Equation>{"centered query row = k − 1_q K − k 1ₙ + 1_q K 1ₙ"}</Equation>
                <InAModel title="Reusing the Training Center">
                  <p>The SDK uses a square training table to learn centering references and a separate operation to center query-to-training comparisons. A one-by-twelve query row cannot be passed to its square-table centering operation. That shape check catches this misuse; the caller must still preserve the correct training references, including when other array shapes happen to be compatible.</p>
                </InAModel>
                <KeepInMind>

                  New rows are centered against the training table, never
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
                "Each nonzero-variance principal direction lies in the span of the centered observations, so its scores can be computed from their dot products",
                "The covariance matrix of the lifted people can be written down for the radial kernel after all",
                "A curved direction on the plane stays curved in the lifted space",
                "The Gram matrix has one row for each feature the people were measured on",
              ],
              0,
              "A nonzero-variance principal direction can be expressed as a weighted sum of centered feature-space observations. Its score on another observation therefore depends on dot products with those training observations. Kernels supply these dot products without requiring explicit coordinates. The Gram matrix remains observation-by-observation even when the radial kernel's feature space is infinite-dimensional.",
            ),
            trueFalse(
              "Decomposing the four by four Gram matrix rather than the two by two scatter matrix gives different variances, since the two matrices are different sizes.",
              false,
              "The non-zero eigenvalues come out the same, 400 and 100, and the extra eigenvalues the larger matrix has are zero, because four people on a plane spread along two directions and no more. On the arc the twelve by twelve table gives 7055.88 and 3316.45 and then ten eigenvalues no larger than 4e−12, and the coordinates by the two routes agree to 1.35e−13.",
            ),
            choice(
              "The raw Gram eigenvalue on the four height and weight measurements is 400. Which number is the variance along the direction, and which normalizes the eigenvector?",
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
              "Which of these hold about centering the table?",
              [
                "Skipping it leaves a fit that runs to completion and reports a first direction pointing at the mean, with a share of 0.9989 on the four height and weight measurements",
                "The centered table can be built from the uncentered one alone, since every term of the expansion is a kernel value or an average of kernel values",
                "The double average is added back because subtracting the row average and the column average removed the mean’s own piece twice",
                "The lifted people are shifted to their mean before the table is built",
              ],
              [0, 1, 2],
              "Double-centering the kernel table computes the same inner products that would result from subtracting the feature-space mean from every mapped observation. The method can do this using kernel values and their averages, without constructing the mapped observations. Skipping centering changes the objective to squared size from the feature-space origin, which can be dominated by the mean rather than variation about it.",
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
                  center it by section 9, and decompose it by section 6.
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
                  neighbor at a time.
                </p>
                <KernelTable />
                <p>

                  The person at (120, 80), the short heavy end of the arc,
                  scores 1 with themselves, 0.460 with their neighbor at
                  (128, 62), 0.088 with the next, 0.002 with the fifth
                  person along, and below 0.001 with everyone past them. The person at (160,
                  33), the bottom of the dip, scores 0.873 with each of their
                  two neighbors and 0.969 with the twelfth person at (156,
                  33), who sits four centimeters away. Under this kernel the
                  fit reads who is near whom, and a person&rsquo;s height and
                  weight enter only through those distances.
                </p>
                <KeepInMind>
                  Kernel PCA decomposes the centered kernel Gram matrix. With a linear kernel and matching normalization, it agrees with ordinary PCA up to sign conventions, tied-subspace choices and numerical rounding.</KeepInMind>
              </SubSection>

              <SubSection title="12. What a component is now">
                <>
<p>Ordinary PCA can report a loading for each original feature, such as 0.71 for height and 0.71 for weight. A kernel component describes a direction in the kernel’s feature representation instead. With a radial kernel, that representation has no finite coordinate list. We describe the component using its coefficients on the training observations, rather than treating them as original-feature loadings.</p>
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
                  A radial-kernel component is represented by coefficients on the training observations, together with the kernel and centering references. These are not constant loadings on height and weight. Its dependence on those original inputs can instead be investigated through projections of selected observations or local sensitivity calculations.</KeepInMind>
              </SubSection>

              <SubSection title="13. Placing a person along it">
                <p>

                  A person&rsquo;s coordinate is section 4&rsquo;s sum with
                  the centered kernel row in place of the dot products. On the
                  ring, person 1 at (169.7, 60.3) has a raw kernel row
                  beginning 1, 0.864, 0.570 against the inner people and
                  ending in values near 0.0003 against the far side of the
                  outer ring, and after centering against the table that row
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

                  A coordinate is a person&rsquo;s centered kernel row against
                  the coefficients. The lifted direction is never formed;
                  the coefficients and the training people stand in for it.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Perpendicular, and not unit length">
                <>
<p>The components are ordered by the variance they retain. Their coefficient vectors also need careful interpretation. These vectors begin as orthogonal eigenvectors of a symmetric centered kernel matrix, then receive a separate scale factor for each component. Scaling preserves their mutual perpendicularity, although it changes their lengths. The following measurements check both properties.</p>
                <p>The coefficient vectors are orthogonal to rounding precision: the largest cross-component dot product is 2.7e−18 for the ring and 2.1e−17 for the arc. They are eigenvectors of the same symmetric matrix and are then scaled. The transformed coordinates need to be interpreted using the kernel-space geometry; ordinary coefficient-space comparisons do not replace that geometry.</p>
</>
                <Equation>{"aᵢ · aⱼ = 0  for i ≠ j          aᵢ′ K_c aⱼ = 1 if i = j, else 0"}</Equation>
                <p>

                  What they are not is unit length. The scaling of section 7
                  leaves each with squared length one over its raw
                  eigenvalue, 0.0025 and 0.01 on the four height and weight measurements, and the
                  thing that does come out as the identity is the coefficient
                  matrix with the centered table in the middle, to
                  7.8e&minus;16 on the ring. That second identity is the
                  statement that the lifted directions have unit length,
                  which is the fact the scaling was for.
                </p>
                <KeepInMind>

                  The coefficient vectors are perpendicular in their ordinary coordinate space, but they are not normalized there to length one. Their kernel-weighted inner products form the identity because the corresponding feature-space directions are orthonormal. These are two different inner products.</KeepInMind>
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
                <p>The variance shares refer to different feature spaces. The radial kernel gives this centered thirty-six-row dataset thirty-five nonzero directions, and its observed variance is spread across many of them. A high direction count alone would not prevent two directions from dominating; the measured spectrum is what shows the spread here. The first direction still separates the groups despite its small variance share.</p>
</>
                <p>

                  Why that one? Under this kernel the inner twelve all score
                  high with one another, since they are all within about
                  twenty units, while each outer person scores near zero
                  with the far side of the ring and only modestly with their
                  neighbors. In the lifted space the twelve are one tight
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
<p>The reciprocal square root of gamma gives the distance where a radial comparison falls to exp(−1). It is a scale, not a cutoff. On this ring, the first-component separation holds from gamma 0.003, a distance scale of about eighteen units, to 0.017, under eight units. The widest displayed gap is 0.645 at gamma 0.004.</p>
                <p>

                  At 0.002 the reach is twenty-two units, which is wider than the inner group itself, so an inner person and the nearest outer people score much alike, and the groups overlap by 0.966; at 0.02 the reach is seven units, every person resembles little more than their nearest neighbors, and they overlap again by 0.249.
                </p>
</>
                <ReachSweep />
                <>
<p>Across this sweep, total feature-space variance rises from 0.292 to 0.998 while the first variance share falls from 0.428 to 0.037. Narrow comparisons make distinct observations less alike and distribute the variance across more directions. These summaries do not directly identify the gamma interval that separates the intended groups.</p>
                <p>
                  Neither line turns at the edges of the band where the split holds. The ideal case, a tighter eight inside a wider sixteen, holds its split from 0.0015 all the way to 0.1, with a widest gap of 0.981, because its eight are within about four units of one another and its sixteen about thirty-two units out, so there is a wide range of reaches that scores the eight alike and the sixteen unalike.
                </p>
</>
                <KeepInMind>
                  A very broad radial kernel can approximate a scaled linear comparison after centering, while a very narrow one approaches an identity-like table for distinct inputs. Neither limit guarantees the representation we need. Inspect the projections and evaluate their intended use.</KeepInMind>
              </SubSection>

              <SubSection title="17. The arc folds rather than unrolls">
                <>
<p>A nonlinear representation does not automatically turn a curved sequence into one ordered coordinate. At gamma 0.002, the arc’s first component rises and then falls as we move along the observations.</p>
                <p>The recorded values, ordered by height, begin at −0.49 and reach 0.61 before falling to −0.63 and ending at −0.57. Several positions can therefore share similar first-component values. We need to inspect the actual projection before interpreting it as progress along the curve.</p>
                <p>Both arc ends lie on one side of the first coordinate and the middle lies on the other. Five adjacent steps oppose the coordinate’s predominant direction. The displayed count takes the smaller number of rising and falling steps; it is not a count of turning points. Ordinary PCA’s first coordinate is monotone on these observations.</p>
</>
                <ArcFold />
                <>
<p>
                  The second direction runs &minus;0.36, &minus;0.63, &minus;0.66, &minus;0.45, &minus;0.15, 0.00, 0.14, 0.40, 0.59, 0.60, 0.40, 0.12, rising along the curve and turning down at each end, and the two together place the twelve on a curve again in the kernel plane. What the first direction found is the largest spread in the lifted space, and on a curve whose two ends are far from everything else, that is the ends against the middle.
                </p>
                <p>With a broader kernel, the displayed ordering count falls to one at gamma 0.0003 and two at 0.0005. The first two shares are then 0.526 and 0.370, compared with ordinary PCA’s 0.680 and 0.320. These tested settings still do not provide a monotone first coordinate along the arc. Methods based on distances along a neighborhood graph address a different geometric objective.</p>
</>
                <KeepInMind>
                  At gamma 0.002, the first coordinate separates the arc’s ends from its middle rather than ordering its length. The displayed ordering statistic and the plot make that behavior visible. A different curve or kernel setting needs its own inspection.</KeepInMind>
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
                <p>The polynomial representation contains a radius-related combination, but PCA still chooses directions by spread. Here the large variation in squared height and squared weight outranks the direction that separates the groups. That useful direction appears fifth with a very small share. Making a useful relationship available does not guarantee that maximizing variance selects it.</p>
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
              "For a nonlinear radial kernel, component row coefficients are not ordinary loadings on the original height and weight inputs.",
              true,
              "Ordinary PCA directions assign a coefficient to each original input. A radial-kernel component instead lives in a different, infinite-dimensional feature space and is represented here through one coefficient per training observation. Those row coefficients describe its construction in that space, not a direct height-versus-weight loading. With a linear kernel, original-feature loadings can be recovered as a special case.",
            ),
            trueFalse(
              "The coefficient vectors of two different kernel components come out perpendicular in the ordinary sense.",
              true,
              "The component coefficient vectors are scaled eigenvectors of one symmetric centered Gram matrix. The solver chooses an orthogonal eigenbasis, so vectors for different components remain perpendicular after their individual rescalings. They are not unit length: each has squared norm equal to the reciprocal of its raw positive eigenvalue. The tiny measured dot products are consistent with numerical rounding.",
            ),
            choice(
              "On the ring at a gamma of 0.005 the first two shares are 0.137 and 0.111, against ordinary PCA’s 0.516 and 0.484. What follows?",
              [
                "The radial feature-space variance is spread over many directions; the first two hold a small share, while the first still separates these groups",
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
                "It did not preserve order: the coordinate places both arc ends on one side of the middle and has five steps opposing its predominant direction",
                "It held, since the first coordinates run in order along the curve",
                "It held for the first direction and failed for the second",
                "The arc cannot be fitted at that gamma",
              ],
              0,
              "The ordinary first coordinate decreases monotonically along these height-ordered observations. The radial-kernel coordinate rises and falls, with five steps in its less common direction. That is evidence against order preservation in this projection. The numerical count used here measures opposing steps; a separate sign-change count would measure turning points.",
            ),
            trueFalse(
              "The squared kernel’s lifted space contains height squared and weight squared, whose sum is close to what separates the ring, so its first direction separates the two groups.",
              false,
              "At a gamma of 0.005 its first two shares are 0.652 and 0.347 and the groups overlap by 63.5 along the first direction. The largest spreads in that space are the outer ring’s swing in height squared and in weight squared, which are enormous in raw units, and the direction that separates the groups is fifth on the list with a share too small to print. The method finds the largest spread, not the useful one.",
            ),
        ],
        },
        {
          title: "Part 6. Reconstruction and Projection Choices",
          id: "part-6-no-way-back-and-what-to-choose",
          content: (
            <>
              <SubSection title="19. Why there is no reconstruction">
                <>
<p>Ordinary PCA reconstructs an approximation in the original feature space. Kernel PCA first reconstructs a point in its feature space. Finding an original input that maps to that reconstructed point is a separate problem, often called the pre-image problem. This SDK does not implement that additional step.</p>
                <p>An exact pre-image may not exist: a truncated reconstruction need not be a feature vector that any original input can produce. An approximate input can be sought by another method, but that introduces an approximation and its own choices. Returning original heights and weights is therefore not a direct reversal of this projection.</p>
</>
                <p>We can still measure retained squared distance from the feature-space mean. An observation’s centered kernel diagonal is its total squared deviation; its squared component scores give the retained part. Their ratio is defined when that total deviation is positive. A point exactly at the feature-space mean has no deviation for this ratio to divide by.</p>
                <Equation>{"kept share of person i = Σⱼ zᵢⱼ² / K_c(xᵢ, xᵢ)"}</Equation>
                <ShareLadder />
                <p>With two directions retained on the ring, the total retained share is 0.248. Individual retained shares range from 0.057 to 0.537, with higher retention for the inner observations in this example. The SDK provides no inverse transform. The linear case could be converted back using ordinary PCA, while nonlinear pre-image methods require a separate problem and may provide only an approximation.</p>
                <KeepInMind>This API does not implement an inverse transform. A general exact radial-kernel pre-image may not exist, and approximate pre-image methods require additional choices. The fitted row coefficients and centering records support forward projections; they are not a stored inverse mapping to height and weight.</KeepInMind>
              </SubSection>

              <SubSection title="20. Choosing gamma">
                <>
<p>The decomposition takes gamma as a supplied setting. The kernel-space variance summaries in section 16 do not mark the interval where the ring separates, and changing gamma changes the feature-space geometry itself. One starting heuristic uses the reciprocal median squared pairwise distance. For this ring, the median is 1051.5 and the resulting setting is 0.00095. Its usefulness still needs evaluation.</p>
                <p>At that gamma, the ring groups overlap by 0.992; separating them requires a gamma at least three times as large. For the ideal case, the rule proposes 0.00088 while separation begins at 0.0015. The heuristic provides a starting setting for these examples, not a guarantee of the desired separation.</p>
</>
                <InAModel title="What chooses it, then">
                  <p>Choose gamma according to the representation’s purpose. If a classifier consumes the coordinates, compare its validation performance while fitting the entire transformation only on training data. For a visualization, inspect which relationships and distinctions the picture preserves. Selecting a setting this way still leaves a separate evaluation question.</p>
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
                  for centering, and on the ring the radial kernel at 0.005
                  finds spread along thirty-five directions. Their cumulative
                  shares climb slowly, five directions to pass half the
                  total, thirteen to pass nine tenths, all thirty-five to
                  reach the whole of it. The PCA page&rsquo;s rule of thumb,
                  keep enough for 95 percent, would keep sixteen or more, and
                  the ring came apart along the first one alone.
                </p>
                <p>Choose the component count for the intended use. A large cumulative variance share answers how much feature-space variation was retained. It does not directly answer how well the coordinates distinguish groups. Classification needs its own validation, while the ladder in section 19 measures retained deviation as components are added.</p>
                <KeepInMind>
                  The count of kernel components is bounded by the number of
                  people, and the running share climbs slowly under a sharp
                  kernel. Keep one or two for a picture or a separation and
                  many for a faithful lifted description, and say which.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Units are part of the kernel">
                <p>The radial distance combines numerical height and weight gaps. Converting height to meters while keeping gamma 0.002 changes the first variance share from 0.315 to 0.680 on the arc. Weight now dominates the distance calculation. Its numerical agreement with ordinary PCA’s 0.680 does not establish that the two projections are the same transformation.</p>
                <p>

                  The kernel trick page&rsquo;s remedy holds here. Standardize
                  the features first, so a unit of distance means one
                  standard deviation in either, and then choose gamma. This
                  page keeps raw units because the ring and the arc were
                  drawn with their two spreads already comparable, thirty
                  units either way on the ring and eighty against forty-seven
                  on the arc, and the choice is stated rather than hidden.
                </p>
                <KeepInMind>

                  Choose feature scales to express the differences the kernel should use. Standardization is one useful option, while meaningful physical tolerances or task-specific weights can justify another. Keep those scales fixed when applying the fitted projection to later inputs.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Reusing the Training Center in Kernel Space" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="23. Which eigenvalues and training references does prediction need?" id="23-what-a-complete-implementation-must-specify">
                <p>A saved projection needs more than its eigenvectors. Keep the kernel parameters, training rows and training kernel table. Center the training table as in section 9 and later rows as in section 10, using the stored training reference.</p>
                <p>The requested component count cannot exceed the number of training rows. The returned count can be smaller when centering or dependent mapped observations leave fewer usable directions. Divide a raw eigenvalue by one less than the training row count to report sample variance. Normalize its eigenvector using the square root of that raw eigenvalue, and calculate total variance before truncation.</p>
                <p>Check the threshold that prevents division by a near-zero eigenvalue. This implementation clamps negative eigenvalues rather than refusing them, orders the directions, and keeps the signs returned by the solver. It offers no inverse transform, so the saved projection does not promise a route back to the original observations.</p>
                <KeepInMind>

                  Check both eigenvalue normalization and reuse of the training centering references. Errors in either can leave a computation running while changing its coordinate scale or geometry. Successful execution or a visually separated example does not verify those conventions.</KeepInMind>
              </SubSection>

              <SubSection title="24. Degenerate Gram matrices and unavailable components" id="24-the-edges-each-one-probed">
                <p>The table distinguishes requests rejected by the page from conditions handled by the SDK. Read accepted projections with their kernel and eigenvalue conventions; a returned coordinate is not by itself evidence that the representation suits the problem.</p>
                <DerivationTable
                  expressionHeading="Data or kernel condition"
                  reasonHeading="Which projection remains available"
                  rows={[
                    { expression: "no features, or an empty column", reason: "refused at the boundary, by the same guard every feature here passes through." },
                    { expression: "one person", reason: "refused; a decomposition needs at least two rows, and the endpoints refuse a single point a layer earlier." },
                    { expression: "two people", reason: "two distinct mapped observations can provide one nonzero centered direction. If their mapped representations coincide, no spread is available." },
                    { expression: "three identical people", reason: "refused, because the centered table is all zeros and there is no direction with any spread to keep; the refusal names the missing component." },
                    { expression: "a constant column", reason: "accepted; four people with one weight fit under the radial kernel with three directions, and the column contributes nothing to any distance." },
                    { expression: "a non-finite value", reason: "refused at the boundary; the endpoints refuse it earlier still, since a NaN cannot be written as JSON." },
                    { expression: "five directions asked of four people", reason: "refused at the fit, with both counts named, since the table has only four rows." },
                    { expression: "four directions asked of four people on a plane", reason: "under the linear kernel in this four-person example, two directions are returned. The centered Gram matrix has rank two, so the remaining eigenvalues do not provide usable components." },
                    { expression: "twelve directions asked of the twelve on the arc", reason: "accepted, and eleven come back, one fewer than the people, because centering removes one." },
                    { expression: "zero directions, a gamma of zero, or a negative polynomial constant", reason: "refused at construction, before any data is seen; at a gamma of zero every pair scores one and there is nothing to fit." },
                    { expression: "transform before fit", reason: "refused as not fitted, in a sentence rather than as an attribute error." },
                    { expression: "transform with a feature missing, or under another name", reason: "refused; a kernel pairs rows over exactly the fitted features. The same features in another order are matched by name and accepted, and the coordinates agree to 0.0." },
                    { expression: "a polynomial kernel of degree 200 on raw units", reason: "the powers overflow and the table is refused for holding a non-finite value, naming unscaled features as the usual cause; the endpoints fix the degree at two." },
                    { expression: "a sigmoid kernel that is not a kernel", reason: "accepted, and quietly. On the arc at a gamma of 0.0001 the centered table has five negative eigenvalues, the most negative at −0.0365 against a largest of 0.0140, and the fit clamps them to zero and reports a first share of 0.9989. Documented rather than defended." },
                    { expression: "two strangers far from everyone", reason: "accepted, and both land at the same spot, (−0.2291, −0.0433) on the arc's fit, 0.0 apart, because a raw kernel row of zeros centers to minus the mean row whoever the stranger is." },
                    { expression: "centering a query row against itself", reason: "the square-table centering operation rejects a one-by-n query row in the displayed case. Later inputs must use the fitted query-centering operation and training references; shape checks alone do not prevent every reference error." },
                    { expression: "height in meters at the same gamma", reason: "accepted, and the first share moves from 0.315 to 0.680; nothing raises, and section 22 is the only witness." },
                  ]}
                />
                <>
<p>A substantially negative eigenvalue means the centered table is not a Gram matrix for a real Euclidean inner product. Clipping those eigenvalues changes the table rather than validating the original comparison function. The reported variance shares then describe that modified spectrum. Kernel ridge’s Cholesky check can reject an indefinite shifted system, but a sufficiently large diagonal penalty can also let one through; the two checks are not equivalent validity tests.</p>
                <p>If the query’s kernel comparisons with every training observation are zero, those comparisons carry no information distinguishing it from another such query. Centering and projection consequently send them to the same coordinates. That is consistent arithmetic, but it can be an uninformative representation for the task.</p>
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
                "A point reconstructed from retained feature-space components may have no exact original-input counterpart; finding an approximate counterpart requires an additional pre-image method",
                "The coordinates cannot be inverted because the coefficient vectors are not unit length",
                "The centering identity cannot be undone once it has been applied",
                "It could be offered for every kernel and has simply not been written",
              ],
              0,
              "Kernel PCA projects in feature space. A reconstruction there may not lie in the image of any original height-weight point, so a general exact inverse is unavailable. Approximate pre-image methods or separately fitted inverse models can still be useful, but are additional procedures with their own errors. This SDK exposes no inverse, including for the linear-kernel special case where an ordinary PCA reconstruction is possible.",
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
                "Center a query row against itself without raising anything",
                "Refuse an uncentered table before decomposing it",
              ],
              [0, 1],
              "A substantial negative eigenvalue shows that this Gram table cannot be the dot-product table of real Hilbert-space features. This implementation drops nonpositive eigenvalues rather than rejecting that input, so its reported positive-component shares require caution. A query with zero comparison to every training row receives the same centered comparison pattern as any other such query, which can conceal differences in unfamiliar inputs. The kernel-ridge factorization check is also penalty-dependent, rather than a universal validity test.",
            ),
            trueFalse(
              "Writing the arc’s heights in meters rather than centimeters and refitting at the same gamma of 0.002 leaves the kernel’s answer unchanged, since the centering undoes any rescaling.",
              false,
              "The radial kernel depends on squared coordinate distance. Changing only height units changes the relative height and weight contributions before the kernel is computed. Centering the Gram matrix does not undo that rescaling. The first variance share changes from 0.315 to 0.680 in this experiment. Standardizing inputs is one possible scale convention to evaluate before choosing gamma, rather than a guaranteed repair for every representation.",
            ),
        ],
        },
        {
          title: "Practice. Decomposing the Ring and the Arc With the Library",
          practice: [
            exercise("Run PCA through the Gram matrix on the four height and weight measurements",["Fit KernelPrincipalComponentAnalysis with LinearKernel to the four height-weight pairs. Print each component's variance, raw Gram eigenvalue and row_coefficients. Fit ordinary PCA to the same inputs and compare its variances.", "Recover each raw eigenvalue by multiplying the reported sample variance by three. Print the absolute first-component score for person 1 so the comparison allows either component sign. Finally request five components from four rows, catch MLLibError and print its class name and message."],`from oop_ml import Feature, KernelPrincipalComponentAnalysis, LinearKernel, MLLibError, PrincipalComponentAnalysis

heights = [180, 160, 175, 165]
weights = [78, 58, 63, 73]
people = [Feature("height", heights), Feature("weight", weights)]

# Fit the kernel decomposition under the linear kernel. For each component
# print its variance, the raw Gram eigenvalue that variance implies, and its
# row coefficients. Print how far person 1 lands along the first direction,
# sign dropped, then ordinary PCA's variances on the same four. Finally ask
# for five directions from the four people and print the refusal.`,`from oop_ml import Feature, KernelPrincipalComponentAnalysis, LinearKernel, MLLibError, PrincipalComponentAnalysis

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
    print(f"{type(refusal).__name__}: {refusal}")`,`kernel_component_1: variance 133.33, raw eigenvalue 400.0, coefficients [-0.0354, 0.0354, 0.0, 0.0]
kernel_component_2: variance 33.33, raw eigenvalue 100.0, coefficients [0.0, 0.0, -0.0707, 0.0707]
person 1 along the first direction, sign dropped 14.1421
ordinary PCA variances [133.33, 33.33]
InvalidValuesError: cannot keep 5 components from 4 rows`,{...{ hints: ["KernelPrincipalComponentAnalysis takes a kernel and, optionally, n_components; left unset it keeps every direction with any spread. fit takes the list of Features and nothing else, since there is no target.", "The fitted components can be iterated, and each one has a name, a variance and row_coefficients, one weight per training person. PrincipalComponentAnalysis has components with a variance each in the same way.", "transform answers a list of Features, one per kept direction, named kernel_component_1 upward, and each holds one coordinate per person in the order given.", "Asking for more directions than there are rows is refused from fit with one of the library’s own errors, so catching MLLibError catches it."], check: numberCheck("What variance does the first kernel direction report on the four height and weight measurements?", 133.33, 0.01, "The library reports sample component variance, while the raw Gram eigenvalues use a different normalization. Converting that convention recovers the same linear feature-space directions as ordinary PCA, up to arbitrary component signs.") },question:"Does a linear-kernel decomposition recover the ordinary PCA result?"}),
            exercise("Take the ring apart along the first kernel direction",["Fit radial kernel PCA to the supplied thirty-six ring observations with gamma=0.005 and n_components=2. Print the two variance shares and total feature-space variance. Transform the observations and compare the first-coordinate ranges for the inner twelve and outer twenty-four.", "Calculate the gap between those ranges using the larger of the two possible signed edge differences. A positive result indicates separated ranges; a negative result indicates their overlap. Repeat the variance-share and first-coordinate comparison with ordinary PCA."],`from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

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
# they overlap. Then do the same for ordinary PCA's first axis.`,`from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

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
print(f"ordinary shares {[round(float(share), 3) for share in ordinary.components.variance_shares]}, gap {overlap:.1f}")`,`kernel shares [0.137, 0.111] of a total lifted variance of 0.898
inner twelve from 0.429 to 0.560, outer twenty-four from -0.291 to -0.205
gap between the groups along the first direction 0.634
ordinary shares [0.516, 0.484], gap -40.2`,{...{ hints: ["RadialBasisKernel takes gamma, and n_components=2 keeps the first two directions. The fitted components have variance_shares and total_variance.", "transform answers one Feature per kept direction, so the first direction’s coordinates are the values of the first one, in the order the people were given, which puts the inner twelve first.", "A sign on a direction is the solver’s choice, so take the gap as the larger of the two differences, the inner minimum less the outer maximum and the outer minimum less the inner maximum. One of them is the stretch between the groups and the other is far negative."], check: numberCheck("How wide is the empty stretch between the inner twelve and the outer twenty-four along the first kernel direction?", 0.634, 0.001, "On this ring example, the first radial-kernel coordinate separates the groups even though a single ordinary PCA projection leaves them overlapping. The kernel and its width determine that feature geometry.") },question:"Can the first radial-kernel coordinate separate the inner group from the outer ring?"}),
            exercise("Sweep the reach and find the band where the ring comes apart",["Repeat radial kernel PCA for each of the seven supplied gamma values. Print the length scale gamma**(-0.5), first-component variance share, total feature-space variance and the same signed range gap.", "Compare which gamma values separate the inner and outer ranges. Check whether the first variance share alone identifies those settings. Choosing gamma from known group labels is a supervised selection step even though the PCA fit itself uses no labels."],`from oop_ml import Feature, KernelPrincipalComponentAnalysis, RadialBasisKernel

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
    pass`,`from oop_ml import Feature, KernelPrincipalComponentAnalysis, RadialBasisKernel

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
    print(f"gamma {gamma}: reach {gamma ** -0.5:.1f}, first share {share:.3f}, total {total:.3f}, gap {gap:.3f}")`,`gamma 0.002: reach 22.4, first share 0.205, total 0.761, gap -0.966
gamma 0.003: reach 18.3, first share 0.159, total 0.833, gap 0.519
gamma 0.004: reach 15.8, first share 0.148, total 0.873, gap 0.645
gamma 0.005: reach 14.1, first share 0.137, total 0.898, gap 0.634
gamma 0.01: reach 10.0, first share 0.097, total 0.948, gap 0.477
gamma 0.017: reach 7.7, first share 0.072, total 0.969, gap 0.091
gamma 0.02: reach 7.1, first share 0.067, total 0.974, gap -0.249`,{...{ hints: ["Each gamma needs its own RadialBasisKernel and its own fit, since both the kernel and the directions change with it.", "The gap is the same calculation as the previous problem, the larger of the inner minimum less the outer maximum and the outer minimum less the inner maximum, read off the first transformed Feature.", "The reach is a number the page derives rather than the library, one over the square root of gamma, which in Python is gamma to the power of minus a half."], check: numberCheck("What is the gap between the two groups at a gamma of 0.01?", 0.477, 0.001, "The chosen gamma lies inside this dataset's measured separation band. A falling first variance share or increasing total feature variance alone does not identify where the groups separate.") },question:"Which kernel widths separate the two rings in this dataset?"}),
            exercise("Count how often the arc folds",["Fit ordinary PCA and radial kernel PCA at gamma=0.002 to the twelve arc observations. Sort row positions by height and print each model's first-coordinate values in that order. This checks whether the coordinate preserves movement along the arc.", "Count positive and negative steps between consecutive coordinates and report the smaller count, labeled reversals in the supplied output. This is a measure of steps opposing the predominant direction, not the number of changes from rising to falling. Also print both variance shares."],`from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

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
    pass`,`from oop_ml import Feature, KernelPrincipalComponentAnalysis, PrincipalComponentAnalysis, RadialBasisKernel

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
    print(f"{label} shares {shares}, reversals {reversals}")`,`kernel first coordinate by height [-0.49, -0.44, -0.07, 0.35, 0.58, 0.61, 0.58, 0.4, 0.05, -0.37, -0.63, -0.57]
kernel shares [0.315, 0.27], reversals 5
ordinary first coordinate by height [39.12, 31.44, 23.68, 15.84, 7.93, 3.97, -0.03, -8.06, -16.15, -24.31, -32.55, -40.87]
ordinary shares [0.68, 0.32], reversals 0`,{...{ hints: ["Both models fit on the same list of two Features and both answer transform as a list of Features, so the first direction’s coordinates are the values of the first one for either model.", "by_height holds the positions of the people from shortest to tallest, so indexing the coordinates by it gives the list the page reads.", "Subtract each coordinate from the next in height order. Count strictly positive and strictly negative differences, then take the smaller count. Reversing a component's sign exchanges those counts but leaves their minimum unchanged."], check: numberCheck("How many steps oppose the predominant direction of the first kernel coordinate when the twelve observations are ordered by height?", 5, 0.5, "The first kernel coordinate has five steps in its less common direction. This demonstrates nonmonotonicity along the height-ordered arc. Maximizing feature-space variance does not require preserving that order, so a nonlinear projection does not automatically straighten a curve.") },question:"Does the largest-variance kernel coordinate preserve order along the arc?"}),
          ],
        },
      ]}
    />
  );
}
