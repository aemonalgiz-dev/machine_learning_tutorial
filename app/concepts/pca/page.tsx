import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { PcaPlayground } from "@/components/widgets/PcaPlayground";

export const metadata: Metadata = {
  title: "Principal Component Analysis · oop_ml",
  description:
    "Find the few directions a cloud of data actually varies along, and describe each point by where it sits along them.",
};

export default function PcaPage() {
  return (
    <ConceptPage
      title="Principal Component Analysis"
      tagline="Find the directions the data actually varies along, and keep only the ones that matter."
      prerequisites={
        <>
          This page is where two primers cash their promises, the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          &rsquo;s variance and covariance, and the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s directions a matrix only stretches. Both are load-bearing
          here.
        </>
      }
      history={
        <>
          <p>
            Height and weight carry a lot of the same information. Tell me one
            and I can guess the other tolerably well, which the statistics
            primer measured as their correlation, and the pattern only deepens
            with more measurements. Arm span, shoe size, sitting height, all
            of them largely restatements of how big a person is. Karl Pearson
            asked in 1901 what the honest number of underlying directions in
            such data really is, and how to find the line or plane of closest
            fit to a cloud of points, and Harold Hotelling rebuilt the method
            in 1933 and gave its answers their name, the principal components.
            The technique has been the standard first move on
            high-dimensional data ever since, compressing hundreds of
            correlated measurements down to the handful of directions that
            genuinely vary.
          </p>
        </>
      }
      playground={<PcaPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Press the crowd button above and squint at the shape of the
                cloud. It is not round. It is long in one direction, running
                from short-and-light up to tall-and-heavy, and thin in the
                perpendicular direction, which carries only whether someone
                is heavy or light for their height. Neither of those
                directions is height, and neither is weight. The cloud&rsquo;s
                real axes sit diagonally to the ones we measured.
              </p>
              <p>
                That is the entire idea. The indigo line is the first
                principal component, the direction of greatest spread, close
                to an overall body-size axis, and the amber line is the
                second, perpendicular to it, carrying what little the first
                leaves over. The readouts say how the spread divides between
                them. When one direction carries most of it, most of each
                person&rsquo;s two numbers was really one number, their
                position along the indigo line, and that is what the flatten
                toggle shows.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The recipe reads straight out of the two primers. Centre the
                cloud by subtracting the mean point, so it sits around the
                origin. Build the covariance matrix, the statistics
                primer&rsquo;s quantities arranged in a grid, each
                feature&rsquo;s variance on the diagonal and each pair&rsquo;s
                covariance off it. Then ask the linear algebra primer&rsquo;s
                question of that matrix, which directions does it only
                stretch.
              </p>
              <Equation>{"covariance matrix  =  [ var(height)        cov(height, weight) ]\n                      [ cov(height, weight)  var(weight)       ]"}</Equation>
              <p>
                The kept directions of that matrix are the principal
                components, and each one&rsquo;s stretch factor, its
                eigenvalue, is exactly the variance of the data along that
                direction. Sort the directions by their factors and you have
                the cloud&rsquo;s axes in order of importance, and dividing
                each factor by their total gives the shares the widget
                reports. The shares survive any choice of divisor in the
                variance, the n against n minus 1 wrinkle the statistics
                primer flagged, since a common factor cancels in a ratio.
              </p>
              <p>
                Why the eigen machinery is the right tool is worth one
                sentence rather than a formula. Variance along a direction is
                a quantity the covariance matrix computes, and the directions
                that maximise it while staying perpendicular to each other
                turn out to be precisely the matrix&rsquo;s own kept
                directions, which is the payoff the linear algebra primer
                promised when it first drew them.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, four people placed so every
                number comes out clean. Their mean is (170, 68), and their
                deviations from it are (10, 10), (−10, −10), (5, −5) and
                (−5, 5). Build the sums the covariance matrix needs, exactly
                as the statistics primer did.
              </p>
              <Equation>{"squares of height deviations   100 + 100 + 25 + 25 = 250\nsquares of weight deviations   100 + 100 + 25 + 25 = 250\nproducts                       100 + 100 − 25 − 25 = 150"}</Equation>
              <p>
                Any common divisor cancels in directions and shares, so work
                with the sums themselves and the matrix is [[250, 150],
                [150, 250]], the linear algebra primer&rsquo;s worked family
                with larger numbers. Check its kept directions the way that
                primer taught, by feeding candidates through.
              </p>
              <Equation>{"(1, 1)   →  (250 + 150,  150 + 250)  =  (400, 400)  =  400 · (1, 1)\n(1, −1)  →  (250 − 150,  150 − 250)  =  (100, −100) =  100 · (1, −1)"}</Equation>
              <p>
                Both candidates come back unturned, so the components run
                along (1, 1) and (1, −1) with factors 400 and 100, and the
                shares follow in one line each.
              </p>
              <Equation>{"share of component 1  =  400 / 500  =  0.8\nshare of component 2  =  100 / 500  =  0.2"}</Equation>
              <p>
                The readouts above show 0.800 and 0.200, with the first
                direction reported as (0.71, 0.71), our (1, 1) scaled to unit
                length exactly as the linear algebra primer&rsquo;s widget
                reported its own. Eighty percent of how these four people
                differ is one diagonal fact, bigger or smaller overall.
              </p>
            </>
          ),
        },
        {
          title: "Keeping One Number Per Person",
          content: (
            <>
              <p>
                Now cash the shares in. Tick the flatten toggle and every
                person acquires a green shadow, the point they become when
                described only by their position along the first component,
                with a dashed stub showing what the flattening threw away.
                The stubs are short because the second direction carried
                little, and the green cloud preserves the arrangement that
                mattered, who is generally bigger than whom, using one
                number per person where two were collected. That is
                dimensionality reduction, and on real data with hundreds of
                correlated columns it is the difference between unworkable
                and workable.
              </p>
              <p>
                Two honest notes to close. The indigo line looks like
                regression and is not. Regression minimised vertical misses,
                treating weight as the thing predicted, while this line
                minimises the perpendicular stubs, treating the two features
                as equals, and on the same data the two lines genuinely
                differ. And the components are directions, not features. The
                first component here resembles body size, though nothing
                named it that, and reading meaning into a component is the
                analyst&rsquo;s job, done carefully or not at all.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
