import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { KernelLiftPlayground } from "@/components/widgets/KernelLiftPlayground";
import { KernelPlayground } from "@/components/widgets/KernelPlayground";
import { KernelSimilarityChart } from "@/components/widgets/KernelSimilarityChart";

export const metadata: Metadata = {
  title: "The Kernel Trick · oop_ml",
  description:
    "Swap the dot product for a function that computes it in a much larger space, and a straight-line method draws curved boundaries without ever building that space.",
};

export default function KernelTrickPage() {
  return (
    <ConceptPage
      title="The Kernel Trick"
      tagline="Draw a straight boundary in a space you never build, and watch it curve in the one you can see."
      prerequisites={
        <>
          The{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s dot product carries this whole page, and{" "}
          <Link
            href="/concepts/multiple-polynomial-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            multiple and polynomial regression
          </Link>
          &rsquo;s manufactured features are the thing it makes unnecessary.
        </>
      }
      history={
        <>
          <p>
            The polynomial page taught one way to make a straight method bend,
            manufacture the curved columns yourself, t² and t³ built by hand
            and fed in as ordinary features. That works, though it scales
            terribly. With two features the squared terms number three, with a
            hundred features they number in the thousands, and with the higher
            powers and cross terms a realistic mapping soon has more columns
            than any computer wants to build, most of them destined for
            coefficients near zero anyway.
          </p>
          <p>
            The escape was noticed twice. Mark Aizerman, Emmanuil Braverman
            and Lev Rozonoer saw in 1964 that certain learning procedures
            touch their data only through inner products, so the mapping never
            has to be built if the products can be computed some other way,
            and the observation sat quietly for decades. In 1992 Bernhard
            Boser, Isabelle Guyon and Vladimir Vapnik joined it to the
            maximum-margin classifier at AT&amp;T Bell Labs, and the
            combination, the support vector machine, spent the following
            fifteen years as the strongest general-purpose classifier anyone
            had. The trick itself outgrew the machine, and this page closes
            the site&rsquo;s core set with it.
          </p>
        </>
      }
      playground={<KernelPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The patients above are placed by temperature and heart rate,
                and the healthy ones sit where healthy vitals sit, in a band
                of ordinary readings. The unwell surround them on every side,
                feverish and racing in one corner, hypothermic and slow in
                another, and that geometry is the problem. Whatever direction
                a straight boundary runs, unwell patients stand on both sides
                of it. Press the linear button and watch the classifier do
                its best, a straight cut that surrenders a whole flank and
                stalls near 0.7.
              </p>
              <p>
                Now press the squared or the radial button. Same machinery,
                same patients, and the boundary closes around the healthy
                band like a fence, with the accuracy readout at 1.000. The
                buttons did not change the classifier. They changed what it
                means for two patients to count as similar, and the rest of
                the page is about why that one change is enough.
              </p>
              <p>
                The ideal case button loads a clinic a straight line
                handles fine, worth pressing to keep the trick honest. Where
                the data separates cleanly, all three readings agree, and the
                kernel buys nothing.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Two facts combine here, and the first is about the machine
                under this page. It is a classifier that draws the straight
                boundary with the widest corridor of empty space between the
                two classes, and the detail that matters is structural.
                Worked through, its entire calculation, fitting and
                predicting alike, touches the patients only through dot
                products between pairs of them. Never a lone coordinate, only
                a &middot; b, the linear algebra primer&rsquo;s measure of
                how much two vectors run together.
              </p>
              <p>
                The second fact is the trick. Suppose we intended to do the
                polynomial page&rsquo;s manufacturing, mapping each patient x
                through some φ into a bigger space of squared and crossed
                columns, and then run the classifier up there. Every
                appearance of a dot product would become φ(a) &middot; φ(b).
                If a function k can hand us that number straight from the
                original a and b, we can feed k&rsquo;s answers to the
                machinery and never build φ at all.
              </p>
              <Equation>{"k(a, b) = φ(a) · φ(b)"}</Equation>
              <p>
                Such a function is called a kernel, and running the classifier
                on kernel values is running it in the mapped space, exactly,
                with no approximation. The boundary it draws up there is
                straight. What we see down in the two measured dimensions is
                that straight cut&rsquo;s shadow, and shadows of straight
                things curve, which is the closed fence around the healthy
                band. One practical note rides along, the same one every
                distance-flavoured page has carried. A kernel inherits the
                units of its data, so the widget standardizes the two vitals
                first, exactly as the k-nearest neighbours page&rsquo;s
                scaling trap demanded.
              </p>
              <p>
                What the swap really changes is what near means, and that is
                drawable. Below, one point sweeps along a line while a
                reference stands still, and each kernel reports how alike
                the pair is. The dot product grows without bound and never
                forgets anyone, the squared kernel doubles down on that, and
                the radial curves are bumps, high beside the reference and
                vanishing away from it, with gamma setting how fast the
                forgetting happens. That vanishing is why a radial
                machine&rsquo;s answer is decided by the neighbourhood, the
                k-nearest page&rsquo;s instinct reborn as a similarity.
              </p>
              <KernelSimilarityChart />
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                The claim that a kernel equals a dot product in a bigger space
                sounds like it should be hard to check, and for the squared
                kernel it takes pencil arithmetic. Take two small vectors and
                compute the kernel&rsquo;s way first, the ordinary dot product,
                squared.
              </p>
              <Equation>{"a = (1, 2)     b = (3, 4)\na · b = 1·3 + 2·4 = 11\nk(a, b) = (a · b)² = 121"}</Equation>
              <p>
                Now the long way. The squared kernel&rsquo;s implied mapping
                sends each vector to its squared and crossed terms, with a √2
                on the cross term to make the bookkeeping come out.
              </p>
              <Equation>{"φ(x) = (x₁²,  √2·x₁x₂,  x₂²)\nφ(a) = (1,  2√2,  4)\nφ(b) = (9,  12√2,  16)"}</Equation>
              <p>
                Dot the two mapped vectors in their three-dimensional space,
                the middle term giving 2√2 times 12√2, which is 48.
              </p>
              <Equation>{"φ(a) · φ(b) = 9 + 48 + 64 = 121"}</Equation>
              <p>
                Both routes give 121. The kernel computed in one line what the
                mapping needed three dimensions to say, and the saving only
                grows. With a hundred features the squared mapping has over
                five thousand columns, while the kernel still computes one dot
                product and squares it. The widget&rsquo;s squared kernel adds
                a constant before squaring, which lets the lower-order terms
                ride along, though the identity is cleanest for the pure
                square worked here. The radial kernel goes further still. Its
                implied space has infinitely many dimensions, no φ could ever
                be written out, and the kernel visits it by shortcut anyway,
                which is why its fences can take almost any shape.
              </p>
            </>
          ),
        },
        {
          title: "Seeing the Lift",
          content: (
            <>
              <p>
                The mapped space is usually somewhere we cannot look, though
                for the worked φ on two measurements it is only
                three-dimensional, and that is a room we can stand in. Below,
                every patient from the clinic has been carried through the
                worked mapping, their standardized vitals squared and crossed
                into the three coordinates the axes name, and the picture at
                the top of the page comes apart. Down in two dimensions the
                unwell surrounded the healthy. Up here they do not, since the
                squares fold both directions of every extreme, hypothermic
                and feverish alike, toward the same large-u, large-w corner,
                and the healthy band gathers near the origin below them.
              </p>
              <KernelLiftPlayground />
              <p>
                The green wireframe is the point of the picture. It is a flat
                plane, found by an ordinary linear fit run on the three
                lifted columns, and it slides cleanly between the classes at
                an accuracy of 1.000. Drag the room around until the plane is
                edge-on and the separation is plain to the eye. This plane is
                what the squared kernel&rsquo;s widget was drawing all along.
                Its closed fence in two dimensions is exactly this flat
                cut&rsquo;s shadow, and the trick&rsquo;s whole claim, a
                straight boundary in a space never built, is here just once,
                small enough to build after all, and look at directly.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The worked example checked the identity on one pair of
                points, and it holds in symbols by nothing more than
                expanding a square. Take the squared kernel and multiply it
                out.
              </p>
              <Equation>{"(a · b)² = (a₁b₁ + a₂b₂)²\n        = a₁²·b₁² + 2·a₁a₂·b₁b₂ + a₂²·b₂²"}</Equation>
              <p>
                Now read the right side as a dot product by splitting each
                term between an a-part and a b-part. The outer terms split
                cleanly, and the middle term&rsquo;s 2 is shared out as √2
                times √2, one factor to each side, which is the whole reason
                the mapping carries that √2.
              </p>
              <Equation>{"= (a₁², √2·a₁a₂, a₂²) · (b₁², √2·b₁b₂, b₂²)\n= φ(a) · φ(b)"}</Equation>
              <p>
                That is the identity in general, not just at 121, and the
                same expansion runs for any number of features and any
                power, only with more terms to share out. The radial kernel
                earns its infinite space the same way, since the exponential
                can be written as an endless series of such powers, every
                term a polynomial kernel with its own implied columns,
                stacked without end. No φ could be written out, and none is
                needed, which is the trick keeping its own promise.
              </p>
            </>
          ),
        },
        {
          title: "The Same Swap Everywhere",
          content: (
            <>
              <p>
                Nothing in the trick cared that the machine was a classifier.
                It asked only that the data appear through dot products, and
                several methods on this site can be rearranged to qualify.
                Ridge regression rearranged that way and kernelised is kernel
                ridge, the penalty page&rsquo;s machinery drawing curves
                without one manufactured column, and principal component
                analysis kernelised finds directions in the mapped space,
                letting it describe clouds that bend. One swap, a family of
                methods.
              </p>
              <p>
                The costs deserve their sentence each. A kernelised model
                lives in a space no one can visit, so there is nothing like
                the tree page&rsquo;s printed questions to read, and its
                reasoning is carried by the training points themselves, which
                all must be kept. And the kernel is a modelling choice, as
                the widget shows when the radial fence hugs tighter than the
                squared one, judged honestly the way every such choice on
                this site is judged, on <Link href="/concepts/held-out-evaluation" className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400">data the fit never saw</Link>.
              </p>
              <p>
                This page closes the core set, and it is worth noticing what
                it was built from. The dot product came from the linear
                algebra primer, the manufactured columns it replaces from the
                polynomial page, the scaling discipline from the neighbours
                page, and the machine underneath fits by climbing, the
                calculus primer&rsquo;s walk. The site began by fitting a
                straight line through height and weight, and it ends with
                straight boundaries drawn in spaces too large to build,
                carried the whole way by the same handful of ideas.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
