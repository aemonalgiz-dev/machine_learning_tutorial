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
    "PCA written so the people appear only through inner products, then the inner products swapped for a kernel, so a typical group inside a ring of others comes apart along the first direction.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function KernelPcaPage() {
  return (
    <ConceptPage
      title="Kernel Principal Components"
      tagline="Write PCA with nothing but inner products, swap them for a kernel, and find the directions of most spread in a space you never build."
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
      history={
        <>
          <p>
            The route through the pairs is older than the kernel. John Gower,
            at Rothamsted Experimental Station in 1966, was working for
            biologists who often held a table of how alike every pair of
            specimens was rather than a set of measurements on each, and in
            &ldquo;Some distance properties of latent root and vector methods
            used in multivariate analysis&rdquo; he showed that the
            eigenvectors of the n by n table of inner products between
            individuals place those individuals exactly where PCA&rsquo;s
            eigenvectors of the p by p covariance matrix place them. He
            called it principal coordinates analysis. So by the time this
            page&rsquo;s method was invented, decomposing a table of pairs
            instead of a table of features was known to give the same
            answer, and what nobody had yet done was change what went into
            the table.
          </p>
          <p>
            Bernhard Sch&ouml;lkopf, Alexander Smola and Klaus-Robert
            M&uuml;ller did that at the Max Planck Institute for Biological
            Cybernetics in T&uuml;bingen. Boser, Guyon and Vapnik had shown in
            1992 that a support vector machine could be trained in a lifted
            space it never built, because its training touched the data only
            through inner products and a kernel could answer for those, and
            the three asked in a 1996 technical report whether the same
            substitution worked for a method with no labels at all. Their
            paper, &ldquo;Nonlinear component analysis as a kernel eigenvalue
            problem&rdquo; in Neural Computation in 1998, said it did, with
            one addition the support vector machine had not needed. PCA
            measures spread about the mean, the mean of the lifted points
            cannot be subtracted because the lifted points cannot be written
            down, and they gave the identity that centres the table on their
            behalf. They named the result kernel PCA, and they faced a
            problem of evidence that this page inherits. A direction found
            this way lives in a space nobody can inspect, so it cannot be
            read as loadings on the original measurements, and they argued
            for it instead by feeding the components of handwritten digits,
            under polynomial kernels of rising degree, to a linear classifier
            and watching its error fall.
          </p>
          <p>
            The thing the method cannot do was worked out almost at once.
            Sebastian Mika, with Sch&ouml;lkopf, Smola, M&uuml;ller, Matthias
            Scholz and Gunnar R&auml;tsch, wanted in 1998 to de-noise those
            same digits by keeping a few kernel components and mapping back,
            and found that a point rebuilt from a few coordinates almost
            never has a pre-image in the original space; their fixed-point
            iteration for the Gaussian kernel is still the standard
            approximation, and there is no exact answer. The page asks six
            questions in that order. What pattern can no straight axis
            describe? How is PCA written so the people appear only through
            inner products, and does it give the same answer? How is a cloud
            centred when it cannot be seen? What does a component become
            once the inner products are a kernel&rsquo;s? What does the
            rearranged cloud look like as the kernel&rsquo;s reach changes,
            and why is there no way back? And how are the reach and the
            count chosen, and what does an implementation refuse?
          </p>
        </>
      }
      playground={<KernelPcaPlayground />}
      sections={[
        {
          title: "Part 1. A Pattern No Straight Axis Follows",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The ring, and what a rotation cannot do">
                <p>
                  Thirty-six people, measured by height and weight. Twelve of
                  them are of about one build, all within ten or so units of
                  a hundred and sixty centimetres and sixty kilograms, and the
                  other twenty-four differ from that build by about thirty
                  units, each in a different direction, so on the plane they
                  form a ring around the twelve. The fact that separates the
                  two groups is how far from the typical build someone is,
                  and no straight line through the cloud carries it. Tick the
                  ordinary PCA box in the playground and the right panel
                  shows the ring turned a little, with the twelve still
                  inside the twenty-four.
                </p>
                <p>
                  The numbers say why. Ordinary PCA gives the ring shares of
                  0.516 and 0.484, because a round cloud spreads almost
                  evenly in every direction, and along its first axis the
                  inner twelve overlap the outer twenty-four by 40.2 units,
                  since an outer person on the left and an outer person on
                  the right sit at opposite ends of any straight axis with
                  the inner twelve between them. Untick the box, with the
                  radial kernel and gamma at 0.005, and every inner person
                  sits to one side of every outer person along the first
                  kernel direction, with a clear stretch of 0.634 between the
                  nearest pair. The thirty-six are the same people; the
                  direction was found in a different space, and the next
                  three Parts build it.
                </p>
                <KeepInMind>
                  A straight axis through a ring cannot put the inside on
                  one side and the outside on the other, and PCA can only
                  choose straight axes. How far someone is from the typical
                  build is a direction of a different kind.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The arc, carried over">
                <p>
                  The PCA page ended on twelve people along a bend and showed
                  that a straight axis is a poor summary of them, with a first
                  component claiming 68 percent of the variance and a
                  reconstruction error of 3,316 from one number per person.
                  It is worth being exact about what that axis did and did
                  not do, because this page will measure the kernel&rsquo;s
                  answer against it. The bend rises at both ends and dips in
                  the middle, and nearly all of its spread runs along height,
                  so the first component runs nearly along height too.
                </p>
                <p>
                  Read the twelve by height and their first coordinates fall
                  from 39.1 to &minus;40.9 without once turning back; the
                  axis orders the people along the bend perfectly well. What
                  it loses is the bend itself, the 301.5 of variance out of
                  942.9 that runs across the axis, which is why a person
                  rebuilt from one coordinate lands on the line and the two
                  ends of the arc rise off it. So ordinary PCA orders the
                  arc and loses its shape. Whether the
                  kernel describes it better is a question this page answers
                  by measurement, in section 17, and the answer is less tidy
                  than the textbook picture.
                </p>
                <KeepInMind>
                  On the arc, ordinary PCA already reads the people in order
                  along the bend. Its failure is that one straight coordinate
                  cannot say how far off the straight line each person sits.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a curved direction would be">
                <p>
                  A straight direction gives every person a score that is a
                  weighted sum of their height and weight. A curved direction
                  gives them a score that is some other function of the
                  pair, the distance from the typical build for the ring, the
                  position along the bend for the arc. The kernel trick
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
          ),
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
                  <p>
                    Their deviation dotted with person 1&rsquo;s is 200 and
                    with person 2&rsquo;s is &minus;200, and with persons 3
                    and 4 it is zero, so the score is 0.0354 &times; 200 +
                    (&minus;0.0354) &times; (&minus;200), which is 14.14, the
                    same 14.14 the PCA page reached by dotting (10, 10) with
                    (0.707, 0.707).
                  </p>
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
                <p>
                  The PCA page decomposed the scatter matrix, which is two by
                  two for two features. Decompose the four by four Gram
                  matrix instead and the non-zero eigenvalues come out the
                  same, 400 and 100, and the eigenvector for 400 is one on
                  person 1, minus one on person 2 and zero elsewhere, which
                  is the recipe of section 4 before its scaling. The two
                  routes reach the same variances, the same shares and the
                  same coordinates, and the extra eigenvalues the larger
                  matrix has are zero, because four people on a plane spread
                  along two directions and no more.
                </p>
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
                <p>
                  The Gram eigenvalue is read twice, at two scales, and this
                  is the step that goes wrong quietly. The PCA page divided
                  its scatter matrix by n &minus; 1 to call the result a
                  covariance, so a raw Gram eigenvalue is n &minus; 1 times a
                  variance. On the measured four the divisor is 3, and 400
                  over 3 is 133.33, which is the variance the PCA
                  page&rsquo;s playground reports for its first component.
                  That is the first scale.
                </p>
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
                  <p>
                    The coefficients&rsquo; squared length is 0.0354&sup2; +
                    0.0354&sup2;, which is 0.0025, and one over 400 is
                    0.0025, so the division was by the raw eigenvalue and
                    not the variance. And person 1&rsquo;s coordinate, 200
                    &times; 0.0354 + 200 &times; 0.0354, is 14.14, where
                    ordinary PCA also puts them. Divide by &radic;133.33
                    instead and every coordinate comes out &radic;3 too
                    large; divide by nothing and person 1 lands at 282.8.
                  </p>
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
                <p>
                  Everything in Part 2 used deviations from the mean. Build
                  the Gram matrix from the people as measured instead, with
                  person 1 at (180, 78) rather than (10, 10), and every entry
                  is enormous, 38,484 for person 1 with themselves, 33,324
                  with person 2, because the whole cloud lies far from the
                  origin and every dot product mostly measures that. The
                  largest eigenvalue of the uncentred table is 134,449.5, and
                  it takes 0.9989 of the table&rsquo;s trace. Its eigenvector
                  is nearly the same weight on everyone, (&minus;0.53,
                  &minus;0.46, &minus;0.51, &minus;0.49), which is the
                  direction from the origin to the mean and describes no
                  spread among the four at all.
                </p>
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
                <p>
                  A person who was not in the fit gets a row of kernel values
                  against the n training people, and that row has to be
                  shifted by the mean the fit learned rather than by anything
                  of its own, exactly as the PCA page subtracted the
                  training mean from a new observation. The same identity
                  does it, with the query row&rsquo;s own average and the
                  training table&rsquo;s averages in the four terms, and it
                  is exact rather than approximate. Send person 1 of the
                  measured four back through as if new and their centred row
                  comes out 200, &minus;200, 0, 0, the first row of section
                  5&rsquo;s table.
                </p>
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
                  that the bright band down the diagonal is the bend, one
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
                <p>
                  The PCA page&rsquo;s first component was a statement about
                  features, this direction leans on height by 0.71 and on
                  weight by 0.71. Nothing of that kind exists here. The
                  direction lives in the lifted space, whose coordinates
                  have no names and, for the radial kernel, no finite count,
                  so the only description a kernel component has is the
                  recipe of section 4, one coefficient per training person.
                  On the ring at a gamma of 0.005 the first direction gives
                  every one of the inner twelve a coefficient between 0.100
                  and 0.130 and every one of the outer twenty-four a
                  coefficient between &minus;0.068 and &minus;0.048.
                </p>
                <RowCoefficients />
                <p>
                  That is the direction from one group to the other, written
                  in the only vocabulary available, and it is a different
                  kind of statement from a loading. It says which people the
                  direction is built out of. Its eigenvalue is read at the
                  two scales of section 7 with n &minus; 1 now 35, a raw
                  eigenvalue of 4.292 and a variance of 0.123, and the
                  coefficients&rsquo; squared length is 0.233, which is one
                  over 4.292.
                </p>
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
                <p>
                  Two things are often said about these coefficient vectors,
                  and one of them did not survive being measured. The first
                  is that the directions are ordered by the variance along
                  them, largest first, which is true and is checked at
                  construction. The second is that the coefficient vectors
                  of different components are not perpendicular to one
                  another in the ordinary sense, only in the sense the kernel
                  induces. I measured it and found otherwise. On the ring
                  the largest dot product between two directions&rsquo;
                  coefficients is 2.7e&minus;18, and on the arc it is
                  2.1e&minus;17, which is zero to rounding, as it has to be,
                  since they are eigenvectors of one symmetric table and were
                  only scaled afterwards.
                </p>
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
                <p>
                  Return to the playground with the ring, the radial kernel
                  and gamma at 0.005. The first two directions have shares
                  of 0.137 and 0.111 of a total lifted variance of 0.898,
                  which is a small fraction against ordinary PCA&rsquo;s
                  0.516 and 0.484, and along the first of them the two groups
                  are 0.634 apart where ordinary PCA had them overlapping by
                  40.2. Both readings are correct and they are answering
                  different questions. The radial kernel spreads the
                  thirty-six along thirty-five directions with any spread at
                  all, one fewer than the count of people, so no two of them
                  can hold most of it, and the first still happens to be the
                  one the ring is arranged around.
                </p>
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
                <p>
                  Gamma is the radial kernel&rsquo;s one setting, and the
                  kernel trick page read it as a reach, one over its square
                  root being roughly the distance at which two people stop
                  scoring as alike. Sweep it across the ring and the split
                  holds from a gamma of 0.003, a reach of about eighteen
                  units, to 0.017, a reach of under eight, with the widest
                  gap of 0.645 at 0.004. At 0.002 the reach is twenty-two
                  units, which is wider than the inner group itself, so an
                  inner person and the nearest outer people score much
                  alike, and the groups overlap by 0.966; at 0.02 the reach
                  is seven units, every person resembles little more than
                  their nearest neighbours, and they overlap again by 0.249.
                </p>
                <ReachSweep />
                <p>
                  The lines say what the bars cannot. The total lifted
                  variance climbs from 0.292 at the widest reach to 0.998 at
                  the sharpest, because a person who resembles nobody has a
                  whole unit of spread to themselves, and the first share
                  falls from 0.428 to 0.037 over the same sweep as that
                  spread is dealt out one person at a time. Neither line
                  turns at the edges of the band where the split holds. The
                  ideal case, a tighter eight inside a wider sixteen, holds
                  its split from 0.0015 all the way to 0.1, with a widest gap
                  of 0.981, because its eight are within about four units of
                  one another and its sixteen about thirty-two units out, so
                  there is a wide range of reaches that scores the eight
                  alike and the sixteen unalike.
                </p>
                <KeepInMind>
                  Too wide a reach scores everyone alike, so the kernel is
                  little more than a rotation, and too sharp a reach scores
                  each person alike only to themselves. The band between
                  them is a property of the data, and no number inside the
                  fit marks its edges.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The arc folds rather than unrolls">
                <p>
                  The textbook picture for a bent pattern is that the kernel
                  unrolls it, so that the first kernel direction reads
                  position along the curve and the bend is gone. I measured
                  it on the arc and that is not what happens. At a gamma of
                  0.002 the first kernel coordinates of the twelve, read by
                  height, run &minus;0.49, &minus;0.44, &minus;0.07, 0.35,
                  0.58, 0.61, 0.58, 0.40, 0.05, &minus;0.37, &minus;0.63,
                  &minus;0.57. Both ends of the arc land on the same side and
                  the middle on the other. The axis turns back five times
                  where ordinary PCA&rsquo;s turned back not at all.
                </p>
                <ArcFold />
                <p>
                  The second direction runs &minus;0.36, &minus;0.63,
                  &minus;0.66, &minus;0.45, &minus;0.15, 0.00, 0.14, 0.40,
                  0.59, 0.60, 0.40, 0.12, rising along the bend and turning
                  down at each end, and the two together place the twelve on
                  a bend again in the kernel plane. What the first direction
                  found is the largest spread in the lifted space, and on a
                  bend whose two ends are far from everything else, that is
                  the ends against the middle. Widen the reach and the fold
                  loosens, one reversal at 0.0003 and two at 0.0005, but
                  that is the kernel approaching a rotation, with shares of
                  0.526 and 0.370 against ordinary PCA&rsquo;s 0.680 and
                  0.320. Nothing in this fit straightens the arc. A method
                  that does, one that reads distances along the bend rather
                  than across it, is a different method and is not on this
                  site.
                </p>
                <KeepInMind>
                  The radial kernel found the arc&rsquo;s largest lifted
                  spread, which is its ends against its middle, and drew the
                  bend again. The claim that it unrolls the curve did not
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
          title: "Part 6. No Way Back, and What to Choose",
          content: (
            <>
              <SubSection title="19. Why there is no reconstruction">
                <p>
                  The PCA page rebuilt every person from one coordinate, by
                  scaling the retained direction and adding the mean back,
                  and landed among heights and weights because the direction
                  was made of heights and weights. This fit offers no such
                  step, and the omission is a decision. A kernel coordinate is
                  a position along a direction in the lifted space, so
                  scaling the direction by the coordinate rebuilds a lifted
                  point, and going back means finding the person on the
                  plane whose lift that is. For the radial kernel there
                  usually is none. The lifted space has no finite number of
                  dimensions and the plane maps onto a thin curved sheet
                  inside it, so a point rebuilt from two coordinates almost
                  never lies on the sheet, and the question has no answer to
                  approximate.
                </p>
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
                <p>
                  Nothing inside the fit chooses gamma. The total lifted
                  variance and the top shares move monotonically across the
                  whole sweep of section 16 and say nothing about where the
                  ring comes apart, and the fit reports no error to minimise
                  since there is no reconstruction. The usual rule of thumb
                  is to set gamma to one over the median squared distance
                  between pairs of people, and on the ring that median is
                  1051.5, so the rule gives 0.00095. I measured it, and at
                  that reach the groups overlap by 0.992; the split needs a
                  gamma at least three times larger. On the ideal case the
                  rule gives 0.00088 and the split begins at 0.0015, so the
                  rule falls short there too, by less.
                </p>
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
                <p>
                  The sigmoid row and the strangers row deserve the most
                  care, because both are quiet. A negative eigenvalue means
                  the table did not come from any lifted space at all, and
                  the fit discards that spread and reports a share near one
                  as if it had found something; kernel ridge on this site
                  refuses the same table through its solve, and this fit does
                  not. And a person the kernel scores at zero against
                  everyone is placed at one fixed spot, whoever they are,
                  which is the right arithmetic and a useless answer, and the
                  only sign of it is that every stranger lands there.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
