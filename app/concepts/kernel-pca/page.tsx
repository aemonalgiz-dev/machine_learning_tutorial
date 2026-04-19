import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { KernelPcaPlayground } from "@/components/widgets/KernelPcaPlayground";

export const metadata: Metadata = {
  title: "Kernel Principal Components · oop_ml",
  description:
    "PCA finds straight directions. Kernelised, it finds directions in the mapped space, so two rings that no straight axis can separate come apart along the first kernel component.",
};

export default function KernelPcaPage() {
  return (
    <ConceptPage
      title="Kernel Principal Components"
      tagline="Find the directions of most spread in a space you never build, and watch two rings come apart along the first of them."
      prerequisites={
        <>
          This page is{" "}
          <Link
            href="/concepts/pca"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            principal component analysis
          </Link>{" "}
          run through{" "}
          <Link
            href="/concepts/kernel-trick"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            the kernel trick
          </Link>
          , and it borrows the eigenvalue from the first and the swap from the
          second. Read those two first, since every step here is one of theirs
          wearing new clothes.
        </>
      }
      history={
        <>
          <p>
            The PCA page&rsquo;s cloud was long along one diagonal, and a
            straight direction described it perfectly, because a straight
            direction was all it had. Put two rings on the plane instead, one
            inside the other, and the fact that matters about a point, which
            ring it sits on, is carried by no straight direction through the
            cloud at all. Rotate the axes however you like and an inner point
            stays inside. PCA can only rotate, so on rings it has nothing to
            say.
          </p>
          <p>
            Bernhard Sch&ouml;lkopf, Alexander Smola and Klaus-Robert
            M&uuml;ller, working at the Max Planck Institute for Biological
            Cybernetics in T&uuml;bingen in 1996, asked whether the trick that
            had just given the support vector machine its curved boundaries
            could give PCA curved directions too. Their answer, published in
            1998 as nonlinear component analysis posed as a kernel eigenvalue
            problem, was that it could, and that the whole method reduces to
            eigendecomposing one n by n table of kernel values. The directions
            it finds live in a space nobody builds, which costs them something
            the fourth section is honest about, and along the first of them the
            rings above come apart.
          </p>
        </>
      }
      playground={<KernelPcaPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Start with the left panel, the two rings as measured, indigo
                inside amber. Tick the box to put ordinary PCA on the right and
                look at what it does, which is nothing. The rings are rotated a
                little and they are still rings, with shares of 0.516 and 0.484
                because a round cloud spreads almost evenly in every direction,
                and a rotation cannot pull an inner point past an outer one.
                Untick it, with the radial kernel and gamma at 0.5, and the
                right panel is a different picture altogether. Every indigo
                point sits to one side of every amber point along the first
                axis, and the shares are 0.137 and 0.111. Nothing about the
                data changed. What changed is the space the directions were
                found in.
              </p>
              <p>
                The radial kernel scores two points by their distance and
                nothing else, near points scoring near one and far points near
                zero. The twelve inner points are all close to one another, so
                the kernel sees them as one tight bunch, while every outer
                point is far from most of the others and from the bunch. In the
                space the kernel implies the bunch and the rest are two clumps,
                and the direction from one clump to the other is the direction
                of most spread. That is the first kernel component, and the
                coefficient readout shows the library building it that way,
                row 1 carrying one sign and every outer row the other. Drag an
                inner point out to the outer ring and watch it change sides on
                the right.
              </p>
              <p>
                Now slide gamma. At 0.1 every point looks much like every
                other, the kernel is barely more than a rotation, and the right
                panel is back to nested rings with shares of 0.297 and 0.275,
                the plane&rsquo;s own two axes stretched a little. At 3 every
                point resembles only itself, the total variance climbs to
                0.983 and spreads so thinly that the top two shares are 0.057
                and 0.053, and the first direction no longer carries the
                radius. The split holds from about 0.3 to 1.7 on these rings,
                and no number on this page chooses gamma for you. The squared
                kernel is a lesson of its own. Its implied space contains
                x&sup2; + y&sup2;, the radius itself, yet its two largest
                directions are the outer ring&rsquo;s swing in x&sup2; and
                y&sup2;, so the rings stay nested and the direction that splits
                them sits further down the list. The method finds the largest
                spread, never the most useful one.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Ordinary PCA eigendecomposes the covariance matrix, which is
                X&prime;X over n &minus; 1 and has one row and one column per
                feature. In the space a kernel implies there might be thousands
                of features, or for the radial kernel infinitely many, so that
                matrix cannot be written down. The escape is that X&prime;X and
                XX&prime; share every non-zero eigenvalue, and their
                eigenvectors are one multiplication apart.
              </p>
              <Equation>{"if   X X′ u = λ u     then     X′X (X′u) = λ (X′u)"}</Equation>
              <p>
                XX&prime; is the Gram matrix, n by n, with the dot product of
                row i and row j in cell i, j. A dot product between two rows is
                exactly what a kernel answers, so the Gram matrix of the implied
                space is built from kernel values alone, one call per pair, and
                the implied space is never touched. One step remains before
                decomposing it. Variance is measured about the mean, and the
                implied points cannot be shifted because they cannot be seen,
                but the matrix can be centred on their behalf, where 1&#8345;
                is the n by n matrix filled with 1/n.
              </p>
              <Equation>{"K_c = K − 1ₙK − K1ₙ + 1ₙK1ₙ"}</Equation>
              <p>
                Eigendecompose K_c and each eigenvector u holds one number per
                training row, not one per feature. That is the whole difference
                in what a component is. The PCA page&rsquo;s components said
                this direction leans on height by 0.71, and this page&rsquo;s
                say this direction is built out of rows 1 and 2 and none of the
                others. The direction itself is the weighted sum of the implied
                training points, X&prime;u, whose length is &radic;&lambda;
                rather than one, so the coefficients that name a unit direction
                are u over &radic;&lambda;, and a point&rsquo;s coordinate
                along it is its centred kernel row against those coefficients.
              </p>
              <Equation>{"a = u / √λ\ncoordinate of x = Σᵢ aᵢ · K_c(x, xᵢ)"}</Equation>
              <p>
                The eigenvalue is used once more, at a different scale. The
                covariance in the implied space is X_c&prime;X_c over
                n &minus; 1, so the variance along the direction is &lambda;
                over n &minus; 1. The library reports that as the
                component&rsquo;s variance and divides by the square root of
                the raw &lambda; when it normalises, and the table above shows
                both scales side by side because confusing them is the mistake
                this method invites. Divide by the wrong one and every
                coordinate is off by a factor of &radic;(n &minus; 1), the fit
                still separates everything, and the shares never notice.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked five button, which also picks the linear
                kernel, since under it the implied space is the plane itself
                and every figure can be checked by hand. The five points have
                means of 10 and 100, and subtracting those leaves centred rows
                small enough to hold in your head.
              </p>
              <Equation>{"row 1  ( 2,  2)     row 2  (−2, −2)\nrow 3  ( 1, −1)     row 4  (−1,  1)     row 5  (0, 0)"}</Equation>
              <p>
                The linear kernel is the dot product, so the Gram matrix is
                every pair&rsquo;s dot product. Row 1 with itself is 4 + 4 = 8,
                row 1 with row 2 is &minus;8, and row 1 against rows 3, 4 and 5
                is zero every time, which is what the kernel row readout shows.
                Rows 3 and 4 give 2 and &minus;2 the same way, and row 5 gives
                nothing against anything. The data was centred by hand, so the
                centring identity leaves this table exactly as it is.
              </p>
              <Equation>{"K_c =   8  −8   0   0   0\n       −8   8   0   0   0\n        0   0   2  −2   0\n        0   0  −2   2   0\n        0   0   0   0   0"}</Equation>
              <p>
                Two blocks and a zero. The block of eights has eigenvalues 16
                and 0, the block of twos has 4 and 0, and the last row adds
                another 0, so the raw eigenvalues are 16, 4, 0, 0, 0, which is
                the table&rsquo;s first column. Now the two scales. Five rows
                make n &minus; 1 equal to 4, so the variances are 16 / 4 = 4 and
                4 / 4 = 1, exactly the 4 and 1 the PCA page&rsquo;s covariance
                route reports, out of a total of 5. The shares are 4 / 5 = 0.8
                and 1 / 5 = 0.2, and notice they would be 16 / 20 and 4 / 20 on
                the raw scale, the same numbers. A mistake at this step never
                shows in the shares, which is why the shares are not the place
                to look for it.
              </p>
              <Equation>{"u = (1, −1, 0, 0, 0) / √2        a = u / √16 = (0.1768, −0.1768, 0, 0, 0)\nrow 1 along the first  =  8 · 0.1768 + (−8) · (−0.1768)  =  2.8284"}</Equation>
              <p>
                The eigenvector for 16 is one on row 1, minus one on row 2,
                over &radic;2, and dividing by &radic;16 gives the coefficient
                readout&rsquo;s 0.1768. Row 1&rsquo;s coordinate is its kernel
                row against those coefficients, 2.8284, which is 2&radic;2, and
                is precisely where ordinary PCA puts the point (2, 2) along the
                diagonal (1, 1) over &radic;2. The second direction runs the
                same arithmetic on the block of twos, a coefficient of 0.3536
                on rows 3 and 4 and a coordinate of 1.4142 for row 3. Skip the
                division by &radic;16 and row 1&rsquo;s coordinate comes out
                four times too large, a fit that still separates everything and
                is wrong by a different factor on every component. The solver
                chooses the sign, so the readouts may show these numbers
                negated, and ticking the ordinary PCA box shows the same five
                positions up to that sign.
              </p>
            </>
          ),
        },
        {
          title: "No Way Back",
          content: (
            <>
              <p>
                The PCA page had a flatten toggle that rebuilt every person from
                their first coordinate alone, dropping them back onto the long
                diagonal. That is the inverse transform, coordinates times
                directions, and it lands among the original features because
                the directions are made of original features. The
                library&rsquo;s kernel PCA has no inverse transform at all, and
                the omission is a decision rather than a gap.
              </p>
              <p>
                A kernel coordinate is a position along a direction in the
                implied space. Going back means finding the point on the plane
                whose image sits at that position, which is called the
                pre-image, and for the radial kernel it usually does not exist.
                The implied space has infinitely many dimensions and the plane
                maps onto a thin curved sheet inside it, so a position rebuilt
                from two coordinates almost never lies on the sheet, and there
                is no point on the plane whose image it is. Sebastian Mika,
                Sch&ouml;lkopf, Smola, M&uuml;ller, Matthias Scholz and Gunnar
                R&auml;tsch worked the problem in 1998, wanting to de-noise
                pictures by projecting them onto a few kernel components and
                mapping back, and got an approximate answer for the Gaussian
                kernel, a fixed-point iteration that walks toward the nearest
                point on the sheet. Approximate is the best anyone has.
              </p>
              <p>
                The linear kernel is the one case where a way back exists,
                since its implied space is the plane, and the library still
                does not offer one. A method that answers exactly for one
                kernel and approximately or not at all for the rest is worse
                than one that refuses, and the exact case is the PCA page
                anyway. What the fit keeps instead is honest about what it is,
                one coefficient per training row, the rows a direction is built
                from, with no reading of it in the original features because
                there is none.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Three claims carried the mechanism, and each is a line or two.
                First, that XX&prime; and X&prime;X share their eigenvalues.
                Take an eigenpair of the Gram matrix and multiply both sides by
                X&prime;.
              </p>
              <Equation>{"X X′ u = λ u\nX′ (X X′ u) = X′ (λ u)\n(X′X) (X′u) = λ (X′u)"}</Equation>
              <p>
                So X&prime;u is an eigenvector of the covariance route&rsquo;s
                matrix with the same &lambda;, which is why the two pages report
                the same variances. Second, the length of that direction, which
                is where the normalisation comes from. Its squared length is a
                dot product with itself, and the Gram matrix reappears in the
                middle of it.
              </p>
              <Equation>{"‖X′u‖² = u′ (X X′) u = u′ (λ u) = λ ‖u‖² = λ"}</Equation>
              <p>
                A unit direction is therefore X&prime;u over &radic;&lambda;,
                and its coefficients on the rows are u over &radic;&lambda;,
                the raw eigenvalue and not the variance, because the length
                came from the Gram matrix and the Gram matrix is not divided by
                anything. Third, the centring identity. Write the implied mean
                as m, the average of the n implied points, and expand the dot
                product of two centred points.
              </p>
              <Equation>{"(φ(a) − m) · (φ(b) − m)\n  = K(a, b) − (1/n) Σₖ K(a, xₖ) − (1/n) Σₖ K(xₖ, b) + (1/n²) Σₖ Σₗ K(xₖ, xₗ)"}</Equation>
              <p>
                Each term is a kernel value or an average of them, so the whole
                expression is computable from the table K alone. Read across
                every pair at once and the four terms are the four matrices of
                the identity, K, 1&#8345;K, K1&#8345; and 1&#8345;K1&#8345;,
                the last one added back because the subtraction removed it
                twice. That single identity is what makes the method possible,
                since without it the first direction points at the implied mean
                rather than describing any spread, and unlike the PCA page
                there is no picture to notice it in.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
