import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { LogisticPlayground } from "@/components/widgets/LogisticPlayground";

export const metadata: Metadata = {
  title: "Logistic Regression · oop_ml",
  description:
    "Bend the line into a probability between zero and one, and read a yes-or-no decision off where it crosses one half.",
};

export default function LogisticRegressionPage() {
  return (
    <ConceptPage
      title="Logistic Regression"
      tagline="Bend the line into a probability, and read a yes or a no off where it crosses one half."
      prerequisites={
        <>
          This page assumes{" "}
          <Link
            href="/concepts/simple-linear-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            simple linear regression
          </Link>{" "}
          and leans on the{" "}
          <Link
            href="/primers/calculus"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            calculus primer
          </Link>
          &rsquo;s idea of following a slope, though here the walk climbs.
        </>
      }
      history={
        <>
          <p>
            Every model so far predicts a number, and plenty of questions do
            not want one. Did the patient recover. Did the loan default. Did
            the student pass. The outcome is one of two categories, and a
            straight line pointed at a category misbehaves, since it happily
            predicts one and a half, or minus two, answers that mean nothing
            about a yes-or-no world. What a category question wants is a
            probability, a number pinned between zero and one that can be read
            as a chance.
          </p>
          <p>
            The curve that does the pinning is older than the problem. Pierre
            Verhulst wrote it down in 1838 to model populations, growth that
            starts slowly, accelerates, and levels off as it approaches a
            ceiling, and he named it the logistic curve. A century later
            statisticians dosing insects and testing drugs needed exactly that
            S shape for the chance of a response rising with dose, Joseph
            Berkson pushed hard for the logistic version of it in 1944, and
            the marriage of the regression line with the logistic squash has
            carried the name logistic regression ever since. It remains the
            default first model for yes-or-no questions across medicine,
            credit and everything between.
          </p>
        </>
      }
      playground={<LogisticPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Each dot in the box above is one student, placed by how many
                hours they studied. The ones who failed sit on the floor of the
                plot and the ones who passed sit on the ceiling, since the
                outcome is one or the other with nothing in between. Notice the
                middle of the picture. Below about three and a half hours
                everyone failed, above about five and a half everyone passed,
                and in between the two outcomes are mixed together. Someone who
                studied four and a half hours might go either way.
              </p>
              <p>
                That mixing is why the model answers with a curve rather than a
                verdict. The S-shaped curve is the fitted probability of
                passing at every number of hours, hugging the floor on the
                left, climbing through the mixed middle, and hugging the
                ceiling on the right. It never leaves the band between zero and
                one, so it can always be read as a chance.
              </p>
              <p>
                When a plain yes or no is needed, the dashed line supplies it.
                It marks where the curve crosses one half, and everything to
                its right is called a pass. Drag the students around and watch
                both the curve and the boundary follow, and drag the two
                classes fully apart to see the curve sharpen toward a step,
                which the last section explains.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The trick is to keep the straight line and repair its range.
                The line computes a score from the input exactly as regression
                always has.
              </p>
              <Equation>{"z = βx + α"}</Equation>
              <p>
                The score z runs over the whole number line, which was the
                problem, so it is passed through a squashing function, the
                sigmoid, which maps any score into the band between zero and
                one.
              </p>
              <Equation>{"p = σ(z) = 1 / (1 + e⁻ᶻ)"}</Equation>
              <p>
                Three values make its behaviour concrete. A score of zero gives
                σ(0) = 0.5, sitting on the fence. A score of 2 gives about
                0.88, fairly confident of a yes, and a score of −2 gives about
                0.12, fairly confident of a no. Large positive scores approach
                1 and large negative ones approach 0, though neither end is
                ever reached, so the model never claims certainty.
              </p>
              <p>
                The boundary falls straight out of this. The curve crosses one
                half exactly where the score is zero, and setting βx + α to
                zero gives the crossing point.
              </p>
              <Equation>{"boundary  x = −α / β"}</Equation>
              <p>
                The slope β keeps a reading too. It sets how steep the climb
                is, how quickly an extra hour of study moves someone from
                probably failing to probably passing, and its sign says which
                direction the curve rises.
              </p>
            </>
          ),
        },
        {
          title: "Reading the Fit",
          content: (
            <>
              <p>
                The widget opens on twelve students, six fails and six passes
                with an overlap between four and five and a half hours, and the
                fitted numbers are worth reading closely. The slope comes out
                near 1.68 and the intercept near −7.14, so the boundary sits at
              </p>
              <Equation>{"x = 7.14 / 1.68 ≈ 4.24 hours"}</Equation>
              <p>
                which is where the dashed line stands. The curve is confident
                at the edges and honest in the middle. At two hours of study it
                gives about a 2% chance of passing, at six hours about 95%, and
                near the boundary it hovers around a half, which is the
                model&rsquo;s way of saying the mixed middle really is mixed.
              </p>
              <p>
                The accuracy readout shows 0.833, ten of the twelve called
                correctly, and the two misses are exactly the two students the
                overlap planted. The one who failed after five hours sits to
                the right of the boundary, so the model calls them a pass and
                is wrong, and the one who passed on four hours sits to its
                left. No boundary placed anywhere could get both of them right
                without losing others, and the fit has settled for the fewest
                misses it can arrange.
              </p>
            </>
          ),
        },
        {
          title: "Fitted by Climbing",
          content: (
            <>
              <p>
                One thing separates this fit from every regression before it.
                There is no formula for the best β and α, no closed form at
                the end of a derivation, and that is a fact about the
                mathematics rather than a gap in it. What the fit maximises is
                the likelihood, the probability the fitted curve assigns to
                the outcomes that actually happened, high p for the students
                who passed and low p for the ones who failed, and setting its
                derivatives to zero produces equations with no algebraic
                solution.
              </p>
              <p>
                So the model walks, exactly as the calculus primer described,
                though uphill rather than down, since a likelihood is climbed.
                Read the slope of the likelihood, step the coefficients along
                it, repeat until the steps stop mattering. The resting place
                obeys a condition worth writing down for how familiar it
                looks.
              </p>
              <Equation>{"Σ (yᵢ − pᵢ) = 0     and     Σ (yᵢ − pᵢ)·xᵢ = 0"}</Equation>
              <p>
                The best line balanced its residuals to zero, and the best
                curve balances the gaps between outcomes and probabilities the
                same way. One machinery, one balance, a squash between them.
              </p>
              <p>
                The climb also explains something you can trigger in the
                widget. Drag the classes fully apart, every fail left of every
                pass, and the slope readout starts growing without settling.
                With no mixed middle to be honest about, every steepening of
                the curve makes the observed outcomes more likely, so the
                climb never finds a top and the curve sharpens toward a step
                until the walk runs out of steps. Overlap is not a nuisance to
                logistic regression, it is what holds the answer finite.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
